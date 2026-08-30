const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function requestJson(baseUrl, method, route, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = http.request(`${baseUrl}${route}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        let json = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch (error) {
          reject(new Error(`Resposta invalida em ${route}: ${raw}`));
          return;
        }
        if (res.statusCode >= 400) {
          const error = new Error(json.error || `HTTP ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.body = json;
          reject(error);
          return;
        }
        resolve(json);
      });
    });
    req.once("error", reject);
    req.write(payload);
    req.end();
  });
}

function waitForServer(child, baseUrl) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Servidor temporario nao iniciou a tempo.")), 12000);
    child.once("exit", (code) => reject(new Error(`Servidor encerrou antes do teste. Codigo ${code}`)));
    const tick = () => {
      http.get(`${baseUrl}/api/health`, (res) => {
        res.resume();
        clearTimeout(timeout);
        resolve();
      }).on("error", () => setTimeout(tick, 200));
    };
    tick();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tortela-kiosk-flow-"));
  const baseUrl = `http://localhost:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      PEGMA_DB_DIR: dataDir
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(child, baseUrl);

    const catalog = await requestJson(baseUrl, "GET", "/api/public/store/catalog?unidade=cliente-exemplo");
    const product = catalog.products.find((item) => item.active !== false && Number(item.price || 0) > 0 && Number(item.stock || 0) > 0);
    assert(product, "Catalogo do totem nao possui produto ativo com preco e estoque.");

    let invalidCpfBlocked = false;
    try {
      await requestJson(baseUrl, "POST", "/api/public/kiosk/orders", {
        tenantCode: "cliente-exemplo",
        customerDocument: "11111111111",
        orderMode: "Retirada no balcao",
        paymentMethod: "PIX",
        items: [{ productId: product.id, qty: 1 }]
      });
    } catch (error) {
      invalidCpfBlocked = error.statusCode === 400;
    }
    assert(invalidCpfBlocked, "CPF invalido foi aceito pelo totem.");

    const order = await requestJson(baseUrl, "POST", "/api/public/kiosk/orders", {
      tenantCode: "cliente-exemplo",
      customerDocument: "52998224725",
      orderMode: "Retirada no balcao",
      paymentMethod: "PIX",
      items: [{ productId: product.id, qty: 1 }]
    });
    assert(order.ok && order.orderId && order.ticketNumber, "Pedido do totem nao retornou senha e id.");

    const board = await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo");
    const boardOrder = board.orders.find((item) => Number(item.id) === Number(order.orderId));
    assert(boardOrder && boardOrder.status === "Preparando", "Pedido nao apareceu na cozinha/telao como Preparando.");

    await requestJson(baseUrl, "POST", "/api/public/kiosk/orders/status", {
      tenantCode: "cliente-exemplo",
      orderId: order.orderId,
      status: "Pronto"
    });
    const updatedBoard = await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo");
    const updatedOrder = updatedBoard.orders.find((item) => Number(item.id) === Number(order.orderId));
    assert(updatedOrder && updatedOrder.status === "Pronto", "Cozinha nao atualizou o pedido para Pronto.");

    const tenantState = JSON.parse(fs.readFileSync(path.join(dataDir, "tenants", "cliente-exemplo.json"), "utf8"));
    const sale = tenantState.sales.find((item) => Number(item.id) === Number(order.orderId));
    assert(sale && sale.deliveryStore?.tenantCode === "cliente-exemplo", "Venda nao ficou vinculada a unidade correta.");
    assert((tenantState.stockMovements || []).some((item) => item.history === `Pedido online ${order.orderId}`), "Pedido nao gerou movimento de baixa no estoque.");
    assert((tenantState.fiscalQueue || []).some((item) => Number(item.saleId) === Number(order.orderId) && item.model === "NFC-e"), "Pedido nao entrou na fila fiscal NFC-e.");

    let otherTenantBlocked = false;
    try {
      await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=outra-unidade");
    } catch (error) {
      otherTenantBlocked = error.statusCode === 404;
    }
    assert(otherTenantBlocked, "Unidade inexistente conseguiu consultar fila do totem.");

    console.log("OK - fluxo totem/cozinha/telao validado com CPF, estoque, fila fiscal e isolamento.");
  } finally {
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

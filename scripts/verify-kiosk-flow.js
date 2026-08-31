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

function requestJson(baseUrl, method, route, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = http.request(`${baseUrl}${route}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...extraHeaders
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
  const providerToken = "verify-provider-token";
  const child = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      PEGMA_DB_DIR: dataDir,
      PEGMA_PROVIDER_TOKEN: providerToken
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(child, baseUrl);

    await requestJson(baseUrl, "POST", "/api/tenants", {
      tradeName: "Unidade Isolada",
      tenantCode: "unidade-isolada",
      document: "11.111.111/0001-11",
      plan: "Essencial",
      maxTerminals: 1,
      renewalDays: 365,
      adminName: "Administrador",
      adminUser: "admin@unidade-isolada.local",
      adminPassword: "SenhaTeste123"
    }, { Authorization: `Bearer ${providerToken}` });

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

    const isolatedBoard = await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=unidade-isolada");
    assert(Array.isArray(isolatedBoard.orders) && isolatedBoard.orders.length === 0, "Pedido de uma unidade apareceu na fila de outra unidade ativa.");

    await requestJson(baseUrl, "POST", "/api/public/kiosk/orders/status", {
      tenantCode: "cliente-exemplo",
      orderId: order.orderId,
      status: "Pronto"
    });
    const updatedBoard = await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo");
    const updatedOrder = updatedBoard.orders.find((item) => Number(item.id) === Number(order.orderId));
    assert(updatedOrder && updatedOrder.status === "Pronto", "Cozinha nao atualizou o pedido para Pronto.");

    await requestJson(baseUrl, "POST", "/api/public/kiosk/orders/status", {
      tenantCode: "cliente-exemplo",
      orderId: order.orderId,
      status: "Entregue"
    });

    const cancelOrder = await requestJson(baseUrl, "POST", "/api/public/kiosk/orders", {
      tenantCode: "cliente-exemplo",
      customerDocument: "52998224725",
      orderMode: "Retirada no balcao",
      paymentMethod: "PIX",
      items: [{ productId: product.id, qty: 1 }]
    });
    await requestJson(baseUrl, "POST", "/api/public/kiosk/orders/status", {
      tenantCode: "cliente-exemplo",
      orderId: cancelOrder.orderId,
      status: "Cancelado"
    });

    const tenantState = JSON.parse(fs.readFileSync(path.join(dataDir, "tenants", "cliente-exemplo.json"), "utf8"));
    const isolatedTenantState = JSON.parse(fs.readFileSync(path.join(dataDir, "tenants", "unidade-isolada.json"), "utf8"));
    const sale = tenantState.sales.find((item) => Number(item.id) === Number(order.orderId));
    const cancelledSale = tenantState.sales.find((item) => Number(item.id) === Number(cancelOrder.orderId));
    assert(sale && sale.deliveryStore?.tenantCode === "cliente-exemplo", "Venda nao ficou vinculada a unidade correta.");
    assert(sale.status === "Entregue" && sale.deliveredAt, "Pedido entregue nao registrou data de entrega.");
    assert((tenantState.stockMovements || []).some((item) => item.history === `Pedido online ${order.orderId}`), "Pedido nao gerou movimento de baixa no estoque.");
    assert((tenantState.fiscalQueue || []).some((item) => Number(item.saleId) === Number(order.orderId) && item.model === "NFC-e"), "Pedido nao entrou na fila fiscal NFC-e.");
    assert(cancelledSale && cancelledSale.status === "Cancelado" && cancelledSale.cancelledAt, "Pedido cancelado nao registrou cancelamento.");
    assert((tenantState.stockMovements || []).some((item) => item.history === `Cancelamento pedido online ${cancelOrder.orderId}` && Number(item.qty || 0) > 0), "Cancelamento do totem nao gerou estorno de estoque.");
    assert((tenantState.receivables || []).some((item) => Number(item.sourceSaleId) === Number(cancelOrder.orderId) && item.cancelled && item.paid), "Cancelamento do totem nao baixou o recebivel aberto.");
    assert((tenantState.fiscalQueue || []).some((item) => Number(item.saleId) === Number(cancelOrder.orderId) && String(item.status || "").startsWith("Cancelada")), "Cancelamento do totem nao cancelou a fila fiscal pendente.");
    assert((isolatedTenantState.sales || []).length === 0, "Venda de uma unidade foi gravada no arquivo de outra unidade.");
    assert((isolatedTenantState.stockMovements || []).every((item) => item.history !== `Pedido online ${order.orderId}`), "Baixa de estoque de uma unidade apareceu em outra unidade.");
    assert((isolatedTenantState.fiscalQueue || []).every((item) => Number(item.saleId) !== Number(order.orderId)), "Fila fiscal de uma unidade apareceu em outra unidade.");

    let otherTenantBlocked = false;
    try {
      await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=outra-unidade");
    } catch (error) {
      otherTenantBlocked = error.statusCode === 404;
    }
    assert(otherTenantBlocked, "Unidade inexistente conseguiu consultar fila do totem.");

    console.log("OK - fluxo totem/cozinha/telao validado com CPF, entrega, cancelamento, estoque, fila fiscal e isolamento entre unidades ativas.");
  } finally {
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

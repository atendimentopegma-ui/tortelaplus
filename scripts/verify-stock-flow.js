const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function almostEqual(actual, expected, message) {
  if (Math.abs(Number(actual || 0) - Number(expected || 0)) > 0.00001) {
    throw new Error(`${message} Esperado ${expected}, obtido ${actual}.`);
  }
}

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

function tenantFile(dataDir) {
  return path.join(dataDir, "tenants", "cliente-exemplo.json");
}

function readTenant(dataDir) {
  return JSON.parse(fs.readFileSync(tenantFile(dataDir), "utf8"));
}

function writeTenant(dataDir, state) {
  fs.writeFileSync(tenantFile(dataDir), JSON.stringify(state, null, 2));
}

function product(state, id) {
  return (state.products || []).find((row) => Number(row.id) === Number(id));
}

(async () => {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tortela-stock-flow-"));
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
    const before = readTenant(dataDir);
    const flourBefore = Number(product(before, 9001).stock || 0);
    const oilBefore = Number(product(before, 9002).stock || 0);
    const tortelaChocolateBefore = Number(product(before, 7001).stock || 0);
    const tortelaMorangoBefore = Number(product(before, 7002).stock || 0);

    const order = await requestJson(baseUrl, "POST", "/api/public/kiosk/orders", {
      tenantCode: "cliente-exemplo",
      customerDocument: "52998224725",
      orderMode: "Retirada no balcao",
      paymentMethod: "PIX",
      items: [{ productId: 7003, qty: 1 }]
    });
    assert(order.ok && order.orderId, "Pedido de combo nao foi criado.");

    const afterSale = readTenant(dataDir);
    almostEqual(product(afterSale, 9001).stock, flourBefore - 0.48, "Combo nao baixou farinha ate a materia-prima final.");
    almostEqual(product(afterSale, 9002).stock, oilBefore - 0.08, "Combo nao baixou oleo ate a materia-prima final.");
    almostEqual(product(afterSale, 7001).stock, tortelaChocolateBefore, "Combo nao deve baixar produto intermediario quando ele tem ficha tecnica de venda.");
    almostEqual(product(afterSale, 7002).stock, tortelaMorangoBefore, "Combo nao deve baixar produto intermediario quando ele tem ficha tecnica de venda.");
    assert((afterSale.stockMovements || []).some((row) => row.productId === 9001 && row.history === `Pedido online ${order.orderId}` && Number(row.qty) < 0), "Baixa de farinha nao gerou movimento de estoque.");
    assert((afterSale.stockMovements || []).some((row) => row.productId === 9002 && row.history === `Pedido online ${order.orderId}` && Number(row.qty) < 0), "Baixa de oleo nao gerou movimento de estoque.");

    await requestJson(baseUrl, "POST", "/api/public/kiosk/orders/status", {
      tenantCode: "cliente-exemplo",
      orderId: order.orderId,
      status: "Cancelado"
    });
    const afterCancel = readTenant(dataDir);
    almostEqual(product(afterCancel, 9001).stock, flourBefore, "Cancelamento do combo nao estornou farinha.");
    almostEqual(product(afterCancel, 9002).stock, oilBefore, "Cancelamento do combo nao estornou oleo.");
    assert((afterCancel.stockMovements || []).some((row) => row.productId === 9001 && row.history === `Cancelamento pedido online ${order.orderId}` && Number(row.qty) > 0), "Estorno de farinha nao gerou movimento de estoque.");

    product(afterCancel, 9001).stock = 0.1;
    writeTenant(dataDir, afterCancel);
    let blocked = false;
    try {
      await requestJson(baseUrl, "POST", "/api/public/kiosk/orders", {
        tenantCode: "cliente-exemplo",
        customerDocument: "52998224725",
        orderMode: "Retirada no balcao",
        paymentMethod: "PIX",
        items: [{ productId: 7003, qty: 1 }]
      });
    } catch (error) {
      blocked = error.statusCode === 409 && /Estoque insuficiente/i.test(error.message);
    }
    assert(blocked, "Pedido de combo com materia-prima insuficiente nao foi bloqueado.");

    console.log("OK - estoque validado: combo baixa materia-prima em cadeia, estorna no cancelamento e bloqueia saldo insuficiente.");
  } finally {
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

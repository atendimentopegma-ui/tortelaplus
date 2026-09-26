const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const vm = require("vm");
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

function createElement(id = "") {
  return {
    id,
    value: "",
    checked: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    style: {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    focus() {}
  };
}

function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear()
  };
}

async function verifyLocalPdvFinance() {
  const source = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
  const elements = new Map([["app", createElement("app")]]);
  const context = {
    console,
    URLSearchParams,
    Date,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    Promise,
    Error,
    Map,
    Set,
    Intl,
    process: { env: { NODE_ENV: "test" } },
    window: {
      location: { hash: "", pathname: "/", search: "" },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {}
    },
    document: {
      body: { appendChild() {} },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, createElement(id));
        return elements.get(id);
      },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      addEventListener() {},
      removeEventListener() {},
      createElement
    },
    navigator: {
      onLine: false,
      serviceWorker: { getRegistrations: () => Promise.resolve([]), register: () => Promise.resolve({}) }
    },
    localStorage: storage(),
    sessionStorage: storage(),
    caches: { keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
    alert(message) {
      throw new Error(`Alerta inesperado: ${message}`);
    },
    confirm() { return true; },
    fetch: () => Promise.reject(new Error("offline")),
    setTimeout(fn) {
      if (typeof fn === "function") fn();
      return 1;
    },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    AbortController: class {
      constructor() { this.signal = {}; }
      abort() {}
    },
    Blob: class {},
    URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    FileReader: class {},
    structuredClone: (value) => JSON.parse(JSON.stringify(value)),
    btoa: (value) => Buffer.from(String(value), "binary").toString("base64"),
    atob: (value) => Buffer.from(String(value), "base64").toString("binary")
  };
  context.window.window = context.window;
  context.window.document = context.document;
  context.window.navigator = context.navigator;
  context.window.localStorage = context.localStorage;
  context.window.sessionStorage = context.sessionStorage;
  context.window.caches = context.caches;
  context.globalThis = context;

  vm.createContext(context);
  vm.runInContext(`${source}
globalThis.__financeTest = {
  state,
  setField: (id, value) => { document.getElementById(id).value = String(value); },
  setCashRegister: (register) => { state.cashRegister = { ...state.cashRegister, ...register }; },
  addSaleItem,
  finishSaleRecord,
  cancelClosedSale,
  financeBalance
};`, context, { filename: "src/app.js" });

  const test = context.__financeTest;
  const state = test.state;
  test.setCashRegister({
    open: true,
    openedAt: `${new Date().toISOString().slice(0, 10)}T11:00:00.000Z`,
    openedBy: "Operador",
    initialAmount: 100,
    terminal: "SERIE FIN"
  });

  test.setField("pdv-club-cpf", "52998224725");
  test.setField("sale-search", "7890000000011");
  test.setField("sale-qty", "2");
  test.setField("sale-price", "");
  test.setField("sale-customer", "Cliente Financeiro");
  test.setField("pdv-operation", "Balcao");
  test.setField("pdv-table", "");
  test.setField("pdv-delivery-driver", "");
  test.setField("pdv-delivery-phone", "");
  test.setField("pdv-delivery-address", "");
  test.setField("pdv-discount", "0");
  test.setField("pdv-addition", "0");
  test.setField("pay-money", "1");
  test.setField("pay-pix", "0");
  test.setField("pay-debit", "0");
  test.setField("pay-credit", "0");
  test.setField("pay-store-credit", "10");

  await test.addSaleItem();
  await test.finishSaleRecord();

  const sale = state.sales.at(-1);
  assert(sale && sale.type === "PDV", "Venda PDV financeira nao foi gravada.");
  almostEqual(sale.total, 1.7, "Total PDV financeiro incorreto.");
  almostEqual(sale.payments.find((row) => row.method === "Crediario")?.value, 0.7, "Crediario nao foi limitado ao saldo real.");
  almostEqual(sale.payments.find((row) => row.method === "Dinheiro")?.value, 1, "Pagamento em dinheiro incorreto.");
  almostEqual(sale.change, 0, "Troco incorreto em venda com crediario parcial.");

  const receivable = state.receivables.find((row) => Number(row.sourceSaleId) === Number(sale.id));
  assert(receivable, "Crediario PDV nao gerou recebivel vinculado a venda.");
  almostEqual(receivable.value, 0.7, "Valor do recebivel de crediario incorreto.");
  almostEqual(test.financeBalance(receivable), 0.7, "Saldo do recebivel de crediario incorreto.");
  const cashEntry = state.cash.find((row) => row.history === `Venda PDV ${sale.id} - Dinheiro`);
  assert(cashEntry, "Venda com dinheiro nao gerou movimento de caixa.");
  almostEqual(cashEntry.in, 1, "Entrada de caixa da venda financeira incorreta.");
  almostEqual(cashEntry.out, 0, "Saida de caixa da venda financeira incorreta.");

  test.cancelClosedSale(sale.id);
  assert(receivable.cancelled && receivable.paid && receivable.balance === 0, "Cancelamento nao baixou o recebivel do crediario.");
  const refund = state.cash.find((row) => row.history === `Estorno venda ${sale.id}`);
  assert(refund, "Cancelamento nao gerou estorno de caixa.");
  almostEqual(refund.out, 1, "Estorno de caixa deveria considerar apenas valor recebido no caixa.");
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

async function verifyServerReceivables() {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tortela-finance-flow-"));
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
    const order = await requestJson(baseUrl, "POST", "/api/public/kiosk/orders", {
      tenantCode: "cliente-exemplo",
      customerDocument: "52998224725",
      orderMode: "Retirada no balcao",
      paymentMethod: "PIX",
      items: [{ productId: 7001, qty: 1 }]
    });
    const afterSale = readTenant(dataDir);
    const sale = afterSale.sales.find((row) => Number(row.id) === Number(order.orderId));
    const receivable = afterSale.receivables.find((row) => Number(row.sourceSaleId) === Number(order.orderId));
    assert(sale && receivable, "Pedido do totem nao gerou venda e recebivel vinculados.");
    almostEqual(receivable.value, sale.total, "Recebivel do totem nao nasceu com valor da venda.");
    almostEqual(receivable.balance, sale.total, "Recebivel do totem nao nasceu com saldo aberto correto.");
    assert(receivable.payment === "PIX", "Recebivel do totem nao guardou forma de pagamento.");

    await requestJson(baseUrl, "POST", "/api/public/kiosk/orders/status", {
      tenantCode: "cliente-exemplo",
      orderId: order.orderId,
      status: "Cancelado"
    });
    const afterCancel = readTenant(dataDir);
    const cancelledReceivable = afterCancel.receivables.find((row) => Number(row.sourceSaleId) === Number(order.orderId));
    assert(cancelledReceivable.cancelled && cancelledReceivable.paid && cancelledReceivable.balance === 0, "Cancelamento do totem nao zerou o recebivel.");
  } finally {
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

(async () => {
  await verifyLocalPdvFinance();
  await verifyServerReceivables();
  console.log("OK - financeiro validado: PDV crediario, caixa, recebiveis, saldo e cancelamento.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

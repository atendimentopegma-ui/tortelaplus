const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

const elements = new Map();
const appElement = createElement("app");
elements.set("app", appElement);

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

context.window.TortelaFiscalRegimes = require("../src/fiscal-regimes");
context.ItemPreparation=require('../src/item-preparation');
vm.createContext(context);
vm.runInContext(`${source}
state.products = ${JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, "scripts/fixtures/pdv-products.json"), "utf8")))};
globalThis.__pdvTest = {
  state,
  terminalId: pdvTerminalId,
  printLastPdvSale,
  printed: () => globalThis.__printedReceipt || "",
  setField: (id, value) => { document.getElementById(id).value = String(value); },
  setCashRegister: (register) => { state.cashRegister = { ...state.cashRegister, ...register }; },
  addSaleItem,
  finishSaleRecord,
  cancelClosedSale
};
downloadText = (name, text) => { globalThis.__printedReceipt = text; };`, context, { filename: "src/app.js" });

(async () => {
  const test = context.__pdvTest;
  const state = test.state;
  const product = state.products.find((row) => row.id === 5014);
  const flour = state.products.find((row) => row.id === 9001);
  const oil = state.products.find((row) => row.id === 9002);
  assert(product && flour && oil, "Produtos base do PDV nao encontrados.");

  test.setCashRegister({
    open: true,
    openedAt: new Date().toISOString(),
    openedBy: "Operador",
    initialAmount: 100,
    terminal: "SERIE TESTE"
  });

  const before = {
    sales: state.sales.length,
    fiscal: state.fiscalQueue.length,
    cash: state.cash.length,
    movements: state.stockMovements.length,
    flour: Number(flour.stock),
    oil: Number(oil.stock)
  };

  test.setField("pdv-club-cpf", "52998224725");
  test.setField("sale-search", "7890000000011");
  test.setField("sale-qty", "2");
  test.setField("sale-price", "");
  test.setField("sale-customer", "Cliente PDV Teste");
  test.setField("pdv-operation", "Balcao");
  test.setField("pdv-table", "");
  test.setField("pdv-delivery-driver", "");
  test.setField("pdv-delivery-phone", "");
  test.setField("pdv-delivery-address", "");
  test.setField("pdv-discount", "0");
  test.setField("pdv-addition", "0");
  test.setField("pay-money", "2");
  test.setField("pay-pix", "0");
  test.setField("pay-debit", "0");
  test.setField("pay-credit", "0");
  test.setField("pay-store-credit", "0");

  await test.addSaleItem();
  await test.finishSaleRecord();

  const sale = state.sales[state.sales.length - 1];
  assert(state.sales.length === before.sales + 1, "Venda PDV nao foi gravada.");
  assert(sale.type === "PDV" && sale.status === "Fechado", "Venda PDV nao fechou corretamente.");
  assert(sale.customerDocument === "52998224725", "CPF do Clube Tortela nao foi gravado na venda.");
  assert(sale.total === 1.7, "Total da venda PDV incorreto.");
  assert(Math.abs(sale.change - 0.3) < 0.001, "Troco do PDV incorreto.");
  assert(state.cash.length === before.cash + 1, "Venda PDV nao gerou movimento de caixa.");
  assert(state.cash.at(-1).history === `Venda PDV ${sale.id} - Dinheiro`, "Historico do caixa da venda incorreto.");
  assert(state.cash.at(-1).in === 2 && state.cash.at(-1).out === 0.3, "Entrada/saida de caixa da venda incorreta.");
  assert(Number(flour.stock.toFixed(2)) === Number((before.flour - 0.12).toFixed(2)), "Baixa de farinha da composicao incorreta.");
  assert(Number(oil.stock.toFixed(2)) === Number((before.oil - 0.02).toFixed(2)), "Baixa de oleo da composicao incorreta.");
  assert(state.stockMovements.length >= before.movements + 2, "Venda PDV nao gerou movimentos de estoque da composicao.");
  const fiscal = state.fiscalQueue.find((row) => row.saleId === sale.id && row.model === "NFC-e");
  assert(fiscal && fiscal.status === "Fila offline", "Venda PDV nao entrou na fila NFC-e offline.");

  test.cancelClosedSale(sale.id);
  assert(sale.status === "Cancelado" && sale.cancelledAt, "Cancelamento de venda PDV nao marcou a venda.");
  assert(Number(flour.stock.toFixed(2)) === before.flour, "Cancelamento PDV nao estornou farinha.");
  assert(Number(oil.stock.toFixed(2)) === before.oil, "Cancelamento PDV nao estornou oleo.");
  assert(state.cash.at(-1).history === `Estorno venda ${sale.id}` && state.cash.at(-1).out === 1.7, "Cancelamento PDV nao gerou estorno financeiro correto.");
  assert(fiscal.status === "Cancelada antes da transmissao", "Cancelamento PDV nao marcou fila fiscal pendente corretamente.");

  const terminalId = test.terminalId();
  assert(test.terminalId() === terminalId, "Identidade do terminal nao permaneceu estavel.");
  state.settings.pdvTerminals = [{ id: terminalId, name: "Caixa Recibo", emissionMode: "receipt" }, { id: "pdv-outro-caixa", name: "Outro caixa", emissionMode: "nfce" }];
  const beforeReceiptQueue = state.fiscalQueue.length;
  test.setField("pdv-club-cpf", "52998224725");
  test.setField("sale-search", "7890000000011");
  test.setField("sale-qty", "2");
  test.setField("pay-money", "2");
  await test.addSaleItem();
  await test.finishSaleRecord();
  const receiptSale = state.sales.at(-1);
  assert(receiptSale.emissionMode === "receipt" && receiptSale.terminalId === terminalId, "Venda nao respeitou o terminal de recibo.");
  assert(state.fiscalQueue.length === beforeReceiptQueue, "Recibo nao fiscal criou NFC-e indevidamente.");
  state.settings.pdvTerminals[0].emissionMode = "nfce";
  test.printLastPdvSale();
  assert(test.printed().includes("SIMPLES RECIBO - NAO E DOCUMENTO FISCAL"), "Reimpressao alterou o modo de uma venda anterior.");
  test.cancelClosedSale(receiptSale.id);
  assert(receiptSale.status === "Cancelado" && state.fiscalQueue.length === beforeReceiptQueue, "Cancelamento do recibo criou documento fiscal.");

  console.log("OK - fluxo PDV validado: venda, caixa, estoque composto, NFC-e pendente, recibo base e cancelamento com estorno.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

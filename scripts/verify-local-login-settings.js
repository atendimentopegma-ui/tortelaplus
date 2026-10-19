const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

function createElement(id = "") {
  return {
    id,
    value: id === "login-pass" ? "123456" : "",
    checked: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    style: {},
    listeners: {},
    addEventListener(name, handler) { this.listeners[name] = handler; },
    removeEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    focus() {}
  };
}

const elements = new Map();
const appElement = createElement("app");
elements.set("app", appElement);

function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear()
  };
}

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
  window: {
    location: {
      hash: "#module=settings&settings=geral",
      pathname: "/",
      search: ""
    },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {}
  },
  document: {
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
    serviceWorker: {
      getRegistrations: () => Promise.resolve([]),
      register: () => Promise.resolve({})
    }
  },
  localStorage: storage(),
  sessionStorage: storage(),
  caches: {
    keys: () => Promise.resolve([]),
    delete: () => Promise.resolve(true)
  },
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
    constructor() {
      this.signal = {};
    }
    abort() {}
  },
  Blob: class {},
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
vm.createContext(context);
vm.runInContext(source, context, { filename: "src/app.js" });

context.renderShell();

if (!appElement.innerHTML.includes("Configuracoes")) {
  throw new Error("Login local com rota de configuracoes nao abriu Configuracoes.");
}
if (!appElement.innerHTML.includes("settings-screen")) {
  throw new Error("Tela de configuracoes nao foi renderizada.");
}
if (appElement.innerHTML.includes("Entrar no sistema")) {
  throw new Error("Sistema continuou preso no login.");
}

context.navigateBackofficeModule("dashboard");
if (!appElement.innerHTML.includes("Painel da retaguarda")) {
  throw new Error("Navegacao direta nao abriu o Painel.");
}

context.navigateBackofficeModule("settings");
if (!appElement.innerHTML.includes("settings-screen") || !appElement.innerHTML.includes("Salvar configuracoes")) {
  throw new Error("Botao Configuracoes nao renderizou a tela de configuracoes.");
}

console.log("OK - login local e botao Configuracoes abrem a tela correta.");

// Exercise the real browser boot/login handlers, including the regression where
// a protected provider endpoint caused an unauthenticated local login online.
(async () => {
  await Promise.resolve();
  context.window.location.protocol = "https:";
  context.navigator.userAgent = "Tortela regression";
  const requests = [];
  context.fetch = async (route) => {
    requests.push(route);
    if (route === "/api/health") return { ok: true, json: async () => ({ ok: true, product: "Tortela Plus" }) };
    return { ok: false, status: 403, json: async () => ({ error: "Credenciais invalidas" }) };
  };
  context.alert = () => {};
  await context.boot();
  for (const id of ["login-user", "login-tenant", "login-pass"]) context.document.getElementById(id);
  if (!vm.runInContext("apiOnline", context)) throw new Error("Servidor publico saudavel nao habilitou autenticacao.");
  if (requests.includes("/api/provider")) throw new Error("Boot da unidade exige acesso administrativo antes do login.");
  elements.get("login-user").value = "Operador";
  elements.get("login-tenant").value = "tortela-plus";
  elements.get("login-pass").value = "senha-incorreta";
  await elements.get("login-form").listeners.submit({ preventDefault() {} });
  if (!requests.includes("/api/auth/login")) throw new Error("Login publicado nao autenticou no servidor.");
  if (!appElement.innerHTML.includes("Entrar no sistema")) throw new Error("Credenciais rejeitadas abriram a retaguarda.");
  context.fetch = async () => { throw new Error("Servidor indisponivel"); };
  await elements.get("login-form").listeners.submit({ preventDefault() {} });
  if (!appElement.innerHTML.includes("Entrar no sistema")) throw new Error("Servidor indisponivel permitiu login local publicado.");
  if (!elements.get("login-feedback").textContent.includes("Nao foi possivel autenticar")) throw new Error("Falha do servidor nao foi informada.");
  console.log("OK - boot publico, senha invalida e servidor indisponivel sem acesso local indevido.");
})().catch((error) => { console.error(error.message); process.exitCode = 1; });

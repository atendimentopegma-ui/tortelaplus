const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includesAll(label, source, values) {
  values.forEach((value) => {
    assert(source.includes(value), `${label}: faltando ${value}`);
  });
}

function extractFunction(name) {
  const start = app.indexOf(`function ${name}(`);
  assert(start >= 0, `Funcao ${name} nao encontrada.`);
  let depth = 0;
  let entered = false;
  for (let index = start; index < app.length; index += 1) {
    const char = app[index];
    if (char === "{") {
      depth += 1;
      entered = true;
    }
    if (char === "}") {
      depth -= 1;
      if (entered && depth === 0) return app.slice(start, index + 1);
    }
  }
  throw new Error(`Funcao ${name} sem fechamento.`);
}

const delegatedClickHandler = app.slice(app.lastIndexOf('document.addEventListener("click"'));
includesAll("Handler global de navegacao", delegatedClickHandler, [
  "[data-module]",
  "[data-fiscal-tab]",
  "[data-stock-tab]",
  "[data-person-filter]",
  "[data-product-tab]",
  "[data-settings-tab]",
  "[data-tab]",
  "renderShell()"
]);
const hashChangeHandler = app.slice(app.lastIndexOf('window.addEventListener("hashchange"'), app.indexOf('document.addEventListener("click"'));
includesAll("Hash de navegacao", hashChangeHandler, [
  '.querySelector(".app-shell")',
  "renderShell()"
]);
assert(!hashChangeHandler.includes("if (sessionId)"), "Hash de navegacao: nao pode depender de sessao online para atualizar modulo.");

const routeHandler = extractFunction("applyInternalRoute");
includesAll("Rotas internas", routeHandler, [
  "route.module",
  "route.tab",
  "route.fiscal",
  "route.stock",
  "route.people",
  "route.settings"
]);

const shellRenderer = extractFunction("renderShell");
includesAll("Menu lateral", shellRenderer, [
  'data-module="${key}"',
  'href="#module=${key}"',
  "renderModule()"
]);
assert(!shellRenderer.includes('document.querySelectorAll("[data-module]")'), "Menu lateral: clique deve ser tratado apenas pelo handler global.");
assert(!shellRenderer.includes('document.querySelectorAll("[data-mode]")'), "Modo PDV/Retaguarda: clique deve ser tratado apenas pelo handler global.");

const loginRenderer = extractFunction("renderLogin");
includesAll("Login da retaguarda", loginRenderer, [
  'id="login-form"',
  'id="login-submit"',
  'id="login-feedback"',
  "loginInProgress",
  "Entrando...",
  "Conectando com a unidade..."
]);
assert(!loginRenderer.includes('byId("login-submit").addEventListener("click"'), "Login: botao Entrar deve usar apenas o submit do formulario.");

const moduleRenderer = extractFunction("renderModule");
includesAll("Renderizadores dos modulos", moduleRenderer, [
  "dashboard: renderDashboard",
  "people: renderPeople",
  "products: renderProducts",
  "stock: renderStock",
  "purchases: renderPurchases",
  "sales: renderSales",
  "online: renderOnlineOrders",
  "finance: renderFinance",
  "fiscal: renderFiscal",
  "reports: renderReports",
  "settings: renderSettings"
]);

const peopleRenderer = extractFunction("renderPeople");
includesAll("Abas de pessoas", peopleRenderer, [
  "data-person-filter",
  "href=\"#module=people&people=",
  "peopleTable()"
]);

const productsRenderer = extractFunction("renderProducts");
includesAll("Abas de produtos", productsRenderer, [
  "data-product-tab",
  "href=\"#module=products&tab=",
  "productTab()"
]);

const stockRenderer = extractFunction("renderStock");
includesAll("Abas de estoque", stockRenderer, [
  "data-stock-tab",
  "href=\"#module=stock&stock=",
  "currentStockTab"
]);
["producao", "movimento", "qr", "inventario", "transferencia", "saldos"].forEach((key) => {
  assert(stockRenderer.includes(`["${key}"`), `Abas de estoque: faltando aba ${key}`);
});

const fiscalRenderer = extractFunction("renderFiscal");
includesAll("Abas fiscais", fiscalRenderer, [
  "data-fiscal-tab",
  "href=\"#module=fiscal&fiscal=",
  "currentFiscalTab"
]);
[
  "nfe",
  "nfce",
  "nfse",
  "cte",
  "cteos",
  "mdfe",
  "sat",
  "mfe",
  "sped",
  "sintegra",
  "fila"
].forEach((key) => {
  assert(fiscalRenderer.includes(`"${key}"`), `Abas fiscais: faltando aba ${key}`);
});

const settingsRenderer = extractFunction("renderSettings");
includesAll("Abas de configuracoes", settingsRenderer, [
  "data-settings-tab",
  "data-settings-pane",
  "href=\"#module=settings&settings=",
  "settingsPaneClass"
]);
["geral", "regras", "operacao", "usuarios", "prontidao"].forEach((key) => {
  assert(settingsRenderer.includes(`["${key}"`), `Configuracoes: faltando aba ${key}`);
  assert(settingsRenderer.includes(`data-settings-pane="${key}"`), `Configuracoes: faltando painel ${key}`);
});

const publicUnitLink = extractFunction("publicUnitLink");
includesAll("Links publicos do totem em desenvolvimento", app, [
  "const publicTerminalGateDisabled = true",
  "Durante o desenvolvimento, os links do totem, cozinha e telao abrem direto por unidade."
]);
assert(publicUnitLink.includes("!publicTerminalGateDisabled && state.settings.publicTerminalToken"), "Links publicos: token nao pode ser exigido durante desenvolvimento.");
assert(app.includes("terminalSecure = !publicTerminalGateDisabled"), "Links publicos: cartoes precisam indicar acesso direto quando token estiver desativado.");
includesAll("Cache bust da retaguarda", index + app + serviceWorker, [
  "settings-login-fix-v9",
  "tortelaplus-operacao-v9",
  'navigator.serviceWorker.register("/sw.js?v=settings-login-fix-v9")'
]);

console.log("OK - navegacao da retaguarda validada: modulos, abas e paineis principais estao conectados.");

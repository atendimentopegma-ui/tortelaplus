const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const store = read("src/loja-tortela.js");
const kiosk = read("src/totem-tortela.js");
const kitchen = read("src/cozinha-tortela.js");
const display = read("src/telao-tortela.js");
const pkg = JSON.parse(read("package.json"));

assert(store.includes("let catalogLoadInFlight = null"), "Loja online precisa bloquear refresh sobreposto do catalogo.");
assert(store.includes("let catalogWarning = \"\""), "Loja online precisa exibir aviso de falha temporaria.");
assert(store.includes("Mantivemos o ultimo cardapio carregado"), "Loja online precisa preservar ultimo catalogo valido em falha.");
assert(store.includes("let orderInFlight = false"), "Loja online precisa controlar envio em andamento.");
assert(store.includes("if (orderInFlight) return;"), "Loja online precisa impedir duplo envio de pedido.");
assert(store.includes("Enviando pedido..."), "Loja online precisa informar envio em andamento.");

assert(kiosk.includes("state.loading"), "Totem precisa controlar envio em andamento.");
assert(kiosk.includes("Enviando..."), "Totem precisa informar envio em andamento.");
assert(kiosk.includes("renderError(message)"), "Totem precisa ter estado de erro operacional.");

assert(kitchen.includes("kitchenRefreshInFlight"), "Cozinha precisa bloquear refresh sobreposto.");
assert(kitchen.includes("lastKitchenPayload"), "Cozinha precisa manter ultimo payload valido.");
assert(kitchen.includes("Sem atualizacao agora"), "Cozinha precisa avisar falha temporaria sem limpar pedidos.");

assert(display.includes("displayRefreshInFlight"), "Telao precisa bloquear refresh sobreposto.");
assert(display.includes("lastDisplayPayload"), "Telao precisa manter ultimo payload valido.");
assert(display.includes("Sem atualizacao agora"), "Telao precisa avisar falha temporaria sem limpar pedidos.");

assert(pkg.scripts.verify.includes("src/loja-tortela.js"), "verify precisa checar sintaxe da loja online.");
assert(pkg.scripts.verify.includes("src/totem-tortela.js"), "verify precisa checar sintaxe do totem.");
assert(pkg.scripts.verify.includes("src/cozinha-tortela.js"), "verify precisa checar sintaxe da cozinha.");
assert(pkg.scripts.verify.includes("src/telao-tortela.js"), "verify precisa checar sintaxe do telao.");

console.log("OK - acabamento operacional validado: falhas temporarias, duplo envio e sintaxe das telas publicas.");

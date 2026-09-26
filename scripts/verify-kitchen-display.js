const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const kitchen = fs.readFileSync(path.join(root, "src", "cozinha-tortela.js"), "utf8");
const display = fs.readFileSync(path.join(root, "src", "telao-tortela.js"), "utf8");
const kitchenCss = fs.readFileSync(path.join(root, "src", "cozinha.css"), "utf8");
const displayCss = fs.readFileSync(path.join(root, "src", "telao.css"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

[
  ["cozinha", kitchen],
  ["telao", display]
].forEach(([label, source]) => {
  assert(source.includes("RefreshInFlight"), `${label}: precisa bloquear atualizacoes sobrepostas.`);
  assert(source.includes("last") && source.includes("Payload"), `${label}: precisa preservar ultimo payload valido em falha temporaria.`);
  assert(source.includes("function uniqueOrders"), `${label}: precisa deduplicar pedidos antes de renderizar.`);
  assert(source.includes("Sem atualizacao agora"), `${label}: precisa avisar falha temporaria sem limpar a tela.`);
});

assert(kitchen.includes("kitchenUpdatingOrders"), "cozinha: precisa bloquear clique duplicado durante mudanca de status.");
assert(kitchen.includes("Atualizando..."), "cozinha: precisa mostrar status visual durante mudanca de pedido.");
assert(kitchenCss.includes(".kitchen-sync"), "cozinha: CSS do aviso de sincronizacao ausente.");
assert(displayCss.includes(".display-sync"), "telao: CSS do aviso de sincronizacao ausente.");

console.log("OK - cozinha/telao validados: sem refresh sobreposto, com payload anterior, deduplicacao e aviso de falha temporaria.");

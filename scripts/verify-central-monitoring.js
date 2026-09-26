const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src", "central-saas.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

[
  "function monitoringSummary()",
  "function renderMonitoringAlerts(summary)",
  "function renderMonitoringRows()",
  "Backup pendente",
  "Erros fiscais",
  "Fiscal pendente",
  "Titulos atrasados",
  "Estoque minimo",
  "Prontidao incompleta",
  "Sem atualizacao 24h",
  "Acao sugerida",
  "Gerar backup"
].forEach((text) => {
  assert(source.includes(text), `Central SaaS precisa manter monitoramento operacional: ${text}`);
});

assert(/lastBackup \? "ok" : "danger"/.test(source), "Backup pendente precisa aparecer como alerta critico.");
assert(/readiness\.ok \? "ok" : "warn"/.test(source), "Prontidao incompleta precisa aparecer como alerta.");
assert(/isStaleUpdate\(client\.updatedAt\)/.test(source), "Atualizacao antiga precisa ser detectada.");

console.log("OK - monitoramento operacional da Central validado.");

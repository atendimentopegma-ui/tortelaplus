const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const app = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

[
  "function createPreRestoreTenantBackup",
  "antes-restauracao",
  "function validateTenantBackupPayload",
  "Backup nao pertence ao Tortela Plus",
  "Backup pertence a outro cliente",
  "Backup sem cadastro de produtos",
  "Backup sem usuarios",
  "Backup sem historico de vendas",
  "safetyBackup: result.safetyBackup",
  "Backup geral nao pertence ao Tortela Plus"
].forEach((text) => {
  assert(server.includes(text), `Servidor precisa manter trava de backup/restauracao: ${text}`);
});

[
  "function validateBackupBeforeRestore",
  "Este backup nao pertence ao Tortela Plus.",
  "Este backup pertence a outro cliente.",
  "Backup sem cadastro de produtos.",
  "Backup sem usuarios.",
  "Backup sem historico de vendas.",
  "criara uma copia de seguranca antes da restauracao"
].forEach((text) => {
  assert(app.includes(text), `Cliente precisa validar restauracao antes de enviar: ${text}`);
});

assert(/createPreRestoreTenantBackup\(code, current\)/.test(server), "Restauracao precisa salvar copia previa com carimbo antes de gravar novo estado.");
assert(/validateTenantBackupPayload\(code, backup\)/.test(server), "Restauracao precisa validar payload antes de gravar.");
assert(/validateBackupBeforeRestore\(restored\)/.test(app), "Front precisa validar backup antes da confirmacao final.");

console.log("OK - seguranca de backup e restauracao validada.");

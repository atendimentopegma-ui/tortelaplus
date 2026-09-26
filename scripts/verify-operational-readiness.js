const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = read("src/app.js");
const centralSaas = read("src/central-saas.js");
const centralLojista = read("src/central-lojista.js");
const centralRede = read("src/central-rede.js");
const htmlFiles = [
  "index.html",
  "central-saas.html",
  "central-rede.html",
  "central-lojista.html",
  "totem.html",
  "loja.html",
  "cozinha.html",
  "telao.html",
  "cadastro-cliente.html"
];

htmlFiles.forEach((file) => {
  assert(exists(file), `Pagina obrigatoria ausente: ${file}`);
  const html = read(file);
  const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#?]+)/g)].map((match) => match[1]);
  refs.forEach((ref) => {
    if (/^https?:/.test(ref)) return;
    assert(exists(ref), `${file} referencia arquivo inexistente: ${ref}`);
  });
});

[
  "header-backup",
  "header-xml-backup",
  "logout",
  "restore-backup",
  "validateBackupBeforeRestore(restored)",
  "requirePermission(\"restore_backup\")",
  "Ambiente fiscal:",
  "Licenca:"
].forEach((text) => {
  assert(app.includes(text), `Retaguarda precisa manter controle operacional: ${text}`);
});

[
  "Restaurar este backup substituirá os dados atuais deste cliente",
  "criara uma copia de seguranca antes da restauracao",
  "Este backup nao pertence ao Tortela Plus",
  "Backup sem cadastro de produtos",
  "Backup sem usuarios",
  "Backup sem historico de vendas"
].forEach((text) => {
  assert(app.includes(text), `Restauracao da unidade precisa manter aviso/validacao: ${text}`);
});

[
  "Backup de todos os clientes",
  "Restaurar backup geral",
  "Este backup geral nao pertence ao Tortela Plus.",
  "backup-geral-tortelaplus",
  "Central SaaS Tortela Plus",
  "renderMonitoringRows()"
].forEach((text) => {
  assert(centralSaas.includes(text), `Central SaaS precisa manter operacao segura: ${text}`);
});

[
  "Totem local",
  "Loja online",
  "Cozinha",
  "Telao",
  "PDV",
  "requirePermission(\"sales\")",
  "requirePermission(\"stock_adjust\")",
  "requirePermission(\"finance_settle\")",
  "requirePermission(\"fiscal_transmit\")",
  "requirePermission(\"manage_users\")"
].forEach((text) => {
  assert(centralLojista.includes(text), `Central do Franqueado precisa manter fluxo/permissao: ${text}`);
});

[
  "Implantacao",
  "Banco e seguranca",
  "deployment",
  "databaseIsolation",
  "price-table-units",
  "promotion-units"
].forEach((text) => {
  assert(centralRede.includes(text), `Central da Rede precisa manter visao operacional: ${text}`);
});

const visibleSources = [app, centralSaas, centralLojista, centralRede].join("\n");
[
  /Pegma Plus/i,
  /logo-pegmaplus/i,
  /backup-geral-pegmaplus/i,
  /ambiente de teste/i,
  /rascunho/i,
  /totem-botoes-acima-v(2[2-9]|[3-9]\d+)/i
].forEach((pattern) => {
  assert(!pattern.test(visibleSources), `Texto ou marca indevida encontrada: ${pattern}`);
});

assert(app.includes("credenciais reais de homologacao"), "Mensagem fiscal deve orientar homologacao real, nao teste generico.");
assert(!app.includes("credenciais reais de teste"), "Mensagem fiscal nao deve tratar homologacao como teste generico.");

console.log("OK - revisao operacional final sem dados reais validada.");

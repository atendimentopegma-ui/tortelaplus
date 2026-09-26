const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const tenantDir = path.join(root, "data", "tenants");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function listTenantStates() {
  if (!fs.existsSync(tenantDir)) return [];
  return fs.readdirSync(tenantDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(fs.readFileSync(path.join(tenantDir, name), "utf8")));
}

function any(states, fn) {
  return states.some(fn);
}

function percent(checks) {
  return Math.round(checks.filter(([, ok]) => ok).length / checks.length * 100);
}

function printGroup(title, checks) {
  console.log(`\n${title}: ${percent(checks)}%`);
  checks.forEach(([label, ok], index) => {
    console.log(`${index + 1}. ${ok ? "PRONTO" : "PENDENTE"} - ${label}`);
  });
}

const states = listTenantStates();
const pkg = JSON.parse(read("package.json"));
const server = read("server.js");
const centralSaas = read("src/central-saas.js");
const publicPages = ["src/loja-tortela.js", "src/totem-tortela.js", "src/cozinha-tortela.js", "src/telao-tortela.js"];
const publicLinks = ["src/app.js", "src/central-lojista.js", "src/central-rede.js", ...publicPages]
  .map((file) => read(file))
  .join("\n");
const verifyScripts = [
  "verify:kiosk",
  "verify:pdv",
  "verify:kitchen",
  "verify:products",
  "verify:stock",
  "verify:finance",
  "verify:security",
  "verify:polish",
  "verify:backoffice"
];

const technicalChecks = [
  ["Estrutura Render versionada", exists("render.yaml")],
  ["Deploy check disponivel", Boolean(pkg.scripts["deploy:check"])],
  ["Validacoes principais cadastradas", verifyScripts.every((script) => Boolean(pkg.scripts[script]))],
  ["Links publicos sem sequencia nova v21/v22/v23", !/(totem|loja|cozinha|telao)\.html\?[^"']*&v=|totem-botoes-acima-v\d+/i.test(publicLinks)],
  ["Totem, cozinha, telao e loja com protecao contra refresh/envio duplicado", Boolean(pkg.scripts["verify:polish"])],
  ["Catalogo inicial Tortela com combos, coberturas e adicionais", /tortelaOnlineStarterProducts/.test(server) && /Combo 4 Tortelas no palito/.test(server) && /coverageOptions/.test(server) && /toppingOptions/.test(server)],
  ["Estoque baixa composicoes recursivas", exists("scripts/verify-stock-flow.js") && /recursive|requirements|composition/i.test(read("scripts/verify-stock-flow.js"))],
  ["Financeiro amarrado a venda real", exists("scripts/verify-finance-flow.js") && /sourceSaleId|receivable/i.test(read("scripts/verify-finance-flow.js"))],
  ["Seguranca por sessao/permissao e token publico opcional", exists("scripts/verify-security-flow.js") && /terminalToken|X-PEGMA-PERMISSION/i.test(read("scripts/verify-security-flow.js"))],
  ["Central SaaS identificada como Tortela Plus", /Central SaaS Tortela Plus/.test(centralSaas) && /backup-geral-tortelaplus/.test(centralSaas) && !/Pegma Plus|logo-pegmaplus|backup-geral-pegmaplus/.test(centralSaas)]
];

const operationalChecks = [
  ["Unidade piloto em homologacao", any(states, (state) => state.settings?.fiscalEnvironment === "Homologacao")],
  ["Usuario administrador cadastrado", any(states, (state) => (state.users || []).some((user) => user.active !== false && user.role === "Administrador"))],
  ["Produtos Tortela ativos no catalogo", any(states, (state) => (state.products || []).some((product) => product.active !== false && /tortela|torta|milk shake|combo/i.test(product.description || "")))],
  ["Caixa operacional aberto para testes", any(states, (state) => state.cashRegister?.open === true)],
  ["Backup local/externo configuravel", Boolean(process.env.PEGMA_BACKUP_DIR) || exists("scripts/backup-postgres.js")],
  ["Banco PostgreSQL configurado no ambiente atual", Boolean(process.env.DATABASE_URL)]
];

const manualChecks = [
  ["Dados reais da empresa piloto", any(states, (state) => String(state.settings?.document || "").replace(/\D/g, "").length === 14 && !String(state.settings?.document || "").includes("00.000"))],
  ["Certificado A1 e senha protegida", any(states, (state) => state.settings?.certificatePasswordConfigured && state.settings?.certificateName)],
  ["SEFAZ/CSC NFC-e configurados", any(states, (state) => state.settings?.sefazCredentialed && state.settings?.cscConfigured && state.settings?.cscId)],
  ["NFS-e configurada se for usada", any(states, (state) => state.settings?.nfseCityCode && state.settings?.nfseProvider)],
  ["Provedor de pagamento real configurado", any(states, (state) => state.settings?.paymentProvider && state.settings?.paymentApiUrl)],
  ["WhatsApp/integracao real configurada", any(states, (state) => state.settings?.whatsappApiUrl || state.settings?.orderWebhookUrl)]
];

printGroup("Tecnico sem depender do cliente", technicalChecks);
printGroup("Operacional da unidade piloto", operationalChecks);
printGroup("Dependente de dados/credenciais reais", manualChecks);

const technicalReady = technicalChecks.every(([, ok]) => ok);
const operationalReady = operationalChecks.every(([, ok]) => ok);
console.log(`\nResumo sem depender do cliente: ${technicalReady ? "PRONTO" : "PENDENTE"} (${percent(technicalChecks)}%).`);
console.log(`Resumo operacional local: ${operationalReady ? "PRONTO" : "PENDENTE"} (${percent(operationalChecks)}%).`);
process.exitCode = technicalReady ? 0 : 1;

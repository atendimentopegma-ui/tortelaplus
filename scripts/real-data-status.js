const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const tenantCode = normalizeTenantCode(process.env.TORTELA_TENANT || "cliente-exemplo");
const strict = process.argv.includes("--strict");
const tenantPath = path.join(root, "data", "tenants", `${tenantCode}.json`);

function normalizeTenantCode(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function realCnpj(value) {
  const document = digits(value);
  return /^\d{14}$/.test(document) && !/^(\d)\1{13}$/.test(document);
}

function ok(value) {
  return Boolean(String(value || "").trim());
}

function readTenantState() {
  if (!fs.existsSync(tenantPath)) return null;
  return JSON.parse(fs.readFileSync(tenantPath, "utf8"));
}

function listPotentialSecrets() {
  const risky = [];
  const ignored = new Set([".git", "node_modules", "data", "output", "tmp"]);
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (/\.(pfx|p12|pem|key)$/i.test(entry.name)) risky.push(path.relative(root, full));
    }
  }
  walk(root);
  return risky;
}

function group(title, checks) {
  const ready = checks.filter((check) => check.ok).length;
  console.log(`\n${title}: ${ready}/${checks.length}`);
  checks.forEach((check, index) => {
    const status = check.ok ? "PRONTO" : "PENDENTE";
    console.log(`${index + 1}. ${status} - ${check.label}`);
  });
  return { ready, total: checks.length };
}

const state = readTenantState();
const settings = state?.settings || {};
const fiscalRules = state?.fiscalRules || [];
const usesNfe = fiscalRules.some((rule) => rule.model === "NF-e");
const usesNfce = fiscalRules.some((rule) => rule.model === "NFC-e");
const usesNfse = fiscalRules.some((rule) => rule.model === "NFS-e");
const riskyFiles = listPotentialSecrets();

const groups = [];

groups.push(group("Empresa piloto", [
  { label: "Unidade local encontrada", ok: Boolean(state) },
  { label: "Nome fantasia/razao preenchido", ok: ok(settings.company) },
  { label: "CNPJ real valido", ok: realCnpj(settings.document) },
  { label: "Regime tributario definido", ok: ok(settings.regime) },
  { label: "UF definida", ok: /^[A-Z]{2}$/.test(String(settings.uf || "")) },
  { label: "Endereco preenchido", ok: ok(settings.address) && ok(settings.number) && ok(settings.district) },
  { label: "Cidade e codigo IBGE preenchidos", ok: ok(settings.city) && ok(settings.cityCode) },
  { label: "CEP valido", ok: digits(settings.cep).length === 8 }
]));

groups.push(group("Fiscal homologacao", [
  { label: "Ambiente fiscal em homologacao antes do go-live", ok: settings.fiscalEnvironment === "Homologacao" },
  { label: "Responsavel fiscal definido", ok: ok(settings.fiscalResponsible) },
  { label: "Inscricao estadual quando usar NF-e/NFC-e", ok: !(usesNfe || usesNfce) || ok(settings.stateRegistration) },
  { label: "Inscricao municipal quando usar NFS-e", ok: !usesNfse || ok(settings.municipalRegistration) },
  { label: "Certificado A1 identificado", ok: ok(settings.certificateName) },
  { label: "Validade do certificado informada", ok: ok(settings.certificateExpiresAt) },
  { label: "Senha do certificado protegida no servidor", ok: settings.certificatePasswordConfigured === true },
  { label: "Credenciamento SEFAZ marcado", ok: settings.sefazCredentialed === true },
  { label: "CSC e ID CSC quando usar NFC-e", ok: !usesNfce || (settings.cscConfigured === true && ok(settings.cscId)) },
  { label: "Municipio/padrao NFS-e quando usar NFS-e", ok: !usesNfse || (ok(settings.nfseStandard) && ok(settings.nfseCityCode) && ok(settings.nfseProvider)) },
  { label: "Agente fiscal ACBr configurado", ok: ok(settings.acbrApiUrl) || ok(settings.acbrHost) || ok(process.env.PEGMA_ACBR_AGENT_URL) || ok(process.env.PEGMA_ACBR_HOST) }
]));

groups.push(group("Pagamentos reais", [
  { label: "Provedor de pagamento escolhido", ok: ok(settings.paymentProvider) },
  { label: "API de pagamento configurada", ok: ok(settings.paymentApiUrl) },
  { label: "Token do provedor protegido", ok: settings.paymentApiTokenConfigured === true },
  { label: "PIX configurado", ok: ok(settings.pixApiUrl) && (settings.pixApiTokenConfigured === true || settings.paymentApiTokenConfigured === true) },
  { label: "Callback/retorno de pagamento definido", ok: ok(settings.paymentCallbackUrl) }
]));

groups.push(group("WhatsApp e notificacoes", [
  { label: "Webhook WhatsApp da unidade configurado", ok: ok(settings.whatsappWebhookUrl) },
  { label: "Token WhatsApp protegido", ok: settings.whatsappWebhookTokenConfigured === true },
  { label: "Webhook de alertas operacionais configurado", ok: ok(settings.alertWebhookUrl) },
  { label: "Email/webhook de suporte configurado", ok: ok(settings.emailWebhookUrl) }
]));

groups.push(group("Seguranca dos arquivos", [
  { label: "Nenhum certificado/chave encontrado no repositorio", ok: riskyFiles.length === 0 },
  { label: "Backup externo definido por ambiente ou rotina existente", ok: ok(process.env.PEGMA_BACKUP_DIR) || fs.existsSync(path.join(root, "scripts", "backup-postgres.js")) }
]));

if (riskyFiles.length) {
  console.log("\nArquivos sensiveis encontrados fora de data/output/tmp:");
  riskyFiles.forEach((file) => console.log(`- ${file}`));
}

const ready = groups.reduce((sum, item) => sum + item.ready, 0);
const total = groups.reduce((sum, item) => sum + item.total, 0);
const percent = Math.round((ready / total) * 100);
console.log(`\nResumo dados reais ${tenantCode}: ${ready}/${total} (${percent}%).`);
console.log("Observacao: senhas, tokens e certificado A1 devem ser informados em tela protegida/Render, nunca gravados no repositorio.");

if (strict && ready !== total) process.exitCode = 1;

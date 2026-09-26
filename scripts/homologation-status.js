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

function ok(value) {
  return Boolean(String(value || "").trim());
}

function urlOk(value) {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function loadTenant() {
  if (!fs.existsSync(tenantPath)) return null;
  return JSON.parse(fs.readFileSync(tenantPath, "utf8"));
}

function group(title, checks) {
  const ready = checks.filter((check) => check.ok).length;
  console.log(`\n${title}: ${ready}/${checks.length}`);
  checks.forEach((check, index) => console.log(`${index + 1}. ${check.ok ? "PRONTO" : "PENDENTE"} - ${check.label}`));
  return { ready, total: checks.length };
}

const state = loadTenant();
const settings = state?.settings || {};
const fiscalRules = state?.fiscalRules || [];
const usesNfe = fiscalRules.some((rule) => rule.model === "NF-e");
const usesNfce = fiscalRules.some((rule) => rule.model === "NFC-e");
const usesNfse = fiscalRules.some((rule) => rule.model === "NFS-e");
const realCnpj = /^\d{14}$/.test(digits(settings.document)) && !/^(\d)\1{13}$/.test(digits(settings.document));
const homologationMode = settings.fiscalEnvironment === "Homologacao";
const acbrConfigured = ok(settings.acbrApiUrl) || ok(settings.acbrHost) || ok(process.env.PEGMA_ACBR_AGENT_URL) || ok(process.env.PEGMA_ACBR_HOST);
const acbrProtected = !ok(settings.acbrApiUrl) || settings.acbrApiTokenConfigured === true || ok(process.env.PEGMA_ACBR_AGENT_TOKEN) || ok(process.env.PEGMA_SECRET_KEY);

const groups = [];

groups.push(group("Fiscal para homologacao", [
  { label: "Unidade local encontrada", ok: Boolean(state) },
  { label: "Ambiente fiscal esta em Homologacao", ok: homologationMode },
  { label: "CNPJ real valido", ok: realCnpj },
  { label: "Endereco fiscal completo", ok: ok(settings.address) && ok(settings.number) && ok(settings.district) && ok(settings.city) && ok(settings.cityCode) && digits(settings.cep).length === 8 },
  { label: "Inscricao estadual quando usar NF-e/NFC-e", ok: !(usesNfe || usesNfce) || ok(settings.stateRegistration) },
  { label: "Inscricao municipal quando usar NFS-e", ok: !usesNfse || ok(settings.municipalRegistration) },
  { label: "Responsavel fiscal informado", ok: ok(settings.fiscalResponsible) },
  { label: "Certificado A1 identificado", ok: ok(settings.certificateName) },
  { label: "Validade do certificado informada", ok: ok(settings.certificateExpiresAt) },
  { label: "Senha do certificado protegida", ok: settings.certificatePasswordConfigured === true },
  { label: "Credenciamento SEFAZ marcado", ok: settings.sefazCredentialed === true },
  { label: "CSC e ID CSC quando usar NFC-e", ok: !usesNfce || (settings.cscConfigured === true && ok(settings.cscId)) },
  { label: "NFS-e configurada quando usada", ok: !usesNfse || (ok(settings.nfseStandard) && ok(settings.nfseProvider) && ok(settings.nfseCityCode)) },
  { label: "Agente fiscal/ACBr configurado", ok: acbrConfigured },
  { label: "Agente fiscal protegido por token ou segredo", ok: acbrProtected }
]));

groups.push(group("Pagamentos em homologacao", [
  { label: "Provedor de pagamento escolhido", ok: ok(settings.paymentProvider) },
  { label: "URL gateway online HTTPS", ok: urlOk(settings.paymentApiUrl) },
  { label: "Token gateway protegido", ok: settings.paymentApiTokenConfigured === true },
  { label: "URL PIX HTTPS", ok: urlOk(settings.pixApiUrl) },
  { label: "Token PIX protegido", ok: settings.pixApiTokenConfigured === true || settings.paymentApiTokenConfigured === true },
  { label: "URL boleto HTTPS quando usada", ok: !ok(settings.boletoApiUrl) || urlOk(settings.boletoApiUrl) },
  { label: "Token boleto protegido quando usado", ok: !ok(settings.boletoApiUrl) || settings.boletoApiTokenConfigured === true || settings.paymentApiTokenConfigured === true },
  { label: "Callback HTTPS definido", ok: urlOk(settings.paymentCallbackUrl) },
  { label: "Cabecalho de autenticacao definido", ok: ok(settings.paymentAuthHeader) }
]));

groups.push(group("WhatsApp e notificacoes", [
  { label: "Webhook WhatsApp HTTPS da unidade", ok: urlOk(settings.whatsappWebhookUrl) },
  { label: "Token WhatsApp da unidade protegido", ok: settings.whatsappWebhookTokenConfigured === true },
  { label: "Webhook de alertas HTTPS", ok: urlOk(settings.alertWebhookUrl) },
  { label: "Token de alertas protegido quando webhook existir", ok: !ok(settings.alertWebhookUrl) || settings.alertWebhookTokenConfigured === true },
  { label: "Webhook de e-mail/suporte HTTPS", ok: urlOk(settings.emailWebhookUrl) },
  { label: "Token de e-mail/suporte protegido quando webhook existir", ok: !ok(settings.emailWebhookUrl) || settings.emailWebhookTokenConfigured === true }
]));

groups.push(group("Ensaios antes do go-live", [
  { label: "Regressao tecnica automatizada disponivel", ok: fs.existsSync(path.join(root, "scripts", "verify-regression.js")) },
  { label: "Checklist de dados reais disponivel", ok: fs.existsSync(path.join(root, "scripts", "real-data-status.js")) },
  { label: "Verificacao pos-deploy disponivel", ok: fs.existsSync(path.join(root, "scripts", "verify-post-deploy.js")) },
  { label: "Sistema ainda nao esta em Producao fiscal", ok: settings.fiscalEnvironment !== "Producao" }
]));

const ready = groups.reduce((sum, item) => sum + item.ready, 0);
const total = groups.reduce((sum, item) => sum + item.total, 0);
const percent = Math.round((ready / total) * 100);
console.log(`\nResumo homologacao ${tenantCode}: ${ready}/${total} (${percent}%).`);
console.log("Use --strict apenas quando os dados reais estiverem preenchidos e for hora de bloquear a liberacao se algo faltar.");

if (strict && ready !== total) process.exitCode = 1;

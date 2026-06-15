const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const tenantDir = path.join(root, "data", "tenants");
const tenants = fs.existsSync(tenantDir) ? fs.readdirSync(tenantDir).filter((name) => name.endsWith(".json")) : [];
const states = tenants.map((name) => JSON.parse(fs.readFileSync(path.join(tenantDir, name), "utf8")));
const any = (fn) => states.some(fn);
const checks = [
  ["Estrutura pronta para Render", fs.existsSync(path.join(root, "render.yaml"))],
  ["PostgreSQL online configurado", Boolean(process.env.DATABASE_URL)],
  ["Segredos de producao configurados", Boolean(process.env.PEGMA_SECRET_KEY && process.env.PEGMA_CENTRAL_USER && process.env.PEGMA_CENTRAL_PASSWORD)],
  ["Agente fiscal e ACBr presentes", fs.existsSync(path.join(root, "fiscal-agent.js")) && fs.existsSync(path.join(root, "runtime", "fiscal", "ACBrLib", "ACBrNFe64.dll"))],
  ["Dados reais de empresa informados", any((state) => String(state.settings?.document || "").replace(/\D/g, "").length === 14 && !String(state.settings?.document || "").includes("00.000"))],
  ["Certificado A1 configurado", any((state) => state.settings?.certificatePasswordConfigured && state.settings?.certificateName)],
  ["SEFAZ e CSC configurados", any((state) => state.settings?.sefazCredentialed && state.settings?.cscConfigured && state.settings?.cscId)],
  ["NFS-e municipal/nacional configurada", any((state) => state.settings?.nfseCityCode && state.settings?.nfseProvider)],
  ["PIX/boleto configurados", any((state) => state.settings?.pixApiUrl && state.settings?.boletoApiUrl)],
  ["Empresa piloto pronta", any((state) => state.settings?.fiscalEnvironment === "Homologacao" && (state.users || []).length && (state.products || []).length)]
];
console.log(checks.map(([label, ok], index) => `${index + 1}. ${ok ? "PRONTO" : "PENDENTE"} - ${label}`).join("\n"));
process.exitCode = checks.every(([, ok]) => ok) ? 0 : 1;

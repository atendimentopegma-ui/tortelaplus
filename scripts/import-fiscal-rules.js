const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const source = process.argv[2];
if (!source) throw new Error("Uso: node scripts/import-fiscal-rules.js caminho-do-pacote.json");
const absolute = path.resolve(source);
const raw = fs.readFileSync(absolute, "utf8");
const pkg = JSON.parse(raw);
if (!pkg.version || !pkg.validFrom || !Array.isArray(pkg.rules) || !pkg.rules.length) throw new Error("Pacote fiscal invalido: informe version, validFrom e rules.");
if (pkg.validTo && pkg.validTo < pkg.validFrom) throw new Error("Vigencia final anterior a vigencia inicial.");
const checksum = crypto.createHash("sha256").update(JSON.stringify(pkg.rules)).digest("hex");
if (pkg.checksum && pkg.checksum !== checksum) throw new Error("Checksum do pacote fiscal nao confere.");

const tenantsDir = path.join(__dirname, "..", "data", "tenants");
const files = fs.existsSync(tenantsDir) ? fs.readdirSync(tenantsDir).filter((name) => name.endsWith(".json")) : [];
for (const name of files) {
  const filename = path.join(tenantsDir, name);
  const state = JSON.parse(fs.readFileSync(filename, "utf8"));
  state.fiscalRules = pkg.rules;
  state.fiscalRulePackages = state.fiscalRulePackages || [];
  state.fiscalRulePackages.push({ version: pkg.version, validFrom: pkg.validFrom, validTo: pkg.validTo || "", checksum, importedAt: new Date().toISOString() });
  fs.copyFileSync(filename, `${filename}.before-fiscal-${Date.now()}.bak`);
  fs.writeFileSync(filename, JSON.stringify(state, null, 2));
}
console.log(`Pacote fiscal ${pkg.version} aplicado em ${files.length} cliente(s). Checksum: ${checksum}`);

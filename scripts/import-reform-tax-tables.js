const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { normalizeTables, validateReformTaxTables } = require("../src/server/reform-tax-tables");

const source = process.argv[2];
if (!source) throw new Error("Uso: node scripts/import-reform-tax-tables.js caminho-da-tabela.json");

const absolute = path.resolve(source);
const raw = fs.readFileSync(absolute, "utf8");
const pkg = normalizeTables(JSON.parse(raw));
const errors = validateReformTaxTables(pkg);
if (errors.length) throw new Error(`Tabela da reforma invalida: ${errors.join(", ")}`);

const checksum = crypto.createHash("sha256")
  .update(JSON.stringify({ cstIndicators: pkg.cstIndicators, classTrib: pkg.classTrib }))
  .digest("hex");
if (pkg.checksum && pkg.checksum !== checksum) throw new Error("Checksum da tabela da reforma nao confere.");

const tenantsDir = path.join(__dirname, "..", "data", "tenants");
const files = fs.existsSync(tenantsDir) ? fs.readdirSync(tenantsDir).filter((name) => name.endsWith(".json")) : [];

for (const name of files) {
  const filename = path.join(tenantsDir, name);
  const state = JSON.parse(fs.readFileSync(filename, "utf8"));
  state.reformTaxTables = { ...pkg, checksum };
  state.reformTaxTableImports = state.reformTaxTableImports || [];
  state.reformTaxTableImports.push({
    version: pkg.version,
    publishedAt: pkg.publishedAt,
    checksum,
    importedAt: new Date().toISOString()
  });
  fs.copyFileSync(filename, `${filename}.before-reform-tables-${Date.now()}.bak`);
  fs.writeFileSync(filename, JSON.stringify(state, null, 2));
}

console.log(`Tabela da reforma ${pkg.version} aplicada em ${files.length} cliente(s). Checksum: ${checksum}`);

const fs = require("fs");
const path = require("path");
const { PostgresStore } = require("../src/server/postgres-store");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL antes de verificar a migracao.");
  const root = path.resolve(__dirname, "..");
  const dataDir = process.env.PEGMA_DB_DIR ? path.resolve(process.env.PEGMA_DB_DIR) : path.join(root, "data");
  const providerFile = path.join(dataDir, "provider-state.json");
  const sourceProvider = JSON.parse(fs.readFileSync(providerFile, "utf8").replace(/^\uFEFF/, ""));
  const store = new PostgresStore(process.env.DATABASE_URL);
  await store.initialize();
  const targetProvider = await store.readProvider();
  if (!targetProvider) throw new Error("Central SaaS nao encontrada no PostgreSQL.");
  if ((targetProvider.clients || []).length !== (sourceProvider.clients || []).length) {
    throw new Error("Quantidade de clientes diverge entre JSON e PostgreSQL.");
  }
  for (const client of sourceProvider.clients || []) {
    if (!(await store.tenantExists(client.tenantCode))) throw new Error(`Schema ausente: ${client.tenantCode}`);
    const sourceFile = path.join(dataDir, "tenants", `${client.tenantCode}.json`);
    if (!fs.existsSync(sourceFile)) continue;
    const source = JSON.parse(fs.readFileSync(sourceFile, "utf8").replace(/^\uFEFF/, ""));
    const target = await store.readTenant(client.tenantCode);
    for (const collection of ["users", "people", "products", "sales", "purchases", "fiscalQueue"]) {
      if ((source[collection] || []).length !== (target[collection] || []).length) {
        throw new Error(`${client.tenantCode}: divergencia em ${collection}.`);
      }
    }
    console.log(`Verificado: ${client.tenantCode}`);
  }
  console.log("Migracao PostgreSQL verificada sem divergencias estruturais.");
  await store.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

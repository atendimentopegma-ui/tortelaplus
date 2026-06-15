const fs = require("fs");
const path = require("path");
const { PostgresStore } = require("../src/server/postgres-store");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL.");
  const store = new PostgresStore(process.env.DATABASE_URL);
  await store.initialize();
  const provider = await store.readProvider();
  if (!provider) throw new Error("Central SaaS nao encontrada no PostgreSQL.");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.resolve(process.env.PEGMA_BACKUP_DIR || path.join(__dirname, "..", "data", "external-backups"), stamp);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, "provider-state.json"), JSON.stringify(provider, null, 2));
  for (const client of provider.clients || []) {
    const state = await store.readTenant(client.tenantCode);
    fs.writeFileSync(path.join(target, `${client.tenantCode}.json`), JSON.stringify(state, null, 2));
  }
  await store.close();
  console.log(`Backup concluido em ${target}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

const fs = require("fs");
const path = require("path");
const { PostgresStore } = require("../src/server/postgres-store");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL antes de executar a migracao.");
  const root = path.resolve(__dirname, "..");
  const dataDir = process.env.PEGMA_DB_DIR ? path.resolve(process.env.PEGMA_DB_DIR) : path.join(root, "data");
  const store = new PostgresStore(process.env.DATABASE_URL);
  await store.initialize();

  const provider = JSON.parse(fs.readFileSync(path.join(dataDir, "provider-state.json"), "utf8").replace(/^\uFEFF/, ""));
  await store.writeProvider(provider);
  for (const client of provider.clients || []) {
    const file = path.join(dataDir, "tenants", `${client.tenantCode}.json`);
    if (!fs.existsSync(file)) continue;
    const state = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    await store.writeTenant(client.tenantCode, state);
    const tenantStorage = path.join(dataDir, "storage", client.tenantCode);
    if (fs.existsSync(tenantStorage)) {
      for (const category of fs.readdirSync(tenantStorage, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
        const categoryDir = path.join(tenantStorage, category.name);
        for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true }).filter((item) => item.isFile())) {
          const content = fs.readFileSync(path.join(categoryDir, entry.name));
          await store.writeFile(client.tenantCode, category.name, entry.name, "application/octet-stream", content);
        }
      }
    }
    console.log(`Migrado: ${client.tenantCode}`);
  }
  await store.close();
  console.log("Migracao concluida.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

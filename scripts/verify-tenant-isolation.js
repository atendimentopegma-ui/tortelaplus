const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { tenantSchema } = require("../src/server/postgres-store");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL.");
  const provider = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "provider-state.json"), "utf8").replace(/^\uFEFF/, ""));
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const clients = provider.clients || [];
  const schemas = clients.map((client) => tenantSchema(client.tenantCode));
  if (new Set(schemas).size !== schemas.length) throw new Error("Dois clientes resultaram no mesmo schema.");
  for (const client of clients) {
    const schema = tenantSchema(client.tenantCode);
    const result = await pool.query(`select document from "${schema}".state_document where id = 1`);
    if (!result.rows[0]?.document) throw new Error(`Estado ausente no schema ${schema}.`);
    const storedCode = result.rows[0].document.settings?.tenantCode;
    if (storedCode && storedCode !== client.tenantCode) throw new Error(`${schema} contem dados declarados de ${storedCode}.`);
    console.log(`Isolado: ${client.tenantCode} -> ${schema}`);
  }
  const result = await pool.query("select schema_name from information_schema.schemata where schema_name like 'tenant_%' order by schema_name");
  console.log(`Schemas de clientes no banco: ${result.rows.map((row) => row.schema_name).join(", ")}`);
  await pool.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

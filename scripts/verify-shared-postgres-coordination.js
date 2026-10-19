const assert = require("assert/strict");
const { Pool } = require("pg");
const { createStateCoordinator } = require("../src/server/coordinated-state");

// Uses real session locks and SELECT only; creates no tables or production rows.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL.");
  const pools = [0, 1].map(() => new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 10000 }));
  const stores = pools.map(pool => ({ pool, pending: Promise.resolve() }));
  const caches = [0, 0];
  let authoritative = 0;
  const coordinators = stores.map((store, i) => createStateCoordinator(() => store, async () => { caches[i] = authoritative; }));
  try {
    await Promise.all(Array.from({ length: 12 }, (_, n) => {
      const i = n % 2;
      return coordinators[i](async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        authoritative = caches[i] + 1;
      });
    }));
    assert.equal(authoritative, 12, "Concorrencia entre servicos perdeu atualizacoes.");
    await assert.rejects(coordinators[0](async () => { throw new Error("falha controlada"); }), /falha controlada/);
    await coordinators[1](async () => assert.equal(caches[1], 12));
    console.log("OK - dois pools PostgreSQL coordenados, cache atualizado e lock liberado apos erro; nenhum dado gravado.");
  } finally { await Promise.all(pools.map(pool => pool.end())); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

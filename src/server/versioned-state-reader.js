const { tenantSchema } = require('./postgres-store');

// Called only under the shared advisory lock, after pending writes settle.
// PostgreSQL returns the large JSON document only when its row version changes.
// Keep private copies: failed writes must never become authoritative cache data.
function createVersionedStateReader(normalizeCode) {
  let providerEntry;
  let tenantEntries = new Map();

  async function readRow(store, table, previous, missingMessage) {
    const result = await store.pool.query(
      `SELECT xmin::text || ':' || updated_at::text AS version,
         CASE WHEN (xmin::text || ':' || updated_at::text) = $1::text
           THEN NULL ELSE document END AS document
       FROM ${table} WHERE id = 1`,
      [previous?.version ?? null]
    );
    const row = result.rows[0];
    if (!row) throw new Error(missingMessage);
    if (previous && row.version === previous.version) return previous;
    if (!row.document) throw new Error(missingMessage);
    return { version: row.version, document: structuredClone(row.document) };
  }

  return async function readVersionedState(store) {
    const nextProvider = await readRow(store, 'provider_state', providerEntry,
      'Central da Rede ausente no PostgreSQL.');
    const nextTenants = new Map();
    for (const tenant of nextProvider.document.clients || []) {
      const code = normalizeCode(tenant.tenantCode);
      if (nextTenants.has(code)) continue;
      const entry = await readRow(store, `"${tenantSchema(code)}".state_document`,
        tenantEntries.get(code), 'Dados da unidade ausentes no PostgreSQL.');
      nextTenants.set(code, entry);
    }
    // Publish only a complete refresh. An error must leave the previous snapshot intact.
    providerEntry = nextProvider;
    tenantEntries = nextTenants;
    return {
      provider: structuredClone(providerEntry.document),
      tenants: new Map([...tenantEntries].map(([code, entry]) => [code, structuredClone(entry.document)]))
    };
  };
}

module.exports = { createVersionedStateReader };

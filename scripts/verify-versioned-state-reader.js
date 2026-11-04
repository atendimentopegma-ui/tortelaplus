const assert = require('node:assert/strict');
const { createVersionedStateReader } = require('../src/server/versioned-state-reader');
const { createStateCoordinator } = require('../src/server/coordinated-state');

(async () => {
  const rows = new Map();
  let sequence = 0, bytes = 0, documents = 0;
  function put(table, document) {
    rows.set(table, { version: `${++sequence}:2026-11-04T12:00:00`, document: structuredClone(document) });
  }
  put('provider_state', { clients: [{ tenantCode: 'loja-1' }, { tenantCode: 'loja-2' }] });
  const tenant1 = '"tenant_loja_1".state_document', tenant2 = '"tenant_loja_2".state_document';
  put(tenant1, { _meta: { revision: 1 }, sales: [{ operationId: 'old-sale' }], payload: 'a'.repeat(350000) });
  put(tenant2, { _meta: { revision: 1 }, sales: [], payload: 'b'.repeat(350000) });
  let failTable = '';
  const store = { pending: Promise.resolve(), pool: {
    async query(sql, params) {
      assert(sql.includes('CASE WHEN') && sql.includes('THEN NULL ELSE document END'), 'Unchanged documents must stay in PostgreSQL.');
      const table = sql.match(/FROM (.+) WHERE id = 1/)[1];
      if (table === failTable) throw Error('database unavailable');
      const value = rows.get(table);
      if (!value) return { rows: [] };
      const row = { version: value.version, document: value.version === params[0] ? null : structuredClone(value.document) };
      if (row.document) documents++;
      bytes += Buffer.byteLength(JSON.stringify(row));
      return { rows: [row] };
    },
    async connect() { return { query: async () => ({}), release() {} }; }
  }};
  const read = createVersionedStateReader(x => x.toLowerCase());
  let snapshot = await read(store);
  assert.equal(documents, 3);
  const startBytes = bytes;
  for (let i = 0; i < 120; i++) snapshot = await read(store);
  const unchangedBytes = bytes - startBytes;
  assert.equal(documents, 3, 'Polling reloaded unchanged data.');
  assert(unchangedBytes < 40000, 'Unchanged polling must transfer metadata only.');

  // A failed write may have changed operational objects; private snapshots remain authoritative.
  snapshot.provider.clients.length = 0;
  snapshot.tenants.get('loja-1').sales.push({ operationId: 'not-persisted' });
  snapshot = await read(store);
  assert.equal(snapshot.provider.clients.length, 2);
  assert.equal(snapshot.tenants.get('loja-1').sales.length, 1);

  put(tenant1, { ...rows.get(tenant1).document, _meta: { revision: 2 }, sales: [{ operationId: 'old-sale' }, { operationId: 'new-sale' }] });
  snapshot = await read(store);
  assert.equal(snapshot.tenants.get('loja-1').sales.length, 2);
  assert.equal(documents, 4, 'Only the changed store must transfer its document.');

  failTable = tenant2;
  put(tenant1, { ...rows.get(tenant1).document, _meta: { revision: 3 } });
  await assert.rejects(() => read(store), /unavailable/);
  failTable = '';
  snapshot = await read(store);
  assert.equal(snapshot.tenants.get('loja-1')._meta.revision, 3);
  rows.delete(tenant2);
  await assert.rejects(() => read(store), /unidade ausentes/);
  put('provider_state', { clients: [{ tenantCode: 'loja-1' }, { tenantCode: 'loja-3' }] });
  put('"tenant_loja_3".state_document', { sales: [] });
  snapshot = await read(store);
  assert(!snapshot.tenants.has('loja-2') && snapshot.tenants.has('loja-3'));

  // Two service caches, coordinated operations: an external sale and cancellation stay visible.
  const caches = [null, null];
  const coordinators = [0, 1].map(i => {
    const reader = createVersionedStateReader(x => x);
    return createStateCoordinator(() => store, async () => { caches[i] = await reader(store); });
  });
  await coordinators[0](() => {});
  await coordinators[1](() => {});
  await coordinators[0](() => {
    const changed = caches[0].tenants.get('loja-1');
    changed.sales.push({ operationId: 'sale-from-pdv', status: 'Fechado' });
    put(tenant1, changed);
  });
  await coordinators[1](() => {
    const changed = caches[1].tenants.get('loja-1');
    assert(changed.sales.some(s => s.operationId === 'sale-from-pdv'));
    changed.sales.find(s => s.operationId === 'sale-from-pdv').status = 'Cancelado';
    put(tenant1, changed);
  });
  await coordinators[0](() => assert.equal(caches[0].tenants.get('loja-1').sales.find(s => s.operationId === 'sale-from-pdv').status, 'Cancelado'));
  console.log(`OK: 120 unchanged polls: ${unchangedBytes} simulated response bytes, zero repeated JSON documents; changed data, two service caches, cancellation, failed reads/writes and tenant membership verified.`);
})().catch(error => { console.error(error); process.exitCode = 1; });

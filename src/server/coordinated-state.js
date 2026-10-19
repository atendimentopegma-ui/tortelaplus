// Serialize cache refresh + state changes across both services sharing PostgreSQL.
// A per-process queue keeps advisory-lock waiters from exhausting the pool.
function createStateCoordinator(getStore, refresh) {
  let pending = Promise.resolve();
  return function coordinate(operation) {
    const run = pending.then(async () => {
      const store = getStore();
      if (!store) return operation();
      const lock = await store.pool.connect();
      let acquired = false;
      try {
        // Neon uses transaction pooling: session locks can attach to a different
        // backend on the next query. A transaction pins the connection instead.
        await lock.query("BEGIN");
        await lock.query("SELECT pg_advisory_xact_lock(748321902)");
        acquired = true;
        await store.pending;
        await refresh(store);
        return await operation();
      } finally {
        try {
          await store.pending;
          if (acquired) await lock.query("COMMIT");
          else await lock.query("ROLLBACK");
        } finally { lock.release(); }
      }
    });
    pending = run.catch(() => {});
    return run;
  };
}
module.exports = { createStateCoordinator };

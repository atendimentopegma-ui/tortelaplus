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
        await lock.query("SELECT pg_advisory_lock(748321901)");
        acquired = true;
        await store.pending;
        await refresh(store);
        return await operation();
      } finally {
        try {
          await store.pending;
          if (acquired) await lock.query("SELECT pg_advisory_unlock(748321901)");
        } finally { lock.release(); }
      }
    });
    pending = run.catch(() => {});
    return run;
  };
}
module.exports = { createStateCoordinator };

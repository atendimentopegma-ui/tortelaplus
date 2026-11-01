function missingCommittedSale(current,incoming){
 const rows=incoming.sales||[];
 return (current.sales||[]).some(sale=>!rows.some(next=>sale.operationId?next.operationId===sale.operationId:String(next.id)===String(sale.id)&&String(next.soldAt||'')===String(sale.soldAt||'')));
}
async function confirmPersistedTenant(store,tenantCode,expected){
 if(!store)return expected;
 await store.pending;
 const persisted=await store.readTenant(tenantCode);
 if(!persisted||Number(persisted._meta?.revision)!==Number(expected._meta?.revision)||missingCommittedSale(expected,persisted))throw Error('Gravação no banco ainda não confirmada. Mantenha as vendas na fila local.');
 return persisted;
}
module.exports={missingCommittedSale,confirmPersistedTenant};

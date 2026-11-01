const assert=require('node:assert/strict');
const {missingCommittedSale,confirmPersistedTenant}=require('../src/server/sales-preservation');
(async()=>{
 const original={_meta:{revision:9},sales:[{id:1,soldAt:'2026-10-31T20:00:00Z',total:25},{id:2,operationId:'sale-2',total:30}]};
 assert(missingCommittedSale(original,{sales:[original.sales[1]]}),'Venda antiga sem UUID deve ser preservada.');
 assert(missingCommittedSale(original,{sales:[{...original.sales[0],soldAt:'2026-10-31T21:00:00Z'},original.sales[1]]}),'Número reutilizado não é a mesma venda.');
 assert(!missingCommittedSale(original,{sales:original.sales.map(s=>({...s,status:'Cancelado'}))}),'Cancelamento não remove registro.');
 let persisted={...original,_meta:{revision:8}},read=false;
 const store={pending:Promise.resolve(),readTenant:async()=>{read=true;return persisted;}};
 await assert.rejects(()=>confirmPersistedTenant(store,'loja-1',original),/não confirmada/);assert(read);
 persisted={...original,sales:[original.sales[0]]};await assert.rejects(()=>confirmPersistedTenant(store,'loja-1',original),/não confirmada/);
 persisted=structuredClone(original);assert.equal((await confirmPersistedTenant(store,'loja-1',original))._meta.revision,9);
 let release;store.pending=new Promise(r=>release=r);read=false;const waiting=confirmPersistedTenant(store,'loja-1',original);await Promise.resolve();assert(!read);release();await waiting;assert(read);
 console.log('OK: vendas antigas e novas protegidas; colisão bloqueada; cancelamento mantém histórico; confirmação aguarda banco e rejeita revisão ou venda ausente.');
})().catch(e=>{console.error(e);process.exitCode=1;});

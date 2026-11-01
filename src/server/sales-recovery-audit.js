function summarizeSnapshot(document, tenantCode, date, source) {
 const snapshot=Array.isArray(document.clients)?document.clients.find(c=>c.tenantCode===tenantCode):document;
 if(!snapshot||snapshot.tenantCode&&snapshot.tenantCode!==tenantCode)return null;
 const state=snapshot.state;if(!state||state.settings?.tenantCode!==tenantCode)return null;
 const sales=(state.sales||[]).filter(s=>s.date===date).map(s=>({id:s.id,operationId:s.operationId||null,soldAt:s.soldAt,total:s.total,status:s.status,terminalId:s.terminalId}));
 return {source,generatedAt:snapshot.generatedAt||document.generatedAt,revision:state._meta?.revision,totalSales:state.sales?.length||0,count:sales.length,total:sales.reduce((a,s)=>a+Number(s.total||0),0),sales};
}
module.exports={summarizeSnapshot};

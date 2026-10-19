const resetCollections=["products","sales","receivables","payables","cash","cashClosures","heldSales","pdvTables","automaticOrders","approvalRequests","networkPromotions","franchisePayments","fiscalQueue","purchases","stockMovements","productions","stockLots","stockInventories","stockTransfers","financeReconciliations","stockSerials","warehouseStocks","bankTransactions","alertOutbox"];
function resetTestData(state,epoch,now=new Date()) {
  const counts=Object.fromEntries(resetCollections.map(key=>[key,(state[key]||[]).length]));
  for(const key of resetCollections)state[key]=[];
  state.cashRegister={open:false,openedAt:"",openedBy:"",initialAmount:0,terminal:""};
  state.auditLogs=[];
  state._meta={...state._meta,dataEpoch:epoch};
  state.settings={...state.settings,testDataClearedAt:now.toISOString()};
  return counts;
}
module.exports={resetCollections,resetTestData};

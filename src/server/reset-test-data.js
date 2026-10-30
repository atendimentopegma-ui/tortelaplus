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

function resetSalesHistory(state,epoch,now=new Date()){
 if((state.fiscalQueue||[]).some(row=>/autorizad|cancelad/i.test(row.status||'')||row.protocol||row.authorizationProtocol))throw Error('A unidade possui documentos fiscais processados; a limpeza de testes foi bloqueada.');
 const keys=['sales','receivables','cash','cashClosures','heldSales','pdvTables','fiscalQueue','couponRedemptions','loyaltyLedger'];
 const counts=Object.fromEntries(keys.map(key=>[key,(state[key]||[]).length]));
 for(const key of keys)state[key]=[];
 state.cashRegister={open:false,openedAt:'',openedBy:'',initialAmount:0,terminal:''};
 state._meta={...state._meta,dataEpoch:epoch};
 state.settings={...state.settings,salesHistoryClearedAt:now.toISOString()};
 return counts;
}
module.exports.resetSalesHistory=resetSalesHistory;

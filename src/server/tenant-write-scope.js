// A client sends a full snapshot; only fields belonging to its permitted sectors may change.
const fields = {
  people:["people"], products:["products"], stock:["products","stockMovements","productions","stockLots","stockInventories","stockTransfers","stockSerials","warehouseStocks"],
  stock_adjust:["products","stockMovements","stockLots","stockInventories","stockTransfers","stockSerials","warehouseStocks"],
  purchases:["purchases","products","stockMovements","stockLots","payables"], purchase_cancel:["purchases","products","stockMovements","stockLots","payables"],
  sales:["sales","products","stockMovements","receivables","cash","heldSales","pdvTables","fiscalQueue"],
  pdv:["sales","products","stockMovements","receivables","cash","heldSales","pdvTables","fiscalQueue","cashRegister","cashClosures"],
  sales_cancel:["sales","products","stockMovements","receivables","cash","fiscalQueue"],
  finance:["cash","payables","receivables","chartOfAccounts","financeReconciliations","bankTransactions","franchisePayments"],
  finance_settle:["cash","payables","receivables","financeReconciliations","bankTransactions"],
  fiscal:["fiscalQueue","fiscalRules","fiscalRulePackages"], fiscal_transmit:["fiscalQueue"], fiscal_cancel:["fiscalQueue"],
  settings:["settings"], manage_users:["users"]
};
function assertTenantWriteScope(current, incoming, permissions, allPermissions) {
  if(allPermissions.every(p=>permissions.includes(p)))return;
  const allowed=new Set(permissions.flatMap(p=>fields[p]||[]));
  for(const key of Object.keys(incoming)) {
    if(["_meta","auditLogs","provider","users"].includes(key))continue;
    if(key==="settings") {
      const fiscalKeys=["fiscalEnvironment","nfeSerie","lojistaDanfeEnabled"];
      for(const setting of Object.keys(incoming.settings||{})) {
        if(setting==="user" || setting==="pdvTerminals")continue;
        if(JSON.stringify(current.settings?.[setting])===JSON.stringify(incoming.settings[setting]))continue;
        if(allowed.has("settings") || (permissions.includes("fiscal_transmit") && fiscalKeys.includes(setting)))continue;
        throw Error("Seu usuario nao pode alterar configuracoes deste setor.");
      }
    } else if(!allowed.has(key) && JSON.stringify(current[key])!==JSON.stringify(incoming[key])) throw Error("Seu usuario nao pode alterar dados de outro setor.");
  }
}
module.exports={assertTenantWriteScope};

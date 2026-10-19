const requiredModules = {
  products:["Estoque","PDV","Compras"], stock:["Estoque"],stock_adjust:["Estoque"],purchases:["Compras"],purchase_cancel:["Compras"],
  sales:["PDV"],sales_cancel:["PDV"],pdv:["PDV"],finance:["Financeiro"],finance_settle:["Financeiro"],reports:["Relatorios"],
  fiscal:["NF-e","NFC-e","NFS-e","CTe","CTe-OS","MDFe","SAT","MFe","SPED","Sintegra"],
  fiscal_transmit:["NF-e","NFC-e","NFS-e","CTe","CTe-OS","MDFe","SAT","MFe"],fiscal_cancel:["NF-e","NFC-e","NFS-e"]
};
function tenantModuleAllowed(tenant, permission){const needed=requiredModules[permission];return !needed || needed.some(module=>(tenant.modules||[]).includes(module));}
module.exports={tenantModuleAllowed};

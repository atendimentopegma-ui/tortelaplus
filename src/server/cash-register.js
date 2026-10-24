const {snapshot}=require("./closure-reports");
const money = value => Math.round(Number(value || 0) * 100) / 100;
function businessDay(value = new Date(), timeZone = "America/Sao_Paulo") {
  const date=new Date(value);if(!Number.isFinite(date.getTime()))return "";
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const get=type=>parts.find(part=>part.type===type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function cashRegisterStale(register, now = new Date()) {
  return Boolean(register?.open && (!businessDay(register.openedAt) || businessDay(register.openedAt)!==businessDay(now)));
}
function cashBalance(state) {
  const register=state.cashRegister||{};
  const movements=(state.cash||[]).filter(row=>row.cashRegisterOpenedAt===register.openedAt && (!row.paymentMethod || row.paymentMethod==="Dinheiro"));
  return money(movements.length?movements.reduce((sum,row)=>sum+Number(row.in||0)-Number(row.out||0),0):register.initialAmount);
}
function openRegister(state,{user,terminal,terminalId,initialAmount},now=new Date()) {
  if(state.cashRegister?.open)throw Error("Feche o caixa que esta aberto antes de iniciar uma nova abertura.");
  const amount=Number(initialAmount);if(!Number.isFinite(amount)||amount<0)throw Error("Informe um valor inicial valido.");
  const register={open:true,openedAt:now.toISOString(),businessDate:businessDay(now),openedBy:user,openedAuthorizedBy:user,initialAmount:money(amount),terminal:String(terminal||"PDV").slice(0,80),terminalId};
  state.cashRegister=register;
  if(amount>0)state.cash.push({id:Math.max(0,...state.cash.map(row=>Number(row.id)||0))+1,date:businessDay(now),account:"CAIXA",history:`Abertura de caixa ${register.terminal}`,in:money(amount),out:0,cashRegisterOpenedAt:register.openedAt});
  return register;
}
function closeRegister(state,{user,authorizedBy,countedAmount,responsible,closingNote},now=new Date()) {
  const register=state.cashRegister;if(!register?.open)throw Error("Nao existe caixa aberto para fechar.");
  const counted=Number(countedAmount);if(!Number.isFinite(counted)||counted<0)throw Error("Informe um valor contado valido.");
  const sales=(state.sales||[]).filter(sale=>sale.type==="PDV" && ["Fechado","Parcialmente devolvido"].includes(sale.status) && sale.cashRegisterOpenedAt===register.openedAt);
  const movements=(state.cash||[]).filter(row=>row.cashRegisterOpenedAt===register.openedAt),paymentTotals={};
  sales.forEach(sale=>(sale.payments||[]).forEach(payment=>paymentTotals[payment.method]=money((paymentTotals[payment.method]||0)+Number(payment.value||0)-(payment.method==="Dinheiro"?Number(sale.change||0):0))));
  const expectedAmount=cashBalance(state);
  const closure={id:Math.max(0,...(state.cashClosures||[]).map(row=>Number(row.id)||0))+1,terminal:register.terminal,terminalId:register.terminalId,openedAt:register.openedAt,closedAt:now.toISOString(),businessDate:register.businessDate||businessDay(register.openedAt),openedBy:register.openedBy,closedBy:user,authorizedBy,responsible:String(responsible||authorizedBy).slice(0,120),closingNote:String(closingNote||"").slice(0,1000),initialAmount:register.initialAmount,salesCount:sales.length,salesTotal:money(sales.reduce((sum,sale)=>sum+Math.max(0,Number(sale.total||0)-(sale.returns||[]).reduce((n,r)=>n+Number(r.value||0),0)),0)),paymentTotals,expectedAmount,closedAmount:money(counted),difference:money(counted-expectedAmount),supplies:money(movements.filter(row=>String(row.history).toLowerCase().includes("suprimento")).reduce((sum,row)=>sum+Number(row.in||0),0)),withdrawals:money(movements.filter(row=>String(row.history).toLowerCase().includes("sangria")).reduce((sum,row)=>sum+Number(row.out||0),0))};
  closure.report=snapshot(state,register);
  state.cashClosures=state.cashClosures||[];state.cashClosures.push(closure);
  state.cashRegister={...register,open:false,closedAt:closure.closedAt,closedBy:user,closedAmount:closure.closedAmount,difference:closure.difference};
  return closure;
}
function assertPdvCashWrite(current,incoming,now=new Date()) {
  if(incoming.cashRegister && JSON.stringify(incoming.cashRegister)!==JSON.stringify(current.cashRegister))throw Error("Use os controles protegidos de abertura e fechamento do caixa.");
  if(incoming.cashClosures && JSON.stringify(incoming.cashClosures)!==JSON.stringify(current.cashClosures||[]))throw Error("Use o fechamento protegido para registrar a conferencia do caixa.");
  const existing=new Set((current.sales||[]).map(sale=>String(sale.id)));
  const added=(incoming.sales||[]).filter(sale=>sale.type==="PDV"&&!existing.has(String(sale.id)));
  for(const sale of added){
    if(!current.cashRegister?.open)throw Error("Abra o caixa do dia antes de registrar vendas.");
    if(cashRegisterStale(current.cashRegister,now))throw Error("Feche o caixa do dia anterior antes de registrar vendas de hoje.");
    if(sale.cashRegisterOpenedAt!==current.cashRegister.openedAt)throw Error("A venda nao pertence ao caixa aberto.");
    if(sale.date!==businessDay(now))throw Error("A data da venda deve corresponder ao dia de operacao do caixa.");
    require("./pdv-customers").identifySale(current,sale);
    require("../pdv-payments").validateSale(sale);
    require("../combo-sales").validateSale(sale.items||[],current.products||[]);
  }
}
module.exports={businessDay,cashRegisterStale,cashBalance,openRegister,closeRegister,assertPdvCashWrite};

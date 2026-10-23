const clone = value => JSON.parse(JSON.stringify(value));
const round = value => Math.round(Number(value || 0) * 100) / 100;
function saleDetail(sale) {
  const fields = ['id','date','soldAt','createdAt','terminalId','terminalName','seller','customer','status','emissionMode','cashRegisterOpenedAt','total','discount','addition','exchangeCredit','payment','change','items','payments','returns'];
  return clone(Object.fromEntries(fields.filter(key=>sale[key]!==undefined).map(key=>[key,sale[key]])));
}
function snapshot(state, register) {
  return {version:1,tenantCode:state.settings?.tenantCode||'',unit:state.settings?.tradeName||state.settings?.company||'',document:state.settings?.document||'',sales:(state.sales||[]).filter(s=>s.type==='PDV'&&s.cashRegisterOpenedAt===register.openedAt).map(saleDetail)};
}
function buildReport(units, {from='',to=''}={}) {
  const inRange = date => (!from||String(date).slice(0,10)>=from)&&(!to||String(date).slice(0,10)<=to);
  const sales=[],closures=[],products=new Map(),payments=new Map(),days=new Map(),unitTotals=new Map();
  for(const {code,name,state} of units){
    for(const product of state.products||[])if(product.active!==false)products.set(code+':'+product.id,{tenantCode:code,unit:name,id:product.id,description:product.description,qty:0,gross:0});
    for(const closure of state.cashClosures||[]){if(!inRange(closure.businessDate||closure.closedAt))continue;const detail=closure.report||snapshot(state,closure);closures.push({...clone(closure),tenantCode:code,unit:detail.unit||name,report:detail,reconstructed:!closure.report});}
    for(const sale of state.sales||[]){
      if(!inRange(sale.date))continue;
      const returned=round((sale.returns||[]).reduce((sum,r)=>sum+Number(r.value||0),0));
      const included=['Fechado','Parcialmente devolvido','Devolvido','Trocado'].includes(sale.status);
      const net=included?round(Math.max(0,Number(sale.total||0)-returned)):0;
      sales.push({...saleDetail(sale),tenantCode:code,unit:name,returned,net});
      if(!included)continue;
      const u=unitTotals.get(code)||{tenantCode:code,unit:name,count:0,total:0};u.count++;u.total=round(u.total+net);unitTotals.set(code,u);
      const day=String(sale.date).slice(0,10);days.set(day,round((days.get(day)||0)+net));
      for(const payment of sale.payments||[])payments.set(payment.method,round((payments.get(payment.method)||0)+Number(payment.value||0)-(payment.method==='Dinheiro'?Number(sale.change||0):0)));
      (sale.items||[]).forEach((item,index)=>{
        const key=code+':'+item.id,p=products.get(key)||{tenantCode:code,unit:name,id:item.id,description:item.description,qty:0,gross:0};
        const returnedQty=(sale.returns||[]).flatMap(r=>r.items||[]).filter(r=>r.referencedItem?Number(r.referencedItem)===index+1:String(r.id)===String(item.id)).reduce((sum,r)=>sum+Number(r.qty||0),0);
        const qty=Math.max(0,Number(item.qty||0)-returnedQty);p.qty=round(p.qty+qty);p.gross=round(p.gross+qty*Number(item.price||0));products.set(key,p);
      });
    }
  }
  const total=round(sales.reduce((sum,s)=>sum+s.net,0)),count=sales.filter(s=>['Fechado','Parcialmente devolvido'].includes(s.status)).length;
  const ranked=[...products.values()].sort((a,b)=>b.qty-a.qty||a.description.localeCompare(b.description));
  return {generatedAt:new Date().toISOString(),from,to,units:units.map(u=>({code:u.code,name:u.name})),sales:sales.sort((a,b)=>String(b.soldAt||b.date).localeCompare(String(a.soldAt||a.date))||Number(b.id)-Number(a.id)),closures:closures.sort((a,b)=>String(b.closedAt).localeCompare(String(a.closedAt))),totals:{total,count,average:count?round(total/count):0,cancelled:sales.filter(s=>s.status==='Cancelado').length,returns:round(sales.reduce((sum,s)=>sum+(s.returned||0),0))},best:ranked.filter(p=>p.qty>0).slice(0,20),worst:[...ranked].sort((a,b)=>a.qty-b.qty||a.description.localeCompare(b.description)).slice(0,20),payments:[...payments].map(([method,value])=>({method,value})),days:[...days].sort().map(([date,total])=>({date,total})),unitTotals:[...unitTotals.values()]};
}
module.exports={snapshot,buildReport,saleDetail};

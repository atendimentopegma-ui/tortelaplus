const doc=v=>String(v||'').replace(/\D/g,''),round=v=>Math.round(Number(v)*100)/100;
function balance(states,document,unit,config){
 let earned=0,spent=0;const movements=[];
 for(const [code,state] of Object.entries(states)){if(config.scope!=='network'&&code!==unit)continue;
  for(const row of state.loyaltyLedger||[]){if(row.document!==doc(document))continue;
   const sale=(state.sales||[]).find(s=>String(s.id)===String(row.saleId)),cancelled=!sale||['Cancelado','Devolvido','Trocado'].includes(sale.status);
   const returned=(sale?.returns||[]).reduce((sum,r)=>sum+Number(r.value||0),0);
   const points=cancelled?0:Math.floor(Math.max(0,row.base-returned)),used=cancelled?0:row.spent;
   earned+=points;spent+=used;movements.push({unit:code,saleId:row.saleId,date:row.date,earned:points,spent:used,cancelled});
  }
 }return {earned,spent,balance:earned-spent,movements};
}
function preview(states,unit,config,body){
 if(!config?.enabled||(config.scope==='unit'&&config.unitCode&&config.unitCode!==unit))throw Error('Programa de fidelidade desativado.');
 if(!/^\d{11}$/.test(doc(body.document)))throw Error('Identifique o cliente pelo CPF.');
 const account=balance(states,body.document,unit,config),points=Number(body.points||0),base=round(body.base);
 if(!Number.isInteger(points)||points<0||points%100!==0)throw Error('Resgate em blocos de 100 pontos.');
 if(points>Math.max(0,account.balance))throw Error('Saldo de pontos insuficiente.');
 const discount=round(points/100*2);if(!Number.isFinite(base)||base<0||discount>base)throw Error('O desconto de pontos não pode superar o saldo dos produtos.');
 return {...account,points,discount,scope:config.scope};
}
function apply(current,incoming,states,unit,config){
 const ledger=structuredClone(current.loyaltyLedger||[]),known=new Set((current.sales||[]).map(s=>String(s.id)));
 for(const old of current.loyaltyLedger||[]){const before=(current.sales||[]).find(s=>String(s.id)===String(old.saleId)),after=(incoming.sales||[]).find(s=>String(s.id)===String(old.saleId));
  if(before&&after)for(const key of ['type','date','total','discount','customerDocument','clubCpf','loyaltyPoints','loyaltyDiscount'])if(String(before[key]??'')!==String(after[key]??''))throw Error('A venda com pontos já registrada não pode ter valores ou cliente alterados.');
 }
 for(const sale of incoming.sales||[]){if(known.has(String(sale.id))||sale.type!=='PDV')continue;
  const points=Number(sale.loyaltyPoints||0),discount=Number(sale.loyaltyDiscount||0),document=doc(sale.customerDocument||sale.clubCpf),subtotal=round((sale.items||[]).reduce((sum,i)=>sum+Number(i.qty)*Number(i.price),0));
  if(!Number.isInteger(points)||points<0||!Number.isFinite(discount)||discount<0)throw Error('Pontos ou desconto de fidelidade inválidos.');
  if(points||discount){const result=preview({...states,[unit]:{...incoming,loyaltyLedger:ledger}},unit,config,{document,points,base:subtotal-Number(sale.manualDiscount||0)-Number(sale.couponDiscount||0)});
   if(Math.abs(result.discount-discount)>.009||Math.abs(Number(sale.discount)-Number(sale.manualDiscount||0)-Number(sale.couponDiscount||0)-discount)>.009)throw Error('Desconto de fidelidade divergente.');
   const expected=round(Math.max(0,subtotal-Number(sale.discount||0)+Number(sale.addition||0)-Number(sale.exchangeCredit||0)));if(Math.abs(expected-Number(sale.total))>.009)throw Error('Total da venda com pontos divergente.');
  }
  if(!config?.enabled||(config.scope==='unit'&&config.unitCode&&config.unitCode!==unit)||!/^\d{11}$/.test(document))continue;
  if(!['Fechado','Parcialmente devolvido'].includes(sale.status)) {if(points)throw Error('Pontos exigem venda concluída.');continue;}
  const base=round(Math.max(0,subtotal-Number(sale.discount||0)-Number(sale.exchangeCredit||0)));
  if(!Number.isFinite(base))throw Error('Valor inválido para fidelidade.');
  ledger.push({saleId:sale.id,document,base,spent:points,date:new Date().toISOString()});
 }return ledger;
}
module.exports={balance,preview,apply};

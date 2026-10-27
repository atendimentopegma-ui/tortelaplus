const {businessDay}=require('./cash-register');
const round=n=>Math.round(Number(n)*100)/100,doc=v=>String(v||'').replace(/[^a-z0-9]/gi,'').toUpperCase(),code=v=>String(v||'').trim().toUpperCase();
function create(body,existing=[],now=new Date()){
 const result={code:code(body.code),type:body.type,value:Number(body.value),validFrom:String(body.validFrom||businessDay(now)),validTo:String(body.validTo||''),maxUses:Number(body.maxUses),perCustomerLimit:Number(body.perCustomerLimit||1),audience:body.audience,documents:[...new Set((body.documents||[]).map(doc).filter(Boolean))],active:true,createdAt:now.toISOString()};
 if(!/^[A-Z0-9_-]{4,30}$/.test(result.code)||existing.some(c=>c.code===result.code))throw Error('Código inválido ou já cadastrado. Use 4 a 30 letras, números, hífen ou sublinhado.');
 if(!['percent','fixed'].includes(result.type)||!Number.isFinite(result.value)||result.value<=0||(result.type==='percent'&&result.value>100))throw Error('Informe um percentual de até 100% ou um valor fixo positivo.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(result.validFrom)||!/^\d{4}-\d{2}-\d{2}$/.test(result.validTo)||result.validTo<result.validFrom||!Number.isFinite(Date.parse(result.validTo))||new Date(result.validTo).toISOString().slice(0,10)!==result.validTo||!Number.isFinite(Date.parse(result.validFrom))||new Date(result.validFrom).toISOString().slice(0,10)!==result.validFrom)throw Error('Confira as datas de validade do cupom.');
 if(!Number.isInteger(result.maxUses)||result.maxUses<1||!Number.isInteger(result.perCustomerLimit)||result.perCustomerLimit<1)throw Error('Informe limites de uso inteiros maiores que zero.');
 if(!['all','selected'].includes(result.audience)||result.audience==='selected'&&(!result.documents.length||result.documents.some(d=>![11,14].includes(d.length))))throw Error('Selecione ao menos um cliente com CPF/CNPJ para este cupom.');
 return result;
}
function preview(state,body,now=new Date(),ledger=state.couponRedemptions||[]){
 const c=(state.coupons||[]).find(c=>c.code===code(body.code)),date=businessDay(now),customer=doc(body.customerDocument),base=round(body.base);
 if(!c||!c.active)throw Error('Cupom não encontrado ou desativado.');
 if(date<c.validFrom||date>c.validTo)throw Error('Cupom fora do prazo de validade.');
 if(!customer||c.audience==='selected'&&!c.documents.includes(customer))throw Error('Cupom não autorizado para este cliente.');
 const uses=ledger.filter(r=>r.code===c.code);if(uses.length>=c.maxUses)throw Error('Limite de usos do cupom atingido.');
 if(uses.filter(r=>r.customerDocument===customer).length>=c.perCustomerLimit)throw Error('Este cliente já atingiu o limite de uso do cupom.');
 if(!Number.isFinite(base)||base<=0)throw Error('O cupom exige saldo de produtos maior que zero.');
 return {code:c.code,discount:Math.min(base,round(c.type==='percent'?base*c.value/100:c.value)),type:c.type,value:c.value};
}
function applySales(current,incoming,now=new Date()){
 const ledger=structuredClone(current.couponRedemptions||[]),existing=new Set((current.sales||[]).map(s=>String(s.id)));
 for(const sale of incoming.sales||[]){if(existing.has(String(sale.id))||sale.type!=='PDV')continue;
  if(!sale.couponCode){if(Number(sale.couponDiscount||0)!==0)throw Error('Desconto de cupom sem código.');continue;}
  if(!['Fechado','Parcialmente devolvido'].includes(sale.status))throw Error('Cupom só pode ser utilizado em venda concluída.');
  const subtotal=round((sale.items||[]).reduce((sum,i)=>sum+Number(i.qty)*Number(i.price),0)),manual=Number(sale.manualDiscount||0);
  if(!Number.isFinite(manual)||manual<0||manual>subtotal)throw Error('Desconto manual inválido para aplicar o cupom.');
  const result=preview(current,{code:sale.couponCode,customerDocument:sale.customerDocument||sale.clubCpf,base:subtotal-manual},now,ledger);
  if(Math.abs(result.discount-Number(sale.couponDiscount||0))>.009||Math.abs(manual+result.discount-Number(sale.discount||0))>.009)throw Error('Desconto do cupom divergente. Aplique o cupom novamente.');
  const expected=round(Math.max(0,subtotal-manual-result.discount+Number(sale.addition||0)-Number(sale.exchangeCredit||0)));
  if(Math.abs(expected-Number(sale.total))>.009)throw Error('Total da venda divergente do cupom.');
  ledger.push({code:result.code,saleId:sale.id,customerDocument:doc(sale.customerDocument||sale.clubCpf),discount:result.discount,usedAt:now.toISOString()});
 }return ledger;
}
module.exports={create,preview,applySales,code};

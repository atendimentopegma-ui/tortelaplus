const {requireNumber,round,tag}=require('./advanced-fiscal');
function calculate(row,rule,item){
 const c=rule.ipiReturn||{};if(!c.enabled)return {value:0,xml:''};
 if(row.model!=='NF-e'||Number(row.purpose)!==4)throw Error('IPI devolvido exige NF-e de devolucao');
 if(!/^\d{44}$/.test(String(item.referencedKey||row.referencedKey||''))||!Number.isInteger(Number(item.referencedItem))||Number(item.referencedItem)<1)throw Error('IPI devolvido exige chave e item da nota original');
 if(rule.ipi?.enabled||Number(rule.ipiRate||0)>0)throw Error('IPI devolvido nao pode ser destacado tambem como IPI proprio');
 const originalQty=requireNumber(c.originalQuantity,'Quantidade original para IPI',{min:Number.EPSILON}),originalIpi=requireNumber(c.originalIpiValue,'IPI total do item original'),qty=requireNumber(item.qty,'Quantidade devolvida',{min:Number.EPSILON});
 if(qty>originalQty)throw Error('Quantidade devolvida supera quantidade original');
 if(!['included','added'].includes(c.priceMode))throw Error('Informe se o preco da devolucao ja inclui o IPI original');
 const percent=Number((qty/originalQty*100).toFixed(2)),value=round(originalIpi*percent/100);
 return {value,percent,xml:'<impostoDevol>'+tag('pDevol',percent)+'<IPI>'+tag('vIPIDevol',value)+'</IPI></impostoDevol>'};
}
module.exports={calculate};

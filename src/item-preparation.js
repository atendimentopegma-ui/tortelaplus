(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ItemPreparation=api;})(typeof window==='object'?window:globalThis,()=>{
 const clean=value=>String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim();
 const options=value=>(Array.isArray(value)?value:String(value||'').split(',')).map(clean).filter(Boolean);
 function lines(item={}){
  const result=[];
  if(clean(item.size))result.push('Tamanho: '+clean(item.size));
  if(clean(item.coverage))result.push('Calda / cobertura: '+clean(item.coverage));
  const extras=options(item.extras);if(extras.length)result.push('Acompanhamentos: '+extras.join(', '));
  if(clean(item.note))result.push('Obs.: '+clean(item.note));
  return result;
 }
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isTortela=item=>/^tortela\b/i.test(clean(item.description));
 const role=item=>/^cobertura\s*-/i.test(clean(item.description))?'Calda / cobertura':/(?:-\s*TOPPING\b|^SEM TOPPING$)/i.test(clean(item.description))?'Acompanhamento':'';
 function attach(items,item,parentId){
  for(const parent of items.filter(isTortela))parent.lineId ||= 'tortela-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  if(isTortela(item))item.lineId ||= 'tortela-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  const parent=role(item)?(parentId?items.find(row=>row.lineId===parentId&&isTortela(row)):items.filter(isTortela).at(-1)):null;
  if(parent){item.parentLineId=parent.lineId;item.preparationRole=role(item);let index=items.indexOf(parent)+1;while(items[index]?.parentLineId===parent.lineId)index++;items.splice(index,0,item);}else items.push(item);
  return item;
 }
 function choices(product,products=[]){
  const candidates=products.filter(row=>row.active!==false&&(!product.tenantCode||row.tenantCode===product.tenantCode));
  return {coverage:options(product.coverageOptions).length?options(product.coverageOptions):isTortela(product)?candidates.filter(row=>role(row)==='Calda / cobertura').map(row=>row.description):[],extras:options(product.toppingOptions||product.additionalOptions||product.extrasOptions).length?options(product.toppingOptions||product.additionalOptions||product.extrasOptions):isTortela(product)?candidates.filter(row=>role(row)==='Acompanhamento').map(row=>row.description):[]};
 }
 function split(product,preparation,qty,products=[]){
  const components=[],match=(name,kind)=>isTortela(product)&&products.find(row=>row.active!==false&&row.description===name&&role(row)===kind&&(!product.tenantCode||row.tenantCode===product.tenantCode));
  const coverage=match(preparation.coverage,'Calda / cobertura');if(coverage)components.push({...coverage,qty});
  const extras=options(preparation.extras).filter(name=>{const extra=match(name,'Acompanhamento');if(extra)components.push({...extra,qty});return !extra;});
  return {preparation:{...preparation,coverage:coverage?'':preparation.coverage||'',extras},components};
 }
 return {lines,options,isTortela,role,attach,choices,split,text:item=>lines(item).join('; '),html:item=>lines(item).map(line=>'<small style="display:block;padding-left:8px">'+escape(line)+'</small>').join(''),same:(a,b)=>JSON.stringify(lines(a))===JSON.stringify(lines(b))};
});

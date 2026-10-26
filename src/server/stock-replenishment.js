const ORIGIN = 'Reposição automática por estoque mínimo';
function eligible(product) {
  return product.active !== false && product.movesStock !== false && product.type !== 'Servico' && Number(product.minStock || 0) > 0 && Number(product.stock || 0) < Number(product.minStock || 0);
}
function replenish(state, now = new Date()) {
  const orders = state.automaticOrders ||= [];
  const pending = order => ['Enviado','Pendente','Aberto','Em separacao','Em separação'].includes(order.status);
  const own = orders.find(order => order.origin === ORIGIN && pending(order));
  const items = (state.products || []).filter(eligible).map(product => {
    const incoming = orders.filter(order => order !== own && pending(order)).reduce((sum, order) => sum + (order.items || []).filter(item => Number(item.productId) === Number(product.id)).reduce((qty,item)=>qty+Number(item.suggestedQty || item.qty || 0),0),0);
    return {productId:product.id, description:product.description, currentStock:Number(product.stock||0), minStock:Number(product.minStock), suggestedQty:Math.max(0,Number(product.minStock)-Number(product.stock||0)-incoming), unit:product.unit || 'UN', cost:Number(product.cost||0)};
  }).filter(item=>item.suggestedQty>0);
  if (!items.length && !own) return;
  const order = own || {id:Math.max(0,...orders.map(order=>Number(order.id)||0))+1,date:now.toISOString().slice(0,10),createdAt:now.toISOString(),origin:ORIGIN,requestedBy:'Sistema automático'};
  Object.assign(order,{status:items.length?'Enviado':'Cancelado',items,totalItems:items.length,estimatedCost:items.reduce((sum,item)=>sum+item.suggestedQty*item.cost,0)});
  if (!own) orders.unshift(order);
}
module.exports={eligible,replenish,ORIGIN};

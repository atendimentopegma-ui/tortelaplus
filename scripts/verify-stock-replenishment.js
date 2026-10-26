const assert=require('assert'),{replenish}=require('../src/server/stock-replenishment');
const s={products:[{id:1,active:true,minStock:10,stock:3,cost:2},{id:2,active:false,minStock:10,stock:0},{id:3,minStock:0,stock:-2},{id:4,movesStock:false,minStock:5,stock:0},{id:5,minStock:5,stock:5}],automaticOrders:[]};
replenish(s);assert.equal(s.automaticOrders.length,1);assert.equal(s.automaticOrders[0].items.length,1);assert.equal(s.automaticOrders[0].items[0].suggestedQty,7);replenish(s);assert.equal(s.automaticOrders.length,1);
s.products[0].stock=-2;replenish(s);assert.equal(s.automaticOrders[0].items[0].suggestedQty,12);
s.products[0].active=false;replenish(s);assert.equal(s.automaticOrders[0].status,'Cancelado');
const other={products:[{id:1,minStock:10,stock:3}],automaticOrders:[{id:1,origin:'Estoque minimo semanal',status:'Enviado',items:[{productId:1,suggestedQty:5}]}]};replenish(other);assert.equal(other.automaticOrders[0].items[0].suggestedQty,2);assert.equal(other.automaticOrders[1].items[0].suggestedQty,5);replenish(other);assert.equal(other.automaticOrders.length,2);other.products[0].stock=10;replenish(other);assert.equal(other.automaticOrders[0].status,'Cancelado');
console.log('OK reposição: ativos, mínimo, negativos, sem duplicação, pendências e inativação');

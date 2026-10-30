const assert = require('node:assert/strict');
const {analyze,dateRange,stockInfo}=require('../src/franchise-modern');
assert.deepEqual(dateRange('30','2026-10-30'),{from:'2026-10-01',to:'2026-10-30'});
assert.deepEqual(dateRange('7','2026-01-03'),{from:'2025-12-28',to:'2026-01-03'});
const state={products:[{id:1,description:'Tortela'},{id:2,description:'Agua'}],sales:[
 {date:'2026-10-30',status:'Fechado',total:30,items:[{id:1,qty:3,price:10}],returns:[{value:10,items:[{referencedItem:1,qty:1}]}]},
 {date:'2026-10-30',status:'Cancelado',total:100,items:[{id:2,qty:10,price:10}]},
 {date:'2026-09-30',status:'Fechado',total:100,items:[{id:2,qty:10,price:10}]}]};
const result=analyze(state,'2026-10-01','2026-10-30');
assert.equal(result.count,1);assert.equal(result.total,20);assert.equal(result.best[0].qty,2);assert.equal(result.worst[0].id,2);assert.equal(result.days[0].total,20);
assert.deepEqual(stockInfo({}, {id:1,stock:0}),{last:'',days:null});
assert.equal(stockInfo({stockMovements:[{productId:1,date:'2026-10-01',qty:10,balance:10},{productId:1,date:'2026-10-02',qty:-10,balance:0}]},{id:1,stock:0}).last,'2026-10-01');
console.log('OK: períodos, vendas canceladas, devoluções, ranking e estoque sem histórico.');

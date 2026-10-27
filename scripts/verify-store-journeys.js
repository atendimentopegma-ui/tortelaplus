const assert=require('node:assert/strict');
const journeys=require('../src/server/store-journeys');
const customer={name:'Teste isolado',document:'52998224725',phone:'11999999999',birthDate:'1990-01-01',cep:'01001000',address:'Praça da Sé',number:'10',district:'Sé',city:'São Paulo',uf:'SP',consent:true};
assert(journeys.validCpf(customer.document));assert(!journeys.validCpf('11111111111'));assert(!journeys.validCpf('52998224726'));
assert.throws(()=>journeys.create({...customer,consent:false}));assert.throws(()=>journeys.create({...customer,birthDate:'2025-02-31'}));
const {lead,token}=journeys.create(customer);assert.equal(journeys.authorize([lead],lead.id,token),lead);assert.throws(()=>journeys.authorize([lead],lead.id,'wrong'));assert.throws(()=>journeys.authorize([{...lead,createdAt:'2020-01-01'}],lead.id,token));
assert(!Object.hasOwn(journeys.safe(lead),'accessHash'));assert.equal(journeys.describe(lead),'Cadastro recebido — verificar entrega');assert.match(journeys.describe({...lead,updatedAt:new Date(Date.now()-31*60000).toISOString()}),/compra não concluída/);assert.match(journeys.describe({...lead,phase:'outside'}),/fora da área/);assert.equal(journeys.describe({...lead,phase:'ordered'}),'Pedido enviado');
journeys.checkAddress(lead,{cep:customer.cep,customer});assert.throws(()=>journeys.checkAddress(lead,{cep:customer.cep,customer:{...customer,number:'99'}}));assert(journeys.allow('fixture',1,10));assert(!journeys.allow('fixture',1,11));assert(journeys.allow('fixture',1,1000000));
console.log('OK CPF válido, cadastro completo, consentimento, token privado e expiração, estados de abandono e entrega, endereço e limitação de consultas.');

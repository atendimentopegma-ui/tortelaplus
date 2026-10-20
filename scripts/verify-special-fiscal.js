const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {baseState,row}=require('./fiscal-test-fixture');
const fiscal=require('../src/server/fiscal-documents'),event=require('../src/server/rtc-credit-event');
let passed=0,xmls=0;const out=process.env.RTC_XML_OUTPUT;
function save(name,xml){if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name+'.xml'),xml);}xmls++;return xml;}
function test(name,fn){fn();passed++;console.log('OK '+name);}
function fixture(code){const state=structuredClone(baseState);Object.assign(state.settings,{regime:'Lucro Real',crt:'3'});state.people[0].document='11222333000181';const types=require('../src/server/rtc-note-values').purposes,[purpose,type]=types[code];const doc={...row('NF-e'),purpose,debitType:purpose===6?type:undefined,creditType:purpose===5?type:undefined,customerDocument:state.people[0].document,total:0,nature:'Ajuste escritural IBS/CBS',items:[{id:'RTC',description:'Registro escritural',qty:1,price:0,ncm:'00',cfop:purpose===5?'1949':'5949',ibsCbsCst:code.slice(0,3),ibsClass:code,rtcAdjustment:{legalBasis:'Cenario sintetico',ibs:['800','811'].includes(code.slice(0,3))?12.34:0,cbs:['800','811'].includes(code.slice(0,3))?45.67:0,ibsReversal:code==='410030'?5:0,cbsReversal:code==='410030'?6:0,period:'2026-09',lossReason:'Perda sintetica',zfmBalance:code==='810001'?1000:0,zfmType:3,suframa:'12345678'}}]};if(code==='810001'){Object.assign(state.settings,{uf:'AM',city:'Manaus',cityCode:'1302603',cep:'69005000'});doc.customerDocument=state.settings.document;doc.date='2029-01-05';doc.items[0].rtcAdjustment.period='2029-01';}if(code==='620007')doc.referencedKey='35261012345678000195550010000001011000000010';return {state,doc};}
test('Transferencias e ajustes de competencia: tipos oficiais e sem tributos legados',()=>{
 for(const code of ['800001','800002','811001','811002','811003']){const {state,doc}=fixture(code),before=JSON.stringify(state),xml=save('note-'+code,fiscal.generateNfeXml(state,doc));assert.equal(JSON.stringify(state),before);assert.match(xml,new RegExp('<cClassTrib>'+code));assert.doesNotMatch(xml,/<ICMS>|<PIS>|<COFINS>|<IPI>/);assert.match(xml,/<tPag>90/);assert.match(xml,/<vNF>0.00/);assert.equal(fiscal.fiscalTaxSummary(state,doc).transferredIbs,12.34);doc.debitType='99';assert.throws(()=>fiscal.generateNfeXml(state,doc),/Finalidade\/tipo/);}
});
test('Estorno de credito e perda monofasica sem cobrar novamente imposto',()=>{
 for(const code of ['410030','620007']){const {state,doc}=fixture(code),xml=save('note-'+code,fiscal.generateNfeXml(state,doc));if(code==='410030'){assert.match(xml,/<vIBSEstCred>5.00/);assert.equal(fiscal.fiscalTaxSummary(state,doc).ibsCreditReversal,5);}else assert.match(xml,/<vTotIBSMonoItem>0.00/);}
});
test('ZFM aplica percentuais legais ao saldo e bloqueia data/regiao/referencia',()=>{
 const {state,doc}=fixture('810001');for(const [type,expected]of [[1,550],[2,750],[3,902.5],[4,1000]]){doc.items[0].rtcAdjustment.zfmType=type;const xml=save('note-zfm-'+type,fiscal.generateNfeXml(state,doc));assert.match(xml,new RegExp('<vCredPresIBSZFM>'+expected.toFixed(2)));assert.equal(fiscal.fiscalTaxSummary(state,doc).zfmCredit,expected);}
 doc.date='2028-12-31';assert.throws(()=>fiscal.generateNfeXml(state,doc),/2029/);doc.date='2029-01-05';state.settings.uf='SP';assert.throws(()=>fiscal.generateNfeXml(state,doc),/AM/);state.settings.uf='AM';doc.referencedKey='1'.repeat(44);assert.throws(()=>fiscal.generateNfeXml(state,doc),/nao permite NF referenciada/);
});
test('Nota escritural não cria cobrança, nem aceita valor comercial, competência futura ou CPF',()=>{
 const {state,doc}=fixture('811001');doc.total=1;assert.throws(()=>fiscal.generateNfeXml(state,doc),/nao recebe pagamentos/);doc.total=0;doc.items[0].rtcAdjustment.period='2030-01';assert.throws(()=>fiscal.generateNfeXml(state,doc),/Competencia/);doc.customerDocument='11144477735';assert.throws(()=>fiscal.generateNfeXml(state,doc),/CNPJ/);
});
test('Monofasia 620003 identifica terceiro responsável sem destacar imposto próprio',()=>{
 const state=structuredClone(baseState),doc=row('NF-e'),fuels=require('../src/server/fuel-tables-official.json'),fuel=fuels.fuels.find(f=>!f.requiresBio&&!f.requiresOrigins&&fuels.rates.some(r=>r.code===f.code&&r.fromDate<=doc.date&&(!r.toDate||r.toDate>=doc.date)));
 Object.assign(state.settings,{regime:'Lucro Real',crt:'3'});state.fiscalRules.forEach(r=>Object.assign(r,{regime:'Lucro Real',cst:'61'}));Object.assign(state.products[0],{cst:'61',ibsCbsCst:'620',ibsClass:'620003',cbsClass:'620003',fuel:{enabled:true,anpCode:fuel.code,consumptionUf:'SP',quantityFactor:1},rtcMono:{legalBasis:'Teste de retencao por terceiro',validFrom:'2026-01-01',thirdPartyDocument:'11222333000181',ibsEnabled:false,cbsEnabled:false}});
 const xml=save('mono-third-party',fiscal.generateNfeXml(state,doc));assert.match(xml,/<cClassTrib>620003/);assert.match(xml,/<vTotIBSMonoItem>0.00/);assert.doesNotMatch(xml,/<gMonoPadrao>/);
});
test('IPI devolvido proporcional, grupos e totalizadores oficiais, preço incluído/acrescido',()=>{
 for(const mode of ['included','added']){const state=structuredClone(baseState),doc=row('NF-e');doc.purpose=4;doc.operationType='return';doc.referencedKey='35261012345678000195550010000001011000000010';doc.items[0]={...doc.items[0],cfop:'1202',referencedItem:1,ipiReturn:{enabled:true,originalQuantity:4,originalIpiValue:20,priceMode:mode}};doc.total=mode==='added'?110:100;const xml=save('ipi-return-'+mode,fiscal.generateNfeXml(state,doc));assert.match(xml,/<impostoDevol><pDevol>50.00<\/pDevol><IPI><vIPIDevol>10.00/);assert.equal(fiscal.fiscalTaxSummary(state,doc).ipiReturned,10);assert.equal(fiscal.fiscalTaxSummary(state,doc).total,doc.total);doc.items[0].ipiReturn.originalQuantity=1;assert.throws(()=>fiscal.generateNfeXml(state,doc),/supera quantidade/);}
});
function original(){const state=structuredClone(baseState),doc=row('NF-e');doc.customerDocument=state.people[0].document='11222333000181';const xml=fiscal.generateNfeXml(state,doc),key=xml.match(/Id="NFe(\d{44})"/)[1];return {state,doc,xml,key,status:'Autorizada',protocol:'123456789012345'};}
function request(){return {author:2,sequence:1,at:'2027-02-01T12:00:00-03:00',legalBasis:'Cenario sintetico',credits:[{item:1,code:'01',base:100,ibsEnabled:true,cbsEnabled:true,ibsRate:1,cbsRate:2}]};}
test('Evento 211110: destinatário, grupos novos e valores calculados sem gravar dados',()=>{
 const o=original(),settings={...o.state.settings,document:'11222333000181'},r=request(),before=JSON.stringify(o.state),result=event.build(settings,o,r);assert.equal(result.summary.ibs,1);assert.equal(result.summary.cbs,2);assert.match(result.xml,/<gCredPresOper nItem="1">/);save('event-credit-detail',result.detail.replace('<detEvento ', '<detEvento xmlns="http://www.portalfiscal.inf.br/nfe" '));assert.equal(JSON.stringify(o.state),before);
});
test('Evento bloqueia autor estranho, ambiente errado, item inexistente/duplicado e base excedida',()=>{
 const o=original(),s={...o.state.settings,document:'11222333000181'},r=request();assert.throws(()=>event.build({...s,document:'99999999000199'},o,r),/Autor/);assert.throws(()=>event.build({...s,fiscalEnvironment:'Producao'},o,r),/Ambiente/);assert.throws(()=>event.build(s,o,{...r,credits:[r.credits[0],r.credits[0]]}),/duplicado/);assert.throws(()=>event.build(s,o,{...r,credits:[{...r.credits[0],item:2}]}),/inexistente/);assert.throws(()=>event.build(s,o,{...r,credits:[{...r.credits[0],base:101}]}),/supera valor/);
});
test('Evento respeita vigência por componente: CBS reciclagem 2027, IBS 2029',()=>{
 const o=original(),s={...o.state.settings,document:'11222333000181'},r=request();r.credits[0].code='03';r.credits[0].ibsEnabled=false;assert.equal(event.build(s,o,r).summary.cbs,2);r.credits[0].ibsEnabled=true;assert.throws(()=>event.build(s,o,r),/fora da vigencia/);r.at='2029-01-01T12:00:00-03:00';assert.equal(event.build(s,o,r).summary.ibs,1);r.at='2026-10-19T12:00:00-03:00';assert.throws(()=>event.build(s,o,r),/fora da vigencia/);
});
test('Evento exige autorização original e rejeita XML com entidades externas',()=>{
 const o=original(),s={...o.state.settings,document:'11222333000181'};assert.throws(()=>event.build(s,{...o,status:'Pendente'},request()),/autorizada/);assert.throws(()=>event.build(s,{...o,xml:'<!DOCTYPE a>'+o.xml},request()),/externas/);
});
test('Apropriação pelo destinatário aceita fornecedor produtor rural pessoa física',()=>{
 const o=original(),cpf='11144477735',key=o.key.slice(0,6)+'000'+cpf+o.key.slice(20),xml=o.xml.replace('Id="NFe'+o.key+'"','Id="NFe'+key+'"').replace('<emit><CNPJ>'+o.state.settings.document+'</CNPJ>','<emit><CPF>'+cpf+'</CPF>');
 const result=event.build({...o.state.settings,document:'11222333000181'},{...o,key,xml},request());assert.equal(result.summary.ibs,1);save('event-supplier-cpf-detail',result.detail.replace('<detEvento ','<detEvento xmlns="http://www.portalfiscal.inf.br/nfe" '));
});
test('Emitente corrige credito de operacao somente com classificacao e codigo compativeis',()=>{
 const state=structuredClone(baseState),doc=row('NF-e');Object.assign(state.settings,{regime:'Lucro Real',crt:'3'});state.fiscalRules.forEach(r=>Object.assign(r,{regime:'Lucro Real',cst:'00'}));Object.assign(state.products[0],{cst:'00',ibsClass:'000003',cbsClass:'000003',ibsUfRate:.05,ibsCityRate:.05,cbsFederalRate:8.8,cbsRateYear:2027,rtcCredit:{enabled:true,code:'05',legalBasis:'Teste',basePerUnit:1,ibsEnabled:false,cbsEnabled:true,cbsRate:2}});doc.date='2027-01-01';const xml=fiscal.generateNfeXml(state,doc),key=xml.match(/Id="NFe(\d{44})"/)[1],o={xml,key,status:'Autorizada',protocol:'123456789012345'},r={...request(),author:1,correction:true,credits:[{item:1,code:'05',base:100,ibsEnabled:false,cbsEnabled:true,cbsRate:3}]};
 const result=event.build(state.settings,o,r);assert.equal(result.summary.cbs,3);save('event-emitter-correction-detail',result.detail.replace('<detEvento ','<detEvento xmlns="http://www.portalfiscal.inf.br/nfe" '));assert.throws(()=>event.build(state.settings,o,{...r,correction:false}),/correcao/);assert.throws(()=>event.build(state.settings,o,{...r,credits:[{...r.credits[0],code:'06'}]}),/diverge/);
});
test('Declaração de quitação exige emitente, confirmação e comprovante',()=>{
 const o=original(),r={...request(),type:'112110',accepted:true,paymentProof:'Documento sintetico de quitacao'};
 const result=event.build(o.state.settings,o,r);save('event-112110-detail',result.detail.replace('<detEvento ','<detEvento xmlns="http://www.portalfiscal.inf.br/nfe" '));assert.match(result.xml,/<indQuitacao>1/);assert.throws(()=>event.build(o.state.settings,o,{...r,paymentProof:''}),/comprovante/);assert.throws(()=>event.build(o.state.settings,o,{...r,accepted:false}),/declaracao/);
});
test('Aceites de nota de crédito e sucessão IBS/CBS conferem documento e sucessora',()=>{
 for(const [type,code]of [['211128','810001'],['212110','800001'],['212120','800001']]){
  const {state,doc}=fixture(code),xml=fiscal.generateNfeXml(state,doc),key=xml.match(/Id="NFe(\d{44})"/)[1],source={xml,key,status:'Autorizada',protocol:'123456789012345'},settings={...state.settings,document:doc.customerDocument},r={type,accepted:true,legalBasis:'Teste sintetico',sequence:1,at:code==='810001'?'2029-02-01T12:00:00-03:00':'2027-02-01T12:00:00-03:00'};
  const result=event.build(settings,source,r);save('event-'+type+'-detail',result.detail.replace('<detEvento ','<detEvento xmlns="http://www.portalfiscal.inf.br/nfe" '));assert.match(result.xml,/<indAceitacao>1/);assert.throws(()=>event.build({...settings,document:'99999999000199'},source,r),/Autor/);
 }
});
console.log(`PASS ${passed} grupos especiais, ${xmls} XMLs sinteticos; sem transmissao externa nem alteracao de clientes.`);

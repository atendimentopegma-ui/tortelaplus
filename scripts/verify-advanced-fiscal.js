// Synthetic companies only: no production database, sale or fiscal transmission.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {baseState,row}=require('./fiscal-test-fixture');
const {generateNfeXml,validateNfeState,fiscalLedger}=require('../src/server/fiscal-documents');
const fuels=require('../src/server/fuel-tables-official.json');
const credits=require('../src/server/credit-codes-official.json');
const output=process.env.RTC_XML_OUTPUT;let passed=0,xmlCount=0;
function fixture(){const state=structuredClone(baseState),doc=row('NF-e');state.settings.regime='Lucro Real';state.settings.crt='3';state.fiscalRules.forEach(r=>{r.regime='Lucro Real';r.cst='00';});Object.assign(state.products[0],{cst:'00',icmsRate:18,pisRate:0,cofinsRate:0});return {state,doc};}
function check(name,fn){fn();passed++;console.log('OK '+name);}
function generate(name,state,doc){const before=JSON.stringify(state),d=JSON.stringify(doc);const xml=generateNfeXml(state,doc,{csc:'FicticioApenasTeste'});assert.equal(JSON.stringify(state),before);assert.equal(JSON.stringify(doc),d);if(output){fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,name+'.xml'),xml);}xmlCount++;return xml;}
function reject(state,doc,pattern){const errors=validateNfeState(state,doc).join('; ');assert.match(errors,pattern);assert.throws(()=>generateNfeXml(state,doc),pattern);}
check('IPI incluído no preço: vProd 90,91 + IPI 9,09 = 100, sem mutação',()=>{
 const {state,doc}=fixture();state.products[0].ipi={enabled:true,cst:'50',enquadramento:'999',method:'percent',rate:10,priceMode:'included'};
 const xml=generate('ipi-included',state,doc),l=fiscalLedger(state,doc)[0];assert.equal(l.ipi.value,9.09);assert.equal(l.gross,90.91);assert.equal(l.vItem,100);assert.match(xml,/<vIPI>9.09<\/vIPI>/);assert.equal(l.icms,18);
});
check('IPI acrescido só aceita total e pagamento efetivamente compatíveis',()=>{
 const {state,doc}=fixture();state.products[0].ipi={enabled:true,cst:'50',enquadramento:'999',method:'percent',rate:10,priceMode:'added'};reject(state,doc,/total informado/);doc.total=110;doc.payments=[{method:'PIX',value:110}];assert.match(generate('ipi-added',state,doc),/<vNF>110.00/);
});
check('IPI por quantidade e CST não tributado com enquadramento',()=>{
 const {state,doc}=fixture();state.products[0].ipi={enabled:true,cst:'50',enquadramento:'999',method:'unit',quantityFactor:3,unitValue:0.5,priceMode:'included'};assert.equal(fiscalLedger(state,doc)[0].ipi.value,3);generate('ipi-unit',state,doc);
 state.products[0].ipi={enabled:true,cst:'52',enquadramento:'301',priceMode:'included'};generate('ipi-exempt',state,doc);state.products[0].ipi.enquadramento='999';reject(state,doc,/Enquadramento legal incompativel/);
});
function interstate(){const f=fixture();f.state.people[0]= {...f.state.people[0],uf:'RJ',city:'Rio de Janeiro',cityCode:'3304557',cep:'20040002'};Object.assign(f.state.products[0],{cfopExternal:'6102',icmsExternalRate:12,difal:{enabled:true,destinationUf:'RJ',internalRate:18,interstateRate:12,fcpRate:2,baseMethod:'single',legalBasis:'Parâmetros sintéticos de teste',validFrom:'2026-01-01'}});return f;}
check('DIFAL base única: ICMS 12, destino 6 e FCP 2 sem aumentar vNF',()=>{
 const {state,doc}=interstate();const l=fiscalLedger(state,doc)[0];assert.equal(l.difal.destination,6);assert.equal(l.difal.fcp,2);assert.equal(l.reform.base,80);const xml=generate('difal-non-taxpayer',state,doc);assert.match(xml,/<idDest>2/);assert.match(xml,/<CFOP>6102/);assert.match(xml,/<vNF>100.00/);assert.equal((xml.match(/<vICMSUFDest>6.00/g)||[]).length,2);
});
check('DIFAL contribuinte: responsabilidade destinatário, sem ICMSUFDest',()=>{
 const {state,doc}=interstate();state.people[0].taxpayerType='Contribuinte ICMS';state.people[0].stateRegistration='123456789';doc.finalConsumer=true;state.products[0].difal.baseMethod='double';const l=fiscalLedger(state,doc)[0];assert.ok(l.difal.recipientLiability>8);assert.doesNotMatch(generate('difal-taxpayer',state,doc),/<ICMSUFDest>/);
 doc.finalConsumer=false;assert.equal(fiscalLedger(state,doc)[0].difal.recipientLiability,0);generate('interstate-resale',state,doc);
});
check('DIFAL bloqueia regra sem vigência, UF errada e base dupla não contribuinte',()=>{
 for(const patch of [{validFrom:''},{destinationUf:'MG'},{baseMethod:'double'}]){const {state,doc}=interstate();Object.assign(state.products[0].difal,patch);reject(state,doc,/DIFAL|difal/);}
});
check('Simples não destaca DIFAL EC87 não contribuinte',()=>{
 const {state,doc}=interstate();state.settings.regime='Simples Nacional';state.settings.crt='1';state.fiscalRules.forEach(r=>{r.regime='Simples Nacional';});state.products[0].difal.enabled=false;assert.doesNotMatch(generate('simple-interstate',state,doc),/<ICMSUFDest>/);state.products[0].difal.enabled=true;reject(state,doc,/Simples\/MEI/);
});
check('ICMS monofásico CST 02/15/53/61 com alíquota oficial por vigência',()=>{
 const fuel=fuels.fuels.find(f=>fuels.rates.some(r=>r.code===f.code&&r.fromDate<='2026-10-19'&&(!r.toDate||r.toDate>='2026-10-19'))&&!f.requiresBio&&!f.requiresOrigins);
 const rate=fuels.rates.find(r=>r.code===fuel.code&&r.fromDate<='2026-10-19'&&(!r.toDate||r.toDate>='2026-10-19')).rate;
 for(const cst of ['02','15','53','61']){const {state,doc}=fixture();const c={enabled:true,anpCode:fuel.code,consumptionUf:'SP',quantityFactor:1,deferralRate:50,retentionQuantityFactor:0.2,retentionAdRem:rate};Object.assign(state.products[0],{cst,fuel:c});const l=fiscalLedger(state,doc)[0];doc.total=l.vItem;const xml=generate('icms-mono-'+cst,state,doc);assert.match(xml,new RegExp('<ICMS'+cst+'>'));assert.equal(l.icms,0);assert.equal(l.fcp,0);if(cst==='61')assert.equal(l.fuel.tax,0);c.icmsAdRem=999;reject(state,doc,/tabela oficial/);}
});
function monofixture(code='620001'){const f=fixture();Object.assign(f.state.products[0],{ibsCbsCst:'620',ibsClass:code,cbsClass:code,rtcMono:{legalBasis:'Parâmetros sintéticos; não representam alíquotas legais',validFrom:'2026-01-01',quantityFactor:2,ibsEnabled:true,cbsEnabled:true,ibsMethod:'adRem',cbsMethod:'adRem',ibsRate:0.2,cbsRate:0.8,retentionQuantityFactor:0.5,ibsRetentionRate:0.2,cbsRetentionRate:0.8,ibsRetainedPerUnit:0.2,cbsRetainedPerUnit:0.8}});return f;}
check('IBS/CBS monofásicos próprios, retenção e retenção anterior separados',()=>{
 for(const code of ['620001','620002','620006']){const {state,doc}=monofixture(code);const l=fiscalLedger(state,doc)[0];const xml=generate('rtc-mono-'+code,state,doc);assert.match(xml,/<gIBSCBSMono>/);assert.match(xml,/<gMono>/);assert.equal(l.reform.vIBS,0);if(code==='620006'){assert.equal(l.mono.ibsTotal,0);assert.equal(l.mono.ibsRetained,0.4);}else assert.equal(l.mono.ibs,0.8);}
});
check('Monofasia ad valorem com IBS UF/município e extração em 2027',()=>{
 const {state,doc}=monofixture();Object.assign(state.products[0].rtcMono,{ibsMethod:'adValorem',cbsMethod:'adValorem',ibsRate:1,ibsCityRate:0.5,cbsRate:2});doc.date='2027-01-01';const l=fiscalLedger(state,doc)[0];assert.ok(l.mono.ibsTotal>0&&l.mono.cbsTotal>0);generate('rtc-mono-percent-2027',state,doc);
});
check('NFC-e de combustível: apenas CST/classificação compatíveis com varejo',()=>{
 const {state,doc}=monofixture('620006');doc.model='NFC-e';
 const fuel=fuels.fuels.find(f=>!f.requiresOrigins&&!f.requiresBio&&fuels.rates.some(r=>r.code===f.code&&r.fromDate<=doc.date&&(!r.toDate||r.toDate>=doc.date)));
 state.products[0].cst='61';state.products[0].fuel={enabled:true,anpCode:fuel.code,consumptionUf:'SP',quantityFactor:1};
 generate('nfce-fuel-retained',state,doc);state.products[0].cst='02';reject(state,doc,/incompativel com NFC-e/);
});
check('Diferença de mistura usa índice oficial vigente e rejeita classificação invertida',()=>{
 const index=fuels.bio.find(b=>b.fromDate<='2026-10-19'&&(!b.toDate||b.toDate>='2026-10-19')&&b.percent>0&&b.percent<90);
 for(const [code,difference] of [['620004',1],['620005',-1]]){
   const {state,doc}=monofixture(code);state.products[0].cst='61';state.products[0].fuel={enabled:true,anpCode:index.code,consumptionUf:'SP',quantityFactor:1,bioPercent:index.percent+difference,origins:[{imported:0,ufCode:'35',percent:100}]};
   Object.assign(state.products[0].rtcMono,{ibsBioRate:0.1,cbsBioRate:0.5});
   assert.match(generate('rtc-bio-'+code,state,doc),/<gpBioDiferenca>/);
   state.products[0].fuel.bioPercent=index.percent-difference;reject(state,doc,/diferenca de mistura/);
 }
});
function creditfixture(){const f=fixture();f.doc.date='2027-01-01';Object.assign(f.state.products[0],{ibsUfRate:.05,ibsCityRate:.05,cbsFederalRate:8.8,cbsRateYear:2027,rtcCredit:{enabled:true,code:'04',usedGoods:true,legalBasis:'Cenário sintético',basePerUnit:1,ibsEnabled:true,cbsEnabled:true,ibsRate:1,cbsRate:2}});return f;}
check('Crédito de bem usado: base, indicador, IBS dedutível e totais separados',()=>{
 const {state,doc}=creditfixture();const l=fiscalLedger(state,doc)[0],xml=generate('credit-used-2027',state,doc);assert.equal(l.credit.ibs,0.02);assert.equal(l.credit.cbs,0.04);assert.equal(l.reform.vIBS,Math.round((l.reform.vIBSUF+l.reform.vIBSMun-0.02)*100)/100);assert.match(xml,/<indBemMovelUsado>1/);assert.match(xml,/<gCredPresOper>/);assert.match(xml,/<vCredPres>0.02/);
});
check('Créditos condicionais e vigências oficiais; nenhum crédito indevido em 2026',()=>{
 const {state,doc}=creditfixture();state.products[0].rtcCredit.cbsSuspended=true;generate('credit-cbs-suspended',state,doc);state.products[0].rtcCredit.ibsSuspended=true;reject(state,doc,/condicao suspensiva/i);doc.date='2033-01-01';state.products[0].cbsRateYear=2033;generate('credit-both-suspended',state,doc);doc.date='2026-10-19';reject(state,doc,/vigencia oficial/);
});
check('Crédito por evento não é colocado indevidamente na nota; rejeita excesso IBS',()=>{
 const {state,doc}=creditfixture();state.products[0].rtcCredit.code='01';reject(state,doc,/por evento/);state.products[0].rtcCredit.code='04';state.products[0].rtcCredit.ibsRate=100;reject(state,doc,/supera IBS/);assert.equal(credits.codes.length,13);
});
check('Crédito automotivo CBS exige componente permitido e classificação oficial',()=>{
 const {state,doc}=creditfixture();Object.assign(state.products[0],{ibsClass:'000003',cbsClass:'000003'});Object.assign(state.products[0].rtcCredit,{code:'05',usedGoods:false,ibsEnabled:false,cbsEnabled:true});
 const xml=generate('credit-automotive-cbs',state,doc);assert.match(xml,/<cCredPres>05/);assert.doesNotMatch(xml,/<gIBSCredPres>/);
 state.products[0].rtcCredit.ibsEnabled=true;reject(state,doc,/veda credito IBS/);
});
check('Monofasia bloqueia parâmetros ausentes e enquadramentos não implementados',()=>{
 const {state,doc}=monofixture();state.products[0].rtcMono.legalBasis='';reject(state,doc,/fundamento/);state.products[0].rtcMono.legalBasis='Teste';state.products[0].ibsClass='620003';reject(state,doc,/dados especificos/);
});
console.log(`PASS ${passed} grupos avançados, ${xmlCount} XMLs sintéticos; sem alterações em dados de clientes.`);

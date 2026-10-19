const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {baseState,row}=require('./fiscal-test-fixture');
const {generateNfeXml,generateNfseXml,fiscalLedger,validateNfeState}=require('../src/server/fiscal-documents');
const {regimes,profile}=require('../src/fiscal-regimes');
const locations=[['SP','3552502'],['PR','4106902'],['MG','3106200'],['PE','2611606'],['BA','2927408'],['RS','4314902']];
const companies=regimes.map((regime,index)=>{
  const state=structuredClone(baseState),[uf,cityCode]=locations[index];
  Object.assign(state.settings,{company:'Empresa ficticia '+index,regime:regime.name,crt:regime.crt,uf,cityCode,nfseStandard:'Nacional',nfceQrCodeUrl:`https://fiscal-test.invalid/${uf}/qrcode`,nfceConsultaUrl:`https://fiscal-test.invalid/${uf}/consulta`});
  Object.assign(state.people[0],{uf,cityCode});
  state.products[0].cst=profile(state.settings).icmsSimple?'102':'00';
  for(const rule of state.fiscalRules)Object.assign(rule,{regime:regime.name,crt:regime.crt,uf,cst:state.products[0].cst});
  return state;
});
const snapshots=companies.map(s=>JSON.stringify(s));
let scenarios=0;
function save(name,xml){if(process.env.RTC_XML_OUTPUT){fs.mkdirSync(process.env.RTC_XML_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.RTC_XML_OUTPUT,name+'.xml'),xml);}}
for(const [index,state] of companies.entries())for(const environment of ['Homologacao','Producao'])for(const year of [2026,2027])for(const model of ['NF-e','NFC-e','NFS-e']){
  const fixture=structuredClone(state);fixture.settings.fiscalEnvironment=environment;
  const document={...row(model),date:`${year}-10-19`,includeIbsCbs:false};
  if(year===2027)for(const rule of fixture.fiscalRules)Object.assign(rule,{ibsUfRate:0.05,ibsCityRate:0.05,cbsFederalRate:8.8,cbsRateYear:2027}); // Synthetic rate; not statutory guidance.
  let xml;
  if(model==='NFS-e'){
    document.service={description:'Servico ficticio de verificacao',nationalTaxCode:'010101',issRate:2,reform:{cst:'000',classTrib:'000001',operationCode:'030101'}};
    xml=generateNfseXml(fixture,document);
    const op=profile(fixture.settings).mei?2:profile(fixture.settings).federalSimple?3:1;
    assert(xml.includes(`<opSimpNac>${op}</opSimpNac>`));
    if(op===2)assert(!xml.includes('<regApTribSN>'));
  }else{
    xml=generateNfeXml(fixture,document,{csc:'TEST-CSC'});
    assert(xml.includes(`<CRT>${fixture.settings.crt}</CRT>`));
    assert(xml.includes(`<xNome>${fixture.settings.company}</xNome>`));
  }
  assert.equal(xml.includes('<IBSCBS>'),fixture.settings.crt==='3'||year>=2027);
  save(`multi-${index}-${year}-${environment}-${model}`,xml);scenarios++;
}
assert.deepEqual(companies.map(s=>JSON.stringify(s)),snapshots,'Calculo nao pode modificar dados de nenhuma empresa');
assert(profile({regime:'Lucro Real',crt:'1'}).errors.length);
assert(profile({regime:'MEI',crt:'3'}).errors.length);
assert.equal(profile({regime:'Simples Nacional',crt:'2'}).icmsSimple,false);
assert.equal(profile({regime:'Simples Nacional',crt:'2'}).federalSimple,true);

const regular=structuredClone(companies.find(s=>s.settings.regime==='Lucro Real'));
const normalDocument={...row('NF-e'),includeIbsCbs:true};
for(const [cst,extra] of [
  ['00',{icmsRate:18,fcpRate:2}],
  ['20',{icmsRate:18,baseReductionRate:25,fcpRate:2}],
  ['51',{icmsRate:18,icmsDeferralRate:30}],
  ['60',{retainedStBase:120,retainedStRate:18,retainedStValue:3.6,retainedFcpBase:120,retainedFcpRate:2,retainedFcpValue:2.4}],
  ['90',{icmsRate:18,baseReductionRate:25,fcpRate:2}]
]){
  const s=structuredClone(regular);s.products[0].cst=cst;Object.assign(s.products[0],extra);
  const xml=generateNfeXml(s,normalDocument);assert(xml.includes(`<ICMS${cst}>`));
  const line=fiscalLedger(s,normalDocument)[0];
  assert.equal(line.reform.base,Math.round((100-line.icms-line.fcp-line.pis-line.cofins)*100)/100);
  save('icms-'+cst,xml);scenarios++;
}
const sn=structuredClone(companies[0]);sn.products[0].csosn='500';Object.assign(sn.products[0],{retainedStBase:120,retainedStRate:18,retainedStValue:3.6});
save('csosn-500',generateNfeXml(sn,{...row('NF-e'),includeIbsCbs:false}));scenarios++;
assert.equal(fiscalLedger(sn,row('NF-e'))[0].rule.retainedStBase,240,'Retencao do produto deve acompanhar a quantidade');
const legacy=structuredClone(sn);delete legacy.products[0].csosn;legacy.products[0].cst='500';
assert.equal(fiscalLedger(legacy,row('NF-e'))[0].rule.csosn,'500','CSOSN do produto prevalece sobre regra generica');
delete sn.products[0].retainedStBase;
assert.throws(()=>generateNfeXml(sn,row('NF-e')),/retainedStBase/);
const mei=structuredClone(companies.find(s=>s.settings.regime==='MEI'));
const returned={...row('NF-e'),purpose:4,date:'2026-11-20',referencedKey:'3'.repeat(44),includeIbsCbs:false};
returned.items[0]={...returned.items[0],csosn:'900',cfop:'1202',referencedItem:1};
save('mei-devolucao',generateNfeXml(mei,returned));scenarios++;
assert(validateNfeState(mei,{...row('NFC-e'),items:[{...row('NFC-e').items[0],csosn:'900'}]}).some(e=>e.includes('MEI')));
const optional={id:1,model:'NFS-e',date:'2026-10-19',total:100,service:{description:'Servico ficticio',nationalTaxCode:'010101'}};
assert(!generateNfseXml(companies[0],optional).includes('<IBSCBS>'));
const nonRtc=structuredClone(companies[0]);nonRtc.settings.address='';
assert(!generateNfseXml(nonRtc,{...optional,service:{...optional.service,reform:{cst:'000',classTrib:'000001',operationCode:'030101',cbsDeferral:50}}}).includes('<IBSCBS>'),'Campos de preparacao RTC nao podem bloquear DPS do Simples quando o grupo nao e aplicavel');
assert.throws(()=>generateNfseXml(regular,optional),/CST\/cClassTrib/);
console.log(`OK - ${scenarios} XMLs, 6 regimes, CRT 1/2/3/4, 6 UFs, 2026/2027, dois ambientes; isolamento e rejeicoes; nenhum dado real alterado.`);

const tables=require('./fuel-tables-official.json');
const {fiscalDate}=require('./rtc-policy');
const {profile}=require('../fiscal-regimes');
const {num,round,tag,esc,requireNumber}=require('./advanced-fiscal');
const codes=['02','15','53','61'];
function calculate(settings,row,rule,item){
  const code=String(rule.cst),active=!profile(settings).icmsSimple&&codes.includes(code);
  const empty={active:false,xml:'',productXml:'',tax:0,quantity:0,value:0,retentionQuantity:0,retentionValue:0,retainedQuantity:0,retainedValue:0};
  if(!active&&!rule.fuel?.enabled)return empty;
  const c=rule.fuel||{},date=fiscalDate(row),fuel=tables.fuels.find(f=>f.code===String(c.anpCode));
  if(!fuel)throw Error('Codigo ANP nao consta na tabela oficial de monofasia');
  const ufs='RO AC AM RR PA AP TO MA PI CE RN PB PE AL SE BA MG ES RJ SP PR SC RS MS MT GO DF'.split(' ');
  const ufCodes='11 12 13 14 15 16 17 21 22 23 24 25 26 27 28 29 31 32 33 35 41 42 43 50 51 52 53'.split(' ');
  if(!ufs.includes(String(c.consumptionUf||'')))throw Error('UF de consumo do combustivel obrigatoria');
  const quantity=Number((Number(item.qty)*requireNumber(c.quantityFactor,'Fator da quantidade tributavel do combustivel',{min:Number.EPSILON})).toFixed(4));
  const rate=tables.rates.find(r=>r.code===fuel.code&&date>=r.fromDate&&(!r.toDate||date<=r.toDate));
  if(active&&!rate)throw Error('Aliquota ad rem ICMS sem vigencia oficial para o produto/data');
  if(c.icmsAdRem!==undefined&&c.icmsAdRem!==''&&active&&Math.abs(Number(c.icmsAdRem)-rate.rate)>0.00001)throw Error('Aliquota ICMS monofasica diverge da tabela oficial vigente');
  if(profile(settings).icmsSimple&&codes.includes(code))throw Error('ICMS monofasico por CST exige CRT 2/3');
  const origin=String(rule.origin||'0').slice(0,1),amount=active?round(quantity*rate.rate):0;
  let xml='',value=0,retentionQuantity=0,retentionValue=0,retainedQuantity=0,retainedValue=0;
  if(active){
    xml=`<ICMS${code}><orig>${origin}</orig><CST>${code}</CST>`;
    if(code==='61'){retainedQuantity=quantity;retainedValue=amount;xml+=tag('qBCMonoRet',quantity,4)+tag('adRemICMSRet',rate.rate,4)+tag('vICMSMonoRet',amount);}
    else{
      xml+=tag('qBCMono',quantity,4)+tag('adRemICMS',rate.rate,4);
      value=amount;
      if(code==='53'){const percent=requireNumber(c.deferralRate,'Diferimento ICMS monofasico',{max:100}),deferred=round(amount*percent/100);value=round(amount-deferred);xml+=tag('vICMSMonoOp',amount)+tag('pDif',percent,4)+tag('vICMSMonoDif',deferred);}
      xml+=tag('vICMSMono',value);
      if(code==='15'){
        retentionQuantity=Number((Number(item.qty)*requireNumber(c.retentionQuantityFactor,'Quantidade de retencao por unidade',{min:Number.EPSILON})).toFixed(4));
        const retainedRate=requireNumber(c.retentionAdRem,'Aliquota de retencao ICMS monofasica');
        if(Math.abs(retainedRate-rate.rate)>0.00001)throw Error('Aliquota ICMS de retencao diverge da tabela oficial');
        retentionValue=round(retentionQuantity*retainedRate);xml+=tag('qBCMonoReten',retentionQuantity,4)+tag('adRemICMSReten',retainedRate,4)+tag('vICMSMonoReten',retentionValue);
      }
    }
    xml+=`</ICMS${code}>`;
  }
  const bio=c.bioPercent;
  if(fuel.requiresBio)requireNumber(bio,'Percentual de biocombustivel',{max:100});
  const origins=c.origins||[];
  if(fuel.requiresOrigins&&(!origins.length||Math.abs(origins.reduce((n,o)=>n+Number(o.percent),0)-100)>0.0001))throw Error('Origens do combustivel devem totalizar 100%');
  for(const o of origins){if(o.imported===null||o.imported===''||![0,1].includes(Number(o.imported))||!ufCodes.includes(String(o.ufCode)))throw Error('Origem do combustivel invalida');requireNumber(o.percent,'Percentual de origem combustivel',{max:100});}
  const productXml='<comb><cProdANP>'+fuel.code+'</cProdANP><descANP>'+esc(fuel.description)+'</descANP><UFCons>'+esc(c.consumptionUf)+'</UFCons>'+(bio!==undefined&&bio!==''?tag('pBio',bio,4):'')+origins.map(o=>`<origComb><indImport>${Number(o.imported)}</indImport><cUFOrig>${o.ufCode}</cUFOrig>${tag('pOrig',o.percent,4)}</origComb>`).join('')+'</comb>';
  return {active,xml,productXml,tax:value,quantity:code==='61'?0:quantity,value,retentionQuantity,retentionValue,retainedQuantity,retainedValue,unit:fuel.unit,tributaryQuantity:quantity};
}
module.exports={calculate,codes};

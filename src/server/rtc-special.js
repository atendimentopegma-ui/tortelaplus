const tables=require('./reform-tax-tables-official.json');
const creditTable=require('./credit-codes-official.json');
const fuelTable=require('./fuel-tables-official.json');
const {fiscalDate,rtcPolicy}=require('./rtc-policy');
const {num,round,tag,requireNumber}=require('./advanced-fiscal');
const zero=()=>({ibs:0,cbs:0,ibsSuspended:0,cbsSuspended:0,deductIbs:0,xml:''});
function classification(rule){return tables.classTrib.find(c=>c.code===(rule.ibsClass||rule.cbsClass)&&c.cst===rule.ibsCbsCst);}
function credit(settings,row,rule,item){
  const c=rule.rtcCredit;if(!c?.enabled)return zero();
  const entry=creditTable.codes.find(e=>e.code===String(c.code)),date=fiscalDate(row),cl=classification(rule);
  if(!rtcPolicy(settings,row).emit)throw Error('Credito IBS/CBS exige informar o grupo tributario');
  if(!entry||!entry.models.includes(row.model))throw Error('cCredPres inexistente ou vedado para o modelo');
  if(!entry.viaInvoice)throw Error('Este cCredPres exige apropriacao por evento, e nao no XML da operacao');
  if(!cl?.allowsPresumedCredit&&!(entry.code==='04'&&c.usedGoods===true))throw Error('cClassTrib nao permite credito presumido; bens usados exigem indicador especifico');
  if(entry.code==='04'&&c.usedGoods!==true)throw Error('Credito de bem movel usado exige indicador especifico');
  const creditArticle=entry.description.match(/art\.\s*(\d+)/)?.[1],classArticle=cl?.legalSource?.match(/#art(\d+)/)?.[1];
  if(entry.code!=='04'&&(!creditArticle||creditArticle!==classArticle))throw Error('cCredPres e cClassTrib possuem fundamentos legais incompativeis');
  if(!c.legalBasis)throw Error('Fundamento do credito presumido obrigatorio');
  const base=round(Number(item.qty)*requireNumber(c.basePerUnit,'Base de credito presumido por unidade'));
  let xml='<gCredPresOper>'+tag('vBCCredPres',base)+`<cCredPres>${entry.code}</cCredPres>`,result=zero();
  for(const [tax,name]of[['ibs','IBS'],['cbs','CBS']]){
    const enabled=c[tax+'Enabled'];if(typeof enabled!=='boolean')throw Error('Informe explicitamente a utilizacao do credito '+name);
    const indicator=entry[tax+'Indicator'];
    if(indicator===0&&enabled)throw Error('cCredPres veda credito '+name);
    if(indicator===1&&!enabled)throw Error('cCredPres exige grupo de credito '+name);
    if(!enabled)continue;
    const from=entry[tax+'From'],to=entry[tax+'To'];if(!from||date<from||(to&&date>to))throw Error('Credito '+name+' fora da vigencia oficial');
    const rate=requireNumber(c[tax+'Rate'],'Percentual do credito '+name,{max:100}),value=round(base*rate/100),suspended=c[tax+'Suspended']===true;
    if(suspended&&(entry.code!=='04'||Number(date.slice(0,4))<(tax==='ibs'?2033:2027)))throw Error('Condicao suspensiva do credito '+name+' fora da vigencia permitida');
    if(entry.code==='04'&&value>round(Number(item.qty)*Number(item.price)))throw Error('Credito presumido supera valor do produto');
    result[tax+(suspended?'Suspended':'')]=value;
    xml+=`<g${name}CredPres>`+tag('pCredPres',rate,4)+tag(suspended?'vCredPresCondSus':'vCredPres',value)+`</g${name}CredPres>`;
  }
  if(!c.ibsEnabled&&!c.cbsEnabled)throw Error('Credito presumido deve informar IBS ou CBS');
  result.deductIbs=entry.deductIbs?result.ibs:0;result.xml=xml+'</gCredPresOper>';result.usedGoods=c.usedGoods===true;
  return result;
}
function mono(settings,row,rule,item,base){
  const cl=classification(rule);if(rule.ibsCbsCst!=='620')return null;
  const c=rule.rtcMono||{},date=fiscalDate(row);
  if(!c.legalBasis||!c.validFrom||date<c.validFrom||(c.validTo&&date>c.validTo))throw Error('Monofasia IBS/CBS exige fundamento e vigencia dos parametros');
  if(cl.code==='620007')throw Error('Perda monofasica exige nota de debito tipo 07');
  if(cl.code==='620003'){
    if(!/^\d{14}$/.test(String(c.thirdPartyDocument||'')))throw Error('Retencao por terceiro exige CNPJ do responsavel');
    if(c.ibsEnabled!==false||c.cbsEnabled!==false)throw Error('Retencao por terceiro nao destaca IBS/CBS monofasicos proprios');
    return {xml:'<gIBSCBSMono><vTotIBSMonoItem>0.00</vTotIBSMonoItem><vTotCBSMonoItem>0.00</vTotCBSMonoItem></gIBSCBSMono>',ibs:0,cbs:0,ibsRetention:0,cbsRetention:0,ibsRetained:0,cbsRetained:0,ibsTotal:0,cbsTotal:0};
  }
  const out={xml:'',ibs:0,cbs:0,ibsRetention:0,cbsRetention:0,ibsRetained:0,cbsRetained:0,ibsTotal:0,cbsTotal:0};let xml='<gIBSCBSMono>';
  const quantities=Number((Number(item.qty)*requireNumber(c.quantityFactor,'Conversao de quantidade monofasica',{min:Number.EPSILON})).toFixed(4));
  for(const [tax,name]of[['ibs','IBS'],['cbs','CBS']]){
    if(typeof c[tax+'Enabled']!=='boolean')throw Error('Informe a incidencia monofasica '+name);
    if(!c[tax+'Enabled'])continue;
    const method=c[tax+'Method'];if(!['adRem','adValorem'].includes(method))throw Error('Metodo monofasico '+name+' invalido');
    let group='';
    if(cl.monoStandard){
      const rate=requireNumber(c[tax+'Rate'],'Aliquota monofasica '+name,{max:method==='adValorem'?100:Infinity});
      let value;
      if(method==='adRem'){value=round(quantities*rate);group+='<gMonoPadrao>'+tag('qBCMono',quantities,4)+tag('adRem'+name,rate,4)+tag('v'+name+'Mono',value)+'</gMonoPadrao>';}
      else if(tax==='ibs'){
        const city=requireNumber(c.ibsCityRate,'Aliquota monofasica IBS municipal',{max:100}),stateValue=round(base*rate/100),cityValue=round(base*city/100);value=round(stateValue+cityValue);
        group+='<gMonoPadrao>'+tag('vBCMono',base)+tag('pAliqMonoUF',rate,4)+tag('vIBSMonoUF',stateValue)+tag('pAliqMonoMun',city,4)+tag('vIBSMonoMun',cityValue)+tag('vIBSMono',value)+'</gMonoPadrao>';
      }else{value=round(base*rate/100);group+='<gMonoPadrao>'+tag('vBCMono',base)+tag('pAliqMonoCBS',rate,4)+tag('vCBSMono',value)+'</gMonoPadrao>';}
      out[tax]=value;
    }
    if(cl.monoRetention){
      const rate=requireNumber(c[tax+'RetentionRate'],'Aliquota monofasica retencao '+name,{max:method==='adValorem'?100:Infinity}),factor=requireNumber(c.retentionQuantityFactor,'Fator de quantidade de retencao monofasica'),q=Number((Number(item.qty)*factor).toFixed(4));
      const retainedBase=method==='adRem'?0:round(base*requireNumber(c.retentionBasePercent,'Percentual da base de retencao',{max:100})/100);
      const value=round((method==='adRem'?q:retainedBase/100)*rate);out[tax+'Retention']=value;
      group+='<gMonoReten>'+(method==='adRem'?tag('qBCMonoReten',q,4)+tag('adRem'+name+'Reten',rate,4):tag('vBCMonoReten',retainedBase)+tag('pAliqMonoReten',rate,4))+tag('v'+name+'MonoReten',value)+'</gMonoReten>';
    }
    if(cl.monoPreviouslyRetained){const value=round(Number(item.qty)*requireNumber(c[tax+'RetainedPerUnit'],'Tributo monofasico anteriormente retido '+name));out[tax+'Retained']=value;group+='<gMonoRet>'+tag('v'+name+'MonoRet',value)+'</gMonoRet>';}
    if(cl.requiresBioDifference){
      const fuel=String(rule.fuel?.anpCode||''),index=fuelTable.bio.find(b=>b.code===fuel&&date>=b.fromDate&&(!b.toDate||date<=b.toDate));
      if(!index)throw Error('Indice oficial de mistura sem vigencia para o codigo ANP');
      const actual=requireNumber(rule.fuel?.bioPercent,'Mistura efetiva do biocombustivel',{max:100})/100,mandatory=index.percent/100;
      if((cl.code==='620004'&&actual<=mandatory)||(cl.code==='620005'&&actual>=mandatory))throw Error('cClassTrib incompativel com diferenca de mistura');
      const q=Number((quantities*Math.abs(actual-mandatory)/(1-mandatory)).toFixed(4));
      let amount;
      if(method==='adRem')amount=round(q*requireNumber(c[tax+'BioRate'],'Aliquota ad rem do biocombustivel '+name));
      else amount=round(q*requireNumber(c.bioReferenceValue,'Valor de referencia do biocombustivel')*requireNumber(c[tax+'BioRate'],'Aliquota percentual do biocombustivel '+name,{max:100})/100);
      group+='<gpBioDiferenca>'+tag('qBCBioComb',q,4)+tag('v'+name+'Diferenca',amount)+'</gpBioDiferenca>';
    }
    if(!group)throw Error('cClassTrib monofasico exige dados especificos da operacao');
    xml+=`<g${name}Mono${method==='adRem'?'AdRem':'AdValorem'}>${group}</g${name}Mono${method==='adRem'?'AdRem':'AdValorem'}>`;
  }
  if(!c.ibsEnabled&&!c.cbsEnabled)throw Error('Monofasia deve informar IBS ou CBS');
  out.ibsTotal=round(out.ibs+out.ibsRetention);out.cbsTotal=round(out.cbs+out.cbsRetention);
  out.xml=xml+tag('vTotIBSMonoItem',out.ibsTotal)+tag('vTotCBSMonoItem',out.cbsTotal)+'</gIBSCBSMono>';return out;
}
module.exports={credit,mono,classification};

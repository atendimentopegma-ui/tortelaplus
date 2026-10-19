const {profile}=require('../fiscal-regimes');
const num=v=>Number(v||0);
const round=v=>Math.round((v+Number.EPSILON)*100)/100;
const d=v=>num(v).toFixed(2);
const tag=(n,v)=>`<${n}>${d(v)}</${n}>`;
function calculate(settings,rule,net){
  const p=profile(settings),code=String(p.icmsSimple?rule.csosn:rule.cst);
  const taxed=p.icmsSimple?code==='900'&&num(rule.icmsRate)>0:!['40','41','50','60'].includes(code);
  const base=taxed?round(net*(1-num(rule.baseReductionRate)/100)):0;
  const operation=round(base*num(rule.icmsRate)/100);
  const deferred=code==='51'?round(operation*num(rule.icmsDeferralRate)/100):0;
  const fcp=taxed&&!p.icmsSimple?round(base*num(rule.fcpRate)/100):0;
  return {base,operation,deferred,icms:round(operation-deferred),fcp};
}
function retained(rule){
  let result=tag('vBCSTRet',rule.retainedStBase)+tag('pST',rule.retainedStRate);
  if(rule.icmsSubstituteValue!==undefined)result+=tag('vICMSSubstituto',rule.icmsSubstituteValue);
  result+=tag('vICMSSTRet',rule.retainedStValue);
  if(num(rule.retainedFcpValue)||num(rule.retainedFcpBase))result+=tag('vBCFCPSTRet',rule.retainedFcpBase)+tag('pFCPSTRet',rule.retainedFcpRate)+tag('vFCPSTRet',rule.retainedFcpValue);
  return result;
}
function xml(settings,rule,net){
  const p=profile(settings),v=calculate(settings,rule,net),code=String(p.icmsSimple?rule.csosn:rule.cst),origin=String(rule.origin||'0').slice(0,1);
  if(p.icmsSimple){
    if(code==='500')return `<ICMSSN500><orig>${origin}</orig><CSOSN>500</CSOSN>${retained(rule)}</ICMSSN500>`;
    if(code==='900')return `<ICMSSN900><orig>${origin}</orig><CSOSN>900</CSOSN>${v.base?`<modBC>3</modBC>${tag('vBC',v.base)}${num(rule.baseReductionRate)?tag('pRedBC',rule.baseReductionRate):''}${tag('pICMS',rule.icmsRate)}${tag('vICMS',v.icms)}`:''}</ICMSSN900>`;
    return null;
  }
  if(code==='60')return `<ICMS60><orig>${origin}</orig><CST>60</CST>${retained(rule)}</ICMS60>`;
  if(!['00','20','51','90'].includes(code))return null;
  let content=`<orig>${origin}</orig><CST>${code}</CST><modBC>3</modBC>`;
  if(['20','51'].includes(code)&&num(rule.baseReductionRate))content+=tag('pRedBC',rule.baseReductionRate);
  if(code==='20'&&!num(rule.baseReductionRate))content+=tag('pRedBC',0);
  content+=tag('vBC',v.base);
  if(code==='90'&&num(rule.baseReductionRate))content+=tag('pRedBC',rule.baseReductionRate);
  content+=tag('pICMS',rule.icmsRate);
  if(code==='51')content+=tag('vICMSOp',v.operation)+tag('pDif',rule.icmsDeferralRate)+tag('vICMSDif',v.deferred);
  content+=tag('vICMS',v.icms);
  if(v.fcp)content+=(code==='00'?'':tag('vBCFCP',v.base))+tag('pFCP',rule.fcpRate)+tag('vFCP',v.fcp);
  return `<ICMS${code}>${content}</ICMS${code}>`;
}
function errors(settings,rule){
  const p=profile(settings),code=String(p.icmsSimple?rule.csosn:rule.cst),result=[];
  if((p.icmsSimple&&code==='500')||(!p.icmsSimple&&code==='60')){
    for(const field of ['retainedStBase','retainedStRate','retainedStValue'])if(rule[field]===undefined||rule[field]===''||!Number.isFinite(Number(rule[field]))||Number(rule[field])<0)result.push('Informe '+field+' do documento de origem para ICMS-ST retido');
  }
  if(!['500','60'].includes(code)&&['retainedStBase','retainedStValue','retainedFcpBase','retainedFcpValue'].some(field=>num(rule[field])!==0))result.push('Valores de retencao ST exigem CST 60 ou CSOSN 500');
  for(const field of ['retainedStBase','retainedStValue','icmsSubstituteValue','retainedFcpBase','retainedFcpValue'])if(rule[field]!==undefined&&(!Number.isFinite(Number(rule[field]))||num(rule[field])<0))result.push('Valor retido invalido '+field);
  if(num(rule.retainedFcpValue)||num(rule.retainedFcpBase)){
    if(['retainedFcpBase','retainedFcpRate','retainedFcpValue'].some(field=>rule[field]===undefined||rule[field]===''))result.push('Informe base, aliquota e valor do FCP-ST retido');
    if(Math.abs(round(num(rule.retainedFcpBase)*num(rule.retainedFcpRate)/100)-num(rule.retainedFcpValue))>0.01)result.push('FCP-ST retido difere de base x aliquota');
  }
  if(code==='51'&&(rule.icmsDeferralRate===undefined||!Number.isFinite(Number(rule.icmsDeferralRate))))result.push('Percentual de diferimento do ICMS obrigatorio');
  if(num(rule.fcpRate)&&(p.icmsSimple||!['00','20','51','90'].includes(code)))result.push('FCP proprio incompativel com CST/CSOSN');
  for(const field of ['baseReductionRate','fcpRate','icmsDeferralRate','retainedStRate','retainedFcpRate'])if(rule[field]!==undefined&&(!Number.isFinite(Number(rule[field]))||num(rule[field])<0||num(rule[field])>100))result.push('Percentual invalido '+field);
  return result;
}
module.exports={calculate,xml,errors};

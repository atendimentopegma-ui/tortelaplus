const tables=require('./reform-tax-tables-official.json');
const {fiscalDate}=require('./rtc-policy');
const {round,tag,requireNumber}=require('./advanced-fiscal');
const purposes={'800001':[6,'05'],'800002':[6,'01'],'811001':[6,'02'],'811002':[6,'03'],'811003':[6,'08'],'810001':[5,'02'],'410030':[6,'07'],'620007':[6,'07']};
function calculate(settings,row,item){
 const code=String(item.ibsClass||item.cbsClass||''),cl=tables.classTrib.find(c=>c.code===code),expected=purposes[code],c=item.rtcAdjustment||{},date=fiscalDate(row);
 if(!expected||!cl||item.ibsCbsCst!==cl.cst||row.model!=='NF-e')throw Error('Classificacao de nota especial invalida');
 if(Number(row.purpose)!==expected[0]||String(expected[0]===5?row.creditType:row.debitType)!==expected[1])throw Error('Finalidade/tipo incompativel com a classificacao da nota especial');
 if(!c.legalBasis)throw Error('Fundamento da nota especial obrigatorio');
 const allowed=cl.cst==='800'||cl.cst==='811'?['ibs','cbs']:code==='810001'?['zfmBalance']:code==='410030'?['ibsReversal','cbsReversal']:[];
 if(['ibs','cbs','ibsReversal','cbsReversal','zfmBalance'].some(k=>!allowed.includes(k)&&Number(c[k]||0)!==0))throw Error('Valores informados em campos incompativeis com o tipo de nota especial');
 if(Number(item.qty)!==1||Number(item.price)!==0)throw Error('Registro escritural exige quantidade 1 e preco comercial zero; tributos sao valores totais');
 const value=key=>{const n=requireNumber(c[key],key);if(Math.abs(n-round(n))>1e-8)throw Error('Valor total '+key+' exige no maximo duas casas decimais');return round(n);};
 const period=()=>{if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(c.period||'')||c.period>date.slice(0,7))throw Error('Competencia invalida ou futura');return c.period;};
 let xml='',ibs=0,cbs=0,ibsReversal=0,cbsReversal=0,zfmCredit=0;
 if(cl.cst==='800'||cl.cst==='811'){
  ibs=value('ibs');cbs=value('cbs');if(!ibs&&!cbs)throw Error('Informe valor positivo de IBS ou CBS');
  const group=cl.cst==='800'?'gTransfCred':'gAjusteCompet';xml=`<${group}>`+(cl.cst==='811'?'<competApur>'+period()+'</competApur>':'')+tag('vIBS',ibs)+tag('vCBS',cbs)+`</${group}>`;
 }else if(code==='810001'){
  if(Number(date.slice(0,4))<2029)throw Error('Credito presumido IBS ZFM somente a partir de 2029');
  if(settings.uf!=='AM'||!/^\d{8,9}$/.test(String(c.suframa||'')))throw Error('Credito ZFM exige estabelecimento AM e inscricao SUFRAMA valida');
  if(row.referencedKey)throw Error('Credito ZFM tipo 02 nao permite NF referenciada');
  const rates={1:55,2:75,3:90.25,4:100},rate=rates[Number(c.zfmType)];if(!rate)throw Error('Tipo de credito ZFM invalido');
  const balance=value('zfmBalance');if(!balance)throw Error('Saldo devedor ZFM deve ser positivo');zfmCredit=round(balance*rate/100);
  xml='<gCredPresIBSZFM><competApur>'+period()+'</competApur><tpCredPresIBSZFM>'+Number(c.zfmType)+'</tpCredPresIBSZFM>'+tag('vCredPresIBSZFM',zfmCredit)+'</gCredPresIBSZFM>';
 }else if(code==='410030'){
  ibsReversal=value('ibsReversal');cbsReversal=value('cbsReversal');if(!ibsReversal&&!cbsReversal)throw Error('Informe credito a estornar');
  xml='<gEstornoCred>'+tag('vIBSEstCred',ibsReversal)+tag('vCBSEstCred',cbsReversal)+'</gEstornoCred>';
 }else{
  // 620007 has no own, retained or bio group in the official classification.
  xml='<gIBSCBSMono><vTotIBSMonoItem>0.00</vTotIBSMonoItem><vTotCBSMonoItem>0.00</vTotCBSMonoItem></gIBSCBSMono>';
  if(!/^\d{44}$/.test(row.referencedKey||'')||!c.lossReason)throw Error('Perda monofasica exige referencia e motivo da perda');
 }
 return {code,cst:cl.cst,xml,ibs,cbs,ibsReversal,cbsReversal,zfmCredit};
}
module.exports={calculate,purposes};

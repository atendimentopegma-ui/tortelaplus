const codes=require('./credit-codes-official.json').codes;
const {requireNumber,round,tag,esc}=require('./advanced-fiscal');
const {fiscalDate}=require('./rtc-policy');
const digits=v=>String(v||'').replace(/\D/g,'');
const pick=(s,n)=>s.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([^<]*)</'+n+'>'))?.[1]||'';
function source(xml,row){
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Declaracoes externas nao permitidas no XML');
 const text=String(xml||'').replace(/<(\/?)[A-Za-z_][\w.-]*:/g,'<$1');
 const inf=text.match(/<infNFe\b[^>]*Id="NFe(\d{44})"[^>]*>([\s\S]*?)<\/infNFe>/),key=inf?.[1],body=inf?.[2]||'';
 if(!key||key!==row.key||pick(body,'mod')!=='55')throw Error('Evento exige XML da NF-e original modelo 55 com chave correspondente');
 const protocol=text.match(/<infProt\b[^>]*>([\s\S]*?)<\/infProt>/)?.[1];
 if(protocol){if(!['100','150'].includes(pick(protocol,'cStat'))||pick(protocol,'chNFe')!==key)throw Error('Protocolo original nao comprova autorizacao');}
 else if(row.status!=='Autorizada'||!/^\d{15}(\d{2})?$/.test(String(row.protocol||'')))throw Error('NF-e original deve estar autorizada');
 const emitter=body.match(/<emit>([\s\S]*?)<\/emit>/)?.[1]||'',dest=body.match(/<dest>([\s\S]*?)<\/dest>/)?.[1]||'';
 const emitterDocument=pick(emitter,'CNPJ')||pick(emitter,'CPF');
 if(!/^\d{11}(\d{3})?$/.test(emitterDocument)||emitterDocument.padStart(14,'0')!==key.slice(6,20))throw Error('CPF/CNPJ do emitente diverge da chave original');
 const items=[...body.matchAll(/<det\s+nItem="(\d+)"[^>]*>([\s\S]*?)<\/det>/g)].map(m=>({number:Number(m[1]),value:round(Number(pick(m[2],'vProd'))-Number(pick(m[2],'vDesc'))+Number(pick(m[2],'vFrete'))+Number(pick(m[2],'vSeg'))+Number(pick(m[2],'vOutro'))+Number(pick(m[2],'vIPI'))),classTrib:pick(m[2],'cClassTrib'),existingCredit:pick(m[2],'cCredPres'),usedGoods:pick(m[2],'indBemMovelUsado')==='1'}));
 if(!items.length)throw Error('XML original sem itens');
 return {key,emitter:emitterDocument,recipient:pick(dest,'CNPJ'),environment:pick(body,'tpAmb'),purpose:Number(pick(body,'finNFe')),debitType:pick(body,'tpNFDebito'),creditType:pick(body,'tpNFCredito'),items};
}
function timestamp(at){const d=new Date(at||Date.now());if(!Number.isFinite(d.getTime()))throw Error('Data de evento invalida');return new Date(d.getTime()-10800000).toISOString().slice(0,19)+'-03:00';}
function lifecycle(settings,row,event){
 const type=String(event.type),definition=require('./rtc-event-definitions.json')[type];if(!definition)throw Error('Evento RTC invalido');
 const src=source(row.sourceXml||row.xml||'',row),author=definition.author,doc=digits(settings.document),org=String(settings.cityCode).slice(0,2),sequence=Number(event.sequence||1),value=event.accepted===true?'1':event.accepted===false?'0':'';
 if((author===1?src.emitter:src.recipient)!==doc)throw Error('Autor do evento nao corresponde a NF-e original');
 if(src.environment!==(settings.fiscalEnvironment==='Producao'?'1':'2'))throw Error('Ambiente do evento diverge da NF-e');
 if(!event.legalBasis||!Number.isInteger(sequence)||sequence<1||sequence>99||!definition.values.includes(value))throw Error('Informe fundamento, sequencia e declaracao/aceite valido');
 if(type==='112110'){
  const date=fiscalDate({issuedAt:event.at||new Date().toISOString()}),declared=(event.credits||[]).filter(c=>src.items.some(i=>i.number===Number(c.item))).map(c=>codes.find(e=>e.code===String(c.code))),eligible=declared.some(c=>c?.paymentDeclaration===1&&c.models.includes('NF-e')&&[c.ibsFrom,c.cbsFrom].some(d=>d&&date>=d));
  if(!event.paymentProof||!eligible)throw Error('Quitacao exige comprovante e item com codigo de credito sujeito a declaracao de pagamento vigente');
 }
 if(type==='211128'&&src.purpose!==5)throw Error('Aceite de debito exige nota de credito');
 if(['212110','212120'].includes(type)&&(src.purpose!==6||src.debitType!=='05'||!src.items.some(i=>i.classTrib==='800001')))throw Error('Manifestacao de sucessora exige transferencia por sucessao');
 const detail='<detEvento versao="1.00"><descEvento>'+esc(definition.description)+'</descEvento><cOrgaoAutor>'+org+'</cOrgaoAutor><tpAutor>'+author+'</tpAutor><verAplic>TortelaPlus-RTC</verAplic><'+definition.field+'>'+value+'</'+definition.field+'></detEvento>',id='ID'+type+src.key+String(sequence).padStart(2,'0');
 return {xml:'<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><idLote>1</idLote><evento versao="1.00"><infEvento Id="'+id+'"><cOrgao>'+org+'</cOrgao><tpAmb>'+src.environment+'</tpAmb><CNPJ>'+doc+'</CNPJ><chNFe>'+src.key+'</chNFe><dhEvento>'+timestamp(event.at)+'</dhEvento><tpEvento>'+type+'</tpEvento><nSeqEvento>'+sequence+'</nSeqEvento><verEvento>1.00</verEvento>'+detail+'</infEvento></evento></envEvento>',detail,summary:{ibs:0,cbs:0,items:src.items.length,declaration:value,type},sequence};
}
function build(settings,row,event){
 if(event.type&&String(event.type)!=='211110')return lifecycle(settings,row,event);
 const src=source(row.sourceXml||row.xml||'',row),document=digits(settings.document),author=Number(event.author),date=fiscalDate({issuedAt:event.at||new Date().toISOString()}),sequence=Number(event.sequence||1);
 if(![1,2].includes(author)||(author===1?src.emitter:src.recipient)!==document)throw Error('Autor do evento nao corresponde ao emitente/destinatario da NF-e');
 if(src.environment!==(settings.fiscalEnvironment==='Producao'?'1':'2'))throw Error('Ambiente do evento diverge da NF-e');
 if(!Number.isInteger(sequence)||sequence<1||sequence>99)throw Error('Sequencia do evento invalida');
 if(!event.legalBasis||!Array.isArray(event.credits)||!event.credits.length||event.credits.length>990)throw Error('Informe fundamento e itens de credito');
 const ids=new Set();let ibs=0,cbs=0;
 const groups=event.credits.map(c=>{
  const number=Number(c.item),original=src.items.find(i=>i.number===number),code=codes.find(e=>e.code===String(c.code));
  if(!Number.isInteger(number)||!original||ids.has(number))throw Error('Item original inexistente ou duplicado');ids.add(number);
  if(!code||!code.models.includes('NF-e'))throw Error('cCredPres nao permitido para NF-e');
  if(author===2&&!code.viaEvent)throw Error('Apropriacao deste credito exige documento de operacao');
  if(author===1&&(!event.correction||!code.viaInvoice))throw Error('Emitente deve indicar correcao de credito proprio permitido na operacao');
  if(author===1&&original.existingCredit&&original.existingCredit!==code.code)throw Error('Codigo do credito corrigido diverge da operacao original');
  if(author===1){
   const cl=require('./reform-tax-tables-official.json').classTrib.find(c=>c.code===original.classTrib);
   if(code.code==='04'?!original.usedGoods:!cl?.allowsPresumedCredit||cl.legalSource?.match(/#art(\d+)/)?.[1]!==code.description.match(/art\.\s*(\d+)/)?.[1])throw Error('Credito corrigido incompativel com classificacao/indicador da operacao original');
  }
  const base=requireNumber(c.base,'Base de credito',{min:0.01});if(Math.abs(base-round(base))>1e-8)throw Error('Base total do credito deve ter no maximo duas casas decimais');if(base>original.value+0.01)throw Error('Base de credito supera valor do item original');
  let body=tag('vBCCredPres',base)+'<cCredPres>'+code.code+'</cCredPres>',values={ibs:0,cbs:0};
  for(const [tax,name]of [['ibs','IBS'],['cbs','CBS']]){
   const enabled=c[tax+'Enabled'],from=code[tax+'From'],to=code[tax+'To'],valid=from&&date>=from&&(!to||date<=to),indicator=code[tax+'Indicator'];
   if(typeof enabled!=='boolean')throw Error('Informe incidencia do credito '+name);
   if(enabled&&(!valid||indicator===0))throw Error('Credito '+name+' vedado ou fora da vigencia');
   if(valid&&indicator===1&&!enabled)throw Error('Grupo de credito '+name+' obrigatorio');
   if(!enabled)continue;
   const rate=requireNumber(c[tax+'Rate'],'Percentual credito '+name,{max:100}),value=round(base*rate/100);values[tax]=value;
   body+='<g'+name+'CredPres>'+tag('pCredPres',rate,4)+tag('vCredPres',value)+'</g'+name+'CredPres>';
  }
  if(!values.ibs&&!values.cbs)throw Error('Evento exige credito positivo');ibs=round(ibs+values.ibs);cbs=round(cbs+values.cbs);
  return `<gCredPresOper nItem="${number}">${body}</gCredPresOper>`;
 }).join('');
 const org=String(settings.cityCode||'').slice(0,2);if(!/^\d{2}$/.test(org))throw Error('UF do autor obrigatoria');
 const at=timestamp(event.at),id='ID211110'+src.key+String(sequence).padStart(2,'0');
 const detail='<detEvento versao="1.00"><descEvento>Solicitação de Apropriação de crédito presumido</descEvento><cOrgaoAutor>'+org+'</cOrgaoAutor><tpAutor>'+author+'</tpAutor><verAplic>TortelaPlus-RTC</verAplic>'+groups+'</detEvento>';
 return {xml:'<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><idLote>1</idLote><evento versao="1.00"><infEvento Id="'+id+'"><cOrgao>'+org+'</cOrgao><tpAmb>'+src.environment+'</tpAmb><CNPJ>'+document+'</CNPJ><chNFe>'+src.key+'</chNFe><dhEvento>'+esc(at)+'</dhEvento><tpEvento>211110</tpEvento><nSeqEvento>'+sequence+'</nSeqEvento><verEvento>1.00</verEvento>'+detail+'</infEvento></evento></envEvento>',detail,summary:{ibs,cbs,items:ids.size},sequence};
}
module.exports={source,build};

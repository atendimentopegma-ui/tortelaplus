const {calculate}=require('./rtc-note-values');
const {profile}=require('../fiscal-regimes');
const {fiscalDate,rtcPolicy}=require('./rtc-policy');
const {esc,tag,round}=require('./advanced-fiscal');
const tables=require('./reform-tax-tables');
const digits=v=>String(v||'').replace(/\D/g,'');
const ufs={RO:'11',AC:'12',AM:'13',RR:'14',PA:'15',AP:'16',TO:'17',MA:'21',PI:'22',CE:'23',RN:'24',PB:'25',PE:'26',AL:'27',SE:'28',BA:'29',MG:'31',ES:'32',RJ:'33',SP:'35',PR:'41',SC:'42',RS:'43',MS:'50',MT:'51',GO:'52',DF:'53'};
function recipient(state,row){return (state.people||[]).find(p=>digits(p.document)===digits(row.customerDocument))||(digits(row.customerDocument)===digits(state.settings.document)?{...state.settings,name:state.settings.legalName||state.settings.company,taxpayerType:'Contribuinte ICMS'}:{});}
function errors(state,row){
 const s=state.settings||{},out=[...profile(s).errors];
 if(row.model!=='NF-e'||![5,6].includes(Number(row.purpose)))out.push('Nota especial exige NF-e e finalidade credito/debito');
 if(!rtcPolicy(s,row).emit)out.push('Nota especial exige IBS/CBS informado');
 if(!/^\d{14}$/.test(digits(s.document))||!digits(s.stateRegistration))out.push('CNPJ/IE emitente obrigatorios');
 for(const field of ['uf','cityCode','address','number','district','city','cep'])if(!s[field])out.push('Endereco emitente incompleto: '+field);
 if(!Number.isInteger(Number(row.number||row.id))||Number(row.number||row.id)<=0||!Number.isInteger(Number(row.serie||1))||Number(row.serie||1)<1)out.push('Numero/serie invalidos');
 const p=recipient(state,row);
 for(const address of [s,p])if(!ufs[address.uf]||digits(address.cityCode).length!==7||digits(address.cityCode).slice(0,2)!==ufs[address.uf]||digits(address.cep).length!==8)out.push('UF, municipio ou CEP invalidos para nota especial');
 if(row.referencedKey&&!/^\d{44}$/.test(row.referencedKey))out.push('Chave referenciada deve ter 44 digitos');
 if(String(row.nature||'').length>60||(row.items||[]).some(i=>String(i.description||'').length>120)||row.items?.map(i=>i.rtcAdjustment?.legalBasis||'').join('; ').length>5000)out.push('Descricao ou fundamento excede limite oficial');
 if(!/^\d{14}$/.test(digits(row.customerDocument)))out.push('Nota especial exige destinatario CNPJ');
 for(const field of ['uf','cityCode','address','number','district','city','cep'])if(!p[field])out.push('Endereco destinatario incompleto: '+field);
 if(Number(row.total||0)!==0||(row.payments||[]).some(p=>Number(p.value)!==0)||Number(row.discount||0)||Number(row.addition||0))out.push('Nota escritural nao recebe pagamentos, descontos ou valores comerciais');
 if(!row.nature||!row.items?.length)out.push('Natureza e itens escriturais obrigatorios');
 for(const item of row.items||[])try{
  const value=calculate(s,row,item);
  out.push(...tables.validateClassificationPair(tables.DEFAULT_REFORM_TAX_TABLES,{cst:item.ibsCbsCst,classTrib:value.code,model:row.model,date:fiscalDate(row)}));
  if(!item.description||!['00','00000000'].includes(String(item.ncm)))out.push('Item escritural exige descricao e NCM sem produto (00)');
  const cfop=String(item.cfop||'');if(!/^\d{4}$/.test(cfop)||!cfop.startsWith(Number(row.purpose)===5?(p.uf===s.uf?'1':'2'):(p.uf===s.uf?'5':'6')))out.push('CFOP incompativel com entrada/saida e UF da nota especial');
  if(value.code==='810001'&&digits(row.customerDocument)!==digits(s.document))out.push('Nota de credito ZFM deve ser emitida para o proprio estabelecimento');
  if(['ipi','ipiReturn','difal','rtcCredit'].some(k=>item[k]?.enabled)||['ipiRate','icmsRate','pisRate','cofinsRate'].some(k=>Number(item[k]||0)!==0))out.push('Nota escritural nao pode conter tributos legados ou credito de operacao');
 }catch(e){out.push(e.message);}
 return [...new Set(out)];
}
function summary(state,row){const rows=(row.items||[]).map(i=>calculate(state.settings,row,i)),sum=k=>round(rows.reduce((n,r)=>n+r[k],0));return {total:0,transferredIbs:sum('ibs'),transferredCbs:sum('cbs'),ibsCreditReversal:sum('ibsReversal'),cbsCreditReversal:sum('cbsReversal'),zfmCredit:sum('zfmCredit')};}
function generate(state,row,h){
 const checked=errors(state,row);if(checked.length)throw Error('Nota especial incompleta: '+checked.join(', '));
 const s=state.settings,key=h.accessKey(s,row),p=recipient(state,row),purpose=Number(row.purpose),date=h.isoDateTime(row.issuedAt||(row.date||fiscalDate(row))+'T12:00:00-03:00');
 const address=(p,name)=>`<${name}><xLgr>${esc(p.address)}</xLgr><nro>${esc(p.number)}</nro><xBairro>${esc(p.district)}</xBairro><cMun>${digits(p.cityCode)}</cMun><xMun>${esc(p.city)}</xMun><UF>${esc(p.uf)}</UF><CEP>${digits(p.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></${name}>`;
 const values=row.items.map(i=>calculate(s,row,i));
 const details=row.items.map((i,n)=>`<det nItem="${n+1}"><prod><cProd>${esc(i.id||'RTC-'+(n+1))}</cProd><cEAN>SEM GTIN</cEAN><xProd>${esc(i.description)}</xProd><NCM>${i.ncm}</NCM><CFOP>${i.cfop}</CFOP><uCom>UN</uCom>${tag('qCom',i.qty,4)}<vUnCom>0.0000000000</vUnCom><vProd>0.00</vProd><cEANTrib>SEM GTIN</cEANTrib><uTrib>UN</uTrib>${tag('qTrib',i.qty,4)}<vUnTrib>0.0000000000</vUnTrib><indTot>1</indTot></prod><imposto><IBSCBS><CST>${values[n].cst}</CST><cClassTrib>${values[n].code}</cClassTrib>${values[n].xml}</IBSCBS></imposto><vItem>0.00</vItem></det>`).join('');
 const zeros=names=>names.split(' ').map(n=>tag(n,0)).join(''),tot=summary(state,row);
 const normalTotals='<ICMSTot>'+zeros('vBC vICMS vICMSDeson vFCP vBCST vST vFCPST vFCPSTRet vProd vFrete vSeg vDesc vII vIPI vIPIDevol vPIS vCOFINS vOutro vNF')+'</ICMSTot>';
 const rtcTotals='<IBSCBSTot><vBCIBSCBS>0.00</vBCIBSCBS><gIBS><gIBSUF>'+zeros('vDif vDevTrib vIBSUF')+'</gIBSUF><gIBSMun>'+zeros('vDif vDevTrib vIBSMun')+'</gIBSMun>'+zeros('vIBS vCredPres vCredPresCondSus')+'</gIBS><gCBS>'+zeros('vDif vDevTrib vCBS vCredPres vCredPresCondSus')+'</gCBS>'+(tot.ibsCreditReversal||tot.cbsCreditReversal?'<gEstornoCred>'+tag('vIBSEstCred',tot.ibsCreditReversal)+tag('vCBSEstCred',tot.cbsCreditReversal)+'</gEstornoCred>':'')+'</IBSCBSTot><vNFTot>0.00</vNFTot>';
 const destType=p.taxpayerType==='Contribuinte ICMS'?1:9;if(destType===1&&!digits(p.stateRegistration))throw Error('IE destinatario contribuinte obrigatoria');
 const suframa=row.items.find(i=>i.ibsClass==='810001')?.rtcAdjustment.suframa;
 return `<?xml version="1.0" encoding="UTF-8"?><NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe${key}" versao="4.00"><ide><cUF>${h.UF_CODES[s.uf]}</cUF><cNF>${key.slice(35,43)}</cNF><natOp>${esc(row.nature)}</natOp><mod>55</mod><serie>${Number(row.serie||1)}</serie><nNF>${Number(row.number||row.id)}</nNF><dhEmi>${date}</dhEmi><tpNF>${purpose===5?0:1}</tpNF><idDest>${p.uf===s.uf?1:2}</idDest><cMunFG>${digits(s.cityCode)}</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>${key.slice(-1)}</cDV><tpAmb>${s.fiscalEnvironment==='Producao'?1:2}</tpAmb><finNFe>${purpose}</finNFe>${purpose===5?'<tpNFCredito>'+row.creditType+'</tpNFCredito>':'<tpNFDebito>'+row.debitType+'</tpNFDebito>'}<indFinal>0</indFinal><indPres>0</indPres><procEmi>0</procEmi><verProc>TortelaPlus-RTC</verProc>${row.referencedKey?'<NFref><refNFe>'+esc(row.referencedKey)+'</refNFe></NFref>':''}</ide><emit><CNPJ>${digits(s.document)}</CNPJ><xNome>${esc(s.legalName||s.company)}</xNome>${address(s,'enderEmit')}<IE>${digits(s.stateRegistration)}</IE><CRT>${profile(s).crt}</CRT></emit><dest><CNPJ>${digits(row.customerDocument)}</CNPJ><xNome>${esc(p.name)}</xNome>${address(p,'enderDest')}<indIEDest>${destType}</indIEDest>${destType===1?'<IE>'+digits(p.stateRegistration)+'</IE>':''}${suframa?'<ISUF>'+suframa+'</ISUF>':''}</dest>${details}<total>${normalTotals}${rtcTotals}</total><transp><modFrete>9</modFrete></transp><pag><detPag><tPag>90</tPag><vPag>0.00</vPag></detPag></pag><infAdic><infCpl>${esc(row.items.map(i=>i.rtcAdjustment.legalBasis).join('; '))}</infCpl></infAdic></infNFe></NFe>`;
}
module.exports={errors,generate,summary};

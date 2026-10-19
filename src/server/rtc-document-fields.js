const {rtcPolicy}=require('./rtc-policy');
const escape = value=>String(value??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
function documentFieldsErrors(settings,row,items) {
  const errors=[],policy=rtcPolicy(settings,row);
  const purpose=Number(row.purpose || (['return','exchange-return'].includes(row.operationType)?4:1));
  if (![1,2,3,4,5,6].includes(purpose)) errors.push('finalidade fiscal invalida');
  if(row.model==='NFC-e' && purpose!==1)errors.push('NFC-e permite apenas finalidade normal');
  if([5,6].includes(purpose))errors.push('Nota de credito/debito requer emissor especializado; transmissao bloqueada neste emissor de varejo');
  if(row.governmentPurchase)errors.push('Compra governamental requer apuracao e emissor especializado; transmissao bloqueada');
  if(purpose===4 && policy.returnItemReference){
    const references=items.map(item=>item.referencedKey || row.referencedKey);
    if(new Set(references).size>1)errors.push('Devolucao deve referenciar um unico documento');
    items.forEach((item,index)=>{if(!/^\d{44}$/.test(String(item.referencedKey||row.referencedKey||'')))errors.push(`chave referenciada do item ${index+1}`);if(!Number.isInteger(Number(item.referencedItem))||Number(item.referencedItem)<1||Number(item.referencedItem)>990)errors.push(`numero do item original referenciado do item ${index+1}`);});
    const ids=items.map(item=>(item.referencedKey||row.referencedKey)+'|'+item.referencedItem);if(new Set(ids).size!==ids.length)errors.push('Item original referenciado em duplicidade');
  }
  if(purpose===4&&!policy.returnItemReference&&!/^\d{44}$/.test(String(row.referencedKey||'')))errors.push('chave da nota original obrigatoria para devolucao');
  if(row.paymentLinks?.length){
    if(!policy.splitPaymentAllowed)errors.push('Vinculacao split payment em producao aguarda vigencia; nao usar em 2026');
    if(row.paymentLinks.length>99)errors.push('No maximo 99 pagamentos vinculados');
    const ids=new Set();
    row.paymentLinks.forEach((p,index)=>{
      if(!/^[A-Za-z0-9._:-]{2,35}$/.test(String(p.idTransacao||'')))errors.push(`identificador da transacao vinculada ${index+1}`);
      if(ids.has(p.idTransacao))errors.push('Transacao financeira vinculada em duplicidade');ids.add(p.idTransacao);
      if(!['15','17','18','20','23','24'].includes(String(p.tpMeioPgto||'')))errors.push(`codigo de meio de pagamento vinculado ${index+1}`);
      if(!/^\d{14}$/.test(String(p.CNPJReceb||'')))errors.push(`CNPJ do recebedor do vinculo ${index+1}`);
      if(!/^\d{8}$/.test(String(p.CNPJBasePSP||'')))errors.push(`CNPJ base do PSP do vinculo ${index+1}`);
    });
  }
  if(row.useNetPriceFields && !policy.netPriceFields)errors.push('Campos de preco liquido ainda nao ativados no ambiente/data da emissao');
  return errors;
}
function itemReferenceXml(settings,row,item){
  if(!rtcPolicy(settings,row).returnItemReference || !(Number(row.purpose)===4||['return','exchange-return'].includes(row.operationType)))return '';
  return `<DFeReferenciado><chaveAcesso>${escape(item.referencedKey||row.referencedKey)}</chaveAcesso><nItem>${Number(item.referencedItem)}</nItem></DFeReferenciado>`;
}
function paymentLinksXml(row){return row.paymentLinks?.length?`<gPgtoVinc>${row.paymentLinks.map((p,index)=>`<gPgto nPag="${index+1}" idTransacao="${escape(p.idTransacao)}"><tpMeioPgto>${escape(p.tpMeioPgto)}</tpMeioPgto><CNPJReceb>${escape(p.CNPJReceb)}</CNPJReceb><CNPJBasePSP>${escape(p.CNPJBasePSP)}</CNPJBasePSP></gPgto>`).join('')}</gPgtoVinc>`:'';}
function paymentEventXml(settings,row,event){
  if(row.status!=='Autorizada'||!/^\d{44}$/.test(String(row.key||''))||!/^\d{15}(\d{2})?$/.test(String(row.protocol||'')))throw Error('Vinculacao exige documento autorizado, chave e protocolo');
  const checked={...row,date:new Date().toISOString().slice(0,10),issuedAt:undefined,paymentLinks:[event.paymentLink]};
  const errors=documentFieldsErrors(settings,checked,row.items||[]);if(errors.length)throw Error(errors.join(', '));
  const link=event.paymentLink,org=String(row.key).slice(0,2),sequence=Number(event.sequence||1);
  if(!Number.isInteger(sequence)||sequence<1||sequence>20)throw Error('Sequencia do evento deve estar entre 1 e 20');
  const id='ID110300'+row.key+String(sequence).padStart(2,'0');
  return `<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><idLote>${Number(event.batch||1)}</idLote><evento versao="1.00"><infEvento Id="${id}"><cOrgao>${org}</cOrgao><tpAmb>${settings.fiscalEnvironment==='Producao'?1:2}</tpAmb><CNPJ>${escape(String(settings.document||'').replace(/\D/g,''))}</CNPJ><chNFe>${row.key}</chNFe><dhEvento>${new Date().toISOString()}</dhEvento><tpEvento>110300</tpEvento><nSeqEvento>${sequence}</nSeqEvento><verEvento>1.00</verEvento><detEvento versao="1.00"><descEvento>Vinculação Pagamento</descEvento><cOrgaoAutor>${org}</cOrgaoAutor><tpAutor>1</tpAutor><verAplic>TortelaPlus-RTC</verAplic><nProt>${row.protocol}</nProt><gPgto idTransacao="${escape(link.idTransacao)}"><tpMeioPgto>${escape(link.tpMeioPgto)}</tpMeioPgto><CNPJReceb>${escape(link.CNPJReceb)}</CNPJReceb><CNPJBasePSP>${escape(link.CNPJBasePSP)}</CNPJBasePSP></gPgto></detEvento></infEvento></evento></envEvento>`;
}
module.exports={documentFieldsErrors,itemReferenceXml,paymentLinksXml,paymentEventXml};

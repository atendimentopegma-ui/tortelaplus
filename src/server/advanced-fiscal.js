const {profile}=require('../fiscal-regimes');
const {fiscalDate}=require('./rtc-policy');
const round=v=>Math.round((Number(v)+Number.EPSILON)*100)/100;
const num=v=>Number(v||0);
const tag=(name,value,places=2)=>`<${name}>${Number(value).toFixed(places)}</${name}>`;
const esc=v=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
function recipient(state,row){
  const person=(state.people||[]).find(p=>row.customerDocument&&String(p.document).replace(/\D/g,'')===String(row.customerDocument).replace(/\D/g,''))||(state.people||[]).find(p=>p.name===row.customer)||{};
  const type=Number(row.indIEDest||(person.taxpayerType==='Contribuinte ICMS'?1:person.taxpayerType==='Isento'?2:9));
  return {person,type,uf:String(row.customerUf||person.uf||state.settings.uf).toUpperCase(),final:row.finalConsumer===undefined?type===9:row.finalConsumer===true};
}
function requireNumber(value,label,{min=0,max=Infinity}={}){if(value===undefined||value===null||value===''||!Number.isFinite(Number(value))||Number(value)<min||Number(value)>max)throw Error(label+' invalido ou nao configurado');if(Math.abs(Number(value)-Number(Number(value).toFixed(4)))>1e-10)throw Error(label+' permite no maximo quatro casas decimais');return Number(value);}
function ipi(settings,row,rule,gross,discount,other,qty){
  const config=rule.ipi||{},active=typeof config.enabled==='boolean'?config.enabled:num(rule.ipiRate)>0||num(config.unitValue)>0;
  if(!active)return {value:0,base:0,gross,net:round(gross-discount+other),xml:''};
  if(row.model!=='NF-e')throw Error('IPI exige NF-e modelo 55');
  if(profile(settings).federalSimple)throw Error('Simples Nacional/MEI nao destaca IPI proprio; devolucao de IPI exige grupo especifico');
  const cst=String(config.cst||rule.ipiCst||''),enq=String(config.enquadramento||'');
  const taxed=['00','49','50','99'].includes(cst),exempt=['01','02','03','04','05','51','52','53','54','55'].includes(cst);
  if(!taxed&&!exempt)throw Error('CST IPI invalido');
  if(!/^\d{3}$/.test(enq)||enq==='000')throw Error('Enquadramento legal IPI deve ter tres digitos');
  for(const [codes,min,max] of [[['02','52'],301,399],[['04','54'],1,99],[['05','55'],101,199]])if(codes.includes(cst)&&(Number(enq)<min||Number(enq)>max))throw Error('Enquadramento legal incompativel com CST IPI');
  if(!['included','added'].includes(config.priceMode))throw Error('Informe se o IPI integra o preco ou sera acrescido');
  let value=0,base=round(gross-discount+other),calculation='';
  if(taxed){
    if(config.method==='unit'){
      const unitValue=requireNumber(config.unitValue,'Valor IPI por unidade'),factor=requireNumber(config.quantityFactor,'Fator da unidade tributavel IPI',{min:Number.EPSILON});
      const quantity=Number((qty*factor).toFixed(4));value=round(quantity*unitValue);calculation=tag('qUnid',quantity,4)+tag('vUnid',unitValue,4);
      if(config.priceMode==='included')base=round(base-value);
    }else if(config.method==='percent'){
      const rate=requireNumber(config.rate??rule.ipiRate,'Aliquota IPI',{max:100});
      if(config.priceMode==='included'){base=round(base/(1+rate/100));value=round(gross-discount+other-base);}else value=round(base*rate/100);
      calculation=tag('vBC',base)+tag('pIPI',rate,4);
    }else throw Error('Metodo IPI deve ser percentual ou por unidade');
  }
  const productGross=round(gross-(config.priceMode==='included'?value:0));
  if(base<0||productGross<discount)throw Error('IPI supera o valor disponivel no item');
  const xml=`<IPI><cEnq>${enq}</cEnq>${taxed?`<IPITrib><CST>${cst}</CST>${calculation}${tag('vIPI',value)}</IPITrib>`:`<IPINT><CST>${cst}</CST></IPINT>`}</IPI>`;
  return {value,base,gross:productGross,net:round(productGross-discount+other),xml,includeInIcmsBase:config.includeInIcmsBase};
}
function difal(state,row,rule,base,ipiValue=0){
  const destination=recipient(state,row),origin=String(state.settings.uf).toUpperCase();
  const empty={destination:0,origin:0,fcp:0,base:0,xml:'',recipientLiability:0};
  if(destination.uf===origin)return empty;
  if(row.model!=='NF-e')throw Error('Operacao interestadual deve usar NF-e modelo 55');
  const c=rule.difal||{},date=fiscalDate(row);
  if(!destination.final)return empty; // Resale to a taxpayer has no consumer DIFAL.
  if(profile(state.settings).icmsSimple&&destination.type===9){if(c.enabled)throw Error('Simples/MEI nao deve destacar DIFAL EC87 para nao contribuinte');return empty;}
  if(!c.enabled||String(c.destinationUf).toUpperCase()!==destination.uf)throw Error('Regra DIFAL da UF de destino nao configurada');
  if(!c.legalBasis||!c.validFrom||date<c.validFrom||(c.validTo&&date>c.validTo))throw Error('Fundamento e vigencia da regra DIFAL obrigatorios');
  const internal=requireNumber(c.internalRate,'Aliquota interna DIFAL',{max:100}),inter=requireNumber(c.interstateRate,'Aliquota interestadual DIFAL',{max:100}),fcp=requireNumber(c.fcpRate,'Aliquota FCP destino',{max:100});
  if(![4,7,12].includes(inter)||internal<inter)throw Error('Aliquotas DIFAL incompativeis');
  const reduction=requireNumber(c.baseReduction??0,'Reducao da base DIFAL',{max:100});
  const operationBase=round((base+ipiValue)*(1-reduction/100));
  let destinationBase=operationBase;
  if(destination.type===9&&c.baseMethod!=='single')throw Error('DIFAL nao contribuinte exige base unica');
  if(destination.type!==9&&c.baseMethod==='double'){
    if(internal>=100)throw Error('Aliquota interna invalida para base dupla');
    destinationBase=round((operationBase-round(operationBase*inter/100))/(1-internal/100));
  }else if(c.baseMethod!=='single')throw Error('Metodo de base DIFAL invalido');
  const due=round(Math.max(0,destinationBase*internal/100-operationBase*inter/100)),fcpValue=round(destinationBase*fcp/100);
  if(destination.type!==9)return {...empty,base:destinationBase,recipientLiability:due+fcpValue};
  if(Math.abs(num(rule.icmsRate)-inter)>0.00001)throw Error('ICMS proprio deve usar a aliquota interestadual da regra DIFAL');
  if(Math.abs(num(rule.baseReductionRate)-reduction)>0.00001)throw Error('DIFAL base unica exige a mesma reducao da base do ICMS proprio');
  const xml='<ICMSUFDest>'+tag('vBCUFDest',destinationBase)+tag('vBCFCPUFDest',destinationBase)+tag('pFCPUFDest',fcp,4)+tag('pICMSUFDest',internal,4)+tag('pICMSInter',inter,2)+tag('pICMSInterPart',100,4)+tag('vFCPUFDest',fcpValue)+tag('vICMSUFDest',due)+tag('vICMSUFRemet',0)+'</ICMSUFDest>';
  return {destination:due,origin:0,fcp:fcpValue,base:destinationBase,xml,recipientLiability:0};
}
module.exports={ipi,difal,recipient,round,num,tag,esc,requireNumber};

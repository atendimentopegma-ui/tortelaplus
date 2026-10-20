const domesticIcms=require('./icms-domestic');
const advancedFiscal=require('./advanced-fiscal');
const fuelFiscal=require('./fuel-fiscal');
const rtcSpecial=require('./rtc-special');
const {profile,regimes}=require('../fiscal-regimes');
const crypto = require("crypto");
const { DEFAULT_REFORM_TAX_TABLES, validateClassificationPair, validateReformTaxTables } = require("./reform-tax-tables");

const { rtcPolicy, fiscalDate } = require("./rtc-policy");
const { documentFieldsErrors, itemReferenceXml, paymentLinksXml } = require("./rtc-document-fields");

const UF_CODES = {
  RO: "11", AC: "12", AM: "13", RR: "14", PA: "15", AP: "16", TO: "17",
  MA: "21", PI: "22", CE: "23", RN: "24", PB: "25", PE: "26", AL: "27",
  SE: "28", BA: "29", MG: "31", ES: "32", RJ: "33", SP: "35", PR: "41",
  SC: "42", RS: "43", MS: "50", MT: "51", GO: "52", DF: "53"
};

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function xml(value) {
  return String(value ?? "").replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;"
  }[char]));
}

function decimal(value, places = 2) {
  return Number(value || 0).toFixed(places);
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function rounded(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function isoDateTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getTime()-3*60*60*1000).toISOString().replace(/\.\d{3}Z$/, "-03:00");
}

function modulo11(value) {
  let weight = 2;
  let sum = 0;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    sum += Number(value[index]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const result = 11 - (sum % 11);
  return result === 10 || result === 11 ? "0" : String(result);
}

function fiscalNumber(row) {
  return String(Number(row.number || row.id || 1)).padStart(9, "0");
}

function accessKey(settings, row) {
  const cUf = UF_CODES[String(settings.uf || "").toUpperCase()] || "";
  const cnpj = digits(settings.document);
  const issued = fiscalDate(row);
  const yearMonth = issued.slice(2,4) + issued.slice(5,7);
  const model = row.model === "NFC-e" ? "65" : "55";
  const series = String(Number(row.serie || 1)).padStart(3, "0");
  const number = fiscalNumber(row);
  const emissionType = String(Number(row.emissionType || 1));
  const numericCode = digits(row.numericCode || crypto.createHash("sha256").update(`${cnpj}|${model}|${series}|${number}`).digest("hex").replace(/[a-f]/g, "")).slice(0, 8).padStart(8, "0");
  const base = `${cUf}${yearMonth}${cnpj}${model}${series}${number}${emissionType}${numericCode}`;
  return `${base}${modulo11(base)}`;
}

function findCustomer(state, row) {
  const doc = digits(row.customerDocument);
  return (state.people || []).find((person) => doc && digits(person.document) === doc)
    || (state.people || []).find((person) => person.name === row.customer)
    || {};
}

function resolveItems(state, row) {
  if (Array.isArray(row.items) && row.items.length) return row.items;
  const sale = (state.sales || []).find((item) => Number(item.id) === Number(row.saleId));
  return sale?.items || [];
}

function itemRule(state, row, item) {
  const product = (state.products || []).find((candidate) => Number(candidate.id) === Number(item.id || item.productId)) || {};
  const rule = (state.fiscalRules || []).find((candidate) =>
    candidate.active !== false
    && candidate.model === row.model
    && candidate.regime === state.settings.regime
    && (!candidate.crt || String(candidate.crt) === profile(state.settings).crt)
    && candidate.uf === state.settings.uf
    && (!candidate.validFrom || candidate.validFrom <= fiscalDate(row))
    && (!candidate.validTo || candidate.validTo >= fiscalDate(row))
  ) || {};
  const fiscal = product.fiscal || {};
  const reform = product.reform || {};
  const productValues = {
    ...product,
    ipi: fiscal.ipi ?? product.ipi,
    difal: fiscal.difal ?? product.difal,
    fuel: fiscal.fuel ?? product.fuel,
    rtcMono: reform.rtcMono ?? product.rtcMono,
    rtcCredit: reform.rtcCredit ?? product.rtcCredit,
    csosn: fiscal.csosn ?? product.csosn ?? (/^\d{3}$/.test(String(product.cst)) ? product.cst : undefined),
    cst: fiscal.cst ?? product.cst,
    pisCofinsCst: fiscal.pisOutCst ?? product.pisCofinsCst,
    origin: fiscal.origin ?? product.origin,
    taxBenefitCode: fiscal.cbenef ?? product.taxBenefitCode,
    desonerationReason: fiscal.motDeson ?? product.desonerationReason,
    icmsRate: fiscal.icmsInternalRate ?? product.icmsRate,
    cfopExternal: fiscal.cfopExternal ?? product.cfopExternal,
    cstExternal: fiscal.cstExternal ?? product.cstExternal,
    icmsExternalRate: fiscal.icmsExternalRate ?? product.icmsExternalRate,
    baseReductionRate: fiscal.icmsBaseReduction ?? product.baseReductionRate,
    mvaRate: fiscal.mva ?? product.mvaRate,
    icmsDeferralRate: fiscal.icmsDeferralRate ?? product.icmsDeferralRate,
    retainedStBase: fiscal.retainedStBase ?? product.retainedStBase,
    retainedStRate: fiscal.retainedStRate ?? product.retainedStRate,
    retainedStValue: fiscal.retainedStValue ?? product.retainedStValue,
    icmsSubstituteValue: fiscal.icmsSubstituteValue ?? product.icmsSubstituteValue,
    retainedFcpBase: fiscal.retainedFcpBase ?? product.retainedFcpBase,
    retainedFcpRate: fiscal.retainedFcpRate ?? product.retainedFcpRate,
    retainedFcpValue: fiscal.retainedFcpValue ?? product.retainedFcpValue,

    fcpRate: fiscal.fcpRate ?? product.fcpRate,
    ipiCst: fiscal.ipiCst ?? product.ipiCst,
    ipiRate: fiscal.ipiRate ?? product.ipiRate,
    pisCst: fiscal.pisOutCst ?? product.pisCst,
    pisRate: fiscal.pisRate ?? product.pisRate,
    cofinsCst: fiscal.cofinsOutCst ?? product.cofinsCst,
    cofinsRate: fiscal.cofinsRate ?? product.cofinsRate,
    revenueNature: fiscal.revenueNature ?? product.revenueNature,
    ibsClass: reform.classTrib ?? product.ibsClass,
    cbsClass: reform.classTrib ?? product.cbsClass,
    ibsCbsCst: reform.cst ?? product.ibsCbsCst,
    cbsRate: reform.cbsRate ?? product.cbsRate,
    cbsFederalRate: reform.cbsRate ?? product.cbsFederalRate ?? product.cbsRate,
    cbsRateYear: reform.rateYear ?? product.cbsRateYear,
    ibsReductionRate: reform.ibsReduction ?? product.ibsReductionRate,
    cbsReductionRate: reform.cbsReduction ?? product.cbsReductionRate,
    ibsUfDeferral: reform.ibsUfDeferral ?? product.ibsUfDeferral,
    ibsCityDeferral: reform.ibsCityDeferral ?? product.ibsCityDeferral,
    cbsDeferral: reform.cbsDeferral ?? product.cbsDeferral,
    ibsUfRate: reform.ibsUfRate ?? product.ibsUfRate,
    ibsCityRate: reform.ibsCityRate ?? product.ibsCityRate,
    reformReductionRate: reform.reduction ?? product.reformReductionRate,
    reformDeferralRate: reform.deferral ?? product.reformDeferralRate,
    selectiveTaxRate: reform.selectiveTax ?? product.selectiveTaxRate,
    selectiveTaxCst: reform.selectiveTaxCst ?? product.selectiveTaxCst,
    selectiveTaxClass: reform.selectiveTaxClass ?? product.selectiveTaxClass,
    presumedCreditRate: reform.presumedCredit ?? product.presumedCreditRate,
    monophase: typeof reform.monophase === "boolean" ? reform.monophase : product.monophase,
    adRemRate: reform.adRemRate ?? product.adRemRate,
    adRemUnit: reform.adRemUnit ?? product.adRemUnit,
  };
  // Configured retention amounts are per unit. Item overrides are document totals.
  for(const field of ['retainedStBase','retainedStValue','icmsSubstituteValue','retainedFcpBase','retainedFcpValue']){
    if(productValues[field]!==undefined&&productValues[field]!==null&&productValues[field]!=='')productValues[field]=rounded(Number(productValues[field])*Number(item.qty));
  }
  const merged = {...rule, ...Object.fromEntries(Object.entries(productValues).filter(([,value]) => value !== undefined && value !== null)), ...item};
  if (Object.hasOwn(item,"cbsRate")) merged.cbsFederalRate = item.cbsRate;
  if (advancedFiscal.recipient(state,row).uf!==String(state.settings.uf).toUpperCase()) {
    for(const [field,external] of [['cfop','cfopExternal'],['cst','cstExternal'],['icmsRate','icmsExternalRate']])
      if(!Object.hasOwn(item,field)&&merged[external]!==undefined&&merged[external]!=='')merged[field]=merged[external];
  }
  const indicator=DEFAULT_REFORM_TAX_TABLES.cstIndicators.find(c=>c.cst===merged.ibsCbsCst);
  merged.reformIndicator=indicator;
  return merged;
}

function icmsXml(settings, rule, value) {
  const supported=domesticIcms.xml(settings,rule,value);if(supported)return supported;
  const origin=digits(rule.origin||'0').slice(0,1);
  if(profile(settings).icmsSimple){
    const code=String(rule.csosn);
    if(code==='101'){
      const rate=number(rule.creditRate??rule.icmsCreditRate);
      return `<ICMSSN101><orig>${origin}</orig><CSOSN>101</CSOSN><pCredSN>${decimal(rate,4)}</pCredSN><vCredICMSSN>${decimal(rounded(value*rate/100))}</vCredICMSSN></ICMSSN101>`;
    }
    if(['102','103','300','400'].includes(code))return `<ICMSSN102><orig>${origin}</orig><CSOSN>${code}</CSOSN></ICMSSN102>`;
  }else if(['40','41','50'].includes(String(rule.cst))){
    return `<ICMS40><orig>${origin}</orig><CST>${rule.cst}</CST></ICMS40>`;
  }
  throw Error('Grupo ICMS nao implementado para CST/CSOSN informado');
}

function paymentCode(method) {
  const key = String(method || "").toLowerCase();
  if (key.includes("sem pagamento")) return "90";
  if (key.includes("dinheiro")) return "01";
  if (key.includes("cheque")) return "02";
  if (key.includes("debito") || key.includes("débito")) return "04";
  if (key.includes("cart") || key.includes("credito") || key.includes("crédito")) return "03";
  if (key.includes("crediario") || key.includes("crediário")) return "05";
  if (key.includes("boleto")) return "15";
  if (key.includes("pix")) return "17";
  return "99";
}

function totalsFromItems(items, row = {}) {
  const gross = items.reduce((sum, item) => sum + rounded(number(item.qty) * number(item.price)), 0);
  const discount = Math.min(gross, number(row.discount) + number(row.exchangeCredit));
  const other = number(row.addition);
  return {
    gross,
    discount,
    other,
    net: Math.max(0, gross - discount + other)
  };
}

function splitValue(total, gross, itemGross, index, count, allocated) {
  if (!total || !gross) return 0;
  if (index === count - 1) return Math.max(0, total - allocated);
  return Math.min(itemGross, Number((total * itemGross / gross).toFixed(2)));
}

function pisCofinsXml(kind, cst, base, rate) {
  const tag = kind === "PIS" ? "PIS" : "COFINS";
  if (["04", "06", "07", "08", "09"].includes(cst)) return `<${tag}NT><CST>${cst}</CST></${tag}NT>`;
  const inner = ["01", "02"].includes(cst) ? `${tag}Aliq` : `${tag}Outr`;
  const rateTag = kind === "PIS" ? "pPIS" : "pCOFINS";
  const valueTag = kind === "PIS" ? "vPIS" : "vCOFINS";
  return `<${inner}><CST>${cst}</CST><vBC>${decimal(base)}</vBC><${rateTag}>${decimal(rate, 4)}</${rateTag}><${valueTag}>${decimal(base * rate / 100)}</${valueTag}></${inner}>`;
}

function reformRate(rule, primary, fallback) {
  return number(rule[primary] ?? rule[fallback]);
}

function reformRequired(state, row) { return rtcPolicy(state.settings,row).emit; }

function reformEffectiveRate(rate, reduction) {
  return Math.max(0, number(rate) * (1 - Math.min(Math.max(number(reduction), 0), 100) / 100));
}

function reformDeferralValues(base, rate, reduction, deferral) {
  const effectiveRate = reformEffectiveRate(rate, reduction);
  const gross = base * effectiveRate / 100;
  const vDif = gross * Math.min(Math.max(number(deferral), 0), 100) / 100;
  return {
    effectiveRate,
    vDif: rounded(vDif),
    value: rounded(Math.max(0, gross - vDif))
  };
}

function reformReductionXml(rate, reduction, required=false) {
  if (!required && !number(reduction)) return "";
  return `<gRed><pRedAliq>${decimal(reduction, 4)}</pRedAliq><pAliqEfet>${decimal(reformEffectiveRate(rate, reduction), 4)}</pAliqEfet></gRed>`;
}

function reformDeferralXml(deferral, value, required=false) {
  if (!required && !number(deferral)) return "";
  return `<gDif><pDif>${decimal(deferral, 4)}</pDif><vDif>${decimal(value)}</vDif></gDif>`;
}

function reformValues(rule, base) {
  const reduction=number(rule.reformReductionRate),deferral=number(rule.reformDeferralRate);
  const ibsReduction=number(rule.ibsReductionRate ?? reduction),cbsReduction=number(rule.cbsReductionRate ?? reduction);
  const ufDeferral=number(rule.ibsUfDeferral ?? deferral),cityDeferral=number(rule.ibsCityDeferral ?? deferral),cbsDeferral=number(rule.cbsDeferral ?? deferral);
  const ibsUfRate=reformRate(rule,"ibsUfRate","ibsRate"),ibsCityRate=reformRate(rule,"ibsCityRate","ibsRate"),cbsRate=reformRate(rule,"cbsFederalRate","cbsRate");
  const uf=reformDeferralValues(base,ibsUfRate,ibsReduction,ufDeferral),city=reformDeferralValues(base,ibsCityRate,ibsReduction,cityDeferral),cbs=reformDeferralValues(base,cbsRate,cbsReduction,cbsDeferral);
  return {base,reduction,deferral,ibsReduction,cbsReduction,ufDeferral,cityDeferral,cbsDeferral,ibsUfRate,ibsCityRate,cbsRate,vDifIBSUF:uf.vDif,vDifIBSMun:city.vDif,vDifCBS:cbs.vDif,vIBSUF:uf.value,vIBSMun:city.value,vIBS:rounded(uf.value+city.value),vCBS:cbs.value,selectiveRate:number(rule.selectiveTaxRate),vIS:rounded(base*number(rule.selectiveTaxRate)/100)};
}

function ibsCbsXml(rule, values, line) {
  if(line?.mono)return `<IBSCBS><CST>${rule.ibsCbsCst}</CST><cClassTrib>${rule.ibsClass||rule.cbsClass}</cClassTrib>${line.mono.xml}</IBSCBS>`;
  if(line?.credit?.xml){
    return ibsCbsXml(rule,values).replace('</IBSCBS>',line.credit.xml+'</IBSCBS>');
  }
  const cst = digits(rule.ibsCbsCst || "000").padStart(3, "0").slice(0, 3);
  const cClassTrib = digits(rule.ibsClass || rule.cbsClass || "000001").padStart(6, "0").slice(0, 6);
  if (["400", "410"].includes(cst)) return `<IBSCBS><CST>${cst}</CST><cClassTrib>${cClassTrib}</cClassTrib></IBSCBS>`;
  return `<IBSCBS><CST>${cst}</CST><cClassTrib>${cClassTrib}</cClassTrib><gIBSCBS><vBC>${decimal(values.base)}</vBC><gIBSUF><pIBSUF>${decimal(values.ibsUfRate, 4)}</pIBSUF>${reformDeferralXml(values.ufDeferral, values.vDifIBSUF, rule.reformIndicator?.requiresDeferral)}${reformReductionXml(values.ibsUfRate, values.ibsReduction, rule.reformIndicator?.requiresReduction)}<vIBSUF>${decimal(values.vIBSUF)}</vIBSUF></gIBSUF><gIBSMun><pIBSMun>${decimal(values.ibsCityRate, 4)}</pIBSMun>${reformDeferralXml(values.cityDeferral, values.vDifIBSMun, rule.reformIndicator?.requiresDeferral)}${reformReductionXml(values.ibsCityRate, values.ibsReduction, rule.reformIndicator?.requiresReduction)}<vIBSMun>${decimal(values.vIBSMun)}</vIBSMun></gIBSMun><vIBS>${decimal(values.vIBS)}</vIBS><gCBS><pCBS>${decimal(values.cbsRate, 4)}</pCBS>${reformDeferralXml(values.cbsDeferral, values.vDifCBS, rule.reformIndicator?.requiresDeferral)}${reformReductionXml(values.cbsRate, values.cbsReduction, rule.reformIndicator?.requiresReduction)}<vCBS>${decimal(values.vCBS)}</vCBS></gCBS></gIBSCBS></IBSCBS>`;
}

function selectiveTaxXml(rule, values) {
  if (!values.selectiveRate) return "";
  const cst = digits(rule.selectiveTaxCst || rule.ibsCbsCst || "000").padStart(3, "0").slice(0, 3);
  const cClassTrib = digits(rule.selectiveTaxClass || rule.ibsClass || "000001").padStart(6, "0").slice(0, 6);
  return `<IS><CSTIS>${cst}</CSTIS><cClassTribIS>${cClassTrib}</cClassTribIS><vBCIS>${decimal(values.base)}</vBCIS><pIS>${decimal(values.selectiveRate, 4)}</pIS><vIS>${decimal(values.vIS)}</vIS></IS>`;
}

function ibsCbsTotalsXml(totals) {
  if (!totals.hasReform) return "";
  return `<IBSCBSTot><vBCIBSCBS>${decimal(totals.base)}</vBCIBSCBS><gIBS><gIBSUF><vDif>${decimal(totals.vDifIBSUF)}</vDif><vDevTrib>0.00</vDevTrib><vIBSUF>${decimal(totals.vIBSUF)}</vIBSUF></gIBSUF><gIBSMun><vDif>${decimal(totals.vDifIBSMun)}</vDif><vDevTrib>0.00</vDevTrib><vIBSMun>${decimal(totals.vIBSMun)}</vIBSMun></gIBSMun><vIBS>${decimal(totals.vIBS)}</vIBS><vCredPres>${decimal(totals.creditIbs)}</vCredPres><vCredPresCondSus>${decimal(totals.suspendedIbs)}</vCredPresCondSus></gIBS><gCBS><vDif>${decimal(totals.vDifCBS)}</vDif><vDevTrib>0.00</vDevTrib><vCBS>${decimal(totals.vCBS)}</vCBS><vCredPres>${decimal(totals.creditCbs)}</vCredPres><vCredPresCondSus>${decimal(totals.suspendedCbs)}</vCredPresCondSus></gCBS>${totals.mono?"<gMono>"+[["vIBSMono","ibs"],["vCBSMono","cbs"],["vIBSMonoReten","ibsRetention"],["vCBSMonoReten","cbsRetention"],["vIBSMonoRet","ibsRetained"],["vCBSMonoRet","cbsRetained"]].map(([tag,key])=>`<${tag}>${decimal(totals.mono[key])}</${tag}>`).join("")+"</gMono>":""}</IBSCBSTot>`;
}

function nfceQrCodeUrl(settings, key, options = {}) {
  if (settings.qrCodeUrl) return settings.qrCodeUrl;
  if (settings.nfceQrCodeUrl) return settings.nfceQrCodeUrl;
  const uf = String(settings.sefazUf || settings.uf || "").toUpperCase();
  const homologacao = settings.fiscalEnvironment !== "Producao";
  if (uf === "SP") {
    return homologacao
      ? "https://www.homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx"
      : "https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx";
  }
  return "";
}

function nfceConsultaUrl(settings) {
  if (settings.nfceConsultaUrl) return settings.nfceConsultaUrl;
  const uf = String(settings.sefazUf || settings.uf || "").toUpperCase();
  const homologacao = settings.fiscalEnvironment !== "Producao";
  if (uf === "SP") {
    return homologacao
      ? "https://www.homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/"
      : "https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/";
  }
  return "";
}

function nfceSupplement(settings, key, options = {}) {
  if (settings.fiscalEnvironment === "Producao" && !options.csc) return "";
  const qrBase = nfceQrCodeUrl(settings, key, options);
  const consulta = nfceConsultaUrl(settings);
  if (!qrBase || !consulta || !settings.cscId) return "";
  const version = "2";
  const tpAmb = settings.fiscalEnvironment === "Producao" ? "1" : "2";
  const cHashQRCode = crypto
    .createHash("sha1")
    .update(`${key}|${version}|${tpAmb}|${settings.cscId}${options.csc || ""}`)
    .digest("hex")
    .toUpperCase();
  const separator = qrBase.includes("?") ? "&" : "?";
  const qrCode = `${qrBase}${separator}p=${key}|${version}|${tpAmb}|${settings.cscId}|${cHashQRCode}`;
  return `<infNFeSupl><qrCode><![CDATA[${qrCode}]]></qrCode><urlChave>${xml(consulta)}</urlChave></infNFeSupl>`;
}

function validateNfeState(state, row) {
  const settings = state.settings || {};
  const missing = [];
  const reformTables = DEFAULT_REFORM_TAX_TABLES;
  const validRegimes = regimes.map(item=>item.name);
  missing.push(...profile(settings).errors);
  validateReformTaxTables(reformTables).forEach((error) => missing.push(error));
  if (!validRegimes.includes(settings.regime)) missing.push("regime tributario valido");
  if (!UF_CODES[String(settings.uf || "").toUpperCase()]) missing.push("UF valida do emitente");
  if (digits(settings.document).length !== 14) missing.push("CNPJ do emitente");
  if (!settings.stateRegistration) missing.push("inscricao estadual");
  if (digits(settings.cityCode).length !== 7) missing.push("codigo IBGE do municipio do emitente");
  if (!settings.address || !settings.number || !settings.district || !settings.city || digits(settings.cep).length !== 8) missing.push("endereco completo do emitente");
  if (!["NF-e", "NFC-e"].includes(row.model)) missing.push("modelo fiscal");
  if(row.finalConsumer!==undefined&&typeof row.finalConsumer!=='boolean')missing.push('Consumidor final deve ser Sim ou Nao, sem texto ambiguo');
  if (Number(row.serie || 1) <= 0 || Number(row.number || row.id || 0) <= 0) missing.push("serie e numero validos");
  const items = resolveItems(state, row);
  if (!items.length) missing.push("itens da nota");
  items.forEach((item, index) => {
    const rule = itemRule(state, row, item);
    if (profile(settings).icmsSimple && !profile(settings).icmsCodes.includes(String(rule.csosn))) missing.push(`CSOSN especial sem suporte validado no item ${index+1}`);
    if (!profile(settings).icmsSimple && !profile(settings).icmsCodes.includes(String(rule.cst))) missing.push(`CST ICMS especial sem suporte validado no item ${index+1}`);
    if(row.model==='NFC-e'&&((profile(settings).icmsSimple&&!['102','103','300','400','500','900'].includes(String(rule.csosn)))||(!profile(settings).icmsSimple&&!['00','20','40','41','60','61','90'].includes(String(rule.cst)))))missing.push(`CST/CSOSN incompativel com NFC-e no item ${index+1}`);
    if (number(rule.taxRefundRate)||number(rule.reformTaxRefund)||number(rule.vDevTrib)) missing.push(`IPI/devolucao de tributo exige emissor especializado no item ${index+1}`);
    if ([rule.ibsUfRate,rule.ibsCityRate,rule.cbsFederalRate,rule.icmsRate,rule.pisRate,rule.cofinsRate].some(v=>v!==undefined&&(!Number.isFinite(Number(v))||Number(v)<0||Number(v)>100))) missing.push(`aliquota invalida no item ${index+1}`);
    missing.push(...domesticIcms.errors(settings,rule).map(error=>`${error} no item ${index+1}`));
    if (digits(rule.ncm).length !== 8 || /^0+$/.test(digits(rule.ncm))) missing.push(`NCM do item ${index + 1}`);
    if (digits(rule.cfop).length !== 4) missing.push(`CFOP do item ${index + 1}`);
    if(profile(settings).mei){
      const meiCodes=row.model==='NFC-e'?['102','300']:['102','300','400','900'];
      if(!meiCodes.includes(String(rule.csosn)))missing.push(`CSOSN incompativel com modelo fiscal do MEI no item ${index+1}`);
      if(!['0','2'].includes(String(rule.origin??'0').slice(0,1)))missing.push(`origem permitida para MEI no item ${index+1}`);
      const allowed=String(rule.csosn)==='102'?['5102','6102']:['1202','1904','2202','2904','5202','5904','6202','6904','1501','1503','1504','1505','1506','1553','2501','2503','2504','2505','2506','2553','5501','5502','5504','5505','5551','5933','6501','6502','6504','6505','6551','6933'];
      if((['102','900'].includes(String(rule.csosn))&&!allowed.includes(String(rule.cfop)))||(row.model==='NFC-e'&&String(rule.cfop)!=='5102'))missing.push(`CFOP incompativel com MEI no item ${index+1}`);
    }
    const returnOperation=Number(row.purpose)===4||['return','exchange-return'].includes(row.operationType);
    if(returnOperation&&!/^[123]/.test(String(rule.cfop)))missing.push(`CFOP de entrada para devolucao no item ${index+1}`);
    if(!returnOperation&&!/^[567]/.test(String(rule.cfop)))missing.push(`CFOP de saida no item ${index+1}`);
    if (profile(settings).icmsSimple && digits(rule.csosn).length !== 3) missing.push(`CSOSN do item ${index + 1}`);
    if (!profile(settings).icmsSimple && digits(rule.cst).length !== 2) missing.push(`CST do item ${index + 1}`);
    if (digits(rule.pisCofinsCst).length !== 2) missing.push(`CST PIS/COFINS do item ${index + 1}`);
    if (reformRequired(state,row)) {
      const pairErrors=validateClassificationPair(reformTables,{cst:rule.ibsCbsCst,classTrib:rule.ibsClass||rule.cbsClass,model:row.model,date:fiscalDate(row)});
      if(!/^\d{3}$/.test(String(rule.ibsCbsCst||"")))missing.push(`CST IBS/CBS do item ${index+1}`);
      if(!/^\d{6}$/.test(String(rule.ibsClass||rule.cbsClass||"")))missing.push(`classificacao tributaria IBS/CBS do item ${index+1}`);
      pairErrors.forEach(error=>missing.push(`${error} no item ${index+1}`));
      const indicator=reformTables.cstIndicators.find(c=>c.cst===rule.ibsCbsCst);
      const classification=reformTables.classTrib.find(c=>c.code===(rule.ibsClass||rule.cbsClass));
      const reductions=[number(rule.ibsReductionRate??rule.reformReductionRate),number(rule.cbsReductionRate??rule.reformReductionRate)];
      const deferrals=[number(rule.ibsUfDeferral??rule.reformDeferralRate),number(rule.ibsCityDeferral??rule.reformDeferralRate),number(rule.cbsDeferral??rule.reformDeferralRate)];
      for(const value of [...reductions,...deferrals])if(value<0||value>100)missing.push(`percentual de reducao/diferimento entre 0 e 100 no item ${index+1}`);
      if(indicator&&!indicator.allowsDeferral&&deferrals.some(value=>value!==0))missing.push(`CST ${rule.ibsCbsCst} proibe diferimento no item ${index+1}`);
      if(indicator&&!indicator.allowsReduction&&reductions.some(value=>value!==0))missing.push(`CST ${rule.ibsCbsCst} proibe reducao no item ${index+1}`);
      if(classification&&(reductions[0]!==classification.ibsReduction||reductions[1]!==classification.cbsReduction))missing.push(`reducao IBS/CBS diverge da tabela oficial no item ${index+1}`);
      if(!['000','200','400','410','510','515','550','620'].includes(rule.ibsCbsCst)||(rule.monophase&&rule.ibsCbsCst!=='620')||classification?.requiresRegularTaxation||classification?.requiresCreditReversal||indicator?.requiresCreditTransfer||indicator?.requiresAdjustment||indicator?.requiresBaseReduction)missing.push(`enquadramento especial IBS/CBS exige emissor especializado no item ${index+1}`);
      if(number(rule.presumedCreditRate)>0||number(rule.adRemRate)>0)missing.push(`credito presumido/ad rem exige emissor especializado no item ${index+1}; nao sera ignorado`);
      if(number(rule.selectiveTaxRate)>0)missing.push(`Imposto Seletivo exige tabela de CST/cClassTribIS e emissor especializado no item ${index+1}`);
      const policy=rtcPolicy(settings,row),rates=policy.standardRates;
      if(indicator?.requiresTaxation&&rates&&!['return','exchange-return'].includes(row.operationType)){
        for(const [field,expected] of [['ibsUfRate',rates.ibsUfRate],['ibsCityRate',rates.ibsCityRate],['cbsFederalRate',rates.cbsRate]]){
          const actual=field==='cbsFederalRate'?reformRate(rule,'cbsFederalRate','cbsRate'):number(rule[field]);
          if(expected!==null&&Math.abs(actual-expected)>0.00001)missing.push(`${field} deve ser ${expected}% em ${policy.year} no item ${index+1}`);
        }
      }
      if(policy.year>=2027&&indicator?.requiresTaxation&&(rule.cbsFederalRate===undefined||rule.cbsFederalRate===null||!Number.isFinite(Number(rule.cbsFederalRate))))missing.push(`aliquota CBS vigente deve ser configurada explicitamente para ${policy.year} no item ${index+1}`);
      if(policy.year>=2027&&indicator?.requiresTaxation&&(Number(rule.cbsRateYear||rule.transitionYear)!==policy.year||number(rule.cbsFederalRate)<=0))missing.push(`confirme aliquota e ano de vigencia da CBS ${policy.year} no item ${index+1}; aliquota de 2026 nao sera prorrogada automaticamente`);
    }
    if (!Number.isFinite(Number(item.qty)) || !Number.isFinite(Number(item.price)) || Number(item.qty) <= 0 || Number(item.price) <= 0) missing.push(`quantidade/preco do item ${index + 1}`);
  });
  documentFieldsErrors(settings,row,items).forEach(error=>missing.push(error));
  if (row.model === "NF-e" && !digits(row.customerDocument || findCustomer(state, row).document)) missing.push("CPF/CNPJ do destinatario da NF-e");
  const customer = findCustomer(state, row);
  const recipientType=Number(row.indIEDest || (customer.taxpayerType==='Contribuinte ICMS'?1:customer.taxpayerType==='Isento'?2:9));
  if(![1,2,9].includes(recipientType))missing.push('Indicador de IE do destinatario invalido');
  if(row.model==='NF-e'&&recipientType===1&&!digits(row.customerIE||customer.stateRegistration))missing.push('IE do destinatario contribuinte');
  if(row.model==='NF-e'&&recipientType===9&&profile(settings).icmsSimple&&items.some(item=>['101','201'].includes(String(itemRule(state,row,item).csosn)))&&!['return','exchange-return'].includes(row.operationType)&&Number(row.purpose)!==4)missing.push('Credito do Simples exige destinatario contribuinte');
  const destinationUf = advancedFiscal.recipient(state,row).uf;
  if(destinationUf!==String(settings.uf).toUpperCase()){
    if(row.model!=='NF-e')missing.push('Operacao interestadual exige NF-e');
    if(!customer.address||!customer.number||!customer.district||!customer.city||digits(customer.cityCode).length!==7||digits(customer.cep).length!==8)missing.push('Endereco completo do destinatario interestadual');
    items.forEach((item,i)=>{if(!/^[26]/.test(String(itemRule(state,row,item).cfop)))missing.push(`CFOP interestadual do item ${i+1}`);});
  }
  if (row.model === "NF-e" && !UF_CODES[destinationUf]) missing.push("UF valida do destinatario da NF-e");
  if(row.model==='NF-e'&&UF_CODES[destinationUf]&&digits(row.customerCityCode||customer.cityCode||settings.cityCode).slice(0,2)!==UF_CODES[destinationUf])missing.push('Municipio do destinatario deve pertencer a UF informada');
  if (row.model === "NF-e" && digits(customer.cityCode || row.customerCityCode || settings.cityCode).length !== 7) missing.push("codigo IBGE do municipio do destinatario da NF-e");
  const totals = totalsFromItems(items, row);
  try {totals.net=rounded(fiscalLedger(state,row).reduce((n,l)=>n+l.vItem,0));}catch(error){missing.push(error.message);}
  if([row.total,row.discount,row.addition,row.exchangeCredit,row.change].some(v=>v!==undefined&&!Number.isFinite(Number(v))))missing.push('valor monetario invalido');
  const paymentTotal = (row.payments?.length ? row.payments : [{ value: row.total ?? totals.net }]).reduce((sum, payment) => sum + number(payment.value), 0);
  const change = Math.max(number(row.change), paymentTotal - totals.net, 0);
  if (Number(row.discount||0)<0 || Number(row.addition||0)<0 || Number(row.discount||0)+Number(row.exchangeCredit||0)>totals.gross) missing.push("desconto/acrescimo invalido");
  if (row.total!==undefined && Math.abs(Number(row.total)-totals.net)>0.01) missing.push("total informado difere dos itens");
  if (!(["return","exchange-return"].includes(row.operationType)||Number(row.purpose)===4) && Math.abs(paymentTotal - totals.net - change) > 0.01) missing.push("total dos pagamentos igual ao total da nota");
  if (row.model === "NFC-e" && (!settings.cscConfigured || !settings.cscId)) missing.push("CSC e ID CSC da NFC-e");
  if (row.model === "NFC-e" && (!nfceQrCodeUrl(settings) || !nfceConsultaUrl(settings))) missing.push("URLs de QR Code e consulta NFC-e da UF/ambiente da empresa");
  if (row.model === "NFC-e" && row.finalConsumer===false) missing.push("NFC-e exige consumidor final");
  return [...new Set(missing)];
}

function fiscalLedger(state,row) {
  const items=resolveItems(state,row),policy=rtcPolicy(state.settings,row),totals=totalsFromItems(items,row);
  let discounts=0,others=0;
  return items.map((item,index)=>{
    const rule=itemRule(state,row,item),originalGross=rounded(number(item.qty)*number(item.price));
    const discount=rounded(splitValue(totals.discount,totals.gross,originalGross,index,items.length,discounts));discounts=rounded(discounts+discount);
    const other=rounded(splitValue(totals.other,totals.gross,originalGross,index,items.length,others));others=rounded(others+other);
    const ipi=advancedFiscal.ipi(state.settings,row,rule,originalGross,discount,other,number(item.qty));
    const gross=ipi.gross,net=ipi.net;
    const fuel=fuelFiscal.calculate(state.settings,row,rule,item);
    const recipient=advancedFiscal.recipient(state,row);
    const icmsNet=rounded(net+(ipi.value&&(recipient.final||recipient.type===9)?ipi.value:0));
    const icmsDetails=fuel.active?{base:0,icms:0,fcp:0}:domesticIcms.calculate(state.settings,rule,icmsNet);
    const icmsBase=icmsDetails.base,icms=icmsDetails.icms,fcp=icmsDetails.fcp;
    const difal=fuel.active?{destination:0,origin:0,fcp:0,xml:'',recipientLiability:0}:advancedFiscal.difal(state,row,rule,icmsNet);
    const pisCst=String(rule.pisCofinsCst||rule.pisCst||'01'),cofinsCst=String(rule.cofinsCst||rule.pisCofinsCst||'01');
    const nonTax=['04','06','07','08','09'];
    const pis=nonTax.includes(pisCst)?0:rounded(net*number(rule.pisRate)/100);
    const cofins=nonTax.includes(cofinsCst)?0:rounded(net*number(rule.cofinsRate)/100);
    const credit=rtcSpecial.credit(state.settings,row,rule,item);
    const taxableRtc=policy.emit&&!['400','410','620'].includes(rule.ibsCbsCst);
    const reference=reformValues(rule,100);
    const effective=(reference.ibsUfRate*(1-reference.ibsReduction/100)*(1-reference.ufDeferral/100)+reference.ibsCityRate*(1-reference.ibsReduction/100)*(1-reference.cityDeferral/100)+reference.cbsRate*(1-reference.cbsReduction/100)*(1-reference.cbsDeferral/100))/100;
    const numerator=rounded(Math.max(0,net-icms-fcp-fuel.tax-difal.destination-difal.fcp-pis-cofins));
    const rtcBase=taxableRtc?rounded(policy.taxesInProduct?(numerator+credit.deductIbs)/(1+effective):numerator):0;
    const reform=reformValues(taxableRtc?rule:{},rtcBase);
    if(credit.deductIbs>reform.vIBS)throw Error('Credito presumido dedutivel supera IBS da operacao');
    reform.vIBS=rounded(reform.vIBS-credit.deductIbs);
    let mono=policy.emit?rtcSpecial.mono(state.settings,row,rule,item,numerator):null;
    if(mono&&policy.taxesInProduct){
      const sample=rtcSpecial.mono(state.settings,row,rule,item,100),zero=rtcSpecial.mono(state.settings,row,rule,item,0);
      const fixed=zero.ibsTotal+zero.cbsTotal,rate=(sample.ibsTotal+sample.cbsTotal-fixed)/100;
      if(fixed>numerator)throw Error('Tributacao monofasica supera valor do item');
      mono=rtcSpecial.mono(state.settings,row,rule,item,rounded((numerator-fixed)/(1+rate)));
    }
    const productLiquid=rounded(gross-icms-fcp-fuel.tax-difal.destination-difal.fcp-pis-cofins-(policy.taxesInProduct?reform.vIBS+reform.vCBS+reform.vIS+(mono?mono.ibsTotal+mono.cbsTotal:0):0));
    return {item,rule,gross,discount,other,net,icmsNet,icmsBase,icms,fcp,pis,cofins,pisCst,cofinsCst,reform,ipi,difal,fuel,mono,credit,productLiquid,unitLiquid:productLiquid/number(item.qty),vItem:rounded(net+ipi.value+fuel.retentionValue)};
  });
}
function fiscalTaxSummary(state,row){
  const lines=fiscalLedger(state,row),sum=(group,key)=>rounded(lines.reduce((n,l)=>n+number(group?l[group]?.[key]:l[key]),0));
  return {total:sum(null,'vItem'),icms:sum(null,'icms'),ipi:sum('ipi','value'),difal:sum('difal','destination'),fcpDestination:sum('difal','fcp'),difalRecipient:sum('difal','recipientLiability'),icmsMono:sum('fuel','value'),icmsMonoRetention:sum('fuel','retentionValue'),icmsMonoPreviouslyRetained:sum('fuel','retainedValue'),ibs:sum('reform','vIBS'),cbs:sum('reform','vCBS'),ibsMono:sum('mono','ibsTotal'),cbsMono:sum('mono','cbsTotal'),ibsCredit:sum('credit','ibs'),cbsCredit:sum('credit','cbs'),ibsCreditSuspended:sum('credit','ibsSuspended'),cbsCreditSuspended:sum('credit','cbsSuspended')};
}
function validateReformTotals(totals, netTotal, lines) {
  const errors=[];
  if(!Array.isArray(lines))return ['Conferencia fiscal exige itens calculados independentemente'];
  const sum=key=>rounded(lines.reduce((n,line)=>n+number(line[key]),0));
  if(Math.abs(sum('vItem')-rounded(netTotal))>0.01)errors.push('total geral difere da soma de vItem');
  for(const key of ['vIBSUF','vIBSMun','vIBS','vCBS','vIS','vDifIBSUF','vDifIBSMun','vDifCBS']){
    const computed=rounded(lines.reduce((n,line)=>n+number(line.reform[key]),0));
    if(Math.abs(computed-rounded(totals[key]))>0.01)errors.push(`total ${key} difere dos itens`);
  }
  if(Math.abs(rounded(totals.vIBS)-rounded(totals.vIBSUF+totals.vIBSMun-lines.reduce((n,l)=>n+number(l.credit?.deductIbs),0)))>0.01)errors.push('IBS total difere de UF + municipio');
  for(const [total,key]of [['creditIbs','ibs'],['creditCbs','cbs'],['suspendedIbs','ibsSuspended'],['suspendedCbs','cbsSuspended']]){
    if(Math.abs(number(totals[total])-rounded(lines.reduce((n,l)=>n+number(l.credit?.[key]),0)))>0.01)errors.push(`Total ${total} difere dos creditos dos itens`);
  }
  for(const key of ['ibs','cbs','ibsRetention','cbsRetention','ibsRetained','cbsRetained']){
    if(Math.abs(number(totals.mono?.[key])-rounded(lines.reduce((n,l)=>n+number(l.mono?.[key]),0)))>0.01)errors.push(`Total monofasico ${key} difere dos itens`);
  }
  return errors;
}

function generateNfeXml(state, row, options = {}) {
  const missing = validateNfeState(state, row);
  if (missing.length) throw new Error(`XML ${row.model} incompleto: ${missing.join(", ")}`);
  const settings = state.settings;
  if (row.model === "NFC-e" && !options.csc) throw new Error("XML NFC-e incompleto: CSC protegido da NFC-e");
  const customer = { ...findCustomer(state, row), document: row.customerDocument || findCustomer(state, row).document };
  // A destination override must affect both the calculation and the emitted address.
  if(row.customerUf)customer.uf=row.customerUf;
  if(row.customerCityCode)customer.cityCode=row.customerCityCode;
  const items = resolveItems(state, row);
  const key = accessKey(settings, row);
  const model = row.model === "NFC-e" ? "65" : "55";
  const totals = totalsFromItems(items, row);
  const ledger=fiscalLedger(state,row),policy=rtcPolicy(settings,row);
  totals.gross=rounded(ledger.reduce((n,l)=>n+l.gross,0));totals.net=rounded(ledger.reduce((n,l)=>n+l.vItem,0));
  const totalIpi=rounded(ledger.reduce((n,l)=>n+l.ipi.value,0));
  const sumAdvanced=(group,key)=>rounded(ledger.reduce((n,l)=>n+number(l[group]?.[key]),0));
  const difalTotals=ledger.some(l=>l.difal.xml)?`<vFCPUFDest>${decimal(sumAdvanced('difal','fcp'))}</vFCPUFDest><vICMSUFDest>${decimal(sumAdvanced('difal','destination'))}</vICMSUFDest><vICMSUFRemet>0.00</vICMSUFRemet>`:'';
  const fuelTotals=ledger.some(l=>l.fuel.active)?[['qBCMono','quantity'],['vICMSMono','value'],['qBCMonoReten','retentionQuantity'],['vICMSMonoReten','retentionValue'],['qBCMonoRet','retainedQuantity'],['vICMSMonoRet','retainedValue']].map(([tag,key])=>`<${tag}>${decimal(sumAdvanced('fuel',key))}</${tag}>`).join(''):'';
  const totalIcms=rounded(ledger.reduce((n,line)=>n+line.icms,0));
  const totalFcp=rounded(ledger.reduce((n,line)=>n+line.fcp,0));
  const totalFcpRetained=rounded(ledger.reduce((n,line)=>n+number(line.rule.retainedFcpValue),0));
  const totalIcmsBase=rounded(ledger.reduce((n,line)=>n+line.icmsBase,0));
  const totalPis=rounded(ledger.reduce((n,line)=>n+line.pis,0)),totalCofins=rounded(ledger.reduce((n,line)=>n+line.cofins,0));
  const reformTotals = { hasReform: false, base: 0, vDifIBSUF: 0, vDifIBSMun: 0, vDifCBS: 0, vIBSUF: 0, vIBSMun: 0, vIBS: 0, vCBS: 0, vIS: 0 };
  const details = ledger.map((line, index) => {
    const {item,rule,reform}=line;
    const itemTotal=line.gross,itemDiscount=line.discount,itemOther=line.other;
    const pisRate=number(rule.pisRate),cofinsRate=number(rule.cofinsRate),pisCst=line.pisCst;
    reformTotals.hasReform = reformRequired(state,row);
    reformTotals.base += reform.base;
    reformTotals.vDifIBSUF += reform.vDifIBSUF;
    reformTotals.vDifIBSMun += reform.vDifIBSMun;
    reformTotals.vDifCBS += reform.vDifCBS;
    reformTotals.vIBSUF += reform.vIBSUF;
    reformTotals.vIBSMun += reform.vIBSMun;
    reformTotals.vIBS += reform.vIBS;
    reformTotals.vCBS += reform.vCBS;
    reformTotals.vIS += reform.vIS;
    for(const [field,key] of [['creditIbs','ibs'],['creditCbs','cbs'],['suspendedIbs','ibsSuspended'],['suspendedCbs','cbsSuspended']])reformTotals[field]=number(reformTotals[field])+number(line.credit[key]);
    if(line.mono){reformTotals.mono ||= {ibs:0,cbs:0,ibsRetention:0,cbsRetention:0,ibsRetained:0,cbsRetained:0};for(const key of Object.keys(reformTotals.mono))reformTotals.mono[key]+=line.mono[key];}
    return `<det nItem="${index + 1}"><prod><cProd>${xml(item.id || item.productId || index + 1)}</cProd><cEAN>${digits(rule.barcode) || "SEM GTIN"}</cEAN><xProd>${xml(item.description || rule.description)}</xProd><NCM>${digits(rule.ncm)}</NCM>${rule.cest ? `<CEST>${digits(rule.cest)}</CEST>` : ""}${rule.taxBenefitCode?`<cBenef>${xml(rule.taxBenefitCode)}</cBenef>`:""}<CFOP>${digits(rule.cfop)}</CFOP><uCom>${xml(item.unit || rule.unit || "UN")}</uCom><qCom>${decimal(item.qty, 4)}</qCom><vUnCom>${decimal(line.gross/number(item.qty), 10)}</vUnCom><vProd>${decimal(itemTotal)}</vProd>${policy.netPriceFields && row.useNetPriceFields ? `<vUnComLiq>${decimal(line.unitLiquid,10)}</vUnComLiq><vProdLiq>${decimal(line.productLiquid)}</vProdLiq>` : ""}<cEANTrib>${digits(rule.barcode) || "SEM GTIN"}</cEANTrib><uTrib>${xml(line.fuel.unit || item.unit || rule.unit || "UN")}</uTrib><qTrib>${decimal(line.fuel.tributaryQuantity || item.qty, 4)}</qTrib><vUnTrib>${decimal(line.gross/number(line.fuel.tributaryQuantity || item.qty), 10)}</vUnTrib>${itemDiscount ? `<vDesc>${decimal(itemDiscount)}</vDesc>` : ""}${itemOther ? `<vOutro>${decimal(itemOther)}</vOutro>` : ""}<indTot>1</indTot>${line.credit.usedGoods?"<indBemMovelUsado>1</indBemMovelUsado>":""}${line.fuel.productXml}</prod><imposto><ICMS>${line.fuel.active?line.fuel.xml:icmsXml(settings, rule, line.icmsNet)}</ICMS>${line.ipi.xml}<PIS>${pisCofinsXml("PIS", line.pisCst, line.net, pisRate)}</PIS><COFINS>${pisCofinsXml("COFINS", line.cofinsCst, line.net, cofinsRate)}</COFINS>${line.difal.xml}${reformRequired(state,row) ? selectiveTaxXml(rule, reform) + ibsCbsXml(rule, reform,line) : ""}</imposto><vItem>${decimal(line.vItem)}</vItem>${itemReferenceXml(settings,row,item)}</det>`;
  }).join("");
  const reformTotalErrors = validateReformTotals(reformTotals, totals.net, ledger);
  if (reformTotalErrors.length) throw new Error(`XML ${row.model} com totalizadores da reforma invalidos: ${reformTotalErrors.join(", ")}`);
  const reformTotalAmount=rounded(ledger.reduce((n,line)=>n+line.vItem,0));
  const liquidTotalXml=policy.netPriceFields && row.useNetPriceFields?`<vProdLiqTot>${decimal(ledger.reduce((n,line)=>n+line.productLiquid,0))}</vProdLiqTot>`:'';

  const reformTotalsXml = `${reformTotals.vIS ? `<ISTot><vIS>${decimal(reformTotals.vIS)}</vIS></ISTot>` : ""}${ibsCbsTotalsXml(reformTotals)}${reformTotals.hasReform ? `<vNFTot>${decimal(reformTotalAmount)}</vNFTot>` : ""}`;
  const document = digits(customer.document);
  const recipientType=Number(row.indIEDest || (customer.taxpayerType==='Contribuinte ICMS'?1:customer.taxpayerType==='Isento'?2:9));
  const finalConsumer=row.model==='NFC-e'?1:row.finalConsumer===undefined?(recipientType===9?1:0):(row.finalConsumer?1:0);
  const destination = document ? `<dest><${document.length === 11 ? "CPF" : "CNPJ"}>${document}</${document.length === 11 ? "CPF" : "CNPJ"}><xNome>${xml(customer.name || row.customer)}</xNome><enderDest><xLgr>${xml(customer.address || "Nao informado")}</xLgr><nro>${xml(customer.number || "SN")}</nro><xBairro>${xml(customer.district || "Nao informado")}</xBairro><cMun>${digits(customer.cityCode || settings.cityCode)}</cMun><xMun>${xml(customer.city || settings.city)}</xMun><UF>${xml(customer.uf || settings.uf)}</UF><CEP>${digits(customer.cep || settings.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderDest><indIEDest>${recipientType}</indIEDest>${recipientType===1?`<IE>${digits(row.customerIE||customer.stateRegistration)}</IE>`:""}</dest>` : "";
  const isReturn = Number(row.purpose)===4 || row.operationType === "return" || row.operationType === "exchange-return";
  const paymentsSource = isReturn ? [{method:"Sem pagamento",value:0}] : row.payments?.length ? row.payments : [{ method: row.payment || "Outros", value: totals.net }];
  const payments = paymentsSource.map((pay) => `<detPag><tPag>${paymentCode(pay.method)}</tPag><vPag>${decimal(pay.value ?? totals.net)}</vPag></detPag>`).join("");
  const paidTotal = paymentsSource.reduce((sum, payment) => sum + number(payment.value), 0);
  const change = Math.max(number(row.change), paidTotal - totals.net, 0);
  const contingency = Number(row.emissionType || 1) === 9
    ? `<dhCont>${isoDateTime(row.contingencyAt)}</dhCont><xJust>${xml(row.contingencyReason || "Indisponibilidade temporaria de comunicacao com a SEFAZ")}</xJust>`
    : "";
  const reference = isReturn && !policy.returnItemReference && /^\d{44}$/.test(digits(row.referencedKey)) ? `<NFref><refNFe>${digits(row.referencedKey)}</refNFe></NFref>` : "";
  const nfe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe${key}" versao="4.00"><ide><cUF>${UF_CODES[settings.uf]}</cUF><cNF>${key.slice(35, 43)}</cNF><natOp>${xml(row.nature || (isReturn ? "Devolucao de venda" : "Venda de mercadoria"))}</natOp><mod>${model}</mod><serie>${Number(row.serie || 1)}</serie><nNF>${Number(row.number || row.id || 1)}</nNF><dhEmi>${isoDateTime(row.issuedAt || (row.date ? row.date + "T12:00:00-03:00" : new Date()))}</dhEmi><tpNF>${isReturn ? "0" : "1"}</tpNF><idDest>${advancedFiscal.recipient(state,row).uf===String(settings.uf).toUpperCase()?1:2}</idDest><cMunFG>${digits(settings.cityCode)}</cMunFG><tpImp>${model === "65" ? "4" : "1"}</tpImp><tpEmis>${Number(row.emissionType || 1)}</tpEmis><cDV>${key.slice(-1)}</cDV><tpAmb>${settings.fiscalEnvironment === "Producao" ? "1" : "2"}</tpAmb><finNFe>${Number(row.purpose || (isReturn ? 4 : 1))}</finNFe><indFinal>${finalConsumer}</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>TortelaPlus-0.1.0</verProc>${contingency}${reference}</ide><emit><CNPJ>${digits(settings.document)}</CNPJ><xNome>${xml(settings.legalName || settings.company)}</xNome><enderEmit><xLgr>${xml(settings.address)}</xLgr><nro>${xml(settings.number)}</nro><xBairro>${xml(settings.district)}</xBairro><cMun>${digits(settings.cityCode)}</cMun><xMun>${xml(settings.city)}</xMun><UF>${xml(settings.uf)}</UF><CEP>${digits(settings.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit><IE>${digits(settings.stateRegistration)}</IE><CRT>${policy.crt}</CRT></emit>${destination}${details}<total>${liquidTotalXml}<ICMSTot><vBC>${decimal(totalIcmsBase)}</vBC><vICMS>${decimal(totalIcms)}</vICMS><vICMSDeson>0.00</vICMSDeson>${difalTotals}<vFCP>${decimal(totalFcp)}</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>${decimal(totalFcpRetained)}</vFCPSTRet>${fuelTotals}<vProd>${decimal(totals.gross)}</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>${decimal(totals.discount)}</vDesc><vII>0.00</vII><vIPI>${decimal(totalIpi)}</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>${decimal(totalPis)}</vPIS><vCOFINS>${decimal(totalCofins)}</vCOFINS><vOutro>${decimal(totals.other)}</vOutro><vNF>${decimal(totals.net)}</vNF></ICMSTot>${reformTotalsXml}</total><transp><modFrete>9</modFrete></transp><pag>${payments}${change ? `<vTroco>${decimal(change)}</vTroco>` : ""}</pag>${paymentLinksXml(row)}${settings.fiscalResponsible ? `<infAdic><infCpl>${xml(`Responsavel fiscal: ${settings.fiscalResponsible}`)}</infCpl></infAdic>` : ""}</infNFe></NFe>`;
  const supplement = model === "65" ? nfceSupplement(settings, key, options) : "";
  return `<?xml version="1.0" encoding="UTF-8"?>${nfe.replace("</infNFe></NFe>", `</infNFe>${supplement}</NFe>`)}`;
}

function generateNfseXml(state,row) {
  if(state.settings?.nfseStandard==='Municipal')throw Error('NFS-e municipal deve usar o leiaute homologado do municipio; DPS nacional nao sera usada como substituta');
  return require('./nfse-rtc').generateNationalDps(state,row);
}

function generateNfseIni(state, row) {
  const settings = state.settings || {};
  const service = row.service || {};
  const customer = findCustomer(state, row);
  return [
    "[Identificacao]",
    `Numero=${Number(row.number || row.id || 1)}`,
    `Serie=${row.serie || 1}`,
    "Tipo=1",
    `DataEmissao=${new Date(row.issuedAt || Date.now()).toLocaleDateString("pt-BR")}`,
    "NaturezaOperacao=1",
    `OptanteSimplesNacional=${profile(settings).federalSimple ? 1 : 2}`,
    "IncentivadorCultural=2",
    `Competencia=${new Date().toLocaleDateString("pt-BR")}`,
    "",
    "[Prestador]",
    `Cnpj=${digits(settings.document)}`,
    `InscricaoMunicipal=${digits(settings.municipalRegistration)}`,
    "",
    "[Tomador]",
    `RazaoSocial=${customer.name || row.customer || ""}`,
    `${digits(row.customerDocument || customer.document).length === 11 ? "Cpf" : "Cnpj"}=${digits(row.customerDocument || customer.document)}`,
    `Endereco=${customer.address || ""}`,
    `Numero=${customer.number || ""}`,
    `Bairro=${customer.district || ""}`,
    `CodigoMunicipio=${digits(customer.cityCode || service.cityCode || settings.cityCode)}`,
    `Uf=${customer.uf || settings.uf || ""}`,
    `Cep=${digits(customer.cep)}`,
    `Email=${customer.email || ""}`,
    "",
    "[Servico]",
    `ItemListaServico=${service.serviceCode || ""}`,
    `CodigoCnae=${digits(service.cnae)}`,
    `CodigoTributacaoMunicipio=${service.cityServiceCode || ""}`,
    `Discriminacao=${String(service.description || row.nature || "").replace(/[\r\n]+/g, " ")}`,
    `CodigoMunicipio=${digits(service.cityCode || settings.nfseCityCode || settings.cityCode)}`,
    `ValorServicos=${decimal(row.total)}`,
    `ValorDeducoes=${decimal(row.discount)}`,
    `IssRetido=${String(service.issWithheld) === "true" ? 1 : 2}`,
    `Aliquota=${decimal(service.issRate, 4)}`
  ].join("\r\n");
}

function generateFiscalXml(state, row, options = {}) {
  return row.model === "NFS-e" ? generateNfseXml(state, row) : generateNfeXml(state, row, options);
}

function parseAcbrResponse(value) {
  const text = String(value || "");
  const capture = (patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return "";
  };
  const statusCode = capture([/(?:^|\n)cStat\s*=\s*(\d+)/i, /"cStat"\s*:\s*"?(\d+)/i]);
  const authorizedCodes = ["100", "150", "201", "202"];
  const retryableCodes = ["103", "105", "108", "109", "137", "999"];
  return {
    raw: text,
    statusCode,
    statusMessage: capture([/(?:^|\n)xMotivo\s*=\s*([^\r\n]+)/i, /"xMotivo"\s*:\s*"([^"]+)/i]),
    key: capture([/(?:^|\n)(?:chNFe|Chave)\s*=\s*(\d{44})/i, /(\d{44})/]),
    protocol: capture([/(?:^|\n)nProt\s*=\s*(\d+)/i, /"nProt"\s*:\s*"?(\d+)/i]),
    authorized: authorizedCodes.includes(statusCode),
    retryable: !statusCode || retryableCodes.includes(statusCode)
  };
}

function importNfeXml(content) {
  const text = String(content || "");
  if (!/<(?:\w+:)?NFe\b/.test(text) && !/<(?:\w+:)?nfeProc\b/.test(text)) throw new Error("Arquivo nao contem NF-e.");
  const pick = (tag) => text.match(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)<\\/(?:\\w+:)?${tag}>`, "i"))?.[1] || "";
  const items = [...text.matchAll(/<(?:\w+:)?det\b[^>]*>([\s\S]*?)<\/(?:\w+:)?det>/gi)].map((match) => {
    const block = match[1];
    const itemPick = (tag) => block.match(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)<\\/(?:\\w+:)?${tag}>`, "i"))?.[1] || "";
    return { productCode: itemPick("cProd"), description: itemPick("xProd"), ncm: itemPick("NCM"), cfop: itemPick("CFOP"), unit: itemPick("uCom"), qty: Number(itemPick("qCom") || 0), price: Number(itemPick("vUnCom") || 0), total: Number(itemPick("vProd") || 0) };
  });
  return { key: pick("chNFe") || text.match(/Id="NFe(\d{44})"/)?.[1] || "", number: pick("nNF"), serie: pick("serie"), issuedAt: pick("dhEmi"), supplierDocument: pick("CNPJ"), supplierName: pick("xNome"), total: Number(pick("vNF") || 0), protocol: pick("nProt"), items };
}

module.exports = {
  fiscalTaxSummary,
  fiscalLedger,
  validateReformTotals,
  generateFiscalXml,
  generateNfeXml,
  generateNfseXml,
  generateNfseIni,
  validateNfeState,
  parseAcbrResponse,
  importNfeXml
};

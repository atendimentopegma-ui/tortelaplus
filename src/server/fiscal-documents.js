const crypto = require("crypto");

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

function isoDateTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().replace(/\.\d{3}Z$/, "-03:00");
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
  const issued = new Date(row.issuedAt || row.date || Date.now());
  const yearMonth = `${String(issued.getFullYear()).slice(-2)}${String(issued.getMonth() + 1).padStart(2, "0")}`;
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
    && candidate.uf === state.settings.uf
    && (!candidate.validFrom || candidate.validFrom <= new Date().toISOString().slice(0, 10))
    && (!candidate.validTo || candidate.validTo >= new Date().toISOString().slice(0, 10))
  ) || {};
  return { ...product, ...rule, ...item };
}

function icmsXml(settings, rule, value) {
  const origin = digits(rule.origin || "0").slice(0, 1);
  if (settings.regime === "Simples Nacional") {
    const csosn = digits(rule.csosn || rule.cst || "102").padStart(3, "0");
    if (csosn === "101") {
      const rate = Number(rule.creditRate || rule.icmsCreditRate || 0);
      return `<ICMSSN101><orig>${origin}</orig><CSOSN>101</CSOSN><pCredSN>${decimal(rate, 4)}</pCredSN><vCredICMSSN>${decimal(value * rate / 100)}</vCredICMSSN></ICMSSN101>`;
    }
    if (["201", "202", "203"].includes(csosn)) {
      const mva = Number(rule.mvaRate || 0);
      const rate = Number(rule.icmsRate || 0);
      const base = value * (1 + mva / 100);
      return `<ICMSSN202><orig>${origin}</orig><CSOSN>${csosn}</CSOSN><modBCST>4</modBCST><pMVAST>${decimal(mva, 4)}</pMVAST><vBCST>${decimal(base)}</vBCST><pICMSST>${decimal(rate, 4)}</pICMSST><vICMSST>${decimal(base * rate / 100)}</vICMSST></ICMSSN202>`;
    }
    return `<ICMSSN102><orig>${origin}</orig><CSOSN>${csosn}</CSOSN></ICMSSN102>`;
  }
  const cst = digits(rule.cst || "00").padStart(2, "0");
  const rate = Number(rule.icmsRate || 0);
  if (["40", "41", "50"].includes(cst)) {
    return `<ICMS40><orig>${origin}</orig><CST>${cst}</CST>${rule.taxBenefitCode ? `<cBenef>${xml(rule.taxBenefitCode)}</cBenef>` : ""}</ICMS40>`;
  }
  if (cst === "20") {
    const reduction = Number(rule.baseReductionRate || 0);
    const base = value * (1 - reduction / 100);
    return `<ICMS20><orig>${origin}</orig><CST>20</CST><modBC>3</modBC><pRedBC>${decimal(reduction, 4)}</pRedBC><vBC>${decimal(base)}</vBC><pICMS>${decimal(rate, 4)}</pICMS><vICMS>${decimal(base * rate / 100)}</vICMS></ICMS20>`;
  }
  return `<ICMS00><orig>${origin}</orig><CST>${cst}</CST><modBC>3</modBC><vBC>${decimal(value)}</vBC><pICMS>${decimal(rate, 4)}</pICMS><vICMS>${decimal(value * rate / 100)}</vICMS></ICMS00>`;
}

function paymentCode(method) {
  const key = String(method || "").toLowerCase();
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
  const gross = items.reduce((sum, item) => sum + number(item.qty) * number(item.price), 0);
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
  return number(rule[primary] || rule[fallback]);
}

function reformEffectiveRate(rate, reduction) {
  return Math.max(0, number(rate) * (1 - Math.min(Math.max(number(reduction), 0), 100) / 100));
}

function reformReductionXml(rate, reduction) {
  if (!number(reduction)) return "";
  return `<gRed><pRedAliq>${decimal(reduction, 4)}</pRedAliq><pAliqEfet>${decimal(reformEffectiveRate(rate, reduction), 4)}</pAliqEfet></gRed>`;
}

function reformValues(rule, base) {
  const reduction = number(rule.reformReductionRate);
  const ibsUfRate = reformRate(rule, "ibsUfRate", "ibsRate");
  const ibsCityRate = reformRate(rule, "ibsCityRate", "ibsRate");
  const cbsRate = reformRate(rule, "cbsFederalRate", "cbsRate");
  const ibsUfEffective = reformEffectiveRate(ibsUfRate, reduction);
  const ibsCityEffective = reformEffectiveRate(ibsCityRate, reduction);
  const cbsEffective = reformEffectiveRate(cbsRate, reduction);
  const vIBSUF = base * ibsUfEffective / 100;
  const vIBSMun = base * ibsCityEffective / 100;
  const vCBS = base * cbsEffective / 100;
  return {
    base,
    reduction,
    ibsUfRate,
    ibsCityRate,
    cbsRate,
    vIBSUF,
    vIBSMun,
    vIBS: vIBSUF + vIBSMun,
    vCBS,
    selectiveRate: number(rule.selectiveTaxRate),
    vIS: base * number(rule.selectiveTaxRate) / 100
  };
}

function ibsCbsXml(rule, values) {
  const cst = digits(rule.ibsCbsCst || "000").padStart(3, "0").slice(0, 3);
  const cClassTrib = digits(rule.ibsClass || rule.cbsClass || "000001").padStart(6, "0").slice(0, 6);
  return `<IBSCBS><CST>${cst}</CST><cClassTrib>${cClassTrib}</cClassTrib><gIBSCBS><vBC>${decimal(values.base)}</vBC><gIBSUF><pIBSUF>${decimal(values.ibsUfRate, 4)}</pIBSUF>${reformReductionXml(values.ibsUfRate, values.reduction)}<vIBSUF>${decimal(values.vIBSUF)}</vIBSUF></gIBSUF><gIBSMun><pIBSMun>${decimal(values.ibsCityRate, 4)}</pIBSMun>${reformReductionXml(values.ibsCityRate, values.reduction)}<vIBSMun>${decimal(values.vIBSMun)}</vIBSMun></gIBSMun><vIBS>${decimal(values.vIBS)}</vIBS><gCBS><pCBS>${decimal(values.cbsRate, 4)}</pCBS>${reformReductionXml(values.cbsRate, values.reduction)}<vCBS>${decimal(values.vCBS)}</vCBS></gCBS></gIBSCBS></IBSCBS>`;
}

function selectiveTaxXml(rule, values) {
  if (!values.selectiveRate) return "";
  const cst = digits(rule.selectiveTaxCst || rule.ibsCbsCst || "000").padStart(3, "0").slice(0, 3);
  const cClassTrib = digits(rule.selectiveTaxClass || rule.ibsClass || "000001").padStart(6, "0").slice(0, 6);
  return `<IS><CSTIS>${cst}</CSTIS><cClassTribIS>${cClassTrib}</cClassTribIS><vBCIS>${decimal(values.base)}</vBCIS><pIS>${decimal(values.selectiveRate, 4)}</pIS><vIS>${decimal(values.vIS)}</vIS></IS>`;
}

function ibsCbsTotalsXml(totals) {
  if (!totals.hasReform) return "";
  return `<IBSCBSTot><vBCIBSCBS>${decimal(totals.base)}</vBCIBSCBS><gIBS><gIBSUF><vDif>0.00</vDif><vDevTrib>0.00</vDevTrib><vIBSUF>${decimal(totals.vIBSUF)}</vIBSUF></gIBSUF><gIBSMun><vDif>0.00</vDif><vDevTrib>0.00</vDevTrib><vIBSMun>${decimal(totals.vIBSMun)}</vIBSMun></gIBSMun><vIBS>${decimal(totals.vIBS)}</vIBS><vCredPres>0.00</vCredPres><vCredPresCondSus>0.00</vCredPresCondSus></gIBS><gCBS><vDif>0.00</vDif><vDevTrib>0.00</vDevTrib><vCBS>${decimal(totals.vCBS)}</vCBS><vCredPres>0.00</vCredPres><vCredPresCondSus>0.00</vCredPresCondSus></gCBS></IBSCBSTot>`;
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
  const validRegimes = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];
  if (!validRegimes.includes(settings.regime)) missing.push("regime tributario valido");
  if (!UF_CODES[String(settings.uf || "").toUpperCase()]) missing.push("UF valida do emitente");
  if (digits(settings.document).length !== 14) missing.push("CNPJ do emitente");
  if (!settings.stateRegistration) missing.push("inscricao estadual");
  if (!settings.cityCode) missing.push("codigo IBGE do municipio do emitente");
  if (!settings.address || !settings.number || !settings.district || !settings.city || digits(settings.cep).length !== 8) missing.push("endereco completo do emitente");
  if (![55, 65].includes(Number(row.model === "NFC-e" ? 65 : 55))) missing.push("modelo fiscal");
  if (Number(row.serie || 1) <= 0 || Number(row.number || row.id || 0) <= 0) missing.push("serie e numero validos");
  const items = resolveItems(state, row);
  if (!items.length) missing.push("itens da nota");
  items.forEach((item, index) => {
    const rule = itemRule(state, row, item);
    if (!rule.ncm) missing.push(`NCM do item ${index + 1}`);
    if (!rule.cfop) missing.push(`CFOP do item ${index + 1}`);
    if (settings.regime === "Simples Nacional" && digits(rule.csosn).length !== 3) missing.push(`CSOSN do item ${index + 1}`);
    if (settings.regime !== "Simples Nacional" && digits(rule.cst).length !== 2) missing.push(`CST do item ${index + 1}`);
    if (digits(rule.pisCofinsCst).length !== 2) missing.push(`CST PIS/COFINS do item ${index + 1}`);
    if (Number(item.qty || 0) <= 0 || Number(item.price || 0) <= 0) missing.push(`quantidade/preco do item ${index + 1}`);
  });
  if (row.model === "NF-e" && !digits(row.customerDocument || findCustomer(state, row).document)) missing.push("CPF/CNPJ do destinatario da NF-e");
  const totals = totalsFromItems(items, row);
  const paymentTotal = (row.payments || [{ value: row.total || totals.net }]).reduce((sum, payment) => sum + number(payment.value), 0);
  const change = Math.max(number(row.change), paymentTotal - totals.net, 0);
  if (Math.abs(paymentTotal - totals.net - change) > 0.01) missing.push("total dos pagamentos igual ao total da nota");
  if (row.model === "NFC-e" && (!settings.cscConfigured || !settings.cscId)) missing.push("CSC e ID CSC da NFC-e");
  return [...new Set(missing)];
}

function generateNfeXml(state, row, options = {}) {
  const missing = validateNfeState(state, row);
  if (missing.length) throw new Error(`XML ${row.model} incompleto: ${missing.join(", ")}`);
  const settings = state.settings;
  if (row.model === "NFC-e" && !options.csc) throw new Error("XML NFC-e incompleto: CSC protegido da NFC-e");
  const customer = { ...findCustomer(state, row), document: row.customerDocument || findCustomer(state, row).document };
  const items = resolveItems(state, row);
  const key = accessKey(settings, row);
  const model = row.model === "NFC-e" ? "65" : "55";
  const totals = totalsFromItems(items, row);
  let allocatedDiscount = 0;
  let allocatedOther = 0;
  const totalIcms = items.reduce((sum, item) => {
    const rule = itemRule(state, row, item);
    const itemGross = number(item.qty) * number(item.price);
    return sum + (settings.regime === "Simples Nacional" ? 0 : itemGross * number(rule.icmsRate) / 100);
  }, 0);
  const totalPis = items.reduce((sum, item) => sum + number(item.qty) * number(item.price) * number(itemRule(state, row, item).pisRate) / 100, 0);
  const totalCofins = items.reduce((sum, item) => sum + number(item.qty) * number(item.price) * number(itemRule(state, row, item).cofinsRate) / 100, 0);
  const reformTotals = { hasReform: false, base: 0, vIBSUF: 0, vIBSMun: 0, vIBS: 0, vCBS: 0, vIS: 0 };
  const details = items.map((item, index) => {
    const rule = itemRule(state, row, item);
    const itemTotal = number(item.qty) * number(item.price);
    const itemDiscount = splitValue(totals.discount, totals.gross, itemTotal, index, items.length, allocatedDiscount);
    const itemOther = splitValue(totals.other, totals.gross, itemTotal, index, items.length, allocatedOther);
    allocatedDiscount += itemDiscount;
    allocatedOther += itemOther;
    const pisRate = Number(rule.pisRate || 0);
    const cofinsRate = Number(rule.cofinsRate || 0);
    const pisCst = digits(rule.pisCofinsCst || "01").padStart(2, "0");
    const reformBase = Math.max(0, itemTotal - itemDiscount + itemOther);
    const reform = reformValues(rule, reformBase);
    reformTotals.hasReform = true;
    reformTotals.base += reform.base;
    reformTotals.vIBSUF += reform.vIBSUF;
    reformTotals.vIBSMun += reform.vIBSMun;
    reformTotals.vIBS += reform.vIBS;
    reformTotals.vCBS += reform.vCBS;
    reformTotals.vIS += reform.vIS;
    return `<det nItem="${index + 1}"><prod><cProd>${xml(item.id || item.productId || index + 1)}</cProd><cEAN>${digits(rule.barcode) || "SEM GTIN"}</cEAN><xProd>${xml(item.description || rule.description)}</xProd><NCM>${digits(rule.ncm)}</NCM>${rule.cest ? `<CEST>${digits(rule.cest)}</CEST>` : ""}<CFOP>${digits(rule.cfop)}</CFOP><uCom>${xml(item.unit || rule.unit || "UN")}</uCom><qCom>${decimal(item.qty, 4)}</qCom><vUnCom>${decimal(item.price, 10)}</vUnCom><vProd>${decimal(itemTotal)}</vProd><cEANTrib>${digits(rule.barcode) || "SEM GTIN"}</cEANTrib><uTrib>${xml(item.unit || rule.unit || "UN")}</uTrib><qTrib>${decimal(item.qty, 4)}</qTrib><vUnTrib>${decimal(item.price, 10)}</vUnTrib>${itemDiscount ? `<vDesc>${decimal(itemDiscount)}</vDesc>` : ""}${itemOther ? `<vOutro>${decimal(itemOther)}</vOutro>` : ""}<indTot>1</indTot></prod><imposto><ICMS>${icmsXml(settings, rule, itemTotal)}</ICMS><PIS>${pisCofinsXml("PIS", pisCst, itemTotal, pisRate)}</PIS><COFINS>${pisCofinsXml("COFINS", pisCst, itemTotal, cofinsRate)}</COFINS>${selectiveTaxXml(rule, reform)}${ibsCbsXml(rule, reform)}</imposto></det>`;
  }).join("");
  const reformTotalsXml = `${reformTotals.vIS ? `<ISTot><vIS>${decimal(reformTotals.vIS)}</vIS></ISTot>` : ""}${ibsCbsTotalsXml(reformTotals)}${reformTotals.hasReform ? `<vNFTot>${decimal(totals.net + reformTotals.vIBS + reformTotals.vCBS + reformTotals.vIS)}</vNFTot>` : ""}`;
  const document = digits(customer.document);
  const destination = document ? `<dest><${document.length === 11 ? "CPF" : "CNPJ"}>${document}</${document.length === 11 ? "CPF" : "CNPJ"}><xNome>${xml(customer.name || row.customer)}</xNome><enderDest><xLgr>${xml(customer.address || "Nao informado")}</xLgr><nro>${xml(customer.number || "SN")}</nro><xBairro>${xml(customer.district || "Nao informado")}</xBairro><cMun>${digits(customer.cityCode || settings.cityCode)}</cMun><xMun>${xml(customer.city || settings.city)}</xMun><UF>${xml(customer.uf || settings.uf)}</UF><CEP>${digits(customer.cep || settings.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderDest><indIEDest>9</indIEDest></dest>` : "";
  const paymentsSource = row.payments?.length ? row.payments : [{ method: row.payment || "Outros", value: totals.net }];
  const payments = paymentsSource.map((pay) => `<detPag><tPag>${paymentCode(pay.method)}</tPag><vPag>${decimal(pay.value || totals.net)}</vPag></detPag>`).join("");
  const paidTotal = paymentsSource.reduce((sum, payment) => sum + number(payment.value), 0);
  const change = Math.max(number(row.change), paidTotal - totals.net, 0);
  const contingency = Number(row.emissionType || 1) === 9
    ? `<dhCont>${isoDateTime(row.contingencyAt)}</dhCont><xJust>${xml(row.contingencyReason || "Indisponibilidade temporaria de comunicacao com a SEFAZ")}</xJust>`
    : "";
  const isReturn = row.operationType === "return" || row.operationType === "exchange-return";
  const reference = isReturn && /^\d{44}$/.test(digits(row.referencedKey)) ? `<NFref><refNFe>${digits(row.referencedKey)}</refNFe></NFref>` : "";
  const nfe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe${key}" versao="4.00"><ide><cUF>${UF_CODES[settings.uf]}</cUF><cNF>${key.slice(35, 43)}</cNF><natOp>${xml(row.nature || (isReturn ? "Devolucao de venda" : "Venda de mercadoria"))}</natOp><mod>${model}</mod><serie>${Number(row.serie || 1)}</serie><nNF>${Number(row.number || row.id || 1)}</nNF><dhEmi>${isoDateTime(row.issuedAt)}</dhEmi><tpNF>${isReturn ? "0" : "1"}</tpNF><idDest>1</idDest><cMunFG>${digits(settings.cityCode)}</cMunFG><tpImp>${model === "65" ? "4" : "1"}</tpImp><tpEmis>${Number(row.emissionType || 1)}</tpEmis><cDV>${key.slice(-1)}</cDV><tpAmb>${settings.fiscalEnvironment === "Producao" ? "1" : "2"}</tpAmb><finNFe>${isReturn ? "4" : "1"}</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>TortelaPlus-0.1.0</verProc>${contingency}${reference}</ide><emit><CNPJ>${digits(settings.document)}</CNPJ><xNome>${xml(settings.company)}</xNome><enderEmit><xLgr>${xml(settings.address)}</xLgr><nro>${xml(settings.number)}</nro><xBairro>${xml(settings.district)}</xBairro><cMun>${digits(settings.cityCode)}</cMun><xMun>${xml(settings.city)}</xMun><UF>${xml(settings.uf)}</UF><CEP>${digits(settings.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit><IE>${digits(settings.stateRegistration)}</IE><CRT>${settings.regime === "Simples Nacional" ? "1" : "3"}</CRT></emit>${destination}${details}<total><ICMSTot><vBC>${settings.regime === "Simples Nacional" ? "0.00" : decimal(totals.gross)}</vBC><vICMS>${decimal(totalIcms)}</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet><vProd>${decimal(totals.gross)}</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>${decimal(totals.discount)}</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>${decimal(totalPis)}</vPIS><vCOFINS>${decimal(totalCofins)}</vCOFINS><vOutro>${decimal(totals.other)}</vOutro><vNF>${decimal(totals.net)}</vNF></ICMSTot>${reformTotalsXml}</total><transp><modFrete>9</modFrete></transp><pag>${payments}${change ? `<vTroco>${decimal(change)}</vTroco>` : ""}</pag>${settings.fiscalResponsible ? `<infAdic><infCpl>${xml(`Responsavel fiscal: ${settings.fiscalResponsible}`)}</infCpl></infAdic>` : ""}</infNFe></NFe>`;
  const supplement = model === "65" ? nfceSupplement(settings, key, options) : "";
  return `<?xml version="1.0" encoding="UTF-8"?>${nfe.replace("</infNFe></NFe>", `</infNFe>${supplement}</NFe>`)}`;
}

function generateNfseXml(state, row) {
  const settings = state.settings || {};
  const service = row.service || {};
  const missing = [];
  if (digits(settings.document).length !== 14) missing.push("CNPJ do prestador");
  if (!settings.municipalRegistration) missing.push("inscricao municipal");
  if (!settings.nfseCityCode && !settings.cityCode) missing.push("codigo IBGE do municipio");
  if (settings.nfseStandard === "Municipal" && !settings.nfseProvider) missing.push("provedor municipal de NFS-e");
  if (!service.serviceCode || !service.description || Number(row.total || 0) <= 0) missing.push("servico, discriminacao e valor");
  if (missing.length) throw new Error(`DPS NFS-e incompleta: ${missing.join(", ")}`);
  const id = `DPS${digits(settings.document)}${String(row.serie || 1).padStart(5, "0")}${fiscalNumber(row)}`;
  return `<?xml version="1.0" encoding="UTF-8"?><DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00"><infDPS Id="${id}"><tpAmb>${settings.fiscalEnvironment === "Producao" ? "1" : "2"}</tpAmb><dhEmi>${isoDateTime(row.issuedAt)}</dhEmi><verAplic>PegmaPlus-0.1.0</verAplic><serie>${xml(row.serie || "1")}</serie><nDPS>${Number(row.number || row.id || 1)}</nDPS><dCompet>${new Date().toISOString().slice(0, 10)}</dCompet><tpEmit>1</tpEmit><cLocEmi>${digits(settings.nfseCityCode || settings.cityCode)}</cLocEmi><prest><CNPJ>${digits(settings.document)}</CNPJ><IM>${digits(settings.municipalRegistration)}</IM></prest><serv><locPrest><cLocPrestacao>${digits(service.cityCode || settings.nfseCityCode || settings.cityCode)}</cLocPrestacao></locPrest><cServ><cTribNac>${digits(service.serviceCode)}</cTribNac>${service.cityServiceCode ? `<cTribMun>${digits(service.cityServiceCode)}</cTribMun>` : ""}<xDescServ>${xml(service.description)}</xDescServ></cServ></serv><valores><vServPrest><vServ>${decimal(row.total)}</vServ></vServPrest></valores></infDPS></DPS>`;
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
    `OptanteSimplesNacional=${settings.regime === "Simples Nacional" ? 1 : 2}`,
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
  generateFiscalXml,
  generateNfeXml,
  generateNfseXml,
  generateNfseIni,
  validateNfeState,
  parseAcbrResponse,
  importNfeXml
};

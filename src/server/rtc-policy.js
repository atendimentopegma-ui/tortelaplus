const {profile}=require('../fiscal-regimes');
// Sources and activation dates are pinned: publication is not automatic activation.
const RTC_RELEASE = {
  version: "RTC-2026-10-19-MULTI",
  nfe: "NT 2025.002 v1.52", netPrices: "NT 2026.008 v1.00", payments: "NT 2026.006 v1.00",
  homologation: "2026-10-26", production: "2026-11-16",
  source: "https://www.nfe.fazenda.gov.br/portal/informe.aspx?AspxAutoDetectCookieSupport=1&Informe=p51cQJEX57A%3D&ehCTG=false"
};
function fiscalDate(row = {}) {
  const value = String(row.issuedAt || row.date || new Date().toISOString());
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw Error("Data de emissao invalida");
  return new Date(date.getTime()-10800000).toISOString().slice(0,10);
}
function rtcPolicy(settings = {}, row = {}) {
  const date=fiscalDate(row),year=Number(date.slice(0,4));
  const crt=profile(settings).crt;
  const production=settings.fiscalEnvironment === "Producao";
  const activated=date >= (production ? RTC_RELEASE.production : RTC_RELEASE.homologation);
  // Mandatory fiscal reporting policy is distinct from the UB12-10 rejection,
  // whose production activation remains future in NT 1.52.
  const legalReporting = crt === "3" || (['1','2','4'].includes(crt) && year >= 2027);
  const emit=legalReporting || settings.reformRegularRegime === true || row.includeIbsCbs === true;
  return {version:RTC_RELEASE.version,date,year,crt,production,emit,ub12Rejection:!production && crt==='3' && row.model==='NF-e' && date>='2026-07-01',
    returnItemReference:activated, netPriceFields:activated,
    taxesInProduct:activated && year>=2027,
    splitPaymentAllowed:!production || year>=2027,
    standardRates:year<=2026?{ibsUfRate:0.1,ibsCityRate:0,cbsRate:0.9}:year<=2028?{ibsUfRate:0.05,ibsCityRate:0.05,cbsRate:null}:null};
}
module.exports={RTC_RELEASE,fiscalDate,rtcPolicy};

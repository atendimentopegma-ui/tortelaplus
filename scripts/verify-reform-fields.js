const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireText(source, text, label) {
  assert(source.includes(text), `${label} ausente: ${text}`);
}

const app = read("src/app.js");
const fiscalDocuments = read("src/server/fiscal-documents.js");
const server = read("server.js");

[
  "product-class-trib",
  "product-reform-cst",
  "product-cbs-rate",
  "product-ibs-uf-rate",
  "product-ibs-city-rate",
  "product-reform-reduction",
  "product-reform-deferral",
  "product-presumed-credit",
  "product-selective-tax",
  "product-selective-tax-cst",
  "product-selective-tax-class",
  "product-reform-monophase",
  "product-ad-rem-rate",
  "product-ad-rem-unit"
].forEach((id) => requireText(app, id, "Campo de produto da reforma fiscal"));

[
  "rule-ibs-cbs-cst",
  "rule-ibs",
  "rule-cbs",
  "rule-cbs-federal-rate",
  "rule-ibs-uf-rate",
  "rule-ibs-city-rate",
  "rule-presumed-credit-rate",
  "rule-reform-reduction-rate",
  "rule-reform-deferral-rate",
  "rule-selective-rate",
  "rule-selective-cst",
  "rule-selective-class",
  "rule-monophase",
  "rule-ad-rem-rate",
  "rule-ad-rem-unit"
].forEach((id) => requireText(app, id, "Campo de regra fiscal da reforma"));

[
  "ibsCbsCst:",
  "ibsUfRate:",
  "ibsCityRate:",
  "cbsFederalRate:",
  "presumedCreditRate:",
  "reformReductionRate:",
  "reformDeferralRate:",
  "selectiveTaxCst:",
  "selectiveTaxClass:",
  "monophase:",
  "adRemRate:",
  "adRemUnit:"
].forEach((field) => {
  requireText(app, field, "Persistencia da regra fiscal");
  requireText(server, field, "Estado inicial do servidor");
});

[
  "reform.deferral",
  "reform.selectiveTaxCst",
  "reform.selectiveTaxClass",
  "reform.monophase",
  "reform.adRemRate",
  "reform.adRemUnit"
].forEach((field) => requireText(fiscalDocuments, field, "Mapeamento fiscal produto/regra"));

[
  "diferimento=",
  "seletivoCst=",
  "seletivoClass=",
  "monofasico=",
  "adRem=",
  "unidadeAdRem="
].forEach((attr) => requireText(app, attr, "Previa XML da reforma fiscal"));

console.log("OK - campos da reforma fiscal IBS/CBS/IS validados.");

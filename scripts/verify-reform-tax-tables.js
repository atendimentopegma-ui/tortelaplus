const { validateNfeState } = require("../src/server/fiscal-documents");
const { DEFAULT_REFORM_TAX_TABLES, normalizeTables, validateClassificationPair, validateReformTaxTables } = require("../src/server/reform-tax-tables");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const normalized = normalizeTables(DEFAULT_REFORM_TAX_TABLES);
assert(normalized.version.includes("IT-2025.002"), "Tabela baseline sem versao do Informe Tecnico.");
assert(!validateReformTaxTables(normalized).length, "Tabela baseline da reforma deve ser valida.");
assert(!validateClassificationPair(normalized, { cst: "000", classTrib: "000001", model: "NF-e" }).length, "Par CST/cClassTrib baseline deveria ser aceito para NF-e.");
assert(validateClassificationPair(normalized, { cst: "000", classTrib: "999999", model: "NF-e" }).length, "cClassTrib inexistente deveria ser rejeitado.");
assert(validateClassificationPair(normalized, { cst: "000", classTrib: "000001", model: "NFS-e" }).length, "cClassTrib NF-e/NFC-e nao deveria ser aceito para NFS-e.");

const state = {
  settings: {
    company: "Tortela",
    document: "12345678000195",
    stateRegistration: "110042490114",
    regime: "Simples Nacional",
    uf: "SP",
    cityCode: "3552502",
    address: "Rua Fiscal",
    number: "100",
    district: "Centro",
    city: "Suzano",
    cep: "08600000",
    fiscalEnvironment: "Homologacao",
    cscConfigured: true,
    cscId: "1"
  },
  reformTaxTables: normalized,
  people: [],
  products: [{ id: 1, description: "Item", ncm: "19059090", cfop: "5102", csosn: "102" }],
  fiscalRules: [{
    active: true,
    model: "NFC-e",
    regime: "Simples Nacional",
    uf: "SP",
    ncm: "19059090",
    cfop: "5102",
    csosn: "102",
    pisCofinsCst: "49",
    ibsCbsCst: "000",
    ibsClass: "999999",
    cbsClass: "999999"
  }]
};

const errors = validateNfeState(state, {
  id: 1,
  model: "NFC-e",
  customer: "Consumidor",
  total: 10,
  items: [{ id: 1, qty: 1, price: 10 }]
});

assert(errors.some((text) => text.includes("cClassTrib 999999 nao permitido")), "NF-e/NFC-e deve rejeitar cClassTrib fora da tabela oficial carregada.");

console.log("OK - tabelas da reforma fiscal validadas para CST/cClassTrib e modelos NF-e/NFC-e.");

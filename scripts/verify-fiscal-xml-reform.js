const { generateNfeXml, validateNfeState } = require("../src/server/fiscal-documents");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function tagValues(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}>([^<]*)</${tag}>`, "g"))].map((match) => Number(match[1]));
}

function lastTag(xml, tag) {
  const values = tagValues(xml, tag);
  return values[values.length - 1];
}

function sum(values, count) {
  return values.slice(0, count).reduce((total, value) => total + value, 0);
}

function almostEqual(left, right, label) {
  assert(Math.abs(Number(left) - Number(right)) <= 0.01, `${label}: ${left} != ${right}`);
}

const baseState = {
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
    cscId: "1",
    nfceQrCodeUrl: "https://www.homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx",
    nfceConsultaUrl: "https://www.homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/"
  },
  reformTaxTables: {
    version: "IT-2025.002-v1.60-baseline",
    publishedAt: "2026-06-23",
    cstIndicators: [{ cst: "000", description: "Tributacao integral" }],
    classTrib: [{ code: "000001", cst: "000", description: "Tributacao integral", models: ["NF-e", "NFC-e"] }]
  },
  people: [
    {
      id: 1,
      name: "Cliente Fiscal",
      document: "11144477735",
      address: "Rua Cliente",
      number: "10",
      district: "Centro",
      cityCode: "3552502",
      city: "Suzano",
      uf: "SP",
      cep: "08600000"
    }
  ],
  products: [
    {
      id: 7001,
      description: "Torta fiscal",
      barcode: "7890000007001",
      unit: "UN",
      ncm: "19059090",
      cfop: "5102",
      cst: "102",
      csosn: "102"
    }
  ],
  fiscalRules: [
    {
      id: 1,
      active: true,
      model: "NF-e",
      regime: "Simples Nacional",
      uf: "SP",
      cfop: "5102",
      cst: "102",
      csosn: "102",
      ncm: "19059090",
      origin: "0",
      pisCofinsCst: "49",
      ibsCbsCst: "000",
      ibsClass: "000001",
      cbsClass: "000001",
      ibsUfRate: 0.1,
      ibsCityRate: 0.05,
      cbsFederalRate: 0.9,
      reformReductionRate: 20,
      reformDeferralRate: 10,
      selectiveTaxRate: 0.2,
      selectiveTaxCst: "000",
      selectiveTaxClass: "000001"
    },
    {
      id: 2,
      active: true,
      model: "NFC-e",
      regime: "Simples Nacional",
      uf: "SP",
      cfop: "5102",
      cst: "102",
      csosn: "102",
      ncm: "19059090",
      origin: "0",
      pisCofinsCst: "49",
      ibsCbsCst: "000",
      ibsClass: "000001",
      cbsClass: "000001",
      ibsUfRate: 0.1,
      ibsCityRate: 0.05,
      cbsFederalRate: 0.9,
      reformReductionRate: 20,
      reformDeferralRate: 10,
      selectiveTaxRate: 0.2,
      selectiveTaxCst: "000",
      selectiveTaxClass: "000001"
    }
  ],
  sales: []
};

function row(model) {
  return {
    id: model === "NF-e" ? 101 : 102,
    model,
    customer: "Cliente Fiscal",
    customerDocument: model === "NF-e" ? "11144477735" : "",
    total: 100,
    payment: "PIX",
    items: [{ id: 7001, description: "Torta fiscal", unit: "UN", qty: 2, price: 50 }]
  };
}

function validateXml(model) {
  const xml = generateNfeXml(baseState, row(model), { csc: "SEGREDO-CSC" });
  [
    "<IBSCBS>",
    "<gIBSCBS>",
    "<gIBSUF>",
    "<gIBSMun>",
    "<gCBS>",
    "<IS>",
    "<ISTot>",
    "<IBSCBSTot>",
    "<vNFTot>"
  ].forEach((text) => assert(xml.includes(text), `${model} sem grupo/tag da reforma: ${text}`));

  const itemCount = row(model).items.length;
  almostEqual(lastTag(xml, "vIBSUF"), sum(tagValues(xml, "vIBSUF"), itemCount), `${model} total vIBSUF`);
  almostEqual(lastTag(xml, "vIBSMun"), sum(tagValues(xml, "vIBSMun"), itemCount), `${model} total vIBSMun`);
  almostEqual(lastTag(xml, "vIBS"), sum(tagValues(xml, "vIBS"), itemCount), `${model} total vIBS`);
  almostEqual(lastTag(xml, "vCBS"), sum(tagValues(xml, "vCBS"), itemCount), `${model} total vCBS`);
  almostEqual(lastTag(xml, "vIS"), sum(tagValues(xml, "vIS"), itemCount), `${model} total vIS`);

  const expectedVnftot = 100 + lastTag(xml, "vIBS") + lastTag(xml, "vCBS") + lastTag(xml, "vIS");
  almostEqual(lastTag(xml, "vNFTot"), expectedVnftot, `${model} vNFTot`);
}

validateXml("NF-e");
validateXml("NFC-e");

const invalid = structuredClone(baseState);
invalid.fiscalRules[0].ibsClass = "123";
invalid.fiscalRules[0].selectiveTaxClass = "";
invalid.settings.cityCode = "355";
const errors = validateNfeState(invalid, row("NF-e")).join(" | ");
assert(errors.includes("codigo IBGE do municipio do emitente"), "Rejeicao local nao pegou codigo municipal do emitente.");
assert(errors.includes("classificacao tributaria IBS/CBS do item 1"), "Rejeicao local nao pegou classificacao IBS/CBS.");
assert(errors.includes("classificacao do Imposto Seletivo do item 1"), "Rejeicao local nao pegou classificacao IS.");

console.log("OK - XML NF-e/NFC-e da reforma fiscal validado com grupos, totalizadores e rejeicoes locais.");

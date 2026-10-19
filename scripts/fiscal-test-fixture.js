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
      ibsCityRate: 0,
      cbsFederalRate: 0.9,
      reformReductionRate: 0,
      reformDeferralRate: 0,
      selectiveTaxRate: 0,
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
      ibsCityRate: 0,
      cbsFederalRate: 0.9,
      reformReductionRate: 0,
      reformDeferralRate: 0,
      selectiveTaxRate: 0,
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
    date: "2026-10-19",
    includeIbsCbs: true,
    customer: "Cliente Fiscal",
    customerDocument: model === "NF-e" ? "11144477735" : "",
    total: 100,
    payment: "PIX",
    items: [{ id: 7001, description: "Torta fiscal", unit: "UN", qty: 2, price: 50 }]
  };
}


module.exports={baseState,row};

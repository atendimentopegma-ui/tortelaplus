const DEFAULT_REFORM_TAX_TABLES = {
  version: "IT-2025.002-v1.60-baseline",
  publishedAt: "2026-06-23",
  source: "Portal Nacional da NF-e - Documentos/Diversos - Tabela de Classificacao Tributaria do IBS e CBS",
  cstIndicators: [
    {
      cst: "000",
      description: "Tributacao integral",
      requiresReduction: false,
      allowsReduction: false,
      allowsDeferral: false
    }
  ],
  classTrib: [
    {
      code: "000001",
      cst: "000",
      description: "Tributacao integral",
      models: ["NF-e", "NFC-e"]
    }
  ]
};

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeTables(tables = {}) {
  const source = tables && typeof tables === "object" ? tables : {};
  return {
    ...DEFAULT_REFORM_TAX_TABLES,
    ...source,
    cstIndicators: Array.isArray(source.cstIndicators) && source.cstIndicators.length
      ? source.cstIndicators
      : DEFAULT_REFORM_TAX_TABLES.cstIndicators,
    classTrib: Array.isArray(source.classTrib) && source.classTrib.length
      ? source.classTrib
      : DEFAULT_REFORM_TAX_TABLES.classTrib
  };
}

function validateReformTaxTables(tables = {}) {
  const normalized = normalizeTables(tables);
  const errors = [];
  if (!normalized.version) errors.push("versao da tabela da reforma");
  if (!normalized.publishedAt) errors.push("data de publicacao da tabela da reforma");
  if (!Array.isArray(normalized.cstIndicators) || !normalized.cstIndicators.length) errors.push("indicadores de CST IBS/CBS");
  if (!Array.isArray(normalized.classTrib) || !normalized.classTrib.length) errors.push("classificacoes cClassTrib");

  normalized.cstIndicators.forEach((row, index) => {
    if (digits(row.cst).length !== 3) errors.push(`CST IBS/CBS invalido na tabela, linha ${index + 1}`);
  });
  normalized.classTrib.forEach((row, index) => {
    if (digits(row.code).length !== 6) errors.push(`cClassTrib invalido na tabela, linha ${index + 1}`);
    if (digits(row.cst).length !== 3) errors.push(`CST vinculado ao cClassTrib invalido, linha ${index + 1}`);
    if (row.models && !Array.isArray(row.models)) errors.push(`modelos do cClassTrib devem ser lista, linha ${index + 1}`);
  });
  return [...new Set(errors)];
}

function validateClassificationPair(tables, { cst, classTrib, model }) {
  const normalized = normalizeTables(tables);
  const cstCode = digits(cst).padStart(3, "0").slice(0, 3);
  const classCode = digits(classTrib).padStart(6, "0").slice(0, 6);
  const errors = [];
  const cstRow = normalized.cstIndicators.find((row) => digits(row.cst).padStart(3, "0") === cstCode);
  const classRow = normalized.classTrib.find((row) =>
    digits(row.code).padStart(6, "0") === classCode
    && digits(row.cst).padStart(3, "0") === cstCode
  );
  if (!cstRow) errors.push(`CST IBS/CBS ${cstCode} nao existe na tabela ${normalized.version}`);
  if (!classRow) errors.push(`cClassTrib ${classCode} nao permitido para CST ${cstCode} na tabela ${normalized.version}`);
  if (classRow?.models?.length && !classRow.models.includes(model)) {
    errors.push(`cClassTrib ${classCode} nao permitido para ${model}`);
  }
  return errors;
}

module.exports = {
  DEFAULT_REFORM_TAX_TABLES,
  normalizeTables,
  validateReformTaxTables,
  validateClassificationPair
};

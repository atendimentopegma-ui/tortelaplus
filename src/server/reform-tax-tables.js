const DEFAULT_REFORM_TAX_TABLES = require("./reform-tax-tables-official.json");

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

function validateClassificationPair(tables, { cst, classTrib, model, date = new Date().toISOString().slice(0, 10) }) {
  const normalized = normalizeTables(tables);
  const cstCode = String(cst || "");
  const classCode = String(classTrib || "");
  const errors = [];
  if (!/^\d{3}$/.test(cstCode)) errors.push("CST IBS/CBS deve ter exatamente 3 digitos");
  if (!/^\d{6}$/.test(classCode)) errors.push("cClassTrib deve ter exatamente 6 digitos");
  const cstRow = normalized.cstIndicators.find((row) => digits(row.cst).padStart(3, "0") === cstCode);
  const classRow = normalized.classTrib.find((row) =>
    digits(row.code).padStart(6, "0") === classCode
    && digits(row.cst).padStart(3, "0") === cstCode
  );
  if (!cstRow) errors.push(`CST IBS/CBS ${cstCode} nao existe na tabela ${normalized.version}`);
  if (!classRow) errors.push(`cClassTrib ${classCode} nao permitido para CST ${cstCode} na tabela ${normalized.version}`);
  if (Array.isArray(classRow?.models) && !classRow.models.includes(model)) {
    errors.push(`cClassTrib ${classCode} nao permitido para ${model}`);
  }
  if (classRow?.validFrom && date < classRow.validFrom) errors.push(`cClassTrib ${classCode} ainda nao vigente`);
  if (classRow?.validTo && date > classRow.validTo) errors.push(`cClassTrib ${classCode} fora de vigencia`);
  return errors;
}

module.exports = {
  DEFAULT_REFORM_TAX_TABLES,
  normalizeTables,
  validateReformTaxTables,
  validateClassificationPair
};

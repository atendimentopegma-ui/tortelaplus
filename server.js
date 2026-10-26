const stockReplenishment = require("./src/server/stock-replenishment");
const deliveryArea = require("./src/server/delivery-area");
const deliveryGeocoder = deliveryArea.createGeocoder();
const a1Certificate = require("./src/server/a1-certificate");
const fiscalSettingsPanel = require("./src/fiscal-settings-panel");
const companyProfile = require("./src/company-profile");
const itemPreparation = require("./src/item-preparation");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const net = require("net");
const { spawn } = require("child_process");
const { PostgresStore, tenantSchema } = require("./src/server/postgres-store");
const { businessDay, cashRegisterStale, openRegister, closeRegister, assertPdvCashWrite } = require("./src/server/cash-register");
const { resetTestData } = require("./src/server/reset-test-data");
const { tenantModuleAllowed } = require("./src/server/tenant-modules");
const { assertTenantWriteScope } = require("./src/server/tenant-write-scope");
const { centralPermissions, permissionsFor, fullAccess, centralRouteAllowed, scopedSummary } = require("./src/server/central-permissions");
const { validTerminalId, registerTerminal, updateTerminal, listTerminals } = require("./src/server/pdv-terminals");
const { createStateCoordinator } = require("./src/server/coordinated-state");
const {
  generateFiscalXml,
  generateNfseIni,
  validateNfeState,
  parseAcbrResponse,
  importNfeXml
} = require("./src/server/fiscal-documents");
const { buildDeploymentReadiness, buildSecurityHeaders, envValue } = require("./src/server/deployment-readiness");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const dataDir = envValue(process.env, "TORTELAPLUS_DB_DIR", "PEGMA_DB_DIR") ? path.resolve(envValue(process.env, "TORTELAPLUS_DB_DIR", "PEGMA_DB_DIR")) : path.join(root, "data");
const tenantsDir = path.join(dataDir, "tenants");
const storageDir = path.join(dataDir, "storage");
const backupsDir = path.join(dataDir, "backups");
const legacyStateFile = path.join(dataDir, "app-state.json");
const providerFile = path.join(dataDir, "provider-state.json");
const providerAdminToken = envValue(process.env, "TORTELAPLUS_PROVIDER_TOKEN", "PEGMA_PROVIDER_TOKEN") || "";
const fiscalSecretKey = envValue(process.env, "TORTELAPLUS_SECRET_KEY", "PEGMA_SECRET_KEY") || "";
const databaseMode = process.env.DATABASE_URL ? "postgresql-schema-per-tenant" : "local-json-contingency";
const securityHeaders = buildSecurityHeaders(process.env);
const appSurface = String(envValue(process.env, "TORTELAPLUS_SURFACE", "PEGMA_SURFACE") || "all").toLowerCase();
const acbrHost = envValue(process.env, "TORTELAPLUS_ACBR_HOST", "PEGMA_ACBR_HOST") || "";
const acbrPort = Number(envValue(process.env, "TORTELAPLUS_ACBR_PORT", "PEGMA_ACBR_PORT") || 3436);
const fiscalRuntimeDir = path.join(root, "runtime", "fiscal");
const acbrLibDll = path.join(fiscalRuntimeDir, "ACBrLib", "ACBrNFe64.dll");
const acbrNfseDll = path.join(fiscalRuntimeDir, "ACBrLib", "ACBrNFSe64.dll");
const acbrLibIni = path.join(fiscalRuntimeDir, "ACBrLib", "ACBrLib.ini");
const acbrLibBridgeExe = path.join(fiscalRuntimeDir, "Bridge", "ProdutoFiscal.AcbrLibBridge.exe");
let acbrLibSequence = 0;
const acbrEngines = {
  nfe: { dll: acbrLibDll, process: null, buffer: "", initialized: false, currentConfig: "", currentConfigHash: "", pending: new Map() },
  nfse: { dll: acbrNfseDll, process: null, buffer: "", initialized: false, currentConfig: "", currentConfigHash: "", pending: new Map() }
};
const providerSessions = new Map();
const loginAttempts = new Map();
const tenantCache = new Map();
let providerCache = null;
let postgresStore = null;
const coordinateState = createStateCoordinator(() => postgresStore, async (store) => {
  const provider = await store.readProvider();
  if (!provider) throw new Error("Central da Rede ausente no PostgreSQL.");
  providerCache = provider;
  const fresh = new Map();
  for (const tenant of provider.clients || []) {
    const code = normalizeTenantCode(tenant.tenantCode);
    const result = await store.pool.query(`SELECT document FROM "${tenantSchema(code)}".state_document WHERE id = 1`);
    if (!result.rows[0]?.document) throw new Error("Dados da unidade ausentes no PostgreSQL.");
    fresh.set(code, withTenantStateDefaults(result.rows[0].document, code));
  }
  tenantCache.clear();
  for (const [code, state] of fresh) tenantCache.set(code, state);
});
const sessionTtlMs = Number(envValue(process.env, "TORTELAPLUS_SESSION_TTL_MINUTES", "PEGMA_SESSION_TTL_MINUTES") || 480) * 60000;
const backupIntervalMs = Math.max(15, Number(envValue(process.env, "TORTELAPLUS_BACKUP_INTERVAL_MINUTES", "PEGMA_BACKUP_INTERVAL_MINUTES") || 360)) * 60000;
const backupRetentionDays = Math.max(7, Number(envValue(process.env, "TORTELAPLUS_BACKUP_RETENTION_DAYS", "PEGMA_BACKUP_RETENTION_DAYS") || 30));

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".tif": "image/tiff",
  ".ico": "image/x-icon"
};

const initialProvider = {
  ownerName: "Central Tortela",
  deployment: "Rede de franquias",
  isolationMode: "Banco separado por cliente",
  royaltySettings: {
    advertisingRate: 2,
    salesRoyaltyRate: 4,
    technologyFee: 149.9,
    marketingFundRate: 1,
    campaignFee: 0,
    minimumMonthlyFee: 299.9
  },
  whatsappSettings: {
    accountName: "Central Tortela",
    phone: "",
    groupInviteUrl: "",
    groupId: "",
    integrationMode: "generic",
    apiUrl: "",
    apiTokenConfigured: false
  },
  whatsappGroupQueue: [],
  providerAdmins: [
    {
      id: 1,
      name: "Administrador da Central",
      username: envValue(process.env, "TORTELAPLUS_CENTRAL_USER", "PEGMA_CENTRAL_USER") || "admin",
      active: true,
      passwordHash: hashPassword(envValue(process.env, "TORTELAPLUS_CENTRAL_PASSWORD", "PEGMA_CENTRAL_PASSWORD") || "Pegma@2026")
    }
  ],
  auditLogs: [],
  clients: [
    {
      id: 1,
      tradeName: "Tortela Plus",
      document: "",
      tenantCode: "cliente-exemplo",
      plan: "Essencial",
      maxTerminals: 2,
      activeTerminals: 1,
      renewalDays: 30,
      licensePassword: "PEGMA-2026",
      licenseExpiresAt: "2026-07-05",
      status: "Ativo",
      adminUser: "admin@cliente.com",
      city: "Sao Paulo",
      uf: "SP",
      cep: "01001000"
    }
  ]
};

const initialTenantState = {
  users: [
    {
      id: 1,
      name: "Operador",
      username: "Operador",
      role: "Administrador",
      active: true,
      passwordHash: hashPassword("123456")
    }
  ],
  people: [
    { id: 1, type: "Cliente", name: "Consumidor Final", document: "", city: "Padrao", uf: "SP", cep: "", address: "", active: true },
    { id: 2, type: "Fornecedor", name: "Fornecedor nao identificado", document: "", city: "Sao Paulo", uf: "SP", cep: "01001000", address: "Praca da Se", active: true }
  ],
  products: [],
  receivables: [],
  chartOfAccounts: [
    { id: 1, code: "1.1.01", name: "Caixa", type: "Ativo", active: true },
    { id: 2, code: "1.1.02", name: "Banco", type: "Ativo", active: true },
    { id: 3, code: "3.1.01", name: "Receita de vendas", type: "Receita", active: true },
    { id: 4, code: "4.1.01", name: "Compras e fornecedores", type: "Despesa", active: true }
  ],
  payables: [],
  cash: [],
  cashRegister: { open: false, openedAt: "", openedBy: "", initialAmount: 0, terminal: "" },
  heldSales: [],
  pdvTables: [],
  automaticOrders: [],
  approvalRequests: [],
  networkPromotions: [],
  franchisePayments: [],
  fiscalQueue: [],
  sales: [],
  purchases: [],
  stockMovements: [],
  productions: [],
  stockLots: [],
  stockInventories: [],
  stockTransfers: [],
  financeReconciliations: [],
  auditLogs: [],
  fiscalRules: [
    { id: 1, name: "Venda interna - Simples Nacional", regime: "Simples Nacional", uf: "SP", municipio: "", model: "NFC-e", operation: "Venda de mercadoria", cfop: "5102", cst: "102", csosn: "102", ncm: "19059090", cest: "", origin: "0", pisCofinsCst: "49", pisRate: 0, cofinsRate: 0, icmsRate: 0, fcpRate: 0, mvaRate: 0, ibsClass: "000001", cbsClass: "000001", ibsCbsCst: "000", ibsRate: 0, cbsRate: 0, ibsUfRate: 0, ibsCityRate: 0, cbsFederalRate: 0, presumedCreditRate: 0, transitionYear: "2026", reformReductionRate: 0, reformDeferralRate: 0, selectiveTaxRate: 0, selectiveTaxCst: "", selectiveTaxClass: "", monophase: false, adRemRate: 0, adRemUnit: "", serviceCode: "", cityServiceCode: "", taxBenefitCode: "", reductionReason: "", validFrom: "2026-01-01", validTo: "", active: true },
    { id: 2, name: "Venda interna - Lucro Presumido", regime: "Lucro Presumido", uf: "SP", municipio: "", model: "NF-e", operation: "Venda de mercadoria", cfop: "5102", cst: "00", csosn: "", ncm: "19059090", cest: "", origin: "0", pisCofinsCst: "01", pisRate: 0.65, cofinsRate: 3, icmsRate: 18, fcpRate: 0, mvaRate: 0, ibsClass: "000001", cbsClass: "000001", ibsCbsCst: "000", ibsRate: 0, cbsRate: 0, ibsUfRate: 0, ibsCityRate: 0, cbsFederalRate: 0, presumedCreditRate: 0, transitionYear: "2026", reformReductionRate: 0, reformDeferralRate: 0, selectiveTaxRate: 0, selectiveTaxCst: "", selectiveTaxClass: "", monophase: false, adRemRate: 0, adRemUnit: "", serviceCode: "", cityServiceCode: "", taxBenefitCode: "", reductionReason: "", validFrom: "2026-01-01", validTo: "", active: true },
    { id: 3, name: "Servico municipal", regime: "Simples Nacional", uf: "SP", municipio: "SUZANO", model: "NFS-e", operation: "Prestacao de servico", cfop: "5933", cst: "00", csosn: "102", ncm: "", cest: "", origin: "0", pisCofinsCst: "49", pisRate: 0, cofinsRate: 0, icmsRate: 0, issRate: 0, fcpRate: 0, mvaRate: 0, ibsClass: "000001", cbsClass: "000001", ibsCbsCst: "000", ibsRate: 0, cbsRate: 0, ibsUfRate: 0, ibsCityRate: 0, cbsFederalRate: 0, presumedCreditRate: 0, transitionYear: "2026", reformReductionRate: 0, reformDeferralRate: 0, selectiveTaxRate: 0, selectiveTaxCst: "", selectiveTaxClass: "", monophase: false, adRemRate: 0, adRemUnit: "", serviceCode: "14.01", cityServiceCode: "", taxBenefitCode: "", reductionReason: "", validFrom: "2026-01-01", validTo: "", active: true }
  ],
  reformTaxTables: {
    version: "IT-2025.002-v1.60-baseline",
    publishedAt: "2026-06-23",
    source: "Portal Nacional da NF-e - Documentos/Diversos - Tabela de Classificacao Tributaria do IBS e CBS",
    cstIndicators: [
      { cst: "000", description: "Tributacao integral", requiresReduction: false, allowsReduction: false, allowsDeferral: false }
    ],
    classTrib: [
      { code: "000001", cst: "000", description: "Tributacao integral", models: ["NF-e", "NFC-e"] }
    ]
  },
  settings: {
    company: "Tortela Plus",
    document: "",
    stateRegistration: "",
    municipalRegistration: "",
    user: "Operador",
    tenantCode: "cliente-exemplo",
    regime: "Simples Nacional",
    uf: "SP",
    cep: "",
    address: "",
    number: "",
    district: "",
    city: "",
    cityCode: "",
    deliveryRadiusKm: 10,
    cepProvider: "ViaCEP",
    fiscalEnvironment: "Homologacao",
    fiscalEngine: "ACBrLib",
    acbrHost: "127.0.0.1",
    acbrPort: 3436,
    acbrApiUrl: "",
    acbrApiToken: "",
    cscId: "",
    cscConfigured: false,
    nfceQrCodeUrl: "",
    nfceConsultaUrl: "",
    certificatePasswordConfigured: false,
    sefazCredentialed: false,
    sefazUf: "SP",
    nfseStandard: "Nacional",
    nfseProvider: "",
    nfseCityCode: "",
    certificateName: "",
    certificateExpiresAt: "",
    fiscalResponsible: "",
    pixApiUrl: "",
    boletoApiUrl: "",
    paymentApiUrl: "",
    paymentProvider: "",
    paymentAuthHeader: "Authorization",
    paymentAuthScheme: "Bearer",
    paymentCallbackUrl: "",
    paymentApiTokenConfigured: false,
    publicTerminalToken: ""
  }
};

const rolePermissions = {
  Administrador: ["dashboard", "people", "products", "stock", "purchases", "sales", "finance", "fiscal", "reports", "settings", "pdv", "stock_adjust", "purchase_cancel", "sales_cancel", "finance_settle", "fiscal_transmit", "fiscal_cancel", "restore_backup", "manage_users"],
  Gerente: ["dashboard", "people", "products", "stock", "purchases", "sales", "finance", "fiscal", "reports", "pdv", "stock_adjust", "purchase_cancel", "sales_cancel", "finance_settle", "fiscal_transmit", "fiscal_cancel"],
  Caixa: ["dashboard", "sales", "pdv", "fiscal_transmit"],
  Fiscal: ["dashboard", "people", "products", "sales", "fiscal", "reports", "fiscal_transmit", "fiscal_cancel"],
  Financeiro: ["dashboard", "people", "sales", "finance", "reports", "finance_settle"],
  Estoque: ["dashboard", "products", "stock", "purchases", "reports", "stock_adjust"],
  Vendedor: ["dashboard", "people", "products", "sales", "pdv"]
};
const allPermissions = [...new Set(Object.values(rolePermissions).flat())];

function ensureDataStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(tenantsDir)) fs.mkdirSync(tenantsDir, { recursive: true });
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  let provider = initialProvider;
  if (fs.existsSync(legacyStateFile)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyStateFile, "utf8"));
      provider = legacy.provider || provider;
      const tenantCode = normalizeTenantCode(legacy.settings?.tenantCode || provider.clients?.[0]?.tenantCode || "cliente-exemplo");
      if (!fs.existsSync(tenantFile(tenantCode))) {
        const tenantState = stripProvider(legacy);
        tenantState.settings = { ...initialTenantState.settings, ...(tenantState.settings || {}), tenantCode };
        writeJson(tenantFile(tenantCode), withTenantStateDefaults(tenantState, tenantCode));
      }
    } catch {
      provider = initialProvider;
    }
  }

  if (!fs.existsSync(providerFile)) writeProvider({ ...initialProvider, ...provider });

  readProvider().clients.forEach((client) => {
    const tenantCode = normalizeTenantCode(client.tenantCode);
    if (tenantCode && !fs.existsSync(tenantFile(tenantCode))) {
      writeTenantState(tenantCode, withTenantStateDefaults({}, tenantCode));
    }
  });
}

async function initializePersistence() {
  ensureDataStore();
  if (!process.env.DATABASE_URL) return;

  postgresStore = new PostgresStore(process.env.DATABASE_URL);
  await postgresStore.initialize();
  const initializationLock = await postgresStore.pool.connect();
  try {
  await initializationLock.query("BEGIN");
  await initializationLock.query("SELECT pg_advisory_xact_lock(748321902)");
  const storedProvider = await postgresStore.readProvider();
  providerCache = storedProvider || readJson(providerFile, initialProvider);
  const configuredAdmin = configuredProviderAdmin();
  if (configuredAdmin) {
    const storedAdmin = normalizeProviderAdmins(providerCache.providerAdmins).find(admin => admin.username === configuredAdmin.username);
    providerCache.providerAdmins = [
      {...configuredAdmin,...storedAdmin,passwordHash:storedAdmin?.credentialUpdatedAt ? storedAdmin.passwordHash : configuredAdmin.passwordHash},
      ...normalizeProviderAdmins(providerCache.providerAdmins).filter(
        (admin) => admin.id !== configuredAdmin.id && String(admin.username).toLowerCase() !== configuredAdmin.username.toLowerCase()
      )
    ];
  }
  if (!storedProvider) await postgresStore.writeProvider(providerCache);
  else if (configuredAdmin) await postgresStore.writeProvider(providerCache);

  for (const client of providerCache.clients || []) {
    const code = normalizeTenantCode(client.tenantCode);
    const storedTenant = await postgresStore.readTenant(code);
    const tenantState = storedTenant || readJson(tenantFile(code), initialTenantState);
    tenantCache.set(code, withTenantStateDefaults(tenantState, code));
    if (!storedTenant) await postgresStore.writeTenant(code, tenantCache.get(code));
  }
  console.log(`PostgreSQL ativo com ${tenantCache.size} schemas de clientes.`);
  } finally {
    try { await initializationLock.query("COMMIT"); }
    finally { initializationLock.release(); }
  }
}

function stripProvider(state) {
  const { provider, ...tenantState } = state || {};
  return tenantState;
}

function tenantFile(tenantCode) {
  return path.join(tenantsDir, `${normalizeTenantCode(tenantCode)}.json`);
}

function normalizePathSegment(value) {
  return normalizeTenantCode(value || "arquivo") || "arquivo";
}

function tenantStorageDir(tenantCode, category = "geral") {
  const dir = path.join(storageDir, normalizeTenantCode(tenantCode), normalizePathSegment(category));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return structuredClone(fallback);
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, data) {
  const tmpFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, file);
}

function readProvider() {
  const provider = postgresStore && providerCache ? structuredClone(providerCache) : readJson(providerFile, initialProvider);
  provider.clients = (provider.clients || []).map(withTenantDefaults);
  provider.providerAdmins = normalizeProviderAdmins(provider.providerAdmins);
  provider.auditLogs = Array.isArray(provider.auditLogs) ? provider.auditLogs : [];
  return provider;
}

function writeProvider(provider) {
  const normalized = {
    ...initialProvider,
    ...provider,
    providerAdmins: normalizeProviderAdmins(provider.providerAdmins),
    auditLogs: Array.isArray(provider.auditLogs) ? provider.auditLogs.slice(0, 1000) : [],
    clients: (provider.clients || []).map(withTenantDefaults)
  };
  if (postgresStore) {
    providerCache = structuredClone(normalized);
    postgresStore.queue(() => postgresStore.writeProvider(normalized));
    return;
  }
  writeJson(providerFile, normalized);
}

function readTenantState(tenantCode) {
  const code = normalizeTenantCode(tenantCode);
  const state = postgresStore && tenantCache.has(code) ? structuredClone(tenantCache.get(code)) : readJson(tenantFile(code), initialTenantState);
  return withTenantStateDefaults(state, code);
}

function writeTenantState(tenantCode, state, allowTerminalSettings = false, allowDataReset = false) {
  const code = normalizeTenantCode(tenantCode);
  const current = readTenantState(code);
  const stripped = stripProvider(state);
  const normalized = withTenantStateDefaults({
    ...current,
    ...stripped,
    users: (stripped.users || current.users || initialTenantState.users).map(user => ({...user, passwordHash: user.passwordHash || current.users.find(existing => existing.id === user.id)?.passwordHash}))
  }, code);
  if (!allowTerminalSettings) normalized.settings.pdvTerminals = structuredClone(current.settings.pdvTerminals || []);
  normalized._meta = {
    ...(current._meta || {}),
    ...(normalized._meta || {}),
    dataEpoch: allowDataReset ? normalized._meta?.dataEpoch : (current._meta?.dataEpoch || ""),
    revision: Number(current._meta?.revision || 0) + 1,
    updatedAt: new Date().toISOString()
  };
  if (!allowDataReset) stockReplenishment.replenish(normalized);
  createDailyTenantBackup(code, current);
  if (postgresStore) {
    tenantCache.set(code, structuredClone(normalized));
    postgresStore.queue(() => postgresStore.writeTenant(code, normalized));
    return;
  }
  writeJson(tenantFile(code), normalized);
}

function createDailyTenantBackup(tenantCode, state) {
  const code = normalizeTenantCode(tenantCode);
  const directory = path.join(backupsDir, code);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  const filename = `${today()}.json`;
  const file = path.join(directory, filename);
  const snapshot = tenantSnapshotDocument(code, state, "automatico-diario");
  if (!fs.existsSync(file)) {
    writeJson(file, snapshot);
    if (postgresStore) postgresStore.queue(() => postgresStore.writeFile(code, "backup", filename, "application/json", Buffer.from(JSON.stringify(snapshot), "utf8")));
  }
  fs.readdirSync(directory).filter((name) => name.endsWith(".json")).sort().reverse().slice(backupRetentionDays).forEach((name) => fs.unlinkSync(path.join(directory, name)));
}

function createScheduledTenantBackup(tenantCode, state) {
  const code = normalizeTenantCode(tenantCode);
  const directory = path.join(backupsDir, code);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${stamp}-automatico.json`;
  const snapshot = tenantSnapshotDocument(code, state, "automatico-programado");
  writeJson(path.join(directory, filename), snapshot);
  if (postgresStore) postgresStore.queue(() => postgresStore.writeFile(code, "backup", filename, "application/json", Buffer.from(JSON.stringify(snapshot), "utf8")));
  fs.readdirSync(directory).filter((name) => name.endsWith(".json")).sort().reverse().slice(backupRetentionDays * 4).forEach((name) => fs.unlinkSync(path.join(directory, name)));
}

function createPreRestoreTenantBackup(tenantCode, state) {
  const code = normalizeTenantCode(tenantCode);
  const directory = path.join(backupsDir, code);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${stamp}-antes-restauracao.json`;
  const snapshot = tenantSnapshotDocument(code, state, "antes-restauracao");
  writeJson(path.join(directory, filename), snapshot);
  if (postgresStore) postgresStore.queue(() => postgresStore.writeFile(code, "backup", filename, "application/json", Buffer.from(JSON.stringify(snapshot), "utf8")));
  return filename;
}

function auditHash(previousHash, date, user, action, detail) {
  return crypto.createHash("sha256").update([previousHash, date, user, action, detail].join("|")).digest("hex");
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function validCpf(value) {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base) => {
    let sum = 0;
    for (let index = 0; index < base.length; index += 1) sum += Number(base[index]) * (base.length + 1 - index);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(cpf.slice(0, 9)) === Number(cpf[9]) && calc(cpf.slice(0, 10)) === Number(cpf[10]);
}

function tenantSnapshotDocument(tenantCode, state, reason = "manual") {
  return {
    product: "Tortela Plus",
    tenantCode: normalizeTenantCode(tenantCode),
    generatedAt: new Date().toISOString(),
    reason,
    version: "0.1.0",
    state: structuredClone(state)
  };
}

function readCombinedState(tenantCode = "cliente-exemplo") {
  return {
    ...readTenantState(tenantCode),
    provider: readProvider()
  };
}

function writeCombinedState(state) {
  if (state.provider) writeProvider(state.provider);
  const tenantCode = normalizeTenantCode(state.settings?.tenantCode || "cliente-exemplo");
  writeTenantState(tenantCode, state);
}

function withTenantStateDefaults(state, tenantCode) {
  const code = normalizeTenantCode(tenantCode || state?.settings?.tenantCode || initialTenantState.settings.tenantCode);
  const publicTerminalToken = state?.settings?.publicTerminalToken || "";
  const merged = {
    ...structuredClone(initialTenantState),
    ...(state || {}),
    users: normalizeUsers(state?.users || initialTenantState.users),
    products: state?.products || [],
    settings: {
      ...initialTenantState.settings,
      ...(state?.settings || {}),
      tenantCode: code,
      publicTerminalToken
    },
    cashRegister: { ...structuredClone(initialTenantState.cashRegister), ...(state?.cashRegister || {}) },
    heldSales: state?.heldSales || [],
    pdvTables: state?.pdvTables || [],
    automaticOrders: state?.automaticOrders || [],
    networkPromotions: state?.networkPromotions || [],
    franchisePayments: state?.franchisePayments || []
  };
  merged.reformTaxTables = structuredClone(require("./src/server/reform-tax-tables-official.json"));
  delete merged.provider;
  return merged;
}

function appendTenantAudit(tenantCode, action, detail, user = "backend") {
  const state = readTenantState(tenantCode);
  state.auditLogs = Array.isArray(state.auditLogs) ? state.auditLogs : [];
  const date = new Date().toISOString();
  const previousHash = state.auditLogs[0]?.hash || "";
  state.auditLogs.unshift({
    id: Math.max(0, ...state.auditLogs.map((item) => Number(item.id) || 0)) + 1,
    date,
    user,
    action,
    detail,
    previousHash,
    hash: auditHash(previousHash, date, user, action, detail)
  });
  state.auditLogs = state.auditLogs.slice(0, 500);
  writeTenantState(tenantCode, state);
}

function normalizeProviderAdmins(admins) {
  const source = Array.isArray(admins) && admins.length ? admins : initialProvider.providerAdmins;
  return source.map((admin, index) => ({
    id: admin.id || index + 1,
    name: admin.name || admin.username || "Administrador",
    username: admin.username || "admin",
    active: admin.active !== false,
    permissions: permissionsFor(Array.isArray(admin.permissions)&&admin.permissionsVersion!==2&&centralPermissions.filter(p=>!["fiscal","fiscal_cancel"].includes(p)).every(p=>admin.permissions.includes(p))?{}:admin),
    permissionsVersion: 2,
    credentialUpdatedAt: admin.credentialUpdatedAt || "",
    passwordHash: admin.passwordHash || hashPassword(admin.password || "Pegma@2026")
  }));
}

function configuredProviderAdmin() {
  const username = String(envValue(process.env, "TORTELAPLUS_CENTRAL_USER", "PEGMA_CENTRAL_USER") || "").trim();
  const password = String(envValue(process.env, "TORTELAPLUS_CENTRAL_PASSWORD", "PEGMA_CENTRAL_PASSWORD") || "");
  if (!username || !password) return null;
  return {
    id: 1,
    name: "Administrador da Central",
    username,
    active: true,
    passwordHash: hashPassword(password)
  };
}

function appendProviderAudit(action, detail, username = "central", ipAddress = "") {
  const provider = readProvider();
  const date = new Date().toISOString();
  const previousHash = provider.auditLogs[0]?.hash || "";
  provider.auditLogs.unshift({
    id: Math.max(0, ...provider.auditLogs.map((item) => Number(item.id) || 0)) + 1,
    date,
    username,
    action,
    detail,
    ipAddress,
    previousHash,
    hash: auditHash(previousHash, date, username, action, detail)
  });
  provider.auditLogs = provider.auditLogs.slice(0, 1000);
  writeProvider(provider);
  if (postgresStore) postgresStore.queue(() => postgresStore.audit(username, action, detail, ipAddress));
}

function periodClosed(state, incoming) {
  const closedThrough = state.settings?.closedThrough;
  if (!closedThrough) return false;
  const collections = ["sales", "purchases", "payables", "receivables", "cash", "fiscalQueue", "pdvTables", "automaticOrders", "networkPromotions", "franchisePayments"];
  return collections.some((name) => JSON.stringify(state[name] || []) !== JSON.stringify(incoming[name] || [])
    && (incoming[name] || []).some((row) => String(row.date || row.due || row.issuedAt || "").slice(0, 10) <= closedThrough));
}

function deploymentReadiness(tenant, state) {
  const fiscal = fiscalProviderStatus(state);
  const checks = [
    { item: "Empresa identificada", ok: Boolean(state.settings?.company && state.settings?.document) },
    { item: "Endereco completo", ok: Boolean(state.settings?.cep && state.settings?.cityCode && state.settings?.address) },
    { item: "Administrador ativo", ok: (state.users || []).some((user) => user.active !== false && user.role === "Administrador") },
    { item: "Banco isolado", ok: Boolean(tenant?.tenantCode) },
    { item: "Backup criado", ok: fs.existsSync(path.join(backupsDir, normalizeTenantCode(tenant?.tenantCode || ""))) },
    { item: "Fiscal parametrizado", ok: fiscal.ready },
    { item: "Produtos cadastrados", ok: (state.products || []).length > 0 },
    { item: "Plano e terminais definidos", ok: Number(tenant?.maxTerminals || 0) > 0 }
  ];
  return { ready: checks.filter((check) => check.ok).length, total: checks.length, checks };
}

function normalizeUsers(users) {
  return (users || []).map((user, index) => ({
    id: user.id || index + 1,
    name: user.name || user.username || "Usuario",
    username: user.username || user.name || "usuario",
    role: user.role || "Vendedor",
    permissions: validPermissions(user.permissions, user.role),
    screenPermissions: user.screenPermissions || {},
    active: user.active !== false,
    passwordHash: user.passwordHash || hashPassword(user.password || "123456")
  }));
}

function withTenantDefaults(client) {
  const activeSessions = Array.isArray(client.activeSessions) ? client.activeSessions : [];
  return {
    renewalDays: 30,
    licensePassword: "PEGMA-2026",
    licenseExpiresAt: today(),
    activeSessions,
    activeTerminals: activeSessions.length || Number(client.activeTerminals || 0),
    status: "Ativo",
    modules: ["PDV", "NF-e", "NFC-e", "NFS-e", "Estoque", "Financeiro", "Relatorios", "Compras"],
    ...client,
    activeSessions,
    activeTerminals: activeSessions.length || Number(client.activeTerminals || 0),
    tenantCode: normalizeTenantCode(client.tenantCode || client.tradeName)
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateText, days) {
  const date = dateText ? new Date(`${dateText}T00:00:00`) : new Date();
  date.setDate(date.getDate() + Number(days || 30));
  return date.toISOString().slice(0, 10);
}

function simpleHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
}

function defaultPublicTerminalToken(tenantCode) {
  const secret = envValue(process.env, "TORTELAPLUS_PUBLIC_LINK_SECRET", "PEGMA_PUBLIC_LINK_SECRET") || envValue(process.env, "TORTELAPLUS_SECRET_KEY", "PEGMA_SECRET_KEY") || "tortela-local-dev-secret";
  return crypto.createHash("sha256").update(`${normalizeTenantCode(tenantCode)}|${secret}|totem`).digest("base64url").slice(0, 24);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, salt, hash] = String(storedHash || "").split("$");
  if (scheme !== "pbkdf2" || !salt || !hash) return false;
  const typed = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(typed), Buffer.from(storedHash));
}

function licenseChallenge(tenant, user = "Operador") {
  return `S-${simpleHash(`${tenant.tenantCode}|${tenant.document}|${tenant.licenseExpiresAt}|${user}`)}`;
}

function counterPassword(tenant, challenge, days = tenant.renewalDays) {
  const code = simpleHash(`${tenant.tenantCode}|${tenant.licensePassword}|${challenge}|${days}`);
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

function newSessionId(tenantCode, user) {
  return `T-${simpleHash(`${tenantCode}|${user}|${Date.now()}`)}-${crypto.randomBytes(24).toString("base64url")}`;
}

function refreshTerminalCount(tenant) {
  const now = Date.now();
  tenant.activeSessions = Array.isArray(tenant.activeSessions) ? tenant.activeSessions : [];
  tenant.activeSessions = tenant.activeSessions.filter((session) => {
    const lastSeen = new Date(session.lastSeenAt || session.startedAt || 0).getTime();
    return Number.isFinite(lastSeen) && now - lastSeen < sessionTtlMs;
  });
  tenant.activeTerminals = tenant.activeSessions.length;
}

function normalizeTenantCode(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pathInside(parent, target) {
  const relative = path.relative(path.resolve(parent), path.resolve(target));
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function extensionFromMime(mimeType) {
  return {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/tiff": ".tif",
    "application/xml": ".xml",
    "text/xml": ".xml",
    "text/plain": ".txt",
    "application/pdf": ".pdf"
  }[String(mimeType || "").toLowerCase()] || ".bin";
}

function parseDataPayload(content, fallbackMime = "application/octet-stream") {
  const match = String(content || "").match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], buffer: Buffer.from(match[2], "base64") };
  return { mimeType: fallbackMime, buffer: Buffer.from(String(content || ""), "base64") };
}

function saveTenantFile({ tenantCode, category, filename, mimeType, content, preserveFilename = false }) {
  const parsed = parseDataPayload(content, mimeType);
  const ext = path.extname(filename || "") || extensionFromMime(parsed.mimeType);
  const base = normalizePathSegment(path.basename(filename || "arquivo", path.extname(filename || "")));
  const safeOriginalName = path.basename(filename || `${base}${ext}`).replace(/[^a-zA-Z0-9._-]/g, "-");
  const finalName = preserveFilename ? safeOriginalName : `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${base}${ext}`;
  const directory = tenantStorageDir(tenantCode, category);
  const filePath = path.join(directory, finalName);
  if (!pathInside(directory, filePath)) throw new Error("Caminho de arquivo invalido para a unidade.");
  fs.writeFileSync(filePath, parsed.buffer);
  if (postgresStore) {
    postgresStore.queue(() => postgresStore.writeFile(
      normalizeTenantCode(tenantCode),
      normalizePathSegment(category),
      finalName,
      parsed.mimeType,
      parsed.buffer
    ));
  }
  return {
    filename: finalName,
    mimeType: parsed.mimeType,
    size: parsed.buffer.length,
    url: `/storage/${normalizeTenantCode(tenantCode)}/${normalizePathSegment(category)}/${finalName}`
  };
}

function saveFiscalResponse(tenantCode, filename, response) {
  const raw = typeof response === "string" ? response : JSON.stringify(response || {}, null, 2);
  return saveTenantFile({
    tenantCode,
    category: "xml",
    filename,
    mimeType: "text/plain",
    content: Buffer.from(raw, "utf8").toString("base64")
  });
}

function saveFiscalSecrets(tenantCode, secrets) {
  if (fiscalSecretKey.length < 32) throw new Error("Configure TORTELAPLUS_SECRET_KEY com pelo menos 32 caracteres no provedor.");
  const payload = encryptVaultPayload(secrets);
  fs.writeFileSync(path.join(tenantStorageDir(tenantCode, "secrets"), "fiscal-vault.json"), JSON.stringify(payload));
}

function encryptVaultPayload(secrets) {
  if (fiscalSecretKey.length < 32) throw new Error("Configure TORTELAPLUS_SECRET_KEY com pelo menos 32 caracteres no provedor.");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", crypto.createHash("sha256").update(fiscalSecretKey).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(secrets), "utf8"), cipher.final()]);
  return {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64")
  };
}

function loadFiscalSecrets(tenantCode) {
  const vaultPath = path.join(tenantStorageDir(tenantCode, "secrets"), "fiscal-vault.json");
  if (!fs.existsSync(vaultPath)) return {};
  return decryptVaultPayload(JSON.parse(fs.readFileSync(vaultPath, "utf8")));
}

function decryptVaultPayload(payload) {
  if (fiscalSecretKey.length < 32) throw new Error("Configure TORTELAPLUS_SECRET_KEY com pelo menos 32 caracteres no provedor.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", crypto.createHash("sha256").update(fiscalSecretKey).digest(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload.data, "base64")), decipher.final()]).toString("utf8"));
}

function replaceIniValue(content, section, key, value) {
  const sectionPattern = new RegExp(`(\\[${section}\\][\\s\\S]*?)(?=\\r?\\n\\[|$)`, "i");
  if (!sectionPattern.test(content)) return `${content.trimEnd()}\n\n[${section}]\n${key}=${value ?? ""}\n`;
  return content.replace(sectionPattern, (block) => {
    const keyPattern = new RegExp(`(^|\\r?\\n)${key}=.*`, "i");
    if (keyPattern.test(block)) return block.replace(keyPattern, `$1${key}=${value ?? ""}`);
    return `${block}\n${key}=${value ?? ""}`;
  });
}

function configureAcbrForTenant(tenantCode, tenantState) {
  const settings = tenantState.settings || {};
  const secrets = loadFiscalSecrets(tenantCode);
  let ini = fs.readFileSync(acbrLibIni, "utf8");
  const tenantRuntime = tenantStorageDir(tenantCode, "acbr");
  const tenantXml = tenantStorageDir(tenantCode, "xml");
  const tenantPdf = tenantStorageDir(tenantCode, "pdf");
  ini = replaceIniValue(ini, "DFe", "UF", settings.sefazUf || settings.uf || "");
  if(String(settings.certificateName||"").startsWith("vault-a1:"))throw Error("Configure o agente fiscal Windows atualizado para usar o certificado selecionado.");
  ini = replaceIniValue(ini, "DFe", "ArquivoPFX", settings.certificateName || "");
  ini = replaceIniValue(ini, "DFe", "Senha", secrets.certificatePassword || "");
  ini = replaceIniValue(ini, "NFe", "Ambiente", settings.fiscalEnvironment === "Producao" ? "1" : "2");
  ini = replaceIniValue(ini, "NFe", "IdCSC", settings.cscId || "");
  ini = replaceIniValue(ini, "NFe", "CSC", secrets.csc || "");
  ini = replaceIniValue(ini, "NFe", "PathSalvar", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathNFe", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathInu", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathEvento", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathSchemas", path.join(fiscalRuntimeDir, "Schemas"));
  ini = replaceIniValue(ini, "DANFE", "PathPDF", tenantPdf);
  ini = replaceIniValue(ini, "DANFE", "ExibeInforAdicProduto", "1");
  ini = replaceIniValue(ini, "DANFE", "QuebraLinhaEmDetalhamentos", "1");
  const configPath = path.join(tenantRuntime, "ACBrLib.ini");
  fs.writeFileSync(configPath, ini);
  return configPath;
}

function configureAcbrNfseForTenant(tenantCode, tenantState) {
  const settings = tenantState.settings || {};
  const secrets = loadFiscalSecrets(tenantCode);
  let ini = fs.readFileSync(acbrLibIni, "utf8");
  const tenantRuntime = tenantStorageDir(tenantCode, "acbr");
  const tenantXml = tenantStorageDir(tenantCode, "xml");
  const tenantPdf = tenantStorageDir(tenantCode, "pdf");
  ini = replaceIniValue(ini, "DFe", "UF", settings.sefazUf || settings.uf || "");
  if(String(settings.certificateName||"").startsWith("vault-a1:"))throw Error("Configure o agente fiscal Windows atualizado para usar o certificado selecionado.");
  ini = replaceIniValue(ini, "DFe", "ArquivoPFX", settings.certificateName || "");
  ini = replaceIniValue(ini, "DFe", "Senha", secrets.certificatePassword || "");
  ini = replaceIniValue(ini, "NFSe", "Ambiente", settings.fiscalEnvironment === "Producao" ? "1" : "2");
  ini = replaceIniValue(ini, "NFSe", "CodigoMunicipio", settings.nfseCityCode || settings.cityCode || "");
  ini = replaceIniValue(ini, "NFSe", "Provedor", settings.nfseProvider || "");
  ini = replaceIniValue(ini, "NFSe", "PathSalvar", tenantXml);
  ini = replaceIniValue(ini, "NFSe", "PathSchemas", path.join(fiscalRuntimeDir, "Schemas", settings.nfseStandard === "Nacional" ? "NFSeNacional" : ""));
  ini = replaceIniValue(ini, "DANFSE", "PathPDF", tenantPdf);
  const configPath = path.join(tenantRuntime, "ACBrNFSeLib.ini");
  fs.writeFileSync(configPath, ini);
  return configPath;
}

function fiscalAgentConfig(tenantCode, tenantState, secrets = loadFiscalSecrets(tenantCode)) {
  const settings = tenantState.settings || {};
  return {
    fiscalEnvironment: settings.fiscalEnvironment || "Homologacao",
    uf: settings.sefazUf || settings.uf || "",
    certificateName: settings.certificateName || "",
    certificatePassword: secrets.certificatePassword || "",
    ...(String(settings.certificateName||"").startsWith("vault-a1:")&&secrets.certificateA1?.sha256===String(settings.certificateName).slice(9)?{certificateA1:secrets.certificateA1}:{}),
    cscId: settings.cscId || "",
    csc: secrets.csc || "",
    nfseCityCode: settings.nfseCityCode || settings.cityCode || "",
    nfseStandard: settings.nfseStandard || "Nacional",
    nfseProvider: settings.nfseProvider || ""
  };
}

async function dispatchWhatsappGroupAutomation(provider, tenant, customer) {
  const settings = provider.whatsappSettings || {};
  provider.whatsappGroupQueue = Array.isArray(provider.whatsappGroupQueue) ? provider.whatsappGroupQueue : [];
  const phone = String(customer.whatsapp || customer.phone || "").replace(/\D/g, "");
  const item = {
    id: `WAG-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    tenantCode: tenant.tenantCode,
    unit: tenant.tradeName,
    customerId: customer.id,
    customer: customer.name,
    phone,
    birthDate: customer.birthDate || "",
    groupId: settings.groupId || "",
    groupInviteUrl: settings.groupInviteUrl || "",
    status: "Pendente",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    detail: ""
  };
  if (!phone || phone.length < 10) {
    item.status = "Erro";
    item.detail = "Telefone invalido para inclusao automatica.";
    provider.whatsappGroupQueue.unshift(item);
    return item;
  }
  if (!settings.apiUrl) {
    item.detail = "API WhatsApp da Central nao configurada.";
    provider.whatsappGroupQueue.unshift(item);
    return item;
  }
  let token = "";
  try {
    token = settings.apiTokenVault ? decryptVaultPayload(settings.apiTokenVault).apiToken || "" : "";
  } catch (error) {
    item.status = "Erro";
    item.detail = `Token WhatsApp indisponivel: ${error.message}`;
    provider.whatsappGroupQueue.unshift(item);
    return item;
  }
  const mode = String(settings.integrationMode || "generic").toLowerCase();
  const payload = mode === "wapi"
    ? { groupId: settings.groupId || "", phones: [phone], autoInvite: true }
    : {
      action: "add_group_participant",
      autoInvite: true,
      groupId: settings.groupId || "",
      groupInviteUrl: settings.groupInviteUrl || "",
      phone,
      customerName: customer.name,
      tenantCode: tenant.tenantCode,
      unit: tenant.tradeName
    };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(settings.apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text().catch(() => "");
    item.status = response.ok ? "Enviado" : "Erro";
    item.detail = response.ok ? "Inclusao/convite enviado para API WhatsApp." : `API retornou ${response.status}: ${text.slice(0, 180)}`;
  } catch (error) {
    item.status = "Erro";
    item.detail = error.name === "AbortError" ? "Tempo esgotado ao chamar API WhatsApp." : error.message;
  } finally {
    clearTimeout(timeout);
  }
  item.updatedAt = new Date().toISOString();
  provider.whatsappGroupQueue.unshift(item);
  provider.whatsappGroupQueue = provider.whatsappGroupQueue.slice(0, 500);
  return item;
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    ...securityHeaders,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Provider-Token, X-Pegma-Permission",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS"
  });
  res.end(body);
}

function sendJson(res, status, body) {
  send(res, status, JSON.stringify(body), "application/json; charset=utf-8");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.aborted || req.destroyed) return reject(new Error("Requisicao interrompida"));
    let raw = "";
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      req.removeListener("aborted", aborted);
      req.removeListener("error", aborted);
      if (error) reject(error); else resolve(value);
    };
    const aborted = () => finish(new Error("Requisicao interrompida"));
    const timer = setTimeout(() => finish(new Error("Tempo esgotado ao receber requisicao")), 15000);
    timer.unref();
    req.once("aborted", aborted);
    req.once("error", aborted);
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 12_000_000) {
        finish(new Error("Payload muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        finish(null, {});
        return;
      }
      try {
        finish(null, JSON.parse(raw));
      } catch (error) {
        finish(error);
      }
    });
  });
}

function findTenant(provider, tenantCode) {
  return provider.clients.find((client) => client.tenantCode === normalizeTenantCode(tenantCode));
}

const publicTerminalAuthDisabled = false;

function publicTerminalAllowed(tenantState, token) {
  if (publicTerminalAuthDisabled) return true;
  const expected = String(tenantState?.settings?.publicTerminalToken || "").trim();
  const received = String(token || "").trim();
  if (!expected) return true;
  if (!received || expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function publicTerminalTokenFromSearch(searchParams) {
  return searchParams.get("terminalToken") || searchParams.get("token") || searchParams.get("limpar") || "";
}

function publicTerminalTokenFromBody(body) {
  return body.terminalToken || body.token || body.limpar || "";
}

function publicTerminalError(token) {
  return token
    ? "Token do totem invalido para esta unidade. Abra pelo link atualizado em Pedidos online / Totem."
    : "Link sem token do totem. Abra pelo botao Copiar link em Pedidos online / Totem.";
}

function findUser(tenantState, username) {
  const normalized = String(username || "").trim().toLowerCase();
  return (tenantState.users || []).find((user) => String(user.username || "").trim().toLowerCase() === normalized);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    active: user.active !== false,
    permissions: validPermissions(user.permissions, user.role),
    screenPermissions: user.screenPermissions || {}
  };
}

function validPermissions(permissions, role = "Vendedor") {
  if (!Array.isArray(permissions)) return rolePermissions[role] || [];
  return permissions.filter((permission) => allPermissions.includes(permission));
}

function publicTenantState(state) {
  return {
    ...state,
    users: (state.users || []).map(publicUser)
  };
}

function publicProvider(provider) {
  const { providerAdmins, companyProfile: privateCompanyProfile, ...safe } = provider;
  return {
    ...safe,
    clients: (safe.clients || []).map(publicTenant)
  };
}

function publicTenant(tenant) {
  const { licensePassword, activeSessions, ...safe } = tenant;
  return {...safe, activeSessions:(activeSessions||[]).map(({sessionId,...session})=>session)};
}

function moneyRound(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function financeBalance(row) {
  if (row?.cancelled) return 0;
  return Math.max(0, Number(row?.value || 0) + Number(row?.interest || 0) - Number(row?.discount || 0) - Number(row?.paidValue || 0));
}

function receivableForSale(receivables, sale, customer, payment, history) {
  const row = {
    id: Math.max(0, ...receivables.map((item) => Number(item.id) || 0)) + 1,
    customer,
    due: today(),
    value: Number(sale.total || 0),
    paidValue: 0,
    paid: false,
    accountCode: "3.1.01",
    payment,
    history,
    sourceSaleId: sale.id
  };
  row.balance = financeBalance(row);
  return row;
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function activeSalesForRoyalties(tenantState) {
  return (tenantState.sales || []).filter((sale) => !["Cancelado", "Cancelada", "Devolvido"].includes(sale.status));
}

function monthlySalesTotal(tenantState, month = today().slice(0, 7)) {
  return activeSalesForRoyalties(tenantState)
    .filter((sale) => String(sale.date || sale.createdAt || "").slice(0, 7) === month)
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
}

function royaltySettings(provider = readProvider()) {
  return {
    advertisingRate: 2,
    salesRoyaltyRate: 4,
    technologyFee: 149.9,
    marketingFundRate: 1,
    campaignFee: 0,
    minimumMonthlyFee: 299.9,
    ...(provider.royaltySettings || {})
  };
}

function royaltyBreakdown(tenant, tenantState, provider = readProvider(), month = today().slice(0, 7)) {
  const settings = royaltySettings(provider);
  const salesBase = monthlySalesTotal(tenantState, month);
  const advertising = moneyRound(salesBase * Number(settings.advertisingRate || 0) / 100);
  const salesRoyalty = moneyRound(salesBase * Number(settings.salesRoyaltyRate || 0) / 100);
  const technology = moneyRound(settings.technologyFee || 0);
  const marketingFund = moneyRound(salesBase * Number(settings.marketingFundRate || 0) / 100);
  const campaignFee = moneyRound(settings.campaignFee || 0);
  const subtotal = moneyRound(advertising + salesRoyalty + technology + marketingFund + campaignFee);
  const minimumComplement = Math.max(0, moneyRound(Number(settings.minimumMonthlyFee || 0) - subtotal));
  const total = moneyRound(subtotal + minimumComplement);
  return {
    tenantCode: tenant.tenantCode,
    unit: tenant.tradeName,
    month,
    salesBase: moneyRound(salesBase),
    advertising,
    salesRoyalty,
    technology,
    marketingFund,
    campaignFee,
    minimumComplement,
    total,
    settings
  };
}

function effectiveProductPrice(product, qty = 1) {
  const promotion = product?.promotion || {};
  const active = (Number(promotion.price || 0) > 0 || Number(promotion.retailPercent || 0) > 0 || Number(promotion.wholesalePercent || 0) > 0)
    && (!promotion.from || today() >= promotion.from)
    && (!promotion.to || today() <= promotion.to)
    && Number(qty || 0) >= Number(promotion.minQty || 0);
  if (!active) return Number(product?.price || 0);
  if (Number(promotion.price || 0) > 0) return Number(promotion.price);
  const base = Number(product?.price || 0);
  const wholesale = Number(promotion.wholesaleQty || 0) > 0 && Number(qty || 0) >= Number(promotion.wholesaleQty || 0);
  const percent = wholesale ? Number(promotion.wholesalePercent || 0) : Number(promotion.retailPercent || 0);
  return Math.max(0, base - base * percent / 100);
}

function optionList(options, fallback = []) {
  const source = Array.isArray(options) ? options : String(options || "").split(",");
  const normalized = source.map((option) => String(option || "").trim()).filter(Boolean);
  const chosen = normalized.length ? normalized : fallback;
  return [...new Set(chosen.map((option) => String(option || "").trim()).filter(Boolean))];
}

function defaultToppingOptions(product = {}) {
  const description = String(product.description || "").toLowerCase();
  if (description.includes("combo")) return ["Sortidos", "Granulado", "Chocoball", "Cookies baunilha", "Ovomaltine"];
  if (description.includes("milk") || description.includes("shake")) return ["Chantilly", "Granulado", "Chocoball", "Cookies baunilha", "Ovomaltine"];
  return ["Granulado", "Chocoball", "Cookies baunilha", "Farofa de pacoca", "Amendoim granulado", "Gotas cookies chocolate", "Ovomaltine"];
}

function catalogProduct(product, tenant, tenantState) {
  const price = effectiveProductPrice(product, 1);
  const hasCoverage = Boolean(product.hasCoverage || optionList(product.coverageOptions).length);
  return {
    id: product.id,
    tenantCode: tenant.tenantCode,
    unit: tenant.tradeName,
    description: product.description,
    unit: product.unit || "UN",
    unitMeasure: product.unit || "UN",
    price,
    cost: Number(product.cost || 0),
    stock: Number(product.stock || 0),
    photo: product.photo || "",
    type: product.type || "",
    isBundle: Boolean(product.isBundle || product.type === "Produto composto" || product.composition?.length),
    additional: Boolean(product.additional),
    hasCoverage,
    coverageOptions: hasCoverage ? optionList(product.coverageOptions, ["Sem cobertura", "Chocolate", "Morango", "Doce de leite"]) : [],
    toppingOptions: optionList(product.toppingOptions || product.additionalOptions || product.extrasOptions),
    city: tenant.city || tenantState.settings?.city || "",
    uf: tenant.uf || tenantState.settings?.uf || "",
    cep: tenant.cep || tenantState.settings?.cep || ""
  };
}

async function lookupCepAddress(cep) {
  const normalized = String(cep || "").replace(/\D/g, "");
  if (normalized.length !== 8) return null;
  try {
    const response = await fetch(`${process.env.TORTELAPLUS_CEP_LOOKUP_URL||"https://viacep.com.br/ws/"}${normalized}/json/`, { signal: AbortSignal.timeout(5000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.erro) return { cep: normalized };
    return {
      cep: normalized,
      address: data.logradouro || "",
      district: data.bairro || "",
      city: data.localidade || "",
      uf: String(data.uf || "").toUpperCase(),
      complement: data.complemento || ""
    };
  } catch (error) {
    return { cep: normalized };
  }
}

function deliveryRadiusKm(){return deliveryArea.RADIUS_KM;}
function onlineDeliveryDecision(unit,address){return deliveryArea.decision(unit,address);}

async function createOnlinePaymentCharge(tenantCode, tenantState, saleDraft, paymentMethod) {
  const secrets = loadFiscalSecrets(tenantCode);
  const isPix = paymentMethod === "PIX";
  const url = isPix ? (tenantState.settings?.pixApiUrl || tenantState.settings?.paymentApiUrl) : tenantState.settings?.paymentApiUrl;
  const token = isPix ? (secrets.pixApiToken || secrets.paymentApiToken) : secrets.paymentApiToken;
  if (!url || !token) {
    return {
      method: paymentMethod,
      online: true,
      status: "Pendente",
      provider: "Aguardando provedor de pagamento",
      message: "Configure URL e token do gateway online para capturar PIX/cartao automaticamente."
    };
  }
  const authHeader = String(tenantState.settings.paymentAuthHeader || "Authorization").replace(/[^A-Za-z0-9-]/g, "") || "Authorization";
  const authScheme = String(tenantState.settings.paymentAuthScheme || "Bearer").trim();
  const authValue = [authScheme, token].filter(Boolean).join(" ");
  const payload = {
    provider: tenantState.settings.paymentProvider || "",
    method: paymentMethod.toLowerCase(),
    amount: Number(saleDraft.total || 0),
    reference: `online-${tenantCode}-${saleDraft.id}`,
    customer: saleDraft.customerData,
    items: saleDraft.items,
    callbackUrl: tenantState.settings.paymentCallbackUrl || ""
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", [authHeader]: authValue, "Idempotency-Key": payload.reference },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Gateway retornou HTTP ${response.status}.`);
    return {
      method: paymentMethod,
      online: true,
      status: result.status || "Aguardando pagamento",
      provider: tenantState.settings.paymentProvider || "Gateway online",
      chargeId: result.id || result.chargeId || result.txid || "",
      qrCode: result.qrCode || result.pixQrCode || "",
      paymentUrl: result.paymentUrl || result.checkoutUrl || result.url || "",
      raw: result,
      message: "Cobranca online criada no provedor configurado."
    };
  } catch (error) {
    return {
      method: paymentMethod,
      online: true,
      status: "Erro no gateway",
      provider: tenantState.settings.paymentProvider || "Gateway online",
      error: error.message,
      message: `Nao foi possivel criar a cobranca online: ${error.message}`
    };
  }
}

async function onlineStoreCatalog(query = {}) {
  const provider = readProvider();
  const cep = String(query.cep || "").replace(/\D/g, "");
  const q = String(query.q || "").trim().toLowerCase();
  const forcedTenantCode = normalizeTenantCode(query.tenantCode || "");
  const deliveryAddress = await lookupCepAddress(cep);
  if(deliveryAddress&&query.customer?.number)deliveryAddress.number=String(query.customer.number).trim();
  if(deliveryAddress&&!deliveryAddress.address&&query.customer?.address)deliveryAddress.address=String(query.customer.address);
  const customerAddressMismatch=Boolean(query.customer&&deliveryAddress&&((deliveryAddress.address&&query.customer.address&&!deliveryArea.sameStreet(deliveryAddress.address,query.customer.address))||(deliveryAddress.city&&query.customer.city&&normalizeText(deliveryAddress.city)!==normalizeText(query.customer.city))||(deliveryAddress.uf&&query.customer.uf&&String(deliveryAddress.uf).toUpperCase()!==String(query.customer.uf).toUpperCase())));
  const customerPoint=cep.length===8?await deliveryGeocoder.resolve(deliveryAddress||{}):null;
  const units = [];
  const products = [];
  for (const tenant of provider.clients || []) {
    if (tenant.status && tenant.status !== "Ativo") continue;
    if (cep.length!==8&&forcedTenantCode && normalizeTenantCode(tenant.tenantCode) !== forcedTenantCode) continue;
    const tenantState = readTenantState(tenant.tenantCode);
    const unitProducts = (tenantState.products || [])
      .filter((product) => product.active !== false && effectiveProductPrice(product, 1) > 0)
      .map((product) => catalogProduct(product, tenant, tenantState));
    const tenantAddress=deliveryArea.storeAddress(tenant,tenantState);
    const radiusKm=deliveryArea.RADIUS_KM;
    const storePoint=customerPoint?await deliveryGeocoder.resolve(tenantAddress):null;
    const distanceKm=deliveryArea.distanceKm(customerPoint,storePoint);
    units.push({
      tenantCode: tenant.tenantCode,
      tradeName: tenant.tradeName,
      city: tenantAddress.city,
      uf: tenantAddress.uf,
      cep: tenantAddress.cep,
      distanceKm,
      deliveryRadiusKm: radiusKm,
      deliveryAvailable: cep.length === 8 ? Number.isFinite(distanceKm)&&distanceKm <= radiusKm : null,
      products: unitProducts.length
    });
    products.push(...unitProducts);
  }
  const filtered = products.filter((product) => !q || product.description.toLowerCase().includes(q));
  const nearest = cep.length===8?deliveryArea.chooseNearest(units):units.filter(unit=>unit.products>0)[0]||null;
  const delivery = onlineDeliveryDecision(customerAddressMismatch||cep.length===8&&units.some(unit=>unit.products>0&&!Number.isFinite(unit.distanceKm))?null:nearest, deliveryAddress);
  const deliveryProducts = cep.length === 8 && nearest
    ? filtered.filter((product) => product.tenantCode === nearest.tenantCode)
    : filtered;
  return {
    ok: true,
    nearest,
    deliveryAddress,
    deliveryAvailable: delivery.available,
    deliveryMessage: customerAddressMismatch?"O endereço informado não corresponde ao CEP. Confira o CEP, o logradouro e a cidade antes de enviar o pedido.":delivery.message,
    deliveryDistanceKm: delivery.distanceKm,
    deliveryReason: customerAddressMismatch?"address_mismatch":delivery.reason||"",
    deliveryRadiusKm:10,
    distanceMethod:"geographic",
    locationAttribution:"Photon / © OpenStreetMap contributors",
    units: units.sort((a, b) => a.distanceKm - b.distanceKm || String(a.tradeName).localeCompare(String(b.tradeName))),
    products: deliveryProducts.sort((a, b) => {
      if (!nearest) return String(a.description).localeCompare(String(b.description));
      return (a.tenantCode === nearest.tenantCode ? 0 : 1) - (b.tenantCode === nearest.tenantCode ? 0 : 1)
        || String(a.description).localeCompare(String(b.description));
    })
  };
}

function normalizedUnit(unit) {
  return String(unit || "").trim().toUpperCase();
}

function componentStockQty(component, product) {
  const qty = Number(component?.qty || 0);
  const useUnit = normalizedUnit(component?.useUnit || product?.unit);
  const stockUnit = normalizedUnit(product?.unit);
  if (!qty) return 0;
  if (!useUnit || useUnit === "AUTO" || useUnit === stockUnit) return qty;
  if (useUnit === "G" && stockUnit === "KG") return qty / 1000;
  if (useUnit === "KG" && stockUnit === "G") return qty * 1000;
  if (useUnit === "ML" && stockUnit === "LT") return qty / 1000;
  if (useUnit === "LT" && stockUnit === "ML") return qty * 1000;
  return qty;
}

function saleComposition(product) {
  return (product?.composition || []).filter((component) => (component.mode || "both") !== "production");
}

function collectOnlineStockRequirements(product, qty, products, visited = new Set()) {
  if (!product) return [];
  const productId = Number(product.id);
  if (visited.has(productId)) return [{ productId, qty: Number(qty || 0) }];
  const components = saleComposition(product);
  if (!components.length) return [{ productId, qty: Number(qty || 0) }];
  const nextVisited = new Set(visited);
  nextVisited.add(productId);
  return components.flatMap((component) => {
    const raw = products.find((row) => Number(row.id) === Number(component.productId));
    const componentQty = componentStockQty(component, raw) * Number(qty || 0);
    return raw ? collectOnlineStockRequirements(raw, componentQty, products, nextVisited) : [{ productId: Number(component.productId), qty: componentQty }];
  });
}

function onlineOrderRequirements(items, products) {
  const totals = new Map();
  items.forEach((item) => {
    const product = products.find((row) => Number(row.id) === Number(item.productId));
    if (!product) return;
    collectOnlineStockRequirements(product, Number(item.qty || 0), products).forEach((requirement) => {
      totals.set(Number(requirement.productId), Number(totals.get(Number(requirement.productId)) || 0) + Number(requirement.qty || 0));
    });
  });
  return Array.from(totals, ([productId, qty]) => ({ productId, qty }));
}

function applyOnlineOrderStock(tenantState, items, saleId) {
  tenantState.stockMovements = Array.isArray(tenantState.stockMovements) ? tenantState.stockMovements : [];
  const products = tenantState.products || [];
  const requirements = onlineOrderRequirements(items, products);
  const shortage = requirements
    .map((requirement) => {
      const product = products.find((row) => Number(row.id) === Number(requirement.productId));
      return product ? null : `${product?.description || requirement.productId}: saldo ${product?.stock || 0}, necessario ${requirement.qty}`;
    })
    .filter(Boolean);
  if (shortage.length) return shortage;
  requirements.forEach((requirement) => {
    const product = products.find((row) => Number(row.id) === Number(requirement.productId));
    if (!product) return;
    product.stock = Number(product.stock || 0) - Number(requirement.qty || 0);
    tenantState.stockMovements.push({
      id: Math.max(0, ...tenantState.stockMovements.map((row) => Number(row.id) || 0)) + 1,
      date: today(),
      productId: product.id,
      product: product.description,
      type: "Pedido online",
      qty: -Number(requirement.qty || 0),
      balance: product.stock,
      history: `Pedido online ${saleId}`
    });
  });
  return [];
}

function restoreOnlineOrderStock(tenantState, items, saleId) {
  tenantState.stockMovements = Array.isArray(tenantState.stockMovements) ? tenantState.stockMovements : [];
  const products = tenantState.products || [];
  const requirements = onlineOrderRequirements(items, products);
  requirements.forEach((requirement) => {
    const product = products.find((row) => Number(row.id) === Number(requirement.productId));
    if (!product) return;
    product.stock = Number(product.stock || 0) + Number(requirement.qty || 0);
    tenantState.stockMovements.push({
      id: Math.max(0, ...tenantState.stockMovements.map((row) => Number(row.id) || 0)) + 1,
      date: today(),
      productId: product.id,
      product: product.description,
      type: "Estorno pedido online",
      qty: Number(requirement.qty || 0),
      balance: product.stock,
      history: `Cancelamento pedido online ${saleId}`
    });
  });
}

function nextKioskTicketNumber(tenantState) {
  const currentDay = today();
  const numbers = (tenantState.sales || [])
    .filter((sale) => sale.kioskOrder && sale.date === currentDay)
    .map((sale) => Number(sale.kioskTicketNumber) || 0);
  return Math.max(0, ...numbers) + 1;
}

function enqueueSaleNfce(tenantState, sale, status = "Aguardando transmissao") {
  tenantState.fiscalQueue = Array.isArray(tenantState.fiscalQueue) ? tenantState.fiscalQueue : [];
  const row = {
    id: Math.max(0, ...tenantState.fiscalQueue.map((item) => Number(item.id) || 0)) + 1,
    model: "NFC-e",
    serie: String(tenantState.settings.nfceSerie || "1"),
    nature: "Venda de mercadoria",
    status,
    customer: sale.customer || "Consumidor Final",
    customerDocument: sale.customerDocument || "",
    saleId: sale.id,
    issuedAt: new Date().toISOString(),
    items: structuredClone(sale.items || []),
    payments: structuredClone(sale.payments || [{ method: sale.payment || "PIX", value: sale.total || 0 }]),
    payment: sale.payment || "PIX",
    discount: 0,
    addition: 0,
    total: sale.total || 0,
    key: "",
    protocol: "",
    xml: ""
  };
  tenantState.fiscalQueue.push(row);
  return row;
}

function bearerToken(req) {
  const authorization = req.headers.authorization || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return "";
  return authorization.slice(7).trim();
}

function requestIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
}

function providerAccess(req) {
  const token = bearerToken(req) || req.headers["x-provider-token"] || "";
  if (providerAdminToken && token === providerAdminToken) return { username: "token-provedor", role: "Administrador" };
  const session = providerSessions.get(token);
  if (!session || Date.now() - session.lastSeenAt > sessionTtlMs) {
    if (token) providerSessions.delete(token);
    return null;
  }
  const admin = readProvider().providerAdmins.find(user => user.username === session.username && user.active);
  if (!admin) { providerSessions.delete(token); return null; }
  Object.assign(session, { id: admin.id, name: admin.name, permissions: permissionsFor(admin) });
  session.lastSeenAt = Date.now();
  return session;
}

function providerAccessAllowed(req) {
  return Boolean(providerAccess(req));
}

function loginAttemptKey(scope, username, ipAddress) {
  return `${scope}|${String(username || "").toLowerCase()}|${ipAddress}`;
}

function loginBlocked(key) {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;
  if (Date.now() > attempt.blockedUntil) {
    loginAttempts.delete(key);
    return false;
  }
  return attempt.failures >= 5;
}

function recordLoginFailure(key) {
  const current = loginAttempts.get(key) || { failures: 0, blockedUntil: 0 };
  current.failures += 1;
  current.blockedUntil = current.failures >= 5 ? Date.now() + 15 * 60 * 1000 : Date.now() + 60 * 1000;
  loginAttempts.set(key, current);
}

function validNewPassword(password) {
  return String(password || "").length >= 8;
}

function sessionAccess(req, provider, tenantCode, requiredPermission = "") {
  const tenant = findTenant(provider, tenantCode);
  if (!tenant) return { error: { status: 404, message: "Cliente nao encontrado" } };
  refreshTerminalCount(tenant);
  if (tenant.status !== "Ativo" && tenant.status !== "Homologacao") {
    tenant.activeSessions = [];
    refreshTerminalCount(tenant);
    writeProvider(provider);
    return { error: { status: 403, message: "Unidade bloqueada na Central Tortela" } };
  }
  const sessionId = bearerToken(req);
  const session = (tenant.activeSessions || []).find((item) => item.sessionId === sessionId);
  if (!session) return { error: { status: 401, message: "Sessao invalida ou expirada" } };
  const currentUser = findUser(readTenantState(tenantCode), session.user);
  if (!currentUser || !currentUser.active) return { error: { status: 401, message: "Usuario bloqueado ou removido" } };
  session.role = currentUser.role;
  session.permissions = validPermissions(currentUser.permissions, currentUser.role);
  const permissions = session.permissions;
  if(requiredPermission && !tenantModuleAllowed(tenant,requiredPermission))return {error:{status:403,message:"Este setor nao esta liberado pela Central para a unidade"}};
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return { error: { status: 403, message: "Perfil sem permissao para esta operacao" } };
  }
  session.lastSeenAt = new Date().toISOString();
  refreshTerminalCount(tenant);
  return { tenant, session };
}

function deny(res, access) {
  sendJson(res, access.error.status, { ok: false, error: access.error.message });
}

function tenantAccessOrProvider(req, provider, tenantCode, requiredPermission = "") {
  const providerSession = providerAccess(req);
  if (providerSession) {
    const tenant = findTenant(provider, tenantCode);
    if (!tenant) return { error: { status: 404, message: "Cliente nao encontrado" } };
    return { tenant, session: { user: providerSession.username, role: providerSession.role || "Administrador", provider: true } };
  }
  return sessionAccess(req, provider, tenantCode, requiredPermission);
}

function assertTenantPayload(tenantCode, payload) {
  const code = normalizeTenantCode(tenantCode);
  const payloadCode = normalizeTenantCode(payload?.settings?.tenantCode || "");
  if (payloadCode && payloadCode !== code) {
    throw new Error(`Dados de ${payloadCode} nao podem ser gravados na unidade ${code}.`);
  }
}

function tenantSnapshot(tenantCode) {
  const state = readTenantState(tenantCode);
  return tenantSnapshotDocument(tenantCode, state, "manual");
}

async function tenantFileArchive(tenantCode, categories = ["xml"]) {
  const code = normalizeTenantCode(tenantCode);
  const files = new Map();
  for (const category of categories) {
    const directory = tenantStorageDir(code, category);
    if (fs.existsSync(directory)) {
      fs.readdirSync(directory).forEach((filename) => {
        const filePath = path.join(directory, filename);
        files.set(`${category}/${filename}`, {
          category,
          filename,
          mimeType: types[path.extname(filename).toLowerCase()]?.split(";")[0] || "application/octet-stream",
          createdAt: fs.statSync(filePath).mtime.toISOString(),
          contentBase64: fs.readFileSync(filePath).toString("base64")
        });
      });
    }
    if (postgresStore) {
      const storedFiles = await postgresStore.listFiles(code, category);
      storedFiles.forEach((file) => files.set(`${category}/${file.filename}`, {
        category,
        filename: file.filename,
        mimeType: file.mime_type || "application/octet-stream",
        createdAt: file.created_at,
        contentBase64: Buffer.from(file.content).toString("base64")
      }));
    }
  }
  return {
    tenantCode: code,
    generatedAt: new Date().toISOString(),
    format: "files-base64",
    categories,
    totalFiles: files.size,
    files: [...files.values()]
  };
}

async function tenantFiscalXmlArchive(tenantCode) {
  return tenantFileArchive(tenantCode, ["xml"]);
}

async function completeTenantBackup(tenantCode, reason = "manual-completo") {
  const code = normalizeTenantCode(tenantCode);
  const state = readTenantState(code);
  createScheduledTenantBackup(code, state);
  return {
    ...tenantSnapshotDocument(code, state, reason),
    fiscalFileArchive: await tenantFileArchive(code, ["xml", "pdf"]),
    fiscalXmlArchive: await tenantFiscalXmlArchive(code)
  };
}

function validateTenantBackupPayload(tenantCode, backup) {
  const code = normalizeTenantCode(tenantCode);
  if (!backup || typeof backup !== "object") throw new Error("Arquivo de backup invalido");
  if (backup.product && backup.product !== "Tortela Plus") throw new Error("Backup nao pertence ao Tortela Plus");
  if (backup.type && backup.type !== "tenant-backup" && backup.type !== "backup-geral-central-saas") throw new Error("Tipo de backup invalido");
  const restored = backup.state || backup;
  if (!restored || typeof restored !== "object" || Array.isArray(restored)) throw new Error("Estado do backup invalido");
  if (!restored.settings || typeof restored.settings !== "object") throw new Error("Backup sem configuracoes da unidade");
  if (restored.settings.tenantCode && normalizeTenantCode(restored.settings.tenantCode) !== code) throw new Error("Backup pertence a outro cliente");
  if (!Array.isArray(restored.products)) throw new Error("Backup sem cadastro de produtos");
  if (!Array.isArray(restored.users)) throw new Error("Backup sem usuarios");
  if (!Array.isArray(restored.sales)) throw new Error("Backup sem historico de vendas");
  return restored;
}

async function restoreTenantBackup(tenantCode, backup) {
  const code = normalizeTenantCode(tenantCode);
  const restored = validateTenantBackupPayload(code, backup);
  const current = readTenantState(code);
  const safetyBackup = createPreRestoreTenantBackup(code, current);
  writeTenantState(code, restored);
  const archive = backup.fiscalFileArchive || backup.fiscalXmlArchive;
  let restoredFiles = 0;
  for (const file of archive?.files || []) {
    if (!file.contentBase64 || !file.filename) continue;
    saveTenantFile({
      tenantCode: code,
      category: file.category || "xml",
      filename: file.filename,
      mimeType: file.mimeType || "application/octet-stream",
      content: file.contentBase64,
      preserveFilename: true
    });
    restoredFiles += 1;
  }
  return { restoredFiles, safetyBackup };
}

async function completeProviderBackup(reason = "backup-geral-central-saas") {
  const provider = readProvider();
  const clients = [];
  for (const tenant of provider.clients || []) clients.push(await completeTenantBackup(tenant.tenantCode, reason));
  const backup = {
    product: "Tortela Plus",
    type: "backup-geral-central-saas",
    generatedAt: new Date().toISOString(),
    reason,
    totalClients: clients.length,
    provider: publicProvider(provider),
    clients
  };
  const directory = path.join(backupsDir, "provider");
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${reason}.json`;
  writeJson(path.join(directory, filename), backup);
  fs.readdirSync(directory).filter((name) => name.endsWith(".json")).sort().reverse().slice(30).forEach((name) => fs.unlinkSync(path.join(directory, name)));
  if (postgresStore) postgresStore.queue(() => postgresStore.writeProviderBackup(reason, backup));
  return backup;
}

function fiscalXmlFromState(tenantState, row, tenantCode = "") {
  const secrets = tenantCode ? loadFiscalSecrets(tenantCode) : {};
  return generateFiscalXml(tenantState, row, { csc: secrets.csc || "" });
}

function findFiscalRuleFromState(tenantState, model, nature = "") {
  const todayText = today();
  const rules = tenantState.fiscalRules || [];
  return rules.find((item) =>
    item.active !== false &&
    item.model === model &&
    item.regime === tenantState.settings.regime &&
    (!item.crt || String(item.crt)===require("./src/fiscal-regimes").profile(tenantState.settings).crt) &&
    item.uf === tenantState.settings.uf &&
    (!item.validFrom || item.validFrom <= todayText) &&
    (!item.validTo || item.validTo >= todayText) &&
    (!nature || !item.operation || String(nature).toLowerCase().includes(String(item.operation).toLowerCase().slice(0, 8)))
  ) || rules.find((item) =>
    item.active !== false &&
    item.model === model &&
    item.regime === tenantState.settings.regime &&
    (!item.crt || String(item.crt)===require("./src/fiscal-regimes").profile(tenantState.settings).crt) &&
    item.uf === tenantState.settings.uf
  ) || {};
}

function validateFiscalDocumentFromState(tenantState, row) {
  if([5,6].includes(Number(row.purpose)))return validateNfeState(tenantState,row);
  const missing = [];
  const settings = tenantState.settings || {};
  const rule = findFiscalRuleFromState(tenantState, row.model, row.nature);
  const document = String(settings.document || "").replace(/\D/g, "");
  if (!rule.id) missing.push("regra fiscal ativa");
  if (Number(row.total || 0) <= 0) missing.push("total maior que zero");
  if (!document.match(/^\d{14}$/) || /^(\d)\1{13}$/.test(document)) missing.push("CNPJ real valido");
  if (row.model === "NFS-e") {
    if (!settings.municipalRegistration) missing.push("inscricao municipal");
    if (!row.service?.cityCode) missing.push("codigo IBGE do municipio");
    if (!row.service?.serviceCode) missing.push("item da lista de servico");
    if (!row.service?.description) missing.push("discriminacao do servico");
  } else {
    if (!settings.stateRegistration) missing.push("inscricao estadual");
    if (row.model === "NFC-e" && (!settings.cscConfigured || !settings.cscId)) missing.push("CSC e ID CSC");
    // NCM is validated per item by validateNfeState, not from a generic rule.
    if (require("./src/fiscal-regimes").profile(settings).icmsSimple && !rule.csosn) missing.push("CSOSN");
    if (!require("./src/fiscal-regimes").profile(settings).icmsSimple && !rule.cst) missing.push("CST");
    missing.push(...validateNfeState(tenantState, row));
  }
  return [...new Set(missing)];
}

function escapeXml(value) {
  return String(value || "").replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
  }[char]));
}

function acbrMonitorCommand(host, portNumber, command, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port: portNumber });
    let response = "";
    const finish = (error) => {
      socket.destroy();
      if (error) reject(error);
      else resolve(response.trim());
    };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => socket.write(`${command}\r\n`));
    socket.on("data", (chunk) => {
      response += chunk.toString("utf8");
      if (response.includes("\r\n.\r\n") || response.includes("\n.\n")) finish();
    });
    socket.on("timeout", () => finish(new Error("Tempo esgotado ao conectar no ACBrMonitor")));
    socket.on("error", finish);
    socket.on("end", () => resolve(response.trim()));
  });
}

function rejectAcbrLibPending(engine, error) {
  for (const pending of engine.pending.values()) {
    clearTimeout(pending.timer);
    pending.reject(error);
  }
  engine.pending.clear();
}

function startAcbrLibProcess(engineName = "nfe") {
  const engine = acbrEngines[engineName];
  if (!engine) throw new Error(`Motor ACBr desconhecido: ${engineName}`);
  if (engine.process && !engine.process.killed) return engine.process;
  for (const requiredPath of [acbrLibBridgeExe, engine.dll, acbrLibIni]) {
    if (!fs.existsSync(requiredPath)) throw new Error(`Arquivo ACBrLib ausente: ${requiredPath}`);
  }
  engine.process = spawn(acbrLibBridgeExe, [engine.dll], {
    cwd: path.dirname(acbrLibBridgeExe),
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"]
  });
  engine.process.stdout.on("data", (chunk) => {
    engine.buffer += chunk.toString("utf8");
    const lines = engine.buffer.split(/\r?\n/);
    engine.buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line);
        const pending = engine.pending.get(response.id);
        if (!pending) continue;
        clearTimeout(pending.timer);
        engine.pending.delete(response.id);
        if (response.ok) pending.resolve(response);
        else pending.reject(new Error(response.error || "Falha no bridge ACBrLib"));
      } catch {
        // Saidas que nao forem JSON permanecem apenas no log nativo da ACBrLib.
      }
    }
  });
  engine.process.stderr.on("data", (chunk) => console.error(`[ACBrLib ${engineName}] ${chunk.toString("utf8").trim()}`));
  engine.process.on("exit", (code) => {
    engine.process = null;
    engine.initialized = false;
    rejectAcbrLibPending(engine, new Error(`Bridge ACBrLib ${engineName} encerrado com codigo ${code}`));
  });
  return engine.process;
}

function acbrLibCommand(method, args = [], timeoutMs = 10000, engineName = "nfe") {
  return new Promise((resolve, reject) => {
    let processHandle;
    const engine = acbrEngines[engineName];
    try {
      processHandle = startAcbrLibProcess(engineName);
    } catch (error) {
      reject(error);
      return;
    }
    const id = `pegma-${Date.now()}-${++acbrLibSequence}`;
    const timer = setTimeout(() => {
      engine.pending.delete(id);
      reject(new Error(`Tempo esgotado no comando ACBrLib: ${method}`));
    }, timeoutMs);
    engine.pending.set(id, { resolve, reject, timer });
    processHandle.stdin.write(`${JSON.stringify({ id, method, args: args.map(String) })}\n`);
  });
}

async function initializeAcbrLib(configPath = acbrLibIni, engineName = "nfe") {
  const engine = acbrEngines[engineName];
  const configHash = fs.existsSync(configPath)
    ? crypto.createHash("sha256").update(fs.readFileSync(configPath)).digest("hex")
    : "";
  if (engine.initialized && engine.process && !engine.process.killed && engine.currentConfig === configPath && engine.currentConfigHash === configHash) {
    return { code: 0, response: `ACBrLib ${engineName} isolada ja inicializada.` };
  }
  if (engine.process && !engine.process.killed && (engine.currentConfig !== configPath || engine.currentConfigHash !== configHash)) {
    engine.process.kill();
    engine.process = null;
    engine.initialized = false;
  }
  const response = await acbrLibCommand("inicializar", [configPath, ""], 10000, engineName);
  if (Number(response.code) !== 0) {
    const detail = await acbrLibCommand("ultimoretorno", [], 10000, engineName).catch(() => null);
    throw new Error(detail?.response || `ACBrLib retornou codigo ${response.code}`);
  }
  engine.initialized = true;
  engine.currentConfig = configPath;
  engine.currentConfigHash = configHash;
  return response;
}

async function acbrStatus(tenantState) {
  const settings = tenantState.settings || {};
  if (settings.acbrApiUrl) {
    try {
      const secrets = loadFiscalSecrets(settings.tenantCode || "cliente-exemplo");
      if (!secrets.acbrApiToken) throw new Error("Token do agente fiscal nao configurado.");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${String(settings.acbrApiUrl).replace(/\/+$/, "")}/health`, {
        headers: { Authorization: `Bearer ${secrets.acbrApiToken}` },
        signal: controller.signal
      }).finally(() => clearTimeout(timer));
      if (!response.ok) throw new Error(`Agente fiscal respondeu HTTP ${response.status}.`);
      const result = await response.json();
      if(String(settings.certificateName||" ").startsWith("vault-a1:")&&!result.capabilities?.certificateUpload)throw Error("Atualize o agente fiscal Windows para usar o certificado selecionado.");
      return { connected: true, engine: "Agente fiscal Windows + ACBr", isolated: true, secure: true, url: settings.acbrApiUrl, response: result };
    } catch (error) {
      return { connected: false, engine: "Agente fiscal Windows + ACBr", isolated: true, secure: true, url: settings.acbrApiUrl, message: error.message };
    }
  }
  const engine = settings.fiscalEngine || "ACBrLib";
  if (engine === "ACBrLib") {
    try {
      const tenantCode = settings.tenantCode || "cliente-exemplo";
      const configPath = configureAcbrForTenant(tenantCode, tenantState);
      const response = await initializeAcbrLib(configPath);
      return {
        connected: true,
        engine,
        isolated: true,
        capabilities: {
          nfeInstalled: fs.existsSync(acbrLibDll),
          nfceInstalled: fs.existsSync(acbrLibDll),
          nfseInstalled: fs.existsSync(acbrNfseDll),
          nfseBridgeActive: fs.existsSync(acbrNfseDll),
          officialTransmissionActive: Boolean(settings.sefazCredentialed && settings.certificatePasswordConfigured && settings.certificateName),
          operations: ["assinar", "validar", "enviar", "consultar", "cancelar", "inutilizar", "CC-e", "distribuicao DFe", "manifestacao", "imprimir PDF", "NFS-e"]
        },
        bridgePid: acbrEngines.nfe.process?.pid || null,
        nfseBridgePid: acbrEngines.nfse.process?.pid || null,
        dll: acbrLibDll,
        config: configPath,
        response: response.response || "ACBrLibNFe inicializada."
      };
    } catch (error) {
      return { connected: false, engine, isolated: true, message: error.message };
    }
  }
  if (engine !== "ACBrMonitor") {
    return { connected: false, engine, message: `${engine} ainda nao possui conector ativo neste servidor.` };
  }
  const host = settings.acbrHost || acbrHost || "127.0.0.1";
  const portNumber = Number(settings.acbrPort || acbrPort || 3436);
  try {
    const response = await acbrMonitorCommand(host, portNumber, "NFE.StatusServico");
    return { connected: true, engine, host, port: portNumber, response };
  } catch (error) {
    return { connected: false, engine, host, port: portNumber, message: error.message };
  }
}

async function fiscalAgentExecute(tenantCode, tenantState, payload) {
  const settings = tenantState.settings || {};
  if (!settings.acbrApiUrl) return null;
  const secrets = loadFiscalSecrets(tenantCode);
  if (!secrets.acbrApiToken) throw new Error("Token do agente fiscal nao configurado.");
  const response = await fetch(`${String(settings.acbrApiUrl).replace(/\/+$/, "")}/fiscal/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secrets.acbrApiToken}` },
    body: JSON.stringify({ tenantCode, fiscalConfig: fiscalAgentConfig(tenantCode, tenantState, secrets), ...payload }),
    signal: AbortSignal.timeout(70000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Agente fiscal respondeu HTTP ${response.status}.`);
  return result;
}

function acbrResponseOrThrow(response, operation) {
  const parsed = parseAcbrResponse(response?.response);
  if (Number(response?.code) !== 0 && !parsed.statusCode) {
    throw new Error(parsed.statusMessage || `${operation}: ACBrLib retornou codigo ${response?.code}`);
  }
  return parsed;
}

function fiscalLocalPath(tenantCode, row) {
  if (!row?.xmlUrl) throw new Error("XML fiscal ainda nao foi gerado.");
  return path.join(storageDir, normalizeTenantCode(tenantCode), "xml", path.basename(row.xmlUrl));
}

async function loadNfeXml(tenantCode, tenantState, row) {
  await initializeAcbrLib(configureAcbrForTenant(tenantCode, tenantState));
  const response = await acbrLibCommand("carregarxml", [fiscalLocalPath(tenantCode, row)]);
  acbrResponseOrThrow(response, "Carregar XML");
}

function ufCode(uf) {
  return {
    RO: 11, AC: 12, AM: 13, RR: 14, PA: 15, AP: 16, TO: 17, MA: 21, PI: 22, CE: 23, RN: 24,
    PB: 25, PE: 26, AL: 27, SE: 28, BA: 29, MG: 31, ES: 32, RJ: 33, SP: 35, PR: 41, SC: 42,
    RS: 43, MS: 50, MT: 51, GO: 52, DF: 53
  }[String(uf || "").toUpperCase()] || 0;
}

function acbrEventIni(tenantState, row, event) {
  const settings = tenantState.settings || {};
  const document = String(settings.document || "").replace(/\D/g, "");
  const sequence = Number(event.sequence || 1);
  const lines = [
    "[EVENTO]",
    `idLote=${Number(event.batch || 1)}`,
    "",
    "[EVENTO001]",
    `cOrgao=${String(event.type).startsWith("21") ? 91 : ufCode(settings.uf)}`,
    `tpAmb=${settings.fiscalEnvironment === "Producao" ? 1 : 2}`,
    `CNPJ=${document}`,
    `chNFe=${row.key}`,
    `dhEvento=${new Date().toISOString()}`,
    `tpEvento=${event.type}`,
    `nSeqEvento=${sequence}`,
    "verEvento=1.00"
  ];
  if (event.type === "110110") {
    lines.push(`xCorrecao=${event.text}`, "xCondUso=A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970.");
  } else if (event.justification) {
    lines.push(`xJust=${event.justification}`);
  }
  return lines.join("\r\n");
}

async function creditEventSource(tenantCode,state,body){
  const stored=(state.fiscalQueue||[]).find(r=>body.id&&Number(r.id)===Number(body.id))||(state.fiscalImports||[]).find(r=>r.key===String(body.key||''));
  if(!stored)throw Error('Importe o XML original autorizado ou selecione nota propria autorizada');
  let sourceXml=stored.xml;
  if(!sourceXml&&stored.xmlUrl){const filename=path.basename(stored.xmlUrl),file=path.join(storageDir,normalizeTenantCode(tenantCode),'xml',filename);if(fs.existsSync(file))sourceXml=fs.readFileSync(file,'utf8');else if(postgresStore){const saved=await postgresStore.readFile(tenantCode,'xml',filename);sourceXml=saved?.content?.toString('utf8');}}
  if(!sourceXml)throw Error('XML original nao disponivel para conferir o credito');
  return {...stored,sourceXml};
}
async function sendNfeEvent(tenantCode, tenantState, row, event) {
  if(['110300','211110','112110','211128','212110','212120'].includes(event.type)) {
    if(event.type==='110300'&&!fs.existsSync(path.join(__dirname,'runtime/fiscal/Schemas/envEventoVinculacaoPagamento_v1.00.xsd'))) throw Error('Evento 110300 aguarda pacote oficial de schemas de vinculacao de pagamento no agente fiscal; transmissao bloqueada.');
    const content=event.type!=='110300'?require('./src/server/rtc-credit-event').build(tenantState.settings,row,event).xml:require('./src/server/rtc-document-fields').paymentEventXml(tenantState.settings,row,event);
    if(!tenantState.settings.acbrApiUrl)await initializeAcbrLib(configureAcbrForTenant(tenantCode,tenantState));
    const file=saveTenantFile({tenantCode,category:'xml',filename:`evento-${event.type}-${row.key}-${event.sequence}.xml`,mimeType:'application/xml',content:Buffer.from(content).toString('base64')});
    let result;
    if(tenantState.settings.acbrApiUrl) result=await fiscalAgentExecute(tenantCode,tenantState,{engine:'nfe',steps:[{method:'carregareventoxml',file:{argIndex:0,filename:file.filename,content}},{method:'enviarevento',args:[1]}]});
    else { acbrResponseOrThrow(await acbrLibCommand('carregareventoxml',[path.join(storageDir,normalizeTenantCode(tenantCode),'xml',file.filename)]),'Carregar evento de pagamento'); const response=await acbrLibCommand('enviarevento',[1],60000);result={response,parsed:acbrResponseOrThrow(response,'Vincular pagamento')}; }
    const responseFile=saveFiscalResponse(tenantCode,`retorno-${event.type}-${row.key}-${event.sequence}.txt`,result.parsed.raw);
    return {...result,eventUrl:file.url,responseUrl:responseFile.url};
  }
  if (!row.key || !/^\d{44}$/.test(row.key)) throw new Error("Documento sem chave NF-e/NFC-e valida.");
  await initializeAcbrLib(configureAcbrForTenant(tenantCode, tenantState));
  const eventFile = saveTenantFile({
    tenantCode,
    category: "xml",
    filename: `evento-${event.type}-${row.key}.ini`,
    mimeType: "text/plain",
    content: Buffer.from(acbrEventIni(tenantState, row, event), "utf8").toString("base64")
  });
  const eventPath = path.join(storageDir, normalizeTenantCode(tenantCode), "xml", eventFile.filename);
  if (tenantState.settings?.acbrApiUrl) {
    const result = await fiscalAgentExecute(tenantCode, tenantState, {
      engine: "nfe",
      steps: [
        { method: "carregareventoini", file: { argIndex: 0, filename: eventFile.filename, content: acbrEventIni(tenantState, row, event) } },
        { method: "enviarevento", args: [Number(event.batch || 1)] }
      ]
    });
    const responseFile = saveFiscalResponse(tenantCode, `retorno-evento-${event.type}-${row.key}.txt`, result.response);
    return { response: result.response, parsed: result.parsed, eventUrl: eventFile.url, responseUrl: responseFile.url };
  }
  acbrResponseOrThrow(await acbrLibCommand("carregareventoini", [eventPath]), "Carregar evento");
  const response = await acbrLibCommand("enviarevento", [Number(event.batch || 1)], 60000);
  const parsed = acbrResponseOrThrow(response, "Enviar evento");
  const responseFile = saveFiscalResponse(tenantCode, `retorno-evento-${event.type}-${row.key}.txt`, parsed.raw);
  return { response, parsed, eventUrl: eventFile.url, responseUrl: responseFile.url };
}

function pdfBufferFromBase64(value) {
  const base64 = String(value || "").trim().replace(/^data:application\/pdf;base64,/i, "").replace(/\s/g, "");
  if (!base64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) return null;
  const buffer = Buffer.from(base64, "base64");
  return buffer.subarray(0, 4).equals(Buffer.from("%PDF")) ? buffer : null;
}

function savePdfBuffer(tenantCode, row, buffer) {
  return saveTenantFile({
    tenantCode,
    category: "pdf",
    filename: `${row.model.replace(/\W/g, "")}-${row.id}.pdf`,
    mimeType: "application/pdf",
    content: buffer.toString("base64")
  });
}

function saveAcbrPdf(tenantCode, row, response, startedAt = 0) {
  const raw = String(response?.response || "").trim();
  const buffer = pdfBufferFromBase64(raw);
  if (buffer) return savePdfBuffer(tenantCode, row, buffer);
  return latestTenantPdf(tenantCode, startedAt, row.model === "NFS-e" ? "DANFSe" : row.model === "NFC-e" ? "DANFCE" : "DANFE");
}

function latestTenantPdf(tenantCode, startedAt, label = "documento auxiliar") {
  const directory = tenantStorageDir(tenantCode, "pdf");
  const file = fs.readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .map((name) => ({ name, modified: fs.statSync(path.join(directory, name)).mtimeMs }))
    .filter((item) => item.modified >= startedAt - 1000)
    .sort((a, b) => b.modified - a.modified)[0];
  if (!file) throw new Error(`ACBr nao gerou o ${label} no diretorio configurado.`);
  return { url: `/storage/${normalizeTenantCode(tenantCode)}/pdf/${file.name}` };
}

async function transmitFiscalDocument(tenantCode, row, sessionUser) {
  const tenantState = readTenantState(tenantCode);
  const sourceSale = (tenantState.sales || []).find(sale => sale.id === row.saleId);
  if (row.model === "NFC-e" && sourceSale?.emissionMode === "receipt") throw new Error("Esta venda foi registrada com recibo nao fiscal.");
  const missing = validateFiscalDocumentFromState(tenantState, row);
  if (missing.length) throw new Error(`Documento fiscal incompleto: ${missing.join(", ")}`);
  const monitor = await acbrStatus(tenantState);
  if (!monitor.connected) throw new Error(`ACBr indisponivel: ${monitor.message || "sem conexao"}`);
  const fiscalRow = {
    ...row,
    id: Number(row.id || 0) || Math.max(0, ...(tenantState.fiscalQueue || []).map((item) => Number(item.id) || 0)) + 1,
    attempts: Number(row.attempts || 0) + 1,
    lastAttemptAt: new Date().toISOString()
  };
  fiscalRow.xml = fiscalXmlFromState(tenantState, fiscalRow, tenantCode);
  if(fiscalRow.model!=="NFS-e") require("./src/server/rtc-schema-support").assertRtcSchemaSupport(fiscalRow.xml, path.join(__dirname,"runtime/fiscal/Schemas"));
  fiscalRow.key = fiscalRow.xml.match(/Id="NFe(\d{44})"/)?.[1] || "";
  fiscalRow.protocol = "";
  fiscalRow.localReference = `${fiscalRow.model}-${fiscalRow.id}`;
  fiscalRow.status = "XML oficial gerado - aguardando ACBr";
  fiscalRow.fiscalProvider = monitor.engine;
  fiscalRow.acbrStatus = monitor.response;
  fiscalRow.processedAt = new Date().toISOString();
  const xmlFile = saveTenantFile({
    tenantCode,
    category: "xml",
    filename: `${fiscalRow.model}-${fiscalRow.id}.xml`,
    mimeType: "application/xml",
    content: Buffer.from(fiscalRow.xml, "utf8").toString("base64")
  });
  fiscalRow.xmlUrl = xmlFile.url;
  if (tenantState.settings.acbrApiUrl) {
    const secrets = loadFiscalSecrets(tenantCode);
    if (!secrets.acbrApiToken) throw new Error("Token do agente fiscal nao configurado.");
    const response = await fetch(`${String(tenantState.settings.acbrApiUrl).replace(/\/+$/, "")}/fiscal/transmit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secrets.acbrApiToken}` },
      body: JSON.stringify({ tenantCode, environment: tenantState.settings.fiscalEnvironment, fiscalConfig: fiscalAgentConfig(tenantCode, tenantState, secrets), document: fiscalRow }),
      signal: AbortSignal.timeout(65000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Agente fiscal respondeu HTTP ${response.status}.`);
    if (!result.protocol && result.status !== "Autorizada") throw new Error(result.error || "Agente fiscal nao retornou autorizacao/protocolo.");
    Object.assign(fiscalRow, result.document || result, { fiscalProvider: "Agente fiscal Windows + ACBr" });
  } else if (fiscalRow.model === "NFS-e") {
    const configPath = configureAcbrNfseForTenant(tenantCode, tenantState);
    await initializeAcbrLib(configPath, "nfse");
    if (tenantState.settings.nfseStandard === "Nacional") {
      const xmlPath = path.join(storageDir, normalizeTenantCode(tenantCode), "xml", xmlFile.filename);
      acbrResponseOrThrow(await acbrLibCommand("carregarxml", [xmlPath], 10000, "nfse"), "Carregar DPS");
    } else {
      const iniFile = saveTenantFile({ tenantCode, category: "xml", filename: `nfse-${fiscalRow.id}.ini`, mimeType: "text/plain", content: Buffer.from(generateNfseIni(tenantState, fiscalRow), "utf8").toString("base64") });
      const iniPath = path.join(storageDir, normalizeTenantCode(tenantCode), "xml", iniFile.filename);
      acbrResponseOrThrow(await acbrLibCommand("carregarini", [iniPath], 10000, "nfse"), "Carregar RPS NFS-e");
      fiscalRow.nfseIniUrl = iniFile.url;
    }
    const response = await acbrLibCommand("emitir", ["1", "1", "false"], 60000, "nfse");
    const parsed = acbrResponseOrThrow(response, "Emitir NFS-e");
    fiscalRow.acbrCode = Number(response.code);
    fiscalRow.acbrResponse = parsed.raw;
    fiscalRow.key = parsed.key || fiscalRow.key;
    fiscalRow.protocol = parsed.protocol;
    fiscalRow.statusCode = parsed.statusCode;
    fiscalRow.statusMessage = parsed.statusMessage;
    fiscalRow.retryable = parsed.retryable;
    fiscalRow.status = ["100", "201", "202"].includes(parsed.statusCode) || parsed.protocol ? "Autorizada" : `Rejeitada/pendente ACBrNFSe${parsed.statusCode ? ` ${parsed.statusCode}` : ""}`;
  } else {
    const configPath = configureAcbrForTenant(tenantCode, tenantState);
    await initializeAcbrLib(configPath);
    const xmlPath = path.join(storageDir, normalizeTenantCode(tenantCode), "xml", xmlFile.filename);
    acbrResponseOrThrow(await acbrLibCommand("carregarxml", [xmlPath]), "Carregar XML");
    acbrResponseOrThrow(await acbrLibCommand("assinar"), "Assinar XML");
    acbrResponseOrThrow(await acbrLibCommand("validar"), "Validar XML");
    const response = await acbrLibCommand("enviar", ["1", "false", "true", "false"], 60000);
    const parsed = parseAcbrResponse(response.response);
    fiscalRow.acbrCode = Number(response.code);
    fiscalRow.acbrResponse = parsed.raw;
    fiscalRow.key = parsed.key || fiscalRow.key;
    fiscalRow.protocol = parsed.protocol;
    fiscalRow.statusCode = parsed.statusCode;
    fiscalRow.statusMessage = parsed.statusMessage;
    fiscalRow.retryable = parsed.retryable;
    fiscalRow.status = ["100", "150"].includes(parsed.statusCode) && parsed.protocol
      ? "Autorizada"
      : `Rejeitada/pendente ACBr${parsed.statusCode ? ` ${parsed.statusCode}` : ""}`;
    if (Number(response.code) !== 0 && !parsed.statusCode) {
      const detail = await acbrLibCommand("ultimoretorno").catch(() => null);
      throw new Error(detail?.response || `ACBrLib retornou codigo ${response.code}`);
    }
  }
  if (fiscalRow.xml) {
    const processedXml = saveTenantFile({
      tenantCode,
      category: "xml",
      filename: `${fiscalRow.model}-${fiscalRow.id}-${fiscalRow.status === "Autorizada" ? "autorizado" : "processado"}.xml`,
      mimeType: "application/xml",
      content: Buffer.from(fiscalRow.xml, "utf8").toString("base64")
    });
    fiscalRow.processedXmlUrl = processedXml.url;
  }
  if (fiscalRow.status === "Autorizada") {
    fiscalRow.nextAttemptAt = "";
    fiscalRow.lastFiscalError = "";
  } else {
    fiscalRow.lastFiscalError = fiscalRow.statusMessage || fiscalRow.status;
    fiscalRow.nextAttemptAt = fiscalRow.retryable === false ? "" : new Date(Date.now() + Math.min(30, 2 ** Math.min(fiscalRow.attempts, 5)) * 60000).toISOString();
  }
  const index = (tenantState.fiscalQueue || []).findIndex((item) => Number(item.id) === Number(fiscalRow.id));
  if (index >= 0) tenantState.fiscalQueue[index] = { ...tenantState.fiscalQueue[index], ...fiscalRow };
  else tenantState.fiscalQueue.push(fiscalRow);
  tenantState.auditLogs = Array.isArray(tenantState.auditLogs) ? tenantState.auditLogs : [];
  tenantState.auditLogs.unshift({
    id: Math.max(0, ...tenantState.auditLogs.map((item) => Number(item.id) || 0)) + 1,
    date: new Date().toISOString(),
    user: sessionUser,
    action: "Fiscal encaminhado ao motor",
    detail: `${fiscalRow.model} ${fiscalRow.localReference}`
  });
  writeTenantState(tenantCode, tenantState);
  return fiscalRow;
}

function fiscalProviderStatus(tenantState) {
  const settings = tenantState.settings || {};
  const missing = [];
  const document = String(settings.document || "").replace(/\D/g, "");
  if (!document.match(/^\d{14}$/) || /^(\d)\1{13}$/.test(document)) missing.push("CNPJ real valido");
  if (!String(settings.uf || "").match(/^[A-Z]{2}$/)) missing.push("UF");
  if (!settings.city) missing.push("municipio do emitente");
  if (!settings.cityCode) missing.push("codigo IBGE do municipio do emitente");
  if (!settings.stateRegistration && (tenantState.fiscalRules || []).some((rule) => ["NF-e", "NFC-e"].includes(rule.model))) missing.push("inscricao estadual");
  if (!settings.municipalRegistration && (tenantState.fiscalRules || []).some((rule) => rule.model === "NFS-e")) missing.push("inscricao municipal");
  if (!settings.sefazCredentialed) missing.push("credenciamento SEFAZ");
  if (!settings.certificatePasswordConfigured) missing.push("senha protegida do certificado");
  if ((tenantState.fiscalRules || []).some((rule) => rule.model === "NFC-e") && (!settings.cscConfigured || !settings.cscId)) missing.push("CSC e ID CSC da NFC-e");
  if ((tenantState.fiscalRules || []).some((rule) => rule.model === "NFS-e") && (!settings.nfseStandard || !settings.nfseCityCode)) missing.push("padrao e municipio da NFS-e");
  if (!settings.fiscalEngine) missing.push("motor fiscal ACBr");
  if ((settings.fiscalEngine || "ACBrMonitor") === "ACBrMonitor" && !settings.acbrHost) missing.push("host ACBrMonitor");
  if ((settings.fiscalEngine || "ACBrMonitor") === "ACBrMonitor" && !settings.acbrPort) missing.push("porta ACBrMonitor");
  if (settings.acbrApiUrl && !settings.acbrApiTokenConfigured) missing.push("token protegido do agente fiscal");
  if (!settings.certificateName) missing.push("certificado A1");
  if (!settings.certificateExpiresAt) missing.push("validade do certificado");
  if (!settings.fiscalResponsible) missing.push("responsavel fiscal");
  return {
    ready: missing.length === 0,
    environment: settings.fiscalEnvironment || "Homologacao",
    provider: settings.fiscalEngine || "ACBrLib",
    providerType: "motor fiscal",
    certificateName: settings.certificateName || "",
    certificateExpiresAt: settings.certificateExpiresAt || "",
    missing
  };
}

async function databaseIsolationStatus(provider) {
  const tenants = (provider.clients || []).map((tenant) => {
    const tenantCode = normalizeTenantCode(tenant.tenantCode);
    return {
      tenantCode,
      unit: tenant.tradeName || tenant.name || tenantCode,
      storage: postgresStore ? "schema-postgresql" : "arquivo-json-local",
      schema: postgresStore ? tenantSchema(tenantCode) : "",
      file: postgresStore ? "" : tenantFile(tenantCode),
      exists: false
    };
  });
  let database = null;
  let postgresSchemas = [];
  if (postgresStore) {
    database = await postgresStore.health().catch((error) => ({ error: error.message }));
    postgresSchemas = await postgresStore.listTenantSchemas().catch(() => []);
    tenants.forEach((tenant) => {
      tenant.exists = postgresSchemas.includes(tenant.schema);
    });
  } else {
    tenants.forEach((tenant) => {
      tenant.exists = fs.existsSync(tenant.file);
    });
  }
  const expectedSchemas = new Set(tenants.map((tenant) => tenant.schema).filter(Boolean));
  return {
    mode: databaseMode,
    postgresActive: Boolean(postgresStore),
    isolation: postgresStore ? "schema-postgresql-por-franquia" : "arquivos-json-locais-por-unidade",
    ready: Boolean(postgresStore) && tenants.length > 0 && tenants.every((tenant) => tenant.exists),
    database,
    expectedTenants: tenants,
    orphanSchemas: postgresStore ? postgresSchemas.filter((schema) => !expectedSchemas.has(schema)) : [],
    warning: postgresStore
      ? ""
      : "Modo local JSON serve para desenvolvimento/contingencia. Para provedor pago e varias franquias, use DATABASE_URL com PostgreSQL."
  };
}

async function handleApi(req, res, urlPath) {
  const centralAccess = providerAccess(req);
  if (centralAccess && !urlPath.startsWith("/api/public/") && urlPath !== "/api/health" && !centralRouteAllowed(centralAccess, urlPath)) {
    return sendJson(res, 403, { ok: false, error: "Seu usuario da Central nao possui acesso a este setor." });
  }
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }
  const requestUrl = new URL(req.url, "http://localhost");

  if (req.method === "GET" && urlPath === "/api/health") {
    const database = postgresStore ? await postgresStore.health().catch((error) => ({ error: error.message })) : null;
    const deployment = buildDeploymentReadiness(process.env, { databaseMode });
    sendJson(res, 200, {
      ok: true,
      product: "Tortela Plus",
      mode: "rede-franquias",
      fiscalRelease: require("./src/server/rtc-policy").RTC_RELEASE.version,
      buildRevision: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || "local",
      databaseMode,
      dataDir,
      isolation: postgresStore ? "postgresql-schema-per-tenant" : "tenant-files",
      database,
      deployment
    });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/deployment/readiness") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa da rede obrigatoria." });
      return;
    }
    const deployment = buildDeploymentReadiness(process.env, { databaseMode });
    const databaseIsolation = await databaseIsolationStatus(readProvider());
    sendJson(res, deployment.ready && databaseIsolation.ready ? 200 : 428, { ...deployment, databaseIsolation });
    return;
  }

  const publicUnitMatch = urlPath.match(/^\/api\/public\/unit\/([^/]+)$/);
  if (req.method === "GET" && publicUnitMatch) {
    const tenant = findTenant(readProvider(), decodeURIComponent(publicUnitMatch[1]));
    if (!tenant || !["Ativo", "Homologacao"].includes(tenant.status)) {
      sendJson(res, 404, { ok: false, error: "Unidade nao encontrada ou indisponivel." });
      return;
    }
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, tradeName: tenant.tradeName });
    return;
  }

  const publicCustomerMatch = urlPath.match(/^\/api\/public\/unit\/([^/]+)\/customers$/);
  if (req.method === "POST" && (publicCustomerMatch || urlPath === "/api/public/customers")) {
    const body = await readBody(req);
    const document = String(body.document || "").replace(/\D/g, "");
    const phone = String(body.phone || "").replace(/\D/g, "");
    const cep = String(body.cep || "").replace(/\D/g, "");
    const birthDate = String(body.birthDate || "").trim();
    const whatsappGroupAuthorized = body.whatsappGroupAuthorized === true;
    const publicCatalog = publicCustomerMatch ? null : await onlineStoreCatalog({ cep });
    const requestedTenantCode = publicCustomerMatch ? decodeURIComponent(publicCustomerMatch[1]) : body.tenantCode || publicCatalog?.nearest?.tenantCode || "";
    const provider = readProvider();
    const tenant = findTenant(provider, requestedTenantCode);
    if (!tenant || !["Ativo", "Homologacao"].includes(tenant.status)) {
      sendJson(res, 404, { ok: false, error: "Unidade nao encontrada ou indisponivel." });
      return;
    }
    const name = String(body.name || "").trim();
    const uf = String(body.uf || "").trim().toUpperCase();
    if (!name || document.length !== 11 || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || phone.length < 10 || cep.length !== 8 || !body.address || !body.number || !body.district || !body.city || uf.length !== 2 || body.consent !== true) {
      sendJson(res, 400, { ok: false, error: "Preencha corretamente todos os campos obrigatorios e autorize o cadastro." });
      return;
    }
    const tenantState = readTenantState(tenant.tenantCode);
    const duplicate = (tenantState.people || []).find((person) => person.type === "Cliente" && String(person.document || "").replace(/\D/g, "") === document);
    if (duplicate) {
      sendJson(res, 409, { ok: false, error: "Este CPF ja possui cadastro nesta unidade." });
      return;
    }
    const customer = {
      id: Math.max(0, ...(tenantState.people || []).map((person) => Number(person.id) || 0)) + 1,
      type: "Cliente",
      name,
      alias: "",
      document,
      birthDate,
      email: "",
      phone: String(body.phone || "").trim(),
      whatsapp: String(body.phone || "").trim(),
      cep,
      address: String(body.address || "").trim(),
      number: String(body.number || "").trim(),
      complement: String(body.complement || "").trim(),
      district: String(body.district || "").trim(),
      city: String(body.city || "").trim(),
      uf,
      preferredTenantCode: tenant.tenantCode,
      preferredTenantName: tenant.tradeName,
      nearestStoreSelectedAt: new Date().toISOString(),
      whatsappGroupAuthorized,
      whatsappGroupConsent: {
        authorized: whatsappGroupAuthorized,
        answeredAt: new Date().toISOString(),
        version: "2026-07-16",
        purpose: "Inclusao do celular no grupo da Tortela no WhatsApp."
      },
      source: "Cadastro online Tortela",
      registeredAt: new Date().toISOString(),
      lgpdConsent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: "2026-07-13",
        legalBasis: "consentimento",
        purpose: "Cadastro de cliente, atendimento de pedidos, comunicacao operacional e ofertas da rede Tortela."
      },
      active: true
    };
    tenantState.people.push(customer);
    writeTenantState(tenant.tenantCode, tenantState);
    let whatsappGroup = null;
    if (whatsappGroupAuthorized) {
      whatsappGroup = await dispatchWhatsappGroupAutomation(provider, tenant, customer);
      writeProvider(provider);
    }
    appendTenantAudit(tenant.tenantCode, "Cliente cadastrado online", `${customer.name} - CPF ${document}`, "cadastro-publico");
    sendJson(res, 201, { ok: true, message: `Cadastro concluido. Sua loja Tortela mais proxima e ${tenant.tradeName}.`, customerId: customer.id, tenantCode: tenant.tenantCode, tenantName: tenant.tradeName, whatsappGroup });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/public/store/catalog") {
    const url = new URL(req.url, "http://localhost");
    sendJson(res, 200, await onlineStoreCatalog({
      cep: url.searchParams.get("cep") || "",
      q: url.searchParams.get("q") || "",
      tenantCode: url.searchParams.get("unidade") || ""
    }));
    return;
  }

  const onlineNoticeMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/online-order-notifications$/);
  if(req.method==='GET'&&onlineNoticeMatch){
    const code=normalizeTenantCode(onlineNoticeMatch[1]),access=tenantAccessOrProvider(req,readProvider(),code,'sales');if(access.error)return deny(res,access);
    const orders=(readTenantState(code).sales||[]).filter(row=>row.source==='Loja online'&&row.onlineOrder&&['Aberto','Conferido'].includes(row.status||'Aberto')).map(row=>({id:row.id,createdAt:row.createdAt,customer:row.customer,total:row.total,status:row.status}));
    sendJson(res,200,{ok:true,tenantCode:code,orders});return;
  }

  if (req.method === "POST" && urlPath === "/api/public/store/orders") {
    const body = await readBody(req);
    if(String(body.cep||'').replace(/\D/g,'').length!==8){sendJson(res,422,{ok:false,error:'Informe um CEP válido para verificar o raio de atendimento de 10 km.'});return;}
    const catalog = await onlineStoreCatalog({ cep: body.cep || "",customer:body.customer||{} });
    if(catalog.deliveryAvailable!==true){sendJson(res,409,{ok:false,error:catalog.deliveryMessage||deliveryArea.UNKNOWN_MESSAGE,reason:catalog.deliveryReason});return;}
    const tenantCode = normalizeTenantCode(catalog.nearest?.tenantCode || "");
    if(body.tenantCode&&normalizeTenantCode(body.tenantCode)!==tenantCode){sendJson(res,409,{ok:false,error:'A loja mais próxima deste endereço mudou. Consulte o CEP novamente e monte o pedido no cardápio da unidade indicada.',reason:'nearest_store_changed',tenantCode});return;}
    const tenant = findTenant(readProvider(), tenantCode);
    if (!tenant || tenant.status !== "Ativo") {sendJson(res,404,{ok:false,error:'Loja indisponível para pedido online.'});return;}
    const tenantState = readTenantState(tenant.tenantCode);
    const items = Array.isArray(body.items) ? body.items : [];
    const normalizedItems = [];
    const preparationParents=new Map();
    for (const item of items) {
      const product = (tenantState.products || []).find((row) => Number(row.id) === Number(item.productId) && row.active !== false);
      const qty = Number(item.qty || 0);
      if (!product || qty <= 0) continue;
      const price = effectiveProductPrice(product, qty);
      if(item.parentLineId&&!preparationParents.has(String(item.parentLineId))){sendJson(res,400,{ok:false,error:"Tortela do complemento nao encontrada. Monte o pedido novamente."});return;}
      const prepared=itemPreparation.attach(normalizedItems,{
        productId: product.id,
        id: product.id,
        description: product.description,
        qty,
        unit: product.unit || "UN",
        price,
        coverage: String(item.coverage || "").trim(),
        size: String(item.size || "").trim(),
        extras: Array.isArray(item.extras) ? item.extras.map(value=>String(value).trim()).filter(Boolean) : [],
        note: String(item.note || "").trim(),
        total: moneyRound(qty * price)
      },item.parentLineId?preparationParents.get(String(item.parentLineId)):undefined);
      if(item.lineId&&itemPreparation.isTortela(prepared))preparationParents.set(String(item.lineId),prepared.lineId);
    }
    try{itemPreparation.validateSale(normalizedItems);}catch(error){sendJson(res,400,{ok:false,error:error.message});return;}
    if (!normalizedItems.length) {
      sendJson(res, 400, { ok: false, error: "Inclua ao menos um produto vendido por esta loja." });
      return;
    }
    const customer = {
      name: String(body.customer?.name || "").trim(),
      phone: String(body.customer?.phone || "").trim(),
      address: String(body.customer?.address || "").trim(),
      number: String(body.customer?.number || "").trim(),
      district: String(body.customer?.district || "").trim(),
      city: String(body.customer?.city || "").trim(),
      uf: String(body.customer?.uf || "").trim().toUpperCase(),
      cep: String(body.cep || body.customer?.cep || "").replace(/\D/g, "")
    };
    if (!customer.name || !customer.phone || !customer.address || !customer.number || !customer.district || !customer.city || customer.uf.length !== 2 || customer.cep.length !== 8) {
      sendJson(res, 400, { ok: false, error: "Informe cliente, telefone e endereco completo para entrega/retirada." });
      return;
    }
    const payment = ["PIX", "Debito", "Credito"].includes(body.paymentMethod) ? body.paymentMethod : "PIX";
    const total = moneyRound(normalizedItems.reduce((sum, item) => sum + Number(item.total || 0), 0));
    const sale = {
      id: Math.max(0, ...(tenantState.sales || []).map((row) => Number(row.id) || 0)) + 1,
      date: today(),
      createdAt: new Date().toISOString(),
      customer: customer.name,
      seller: "Loja online",
      total,
      type: "Pedido online",
      source: "Loja online",
      channel: "Loja online",
      status: "Aberto",
      payment,
      paymentOnline: true,
      paymentStatus: "Pendente",
      paymentInfo: { method: payment, online: true, status: "Pendente" },
      due: today(),
      onlineOrder: true,
      delivery: body.deliveryMode === "Retirada" ? "Retirada" : "Entrega",
      deliveryStore: {
        tenantCode: tenant.tenantCode,
        tradeName: tenant.tradeName,
        distanceKm: catalog.deliveryDistanceKm,
        radiusKm: catalog.nearest?.deliveryRadiusKm || 10
      },
      customerData: customer,
      items: normalizedItems
    };
    const paymentInfo = await createOnlinePaymentCharge(tenant.tenantCode, tenantState, sale, payment);
    if (paymentInfo.status === "Erro no gateway") {
      sendJson(res, 503, { ok: false, error: paymentInfo.message || "Nao foi possivel gerar o pagamento online." });
      return;
    }
    sale.paymentInfo = paymentInfo;
    sale.paymentStatus = paymentInfo.status || "Pendente";
    tenantState.sales = Array.isArray(tenantState.sales) ? tenantState.sales : [];
    tenantState.receivables = Array.isArray(tenantState.receivables) ? tenantState.receivables : [];
    const shortage = applyOnlineOrderStock(tenantState, normalizedItems, sale.id);
    if (shortage.length) {
      sendJson(res, 409, { ok: false, error: `Estoque insuficiente na loja selecionada: ${shortage.join("; ")}` });
      return;
    }
    tenantState.sales.push(sale);
    tenantState.receivables.push(receivableForSale(tenantState.receivables, sale, customer.name, payment, `Pedido online ${sale.id} - ${payment}`));
    writeTenantState(tenant.tenantCode, tenantState);
    appendTenantAudit(tenant.tenantCode, "Pedido online recebido", `${customer.name} ${moneyRound(total)}`, "loja-online");
    sendJson(res, 201, { ok: true, orderId: sale.id, tenantCode: tenant.tenantCode, unit: tenant.tradeName, total, payment, paymentInfo });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/public/kiosk/orders") {
    const body = await readBody(req);
    const tenantCode = normalizeTenantCode(body.tenantCode || "");
    const tenant = findTenant(readProvider(), tenantCode);
    if (!tenant || tenant.status !== "Ativo") {
      sendJson(res, 404, { ok: false, error: "Loja indisponivel para o totem." });
      return;
    }
    const tenantState = readTenantState(tenant.tenantCode);
    const terminalToken = publicTerminalTokenFromBody(body);
    if (!publicTerminalAllowed(tenantState, terminalToken)) {
      sendJson(res, 403, { ok: false, error: publicTerminalError(terminalToken) });
      return;
    }
    const customerDocument = digitsOnly(body.customerDocument);
    if (!validCpf(customerDocument)) {
      sendJson(res, 400, { ok: false, error: "Informe um CPF valido do Clube Tortela para iniciar a venda no totem." });
      return;
    }
    const items = Array.isArray(body.items) ? body.items : [];
    const normalizedItems = [];
    for (const item of items) {
      const product = (tenantState.products || []).find((row) => Number(row.id) === Number(item.productId) && row.active !== false);
      const qty = Number(item.qty || 0);
      if (!product || qty <= 0 || Number(product.price || 0) <= 0) continue;
      const price = effectiveProductPrice(product, qty);
      itemPreparation.attach(normalizedItems,{
        productId: product.id,
        id: product.id,
        description: product.description,
        qty,
        unit: product.unit || "UN",
        price,
        coverage: String(item.coverage || "").trim(),
        size: String(item.size || "").trim(),
        extras: Array.isArray(item.extras) ? item.extras.map(value=>String(value).trim()).filter(Boolean) : [],
        note: String(item.note || "").trim(),
        total: moneyRound(qty * price)
      });
    }
    if (!normalizedItems.length) {
      sendJson(res, 400, { ok: false, error: "Inclua ao menos um produto valido no pedido do totem." });
      return;
    }
    const payment = ["PIX", "Debito", "Credito"].includes(body.paymentMethod) ? body.paymentMethod : "PIX";
    const total = moneyRound(normalizedItems.reduce((sum, item) => sum + Number(item.total || 0), 0));
    tenantState.sales = Array.isArray(tenantState.sales) ? tenantState.sales : [];
    tenantState.receivables = Array.isArray(tenantState.receivables) ? tenantState.receivables : [];
    const sale = {
      id: Math.max(0, ...tenantState.sales.map((row) => Number(row.id) || 0)) + 1,
      date: today(),
      createdAt: new Date().toISOString(),
      customer: "Consumidor Totem",
      customerDocument,
      seller: "Totem",
      total,
      type: "Totem",
      source: "Totem local",
      channel: "Totem local",
      status: "Preparando",
      payment,
      payments: [{ method: payment, value: total }],
      paymentOnline: true,
      paymentStatus: "Pendente",
      paymentInfo: { method: payment, online: true, status: "Pendente" },
      due: today(),
      onlineOrder: true,
      kioskOrder: true,
      kioskTicketNumber: nextKioskTicketNumber(tenantState),
      delivery: String(body.orderMode || "Retirada no balcao").trim() || "Retirada no balcao",
      deliveryStore: { tenantCode: tenant.tenantCode, tradeName: tenant.tradeName },
      customerData: { name: "Consumidor Totem", document: customerDocument },
      items: normalizedItems
    };
    const paymentInfo = await createOnlinePaymentCharge(tenant.tenantCode, tenantState, sale, payment);
    if (paymentInfo.status === "Erro no gateway") {
      sendJson(res, 503, { ok: false, error: paymentInfo.message || "Nao foi possivel gerar o pagamento online." });
      return;
    }
    sale.paymentInfo = paymentInfo;
    sale.paymentStatus = paymentInfo.status || "Pendente";
    const shortage = applyOnlineOrderStock(tenantState, normalizedItems, sale.id);
    if (shortage.length) {
      sendJson(res, 409, { ok: false, error: `Estoque insuficiente na loja selecionada: ${shortage.join("; ")}` });
      return;
    }
    tenantState.sales.push(sale);
    tenantState.receivables.push(receivableForSale(tenantState.receivables, sale, sale.customer, payment, `Totem ${sale.kioskTicketNumber} - ${payment}`));
    const fiscalRow = enqueueSaleNfce(tenantState, sale);
    writeTenantState(tenant.tenantCode, tenantState);
    appendTenantAudit(tenant.tenantCode, "Pedido do totem recebido", `Senha ${sale.kioskTicketNumber} - ${moneyRound(total)}`, "totem");
    sendJson(res, 201, { ok: true, orderId: sale.id, ticketNumber: sale.kioskTicketNumber, tenantCode: tenant.tenantCode, unit: tenant.tradeName, total, payment, paymentInfo, fiscalId: fiscalRow.id });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/public/kiosk/orders") {
    const url = new URL(req.url, "http://localhost");
    const tenantCode = normalizeTenantCode(url.searchParams.get("unidade") || "");
    const tenant = findTenant(readProvider(), tenantCode);
    if (!tenant || tenant.status !== "Ativo") {
      sendJson(res, 404, { ok: false, error: "Loja indisponivel para o telao." });
      return;
    }
    const tenantState = readTenantState(tenant.tenantCode);
    const terminalToken = publicTerminalTokenFromSearch(url.searchParams);
    if (!publicTerminalAllowed(tenantState, terminalToken)) {
      sendJson(res, 403, { ok: false, error: publicTerminalError(terminalToken) });
      return;
    }
    const toKioskOrder = (sale) => ({
        id: sale.id,
        ticketNumber: sale.kioskTicketNumber,
        status: sale.status || "Preparando",
        total: sale.total || 0,
        payment: sale.payment || "PIX",
        paymentStatus: sale.paymentStatus || "Pendente",
        createdAt: sale.createdAt || "",
        updatedAt: sale.updatedAt || sale.deliveredAt || sale.cancelledAt || "",
        readyAt: sale.readyAt || "",
        deliveredAt: sale.deliveredAt || "",
        cancelledAt: sale.cancelledAt || "",
        delivery: sale.delivery || "Retirada no balcao",
        items: (sale.items || []).map((item) => ({ description: item.description, qty: item.qty, coverage:item.coverage, size:item.size, extras:item.extras, note:item.note, parentLineId:item.parentLineId, preparationRole:item.preparationRole }))
      });
    const kioskSales = (tenantState.sales || []).filter((sale) => sale.kioskOrder);
    const activeOrders = kioskSales
      .filter((sale) => !["Entregue", "Cancelado", "Cancelada"].includes(sale.status))
      .sort((a, b) => String(a.createdAt || a.date).localeCompare(String(b.createdAt || b.date)))
      .slice(0, 40)
      .map(toKioskOrder);
    const history = kioskSales
      .filter((sale) => ["Entregue", "Cancelado", "Cancelada"].includes(sale.status))
      .sort((a, b) => String(b.updatedAt || b.deliveredAt || b.cancelledAt || b.createdAt || b.date).localeCompare(String(a.updatedAt || a.deliveredAt || a.cancelledAt || a.createdAt || a.date)))
      .slice(0, 20)
      .map(toKioskOrder);
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, unit: tenant.tradeName, orders: activeOrders, history });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/public/kiosk/orders/status") {
    const body = await readBody(req);
    const tenantCode = normalizeTenantCode(body.tenantCode || "");
    const tenant = findTenant(readProvider(), tenantCode);
    if (!tenant || tenant.status !== "Ativo") {
      sendJson(res, 404, { ok: false, error: "Loja indisponivel para atualizar pedido." });
      return;
    }
    const tenantState = readTenantState(tenant.tenantCode);
    const terminalToken = publicTerminalTokenFromBody(body);
    if (!publicTerminalAllowed(tenantState, terminalToken)) {
      sendJson(res, 403, { ok: false, error: publicTerminalError(terminalToken) });
      return;
    }
    const sale = (tenantState.sales || []).find((row) => Number(row.id) === Number(body.orderId) && row.kioskOrder);
    if (!sale) {
      sendJson(res, 404, { ok: false, error: "Pedido do totem nao encontrado nesta unidade." });
      return;
    }
    const status = String(body.status || "").trim();
    const allowedStatuses = ["Preparando", "Pronto", "Entregue", "Cancelado"];
    if (!allowedStatuses.includes(status)) {
      sendJson(res, 400, { ok: false, error: "Status invalido para pedido do totem." });
      return;
    }
    const previousStatus = sale.status;
    if (status === "Cancelado" && previousStatus !== "Cancelado") {
      restoreOnlineOrderStock(tenantState, sale.items || [], sale.id);
      (tenantState.receivables || []).forEach((row) => {
        if (Number(row.sourceSaleId) !== Number(sale.id) || row.paid) return;
        row.cancelled = true;
        row.paid = true;
        row.paidValue = Number(row.paidValue || 0);
        row.balance = 0;
      });
      (tenantState.fiscalQueue || []).forEach((row) => {
        if (Number(row.saleId) !== Number(sale.id) || row.status === "Autorizada" || String(row.status || "").startsWith("Cancelada")) return;
        row.status = "Cancelada antes da transmissao";
        row.cancelledAt = new Date().toISOString();
      });
    }
    sale.status = status;
    sale.updatedAt = new Date().toISOString();
    if (status === "Preparando") sale.preparingAt = sale.updatedAt;
    if (status === "Pronto") sale.readyAt = sale.updatedAt;
    if (status === "Entregue") sale.deliveredAt = sale.updatedAt;
    if (status === "Cancelado") sale.cancelledAt = sale.updatedAt;
    writeTenantState(tenant.tenantCode, tenantState);
    appendTenantAudit(tenant.tenantCode, `Pedido do totem ${status.toLowerCase()}`, `Senha ${sale.kioskTicketNumber || sale.id}`, "cozinha-totem");
    sendJson(res, 200, {
      ok: true,
      order: {
        id: sale.id,
        ticketNumber: sale.kioskTicketNumber,
        status: sale.status,
        updatedAt: sale.updatedAt
      }
    });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/network/summary") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa da rede obrigatoria." });
      return;
    }
    const provider = readProvider();
    const forwardedProtocol = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
    const origin = `${forwardedProtocol}://${req.headers.host}`;
    const now = new Date();
    const currentDay = today();
    const totals = {
      salesTotal: 0,
      salesCount: 0,
      fiscalAuthorized: 0,
      customers: 0,
      products: 0,
      lowStock: 0,
      payableOpen: 0,
      receivableOpen: 0,
      purchasesTotal: 0,
      automaticOrders: 0,
      activePromotions: 0,
      productionProducts: 0,
      franchiseOpen: 0,
      franchisePaid: 0
    };
    const periods = { hour: 0, day: 0, week: 0, fortnight: 0, month: 0 };
    const salesByProduct = new Map();
    const units = [];
    const promotions = [];
    const salesDetails = [];
    const lowStockItems = [];
    const automaticOrders = [];
    const approvalRequests = [];
    const manualStockDrops = [];
    const fiscalSettings = [];
    const whatsappGroupLeads = [];
    const finance = [];
    const royalties = [];
    const permissions = [];
    const productionCapacity = [];
    const customerConsumptionMap = new Map();
    const saleDate = (sale) => {
      const raw = sale.createdAt || sale.finishedAt || sale.date || currentDay;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? new Date(`${currentDay}T00:00:00`) : parsed;
    };
    const withinDays = (date, days) => (now.getTime() - date.getTime()) / 86400000 <= days;
    const activePromotion = (promotion) => (Number(promotion?.price || 0) > 0 || Number(promotion?.retailPercent || 0) > 0 || Number(promotion?.wholesalePercent || 0) > 0)
      && (!promotion?.from || currentDay >= promotion.from)
      && (!promotion?.to || currentDay <= promotion.to)
      && promotion?.status !== "Cancelada";
    const digitsOnly = (value) => String(value || "").replace(/\D/g, "");
    const normalizeCustomerKey = (value) => String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const maskDocument = (value) => {
      const document = digitsOnly(value);
      if (document.length === 11) return `${document.slice(0, 3)}.***.***-${document.slice(-2)}`;
      if (document.length === 14) return `${document.slice(0, 2)}.***.***/****-${document.slice(-2)}`;
      return "";
    };
    const registerCustomerSale = (tenant, tenantState, sale) => {
      const customerName = String(sale.customer || sale.customerData?.name || "").trim();
      if (!customerName || customerName === "Consumidor Final") return;
      const customers = tenantState.people || [];
      const profile = customers.find((person) =>
        person.type === "Cliente"
        && (digitsOnly(person.document) === digitsOnly(sale.customerData?.document)
          || normalizeCustomerKey(person.name) === normalizeCustomerKey(customerName))
      ) || {};
      const document = digitsOnly(profile.document || sale.customerData?.document || "");
      const phoneKey = digitsOnly(profile.whatsapp || profile.phone || sale.customerData?.phone || "");
      const key = document || phoneKey || normalizeCustomerKey(customerName);
      if (!key) return;
      const current = customerConsumptionMap.get(key) || {
        customer: profile.name || customerName,
        document: maskDocument(document),
        whatsapp: profile.whatsapp || profile.phone || sale.customerData?.phone || "",
        purchases: 0,
        total: 0,
        firstPurchase: "",
        lastPurchase: "",
        units: new Set(),
        products: new Map()
      };
      const moment = saleDate(sale);
      const purchaseDate = moment.toISOString();
      current.purchases += 1;
      current.total += Number(sale.total || 0);
      current.firstPurchase = !current.firstPurchase || purchaseDate < current.firstPurchase ? purchaseDate : current.firstPurchase;
      current.lastPurchase = !current.lastPurchase || purchaseDate > current.lastPurchase ? purchaseDate : current.lastPurchase;
      current.units.add(tenant.tradeName || tenant.tenantCode);
      (sale.items || []).forEach((item) => {
        const productName = item.description || item.product || `Produto ${item.productId || item.id || ""}`.trim();
        const product = current.products.get(productName) || { product: productName, qty: 0, total: 0 };
        product.qty += Number(item.qty || item.quantity || 0);
        product.total += Number(item.total || 0);
        current.products.set(productName, product);
      });
      customerConsumptionMap.set(key, current);
    };
    for (const tenant of provider.clients || []) {
      const tenantState = readTenantState(tenant.tenantCode);
      const sales = (tenantState.sales || []).filter((sale) => !["Cancelado", "Cancelada", "Devolvido"].includes(sale.status));
      const fiscalRows = tenantState.fiscalQueue || [];
      const customers = (tenantState.people || []).filter((person) => person.type === "Cliente" && person.name !== "Consumidor Final" && person.active !== false);
      customers
        .filter((person) => person.whatsappGroupAuthorized === true)
        .forEach((person) => whatsappGroupLeads.push({
          tenantCode: tenant.tenantCode,
          unit: tenant.tradeName,
          customer: person.name,
          phone: person.whatsapp || person.phone || "",
          birthDate: person.birthDate || "",
          city: person.city || "",
          registeredAt: person.registeredAt || "",
          authorizedAt: person.whatsappGroupConsent?.answeredAt || person.nearestStoreSelectedAt || person.registeredAt || ""
        }));
      const products = (tenantState.products || []).filter((product) => product.active !== false);
      const lowStock = products.filter(stockReplenishment.eligible);
      const salesTotal = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
      const averageTicket = sales.length ? moneyRound(salesTotal / sales.length) : 0;
      const fiscalAuthorized = fiscalRows.filter((row) => row.status === "Autorizada").length;
      const fiscalPending = fiscalRows.filter((row) => !["Autorizada", "Cancelada"].includes(row.status)).length;
      const payables = (tenantState.payables || []).filter((row) => !row.paid && !row.cancelled);
      const receivables = (tenantState.receivables || []).filter((row) => !row.paid && !row.cancelled);
      const payableOpen = payables.reduce((sum, row) => sum + financeBalance(row), 0);
      const receivableOpen = receivables.reduce((sum, row) => sum + financeBalance(row), 0);
      const purchasesTotal = (tenantState.purchases || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
      const orders = tenantState.automaticOrders || [];
      const tenantPromotions = (tenantState.networkPromotions || []).filter(activePromotion);
      const franchisePayments = tenantState.franchisePayments || [];
      const franchiseOpen = franchisePayments.filter((row) => !row.paid && !row.cancelled).reduce((sum, row) => sum + Number(row.value || 0), 0);
      const franchisePaid = franchisePayments.filter((row) => row.paid).reduce((sum, row) => sum + Number(row.value || 0), 0);
      const royalty = royaltyBreakdown(tenant, tenantState, provider);
      totals.salesTotal += salesTotal;
      totals.salesCount += sales.length;
      totals.fiscalAuthorized += fiscalAuthorized;
      totals.customers += customers.length;
      totals.products += products.length;
      totals.lowStock += lowStock.length;
      totals.payableOpen += payableOpen;
      totals.receivableOpen += receivableOpen;
      totals.purchasesTotal += purchasesTotal;
      totals.automaticOrders += orders.length;
      totals.activePromotions += tenantPromotions.length;
      totals.franchiseOpen += franchiseOpen;
      totals.franchisePaid += franchisePaid;
      totals.royaltiesDue = Number(totals.royaltiesDue || 0) + royalty.total;
      totals.productionProducts += products.filter((product) => Array.isArray(product.composition) && product.composition.length).length;
      units.push({
        tenantCode: tenant.tenantCode,
        tradeName: tenant.tradeName,
        status: tenant.status,
        maxTerminals: tenant.maxTerminals,
        activeTerminals: (tenant.activeSessions || []).length,
        salesTotal,
        salesCount: sales.length,
        averageTicket,
        fiscalAuthorized,
        fiscalPending,
        customers: customers.length,
        products: products.length,
        lowStock: lowStock.length,
        payableOpen,
        receivableOpen,
        purchasesTotal,
        automaticOrders: orders.length,
        activePromotions: tenantPromotions.length,
        franchiseOpen,
        franchisePaid,
        registrationUrl: `${origin}/cadastro-cliente.html?unidade=${encodeURIComponent(tenant.tenantCode)}`
      });
      sales.forEach((sale) => {
        const moment = saleDate(sale);
        registerCustomerSale(tenant, tenantState, sale);
        if (withinDays(moment, 1 / 24)) periods.hour += Number(sale.total || 0);
        if ((sale.date || "").slice(0, 10) === currentDay) periods.day += Number(sale.total || 0);
        if (withinDays(moment, 7)) periods.week += Number(sale.total || 0);
        if (withinDays(moment, 15)) periods.fortnight += Number(sale.total || 0);
        if (withinDays(moment, 31)) periods.month += Number(sale.total || 0);
        salesDetails.push({
          unit: tenant.tradeName,
          tenantCode: tenant.tenantCode,
          id: sale.id,
          date: sale.date || sale.createdAt || "",
          customer: sale.customer || "Consumidor Final",
          customerDocument: sale.customerDocument || sale.customerData?.document || "",
          customerPhone: sale.customerData?.phone || "",
          customerCity: sale.customerCity || sale.customerData?.city || "",
          customerUf: sale.customerUf || sale.customerData?.uf || "",
          seller: sale.seller || sale.operator || sale.user || "",
          source: sale.source || sale.channel || sale.operation || sale.type || "",
          channel: sale.channel || sale.source || sale.operation || sale.type || "",
          payment: sale.payment || sale.paymentMethod || (sale.payments || []).map((row) => row.method).filter(Boolean).join(", "),
          paymentStatus: sale.paymentStatus || sale.paymentInfo?.status || "",
          type: sale.type || "",
          total: Number(sale.total || 0),
          status: sale.status || "Finalizada",
          items: (sale.items || []).length
        });
        (sale.items || []).forEach((item) => {
          const key = `${tenant.tenantCode}|${item.productId || item.description || item.product}`;
          const current = salesByProduct.get(key) || { product: item.description || item.product || `Produto ${item.productId}`, unit: tenant.tradeName, value: 0, totalValue: 0 };
          current.value += Number(item.qty || 0);
          current.totalValue += Number(item.total || 0);
          salesByProduct.set(key, current);
        });
      });
      lowStock.forEach((product) => lowStockItems.push({
        unit: tenant.tradeName,
        tenantCode: tenant.tenantCode,
        product: product.description,
        stock: Number(product.stock || 0),
        minStock: Number(product.minStock || 0),
        suggested: Math.max(Number(product.minStock || 0) - Number(product.stock || 0), 1),
        productUnit: product.unit
      }));
      orders.forEach((order) => automaticOrders.push({ ...order, unit: tenant.tradeName, tenantCode: tenant.tenantCode }));
      (tenantState.approvalRequests || []).forEach((request) => approvalRequests.push({ ...request, unit: tenant.tradeName, tenantCode: tenant.tenantCode }));
      (tenantState.stockMovements || [])
        .filter((movement) => movement.manualDrop || String(movement.type || "").toLowerCase().includes("baixa manual"))
        .forEach((movement) => manualStockDrops.push({
          ...movement,
          unit: tenant.tradeName,
          tenantCode: tenant.tenantCode,
          user: movement.requestedBy || movement.user || movement.operator || ""
        }));
      fiscalSettings.push({
        unit: tenant.tradeName,
        tenantCode: tenant.tenantCode,
        pdvPrintMode: tenantState.settings?.pdvPrintMode || "Ambos",
        lojistaDanfeEnabled: tenantState.settings?.lojistaDanfeEnabled !== false,
        fiscalEnvironment: tenantState.settings?.fiscalEnvironment || "Homologacao",
        nfeSerie: tenantState.settings?.nfeSerie || tenantState.settings?.serieNfe || "1",
        fiscalQueueTotal: (tenantState.fiscalQueue || []).length,
        fiscalPending: (tenantState.fiscalQueue || []).filter((row) => !["Autorizada", "Cancelada"].includes(row.status)).length
      });
      tenantPromotions.forEach((promotion) => promotions.push({ product: promotion.product || "Campanha geral", unit: tenant.tradeName, value: Number(promotion.price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), from: promotion.from, to: promotion.to, scope: promotion.scope || "Unidade" }));
      products.filter((product) => activePromotion(product.promotion)).forEach((product) => promotions.push({ product: product.description, unit: tenant.tradeName, value: Number(effectiveProductPrice(product, 1)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), from: product.promotion.from, to: product.promotion.to, scope: "Produto" }));
      finance.push({ unit: tenant.tradeName, tenantCode: tenant.tenantCode, payableOpen, receivableOpen, purchasesTotal, franchiseOpen, franchisePaid });
      royalties.push({
        ...royalty,
        open: franchiseOpen,
        paid: franchisePaid,
        status: franchiseOpen > 0 ? "Em aberto" : "A gerar"
      });
      permissions.push({
        unit: tenant.tradeName,
        tenantCode: tenant.tenantCode,
        status: tenant.status,
        blocked: tenant.status !== "Ativo" && tenant.status !== "Homologacao",
        renewalDays: tenant.renewalDays,
        licenseExpiresAt: tenant.licenseExpiresAt,
        licenseRemainingDays: Math.floor((new Date(tenant.licenseExpiresAt || today()).getTime() - new Date(currentDay).getTime()) / 86400000),
        licenseChallenge: licenseChallenge(tenant, tenant.adminUser || "Operador"),
        modules: tenant.modules || [],
        maxTerminals: tenant.maxTerminals,
        terminalsLimit: tenant.maxTerminals,
        activeTerminals: (tenant.activeSessions || []).length,
        activeSessions: (tenant.activeSessions || []).length
      });
      products.filter((product) => Array.isArray(product.composition) && product.composition.length).forEach((product) => {
        const components = product.composition.map((component) => {
          const rawMaterial = products.find((row) => Number(row.id) === Number(component.productId));
          const required = componentStockQty(component, rawMaterial);
          const available = Number(rawMaterial?.stock || 0);
          return {
            product: rawMaterial?.description || component.description || `Produto ${component.productId}`,
            required,
            available,
            capacity: required > 0 ? Math.floor(available / required) : 0,
            unit: rawMaterial?.unit || component.unit || ""
          };
        });
        productionCapacity.push({
          unit: tenant.tradeName,
          tenantCode: tenant.tenantCode,
          product: product.description,
          capacity: components.length ? Math.min(...components.map((component) => component.capacity)) : 0,
          components
        });
      });
    }
    const ranking = [...salesByProduct.values()].sort((a, b) => b.value - a.value);
    const customerConsumption = [...customerConsumptionMap.values()].map((row) => {
      const lastPurchaseDate = row.lastPurchase ? new Date(row.lastPurchase) : null;
      const daysSinceLastPurchase = lastPurchaseDate && !Number.isNaN(lastPurchaseDate.getTime())
        ? Math.floor((now.getTime() - lastPurchaseDate.getTime()) / 86400000)
        : null;
      const favoriteProducts = [...row.products.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
      return {
        customer: row.customer,
        document: row.document,
        whatsapp: row.whatsapp,
        purchases: row.purchases,
        total: moneyRound(row.total),
        firstPurchase: row.firstPurchase,
        lastPurchase: row.lastPurchase,
        daysSinceLastPurchase,
        units: [...row.units],
        favoriteProducts
      };
    }).sort((a, b) => b.total - a.total);
    const inactiveCustomers = customerConsumption
      .filter((row) => Number(row.daysSinceLastPurchase) >= 30)
      .sort((a, b) => Number(b.daysSinceLastPurchase || 0) - Number(a.daysSinceLastPurchase || 0));
    const deployment = buildDeploymentReadiness(process.env, { databaseMode });
    const databaseIsolation = await databaseIsolationStatus(provider);
    sendJson(res, 200, scopedSummary({
      ok: true,
      generatedAt: new Date().toISOString(),
      deployment,
      databaseIsolation,
      totals,
      periods,
      units,
      bestSellers: ranking.slice(0, 10),
      worstSellers: [...ranking].sort((a, b) => a.value - b.value).slice(0, 10),
      salesDetails: salesDetails.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 80),
      lowStockItems: lowStockItems.slice(0, 80),
      automaticOrders: automaticOrders.sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date))).slice(0, 80),
      approvalRequests: approvalRequests.sort((a, b) => String(b.requestedAt || "").localeCompare(String(a.requestedAt || ""))).slice(0, 200),
      promotions: promotions.slice(0, 80),
      whatsapp: {
        accountName: provider.whatsappSettings?.accountName || "",
        phone: provider.whatsappSettings?.phone || "",
        groupInviteUrl: provider.whatsappSettings?.groupInviteUrl || "",
        apiUrl: provider.whatsappSettings?.apiUrl || "",
        groupId: provider.whatsappSettings?.groupId || "",
        integrationMode: provider.whatsappSettings?.integrationMode || "generic",
        apiTokenConfigured: Boolean(provider.whatsappSettings?.apiTokenConfigured)
      },
      whatsappGroupLeads: whatsappGroupLeads.sort((a, b) => String(b.authorizedAt).localeCompare(String(a.authorizedAt))).slice(0, 200),
      whatsappGroupQueue: (provider.whatsappGroupQueue || []).slice(0, 200).map(({ id, tenantCode, unit, customer, phone, birthDate, status, detail, createdAt, updatedAt }) => ({ id, tenantCode, unit, customer, phone, birthDate, status, detail, createdAt, updatedAt })),
      finance,
      royalties,
      permissions,
      manualStockDrops: manualStockDrops.sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || ""))).slice(0, 120),
      fiscalSettings,
      productionCapacity: productionCapacity.slice(0, 80),
      customerConsumption: customerConsumption.slice(0, 120),
      inactiveCustomers: inactiveCustomers.slice(0, 120)
    }, access));
    return;
  }

  if (req.method === "POST" && urlPath === "/api/network/promotions") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa da rede obrigatoria." });
      return;
    }
    const body = await readBody(req);
    const provider = readProvider();
    const selected = Array.isArray(body.tenantCodes) ? body.tenantCodes.map(normalizeTenantCode) : [];
    const targets = (provider.clients || []).filter((tenant) => body.scope === "all" || selected.includes(normalizeTenantCode(tenant.tenantCode)));
    if (!targets.length) {
      sendJson(res, 400, { ok: false, error: "Selecione ao menos uma unidade." });
      return;
    }
    const campaignId = `PROMO-${Date.now()}`;
    const productText = String(body.product || "").trim();
    const price = Number(body.price || 0);
    const campaign = {
      id: campaignId,
      product: productText || "Campanha geral",
      price,
      from: body.from || today(),
      to: body.to || "",
      note: String(body.note || "").trim(),
      createdAt: new Date().toISOString(),
      createdBy: access.username,
      scope: body.scope === "all" ? "Toda a rede" : "Unidades selecionadas",
      status: "Ativa"
    };
    for (const target of targets) {
      const tenantState = readTenantState(target.tenantCode);
      tenantState.networkPromotions = Array.isArray(tenantState.networkPromotions) ? tenantState.networkPromotions : [];
      tenantState.networkPromotions.unshift({ ...campaign, tenantCode: target.tenantCode, unit: target.tradeName });
      if (productText && price > 0) {
        const needle = productText.toLowerCase();
        (tenantState.products || []).filter((product) => String(product.description || "").toLowerCase().includes(needle)).forEach((product) => {
          product.promotion = { price, from: campaign.from, to: campaign.to, networkCampaignId: campaignId };
        });
      }
      writeTenantState(target.tenantCode, tenantState);
      appendTenantAudit(target.tenantCode, "Promocao recebida da Central Tortela", productText || "Campanha geral", access.username);
    }
    appendProviderAudit("Promocao disparada pela Central Tortela", `${targets.length} unidades`, access.username, requestIp(req));
    sendJson(res, 200, { ok: true, campaignId, appliedUnits: targets.length });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/network/approvals/decide") {
    const access = providerAccess(req);
    if (!access) return sendJson(res, 401, { ok: false, error: "Sessao administrativa da rede obrigatoria." });
    const body = await readBody(req);
    const tenantCode = normalizeTenantCode(body.tenantCode || "");
    const requestId = Number(body.requestId || 0);
    const decision = body.decision === "approved" ? "Aprovado" : "Rejeitado";
    const provider = readProvider();
    const tenant = findTenant(provider, tenantCode);
    if (!tenant) return sendJson(res, 404, { ok: false, error: "Unidade nao encontrada." });
    const tenantState = readTenantState(tenantCode);
    const request = (tenantState.approvalRequests || []).find((row) => Number(row.id) === requestId);
    if (!request) return sendJson(res, 404, { ok: false, error: "Solicitacao nao encontrada." });
    if (request.status !== "Pendente") return sendJson(res, 409, { ok: false, error: "Solicitacao ja decidida." });
    request.status = decision;
    request.decidedBy = access.username;
    request.decidedAt = new Date().toISOString();
    request.decisionNote = String(body.note || "").trim();
    if (decision === "Aprovado") {
      if (request.type === "price_change") {
        const product = (tenantState.products || []).find((row) => Number(row.id) === Number(request.payload?.productId));
        if (product) product.price = Number(request.payload.newPrice || product.price || 0);
      }
      if (request.type === "stock_adjustment") {
        const product = (tenantState.products || []).find((row) => Number(row.id) === Number(request.payload?.productId));
        const direction = Number(request.payload?.direction || 0);
        if (product && direction) {
          product.stock = Number(product.stock || 0) + direction;
          tenantState.stockMovements = Array.isArray(tenantState.stockMovements) ? tenantState.stockMovements : [];
          tenantState.stockMovements.push({
            id: Math.max(0, ...tenantState.stockMovements.map((row) => Number(row.id) || 0)) + 1,
            date: today(),
            productId: product.id,
            product: product.description,
            type: request.payload.type || "Ajuste autorizado",
            qty: direction,
            balance: product.stock,
            history: `${request.payload.history || ""} - autorizado pela Central`,
            location: request.payload.details?.location || "",
            lot: request.payload.details?.lot || "",
            manualDrop: Boolean(request.payload.details?.manualDrop),
            reason: request.payload.details?.reason || "",
            requestedBy: request.requestedBy || ""
          });
        }
      }
      if (request.type === "stock_inventory") {
        const product = (tenantState.products || []).find((row) => Number(row.id) === Number(request.payload?.productId));
        if (product) product.stock = Number(request.payload.counted || 0);
      }
    }
    writeTenantState(tenantCode, tenantState);
    appendTenantAudit(tenantCode, `Solicitacao ${decision.toLowerCase()} pela Central`, `${request.title} ${request.detail}`, access.username);
    sendJson(res, 200, { ok: true, status: decision });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/network/whatsapp/settings") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa da rede obrigatoria." });
      return;
    }
    const body = await readBody(req);
    const provider = readProvider();
    provider.whatsappSettings = {
      ...(provider.whatsappSettings || {}),
      accountName: String(body.accountName || "").trim(),
      phone: String(body.phone || "").trim(),
      groupInviteUrl: String(body.groupInviteUrl || "").trim(),
      groupId: String(body.groupId || "").trim(),
      integrationMode: ["generic", "wapi"].includes(String(body.integrationMode || "").toLowerCase()) ? String(body.integrationMode).toLowerCase() : "generic",
      apiUrl: String(body.apiUrl || "").trim(),
      apiTokenConfigured: Boolean(body.apiToken) || Boolean(provider.whatsappSettings?.apiTokenConfigured),
      ...(body.apiToken ? { apiTokenVault: encryptVaultPayload({ apiToken: String(body.apiToken) }) } : {})
    };
    writeProvider(provider);
    appendProviderAudit("WhatsApp da Central atualizado", provider.whatsappSettings.phone || provider.whatsappSettings.accountName || "sem numero", access.username, requestIp(req));
    sendJson(res, 200, { ok: true, whatsapp: { ...provider.whatsappSettings, apiTokenHash: undefined } });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/network/royalties/generate") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa da rede obrigatoria." });
      return;
    }
    const body = await readBody(req);
    const provider = readProvider();
    const month = String(body.month || today().slice(0, 7)).slice(0, 7);
    let created = 0;
    let total = 0;
    for (const tenant of provider.clients || []) {
      if (tenant.status !== "Ativo") continue;
      const tenantState = readTenantState(tenant.tenantCode);
      const royalty = royaltyBreakdown(tenant, tenantState, provider, month);
      tenantState.franchisePayments = Array.isArray(tenantState.franchisePayments) ? tenantState.franchisePayments : [];
      const components = [
        ["Propaganda", royalty.advertising],
        ["Royalties sobre faturamento", royalty.salesRoyalty],
        ["Tecnologia e sistema", royalty.technology],
        ["Fundo de marketing", royalty.marketingFund],
        ["Campanha da rede", royalty.campaignFee],
        ["Complemento minimo mensal", royalty.minimumComplement]
      ].filter(([, value]) => Number(value || 0) > 0);
      for (const [type, value] of components) {
        const duplicate = tenantState.franchisePayments.some((row) => row.month === month && row.type === type && !row.cancelled);
        if (duplicate) continue;
        tenantState.franchisePayments.push({
          id: Math.max(0, ...tenantState.franchisePayments.map((row) => Number(row.id) || 0)) + 1,
          month,
          type,
          description: `${type} ${month}`,
          value: moneyRound(value),
          due: `${month}-10`,
          paid: false,
          cancelled: false,
          salesBase: royalty.salesBase,
          createdAt: new Date().toISOString(),
          createdBy: access.username
        });
        created += 1;
        total += Number(value || 0);
      }
      writeTenantState(tenant.tenantCode, tenantState);
      appendTenantAudit(tenant.tenantCode, "Royalties gerados pela Central Tortela", `${month} ${moneyRound(royalty.total)}`, access.username);
    }
    appendProviderAudit("Royalties gerados", `${month}: ${created} cobrancas`, access.username, requestIp(req));
    sendJson(res, 200, { ok: true, month, created, total: moneyRound(total) });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/provider/monitoring") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const provider = readProvider();
    const clients = provider.clients.map((tenant) => {
      const tenantState = readTenantState(tenant.tenantCode);
      const backupsPath = path.join(backupsDir, normalizeTenantCode(tenant.tenantCode));
      const backups = fs.existsSync(backupsPath) ? fs.readdirSync(backupsPath).filter((name) => name.endsWith(".json")).sort().reverse() : [];
      const fiscalRows = tenantState.fiscalQueue || [];
      const readiness = deploymentReadiness(tenant, tenantState);
      return {
        tenantCode: tenant.tenantCode,
        tradeName: tenant.tradeName,
        sessions: (tenant.activeSessions || []).length,
        lastBackup: backups[0] || "",
        pendingFiscal: fiscalRows.filter((row) => row.status !== "Autorizada" && !String(row.status).startsWith("Cancelada")).length,
        fiscalErrors: fiscalRows.filter((row) => row.lastFiscalError || String(row.status).includes("Rejeitada")).length,
        overdueTitles: [...(tenantState.payables || []), ...(tenantState.receivables || [])].filter((row) => !row.paid && !row.cancelled && row.due && row.due < today()).length,
        lowStock: (tenantState.products || []).filter((row) => Number(row.stock || 0) <= Number(row.minStock || 0)).length,
        readiness: `${readiness.ready}/${readiness.total}`,
        certificateExpiresAt: tenantState.settings?.certificateExpiresAt || "",
        closedThrough: tenantState.settings?.closedThrough || "",
        revision: tenantState._meta?.revision || 0,
        updatedAt: tenantState._meta?.updatedAt || ""
      };
    });
    sendJson(res, 200, {
      ok: true,
      generatedAt: new Date().toISOString(),
      databaseMode,
      activeProviderSessions: providerSessions.size,
      activeTenantSessions: clients.reduce((sum, client) => sum + client.sessions, 0),
      clients
    });
    return;
  }

  if (urlPath === "/api/network/customer-campaigns" && req.method === "GET") {
    const access=providerAccess(req);if(!access)return sendJson(res,401,{ok:false,error:"Sessão da Central obrigatória"});
    if(!permissionsFor(access).includes("customers"))return sendJson(res,403,{ok:false,error:"Acesso a clientes não permitido"});
    const insights=require("./src/customer-insights"),days=[30,60,90].includes(Number(requestUrl.searchParams.get("days")))?Number(requestUrl.searchParams.get("days")):30;
    const units=readProvider().clients.map(t=>({code:t.tenantCode,name:t.tradeName||t.tenantCode})),rows=[];
    for(const unit of units){const tenantState=readTenantState(unit.code),people=(tenantState.people||[]).filter(p=>p.type==="Cliente"),metrics=insights.build(people,tenantState.sales||[],days,businessDay());
      for(const person of people)rows.push({id:String(person.id),unitCode:unit.code,unit:unit.name,name:person.name,document:person.document||"",city:person.city||"",district:person.district||"",uf:person.uf||"",active:person.active!==false,phone:insights.phone(person),metrics:metrics.get(String(person.id))});
    }
    const consumed=new Map();for(const row of rows){if(row.metrics.lifetimeCount>0){const key=String(row.document).replace(/[^a-z0-9]/gi,"").toUpperCase()||row.unitCode+":"+row.id;if(!consumed.has(key))consumed.set(key,new Set());consumed.get(key).add(row.unit);}}
    return sendJson(res,200,{ok:true,days,units,rows:rows.map(row=>({...row,consumesAt:[...(consumed.get(String(row.document).replace(/[^a-z0-9]/gi,"").toUpperCase()||row.unitCode+":"+row.id)||[])]}))});
  }

  if (urlPath === "/api/network/franchisees" && req.method === "GET") {
    const access = providerAccess(req);
    if (!access) return sendJson(res, 401, {ok:false,error:"Sessao administrativa obrigatoria"});
    const clients = readProvider().clients.map(({tenantCode,tradeName,document,plan,maxTerminals,renewalDays,status,modules,adminUser,licenseExpiresAt}) => ({tenantCode,tradeName,document,plan,maxTerminals,renewalDays,status,modules,adminUser,licenseExpiresAt}));
    return sendJson(res, 200, {ok:true,clients});
  }

  const centralAdminMatch = urlPath.match(/^\/api\/provider\/admins(?:\/(\d+))?$/);
  if (centralAdminMatch && ["GET","POST"].includes(req.method)) {
    const access = providerAccess(req);
    if (!access) return sendJson(res,401,{ok:false,error:"Sessao administrativa obrigatoria"});
    const provider = readProvider();
    const safe = user => ({id:user.id,name:user.name,username:user.username,active:user.active,permissions:permissionsFor(user)});
    if (req.method === "GET") return sendJson(res,200,{ok:true,users:provider.providerAdmins.map(safe),permissions:centralPermissions,assignablePermissions:permissionsFor(access)});
    const body = await readBody(req);
    const id = Number(centralAdminMatch[1] || 0);
    let user = id ? provider.providerAdmins.find(row=>Number(row.id)===id) : null;
    if (id && !user) return sendJson(res,404,{ok:false,error:"Usuario da Central nao encontrado"});
    const rights = permissionsFor({permissions:body.permissions === undefined ? (user?.permissions || []) : body.permissions});
    if (rights.some(permission=>!permissionsFor(access).includes(permission))) return sendJson(res,403,{ok:false,error:"Nao e permitido conceder poderes que voce nao possui"});
    if (!id) {
      const username=String(body.username||"").trim();
      if (!username || !validNewPassword(body.password)) return sendJson(res,400,{ok:false,error:"Informe login e senha inicial de pelo menos 8 caracteres"});
      if (provider.providerAdmins.some(row=>row.username.toLowerCase()===username.toLowerCase())) return sendJson(res,409,{ok:false,error:"Login ja cadastrado"});
      user={id:Math.max(0,...provider.providerAdmins.map(row=>Number(row.id)))+1,username,passwordHash:hashPassword(body.password),active:true};
      provider.providerAdmins.push(user);
    }
    user.name=String(body.name||user.name||user.username).trim();
    user.permissions=rights;
    user.permissionsVersion=2;
    if(body.active!==undefined)user.active=Boolean(body.active);
    if (!provider.providerAdmins.some(row=>row.active && fullAccess(row))) return sendJson(res,400,{ok:false,error:"Mantenha pelo menos um administrador ativo com acesso total"});
    writeProvider(provider);
    appendProviderAudit(id?"Poderes de usuario da Central alterados":"Usuario da Central criado",user.username,access.username,requestIp(req));
    return sendJson(res,id?200:201,{ok:true,user:safe(user)});
  }

  if (urlPath === "/api/provider/auth/password" && req.method === "POST") {
    const access=providerAccess(req);
    if(!access)return sendJson(res,401,{ok:false,error:"Sessao administrativa obrigatoria"});
    const body=await readBody(req),provider=readProvider();
    const user=provider.providerAdmins.find(row=>row.username===access.username);
    if(!user || !verifyPassword(body.currentPassword,user.passwordHash))return sendJson(res,403,{ok:false,error:"Senha atual invalida"});
    if(String(body.newPassword||"").length<6)return sendJson(res,400,{ok:false,error:"A nova senha deve possuir pelo menos 6 caracteres"});
    user.passwordHash=hashPassword(body.newPassword);user.credentialUpdatedAt=new Date().toISOString();
    writeProvider(provider);
    for(const [key,session] of providerSessions)if(session.username===user.username && key!==bearerToken(req))providerSessions.delete(key);
    appendProviderAudit("Senha da Central alterada",user.username,access.username,requestIp(req));
    return sendJson(res,200,{ok:true});
  }

  if (req.method === "POST" && urlPath === "/api/provider/auth/login") {
    const body = await readBody(req);
    const ipAddress = requestIp(req);
    const key = loginAttemptKey("provider", body.username, ipAddress);
    if (loginBlocked(key)) {
      sendJson(res, 429, { ok: false, error: "Muitas tentativas. Aguarde 15 minutos." });
      return;
    }
    const provider = readProvider();
    const admin = (provider.providerAdmins || []).find((item) => String(item.username).toLowerCase() === String(body.username || "").trim().toLowerCase());
    if (!admin || !admin.active || !verifyPassword(body.password, admin.passwordHash)) {
      recordLoginFailure(key);
      appendProviderAudit("Falha de login", `Usuario ${body.username || ""}`, body.username || "desconhecido", ipAddress);
      sendJson(res, 403, { ok: false, error: "Usuario ou senha invalidos" });
      return;
    }
    loginAttempts.delete(key);
    const sessionId = `C-${crypto.randomBytes(32).toString("base64url")}`;
    providerSessions.set(sessionId, { id: admin.id, permissions: permissionsFor(admin), username: admin.username, name: admin.name, role: "Administrador", ipAddress, createdAt: Date.now(), lastSeenAt: Date.now() });
    appendProviderAudit("Login na Central Tortela", "Sessao administrativa iniciada", admin.username, ipAddress);
    sendJson(res, 200, { ok: true, sessionId, user: { id: admin.id, permissions: permissionsFor(admin), name: admin.name, username: admin.username, role: "Administrador" } });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/provider/auth/logout") {
    const access = providerAccess(req);
    if (access) appendProviderAudit("Logout da Central Tortela", "Sessao administrativa encerrada", access.username, requestIp(req));
    providerSessions.delete(bearerToken(req));
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/provider/auth/me") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa invalida" });
      return;
    }
    sendJson(res, 200, { ok: true, user: access });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/provider/backup-all") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa invalida" });
      return;
    }
    const backup = await completeProviderBackup();
    appendProviderAudit("Backup geral realizado", `${backup.totalClients} clientes incluidos`, access.username, requestIp(req));
    sendJson(res, 200, backup);
    return;
  }

  if (req.method === "POST" && urlPath === "/api/provider/restore-all") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa invalida" });
      return;
    }
    const body = await readBody(req);
    if (body.product && body.product !== "Tortela Plus") {
      sendJson(res, 400, { ok: false, error: "Backup geral nao pertence ao Tortela Plus" });
      return;
    }
    if (body.type !== "backup-geral-central-saas" || !Array.isArray(body.clients)) {
      sendJson(res, 400, { ok: false, error: "Arquivo de backup geral invalido" });
      return;
    }
    let restoredFiles = 0;
    for (const client of body.clients) {
      const result = await restoreTenantBackup(client.tenantCode, client);
      restoredFiles += result.restoredFiles;
    }
    appendProviderAudit("Backup geral restaurado", `${body.clients.length} clientes e ${restoredFiles} arquivos`, access.username, requestIp(req));
    sendJson(res, 200, { ok: true, totalClients: body.clients.length, restoredFiles });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/provider") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Token do provedor invalido" });
      return;
    }
    sendJson(res, 200, { provider: publicProvider(readProvider()) });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/provider") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Token do provedor invalido" });
      return;
    }
    const body = await readBody(req);
    const current = readProvider();
    const incoming = body.provider || body;
    const clients = (incoming.clients || current.clients).map((client) => {
      const existing = findTenant(current, client.tenantCode);
      return {
        ...client,
        activeSessions: existing?.activeSessions || [],
        licensePassword: existing?.licensePassword || client.licensePassword || "PEGMA-2026"
      };
    });
    writeProvider({ ...incoming, companyProfile: current.companyProfile, clients, providerAdmins: current.providerAdmins, auditLogs: current.auditLogs });
    appendProviderAudit("Central atualizada", "Configuracoes gerais alteradas", providerAccess(req).username, requestIp(req));
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/auth/login") {
    const body = await readBody(req);
    const ipAddress = requestIp(req);
    const attemptKey = loginAttemptKey(body.tenantCode, body.user, ipAddress);
    if (loginBlocked(attemptKey)) {
      sendJson(res, 429, { ok: false, error: "Muitas tentativas. Aguarde 15 minutos." });
      return;
    }
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    if (tenant.status !== "Ativo" && tenant.status !== "Homologacao") {
      sendJson(res, 403, { ok: false, error: "Unidade bloqueada na Central Tortela" });
      return;
    }
    const tenantState = readTenantState(tenant.tenantCode);
    const user = findUser(tenantState, body.user);
    if (!user || !user.active || !verifyPassword(body.password, user.passwordHash)) {
      recordLoginFailure(attemptKey);
      appendTenantAudit(tenant.tenantCode, "Falha de login", `Usuario ${body.user || ""} IP ${ipAddress}`, body.user || "desconhecido");
      sendJson(res, 403, { ok: false, error: "Usuario ou senha invalidos" });
      return;
    }
    loginAttempts.delete(attemptKey);
    refreshTerminalCount(tenant);
    const terminalName = body.terminalName || "Navegador";
    tenant.activeSessions = tenant.activeSessions.filter((session) =>
      !(body.terminalId ? session.terminalId === body.terminalId : !session.terminalId && session.user === user.username && session.ipAddress === ipAddress)
    );
    refreshTerminalCount(tenant);
    if (tenant.activeSessions.length >= Number(tenant.maxTerminals || 1)) {
      sendJson(res, 403, { ok: false, error: "Limite de terminais atingido" });
      return;
    }
    if (body.terminalId && !validTerminalId(body.terminalId)) return sendJson(res, 400, { ok: false, error: "Identificacao do terminal invalida." });
    if (body.terminalId) {
      registerTerminal(tenantState, body.terminalId, body.terminalName);
      writeTenantState(tenant.tenantCode, tenantState, true);
    }
    const sessionId = newSessionId(tenant.tenantCode, body.user || "Operador");
    tenant.activeSessions.push({
      sessionId,
      user: user.username,
      role: user.role,
      permissions: validPermissions(user.permissions, user.role),
      terminalName,
      terminalId: body.terminalId || "",
      ipAddress,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    });
    refreshTerminalCount(tenant);
    writeProvider(provider);
    appendTenantAudit(tenant.tenantCode, "Login", `Terminal ${terminalName} IP ${ipAddress}`, user.username);
    sendJson(res, 200, { ok: true, sessionId, tenant: publicTenant(tenant), provider: publicProvider(provider), user: publicUser(user) });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/auth/logout") {
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (tenant) {
      tenant.activeSessions = (tenant.activeSessions || []).filter((session) => session.sessionId !== body.sessionId);
      refreshTerminalCount(tenant);
      writeProvider(provider);
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/auth/ping") {
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    if (tenant.status !== "Ativo" && tenant.status !== "Homologacao") {
      tenant.activeSessions = [];
      refreshTerminalCount(tenant);
      writeProvider(provider);
      sendJson(res, 403, { ok: false, error: "Unidade bloqueada na Central Tortela" });
      return;
    }
    refreshTerminalCount(tenant);
    const session = tenant.activeSessions.find((item) => item.sessionId === body.sessionId);
    if (!session) {
      sendJson(res, 401, { ok: false, error: "Sessao expirada" });
      return;
    }
    session.lastSeenAt = new Date().toISOString();
    refreshTerminalCount(tenant);
    writeProvider(provider);
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, activeTerminals: tenant.activeTerminals });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/auth/authorize") {
    const body = await readBody(req);
    const provider = readProvider();
    const tenantCode = normalizeTenantCode(body.tenantCode);
    const access = sessionAccess(req, provider, tenantCode);
    if (access.error) {
      deny(res, access);
      return;
    }
    const tenantState = readTenantState(tenantCode);
    const user = findUser(tenantState, body.user);
    const managerActions = new Set(["remove_item", "discount", "price_override", "withdrawal", "cash_close"]);
    const action = String(body.action || "");
    const allowedRoles = managerActions.has(action) ? ["Administrador", "Gerente"] : [access.session.role];
    const sameOperator = action !== "cash_open" || String(user?.username || "").toLowerCase() === String(access.session.user || "").toLowerCase();
    if (!user || user.active === false || !allowedRoles.includes(user.role) || !sameOperator || !verifyPassword(body.password, user.passwordHash)) {
      appendTenantAudit(tenantCode, "Autorizacao negada", `${action || "operacao"} por ${body.user || "usuario nao informado"}`, access.session.user);
      sendJson(res, 403, { ok: false, error: managerActions.has(action) ? "Senha de gerente ou administrador invalida" : "Senha do operador invalida" });
      return;
    }
    appendTenantAudit(tenantCode, "Operacao autorizada", `${action} por ${user.username}`, access.session.user);
    sendJson(res, 200, { ok: true, authorizedBy: user.username, role: user.role });
    return;
  }

  const resetTestMatch=urlPath.match(/^\/api\/provider\/tenant\/([^/]+)\/reset-test-data$/);
  if(resetTestMatch && req.method==="POST"){
    const access=providerAccess(req);
    if(!access)return sendJson(res,401,{ok:false,error:"Sessao administrativa obrigatoria"});
    if(!fullAccess(access))return sendJson(res,403,{ok:false,error:"A limpeza exige administrador com acesso total"});
    const code=normalizeTenantCode(resetTestMatch[1]),provider=readProvider(),body=await readBody(req);
    if(!findTenant(provider,code))return sendJson(res,404,{ok:false,error:"Unidade nao encontrada"});
    if(body.confirmation!==code)return sendJson(res,400,{ok:false,error:"Confirme a unidade para limpar os dados de teste"});
    const backup=await completeTenantBackup(code,"antes-limpeza-testes");
    if(postgresStore)await postgresStore.writeProviderBackup("antes-limpeza-testes",{product:"Tortela Plus",type:"backup-geral-central-saas",clients:[backup]});
    const directory=path.join(backupsDir,code);fs.mkdirSync(directory,{recursive:true});writeJson(path.join(directory,`${Date.now()}-antes-limpeza-testes.json`),backup);
    const state=readTenantState(code),epoch=crypto.randomUUID(),removed=resetTestData(state,epoch);
    writeTenantState(code,state,false,true);
    provider.whatsappGroupQueue=(provider.whatsappGroupQueue||[]).filter(row=>row.tenantCode!==code);writeProvider(provider);
    appendTenantAudit(code,"Dados de teste removidos","Vendas, produtos e movimentos associados zerados apos backup completo",access.username);
    appendProviderAudit("Dados de teste removidos",code,access.username,requestIp(req));
    return sendJson(res,200,{ok:true,tenantCode:code,dataEpoch:epoch,removed,backupCreated:true});
  }

  const pdvCustomerMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/pdv-customers\/(lookup|register)$/);
  if(pdvCustomerMatch&&req.method==='POST'){
    const code=normalizeTenantCode(pdvCustomerMatch[1]),provider=readProvider(),access=sessionAccess(req,provider,code,'pdv');if(access.error)return deny(res,access);
    const body=await readBody(req),state=readTenantState(code),customers=require('./src/server/pdv-customers');
    if(!customers.validCpf(body.document))return sendJson(res,422,{error:'CPF invalido. Confira os digitos.'});
    if(pdvCustomerMatch[2]==='lookup'){const person=customers.find(state,body.document);return sendJson(res,200,{customer:customers.publicCustomer(person)});}
    try{const customer=customers.save(state,body);writeTenantState(code,state,true);appendTenantAudit(code,'Cliente identificado no PDV',`Cliente ${customer.id}`,access.session.user);return sendJson(res,200,{customer});}catch(error){return sendJson(res,422,{error:error.message});}
  }

  const closureReportMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/cash-closure-reports$/);
  if(req.method==='GET' && (urlPath==='/api/network/sales-reports'||closureReportMatch)){
    const provider=readProvider(),network=!closureReportMatch;
    let clients;
    if(network){const access=providerAccess(req);if(!access)return sendJson(res,401,{error:'Sessao da Central obrigatoria.'});if(!permissionsFor(access).includes('sales'))return sendJson(res,403,{error:'Sem permissao para vendas da rede.'});clients=provider.clients||[];}
    else{const code=normalizeTenantCode(closureReportMatch[1]),access=tenantAccessOrProvider(req,provider,code,'finance');if(access.error)return deny(res,access);clients=[access.tenant];}
    const params=new URL(req.url,'http://localhost').searchParams,from=params.get('from')||'',to=params.get('to')||'',unit=params.get('unit')||'';
    if((from&&!/^\d{4}-\d{2}-\d{2}$/.test(from))||(to&&!/^\d{4}-\d{2}-\d{2}$/.test(to))||(from&&to&&from>to))return sendJson(res,400,{error:'Periodo invalido.'});
    const units=clients.filter(c=>!network||!unit||normalizeTenantCode(c.tenantCode)===unit).map(c=>({code:normalizeTenantCode(c.tenantCode),name:c.tradeName||c.tenantCode,state:readTenantState(c.tenantCode)}));
    const report=require('./src/server/closure-reports').buildReport(units,{from,to});
    if(!network)return sendJson(res,200,{generatedAt:report.generatedAt,closures:report.closures,units:report.units,sales:report.sales});
    report.units=clients.map(c=>({code:normalizeTenantCode(c.tenantCode),name:c.tradeName||c.tenantCode}));
    return sendJson(res,200,report);
  }

  const cashRegisterMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/cash-register(?:\/(open|close))?$/);
  if(cashRegisterMatch && ["GET","POST"].includes(req.method)){
    const code=normalizeTenantCode(cashRegisterMatch[1]),provider=readProvider(),access=sessionAccess(req,provider,code,"pdv");
    if(access.error)return deny(res,access);
    const state=readTenantState(code);
    if(req.method==="GET"){writeProvider(provider);return sendJson(res,200,{ok:true,register:state.cashRegister,businessDate:businessDay(),stale:cashRegisterStale(state.cashRegister)});}
    const body=await readBody(req),action=cashRegisterMatch[2];
    const user=findUser(state,action==="open"?access.session.user:body.user);
    if(!user || user.active===false || !verifyPassword(body.password,user.passwordHash) || (action==="close" && !["Administrador","Gerente"].includes(user.role)))return sendJson(res,403,{ok:false,error:"Senha do responsavel invalida para esta operacao"});
    let closure;
    try{
      if(action==="open")openRegister(state,{user:access.session.user,terminal:body.terminal,terminalId:access.session.terminalId||"",initialAmount:body.initialAmount});
      else if(action==="close")closure=closeRegister(state,{user:access.session.user,authorizedBy:user.username,countedAmount:body.countedAmount,responsible:body.responsible,closingNote:body.closingNote});
      else return sendJson(res,400,{ok:false,error:"Operacao de caixa invalida"});
    }catch(error){return sendJson(res,409,{ok:false,error:error.message});}
    writeTenantState(code,state);writeProvider(provider);
    appendTenantAudit(code,action==="open"?"Caixa aberto":"Caixa fechado",`${state.cashRegister.terminal}: ${businessDay()}`,access.session.user);
    return sendJson(res,200,{ok:true,register:state.cashRegister,closure,state:publicTenantState(readTenantState(code))});
  }

  const registerPdvTerminalMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/pdv-terminals\/register$/);
  if (registerPdvTerminalMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(registerPdvTerminalMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "pdv");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    try { registerTerminal(tenantState, body.terminalId, body.name); }
    catch (error) { return sendJson(res, 400, { ok: false, error: error.message }); }
    access.session.terminalId = body.terminalId;
    writeTenantState(tenantCode, tenantState, true);
    writeProvider(provider);
    sendJson(res, 200, { ok: true, terminals: listTerminals(readTenantState(tenantCode), access.tenant) });
    return;
  }

  const pdvTerminalsMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/pdv-terminals$/);
  if (pdvTerminalsMatch && ["GET", "POST"].includes(req.method)) {
    const tenantCode = normalizeTenantCode(pdvTerminalsMatch[1]);
    const provider = readProvider();
    const access = tenantAccessOrProvider(req, provider, tenantCode);
    if (access.error) return deny(res, access);
    if (req.method === "POST" && !access.session.provider && !access.session.permissions.includes("settings") && !(access.session.role === "Gerente" && access.session.permissions.includes("fiscal_transmit"))) return sendJson(res, 403, { ok: false, error: "Seu usuario nao possui permissao para configurar a emissao do terminal." });
    const tenantState = readTenantState(tenantCode);
    if (req.method === "POST") {
      const body = await readBody(req);
      try { updateTerminal(tenantState, body.terminalId, body.name, body.emissionMode); }
      catch (error) { return sendJson(res, 400, { ok: false, error: error.message }); }
      writeTenantState(tenantCode, tenantState, true);
      appendTenantAudit(tenantCode, "Emissao do terminal alterada", `${body.terminalId}: ${body.emissionMode}`, access.session.user);
    }
    writeProvider(provider);
    sendJson(res, 200, { ok: true, terminals: listTerminals(readTenantState(tenantCode), access.tenant) });
    return;
  }

  const tenantMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/state$/);
  if (tenantMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode);
    if (access.error) {
      deny(res, access);
      return;
    }
    writeProvider(provider);
    sendJson(res, 200, { state: publicTenantState(readTenantState(tenantCode)), provider: publicProvider({clients:[access.tenant],ownerName:provider.ownerName}) });
    return;
  }

  if (tenantMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantMatch[1]);
    const provider = readProvider();
    const requestedPermission = String(req.headers["x-pegma-permission"] || "").trim();
    if (!allPermissions.includes(requestedPermission)) {
      sendJson(res, 400, { ok: false, error: "Permissao da operacao nao informada" });
      return;
    }
    const access = sessionAccess(req, provider, tenantCode, requestedPermission);
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const currentState = readTenantState(tenantCode);
    if (currentState._meta?.dataEpoch && req.headers["x-tortela-data-epoch"] !== currentState._meta.dataEpoch) return sendJson(res,409,{ok:false,code:"DATA_RESET",error:"Dados de teste foram limpos. Recarregue a tela antes de continuar.",state:publicTenantState(currentState)});
    const baseRevision = Number(body.baseRevision ?? body.state?._meta?.revision ?? 0);
    const currentRevision = Number(currentState._meta?.revision || 0);
    if (baseRevision && baseRevision !== currentRevision) {
      sendJson(res, 409, { ok: false, error: "Dados atualizados em outro terminal", revision: currentRevision, state: publicTenantState(currentState) });
      return;
    }
    if (periodClosed(currentState, body.state || body)) {
      sendJson(res, 423, { ok: false, error: `Periodo fechado ate ${currentState.settings.closedThrough}. Reabra o periodo antes de alterar movimentos anteriores.` });
      return;
    }
    try {
      assertTenantPayload(tenantCode, body.state || body);
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
      return;
    }
    const incoming = body.state || body;
    const currentUsers = readTenantState(tenantCode).users.map(publicUser);
    if (incoming.users && JSON.stringify(incoming.users.map(publicUser)) !== JSON.stringify(currentUsers)) return sendJson(res,403,{ok:false,error:"Sem permissao para alterar usuarios"});
    try { assertTenantWriteScope(currentState, incoming, access.session.permissions, allPermissions); }
    catch(error) { return sendJson(res,403,{ok:false,error:error.message}); }
    try { for(const product of incoming.products||[]){const previous=(currentState.products||[]).find(p=>String(p.id)===String(product.id));if(product.comboPricing?.enabled&&JSON.stringify(product.comboPricing)!==JSON.stringify(previous?.comboPricing))require('./src/combo-sales').validate(product.comboPricing,incoming.products);} }
    catch(error){return sendJson(res,422,{error:error.message});}
    try { assertPdvCashWrite(currentState,incoming); }
    catch(error){return sendJson(res,423,{ok:false,error:error.message});}
    incoming.users = currentState.users;
    writeTenantState(tenantCode, incoming);
    writeProvider(provider);
    sendJson(res, 200, { ok: true, tenantCode, revision: readTenantState(tenantCode)._meta?.revision || 0 });
    return;
  }

  const tenantFileMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/files$/);
  if (tenantFileMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantFileMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode);
    if (access.error) return deny(res, access);
    const rootDir = path.join(storageDir, tenantCode);
    const files = [];
    if (fs.existsSync(rootDir)) {
      for (const category of fs.readdirSync(rootDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
        const categoryDir = path.join(rootDir, category.name);
        for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true }).filter((item) => item.isFile())) {
          const stat = fs.statSync(path.join(categoryDir, entry.name));
          files.push({ filename: entry.name, category: category.name, size: stat.size, modifiedAt: stat.mtime.toISOString(), url: `/storage/${tenantCode}/${category.name}/${entry.name}` });
        }
      }
    }
    sendJson(res, 200, { ok: true, files });
    return;
  }
  if (tenantFileMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFileMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode);
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    if (!body.content) {
      sendJson(res, 400, { ok: false, error: "Conteudo do arquivo obrigatorio" });
      return;
    }
    const file = saveTenantFile({
      tenantCode,
      category: body.category || "geral",
      filename: body.filename || "arquivo",
      mimeType: body.mimeType || "application/octet-stream",
      content: body.content
    });
    appendTenantAudit(tenantCode, "Arquivo armazenado", `${body.category || "geral"} ${file.filename}`, access.session.user);
    writeProvider(provider);
    sendJson(res, 201, { ok: true, file });
    return;
  }

  const tenantClosePeriodMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/close-period$/);
  if (tenantClosePeriodMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantClosePeriodMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "settings");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const date = String(body.date || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return sendJson(res, 400, { ok: false, error: "Data de fechamento invalida." });
    const tenantState = readTenantState(tenantCode);
    tenantState.settings.closedThrough = date;
    writeTenantState(tenantCode, tenantState);
    appendTenantAudit(tenantCode, "Periodo operacional fechado", `Movimentos ate ${date}`, access.session.user);
    sendJson(res, 200, { ok: true, closedThrough: date });
    return;
  }

  const tenantReadinessMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/readiness$/);
  if (tenantReadinessMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantReadinessMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "settings");
    if (access.error) return deny(res, access);
    sendJson(res, 200, { ok: true, readiness: deploymentReadiness(access.tenant, readTenantState(tenantCode)) });
    return;
  }

  const tenantFiscalTransmitMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/transmit$/);
  if (tenantFiscalTransmitMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalTransmitMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal_transmit");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    let row;
    try {
      row = await transmitFiscalDocument(tenantCode, body.document || body, access.session.user);
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
      return;
    }
    writeProvider(provider);
    sendJson(res, 200, { ok: true, document: row, fiscalProvider: row.fiscalProvider || "homologacao-local" });
    return;
  }

  const tenantFiscalProviderStatusMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/provider-status$/);
  if (tenantFiscalProviderStatusMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantFiscalProviderStatusMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) {
      deny(res, access);
      return;
    }
    const tenantState = readTenantState(tenantCode);
    sendJson(res, 200, { ok: true, status: fiscalProviderStatus(tenantState), acbr: await acbrStatus(tenantState) });
    return;
  }

  const tenantFiscalSecretsMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/secrets$/);
  if (tenantFiscalSecretsMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalSecretsMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "settings");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    try {
      const currentSecrets = loadFiscalSecrets(tenantCode);
      saveFiscalSecrets(tenantCode, {
        ...currentSecrets,
        ...(body.certificatePassword ? { certificatePassword: String(body.certificatePassword) } : {}),
        ...(body.csc ? { csc: String(body.csc) } : {}),
        ...(body.acbrApiToken ? { acbrApiToken: String(body.acbrApiToken) } : {}),
        ...(body.paymentApiToken ? { paymentApiToken: String(body.paymentApiToken) } : {}),
        ...(body.pixApiToken ? { pixApiToken: String(body.pixApiToken) } : {}),
        ...(body.boletoApiToken ? { boletoApiToken: String(body.boletoApiToken) } : {}),
        ...(body.alertWebhookToken ? { alertWebhookToken: String(body.alertWebhookToken) } : {}),
        ...(body.whatsappWebhookToken ? { whatsappWebhookToken: String(body.whatsappWebhookToken) } : {}),
        ...(body.emailWebhookToken ? { emailWebhookToken: String(body.emailWebhookToken) } : {})
      });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
      return;
    }
    tenantState.settings.certificatePasswordConfigured = Boolean(body.certificatePassword) || Boolean(tenantState.settings.certificatePasswordConfigured);
    tenantState.settings.cscConfigured = Boolean(body.csc) || Boolean(tenantState.settings.cscConfigured);
    tenantState.settings.acbrApiTokenConfigured = Boolean(body.acbrApiToken) || Boolean(tenantState.settings.acbrApiTokenConfigured);
    tenantState.settings.paymentApiTokenConfigured = Boolean(body.paymentApiToken) || Boolean(tenantState.settings.paymentApiTokenConfigured);
    tenantState.settings.pixApiTokenConfigured = Boolean(body.pixApiToken) || Boolean(tenantState.settings.pixApiTokenConfigured);
    tenantState.settings.boletoApiTokenConfigured = Boolean(body.boletoApiToken) || Boolean(tenantState.settings.boletoApiTokenConfigured);
    tenantState.settings.alertWebhookTokenConfigured = Boolean(body.alertWebhookToken) || Boolean(tenantState.settings.alertWebhookTokenConfigured);
    tenantState.settings.whatsappWebhookTokenConfigured = Boolean(body.whatsappWebhookToken) || Boolean(tenantState.settings.whatsappWebhookTokenConfigured);
    tenantState.settings.emailWebhookTokenConfigured = Boolean(body.emailWebhookToken) || Boolean(tenantState.settings.emailWebhookTokenConfigured);
    writeTenantState(tenantCode, tenantState);
    sendJson(res, 200, {
      ok: true,
      certificatePasswordConfigured: tenantState.settings.certificatePasswordConfigured,
      cscConfigured: tenantState.settings.cscConfigured,
      acbrApiTokenConfigured: tenantState.settings.acbrApiTokenConfigured,
      paymentApiTokenConfigured: tenantState.settings.paymentApiTokenConfigured,
      pixApiTokenConfigured: tenantState.settings.pixApiTokenConfigured,
      boletoApiTokenConfigured: tenantState.settings.boletoApiTokenConfigured,
      alertWebhookTokenConfigured: tenantState.settings.alertWebhookTokenConfigured,
      whatsappWebhookTokenConfigured: tenantState.settings.whatsappWebhookTokenConfigured,
      emailWebhookTokenConfigured: tenantState.settings.emailWebhookTokenConfigured
    });
    return;
  }

  const tenantChargeMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/charges$/);
  if (tenantChargeMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantChargeMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode);
    if (access.error) {
      deny(res, access);
      return;
    }
    const chargePermissions = validPermissions(access.session.permissions, access.session.role);
    if (!chargePermissions.includes("finance") && !chargePermissions.includes("pdv")) {
      sendJson(res, 403, { ok: false, error: "Perfil sem permissao para gerar cobranca" });
      return;
    }
    const body = await readBody(req);
    const method = String(body.method || "").toLowerCase();
    if (!["pix", "boleto"].includes(method)) {
      sendJson(res, 400, { ok: false, error: "Metodo deve ser pix ou boleto." });
      return;
    }
    const tenantState = readTenantState(tenantCode);
    const url = method === "pix" ? tenantState.settings.pixApiUrl : tenantState.settings.boletoApiUrl;
    const token = loadFiscalSecrets(tenantCode)[method === "pix" ? "pixApiToken" : "boletoApiToken"];
    if (!url || !token) {
      sendJson(res, 409, { ok: false, error: `Configure URL e token reais do provedor ${method.toUpperCase()}.` });
      return;
    }
    try {
      const authHeader = String(tenantState.settings.paymentAuthHeader || "Authorization").replace(/[^A-Za-z0-9-]/g, "") || "Authorization";
      const authScheme = String(tenantState.settings.paymentAuthScheme || "").trim();
      const authValue = [authScheme, token].filter(Boolean).join(" ");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", [authHeader]: authValue, "Idempotency-Key": `${tenantCode}-${method}-${body.reference || Date.now()}` },
        body: JSON.stringify({
          provider: tenantState.settings.paymentProvider || "",
          method,
          amount: Number(body.amount || 0),
          customer: body.customer || {},
          reference: body.reference || "",
          dueDate: body.dueDate || "",
          callbackUrl: tenantState.settings.paymentCallbackUrl || ""
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Provedor retornou HTTP ${response.status}.`);
      appendTenantAudit(tenantCode, `Cobranca ${method.toUpperCase()} criada`, String(body.reference || ""), access.session.user);
      sendJson(res, 200, { ok: true, charge: payload });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const tenantAlertsMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/alerts\/dispatch$/);
  if (tenantAlertsMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantAlertsMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "settings");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const targets = [
      { channel: "geral", url: tenantState.settings.alertWebhookUrl, tokenKey: "alertWebhookToken" },
      { channel: "whatsapp", url: tenantState.settings.whatsappWebhookUrl, tokenKey: "whatsappWebhookToken" },
      { channel: "email", url: tenantState.settings.emailWebhookUrl, tokenKey: "emailWebhookToken" }
    ].filter((target) => target.url);
    if (!targets.length) {
      sendJson(res, 409, { ok: false, error: "Configure um webhook real de e-mail/WhatsApp nas configuracoes." });
      return;
    }
    try {
      const secrets = loadFiscalSecrets(tenantCode);
      for (const target of targets) {
        const token = secrets[target.tokenKey];
        const response = await fetch(target.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ channel: target.channel, tenantCode, company: tenantState.settings.company, alerts: body.alerts || [] })
        });
        if (!response.ok) throw new Error(`${target.channel}: webhook retornou HTTP ${response.status}.`);
      }
      const sentIds = (body.alerts || []).map((row) => row.id);
      appendTenantAudit(tenantCode, "Alertas enviados", `${sentIds.length} registros`, access.session.user);
      sendJson(res, 200, { ok: true, sentIds });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const fiscalSettingsMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/settings(\/connection)?$/);
  if(fiscalSettingsMatch&&['GET','POST'].includes(req.method)){
    const code=normalizeTenantCode(fiscalSettingsMatch[1]),provider=readProvider(),access=tenantAccessOrProvider(req,provider,code,'settings');
    if(access.error)return deny(res,access);
    let state=readTenantState(code);const flags=()=>Object.fromEntries(fiscalSettingsPanel.secrets.map(key=>[key,Boolean(state.settings[key+'Configured'])]));
    const revision=()=>crypto.createHash('sha256').update(JSON.stringify([fiscalSettingsPanel.profile(state.settings),flags()])).digest('hex');
    const payload=()=>{const missing=[...fiscalProviderStatus({...state,fiscalRules:(state.fiscalRules||[]).filter(r=>['NF-e','NFC-e'].includes(r.model))}).missing];if(!state.settings.stateRegistration&&!missing.includes('inscricao estadual'))missing.push('inscricao estadual');if((!state.settings.cscConfigured||!state.settings.cscId)&&!missing.some(value=>value.includes('CSC')))missing.push('CSC e ID CSC da NFC-e');if(!state.settings.acbrApiUrl)missing.push('URL HTTPS do agente fiscal Windows');if(!state.settings.acbrApiTokenConfigured)missing.push('token do agente fiscal');if(state.settings.certificateExpiresAt&&state.settings.certificateExpiresAt<today())missing.push('certificado expirado');if(state.settings.sefazUf&&state.settings.uf&&state.settings.sefazUf!==state.settings.uf)missing.push('UF SEFAZ diferente da UF da empresa');return {ok:true,tenantCode:code,unit:access.tenant.tradeName||code,document:state.settings.document||access.tenant.document||'',config:fiscalSettingsPanel.profile(state.settings),certificateFile:String(state.settings.certificateName||"").startsWith("vault-a1:")?(state.settings.certificateFileName||""):"",configured:flags(),revision:revision(),missing:[...new Set(missing)],lastNumbers:{nfe:Math.max(0,...(state.fiscalQueue||[]).filter(r=>r.model==='NF-e').map(r=>Number(r.number||r.id)||0)),nfce:Math.max(0,...(state.fiscalQueue||[]).filter(r=>r.model==='NFC-e').map(r=>Number(r.number||r.id)||0))}};};
    if(fiscalSettingsMatch[2]){if(req.method!=='POST')return sendJson(res,405,{ok:false,error:'Use POST.'});try{const result=await acbrStatus(state);return sendJson(res,200,{ok:true,connected:!!result.connected,message:result.connected?'Conexão confirmada':result.message?.startsWith('Atualize o agente fiscal')?result.message:'Confira URL, token e serviço do agente.'});}catch{return sendJson(res,200,{ok:true,connected:false,message:'Não foi possível conectar ao agente fiscal.'});}}
    if(req.method==='GET')return sendJson(res,200,payload());
    const body=await readBody(req);state=readTenantState(code);if(body.revision!==revision())return sendJson(res,409,{ok:false,error:'A configuração foi alterada. Reabra a aba antes de salvar.'});
    let config,secretValues={};try{config=fiscalSettingsPanel.validate(body.config);if(body.secrets!==undefined&&(!body.secrets||typeof body.secrets!=='object'||Array.isArray(body.secrets)))throw Error('Segredos inválidos.');for(const [key,value]of Object.entries(body.secrets||{})){if(!fiscalSettingsPanel.secrets.includes(key)||typeof value!=='string'||value.length>500)throw Error('Segredo fiscal inválido.');if(value)secretValues[key]=value;}}catch(error){return sendJson(res,422,{ok:false,error:error.message});}
    let uploadedA1;if(body.certificateFile!==undefined){try{uploadedA1=a1Certificate.validateCertificate(body.certificateFile);}catch(error){return sendJson(res,422,{ok:false,error:error.message});}secretValues.certificateA1=uploadedA1;config.certificateName='vault-a1:'+uploadedA1.sha256;}
    if(!uploadedA1&&String(config.certificateName).startsWith('vault-a1:')&&config.certificateName!==state.settings.certificateName)return sendJson(res,422,{ok:false,error:'Selecione o arquivo A1 antes de salvar.'});
    if(Object.keys(secretValues).length){try{saveFiscalSecrets(code,{...loadFiscalSecrets(code),...secretValues});}catch{return sendJson(res,503,{ok:false,error:'Não foi possível proteger os segredos fiscais. Verifique a chave de proteção da hospedagem. Nenhum parâmetro foi alterado.'});}}
    Object.assign(state.settings,config);if(uploadedA1)state.settings.certificateFileName=uploadedA1.fileName;for(const key of fiscalSettingsPanel.secrets.filter(key=>Object.hasOwn(secretValues,key)))state.settings[key+'Configured']=true;
    writeTenantState(code,state);appendTenantAudit(code,'Configuração fiscal alterada','Parâmetros da própria unidade; segredos protegidos',access.session.user);return sendJson(res,200,payload());
  }

  const companyTenantMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/company-profile$/);
  if((urlPath==='/api/provider/company-profile'||companyTenantMatch)&&['GET','POST'].includes(req.method)){
    const provider=readProvider(),central=urlPath==='/api/provider/company-profile';
    const code=central?'':normalizeTenantCode(companyTenantMatch[1]);
    const access=central?providerAccess(req):tenantAccessOrProvider(req,provider,code,'settings');
    if(!access)return sendJson(res,401,{ok:false,error:'Sessão administrativa obrigatória.'});
    if(access.error)return deny(res,access);
    const state=central?null:readTenantState(code);
    const current=companyProfile.profile(central?provider.companyProfile:state.settings);
    const revision=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const payload=profile=>({ok:true,scope:central?'central':'unit',unit:central?'Central da rede':(access.tenant.tradeName||code),profile,revision:revision(profile)});
    if(req.method==='GET')return sendJson(res,200,payload(current));
    const body=await readBody(req);
    if(body.revision!==revision(current))return sendJson(res,409,{ok:false,error:'O cadastro foi alterado. Recarregue os dados antes de salvar.'});
    let profile;try{profile=companyProfile.validate(body.profile,current);}catch(error){return sendJson(res,422,{ok:false,error:error.message});}
    if(central){provider.companyProfile=profile;writeProvider(provider);appendProviderAudit('Dados da empresa franqueadora alterados','Cadastro exclusivo da Central da rede',access.username,requestIp(req));}
    else{
      Object.assign(state.settings,profile,{legalName:profile.company,company:profile.tradeName||profile.company});writeTenantState(code,state);
      access.tenant.tradeName=profile.tradeName||profile.company;access.tenant.document=profile.document;
      writeProvider(provider);appendTenantAudit(code,'Dados da empresa da unidade alterados','Cadastro da própria unidade',access.session.user);
    }
    return sendJson(res,200,payload(profile));
  }

  const fiscalDocumentsMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/documents$/);
  if(fiscalDocumentsMatch&&req.method==='GET'){
    const code=normalizeTenantCode(fiscalDocumentsMatch[1]),provider=readProvider(),access=tenantAccessOrProvider(req,provider,code,'fiscal');if(access.error)return deny(res,access);
    const state=readTenantState(code),central=providerAccess(req),canCancel=central?permissionsFor(central).includes('fiscal_cancel'):access.session.permissions.includes('fiscal_cancel');
    const fields=['id','number','serie','model','issuedAt','date','customer','total','status','key','protocol','cancelProtocol','cancelStatusCode','cancelStatusMessage','cancelledAt'];
    const documents=(state.fiscalQueue||[]).filter(r=>['NF-e','NFC-e'].includes(r.model)).slice().reverse().map(row=>Object.fromEntries(fields.map(k=>[k,row[k]])));
    return sendJson(res,200,{ok:true,unit:access.tenant.tradeName||state.settings.company||code,environment:state.settings.fiscalEnvironment,canCancel,documents});
  }
  const tenantFiscalCancelMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/cancel$/);
  if (tenantFiscalCancelMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalCancelMatch[1]);
    const provider = readProvider();
    const access = tenantAccessOrProvider(req, provider, tenantCode, "fiscal_cancel");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const row = (tenantState.fiscalQueue || []).find((item) => Number(item.id) === Number(body.id));
    if (!row) {
      sendJson(res, 404, { ok: false, error: "Documento fiscal nao encontrado" });
      return;
    }
    if(row.status==='Cancelada')return sendJson(res,200,{ok:true,document:row,alreadyCancelled:true});
    if(['NF-e','NFC-e'].includes(row.model)&&(row.protocol||row.status==='Autorizada')){
      const model=row.model==='NF-e'?'55':'65',document=String(tenantState.settings.document||'').replace(/\D/g,'');
      if(row.status!=='Autorizada'||!/^\d{44}$/.test(String(row.key))||String(row.key).slice(20,22)!==model||String(row.key).slice(6,20)!==document||!/^\d{15}(\d{2})?$/.test(String(row.protocol||'')))return sendJson(res,409,{ok:false,error:'Cancelamento exige nota autorizada da unidade, chave e protocolo validos.'});
      const originalEnvironment=String(row.xml||'').match(/<(?:\w+:)?tpAmb>([12])<\/(?:\w+:)?tpAmb>/)?.[1];
      if(originalEnvironment&&originalEnvironment!==(tenantState.settings.fiscalEnvironment==='Producao'?'1':'2'))return sendJson(res,409,{ok:false,error:'Ambiente atual difere do ambiente de autorizacao da nota.'});
    }
    if (row.protocol || row.status === "Autorizada") {
      const reason = String(body.reason || "").trim();
      if (reason.length < 15 || reason.length > 255 || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(reason)) {
        sendJson(res, 400, { ok: false, error: "Informe justificativa real de cancelamento entre 15 e 255 caracteres." });
        return;
      }
      try {
        const isNfse = row.model === "NFS-e";
        let result;
        let parsed;
        if (tenantState.settings.acbrApiUrl) {
          const remote = await fiscalAgentExecute(tenantCode, tenantState, {
            engine: isNfse ? "nfse" : "nfe",
            steps: [{ method: "cancelar", args: isNfse ? [String(body.cancelInfo || row.key || row.protocol)] : [row.key, reason, String(tenantState.settings.document || "").replace(/\D/g, ""), "1"] }]
          });
          result = remote.response;
          parsed = remote.parsed;
        } else {
          await initializeAcbrLib(isNfse ? configureAcbrNfseForTenant(tenantCode, tenantState) : configureAcbrForTenant(tenantCode, tenantState), isNfse ? "nfse" : "nfe");
          result = isNfse
            ? await acbrLibCommand("cancelar", [String(body.cancelInfo || row.key || row.protocol)], 60000, "nfse")
            : await acbrLibCommand("cancelar", [row.key, reason, String(tenantState.settings.document || "").replace(/\D/g, ""), "1"], 60000);
          parsed = parseAcbrResponse(result.response);
        }
        row.cancelReason=reason;row.cancelRequestedBy=access.session.user;
        row.cancelAttempts=Array.isArray(row.cancelAttempts)?row.cancelAttempts:[];
        row.cancelAttempts.push({at:new Date().toISOString(),user:access.session.user,reason,statusCode:parsed.statusCode,message:parsed.statusMessage,protocol:parsed.protocol});
        row.cancelStatusCode = parsed.statusCode;
        row.cancelStatusMessage = parsed.statusMessage;
        row.cancelProtocol = parsed.protocol;
        row.cancelAcbrResponse = parsed.raw;
        row.cancelResponseUrl = saveFiscalResponse(tenantCode, `retorno-cancelamento-${row.model}-${row.id}-${row.cancelAttempts.length}.txt`, parsed.raw).url;
        if (!isNfse && (!['135','155'].includes(parsed.statusCode)||!/^\d{15}(\d{2})?$/.test(String(parsed.protocol||'')))) {
          row.cancelProtocol='';
          writeTenantState(tenantCode,tenantState);
          appendTenantAudit(tenantCode,'Cancelamento fiscal nao confirmado',`${row.model} ${row.id}: ${parsed.statusCode}`,access.session.user);
          sendJson(res, 409, { ok: false, error: parsed.statusMessage || `Cancelamento nao aceito. Codigo ACBr ${result.code}.` });
          return;
        }
        if (isNfse && Number(result.code) !== 0) throw new Error(parsed.statusMessage || `Cancelamento NFS-e recusado. Codigo ACBr ${result.code}.`);
        row.status = "Cancelada";
        row.cancelledAt = new Date().toISOString();
      } catch (error) {
        sendJson(res, 503, { ok: false, error: error.message });
        return;
      }
    } else {
      row.status = "Cancelada antes da transmissao";
      row.cancelledAt = new Date().toISOString();
    }
    writeTenantState(tenantCode, tenantState);
    appendTenantAudit(tenantCode, "Fiscal cancelado", `${row.model} ${row.id}`, access.session.user);
    writeProvider(provider);
    sendJson(res, 200, { ok: true, document: row });
    return;
  }

  const tenantFiscalPrintMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/print$/);
  if (tenantFiscalPrintMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalPrintMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const row = (tenantState.fiscalQueue || []).find((item) => Number(item.id) === Number(body.id));
    if (!row || !row.xmlUrl) {
      sendJson(res, 404, { ok: false, error: "XML fiscal ainda nao foi gerado pelo servidor." });
      return;
    }
    try {
      const isNfse = row.model === "NFS-e";
      if (tenantState.settings.acbrApiUrl) {
        const remote = await fiscalAgentExecute(tenantCode, tenantState, {
          engine: isNfse ? "nfse" : "nfe",
          collectPdf: true,
          steps: [
            { method: "carregarxml", file: { argIndex: 0, filename: `${row.model}-${row.id}.xml`, content: row.xml || fs.readFileSync(fiscalLocalPath(tenantCode, row), "utf8") } },
            { method: isNfse ? "imprimirpdf" : "salvarpdf", args: [] }
          ]
        });
        const buffer = pdfBufferFromBase64(remote.pdfBase64);
        if (!buffer) throw new Error("Agente fiscal nao retornou o documento auxiliar em PDF valido.");
        const pdf = savePdfBuffer(tenantCode, row, buffer);
        row.pdfUrl = pdf.url;
        row.printedAt = new Date().toISOString();
        writeTenantState(tenantCode, tenantState);
        return sendJson(res, 200, { ok: true, document: row, pdfUrl: pdf.url, message: `${isNfse ? "DANFSe" : row.model === "NFC-e" ? "DANFCE" : "DANFE"} gerado pelo agente ACBr.` });
      }
      await initializeAcbrLib(isNfse ? configureAcbrNfseForTenant(tenantCode, tenantState) : configureAcbrForTenant(tenantCode, tenantState), isNfse ? "nfse" : "nfe");
      const xmlPath = fiscalLocalPath(tenantCode, row);
      acbrResponseOrThrow(await acbrLibCommand("carregarxml", [xmlPath], 10000, isNfse ? "nfse" : "nfe"), "Carregar XML para PDF");
      const pdfStartedAt = Date.now();
      const result = isNfse
        ? await acbrLibCommand("imprimirpdf", [], 60000, "nfse")
        : await acbrLibCommand("salvarpdf", [], 60000);
      const pdf = saveAcbrPdf(tenantCode, row, result, pdfStartedAt);
      row.pdfUrl = pdf.url;
      row.printedAt = new Date().toISOString();
      row.printAcbrResponse = result.response || "";
      writeTenantState(tenantCode, tenantState);
      appendTenantAudit(tenantCode, "Documento fiscal impresso pelo ACBr", `${row.model} ${row.id}`, access.session.user);
      sendJson(res, 200, { ok: true, document: row, pdfUrl: pdf.url, message: `${isNfse ? "DANFSe" : row.model === "NFC-e" ? "DANFCE" : "DANFE"} gerado pelo ACBr.` });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const tenantFiscalImportMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/import-xml$/);
  if (tenantFiscalImportMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalImportMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    try {
      const content = body.base64 ? Buffer.from(body.base64, "base64").toString("utf8") : String(body.xml || "");
      const imported = importNfeXml(content);
      const xmlFile = saveTenantFile({
        tenantCode,
        category: "xml",
        filename: `importado-${imported.key || imported.number || Date.now()}.xml`,
        mimeType: "application/xml",
        content: Buffer.from(content, "utf8").toString("base64")
      });
      const tenantState = readTenantState(tenantCode);
      tenantState.fiscalImports = Array.isArray(tenantState.fiscalImports) ? tenantState.fiscalImports : [];
      tenantState.fiscalImports.unshift({ ...imported, xmlUrl: xmlFile.url, importedAt: new Date().toISOString(), importedBy: access.session.user });
      writeTenantState(tenantCode, tenantState);
      appendTenantAudit(tenantCode, "XML fiscal importado", imported.key || imported.number, access.session.user);
      sendJson(res, 201, { ok: true, imported: { ...imported, xmlUrl: xmlFile.url } });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
    }
    return;
  }

  const tenantFiscalQueryMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/query$/);
  if (tenantFiscalQueryMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalQueryMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const row = (tenantState.fiscalQueue || []).find((item) => Number(item.id) === Number(body.id));
    if (!row || !(row.key || row.protocol)) return sendJson(res, 400, { ok: false, error: "Documento sem chave ou protocolo para consulta." });
    try {
      const isNfse = row.model === "NFS-e";
      let parsed;
      if (tenantState.settings.acbrApiUrl) {
        parsed = (await fiscalAgentExecute(tenantCode, tenantState, { engine: isNfse ? "nfse" : "nfe", steps: [{ method: isNfse ? "consultardfe" : "consultar", args: [row.key || row.protocol] }] })).parsed;
      } else {
        await initializeAcbrLib(isNfse ? configureAcbrNfseForTenant(tenantCode, tenantState) : configureAcbrForTenant(tenantCode, tenantState), isNfse ? "nfse" : "nfe");
        parsed = acbrResponseOrThrow(await acbrLibCommand(isNfse ? "consultardfe" : "consultar", [row.key || row.protocol], 60000, isNfse ? "nfse" : "nfe"), "Consultar documento");
      }
      row.lastQueryAt = new Date().toISOString();
      row.lastQueryResponse = parsed.raw;
      row.statusCode = parsed.statusCode || row.statusCode;
      row.statusMessage = parsed.statusMessage || row.statusMessage;
      if (["100", "150"].includes(parsed.statusCode)) row.status = "Autorizada";
      if (["101", "135", "155"].includes(parsed.statusCode)) row.status = "Cancelada";
      writeTenantState(tenantCode, tenantState);
      sendJson(res, 200, { ok: true, document: row });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const tenantFiscalInutilizeMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/inutilize$/);
  if (tenantFiscalInutilizeMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalInutilizeMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const reason = String(body.reason || "").trim();
    const start = Number(body.start);
    const end = Number(body.end || body.start);
    if (reason.length < 15 || !start || end < start) return sendJson(res, 400, { ok: false, error: "Informe faixa valida e justificativa com pelo menos 15 caracteres." });
    const tenantState = readTenantState(tenantCode);
    try {
      const document = String(tenantState.settings.document || "").replace(/\D/g, "");
      const year = Number(String(body.year || new Date().getFullYear()).slice(-2));
      const model = body.model === "NFC-e" || Number(body.model) === 65 ? 65 : 55;
      let parsed;
      if (tenantState.settings.acbrApiUrl) parsed = (await fiscalAgentExecute(tenantCode, tenantState, { engine: "nfe", steps: [{ method: "inutilizar", args: [document, reason, year, model, Number(body.series || 1), start, end] }] })).parsed;
      else {
        await initializeAcbrLib(configureAcbrForTenant(tenantCode, tenantState));
        parsed = acbrResponseOrThrow(await acbrLibCommand("inutilizar", [document, reason, year, model, Number(body.series || 1), start, end], 60000), "Inutilizar numeracao");
      }
      if (!["102", "256"].includes(parsed.statusCode)) return sendJson(res, 409, { ok: false, error: parsed.statusMessage || "Inutilizacao nao homologada pela SEFAZ.", response: parsed.raw });
      tenantState.fiscalInutilizations = Array.isArray(tenantState.fiscalInutilizations) ? tenantState.fiscalInutilizations : [];
      const responseUrl = saveFiscalResponse(tenantCode, `retorno-inutilizacao-${model}-${start}-${end}.txt`, parsed.raw).url;
      tenantState.fiscalInutilizations.unshift({ ...body, start, end, year, model, protocol: parsed.protocol, statusCode: parsed.statusCode, response: parsed.raw, responseUrl, createdAt: new Date().toISOString() });
      writeTenantState(tenantCode, tenantState);
      appendTenantAudit(tenantCode, "Numeracao fiscal inutilizada", `${model} ${start}-${end}`, access.session.user);
      sendJson(res, 200, { ok: true, inutilization: tenantState.fiscalInutilizations[0] });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const fiscalPreviewMatch=urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/preview$/);
  if(fiscalPreviewMatch && req.method==='POST') {
    const code=normalizeTenantCode(fiscalPreviewMatch[1]),provider=readProvider(),access=sessionAccess(req,provider,code,'fiscal');
    if(access.error)return deny(res,access);
    const body=await readBody(req),row=body.document||{},state=readTenantState(code);
    if(!['NF-e','NFC-e','NFS-e'].includes(row.model))return sendJson(res,400,{ok:false,error:'Modelo fiscal invalido'});
    try {const xml=fiscalXmlFromState(state,row,code);return sendJson(res,200,{ok:true,xml,taxSummary:row.model==='NFS-e'?null:require('./src/server/fiscal-documents').fiscalTaxSummary(state,row),release:require('./src/server/rtc-policy').RTC_RELEASE.version});}
    catch(error){return sendJson(res,422,{ok:false,error:error.message});}
  }

  const creditEventPreview=urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/credit-event\/preview$/);
  if(creditEventPreview&&req.method==='POST'){
    const code=normalizeTenantCode(creditEventPreview[1]),access=sessionAccess(req,readProvider(),code,'fiscal');if(access.error)return deny(res,access);
    const body=await readBody(req),state=readTenantState(code);
    try{const row=await creditEventSource(code,state,body),sequence=1+(row.events||[]).filter(e=>e.type===String(body.type||'211110')).length;
      const result=require('./src/server/rtc-credit-event').build(state.settings,row,{...body,sequence,at:new Date().toISOString()});return sendJson(res,200,{ok:true,...result});
    }catch(e){return sendJson(res,422,{ok:false,error:e.message});}
  }
  const tenantFiscalEventMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/event$/);
  if (tenantFiscalEventMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalEventMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const storedRow = (tenantState.fiscalQueue || []).find((item) => Number(item.id) === Number(body.id));
    let row = storedRow || { key: String(body.key || "").replace(/\D/g, ""), model: "NF-e", events: [] };
    if (!/^\d{44}$/.test(row.key || "") || row.model === "NFS-e") return sendJson(res, 400, { ok: false, error: "Evento disponivel apenas para NF-e/NFC-e com chave valida." });
    const eventTypes = { quitacaoCredito:"112110",aceiteDebito:"211128",aceiteSucessaoIbs:"212110",aceiteSucessaoCbs:"212120",creditoPresumido:"211110", vinculacaoPagamento: "110300", cce: "110110", confirmacao: "210200", ciencia: "210210", desconhecimento: "210220", naoRealizada: "210240" };
    const type = eventTypes[body.type] || String(body.type || "");
    if(['110300','211110','112110','211128','212110','212120'].includes(type)) {
      const eventAccess=sessionAccess(req,provider,tenantCode,'fiscal_transmit');if(eventAccess.error)return deny(res,eventAccess);
      if(type==='110300'&&(!storedRow||storedRow.status!=='Autorizada'||!body.paymentLink))return sendJson(res,400,{ok:false,error:'Informe documento autorizado e dados da transacao vinculada'});
    }
    if (type === "110110" && String(body.text || "").trim().length < 15) return sendJson(res, 400, { ok: false, error: "Informe a correcao com pelo menos 15 caracteres." });
    if (!Object.values(eventTypes).includes(type)) return sendJson(res, 400, { ok: false, error: "Tipo de evento fiscal invalido." });
    try {
      if(['211110','112110','211128','212110','212120'].includes(type))row=await creditEventSource(tenantCode,tenantState,body);
      const sequence = 1 + (row.events || []).filter((event) => event.type === type).length;
      const sent = await sendNfeEvent(tenantCode, tenantState, row, { ...body, at:new Date().toISOString(), type, text: String(body.text || "").trim(), justification: String(body.justification || "").trim(), paymentLink: body.paymentLink, sequence });
      if (!(["211110","112110","211128","212110","212120"].includes(type)?["135"]:["135","136"]).includes(sent.parsed.statusCode)) return sendJson(res, 409, { ok: false, error: sent.parsed.statusMessage || "Evento nao registrado pela SEFAZ.", response: sent.parsed.raw });
      const registeredEvent = { type, sequence, ...(['211110','112110','211128','212110','212120'].includes(type)?{request:{author:body.author,legalBasis:body.legalBasis,credits:body.credits,accepted:body.accepted,paymentProof:body.paymentProof}}:{}), text: body.text || "", protocol: sent.parsed.protocol, statusCode: sent.parsed.statusCode, response: sent.parsed.raw, eventUrl: sent.eventUrl, responseUrl: sent.responseUrl, createdAt: new Date().toISOString() };
      row.events = Array.isArray(row.events) ? row.events : [];
      row.events.push(registeredEvent);
      if(['211110','112110','211128','212110','212120'].includes(type)){const target=storedRow||(tenantState.fiscalImports||[]).find(r=>r.key===row.key);if(target)target.events=row.events;}
      if (!storedRow) {
        tenantState.fiscalManifestations = Array.isArray(tenantState.fiscalManifestations) ? tenantState.fiscalManifestations : [];
        tenantState.fiscalManifestations.unshift({ key: row.key, ...registeredEvent });
      }
      writeTenantState(tenantCode, tenantState);
      appendTenantAudit(tenantCode, "Evento fiscal registrado", `${type} ${row.key}`, access.session.user);
      sendJson(res, 200, { ok: true, document: storedRow || null, event: registeredEvent });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const tenantFiscalDistributionMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/distribution$/);
  if (tenantFiscalDistributionMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalDistributionMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    try {
      const document = String(tenantState.settings.document || "").replace(/\D/g, "");
      const command = body.key ? "distribuirchave" : "distribuirultnsu";
      let parsed;
      if (tenantState.settings.acbrApiUrl) parsed = (await fiscalAgentExecute(tenantCode, tenantState, { engine: "nfe", steps: [{ method: command, args: [ufCode(tenantState.settings.uf), document, body.key || body.lastNsu || "0"] }] })).parsed;
      else {
        await initializeAcbrLib(configureAcbrForTenant(tenantCode, tenantState));
        parsed = acbrResponseOrThrow(await acbrLibCommand(command, [ufCode(tenantState.settings.uf), document, body.key || body.lastNsu || "0"], 60000), "Distribuicao DFe");
      }
      tenantState.fiscalDistributions = Array.isArray(tenantState.fiscalDistributions) ? tenantState.fiscalDistributions : [];
      const responseUrl = saveFiscalResponse(tenantCode, `retorno-distribuicao-dfe-${Date.now()}.txt`, parsed.raw).url;
      tenantState.fiscalDistributions.unshift({ query: body.key || body.lastNsu || "0", response: parsed.raw, responseUrl, statusCode: parsed.statusCode, statusMessage: parsed.statusMessage, createdAt: new Date().toISOString() });
      writeTenantState(tenantCode, tenantState);
      sendJson(res, 200, { ok: true, distribution: tenantState.fiscalDistributions[0] });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const tenantFiscalContingencyMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/contingency$/);
  if (tenantFiscalContingencyMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalContingencyMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const row = (tenantState.fiscalQueue || []).find((item) => Number(item.id) === Number(body.id));
    if (!row || row.model !== "NFC-e") return sendJson(res, 400, { ok: false, error: "Contingencia offline disponivel somente para NFC-e." });
    const reason = String(body.reason || "Indisponibilidade temporaria de comunicacao com a SEFAZ").trim();
    if (reason.length < 15) return sendJson(res, 400, { ok: false, error: "Informe motivo da contingencia com pelo menos 15 caracteres." });
    try {
      row.emissionType = 9;
      row.contingencyAt = new Date().toISOString();
      row.contingencyReason = reason;
      row.xml = fiscalXmlFromState(tenantState, row, tenantCode);
      row.key = row.xml.match(/Id="NFe(\d{44})"/)?.[1] || row.key || "";
      const xmlFile = saveTenantFile({ tenantCode, category: "xml", filename: `NFCe-contingencia-${row.id}.xml`, mimeType: "application/xml", content: Buffer.from(row.xml, "utf8").toString("base64") });
      row.xmlUrl = xmlFile.url;
      if (tenantState.settings.acbrApiUrl) {
        await fiscalAgentExecute(tenantCode, tenantState, {
          engine: "nfe",
          steps: [
            { method: "carregarxml", file: { argIndex: 0, filename: xmlFile.filename, content: row.xml } },
            { method: "assinar" },
            { method: "validar" }
          ]
        });
      } else {
        await loadNfeXml(tenantCode, tenantState, row);
        acbrResponseOrThrow(await acbrLibCommand("assinar"), "Assinar NFC-e em contingencia");
        acbrResponseOrThrow(await acbrLibCommand("validar"), "Validar NFC-e em contingencia");
      }
      row.status = "Contingencia offline - transmitir ao restabelecer";
      writeTenantState(tenantCode, tenantState);
      appendTenantAudit(tenantCode, "NFC-e gerada em contingencia offline", `${row.id}`, access.session.user);
      sendJson(res, 200, { ok: true, document: row });
    } catch (error) {
      sendJson(res, 503, { ok: false, error: error.message });
    }
    return;
  }

  const tenantFiscalManifestMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/manifest$/);
  if (tenantFiscalManifestMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalManifestMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) {
      deny(res, access);
      return;
    }
    sendJson(res, 400, { ok: false, error: "Use /fiscal/event para manifestacao vinculada a documento e /fiscal/distribution para buscar DF-e." });
    return;
  }

  const tenantBackupMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/backup$/);
  if (tenantBackupMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantBackupMatch[1]);
    const provider = readProvider();
    const providerAllowed = providerAccessAllowed(req);
    const access = providerAllowed ? { tenant: findTenant(provider, tenantCode), session: { user: "provedor" } } : sessionAccess(req, provider, tenantCode, "settings");
    if (!access.tenant) access.error = { status: 404, message: "Cliente nao encontrado" };
    if (access.error) {
      deny(res, access);
      return;
    }
    writeProvider(provider);
    sendJson(res, 200, tenantSnapshot(tenantCode));
    return;
  }

  const tenantCompleteBackupMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/backup-complete$/);
  if (tenantCompleteBackupMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantCompleteBackupMatch[1]);
    const provider = readProvider();
    const providerAllowed = providerAccessAllowed(req);
    const access = providerAllowed ? { tenant: findTenant(provider, tenantCode), session: { user: "provedor" } } : sessionAccess(req, provider, tenantCode, "settings");
    if (!access.tenant) access.error = { status: 404, message: "Cliente nao encontrado" };
    if (access.error) {
      deny(res, access);
      return;
    }
    appendTenantAudit(tenantCode, "Backup completo realizado", "Dados e XMLs fiscais incluidos", access.session.user);
    sendJson(res, 200, await completeTenantBackup(tenantCode));
    return;
  }

  const tenantXmlBackupMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/xml-backup$/);
  if (tenantXmlBackupMatch && req.method === "GET") {
    const tenantCode = normalizeTenantCode(tenantXmlBackupMatch[1]);
    const provider = readProvider();
    const providerAllowed = providerAccessAllowed(req);
    const access = providerAllowed ? { tenant: findTenant(provider, tenantCode), session: { user: "provedor" } } : sessionAccess(req, provider, tenantCode, "fiscal");
    if (!access.tenant) access.error = { status: 404, message: "Cliente nao encontrado" };
    if (access.error) {
      deny(res, access);
      return;
    }
    appendTenantAudit(tenantCode, "Backup de XML realizado", "Arquivo fiscal baixado para armazenamento local", access.session.user);
    sendJson(res, 200, await tenantFiscalXmlArchive(tenantCode));
    return;
  }

  const tenantRestoreMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/restore$/);
  if (tenantRestoreMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantRestoreMatch[1]);
    const provider = readProvider();
    const providerAllowed = providerAccessAllowed(req);
    const access = providerAllowed ? { tenant: findTenant(provider, tenantCode), session: { user: "provedor" } } : sessionAccess(req, provider, tenantCode, "restore_backup");
    if (!access.tenant) access.error = { status: 404, message: "Cliente nao encontrado" };
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    let result;
    try {
      result = await restoreTenantBackup(tenantCode, body);
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
      return;
    }
    appendTenantAudit(tenantCode, "Backup restaurado", "Restauracao via API", access.session.user);
    writeProvider(provider);
    sendJson(res, 200, { ok: true, tenantCode, restoredAt: new Date().toISOString(), restoredFiles: result.restoredFiles, safetyBackup: result.safetyBackup });
    return;
  }

  const tenantUserMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/users$/);
  if (tenantUserMatch && req.method === "GET") {
    const tenantCode=normalizeTenantCode(tenantUserMatch[1]),provider=readProvider();
    const access=sessionAccess(req,provider,tenantCode,"manage_users");
    if(access.error)return deny(res,access);
    writeProvider(provider);
    return sendJson(res,200,{ok:true,users:readTenantState(tenantCode).users.map(publicUser),assignablePermissions:access.session.permissions});
  }
  if (tenantUserMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantUserMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "manage_users");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const username = String(body.username || "").trim();
    if (!username || !validNewPassword(body.password)) {
      sendJson(res, 400, { ok: false, error: "Usuario e senha com pelo menos 8 caracteres sao obrigatorios" });
      return;
    }
    if (findUser(tenantState, username)) {
      sendJson(res, 409, { ok: false, error: "Usuario ja cadastrado" });
      return;
    }
    const user = {
      id: Math.max(0, ...tenantState.users.map((item) => Number(item.id) || 0)) + 1,
      name: body.name || username,
      username,
      role: rolePermissions[body.role] ? body.role : "Vendedor",
      permissions: validPermissions(body.permissions, body.role),
      screenPermissions: body.screenPermissions && typeof body.screenPermissions === "object" ? body.screenPermissions : {},
      active: body.active !== false,
      passwordHash: hashPassword(body.password)
    };
    if (user.permissions.some(permission=>!access.session.permissions.includes(permission))) return sendJson(res,403,{ok:false,error:"Nao e permitido conceder poderes que voce nao possui"});
    tenantState.users.push(user);
    writeTenantState(tenantCode, tenantState);
    writeProvider(provider);
    sendJson(res, 201, { ok: true, user: publicUser(user) });
    return;
  }

  const tenantUserUpdateMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/users\/(\d+)$/);
  if (tenantUserUpdateMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantUserUpdateMatch[1]);
    const userId = Number(tenantUserUpdateMatch[2]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "manage_users");
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const user = tenantState.users.find((item) => Number(item.id) === userId);
    if (!user) {
      sendJson(res, 404, { ok: false, error: "Usuario nao encontrado" });
      return;
    }
    if (user.username === access.session.user && body.active === false) {
      sendJson(res, 400, { ok: false, error: "O usuario logado nao pode bloquear a propria conta" });
      return;
    }
    const requestedRights=body.permissions===undefined?validPermissions(user.permissions,user.role):validPermissions(body.permissions,body.role||user.role);
    if (requestedRights.some(permission=>!access.session.permissions.includes(permission))) return sendJson(res,403,{ok:false,error:"Nao e permitido conceder poderes que voce nao possui"});
    if (body.name !== undefined) user.name = String(body.name).trim() || user.name;
    if (body.role !== undefined && rolePermissions[body.role]) user.role = body.role;
    if (body.permissions !== undefined) user.permissions = validPermissions(body.permissions, user.role);
    if (body.screenPermissions !== undefined && typeof body.screenPermissions === "object") user.screenPermissions = body.screenPermissions;
    if (body.active !== undefined) user.active = Boolean(body.active);
    if (!tenantState.users.some(row=>row.active!==false && allPermissions.every(permission=>validPermissions(row.permissions,row.role).includes(permission)))) return sendJson(res,400,{ok:false,error:"Mantenha ao menos um administrador ativo com acesso total na unidade"});
    writeTenantState(tenantCode, tenantState);
    writeProvider(provider);
    appendTenantAudit(tenantCode, "Usuario atualizado", user.username, access.session.user);
    sendJson(res, 200, { ok: true, user: publicUser(user) });
    return;
  }

  const tenantPasswordMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/auth\/password$/);
  if (tenantPasswordMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantPasswordMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode);
    if (access.error) {
      deny(res, access);
      return;
    }
    const body = await readBody(req);
    if (!validNewPassword(body.newPassword)) {
      sendJson(res, 400, { ok: false, error: "A nova senha deve possuir pelo menos 8 caracteres" });
      return;
    }
    const tenantState = readTenantState(tenantCode);
    const user = findUser(tenantState, access.session.user);
    if (!user || !verifyPassword(body.currentPassword, user.passwordHash)) {
      sendJson(res, 403, { ok: false, error: "Senha atual invalida" });
      return;
    }
    user.passwordHash = hashPassword(body.newPassword);
    writeTenantState(tenantCode, tenantState);
    appendTenantAudit(tenantCode, "Senha alterada", "Alteracao realizada pelo proprio usuario", user.username);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/state") {
    const tenantCode = normalizeTenantCode(requestUrl.searchParams.get("tenantCode") || "");
    if (!tenantCode) {
      sendJson(res, 400, { ok: false, error: "Informe tenantCode para ler estado isolado da unidade." });
      return;
    }
    const provider = readProvider();
    const access = tenantAccessOrProvider(req, provider, tenantCode);
    if (access.error) {
      deny(res, access);
      return;
    }
    sendJson(res, 200, readCombinedState(tenantCode));
    return;
  }

  if (req.method === "POST" && urlPath === "/api/state") {
    const body = await readBody(req);
    const tenantCode = normalizeTenantCode(body.tenantCode || body.state?.settings?.tenantCode || "");
    if (!tenantCode) {
      sendJson(res, 400, { ok: false, error: "Informe tenantCode para gravar estado isolado da unidade." });
      return;
    }
    const provider = readProvider();
    const access = tenantAccessOrProvider(req, provider, tenantCode, "settings");
    if (access.error) {
      deny(res, access);
      return;
    }
    try {
      assertTenantPayload(tenantCode, body.state || body);
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
      return;
    }
    writeTenantState(tenantCode, body.state || body);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/tenants") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    sendJson(res, 200, publicProvider(readProvider()).clients);
    return;
  }

  if (req.method === "POST" && urlPath === "/api/tenants") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const body = await readBody(req);
    if (!validNewPassword(body.adminPassword)) {
      sendJson(res, 400, { ok: false, error: "A senha inicial deve possuir pelo menos 8 caracteres" });
      return;
    }
    const provider = readProvider();
    const tenantCode = normalizeTenantCode(body.tenantCode || body.tradeName);
    if (!tenantCode) {
      sendJson(res, 400, { ok: false, error: "Codigo do cliente obrigatorio" });
      return;
    }
    if (provider.clients.some((client) => client.tenantCode === tenantCode)) {
      sendJson(res, 409, { ok: false, error: "Cliente ja cadastrado" });
      return;
    }
    let initialCompanyProfile;
    if(body.companyProfile){try{initialCompanyProfile=companyProfile.validate({...body.companyProfile,tradeName:body.tradeName||body.companyProfile.tradeName,document:body.document||body.companyProfile.document});}catch(error){sendJson(res,422,{ok:false,error:error.message});return;}}
    const renewalDays = Number(body.renewalDays || 30);
    const tenant = withTenantDefaults({
      id: Math.max(0, ...provider.clients.map((client) => Number(client.id) || 0)) + 1,
      tradeName: body.tradeName || "Cliente sem nome",
      document: body.document || "",
      tenantCode,
      plan: body.plan || "Essencial",
      maxTerminals: Number(body.maxTerminals || 1),
      activeTerminals: 0,
      renewalDays,
      licensePassword: body.licensePassword || crypto.randomBytes(24).toString("base64url"),
      licenseExpiresAt: addDays(today(), renewalDays),
      status: body.status || "Ativo",
      modules: body.modules || ["PDV", "Estoque", "Financeiro", "Compras"],
      adminUser: body.adminUser || `admin@${tenantCode}.local`
    });
    provider.clients.push(tenant);
    writeProvider(provider);
    writeTenantState(tenantCode, {
      settings: { ...(initialCompanyProfile||{}), legalName:initialCompanyProfile?.company||"", company: tenant.tradeName, document:tenant.document, tenantCode },
      users: [
        {
          id: 1,
          name: body.adminName || "Administrador",
          username: body.adminUser || `admin@${tenantCode}.local`,
          role: "Administrador",
          active: true,
          passwordHash: hashPassword(body.adminPassword || "123456")
        }
      ]
    });
    appendProviderAudit("Cliente criado", `${tenantCode} - ${tenant.tradeName}`, providerAccess(req).username, requestIp(req));
    sendJson(res, 201, publicTenant(tenant));
    return;
  }

  const providerTenantMatch = urlPath.match(/^\/api\/provider\/tenant\/([^/]+)$/);
  if (providerTenantMatch && req.method === "POST") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const tenantCode = normalizeTenantCode(providerTenantMatch[1]);
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    const allowed = ["tradeName", "document", "plan", "maxTerminals", "renewalDays", "status", "modules", "adminUser"];
    for (const field of allowed) {
      if (body[field] !== undefined) tenant[field] = body[field];
    }
    if (body.status !== undefined && tenant.status !== "Ativo" && tenant.status !== "Homologacao") tenant.activeSessions = [];
    tenant.maxTerminals = Math.max(1, Number(tenant.maxTerminals || 1));
    tenant.renewalDays = Math.max(1, Number(tenant.renewalDays || 30));
    refreshTerminalCount(tenant);
    writeProvider(provider);
    appendProviderAudit("Cliente atualizado", `${tenantCode}: ${Object.keys(body).join(", ")}`, access.username, requestIp(req));
    sendJson(res, 200, { ok: true, tenant: publicProvider({ clients: [tenant] }).clients[0] });
    return;
  }

  const providerTenantSessionsMatch = urlPath.match(/^\/api\/provider\/tenant\/([^/]+)\/sessions$/);
  if (providerTenantSessionsMatch && req.method === "DELETE") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const tenantCode = normalizeTenantCode(providerTenantSessionsMatch[1]);
    const provider = readProvider();
    const tenant = findTenant(provider, tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    tenant.activeSessions = [];
    refreshTerminalCount(tenant);
    writeProvider(provider);
    appendProviderAudit("Terminais liberados", tenantCode, access.username, requestIp(req));
    sendJson(res, 200, { ok: true });
    return;
  }

  const providerTenantUserMatch = urlPath.match(/^\/api\/provider\/tenant\/([^/]+)\/users$/);
  if (providerTenantUserMatch && req.method === "GET") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const tenantCode = normalizeTenantCode(providerTenantUserMatch[1]);
    if (!findTenant(readProvider(), tenantCode)) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    sendJson(res, 200, { ok: true, users: readTenantState(tenantCode).users.map(publicUser) });
    return;
  }

  if (providerTenantUserMatch && req.method === "POST") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Token do provedor invalido" });
      return;
    }
    const tenantCode = normalizeTenantCode(providerTenantUserMatch[1]);
    const provider = readProvider();
    if (!findTenant(provider, tenantCode)) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    const body = await readBody(req);
    const username = String(body.username || body.user || "").trim();
    if (!username || !validNewPassword(body.password)) {
      sendJson(res, 400, { ok: false, error: "Usuario e senha com pelo menos 8 caracteres sao obrigatorios" });
      return;
    }
    const tenantState = readTenantState(tenantCode);
    if (findUser(tenantState, username)) {
      sendJson(res, 409, { ok: false, error: "Usuario ja cadastrado" });
      return;
    }
    const user = {
      id: Math.max(0, ...tenantState.users.map((item) => Number(item.id) || 0)) + 1,
      name: body.name || username,
      username,
      role: body.role || "Vendedor",
      permissions: validPermissions(body.permissions, body.role),
      screenPermissions: body.screenPermissions && typeof body.screenPermissions === "object" ? body.screenPermissions : {},
      active: true,
      passwordHash: hashPassword(body.password)
    };
    tenantState.users.push(user);
    writeTenantState(tenantCode, tenantState);
    appendTenantAudit(tenantCode, "Usuario criado pela Central Tortela", username, "rede");
    appendProviderAudit("Usuario de cliente criado", `${tenantCode}: ${username}`, providerAccess(req).username, requestIp(req));
    sendJson(res, 201, { ok: true, user: publicUser(user) });
    return;
  }

  const providerTenantUserUpdateMatch = urlPath.match(/^\/api\/provider\/tenant\/([^/]+)\/users\/(\d+)$/);
  if (providerTenantUserUpdateMatch && req.method === "POST") {
    const access = providerAccess(req);
    if (!access) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const tenantCode = normalizeTenantCode(providerTenantUserUpdateMatch[1]);
    const userId = Number(providerTenantUserUpdateMatch[2]);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const user = tenantState.users.find((item) => Number(item.id) === userId);
    if (!user) {
      sendJson(res, 404, { ok: false, error: "Usuario nao encontrado" });
      return;
    }
    if (body.password !== undefined && !validNewPassword(body.password)) {
      sendJson(res, 400, { ok: false, error: "A nova senha deve possuir pelo menos 8 caracteres" });
      return;
    }
    if (body.name !== undefined) user.name = String(body.name).trim() || user.name;
    if (body.role !== undefined && rolePermissions[body.role]) user.role = body.role;
    if (body.permissions !== undefined) user.permissions = validPermissions(body.permissions, user.role);
    if (body.screenPermissions !== undefined && typeof body.screenPermissions === "object") user.screenPermissions = body.screenPermissions;
    if (body.active !== undefined) user.active = Boolean(body.active);
    if (body.password !== undefined) user.passwordHash = hashPassword(body.password);
    if (!tenantState.users.some(row=>row.active!==false && allPermissions.every(permission=>validPermissions(row.permissions,row.role).includes(permission)))) return sendJson(res,400,{ok:false,error:"Mantenha ao menos um administrador ativo com acesso total na unidade"});
    writeTenantState(tenantCode, tenantState);
    appendTenantAudit(tenantCode, "Usuario atualizado pela Central Tortela", user.username, access.username);
    appendProviderAudit("Usuario de cliente atualizado", `${tenantCode}: ${user.username}`, access.username, requestIp(req));
    sendJson(res, 200, { ok: true, user: publicUser(user) });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/licenses/counter") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    const days = Number(body.days || tenant.renewalDays || 30);
    const challenge = String(body.challenge || licenseChallenge(tenant, body.user)).toUpperCase();
    tenant.renewalDays = days;
    writeProvider(provider);
    appendProviderAudit("Contra-senha gerada", `${tenant.tenantCode}: ${days} dias`, providerAccess(req).username, requestIp(req));
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, challenge, days, counterPassword: counterPassword(tenant, challenge, days) });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/licenses/status") {
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    refreshTerminalCount(tenant);
    const session = (tenant.activeSessions || []).find((item) => item.sessionId === body.sessionId || item.sessionId === bearerToken(req));
    if (!session) {
      sendJson(res, 401, { ok: false, error: "Sessao expirada" });
      return;
    }
    session.lastSeenAt = new Date().toISOString();
    refreshTerminalCount(tenant);
    writeProvider(provider);
    sendJson(res, 200, {
      ok: true,
      tenant: publicTenant(tenant),
      expired: new Date(tenant.licenseExpiresAt || today()).getTime() < new Date(today()).getTime(),
      challenge: licenseChallenge(tenant, session.user || body.user || "Operador")
    });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/licenses/release") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    const days = Math.max(1, Number(body.days || tenant.renewalDays || 30));
    tenant.renewalDays = days;
    tenant.licenseExpiresAt = addDays(today(), days);
    if (body.status) tenant.status = body.status;
    writeProvider(provider);
    appendProviderAudit("Licenca liberada pela Central", `${tenant.tenantCode}: ${days} dias`, providerAccess(req).username, requestIp(req));
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, licenseExpiresAt: tenant.licenseExpiresAt, days });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/licenses/expire") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    tenant.licenseExpiresAt = addDays(today(), -1);
    writeProvider(provider);
    appendProviderAudit("Licenca expirada", tenant.tenantCode, providerAccess(req).username, requestIp(req));
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, challenge: licenseChallenge(tenant, body.user) });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/licenses/redeem") {
    const body = await readBody(req);
    const provider = readProvider();
    const tenant = findTenant(provider, body.tenantCode);
    if (!tenant) {
      sendJson(res, 404, { ok: false, error: "Cliente nao encontrado" });
      return;
    }
    const challenge = String(body.challenge || licenseChallenge(tenant, body.user)).toUpperCase();
    const days = Number(body.days || tenant.renewalDays || 30);
    const expected = counterPassword(tenant, challenge, days);
    if (String(body.counterPassword || "").trim().toUpperCase() !== expected) {
      sendJson(res, 403, { ok: false, error: "Contra-senha invalida" });
      return;
    }
    tenant.licenseExpiresAt = addDays(today(), days);
    tenant.renewalDays = days;
    writeProvider(provider);
    sendJson(res, 200, { ok: true, tenantCode: tenant.tenantCode, licenseExpiresAt: tenant.licenseExpiresAt });
    return;
  }

  sendJson(res, 404, { ok: false, error: "API nao encontrada" });
}

function serveFile(req, res, urlPath) {
  if (urlPath.startsWith("/storage/")) {
    serveStorageFile(req, res, urlPath);
    return;
  }
  if (urlPath === "/central-saas.html") {
    send(res, 404, "Esta edicao utiliza a Central Tortela.");
    return;
  }
  if (urlPath === "/central-lojista.html") {
    send(res, 200, fs.readFileSync(path.join(root, "central-lojista.html")), types[".html"]);
    return;
  }
  if (urlPath === "/api-cadastro" || urlPath === "/api-cadastro/") {
    send(res, 200, fs.readFileSync(path.join(root, "api-cadastro", "index.html")), types[".html"]);
    return;
  }
  if (urlPath === "/cozinha" || urlPath === "/cozinha/") {
    send(res, 200, fs.readFileSync(path.join(root, "cozinha.html")), types[".html"]);
    return;
  }
  const defaultPage = appSurface === "network" ? "/central-rede.html" : appSurface === "central" ? "/central-saas.html" : "/index.html";
  const safePath = path.normalize(urlPath === "/" ? defaultPage : urlPath).replace(/^(\.\.[/\\])+/, "");
  const file = path.join(root, safePath);

  if (!pathInside(root, file) && path.resolve(file) !== path.resolve(root)) {
    send(res, 403, "Acesso negado");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      if (path.extname(safePath)) {
        send(res, 404, "Arquivo nao encontrado");
        return;
      }
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) send(res, 404, "Arquivo nao encontrado");
        else send(res, 200, fallback, types[".html"]);
      });
      return;
    }
    send(res, 200, data, types[path.extname(file)] || "application/octet-stream");
  });
}

function publicStorageCategory(category) {
  return ["produtos", "publico"].includes(normalizePathSegment(category));
}

function serveStorageFile(req, res, urlPath) {
  const parts = urlPath.split("/").filter(Boolean);
  const tenantCode = normalizeTenantCode(parts[1] || "");
  const category = normalizePathSegment(parts[2] || "");
  const filename = path.basename(parts.slice(3).join("-"));
  if (!tenantCode || !category || !filename) {
    send(res, 400, "Arquivo invalido");
    return;
  }
  const categoryDir = path.join(storageDir, tenantCode, category);
  const file = path.join(categoryDir, filename);
  if (!pathInside(categoryDir, file)) {
    send(res, 403, "Acesso negado");
    return;
  }
  if (!publicStorageCategory(category)) {
    const provider = readProvider();
    const access = tenantAccessOrProvider(req, provider, tenantCode);
    if (access.error) {
      sendJson(res, access.error.status, { ok: false, error: access.error.message });
      return;
    }
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      if (!postgresStore) {
        send(res, 404, "Arquivo nao encontrado");
        return;
      }
      postgresStore.readFile(tenantCode, category, filename)
        .then((stored) => {
          if (!stored) send(res, 404, "Arquivo nao encontrado");
          else send(res, 200, stored.content, stored.mime_type || "application/octet-stream");
        })
        .catch(() => send(res, 404, "Arquivo nao encontrado"));
      return;
    }
    send(res, 200, data, types[path.extname(file).toLowerCase()] || "application/octet-stream");
  });
}

let server;

async function startServer() {
  await initializePersistence();
  setInterval(async () => {
    try {
      await coordinateState(async () => {
      if (appSurface === "central" || appSurface === "network" || appSurface === "all") {
        await completeProviderBackup("automatico-programado-central-saas");
      } else {
        const provider = readProvider();
        provider.clients.forEach((tenant) => createScheduledTenantBackup(tenant.tenantCode, readTenantState(tenant.tenantCode)));
      }
      });
    } catch (error) {
      console.error(`[Backup geral] ${error.message}`);
    }
  }, backupIntervalMs).unref();
  setInterval(() => {
    coordinateState(async () => {
    const provider = readProvider();
    provider.clients.forEach(refreshTerminalCount);
    for (const [id, session] of providerSessions) if (Date.now() - session.lastSeenAt > sessionTtlMs) providerSessions.delete(id);
    writeProvider(provider);
    }).catch((error) => console.error(`[Sessoes] ${error.message}`));
  }, 60000).unref();
  server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    // Health is read-only and must not wait behind tenant writes or reload every tenant.
    if (req.method === "GET" && urlPath === "/api/health") {
      handleApi(req,res,urlPath).catch(error=>sendJson(res,500,{ok:false,error:error.message}));
      return;
    }
    if (urlPath.startsWith("/api/")) {
      coordinateState(() => {
        if (req.aborted || res.destroyed) return;
        return handleApi(req, res, urlPath);
      }).catch((error) => {
        sendJson(res, 500, { ok: false, error: error.message });
      });
      return;
    }
    serveFile(req, res, urlPath);
  });
  server.listen(port, () => {
    console.log(`Tortela Plus unidade: http://localhost:${port}`);
    console.log(`Central Tortela: http://localhost:${port}/central-rede.html`);
    console.log(`Central do Franqueado: http://localhost:${port}/central-lojista.html`);
    console.log(`Persistencia: ${databaseMode}`);
  });
}

async function shutdownServer() {
  for (const engine of Object.values(acbrEngines)) {
    if (engine.process && !engine.process.killed) {
      engine.process.stdin.write(`${JSON.stringify({ id: "shutdown", method: "shutdown", args: [] })}\n`);
    }
  }
  if (postgresStore) await postgresStore.close().catch(() => {});
  if (server) server.close(() => process.exit(0));
  else process.exit(0);
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on("SIGINT", shutdownServer);
process.on("SIGTERM", shutdownServer);

startServer().catch((error) => {
  console.error(`Falha ao iniciar Tortela Plus: ${error.message}`);
  process.exitCode = 1;
});

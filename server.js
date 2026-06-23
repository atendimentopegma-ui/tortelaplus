const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const net = require("net");
const { spawn } = require("child_process");
const { PostgresStore } = require("./src/server/postgres-store");
const {
  generateFiscalXml,
  generateNfseIni,
  validateNfeState,
  parseAcbrResponse,
  importNfeXml
} = require("./src/server/fiscal-documents");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const dataDir = process.env.PEGMA_DB_DIR ? path.resolve(process.env.PEGMA_DB_DIR) : path.join(root, "data");
const tenantsDir = path.join(dataDir, "tenants");
const storageDir = path.join(dataDir, "storage");
const backupsDir = path.join(dataDir, "backups");
const legacyStateFile = path.join(dataDir, "app-state.json");
const providerFile = path.join(dataDir, "provider-state.json");
const providerAdminToken = process.env.PEGMA_PROVIDER_TOKEN || "";
const fiscalSecretKey = process.env.PEGMA_SECRET_KEY || "";
const databaseMode = process.env.DATABASE_URL ? "postgresql-schema-per-tenant" : "local-json-contingency";
const appSurface = String(process.env.PEGMA_SURFACE || "all").toLowerCase();
const acbrHost = process.env.PEGMA_ACBR_HOST || "";
const acbrPort = Number(process.env.PEGMA_ACBR_PORT || 3436);
const fiscalRuntimeDir = path.join(root, "runtime", "fiscal");
const acbrLibDll = path.join(fiscalRuntimeDir, "ACBrLib", "ACBrNFe64.dll");
const acbrNfseDll = path.join(fiscalRuntimeDir, "ACBrLib", "ACBrNFSe64.dll");
const acbrLibIni = path.join(fiscalRuntimeDir, "ACBrLib", "ACBrLib.ini");
const acbrLibBridgeExe = path.join(fiscalRuntimeDir, "Bridge", "ProdutoFiscal.AcbrLibBridge.exe");
let acbrLibSequence = 0;
const acbrEngines = {
  nfe: { dll: acbrLibDll, process: null, buffer: "", initialized: false, currentConfig: "", pending: new Map() },
  nfse: { dll: acbrNfseDll, process: null, buffer: "", initialized: false, currentConfig: "", pending: new Map() }
};
const providerSessions = new Map();
const loginAttempts = new Map();
const tenantCache = new Map();
let providerCache = null;
let postgresStore = null;
const sessionTtlMs = Number(process.env.PEGMA_SESSION_TTL_MINUTES || 480) * 60000;
const backupIntervalMs = Math.max(15, Number(process.env.PEGMA_BACKUP_INTERVAL_MINUTES || 360)) * 60000;
const backupRetentionDays = Math.max(7, Number(process.env.PEGMA_BACKUP_RETENTION_DAYS || 30));

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
  providerAdmins: [
    {
      id: 1,
      name: "Administrador da Central",
      username: process.env.PEGMA_CENTRAL_USER || "admin",
      active: true,
      passwordHash: hashPassword(process.env.PEGMA_CENTRAL_PASSWORD || "Pegma@2026")
    }
  ],
  auditLogs: [],
  clients: [
    {
      id: 1,
      tradeName: "Cliente Exemplo",
      document: "00.000.000/0001-00",
      tenantCode: "cliente-exemplo",
      plan: "Essencial",
      maxTerminals: 2,
      activeTerminals: 1,
      renewalDays: 30,
      licensePassword: "PEGMA-2026",
      licenseExpiresAt: "2026-07-05",
      status: "Ativo",
      adminUser: "admin@cliente.com"
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
    { id: 2, type: "Fornecedor", name: "Fornecedor Exemplo", document: "00.000.000/0001-00", city: "Sao Paulo", uf: "SP", cep: "01001000", address: "Praca da Se", active: true }
  ],
  products: [
    {
      id: 5014,
      description: "Pao frances",
      barcode: "7890000000011",
      type: "Produto fabricado",
      unit: "UN",
      cost: 0.38,
      price: 0.85,
      stock: 18,
      minStock: 40,
      ncm: "19059090",
      cfop: "5102",
      cst: "102",
      cbsClass: "000001",
      ibsClass: "000001",
      photo: "",
      isBundle: true,
      composition: [
        { productId: 9001, qty: 0.06 },
        { productId: 9002, qty: 0.01 }
      ],
      active: true
    },
    {
      id: 9001,
      description: "Farinha de trigo 1kg",
      barcode: "7890000000097",
      type: "Materia-prima",
      unit: "KG",
      cost: 4.6,
      price: 0,
      stock: 8,
      minStock: 25,
      ncm: "11010010",
      cfop: "1102",
      cst: "102",
      cbsClass: "000001",
      ibsClass: "000001",
      photo: "",
      isBundle: false,
      composition: [],
      active: true
    },
    {
      id: 9002,
      description: "Oleo vegetal 900ml",
      barcode: "7890000000098",
      type: "Materia-prima",
      unit: "UN",
      cost: 7.9,
      price: 0,
      stock: 5,
      minStock: 12,
      ncm: "15121911",
      cfop: "1102",
      cst: "102",
      cbsClass: "000001",
      ibsClass: "000001",
      photo: "",
      isBundle: false,
      composition: [],
      active: true
    }
  ],
  receivables: [],
  chartOfAccounts: [
    { id: 1, code: "1.1.01", name: "Caixa", type: "Ativo", active: true },
    { id: 2, code: "1.1.02", name: "Banco", type: "Ativo", active: true },
    { id: 3, code: "3.1.01", name: "Receita de vendas", type: "Receita", active: true },
    { id: 4, code: "4.1.01", name: "Compras e fornecedores", type: "Despesa", active: true }
  ],
  payables: [{ id: 1, supplier: "Fornecedor Exemplo", due: "2026-06-10", value: 640, paid: false, history: "Compra inicial" }],
  cash: [{ id: 1, date: "2026-06-05", account: "CAIXA", history: "Saldo inicial", in: 45296, out: 0 }],
  cashRegister: { open: true, openedAt: "2026-06-05T10:49:00.000Z", openedBy: "Operador", initialAmount: 45296, terminal: "SERIE 1" },
  heldSales: [],
  automaticOrders: [],
  networkPromotions: [],
  franchisePayments: [],
  fiscalQueue: [{ id: 1, model: "NFC-e", status: "Pendente", customer: "Consumidor Final", total: 0, key: "", protocol: "" }],
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
    { id: 1, name: "Venda interna - Simples Nacional", regime: "Simples Nacional", uf: "SP", municipio: "", model: "NFC-e", operation: "Venda de mercadoria", cfop: "5102", cst: "102", csosn: "102", ncm: "19059090", cest: "", origin: "0", pisCofinsCst: "49", pisRate: 0, cofinsRate: 0, icmsRate: 0, fcpRate: 0, mvaRate: 0, ibsClass: "000001", cbsClass: "000001", ibsRate: 0, cbsRate: 0, selectiveTaxRate: 0, serviceCode: "", cityServiceCode: "", taxBenefitCode: "", reductionReason: "", validFrom: "2026-01-01", validTo: "", active: true },
    { id: 2, name: "Venda interna - Lucro Presumido", regime: "Lucro Presumido", uf: "SP", municipio: "", model: "NF-e", operation: "Venda de mercadoria", cfop: "5102", cst: "00", csosn: "", ncm: "19059090", cest: "", origin: "0", pisCofinsCst: "01", pisRate: 0.65, cofinsRate: 3, icmsRate: 18, fcpRate: 0, mvaRate: 0, ibsClass: "000001", cbsClass: "000001", ibsRate: 0, cbsRate: 0, selectiveTaxRate: 0, serviceCode: "", cityServiceCode: "", taxBenefitCode: "", reductionReason: "", validFrom: "2026-01-01", validTo: "", active: true },
    { id: 3, name: "Servico municipal", regime: "Simples Nacional", uf: "SP", municipio: "SUZANO", model: "NFS-e", operation: "Prestacao de servico", cfop: "5933", cst: "00", csosn: "102", ncm: "", cest: "", origin: "0", pisCofinsCst: "49", pisRate: 0, cofinsRate: 0, icmsRate: 0, issRate: 0, fcpRate: 0, mvaRate: 0, ibsClass: "000001", cbsClass: "000001", ibsRate: 0, cbsRate: 0, selectiveTaxRate: 0, serviceCode: "14.01", cityServiceCode: "", taxBenefitCode: "", reductionReason: "", validFrom: "2026-01-01", validTo: "", active: true }
  ],
  settings: {
    company: "Tortela",
    document: "00.000.000/0001-00",
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
    fiscalResponsible: ""
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
  const storedProvider = await postgresStore.readProvider();
  providerCache = storedProvider || readJson(providerFile, initialProvider);
  const configuredAdmin = configuredProviderAdmin();
  if (configuredAdmin) {
    providerCache.providerAdmins = [
      configuredAdmin,
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

function writeTenantState(tenantCode, state) {
  const code = normalizeTenantCode(tenantCode);
  const current = readTenantState(code);
  const stripped = stripProvider(state);
  const normalized = withTenantStateDefaults({
    ...current,
    ...stripped,
    users: stripped.users || current.users || initialTenantState.users
  }, code);
  normalized._meta = {
    ...(current._meta || {}),
    ...(normalized._meta || {}),
    revision: Number(current._meta?.revision || 0) + 1,
    updatedAt: new Date().toISOString()
  };
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

function auditHash(previousHash, date, user, action, detail) {
  return crypto.createHash("sha256").update([previousHash, date, user, action, detail].join("|")).digest("hex");
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
  const merged = {
    ...structuredClone(initialTenantState),
    ...(state || {}),
    users: normalizeUsers(state?.users || initialTenantState.users),
    settings: {
      ...initialTenantState.settings,
      ...(state?.settings || {}),
      tenantCode: normalizeTenantCode(tenantCode || state?.settings?.tenantCode || initialTenantState.settings.tenantCode)
    },
    cashRegister: { ...structuredClone(initialTenantState.cashRegister), ...(state?.cashRegister || {}) },
    heldSales: state?.heldSales || [],
    automaticOrders: state?.automaticOrders || [],
    networkPromotions: state?.networkPromotions || [],
    franchisePayments: state?.franchisePayments || []
  };
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
    passwordHash: admin.passwordHash || hashPassword(admin.password || "Pegma@2026")
  }));
}

function configuredProviderAdmin() {
  const username = String(process.env.PEGMA_CENTRAL_USER || "").trim();
  const password = String(process.env.PEGMA_CENTRAL_PASSWORD || "");
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
  const collections = ["sales", "purchases", "payables", "receivables", "cash", "fiscalQueue", "automaticOrders", "networkPromotions", "franchisePayments"];
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
  const filePath = path.join(tenantStorageDir(tenantCode, category), finalName);
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
  if (fiscalSecretKey.length < 32) throw new Error("Configure PEGMA_SECRET_KEY com pelo menos 32 caracteres no provedor.");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", crypto.createHash("sha256").update(fiscalSecretKey).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(secrets), "utf8"), cipher.final()]);
  const payload = {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64")
  };
  fs.writeFileSync(path.join(tenantStorageDir(tenantCode, "secrets"), "fiscal-vault.json"), JSON.stringify(payload));
}

function loadFiscalSecrets(tenantCode) {
  const vaultPath = path.join(tenantStorageDir(tenantCode, "secrets"), "fiscal-vault.json");
  if (!fs.existsSync(vaultPath)) return {};
  if (fiscalSecretKey.length < 32) throw new Error("Configure PEGMA_SECRET_KEY com pelo menos 32 caracteres no provedor.");
  const payload = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
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
  ini = replaceIniValue(ini, "DFe", "ArquivoPFX", settings.certificateName || "");
  ini = replaceIniValue(ini, "DFe", "Senha", secrets.certificatePassword || "");
  ini = replaceIniValue(ini, "NFe", "Ambiente", settings.fiscalEnvironment === "Producao" ? "1" : "2");
  ini = replaceIniValue(ini, "NFe", "IdCSC", settings.cscId || "");
  ini = replaceIniValue(ini, "NFe", "CSC", secrets.csc || "");
  ini = replaceIniValue(ini, "NFe", "PathSalvar", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathNFe", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathInu", tenantXml);
  ini = replaceIniValue(ini, "NFe", "PathEvento", tenantXml);
  ini = replaceIniValue(ini, "DANFE", "PathPDF", tenantPdf);
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
  ini = replaceIniValue(ini, "DFe", "ArquivoPFX", settings.certificateName || "");
  ini = replaceIniValue(ini, "DFe", "Senha", secrets.certificatePassword || "");
  ini = replaceIniValue(ini, "NFSe", "Ambiente", settings.fiscalEnvironment === "Producao" ? "1" : "2");
  ini = replaceIniValue(ini, "NFSe", "CodigoMunicipio", settings.nfseCityCode || settings.cityCode || "");
  ini = replaceIniValue(ini, "NFSe", "Provedor", settings.nfseProvider || "");
  ini = replaceIniValue(ini, "NFSe", "PathSalvar", tenantXml);
  ini = replaceIniValue(ini, "NFSe", "PathSchemas", path.join(fiscalRuntimeDir, "Schemas"));
  ini = replaceIniValue(ini, "DANFSE", "PathPDF", tenantPdf);
  const configPath = path.join(tenantRuntime, "ACBrNFSeLib.ini");
  fs.writeFileSync(configPath, ini);
  return configPath;
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Access-Control-Allow-Origin": "*",
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
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 12_000_000) {
        reject(new Error("Payload muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function findTenant(provider, tenantCode) {
  return provider.clients.find((client) => client.tenantCode === normalizeTenantCode(tenantCode));
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
    permissions: validPermissions(user.permissions, user.role)
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
  const { providerAdmins, ...safe } = provider;
  return {
    ...safe,
    clients: (safe.clients || []).map(({ licensePassword, ...client }) => client)
  };
}

function publicTenant(tenant) {
  const { licensePassword, ...safe } = tenant;
  return safe;
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
  const sessionId = bearerToken(req);
  const session = (tenant.activeSessions || []).find((item) => item.sessionId === sessionId);
  if (!session) return { error: { status: 401, message: "Sessao invalida ou expirada" } };
  const permissions = validPermissions(session.permissions, session.role);
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

async function restoreTenantBackup(tenantCode, backup) {
  const code = normalizeTenantCode(tenantCode);
  const restored = backup.state || backup;
  if (restored.settings?.tenantCode && normalizeTenantCode(restored.settings.tenantCode) !== code) {
    throw new Error("Backup pertence a outro cliente");
  }
  createDailyTenantBackup(code, readTenantState(code));
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
  return { restoredFiles };
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
    item.uf === tenantState.settings.uf &&
    (!item.validFrom || item.validFrom <= todayText) &&
    (!item.validTo || item.validTo >= todayText) &&
    (!nature || !item.operation || String(nature).toLowerCase().includes(String(item.operation).toLowerCase().slice(0, 8)))
  ) || rules.find((item) =>
    item.active !== false &&
    item.model === model &&
    item.regime === tenantState.settings.regime &&
    item.uf === tenantState.settings.uf
  ) || {};
}

function validateFiscalDocumentFromState(tenantState, row) {
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
    if (!rule.ncm) missing.push("NCM");
    if (settings.regime === "Simples Nacional" && !rule.csosn) missing.push("CSOSN");
    if (settings.regime !== "Simples Nacional" && !rule.cst) missing.push("CST");
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
  if (engine.initialized && engine.process && !engine.process.killed && engine.currentConfig === configPath) {
    return { code: 0, response: `ACBrLib ${engineName} isolada ja inicializada.` };
  }
  if (engine.process && !engine.process.killed && engine.currentConfig !== configPath) {
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
    body: JSON.stringify({ tenantCode, ...payload }),
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

async function sendNfeEvent(tenantCode, tenantState, row, event) {
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
      body: JSON.stringify({ tenantCode, environment: tenantState.settings.fiscalEnvironment, document: fiscalRow }),
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

async function handleApi(req, res, urlPath) {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }

  if (req.method === "GET" && urlPath === "/api/health") {
    const database = postgresStore ? await postgresStore.health().catch((error) => ({ error: error.message })) : null;
    sendJson(res, 200, { ok: true, product: "Tortela Plus", mode: "rede-franquias", databaseMode, dataDir, isolation: postgresStore ? "postgresql-schema-per-tenant" : "tenant-files", database });
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
  if (req.method === "POST" && publicCustomerMatch) {
    const tenant = findTenant(readProvider(), decodeURIComponent(publicCustomerMatch[1]));
    if (!tenant || !["Ativo", "Homologacao"].includes(tenant.status)) {
      sendJson(res, 404, { ok: false, error: "Unidade nao encontrada ou indisponivel." });
      return;
    }
    const body = await readBody(req);
    const document = String(body.document || "").replace(/\D/g, "");
    const phone = String(body.phone || "").replace(/\D/g, "");
    const cep = String(body.cep || "").replace(/\D/g, "");
    const name = String(body.name || "").trim();
    const uf = String(body.uf || "").trim().toUpperCase();
    if (!name || document.length !== 11 || phone.length < 10 || cep.length !== 8 || !body.address || !body.number || !body.district || !body.city || uf.length !== 2 || body.consent !== true) {
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
      source: "Cadastro online Tortela",
      registeredAt: new Date().toISOString(),
      active: true
    };
    tenantState.people.push(customer);
    writeTenantState(tenant.tenantCode, tenantState);
    appendTenantAudit(tenant.tenantCode, "Cliente cadastrado online", `${customer.name} - CPF ${document}`, "cadastro-publico");
    sendJson(res, 201, { ok: true, message: `Cadastro concluido na unidade ${tenant.tradeName}.`, customerId: customer.id });
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
    const finance = [];
    const permissions = [];
    const productionCapacity = [];
    const saleDate = (sale) => {
      const raw = sale.createdAt || sale.finishedAt || sale.date || currentDay;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? new Date(`${currentDay}T00:00:00`) : parsed;
    };
    const withinDays = (date, days) => (now.getTime() - date.getTime()) / 86400000 <= days;
    const activePromotion = (promotion) => Number(promotion?.price || 0) > 0
      && (!promotion?.from || currentDay >= promotion.from)
      && (!promotion?.to || currentDay <= promotion.to)
      && promotion?.status !== "Cancelada";
    for (const tenant of provider.clients || []) {
      const tenantState = readTenantState(tenant.tenantCode);
      const sales = (tenantState.sales || []).filter((sale) => !["Cancelado", "Cancelada", "Devolvido"].includes(sale.status));
      const fiscalRows = tenantState.fiscalQueue || [];
      const customers = (tenantState.people || []).filter((person) => person.type === "Cliente" && person.name !== "Consumidor Final" && person.active !== false);
      const products = (tenantState.products || []).filter((product) => product.active !== false);
      const lowStock = products.filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0));
      const salesTotal = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
      const fiscalAuthorized = fiscalRows.filter((row) => row.status === "Autorizada").length;
      const fiscalPending = fiscalRows.filter((row) => !["Autorizada", "Cancelada"].includes(row.status)).length;
      const payables = (tenantState.payables || []).filter((row) => !row.paid && !row.cancelled);
      const receivables = (tenantState.receivables || []).filter((row) => !row.paid && !row.cancelled);
      const payableOpen = payables.reduce((sum, row) => sum + Number(row.balance ?? row.value ?? 0), 0);
      const receivableOpen = receivables.reduce((sum, row) => sum + Number(row.balance ?? row.value ?? 0), 0);
      const purchasesTotal = (tenantState.purchases || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
      const orders = tenantState.automaticOrders || [];
      const tenantPromotions = (tenantState.networkPromotions || []).filter(activePromotion);
      const franchisePayments = tenantState.franchisePayments || [];
      const franchiseOpen = franchisePayments.filter((row) => !row.paid && !row.cancelled).reduce((sum, row) => sum + Number(row.value || 0), 0);
      const franchisePaid = franchisePayments.filter((row) => row.paid).reduce((sum, row) => sum + Number(row.value || 0), 0);
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
      totals.productionProducts += products.filter((product) => Array.isArray(product.composition) && product.composition.length).length;
      units.push({
        tenantCode: tenant.tenantCode,
        tradeName: tenant.tradeName,
        status: tenant.status,
        maxTerminals: tenant.maxTerminals,
        activeTerminals: (tenant.activeSessions || []).length,
        salesTotal,
        salesCount: sales.length,
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
        if (withinDays(moment, 1 / 24)) periods.hour += Number(sale.total || 0);
        if ((sale.date || "").slice(0, 10) === currentDay) periods.day += Number(sale.total || 0);
        if (withinDays(moment, 7)) periods.week += Number(sale.total || 0);
        if (withinDays(moment, 15)) periods.fortnight += Number(sale.total || 0);
        if (withinDays(moment, 31)) periods.month += Number(sale.total || 0);
        salesDetails.push({
          unit: tenant.tradeName,
          tenantCode: tenant.tenantCode,
          date: sale.date || sale.createdAt || "",
          customer: sale.customer || "Consumidor Final",
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
      tenantPromotions.forEach((promotion) => promotions.push({ product: promotion.product || "Campanha geral", unit: tenant.tradeName, value: Number(promotion.price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), from: promotion.from, to: promotion.to, scope: promotion.scope || "Unidade" }));
      products.filter((product) => activePromotion(product.promotion)).forEach((product) => promotions.push({ product: product.description, unit: tenant.tradeName, value: Number(product.promotion.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), from: product.promotion.from, to: product.promotion.to, scope: "Produto" }));
      finance.push({ unit: tenant.tradeName, tenantCode: tenant.tenantCode, payableOpen, receivableOpen, purchasesTotal, franchiseOpen, franchisePaid });
      permissions.push({ unit: tenant.tradeName, tenantCode: tenant.tenantCode, status: tenant.status, modules: tenant.modules || [], maxTerminals: tenant.maxTerminals, activeTerminals: (tenant.activeSessions || []).length });
      products.filter((product) => Array.isArray(product.composition) && product.composition.length).forEach((product) => {
        const components = product.composition.map((component) => {
          const rawMaterial = products.find((row) => Number(row.id) === Number(component.productId));
          const required = Number(component.qty || 0);
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
    sendJson(res, 200, {
      ok: true,
      generatedAt: new Date().toISOString(),
      totals,
      periods,
      units,
      bestSellers: ranking.slice(0, 10),
      worstSellers: [...ranking].sort((a, b) => a.value - b.value).slice(0, 10),
      salesDetails: salesDetails.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 80),
      lowStockItems: lowStockItems.slice(0, 80),
      automaticOrders: automaticOrders.sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date))).slice(0, 80),
      promotions: promotions.slice(0, 80),
      finance,
      permissions,
      productionCapacity: productionCapacity.slice(0, 80)
    });
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
    providerSessions.set(sessionId, { username: admin.username, name: admin.name, role: "Administrador", ipAddress, createdAt: Date.now(), lastSeenAt: Date.now() });
    appendProviderAudit("Login na Central Tortela", "Sessao administrativa iniciada", admin.username, ipAddress);
    sendJson(res, 200, { ok: true, sessionId, user: { name: admin.name, username: admin.username, role: "Administrador" } });
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
        licensePassword: existing?.licensePassword || client.licensePassword || "PEGMA-2026"
      };
    });
    writeProvider({ ...incoming, clients, providerAdmins: current.providerAdmins, auditLogs: current.auditLogs });
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
      !(session.user === user.username && session.ipAddress === ipAddress)
    );
    refreshTerminalCount(tenant);
    if (tenant.activeSessions.length >= Number(tenant.maxTerminals || 1)) {
      sendJson(res, 403, { ok: false, error: "Limite de terminais atingido" });
      return;
    }
    const sessionId = newSessionId(tenant.tenantCode, body.user || "Operador");
    tenant.activeSessions.push({
      sessionId,
      user: user.username,
      role: user.role,
      permissions: validPermissions(user.permissions, user.role),
      terminalName,
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
    sendJson(res, 200, { state: publicTenantState(readTenantState(tenantCode)), provider });
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
    writeTenantState(tenantCode, body.state || body);
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

  const tenantFiscalCancelMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/cancel$/);
  if (tenantFiscalCancelMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalCancelMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal_cancel");
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
    if (row.protocol || row.status === "Autorizada") {
      const reason = String(body.reason || "").trim();
      if (reason.length < 15) {
        sendJson(res, 400, { ok: false, error: "Informe justificativa real de cancelamento com pelo menos 15 caracteres." });
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
        row.cancelStatusCode = parsed.statusCode;
        row.cancelStatusMessage = parsed.statusMessage;
        row.cancelProtocol = parsed.protocol;
        row.cancelAcbrResponse = parsed.raw;
        row.cancelResponseUrl = saveFiscalResponse(tenantCode, `retorno-cancelamento-${row.model}-${row.id}.txt`, parsed.raw).url;
        if (!isNfse && !["135", "136", "155"].includes(parsed.statusCode)) {
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

  const tenantFiscalEventMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/fiscal\/event$/);
  if (tenantFiscalEventMatch && req.method === "POST") {
    const tenantCode = normalizeTenantCode(tenantFiscalEventMatch[1]);
    const provider = readProvider();
    const access = sessionAccess(req, provider, tenantCode, "fiscal");
    if (access.error) return deny(res, access);
    const body = await readBody(req);
    const tenantState = readTenantState(tenantCode);
    const storedRow = (tenantState.fiscalQueue || []).find((item) => Number(item.id) === Number(body.id));
    const row = storedRow || { key: String(body.key || "").replace(/\D/g, ""), model: "NF-e", events: [] };
    if (!/^\d{44}$/.test(row.key || "") || row.model === "NFS-e") return sendJson(res, 400, { ok: false, error: "Evento disponivel apenas para NF-e/NFC-e com chave valida." });
    const eventTypes = { cce: "110110", confirmacao: "210200", ciencia: "210210", desconhecimento: "210220", naoRealizada: "210240" };
    const type = eventTypes[body.type] || String(body.type || "");
    if (type === "110110" && String(body.text || "").trim().length < 15) return sendJson(res, 400, { ok: false, error: "Informe a correcao com pelo menos 15 caracteres." });
    if (!Object.values(eventTypes).includes(type)) return sendJson(res, 400, { ok: false, error: "Tipo de evento fiscal invalido." });
    try {
      const sequence = 1 + (row.events || []).filter((event) => event.type === type).length;
      const sent = await sendNfeEvent(tenantCode, tenantState, row, { type, text: String(body.text || "").trim(), justification: String(body.justification || "").trim(), sequence });
      if (!["135", "136"].includes(sent.parsed.statusCode)) return sendJson(res, 409, { ok: false, error: sent.parsed.statusMessage || "Evento nao registrado pela SEFAZ.", response: sent.parsed.raw });
      const registeredEvent = { type, sequence, text: body.text || "", protocol: sent.parsed.protocol, statusCode: sent.parsed.statusCode, response: sent.parsed.raw, eventUrl: sent.eventUrl, responseUrl: sent.responseUrl, createdAt: new Date().toISOString() };
      row.events = Array.isArray(row.events) ? row.events : [];
      row.events.push(registeredEvent);
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
    sendJson(res, 200, { ok: true, tenantCode, restoredAt: new Date().toISOString(), restoredFiles: result.restoredFiles });
    return;
  }

  const tenantUserMatch = urlPath.match(/^\/api\/tenant\/([^/]+)\/users$/);
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
      active: body.active !== false,
      passwordHash: hashPassword(body.password)
    };
    tenantState.users.push(user);
    writeTenantState(tenantCode, tenantState);
    writeProvider(provider);
    sendJson(res, 201, { ok: true, user: publicUser(user) });
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
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    sendJson(res, 200, readCombinedState());
    return;
  }

  if (req.method === "POST" && urlPath === "/api/state") {
    if (!providerAccessAllowed(req)) {
      sendJson(res, 401, { ok: false, error: "Sessao administrativa obrigatoria" });
      return;
    }
    writeCombinedState(await readBody(req));
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
      settings: { company: tenant.tradeName, tenantCode },
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
    if (body.active !== undefined) user.active = Boolean(body.active);
    if (body.password !== undefined) user.passwordHash = hashPassword(body.password);
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
    serveStorageFile(res, urlPath);
    return;
  }
  if (urlPath === "/central-saas.html") {
    send(res, 404, "Esta edicao utiliza a Central Tortela.");
    return;
  }
  const defaultPage = appSurface === "network" ? "/central-rede.html" : appSurface === "central" ? "/central-saas.html" : "/index.html";
  const safePath = path.normalize(urlPath === "/" ? defaultPage : urlPath).replace(/^(\.\.[/\\])+/, "");
  const file = path.join(root, safePath);

  if (!file.startsWith(root)) {
    send(res, 403, "Acesso negado");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) send(res, 404, "Arquivo nao encontrado");
        else send(res, 200, fallback, types[".html"]);
      });
      return;
    }
    send(res, 200, data, types[path.extname(file)] || "application/octet-stream");
  });
}

function serveStorageFile(res, urlPath) {
  const parts = urlPath.split("/").filter(Boolean);
  const tenantCode = normalizeTenantCode(parts[1] || "");
  const category = normalizePathSegment(parts[2] || "");
  const filename = path.basename(parts.slice(3).join("-"));
  const file = path.join(storageDir, tenantCode, category, filename);
  if (!file.startsWith(path.join(storageDir, tenantCode, category))) {
    send(res, 403, "Acesso negado");
    return;
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
      if (appSurface === "central" || appSurface === "network" || appSurface === "all") {
        await completeProviderBackup("automatico-programado-central-saas");
      } else {
        const provider = readProvider();
        provider.clients.forEach((tenant) => createScheduledTenantBackup(tenant.tenantCode, readTenantState(tenant.tenantCode)));
      }
    } catch (error) {
      console.error(`[Backup geral] ${error.message}`);
    }
  }, backupIntervalMs).unref();
  setInterval(() => {
    const provider = readProvider();
    provider.clients.forEach(refreshTerminalCount);
    for (const [id, session] of providerSessions) if (Date.now() - session.lastSeenAt > sessionTtlMs) providerSessions.delete(id);
    writeProvider(provider);
  }, 60000).unref();
  server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.startsWith("/api/")) {
      handleApi(req, res, urlPath).catch((error) => {
        sendJson(res, 500, { ok: false, error: error.message });
      });
      return;
    }
    serveFile(req, res, urlPath);
  });
  server.listen(port, () => {
    console.log(`Tortela Plus unidade: http://localhost:${port}`);
    console.log(`Central Tortela: http://localhost:${port}/central-rede.html`);
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

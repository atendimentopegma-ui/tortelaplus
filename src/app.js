const seed = {
  people: [
    {
      id: 1,
      type: "Cliente",
      name: "Consumidor Final",
      document: "",
      city: "Padrao",
      uf: "SP",
      cep: "",
      address: "",
      active: true
    },
    {
      id: 2,
      type: "Fornecedor",
      name: "Fornecedor Exemplo",
      document: "00.000.000/0001-00",
      city: "Sao Paulo",
      uf: "SP",
      cep: "01001000",
      address: "Praca da Se",
      active: true
    }
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
  payables: [
    {
      id: 1,
      supplier: "Fornecedor Exemplo",
      due: "2026-06-10",
      value: 640,
      paid: false,
      history: "Compra inicial"
    }
  ],
  cash: [
    { id: 1, date: "2026-06-05", account: "CAIXA", history: "Saldo inicial", in: 45296, out: 0 }
  ],
  cashRegister: {
    open: true,
    openedAt: "2026-06-05T10:49:00.000Z",
    openedBy: "Operador",
    initialAmount: 45296,
    terminal: "SERIE 1"
  },
  cashClosures: [],
  heldSales: [],
  automaticOrders: [],
  networkPromotions: [],
  franchisePayments: [],
  fiscalQueue: [
    {
      id: 1,
      model: "NFC-e",
      status: "Pendente",
      customer: "Consumidor Final",
      total: 0,
      key: "",
      protocol: ""
    }
  ],
  sales: [],
  purchases: [],
  stockMovements: [],
  auditLogs: [],
  fiscalRules: [
    {
      id: 1,
      name: "Venda interna - Simples Nacional",
      regime: "Simples Nacional",
      uf: "SP",
      municipio: "",
      model: "NFC-e",
      operation: "Venda de mercadoria",
      cfop: "5102",
      cst: "102",
      csosn: "102",
      ncm: "19059090",
      cest: "",
      origin: "0",
      pisCofinsCst: "49",
      pisRate: 0,
      cofinsRate: 0,
      icmsRate: 0,
      issRate: 0,
      fcpRate: 0,
      mvaRate: 0,
      ibsClass: "000001",
      cbsClass: "000001",
      ibsRate: 0,
      cbsRate: 0,
      selectiveTaxRate: 0,
      serviceCode: "",
      cityServiceCode: "",
      taxBenefitCode: "",
      reductionReason: "",
      validFrom: "2026-01-01",
      validTo: "",
      active: true
    },
    {
      id: 2,
      name: "Venda interna - Lucro Presumido",
      regime: "Lucro Presumido",
      uf: "SP",
      municipio: "",
      model: "NF-e",
      operation: "Venda de mercadoria",
      cfop: "5102",
      cst: "00",
      csosn: "",
      ncm: "19059090",
      cest: "",
      origin: "0",
      pisCofinsCst: "01",
      pisRate: 0.65,
      cofinsRate: 3,
      icmsRate: 18,
      issRate: 0,
      fcpRate: 0,
      mvaRate: 0,
      ibsClass: "000001",
      cbsClass: "000001",
      ibsRate: 0,
      cbsRate: 0,
      selectiveTaxRate: 0,
      serviceCode: "",
      cityServiceCode: "",
      taxBenefitCode: "",
      reductionReason: "",
      validFrom: "2026-01-01",
      validTo: "",
      active: true
    },
    {
      id: 3,
      name: "Servico municipal",
      regime: "Simples Nacional",
      uf: "SP",
      municipio: "SUZANO",
      model: "NFS-e",
      operation: "Prestacao de servico",
      cfop: "5933",
      cst: "00",
      csosn: "102",
      ncm: "",
      cest: "",
      origin: "0",
      pisCofinsCst: "49",
      pisRate: 0,
      cofinsRate: 0,
      icmsRate: 0,
      issRate: 0,
      fcpRate: 0,
      mvaRate: 0,
      ibsClass: "000001",
      cbsClass: "000001",
      ibsRate: 0,
      cbsRate: 0,
      selectiveTaxRate: 0,
      serviceCode: "14.01",
      cityServiceCode: "",
      taxBenefitCode: "",
      reductionReason: "",
      validFrom: "2026-01-01",
      validTo: "",
      active: true
    }
  ],
  provider: {
    ownerName: "Central Tortela",
    deployment: "Rede de franquias",
    isolationMode: "Banco separado por cliente",
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
  },
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
    fiscalResponsible: "",
    pdvBaudRate: 9600,
    printerCharsPerLine: 48,
    alertWebhookUrl: "",
    whatsappWebhookUrl: "",
    emailWebhookUrl: "",
    pixApiUrl: "",
    boletoApiUrl: "",
    paymentProvider: "",
    paymentAuthHeader: "Authorization",
    paymentAuthScheme: "Bearer",
    paymentCallbackUrl: ""
  }
};

let state = load();
let apiOnline = false;
let currentMode = "backoffice";
let currentModule = "dashboard";
let currentTab = "dados";
let reportPeriod = { from: `${today().slice(0, 7)}-01`, to: today() };
let saleItems = [];
let orderItems = [];
let lastPdvSaleId = 0;
let purchaseItems = [];
let pendingProductPhoto = "";
let pendingComposition = [];
let pendingProductDraft = {};
let pendingPersonDraft = {};
let editingPersonId = 0;
let editingProductId = 0;
let personSearch = "";
let productSearch = "";
let sessionId = sessionStorage.getItem("tortelaplus-session-id") || "";
let heartbeatTimer = 0;
let authUser = JSON.parse(sessionStorage.getItem("tortelaplus-auth-user") || "null");
let pdvPeripheralPort = null;
let pdvPeripheralReader = null;
let pendingExchangeCredit = 0;
let authorizedDiscountValue = 0;

const rolePermissions = {
  Administrador: ["dashboard", "people", "products", "stock", "purchases", "sales", "finance", "fiscal", "reports", "settings", "pdv", "stock_adjust", "purchase_cancel", "sales_cancel", "finance_settle", "fiscal_transmit", "fiscal_cancel", "restore_backup", "manage_users"],
  Gerente: ["dashboard", "people", "products", "stock", "purchases", "sales", "finance", "fiscal", "reports", "pdv", "stock_adjust", "purchase_cancel", "sales_cancel", "finance_settle", "fiscal_transmit", "fiscal_cancel"],
  Caixa: ["dashboard", "sales", "pdv", "fiscal_transmit"],
  Fiscal: ["dashboard", "people", "products", "sales", "fiscal", "reports", "fiscal_transmit", "fiscal_cancel"],
  Financeiro: ["dashboard", "people", "sales", "finance", "reports", "finance_settle"],
  Estoque: ["dashboard", "products", "stock", "purchases", "reports", "stock_adjust"],
  Vendedor: ["dashboard", "people", "products", "sales", "pdv"]
};
const permissionLabels = {
  dashboard: "Painel", people: "Pessoas", products: "Produtos", stock: "Estoque",
  purchases: "Compras", sales: "Vendas", finance: "Financeiro", fiscal: "Fiscal",
  reports: "Relatorios", settings: "Configuracoes", pdv: "PDV",
  stock_adjust: "Ajustar estoque", purchase_cancel: "Cancelar compra",
  sales_cancel: "Cancelar venda", finance_settle: "Baixar financeiro",
  fiscal_transmit: "Transmitir documento fiscal", fiscal_cancel: "Cancelar documento fiscal",
  restore_backup: "Restaurar backup", manage_users: "Gerenciar usuarios"
};

function permissionLabel(permission) {
  return permissionLabels[permission] || permission;
}
let syncChain = Promise.resolve();

function load() {
  const stored = localStorage.getItem("tortelaplus-state-v1");
  if (stored) {
    const parsed = JSON.parse(stored);
    return withDefaults(parsed);
  }
  localStorage.setItem("tortelaplus-state-v1", JSON.stringify(seed));
  return structuredClone(seed);
}

function withDefaults(data) {
  const merged = {
    ...structuredClone(seed),
    ...data,
    provider: {
      ...structuredClone(seed.provider),
      ...(data.provider || {}),
      clients: (data.provider?.clients || seed.provider.clients).map(withTenantDefaults)
    },
    settings: {
      ...seed.settings,
      ...(data.settings || {})
    }
  };
  merged.auditLogs = data.auditLogs || [];
  merged.fiscalRules = data.fiscalRules || seed.fiscalRules;
  merged.products = (data.products || seed.products).map((product) => ({
    composition: [],
    stock: 0,
    minStock: 0,
    ...product,
    composition: (product.composition || []).map((component) => ({
      ...component,
      mode: component.mode || (product.type === "Produto fabricado" ? "production" : "sale")
    }))
  }));
  merged.stockMovements = data.stockMovements || [];
  merged.productions = data.productions || [];
  merged.stockLots = data.stockLots || [];
  merged.stockSerials = data.stockSerials || [];
  merged.stockInventories = data.stockInventories || [];
  merged.stockTransfers = data.stockTransfers || [];
  merged.warehouseStocks = data.warehouseStocks || [];
  merged.financeReconciliations = data.financeReconciliations || [];
  merged.bankTransactions = data.bankTransactions || [];
  merged.alertOutbox = data.alertOutbox || [];
  merged.fiscalRulePackages = data.fiscalRulePackages || [];
  merged.chartOfAccounts = data.chartOfAccounts || seed.chartOfAccounts;
  merged.fiscalQueue = (data.fiscalQueue || seed.fiscalQueue || []).map((row) => ({
    attempts: 0,
    nextAttemptAt: "",
    lastFiscalError: "",
    ...row
  }));
  merged.cashRegister = { ...structuredClone(seed.cashRegister), ...(data.cashRegister || {}) };
  merged.cashClosures = data.cashClosures || [];
  merged.heldSales = data.heldSales || [];
  merged.automaticOrders = data.automaticOrders || [];
  merged.networkPromotions = data.networkPromotions || [];
  merged.franchisePayments = data.franchisePayments || [];
  merged.purchases = (data.purchases || []).map((row) => ({ status: "Confirmada", ...row }));
  merged.sales = (data.sales || []).map((row) => ({ status: "Fechado", ...row }));
  merged.payables = (data.payables || []).map(withFinanceDefaults);
  merged.receivables = (data.receivables || []).map(withFinanceDefaults);
  return merged;
}

function withFinanceDefaults(row) {
  const paidValue = Number(row.paidValue ?? (row.paid ? row.value : 0));
  return {
    discount: 0,
    interest: 0,
    paidValue,
    balance: Math.max(0, Number(row.value || 0) + Number(row.interest || 0) - Number(row.discount || 0) - paidValue),
    ...row,
    paidValue
  };
}

function withTenantDefaults(client) {
  return {
    renewalDays: 30,
    licensePassword: "PEGMA-2026",
    licenseExpiresAt: "2026-07-05",
    activeTerminals: 0,
    status: "Ativo",
    ...client
  };
}

function save() {
  localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
  localStorage.setItem("tortelaplus-pending-sync", "1");
  if (apiOnline) {
    const tenantCode = normalizeTenantCode(state.settings.tenantCode || "cliente-exemplo");
    const permission = currentMode === "pdv" ? "pdv" : currentModule;
    syncChain = syncChain.then(async () => {
      const localPending = structuredClone(state);
      try {
        const { provider, users, ...tenantState } = state;
        const result = await api(`/api/tenant/${tenantCode}/state`, {
          method: "POST",
          headers: { "X-Pegma-Permission": permission },
          body: JSON.stringify({ state: tenantState, baseRevision: Number(tenantState._meta?.revision || 0) })
        });
        state._meta = { ...(state._meta || {}), revision: result.revision, updatedAt: new Date().toISOString() };
        localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
        localStorage.removeItem("tortelaplus-pending-sync");
      } catch (error) {
        if (error.status === 409 && error.payload?.state) {
          const remote = error.payload.state;
          state = withDefaults({ ...mergeConcurrentState(remote, localPending), provider: state.provider });
          localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
          localStorage.setItem("tortelaplus-pending-sync", "1");
          alert("Alteracoes de outro terminal foram conciliadas. A sincronizacao sera repetida sem perder o trabalho local.");
          renderShell();
          setTimeout(save, 0);
          return;
        }
        apiOnline = false;
      }
    });
  }
}

function mergeConcurrentState(remote, local) {
  const merged = { ...remote, settings: { ...(remote.settings || {}), ...(local.settings || {}) } };
  const collections = ["people", "products", "stockMovements", "productionOrders", "purchases", "sales", "payables", "receivables", "cash", "cashClosures", "heldSales", "automaticOrders", "networkPromotions", "franchisePayments", "fiscalQueue", "fiscalRules", "users", "auditLogs", "financeReconciliations", "chartOfAccounts"];
  collections.forEach((name) => {
    const byKey = new Map();
    [...(remote[name] || []), ...(local[name] || [])].forEach((row, index) => {
      const key = row.id ?? row.key ?? `${name}-${index}`;
      byKey.set(String(key), { ...(byKey.get(String(key)) || {}), ...row });
    });
    merged[name] = [...byKey.values()];
  });
  merged._meta = remote._meta;
  return merged;
}

function audit(action, detail) {
  state.auditLogs = state.auditLogs || [];
  state.auditLogs.unshift({
    id: nextId(state.auditLogs),
    date: new Date().toISOString(),
    user: state.settings.user,
    action,
    detail
  });
  state.auditLogs = state.auditLogs.slice(0, 200);
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (sessionId && !headers.Authorization) headers.Authorization = `Bearer ${sessionId}`;
  const response = await fetch(path, {
    ...options,
    headers
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `API ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function boot() {
  try {
    const remote = await api("/api/provider");
    state = withDefaults({ ...state, provider: remote.provider });
    apiOnline = true;
  } catch {
    apiOnline = false;
  }
  renderLogin();
  if (apiOnline && sessionId) setTimeout(processPendingFiscalQueue, 1500);
}

async function loadTenantState(tenantCode) {
  if (!apiOnline) return;
  const remote = await api(`/api/tenant/${tenantCode}/state`);
  state = withDefaults({
    ...(remote.state || {}),
    provider: remote.provider,
    settings: {
      ...(remote.state?.settings || {}),
      user: state.settings.user,
      company: state.settings.company,
      tenantCode
    }
  });
      localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
}

async function startSession(tenantCode, user, password) {
  if (!apiOnline) return;
  const result = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      tenantCode,
      user,
      password,
      terminalName: navigator.userAgent.slice(0, 80)
    })
  });
  sessionId = result.sessionId;
  authUser = result.user;
  sessionStorage.setItem("tortelaplus-session-id", sessionId);
  sessionStorage.setItem("tortelaplus-auth-user", JSON.stringify(authUser));
  state.provider = result.provider;
}

function endSession() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = 0;
  }
  if (!apiOnline || !sessionId) {
    sessionStorage.removeItem("tortelaplus-session-id");
    sessionStorage.removeItem("tortelaplus-auth-user");
    sessionId = "";
    authUser = null;
    return;
  }
  const payload = JSON.stringify({
    tenantCode: state.settings.tenantCode,
    sessionId
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/auth/logout", new Blob([payload], { type: "application/json" }));
  } else {
    api("/api/auth/logout", { method: "POST", body: payload }).catch(() => undefined);
  }
  sessionStorage.removeItem("tortelaplus-session-id");
  sessionStorage.removeItem("tortelaplus-auth-user");
  sessionId = "";
  authUser = null;
}

function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (!apiOnline || !sessionId) return;
  heartbeatTimer = setInterval(() => {
    api("/api/auth/ping", {
      method: "POST",
      body: JSON.stringify({
        tenantCode: state.settings.tenantCode,
        sessionId
      })
    }).catch(() => {
      apiOnline = false;
      clearInterval(heartbeatTimer);
      heartbeatTimer = 0;
    });
  }, 60000);
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(value) {
  return `${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function num(id) {
  return Number(byId(id)?.value || 0);
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateText, days) {
  const date = dateText ? new Date(`${dateText}T00:00:00`) : new Date();
  date.setDate(date.getDate() + Number(days ?? 30));
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateText) {
  const target = new Date(`${dateText}T23:59:59`);
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function effectiveProductPrice(product, qty = 1) {
  const promotion = product?.promotion || {};
  const active = promotion.price > 0
    && (!promotion.from || today() >= promotion.from)
    && (!promotion.to || today() <= promotion.to)
    && Number(qty || 0) >= Number(promotion.minQty || 0);
  return active ? Number(promotion.price) : Number(product?.price || 0);
}

function getCurrentTenant() {
  return state.provider.clients.find((client) => client.tenantCode === state.settings.tenantCode) || state.provider.clients[0];
}

function simpleHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
}

function licenseChallenge(tenant) {
  const base = `${tenant.tenantCode}|${tenant.document}|${tenant.licenseExpiresAt}|${state.settings.user}`;
  return `S-${simpleHash(base)}`;
}

function counterPassword(tenant, challenge, days = tenant.renewalDays) {
  const raw = `${tenant.tenantCode}|${tenant.licensePassword}|${challenge}|${days}`;
  const code = simpleHash(raw);
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

function licenseStatus(tenant = getCurrentTenant()) {
  const remaining = daysUntil(tenant?.licenseExpiresAt || today());
  return {
    remaining,
    expired: remaining < 0,
    warning: remaining <= 7 && remaining >= 0
  };
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function byId(id) {
  return document.getElementById(id);
}

function canAccess(module) {
  const permissions = authUser?.permissions || rolePermissions[authUser?.role] || rolePermissions.Administrador;
  if (!permissions.includes(module)) return false;
  const tenant = getCurrentTenant();
  const contracted = tenant?.modules || ["PDV", "NF-e", "NFC-e", "NFS-e", "Estoque", "Financeiro", "Relatorios", "Compras"];
  const moduleMap = {
    pdv: "PDV",
    stock: "Estoque",
    purchases: "Compras",
    finance: "Financeiro",
    fiscal: ["NF-e", "NFC-e", "NFS-e"],
    reports: "Relatorios"
  };
  const required = moduleMap[module];
  if (!required) return true;
  if (Array.isArray(required)) return required.some((item) => contracted.includes(item));
  return contracted.includes(required);
}

function canDo(permission) {
  const permissions = authUser?.permissions || rolePermissions[authUser?.role] || rolePermissions.Administrador;
  return permissions.includes(permission);
}

function requirePermission(permission, message = "Seu usuario nao possui permissao para esta operacao.") {
  if (canDo(permission)) return true;
  alert(message);
  return false;
}

function visibleModules() {
  return [
    ["dashboard", "Painel", "IN"],
    ["people", "Pessoas", "PE"],
    ["products", "Produtos", "PR"],
    ["stock", "Estoque e producao", "ES"],
    ["purchases", "Compras", "CO"],
    ["sales", "Vendas e orcamentos", "VE"],
    ["finance", "Financeiro", "FI"],
    ["fiscal", "Fiscal", "NF"],
    ["reports", "Relatorios", "RE"],
    ["settings", "Configuracoes", "CF"]
  ].filter(([key]) => canAccess(key));
}

function ensureAllowedModule() {
  if (currentMode === "pdv" && !canAccess("pdv")) currentMode = "backoffice";
  if (!canAccess(currentModule)) {
    currentModule = visibleModules()[0]?.[0] || "dashboard";
  }
}

function app(html) {
  byId("app").innerHTML = html;
}

function icon(text) {
  return `<span class="badge">${text}</span>`;
}

function brandMarkup() {
  return `<div class="brand-mark logo tortela-logo"><img src="./assets/tortela/logo-tortela.gif?v=1" alt="Tortela" onerror="this.parentElement.classList.remove('logo'); this.remove(); this.parentElement.textContent='T';" /></div>`;
}

function renderLogin() {
  app(`
    <main class="login-shell">
      <section class="login-card">
        <div class="login-brand">
          <div>
            ${brandMarkup()}
            <h1>Gestao simples para operacao completa</h1>
            <p>Operacao da unidade Tortela.</p>
          </div>
          <div class="status-row">
            <span class="badge ok">Offline pronto</span>
            <span class="badge warn">Fiscal parametrizavel</span>
          </div>
        </div>
        <form class="login-panel" id="login-form">
          <div>
            <h2>Entrar no sistema</h2>
            <p class="muted">Acesse sua unidade Tortela.</p>
          </div>
          <div class="field">
            <label for="login-user">Usuario</label>
            <input id="login-user" value="${state.settings.user}" autocomplete="username" />
          </div>
          <div class="field">
            <label for="login-company">Empresa</label>
            <input id="login-company" value="${state.settings.company}" />
          </div>
          <div class="field">
            <label for="login-tenant">Codigo do cliente</label>
            <input id="login-tenant" value="${state.settings.tenantCode}" />
          </div>
          <div class="field">
            <label for="login-pass">Senha</label>
            <input id="login-pass" type="password" value="123456" autocomplete="current-password" />
          </div>
          <button class="btn primary" type="submit">Entrar</button>
          <p class="helper">Ambiente seguro da unidade Tortela.</p>
        </form>
      </section>
    </main>
  `);

  byId("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.settings.user = byId("login-user").value || "Operador";
    state.settings.company = byId("login-company").value || "Minha Empresa";
    state.settings.tenantCode = normalizeTenantCode(byId("login-tenant").value || state.settings.tenantCode);
    if (apiOnline) {
      try {
        await startSession(state.settings.tenantCode, state.settings.user, byId("login-pass").value);
        await loadTenantState(state.settings.tenantCode);
      } catch {
        alert("Nao foi possivel entrar. Confira unidade, usuario, senha, status na Central Tortela e limite de terminais.");
        return;
      }
    }
    save();
    if (licenseStatus().expired) {
      renderLicenseGate();
      return;
    }
    startHeartbeat();
    renderShell();
  });
}

function renderLicenseGate() {
  const tenant = getCurrentTenant();
  const challenge = licenseChallenge(tenant);
  app(`
    <main class="login-shell">
      <section class="login-card">
        <div class="login-brand">
          <div>
            ${brandMarkup()}
            <h1>Licenca vencida</h1>
            <p>Informe a senha exibida abaixo ao administrador. A Central Tortela gera a contra-senha para liberar o sistema pelo prazo configurado.</p>
          </div>
          <div class="status-row">
            <span class="badge danger">Bloqueado</span>
            <span class="badge warn">${tenant.tradeName}</span>
          </div>
        </div>
        <form class="login-panel" id="license-form">
          <div>
            <h2>Contra-senha</h2>
            <p class="muted">Senha do sistema para enviar ao provedor:</p>
            <h2>${challenge}</h2>
          </div>
          <div class="field">
            <label for="counter-password">Digite a contra-senha</label>
            <input id="counter-password" placeholder="AAA-0000" autocomplete="off" />
          </div>
          <button class="btn primary" type="submit">Liberar sistema</button>
          <button class="btn ghost" type="button" id="back-login">Voltar ao login</button>
        </form>
      </section>
    </main>
  `);

  byId("license-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const expected = counterPassword(tenant, challenge, tenant.renewalDays);
    const typed = byId("counter-password").value.trim().toUpperCase();
    if (apiOnline) {
      try {
        const result = await api("/api/licenses/redeem", {
          method: "POST",
          body: JSON.stringify({
            tenantCode: tenant.tenantCode,
            challenge,
            counterPassword: typed,
            days: tenant.renewalDays,
            user: state.settings.user
          })
        });
        tenant.licenseExpiresAt = result.licenseExpiresAt;
        save();
        startHeartbeat();
        renderShell();
        return;
      } catch {
        alert("Contra-senha invalida ou API indisponivel. Confira o codigo gerado na Central Tortela.");
        return;
      }
    }
    if (typed !== expected) {
      alert("Contra-senha invalida. Confira o codigo gerado na Central Tortela.");
      return;
    }
    tenant.licenseExpiresAt = addDays(today(), tenant.renewalDays);
    save();
    startHeartbeat();
    renderShell();
  });

  byId("back-login").addEventListener("click", renderLogin);
}

function renderShell() {
  ensureAllowedModule();
  const tenant = getCurrentTenant();
  const license = licenseStatus(tenant);
  const modules = visibleModules();

  app(`
    <main class="app-shell ${currentMode === "pdv" ? "pdv-shell" : ""}">
      <header class="topbar">
        <div class="top-left">
          ${brandMarkup()}
          <div>
            <div class="company">${state.settings.company}</div>
            <small>${state.settings.user} | ${authUser?.role || "Perfil"} | ${state.settings.regime} | ${state.settings.uf}</small>
          </div>
        </div>
        <div class="top-right">
          <span class="badge ${apiOnline ? "ok" : "warn"}">${apiOnline ? "API online" : "modo local"}</span>
          <span class="badge ${navigator.onLine ? "ok" : "danger"}">${navigator.onLine ? "Internet ON" : "Offline"}</span>
          <span class="badge warn">Ambiente fiscal: ${state.settings.fiscalEnvironment}</span>
          <span class="badge ${license.expired ? "danger" : license.warning ? "warn" : "ok"}">Licenca: ${license.expired ? "vencida" : `${license.remaining} dias`}</span>
          ${canAccess("settings") ? `<button class="btn ghost" id="header-backup">Backup</button>` : ""}
          ${canAccess("fiscal") ? `<button class="btn ghost" id="header-xml-backup">Backup XMLs</button>` : ""}
          <button class="btn ghost" id="logout">Sair</button>
        </div>
      </header>
      <nav class="mode-switch">
        <button class="${currentMode === "backoffice" ? "active" : ""}" data-mode="backoffice">Retaguarda</button>
        ${canAccess("pdv") ? `<button class="${currentMode === "pdv" ? "active" : ""}" data-mode="pdv">PDV</button>` : ""}
      </nav>
      <section class="content">
        ${currentMode === "pdv" ? renderPdv() : `
          <div class="layout">
            <aside class="sidebar">
              ${modules.map(([key, label, short]) => `<button class="nav-btn ${currentModule === key ? "active" : ""}" data-module="${key}">${icon(short)} ${label}</button>`).join("")}
            </aside>
            <section>${renderModule()}</section>
          </div>
        `}
      </section>
    </main>
  `);

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      currentMode = button.dataset.mode;
      renderShell();
    });
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      currentModule = button.dataset.module;
      currentTab = "dados";
      renderShell();
    });
  });

  byId("logout").addEventListener("click", () => {
    endSession();
    renderLogin();
  });
  const headerBackup = byId("header-backup");
  if (headerBackup) headerBackup.addEventListener("click", downloadCompleteTenantBackup);
  const headerXmlBackup = byId("header-xml-backup");
  if (headerXmlBackup) headerXmlBackup.addEventListener("click", downloadTenantXmlBackup);
  const automaticOrderButton = byId("send-automatic-order");
  if (automaticOrderButton) automaticOrderButton.addEventListener("click", sendAutomaticOrderToCentral);
  bindCurrentModule();
}

function renderModule() {
  const map = {
    dashboard: renderDashboard,
    people: renderPeople,
    products: renderProducts,
    stock: renderStock,
    purchases: renderPurchases,
    sales: renderSales,
    finance: renderFinance,
    fiscal: renderFiscal,
    reports: renderReports,
    settings: renderSettings
  };
  return map[currentModule]();
}

function renderDashboard() {
  const lowStock = state.products.filter((product) => product.stock <= product.minStock);
  const payables = state.payables.filter((item) => !item.paid && !item.cancelled).reduce((sum, item) => sum + financeBalance(item), 0);
  const receivables = state.receivables.filter((item) => !item.paid && !item.cancelled).reduce((sum, item) => sum + financeBalance(item), 0);
  const sales = state.sales.reduce((sum, sale) => sum + sale.total, 0);
  const overduePayables = state.payables.filter((item) => !item.paid && !item.cancelled && item.due < today());
  const overdueReceivables = state.receivables.filter((item) => !item.paid && !item.cancelled && item.due < today());
  const expiringLots = (state.stockLots || []).filter((lot) => Number(lot.qty || 0) > 0 && lot.expiry && daysUntil(lot.expiry) <= 30);
  const pendingFiscal = state.fiscalQueue.filter((row) => !["Autorizada", "Cancelada"].includes(row.status));

  return `
    <div class="grid">
      <section class="panel">
        <div class="panel-head">
          <h2>Painel da retaguarda</h2>
          <button class="btn primary" id="open-pdv">Abrir PDV</button>
        </div>
        <div class="panel-body grid four">
          <div class="kpi"><small>Faturamento</small><strong>${money(sales)}</strong></div>
          <div class="kpi"><small>A receber</small><strong>${money(receivables)}</strong></div>
          <div class="kpi"><small>A pagar</small><strong>${money(payables)}</strong></div>
          <div class="kpi"><small>Itens abaixo do minimo</small><strong>${lowStock.length}</strong></div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head">
          <h3>Compra sugerida ao abrir retaguarda</h3>
          <button class="btn primary" id="send-automatic-order" ${lowStock.length ? "" : "disabled"}>Pedido automatico para Central</button>
        </div>
        <div class="panel-body">
          ${lowStock.length ? `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Produto</th><th>Atual</th><th>Minimo</th><th>Sugerido</th><th>Unidade</th></tr></thead>
                <tbody>${lowStock.map((product) => `<tr><td>${product.description}</td><td>${product.stock}</td><td>${product.minStock}</td><td>${Math.max(product.minStock - product.stock, 1)}</td><td>${product.unit}</td></tr>`).join("")}</tbody>
              </table>
            </div>
          ` : `<div class="empty">Nenhum item abaixo do estoque minimo.</div>`}
        </div>
      </section>
      <section class="panel">
        <div class="panel-head"><h3>Alertas operacionais</h3><span class="badge ${overduePayables.length || overdueReceivables.length || expiringLots.length || pendingFiscal.length ? "warn" : "ok"}">Acao necessaria</span></div>
        <div class="panel-body grid four">
          <div class="kpi"><small>Contas a pagar atrasadas</small><strong>${overduePayables.length}</strong><span>${money(overduePayables.reduce((sum, row) => sum + financeBalance(row), 0))}</span></div>
          <div class="kpi"><small>Contas a receber atrasadas</small><strong>${overdueReceivables.length}</strong><span>${money(overdueReceivables.reduce((sum, row) => sum + financeBalance(row), 0))}</span></div>
          <div class="kpi"><small>Lotes vencidos/ate 30 dias</small><strong>${expiringLots.length}</strong><span>${expiringLots.slice(0, 2).map((row) => row.product).join(", ") || "Nenhum"}</span></div>
          <div class="kpi"><small>Documentos fiscais pendentes</small><strong>${pendingFiscal.length}</strong><span>${pendingFiscal.filter((row) => row.lastFiscalError).length} com falha</span></div>
        </div>
      </section>
    </div>
  `;
}

function sendAutomaticOrderToCentral() {
  const items = state.products
    .filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0))
    .map((product) => ({
      productId: product.id,
      description: product.description,
      currentStock: Number(product.stock || 0),
      minStock: Number(product.minStock || 0),
      suggestedQty: Math.max(Number(product.minStock || 0) - Number(product.stock || 0), 1),
      unit: product.unit,
      cost: Number(product.cost || 0)
    }));

  if (!items.length) {
    alert("Nenhum produto abaixo do estoque minimo.");
    return;
  }

  state.automaticOrders = state.automaticOrders || [];
  state.automaticOrders.unshift({
    id: nextId(state.automaticOrders),
    date: today(),
    createdAt: new Date().toISOString(),
    status: "Enviado",
    origin: "Estoque minimo",
    requestedBy: state.settings.user || "Operador",
    totalItems: items.length,
    estimatedCost: items.reduce((sum, item) => sum + item.suggestedQty * item.cost, 0),
    items
  });

  audit("Pedido automatico para Central Tortela", `${items.length} itens abaixo do minimo`);
  save();
  renderShell();
  alert("Pedido automatico enviado para a Central Tortela.");
}

function renderPeople() {
  const draft = pendingPersonDraft;
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Pessoas</h2>
        <div class="actions"><input class="compact-input" id="person-search" value="${escapeAttr(personSearch)}" placeholder="Buscar pessoa" /><button class="btn" id="filter-people">Buscar</button><button class="btn" id="copy-public-registration">Copiar link de cadastro</button><button class="btn primary" id="save-person">${editingPersonId ? "Atualizar pessoa" : "Salvar pessoa"}</button></div>
      </div>
      <div class="panel-body grid">
        <form class="form-card" id="person-form">
          <div class="grid three">
            <div class="field"><label>Tipo</label><select id="person-type">${["Cliente", "Fornecedor", "Funcionario", "Parceiro"].map((type) => `<option ${draft.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></div>
            <div class="field"><label>Nome/Razao social</label><input id="person-name" value="${escapeAttr(draft.name || "")}" required /></div>
            <div class="field"><label>Fantasia/Apelido</label><input id="person-alias" value="${escapeAttr(draft.alias || "")}" /></div>
            <div class="field"><label>CPF/CNPJ</label><input id="person-doc" value="${escapeAttr(draft.document || "")}" /></div>
            <div class="field"><label>RG/IE</label><input id="person-ie" value="${escapeAttr(draft.stateRegistration || "")}" /></div>
            <div class="field"><label>Contribuinte</label><select id="person-taxpayer"><option>Nao contribuinte</option><option>Contribuinte ICMS</option><option>Isento</option></select></div>
          </div>
          <div class="grid three">
            <div class="field"><label>Email</label><input id="person-email" value="${escapeAttr(draft.email || "")}" /></div>
            <div class="field"><label>Telefone</label><input id="person-phone" value="${escapeAttr(draft.phone || "")}" /></div>
            <div class="field"><label>WhatsApp</label><input id="person-whatsapp" value="${escapeAttr(draft.whatsapp || "")}" /></div>
            <div class="field"><label>Limite de credito</label><input id="person-credit" type="number" step="0.01" value="${Number(draft.creditLimit || 0)}" /></div>
            <div class="field"><label>Ativo</label><select id="person-active"><option value="true">Sim</option><option value="false" ${draft.active === false ? "selected" : ""}>Nao</option></select></div>
          </div>
          <div class="grid four">
            <div class="field"><label>CEP</label><input id="person-cep" value="${escapeAttr(draft.cep || "")}" placeholder="01001000" /></div>
            <div class="field"><label>Endereco</label><input id="person-address" value="${escapeAttr(draft.address || "")}" /></div>
            <div class="field"><label>Numero</label><input id="person-number" value="${escapeAttr(draft.number || "")}" /></div>
            <div class="field"><label>Bairro</label><input id="person-district" value="${escapeAttr(draft.district || "")}" /></div>
            <div class="field"><label>Cidade</label><input id="person-city" value="${escapeAttr(draft.city || "")}" /></div>
            <div class="field"><label>UF</label><input id="person-uf" value="${escapeAttr(draft.uf || "")}" maxlength="2" /></div>
            <div class="field"><label>Complemento</label><input id="person-complement" value="${escapeAttr(draft.complement || "")}" /></div>
          </div>
          <div class="actions"><button class="btn" id="lookup-cep" type="button">Buscar CEP</button><span class="helper">Todos os cadastros com endereco usam busca automatica quando houver internet.</span></div>
        </form>
        ${peopleTable()}
      </div>
    </section>
  `;
}

function peopleTable() {
  const query = personSearch.trim().toLowerCase();
  const rows = state.people.filter((person) => !query || [person.name, person.alias, person.document, person.city].some((value) => String(value || "").toLowerCase().includes(query)));
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Codigo</th><th>Tipo</th><th>Nome</th><th>Fantasia</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>UF</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>${rows.map((person) => `<tr><td>${person.id}</td><td>${person.type}</td><td>${person.name}</td><td>${person.alias || ""}</td><td>${person.document}</td><td>${person.phone || ""}</td><td>${person.city}</td><td>${person.uf}</td><td><span class="badge ${person.active === false ? "danger" : "ok"}">${person.active === false ? "Inativo" : "Ativo"}</span></td><td><button class="btn" data-edit-person="${person.id}">Editar</button> <button class="btn ${person.active === false ? "" : "danger"}" data-toggle-person="${person.id}">${person.active === false ? "Ativar" : "Inativar"}</button></td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function findPersonByName(name) {
  const target = String(name || "").trim().toLowerCase();
  return (state.people || []).find((person) => String(person.name || "").trim().toLowerCase() === target) || {};
}

function renderProducts() {
  const tabs = ["dados", "impostos", "composicao", "grade", "promocao", "balanca", "tabelas"];
  if (!tabs.includes(currentTab)) currentTab = "dados";
  return `
    <section class="panel">
      <div class="panel-head"><h2>Produtos</h2><div class="actions"><input class="compact-input" id="product-search" value="${escapeAttr(productSearch)}" placeholder="Buscar produto" /><button class="btn" id="filter-products">Buscar</button><button class="btn primary" id="save-product">${editingProductId ? "Atualizar produto" : "Salvar produto"}</button></div></div>
      <div class="module-tabs">${tabs.map((tab) => `<button type="button" class="${currentTab === tab ? "active" : ""}" data-product-tab="${tab}" aria-pressed="${currentTab === tab ? "true" : "false"}">${tabLabel(tab)}</button>`).join("")}</div>
      <div class="panel-body grid">
        ${productForm()}
        ${productTab()}
        ${productsTable()}
      </div>
    </section>
  `;
}

function tabLabel(tab) {
  return {
    dados: "Dados",
    impostos: "Impostos",
    composicao: "Composicao",
    grade: "Grade/Lote",
    promocao: "Promocao",
    balanca: "Balanca",
    tabelas: "Tabela de precos"
  }[tab];
}

function productForm() {
  const draft = {
    description: "",
    barcode: "",
    type: "Mercadoria para revenda",
    unit: "UN",
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 1,
    brand: "",
    group: "",
    location: "",
    ncm: "00000000",
    cfop: "5102",
    cst: "102",
    cest: "",
    ibsClass: "000001",
    cbsClass: "000001",
    ...pendingProductDraft
  };
  return `
    <form class="form-card" id="product-form">
      <div class="grid four">
        <div class="field"><label>Descricao</label><input id="product-description" value="${escapeAttr(draft.description)}" required /></div>
        <div class="field"><label>Codigo de barras</label><input id="product-barcode" value="${escapeAttr(draft.barcode)}" /></div>
        <div class="field"><label>Tipo</label><select id="product-type">${["Mercadoria para revenda", "Materia-prima", "Produto fabricado", "Servico", "Combustivel"].map((item) => `<option ${draft.type === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          <div class="field"><label>Unidade</label><select id="product-unit">${["UN", "KG", "LT", "CX", "HR"].map((item) => `<option ${draft.unit === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
      </div>
      <div class="grid four">
        <div class="field"><label>Marca</label><input id="product-brand" value="${escapeAttr(draft.brand)}" /></div>
        <div class="field"><label>Grupo</label><input id="product-group" value="${escapeAttr(draft.group)}" /></div>
        <div class="field"><label>Localizacao</label><input id="product-location" value="${escapeAttr(draft.location)}" /></div>
        <div class="field"><label>Ativo</label><select id="product-active"><option value="true">Sim</option><option value="false" ${draft.active === false ? "selected" : ""}>Nao</option></select></div>
      </div>
      <div class="grid four">
        <div class="field"><label>Custo</label><input id="product-cost" type="number" step="0.01" value="${draft.cost}" /></div>
        <div class="field"><label>Venda</label><input id="product-price" type="number" step="0.01" value="${draft.price}" /></div>
        <div class="field"><label>Estoque atual</label><input id="product-stock" type="number" step="0.001" value="${draft.stock}" /></div>
        <div class="field"><label>Estoque minimo</label><input id="product-min" type="number" step="0.001" value="${draft.minStock}" /></div>
      </div>
      <div class="grid four">
        <div class="field"><label>NCM</label><input id="product-ncm" value="${escapeAttr(draft.ncm)}" /></div>
        <div class="field"><label>CEST</label><input id="product-cest" value="${escapeAttr(draft.cest)}" /></div>
        <div class="field"><label>CFOP</label><input id="product-cfop" value="${escapeAttr(draft.cfop)}" /></div>
        <div class="field"><label>CST/CSOSN</label><input id="product-cst" value="${escapeAttr(draft.cst)}" /></div>
        <div class="field"><label>Classificacao IBS</label><input id="product-ibs" value="${escapeAttr(draft.ibsClass)}" /></div>
        <div class="field"><label>Classificacao CBS</label><input id="product-cbs" value="${escapeAttr(draft.cbsClass)}" /></div>
      </div>
      <div class="photo-uploader">
        <div class="photo-preview" id="product-photo-preview">${pendingProductPhoto ? `<img src="${pendingProductPhoto}" alt="Foto do produto" />` : "Sem foto"}</div>
        <div class="grid">
          <div class="field"><label>Foto do produto</label><input id="product-photo" type="file" accept="image/*" /></div>
          <label class="check-row"><input id="product-is-bundle" type="checkbox" ${pendingComposition.length ? "checked" : ""} /> Este produto e formado por partes/componentes</label>
          <p class="helper">Ao vender um produto marcado como composto, o sistema baixa automaticamente os itens informados na aba Composicao.</p>
        </div>
      </div>
    </form>
  `;
}

function productTab() {
  if (currentTab === "impostos") {
    return `
      <div class="form-card">
        <h3>Conferencia fiscal do produto</h3>
        <p class="muted">NCM, CEST, CFOP, CST/CSOSN, IBS e CBS ficam no cadastro principal do produto para nao perder informacao ao salvar.</p>
        <div class="fiscal-note">Campos da Reforma Tributaria ficam parametrizados por vigencia, UF, regime e operacao. A emissao real depende das notas tecnicas oficiais e homologacao.</div>
      </div>
    `;
  }
  if (currentTab === "composicao") {
    const compositionCost = pendingComposition.reduce((sum, component) => {
      const product = state.products.find((item) => item.id === component.productId);
      return sum + Number(product?.cost || 0) * Number(component.qty || 0);
    }, 0);
    return `
      <div class="form-card">
        <h3>Composicao / fabricacao</h3>
        <p class="muted">Use para produto montado por partes. Exemplo: um kit, uma cesta, uma receita ou um produto fabricado. Ao vender o produto principal, os componentes tambem sofrem baixa.</p>
        <div class="grid three">
          <div class="field"><label>Materia-prima</label><select id="composition-product">${state.products.map((product) => `<option value="${product.id}">${product.description}</option>`).join("")}</select></div>
          <div class="field"><label>Quantidade usada</label><input id="composition-qty" type="number" step="0.001" value="1" /></div>
          <div class="field"><label>Tipo de baixa</label><select id="composition-mode"><option value="sale">Baixar na venda</option><option value="production">Baixar na fabricacao</option><option value="both">Baixar em ambos</option></select></div>
        </div>
        <div class="actions">
          <button class="btn primary" id="add-composition" type="button">Adicionar componente</button>
          <span class="badge warn">Custo dos componentes: ${money(compositionCost)}</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Componente</th><th>Qtd usada</th><th>Unidade</th><th>Custo unit.</th><th>Baixa</th><th>Acao</th></tr></thead>
            <tbody>${pendingComposition.length ? pendingComposition.map((component, index) => {
              const product = state.products.find((item) => item.id === component.productId);
              return `<tr><td>${product?.description || component.productId}</td><td>${component.qty}</td><td>${product?.unit || ""}</td><td>${money(product?.cost || 0)}</td><td>${compositionModeLabel(component.mode)}</td><td><button class="btn danger" data-remove-composition="${index}" type="button">Remover</button></td></tr>`;
            }).join("") : `<tr><td colspan="6">Nenhum componente adicionado para o novo produto.</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    `;
  }
  if (currentTab === "balanca") {
    return `
      <div class="form-card">
        <h3>Produto pesado e informacao nutricional</h3>
        <div class="grid four">
          <div class="field"><label>Codigo balanca</label><input id="product-scale-code" value="${escapeAttr(pendingProductDraft.scaleCode || "")}" /></div>
          <div class="field"><label>Dias validade</label><input id="product-scale-validity" type="number" min="0" value="${Number(pendingProductDraft.scaleValidityDays || 0)}" /></div>
          <div class="field"><label>Calorias</label><input id="product-nutrition-calories" value="${escapeAttr(pendingProductDraft.nutritionCalories || "")}" /></div>
          <div class="field"><label>Proteinas</label><input id="product-nutrition-protein" value="${escapeAttr(pendingProductDraft.nutritionProtein || "")}" /></div>
        </div>
      </div>
    `;
  }
  if (currentTab === "grade") {
    return `
      <div class="form-card">
        <h3>Grade, lote e validade</h3>
        <div class="grid four">
          <div class="field"><label>Cor</label><input id="product-variant-color" value="${escapeAttr(pendingProductDraft.variantColor || "")}" /></div>
          <div class="field"><label>Tamanho</label><input id="product-variant-size" value="${escapeAttr(pendingProductDraft.variantSize || "")}" /></div>
          <div class="field"><label>Controla lote</label><select id="product-controls-lot"><option value="false">Nao</option><option value="true" ${pendingProductDraft.controlsLot ? "selected" : ""}>Sim</option></select></div>
          <div class="field"><label>Controla numero de serie</label><select id="product-controls-serial"><option value="false">Nao</option><option value="true" ${pendingProductDraft.controlsSerial ? "selected" : ""}>Sim</option></select></div>
          <div class="field"><label>Dias de validade</label><input id="product-shelf-life" type="number" min="0" value="${Number(pendingProductDraft.shelfLifeDays || 0)}" /></div>
        </div>
      </div>
    `;
  }
  if (currentTab === "promocao") {
    return `
      <div class="form-card">
        <h3>Promocao</h3>
        <div class="grid four">
          <div class="field"><label>Inicio</label><input id="product-promo-from" type="date" value="${pendingProductDraft.promotion?.from || ""}" /></div>
          <div class="field"><label>Fim</label><input id="product-promo-to" type="date" value="${pendingProductDraft.promotion?.to || ""}" /></div>
          <div class="field"><label>Quantidade minima</label><input id="product-promo-qty" type="number" step="0.001" value="${Number(pendingProductDraft.promotion?.minQty || 0)}" /></div>
          <div class="field"><label>Preco promocional</label><input id="product-promo-price" type="number" step="0.01" value="${Number(pendingProductDraft.promotion?.price || 0)}" /></div>
        </div>
      </div>
    `;
  }
  if (currentTab === "tabelas") {
    return `
      <div class="form-card">
        <h3>Tabelas de precos</h3>
        <div class="grid three">
          <div class="field"><label>Atacado</label><input id="product-price-wholesale" type="number" step="0.01" value="${Number(pendingProductDraft.priceTables?.wholesale || 0)}" /></div>
          <div class="field"><label>Especial</label><input id="product-price-special" type="number" step="0.01" value="${Number(pendingProductDraft.priceTables?.special || 0)}" /></div>
          <div class="field"><label>Comissao %</label><input id="product-commission" type="number" step="0.01" value="${Number(pendingProductDraft.commissionRate || 0)}" /></div>
        </div>
      </div>
    `;
  }
  return `
    <div class="form-card">
      <h3>${tabLabel(currentTab)}</h3>
      <p class="muted">Area preparada para os campos especificos deste grupo sem copiar a tela antiga.</p>
    </div>
  `;
}

function compositionModeLabel(mode) {
  return {
    sale: "Venda",
    production: "Fabricacao",
    both: "Venda e fabricacao"
  }[mode] || "Venda";
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function productsTable() {
  const query = productSearch.trim().toLowerCase();
  const rows = state.products.filter((product) => !query || [product.description, product.barcode, product.brand, product.group, product.ncm].some((value) => String(value || "").toLowerCase().includes(query)));
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Foto</th><th>Codigo</th><th>Descricao</th><th>Tipo</th><th>NCM</th><th>Preco</th><th>Estoque</th><th>Minimo</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>${rows.map((product) => `<tr><td>${product.photo ? `<img src="${product.photo}" alt="" style="width:34px;height:34px;object-fit:cover;border-radius:6px" />` : "-"}</td><td>${product.id}</td><td>${product.description}</td><td>${product.type}</td><td>${product.ncm}</td><td>${money(product.price)}</td><td>${product.stock}</td><td>${product.minStock}</td><td><span class="badge ${product.active === false ? "danger" : product.stock <= product.minStock ? "warn" : "ok"}">${product.active === false ? "Inativo" : product.stock <= product.minStock ? "Comprar" : "OK"}</span></td><td><button class="btn" data-edit-product="${product.id}">Editar</button> <button class="btn" data-label-product="${product.id}">Etiqueta</button> <button class="btn ${product.active === false ? "" : "danger"}" data-toggle-product="${product.id}">${product.active === false ? "Ativar" : "Inativar"}</button></td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function renderStock() {
  const movements = state.stockMovements || [];
  return `
    <section class="panel">
      <div class="panel-head"><h2>Estoque e producao</h2><div class="actions"><button class="btn" id="plan-production">Programar ordem</button><button class="btn primary" id="make-production">Fabricar</button></div></div>
      <div class="panel-body grid two">
        <div class="form-card">
          <h3>Baixa por composicao</h3>
          <p class="muted">Exemplo: fabricar 10 paes baixa farinha e oleo conforme a ficha tecnica do produto.</p>
          <div class="field"><label>Produto fabricado</label><select id="production-product">${state.products.filter((p) => (p.composition || []).some((component) => component.mode === "production" || component.mode === "both")).map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
          <div class="field"><label>Ordem planejada</label><select id="production-order"><option value="">Nova producao</option>${(state.productions || []).filter((row) => row.status === "Planejada").map((row) => `<option value="${row.id}">Ordem ${row.id} - ${row.product} (${row.plannedQty})</option>`).join("")}</select></div>
          <div class="grid two">
            <div class="field"><label>Quantidade planejada</label><input id="production-qty" type="number" step="0.001" value="10" /></div>
            <div class="field"><label>Quantidade produzida</label><input id="production-actual-qty" type="number" step="0.001" value="10" /></div>
            <div class="field"><label>Lote produzido</label><input id="production-lot" /></div>
            <div class="field"><label>Validade</label><input id="production-expiry" type="date" /></div>
            <div class="field"><label>Series produzidas</label><textarea id="production-serials" placeholder="Uma por linha, quando o produto controlar serie"></textarea></div>
          </div>
        </div>
        <div class="form-card">
          <h3>Ajuste de estoque</h3>
          <div class="field"><label>Produto</label><select id="stock-product">${state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
          <div class="grid two">
            <div class="field"><label>Tipo</label><select id="stock-type"><option value="Entrada">Entrada</option><option value="Saida">Saida</option><option value="Ajuste">Ajuste</option><option value="Perda">Perda</option></select></div>
            <div class="field"><label>Quantidade</label><input id="stock-qty" type="number" step="0.001" value="1" /></div>
          </div>
          <div class="field"><label>Historico</label><input id="stock-history" value="Ajuste manual" /></div>
          <div class="grid two">
            <div class="field"><label>Localizacao</label><input id="stock-location" /></div>
            <div class="field"><label>Lote</label><input id="stock-lot" /></div>
            <div class="field"><label>Validade</label><input id="stock-expiry" type="date" /></div>
            <div class="field"><label>Numeros de serie</label><textarea id="stock-serials" placeholder="Um por linha"></textarea></div>
          </div>
          <button class="btn primary" id="save-stock-move" type="button">Gravar movimento</button>
        </div>
        <div class="form-card">
          <h3>Inventario</h3>
          <div class="field"><label>Leitor de codigo de barras</label><input id="inventory-barcode" placeholder="Leia o codigo e pressione Enter" /></div>
          <div class="field"><label>Produto</label><select id="inventory-product">${state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
          <div class="field"><label>Quantidade contada</label><input id="inventory-counted" type="number" step="0.001" value="0" /></div>
          <div class="grid two"><div class="field"><label>Lote contado</label><input id="inventory-lot" /></div><div class="field"><label>Numero de serie</label><input id="inventory-serial" /></div></div>
          <div class="field"><label>Motivo</label><input id="inventory-reason" value="Contagem fisica" /></div>
          <button class="btn primary" id="save-inventory" type="button">Aplicar inventario</button>
        </div>
        <div class="form-card">
          <h3>Transferencia interna</h3>
          <div class="field"><label>Produto</label><select id="transfer-product">${state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
          <div class="grid two">
            <div class="field"><label>Quantidade</label><input id="transfer-qty" type="number" step="0.001" value="1" /></div>
            <div class="field"><label>Origem</label><input id="transfer-from" value="Estoque principal" /></div>
            <div class="field"><label>Destino</label><input id="transfer-to" value="Loja" /></div>
          </div>
          <button class="btn primary" id="save-transfer" type="button">Registrar transferencia</button>
        </div>
        <div class="grid" style="grid-column: 1 / -1">${productsTable()}</div>
        <div class="table-wrap" style="grid-column: 1 / -1">
          <table>
            <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Saldo</th><th>Lote/Local</th><th>Historico</th></tr></thead>
            <tbody>${movements.slice(-30).reverse().map((row) => `<tr><td>${row.date}</td><td>${row.product}</td><td>${row.type}</td><td>${row.qty}</td><td>${row.balance}</td><td>${row.lot || row.location || "-"}</td><td>${row.history}</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <div class="table-wrap" style="grid-column: 1 / -1">
          <table><thead><tr><th>Ordem</th><th>Data</th><th>Produto</th><th>Planejado</th><th>Produzido</th><th>Perda</th><th>Custo</th><th>Status</th></tr></thead><tbody>${(state.productions || []).slice().reverse().map((row) => `<tr><td>${row.id}</td><td>${row.date}</td><td>${row.product}</td><td>${row.plannedQty}</td><td>${row.actualQty || 0}</td><td>${row.loss || 0}</td><td>${money(row.productionCost || 0)}</td><td><span class="badge ${row.status === "Concluida" ? "ok" : "warn"}">${row.status || "Concluida"}</span></td></tr>`).join("")}</tbody></table>
        </div>
        <div class="table-wrap" style="grid-column: 1 / -1">
          <table><thead><tr><th>Produto</th><th>Lote</th><th>Validade</th><th>Quantidade</th><th>Situacao</th></tr></thead><tbody>${(state.stockLots || []).filter((row) => Number(row.qty || 0) > 0).map((row) => `<tr><td>${row.product}</td><td>${row.lot}</td><td>${row.expiry || "-"}</td><td>${row.qty}</td><td><span class="badge ${row.expiry && daysUntil(row.expiry) <= 30 ? "warn" : "ok"}">${row.expiry && daysUntil(row.expiry) <= 30 ? "Proximo do vencimento" : "Regular"}</span></td></tr>`).join("")}</tbody></table>
        </div>
        <div class="table-wrap" style="grid-column: 1 / -1">
          <table><thead><tr><th>Produto</th><th>Serie</th><th>Lote</th><th>Status</th><th>Referencia</th></tr></thead><tbody>${(state.stockSerials || []).slice().reverse().map((row) => `<tr><td>${row.product}</td><td>${row.serial}</td><td>${row.lot || "-"}</td><td><span class="badge ${row.status === "Disponivel" ? "ok" : "warn"}">${row.status}</span></td><td>${row.reference || "-"}</td></tr>`).join("")}</tbody></table>
        </div>
        <div class="table-wrap" style="grid-column: 1 / -1">
          <table><thead><tr><th>Deposito</th><th>Produto</th><th>Saldo</th></tr></thead><tbody>${(state.warehouseStocks || []).filter((row) => Number(row.qty || 0) !== 0).map((row) => `<tr><td>${row.warehouse}</td><td>${row.product}</td><td>${row.qty}</td></tr>`).join("")}</tbody></table>
        </div>
      </div>
    </section>
  `;
}

function renderPurchases() {
  const purchaseTotal = purchaseItems.reduce((sum, item) => sum + item.qty * item.cost, 0);
  return `
    <section class="panel">
      <div class="panel-head"><h2>Compras</h2><div class="actions"><label class="btn" for="purchase-xml">Ler XML</label><input id="purchase-xml" type="file" accept=".xml,text/xml,application/xml" hidden /><button class="btn primary" id="new-purchase">Lancar compra</button></div></div>
      <div class="panel-body grid">
        <div class="form-card grid four">
          <div class="field"><label>Fornecedor</label><select id="purchase-supplier">${state.people.filter((p) => p.type === "Fornecedor").map((p) => `<option>${p.name}</option>`).join("")}</select></div>
          <div class="field"><label>Nota/Documento</label><input id="purchase-doc" /></div>
          <div class="field"><label>Entrada</label><input id="purchase-date" type="date" value="${today()}" /></div>
          <div class="field"><label>Vencimento</label><input id="purchase-due" type="date" value="${today()}" /></div>
          <div class="field"><label>Gerar</label><select id="purchase-generate"><option>Estoque e financeiro</option><option>Somente estoque</option><option>Somente financeiro</option></select></div>
          <div class="field"><label>Preco de venda</label><select id="purchase-price-update"><option value="keep">Manter atual</option><option value="margin">Recalcular mantendo margem</option></select></div>
          <div class="field"><label>Parcelas</label><input id="purchase-installments" type="number" min="1" value="1" /></div>
          <div class="field"><label>Intervalo das parcelas</label><input id="purchase-interval" type="number" min="1" value="30" /></div>
        </div>
        <div class="form-card">
          <h3>Itens da compra</h3>
          <div class="grid four">
            <div class="field"><label>Produto</label><select id="purchase-product">${state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
            <div class="field"><label>Quantidade</label><input id="purchase-qty" type="number" step="0.001" value="1" /></div>
            <div class="field"><label>Custo unitario</label><input id="purchase-cost" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Lote</label><input id="purchase-lot" /></div>
            <div class="field"><label>Validade</label><input id="purchase-expiry" type="date" /></div>
            <div class="field"><label>Numeros de serie</label><textarea id="purchase-serials" placeholder="Um por linha"></textarea></div>
            <div class="field"><label>CFOP entrada</label><input id="purchase-cfop" value="1102" /></div>
            <div class="field"><label>CST/CSOSN</label><input id="purchase-cst" value="102" /></div>
            <div class="field"><label>ICMS</label><input id="purchase-icms" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Total da nota</label><input readonly value="${money(purchaseTotal)}" /></div>
          </div>
          <div class="actions"><button class="btn primary" id="add-purchase-item" type="button">Adicionar item</button><button class="btn danger" id="clear-purchase-items" type="button">Limpar itens</button></div>
          <div class="table-wrap">
            <table><thead><tr><th>Produto</th><th>Qtd</th><th>Custo</th><th>CFOP</th><th>CST</th><th>ICMS</th><th>Lote</th><th>Total</th><th>Acao</th></tr></thead><tbody>${purchaseItems.length ? purchaseItems.map((item, index) => `<tr><td>${item.product}</td><td>${item.qty}</td><td>${money(item.cost)}</td><td>${item.cfop || "-"}</td><td>${item.cst || "-"}</td><td>${money(item.icmsValue || 0)}</td><td>${item.lot || "-"}</td><td>${money(item.qty * item.cost)}</td><td><button class="btn danger" data-remove-purchase-item="${index}" type="button">Remover</button></td></tr>`).join("") : `<tr><td colspan="9">Nenhum item adicionado.</td></tr>`}</tbody></table>
          </div>
        </div>
        <div class="table-wrap">
          <table><thead><tr><th>Numero</th><th>Data</th><th>Fornecedor</th><th>Documento</th><th>Itens</th><th>Total</th><th>Status</th><th>Acao</th></tr></thead><tbody>${state.purchases.map((row) => `<tr><td>${row.id}</td><td>${row.date}</td><td>${row.supplier}</td><td>${row.document || ""}</td><td>${row.items?.length || 1}</td><td>${money(row.total)}</td><td><span class="badge ${row.status === "Cancelada" ? "danger" : "ok"}">${row.status || "Confirmada"}</span></td><td>${row.status === "Cancelada" ? "-" : `<button class="btn danger" data-cancel-purchase="${row.id}">Cancelar</button>`}</td></tr>`).join("")}</tbody></table>
        </div>
      </div>
    </section>
  `;
}

function renderSales() {
  const orderTotal = orderItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  return `
    <section class="panel">
      <div class="panel-head"><h2>Vendas e orcamentos</h2><div class="actions"><button class="btn primary" id="save-order">Salvar pedido/orcamento</button></div></div>
      <div class="panel-body grid">
        <div class="form-card grid four">
          <div class="field"><label>Cliente</label><select id="order-customer">${state.people.filter((p) => p.type === "Cliente").map((p) => `<option>${p.name}</option>`).join("")}</select></div>
          <div class="field"><label>Produto</label><select id="order-product">${state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
          <div class="field"><label>Quantidade</label><input id="order-qty" type="number" step="0.001" value="1" /></div>
          <div class="field"><label>Tipo</label><select id="order-type"><option>Pedido</option><option>Orcamento</option></select></div>
          <div class="field"><label>Forma de pagamento</label><select id="order-payment"><option>Dinheiro</option><option>PIX</option><option>Cartao</option><option>Boleto</option><option>Crediario</option></select></div>
          <div class="field"><label>Vencimento</label><input id="order-due" type="date" value="${today()}" /></div>
          <div class="field"><label>Total</label><input readonly value="${money(orderTotal)}" /></div>
          <div class="actions"><button class="btn" id="add-order-item" type="button">Adicionar item</button><button class="btn danger" id="clear-order-items" type="button">Limpar itens</button></div>
        </div>
        <div class="table-wrap">
          <table><thead><tr><th>Produto</th><th>Qtd</th><th>Un.</th><th>Preco</th><th>Total</th><th>Acao</th></tr></thead><tbody>${orderItems.length ? orderItems.map((item, index) => `<tr><td>${item.description}</td><td>${item.qty}</td><td>${item.unit}</td><td>${money(item.price)}</td><td>${money(item.qty * item.price)}</td><td><button class="btn danger" data-remove-order-item="${index}">Remover</button></td></tr>`).join("") : `<tr><td colspan="6">Adicione os produtos do pedido ou orcamento.</td></tr>`}</tbody></table>
        </div>
        <div class="table-wrap">
          <table><thead><tr><th>Numero</th><th>Data</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Comissao</th><th>Tipo</th><th>Status</th><th>Acao</th></tr></thead><tbody>${state.sales.map((sale) => `<tr><td>${sale.id}</td><td>${sale.date}</td><td>${sale.customer}</td><td>${sale.seller}</td><td>${money(sale.total)}</td><td>${money(sale.commission || 0)}</td><td>${sale.type}</td><td><span class="badge ${sale.status === "Cancelado" || sale.status === "Devolvido" || sale.status === "Trocado" ? "danger" : sale.status === "Aberto" || sale.status === "Parcialmente devolvido" ? "warn" : "ok"}">${sale.status || "Fechado"}</span></td><td>${sale.type === "Orcamento" && sale.status === "Aberto" ? `<button class="btn primary" data-convert-quote="${sale.id}">Converter em pedido</button>` : ["Fechado", "Parcialmente devolvido"].includes(sale.status) ? `<button class="btn" data-return-sale="${sale.id}">Devolver</button> <button class="btn" data-exchange-sale="${sale.id}">Trocar</button> ${sale.status === "Fechado" ? `<button class="btn danger" data-cancel-sale-record="${sale.id}">Cancelar</button>` : ""}` : "-"}</td></tr>`).join("")}</tbody></table>
        </div>
      </div>
    </section>
  `;
}

function renderFinance() {
  const tabs = ["receber", "pagar", "caixa", "plano"];
  if (!tabs.includes(currentTab)) currentTab = "receber";
  return `
    <section class="panel">
      <div class="panel-head"><h2>Financeiro</h2><button class="btn primary" id="save-finance">Novo lancamento</button></div>
      <div class="module-tabs">${tabs.map((tab) => `<button class="${currentTab === tab ? "active" : ""}" data-tab="${tab}">${tab === "receber" ? "Contas a receber" : tab === "pagar" ? "Contas a pagar" : tab === "caixa" ? "Livro caixa" : "Plano de contas"}</button>`).join("")}</div>
      <div class="panel-body">${financeTab()}</div>
    </section>
  `;
}

function financeTab() {
  const rows = currentTab === "pagar" ? state.payables : currentTab === "receber" ? state.receivables : state.cash;
  const accounts = (state.chartOfAccounts || []).filter((account) => account.active !== false);
  const accountOptions = accounts.map((account) => `<option value="${account.code}">${account.code} - ${account.name}</option>`).join("");
  if (currentTab === "plano") {
    return `
      <div class="grid">
        <div class="form-card grid four">
          <div class="field"><label>Codigo</label><input id="account-code" placeholder="Ex.: 4.1.02" /></div>
          <div class="field"><label>Nome da conta</label><input id="account-name" /></div>
          <div class="field"><label>Tipo</label><select id="account-type"><option>Ativo</option><option>Passivo</option><option>Receita</option><option>Despesa</option><option>Patrimonio</option></select></div>
          <button class="btn primary" id="save-account" type="button">Cadastrar conta</button>
        </div>
        <div class="table-wrap"><table><thead><tr><th>Codigo</th><th>Conta</th><th>Tipo</th><th>Status</th></tr></thead><tbody>${(state.chartOfAccounts || []).map((account) => `<tr><td>${account.code}</td><td>${account.name}</td><td>${account.type}</td><td>${account.active === false ? "Inativa" : "Ativa"}</td></tr>`).join("")}</tbody></table></div>
      </div>`;
  }
  if (currentTab === "caixa") {
    const balance = state.cash.reduce((sum, row) => sum + row.in - row.out, 0);
    return `
      <div class="grid">
        <div class="kpi"><small>Saldo</small><strong>${money(balance)}</strong></div>
        <div class="form-card grid three">
          <div class="field"><label>Saldo do extrato/caixa contado</label><input id="reconcile-balance" type="number" step="0.01" value="${balance.toFixed(2)}" /></div>
          <div class="field"><label>Conta</label><select id="reconcile-account">${accountOptions}</select></div>
          <div class="field"><label>Observacao</label><input id="reconcile-note" value="Conferencia de saldo" /></div>
          <button class="btn primary" id="save-reconciliation" type="button">Conciliar saldo</button>
          <label class="btn" for="import-ofx">Importar OFX</label><input id="import-ofx" type="file" accept=".ofx,application/x-ofx,text/plain" hidden />
        </div>
        <div class="table-wrap"><table><thead><tr><th>Data</th><th>Conta</th><th>Historico</th><th>Entrada</th><th>Saida</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.date}</td><td>${row.account}</td><td>${row.history}</td><td>${money(row.in)}</td><td>${money(row.out)}</td></tr>`).join("")}</tbody></table></div>
        <div class="table-wrap"><table><thead><tr><th>Data banco</th><th>Documento</th><th>Historico</th><th>Valor</th><th>Status</th></tr></thead><tbody>${(state.bankTransactions || []).slice().reverse().map((row) => `<tr><td>${row.date}</td><td>${row.fitId || "-"}</td><td>${row.memo}</td><td>${money(row.amount)}</td><td>${row.reconciled ? "Conciliado" : "Pendente"}</td></tr>`).join("")}</tbody></table></div>
      </div>
    `;
  }
  const openRows = rows.filter((row) => !row.paid && !row.cancelled);
  const overdueRows = openRows.filter((row) => row.due < today());
  return `
    <div class="grid">
      <div class="grid three">
        <div class="kpi"><small>Em aberto</small><strong>${money(openRows.reduce((sum, row) => sum + financeBalance(row), 0))}</strong></div>
        <div class="kpi"><small>Atrasado</small><strong>${money(overdueRows.reduce((sum, row) => sum + financeBalance(row), 0))}</strong></div>
        <div class="kpi"><small>Titulos atrasados</small><strong>${overdueRows.length}</strong></div>
      </div>
      <div class="form-card grid four">
        <div class="field"><label>Documento</label><input id="finance-doc" /></div>
        <div class="field"><label>${currentTab === "pagar" ? "Fornecedor" : "Cliente"}</label><input id="finance-name" /></div>
        <div class="field"><label>Vencimento</label><input id="finance-due" type="date" value="${today()}" /></div>
        <div class="field"><label>Valor</label><input id="finance-value" type="number" step="0.01" /></div>
        <div class="field"><label>Historico</label><input id="finance-history" /></div>
        <div class="field"><label>Plano de contas</label><select id="finance-account">${accountOptions}</select></div>
        <div class="field"><label>Parcelas</label><input id="finance-installments" type="number" min="1" value="1" /></div>
        <div class="field"><label>Intervalo entre parcelas</label><input id="finance-interval" type="number" min="1" value="30" /></div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Codigo</th><th>Nome</th><th>Conta</th><th>Vencimento</th><th>Valor</th><th>Pago</th><th>Saldo</th><th>Status</th><th>Acao</th></tr></thead><tbody>${rows.map((row) => {
        const balance = financeBalance(row);
        const status = row.cancelled ? "Cancelado" : row.paid ? "Pago" : row.due < today() ? "Atrasado" : Number(row.paidValue || 0) > 0 ? "Parcial" : "Aberto";
        return `<tr><td>${row.id}</td><td>${row.supplier || row.customer || ""}</td><td>${row.accountCode || "-"}</td><td>${row.due}</td><td>${money(row.value)}</td><td>${money(row.paidValue || 0)}</td><td>${money(balance)}</td><td><span class="badge ${row.cancelled ? "danger" : row.paid ? "ok" : "warn"}">${status}</span></td><td>${row.paid || row.cancelled ? "-" : `<button class="btn" data-pay="${row.id}">Baixar</button>`}</td></tr>`;
      }).join("")}</tbody></table></div>
    </div>
  `;
}

function renderFiscal() {
  ensureFiscalRuleCoverage();
  const tabs = ["nfe", "nfce", "nfse", "fila"];
  if (!tabs.includes(currentTab)) currentTab = "fila";
  const availableTabs = tabs.filter((tab) => tab === "fila" || contractedFiscalModule(tab));
  if (!availableTabs.includes(currentTab)) currentTab = availableTabs[0] || "fila";
  const filteredRows = currentTab === "fila" ? state.fiscalQueue : state.fiscalQueue.filter((row) => row.model.toLowerCase().replace("-", "") === currentTab);
  const rules = state.fiscalRules || [];
  const serviceRules = rules.filter((rule) => rule.active !== false && rule.model === "NFS-e" && rule.regime === state.settings.regime);
  const currentModel = currentTab === "nfe" ? "NF-e" : "NFC-e";
  return `
    <section class="panel">
      <div class="panel-head"><h2>Fiscal</h2><div class="actions"><button class="btn" id="retry-fiscal-queue">Reprocessar pendentes</button><button class="btn" id="fiscal-distribution">Buscar DF-e</button><button class="btn" id="fiscal-manifest-key">Manifestar NF-e</button><button class="btn" id="fiscal-inutilize">Inutilizar faixa</button><label class="btn" for="fiscal-import-xml">Importar XML</label><input id="fiscal-import-xml" type="file" accept=".xml,text/xml,application/xml" hidden />${currentTab === "nfse" ? `<button class="btn primary" id="issue-nfse">Emitir NFS-e</button>` : `<button class="btn primary" id="new-fiscal">Gerar documento</button>`}</div></div>
      <div class="module-tabs">${availableTabs.map((tab) => `<button class="${currentTab === tab ? "active" : ""}" data-tab="${tab}">${tab.toUpperCase()}</button>`).join("")}</div>
      <div class="panel-body grid">
        <div class="fiscal-note">
          Ambiente ${state.settings.fiscalEnvironment}. NF-e/NFC-e usam fluxo de mercadoria. NFS-e fica em tela separada porque depende de municipio, item de servico, ISS, NBS e padrao nacional/municipal vigente.
        </div>
        ${currentTab === "nfse" ? renderNfseIssueForm(serviceRules) : `
        <div class="form-card grid four">
          <div class="field"><label>Modelo</label><input id="fiscal-model" value="${currentModel}" readonly /></div>
          <div class="field"><label>Venda de origem</label><select id="fiscal-sale-id"><option value="">Selecione uma venda fechada</option>${state.sales.filter((sale) => ["Fechado", "Parcialmente devolvido"].includes(sale.status) && Array.isArray(sale.items) && sale.items.length).map((sale) => `<option value="${sale.id}">${sale.id} - ${escapeAttr(sale.customer)} - ${money(sale.total)}</option>`).join("")}</select></div>
          <div class="field"><label>Serie</label><input id="fiscal-serie" value="1" /></div>
          <div class="field"><label>Natureza da operacao</label><input id="fiscal-nature" value="Venda de mercadoria" /></div>
          <div class="field"><label>Cliente/Tomador</label><input id="fiscal-customer" value="Consumidor Final" /></div>
          <div class="field"><label>Total</label><input id="fiscal-total" type="number" step="0.01" value="0" /></div>
          <div class="field"><label>Ambiente</label><input value="${state.settings.fiscalEnvironment}" readonly /></div>
        </div>
        `}
        <div class="form-card">
          <h3>Regras fiscais ativas</h3>
          <div class="table-wrap">
            <table><thead><tr><th>Regra</th><th>Regime</th><th>UF</th><th>Modelo</th><th>CFOP</th><th>Servico</th><th>Municipio</th><th>ISS/ICMS</th><th>IBS</th><th>CBS</th></tr></thead>
            <tbody>${rules.filter((rule) => rule.active).map((rule) => `<tr><td>${rule.name}</td><td>${rule.regime}</td><td>${rule.uf}</td><td>${rule.model}</td><td>${rule.cfop}</td><td>${rule.serviceCode || "-"}</td><td>${rule.municipio || "-"}</td><td>${rule.model === "NFS-e" ? pct(rule.issRate) : pct(rule.icmsRate)}</td><td>${rule.ibsClass}</td><td>${rule.cbsClass}</td></tr>`).join("")}</tbody></table>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Numero</th><th>Modelo</th><th>Status</th><th>Cliente</th><th>Total</th><th>Tentativas</th><th>Ultimo erro</th><th>Chave</th><th>Protocolo</th><th>Acoes</th></tr></thead>
            <tbody>${filteredRows.map((row) => `<tr><td>${row.id}</td><td>${row.model}</td><td><span class="badge ${row.status === "Autorizada" ? "ok" : row.status === "Cancelada" ? "danger" : "warn"}">${row.status}</span></td><td>${row.customer}</td><td>${money(row.total)}</td><td>${row.attempts || 0}</td><td>${row.lastFiscalError || "-"}</td><td>${row.key || "-"}</td><td>${row.protocol || "-"}</td><td><button class="btn" data-fiscal-transmit="${row.id}">Transmitir</button> <button class="btn" data-fiscal-query="${row.id}">Consultar</button> <button class="btn" data-fiscal-print="${row.id}">${row.model === "NFS-e" ? "DANFSe" : row.model === "NFC-e" ? "DANFCE" : "DANFE"}</button> ${row.pdfUrl ? `<button class="btn" data-fiscal-pdf="${row.id}">Baixar PDF</button>` : ""} <button class="btn" data-fiscal-xml="${row.id}">XML</button> ${row.model === "NF-e" ? `<button class="btn" data-fiscal-cce="${row.id}">CC-e</button>` : ""} ${row.model === "NFC-e" ? `<button class="btn" data-fiscal-contingency="${row.id}">Contingencia</button>` : ""} <button class="btn danger" data-fiscal-cancel="${row.id}">Cancelar</button></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function contractedFiscalModule(tab) {
  const tenant = getCurrentTenant();
  const contracted = tenant?.modules || ["NF-e", "NFC-e", "NFS-e"];
  const map = { nfe: "NF-e", nfce: "NFC-e", nfse: "NFS-e" };
  return contracted.includes(map[tab]);
}

function renderNfseIssueForm(serviceRules) {
  const defaultRule = serviceRules[0] || {};
  return `
    <div class="form-card">
      <h3>Emissao de NFS-e</h3>
      <div class="grid four">
        <div class="field"><label>Tomador</label><select id="nfse-customer">${state.people.filter((person) => person.type === "Cliente" && person.active !== false).map((person) => `<option>${person.name}</option>`).join("")}</select></div>
        <div class="field"><label>CPF/CNPJ tomador</label><input id="nfse-customer-doc" /></div>
        <div class="field"><label>Municipio prestacao</label><input id="nfse-city" value="${escapeAttr(defaultRule.municipio || state.settings.city || "")}" /></div>
        <div class="field"><label>Codigo IBGE municipio</label><input id="nfse-city-code" placeholder="3552502" /></div>
        <div class="field"><label>Item lista servico LC 116</label><input id="nfse-service-code" value="${escapeAttr(defaultRule.serviceCode || "14.01")}" /></div>
        <div class="field"><label>Codigo municipal</label><input id="nfse-city-service-code" value="${escapeAttr(defaultRule.cityServiceCode || "")}" /></div>
        <div class="field"><label>NBS</label><input id="nfse-nbs" placeholder="Codigo NBS quando aplicavel" /></div>
        <div class="field"><label>CNAE</label><input id="nfse-cnae" /></div>
        <div class="field"><label>Valor servico</label><input id="nfse-service-value" type="number" step="0.01" value="0" /></div>
        <div class="field"><label>Desconto</label><input id="nfse-discount" type="number" step="0.01" value="0" /></div>
        <div class="field"><label>Aliquota ISS %</label><input id="nfse-iss-rate" type="number" step="0.01" value="${Number(defaultRule.issRate || 0)}" /></div>
        <div class="field"><label>ISS retido</label><select id="nfse-iss-withheld"><option value="false">Nao</option><option value="true">Sim</option></select></div>
        <div class="field"><label>Exigibilidade ISS</label><select id="nfse-iss-exigibility"><option>Exigivel</option><option>Nao incidencia</option><option>Isencao</option><option>Exportacao</option><option>Imunidade</option><option>Exigibilidade suspensa</option></select></div>
        <div class="field"><label>Natureza</label><input id="nfse-nature" value="Prestacao de servico" /></div>
        <div class="field"><label>Serie DPS/RPS</label><input id="nfse-serie" value="1" /></div>
        <div class="field"><label>Ambiente</label><input value="${state.settings.fiscalEnvironment}" readonly /></div>
      </div>
      <div class="field"><label>Discriminacao do servico</label><textarea id="nfse-description" rows="4" placeholder="Descreva o servico prestado"></textarea></div>
      <div class="fiscal-note">A tela segue a separacao exigida para servicos. O leiaute final de envio deve ser validado contra XSD, anexos de dominio, regras municipais e Nota Tecnica vigente antes de producao.</div>
    </div>
  `;
}

function renderReports() {
  const salesTotal = reportRows(state.sales, "date").reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const stockCost = state.products.reduce((sum, product) => sum + Number(product.stock || 0) * Number(product.cost || 0), 0);
  const receivableOpen = state.receivables.filter((row) => !row.paid && !row.cancelled).reduce((sum, row) => sum + financeBalance(row), 0);
  const payableOpen = state.payables.filter((row) => !row.paid && !row.cancelled).reduce((sum, row) => sum + financeBalance(row), 0);
  const groups = [
    ["Produtos", "Curva ABC, historico, lucratividade, mais vendidos, menos vendidos, estoque minimo, negativo, fiscal, composicao e grade."],
    ["Estoque", "Saldo atual, estoque minimo, sugestao de compra, custo parado e movimentacoes."],
    ["Vendas", "Historico, por cliente, vendedor, PDV, forma de pagamento, CFOP/CSOSN e produtos."],
    ["Financeiro", "Contas a receber, contas a pagar, resumo caixa, movimento caixa, balanco, cartao e plano de contas."],
    ["Fiscal", "NF-e, NFC-e, NFS-e, status, XML, protocolos, contingencia, cancelamento e DANFE/DANFSe."],
    ["Compras", "Entradas, fornecedores, documentos, totais, estoque e financeiro gerado."],
    ["Producao", "Fabricacoes, consumo de componentes, custo e movimentos de estoque."],
    ["Caixa", "Aberturas, fechamentos, vendas, valor contado e diferencas."],
    ["Ticket Medio", "Ticket medio por venda, forma de pagamento, horario e operador."],
    ["Operacao", "Atendimento, fechamento de caixa, produtividade e auditoria."],
    ["Rastreabilidade", "Lotes, validade, saldo e produtos rastreados."],
    ["Depositos", "Saldos e transferencias entre locais de estoque."],
    ["Devolucoes", "Devolucoes parciais, totais, trocas e creditos."],
    ["Conciliacao", "Movimentos bancarios importados por OFX e conciliacao."]
  ];
  return `
    <section class="panel">
      <div class="panel-head"><h2>Relatorios</h2><div class="actions"><button class="btn" id="print-report">Imprimir / PDF</button><button class="btn primary" id="export-report">Exportar CSV</button></div></div>
      <div class="panel-body grid">
        <div class="form-card grid four">
          <div class="field"><label>Periodo inicial</label><input id="report-from" type="date" value="${reportPeriod.from}" /></div>
          <div class="field"><label>Periodo final</label><input id="report-to" type="date" value="${reportPeriod.to}" /></div>
          <button class="btn primary" id="apply-report-period" type="button">Aplicar periodo</button>
        </div>
        <div class="grid four">
          <div class="kpi"><small>Vendas</small><strong>${money(salesTotal)}</strong></div>
          <div class="kpi"><small>Estoque a custo</small><strong>${money(stockCost)}</strong></div>
          <div class="kpi"><small>A receber aberto</small><strong>${money(receivableOpen)}</strong></div>
          <div class="kpi"><small>A pagar aberto</small><strong>${money(payableOpen)}</strong></div>
        </div>
        <div class="grid two">
          ${groups.map(([title, text]) => `<div class="form-card"><h3>${title}</h3><p class="muted">${text}</p><button class="btn" data-report="${title}">Abrir relatorio</button></div>`).join("")}
        </div>
        <div class="form-card" style="grid-column: 1 / -1">
          <h3>${reportTitle()}</h3>
          ${reportTable()}
        </div>
        <div class="form-card">
          <h3>Auditoria recente</h3>
          <div class="table-wrap"><table><thead><tr><th>Data</th><th>Usuario</th><th>Acao</th><th>Detalhe</th></tr></thead><tbody>${(state.auditLogs || []).slice(0, 12).map((log) => `<tr><td>${new Date(log.date).toLocaleString("pt-BR")}</td><td>${log.user}</td><td>${log.action}</td><td>${log.detail}</td></tr>`).join("")}</tbody></table></div>
        </div>
      </div>
    </section>
  `;
}

function reportTitle() {
  return ["Produtos", "Estoque", "Vendas", "Financeiro", "Fiscal", "Compras", "Producao", "Caixa", "Ticket Medio", "Operacao", "Rastreabilidade", "Depositos", "Devolucoes", "Conciliacao"].includes(currentTab) ? `Relatorio - ${currentTab}` : "Resumo operacional";
}

function reportRows(rows, dateField = "date") {
  return (rows || []).filter((row) => {
    const value = String(row[dateField] || row.date || row.due || row.issuedAt || "").slice(0, 10);
    return !value || ((!reportPeriod.from || value >= reportPeriod.from) && (!reportPeriod.to || value <= reportPeriod.to));
  });
}

function reportTable() {
  const table = (headers, rows) => `
    <div class="table-wrap"><table><thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((item) => `<td>${item}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  `;
  if (currentTab === "Produtos") {
    return table(["Produto", "Tipo", "Fiscal", "Custo", "Venda", "Composicao"], state.products.map((product) => [
      product.description,
      product.type || "-",
      [product.ncm || "-", product.cfop || "-", product.cst || "-"].join(" / "),
      money(product.cost),
      money(product.price),
      product.isBundle ? `${(product.composition || []).length} componentes` : "-"
    ]));
  }
  if (currentTab === "Estoque") {
    return table(["Produto", "Atual", "Minimo", "Sugerido", "Custo parado", "Situacao"], state.products.map((product) => [
      product.description,
      Number(product.stock || 0),
      Number(product.minStock || 0),
      Math.max(0, Number(product.minStock || 0) - Number(product.stock || 0)),
      money(Number(product.stock || 0) * Number(product.cost || 0)),
      product.stock <= product.minStock ? "Comprar" : "OK"
    ]));
  }
  if (currentTab === "Vendas") {
    return table(["Numero", "Data", "Cliente", "Tipo", "Pagamento", "Total"], reportRows(state.sales, "date").map((sale) => [
      sale.id,
      sale.date,
      sale.customer,
      sale.type,
      sale.payment || "-",
      money(sale.total)
    ]));
  }
  if (currentTab === "Financeiro") {
    const rows = [
      ...reportRows(state.receivables, "due").map((row) => ["Receber", row.customer, row.due, money(row.value), row.paid ? "Recebido" : "Aberto"]),
      ...reportRows(state.payables, "due").map((row) => ["Pagar", row.supplier, row.due, money(row.value), row.paid ? "Pago" : "Aberto"])
    ];
    return table(["Tipo", "Nome", "Vencimento", "Valor", "Status"], rows);
  }
  if (currentTab === "Fiscal") {
    return table(["Numero", "Modelo", "Status", "Cliente/Tomador", "Total", "Chave", "Protocolo"], reportRows(state.fiscalQueue, "issuedAt").map((row) => [
      row.id,
      row.model,
      row.status,
      row.customer,
      money(row.total),
      row.key || "-",
      row.protocol || "-"
    ]));
  }
  if (currentTab === "Compras") {
    return table(["Numero", "Data", "Fornecedor", "Documento", "Chave de acesso", "Total", "Status"], reportRows(state.purchases, "date").map((row) => [
      row.id, row.date || "-", row.supplier || "-", row.document || "-", row.accessKey || "-", money(row.total), row.status || (row.cancelled ? "Cancelada" : "Finalizada")
    ]));
  }
  if (currentTab === "Producao") {
    return table(["Data", "Produto", "Planejado", "Produzido", "Perda", "Rendimento"], reportRows(state.productions || [], "date").map((row) => [
      row.date, row.product, row.plannedQty, row.actualQty, row.loss, pct(row.yieldPercent)
    ]));
  }
  if (currentTab === "Caixa") {
    return table(["Terminal", "Abertura", "Fechamento", "Operador", "Encarregado", "Vendas", "Total vendas", "Suprimentos", "Sangrias", "Esperado", "Contado", "Diferenca"], reportRows(state.cashClosures || [], "closedAt").map((row) => [
      row.terminal, new Date(row.openedAt).toLocaleString("pt-BR"), new Date(row.closedAt).toLocaleString("pt-BR"), row.openedBy || "-", row.responsible || row.authorizedBy || "-", row.salesCount, money(row.salesTotal), money(row.supplies), money(row.withdrawals), money(row.expectedAmount), money(row.closedAmount), money(row.difference)
    ]));
  }
  if (currentTab === "Ticket Medio") {
    const periodSales = reportRows(state.sales, "date");
    const salesTotal = periodSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const byPayment = periodSales.reduce((acc, sale) => {
      const key = sale.payment || "Nao informado";
      acc[key] = acc[key] || { total: 0, count: 0 };
      acc[key].total += Number(sale.total || 0);
      acc[key].count += 1;
      return acc;
    }, {});
    return table(["Grupo", "Vendas", "Total", "Ticket medio"], [
      ["Geral", periodSales.length, money(salesTotal), money(periodSales.length ? salesTotal / periodSales.length : 0)],
      ...Object.entries(byPayment).map(([key, value]) => [key, value.count, money(value.total), money(value.count ? value.total / value.count : 0)])
    ]);
  }
  if (currentTab === "Operacao") {
    const periodSales = reportRows(state.sales, "date");
    const salesTotal = periodSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const salesByPayment = periodSales.reduce((acc, sale) => {
      const key = sale.payment || "Nao informado";
      acc[key] = (acc[key] || 0) + Number(sale.total || 0);
      return acc;
    }, {});
    return table(["Indicador", "Valor"], [
      ["Vendas registradas", periodSales.length],
      ["Ticket medio", money(periodSales.length ? salesTotal / periodSales.length : 0)],
      ["Itens em estoque minimo", state.products.filter((product) => product.stock <= product.minStock).length],
      ...Object.entries(salesByPayment).map(([key, value]) => [`Forma ${key}`, money(value)])
    ]);
  }
  if (currentTab === "Rastreabilidade") {
    return table(["Produto", "Lote", "Validade", "Quantidade", "Situacao"], (state.stockLots || []).map((row) => [row.product, row.lot, row.expiry || "-", row.qty, row.expiry && daysUntil(row.expiry) <= 30 ? "Atencao" : "Regular"]));
  }
  if (currentTab === "Depositos") {
    return table(["Deposito", "Produto", "Saldo"], (state.warehouseStocks || []).map((row) => [row.warehouse, row.product, row.qty]));
  }
  if (currentTab === "Devolucoes") {
    return table(["Venda", "Cliente", "Data", "Tipo", "Valor", "Itens"], state.sales.flatMap((sale) => (sale.returns || []).map((row) => [sale.id, sale.customer, row.date, row.type, money(row.value), row.items.map((item) => `${item.qty} ${item.description}`).join(", ")])));
  }
  if (currentTab === "Conciliacao") {
    return table(["Data", "Documento", "Historico", "Valor", "Status"], (state.bankTransactions || []).map((row) => [row.date, row.fitId || "-", row.memo, money(row.amount), row.reconciled ? "Conciliado" : "Pendente"]));
  }
  return table(["Area", "Situacao"], [
    ["Produtos", `${state.products.length} cadastrados`],
    ["Vendas", `${state.sales.length} lancadas`],
    ["Financeiro", `${state.receivables.length + state.payables.length} titulos`],
    ["Fiscal", `${state.fiscalQueue.length} documentos na fila`]
  ]);
}

function renderSettings() {
  ensureFiscalRuleCoverage();
  const users = state.users || [];
  const readiness = operationReadiness();
  return `
    <section class="panel">
      <div class="panel-head"><h2>Configuracoes</h2><button class="btn primary" id="save-settings">Salvar configuracoes</button></div>
      <div class="panel-body grid two">
        <form class="form-card" id="settings-form">
          <div class="field"><label>Empresa</label><input id="set-company" value="${state.settings.company}" /></div>
          <div class="field"><label>CNPJ/CPF</label><input id="set-document" value="${state.settings.document || ""}" /></div>
          <div class="grid two">
            <div class="field"><label>Inscricao estadual</label><input id="set-ie" value="${state.settings.stateRegistration || ""}" /></div>
            <div class="field"><label>Inscricao municipal</label><input id="set-im" value="${state.settings.municipalRegistration || ""}" /></div>
          </div>
          <div class="field"><label>UF</label><input id="set-uf" value="${state.settings.uf}" maxlength="2" /></div>
          <div class="field"><label>Regime tributario</label><select id="set-regime"><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select></div>
          <div class="field"><label>CRT aplicado</label><input value="${taxRegimeCode(state.settings.regime)}" readonly /></div>
          <div class="field"><label>Ambiente fiscal</label><select id="set-env"><option>Homologacao</option><option>Producao</option></select></div>
          <div class="grid two">
            <div class="field"><label>Motor fiscal</label><select id="set-fiscal-engine"><option>ACBrLib</option><option>ACBrMonitor</option></select></div>
            <div class="field"><label>Host ACBrMonitor</label><input id="set-acbr-host" value="${escapeAttr(state.settings.acbrHost || "127.0.0.1")}" /></div>
            <div class="field"><label>Porta ACBrMonitor</label><input id="set-acbr-port" type="number" value="${Number(state.settings.acbrPort || 3436)}" /></div>
            <div class="field"><label>URL do agente fiscal Windows</label><input id="set-acbr-api-url" value="${escapeAttr(state.settings.acbrApiUrl || "")}" placeholder="https://agente-fiscal.exemplo.com" /></div>
            <div class="field"><label>Token do agente fiscal</label><input id="set-acbr-api-token" type="password" placeholder="${state.settings.acbrApiTokenConfigured ? "Token protegido configurado" : "Informe o token seguro"}" /></div>
            <div class="field"><label>Responsavel fiscal</label><input id="set-fiscal-responsible" value="${escapeAttr(state.settings.fiscalResponsible || "")}" /></div>
            <div class="field"><label>Certificado A1</label><input id="set-certificate-name" value="${escapeAttr(state.settings.certificateName || "")}" placeholder="Nome/arquivo do certificado" /></div>
            <div class="field"><label>Senha certificado A1</label><input id="set-certificate-password" type="password" placeholder="${state.settings.certificatePasswordConfigured ? "Senha protegida configurada" : "Informar no provedor"}" /></div>
            <div class="field"><label>Validade certificado</label><input id="set-certificate-expires" type="date" value="${state.settings.certificateExpiresAt || ""}" /></div>
            <div class="field"><label>Credenciamento SEFAZ</label><select id="set-sefaz-credentialed"><option value="false">Pendente</option><option value="true">Credenciado</option></select></div>
            <div class="field"><label>UF credenciada SEFAZ</label><input id="set-sefaz-uf" value="${escapeAttr(state.settings.sefazUf || state.settings.uf || "")}" maxlength="2" /></div>
            <div class="field"><label>ID CSC NFC-e</label><input id="set-csc-id" value="${escapeAttr(state.settings.cscId || "")}" /></div>
            <div class="field"><label>CSC NFC-e</label><input id="set-csc" type="password" placeholder="${state.settings.cscConfigured ? "CSC protegido configurado" : "Informar no provedor"}" /></div>
            <div class="field"><label>URL QR Code NFC-e</label><input id="set-nfce-qrcode-url" value="${escapeAttr(state.settings.nfceQrCodeUrl || "")}" placeholder="Padrao da UF quando vazio" /></div>
            <div class="field"><label>URL consulta NFC-e</label><input id="set-nfce-consulta-url" value="${escapeAttr(state.settings.nfceConsultaUrl || "")}" placeholder="Padrao da UF quando vazio" /></div>
            <div class="field"><label>Padrao NFS-e</label><select id="set-nfse-standard"><option>Nacional</option><option>Municipal</option></select></div>
            <div class="field"><label>Provedor NFS-e municipal</label><input id="set-nfse-provider" value="${escapeAttr(state.settings.nfseProvider || "")}" placeholder="Ex.: padrao nacional ou provedor municipal" /></div>
            <div class="field"><label>Codigo municipio NFS-e</label><input id="set-nfse-city-code" value="${escapeAttr(state.settings.nfseCityCode || "")}" /></div>
          </div>
          <div class="actions">
            <button class="btn" id="validate-fiscal-setup" type="button">Validar prontidao fiscal</button>
            <span class="badge ${fiscalReadiness().ok ? "ok" : "warn"}">${fiscalReadiness().label}</span>
          </div>
          <div class="grid two">
            <div class="field"><label>CEP</label><input id="set-cep" value="${state.settings.cep || ""}" /></div>
            <div class="field"><label>Cidade</label><input id="set-city" value="${state.settings.city || ""}" /></div>
            <div class="field"><label>Codigo IBGE da cidade</label><input id="set-city-code" value="${state.settings.cityCode || ""}" /></div>
            <div class="field"><label>Endereco</label><input id="set-address" value="${state.settings.address || ""}" /></div>
            <div class="field"><label>Numero</label><input id="set-number" value="${state.settings.number || ""}" /></div>
            <div class="field"><label>Bairro</label><input id="set-district" value="${state.settings.district || ""}" /></div>
          </div>
        </form>
        <div class="form-card">
          <h3>Regra fiscal</h3>
          <div class="grid four">
            <div class="field"><label>Nome da regra</label><input id="rule-name" placeholder="Venda interna" /></div>
            <div class="field"><label>Modelo</label><select id="rule-model"><option>NF-e</option><option>NFC-e</option><option>NFS-e</option></select></div>
            <div class="field"><label>Regime</label><select id="rule-regime"><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select></div>
            <div class="field"><label>UF</label><input id="rule-uf" value="${state.settings.uf}" maxlength="2" /></div>
            <div class="field"><label>Municipio</label><input id="rule-municipio" value="${state.settings.city || ""}" /></div>
            <div class="field"><label>Operacao</label><input id="rule-operation" value="Venda de mercadoria" /></div>
            <div class="field"><label>CFOP</label><input id="rule-cfop" value="5102" /></div>
            <div class="field"><label>CST/CSOSN</label><input id="rule-cst" value="102" /></div>
            <div class="field"><label>CSOSN</label><input id="rule-csosn" value="102" /></div>
            <div class="field"><label>NCM</label><input id="rule-ncm" value="19059090" /></div>
            <div class="field"><label>CEST</label><input id="rule-cest" /></div>
            <div class="field"><label>Origem</label><input id="rule-origin" value="0" /></div>
            <div class="field"><label>CST PIS/COFINS</label><input id="rule-pis-cofins-cst" value="49" /></div>
            <div class="field"><label>PIS %</label><input id="rule-pis-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>COFINS %</label><input id="rule-cofins-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>ICMS %</label><input id="rule-icms-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>ISS %</label><input id="rule-iss-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>FCP %</label><input id="rule-fcp-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>MVA %</label><input id="rule-mva-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Classificacao IBS</label><input id="rule-ibs" value="000001" /></div>
            <div class="field"><label>Classificacao CBS</label><input id="rule-cbs" value="000001" /></div>
            <div class="field"><label>CST IBS/CBS</label><input id="rule-ibs-cbs-cst" value="000" /></div>
            <div class="field"><label>IBS %</label><input id="rule-ibs-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>CBS %</label><input id="rule-cbs-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>IBS UF %</label><input id="rule-ibs-uf-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>IBS Municipio %</label><input id="rule-ibs-city-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>CBS Federal %</label><input id="rule-cbs-federal-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Credito presumido %</label><input id="rule-presumed-credit-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Ano transicao</label><input id="rule-transition-year" type="number" value="2026" /></div>
            <div class="field"><label>Reducao base reforma %</label><input id="rule-reform-reduction-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Imp. seletivo %</label><input id="rule-selective-rate" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Servico LC 116</label><input id="rule-service-code" /></div>
            <div class="field"><label>Servico municipal</label><input id="rule-city-service-code" /></div>
            <div class="field"><label>Beneficio fiscal</label><input id="rule-tax-benefit" /></div>
            <div class="field"><label>Motivo desoneracao</label><input id="rule-reduction-reason" /></div>
            <div class="field"><label>Vigencia inicial</label><input id="rule-valid-from" type="date" value="${today()}" /></div>
            <div class="field"><label>Vigencia final</label><input id="rule-valid-to" type="date" /></div>
          </div>
          <button class="btn primary" id="save-fiscal-rule" type="button">Cadastrar regra</button>
          <div class="table-wrap">
            <table><thead><tr><th>Regra</th><th>Regime</th><th>UF</th><th>Modelo</th><th>CFOP</th><th>CST/CSOSN</th><th>NCM</th><th>ICMS</th><th>IBS</th><th>CBS</th><th>Vigencia</th></tr></thead>
            <tbody>${(state.fiscalRules || []).map((rule) => `<tr><td>${rule.name}</td><td>${rule.regime}</td><td>${rule.uf}</td><td>${rule.model}</td><td>${rule.cfop}</td><td>${rule.cst || rule.csosn}</td><td>${rule.ncm || "-"}</td><td>${pct(rule.icmsRate)}</td><td>${pct(rule.ibsRate)}</td><td>${pct(rule.cbsRate)}</td><td>${rule.validFrom || "-"} a ${rule.validTo || "sem fim"}</td></tr>`).join("")}</tbody></table>
          </div>
        </div>
        <div class="form-card">
          <h3>Operacao da rede e seguranca</h3>
          <p class="muted">Backup local, restauracao controlada e exportacao para suporte do provedor.</p>
          <div class="actions">
            <button class="btn primary" id="export-backup" type="button">Baixar backup</button>
            <button class="btn" id="export-complete-csv" type="button">Exportar cadastros CSV</button>
            <label class="btn" for="restore-backup">Restaurar backup</label>
            <input id="restore-backup" type="file" accept="application/json" hidden />
            <label class="btn" for="import-master-csv">Importar cadastros CSV</label>
            <input id="import-master-csv" type="file" accept=".csv,text/csv" hidden />
            <button class="btn" id="sync-now" type="button">Sincronizar agora</button>
          </div>
          <div class="grid two">
            <div class="field"><label>Fechar movimentos ate</label><input id="close-period-date" type="date" value="${state.settings.closedThrough || ""}" /></div>
            <button class="btn" id="close-period" type="button">Fechar periodo</button>
          </div>
          <div class="grid two">
            <div class="field"><label>Velocidade serial PDV/balanca</label><input id="set-pdv-baud-rate" type="number" value="${Number(state.settings.pdvBaudRate || 9600)}" /></div>
            <div class="field"><label>Caracteres por linha impressora</label><input id="set-printer-chars" type="number" value="${Number(state.settings.printerCharsPerLine || 48)}" /></div>
            <div class="field"><label>Webhook geral de alertas</label><input id="set-alert-webhook" value="${escapeAttr(state.settings.alertWebhookUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>Token webhook de alertas</label><input id="set-alert-webhook-token" type="password" placeholder="${state.settings.alertWebhookTokenConfigured ? "Token protegido configurado" : "Informe se o provedor exigir"}" /></div>
            <div class="field"><label>Webhook WhatsApp</label><input id="set-whatsapp-webhook" value="${escapeAttr(state.settings.whatsappWebhookUrl || "")}" placeholder="Preencher ao escolher o provedor" /></div>
            <div class="field"><label>Token WhatsApp</label><input id="set-whatsapp-webhook-token" type="password" placeholder="${state.settings.whatsappWebhookTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
            <div class="field"><label>Webhook e-mail</label><input id="set-email-webhook" value="${escapeAttr(state.settings.emailWebhookUrl || "")}" placeholder="Preencher ao escolher o provedor" /></div>
            <div class="field"><label>Token e-mail</label><input id="set-email-webhook-token" type="password" placeholder="${state.settings.emailWebhookTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
            <div class="field"><label>Provedor PIX/boleto</label><input id="set-payment-provider" value="${escapeAttr(state.settings.paymentProvider || "")}" placeholder="Nome do provedor contratado" /></div>
            <div class="field"><label>URL API PIX</label><input id="set-pix-api-url" value="${escapeAttr(state.settings.pixApiUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>URL API boleto</label><input id="set-boleto-api-url" value="${escapeAttr(state.settings.boletoApiUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>Cabecalho de autenticacao</label><input id="set-payment-auth-header" value="${escapeAttr(state.settings.paymentAuthHeader || "Authorization")}" /></div>
            <div class="field"><label>Prefixo do token</label><input id="set-payment-auth-scheme" value="${escapeAttr(state.settings.paymentAuthScheme || "Bearer")}" placeholder="Bearer, Token ou vazio" /></div>
            <div class="field"><label>URL de retorno/callback</label><input id="set-payment-callback-url" value="${escapeAttr(state.settings.paymentCallbackUrl || "")}" placeholder="Preencher no dominio definitivo" /></div>
            <div class="field"><label>Token API PIX</label><input id="set-pix-api-token" type="password" placeholder="${state.settings.pixApiTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
            <div class="field"><label>Token API boleto</label><input id="set-boleto-api-token" type="password" placeholder="${state.settings.boletoApiTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
          </div>
          <div class="actions"><button class="btn" id="generate-alerts" type="button">Atualizar alertas operacionais</button><button class="btn primary" id="dispatch-alerts" type="button">Enviar alertas pendentes</button></div>
          <div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Mensagem</th><th>Status</th></tr></thead><tbody>${(state.alertOutbox || []).slice(-10).reverse().map((row) => `<tr><td>${row.date}</td><td>${row.type}</td><td>${row.message}</td><td>${row.status}</td></tr>`).join("")}</tbody></table></div>
        </div>
        <div class="form-card">
          <h3>Prontidao para cliente piloto</h3>
          <p class="muted">${readiness.ready}/${readiness.items.length} pontos essenciais preparados.</p>
          <div class="table-wrap"><table><thead><tr><th>Item</th><th>Situacao</th></tr></thead><tbody>${readiness.items.map((item) => `<tr><td>${item.label}</td><td><span class="badge ${item.ok ? "ok" : "warn"}">${item.ok ? "Pronto" : "Pendente"}</span></td></tr>`).join("")}</tbody></table></div>
        </div>
        <div class="form-card">
          <h3>Novo usuario</h3>
          <div class="grid two">
            <div class="field"><label>Nome</label><input id="user-name" /></div>
            <div class="field"><label>Usuario</label><input id="user-login" /></div>
            <div class="field"><label>Senha inicial</label><input id="user-password" type="password" /></div>
            <div class="field"><label>Perfil</label><select id="user-role">${Object.keys(rolePermissions).map((role) => `<option>${role}</option>`).join("")}</select></div>
          </div>
          <div class="grid four">${rolePermissions.Administrador.map((permission) => `<label class="check-row"><input class="user-permission" type="checkbox" value="${permission}" /> ${permissionLabel(permission)}</label>`).join("")}</div>
          <button class="btn primary" id="save-user" type="button">Cadastrar usuario</button>
        </div>
        <div class="form-card">
          <h3>Alterar minha senha</h3>
          <div class="grid two">
            <div class="field"><label>Senha atual</label><input id="current-password" type="password" /></div>
            <div class="field"><label>Nova senha</label><input id="new-password" type="password" minlength="8" /></div>
          </div>
          <button class="btn primary" id="change-password" type="button">Alterar senha</button>
        </div>
        <div class="table-wrap" style="grid-column: 1 / -1">
          <table>
            <thead><tr><th>Usuario</th><th>Nome</th><th>Perfil</th><th>Permissoes</th><th>Status</th></tr></thead>
            <tbody>${users.map((user) => `<tr><td>${user.username}</td><td>${user.name}</td><td>${user.role}</td><td>${(user.permissions || rolePermissions[user.role] || []).map(permissionLabel).join(", ")}</td><td><span class="badge ${user.active === false ? "danger" : "ok"}">${user.active === false ? "Bloqueado" : "Ativo"}</span></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderPdv() {
  const subtotal = saleItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = Number(byId("pdv-discount")?.value || 0);
  const addition = Number(byId("pdv-addition")?.value || 0);
  const total = Math.max(0, subtotal - discount + addition - pendingExchangeCredit);
  const register = state.cashRegister || {};
  const balance = currentCashBalance();
  const staleRegister = isCashRegisterStale();
  if (!register.open) {
    return `
      <div class="pdv closed">
        <aside class="pdv-side">
          <div class="pdv-title">CAIXA FECHADO</div>
          <div class="pdv-client"><strong>Terminal:</strong> ${register.terminal || "SERIE 1"}</div>
          <div class="empty"><strong>${state.settings.company}</strong><br />Abra o caixa para iniciar vendas.</div>
        </aside>
        <section class="pdv-main">
          <div class="form-card cash-open-card">
            <h2>Abertura de caixa</h2>
            <div class="grid four">
              <div class="field"><label>Valor inicial</label><input id="cash-open-amount" type="number" step="0.01" value="0" /></div>
              <div class="field"><label>Terminal</label><input id="cash-open-terminal" value="${register.terminal || "SERIE 1"}" /></div>
              <div class="field"><label>Operador</label><input readonly value="${state.settings.user}" /></div>
              <div class="field"><label>Senha do operador</label><input id="cash-open-password" type="password" autocomplete="current-password" /></div>
            </div>
            <button class="btn primary" id="open-cash-register">Abrir caixa</button>
          </div>
        </section>
      </div>
    `;
  }
  return `
    <div class="pdv">
      <aside class="pdv-side">
        <div class="pdv-side-head">
          <div class="pdv-title">CAIXA ABERTO</div>
          <div class="pdv-meta"><strong>Venda ${nextId(state.sales)}</strong><span>${new Date().toLocaleString("pt-BR")}</span></div>
          <div class="pdv-client"><strong>Cliente:</strong> <span id="pdv-client-label">Consumidor Final</span></div>
        </div>
        <div class="pdv-brand">
          ${brandMarkup()}
          <strong>${state.settings.company}</strong>
          <span>${register.terminal || "SERIE 1"} | ${state.settings.user}</span>
        </div>
        <div class="shortcut-grid">
          <button class="btn" id="focus-sale-search">F2 Produto</button>
          <button class="btn" id="focus-sale-customer">F9 Cliente</button>
          <button class="btn" id="hold-sale">F12 Espera</button>
          <button class="btn" id="recover-sale">Recuperar</button>
          <button class="btn" id="toggle-pdv-options">F1 Opcoes</button>
          <button class="btn" id="print-last-sale">Imprimir</button>
          <button class="btn danger" id="cancel-sale">Cancelar</button>
          <button class="btn primary" id="finish-sale">Finalizar</button>
        </div>
      </aside>
      <section class="pdv-main">
        <div class="pdv-main-title"><strong>${staleRegister ? "CAIXA ANTERIOR PENDENTE DE FECHAMENTO" : "CAIXA ABERTO"}</strong><button class="btn" id="leave-pdv">Retaguarda</button></div>
        <div class="sale-inputs">
          <div class="field"><label>F12 Codigo | Codigo de barras | Descricao</label><input id="sale-search" placeholder="Digite e pressione Enter" /></div>
          <div class="field"><label>Qtd.</label><input id="sale-qty" type="number" value="1" /></div>
          <div class="field"><label>Preco</label><input id="sale-price" type="number" step="0.01" value="0" /></div>
          <div class="field"><label>Total item</label><input id="sale-item-total" readonly value="0,00" /></div>
        </div>
        <div class="table-wrap pdv-table">
          <table>
            <thead><tr><th>Item</th><th>Codigo</th><th>Descricao</th><th>Qtd</th><th>Un.</th><th>Preco</th><th>Total</th><th>Acao</th></tr></thead>
            <tbody>${saleItems.map((item, index) => `<tr><td>${index + 1}</td><td>${item.id}</td><td>${item.description}</td><td>${item.qty}</td><td>${item.unit}</td><td>${money(item.price)}</td><td>${money(item.qty * item.price)}</td><td><button class="btn danger" data-remove-sale-item="${index}" type="button">Remover</button></td></tr>`).join("")}</tbody>
          </table>
        </div>
        <div class="totals">
          <div class="total-box"><span>Desconto</span><strong>${money(discount)}</strong></div>
          <div class="total-box"><span>Acrescimo</span><strong>${money(addition)}</strong></div>
          <div class="total-box"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
          <div class="total-box grand-total"><span>Total</span><strong>${money(total)}</strong></div>
        </div>
        <div class="pdv-options" id="pdv-options" aria-hidden="true">
          <div class="pdv-options-head"><h2>Opcoes do caixa</h2><button class="btn" id="close-pdv-options">Fechar</button></div>
          <div class="pdv-options-grid">
            ${staleRegister ? `<div class="alert danger-alert pdv-all-columns"><strong>Operacao bloqueada:</strong> este caixa foi aberto em ${new Date(register.openedAt).toLocaleString("pt-BR")}. Realize a conferencia e o fechamento antes de iniciar as vendas de hoje.</div>` : ""}
            <div class="field"><label>Cliente</label><select id="sale-customer"><option>Consumidor Final</option>${state.people.filter((person) => person.type === "Cliente" && person.active !== false).map((person) => `<option>${person.name}</option>`).join("")}</select></div>
            <div class="field"><label>Vendedor</label><input readonly value="${state.settings.user}" /></div>
            <div class="field"><label>Vendas em espera</label><input readonly value="${(state.heldSales || []).length}" /></div>
            <div class="field"><label>Desconto</label><input id="pdv-discount" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Acrescimo</label><input id="pdv-addition" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Credito de troca</label><input readonly value="${money(pendingExchangeCredit)}" /></div>
            <div class="field"><label>Dinheiro</label><input id="pay-money" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>PIX</label><input id="pay-pix" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Debito</label><input id="pay-debit" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Credito</label><input id="pay-credit" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Crediario</label><input id="pay-store-credit" type="number" step="0.01" value="0" /></div>
            <div class="pdv-options-balance"><span>Saldo atual do caixa</span><strong>${money(balance)}</strong></div>
            <div class="field"><label>Valor do movimento</label><input id="cash-move-value" type="number" step="0.01" value="0" /></div>
            <div class="field pdv-wide"><label>Historico do movimento</label><input id="cash-move-history" placeholder="Informe o motivo da sangria ou suprimento" /></div>
            <div class="field pdv-wide"><label>Busca de preco</label><input id="price-check-search" placeholder="Codigo, codigo de barras ou descricao" /></div>
            <div class="field"><label>Preco consultado</label><input id="price-check-result" readonly placeholder="Informe um produto" /></div>
          </div>
          <div class="actions pdv-options-actions">
            <button class="btn" id="price-check">Consultar preco</button>
            <button class="btn" id="cash-withdrawal">Recolher valores / Sangria</button>
            <button class="btn" id="cash-supply">Entrada de troco / Suprimento</button>
            <button class="btn" id="print-cash-summary">Resumo do caixa</button>
            <button class="btn" id="connect-pdv-device">Conectar dispositivo</button>
            <button class="btn danger" id="close-cash-register">Fechar caixa</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function currentCashBalance() {
  const openedAt = state.cashRegister?.openedAt;
  if (!openedAt) return 0;
  const movements = (state.cash || []).filter((row) => row.cashRegisterOpenedAt === openedAt);
  if (!movements.length) return Number(state.cashRegister?.initialAmount || 0);
  return movements.reduce((sum, row) => sum + Number(row.in || 0) - Number(row.out || 0), 0);
}

function bindCurrentModule() {
  document.querySelectorAll("[data-product-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      captureProductDraft();
      currentTab = button.dataset.productTab;
      renderShell();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      captureProductDraft();
      currentTab = button.dataset.tab;
      renderShell();
    });
  });

  const openPdv = byId("open-pdv");
  if (openPdv) openPdv.addEventListener("click", () => { currentMode = "pdv"; renderShell(); });

  const lookupCep = byId("lookup-cep");
  if (lookupCep) lookupCep.addEventListener("click", lookupPersonCep);

  const savePerson = byId("save-person");
  if (savePerson) savePerson.addEventListener("click", savePersonRecord);
  const filterPeople = byId("filter-people");
  if (filterPeople) filterPeople.addEventListener("click", () => { personSearch = byId("person-search").value; renderShell(); });
  const copyPublicRegistration = byId("copy-public-registration");
  if (copyPublicRegistration) copyPublicRegistration.addEventListener("click", async () => {
    const link = `${location.origin}/cadastro-cliente.html?unidade=${encodeURIComponent(state.settings.tenantCode)}`;
    try {
      await copyText(link);
      alert("Link de cadastro desta unidade copiado.");
    } catch {
      alert(`Nao foi possivel copiar automaticamente. Link: ${link}`);
    }
  });
  document.querySelectorAll("[data-edit-person]").forEach((button) => button.addEventListener("click", () => editPersonRecord(Number(button.dataset.editPerson))));
  document.querySelectorAll("[data-toggle-person]").forEach((button) => button.addEventListener("click", () => togglePersonRecord(Number(button.dataset.togglePerson))));

  const saveProduct = byId("save-product");
  if (saveProduct) saveProduct.addEventListener("click", saveProductRecord);
  const filterProducts = byId("filter-products");
  if (filterProducts) filterProducts.addEventListener("click", () => { productSearch = byId("product-search").value; renderShell(); });
  document.querySelectorAll("[data-edit-product]").forEach((button) => button.addEventListener("click", () => editProductRecord(Number(button.dataset.editProduct))));
  document.querySelectorAll("[data-toggle-product]").forEach((button) => button.addEventListener("click", () => toggleProductRecord(Number(button.dataset.toggleProduct))));
  document.querySelectorAll("[data-label-product]").forEach((button) => button.addEventListener("click", () => printProductLabel(Number(button.dataset.labelProduct))));

  const addComposition = byId("add-composition");
  if (addComposition) addComposition.addEventListener("click", addCompositionRecord);

  document.querySelectorAll("[data-remove-composition]").forEach((button) => {
    button.addEventListener("click", () => {
      captureProductDraft();
      pendingComposition.splice(Number(button.dataset.removeComposition), 1);
      renderShell();
    });
  });

  const makeProduction = byId("make-production");
  if (makeProduction) makeProduction.addEventListener("click", makeProductionRecord);
  const planProduction = byId("plan-production");
  if (planProduction) planProduction.addEventListener("click", planProductionRecord);

  const saveStockMove = byId("save-stock-move");
  if (saveStockMove) saveStockMove.addEventListener("click", saveStockMoveRecord);
  const saveInventory = byId("save-inventory");
  if (saveInventory) saveInventory.addEventListener("click", saveInventoryRecord);
  const inventoryBarcode = byId("inventory-barcode");
  if (inventoryBarcode) inventoryBarcode.addEventListener("keydown", inventoryBarcodeRead);
  const saveTransfer = byId("save-transfer");
  if (saveTransfer) saveTransfer.addEventListener("click", saveStockTransferRecord);

  const newPurchase = byId("new-purchase");
  if (newPurchase) newPurchase.addEventListener("click", savePurchaseRecord);

  const addPurchaseItem = byId("add-purchase-item");
  if (addPurchaseItem) addPurchaseItem.addEventListener("click", addPurchaseItemRecord);

  const clearPurchaseItems = byId("clear-purchase-items");
  if (clearPurchaseItems) clearPurchaseItems.addEventListener("click", () => {
    purchaseItems = [];
    renderShell();
  });

  const purchaseXml = byId("purchase-xml");
  if (purchaseXml) purchaseXml.addEventListener("change", readPurchaseXml);

  document.querySelectorAll("[data-remove-purchase-item]").forEach((button) => {
    button.addEventListener("click", () => {
      purchaseItems.splice(Number(button.dataset.removePurchaseItem), 1);
      renderShell();
    });
  });
  document.querySelectorAll("[data-cancel-purchase]").forEach((button) => {
    button.addEventListener("click", () => cancelPurchaseRecord(Number(button.dataset.cancelPurchase)));
  });

  const saveOrder = byId("save-order");
  if (saveOrder) saveOrder.addEventListener("click", saveOrderRecord);
  const addOrderItem = byId("add-order-item");
  if (addOrderItem) addOrderItem.addEventListener("click", addOrderItemRecord);
  const clearOrderItems = byId("clear-order-items");
  if (clearOrderItems) clearOrderItems.addEventListener("click", () => {
    orderItems = [];
    renderShell();
  });
  document.querySelectorAll("[data-remove-order-item]").forEach((button) => {
    button.addEventListener("click", () => {
      orderItems.splice(Number(button.dataset.removeOrderItem), 1);
      renderShell();
    });
  });
  document.querySelectorAll("[data-convert-quote]").forEach((button) => {
    button.addEventListener("click", () => convertQuoteToOrder(Number(button.dataset.convertQuote)));
  });
  document.querySelectorAll("[data-cancel-sale-record]").forEach((button) => {
    button.addEventListener("click", () => cancelClosedSale(Number(button.dataset.cancelSaleRecord)));
  });
  document.querySelectorAll("[data-return-sale]").forEach((button) => {
    button.addEventListener("click", () => returnSaleRecord(Number(button.dataset.returnSale)));
  });
  document.querySelectorAll("[data-exchange-sale]").forEach((button) => {
    button.addEventListener("click", () => exchangeSaleRecord(Number(button.dataset.exchangeSale)));
  });

  const saveFinance = byId("save-finance");
  if (saveFinance) saveFinance.addEventListener("click", saveFinanceRecord);
  const saveReconciliation = byId("save-reconciliation");
  if (saveReconciliation) saveReconciliation.addEventListener("click", saveFinanceReconciliation);
  const importOfx = byId("import-ofx");
  if (importOfx) importOfx.addEventListener("change", importOfxFile);
  const saveAccount = byId("save-account");
  if (saveAccount) saveAccount.addEventListener("click", saveChartAccount);

  document.querySelectorAll("[data-pay]").forEach((button) => {
    button.addEventListener("click", () => payFinanceRecord(Number(button.dataset.pay)));
  });

  const saveSettings = byId("save-settings");
  if (saveSettings) {
    byId("set-regime").value = state.settings.regime || "Simples Nacional";
    byId("set-env").value = state.settings.fiscalEnvironment || "Homologacao";
    byId("set-fiscal-engine").value = state.settings.fiscalEngine || "ACBrLib";
    byId("set-sefaz-credentialed").value = String(Boolean(state.settings.sefazCredentialed));
    byId("set-nfse-standard").value = state.settings.nfseStandard || "Nacional";
    saveSettings.addEventListener("click", saveSettingsRecord);
  }

  const validateFiscalSetup = byId("validate-fiscal-setup");
  if (validateFiscalSetup) validateFiscalSetup.addEventListener("click", showFiscalReadiness);

  const saveUser = byId("save-user");
  if (saveUser) saveUser.addEventListener("click", saveUserRecord);

  const newFiscal = byId("new-fiscal");
  if (newFiscal) newFiscal.addEventListener("click", createFiscalRecord);
  const fiscalSale = byId("fiscal-sale-id");
  if (fiscalSale) fiscalSale.addEventListener("change", () => {
    const sale = (state.sales || []).find((item) => Number(item.id) === Number(fiscalSale.value));
    if (!sale) return;
    byId("fiscal-customer").value = sale.customer || "Consumidor Final";
    byId("fiscal-total").value = Number(sale.total || 0).toFixed(2);
  });

  const issueNfse = byId("issue-nfse");
  if (issueNfse) issueNfse.addEventListener("click", createNfseRecord);

  document.querySelectorAll("[data-fiscal-transmit]").forEach((button) => {
    button.addEventListener("click", () => transmitFiscalRecord(Number(button.dataset.fiscalTransmit)));
  });
  document.querySelectorAll("[data-fiscal-query]").forEach((button) => {
    button.addEventListener("click", () => queryFiscalRecord(Number(button.dataset.fiscalQuery)));
  });
  document.querySelectorAll("[data-fiscal-cce]").forEach((button) => {
    button.addEventListener("click", () => sendFiscalCorrection(Number(button.dataset.fiscalCce)));
  });

  document.querySelectorAll("[data-fiscal-print]").forEach((button) => {
    button.addEventListener("click", () => printFiscalRecord(Number(button.dataset.fiscalPrint)));
  });
  document.querySelectorAll("[data-fiscal-pdf]").forEach((button) => {
    button.addEventListener("click", () => downloadFiscalPdf(Number(button.dataset.fiscalPdf)));
  });

  document.querySelectorAll("[data-fiscal-xml]").forEach((button) => {
    button.addEventListener("click", () => exportFiscalXml(Number(button.dataset.fiscalXml)));
  });

  document.querySelectorAll("[data-fiscal-contingency]").forEach((button) => {
    button.addEventListener("click", () => markFiscalContingency(Number(button.dataset.fiscalContingency)));
  });

  document.querySelectorAll("[data-fiscal-cancel]").forEach((button) => {
    button.addEventListener("click", () => cancelFiscalRecord(Number(button.dataset.fiscalCancel)));
  });
  const fiscalImport = byId("fiscal-import-xml");
  if (fiscalImport) fiscalImport.addEventListener("change", importFiscalXml);
  const fiscalDistribution = byId("fiscal-distribution");
  if (fiscalDistribution) fiscalDistribution.addEventListener("click", distributeFiscalDocuments);
  const fiscalManifestKey = byId("fiscal-manifest-key");
  if (fiscalManifestKey) fiscalManifestKey.addEventListener("click", manifestFiscalRecord);
  const fiscalInutilize = byId("fiscal-inutilize");
  if (fiscalInutilize) fiscalInutilize.addEventListener("click", inutilizeFiscalRange);
  const retryFiscalQueue = byId("retry-fiscal-queue");
  if (retryFiscalQueue) retryFiscalQueue.addEventListener("click", retryPendingFiscalQueue);

  const exportReport = byId("export-report");
  if (exportReport) exportReport.addEventListener("click", exportReportCsv);
  const printReportButton = byId("print-report");
  if (printReportButton) printReportButton.addEventListener("click", printCurrentReport);
  const applyReportPeriod = byId("apply-report-period");
  if (applyReportPeriod) applyReportPeriod.addEventListener("click", () => {
    reportPeriod = { from: byId("report-from").value, to: byId("report-to").value };
    renderShell();
  });

  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      currentTab = button.dataset.report;
      renderShell();
    });
  });

  const exportBackup = byId("export-backup");
  if (exportBackup) exportBackup.addEventListener("click", exportBackupJson);
  const exportCompleteCsv = byId("export-complete-csv");
  if (exportCompleteCsv) exportCompleteCsv.addEventListener("click", exportCompleteCsvRecord);
  const importMasterCsv = byId("import-master-csv");
  if (importMasterCsv) importMasterCsv.addEventListener("change", importMasterCsvRecord);
  const generateAlerts = byId("generate-alerts");
  if (generateAlerts) generateAlerts.addEventListener("click", generateOperationalAlerts);
  const dispatchAlerts = byId("dispatch-alerts");
  if (dispatchAlerts) dispatchAlerts.addEventListener("click", dispatchOperationalAlerts);

  const restoreBackup = byId("restore-backup");
  if (restoreBackup) restoreBackup.addEventListener("change", restoreBackupJson);

  const syncNow = byId("sync-now");
  if (syncNow) syncNow.addEventListener("click", () => {
    save();
    alert(apiOnline ? "Sincronizacao enviada para a base do cliente." : "Sem API online. Dados permanecem salvos localmente.");
  });
  const closePeriod = byId("close-period");
  if (closePeriod) closePeriod.addEventListener("click", closeOperationalPeriod);
  const changePassword = byId("change-password");
  if (changePassword) changePassword.addEventListener("click", changeOwnPassword);

  const saveFiscalRule = byId("save-fiscal-rule");
  if (saveFiscalRule) saveFiscalRule.addEventListener("click", saveFiscalRuleRecord);

  const saleSearch = byId("sale-search");
  if (saleSearch) {
    saleSearch.focus();
    saleSearch.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addSaleItem();
      }
    });
  }

  const pdvOptions = byId("pdv-options");
  const setPdvOptions = (open) => {
    if (!pdvOptions) return;
    pdvOptions.classList.toggle("open", open);
    pdvOptions.setAttribute("aria-hidden", String(!open));
  };
  const togglePdvOptions = byId("toggle-pdv-options");
  if (togglePdvOptions) togglePdvOptions.addEventListener("click", () => setPdvOptions(!pdvOptions?.classList.contains("open")));
  const closePdvOptions = byId("close-pdv-options");
  if (closePdvOptions) closePdvOptions.addEventListener("click", () => setPdvOptions(false));
  const leavePdv = byId("leave-pdv");
  if (leavePdv) leavePdv.addEventListener("click", () => {
    currentMode = "backoffice";
    renderShell();
  });
  const focusSaleSearch = byId("focus-sale-search");
  if (focusSaleSearch) focusSaleSearch.addEventListener("click", () => saleSearch?.focus());
  const focusSaleCustomer = byId("focus-sale-customer");
  if (focusSaleCustomer) focusSaleCustomer.addEventListener("click", () => {
    setPdvOptions(true);
    byId("sale-customer")?.focus();
  });
  const saleCustomer = byId("sale-customer");
  if (saleCustomer) saleCustomer.addEventListener("change", () => {
    const label = byId("pdv-client-label");
    if (label) label.textContent = saleCustomer.value || "Consumidor Final";
  });
  document.onkeydown = currentMode === "pdv" ? (event) => {
    if (event.key === "F1") {
      event.preventDefault();
      setPdvOptions(!pdvOptions?.classList.contains("open"));
    } else if (event.key === "F2") {
      event.preventDefault();
      saleSearch?.focus();
    } else if (event.key === "F7") {
      event.preventDefault();
      byId("finish-sale")?.click();
    } else if (event.key === "F9") {
      event.preventDefault();
      focusSaleCustomer?.click();
    } else if (event.key === "F12") {
      event.preventDefault();
      byId("hold-sale")?.click();
    } else if (event.key === "Escape") {
      setPdvOptions(false);
    }
  } : null;

  const productPhoto = byId("product-photo");
  if (productPhoto) productPhoto.addEventListener("change", loadProductPhoto);

  const finishSale = byId("finish-sale");
  if (finishSale) finishSale.addEventListener("click", finishSaleRecord);

  const cancelSale = byId("cancel-sale");
  if (cancelSale) cancelSale.addEventListener("click", () => {
    if (saleItems.length) audit("Venda PDV cancelada", `${saleItems.length} itens removidos`);
    saleItems = [];
    authorizedDiscountValue = 0;
    save();
    renderShell();
  });

  const openCash = byId("open-cash-register");
  if (openCash) openCash.addEventListener("click", openCashRegister);

  const closeCash = byId("close-cash-register");
  if (closeCash) closeCash.addEventListener("click", closeCashRegister);

  const cashWithdrawal = byId("cash-withdrawal");
  if (cashWithdrawal) cashWithdrawal.addEventListener("click", () => cashMovement("Sangria"));

  const cashSupply = byId("cash-supply");
  if (cashSupply) cashSupply.addEventListener("click", () => cashMovement("Suprimento"));
  const priceCheck = byId("price-check");
  if (priceCheck) priceCheck.addEventListener("click", checkProductPrice);
  const priceCheckSearch = byId("price-check-search");
  if (priceCheckSearch) priceCheckSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkProductPrice();
    }
  });
  const printCashSummary = byId("print-cash-summary");
  if (printCashSummary) printCashSummary.addEventListener("click", printCurrentCashSummary);
  const pdvDiscount = byId("pdv-discount");
  if (pdvDiscount) pdvDiscount.addEventListener("change", async () => {
    const value = Number(pdvDiscount.value || 0);
    if (value <= authorizedDiscountValue) return;
    const authorization = await authorizePdvOperation("discount", "Autorizar desconto");
    if (!authorization) {
      pdvDiscount.value = String(authorizedDiscountValue);
      return;
    }
    authorizedDiscountValue = value;
    audit("Desconto PDV autorizado", `${money(value)} por ${authorization.authorizedBy}`);
    save();
  });

  const holdSale = byId("hold-sale");
  if (holdSale) holdSale.addEventListener("click", holdCurrentSale);

  const recoverSale = byId("recover-sale");
  if (recoverSale) recoverSale.addEventListener("click", recoverHeldSale);

  const printLastSale = byId("print-last-sale");
  if (printLastSale) printLastSale.addEventListener("click", printLastPdvSale);
  const connectPdvDevice = byId("connect-pdv-device");
  if (connectPdvDevice) connectPdvDevice.addEventListener("click", connectPdvPeripheral);

  document.querySelectorAll("[data-remove-sale-item]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = saleItems[Number(button.dataset.removeSaleItem)];
      const authorization = await authorizePdvOperation("remove_item", "Autorizar exclusao de item");
      if (!authorization) return;
      saleItems.splice(Number(button.dataset.removeSaleItem), 1);
      audit("Item removido do PDV", `${item?.description || "Item"} autorizado por ${authorization.authorizedBy}`);
      save();
      renderShell();
    });
  });
}

function isCashRegisterStale() {
  const openedAt = state.cashRegister?.openedAt;
  return Boolean(state.cashRegister?.open && openedAt && new Date(openedAt).toLocaleDateString("en-CA") !== today());
}

async function authorizePdvOperation(action, title) {
  const defaultUser = action === "cash_open" ? state.settings.user : "";
  const user = prompt(`${title}\nUsuario responsável:`, defaultUser);
  if (user === null || !user.trim()) return null;
  const password = prompt(`${title}\nSenha:`, "");
  if (password === null || !password) return null;
  if (!apiOnline || !sessionId) {
    alert("A autorizacao protegida exige conexao com a central para validar a senha.");
    return null;
  }
  try {
    return await api("/api/auth/authorize", {
      method: "POST",
      body: JSON.stringify({ tenantCode: state.settings.tenantCode, user: user.trim(), password, action })
    });
  } catch (error) {
    alert(error.message);
    return null;
  }
}

async function openCashRegister() {
  const password = byId("cash-open-password")?.value || "";
  if (!password) {
    alert("Informe a senha do operador para abrir o caixa.");
    return;
  }
  const authorization = await authorizePdvOperationWithPassword("cash_open", state.settings.user, password);
  if (!authorization) return;
  state.cashRegister = {
    open: true,
    openedAt: new Date().toISOString(),
    openedBy: state.settings.user,
    openedAuthorizedBy: authorization.authorizedBy,
    initialAmount: num("cash-open-amount"),
    terminal: byId("cash-open-terminal").value || "SERIE 1"
  };
  if (state.cashRegister.initialAmount > 0) {
    state.cash.push({
      id: nextId(state.cash),
      date: today(),
      account: "CAIXA",
      history: `Abertura de caixa ${state.cashRegister.terminal}`,
      in: state.cashRegister.initialAmount,
      out: 0,
      cashRegisterOpenedAt: state.cashRegister.openedAt
    });
  }
  audit("Caixa aberto", `${state.cashRegister.terminal} ${money(state.cashRegister.initialAmount)}`);
  save();
  renderShell();
}

async function authorizePdvOperationWithPassword(action, user, password) {
  if (!apiOnline || !sessionId) {
    alert("A autorizacao protegida exige conexao com a central para validar a senha.");
    return null;
  }
  try {
    return await api("/api/auth/authorize", {
      method: "POST",
      body: JSON.stringify({ tenantCode: state.settings.tenantCode, user, password, action })
    });
  } catch (error) {
    alert(error.message);
    return null;
  }
}

async function closeCashRegister() {
  if (saleItems.length && !confirm("Existe venda em andamento. Fechar o caixa mesmo assim?")) return;
  const authorization = await authorizePdvOperation("cash_close", "Autorizar fechamento do caixa");
  if (!authorization) return;
  const total = currentCashBalance();
  const countedText = prompt(`Informe o valor contado no caixa. Valor esperado: ${money(total)}`, total.toFixed(2).replace(".", ","));
  if (countedText === null) return;
  const countedAmount = Number(String(countedText).replace(",", "."));
  if (!Number.isFinite(countedAmount) || countedAmount < 0) {
    alert("Informe um valor contado valido.");
    return;
  }
  const register = state.cashRegister || {};
  const responsible = prompt("Nome do encarregado responsavel pela conferencia:", authorization.authorizedBy) || authorization.authorizedBy;
  const closingNote = prompt("Observacao da conferencia ou justificativa de diferenca:", "") || "";
  const sales = state.sales.filter((sale) => sale.type === "PDV" && sale.status === "Fechado" && sale.cashRegisterOpenedAt === register.openedAt);
  const paymentTotals = {};
  sales.forEach((sale) => (sale.payments || []).forEach((payment) => {
    paymentTotals[payment.method] = Number(paymentTotals[payment.method] || 0) + Number(payment.value || 0);
  }));
  const cashMovements = (state.cash || []).filter((row) => row.cashRegisterOpenedAt === register.openedAt);
  const closure = {
    id: nextId(state.cashClosures || []),
    terminal: register.terminal || "SERIE 1",
    openedAt: register.openedAt,
    closedAt: new Date().toISOString(),
    openedBy: register.openedBy,
    closedBy: state.settings.user,
    authorizedBy: authorization.authorizedBy,
    responsible,
    closingNote,
    initialAmount: Number(register.initialAmount || 0),
    salesCount: sales.length,
    salesTotal: sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
    paymentTotals,
    supplies: cashMovements.filter((row) => String(row.history || "").toLowerCase().includes("suprimento")).reduce((sum, row) => sum + Number(row.in || 0), 0),
    withdrawals: cashMovements.filter((row) => String(row.history || "").toLowerCase().includes("sangria")).reduce((sum, row) => sum + Number(row.out || 0), 0),
    expectedAmount: total,
    closedAmount: countedAmount,
    difference: countedAmount - total
  };
  state.cashClosures = state.cashClosures || [];
  state.cashClosures.push(closure);
  state.cashRegister = {
    ...register,
    open: false,
    closedAt: closure.closedAt,
    closedBy: state.settings.user,
    closedAmount: countedAmount,
    difference: closure.difference
  };
  audit("Caixa fechado", `${state.cashRegister.terminal || "SERIE 1"} contado ${money(countedAmount)} diferenca ${money(closure.difference)}`);
  save();
  printCashClosure(closure);
  renderShell();
}

async function cashMovement(type) {
  const value = num("cash-move-value");
  if (value <= 0) {
    alert("Informe um valor maior que zero.");
    return;
  }
  const history = byId("cash-move-history").value || type;
  let authorization = { authorizedBy: state.settings.user };
  if (type === "Sangria") {
    authorization = await authorizePdvOperation("withdrawal", "Autorizar recolhimento / sangria");
    if (!authorization) return;
  }
  state.cash.push({
    id: nextId(state.cash),
    date: today(),
    account: "CAIXA",
    history: `${history} | Responsavel: ${authorization.authorizedBy}`,
    in: type === "Suprimento" ? value : 0,
    out: type === "Sangria" ? value : 0,
    cashRegisterOpenedAt: state.cashRegister.openedAt
  });
  audit(`Caixa - ${type}`, `${history} ${money(value)}`);
  save();
  renderShell();
}

function checkProductPrice() {
  const query = String(byId("price-check-search")?.value || "").trim().toLowerCase();
  const result = byId("price-check-result");
  if (!query || !result) return;
  const product = state.products.find((item) =>
    String(item.id) === query || String(item.barcode || "").toLowerCase() === query || String(item.description || "").toLowerCase().includes(query)
  );
  result.value = product ? `${product.description} - ${money(effectiveProductPrice(product, 1))}` : "Produto nao encontrado";
  audit("Consulta de preco", product ? `${product.description} ${money(effectiveProductPrice(product, 1))}` : query);
  save();
}

function cashSummaryDocument(register = state.cashRegister, closure = null) {
  const openedAt = register?.openedAt;
  const sales = state.sales.filter((sale) => sale.type === "PDV" && sale.status === "Fechado" && sale.cashRegisterOpenedAt === openedAt);
  const movements = (state.cash || []).filter((row) => row.cashRegisterOpenedAt === openedAt);
  const paymentTotals = {};
  sales.forEach((sale) => (sale.payments || []).forEach((payment) => {
    paymentTotals[payment.method] = Number(paymentTotals[payment.method] || 0) + Number(payment.value || 0);
  }));
  const lines = [
    state.settings.company,
    "RELATORIO DE MOVIMENTO E CONFERENCIA DE CAIXA",
    `Terminal: ${register?.terminal || "SERIE 1"}`,
    `Abertura: ${openedAt ? new Date(openedAt).toLocaleString("pt-BR") : "-"}`,
    `Operador: ${register?.openedBy || state.settings.user}`,
    closure ? `Fechamento: ${new Date(closure.closedAt).toLocaleString("pt-BR")}` : `Emitido em: ${new Date().toLocaleString("pt-BR")}`,
    "",
    `Fundo de troco inicial: ${money(register?.initialAmount || 0)}`,
    `Quantidade de vendas: ${sales.length}`,
    `Total de vendas: ${money(sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0))}`,
    ...Object.entries(paymentTotals).map(([method, value]) => `${method}: ${money(value)}`),
    "",
    "MOVIMENTOS",
    ...movements.map((row) => `${row.date} | ${row.history} | Entrada ${money(row.in || 0)} | Saida ${money(row.out || 0)}`),
    "",
    `Saldo esperado: ${money(closure?.expectedAmount ?? currentCashBalance())}`,
    ...(closure ? [
      `Valor contado: ${money(closure.closedAmount)}`,
      `Diferenca: ${money(closure.difference)}`,
      `Encarregado: ${closure.responsible || closure.authorizedBy || "-"}`,
      `Observacao: ${closure.closingNote || "-"}`,
      "",
      "________________________________        __________________________________",
      `Operador: ${closure.closedBy || register?.openedBy || ""}        Encarregado: ${closure.responsible || ""}`
    ] : [])
  ];
  return lines.join("\n");
}

function printCurrentCashSummary() {
  if (!state.cashRegister?.open) return alert("Nao ha caixa aberto.");
  const content = cashSummaryDocument();
  downloadText(`resumo-caixa-${state.cashRegister.terminal || "terminal"}-${today()}.txt`, content);
  audit("Resumo do caixa emitido", state.cashRegister.terminal || "SERIE 1");
  save();
}

function printCashClosure(closure) {
  downloadText(`fechamento-caixa-${closure.terminal}-${today()}.txt`, cashSummaryDocument(state.cashRegister, closure));
}

function holdCurrentSale() {
  if (!saleItems.length) {
    alert("Nao ha itens para colocar em espera.");
    return;
  }
  state.heldSales = state.heldSales || [];
  state.heldSales.unshift({
    id: nextId(state.heldSales),
    date: new Date().toISOString(),
    operator: state.settings.user,
    items: structuredClone(saleItems)
  });
  saleItems = [];
  authorizedDiscountValue = 0;
  audit("Venda colocada em espera", `${state.heldSales[0].items.length} itens`);
  save();
  renderShell();
}

function recoverHeldSale() {
  state.heldSales = state.heldSales || [];
  if (!state.heldSales.length) {
    alert("Nao ha vendas em espera.");
    return;
  }
  if (saleItems.length && !confirm("Substituir a venda atual pela ultima venda em espera?")) return;
  const held = state.heldSales.shift();
  saleItems = held.items || [];
  audit("Venda recuperada", `Espera ${held.id}`);
  save();
  renderShell();
}

async function lookupPersonCep() {
  const cep = byId("person-cep").value.replace(/\D/g, "");
  if (cep.length !== 8) {
    alert("Informe um CEP com 8 digitos.");
    return;
  }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error("CEP nao encontrado");
    byId("person-address").value = data.logradouro || "";
    byId("person-district").value = data.bairro || "";
    byId("person-city").value = data.localidade || "";
    byId("person-uf").value = data.uf || "";
  } catch {
    alert("Nao foi possivel buscar o CEP agora. O cadastro pode ser salvo e sincronizado depois.");
  }
}

function savePersonRecord() {
  const name = byId("person-name").value.trim();
  const document = digits(byId("person-doc").value);
  const email = byId("person-email").value.trim().toLowerCase();
  const cep = digits(byId("person-cep").value);
  const uf = byId("person-uf").value.trim().toUpperCase();
  if (!name) return alert("Informe o nome ou razao social.");
  if (document && ![11, 14].includes(document.length)) return alert("CPF/CNPJ deve possuir 11 ou 14 digitos.");
  if (document && state.people.some((person) => person.id !== editingPersonId && digits(person.document) === document)) return alert("Ja existe uma pessoa cadastrada com este CPF/CNPJ.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Informe um email valido.");
  if (cep && cep.length !== 8) return alert("CEP deve possuir 8 digitos.");
  if (uf && uf.length !== 2) return alert("UF deve possuir 2 letras.");
  const record = {
    id: editingPersonId || nextId(state.people),
    type: byId("person-type").value,
    name,
    alias: byId("person-alias").value,
    document,
    stateRegistration: byId("person-ie").value,
    taxpayerType: byId("person-taxpayer").value,
    email,
    phone: byId("person-phone").value,
    whatsapp: byId("person-whatsapp").value,
    creditLimit: Number(byId("person-credit").value || 0),
    cep,
    address: byId("person-address").value,
    number: byId("person-number").value,
    district: byId("person-district").value,
    complement: byId("person-complement").value,
    city: byId("person-city").value,
    uf,
    active: byId("person-active").value === "true"
  };
  if (editingPersonId) Object.assign(state.people.find((person) => person.id === editingPersonId), record);
  else state.people.push(record);
  audit(editingPersonId ? "Pessoa alterada" : "Pessoa cadastrada", name);
  editingPersonId = 0;
  pendingPersonDraft = {};
  save();
  renderShell();
}

function editPersonRecord(id) {
  const person = state.people.find((row) => row.id === id);
  if (!person) return;
  editingPersonId = id;
  pendingPersonDraft = structuredClone(person);
  renderShell();
}

function togglePersonRecord(id) {
  const person = state.people.find((row) => row.id === id);
  if (!person) return;
  person.active = person.active === false;
  audit(person.active ? "Pessoa ativada" : "Pessoa inativada", person.name);
  save();
  renderShell();
}

function saveProductRecord() {
  captureProductDraft();
  const description = byId("product-description").value.trim();
  const barcode = byId("product-barcode").value.trim();
  const type = byId("product-type").value;
  const cost = Number(byId("product-cost").value || 0);
  const price = Number(byId("product-price").value || 0);
  const ncm = digits(byId("product-ncm")?.value);
  if (!description) return alert("Informe a descricao do produto.");
  if (barcode && state.products.some((product) => product.id !== editingProductId && product.barcode === barcode)) return alert("Ja existe um produto com este codigo de barras.");
  if (cost < 0 || price < 0) return alert("Custo e preco nao podem ser negativos.");
  if (type !== "Servico" && ncm.length !== 8) return alert("Informe um NCM valido com 8 digitos.");
  const composition = pendingComposition.map((component) => ({ ...component }));
  if (composition.length && composition.some((component) => !state.products.some((product) => product.id === component.productId))) return alert("A composicao possui componente inexistente.");
  const compositionCost = composition.reduce((sum, component) => sum + Number(state.products.find((product) => product.id === component.productId)?.cost || 0) * Number(component.qty || 0), 0);
  const record = {
    id: editingProductId || nextId(state.products),
    description,
    barcode,
    type,
    unit: byId("product-unit").value,
    brand: byId("product-brand").value,
    group: byId("product-group").value,
    location: byId("product-location").value,
    cost: composition.length && cost <= 0 ? compositionCost : cost,
    price,
    stock: Number(byId("product-stock").value || 0),
    minStock: Number(byId("product-min").value || 0),
    ncm: type === "Servico" ? "" : ncm,
    cest: digits(byId("product-cest")?.value),
    cfop: byId("product-cfop")?.value || "5102",
    cst: byId("product-cst")?.value || "102",
    cbsClass: byId("product-cbs")?.value || "000001",
    ibsClass: byId("product-ibs")?.value || "000001",
    photo: pendingProductPhoto,
    isBundle: byId("product-is-bundle")?.checked || composition.length > 0,
    composition,
    variantColor: pendingProductDraft.variantColor || "",
    variantSize: pendingProductDraft.variantSize || "",
    controlsLot: Boolean(pendingProductDraft.controlsLot),
    controlsSerial: Boolean(pendingProductDraft.controlsSerial),
    shelfLifeDays: Number(pendingProductDraft.shelfLifeDays || 0),
    scaleCode: pendingProductDraft.scaleCode || "",
    scaleValidityDays: Number(pendingProductDraft.scaleValidityDays || 0),
    nutritionCalories: pendingProductDraft.nutritionCalories || "",
    nutritionProtein: pendingProductDraft.nutritionProtein || "",
    promotion: structuredClone(pendingProductDraft.promotion || {}),
    priceTables: structuredClone(pendingProductDraft.priceTables || {}),
    commissionRate: Number(pendingProductDraft.commissionRate || 0),
    active: byId("product-active").value === "true"
  };
  if (editingProductId) Object.assign(state.products.find((product) => product.id === editingProductId), record);
  else state.products.push(record);
  audit(editingProductId ? "Produto alterado" : "Produto cadastrado", description);
  save();
  editingProductId = 0;
  pendingProductPhoto = "";
  pendingComposition = [];
  pendingProductDraft = {};
  renderShell();
}

function addCompositionRecord() {
  captureProductDraft();
  const componentId = Number(byId("composition-product")?.value || 0);
  const qty = Number(byId("composition-qty")?.value || 0);
  const mode = byId("composition-mode")?.value || "sale";
  if (!componentId || qty <= 0) {
    alert("Informe o componente e a quantidade usada.");
    return;
  }
  if (pendingComposition.some((component) => component.productId === componentId && component.mode !== mode)) {
    alert("Este componente ja foi incluido com outro tipo de baixa. Remova-o antes de alterar.");
    return;
  }
  const existing = pendingComposition.find((component) => component.productId === componentId && component.mode === mode);
  if (existing) existing.qty += qty;
  else pendingComposition.push({ productId: componentId, qty, mode });
  const bundleCheck = byId("product-is-bundle");
  if (bundleCheck) bundleCheck.checked = true;
  renderShell();
}

function captureProductDraft() {
  if (!byId("product-form")) return;
  const previous = pendingProductDraft;
  pendingProductDraft = {
    description: byId("product-description")?.value || "",
    barcode: byId("product-barcode")?.value || "",
    type: byId("product-type")?.value || "Mercadoria para revenda",
    unit: byId("product-unit")?.value || "UN",
    brand: byId("product-brand")?.value || "",
    group: byId("product-group")?.value || "",
    location: byId("product-location")?.value || "",
    cost: byId("product-cost")?.value || 0,
    price: byId("product-price")?.value || 0,
    stock: byId("product-stock")?.value || 0,
    minStock: byId("product-min")?.value || 1,
    ncm: byId("product-ncm")?.value || "00000000",
    cfop: byId("product-cfop")?.value || "5102",
    cst: byId("product-cst")?.value || "102",
    cest: byId("product-cest")?.value || "",
    ibsClass: byId("product-ibs")?.value || "000001",
    cbsClass: byId("product-cbs")?.value || "000001",
    variantColor: previous.variantColor || "",
    variantSize: previous.variantSize || "",
    controlsLot: Boolean(previous.controlsLot),
    controlsSerial: Boolean(previous.controlsSerial),
    shelfLifeDays: previous.shelfLifeDays || 0,
    scaleCode: previous.scaleCode || "",
    scaleValidityDays: previous.scaleValidityDays || 0,
    nutritionCalories: previous.nutritionCalories || "",
    nutritionProtein: previous.nutritionProtein || "",
    promotion: structuredClone(previous.promotion || {}),
    priceTables: structuredClone(previous.priceTables || {}),
    commissionRate: previous.commissionRate || 0
  };
  pendingProductDraft.variantColor = byId("product-variant-color")?.value ?? pendingProductDraft.variantColor ?? "";
  pendingProductDraft.variantSize = byId("product-variant-size")?.value ?? pendingProductDraft.variantSize ?? "";
  pendingProductDraft.controlsLot = byId("product-controls-lot") ? byId("product-controls-lot").value === "true" : Boolean(pendingProductDraft.controlsLot);
  pendingProductDraft.controlsSerial = byId("product-controls-serial") ? byId("product-controls-serial").value === "true" : Boolean(pendingProductDraft.controlsSerial);
  pendingProductDraft.shelfLifeDays = byId("product-shelf-life")?.value ?? pendingProductDraft.shelfLifeDays ?? 0;
  pendingProductDraft.scaleCode = byId("product-scale-code")?.value ?? pendingProductDraft.scaleCode ?? "";
  pendingProductDraft.scaleValidityDays = byId("product-scale-validity")?.value ?? pendingProductDraft.scaleValidityDays ?? 0;
  pendingProductDraft.nutritionCalories = byId("product-nutrition-calories")?.value ?? pendingProductDraft.nutritionCalories ?? "";
  pendingProductDraft.nutritionProtein = byId("product-nutrition-protein")?.value ?? pendingProductDraft.nutritionProtein ?? "";
  pendingProductDraft.promotion = {
    from: byId("product-promo-from")?.value ?? pendingProductDraft.promotion?.from ?? "",
    to: byId("product-promo-to")?.value ?? pendingProductDraft.promotion?.to ?? "",
    minQty: byId("product-promo-qty")?.value ?? pendingProductDraft.promotion?.minQty ?? 0,
    price: byId("product-promo-price")?.value ?? pendingProductDraft.promotion?.price ?? 0
  };
  pendingProductDraft.priceTables = {
    wholesale: byId("product-price-wholesale")?.value ?? pendingProductDraft.priceTables?.wholesale ?? 0,
    special: byId("product-price-special")?.value ?? pendingProductDraft.priceTables?.special ?? 0
  };
  pendingProductDraft.commissionRate = byId("product-commission")?.value ?? pendingProductDraft.commissionRate ?? 0;
}

function editProductRecord(id) {
  const product = state.products.find((row) => row.id === id);
  if (!product) return;
  editingProductId = id;
  pendingProductDraft = structuredClone(product);
  pendingComposition = structuredClone(product.composition || []);
  pendingProductPhoto = product.photo || "";
  currentTab = "dados";
  renderShell();
}

function toggleProductRecord(id) {
  const product = state.products.find((row) => row.id === id);
  if (!product) return;
  product.active = product.active === false;
  audit(product.active ? "Produto ativado" : "Produto inativado", product.description);
  save();
  renderShell();
}

function printProductLabel(id) {
  const product = state.products.find((row) => row.id === id);
  if (!product) return;
  downloadText(`etiqueta-${product.id}.txt`, `${state.settings.company}\n${product.description}\nCodigo: ${product.id}\nBarras: ${product.barcode || "-"}\nPreco: ${money(effectiveProductPrice(product, 1))}`);
  audit("Etiqueta gerada", product.description);
  save();
}

function loadProductPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = String(reader.result || "");
    pendingProductPhoto = dataUrl;
    byId("product-photo-preview").innerHTML = `<img src="${pendingProductPhoto}" alt="Foto do produto" />`;
    if (!apiOnline || !sessionId) return;
    try {
      const uploaded = await uploadTenantFile({
        category: "produtos",
        filename: file.name,
        mimeType: file.type,
        content: dataUrl
      });
      pendingProductPhoto = uploaded.url;
      byId("product-photo-preview").innerHTML = `<img src="${pendingProductPhoto}" alt="Foto do produto" />`;
    } catch {
      pendingProductPhoto = dataUrl;
    }
  };
  reader.readAsDataURL(file);
}

async function uploadTenantFile({ category, filename, mimeType, content }) {
  const result = await api(`/api/tenant/${state.settings.tenantCode}/files`, {
    method: "POST",
    body: JSON.stringify({ category, filename, mimeType, content })
  });
  return result.file;
}

function makeProductionRecord() {
  const plannedOrder = (state.productions || []).find((row) => row.id === Number(byId("production-order")?.value || 0) && row.status === "Planejada");
  const product = state.products.find((item) => item.id === Number(plannedOrder?.productId || byId("production-product").value));
  const plannedQty = Number(plannedOrder?.plannedQty || byId("production-qty").value || 0);
  const actualQty = Number(byId("production-actual-qty").value || plannedQty);
  if (!product || plannedQty <= 0 || actualQty <= 0) return;
  const requirements = compositionRequirements(product, plannedQty, ["production", "both"]);
  const shortage = stockShortages(requirements);
  if (shortage.length) {
    alert(`Producao nao realizada. Estoque insuficiente:\n${shortage.join("\n")}`);
    return;
  }
  const lot = byId("production-lot").value.trim();
  const expiry = byId("production-expiry").value;
  const serials = parseSerials(byId("production-serials").value);
  if (product.controlsSerial && !validateSerialQuantity(product, actualQty, serials)) return;
  const loss = Math.max(0, plannedQty - actualQty);
  const productionCost = requirements.reduce((sum, requirement) => sum + Number(state.products.find((row) => row.id === requirement.productId)?.cost || 0) * Number(requirement.qty || 0), 0);
  const oldStock = Number(product.stock || 0);
  product.stock += actualQty;
  const productionId = plannedOrder?.id || nextId(state.productions);
  const componentAllocations = requirements.map((requirement) => ({
    productId: requirement.productId,
    traceability: consumeProductTraceability(state.products.find((row) => row.id === requirement.productId), requirement.qty, `Producao ${productionId}`)
  }));
  const production = plannedOrder || {
    id: productionId,
    date: today(),
    productId: product.id,
    product: product.description,
    plannedQty
  };
  Object.assign(production, {
    actualQty, loss, yieldPercent: plannedQty > 0 ? actualQty / plannedQty * 100 : 0,
    productionCost, unitCost: actualQty > 0 ? productionCost / actualQty : 0,
    status: "Concluida", completedAt: new Date().toISOString(), lot, expiry,
    components: structuredClone(requirements), componentAllocations
  });
  if (!plannedOrder) state.productions.push(production);
  product.cost = oldStock + actualQty > 0 ? (oldStock * Number(product.cost || 0) + productionCost) / (oldStock + actualQty) : production.unitCost;
  audit("Producao registrada", `${product.description} produzido ${actualQty}, perda ${loss}`);
  addStockMovement(product, "Producao", actualQty, `Fabricacao de ${product.description}`, { lot, expiry });
  if (lot) upsertStockLot(product, lot, expiry, actualQty);
  if (serials.length) registerStockSerials(product, serials, lot, `Producao ${production.id}`);
  (product.composition || []).forEach((component) => {
    if (component.mode === "sale") return;
    const raw = state.products.find((item) => item.id === component.productId);
    if (raw) {
      const usedQty = component.qty * plannedQty;
      raw.stock -= usedQty;
      addStockMovement(raw, "Baixa producao", -usedQty, `Componente de ${product.description}`);
    }
  });
  save();
  renderShell();
}

function planProductionRecord() {
  const product = state.products.find((item) => item.id === Number(byId("production-product").value));
  const plannedQty = Number(byId("production-qty").value || 0);
  if (!product || plannedQty <= 0) return alert("Informe produto e quantidade planejada.");
  const requirements = compositionRequirements(product, plannedQty, ["production", "both"]);
  state.productions.push({
    id: nextId(state.productions),
    date: today(),
    productId: product.id,
    product: product.description,
    plannedQty,
    actualQty: 0,
    loss: 0,
    productionCost: requirements.reduce((sum, requirement) => sum + Number(state.products.find((row) => row.id === requirement.productId)?.cost || 0) * requirement.qty, 0),
    status: "Planejada",
    components: structuredClone(requirements)
  });
  audit("Ordem de producao programada", `${product.description} ${plannedQty}`);
  save();
  renderShell();
}

function saveStockMoveRecord() {
  if (!requirePermission("stock_adjust")) return;
  const product = state.products.find((item) => item.id === Number(byId("stock-product").value));
  const qty = Number(byId("stock-qty").value || 0);
  const type = byId("stock-type").value;
  if (!product || qty <= 0) return;
  if (type === "Entrada" || type === "Ajuste") product.stock += qty;
  else {
    if (product.stock < qty) {
      alert(`Estoque insuficiente. Saldo atual: ${product.stock} ${product.unit}.`);
      return;
    }
    product.stock -= qty;
  }
  const direction = type === "Entrada" || type === "Ajuste" ? qty : -qty;
  const details = {
    lot: byId("stock-lot").value.trim(),
    expiry: byId("stock-expiry").value,
    location: byId("stock-location").value.trim(),
    serials: parseSerials(byId("stock-serials").value)
  };
  if (product.controlsSerial && !validateSerialQuantity(product, qty, details.serials)) return;
  audit("Estoque movimentado", `${type} ${qty} ${product.description}`);
  addStockMovement(product, type, direction, byId("stock-history").value, details);
  if (details.lot) upsertStockLot(product, details.lot, details.expiry, direction);
  if (direction > 0) registerStockSerials(product, details.serials, details.lot, byId("stock-history").value);
  else consumeNamedSerials(product, details.serials, byId("stock-history").value);
  save();
  renderShell();
}

function saveInventoryRecord() {
  if (!requirePermission("stock_adjust")) return;
  const product = state.products.find((item) => item.id === Number(byId("inventory-product").value));
  const counted = Number(byId("inventory-counted").value || 0);
  if (!product || counted < 0) return;
  const lot = byId("inventory-lot").value.trim();
  const serial = byId("inventory-serial").value.trim();
  let previous = Number(product.stock || 0);
  let difference = counted - previous;
  if (lot) {
    const lotRow = state.stockLots.find((row) => row.productId === product.id && row.lot === lot);
    previous = Number(lotRow?.qty || 0);
    difference = counted - previous;
    product.stock = Math.max(0, Number(product.stock || 0) + difference);
    upsertStockLot(product, lot, lotRow?.expiry || "", difference);
  } else product.stock = counted;
  if (serial) setSerialInventoryStatus(product, serial, counted > 0);
  state.stockInventories.push({
    id: nextId(state.stockInventories),
    date: today(),
    productId: product.id,
    product: product.description,
    previous,
    counted,
    difference,
    lot,
    serial,
    reason: byId("inventory-reason").value.trim()
  });
  addStockMovement(product, "Inventario", difference, byId("inventory-reason").value.trim());
  audit("Inventario aplicado", `${product.description}: ${previous} para ${counted}`);
  save();
  renderShell();
}

function inventoryBarcodeRead(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const code = event.currentTarget.value.trim();
  const product = state.products.find((row) => String(row.id) === code || row.barcode === code);
  if (!product) return alert("Produto nao encontrado para este codigo.");
  byId("inventory-product").value = String(product.id);
  byId("inventory-counted").value = String(Number(byId("inventory-counted").value || 0) + 1);
  event.currentTarget.value = "";
}

function saveStockTransferRecord() {
  if (!requirePermission("stock_adjust")) return;
  const product = state.products.find((item) => item.id === Number(byId("transfer-product").value));
  const qty = Number(byId("transfer-qty").value || 0);
  const from = byId("transfer-from").value.trim();
  const to = byId("transfer-to").value.trim();
  if (!product || qty <= 0 || !from || !to || from === to) return;
  const origin = warehouseStock(product, from);
  if (origin.qty < qty && from !== "Estoque principal") return alert(`Saldo insuficiente em ${from}: ${origin.qty} ${product.unit}.`);
  adjustWarehouseStock(product, from, -qty);
  adjustWarehouseStock(product, to, qty);
  state.stockTransfers.push({ id: nextId(state.stockTransfers), date: today(), productId: product.id, product: product.description, qty, from, to });
  addStockMovement(product, "Transferencia", 0, `${qty} ${product.unit} de ${from} para ${to}`, { location: `${from} > ${to}` });
  audit("Transferencia registrada", `${product.description}: ${from} para ${to}`);
  save();
  renderShell();
}

function warehouseStock(product, warehouse) {
  let row = state.warehouseStocks.find((item) => item.productId === product.id && item.warehouse === warehouse);
  if (!row) {
    row = { id: nextId(state.warehouseStocks), warehouse, productId: product.id, product: product.description, qty: warehouse === "Estoque principal" ? Number(product.stock || 0) : 0 };
    state.warehouseStocks.push(row);
  }
  return row;
}

function adjustWarehouseStock(product, warehouse, qty) {
  const row = warehouseStock(product, warehouse);
  row.qty = Number(row.qty || 0) + Number(qty || 0);
  return row;
}

function upsertStockLot(product, lot, expiry, qty) {
  if (!lot) return;
  let record = state.stockLots.find((row) => row.productId === product.id && row.lot === lot);
  if (!record) {
    record = { id: nextId(state.stockLots), productId: product.id, product: product.description, lot, expiry, qty: 0 };
    state.stockLots.push(record);
  }
  record.qty = Math.max(0, Number(record.qty || 0) + Number(qty || 0));
  if (expiry) record.expiry = expiry;
}

function parseSerials(value) {
  return [...new Set(String(value || "").split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean))];
}

function validateSerialQuantity(product, qty, serials) {
  if (!product.controlsSerial) return true;
  if (!Number.isInteger(qty) || serials.length !== qty) {
    alert(`O produto ${product.description} controla numero de serie. Informe exatamente ${qty} serie(s), uma por linha.`);
    return false;
  }
  const duplicate = serials.find((serial) => state.stockSerials.some((row) => row.productId === product.id && row.serial === serial && row.status === "Disponivel"));
  if (duplicate) {
    alert(`A serie ${duplicate} ja esta disponivel no estoque.`);
    return false;
  }
  return true;
}

function registerStockSerials(product, serials, lot, reference) {
  state.stockSerials = state.stockSerials || [];
  serials.forEach((serial) => {
    const row = state.stockSerials.find((item) => item.productId === product.id && item.serial === serial);
    if (row) Object.assign(row, { status: "Disponivel", lot, reference, updatedAt: new Date().toISOString() });
    else state.stockSerials.push({ id: nextId(state.stockSerials), productId: product.id, product: product.description, serial, lot, status: "Disponivel", reference, acquiredAt: new Date().toISOString() });
  });
}

function consumeNamedSerials(product, serials, reference) {
  serials.forEach((serial) => {
    const row = state.stockSerials.find((item) => item.productId === product.id && item.serial === serial && item.status === "Disponivel");
    if (row) Object.assign(row, { status: "Baixado", reference, updatedAt: new Date().toISOString() });
  });
}

function setSerialInventoryStatus(product, serial, available) {
  state.stockSerials = state.stockSerials || [];
  const row = state.stockSerials.find((item) => item.productId === product.id && item.serial === serial);
  if (row) Object.assign(row, { status: available ? "Disponivel" : "Baixado", reference: "Inventario", updatedAt: new Date().toISOString() });
  else if (available) registerStockSerials(product, [serial], "", "Inventario");
}

function allocateStockLots(productId, qty, reference) {
  let remaining = Number(qty || 0);
  const allocations = [];
  (state.stockLots || []).filter((row) => row.productId === productId && Number(row.qty || 0) > 0)
    .sort((a, b) => String(a.expiry || "9999").localeCompare(String(b.expiry || "9999")) || a.id - b.id)
    .forEach((row) => {
      if (remaining <= 0) return;
      const used = Math.min(remaining, Number(row.qty || 0));
      row.qty -= used;
      remaining -= used;
      allocations.push({ lot: row.lot, expiry: row.expiry || "", qty: used, reference });
    });
  return allocations;
}

function restoreStockLots(product, allocations) {
  (allocations || []).forEach((row) => upsertStockLot(product, row.lot, row.expiry, row.qty));
}

function addPurchaseItemRecord() {
  const product = state.products.find((item) => item.id === Number(byId("purchase-product").value));
  const qty = Number(byId("purchase-qty").value || 0);
  const cost = Number(byId("purchase-cost").value || product?.cost || 0);
  if (!product || qty <= 0) {
    alert("Informe produto e quantidade.");
    return;
  }
  const serials = parseSerials(byId("purchase-serials").value);
  if (!validateSerialQuantity(product, qty, serials)) return;
  purchaseItems.push({
    productId: product.id,
    product: product.description,
    qty,
    cost,
    cfop: byId("purchase-cfop").value.trim(),
    cst: byId("purchase-cst").value.trim(),
    icmsRate: num("purchase-icms"),
    icmsValue: qty * cost * num("purchase-icms") / 100,
    lot: byId("purchase-lot").value.trim(),
    expiry: byId("purchase-expiry").value,
    serials
  });
  renderShell();
}

function readPurchaseXml(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(String(reader.result || ""), "application/xml");
    const items = Array.from(xml.querySelectorAll("det"));
    const docNumber = xml.querySelector("ide nNF")?.textContent || xml.querySelector("nNF")?.textContent || "";
    const accessKey = xml.querySelector("infNFe")?.getAttribute("Id")?.replace(/^NFe/, "") || "";
    const invoiceTotal = Number(xml.querySelector("ICMSTot vNF")?.textContent || 0);
    const issueDate = (xml.querySelector("ide dhEmi")?.textContent || xml.querySelector("ide dEmi")?.textContent || "").slice(0, 10);
    const supplierName = xml.querySelector("emit xNome")?.textContent || xml.querySelector("xNome")?.textContent || "";
    const supplierDocument = xml.querySelector("emit CNPJ")?.textContent || xml.querySelector("emit CPF")?.textContent || "";
    if (docNumber && byId("purchase-doc")) byId("purchase-doc").value = docNumber;
    if (issueDate && byId("purchase-date")) byId("purchase-date").value = issueDate;
    if (supplierName) {
      const supplierSelect = byId("purchase-supplier");
      const option = Array.from(supplierSelect.options).find((item) => item.text === supplierName);
      if (option) supplierSelect.value = supplierName;
      else {
        state.people.push({
          id: nextId(state.people),
          type: "Fornecedor",
          name: supplierName,
          document: supplierDocument,
          city: "",
          uf: "",
          cep: "",
          address: "",
          active: true
        });
      }
    }
    items.forEach((det) => {
      const description = det.querySelector("xProd")?.textContent || "";
      const qty = Number(det.querySelector("qCom")?.textContent || 0);
      const cost = Number(det.querySelector("vUnCom")?.textContent || 0);
      let product = state.products.find((item) => item.description.toLowerCase() === description.toLowerCase());
      if (!product && description) {
        product = {
          id: nextId(state.products),
          description,
          barcode: det.querySelector("cEAN")?.textContent || "",
          type: "Mercadoria para revenda",
          unit: det.querySelector("uCom")?.textContent || "UN",
          cost,
          price: cost,
          stock: 0,
          minStock: 1,
          ncm: det.querySelector("NCM")?.textContent || "00000000",
          cfop: det.querySelector("CFOP")?.textContent || "1102",
          cst: "102",
          cbsClass: "000001",
          ibsClass: "000001",
          photo: "",
          isBundle: false,
          composition: [],
          active: true
        };
        state.products.push(product);
      }
      if (product && qty > 0) {
        const icmsRate = Number(det.querySelector("ICMS pICMS")?.textContent || 0);
        purchaseItems.push({
          productId: product.id,
          product: product.description,
          qty,
          cost,
          cfop: det.querySelector("CFOP")?.textContent || "",
          cst: det.querySelector("ICMS CST")?.textContent || det.querySelector("ICMS CSOSN")?.textContent || "",
          icmsRate,
          icmsValue: Number(det.querySelector("ICMS vICMS")?.textContent || 0)
        });
      }
    });
    const itemsTotal = purchaseItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.cost || 0), 0);
    pendingProductDraft.purchaseXml = { accessKey, invoiceTotal, itemsTotal, filename: file.name };
    if (invoiceTotal && Math.abs(invoiceTotal - itemsTotal) > 0.02) {
      alert(`XML lido, mas o total dos itens (${money(itemsTotal)}) difere do total da nota (${money(invoiceTotal)}). Confira frete, descontos e impostos antes de lancar.`);
    }
    audit("XML de compra lido", `${file.name} - ${purchaseItems.length} itens`);
    save();
    renderShell();
  };
  reader.readAsText(file);
}

function savePurchaseRecord() {
  if (!purchaseItems.length) addPurchaseItemRecord();
  if (!purchaseItems.length) return;
  const generate = byId("purchase-generate").value;
  const document = byId("purchase-doc").value.trim();
  const supplier = byId("purchase-supplier").value;
  const xmlInfo = pendingProductDraft.purchaseXml || {};
  if (xmlInfo.accessKey && state.purchases.some((row) => row.status !== "Cancelada" && row.accessKey === xmlInfo.accessKey)) {
    alert("Esta chave de acesso ja foi lancada.");
    return;
  }
  if (document && state.purchases.some((row) => row.status !== "Cancelada" && row.document === document && row.supplier === supplier)) {
    alert("Esta nota de compra ja foi lancada para o fornecedor.");
    return;
  }
  const total = purchaseItems.reduce((sum, item) => sum + item.qty * item.cost, 0);
  const purchase = {
    id: nextId(state.purchases),
    date: byId("purchase-date").value || today(),
    supplier,
    document,
    accessKey: xmlInfo.accessKey || "",
    xmlFilename: xmlInfo.filename || "",
    invoiceTotal: Number(xmlInfo.invoiceTotal || total),
    items: structuredClone(purchaseItems),
    total,
    generate,
    status: "Confirmada"
  };
  state.purchases.push(purchase);
  audit("Compra lancada", `${purchase.items.length} itens ${money(total)}`);
  if (generate.includes("Estoque")) {
    purchase.items.forEach((item) => {
      const product = state.products.find((productItem) => productItem.id === item.productId);
      if (!product) return;
      const oldStock = Number(product.stock || 0);
      const oldValue = oldStock * Number(product.cost || 0);
      const oldMargin = Number(product.cost || 0) > 0 ? Number(product.price || 0) / Number(product.cost || 0) : 0;
      product.stock = oldStock + item.qty;
      product.cost = product.stock > 0 ? (oldValue + item.qty * item.cost) / product.stock : item.cost;
      if (byId("purchase-price-update")?.value === "margin" && oldMargin > 0) product.price = product.cost * oldMargin;
      addStockMovement(product, "Compra", item.qty, `Compra ${purchase.document || purchase.id}`, { lot: item.lot, expiry: item.expiry });
      if (item.lot) upsertStockLot(product, item.lot, item.expiry, item.qty);
      registerStockSerials(product, item.serials || [], item.lot, `Compra ${purchase.document || purchase.id}`);
    });
  }
  if (generate.includes("financeiro")) {
    const installments = Math.max(1, Number(byId("purchase-installments").value || 1));
    const interval = Math.max(1, Number(byId("purchase-interval").value || 30));
    const installmentValue = Math.floor(total / installments * 100) / 100;
    for (let index = 0; index < installments; index += 1) {
      state.payables.push({
        id: nextId(state.payables),
        supplier: purchase.supplier,
        due: addDays(byId("purchase-due").value || today(), index * interval),
        value: index === installments - 1 ? total - installmentValue * (installments - 1) : installmentValue,
        purchaseId: purchase.id,
        paidValue: 0,
        paid: false,
        history: `Compra ${purchase.document || purchase.id}${installments > 1 ? ` - ${index + 1}/${installments}` : ""}`
      });
    }
  }
  purchaseItems = [];
  delete pendingProductDraft.purchaseXml;
  save();
  renderShell();
}

function cancelPurchaseRecord(id) {
  if (!requirePermission("purchase_cancel")) return;
  const purchase = state.purchases.find((row) => row.id === id);
  if (!purchase || purchase.status === "Cancelada") return;
  if (!confirm(`Cancelar a compra ${purchase.document || purchase.id} e estornar estoque e financeiro?`)) return;
  if (String(purchase.generate || "Estoque e financeiro").includes("Estoque")) {
    const requirements = (purchase.items || []).map((item) => ({ productId: item.productId, qty: Number(item.qty || 0) }));
    const shortage = stockShortages(requirements);
    if (shortage.length) {
      alert(`Cancelamento bloqueado. Parte do estoque desta compra ja foi consumida:\n${shortage.join("\n")}`);
      return;
    }
    purchase.items.forEach((item) => {
      const product = state.products.find((row) => row.id === item.productId);
      if (!product) return;
      product.stock -= Number(item.qty || 0);
      addStockMovement(product, "Estorno compra", -Number(item.qty || 0), `Cancelamento compra ${purchase.document || purchase.id}`);
    });
  }
  state.payables.filter((row) => row.purchaseId === purchase.id && !row.paid).forEach((row) => {
    row.cancelled = true;
    row.paid = true;
    row.balance = 0;
  });
  purchase.status = "Cancelada";
  purchase.cancelledAt = new Date().toISOString();
  audit("Compra cancelada", `${purchase.document || purchase.id} ${money(purchase.total)}`);
  save();
  renderShell();
}

function addOrderItemRecord() {
  const product = state.products.find((item) => item.id === Number(byId("order-product").value));
  const qty = Number(byId("order-qty").value || 0);
  if (!product || qty <= 0) return alert("Informe produto e quantidade.");
  const existing = orderItems.find((item) => item.id === product.id);
  if (existing) existing.qty += qty;
  else orderItems.push({ id: product.id, description: product.description, qty, unit: product.unit, price: effectiveProductPrice(product, qty) });
  renderShell();
}

function saveOrderRecord() {
  if (!orderItems.length) return alert("Adicione ao menos um produto antes de salvar.");
  const type = byId("order-type").value;
  const total = orderItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const sale = {
    id: nextId(state.sales),
    date: today(),
    customer: byId("order-customer").value,
    seller: state.settings.user,
    type,
    status: type === "Orcamento" ? "Aberto" : "Fechado",
    payment: byId("order-payment").value,
    due: byId("order-due").value || today(),
    total,
    commission: saleCommission(orderItems),
    items: structuredClone(orderItems)
  };
  state.sales.push(sale);
  audit(type === "Orcamento" ? "Orcamento lancado" : "Pedido lancado", `${sale.customer} ${money(total)}`);
  if (type !== "Orcamento") {
    const shortage = stockShortages(saleStockRequirements(sale.items));
    if (shortage.length) {
      state.sales.pop();
      alert(`Pedido nao finalizado. Estoque insuficiente:\n${shortage.join("\n")}`);
      return;
    }
    applySaleStock(sale.items);
    state.receivables.push({
      id: nextId(state.receivables),
      customer: sale.customer,
      due: byId("order-due").value || today(),
      value: total,
      paid: sale.payment === "Dinheiro" || sale.payment === "PIX" || sale.payment === "Cartao",
      history: `Venda ${sale.id} - ${sale.payment}`
    });
  }
  orderItems = [];
  save();
  renderShell();
}

function convertQuoteToOrder(id) {
  const quote = state.sales.find((row) => row.id === id && row.type === "Orcamento" && row.status === "Aberto");
  if (!quote) return;
  const shortage = stockShortages(saleStockRequirements(quote.items || []));
  if (shortage.length) return alert(`Orcamento nao convertido. Estoque insuficiente:\n${shortage.join("\n")}`);
  quote.type = "Pedido";
  quote.status = "Fechado";
  quote.convertedAt = new Date().toISOString();
  quote.commission = saleCommission(quote.items || []);
  applySaleStock(quote.items || []);
  state.receivables.push({
    id: nextId(state.receivables),
    customer: quote.customer,
    due: quote.due || today(),
    value: quote.total,
    paidValue: 0,
    paid: false,
    history: `Venda ${quote.id} - conversao de orcamento`
  });
  audit("Orcamento convertido", `Venda ${quote.id} ${money(quote.total)}`);
  save();
  renderShell();
}

function saveFinanceRecord() {
  const target = currentTab === "pagar" ? state.payables : state.receivables;
  if (!target) return;
  const total = Number(byId("finance-value").value || 0);
  const installments = Math.max(1, Number(byId("finance-installments").value || 1));
  const interval = Math.max(1, Number(byId("finance-interval").value || 30));
  if (total <= 0) return;
  const baseDue = byId("finance-due").value || today();
  for (let index = 0; index < installments; index += 1) {
    const value = index === installments - 1 ? total - (Math.floor((total / installments) * 100) / 100) * (installments - 1) : Math.floor((total / installments) * 100) / 100;
    const item = {
      id: nextId(target),
      document: byId("finance-doc").value,
      due: addDays(baseDue, index * interval),
      value,
      paidValue: 0,
      discount: 0,
      interest: 0,
      paid: false,
      history: `${byId("finance-history").value || byId("finance-doc").value}${installments > 1 ? ` - ${index + 1}/${installments}` : ""}`
    };
    item.accountCode = byId("finance-account")?.value || (currentTab === "pagar" ? "4.1.01" : "3.1.01");
    if (currentTab === "pagar") item.supplier = byId("finance-name").value;
    else item.customer = byId("finance-name").value;
    target.push(item);
  }
  audit(currentTab === "pagar" ? "Conta a pagar lancada" : "Conta a receber lancada", `${installments} parcela(s) ${money(total)}`);
  save();
  renderShell();
}

function payFinanceRecord(id) {
  if (!requirePermission("finance_settle")) return;
  const target = currentTab === "pagar" ? state.payables : state.receivables;
  const item = target.find((row) => row.id === id);
  if (!item || item.paid || item.cancelled) return;
  const currentBalance = financeBalance(item);
  const interest = Number(prompt("Juros desta baixa", "0")?.replace(",", ".") || 0);
  const discount = Number(prompt("Desconto desta baixa", "0")?.replace(",", ".") || 0);
  const adjustedBalance = Math.max(0, currentBalance + interest - discount);
  const amount = Number(prompt(`Valor da baixa. Saldo atualizado: ${money(adjustedBalance)}`, adjustedBalance.toFixed(2).replace(".", ","))?.replace(",", ".") || 0);
  if (amount <= 0 || amount > adjustedBalance) {
    alert("Informe um valor valido, limitado ao saldo atualizado.");
    return;
  }
  item.interest = Number(item.interest || 0) + interest;
  item.discount = Number(item.discount || 0) + discount;
  item.paidValue = Number(item.paidValue || 0) + amount;
  item.payments = item.payments || [];
  item.payments.push({ date: today(), amount, interest, discount, account: item.accountCode || "1.1.01", user: state.settings.user });
  item.balance = financeBalance(item);
  item.paid = item.balance <= 0.009;
  if (item.paid) item.paidAt = today();
  audit(currentTab === "pagar" ? "Baixa conta a pagar" : "Baixa conta a receber", `${item.history || id} ${money(amount)}`);
  state.cash.push({
    id: nextId(state.cash),
    date: today(),
    account: item.accountCode || "1.1.01",
    history: item.history || `Baixa ${id}`,
    in: currentTab === "receber" ? amount : 0,
    out: currentTab === "pagar" ? amount : 0
  });
  save();
  renderShell();
}

function saveFinanceReconciliation() {
  const account = byId("reconcile-account").value || "1.1.01";
  const systemBalance = state.cash.filter((row) => !row.account || row.account === account).reduce((sum, row) => sum + Number(row.in || 0) - Number(row.out || 0), 0);
  const informedBalance = Number(byId("reconcile-balance").value || 0);
  const reconciliation = {
    id: nextId(state.financeReconciliations),
    date: new Date().toISOString(),
    account,
    systemBalance,
    informedBalance,
    difference: informedBalance - systemBalance,
    note: byId("reconcile-note").value.trim(),
    user: state.settings.user
  };
  state.financeReconciliations.push(reconciliation);
  audit("Saldo conciliado", `${reconciliation.account}: diferenca ${money(reconciliation.difference)}`);
  save();
  renderShell();
}

function importOfxFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || "");
    const blocks = text.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi) || [];
    let imported = 0;
    blocks.forEach((block) => {
      const field = (name) => block.match(new RegExp(`<${name}>([^<\\r\\n]+)`, "i"))?.[1]?.trim() || "";
      const fitId = field("FITID");
      if (fitId && state.bankTransactions.some((row) => row.fitId === fitId)) return;
      const amount = Number(field("TRNAMT").replace(",", ".") || 0);
      const rawDate = field("DTPOSTED");
      const date = rawDate ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : today();
      const memo = field("MEMO") || field("NAME") || "Movimento OFX";
      const match = state.cash.find((row) => !row.ofxFitId && row.date === date && Math.abs((Number(row.in || 0) - Number(row.out || 0)) - amount) < 0.01);
      state.bankTransactions.push({ id: nextId(state.bankTransactions), fitId, date, memo, amount, reconciled: Boolean(match), cashId: match?.id || 0 });
      if (match) match.ofxFitId = fitId || `OFX-${date}-${amount}`;
      imported += 1;
    });
    audit("OFX importado", `${imported} movimentos`);
    save();
    renderShell();
  };
  reader.readAsText(file);
}

function saveChartAccount() {
  state.chartOfAccounts = state.chartOfAccounts || [];
  const code = byId("account-code").value.trim();
  const name = byId("account-name").value.trim();
  if (!code || !name) return alert("Informe codigo e nome da conta.");
  if (state.chartOfAccounts.some((account) => account.code === code)) return alert("Ja existe uma conta com este codigo.");
  state.chartOfAccounts.push({ id: nextId(state.chartOfAccounts), code, name, type: byId("account-type").value, active: true });
  audit("Conta contabil cadastrada", `${code} - ${name}`);
  save();
  renderShell();
}

function financeBalance(item) {
  if (item.cancelled) return 0;
  return Math.max(0, Number(item.value || 0) + Number(item.interest || 0) - Number(item.discount || 0) - Number(item.paidValue || 0));
}

function addStockMovement(product, type, qty, history, details = {}) {
  state.stockMovements = state.stockMovements || [];
  state.stockMovements.push({
    id: nextId(state.stockMovements),
    date: today(),
    productId: product.id,
    product: product.description,
    type,
    qty,
    balance: product.stock,
    history,
    ...details
  });
}

async function saveSettingsRecord() {
  const company = byId("set-company").value.trim();
  const document = digits(byId("set-document").value);
  const uf = byId("set-uf").value.trim().toUpperCase();
  const cep = digits(byId("set-cep").value);
  if (!company) return alert("Informe o nome da empresa.");
  if (document && ![11, 14].includes(document.length)) return alert("CNPJ/CPF da empresa deve possuir 14 ou 11 digitos.");
  if (uf.length !== 2) return alert("Informe uma UF valida.");
  if (cep && cep.length !== 8) return alert("CEP da empresa deve possuir 8 digitos.");
  state.settings.company = company;
  state.settings.document = document;
  state.settings.stateRegistration = byId("set-ie").value;
  state.settings.municipalRegistration = byId("set-im").value;
  state.settings.uf = uf;
  state.settings.regime = byId("set-regime").value;
  state.settings.fiscalEnvironment = byId("set-env").value;
  state.settings.fiscalEngine = byId("set-fiscal-engine").value;
  state.settings.acbrHost = byId("set-acbr-host").value;
  state.settings.acbrPort = Number(byId("set-acbr-port").value || 3436);
  state.settings.acbrApiUrl = byId("set-acbr-api-url").value.trim().replace(/\/+$/, "");
  state.settings.fiscalResponsible = byId("set-fiscal-responsible").value;
  state.settings.certificateName = byId("set-certificate-name").value;
  state.settings.certificateExpiresAt = byId("set-certificate-expires").value;
  state.settings.sefazCredentialed = byId("set-sefaz-credentialed").value === "true";
  state.settings.sefazUf = byId("set-sefaz-uf").value.toUpperCase();
  state.settings.cscId = byId("set-csc-id").value;
  state.settings.nfceQrCodeUrl = byId("set-nfce-qrcode-url").value.trim();
  state.settings.nfceConsultaUrl = byId("set-nfce-consulta-url").value.trim();
  state.settings.nfseStandard = byId("set-nfse-standard").value;
  state.settings.nfseProvider = byId("set-nfse-provider").value;
  state.settings.nfseCityCode = byId("set-nfse-city-code").value;
  state.settings.cep = cep;
  state.settings.city = byId("set-city").value;
  state.settings.cityCode = byId("set-city-code").value;
  state.settings.address = byId("set-address").value;
  state.settings.number = byId("set-number").value;
  state.settings.district = byId("set-district").value;
  state.settings.pdvBaudRate = Number(byId("set-pdv-baud-rate").value || 9600);
  state.settings.printerCharsPerLine = Number(byId("set-printer-chars").value || 48);
  state.settings.alertWebhookUrl = byId("set-alert-webhook").value.trim();
  state.settings.whatsappWebhookUrl = byId("set-whatsapp-webhook").value.trim();
  state.settings.emailWebhookUrl = byId("set-email-webhook").value.trim();
  state.settings.paymentProvider = byId("set-payment-provider").value.trim();
  state.settings.pixApiUrl = byId("set-pix-api-url").value.trim();
  state.settings.boletoApiUrl = byId("set-boleto-api-url").value.trim();
  state.settings.paymentAuthHeader = byId("set-payment-auth-header").value.trim() || "Authorization";
  state.settings.paymentAuthScheme = byId("set-payment-auth-scheme").value.trim();
  state.settings.paymentCallbackUrl = byId("set-payment-callback-url").value.trim();
  const certificatePassword = byId("set-certificate-password").value;
  const csc = byId("set-csc").value;
  const acbrApiToken = byId("set-acbr-api-token").value;
  const pixApiToken = byId("set-pix-api-token").value;
  const boletoApiToken = byId("set-boleto-api-token").value;
  const alertWebhookToken = byId("set-alert-webhook-token").value;
  const whatsappWebhookToken = byId("set-whatsapp-webhook-token").value;
  const emailWebhookToken = byId("set-email-webhook-token").value;
  if ((certificatePassword || csc || acbrApiToken || pixApiToken || boletoApiToken || alertWebhookToken || whatsappWebhookToken || emailWebhookToken) && apiOnline && sessionId) {
    try {
      const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/secrets`, {
        method: "POST",
        body: JSON.stringify({ certificatePassword, csc, acbrApiToken, pixApiToken, boletoApiToken, alertWebhookToken, whatsappWebhookToken, emailWebhookToken })
      });
      state.settings.certificatePasswordConfigured = result.certificatePasswordConfigured;
      state.settings.cscConfigured = result.cscConfigured;
      state.settings.acbrApiTokenConfigured = result.acbrApiTokenConfigured;
      state.settings.pixApiTokenConfigured = result.pixApiTokenConfigured;
      state.settings.boletoApiTokenConfigured = result.boletoApiTokenConfigured;
      state.settings.alertWebhookTokenConfigured = result.alertWebhookTokenConfigured;
      state.settings.whatsappWebhookTokenConfigured = result.whatsappWebhookTokenConfigured;
      state.settings.emailWebhookTokenConfigured = result.emailWebhookTokenConfigured;
    } catch {
      alert("Dados comuns salvos. Para guardar senha do certificado e CSC, configure PEGMA_SECRET_KEY no provedor.");
    }
  }
  audit("Configuracoes alteradas", `${state.settings.company} - ${state.settings.regime}`);
  save();
  renderShell();
}

function operationReadiness() {
  const tenant = getCurrentTenant();
  const items = [
    { label: "Empresa e endereco configurados", ok: Boolean(state.settings.company && state.settings.uf && state.settings.city) },
    { label: "Usuario administrador ativo", ok: (state.users || []).some((user) => user.active !== false && user.role === "Administrador") },
    { label: "Cliente consumidor final cadastrado", ok: state.people.some((person) => person.type === "Cliente" && person.active !== false) },
    { label: "Fornecedor cadastrado", ok: state.people.some((person) => person.type === "Fornecedor" && person.active !== false) },
    { label: "Produtos ativos com preco", ok: state.products.some((product) => product.active !== false && Number(product.price || 0) > 0) },
    { label: "Produtos com estoque minimo", ok: state.products.some((product) => Number(product.minStock || 0) > 0) },
    { label: "Regras fiscais do regime atual", ok: state.fiscalRules.some((rule) => rule.active !== false && rule.regime === state.settings.regime) },
    { label: "Licenca e terminais definidos", ok: Boolean(tenant?.status === "Ativo" && Number(tenant?.maxTerminals || 0) > 0) },
    { label: "Backup automatico habilitado pelo servidor", ok: apiOnline },
    { label: "Configuracao fiscal pronta para homologacao", ok: fiscalReadiness().ok }
  ];
  return { items, ready: items.filter((item) => item.ok).length };
}

function fiscalReadiness() {
  const missing = [];
  if (!state.settings.document || state.settings.document.replace(/\D/g, "").length < 14) missing.push("CNPJ");
  if (/^(\d)\1{13}$/.test(state.settings.document.replace(/\D/g, ""))) missing.push("CNPJ real");
  if (!state.settings.city) missing.push("municipio do emitente");
  if (!state.settings.cityCode) missing.push("codigo IBGE do municipio do emitente");
  if (!state.settings.stateRegistration && ["NF-e", "NFC-e"].some((model) => (state.fiscalRules || []).some((rule) => rule.model === model))) missing.push("inscricao estadual");
  if (!state.settings.municipalRegistration && (state.fiscalRules || []).some((rule) => rule.model === "NFS-e")) missing.push("inscricao municipal");
  if (!state.settings.fiscalEngine) missing.push("motor fiscal ACBr");
  if (state.settings.fiscalEngine === "ACBrMonitor" && !state.settings.acbrHost) missing.push("host ACBrMonitor");
  if (state.settings.fiscalEngine === "ACBrMonitor" && !state.settings.acbrPort) missing.push("porta ACBrMonitor");
  if (state.settings.acbrApiUrl && !state.settings.acbrApiTokenConfigured) missing.push("token protegido do agente fiscal");
  if (!state.settings.certificateName) missing.push("certificado A1");
  if (!state.settings.certificateExpiresAt) missing.push("validade do certificado");
  if (!state.settings.fiscalResponsible) missing.push("responsavel fiscal");
  if (!state.settings.sefazCredentialed) missing.push("credenciamento SEFAZ");
  if (!state.settings.certificatePasswordConfigured) missing.push("senha protegida do certificado");
  if ((state.fiscalRules || []).some((rule) => rule.model === "NFC-e") && (!state.settings.cscConfigured || !state.settings.cscId)) missing.push("CSC e ID CSC da NFC-e");
  if ((state.fiscalRules || []).some((rule) => rule.model === "NFS-e") && (!state.settings.nfseStandard || !state.settings.nfseCityCode)) missing.push("padrao e municipio da NFS-e");
  return {
    ok: missing.length === 0,
    missing,
    label: missing.length ? `Pendente: ${missing.length} item(ns)` : "Pronto para homologacao"
  };
}

async function showFiscalReadiness() {
  const readiness = fiscalReadiness();
  const provider = state.settings.fiscalEngine || "ACBrLib";
  if (apiOnline && sessionId) {
    try {
      const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/provider-status`);
      const status = result.status;
      const acbrMessage = result.acbr?.connected
        ? `ACBr conectado pelo motor ${result.acbr.engine}${result.acbr.host ? ` em ${result.acbr.host}:${result.acbr.port}` : ""}.`
        : `ACBr indisponivel: ${result.acbr?.message || "sem conexao"}.`;
      alert(status.ready && result.acbr?.connected
        ? `${status.provider} pronto para homologacao com certificado ${status.certificateName}. ${acbrMessage}`
        : `Diagnostico do servidor: ${acbrMessage} Ainda falta: ${status.missing.join(", ") || "conectar o ACBr"}.`);
      return;
    } catch {
      undefined;
    }
  }
  if (readiness.ok) {
    alert(`${provider} configurado para homologacao. Proximo passo: usar certificado e credenciais reais de teste para emitir documento em ambiente de homologacao.`);
    return;
  }
  alert(`Para validar emissao fiscal em homologacao ainda falta: ${readiness.missing.join(", ")}.`);
}

function saveFiscalRuleRecord() {
  const regime = byId("rule-regime").value;
  const model = byId("rule-model").value;
  const cst = byId("rule-cst").value || "";
  const csosn = byId("rule-csosn").value || "";
  if (model !== "NFS-e" && regime === "Simples Nacional" && !csosn) {
    alert("Informe o CSOSN para regra do Simples Nacional.");
    return;
  }
  if (model !== "NFS-e" && regime !== "Simples Nacional" && !cst) {
    alert("Informe o CST para Lucro Presumido ou Lucro Real.");
    return;
  }
  state.fiscalRules = state.fiscalRules || [];
  const uf = byId("rule-uf").value.toUpperCase() || state.settings.uf;
  const municipio = byId("rule-municipio").value;
  const validFrom = byId("rule-valid-from").value || today();
  const validTo = byId("rule-valid-to").value || "";
  const overlaps = state.fiscalRules.some((rule) => rule.active !== false
    && rule.regime === regime && rule.model === model && rule.uf === uf
    && String(rule.municipio || "") === String(municipio || "")
    && (!rule.validTo || rule.validTo >= validFrom)
    && (!validTo || !rule.validFrom || rule.validFrom <= validTo));
  if (overlaps && !confirm("Ja existe uma regra ativa sobreposta para este regime, modelo, UF e municipio. Deseja cadastrar uma nova versao mesmo assim?")) return;
  state.fiscalRules.push({
    id: nextId(state.fiscalRules),
    name: byId("rule-name").value || "Regra fiscal",
    regime,
    crt: taxRegimeCode(regime),
    uf,
    municipio,
    model,
    operation: byId("rule-operation").value || "Venda de mercadoria",
    cfop: byId("rule-cfop").value || "5102",
    cst,
    csosn,
    ncm: byId("rule-ncm").value || "",
    cest: byId("rule-cest").value || "",
    origin: byId("rule-origin").value || "0",
    pisCofinsCst: byId("rule-pis-cofins-cst").value || "49",
    pisRate: num("rule-pis-rate"),
    cofinsRate: num("rule-cofins-rate"),
    icmsRate: num("rule-icms-rate"),
    issRate: num("rule-iss-rate"),
    fcpRate: num("rule-fcp-rate"),
    mvaRate: num("rule-mva-rate"),
    ibsClass: byId("rule-ibs").value || "000001",
    cbsClass: byId("rule-cbs").value || "000001",
    ibsCbsCst: byId("rule-ibs-cbs-cst").value || "000",
    ibsRate: num("rule-ibs-rate"),
    cbsRate: num("rule-cbs-rate"),
    ibsUfRate: num("rule-ibs-uf-rate"),
    ibsCityRate: num("rule-ibs-city-rate"),
    cbsFederalRate: num("rule-cbs-federal-rate"),
    presumedCreditRate: num("rule-presumed-credit-rate"),
    transitionYear: byId("rule-transition-year").value || "2026",
    reformReductionRate: num("rule-reform-reduction-rate"),
    selectiveTaxRate: num("rule-selective-rate"),
    serviceCode: byId("rule-service-code").value || "",
    cityServiceCode: byId("rule-city-service-code").value || "",
    taxBenefitCode: byId("rule-tax-benefit").value || "",
    reductionReason: byId("rule-reduction-reason").value || "",
    validFrom,
    validTo,
    version: state.fiscalRules.filter((rule) => rule.regime === regime && rule.model === model && rule.uf === uf).length + 1,
    active: true
  });
  audit("Regra fiscal cadastrada", byId("rule-name").value || "Regra fiscal");
  save();
  renderShell();
}

async function saveUserRecord() {
  if (!requirePermission("manage_users")) return;
  if (!apiOnline) {
    alert("Cadastro de usuario exige API online para gravar senha com seguranca.");
    return;
  }
  const role = byId("user-role").value;
  const selectedPermissions = [...document.querySelectorAll(".user-permission:checked")].map((input) => input.value);
  const payload = {
    name: byId("user-name").value || byId("user-login").value,
    username: byId("user-login").value,
    password: byId("user-password").value,
    role,
    permissions: selectedPermissions.length ? selectedPermissions : rolePermissions[role]
  };
  if (!payload.username || !payload.password) {
    alert("Informe usuario e senha.");
    return;
  }
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/users`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.users = [...(state.users || []), result.user];
    localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
    renderShell();
  } catch {
    alert("Nao foi possivel cadastrar usuario. Verifique se ele ja existe.");
  }
}

async function changeOwnPassword() {
  if (!apiOnline || !sessionId) return alert("A alteracao de senha exige conexao com o servidor.");
  const currentPassword = byId("current-password").value;
  const newPassword = byId("new-password").value;
  if (newPassword.length < 8) return alert("A nova senha deve possuir pelo menos 8 caracteres.");
  try {
    await api(`/api/tenant/${state.settings.tenantCode}/auth/password`, {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    });
    byId("current-password").value = "";
    byId("new-password").value = "";
    alert("Senha alterada com sucesso.");
  } catch (error) {
    alert(`Senha nao alterada: ${error.message}`);
  }
}

function taxRegimeCode(regime) {
  return regime === "Simples Nacional" ? "1" : "3";
}

function ensureFiscalRuleCoverage() {
  state.fiscalRules = state.fiscalRules || [];
  const regimes = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];
  const models = ["NF-e", "NFC-e", "NFS-e"];
  for (const regime of regimes) {
    for (const model of models) {
      if (state.fiscalRules.some((rule) => rule.regime === regime && rule.model === model && rule.uf === state.settings.uf)) continue;
      state.fiscalRules.push({
        id: nextId(state.fiscalRules),
        name: `${model} ${regime} - revisar com contador`,
        regime,
        crt: taxRegimeCode(regime),
        uf: state.settings.uf,
        municipio: model === "NFS-e" ? state.settings.city || "" : "",
        model,
        operation: model === "NFS-e" ? "Prestacao de servico" : "Venda de mercadoria",
        cfop: model === "NFS-e" ? "5933" : "5102",
        cst: regime === "Simples Nacional" ? "" : "00",
        csosn: regime === "Simples Nacional" ? "102" : "",
        ncm: "",
        origin: "0",
        pisCofinsCst: regime === "Simples Nacional" ? "49" : "01",
        ibsCbsCst: "000",
        ibsClass: "000001",
        cbsClass: "000001",
        serviceCode: model === "NFS-e" ? "14.01" : "",
        validFrom: "2026-01-01",
        active: true,
        requiresAccountantReview: true
      });
    }
  }
}

function validateFiscalDocument(row) {
  const missing = [];
  const rule = findFiscalRule(row.model, row.nature);
  const items = Array.isArray(row.items) && row.items.length
    ? row.items
    : (state.sales || []).find((sale) => Number(sale.id) === Number(row.saleId))?.items || [];
  if (!rule.id) missing.push(`regra fiscal ativa para ${state.settings.regime}, ${state.settings.uf} e ${row.model}`);
  if (Number(row.total || 0) <= 0) missing.push("total maior que zero");
  if (!String(state.settings.document || "").replace(/\D/g, "").match(/^\d{14}$/)) missing.push("CNPJ valido do emitente");
  if (row.model === "NFS-e") {
    if (!state.settings.municipalRegistration) missing.push("inscricao municipal");
    if (!row.service?.city) missing.push("municipio da prestacao");
    if (!row.service?.cityCode) missing.push("codigo IBGE do municipio");
    if (!row.service?.serviceCode) missing.push("item da lista de servico");
    if (!row.service?.description) missing.push("discriminacao do servico");
  } else {
    if (!state.settings.stateRegistration) missing.push("inscricao estadual");
    if (!items.length) missing.push("venda de origem com itens");
    if (row.model === "NF-e") {
      const customerDocument = String(row.customerDocument || findPersonByName(row.customer)?.document || "").replace(/\D/g, "");
      if (![11, 14].includes(customerDocument.length)) missing.push("CPF/CNPJ do destinatario da NF-e");
    }
    if (row.model === "NFC-e" && (!state.settings.cscConfigured || !state.settings.cscId)) missing.push("CSC e ID CSC");
    if (!rule.ncm) missing.push("NCM na regra fiscal");
    if (state.settings.regime === "Simples Nacional" && !rule.csosn) missing.push("CSOSN");
    if (state.settings.regime !== "Simples Nacional" && !rule.cst) missing.push("CST");
  }
  return missing;
}

function fiscalXml(row) {
  const rule = findFiscalRule(row.model, row.nature);
  const service = row.service || {};
  const customerDocument = row.customerDocument || service.customerDocument || "";
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<PegmaPlusFiscal ambiente="${state.settings.fiscalEnvironment}" modelo="${row.model}">`,
    `  <Emitente nome="${escapeXml(state.settings.company)}" documento="${escapeXml(state.settings.document || "")}" uf="${escapeXml(state.settings.uf || "")}" regime="${escapeXml(state.settings.regime || "")}" crt="${taxRegimeCode(state.settings.regime)}" />`,
    `  <Destinatario nome="${escapeXml(row.customer)}" documento="${escapeXml(customerDocument)}" />`,
    `  <Operacao natureza="${escapeXml(row.nature || rule.operation || "Venda de mercadoria")}" cfop="${escapeXml(rule.cfop || "5102")}" cst="${escapeXml(rule.cst || "102")}" csosn="${escapeXml(rule.csosn || "")}" origem="${escapeXml(rule.origin || "0")}" />`,
    `  <Produto ncm="${escapeXml(rule.ncm || "")}" cest="${escapeXml(rule.cest || "")}" />`,
    `  <ICMS aliquota="${Number(rule.icmsRate || 0).toFixed(2)}" fcp="${Number(rule.fcpRate || 0).toFixed(2)}" mva="${Number(rule.mvaRate || 0).toFixed(2)}" beneficio="${escapeXml(rule.taxBenefitCode || "")}" desoneracao="${escapeXml(rule.reductionReason || "")}" />`,
    `  <PISCOFINS cst="${escapeXml(rule.pisCofinsCst || "")}" pis="${Number(rule.pisRate || 0).toFixed(2)}" cofins="${Number(rule.cofinsRate || 0).toFixed(2)}" />`,
    `  <ReformaTributaria cst="${escapeXml(rule.ibsCbsCst || "000")}" ibsClass="${escapeXml(rule.ibsClass || "000001")}" cbsClass="${escapeXml(rule.cbsClass || "000001")}" ibs="${Number(rule.ibsRate || 0).toFixed(2)}" ibsUf="${Number(rule.ibsUfRate || 0).toFixed(2)}" ibsMunicipio="${Number(rule.ibsCityRate || 0).toFixed(2)}" cbs="${Number(rule.cbsRate || 0).toFixed(2)}" cbsFederal="${Number(rule.cbsFederalRate || 0).toFixed(2)}" creditoPresumido="${Number(rule.presumedCreditRate || 0).toFixed(2)}" reducaoBase="${Number(rule.reformReductionRate || 0).toFixed(2)}" anoTransicao="${escapeXml(rule.transitionYear || "2026")}" impostoSeletivo="${Number(rule.selectiveTaxRate || 0).toFixed(2)}" />`,
    `  <Servico codigo="${escapeXml(service.serviceCode || rule.serviceCode || "")}" codigoMunicipal="${escapeXml(service.cityServiceCode || rule.cityServiceCode || "")}" municipio="${escapeXml(service.city || rule.municipio || "")}" codigoIbge="${escapeXml(service.cityCode || "")}" nbs="${escapeXml(service.nbs || "")}" cnae="${escapeXml(service.cnae || "")}" iss="${Number(service.issRate ?? rule.issRate ?? 0).toFixed(2)}" issRetido="${escapeXml(service.issWithheld || "false")}" exigibilidade="${escapeXml(service.issExigibility || "")}" />`,
    `  <Discriminacao>${escapeXml(service.description || "")}</Discriminacao>`,
    `  <Vigencia inicio="${escapeXml(rule.validFrom || "")}" fim="${escapeXml(rule.validTo || "")}" />`,
    `  <Total>${Number(row.total || 0).toFixed(2)}</Total>`,
    `</PegmaPlusFiscal>`
  ].join("\n");
}

function findFiscalRule(model, nature = "") {
  const todayText = today();
  return (state.fiscalRules || []).find((item) =>
    item.active !== false &&
    item.model === model &&
    item.regime === state.settings.regime &&
    item.uf === state.settings.uf &&
    (!item.validFrom || item.validFrom <= todayText) &&
    (!item.validTo || item.validTo >= todayText) &&
    (!nature || !item.operation || String(nature).toLowerCase().includes(String(item.operation).toLowerCase().slice(0, 8)))
  ) || (state.fiscalRules || []).find((item) =>
    item.active !== false &&
    item.model === model &&
    item.regime === state.settings.regime &&
    item.uf === state.settings.uf
  ) || {};
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

function createFiscalRecord() {
  const model = currentTab === "nfe" ? "NF-e" : "NFC-e";
  const saleId = Number(byId("fiscal-sale-id")?.value || 0);
  const sale = (state.sales || []).find((item) => Number(item.id) === saleId);
  if (!sale || !Array.isArray(sale.items) || !sale.items.length) {
    alert("Selecione uma venda fechada com itens para gerar NF-e/NFC-e.");
    return;
  }
  const customer = byId("fiscal-customer").value || sale.customer || "Consumidor Final";
  const person = findPersonByName(customer);
  const row = {
    id: nextId(state.fiscalQueue),
    model,
    saleId: sale.id,
    serie: byId("fiscal-serie").value || "1",
    nature: byId("fiscal-nature").value || "Venda de mercadoria",
    status: "Pendente",
    customer,
    customerDocument: person.document || sale.customerDocument || "",
    total: Number(sale.total || byId("fiscal-total").value || 0),
    discount: Number(sale.discount || 0),
    addition: Number(sale.addition || 0),
    exchangeCredit: Number(sale.exchangeCredit || 0),
    change: Number(sale.change || 0),
    payment: sale.payment || "",
    payments: sale.payments || [],
    items: sale.items,
    issuedAt: new Date().toISOString(),
    key: "",
    protocol: "",
    xml: ""
  };
  const missing = validateFiscalDocument(row);
  if (missing.length) {
    alert(`Nao foi possivel gerar ${model}. Corrija: ${missing.join(", ")}.`);
    return;
  }
  row.xml = fiscalXml(row);
  state.fiscalQueue.push(row);
  audit("Documento fiscal gerado", `${model} ${row.customer} ${money(row.total)}`);
  save();
  renderShell();
}

function createNfseRecord() {
  const value = num("nfse-service-value");
  const discount = num("nfse-discount");
  const total = Math.max(0, value - discount);
  if (total <= 0) {
    alert("Informe o valor do servico.");
    return;
  }
  const customer = byId("nfse-customer")?.value || "Tomador nao informado";
  const row = {
    id: nextId(state.fiscalQueue),
    model: "NFS-e",
    serie: byId("nfse-serie").value || "1",
    nature: byId("nfse-nature").value || "Prestacao de servico",
    status: "Pendente",
    customer,
    customerDocument: byId("nfse-customer-doc").value,
    total,
    serviceValue: value,
    discount,
    key: "",
    protocol: "",
    xml: "",
    service: {
      city: byId("nfse-city").value,
      cityCode: byId("nfse-city-code").value,
      serviceCode: byId("nfse-service-code").value,
      cityServiceCode: byId("nfse-city-service-code").value,
      nbs: byId("nfse-nbs").value,
      cnae: byId("nfse-cnae").value,
      issRate: num("nfse-iss-rate"),
      issWithheld: byId("nfse-iss-withheld").value,
      issExigibility: byId("nfse-iss-exigibility").value,
      description: byId("nfse-description").value
    }
  };
  const missing = validateFiscalDocument(row);
  if (missing.length) {
    alert(`Nao foi possivel gerar NFS-e. Corrija: ${missing.join(", ")}.`);
    return;
  }
  row.xml = fiscalXml(row);
  state.fiscalQueue.push(row);
  state.receivables.push({
    id: nextId(state.receivables),
    customer,
    due: today(),
    value: total,
    paid: false,
    history: `NFS-e ${row.id} - ${row.nature}`
  });
  audit("NFS-e gerada", `${customer} ${money(total)}`);
  save();
  renderShell();
}

async function transmitFiscalRecord(id) {
  if (!requirePermission("fiscal_transmit")) return;
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row || row.cancelledAt || String(row.status).startsWith("Cancelada")) return;
  const missing = validateFiscalDocument(row);
  if (missing.length) {
    alert(`Envio bloqueado. Corrija: ${missing.join(", ")}.`);
    return;
  }
  if (apiOnline && sessionId) {
    try {
      const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/transmit`, {
        method: "POST",
        body: JSON.stringify({ document: row })
      });
      Object.assign(row, result.document);
      row.attempts = Number(row.attempts || 0) + 1;
      row.nextAttemptAt = "";
      row.lastFiscalError = "";
      audit("Documento fiscal transmitido", `${row.model} ${row.key}`);
      save();
      renderShell();
      return;
    } catch (error) {
      row.status = "Falha no envio real";
      row.lastFiscalError = error.message || "Servidor fiscal indisponivel";
      row.attempts = Number(row.attempts || 0) + 1;
      row.nextAttemptAt = new Date(Date.now() + Math.min(30, 2 ** Math.min(row.attempts, 5)) * 60000).toISOString();
    }
  }
  if (!apiOnline || !sessionId) row.status = "Aguardando servidor fiscal";
  row.processedAt = new Date().toISOString();
  row.xml = fiscalXml(row);
  audit("Envio fiscal pendente", `${row.model} ${row.id} - ${row.status}`);
  save();
  renderShell();
}

async function processPendingFiscalQueue() {
  if (!navigator.onLine || !apiOnline || !sessionId) return;
  const now = Date.now();
  const eligible = state.fiscalQueue.filter((row) => {
    const status = String(row.status || "");
    const pending = ["Pendente", "Fila offline", "Aguardando transmissao", "Aguardando servidor fiscal", "Falha no envio real"].some((value) => status.includes(value));
    return pending && !row.cancelledAt && (!row.nextAttemptAt || new Date(row.nextAttemptAt).getTime() <= now);
  });
  for (const row of eligible.slice(0, 5)) {
    await transmitFiscalRecord(row.id);
  }
}

async function retryPendingFiscalQueue() {
  if (!navigator.onLine || !apiOnline || !sessionId) return alert("Conecte o sistema ao servidor fiscal para reprocessar a fila.");
  state.fiscalQueue.forEach((row) => {
    if (!["Autorizada", "Cancelada"].includes(row.status)) row.nextAttemptAt = "";
  });
  audit("Fila fiscal reprocessada", "Reprocessamento manual solicitado");
  save();
  await processPendingFiscalQueue();
  renderShell();
}

function requireFiscalApiConnection(action) {
  if (apiOnline && sessionId) return true;
  alert(`${action} exige conexao com o servidor fiscal.`);
  return false;
}

async function queryFiscalRecord(id) {
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row || !apiOnline || !sessionId) return alert("A consulta fiscal exige conexao com o servidor.");
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/query`, { method: "POST", body: JSON.stringify({ id }) });
    Object.assign(row, result.document);
    audit("Documento fiscal consultado", `${row.model} ${row.id}`);
    save();
    renderShell();
  } catch (error) {
    alert(`Consulta fiscal indisponivel: ${error.message}`);
  }
}

async function sendFiscalCorrection(id) {
  if (!requireFiscalApiConnection("Carta de Correcao")) return;
  const text = prompt("Informe a correcao da NF-e (minimo 15 caracteres):", "");
  if (!text || text.trim().length < 15) return;
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/event`, { method: "POST", body: JSON.stringify({ id, type: "cce", text }) });
    Object.assign(state.fiscalQueue.find((item) => item.id === id), result.document);
    audit("Carta de Correcao registrada", `NF-e ${id}`);
    save();
    renderShell();
  } catch (error) {
    alert(`CC-e nao registrada: ${error.message}`);
  }
}

async function manifestFiscalRecord() {
  if (!requireFiscalApiConnection("Manifestacao de NF-e")) return;
  const key = String(prompt("Informe a chave de 44 digitos da NF-e recebida:", "") || "").replace(/\D/g, "");
  if (key.length !== 44) return;
  const type = prompt("Manifestacao: digite confirmacao, ciencia, desconhecimento ou naoRealizada:", "ciencia");
  if (!["confirmacao", "ciencia", "desconhecimento", "naoRealizada"].includes(type)) return;
  try {
    await api(`/api/tenant/${state.settings.tenantCode}/fiscal/event`, { method: "POST", body: JSON.stringify({ key, type }) });
    audit("Manifestacao registrada", `NF-e ${key} ${type}`);
    save();
    alert("Manifestacao registrada pela SEFAZ.");
  } catch (error) {
    alert(`Manifestacao nao registrada: ${error.message}`);
  }
}

async function distributeFiscalDocuments() {
  if (!requireFiscalApiConnection("Distribuicao DF-e")) return;
  const query = prompt("Informe uma chave NF-e para busca especifica ou deixe vazio para buscar a partir do ultimo NSU:", "");
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/distribution`, {
      method: "POST",
      body: JSON.stringify(query ? { key: query.replace(/\D/g, "") } : { lastNsu: state.settings.lastDfeNsu || "0" })
    });
    alert(`Distribuicao DF-e concluida pela SEFAZ.\n${result.distribution.statusMessage || "Retorno armazenado."}`);
  } catch (error) {
    alert(`Distribuicao DF-e indisponivel: ${error.message}`);
  }
}

async function inutilizeFiscalRange() {
  if (!requireFiscalApiConnection("Inutilizacao fiscal")) return;
  const model = prompt("Modelo a inutilizar: NF-e ou NFC-e", currentTab === "nfce" ? "NFC-e" : "NF-e");
  if (!["NF-e", "NFC-e"].includes(model)) return;
  const series = Number(prompt("Serie:", "1"));
  const start = Number(prompt("Numero inicial:", ""));
  const end = Number(prompt("Numero final:", String(start || "")));
  const reason = prompt("Justificativa real (minimo 15 caracteres):", "");
  if (!series || !start || !end || !reason || reason.trim().length < 15) return;
  try {
    await api(`/api/tenant/${state.settings.tenantCode}/fiscal/inutilize`, { method: "POST", body: JSON.stringify({ model, series, start, end, reason }) });
    audit("Faixa fiscal inutilizada", `${model} ${start}-${end}`);
    save();
    alert("Inutilizacao homologada pela SEFAZ.");
  } catch (error) {
    alert(`Inutilizacao nao realizada: ${error.message}`);
  }
}

async function cancelFiscalRecord(id) {
  if (!requirePermission("fiscal_cancel")) return;
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row || row.cancelledAt || String(row.status).startsWith("Cancelada")) return;
  if (apiOnline && sessionId) {
    try {
      const reason = row.protocol || row.status === "Autorizada"
        ? prompt("Informe a justificativa real do cancelamento (minimo 15 caracteres):", "")
        : "";
      if ((row.protocol || row.status === "Autorizada") && (!reason || reason.trim().length < 15)) return;
      const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/cancel`, {
        method: "POST",
        body: JSON.stringify({ id, reason })
      });
      Object.assign(row, result.document);
      audit("Documento fiscal cancelado", `${row.model} ${row.id}`);
      save();
      renderShell();
      return;
    } catch (error) {
      row.status = "Falha no cancelamento real";
      row.lastFiscalError = error.message || "Servidor fiscal indisponivel";
    }
  }
  if (!row.protocol && row.status !== "Autorizada") {
    row.status = "Cancelada antes da transmissao";
    row.cancelledAt = new Date().toISOString();
    audit("Documento fiscal descartado", `${row.model} ${row.id}`);
  }
  save();
  renderShell();
}

async function printFiscalRecord(id) {
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row) return;
  const label = row.model === "NFS-e" ? "DANFSe oficial" : row.model === "NFC-e" ? "DANFCE oficial" : "DANFE oficial";
  if (!requireFiscalApiConnection(label)) return;
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/print`, {
      method: "POST",
      body: JSON.stringify({ id })
    });
    Object.assign(row, result.document);
    audit("Impressao fiscal solicitada ao ACBr", `${row.model} ${row.id}`);
    save();
    if (result.pdfUrl) window.open(result.pdfUrl, "_blank");
  } catch (error) {
    alert(`Impressao oficial indisponivel: ${error.message}`);
  }
}

function downloadFiscalPdf(id) {
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row?.pdfUrl) return alert("Gere o documento auxiliar antes de baixar o PDF.");
  const link = document.createElement("a");
  link.href = row.pdfUrl;
  link.download = `${row.model.replace(/\W/g, "")}-${row.id}.pdf`;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function importFiscalXml(event) {
  const file = event.target.files?.[0];
  if (!file || !apiOnline || !sessionId) return;
  try {
    const xml = await file.text();
    const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/import-xml`, {
      method: "POST",
      body: JSON.stringify({ xml })
    });
    audit("XML fiscal importado", result.imported.key || result.imported.number || file.name);
    save();
    alert("XML fiscal importado e conferido.");
  } catch (error) {
    alert(`Nao foi possivel importar o XML: ${error.message}`);
  } finally {
    event.target.value = "";
  }
}

async function exportFiscalXml(id) {
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row) return;
  row.xml = row.xml || fiscalXml(row);
  if (apiOnline && sessionId && !row.xmlUrl) {
    try {
      const uploaded = await uploadTenantFile({
        category: "xml",
        filename: `xml-${row.model}-${row.id}.xml`,
        mimeType: "application/xml",
        content: btoa(unescape(encodeURIComponent(row.xml)))
      });
      row.xmlUrl = uploaded.url;
    } catch {
      undefined;
    }
  }
  downloadText(`xml-${row.model}-${row.id}.xml`, row.xml);
  audit("XML exportado", `${row.model} ${row.id}`);
  save();
}

async function markFiscalContingency(id) {
  if (!requireFiscalApiConnection("Contingencia NFC-e")) return;
  const row = state.fiscalQueue.find((item) => item.id === id);
  if (!row || row.cancelledAt || String(row.status).startsWith("Cancelada")) return;
  const reason = prompt("Informe o motivo real da contingencia (minimo 15 caracteres):", "Indisponibilidade temporaria de comunicacao com a SEFAZ");
  if (!reason || reason.trim().length < 15) return;
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/contingency`, { method: "POST", body: JSON.stringify({ id, reason }) });
    Object.assign(row, result.document);
    audit("NFC-e em contingencia offline", `${row.id}`);
    save();
    renderShell();
  } catch (error) {
    alert(`Contingencia nao gerada: ${error.message}`);
  }
}

function exportReportCsv() {
  const definitions = {
    Produtos: [["produto", "tipo", "ncm", "cfop", "cst", "custo", "venda", "composicao"], ...state.products.map((product) => [product.description, product.type, product.ncm, product.cfop, product.cst, product.cost, product.price, product.isBundle ? (product.composition || []).length : 0])],
    Estoque: [["produto", "atual", "minimo", "sugerido", "custo_parado", "situacao"], ...state.products.map((product) => [product.description, product.stock, product.minStock, Math.max(0, Number(product.minStock || 0) - Number(product.stock || 0)), Number(product.stock || 0) * Number(product.cost || 0), product.stock <= product.minStock ? "comprar" : "ok"])],
    Vendas: [["numero", "data", "cliente", "tipo", "pagamento", "total", "status"], ...reportRows(state.sales, "date").map((sale) => [sale.id, sale.date, sale.customer, sale.type, sale.payment, sale.total, sale.status])],
    Financeiro: [["tipo", "numero", "nome", "vencimento", "valor", "saldo", "status"], ...reportRows(state.receivables, "due").map((row) => ["receber", row.id, row.customer, row.due, row.value, financeBalance(row), row.paid ? "recebido" : "aberto"]), ...reportRows(state.payables, "due").map((row) => ["pagar", row.id, row.supplier, row.due, row.value, financeBalance(row), row.paid ? "pago" : "aberto"])],
    Fiscal: [["numero", "modelo", "emissao", "cliente_tomador", "total", "status", "chave", "protocolo", "xml", "pdf"], ...reportRows(state.fiscalQueue, "issuedAt").map((row) => [row.id, row.model, row.issuedAt, row.customer, row.total, row.status, row.key, row.protocol, row.xmlUrl, row.pdfUrl])],
    Compras: [["numero", "data", "fornecedor", "documento", "chave", "total", "status"], ...reportRows(state.purchases, "date").map((row) => [row.id, row.date, row.supplier, row.document, row.accessKey, row.total, row.status || (row.cancelled ? "cancelada" : "finalizada")])]
  };
  const rows = definitions[currentTab] || [
    ["tipo", "codigo", "data", "nome", "valor", "status"],
    ...reportRows(state.sales, "date").map((sale) => ["venda", sale.id, sale.date, sale.customer, sale.total, sale.status]),
    ...reportRows(state.cash, "date").map((row) => ["caixa", row.id, row.date, row.history, Number(row.in || 0) - Number(row.out || 0), row.account])
  ];
  downloadText(`tortelaplus-${reportTitle().toLowerCase().replace(/\W+/g, "-")}-${reportPeriod.from}-${reportPeriod.to}.csv`, rows.map((row) => row.map(csvCell).join(";")).join("\n"));
}

function printCurrentReport() {
  const report = window.open("", "_blank", "noopener,noreferrer");
  if (!report) return alert("O navegador bloqueou a janela de impressao.");
  report.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${reportTitle()}</title><style>body{font-family:Arial,sans-serif;color:#10233f;padding:24px}h1{font-size:22px}small{color:#556987}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #c8d7e8;padding:7px;text-align:left;font-size:12px}th{background:#eaf5ff}@media print{button{display:none}}</style></head><body><h1>${reportTitle()}</h1><small>${state.settings.company} | ${reportPeriod.from} a ${reportPeriod.to}</small>${reportTable()}<script>window.onload=()=>window.print()<\/script></body></html>`);
  report.document.close();
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportBackupJson() {
  audit("Backup exportado", state.settings.tenantCode);
  save();
  const backup = {
    product: "Tortela Plus",
    version: "0.1.0",
    tenantCode: state.settings.tenantCode,
    generatedAt: new Date().toISOString(),
    isolation: "tenant-state",
    state
  };
  downloadText(`backup-tortelaplus-${state.settings.tenantCode}-${today()}.json`, JSON.stringify(backup, null, 2));
}

function downloadJson(filename, content) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

async function downloadCompleteTenantBackup() {
  if (!apiOnline || !sessionId) {
    exportBackupJson();
    alert("Sem conexao com o servidor. Foi baixado o backup local disponivel neste navegador.");
    return;
  }
  const button = byId("header-backup");
  button.disabled = true;
  button.textContent = "Gerando...";
  try {
    const backup = await api(`/api/tenant/${state.settings.tenantCode}/backup-complete`);
    downloadJson(`backup-completo-${state.settings.tenantCode}-${today()}.json`, backup);
    alert(`Backup completo baixado. Arquivos fiscais incluidos: ${backup.fiscalFileArchive?.totalFiles || backup.fiscalXmlArchive?.totalFiles || 0}.`);
  } catch (error) {
    alert(`Nao foi possivel gerar o backup completo: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Backup";
  }
}

async function downloadTenantXmlBackup() {
  if (!apiOnline || !sessionId) {
    const localXmls = (state.fiscalQueue || []).filter((row) => row.xml).map((row) => ({
      filename: `${row.model}-${row.id}.xml`,
      content: row.xml
    }));
    downloadJson(`backup-xml-local-${state.settings.tenantCode}-${today()}.json`, {
      tenantCode: state.settings.tenantCode,
      generatedAt: new Date().toISOString(),
      source: "armazenamento-local-do-navegador",
      totalFiles: localXmls.length,
      files: localXmls
    });
    alert("Sem conexao com o servidor. Foram baixados os XMLs disponiveis neste navegador.");
    return;
  }
  const button = byId("header-xml-backup");
  button.disabled = true;
  button.textContent = "Gerando...";
  try {
    const archive = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/xml-backup`);
    downloadJson(`backup-xml-${state.settings.tenantCode}-${today()}.json`, archive);
    alert(`Backup fiscal baixado com ${archive.totalFiles} XMLs.`);
  } catch (error) {
    alert(`Nao foi possivel gerar o backup dos XMLs: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Backup XMLs";
  }
}

function exportCompleteCsvRecord() {
  const rows = [["tipo", "id", "nome", "documento_codigo", "quantidade_valor", "detalhe"]];
  state.people.forEach((row) => rows.push(["pessoa", row.id, row.name, row.document || "", row.type, `${row.city || ""}/${row.uf || ""}`]));
  state.products.forEach((row) => rows.push(["produto", row.id, row.description, row.barcode || "", row.stock, `${row.unit};${row.cost};${row.price};${row.ncm || ""}`]));
  state.sales.forEach((row) => rows.push(["venda", row.id, row.customer, row.date, row.total, row.status]));
  state.purchases.forEach((row) => rows.push(["compra", row.id, row.supplier, row.document || "", row.total, row.status || "Confirmada"]));
  state.receivables.forEach((row) => rows.push(["receber", row.id, row.customer, row.due, row.value, row.paid ? "pago" : "aberto"]));
  state.payables.forEach((row) => rows.push(["pagar", row.id, row.supplier, row.due, row.value, row.paid ? "pago" : "aberto"]));
  downloadText(`tortelaplus-exportacao-completa-${today()}.csv`, rows.map((row) => row.map(csvCell).join(";")).join("\n"));
  audit("Exportacao completa CSV", `${rows.length - 1} registros`);
  save();
}

function importMasterCsvRecord(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lines = String(reader.result || "").split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return alert("Arquivo CSV sem registros.");
    const separator = lines[0].includes(";") ? ";" : ",";
    const parse = (line) => line.split(separator).map((value) => value.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    const headers = parse(lines.shift()).map((value) => value.toLowerCase());
    const get = (row, names) => row[headers.findIndex((header) => names.includes(header))] || "";
    let imported = 0;
    lines.map(parse).forEach((row) => {
      const type = get(row, ["tipo", "type"]).toLowerCase();
      if (type === "produto") {
        const barcode = get(row, ["codigo_barras", "barcode", "documento_codigo"]);
        if (barcode && state.products.some((item) => item.barcode === barcode)) return;
        state.products.push({ id: nextId(state.products), description: get(row, ["nome", "descricao", "description"]), barcode, type: "Mercadoria para revenda", unit: get(row, ["unidade", "unit"]) || "UN", cost: Number(get(row, ["custo", "cost"]) || 0), price: Number(get(row, ["preco", "price", "quantidade_valor"]) || 0), stock: Number(get(row, ["estoque", "stock"]) || 0), minStock: Number(get(row, ["estoque_minimo", "minstock"]) || 0), composition: [], active: true });
        imported += 1;
      } else if (["cliente", "fornecedor", "pessoa"].includes(type)) {
        const document = get(row, ["documento", "cpf", "cnpj", "documento_codigo"]);
        if (document && state.people.some((item) => digits(item.document) === digits(document))) return;
        state.people.push({ id: nextId(state.people), type: type === "fornecedor" ? "Fornecedor" : "Cliente", name: get(row, ["nome", "razao", "name"]), document, cep: get(row, ["cep"]), address: get(row, ["endereco", "address"]), city: get(row, ["cidade", "city"]), uf: get(row, ["uf"]), active: true });
        imported += 1;
      }
    });
    audit("Cadastros importados CSV", `${imported} registros`);
    save();
    renderShell();
  };
  reader.readAsText(file);
}

function generateOperationalAlerts() {
  state.alertOutbox = state.alertOutbox || [];
  const existing = new Set(state.alertOutbox.filter((row) => row.status === "Pendente").map((row) => `${row.type}|${row.message}`));
  const add = (type, message) => {
    if (existing.has(`${type}|${message}`)) return;
    state.alertOutbox.push({ id: nextId(state.alertOutbox), date: new Date().toISOString(), type, message, status: "Pendente" });
  };
  state.products.filter((row) => Number(row.stock || 0) <= Number(row.minStock || 0)).forEach((row) => add("Estoque minimo", `${row.description}: saldo ${row.stock}, minimo ${row.minStock}`));
  [...state.receivables, ...state.payables].filter((row) => !row.paid && !row.cancelled && row.due < today()).forEach((row) => add("Titulo atrasado", `${row.history || row.customer || row.supplier}: vencimento ${row.due}`));
  state.stockLots.filter((row) => Number(row.qty || 0) > 0 && row.expiry && daysUntil(row.expiry) <= 30).forEach((row) => add("Validade", `${row.product} lote ${row.lot}: validade ${row.expiry}`));
  audit("Alertas operacionais atualizados", `${state.alertOutbox.length} registros`);
  save();
  renderShell();
}

async function dispatchOperationalAlerts() {
  if (!apiOnline || !sessionId) return alert("Conecte o sistema ao servidor para enviar alertas.");
  const pending = state.alertOutbox.filter((row) => row.status === "Pendente");
  if (!pending.length) return alert("Nao ha alertas pendentes.");
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/alerts/dispatch`, { method: "POST", body: JSON.stringify({ alerts: pending }) });
    const sent = new Set(result.sentIds || []);
    pending.forEach((row) => { if (sent.has(row.id)) row.status = "Enviado"; });
    audit("Alertas enviados", `${sent.size} alertas`);
    save();
    renderShell();
  } catch (error) {
    alert(`Alertas nao enviados: ${error.message}`);
  }
}

async function closeOperationalPeriod() {
  const date = byId("close-period-date").value;
  if (!date || !confirm(`Fechar alteracoes operacionais ate ${date}?`)) return;
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/close-period`, { method: "POST", body: JSON.stringify({ date }) });
    state.settings.closedThrough = result.closedThrough;
    audit("Periodo operacional fechado", `Movimentos ate ${date}`);
    save();
    renderShell();
  } catch (error) {
    alert(`Nao foi possivel fechar o periodo: ${error.message}`);
  }
}

function restoreBackupJson(event) {
  if (!requirePermission("restore_backup")) return;
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const restored = JSON.parse(String(reader.result || "{}"));
      const restoredState = restored.state || restored;
      if (restoredState.settings?.tenantCode && normalizeTenantCode(restoredState.settings.tenantCode) !== normalizeTenantCode(state.settings.tenantCode)) {
        throw new Error("Este backup pertence a outro cliente.");
      }
      if (!confirm("Restaurar este backup substituirá os dados atuais deste cliente. Deseja continuar?")) return;
      if (apiOnline && sessionId) {
        await api(`/api/tenant/${state.settings.tenantCode}/restore`, { method: "POST", body: JSON.stringify(restored) });
      }
      state = withDefaults(restoredState);
      audit("Backup restaurado", file.name);
      save();
      renderShell();
    } catch (error) {
      alert(error.message || "Arquivo de backup invalido.");
    }
  };
  reader.readAsText(file);
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
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

async function addSaleItem() {
  if (isCashRegisterStale()) {
    alert("Feche o caixa do dia anterior antes de registrar novas vendas.");
    return;
  }
  const query = byId("sale-search").value.trim().toLowerCase();
  const product = state.products.find((item) =>
    String(item.id) === query || item.barcode === query || item.description.toLowerCase().includes(query)
  );
  if (!product) {
    alert("Produto nao encontrado.");
    return;
  }
  const qty = Number(byId("sale-qty").value || 1);
  if (qty <= 0) {
    alert("Informe uma quantidade maior que zero.");
    return;
  }
  const typedPrice = Number(byId("sale-price").value || 0);
  const normalPrice = effectiveProductPrice(product, qty);
  if (typedPrice > 0 && Math.abs(typedPrice - normalPrice) > 0.009) {
    const authorization = await authorizePdvOperation("price_override", "Autorizar alteracao de preco");
    if (!authorization) return;
    audit("Preco alterado no PDV", `${product.description}: ${money(normalPrice)} para ${money(typedPrice)} por ${authorization.authorizedBy}`);
  }
  const effectivePrice = typedPrice > 0 ? typedPrice : effectiveProductPrice(product, qty);
  const existing = saleItems.find((item) => item.id === product.id && item.price === effectivePrice);
  if (existing) existing.qty += qty;
  else saleItems.push({ id: product.id, description: product.description, qty, unit: product.unit, price: effectivePrice });
  const shortage = stockShortages(saleStockRequirements(saleItems));
  if (shortage.length) {
    if (existing) existing.qty -= qty;
    else saleItems.pop();
    alert(`Estoque insuficiente:\n${shortage.join("\n")}`);
    return;
  }
  byId("sale-search").value = "";
  renderShell();
}

async function finishSaleRecord() {
  if (!state.cashRegister?.open) {
    alert("Abra o caixa antes de vender.");
    return;
  }
  if (!saleItems.length) {
    alert("Inclua ao menos um item.");
    return;
  }
  if (isCashRegisterStale()) {
    alert("Feche o caixa do dia anterior antes de registrar novas vendas.");
    return;
  }
  const shortage = stockShortages(saleStockRequirements(saleItems));
  if (shortage.length) {
    alert(`Venda nao finalizada. Estoque insuficiente:\n${shortage.join("\n")}`);
    return;
  }
  const subtotal = saleItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = Number(byId("pdv-discount")?.value || 0);
  if (discount > authorizedDiscountValue) {
    const authorization = await authorizePdvOperation("discount", "Autorizar desconto");
    if (!authorization) return;
    authorizedDiscountValue = discount;
    audit("Desconto PDV autorizado", `${money(discount)} por ${authorization.authorizedBy}`);
  }
  const addition = Number(byId("pdv-addition")?.value || 0);
  const exchangeCredit = Math.min(pendingExchangeCredit, Math.max(0, subtotal - discount + addition));
  const total = Math.max(0, subtotal - discount + addition - exchangeCredit);
  const paymentInfo = pdvPaymentBreakdown(total);
  if (paymentInfo.paid < total) {
    alert("O valor pago nao cobre o total da venda.");
    return;
  }
  const sale = {
    id: nextId(state.sales),
    date: today(),
    customer: byId("sale-customer")?.value || "Consumidor Final",
    seller: state.settings.user,
    type: "PDV",
    status: "Fechado",
    payment: paymentInfo.label,
    payments: paymentInfo.payments,
    change: paymentInfo.change,
    cashRegisterOpenedAt: state.cashRegister.openedAt,
    discount,
    addition,
    exchangeCredit,
    total,
    commission: saleCommission(saleItems),
    items: structuredClone(saleItems)
  };
  state.sales.push(sale);
  pendingExchangeCredit = Math.max(0, pendingExchangeCredit - exchangeCredit);
  lastPdvSaleId = sale.id;
  audit("Venda PDV finalizada", `${paymentInfo.label} ${money(total)}`);
  if (paymentInfo.storeCredit > 0) {
    state.receivables.push({
      id: nextId(state.receivables),
      customer: sale.customer,
      due: today(),
      value: paymentInfo.storeCredit,
      paid: false,
      history: `Venda PDV ${sale.id} - Crediario`
    });
  }
  paymentInfo.cashEntries.forEach((entry) => {
    state.cash.push({
      id: nextId(state.cash),
      date: today(),
      account: "CAIXA",
      history: `Venda PDV ${sale.id} - ${entry.method}`,
      in: entry.in,
      out: entry.out,
      cashRegisterOpenedAt: state.cashRegister.openedAt
    });
  });
  applySaleStock(sale.items, `Venda PDV ${sale.id}`);
  const fiscalRow = {
    id: nextId(state.fiscalQueue),
    model: "NFC-e",
    serie: "1",
    nature: "Venda de mercadoria",
    status: navigator.onLine ? "Aguardando transmissao" : "Fila offline",
    customer: sale.customer,
    saleId: sale.id,
    issuedAt: new Date().toISOString(),
    items: structuredClone(sale.items),
    payments: structuredClone(sale.payments),
    payment: sale.payment,
    discount,
    addition,
    exchangeCredit,
    change: sale.change,
    total,
    key: "",
    protocol: "",
    xml: ""
  };
  fiscalRow.xml = fiscalXml(fiscalRow);
  state.fiscalQueue.push(fiscalRow);
  saleItems = [];
  authorizedDiscountValue = 0;
  save();
  await createConfiguredSaleCharges(sale);
  renderShell();
  if (navigator.onLine && apiOnline && sessionId) setTimeout(() => transmitFiscalRecord(fiscalRow.id), 200);
}

async function createConfiguredSaleCharges(sale) {
  if (!navigator.onLine || !apiOnline || !sessionId) return;
  sale.externalCharges = Array.isArray(sale.externalCharges) ? sale.externalCharges : [];
  for (const payment of sale.payments || []) {
    const method = String(payment.method || "").toLowerCase();
    if (!["pix", "boleto"].includes(method) || Number(payment.value || 0) <= 0) continue;
    try {
      const result = await api(`/api/tenant/${state.settings.tenantCode}/charges`, {
        method: "POST",
        body: JSON.stringify({
          method,
          amount: Number(payment.value),
          customer: { name: sale.customer },
          reference: `PDV-${sale.id}`,
          dueDate: today()
        })
      });
      sale.externalCharges.push({ method, createdAt: new Date().toISOString(), status: "criada", charge: result.charge });
      audit(`Cobranca ${method.toUpperCase()} criada`, `Venda PDV ${sale.id}`);
    } catch (error) {
      sale.externalCharges.push({ method, createdAt: new Date().toISOString(), status: "pendente", error: error.message });
      audit(`Cobranca ${method.toUpperCase()} pendente`, `Venda PDV ${sale.id}: ${error.message}`);
    }
  }
  save();
}

function printLastPdvSale() {
  const sale = state.sales.find((item) => item.id === lastPdvSaleId) || state.sales.slice().reverse().find((item) => item.type === "PDV");
  if (!sale) {
    alert("Ainda nao ha venda PDV para imprimir.");
    return;
  }
  const content = [
    state.settings.company,
    `Venda: ${sale.id} Data: ${sale.date}`,
    `Cliente: ${sale.customer}`,
    `Operador: ${sale.seller}`,
    "",
    ...sale.items.map((item) => `${item.qty} ${item.unit} ${item.description} ${money(item.qty * item.price)}`),
    "",
    `Desconto: ${money(sale.discount || 0)}`,
    `Acrescimo: ${money(sale.addition || 0)}`,
    `Total: ${money(sale.total)}`,
    `Pagamento: ${sale.payment}`,
    `Troco: ${money(sale.change || 0)}`
  ].join("\n");
  if (pdvPeripheralPort?.writable) {
    writePdvPeripheral(content).catch(() => downloadText(`cupom-pdv-${sale.id}.txt`, content));
  } else {
    downloadText(`cupom-pdv-${sale.id}.txt`, content);
  }
  audit("Cupom PDV impresso", `Venda ${sale.id}`);
  save();
}

function saleCommission(items) {
  return (items || []).reduce((sum, item) => {
    const product = state.products.find((row) => row.id === item.id);
    return sum + Number(item.qty || 0) * Number(item.price || 0) * Number(product?.commissionRate || 0) / 100;
  }, 0);
}

function returnSaleRecord(id, exchange = false) {
  const sale = state.sales.find((row) => row.id === id && ["Fechado", "Parcialmente devolvido"].includes(row.status));
  if (!sale) return false;
  const returnedBefore = sale.returns || [];
  const items = [];
  for (const item of sale.items || []) {
    const already = returnedBefore.reduce((sum, record) => sum + (record.items || []).filter((row) => row.id === item.id).reduce((value, row) => value + Number(row.qty || 0), 0), 0);
    const available = Math.max(0, Number(item.qty || 0) - already);
    if (!available) continue;
    const answer = prompt(`${item.description}\nQuantidade a ${exchange ? "trocar" : "devolver"} (disponivel ${available}):`, String(available).replace(".", ","));
    if (answer === null) return false;
    const qty = Number(answer.replace(",", ".") || 0);
    if (qty < 0 || qty > available) return alert(`Quantidade invalida para ${item.description}.`) || false;
    if (qty > 0) items.push({ ...structuredClone(item), qty });
  }
  if (!items.length) return false;
  const returnValue = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
  if (!confirm(`Confirmar ${exchange ? "troca" : "devolucao"} de ${money(returnValue)} da venda ${sale.id}?`)) return false;
  reverseSaleStock(items, sale.id);
  sale.returns = sale.returns || [];
  sale.returns.push({ id: nextId(sale.returns), date: new Date().toISOString(), type: exchange ? "Troca" : "Devolucao", value: returnValue, items: structuredClone(items) });
  const totalReturned = sale.returns.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const fullyReturned = totalReturned + 0.009 >= Number(sale.total || 0);
  sale.status = fullyReturned ? (exchange ? "Trocado" : "Devolvido") : "Parcialmente devolvido";
  sale.returnedAt = new Date().toISOString();
  sale.commission = Math.max(0, Number(sale.commission || 0) * (1 - returnValue / Math.max(0.01, Number(sale.total || 0))));
  state.receivables.filter((row) => String(row.history || "").includes(`Venda ${sale.id}`)).forEach((row) => {
    if (!row.paid && fullyReturned) {
      row.cancelled = true;
      row.paid = true;
    } else if (!row.paid) {
      row.value = Math.max(Number(row.paidValue || 0), Number(row.value || 0) - returnValue);
    }
  });
  if (!exchange) state.cash.push({ id: nextId(state.cash), date: today(), account: "CAIXA", history: `Devolucao venda ${sale.id}`, in: 0, out: returnValue, cashRegisterOpenedAt: state.cashRegister?.openedAt || "" });
  const originalFiscal = [...(state.fiscalQueue || [])].reverse().find((row) => Number(row.saleId) === Number(sale.id) && row.status === "Autorizada");
  const fiscalReturn = {
    id: nextId(state.fiscalQueue || []),
    saleId: sale.id,
    originalSaleId: sale.id,
    model: "NF-e",
    operationType: exchange ? "exchange-return" : "return",
    referencedKey: originalFiscal?.key || "",
    nature: "Devolucao de venda",
    status: originalFiscal?.key ? "Pendente de transmissao" : "Aguardando chave fiscal da venda original",
    customer: sale.customer,
    customerDocument: sale.customerDocument || "",
    issuedAt: new Date().toISOString(),
    items: structuredClone(items),
    payments: [{ method: "Sem pagamento", value: returnValue }],
    total: returnValue,
    key: "",
    protocol: ""
  };
  state.fiscalQueue.push(fiscalReturn);
  if (exchange) pendingExchangeCredit += returnValue;
  audit(exchange ? "Troca registrada" : "Venda devolvida", `Venda ${sale.id} ${money(returnValue)}; retorno fiscal ${fiscalReturn.id}`);
  save();
  renderShell();
  if (fiscalReturn.referencedKey && navigator.onLine && apiOnline && sessionId) setTimeout(() => transmitFiscalRecord(fiscalReturn.id), 200);
  return true;
}

function exchangeSaleRecord(id) {
  const sale = state.sales.find((row) => row.id === id && ["Fechado", "Parcialmente devolvido"].includes(row.status));
  if (!sale) return;
  if (!returnSaleRecord(id, true)) return;
  saleItems = [];
  currentMode = "pdv";
  renderShell();
}

async function connectPdvPeripheral() {
  if (!("serial" in navigator)) return alert("Este navegador nao oferece conexao serial. Use Chrome ou Edge no terminal do caixa.");
  try {
    pdvPeripheralPort = await navigator.serial.requestPort();
    await pdvPeripheralPort.open({ baudRate: Number(state.settings.pdvBaudRate || 9600) });
    startPdvSerialReader();
    alert("Dispositivo serial conectado ao PDV.");
  } catch (error) {
    alert(`Dispositivo nao conectado: ${error.message}`);
  }
}

async function writePdvPeripheral(text) {
  const writer = pdvPeripheralPort.writable.getWriter();
  try {
    const encoder = new TextEncoder();
    await writer.write(Uint8Array.from([0x1b, 0x40]));
    await writer.write(encoder.encode(`${text}\n\n\n`));
    await writer.write(Uint8Array.from([0x1d, 0x56, 0x41, 0x10]));
  } finally {
    writer.releaseLock();
  }
}

async function startPdvSerialReader() {
  if (!pdvPeripheralPort?.readable || pdvPeripheralReader) return;
  pdvPeripheralReader = pdvPeripheralPort.readable.getReader();
  const decoder = new TextDecoder();
  try {
    while (pdvPeripheralPort?.readable) {
      const { value, done } = await pdvPeripheralReader.read();
      if (done) break;
      const text = decoder.decode(value);
      const weight = Number(text.replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0] || 0);
      const quantity = byId("sale-qty");
      if (quantity && weight > 0) quantity.value = String(weight);
    }
  } catch {
    undefined;
  } finally {
    pdvPeripheralReader?.releaseLock();
    pdvPeripheralReader = null;
  }
}

function pdvPaymentBreakdown(total) {
  const raw = {
    Dinheiro: num("pay-money"),
    PIX: num("pay-pix"),
    "Cartao debito": num("pay-debit"),
    "Cartao credito": num("pay-credit"),
    Crediario: num("pay-store-credit")
  };
  if (Object.values(raw).every((value) => value <= 0)) raw.Dinheiro = total;
  const paid = Object.values(raw).reduce((sum, value) => sum + value, 0);
  const change = Math.max(0, paid - total);
  const storeCredit = Math.max(0, Math.min(raw.Crediario, total - raw.Dinheiro - raw.PIX - raw["Cartao debito"] - raw["Cartao credito"]));
  const cashEntries = [];
  Object.entries(raw).forEach(([method, value]) => {
    if (value <= 0 || method === "Crediario") return;
    const out = method === "Dinheiro" ? change : 0;
    cashEntries.push({ method, in: Math.max(0, value - out), out });
  });
  return {
    paid,
    change,
    storeCredit,
    payments: Object.entries(raw).filter(([, value]) => value > 0).map(([method, value]) => ({ method, value })),
    cashEntries,
    label: Object.entries(raw).filter(([, value]) => value > 0).map(([method]) => method).join(" + ") || "Dinheiro"
  };
}

function applySaleStock(items, reference = "Venda") {
  items.forEach((item) => {
    const product = state.products.find((productItem) => productItem.id === item.id);
    if (!product) return;
    const saleComponents = (product.composition || []).filter((component) => component.mode !== "production");
    if (!saleComponents.length) {
      item.traceability = consumeProductTraceability(product, item.qty, reference);
      product.stock -= item.qty;
      addStockMovement(product, "Venda", -item.qty, `Venda ${item.description}`);
    }
    item.componentTraceability = [];
    saleComponents.forEach((component) => {
      if (component.mode === "production") return;
      const raw = state.products.find((rawItem) => rawItem.id === component.productId);
      if (raw) {
        const usedQty = component.qty * item.qty;
        item.componentTraceability.push({ productId: raw.id, qty: usedQty, traceability: consumeProductTraceability(raw, usedQty, reference) });
        raw.stock -= usedQty;
        addStockMovement(raw, "Baixa composicao", -usedQty, `Componente de ${product.description}`);
      }
    });
  });
}

function compositionRequirements(product, qty, modes) {
  return (product.composition || [])
    .filter((component) => modes.includes(component.mode || "both"))
    .map((component) => ({ productId: component.productId, qty: Number(component.qty || 0) * Number(qty || 0) }));
}

function saleStockRequirements(items) {
  const requirements = [];
  items.forEach((item) => {
    const product = state.products.find((row) => row.id === item.id);
    if (!product) return;
    const components = compositionRequirements(product, item.qty, ["sale", "both"]);
    if (components.length) requirements.push(...components);
    else requirements.push({ productId: product.id, qty: Number(item.qty || 0) });
  });
  return aggregateRequirements(requirements);
}

function aggregateRequirements(requirements) {
  const totals = new Map();
  requirements.forEach((row) => totals.set(row.productId, Number(totals.get(row.productId) || 0) + Number(row.qty || 0)));
  return Array.from(totals, ([productId, qty]) => ({ productId, qty }));
}

function stockShortages(requirements) {
  return aggregateRequirements(requirements).flatMap((requirement) => {
    const product = state.products.find((row) => row.id === requirement.productId);
    if (!product) return [];
    const problems = [];
    if (Number(product.stock || 0) + 0.000001 < requirement.qty) problems.push(`${product.description}: necessario ${requirement.qty} ${product.unit}, disponivel ${product.stock} ${product.unit}`);
    const lotBalance = (state.stockLots || []).filter((row) => row.productId === product.id).reduce((sum, row) => sum + Number(row.qty || 0), 0);
    if (product.controlsLot && lotBalance + 0.000001 < requirement.qty) problems.push(`${product.description}: lotes disponiveis ${lotBalance} ${product.unit}, necessario ${requirement.qty}`);
    const serialBalance = (state.stockSerials || []).filter((row) => row.productId === product.id && row.status === "Disponivel").length;
    if (product.controlsSerial && (!Number.isInteger(requirement.qty) || serialBalance < requirement.qty)) problems.push(`${product.description}: series disponiveis ${serialBalance}, necessario ${requirement.qty}`);
    return problems;
  });
}

function consumeProductTraceability(product, qty, reference) {
  const traceability = { lots: [], serials: [] };
  if (!product) return traceability;
  if (product.controlsLot) traceability.lots = allocateStockLots(product.id, qty, reference);
  if (product.controlsSerial) {
    traceability.serials = (state.stockSerials || [])
      .filter((row) => row.productId === product.id && row.status === "Disponivel")
      .slice(0, qty)
      .map((row) => {
        Object.assign(row, { status: "Baixado", reference, updatedAt: new Date().toISOString() });
        return row.serial;
      });
  }
  return traceability;
}

function restoreProductTraceability(product, traceability, qty) {
  let remaining = Number(qty || 0);
  (traceability?.lots || []).forEach((allocation) => {
    if (remaining <= 0) return;
    const restored = Math.min(remaining, Number(allocation.qty || 0));
    upsertStockLot(product, allocation.lot, allocation.expiry, restored);
    remaining -= restored;
  });
  (traceability?.serials || []).slice(0, Math.max(0, Math.floor(Number(qty || 0)))).forEach((serial) => {
    const row = (state.stockSerials || []).find((item) => item.productId === product.id && item.serial === serial);
    if (row) Object.assign(row, { status: "Disponivel", reference: "Estorno de venda", updatedAt: new Date().toISOString() });
  });
}

function cancelClosedSale(id) {
  if (!requirePermission("sales_cancel")) return;
  const sale = state.sales.find((row) => row.id === id);
  if (!sale || sale.status !== "Fechado") return;
  if (!confirm(`Cancelar a venda ${sale.id} e estornar estoque e financeiro?`)) return;
  reverseSaleStock(sale.items || [], sale.id);
  state.receivables.filter((row) => String(row.history || "").includes(`Venda ${sale.id}`) || String(row.history || "").includes(`Venda PDV ${sale.id}`)).forEach((row) => {
    if (!row.paid) {
      row.cancelled = true;
      row.paid = true;
      row.balance = 0;
    }
  });
  const cashRefund = sale.type === "PDV"
    ? Math.max(0, (sale.payments || []).filter((row) => row.method !== "Crediario").reduce((sum, row) => sum + Number(row.value || 0), 0) - Number(sale.change || 0))
    : 0;
  if (cashRefund > 0) {
    state.cash.push({
      id: nextId(state.cash),
      date: today(),
      account: "CAIXA",
      history: `Estorno venda ${sale.id}`,
      in: 0,
      out: cashRefund,
      cashRegisterOpenedAt: state.cashRegister?.open ? state.cashRegister.openedAt : ""
    });
  }
  state.fiscalQueue.filter((row) => row.saleId === sale.id && row.status !== "Cancelada").forEach((row) => {
    row.status = "Cancelada";
    row.cancelledAt = new Date().toISOString();
  });
  sale.status = "Cancelado";
  sale.cancelledAt = new Date().toISOString();
  audit("Venda cancelada", `Venda ${sale.id} ${money(sale.total)}`);
  save();
  renderShell();
}

function reverseSaleStock(items, saleId) {
  items.forEach((item) => {
    const product = state.products.find((row) => row.id === item.id);
    if (!product) return;
    const saleComponents = (product.composition || []).filter((component) => component.mode !== "production");
    if (!saleComponents.length) {
      product.stock += Number(item.qty || 0);
      restoreProductTraceability(product, item.traceability, item.qty);
      addStockMovement(product, "Estorno venda", Number(item.qty || 0), `Cancelamento venda ${saleId}`);
    }
    saleComponents.forEach((component) => {
      const raw = state.products.find((row) => row.id === component.productId);
      if (!raw) return;
      const qty = Number(component.qty || 0) * Number(item.qty || 0);
      raw.stock += qty;
      const componentTrace = (item.componentTraceability || []).find((row) => row.productId === raw.id);
      restoreProductTraceability(raw, componentTrace?.traceability, qty);
      addStockMovement(raw, "Estorno composicao", qty, `Cancelamento venda ${saleId}`);
    });
  });
}

window.addEventListener("online", () => {
  renderShell();
  if (localStorage.getItem("tortelaplus-pending-sync") === "1") save();
  processPendingFiscalQueue();
});
window.addEventListener("offline", renderShell);
window.addEventListener("beforeunload", endSession);
setInterval(processPendingFiscalQueue, 60000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => undefined);
}

boot();

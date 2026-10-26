const seed = {
  people: [],
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
  cashClosures: [],
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
      ibsCbsCst: "000",
      ibsRate: 0,
      cbsRate: 0,
      ibsUfRate: 0,
      ibsCityRate: 0,
      cbsFederalRate: 0,
      presumedCreditRate: 0,
      transitionYear: "2026",
      reformReductionRate: 0,
      reformDeferralRate: 0,
      selectiveTaxRate: 0,
      selectiveTaxCst: "",
      selectiveTaxClass: "",
      monophase: false,
      adRemRate: 0,
      adRemUnit: "",
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
      ibsCbsCst: "000",
      ibsRate: 0,
      cbsRate: 0,
      ibsUfRate: 0,
      ibsCityRate: 0,
      cbsFederalRate: 0,
      presumedCreditRate: 0,
      transitionYear: "2026",
      reformReductionRate: 0,
      reformDeferralRate: 0,
      selectiveTaxRate: 0,
      selectiveTaxCst: "",
      selectiveTaxClass: "",
      monophase: false,
      adRemRate: 0,
      adRemUnit: "",
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
      ibsCbsCst: "000",
      ibsRate: 0,
      cbsRate: 0,
      ibsUfRate: 0,
      ibsCityRate: 0,
      cbsFederalRate: 0,
      presumedCreditRate: 0,
      transitionYear: "2026",
      reformReductionRate: 0,
      reformDeferralRate: 0,
      selectiveTaxRate: 0,
      selectiveTaxCst: "",
      selectiveTaxClass: "",
      monophase: false,
      adRemRate: 0,
      adRemUnit: "",
      serviceCode: "14.01",
      cityServiceCode: "",
      taxBenefitCode: "",
      reductionReason: "",
      validFrom: "2026-01-01",
      validTo: "",
      active: true
    }
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
  provider: {
    ownerName: "Central Tortela",
    deployment: "Rede de franquias",
    isolationMode: "Banco separado por cliente",
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
        adminUser: "admin@cliente.com"
      }
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
    paymentApiUrl: "",
    paymentProvider: "",
    paymentAuthHeader: "Authorization",
    paymentAuthScheme: "Bearer",
    paymentCallbackUrl: "",
    paymentApiTokenConfigured: false,
    publicTerminalToken: "",
    deliveryRadiusKm: 10
  }
};

window.TORTELA_BUILD = "settings-tabs-cleanup-v11";

let state = load();
let apiOnline = false;
const licenseGateDisabled = false;
const publicTerminalGateDisabled = false;
let currentMode = "backoffice";
let currentModule = "dashboard";
let currentTab = "dados";
let currentPeopleTab = "Todos";
let currentFiscalTab = "fila";
let currentStockTab = "producao";
let currentSettingsTab = "geral";
let reportPeriod = { from: `${today().slice(0, 7)}-01`, to: today() };
let saleItems = [];
let saleClubCpf = "";
let pdvSelectedCustomer = null;
let pdvCustomerRequest = null;
let orderItems = [];
let lastPdvSaleId = 0;
let purchaseItems = [];
let pendingProductPhoto = "";
let pendingComposition = [];
let pendingProductDraft = {};
let pendingPersonDraft = {};
let editingPersonId = 0;
let editingProductId = 0;
let editingFiscalRuleId = 0;
let editingAccountId = 0;
let selectedPersonId = 0;
let selectedProductId = 0;
let personSearch = "";
let productSearch = "";
let productStatusFilter = "all";
let sessionId = sessionStorage.getItem("tortelaplus-session-id") || "";
let heartbeatTimer = 0;
let onlineNoticeTimer=0,onlineNoticeDismissed="",onlineNoticeInFlight=false;
let authUser = JSON.parse(sessionStorage.getItem("tortelaplus-auth-user") || "null");
let pdvPeripheralPort = null;
let pdvPeripheralReader = null;
let loginInProgress = false;
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
const personTypes = ["Cliente", "Fornecedor", "Funcionario", "Parceiro", "Entregador", "Transportadora", "Motorista", "Contador", "SPC/CCF", "Tomador", "Destinatario", "Remetente"];
const personFilters = [...personTypes, "Aniversariantes", "Todos"];
const screenPermissions = [
  ["dashboard", "Painel"],
  ["people", "Pessoas"],
  ["products", "Produtos"],
  ["stock", "Estoque e producao"],
  ["purchases", "Compras"],
  ["sales", "Vendas e orcamentos"],
  ["onlineOrders", "Pedidos online"],
  ["finance", "Financeiro"],
  ["fiscal", "Fiscal"],
  ["reports", "Relatorios"],
  ["settings", "Configuracoes"],
  ["pdv", "PDV"]
];
const crudActions = [["view", "Ver"], ["create", "Incluir"], ["edit", "Editar"], ["delete", "Excluir"]];

function permissionLabel(permission) {
  return permissionLabels[permission] || permission;
}

function personFilterLabel(type) {
  const labels = {
    Cliente: "Clientes",
    Fornecedor: "Fornecedores",
    Funcionario: "Funcionarios",
    Parceiro: "Parceiros",
    "SPC/CCF": "SPC/CCF"
  };
  return labels[type] || type;
}

function screenPermissionValue(user, screen, action) {
  const matrix = user?.screenPermissions;
  if (!matrix || !matrix[screen]) return true;
  return matrix[screen][action] !== false;
}

function renderScreenPermissionMatrix(user = {}) {
  return `
    <div class="table-wrap permission-matrix">
      <table>
        <thead><tr><th>Tela</th>${crudActions.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead>
        <tbody>${screenPermissions.map(([screen, label]) => `<tr><td>${label}</td>${crudActions.map(([action, actionLabel]) => `<td><label class="check-row"><input class="screen-permission" type="checkbox" data-screen="${screen}" data-action="${action}" ${screenPermissionValue(user, screen, action) ? "checked" : ""} /> ${actionLabel}</label></td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  `;
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
      useUnit: component.useUnit || "",
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
  merged.pdvTables = data.pdvTables || [];
  merged.automaticOrders = data.automaticOrders || [];
  merged.approvalRequests = data.approvalRequests || [];
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
    syncChain = syncChain.catch(() => false).then(async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
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
        return true;
      } catch (error) {
        if (error.payload?.code === "DATA_RESET") {
          state=withDefaults({...error.payload.state,provider:state.provider});saleItems=[];lastPdvSaleId=0;
          localStorage.setItem("tortelaplus-state-v1",JSON.stringify(state));localStorage.removeItem("tortelaplus-pending-sync");
          alert("Dados de teste foram limpos pela administracao. A tela foi atualizada.");renderShell();return false;
        }
        if (error.status === 409 && error.payload?.state) {
          const remote = error.payload.state;
          state = withDefaults({ ...mergeConcurrentState(remote, localPending), provider: state.provider });
          localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
          localStorage.setItem("tortelaplus-pending-sync", "1");
          // Aguarde a nova gravacao na mesma fila, sem refazer o formulario em uso.
          if (attempt < 2) continue;
          alert("Nao foi possivel sincronizar apos tres tentativas. Os dados ficaram salvos neste computador. Aguarde e tente sincronizar novamente; nao repita a venda.");
          return false;
        }
        if(error.status){await loadTenantState(tenantCode).catch(()=>{});alert(`Operacao nao gravada. ${error.message}`);renderShell();}
        else apiOnline=false;
        return false;
      }
      }
    });
    return syncChain;
  }
  return Promise.resolve(true);
}

function mergeConcurrentState(remote, local) {
  const merged = { ...remote, settings: { ...(remote.settings || {}), ...(local.settings || {}) } };
  const collections = ["people", "products", "stockMovements", "productionOrders", "purchases", "sales", "payables", "receivables", "cash", "cashClosures", "heldSales", "pdvTables", "automaticOrders", "networkPromotions", "franchisePayments", "fiscalQueue", "fiscalRules", "users", "auditLogs", "financeReconciliations", "chartOfAccounts"];
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
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs || 12000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "Content-Type": "application/json",
    ...(state._meta?.dataEpoch ? {"X-Tortela-Data-Epoch":state._meta.dataEpoch} : {}),
    ...(options.headers || {})
  };
  if (sessionId && !headers.Authorization) headers.Authorization = `Bearer ${sessionId}`;
  try {
    const { timeoutMs: _timeoutMs, ...fetchOptions } = options;
    const response = await fetch(path, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal || controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `API ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Tempo esgotado ao conectar com o servidor. Tente novamente.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function boot() {
  try {
    const health = await api("/api/health");
    if (health.ok !== true || health.product !== "Tortela Plus") throw new Error("Servidor da unidade indisponivel.");
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
      company: remote.state?.settings?.company || state.settings.company,
      tenantCode
    }
  });
      localStorage.setItem("tortelaplus-state-v1", JSON.stringify(state));
}

function pdvTerminalId() {
  const key = "tortelaplus-pdv-terminal-id";
  let id = localStorage.getItem(key);
  if (!id) { id = `pdv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; localStorage.setItem(key, id); }
  return id;
}

function currentPdvTerminal() {
  return (state.settings.pdvTerminals || []).find(row => row.id === pdvTerminalId()) || {
    id: pdvTerminalId(), name: state.cashRegister?.terminal || "PDV", emissionMode: state.settings.pdvPrintMode === "Recibo simples" ? "receipt" : "nfce"
  };
}

async function refreshPdvEmission() {
  if (apiOnline && sessionId && navigator.onLine) {
    let result = await api(`/api/tenant/${state.settings.tenantCode}/pdv-terminals`);
    if (!result.terminals.some(row => row.id === pdvTerminalId())) result = await api(`/api/tenant/${state.settings.tenantCode}/pdv-terminals/register`, {
      method: "POST", body: JSON.stringify({ terminalId: pdvTerminalId(), name: state.cashRegister?.terminal || state.settings.defaultTerminal || "PDV" })
    });
    state.settings.pdvTerminals = result.terminals;
  }
  return currentPdvTerminal();
}

async function startSession(tenantCode, user, password) {
  if (!apiOnline) return;
  const result = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      tenantCode,
      user,
      password,
      terminalId: pdvTerminalId(),
      terminalName: state.cashRegister?.terminal || state.settings.defaultTerminal || "PDV"
    })
  });
  sessionId = result.sessionId;
  authUser = result.user;
  sessionStorage.setItem("tortelaplus-session-id", sessionId);
  sessionStorage.setItem("tortelaplus-auth-user", JSON.stringify(authUser));
  state.provider = result.provider;
}

function endSession() {
  clearInterval(onlineNoticeTimer);onlineNoticeTimer=0;document.getElementById("online-order-notice")?.remove();
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

async function checkOnlineOrderNotifications(){
  if(onlineNoticeInFlight||!sessionId||!apiOnline||!canAccess('online')||document.hidden)return;
  onlineNoticeInFlight=true;try{
    const tenantCode=state.settings.tenantCode,activeSession=sessionId;
    const result=await api(`/api/tenant/${encodeURIComponent(tenantCode)}/online-order-notifications`);
    if(sessionId!==activeSession||state.settings.tenantCode!==tenantCode)return;
    const orders=result.orders||[],signature=orders.map(row=>row.id).join(',');
    let box=document.getElementById('online-order-notice');
    if(!orders.length||signature===onlineNoticeDismissed){box?.remove();return;}
    if(!box){box=document.createElement('aside');box.id='online-order-notice';box.className='online-order-notice';box.setAttribute('role','status');document.body.append(box);}
    box.innerHTML=`<strong>${orders.length} pedido(s) da loja online aguardando atendimento</strong><span>Unidade: ${escapeHtml(state.settings.company||state.settings.tenantCode)} · Mais recente: #${Math.max(...orders.map(row=>Number(row.id)||0))}</span><div><button class="btn primary" data-open-online>Ver pedidos</button><button class="btn" data-dismiss-online>Dispensar aviso</button></div>`;
    box.querySelector('[data-dismiss-online]').onclick=()=>{onlineNoticeDismissed=signature;box.remove();};
    box.querySelector('[data-open-online]').onclick=async()=>{try{await loadTenantState(state.settings.tenantCode);onlineNoticeDismissed=signature;box.remove();navigateBackofficeModule('online');}catch(error){alert(error.message);}};
  }catch{}finally{onlineNoticeInFlight=false;}
}
function startHeartbeat() {
  clearInterval(onlineNoticeTimer);onlineNoticeDismissed='';
  if(apiOnline&&sessionId){checkOnlineOrderNotifications();onlineNoticeTimer=setInterval(checkOnlineOrderNotifications,15000);}

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

function publicUnitLink(page, absolute = false) {
  const params = new URLSearchParams({ unidade: state.settings.tenantCode });
  if (!publicTerminalGateDisabled && state.settings.publicTerminalToken) params.set("terminalToken", state.settings.publicTerminalToken);
  const path = `${page}?${params.toString()}`;
  return absolute ? `${location.origin}/${path}` : `./${path}`;
}

function onlineUnitLinks() {
  const terminalSecure = !publicTerminalGateDisabled;
  return [
    { key: "store", label: "Loja online", description: "Link publico de venda por entrega ou retirada.", url: `${location.origin}/loja.html?unidade=${encodeURIComponent(state.settings.tenantCode)}`, secure: false },
    { key: "kiosk", label: "Totem de vendas", description: "Tela vertical usada no autoatendimento da unidade.", url: publicUnitLink("totem.html", true), secure: terminalSecure },
    { key: "kitchen", label: "Cozinha do totem", description: "Fila operacional para preparar e marcar pedido pronto.", url: publicUnitLink("cozinha", true), secure: terminalSecure },
    { key: "display", label: "Telao de pedidos", description: "Painel para chamar a senha do cliente.", url: publicUnitLink("telao.html", true), secure: terminalSecure }
  ];
}

function licenseStatus(tenant = getCurrentTenant()) {
  if (licenseGateDisabled) {
    return {
      remaining: 999,
      expired: false,
      warning: false,
      disabled: true
    };
  }
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
  if (module === "online") return permissions.includes("sales");
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
    ["online", "Pedidos online", "ON"],
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
            <input id="login-tenant" value="${escapeAttr(state.settings.tenantCode === "cliente-exemplo" ? "tortela-plus" : state.settings.tenantCode)}" />
          </div>
          <div class="field">
            <label for="login-pass">Senha</label>
            <input id="login-pass" type="password" autocomplete="current-password" />
          </div>
          <button class="btn primary" id="login-submit" type="submit">Entrar</button>
          <p class="helper" id="login-feedback" aria-live="polite"></p>
          <p class="helper">Ambiente seguro da unidade Tortela.</p>
        </form>
      </section>
    </main>
  `);

  const enterSystem = async (event) => {
    event.preventDefault();
    if (loginInProgress) return;
    loginInProgress = true;
    const submitButton = byId("login-submit");
    const feedback = byId("login-feedback");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Entrando...";
      submitButton.setAttribute("aria-busy", "true");
    }
    if (feedback) feedback.textContent = apiOnline ? "Conectando com a unidade..." : "Abrindo em modo local...";
    if (window.location.protocol !== "file:") {
      try {
        const health = await api("/api/health");
        if (health.ok !== true || health.product !== "Tortela Plus") throw new Error("Servidor da unidade indisponivel.");
        apiOnline = true;
      } catch {
        apiOnline = false;
        if (feedback) feedback.textContent = "Servidor indisponivel. Nao foi possivel autenticar. Tente novamente.";
        loginInProgress = false;
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Entrar"; submitButton.removeAttribute("aria-busy"); }
        return;
      }
    }
    state.settings.user = byId("login-user").value || "Operador";
    state.settings.company = byId("login-company").value || "Minha Empresa";
    state.settings.tenantCode = normalizeTenantCode(byId("login-tenant").value || state.settings.tenantCode);
    if (state.settings.tenantCode === "tortela-plus") state.settings.tenantCode = "cliente-exemplo";
    if (apiOnline) {
      try {
        await startSession(state.settings.tenantCode, state.settings.user, byId("login-pass").value);
        await loadTenantState(state.settings.tenantCode);
      } catch (error) {
        const message = error.message || "Nao foi possivel entrar. Confira unidade, usuario, senha, status na Central Tortela e limite de terminais.";
        if (feedback) feedback.textContent = message;
        alert(message);
        loginInProgress = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Entrar";
          submitButton.removeAttribute("aria-busy");
        }
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
  };

  byId("login-form").addEventListener("submit", enterSystem);
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
  applyInternalRoute();
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
          <span class="badge ${license.expired ? "danger" : license.warning ? "warn" : "ok"}">Licenca: ${license.disabled ? "desenvolvimento" : license.expired ? "vencida" : `${license.remaining} dias`}</span>
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
              ${modules.map(([key, label, short]) => `<a class="nav-btn ${currentModule === key ? "active" : ""}" data-module="${key}" href="#module=${key}" onclick="navigateBackofficeModule('${key}'); return false;">${icon(short)} ${label}</a>`).join("")}
            </aside>
            <section>${renderModule()}</section>
          </div>
        `}
      </section>
    </main>
  `);

  byId("logout").addEventListener("click", () => {
    endSession();
    renderLogin();
  });
  const headerBackup = byId("header-backup");
  if (headerBackup) headerBackup.addEventListener("click", downloadCompleteTenantBackup);
  const headerXmlBackup = byId("header-xml-backup");
  if (headerXmlBackup) headerXmlBackup.addEventListener("click", downloadTenantXmlBackup);
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
    online: renderOnlineOrders,
    finance: renderFinance,
    fiscal: renderFiscal,
    reports: renderReports,
    settings: renderSettings
  };
  return map[currentModule]();
}

function renderDashboard() {
  const lowStock = state.products.filter((product) => product.active !== false && product.movesStock !== false && product.type !== "Servico" && Number(product.minStock || 0) > 0 && Number(product.stock || 0) < Number(product.minStock));
  const payables = state.payables.filter((item) => !item.paid && !item.cancelled).reduce((sum, item) => sum + financeBalance(item), 0);
  const receivables = state.receivables.filter((item) => !item.paid && !item.cancelled).reduce((sum, item) => sum + financeBalance(item), 0);
  const sales = state.sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = state.sales.filter((sale) => sale.date === today() && !["Cancelado", "Cancelada", "Devolvido"].includes(sale.status)).reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const closedSales = state.sales.filter((sale) => !["Cancelado", "Cancelada", "Devolvido"].includes(sale.status));
  const averageTicket = closedSales.length ? sales / closedSales.length : 0;
  const overduePayables = state.payables.filter((item) => !item.paid && !item.cancelled && item.due < today());
  const overdueReceivables = state.receivables.filter((item) => !item.paid && !item.cancelled && item.due < today());
  const expiringLots = (state.stockLots || []).filter((lot) => Number(lot.qty || 0) > 0 && lot.expiry && daysUntil(lot.expiry) <= 30);
  const pendingFiscal = state.fiscalQueue.filter((row) => !["Autorizada", "Cancelada"].includes(row.status));
  const hasAlerts = overduePayables.length || overdueReceivables.length || expiringLots.length || pendingFiscal.length;
  const actionCards = [
    { title: "PDV", text: "Abrir caixa de venda", icon: "pdv", kind: "primary", id: "open-pdv" },
    { title: "Pessoas", text: "Clientes e fornecedores", icon: "people", module: "people" },
    { title: "Produtos", text: "Cadastro e etiquetas", icon: "products", module: "products" },
    { title: "Estoque", text: "Ajustes e producao", icon: "stock", module: "stock" },
    { title: "Compras", text: "Entrada de mercadoria", icon: "purchases", module: "purchases" },
    { title: "Vendas", text: "Orcamentos e pedidos", icon: "sales", module: "sales" },
    { title: "Financeiro", text: "Caixa, pagar e receber", icon: "finance", module: "finance" },
    { title: "Fiscal", text: "NFC-e, NF-e e NFSe", icon: "fiscal", module: "fiscal" },
    { title: "Relatorios", text: "Analises da operacao", icon: "reports", module: "reports" },
    { title: "Configuracoes", text: "Unidade e sistema", icon: "settings", module: "settings" }
  ];

  return `
    <section class="dashboard-screen dashboard-desktop">
      <div class="dashboard-titlebar">
        <strong>Tortela Plus</strong>
        <span>Retaguarda e PDV</span>
        <span>Internet ON</span>
      </div>

      <div class="dashboard-module-ribbon" aria-label="Atalhos principais">
        ${actionCards.map((card) => `
          <button class="dashboard-ribbon-button ${card.kind || ""}" ${card.id ? `id="${card.id}"` : ""} ${card.module ? `data-dashboard-module="${card.module}"` : ""} type="button">
            <span class="dashboard-module-icon icon-${card.icon}" aria-hidden="true"></span>
            <strong>${card.title}</strong>
            <small>${card.text}</small>
          </button>
        `).join("")}
      </div>

      <div class="dashboard-context-strip">
        <span>Inicio</span>
        <span>Painel</span>
        <span>Resumo operacional</span>
      </div>

      <div class="dashboard-work-area">
        <section class="panel dashboard-section dashboard-main-grid">
          <div class="panel-head">
            <div>
              <h3>Reposição automática — pedidos para a franqueadora</h3>
              <p>Informativo da sua unidade. O sistema gera e envia os pedidos automaticamente pelo estoque mínimo; você não precisa solicitar a compra.</p>
            </div>
            <span class="badge ok">Envio automático</span>
          </div>
          <div class="panel-body">
            ${renderAutomaticReplenishmentInfo(lowStock)}
          </div>
        </section>

        <div class="dashboard-hero">
          <div>
            <span class="dashboard-eyebrow">Painel da retaguarda</span>
            <h2>Resumo da operacao</h2>
            <p>Comece pelos botoes do topo e acompanhe abaixo o que precisa de atencao hoje.</p>
          </div>
          <div class="dashboard-status ${hasAlerts ? "warn" : "ok"}">
            <small>Status de hoje</small>
            <strong>${hasAlerts ? "Revisar alertas" : "Operacao em ordem"}</strong>
          </div>
        </div>

        <section class="panel dashboard-section">
          <div class="panel-head">
            <div>
              <h3>Indicadores principais</h3>
              <p>Numeros para acompanhar caixa, vendas e financeiro.</p>
            </div>
          </div>
          <div class="panel-body grid four dashboard-kpis">
            <div class="kpi"><small>Vendido hoje</small><strong>${money(todaySales)}</strong><span>Somente vendas nao canceladas</span></div>
            <div class="kpi"><small>Ticket medio</small><strong>${money(averageTicket)}</strong><span>Media das vendas fechadas</span></div>
            <div class="kpi"><small>A receber aberto</small><strong>${money(receivables)}</strong><span>Valores ainda pendentes</span></div>
            <div class="kpi"><small>A pagar aberto</small><strong>${money(payables)}</strong><span>Compromissos em aberto</span></div>
          </div>
        </section>

        <section class="panel dashboard-section">
          <div class="panel-head">
            <div>
              <h3>Alertas operacionais</h3>
              <p>Priorize estes pontos antes de iniciar ou fechar o dia.</p>
            </div>
            <span class="badge ${hasAlerts ? "warn" : "ok"}">${hasAlerts ? "Acao necessaria" : "Tudo certo"}</span>
          </div>
          <div class="panel-body dashboard-alert-list">
            <button class="dashboard-alert-card" data-dashboard-module="finance" type="button"><small>Contas a pagar atrasadas</small><strong>${overduePayables.length}</strong><span>${money(overduePayables.reduce((sum, row) => sum + financeBalance(row), 0))}</span></button>
            <button class="dashboard-alert-card" data-dashboard-module="finance" type="button"><small>Contas a receber atrasadas</small><strong>${overdueReceivables.length}</strong><span>${money(overdueReceivables.reduce((sum, row) => sum + financeBalance(row), 0))}</span></button>
            <button class="dashboard-alert-card" data-dashboard-module="stock" type="button"><small>Lotes vencidos/ate 30 dias</small><strong>${expiringLots.length}</strong><span>${expiringLots.slice(0, 2).map((row) => row.product).join(", ") || "Nenhum"}</span></button>
            <button class="dashboard-alert-card" data-dashboard-module="fiscal" type="button"><small>Documentos fiscais pendentes</small><strong>${pendingFiscal.length}</strong><span>${pendingFiscal.filter((row) => row.lastFiscalError).length} com falha</span></button>
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderAutomaticReplenishmentInfo(lowStock = []) {
  const orders = (state.automaticOrders || []).filter(order => ["Reposição automática por estoque mínimo", "Estoque minimo semanal"].includes(order.origin)).slice().sort((a,b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date))).slice(0,20);
  return `<p class="helper">Acompanhe abaixo os pedidos registrados e seus itens. A entrada no estoque ocorre somente após o recebimento da mercadoria.</p>
    ${orders.length ? `<div class="table-wrap"><table><thead><tr><th>Pedido</th><th>Data de envio</th><th>Situação</th><th>Produtos e quantidades solicitadas</th></tr></thead><tbody>${orders.map(order => `<tr><td>#${escapeAttr(order.id)}</td><td>${escapeAttr(order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR") : order.date || "—")}</td><td><span class="badge ${order.status === "Cancelado" ? "warn" : "ok"}">${escapeAttr(order.status || "Enviado")}</span></td><td>${(order.items || []).map(item=>`${escapeAttr(item.description || item.productId)} — <strong>${formatQty(item.suggestedQty || item.qty || 0)} ${escapeAttr(item.unit || "UN")}</strong>`).join("<br>") || "Sem itens pendentes"}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">Ainda não há pedido automático registrado nesta unidade.${lowStock.length ? " Existem produtos abaixo do mínimo; o pedido será registrado na próxima sincronização do estoque." : " O sistema acompanha os produtos ativos com estoque mínimo configurado."}</div>`}`;
}

function stockOrderWeekKey(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function renderPeople() {
  const draft = pendingPersonDraft;
  const personTypeFilter = personFilters.includes(currentPeopleTab) ? currentPeopleTab : "Todos";
  const activePeople = state.people.filter((person) => person.active !== false).length;
  const inactivePeople = state.people.length - activePeople;
  const selectedPerson = state.people.find((person) => Number(person.id) === Number(selectedPersonId));
  const peopleRibbon = [
    { title: "Cliente", text: "Venda e cadastro", icon: "people", type: "Cliente", kind: "primary" },
    { title: "Fornecedor", text: "Compras e contas", icon: "purchases", type: "Fornecedor" },
    { title: "Funcionario", text: "Equipe interna", icon: "settings", type: "Funcionario" },
    { title: "Entregador", text: "Delivery e rota", icon: "sales", type: "Entregador" },
    { title: "Motorista", text: "Transporte", icon: "stock", type: "Motorista" },
    { title: "Contador", text: "Fiscal e notas", icon: "fiscal", type: "Contador" }
  ];
  const peopleStats = {
    total: state.people.length,
    customers: state.people.filter((person) => person.type === "Cliente").length,
    suppliers: state.people.filter((person) => person.type === "Fornecedor").length,
    alerts: state.people.filter((person) => person.active === false || person.creditAlert).length,
    birthdays: state.people.filter((person) => String(person.birthDate || "").slice(5) >= today().slice(5)).length
  };
  return `
    <section class="panel erp-screen people-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Pessoas</strong>
        <span>Clientes, fornecedores, funcionarios e contatos</span>
        <span>${activePeople} ativos</span>
      </div>

      <div class="desktop-module-ribbon">
        ${peopleRibbon.map((item) => `
          <button class="desktop-ribbon-button ${item.kind || ""}" data-new-person-type="${item.type}" type="button">
            <span class="dashboard-module-icon icon-${item.icon}" aria-hidden="true"></span>
            <strong>${item.title}</strong>
            <small>${item.text}</small>
          </button>
        `).join("")}
        <button class="desktop-ribbon-button" id="copy-public-registration" type="button">
          <span class="dashboard-module-icon icon-reports" aria-hidden="true"></span>
          <strong>Link publico</strong>
          <small>Cadastro do cliente</small>
        </button>
      </div>

      <div class="desktop-context-strip finance-context-strip">
        ${personFilters.map((type) => `<button class="${personTypeFilter === type ? "active" : ""}" data-person-filter="${type}" type="button">${personFilterLabel(type)}</button>`).join("")}
      </div>

      <div class="desktop-work-area">
        <div class="desktop-summary-strip">
          <div><span>Total</span><strong>${peopleStats.total}</strong></div>
          <div><span>Clientes</span><strong>${peopleStats.customers}</strong></div>
          <div><span>Fornecedores</span><strong>${peopleStats.suppliers}</strong></div>
          <div><span>Inativos</span><strong>${inactivePeople}</strong></div>
          <div><span>Alertas</span><strong>${peopleStats.alerts}</strong></div>
        </div>

        <div class="desktop-filter-panel">
          <div class="filter-caption">F6 | Localizar pessoa</div>
          <div class="desktop-filter-line">
            <input id="person-search" value="${escapeAttr(personSearch)}" placeholder="Digite nome, fantasia, CPF/CNPJ, cidade, telefone, placa ou RNTRC" />
            <button class="btn" id="filter-people">Buscar</button>
          </div>
          <p>Filtro atual: <strong>${personFilterLabel(personTypeFilter)}</strong>. Clique em Todos para exibir todos os cadastros.</p>
        </div>

        <div class="panel-body erp-body people-body desktop-record-body">
          <div class="people-list-panel">
            <div class="people-section-title">
              <div>
                <h3>Lista de pessoas</h3>
                <p>${activePeople} ativo(s), ${inactivePeople} inativo(s), ${peopleStats.birthdays} aniversario(s) futuros.</p>
              </div>
              <span class="badge ${selectedPerson ? "ok" : "warn"}">${selectedPerson ? `Selecionado: ${selectedPerson.name}` : "Selecione para alterar"}</span>
            </div>
            ${peopleTable()}
          </div>

          <form class="form-card erp-edit-panel people-edit-panel" id="person-form">
            <div class="people-section-title">
              <div>
                <h3>${editingPersonId ? "Alterar cadastro" : "Novo cadastro"}</h3>
                <p>Dados essenciais primeiro. Endereco, fiscal e observacoes ficam em blocos separados.</p>
              </div>
              <span class="badge ${editingPersonId ? "warn" : "ok"}">${editingPersonId ? `Codigo ${editingPersonId}` : "Novo registro"}</span>
            </div>

            <div class="person-form-section required">
              <h4>Dados essenciais</h4>
              <div class="grid three">
                <div class="field"><label>Tipo</label><select id="person-type">${personTypes.map((type) => `<option ${draft.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></div>
                <div class="field"><label>Nome/Razao social</label><input id="person-name" value="${escapeAttr(draft.name || "")}" required /></div>
                <div class="field"><label>Fantasia/Apelido</label><input id="person-alias" value="${escapeAttr(draft.alias || "")}" /></div>
                <div class="field"><label>CPF/CNPJ</label><input id="person-doc" value="${escapeAttr(draft.document || "")}" /></div>
                <div class="field"><label>Telefone</label><input id="person-phone" value="${escapeAttr(draft.phone || "")}" /></div>
                <div class="field"><label>WhatsApp</label><input id="person-whatsapp" value="${escapeAttr(draft.whatsapp || "")}" /></div>
                <div class="field"><label>Email</label><input id="person-email" value="${escapeAttr(draft.email || "")}" /></div>
                <div class="field"><label>Ativo</label><select id="person-active"><option value="true">Sim</option><option value="false" ${draft.active === false ? "selected" : ""}>Nao</option></select></div>
                <div class="field"><label>Limite de credito</label><input id="person-credit" type="number" step="0.01" value="${Number(draft.creditLimit || 0)}" /></div>
              </div>
            </div>

            <div class="person-form-section">
              <h4>Endereco</h4>
              <div class="grid four">
                <div class="field"><label>CEP</label><input id="person-cep" value="${escapeAttr(draft.cep || "")}" placeholder="01001000" /></div>
                <div class="field wide-field"><label>Endereco</label><input id="person-address" value="${escapeAttr(draft.address || "")}" /></div>
                <div class="field"><label>Numero</label><input id="person-number" value="${escapeAttr(draft.number || "")}" /></div>
                <div class="field"><label>Bairro</label><input id="person-district" value="${escapeAttr(draft.district || "")}" /></div>
                <div class="field"><label>Cidade</label><input id="person-city" value="${escapeAttr(draft.city || "")}" /></div>
                <div class="field"><label>UF</label><input id="person-uf" value="${escapeAttr(draft.uf || "")}" maxlength="2" /></div>
                <div class="field wide-field"><label>Complemento</label><input id="person-complement" value="${escapeAttr(draft.complement || "")}" /></div>
              </div>
              <span class="helper">Ao preencher o CEP, o sistema tenta completar endereco, bairro, cidade e UF automaticamente.</span>
            </div>

            <div class="person-form-section">
              <h4>Fiscal, credito e operacao</h4>
              <div class="grid four">
                <div class="field"><label>RG/IE</label><input id="person-ie" value="${escapeAttr(draft.stateRegistration || "")}" /></div>
                <div class="field"><label>Contribuinte</label><select id="person-taxpayer"><option ${draft.taxpayerType === "Nao contribuinte" ? "selected" : ""}>Nao contribuinte</option><option ${draft.taxpayerType === "Contribuinte ICMS" ? "selected" : ""}>Contribuinte ICMS</option><option ${draft.taxpayerType === "Isento" ? "selected" : ""}>Isento</option></select></div>
                <div class="field"><label>Alerta SPC/CCF</label><select id="person-credit-alert"><option value="false">Nao</option><option value="true" ${draft.creditAlert ? "selected" : ""}>Sim</option></select></div>
                <div class="field"><label>Tipo recebimento/frete</label><input id="person-payment-type" value="${escapeAttr(draft.paymentType || "")}" /></div>
                <div class="field"><label>Data nascimento/aniversario</label><input id="person-birth" type="date" value="${escapeAttr(draft.birthDate || "")}" /></div>
                <div class="field"><label>Contato responsavel</label><input id="person-contact" value="${escapeAttr(draft.contactName || "")}" /></div>
                <div class="field"><label>CNH</label><input id="person-driver-license" value="${escapeAttr(draft.driverLicense || "")}" /></div>
                <div class="field"><label>Placa/veiculo</label><input id="person-vehicle-plate" value="${escapeAttr(draft.vehiclePlate || "")}" /></div>
                <div class="field"><label>RNTRC/ANTT</label><input id="person-rntrc" value="${escapeAttr(draft.rntrc || "")}" /></div>
                <div class="field"><label>Cargo/funcao</label><input id="person-job-title" value="${escapeAttr(draft.jobTitle || "")}" /></div>
              </div>
            </div>

            <div class="person-form-section">
              <h4>Observacoes</h4>
              <div class="field"><label>Notas internas</label><textarea id="person-notes" rows="3">${escapeHtml(draft.notes || "")}</textarea></div>
            </div>
          </form>
        </div>
      </div>
      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command primary" id="new-person" type="button"><span>+</span>F2 | Novo</button>
        <button class="desktop-command" id="edit-selected-person" type="button"><span>=</span>F3 | Alterar</button>
        <button class="desktop-command" id="print-people" type="button"><span>P</span>F4 | Imprimir</button>
        <button class="desktop-command" id="refresh-people" type="button"><span>R</span>F5 | Atualizar</button>
        <button class="desktop-command primary" id="save-person" type="button"><span>S</span>${editingPersonId ? "Salvar alteracao" : "Salvar novo"}</button>
        <button class="desktop-command danger" id="close-people" type="button"><span>X</span>Fechar</button>
      </div>
    </section>
  `;
}

function peopleTable() {
  const query = personSearch.trim().toLowerCase();
  const filter = personTypes.includes(currentPeopleTab) && currentPeopleTab !== "SPC/CCF" ? currentPeopleTab : "";
  const creditAlert = currentPeopleTab === "SPC/CCF";
  const aniversariantes = currentPeopleTab === "Aniversariantes";
  const monthDay = today().slice(5);
  const rows = state.people.filter((person) => (!filter || person.type === filter)
    && (!creditAlert || person.creditAlert || person.type === "SPC/CCF")
    && (!aniversariantes || String(person.birthDate || "").slice(5) >= monthDay)
    && (!query || [person.name, person.alias, person.document, person.city, person.phone, person.vehiclePlate, person.rntrc].some((value) => String(value || "").toLowerCase().includes(query))));
  return `
    <div class="table-wrap erp-table">
      <table>
        <thead><tr><th>Codigo</th><th>Tipo</th><th>Nome</th><th>Fantasia</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>UF</th><th>Auxiliar</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>${rows.map((person) => `<tr class="${Number(selectedPersonId) === Number(person.id) ? "selected-row" : ""}" data-select-person="${person.id}"><td>${person.id}</td><td>${person.type}</td><td>${person.name}</td><td>${person.alias || ""}</td><td>${person.document}</td><td>${person.phone || ""}</td><td>${person.city}</td><td>${person.uf}</td><td>${person.birthDate || person.vehiclePlate || person.rntrc || (person.creditAlert ? "SPC/CCF" : "-")}</td><td><span class="badge ${person.active === false ? "danger" : person.creditAlert ? "warn" : "ok"}">${person.active === false ? "Inativo" : person.creditAlert ? "Alerta" : "Ativo"}</span></td><td><button class="btn" data-edit-person="${person.id}">Editar</button> <button class="btn ${person.active === false ? "" : "danger"}" data-toggle-person="${person.id}">${person.active === false ? "Ativar" : "Inativar"}</button></td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function findPersonByName(name) {
  const target = String(name || "").trim().toLowerCase();
  return (state.people || []).find((person) => String(person.name || "").trim().toLowerCase() === target) || {};
}

function renderProducts() {
  const tabs = ["dados", "impostos", "composicao", "grade", "balanca", "etiquetas", "tabelas"];
  if (!tabs.includes(currentTab)) currentTab = "dados";
  const formHtml = productForm();
  const activeProducts = state.products.filter((product) => product.active !== false).length;
  const lowStockProducts = state.products.filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0)).length;
  const fiscalPendingProducts = state.products.filter((product) => product.fiscalStatus !== "Homologado").length;
  const selectedProduct = state.products.find((product) => Number(product.id) === Number(selectedProductId));
  const productRibbon = [
    { title: "Produto", text: "Mercadoria comum", icon: "products", type: "Mercadoria para revenda", kind: "primary" },
    { title: "Materia-prima", text: "Item de producao", icon: "stock", type: "Materia-prima" },
    { title: "Fabricado", text: "Receita ou kit", icon: "purchases", type: "Produto fabricado" },
    { title: "Servico", text: "Venda sem estoque", icon: "sales", type: "Servico" },
    { title: "Impostos", text: "NCM, CFOP e CST", icon: "fiscal", tab: "impostos" },
    { title: "Combos e composição", text: "Produtos e desconto", icon: "reports", tab: "composicao" },
    { title: "Balanca", text: "Codigo e validade", icon: "pdv", tab: "balanca" },
    { title: "Etiquetas", text: "Codigo de barras", icon: "settings", tab: "etiquetas" }
  ];
  const productListPanel = `
    <div class="product-list-panel">
      <div class="product-section-title">
        <div>
          <h3>Lista de produtos</h3>
          <p>${activeProducts} ativo(s), ${lowStockProducts} abaixo do minimo, ${fiscalPendingProducts} com fiscal pendente.</p>
        </div>
        <span class="badge ${selectedProduct ? "ok" : "warn"}">${selectedProduct ? `Selecionado: ${selectedProduct.description}` : "Selecione para alterar"}</span>
      </div>
      <div class="product-status-tabs" role="group" aria-label="Situação dos produtos">${[["all","Todos",state.products.length],["active","Ativos",activeProducts],["inactive","Inativos",state.products.length-activeProducts]].map(([key,label,count]) => `<button type="button" data-product-status="${key}" aria-pressed="${productStatusFilter===key}" class="${productStatusFilter===key?'selected':''}">${label} <strong>${count}</strong></button>`).join("")}</div>
      ${productsTable()}
    </div>
  `;
  const bodyHtml = currentTab === "dados"
    ? `
      ${productListPanel}
      <div class="product-edit-panel">
        <div class="product-section-title">
          <div>
            <h3>${editingProductId ? "Alterar produto" : "Novo produto"}</h3>
            <p>Comece pelos dados essenciais. Depois complete preco, estoque, fiscal, balanca, composicao e etiquetas quando precisar.</p>
          </div>
          <span class="badge ${editingProductId ? "warn" : "ok"}">${editingProductId ? `Codigo ${editingProductId}` : "Novo cadastro"}</span>
        </div>
        ${formHtml}
      </div>
    `
    : `${currentTab === "composicao" ? productTab()+productListPanel : productListPanel+productTab()}<div class="product-hidden-form" aria-hidden="true">${formHtml}</div>`;
  return `
    <section class="panel erp-screen products-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Produtos</strong>
        <span>Cadastro, precos, estoque, fiscal e etiquetas</span>
        <span>${activeProducts} ativos</span>
      </div>

      <div class="desktop-module-ribbon product-desktop-ribbon">
        ${productRibbon.map((item) => `
          <button class="desktop-ribbon-button ${item.kind || ""}" ${item.type ? `data-new-product-type="${item.type}"` : ""} ${item.tab ? `data-product-tab="${item.tab}"` : ""} type="button">
            <span class="dashboard-module-icon icon-${item.icon}" aria-hidden="true"></span>
            <strong>${item.title}</strong>
            <small>${item.text}</small>
          </button>
        `).join("")}
      </div>

      <div class="desktop-context-strip">
        <span>Produtos</span>
        <span>${tabLabel(currentTab)}</span>
        <span>${selectedProduct ? `Selecionado: ${selectedProduct.description}` : "Nenhum selecionado"}</span>
      </div>

      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command primary" id="new-product" type="button"><span>+</span>F2 | Novo</button>
        <button class="desktop-command" id="refresh-products" type="button"><span>R</span>F5 | Atualizar</button>
        <button class="desktop-command primary" id="save-product" type="button"><span>S</span>${editingProductId ? "Salvar alteracao" : "Salvar novo"}</button>
        <button class="desktop-command danger" id="close-products" type="button"><span>X</span>Fechar</button>
      </div>
      <div class="desktop-work-area">
        <div class="desktop-summary-strip product-overview">
          <div><span>Total</span><strong>${state.products.length}</strong></div>
          <div><span>Ativos</span><strong>${activeProducts}</strong></div>
          <div><span>Abaixo do minimo</span><strong>${lowStockProducts}</strong></div>
          <div><span>Fiscal pendente</span><strong>${fiscalPendingProducts}</strong></div>
        </div>

        <div class="desktop-filter-panel">
          <div class="filter-caption">F6 | Localizar produto</div>
          <div class="desktop-filter-line">
            <input id="product-search" value="${escapeAttr(productSearch)}" placeholder="Digite descricao, codigo de barras, marca, grupo ou NCM" />
            <button class="btn" id="filter-products">Buscar</button>
          </div>
          <p>Busque antes de cadastrar para evitar duplicidade. Use as abas para completar fiscal, lote, balanca, etiquetas e precos.</p>
        </div>

        <div class="module-tabs desktop-record-tabs">${tabs.map((tab) => `<a class="${currentTab === tab ? "active" : ""}" data-product-tab="${tab}" href="#module=products&tab=${tab}" role="button" aria-current="${currentTab === tab ? "page" : "false"}">${tabLabel(tab)}</a>`).join("")}</div>

        <div class="panel-body erp-body product-body desktop-record-body ${currentTab === "dados" ? "product-body-dados" : "product-body-tab"}">
          ${bodyHtml}
        </div>
      </div>

    </section>
  `;
}

function tabLabel(tab) {
  return {
    dados: "Dados",
    impostos: "Impostos",
    composicao: "Combos e composição",
    grade: "Grade/Lote",
    balanca: "Balanca",
    etiquetas: "Etiquetas",
    tabelas: "Tabela de precos"
  }[tab];
}

function productCheck(id, label, checked) {
  return `<label class="check-row desktop-check"><input id="${id}" type="checkbox" ${checked ? "checked" : ""} /> ${label}</label>`;
}

function commaOptionList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(source.map((item) => String(item || "").trim()).filter(Boolean))];
}

// Advanced fiscal parameters are opt-in and remain scoped to the selected product/company.
const advancedFiscalFields = {
  ipi: {title:'IPI', fields:[['enabled','Destacar IPI','bool'],['method','Cálculo','percent:Percentual|unit:Por unidade'],['priceMode','Composição do preço','included:IPI já incluído|added:Acrescer IPI ao total'],['enquadramento','cEnq — enquadramento legal','text'],['quantityFactor','Fator da unidade tributável','number'],['unitValue','IPI por unidade tributável','number']]},
  difal: {title:'DIFAL interestadual',fields:[['enabled','Aplicar regra DIFAL','bool'],['destinationUf','UF de destino','text'],['baseMethod','Base DIFAL','single:Única|double:Dupla (destinatário contribuinte)'],['internalRate','Alíquota interna destino %','number'],['interstateRate','Alíquota interestadual %','number'],['fcpRate','FCP destino %','number'],['baseReduction','Redução de base %','number'],['validFrom','Início da vigência','date'],['validTo','Fim da vigência','date'],['legalBasis','Fundamento legal da UF/operação','text']]},
  fuel: {title:'Combustíveis — ICMS monofásico',fields:[['enabled','Informar combustível','bool'],['anpCode','Código ANP oficial',"210203001:GLP|210203003:PROPANO COMERCIAL|210203004:PROPANO ESPECIAL|210203005:BUTANO COMERCIAL|320101001:GASOLINA A COMUM|320101002:GASOLINA A PREMIUM|320102001:GASOLINA C COMUM|320102002:GASOLINA C COMUM ADITIVADA|320102003:GASOLINA C PREMIUM|320102005:GASOLINA C PREMIUM ADITIVADA|320103001:GASOLINA DE REFERÊNCIA - NBR 16038|320103002:OUTRAS GASOLINAS AUTOMOTIVAS|320103003:GASOLINA DE REFERÊNCIA - PROCONVE L-6|320201001:GASOLINA DE AVIAÇÃO|320301001:OUTRAS GASOLINAS|320301002:GASOLINA PARA EXPORTAÇÃO|420101004:ÓLEO DIESEL A S1800 NÃO RODOVIÁRIO|420101005:ÓLEO DIESEL A S1800 NÃO RODOVIÁRIO - ADITIVADO|420102004:ÓLEO DIESEL A S500|420102005:ÓLEO DIESEL A S500 - ADITIVADO|420105001:ÓLEO DIESEL A S10|420107001:ÓLEO DIESEL C S10|420201001:ÓLEO DIESEL MARÍTIMO (DMA-MGO)|420201003:ÓLEO DIESEL MARÍTIMO (DMA-MDO)|420301002:OUTROS ÓLEOS DIESEL (Sem Adição de B100)|810102001:ETANOL ANIDRO|810102003:ETANOL ANIDRO DE REFERÊNCIA - EAR|810102004:ETANOL ANIDRO COM CORANTE|820101001:BIODIESEL B100|820101003:ÓLEO DIESEL B S1800 NÃO RODOVIÁRIO - COMUM|820101011:ÓLEO DIESEL B S1800 NÃO RODOVIÁRIO - ADITIVADO|820101012:ÓLEO DIESEL B S500 - COMUM|820101013:ÓLEO DIESEL B S500 - ADITIVADO|820101026:DIESEL B S1800 NÃO RODOVIÁRIO PARA GERAÇÃO DE ENERGIA ELÉTRICA|820101027:DIESEL B S500 PARA GERAÇÃO DE ENERGIA ELÉTRICA|820101032:DIESEL B S10 PARA GERAÇÃO DE ENERGIA ELÉTRICA|820101033:ÓLEO DIESEL B S10 - ADITIVADO|820101034:ÓLEO DIESEL B S10 - COMUM|820101030:ÓLEO DIESEL S10 B20 AUTORIZATIVO|820101025:ÓLEO DIESEL S10 B30 AUTORIZATIVO"],['consumptionUf','UF de consumo','text'],['quantityFactor','Quantidade tributável por unidade comercial','number'],['bioPercent','Biocombustível na mistura %','number'],['deferralRate','Diferimento CST 53 %','number'],['retentionQuantityFactor','Quantidade de retenção por unidade','number'],['retentionAdRem','Alíquota ICMS de retenção','number']]},
  rtcMono: {title:'IBS/CBS monofásicos — CST 620',fields:[['thirdPartyDocument','CNPJ responsável pela retenção (620003)','text'],['legalBasis','Fundamento legal dos parâmetros','text'],['validFrom','Início da vigência','date'],['validTo','Fim da vigência','date'],['quantityFactor','Quantidade tributável por unidade','number'],['ibsEnabled','Incidência IBS','bool'],['cbsEnabled','Incidência CBS','bool'],['ibsMethod','Cálculo IBS','adRem:Por unidade (ad rem)|adValorem:Percentual'],['cbsMethod','Cálculo CBS','adRem:Por unidade (ad rem)|adValorem:Percentual'],['ibsRate','Alíquota IBS UF ou ad rem','number'],['ibsCityRate','Alíquota IBS município %','number'],['cbsRate','Alíquota CBS','number'],['retentionQuantityFactor','Quantidade sujeita a retenção por unidade','number'],['retentionBasePercent','Parcela da base de retenção %','number'],['ibsRetentionRate','Alíquota IBS retenção','number'],['cbsRetentionRate','Alíquota CBS retenção','number'],['ibsRetainedPerUnit','IBS anteriormente retido por unidade','number'],['cbsRetainedPerUnit','CBS anteriormente retida por unidade','number'],['bioReferenceValue','Valor de referência do biocombustível','number'],['ibsBioRate','Alíquota IBS biocombustível','number'],['cbsBioRate','Alíquota CBS biocombustível','number']]},
  rtcCredit: {title:'Crédito presumido IBS/CBS',fields:[['enabled','Informar crédito presumido na operação','bool'],['code','cCredPres oficial',"01:Crédito presumido da aquisição de bens e serviços de produtor rural e produtor rural integrado não contribuint (por evento)|02:Crédito presumido da aquisição de serviço de transportador autônomo de carga pessoa física não contribuinte, o (por evento)|03:Crédito presumido da aquisição de resíduos e demais materiais destinados à reciclagem, reutilização ou logísti (por evento)|04:Crédito presumido da aquisição de bens móveis usados de pessoa física não contribuinte para revenda, observado|05:Crédito presumido no regime automotivo, observado o art. 311 da Lei Complementar nº 214, de 2025.|06:Crédito presumido no regime automotivo, observado o art. 312 da Lei Complementar nº 214, de 2025.|07:Crédito presumido na aquisição por contribuinte na Zona Franca de Manaus, observado o art. 444 da Lei Compleme|08:Crédito presumido na aquisição por contribuinte na Zona Franca de Manaus, observado o art. 447 da Lei Compleme (por evento)|09:Crédito presumido na aquisição por contribuinte na Zona Franca de Manaus, observado o art. 449 da Lei Compleme (por evento)|10:Crédito presumido na aquisição por contribuinte na Zona Franca de Manaus, observado o art. 450 da Lei Compleme|11:Crédito presumido na aquisição por contribuinte na Área de Livre Comércio, observado o art. 462 da Lei Complem|12:Crédito presumido na aquisição por contribuinte na Área de Livre Comércio, observado o art. 465 da Lei Complem (por evento)|13:Crédito presumido na aquisição pela indústria na Área de Livre Comércio, observado o art. 467 da Lei Complemen"],['legalBasis','Fundamento e enquadramento do crédito','text'],['basePerUnit','Base de crédito por unidade comercial','number'],['usedGoods','Bem móvel usado adquirido de pessoa física','bool'],['ibsEnabled','Crédito IBS','bool'],['cbsEnabled','Crédito CBS','bool'],['ibsRate','Crédito IBS %','number'],['cbsRate','Crédito CBS %','number'],['ibsSuspended','IBS sob condição suspensiva','bool'],['cbsSuspended','CBS sob condição suspensiva','bool']]}
};
function advancedFiscalForm(fiscal,reform){
  return '<p class="muted">Parâmetros por empresa e produto. Configure apenas operações aplicáveis, com fundamento e vigência. Créditos por evento e notas especiais possuem fluxo próprio na tela NF-e. Nenhuma alíquota de IBS/CBS monofásicos é presumida. Para nota vinculada a uma venda já paga, o total fiscal precisa corresponder ao valor cobrado; configure IPI incluído quando aplicável.</p>'+Object.entries(advancedFiscalFields).map(([group,schema])=>{
    const c=(['rtcMono','rtcCredit'].includes(group)?reform:fiscal)[group]||{};
    return `<details><summary>${schema.title}</summary><div class="grid four">${schema.fields.map(([key,label,type])=>{
      const id='advanced-'+group+'-'+key,v=c[key]??'';
      const options=type==='bool'?'true:Sim|false:Não':type.includes(':')?type:'';
      return `<div class="field"><label for="${id}">${label}</label>${options?`<select id="${id}"><option value="">Não configurado</option>${options.split('|').map(o=>{const [value,text]=o.split(':');return `<option value="${value}" ${String(v)===value?'selected':''}>${text}</option>`;}).join('')}</select>`:`<input id="${id}" type="${type}" ${type==='number'?'min="0" step="0.0001"':''} value="${escapeAttr(v)}" />`}</div>`;
    }).join('')}</div>${group==='fuel'?'<p class="muted">Origens do combustível: informe as parcelas; o total deve ser 100% quando exigido pela tabela ANP.</p><div class="grid four">'+Array.from({length:5},(_,i)=>{const o=c.origins?.[i]||{};return `<div class="field"><label>Origem ${i+1}: 0 nacional / 1 importado</label><input id="fuel-origin-${i}-imported" value="${escapeAttr(o.imported??'')}" /><label>Código UF de origem</label><input id="fuel-origin-${i}-uf" value="${escapeAttr(o.ufCode??'')}" /><label>Participação %</label><input id="fuel-origin-${i}-percent" type="number" min="0" max="100" step="0.0001" value="${escapeAttr(o.percent??'')}" /></div>`;}).join('')+'</div>':''}</details>`;
  }).join('');
}
function readAdvancedFiscal(group,previous={}){
  const fields=advancedFiscalFields[group].fields;
  if(!byId('advanced-'+group+'-'+fields[0][0]))return previous;
  const result={...previous};
  for(const [key,,type] of fields){const value=byId('advanced-'+group+'-'+key).value;if(value==='')delete result[key];else result[key]=type==='bool'?value==='true':type==='number'?Number(value):value;}
  if(group==='ipi'){result.cst=byId('product-ipi-cst')?.value;result.rate=Number(byId('product-ipi-rate')?.value||0);}
  if(group==='fuel'){
    const rows=Array.from({length:5},(_,i)=>({imported:byId(`fuel-origin-${i}-imported`).value,ufCode:byId(`fuel-origin-${i}-uf`).value,percent:byId(`fuel-origin-${i}-percent`).value}));
    result.origins=rows.filter(o=>Object.values(o).some(v=>v!=='')).map(o=>({...o,imported:o.imported===''?null:Number(o.imported),percent:o.percent===''?null:Number(o.percent)}));
    if((previous.origins||[]).length>5)result.origins.push(...previous.origins.slice(5));
  }
  return result;
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
    reference: "",
    sku: "",
    packaging: "",
    fiscalStatus: "Conferir",
    movesStock: true,
    allowsSale: true,
    paysCommission: false,
    complementary: false,
    pairProduct: false,
    showInApp: false,
    usesPriceTable: false,
    controlsImei: false,
    manufactured: false,
    explodeKitNf: false,
    adultOnly: false,
    additional: false,
    hasCoverage: false,
    coverageOptions: [],
    toppingOptions: [],
    ecommerceIntegration: false,
    kitchenRequest: false,
    medicine: false,
    activePrinciple: "",
    ncm: "00000000",
    cfop: "5102",
    cst: "102",
    cest: "",
    ibsClass: "000001",
    cbsClass: "000001",
    ...pendingProductDraft
  };
  return `
    <form class="form-card product-form-card" id="product-form">
      <details class="product-form-section required" open><summary>Dados essenciais</summary><div class="product-section-content">
        <div class="grid four">
          <div class="field wide-field"><label>Descricao</label><input id="product-description" value="${escapeAttr(draft.description)}" required /></div>
          <div class="field"><label>Codigo de barras</label><input id="product-barcode" value="${escapeAttr(draft.barcode)}" /></div>
          <div class="field"><label>Tipo</label><select id="product-type">${["Mercadoria para revenda", "Materia-prima", "Produto fabricado", "Servico", "Combustivel"].map((item) => `<option ${draft.type === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          <div class="field"><label>Unidade estoque/compra</label><select id="product-unit">${["UN", "KG", "G", "LT", "ML", "CX", "HR"].map((item) => `<option ${draft.unit === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          <div class="field"><label>Ativo</label><select id="product-active"><option value="true">Sim</option><option value="false" ${draft.active === false ? "selected" : ""}>Nao</option></select></div>
        </div>
      </div></details>

      <details class="product-form-section"><summary>Organizacao interna</summary><div class="product-section-content">
        <div class="grid four">
          <div class="field"><label>Marca</label><input id="product-brand" value="${escapeAttr(draft.brand)}" /></div>
          <div class="field"><label>Grupo</label><input id="product-group" value="${escapeAttr(draft.group)}" /></div>
          <div class="field"><label>Localizacao</label><input id="product-location" value="${escapeAttr(draft.location)}" /></div>
          <div class="field"><label>Referencia</label><input id="product-reference" value="${escapeAttr(draft.reference)}" /></div>
          <div class="field"><label>Codigo interno/SKU</label><input id="product-sku" value="${escapeAttr(draft.sku)}" /></div>
          <div class="field"><label>Embalagem</label><input id="product-packaging" value="${escapeAttr(draft.packaging)}" /></div>
          <div class="field"><label>Status fiscal</label><select id="product-fiscal-status">${["Conferir", "Homologado", "Pendente", "Bloqueado"].map((item) => `<option ${draft.fiscalStatus === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
        </div>
      </div></details>

      <details class="product-form-section required" open><summary>Preco e estoque</summary><div class="product-section-content">
        <div class="grid four">
          <div class="field"><label>Custo</label><input id="product-cost" type="number" step="0.01" value="${draft.cost}" /></div>
          <div class="field"><label>Venda</label><input id="product-price" type="number" step="0.01" value="${draft.price}" /></div>
          <div class="field"><label>Estoque atual</label><input id="product-stock" type="number" step="0.001" value="${draft.stock}" /></div>
          <div class="field"><label>Estoque minimo</label><input id="product-min" type="number" step="0.001" value="${draft.minStock}" /></div>
        </div>
      </div></details>

      <details class="product-form-section"><summary>Como o produto funciona</summary><div class="product-section-content">
        <div class="desktop-check-grid">
          ${productCheck("product-moves-stock", "Movimenta estoque", draft.movesStock !== false)}
          ${productCheck("product-allows-sale", "Permite venda", draft.allowsSale !== false)}
          ${productCheck("product-pays-commission", "Paga comissao", draft.paysCommission)}
          ${productCheck("product-complementary", "Complementar", draft.complementary)}
          ${productCheck("product-pair-product", "Par", draft.pairProduct)}
          ${productCheck("product-show-app", "Mostrar no App", draft.showInApp)}
          ${productCheck("product-uses-price-table", "Usar tabela preco", draft.usesPriceTable)}
          ${productCheck("product-controls-imei", "Usar IMEI", draft.controlsImei)}
          ${productCheck("product-manufactured", "Fabricado", draft.manufactured || draft.type === "Produto fabricado")}
          ${productCheck("product-explode-kit-nf", "Explodir kit na NF", draft.explodeKitNf)}
          ${productCheck("product-adult-only", "Produto +18", draft.adultOnly)}
          ${productCheck("product-additional", "Adicional", draft.additional)}
          ${productCheck("product-ecommerce", "Integrar e-commerce", draft.ecommerceIntegration)}
          ${productCheck("product-kitchen-request", "Pedir na cozinha", draft.kitchenRequest)}
          ${productCheck("product-medicine", "Medicamento", draft.medicine)}
        </div>
      </div></details>

      <details class="product-form-section"><summary>Totem, combos e adicionais</summary><div class="product-section-content">
        <div class="grid four">
          <label class="check-row desktop-check"><input id="product-has-coverage" type="checkbox" ${draft.hasCoverage || commaOptionList(draft.coverageOptions).length ? "checked" : ""} /> Possui cobertura</label>
          <div class="field wide-field"><label>Coberturas do produto</label><input id="product-coverage-options" value="${escapeAttr(commaOptionList(draft.coverageOptions).join(", "))}" placeholder="Chocolate ao leite, Morango" /></div>
          <div class="field wide-field"><label>Toppings/adicionais do totem</label><input id="product-topping-options" value="${escapeAttr(commaOptionList(draft.toppingOptions || draft.additionalOptions || draft.extrasOptions).join(", "))}" placeholder="Granulado, Chocoball" /></div>
          <span class="helper">Use virgula para separar opcoes. Combos usam a ficha tecnica da aba Composicao.</span>
        </div>
      </div></details>

      <details class="product-form-section"><summary>Fiscal rapido</summary><div class="product-section-content">
        <div class="grid four">
          <div class="field"><label>NCM</label><input id="product-ncm" value="${escapeAttr(draft.ncm)}" /></div>
          <div class="field"><label>CEST</label><input id="product-cest" value="${escapeAttr(draft.cest)}" /></div>
          <div class="field"><label>CFOP</label><input id="product-cfop" value="${escapeAttr(draft.cfop)}" /></div>
          <div class="field"><label>CST/CSOSN</label><input id="product-cst" value="${escapeAttr(draft.cst)}" /></div>
          <div class="field"><label>Classificacao IBS</label><input id="product-ibs" value="${escapeAttr(draft.ibsClass)}" /></div>
          <div class="field"><label>Classificacao CBS</label><input id="product-cbs" value="${escapeAttr(draft.cbsClass)}" /></div>
          <div class="field"><label>Principio ativo</label><input id="product-active-principle" value="${escapeAttr(draft.activePrinciple)}" /></div>
        </div>
        <span class="helper">Aba Impostos mantem a conferencia fiscal completa para NF-e, NFC-e e reforma tributaria.</span>
      </div></details>

      <details class="product-form-section"><summary>Foto, composicao e producao</summary><div class="product-section-content">
        <div class="photo-uploader">
          <div class="photo-preview" id="product-photo-preview">${pendingProductPhoto ? `<img src="${pendingProductPhoto}" alt="Foto do produto" />` : "Sem foto"}</div>
          <div class="grid">
            <div class="field"><label>Foto do produto</label><input id="product-photo" type="file" accept="image/*" /></div>
            <label class="check-row"><input id="product-is-bundle" type="checkbox" ${pendingComposition.length ? "checked" : ""} /> Este produto e composto ou produzido com materia-prima</label>
            <p class="helper">Marque quando este cadastro for uma receita/produto produzido, como torta de limao, ou um kit. A ficha tecnica fica na aba Composicao.</p>
          </div>
        </div>
      </div></details>
    </form>
  `;
}

function productTab() {
  if (currentTab === "impostos") {
    const fiscal = pendingProductDraft.fiscal || {};
    const reform = pendingProductDraft.reform || {};
    return `
      <div class="form-card">
        <h3>Conferencia fiscal do produto</h3>
        <p class="muted">Campos espelhados do ERP desktop para a emissao fiscal, DANFE/DANFCE e reforma tributaria.</p>
        <div class="grid four">
          <div class="field"><label>Origem</label><select id="product-origin">${["0 Nacional", "1 Estrangeira direta", "2 Estrangeira mercado interno", "3 Nacional importacao superior 40%", "4 Nacional PPB", "5 Nacional importacao inferior 40%", "6 Estrangeira sem similar", "7 Estrangeira mercado interno sem similar", "8 Nacional importacao superior 70%"].map((item) => `<option ${fiscal.origin === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          <div class="field"><label>CST ICMS (CRT 2/3)</label><input id="product-fiscal-cst" maxlength="2" value="${escapeAttr(fiscal.cst ?? (String(draft.cst||"").length===2?draft.cst:""))}" /></div><div class="field"><label>CSOSN (CRT 1/4)</label><input id="product-fiscal-csosn" maxlength="3" value="${escapeAttr(fiscal.csosn ?? draft.csosn ?? (String(draft.cst||"").length===3?draft.cst:""))}" /></div><div class="field"><label>cBenef</label><input id="product-cbenef" value="${escapeAttr(fiscal.cbenef || "")}" /></div>
          <div class="field"><label>Motivo desoneracao</label><input id="product-mot-deson" value="${escapeAttr(fiscal.motDeson || "")}" /></div>
          <div class="field"><label>Aliquota interna ICMS %</label><input id="product-icms-internal-rate" type="number" step="0.01" value="${Number(fiscal.icmsInternalRate || 0)}" /></div>
          <div class="field"><label>CFOP externo</label><input id="product-cfop-external" value="${escapeAttr(fiscal.cfopExternal || "")}" /></div>
          <div class="field"><label>CST externo</label><input id="product-cst-external" value="${escapeAttr(fiscal.cstExternal || "")}" /></div>
          <div class="field"><label>ICMS externo %</label><input id="product-icms-external-rate" type="number" step="0.01" value="${Number(fiscal.icmsExternalRate || 0)}" /></div>
          <div class="field"><label>Base reduzida ICMS %</label><input id="product-icms-base-reduction" type="number" step="0.01" value="${Number(fiscal.icmsBaseReduction || 0)}" /></div>
        </div>
        <div class="grid four">
          <div class="field"><label>ICMS-ST retido %</label><input id="product-icms-st-rate" type="number" step="0.01" value="${Number(fiscal.icmsStRate || 0)}" /></div>
          <div class="field"><label>MVA %</label><input id="product-mva" type="number" step="0.01" value="${Number(fiscal.mva || 0)}" /></div>
          <div class="field"><label>FCP %</label><input id="product-fcp-rate" type="number" step="0.01" value="${Number(fiscal.fcpRate || 0)}" /></div>
          <div class="field"><label>Diferimento ICMS próprio %</label><input id="product-icms-deferral" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.icmsDeferralRate ?? "")}" /></div>
<div class="field"><label>Base ICMS-ST retido (documento origem) por unidade</label><input id="product-retained-st-base" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.retainedStBase ?? "")}" /></div>
<div class="field"><label>Alíquota ST retido %</label><input id="product-retained-st-rate" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.retainedStRate ?? "")}" /></div>
<div class="field"><label>Valor ICMS-ST retido por unidade</label><input id="product-retained-st-value" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.retainedStValue ?? "")}" /></div>
<div class="field"><label>ICMS próprio do substituto por unidade</label><input id="product-icms-substitute-value" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.icmsSubstituteValue ?? "")}" /></div>
<div class="field"><label>Base FCP-ST retido por unidade</label><input id="product-retained-fcp-base" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.retainedFcpBase ?? "")}" /></div>
<div class="field"><label>FCP-ST retido %</label><input id="product-retained-fcp-rate" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.retainedFcpRate ?? "")}" /></div>
<div class="field"><label>Valor FCP-ST retido por unidade</label><input id="product-retained-fcp-value" type="number" min="0" step="0.01" value="${escapeAttr(fiscal.retainedFcpValue ?? "")}" /></div>
<div class="field"><label>IPI CST</label><input id="product-ipi-cst" value="${escapeAttr(fiscal.ipiCst || "")}" /></div>
          <div class="field"><label>IPI %</label><input id="product-ipi-rate" type="number" step="0.01" value="${Number(fiscal.ipiRate || 0)}" /></div>
          <div class="field"><label>PIS entrada CST</label><input id="product-pis-in-cst" value="${escapeAttr(fiscal.pisInCst || "")}" /></div>
          <div class="field"><label>PIS saida CST</label><input id="product-pis-out-cst" value="${escapeAttr(fiscal.pisOutCst || "")}" /></div>
          <div class="field"><label>PIS %</label><input id="product-pis-rate" type="number" step="0.01" value="${Number(fiscal.pisRate || 0)}" /></div>
          <div class="field"><label>COFINS entrada CST</label><input id="product-cofins-in-cst" value="${escapeAttr(fiscal.cofinsInCst || "")}" /></div>
          <div class="field"><label>COFINS saida CST</label><input id="product-cofins-out-cst" value="${escapeAttr(fiscal.cofinsOutCst || "")}" /></div>
          <div class="field"><label>COFINS %</label><input id="product-cofins-rate" type="number" step="0.01" value="${Number(fiscal.cofinsRate || 0)}" /></div>
          <div class="field"><label>Natureza receita</label><input id="product-revenue-nature" value="${escapeAttr(fiscal.revenueNature || "")}" /></div>
        </div>
        ${advancedFiscalForm(fiscal,reform)}
        <h3>Reforma tributaria</h3>
        <div class="grid four">
          <div class="field"><label>cClassTrib</label><input id="product-class-trib" value="${escapeAttr(reform.classTrib || pendingProductDraft.ibsClass || "000001")}" /></div>
          <div class="field"><label>CST CBS/IBS</label><input id="product-reform-cst" value="${escapeAttr(reform.cst || "")}" /></div>
          <div class="field"><label>Ano de vigência da CBS</label><input id="product-cbs-rate-year" type="number" min="2026" max="2099" value="${Number(reform.rateYear || 2026)}" /></div>
          <div class="field"><label>CBS %</label><input id="product-cbs-rate" type="number" step="0.0001" value="${Number(reform.cbsRate || 0)}" /></div>
          <div class="field"><label>IBS UF %</label><input id="product-ibs-uf-rate" type="number" step="0.0001" value="${Number(reform.ibsUfRate || 0)}" /></div>
          <div class="field"><label>IBS Municipio %</label><input id="product-ibs-city-rate" type="number" step="0.0001" value="${Number(reform.ibsCityRate || 0)}" /></div>
          <div class="field"><label>Reducao CBS/IBS %</label><input id="product-reform-reduction" type="number" step="0.01" value="${Number(reform.reduction || 0)}" /></div>
          <div class="field"><label>Diferimento %</label><input id="product-reform-deferral" type="number" step="0.01" value="${Number(reform.deferral || 0)}" /></div>
          <div class="field"><label>Redução IBS %</label><input id="product-ibs-reduction" type="number" min="0" max="100" step="0.01" value="${Number(reform.ibsReduction ?? reform.reduction ?? 0)}" /></div>
          <div class="field"><label>Redução CBS %</label><input id="product-cbs-reduction" type="number" min="0" max="100" step="0.01" value="${Number(reform.cbsReduction ?? reform.reduction ?? 0)}" /></div>
          <div class="field"><label>Diferimento IBS UF %</label><input id="product-uf-deferral" type="number" min="0" max="100" step="0.01" value="${Number(reform.ibsUfDeferral ?? reform.deferral ?? 0)}" /></div>
          <div class="field"><label>Diferimento IBS municipal %</label><input id="product-city-deferral" type="number" min="0" max="100" step="0.01" value="${Number(reform.ibsCityDeferral ?? reform.deferral ?? 0)}" /></div>
          <div class="field"><label>Diferimento CBS %</label><input id="product-cbs-deferral" type="number" min="0" max="100" step="0.01" value="${Number(reform.cbsDeferral ?? reform.deferral ?? 0)}" /></div>
          <p>O CST e a classificação oficial determinam quais reduções e diferimentos são permitidos. Crédito presumido, ad rem e Imposto Seletivo exigem emissor especializado; este emissor bloqueia seu envio em vez de ignorar valores.</p>

          <div class="field"><label>Crédito presumido legado % (bloqueado; use cCredPres)</label><input id="product-presumed-credit" type="number" step="0.01" value="${Number(reform.presumedCredit || 0)}" /></div>
          <div class="field"><label>Imposto seletivo %</label><input id="product-selective-tax" type="number" step="0.01" value="${Number(reform.selectiveTax || 0)}" /></div>
          <div class="field"><label>CST Imp. seletivo</label><input id="product-selective-tax-cst" value="${escapeAttr(reform.selectiveTaxCst || "")}" /></div>
          <div class="field"><label>Class. Imp. seletivo</label><input id="product-selective-tax-class" value="${escapeAttr(reform.selectiveTaxClass || "")}" /></div>
          <div class="field"><label>Vigencia inicio</label><input id="product-reform-from" type="date" value="${escapeAttr(reform.from || "")}" /></div>
          <div class="field"><label>Monofásico (use CST 620 e parâmetros específicos)</label><select id="product-reform-monophase"><option value="false">Nao</option><option value="true" ${reform.monophase ? "selected" : ""}>Sim</option></select></div>
          <div class="field"><label>Aliquota ad rem</label><input id="product-ad-rem-rate" type="number" step="0.0001" value="${Number(reform.adRemRate || 0)}" /></div>
          <div class="field"><label>Unidade ad rem</label><input id="product-ad-rem-unit" value="${escapeAttr(reform.adRemUnit || "")}" /></div>
          <div class="field"><label>Observacao fiscal</label><input id="product-fiscal-note" value="${escapeAttr(fiscal.note || "")}" /></div>
        </div>
        <div class="desktop-check-grid">
          ${productCheck("product-imported", "Produto importado", reform.imported)}
          ${productCheck("product-capital-good", "Bem de capital", reform.capitalGood)}
          ${productCheck("product-return-rule", "Regra de devolucao", reform.returnRule)}
          ${productCheck("product-exterior-operation", "Operacao exterior", reform.exteriorOperation)}
        </div>
        <div class="fiscal-note">A emissao usa estes parametros no XML fiscal e deve ser homologada com certificado/ACBr antes do provedor pago.</div>
      </div>
    `;
  }
  if (currentTab === "composicao") {
    const compositionCost = pendingComposition.reduce((sum, component) => {
      const product = state.products.find((item) => item.id === component.productId);
      return sum + Number(product?.cost || 0) * componentStockQty(component, product);
    }, 0);
    return `
      ${renderComboBuilder()}
      <div class="form-card">
        <h3>Ficha tecnica: composicao e fabricacao</h3>
        <p class="muted">Informe quanto de cada materia-prima entra em 1 unidade do produto final. As quantidades serao convertidas para a unidade de estoque cadastrada.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Componente</th><th>Uso por unidade</th><th>Baixa no estoque</th><th>Custo unit.</th><th>Quando baixa</th><th>Acao</th></tr></thead>
            <tbody>${pendingComposition.length ? pendingComposition.map((component, index) => {
              const product = state.products.find((item) => item.id === component.productId);
              return `<tr><td>${product?.description || component.productId}</td><td>${formatQty(component.qty)} ${component.useUnit || product?.unit || ""}</td><td>${formatQty(componentStockQty(component, product))} ${product?.unit || ""}</td><td>${money(product?.cost || 0)}</td><td>${compositionModeLabel(component.mode)}</td><td><button class="btn danger" data-remove-composition="${index}" type="button">Remover</button></td></tr>`;
            }).join("") : `<tr><td colspan="6">Nenhum componente adicionado para o novo produto.</td></tr>`}</tbody>
          </table>
        </div>
        <div class="grid four">
          <div class="field"><label>Materia-prima / componente</label><select id="composition-product">${state.products.map((product) => `<option value="${product.id}">${product.description} (${product.unit || "UN"})</option>`).join("")}</select></div>
          <div class="field"><label>Quantidade usada por unidade</label><input id="composition-qty" type="number" step="0.001" value="1" /></div>
          <div class="field"><label>Unidade de uso</label><select id="composition-use-unit">${["AUTO", "G", "KG", "ML", "LT", "UN"].map((unit) => `<option value="${unit}">${unit === "AUTO" ? "Mesma do estoque" : unit}</option>`).join("")}</select></div>
          <div class="field"><label>Quando baixar</label><select id="composition-mode"><option value="production">Na ordem de producao/cozinha</option><option value="sale">Na venda</option><option value="both">Na producao e na venda</option></select></div>
        </div>
        <div class="actions">
          <button class="btn primary" id="add-composition" type="button">Adicionar componente</button>
          <span class="badge warn">Custo dos componentes: ${money(compositionCost)}</span>
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
  if (currentTab === "etiquetas") {
    return renderProductLabelsTab();
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
          <div class="field"><label>% Varejo</label><input id="product-promo-retail-percent" type="number" step="0.01" value="${Number(pendingProductDraft.promotion?.retailPercent || 0)}" /></div>
          <div class="field"><label>% Atacado</label><input id="product-promo-wholesale-percent" type="number" step="0.01" value="${Number(pendingProductDraft.promotion?.wholesalePercent || 0)}" /></div>
          <div class="field"><label>Quantidade atacado</label><input id="product-promo-wholesale-qty" type="number" step="0.001" value="${Number(pendingProductDraft.promotion?.wholesaleQty || 0)}" /></div>
          <div class="field"><label>Campanha</label><input id="product-promo-name" value="${escapeAttr(pendingProductDraft.promotion?.name || "")}" /></div>
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
    production: "Ordem de producao/cozinha",
    both: "Producao e venda"
  }[mode] || "Venda";
}

function currentLabelConfig() {
  const previous = pendingProductDraft.labelConfig || {};
  return {
    model: previous.model || state.settings.labelModel || "EAN13",
    copies: Number(previous.copies || 1),
    width: Number(previous.width || 60),
    height: Number(previous.height || 35),
    columns: Number(previous.columns || 2),
    showPrice: previous.showPrice !== false,
    showSku: Boolean(previous.showSku),
    showCompany: previous.showCompany !== false
  };
}

function productForLabelPreview() {
  const selected = state.products.find((product) => Number(product.id) === Number(selectedProductId || editingProductId));
  const draft = pendingProductDraft.description ? pendingProductDraft : {};
  return selected || {
    id: editingProductId || "novo",
    description: draft.description || "Produto selecionado",
    barcode: draft.barcode || "7890000000011",
    price: Number(draft.price || 0),
    sku: draft.sku || draft.reference || "",
    reference: draft.reference || "",
    unit: draft.unit || "UN"
  };
}

function barcodeValue(product) {
  return String(product?.barcode || product?.id || "").replace(/\D/g, "") || String(product?.id || "0000000000000");
}

function barcodeBars(value) {
  const digitsOnly = barcodeValue({ barcode: value }).padStart(12, "0").slice(0, 13);
  return digitsOnly.split("").map((digit, index) => {
    const height = 26 + ((Number(digit) + index) % 4) * 6;
    const width = 2 + ((Number(digit) + index) % 3);
    return `<i style="height:${height}px;width:${width}px"></i>`;
  }).join("");
}

function labelPreviewHtml(product, config) {
  const code = barcodeValue(product);
  return `
    <div class="product-label-preview" style="width:${config.width * 3}px;min-height:${config.height * 3}px">
      ${config.showCompany ? `<small>${escapeHtml(state.settings.company || "Tortela")}</small>` : ""}
      <strong>${escapeHtml(product.description || "Produto selecionado")}</strong>
      ${config.showPrice ? `<b>${money(effectiveProductPrice(product, 1))}</b>` : ""}
      <div class="barcode-art" aria-label="Codigo de barras ${escapeAttr(code)}">${barcodeBars(code)}</div>
      <em>${escapeHtml(code)}</em>
      ${config.showSku ? `<small>SKU ${escapeHtml(product.sku || product.reference || product.id || "-")}</small>` : ""}
    </div>
  `;
}

function renderProductLabelsTab() {
  const product = productForLabelPreview();
  const config = currentLabelConfig();
  return `
    <div class="form-card product-labels-pane">
      <div>
        <h3>Etiquetas de produto</h3>
        <p class="muted">Configure o modelo antes de gerar a etiqueta. A etiqueta usa o codigo de barras do cadastro do produto.</p>
      </div>
      <div class="label-workbench">
        <div class="label-config-grid">
          <div class="field"><label>Produto da etiqueta</label><select id="label-product">${state.products.map((item) => `<option value="${item.id}" ${Number(item.id) === Number(product.id) ? "selected" : ""}>${item.description}</option>`).join("")}</select></div>
          <div class="field"><label>Modelo</label><select id="label-model">${["EAN13", "CODE128", "Balanca", "Gondola"].map((item) => `<option ${config.model === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          <div class="field"><label>Quantidade</label><input id="label-copies" type="number" min="1" max="99" value="${config.copies}" /></div>
          <div class="field"><label>Colunas por folha</label><input id="label-columns" type="number" min="1" max="4" value="${config.columns}" /></div>
          <div class="field"><label>Largura mm</label><input id="label-width" type="number" min="30" max="120" value="${config.width}" /></div>
          <div class="field"><label>Altura mm</label><input id="label-height" type="number" min="20" max="80" value="${config.height}" /></div>
          <label class="check-row"><input id="label-show-price" type="checkbox" ${config.showPrice ? "checked" : ""} /> Mostrar preco</label>
          <label class="check-row"><input id="label-show-company" type="checkbox" ${config.showCompany ? "checked" : ""} /> Mostrar empresa</label>
          <label class="check-row"><input id="label-show-sku" type="checkbox" ${config.showSku ? "checked" : ""} /> Mostrar SKU/referencia</label>
        </div>
        <div class="label-preview-wrap">
          <span class="badge ok">Previa</span>
          ${labelPreviewHtml(product, config)}
          <div class="actions">
            <button class="btn" id="refresh-label-preview" type="button">Atualizar previa</button>
            <button class="btn primary" id="generate-product-labels" type="button">Gerar etiquetas</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatQty(value) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
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

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
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

function generatePublicTerminalToken() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function rotatePublicTerminalToken() {
  const input = byId("set-public-terminal-token");
  const token = generatePublicTerminalToken();
  if (input) input.value = token;
  state.settings.publicTerminalToken = token;
  alert("Novo token gerado. Salve as configuracoes para invalidar os links antigos.");
}

async function copyPublicTerminalToken() {
  const token = byId("set-public-terminal-token")?.value.trim() || state.settings.publicTerminalToken || "";
  if (!token) return alert("Nenhum token de totem/cozinha/telao encontrado.");
  try {
    await copyText(token);
    alert("Token copiado.");
  } catch {
    alert(`Nao foi possivel copiar automaticamente. Token: ${token}`);
  }
}

function productsTable() {
  const query = productSearch.trim().toLowerCase();
  const rows = state.products.filter((product) => (productStatusFilter === "all" || (productStatusFilter === "active" ? product.active !== false : product.active === false)) && (!query || [product.id, product.description, product.barcode, product.brand, product.group, product.ncm].some((value) => String(value || "").toLowerCase().includes(query))));
  const selected = rows.find(product => Number(product.id) === Number(selectedProductId));
  return `
    <p class="helper" role="status">${rows.length} produto(s) encontrado(s). Selecione um produto e escolha uma ação abaixo da lista.</p><div class="table-wrap erp-table product-catalog-scroll" tabindex="0" aria-label="Lista de produtos com rolagem">
      <table>
        <thead><tr><th>Selecionar</th><th>Foto</th><th>Codigo</th><th>Referencia</th><th>Descricao</th><th>Tipo</th><th>NCM</th><th>Preco</th><th>Estoque</th><th>Fiscal</th><th>Status</th></tr></thead>
        <tbody>${rows.map((product) => `<tr class="${Number(selectedProductId) === Number(product.id) ? "selected-row" : ""}" data-select-product="${product.id}"><td><input type="radio" name="catalog-product" value="${product.id}" aria-label="Selecionar ${escapeAttr(product.description)}" ${Number(selectedProductId)===Number(product.id)?"checked":""} /></td><td>${product.photo ? `<img src="${product.photo}" alt="" style="width:34px;height:34px;object-fit:cover;border-radius:6px" />` : "-"}</td><td>${product.id}</td><td>${product.reference || product.sku || "-"}</td><td>${product.description}${product.ecommerceIntegration ? ` <span class="badge ok">Web</span>` : ""}${product.kitchenRequest ? ` <span class="badge warn">Cozinha</span>` : ""}</td><td>${product.type}</td><td>${product.ncm}</td><td>${money(product.price)}</td><td>${product.stock}</td><td><span class="badge ${product.fiscalStatus === "Homologado" ? "ok" : product.fiscalStatus === "Bloqueado" ? "danger" : "warn"}">${product.fiscalStatus || "Conferir"}</span></td><td><span class="badge ${product.active === false ? "danger" : product.stock <= product.minStock ? "warn" : "ok"}">${product.active === false ? "Inativo" : "Ativo"}</span></td></tr>`).join("") || '<tr><td colspan="11">Nenhum produto encontrado neste filtro.</td></tr>'}</tbody>
      </table>
    </div>
    <div class="product-selection-actions">
      <p id="product-selection-caption" role="status">${selected ? `Selecionado: <strong>${escapeAttr(selected.description)}</strong>` : "Selecione um produto na lista para liberar as ações."}</p>
      <div class="product-selection-buttons">
        <button class="btn" id="edit-selected-product" type="button" ${selected?'':'disabled'}>Editar produto</button>
        <button class="btn" id="label-selected-product" type="button" ${selected?'':'disabled'}>Imprimir etiqueta</button>
        <button class="btn ${selected?.active===false?'primary':'danger'}" id="toggle-selected-product" type="button" ${selected?'':'disabled'}>${selected?.active===false?'Ativar produto':'Inativar produto'}</button>
        <button class="btn" id="print-products" type="button">Imprimir lista filtrada</button>
        <button class="btn" id="export-products" type="button">Exportar Excel / CSV</button>
      </div>
    </div>
  `;
}

function renderStock() {
  const movements = state.stockMovements || [];
  const stockTabs = [
    ["producao", "Producao"],
    ["movimento", "Movimento"],
    ["qr", "QR Central"],
    ["inventario", "Inventario"],
    ["transferencia", "Transferencia"],
    ["saldos", "Saldos"]
  ];
  if (!stockTabs.some(([key]) => key === currentStockTab)) currentStockTab = "producao";
  const lowStock = state.products.filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0));
  const stockValue = state.products.reduce((sum, product) => sum + Number(product.stock || 0) * Number(product.cost || 0), 0);
  const expiringLots = (state.stockLots || []).filter((lot) => Number(lot.qty || 0) > 0 && lot.expiry && daysUntil(lot.expiry) <= 30);
  const activeStockTab = stockTabs.find(([key]) => key === currentStockTab) || stockTabs[0];
  const producedProducts = state.products.filter((p) => (p.composition || []).some((component) => component.mode === "production" || component.mode === "both"));
  const productOptions = state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("");
  const productionOptions = producedProducts.map((p) => `<option value="${p.id}">${p.description}</option>`).join("");
  const stockRibbon = [
    { key: "producao", title: "Producao", text: "Ordem da cozinha", icon: "purchases", kind: "primary" },
    { key: "movimento", title: "Movimento", text: "Entrada, saida e perda", icon: "stock" },
    { key: "qr", title: "QR Central", text: "Receber remessa", icon: "pdv" },
    { key: "inventario", title: "Inventario", text: "Contagem fisica", icon: "reports" },
    { key: "transferencia", title: "Transferencia", text: "Depositos e loja", icon: "sales" },
    { key: "saldos", title: "Saldos", text: "Consulta geral", icon: "products" }
  ];
  const plannedOptions = (state.productions || [])
    .filter((row) => row.status === "Planejada")
    .map((row) => `<option value="${row.id}">Ordem ${row.id} - ${row.product} (${row.plannedQty})</option>`)
    .join("");
  const productionPanel = `
    <div class="table-wrap">
      <table><thead><tr><th>Ordem</th><th>Data</th><th>Produto</th><th>Planejado</th><th>Produzido</th><th>Perda</th><th>Custo</th><th>Status</th></tr></thead><tbody>${(state.productions || []).slice().reverse().map((row) => `<tr><td>${row.id}</td><td>${row.date}</td><td>${row.product}</td><td>${row.plannedQty}</td><td>${row.actualQty || 0}</td><td>${row.loss || 0}</td><td>${money(row.productionCost || 0)}</td><td><span class="badge ${row.status === "Concluida" ? "ok" : "warn"}">${row.status || "Concluida"}</span></td></tr>`).join("") || `<tr><td colspan="8">Nenhuma ordem registrada.</td></tr>`}</tbody></table>
    </div>
    <div class="form-card">
      <h3>Ordem de producao da cozinha</h3>
      <p class="muted">Ao concluir, o sistema da entrada no produto final e baixa as materias-primas pela ficha tecnica.</p>
      <div class="field"><label>Produto fabricado</label><select id="production-product">${productionOptions}</select></div>
      <div class="field"><label>Ordem planejada</label><select id="production-order"><option value="">Nova producao</option>${plannedOptions}</select></div>
      <div class="grid two">
        <div class="field"><label>Quantidade planejada</label><input id="production-qty" type="number" step="0.001" value="10" /></div>
        <div class="field"><label>Quantidade produzida</label><input id="production-actual-qty" type="number" step="0.001" value="10" /></div>
        <div class="field"><label>Lote produzido</label><input id="production-lot" /></div>
        <div class="field"><label>Validade</label><input id="production-expiry" type="date" /></div>
        <div class="field"><label>Series produzidas</label><textarea id="production-serials" placeholder="Uma por linha, quando o produto controlar serie"></textarea></div>
      </div>
      <div class="actions"><button class="btn" id="plan-production" type="button">Programar ordem</button><button class="btn primary" id="make-production" type="button">Concluir producao</button></div>
    </div>`;
  const movementPanel = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Saldo</th><th>Lote/Local</th><th>Historico</th></tr></thead>
        <tbody>${movements.slice(-30).reverse().map((row) => `<tr><td>${row.date}</td><td>${row.product}</td><td>${row.type}</td><td>${row.qty}</td><td>${row.balance}</td><td>${row.lot || row.location || "-"}</td><td>${row.history}</td></tr>`).join("") || `<tr><td colspan="7">Nenhum movimento registrado.</td></tr>`}</tbody>
      </table>
    </div>
    <div class="form-card">
      <h3>Ajuste de estoque</h3>
      <p class="muted">Ajustes manuais exigem autorizacao da Central. Entradas por QR da Central podem ser aplicadas automaticamente.</p>
      <div class="field"><label>Produto</label><select id="stock-product">${productOptions}</select></div>
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
    </div>`;
  const qrPanel = `
    <div class="form-card">
      <h3>Recebimento por QR da Central</h3>
      <p class="muted">Leia ou cole o conteudo do QR enviado pela Central Tortela para dar entrada automatica nos produtos.</p>
      <div class="field"><label>QR / codigo da remessa</label><textarea id="central-shipment-qr" rows="7" placeholder='{"type":"tortela-central-shipment","items":[{"productId":5014,"qty":10}]}'></textarea></div>
      <button class="btn primary" id="receive-central-qr" type="button">Dar entrada por QR</button>
    </div>`;
  const inventoryPanel = `
    <div class="table-wrap">
      <table><thead><tr><th>Produto</th><th>Lote</th><th>Validade</th><th>Quantidade</th><th>Situacao</th></tr></thead><tbody>${(state.stockLots || []).filter((row) => Number(row.qty || 0) > 0).map((row) => `<tr><td>${row.product}</td><td>${row.lot}</td><td>${row.expiry || "-"}</td><td>${row.qty}</td><td><span class="badge ${row.expiry && daysUntil(row.expiry) <= 30 ? "warn" : "ok"}">${row.expiry && daysUntil(row.expiry) <= 30 ? "Proximo do vencimento" : "Regular"}</span></td></tr>`).join("") || `<tr><td colspan="5">Nenhum lote aberto.</td></tr>`}</tbody></table>
    </div>
    <div class="table-wrap">
      <table><thead><tr><th>Produto</th><th>Serie</th><th>Lote</th><th>Status</th><th>Referencia</th></tr></thead><tbody>${(state.stockSerials || []).slice().reverse().map((row) => `<tr><td>${row.product}</td><td>${row.serial}</td><td>${row.lot || "-"}</td><td><span class="badge ${row.status === "Disponivel" ? "ok" : "warn"}">${row.status}</span></td><td>${row.reference || "-"}</td></tr>`).join("") || `<tr><td colspan="5">Nenhuma serie registrada.</td></tr>`}</tbody></table>
    </div>
    <div class="form-card">
      <h3>Inventario</h3>
      <div class="field"><label>Leitor de codigo de barras</label><input id="inventory-barcode" placeholder="Leia o codigo e pressione Enter" /></div>
      <div class="field"><label>Produto</label><select id="inventory-product">${productOptions}</select></div>
      <div class="field"><label>Quantidade contada</label><input id="inventory-counted" type="number" step="0.001" value="0" /></div>
      <div class="grid two"><div class="field"><label>Lote contado</label><input id="inventory-lot" /></div><div class="field"><label>Numero de serie</label><input id="inventory-serial" /></div></div>
      <div class="field"><label>Motivo</label><input id="inventory-reason" value="Contagem fisica" /></div>
      <button class="btn primary" id="save-inventory" type="button">Aplicar inventario</button>
    </div>`;
  const transferPanel = `
    <div class="table-wrap">
      <table><thead><tr><th>Deposito</th><th>Produto</th><th>Saldo</th></tr></thead><tbody>${(state.warehouseStocks || []).filter((row) => Number(row.qty || 0) !== 0).map((row) => `<tr><td>${row.warehouse}</td><td>${row.product}</td><td>${row.qty}</td></tr>`).join("") || `<tr><td colspan="3">Nenhum saldo por deposito.</td></tr>`}</tbody></table>
    </div>
    <div class="form-card">
      <h3>Transferencia interna</h3>
      <div class="field"><label>Produto</label><select id="transfer-product">${productOptions}</select></div>
      <div class="grid two">
        <div class="field"><label>Quantidade</label><input id="transfer-qty" type="number" step="0.001" value="1" /></div>
        <div class="field"><label>Origem</label><input id="transfer-from" value="Estoque principal" /></div>
        <div class="field"><label>Destino</label><input id="transfer-to" value="Loja" /></div>
      </div>
      <button class="btn primary" id="save-transfer" type="button">Registrar transferencia</button>
    </div>`;
  const saldoPanel = `
    <div class="grid">${productsTable()}</div>
    <div class="table-wrap">
      <table><thead><tr><th>Deposito</th><th>Produto</th><th>Saldo</th></tr></thead><tbody>${(state.warehouseStocks || []).filter((row) => Number(row.qty || 0) !== 0).map((row) => `<tr><td>${row.warehouse}</td><td>${row.product}</td><td>${row.qty}</td></tr>`).join("") || `<tr><td colspan="3">Nenhum saldo por deposito.</td></tr>`}</tbody></table>
    </div>`;
  const panels = {
    producao: productionPanel,
    movimento: movementPanel,
    qr: qrPanel,
    inventario: inventoryPanel,
    transferencia: transferPanel,
    saldos: saldoPanel
  };
  return `
    <section class="panel stock-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Estoque e producao</strong>
        <span>${activeStockTab[1]} da unidade, com baixa por venda, producao e ajustes autorizados</span>
        <span>${lowStock.length} item(ns) no minimo</span>
      </div>

      <div class="desktop-module-ribbon">
        ${stockRibbon.map((item) => `
          <button class="desktop-ribbon-button ${currentStockTab === item.key ? "primary" : ""}" data-stock-tab="${item.key}" type="button">
            <span class="dashboard-module-icon icon-${item.icon}" aria-hidden="true"></span>
            <strong>${item.title}</strong>
            <small>${item.text}</small>
          </button>
        `).join("")}
      </div>

      <div class="desktop-context-strip">
        ${stockTabs.map(([key, label]) => `<button class="${currentStockTab === key ? "active" : ""}" data-stock-tab="${key}" type="button">${label}</button>`).join("")}
        <span class="desktop-context-metric">${money(stockValue)} a custo</span>
      </div>

      <div class="desktop-work-area stock-work-area">
        <div class="desktop-summary-strip stock-overview">
          <div><span>Produtos</span><strong>${state.products.length}</strong></div>
          <div><span>Estoque minimo</span><strong>${lowStock.length}</strong></div>
          <div><span>Validade alerta</span><strong>${expiringLots.length}</strong></div>
          <div><span>Estoque a custo</span><strong>${money(stockValue)}</strong></div>
        </div>

        <div class="desktop-filter-panel">
          <div class="filter-caption">Rotina atual | ${activeStockTab[1]}</div>
          <p>Escolha no topo se vai produzir, movimentar estoque, receber por QR, inventariar, transferir ou consultar saldos.</p>
        </div>

        <div class="panel-body grid stock-desktop-body">
          ${panels[currentStockTab]}
        </div>
      </div>
    </section>
  `;
}

function renderPurchases() {
  const purchaseTotal = purchaseItems.reduce((sum, item) => sum + item.qty * item.cost, 0);
  const monthPurchases = state.purchases.filter((row) => String(row.date || "").slice(0, 7) === today().slice(0, 7) && row.status !== "Cancelada");
  const monthTotal = monthPurchases.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const cancelledPurchases = state.purchases.filter((row) => row.status === "Cancelada").length;
  return `
    <section class="panel purchases-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Compras</strong>
        <span>Entrada de mercadoria, XML, estoque e financeiro</span>
        <span>${monthPurchases.length} compra(s) no mes</span>
      </div>

      <div class="desktop-module-ribbon">
        <button class="desktop-ribbon-button primary" id="open-purchase-xml-ribbon" type="button">
          <span class="dashboard-module-icon icon-fiscal" aria-hidden="true"></span>
          <strong>Ler XML</strong>
          <small>Importar nota</small>
        </button>
        <button class="desktop-ribbon-button" id="add-purchase-item-ribbon" type="button">
          <span class="dashboard-module-icon icon-products" aria-hidden="true"></span>
          <strong>Adicionar item</strong>
          <small>Produto na nota</small>
        </button>
        <button class="desktop-ribbon-button" id="clear-purchase-items-ribbon" type="button">
          <span class="dashboard-module-icon icon-settings" aria-hidden="true"></span>
          <strong>Limpar itens</strong>
          <small>Recomecar nota</small>
        </button>
        <button class="desktop-ribbon-button primary" id="new-purchase-ribbon" type="button">
          <span class="dashboard-module-icon icon-purchases" aria-hidden="true"></span>
          <strong>Gravar compra</strong>
          <small>Estoque/financeiro</small>
        </button>
      </div>

      <input id="purchase-xml" type="file" accept=".xml,text/xml,application/xml" hidden />

      <div class="desktop-context-strip">
        <button class="active" data-purchase-step="document" type="button">Dados da nota</button>
        <button data-purchase-step="items" type="button">Itens da compra</button>
        <button data-purchase-step="history" type="button">Historico</button>
        <span class="desktop-context-metric">Total atual: ${money(purchaseTotal)}</span>
      </div>

      <div class="desktop-work-area purchases-work-area">
        <div class="desktop-summary-strip">
          <div><span>Itens na nota</span><strong>${purchaseItems.length}</strong></div>
          <div><span>Total atual</span><strong>${money(purchaseTotal)}</strong></div>
          <div><span>Compras no mes</span><strong>${monthPurchases.length}</strong></div>
          <div><span>Total do mes</span><strong>${money(monthTotal)}</strong></div>
          <div><span>Canceladas</span><strong>${cancelledPurchases}</strong></div>
        </div>

        <div class="desktop-filter-panel">
          <div class="filter-caption">Fluxo de compra</div>
          <p>Informe o fornecedor e documento, adicione os itens ou importe XML, depois grave para gerar estoque e financeiro conforme a opcao escolhida.</p>
        </div>

        <div class="purchases-desktop-body">
          <div class="form-card purchase-document-card" id="purchase-step-document" tabindex="-1">
            <h3>Dados da nota</h3>
            <div class="grid four">
              <div class="field"><label>Fornecedor</label><select id="purchase-supplier">${state.people.filter((p) => p.type === "Fornecedor").map((p) => `<option>${p.name}</option>`).join("")}</select></div>
              <div class="field"><label>Nota/Documento</label><input id="purchase-doc" /></div>
              <div class="field"><label>Entrada</label><input id="purchase-date" type="date" value="${today()}" /></div>
              <div class="field"><label>Vencimento</label><input id="purchase-due" type="date" value="${today()}" /></div>
              <div class="field"><label>Gerar</label><select id="purchase-generate"><option>Estoque e financeiro</option><option>Somente estoque</option><option>Somente financeiro</option></select></div>
              <div class="field"><label>Preco de venda</label><select id="purchase-price-update"><option value="keep">Manter atual</option><option value="margin">Recalcular mantendo margem</option></select></div>
              <div class="field"><label>Parcelas</label><input id="purchase-installments" type="number" min="1" value="1" /></div>
              <div class="field"><label>Intervalo parcelas</label><input id="purchase-interval" type="number" min="1" value="30" /></div>
            </div>
          </div>

          <div class="form-card purchase-items-card" id="purchase-step-items" tabindex="-1">
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
              <div class="field"><label>ICMS %</label><input id="purchase-icms" type="number" step="0.01" value="0" /></div>
              <div class="field"><label>Total da nota</label><input readonly value="${money(purchaseTotal)}" /></div>
            </div>
            <div class="actions"><button class="btn primary" id="add-purchase-item" type="button">Adicionar item</button><button class="btn danger" id="clear-purchase-items" type="button">Limpar itens</button></div>
            <div class="table-wrap">
              <table><thead><tr><th>Produto</th><th>Qtd</th><th>Custo</th><th>CFOP</th><th>CST</th><th>ICMS</th><th>Lote</th><th>Total</th><th>Acao</th></tr></thead><tbody>${purchaseItems.length ? purchaseItems.map((item, index) => `<tr><td>${item.product}</td><td>${item.qty}</td><td>${money(item.cost)}</td><td>${item.cfop || "-"}</td><td>${item.cst || "-"}</td><td>${money(item.icmsValue || 0)}</td><td>${item.lot || "-"}</td><td>${money(item.qty * item.cost)}</td><td><button class="btn danger" data-remove-purchase-item="${index}" type="button">Remover</button></td></tr>`).join("") : `<tr><td colspan="9">Nenhum item adicionado.</td></tr>`}</tbody></table>
            </div>
          </div>

          <div class="table-wrap purchase-history-card" id="purchase-step-history" tabindex="-1">
            <table><thead><tr><th>Numero</th><th>Data</th><th>Fornecedor</th><th>Documento</th><th>Itens</th><th>Total</th><th>Status</th><th>Acao</th></tr></thead><tbody>${state.purchases.map((row) => `<tr><td>${row.id}</td><td>${row.date}</td><td>${row.supplier}</td><td>${row.document || ""}</td><td>${row.items?.length || 1}</td><td>${money(row.total)}</td><td><span class="badge ${row.status === "Cancelada" ? "danger" : "ok"}">${row.status || "Confirmada"}</span></td><td>${row.status === "Cancelada" ? "-" : `<button class="btn danger" data-cancel-purchase="${row.id}">Cancelar</button>`}</td></tr>`).join("")}</tbody></table>
          </div>
        </div>
      </div>

      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command primary" id="open-purchase-xml-footer" type="button"><span>X</span>Ler XML</button>
        <button class="desktop-command" id="add-purchase-item-footer" type="button"><span>+</span>Adicionar item</button>
        <button class="desktop-command" id="clear-purchase-items-footer" type="button"><span>L</span>Limpar itens</button>
        <button class="desktop-command primary" id="new-purchase" type="button"><span>S</span>Gravar compra</button>
      </div>
    </section>
  `;
}

function renderSales() {
  const orderTotal = orderItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const monthSales = state.sales.filter((sale) => String(sale.date || "").slice(0, 7) === today().slice(0, 7));
  const openQuotes = state.sales.filter((sale) => sale.type === "Orcamento" && sale.status === "Aberto");
  const closedSales = state.sales.filter((sale) => sale.type !== "Orcamento" && !["Cancelado", "Devolvido", "Trocado"].includes(sale.status));
  const monthTotal = monthSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  return `
    <section class="panel sales-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Vendas e orcamentos</strong>
        <span>Pedido, orcamento, recebimento e acoes pos-venda</span>
        <span>${monthSales.length} lancamento(s) no mes</span>
      </div>

      <div class="desktop-module-ribbon">
        <button class="desktop-ribbon-button primary" id="add-order-item-ribbon" type="button">
          <span class="dashboard-module-icon icon-products" aria-hidden="true"></span>
          <strong>Adicionar item</strong>
          <small>Produto na venda</small>
        </button>
        <button class="desktop-ribbon-button" id="clear-order-items-ribbon" type="button">
          <span class="dashboard-module-icon icon-settings" aria-hidden="true"></span>
          <strong>Limpar itens</strong>
          <small>Recomecar venda</small>
        </button>
        <button class="desktop-ribbon-button primary" id="save-order-ribbon" type="button">
          <span class="dashboard-module-icon icon-sales" aria-hidden="true"></span>
          <strong>Salvar</strong>
          <small>Pedido/orcamento</small>
        </button>
      </div>

      <div class="desktop-context-strip">
        <button class="active" data-sales-step="order" type="button">Dados da venda</button>
        <button data-sales-step="items" type="button">Itens</button>
        <button data-sales-step="history" type="button">Historico</button>
        <span class="desktop-context-metric">Total atual: ${money(orderTotal)}</span>
      </div>

      <div class="desktop-work-area sales-work-area">
        <div class="desktop-summary-strip">
          <div><span>Itens atuais</span><strong>${orderItems.length}</strong></div>
          <div><span>Total atual</span><strong>${money(orderTotal)}</strong></div>
          <div><span>Orcamentos abertos</span><strong>${openQuotes.length}</strong></div>
          <div><span>Vendas ativas</span><strong>${closedSales.length}</strong></div>
          <div><span>Total do mes</span><strong>${money(monthTotal)}</strong></div>
        </div>

        <div class="desktop-filter-panel">
          <div class="filter-caption">Fluxo de venda</div>
          <p>Escolha cliente, tipo, pagamento e vencimento. Depois adicione itens e salve como pedido ou orcamento.</p>
        </div>

        <div class="sales-desktop-body">
          <div class="form-card sales-order-card" id="sales-step-order" tabindex="-1">
            <h3>Dados da venda</h3>
            <div class="grid four">
              <div class="field"><label>Cliente</label><select id="order-customer">${state.people.filter((p) => p.type === "Cliente").map((p) => `<option>${p.name}</option>`).join("")}</select></div>
              <div class="field"><label>Tipo</label><select id="order-type"><option>Pedido</option><option>Orcamento</option></select></div>
              <div class="field"><label>Forma de pagamento</label><select id="order-payment"><option>Dinheiro</option><option>PIX</option><option>Cartao</option><option>Boleto</option><option>Crediario</option></select></div>
              <div class="field"><label>Vencimento</label><input id="order-due" type="date" value="${today()}" /></div>
              <div class="field"><label>Total atual</label><input readonly value="${money(orderTotal)}" /></div>
            </div>
          </div>

          <div class="form-card sales-items-card" id="sales-step-items" tabindex="-1">
            <h3>Itens</h3>
            <div class="grid four">
              <div class="field"><label>Produto</label><select id="order-product">${state.products.map((p) => `<option value="${p.id}">${p.description}</option>`).join("")}</select></div>
              <div class="field"><label>Quantidade</label><input id="order-qty" type="number" step="0.001" value="1" /></div>
            </div>
            <div class="actions"><button class="btn primary" id="add-order-item" type="button">Adicionar item</button><button class="btn danger" id="clear-order-items" type="button">Limpar itens</button></div>
            <div class="table-wrap">
              <table><thead><tr><th>Produto</th><th>Qtd</th><th>Un.</th><th>Preco</th><th>Total</th><th>Acao</th></tr></thead><tbody>${orderItems.length ? orderItems.map((item, index) => `<tr><td>${escapeHtml(item.description)}${ItemPreparation.html(item)}</td><td>${item.qty}</td><td>${item.unit}</td><td>${money(item.price)}</td><td>${money(item.qty * item.price)}</td><td><button class="btn danger" data-remove-order-item="${index}">Remover</button></td></tr>`).join("") : `<tr><td colspan="6">Adicione os produtos do pedido ou orcamento.</td></tr>`}</tbody></table>
            </div>
          </div>

          <div class="table-wrap sales-history-card" id="sales-step-history" tabindex="-1">
            <table><thead><tr><th>Numero</th><th>Data</th><th>Cliente / CPF / regiao</th><th>Vendedor</th><th>Total</th><th>Comissao</th><th>Tipo</th><th>Status</th><th>Acao</th></tr></thead><tbody>${state.sales.map((sale) => `<tr><td>${sale.id}</td><td>${sale.date}</td><td>${escapeHtml(sale.customer)}<small class="muted">CPF: ${escapeHtml(sale.customerDocument||sale.clubCpf||"Nao registrado")}<br>${escapeHtml(sale.customerRegion||[sale.customerDistrict,sale.customerCity,sale.customerUf].filter(Boolean).join(" / ")||"Regiao nao registrada")}</small></td><td>${escapeHtml(sale.seller)}</td><td>${money(sale.total)}</td><td>${money(sale.commission || 0)}</td><td>${sale.type}</td><td><span class="badge ${sale.status === "Cancelado" || sale.status === "Devolvido" || sale.status === "Trocado" ? "danger" : sale.status === "Aberto" || sale.status === "Parcialmente devolvido" ? "warn" : "ok"}">${sale.status || "Fechado"}</span></td><td>${sale.type === "Orcamento" && sale.status === "Aberto" ? `<button class="btn primary" data-convert-quote="${sale.id}">Converter em pedido</button>` : ["Fechado", "Parcialmente devolvido"].includes(sale.status) ? `<button class="btn" data-return-sale="${sale.id}">Devolver</button> <button class="btn" data-exchange-sale="${sale.id}">Trocar</button> ${sale.status === "Fechado" ? `<button class="btn danger" data-cancel-sale-record="${sale.id}">Cancelar</button>` : ""}` : "-"}</td></tr>`).join("") || `<tr><td colspan="9">Nenhuma venda registrada.</td></tr>`}</tbody></table>
          </div>
        </div>
      </div>

      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command" id="add-order-item-footer" type="button"><span>+</span>Adicionar item</button>
        <button class="desktop-command" id="clear-order-items-footer" type="button"><span>L</span>Limpar itens</button>
        <button class="desktop-command primary" id="save-order" type="button"><span>S</span>Salvar pedido/orcamento</button>
      </div>
    </section>
  `;
}

function renderOnlineOrders() {
  const orders = (state.sales || []).filter((sale) => sale.onlineOrder).sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date)));
  const pending = orders.filter((sale) => !["Entregue", "Cancelado"].includes(sale.status));
  const unitLinks = onlineUnitLinks();
  const orderSource = (sale) => sale.kioskOrder ? "Totem" : sale.delivery === "Retirada" ? "Retirada online" : "Delivery online";
  const orderTicket = (sale) => sale.kioskOrder ? `Senha ${String(sale.kioskTicketNumber || sale.id).padStart(3, "0")}` : `Pedido ${sale.id}`;
  const isFinalOrderStatus = (sale) => ["Entregue", "Cancelado"].includes(sale.status);
  const orderActionButtons = (sale) => `
    <button class="btn" data-print-online-order="${sale.id}" type="button">Comprovante</button>
    ${!sale.kioskOrder && sale.status === "Aberto" ? `<button class="btn primary" data-online-status="${sale.id}" data-status="Conferido" type="button">Conferir</button>` : ""}
    ${!isFinalOrderStatus(sale) && !["Preparando", "Pronto", "Saiu para entrega"].includes(sale.status) ? `<button class="btn" data-online-status="${sale.id}" data-status="Preparando" type="button">Preparar</button>` : ""}
    ${sale.status === "Preparando" ? `<button class="btn primary" data-online-status="${sale.id}" data-status="Pronto" type="button">Pedido pronto</button>` : ""}
    ${!sale.kioskOrder && sale.status === "Pronto" && sale.delivery !== "Retirada" ? `<button class="btn" data-online-status="${sale.id}" data-status="Saiu para entrega" type="button">Saiu entrega</button>` : ""}
    ${!isFinalOrderStatus(sale) ? `<button class="btn primary" data-online-status="${sale.id}" data-status="Entregue" type="button">Entregue</button> <button class="btn danger" data-online-status="${sale.id}" data-status="Cancelado" type="button">Cancelar</button>` : ""}
  `;
  const operationalColumns = [
    ["Recebido", orders.filter((sale) => ["Aberto", "Conferido"].includes(sale.status || "Aberto"))],
    ["Preparando", orders.filter((sale) => sale.status === "Preparando")],
    ["Pronto", orders.filter((sale) => sale.status === "Pronto")],
    ["Saiu / entrega", orders.filter((sale) => ["Saiu para entrega", "Entregue"].includes(sale.status))]
  ];
  const onlineTotal = orders.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  return `
    <section class="panel online-orders-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Pedidos online / Totem</strong>
        <span>Pedidos recebidos da loja, totem, cozinha e telao</span>
        <span>${pending.length} em andamento</span>
      </div>

      <div class="desktop-module-ribbon">
        <a class="desktop-ribbon-button primary" href="./loja.html?unidade=${encodeURIComponent(state.settings.tenantCode)}" target="_blank" rel="noopener">
          <span class="dashboard-module-icon icon-sales" aria-hidden="true"></span>
          <strong>Loja online</strong>
          <small>Abrir vendas</small>
        </a>
        <a class="desktop-ribbon-button" href="${publicUnitLink("totem.html")}" target="_blank" rel="noopener">
          <span class="dashboard-module-icon icon-pdv" aria-hidden="true"></span>
          <strong>Totem</strong>
          <small>Autoatendimento</small>
        </a>
        <a class="desktop-ribbon-button" href="${publicUnitLink("cozinha")}" target="_blank" rel="noopener">
          <span class="dashboard-module-icon icon-purchases" aria-hidden="true"></span>
          <strong>Cozinha</strong>
          <small>Preparacao</small>
        </a>
        <a class="desktop-ribbon-button" href="${publicUnitLink("telao.html")}" target="_blank" rel="noopener">
          <span class="dashboard-module-icon icon-reports" aria-hidden="true"></span>
          <strong>Telao</strong>
          <small>Retirada</small>
        </a>
      </div>

      <div class="desktop-context-strip">
        <button class="active" data-online-step="board" type="button">Quadro operacional</button>
        <button data-online-step="links" type="button">Links da unidade</button>
        <button data-online-step="history" type="button">Historico</button>
        <span class="desktop-context-metric">Total online: ${money(onlineTotal)}</span>
      </div>

      <div class="desktop-work-area online-orders-work-area">
        <div class="desktop-summary-strip">
          <div><span>Em andamento</span><strong>${pending.length}</strong></div>
          <div><span>Recebidos</span><strong>${orders.filter((sale) => ["Aberto", "Conferido"].includes(sale.status || "Aberto")).length}</strong></div>
          <div><span>Em preparo</span><strong>${orders.filter((sale) => sale.status === "Preparando").length}</strong></div>
          <div><span>Prontos/entrega</span><strong>${orders.filter((sale) => ["Pronto", "Saiu para entrega"].includes(sale.status)).length}</strong></div>
          <div><span>Total online</span><strong>${money(onlineTotal)}</strong></div>
        </div>

        <div class="desktop-filter-panel">
          <div class="filter-caption">Operacao online</div>
          <p>Use o quadro para mudar status dos pedidos. Os atalhos superiores abrem as telas reais de loja, totem, cozinha e telao.</p>
        </div>

        <div class="online-board" id="online-step-board" tabindex="-1">
          ${operationalColumns.map(([label, rows]) => `
            <section class="online-lane">
              <header>
                <span>${label}</span>
                <strong>${rows.length}</strong>
              </header>
              <div class="online-lane-list">
                ${rows.slice(0, 6).map((sale) => {
                  const customer = sale.customerData || {};
                  const itemCount = (sale.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
                  return `
                    <article class="online-order-card">
                      <div>
                        <b>${orderTicket(sale)}</b>
                        <span>${orderSource(sale)}</span>
                      </div>
                      <strong>${money(sale.total || 0)}</strong>
                      <small>${sale.customer || "Consumidor"} ${customer.phone ? `· ${customer.phone}` : ""}</small>
                      <small>${itemCount} item(ns) · ${sale.payment || "PIX"} · ${sale.paymentOnline ? sale.paymentStatus || "Online" : "No caixa"}</small>
                      <div class="actions">${orderActionButtons(sale)}</div>
                    </article>
                  `;
                }).join("") || `<p class="muted">Nenhum pedido nesta etapa.</p>`}
              </div>
            </section>
          `).join("")}
        </div>

        <div class="unit-link-grid" id="online-step-links" tabindex="-1">
          ${unitLinks.map((link) => `
            <article class="unit-link-card">
              <div>
                <span class="badge ${link.secure ? "ok" : "warn"}">${link.secure ? "Com token" : "Direto"}</span>
                <h3>${link.label}</h3>
                <p>${link.description}</p>
                <input value="${escapeAttr(link.url)}" readonly />
              </div>
              <div class="actions">
                <a class="btn" href="${escapeAttr(link.url)}" target="_blank" rel="noopener">Abrir</a>
                <button class="btn primary" data-copy-public-link="${escapeAttr(link.url)}" type="button">Copiar</button>
              </div>
            </article>
          `).join("")}
        </div>

        <div class="table-wrap online-history-card" id="online-step-history" tabindex="-1">
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Endereco</th><th>Entrega</th><th>Itens</th><th>Pagamento</th><th>Total</th><th>Status</th><th>Acoes</th></tr></thead>
            <tbody>${orders.map((sale) => {
              const customer = sale.customerData || {};
              const deliveryStore = sale.deliveryStore || {};
              const items = (sale.items || []).map((item) => `${item.qty}x ${item.description}${item.coverage ? ` (${item.coverage})` : ""}`).join("<br>");
              return `<tr>
                <td>${orderTicket(sale)}<br><small>${orderSource(sale)}</small></td>
                <td>${sale.customer}<br><small>${customer.phone || ""}</small></td>
                <td>${[customer.address, customer.number, customer.district, customer.city, customer.uf].filter(Boolean).join(", ")}<br><small>${customer.cep || ""} · ${sale.delivery || "Entrega"}</small></td>
                <td>${deliveryStore.tradeName || state.settings.company || "Loja"}<br><small>${deliveryStore.distanceKm != null ? `${deliveryStore.distanceKm} km` : "-"}</small></td>
                <td>${items}</td>
                <td>${sale.payment || "PIX"}<br><small>${sale.paymentOnline ? `Online - ${sale.paymentStatus || "Pendente"}` : "No caixa"}</small></td>
                <td>${money(sale.total)}</td>
                <td><span class="badge ${sale.status === "Entregue" ? "ok" : sale.status === "Cancelado" ? "danger" : "warn"}">${sale.status || "Aberto"}</span></td>
                <td>${orderActionButtons(sale)}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="9">Nenhum pedido online recebido.</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderFinance() {
  const tabs = [
    ["receber", "A receber", "Clientes e boletos", "finance"],
    ["pagar", "A pagar", "Fornecedores", "purchases"],
    ["caixa", "Caixa", "Movimento e OFX", "pdv"],
    ["plano", "Plano de contas", "Cadastro contabil", "reports"]
  ];
  if (!tabs.some(([key]) => key === currentTab)) currentTab = "receber";
  const receivableOpen = (state.receivables || []).filter((row) => !row.paid && !row.cancelled).reduce((sum, row) => sum + financeBalance(row), 0);
  const payableOpen = (state.payables || []).filter((row) => !row.paid && !row.cancelled).reduce((sum, row) => sum + financeBalance(row), 0);
  const cashBalance = (state.cash || []).reduce((sum, row) => sum + Number(row.in || 0) - Number(row.out || 0), 0);
  const overdueCount = [...(state.receivables || []), ...(state.payables || [])].filter((row) => !row.paid && !row.cancelled && row.due < today()).length;
  const activeTab = tabs.find(([key]) => key === currentTab) || tabs[0];
  const footerAction = currentTab === "caixa"
    ? `<button class="desktop-command primary" id="save-reconciliation-footer" type="button"><span>C</span>Conciliar saldo</button><label class="desktop-command" for="import-ofx"><span>O</span>Importar OFX</label>`
    : currentTab === "plano"
      ? `<button class="desktop-command primary" id="save-account-footer" type="button"><span>S</span>${editingAccountId ? "Atualizar conta" : "Cadastrar conta"}</button>${editingAccountId ? `<button class="desktop-command" id="cancel-account-edit-footer" type="button"><span>X</span>Cancelar edicao</button>` : ""}`
      : `<button class="desktop-command primary" id="save-finance" type="button"><span>S</span>Novo lancamento</button>`;
  return `
    <section class="panel finance-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Financeiro</strong>
        <span>${activeTab[1]}: ${activeTab[2]}</span>
        <span>${overdueCount} titulo(s) atrasado(s)</span>
      </div>

      <div class="desktop-module-ribbon">
        ${tabs.map(([key, label, text, icon]) => `
          <button class="desktop-ribbon-button ${currentTab === key ? "primary" : ""}" data-tab="${key}" type="button">
            <span class="dashboard-module-icon icon-${icon}" aria-hidden="true"></span>
            <strong>${label}</strong>
            <small>${text}</small>
          </button>
        `).join("")}
      </div>

      <div class="desktop-context-strip">
        <span class="desktop-context-metric">Aberto a receber: ${money(receivableOpen)}</span>
        <span class="desktop-context-metric">Aberto a pagar: ${money(payableOpen)}</span>
        <span class="desktop-context-metric">Saldo caixa: ${money(cashBalance)}</span>
      </div>

      <div class="desktop-work-area finance-work-area">
        ${currentTab === "caixa" ? '<section class="form-card" id="unit-cash-closures"></section>' : ""}
        <div class="desktop-summary-strip">
          <div><span>A receber aberto</span><strong>${money(receivableOpen)}</strong></div>
          <div><span>A pagar aberto</span><strong>${money(payableOpen)}</strong></div>
          <div><span>Saldo caixa</span><strong>${money(cashBalance)}</strong></div>
          <div><span>Atrasados</span><strong>${overdueCount}</strong></div>
        </div>
        <div class="desktop-filter-panel">
          <div class="filter-caption">Rotina atual | ${activeTab[1]}</div>
          <p>Use os botoes superiores para trocar entre contas a receber, contas a pagar, caixa e plano de contas.</p>
        </div>
        <div class="panel-body finance-desktop-body">${financeTab()}</div>
      </div>

      <div class="desktop-action-bar erp-action-bar">
        ${footerAction}
      </div>
    </section>
  `;
}

function financeTab() {
  const rows = currentTab === "pagar" ? state.payables : currentTab === "receber" ? state.receivables : state.cash;
  const accounts = (state.chartOfAccounts || []).filter((account) => account.active !== false);
  const accountOptions = accounts.map((account) => `<option value="${account.code}">${account.code} - ${account.name}</option>`).join("");
  const editingAccount = (state.chartOfAccounts || []).find((account) => Number(account.id) === Number(editingAccountId)) || {};
  if (currentTab === "plano") {
    return `
      <div class="grid">
        <div class="form-card grid four">
          <div class="field"><label>Codigo</label><input id="account-code" value="${escapeAttr(editingAccount.code || "")}" placeholder="Ex.: 4.1.02" /></div>
          <div class="field"><label>Nome da conta</label><input id="account-name" value="${escapeAttr(editingAccount.name || "")}" /></div>
          <div class="field"><label>Tipo</label><select id="account-type">${["Ativo", "Passivo", "Receita", "Despesa", "Patrimonio"].map((type) => `<option ${editingAccount.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></div>
          <button class="btn primary" id="save-account" type="button">${editingAccountId ? "Atualizar conta" : "Cadastrar conta"}</button>
          ${editingAccountId ? `<button class="btn" id="cancel-account-edit" type="button">Cancelar edicao</button>` : ""}
        </div>
        <div class="table-wrap"><table><thead><tr><th>Codigo</th><th>Conta</th><th>Tipo</th><th>Status</th><th>Acoes</th></tr></thead><tbody>${(state.chartOfAccounts || []).map((account) => `<tr><td>${account.code}</td><td>${account.name}</td><td>${account.type}</td><td>${account.active === false ? "Inativa" : "Ativa"}</td><td><button class="btn" data-edit-account="${account.id}">Editar</button> <button class="btn ${account.active === false ? "" : "danger"}" data-toggle-account="${account.id}">${account.active === false ? "Ativar" : "Inativar"}</button></td></tr>`).join("")}</tbody></table></div>
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
        ${currentTab === "receber" ? `<div class="field"><label>Carteira boleto</label><input id="finance-wallet" value="109" /></div><div class="field"><label>Nosso numero</label><input id="finance-our-number" /></div>` : ""}
      </div>
      ${currentTab === "receber" ? `<div class="actions"><button class="btn" id="generate-remittance" type="button">Gerar remessa</button><label class="btn" for="import-return-file">Importar retorno</label><input id="import-return-file" type="file" accept=".ret,.txt,.csv,text/plain" hidden /><button class="btn" id="print-issued-bills" type="button">Boletos emitidos</button></div>` : ""}
      <div class="table-wrap"><table><thead><tr><th>Codigo</th><th>Nome</th><th>Conta</th><th>Vencimento</th><th>Valor</th><th>Pago</th><th>Saldo</th><th>Boleto</th><th>Status</th><th>Acao</th></tr></thead><tbody>${rows.map((row) => {
        const balance = financeBalance(row);
        const status = row.cancelled ? "Cancelado" : row.paid ? "Pago" : row.due < today() ? "Atrasado" : Number(row.paidValue || 0) > 0 ? "Parcial" : "Aberto";
        return `<tr><td>${row.id}</td><td>${row.supplier || row.customer || ""}</td><td>${row.accountCode || "-"}</td><td>${row.due}</td><td>${money(row.value)}</td><td>${money(row.paidValue || 0)}</td><td>${money(balance)}</td><td>${row.ourNumber || row.boletoStatus || "-"}</td><td><span class="badge ${row.cancelled ? "danger" : row.paid ? "ok" : "warn"}">${status}</span></td><td>${row.paid || row.cancelled ? "-" : `<button class="btn" data-pay="${row.id}">Baixar</button>`}</td></tr>`;
      }).join("")}</tbody></table></div>
    </div>
  `;
}

function renderFiscal() {
  // Fiscal rules are configured explicitly; opening a screen must not create client data.
  const tabs = ["nfe", "nfce", "nfse", "cte", "cteos", "mdfe", "sat", "mfe", "sped", "sintegra", "fila"];
  if (!tabs.includes(currentFiscalTab)) currentFiscalTab = "fila";
  const availableTabs = tabs.filter((tab) => tab === "fila" || contractedFiscalModule(tab));
  if (!availableTabs.includes(currentFiscalTab)) currentFiscalTab = availableTabs[0] || "fila";
  const filteredRows = currentFiscalTab === "fila" ? state.fiscalQueue : state.fiscalQueue.filter((row) => row.model.toLowerCase().replace("-", "") === currentFiscalTab);
  const rules = state.fiscalRules || [];
  const serviceRules = rules.filter((rule) => rule.active !== false && rule.model === "NFS-e" && rule.regime === state.settings.regime);
  const currentModel = fiscalTabModel(currentFiscalTab);
  const pendingRows = state.fiscalQueue.filter((row) => !["Autorizada", "Cancelada"].includes(row.status));
  const authorizedRows = state.fiscalQueue.filter((row) => row.status === "Autorizada");
  const fiscalTabLabels = { nfe: "NF-e", nfce: "NFC-e", nfse: "NFS-e", cte: "CT-e", cteos: "CT-e OS", mdfe: "MDF-e", sat: "SAT", mfe: "MF-e", sped: "SPED", sintegra: "Sintegra", fila: "Fila" };
  return `
    <section class="panel fiscal-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Fiscal</strong>
        <span>${fiscalTabLabels[currentFiscalTab] || currentModel}: emissao, consulta, XML e PDF</span>
        <span>${pendingRows.length} pendente(s)</span>
      </div>

      <div class="desktop-module-ribbon">
        ${availableTabs.map((tab) => `
          <button class="desktop-ribbon-button ${currentFiscalTab === tab ? "primary" : ""}" data-fiscal-tab="${tab}" type="button" aria-current="${currentFiscalTab === tab ? "page" : "false"}">
            <span class="dashboard-module-icon icon-fiscal" aria-hidden="true"></span>
            <strong>${fiscalTabLabels[tab] || tab.toUpperCase()}</strong>
            <small>${tab === "fila" ? "Pendencias" : "Documento fiscal"}</small>
          </button>
        `).join("")}
      </div>

      <input id="fiscal-import-xml" type="file" accept=".xml,text/xml,application/xml" hidden />

      <div class="card">
        <h3>Conferência tributária</h3><p>Empresa: ${escapeHtml(state.settings.company)}. Regime: ${escapeHtml(state.settings.regime)}. CRT: ${escapeHtml(window.TortelaFiscalRegimes.profile(state.settings).crt)}. ${window.TortelaFiscalRegimes.profile(state.settings).icmsSimple?"CSOSN":"CST ICMS"} com suporte neste emissor: ${window.TortelaFiscalRegimes.profile(state.settings).icmsCodes.join(", ")}. As regras são específicas desta empresa; modalidades especiais dependem de suporte e homologação próprios.</p>
        <p>${window.TortelaFiscalRegimes.profile(state.settings).federalSimple ? "Simples Nacional/MEI: a política de informação considera regime e ano; a ativação de cada rejeição da SEFAZ é controlada separadamente pela nota técnica. Em 2026, este emissor permite informar IBS/CBS quando aplicável sem confundir a obrigação legal com uma rejeição futura." : "Regime regular: conferir IBS estadual, IBS municipal e CBS conforme o ano da emissão e a classificação do produto."}</p>
        <p>Produtos ativos com NCM ausente ou zerado: <strong>${state.products.filter(p => p.active !== false && (!/^\d{8}$/.test(String(p.ncm || "")) || /^0+$/.test(String(p.ncm || "")))).length}</strong>. A emissão fiscal desses produtos fica bloqueada até a correção.</p>
        <p>Produtos ativos com classificação IBS/CBS incompleta: <strong>${state.products.filter(p => p.active !== false && (!/^\d{3}$/.test(String(p.reform?.cst || p.ibsCbsCst || "")) || !/^\d{6}$/.test(String(p.reform?.classTrib || p.ibsClass || "")))).length}</strong>. Confirme o enquadramento com o responsável fiscal antes da vigência aplicável.</p>
        <p>Tabela de classificações: ${escapeHtml(state.reformTaxTables?.version || "Não informada")}. A emissão real também exige certificado, CSC e credenciamento na SEFAZ. NT 2025.002 v1.52: novas referências por item e preços líquidos seguem as datas do ambiente (homologação 26/10/2026; produção 16/11/2026).</p>
      </div>

      <div class="desktop-context-strip fiscal-context-strip">
        <button class="active" data-fiscal-step="form" type="button">Documento</button>
        <button data-fiscal-step="rules" type="button">Regras fiscais</button>
        <button data-fiscal-step="queue" type="button">Fila fiscal</button>
        <span class="desktop-context-metric">Autorizadas: ${authorizedRows.length}</span>
      </div>

      <div class="desktop-work-area fiscal-work-area">
        <div class="desktop-summary-strip">
          <div><span>Fila total</span><strong>${state.fiscalQueue.length}</strong></div>
          <div><span>Pendentes</span><strong>${pendingRows.length}</strong></div>
          <div><span>Autorizadas</span><strong>${authorizedRows.length}</strong></div>
          <div><span>Regras ativas</span><strong>${rules.filter((rule) => rule.active).length}</strong></div>
        </div>
        <div class="fiscal-note">
          Ambiente ${state.settings.fiscalEnvironment}. NF-e/NFC-e usam fluxo de mercadoria. NFS-e fica em tela separada porque depende de municipio, item de servico, ISS, NBS e padrao nacional/municipal vigente.
        </div>
        <div class="fiscal-desktop-body">
        <div class="form-card" id="fiscal-step-rules" tabindex="-1">
          <h3>Regras fiscais ativas</h3>
          <div class="table-wrap">
            <table><thead><tr><th>Regra</th><th>Regime</th><th>UF</th><th>Modelo</th><th>CFOP</th><th>Servico</th><th>Municipio</th><th>ISS/ICMS</th><th>IBS</th><th>CBS</th></tr></thead>
            <tbody>${rules.filter((rule) => rule.active).map((rule) => `<tr><td>${rule.name}</td><td>${rule.regime}</td><td>${rule.uf}</td><td>${rule.model}</td><td>${rule.cfop}</td><td>${rule.serviceCode || "-"}</td><td>${rule.municipio || "-"}</td><td>${rule.model === "NFS-e" ? pct(rule.issRate) : pct(rule.icmsRate)}</td><td>${rule.ibsClass}</td><td>${rule.cbsClass}</td></tr>`).join("")}</tbody></table>
          </div>
        </div>
        <div id="fiscal-step-form" tabindex="-1">
        ${currentFiscalTab === "nfse" ? renderNfseIssueForm(serviceRules) : advancedFiscalTabs().includes(currentFiscalTab) ? renderAdvancedFiscalForm(currentModel) : `
        <div class="form-card grid four">
          <div class="field"><label>Modelo</label><input id="fiscal-model" value="${currentModel}" readonly /></div>
          <div class="field"><label>Venda de origem</label><select id="fiscal-sale-id"><option value="">Selecione uma venda fechada</option>${state.sales.filter((sale) => ["Fechado", "Parcialmente devolvido"].includes(sale.status) && Array.isArray(sale.items) && sale.items.length).map((sale) => `<option value="${sale.id}">${sale.id} - ${escapeAttr(sale.customer)} - ${money(sale.total)}</option>`).join("")}</select></div>
          <div class="field"><label>Serie</label><input id="fiscal-serie" value="${escapeAttr(state.settings.nfeSerie || '1')}" /></div>
          <div class="field"><label>Natureza da operacao</label><input id="fiscal-nature" value="Venda de mercadoria" /></div>
          <div class="field"><label>Cliente/Tomador</label><input id="fiscal-customer" value="Consumidor Final" /></div>
          <div class="field"><label>Total</label><input id="fiscal-total" type="number" step="0.01" value="0" /></div>
          <div class="field"><label>Ambiente</label><input value="${state.settings.fiscalEnvironment}" readonly /></div>
        </div>${renderRtcDocumentFields()}
        `}
        </div>
        <div class="table-wrap fiscal-queue-card" id="fiscal-step-queue" tabindex="-1">
          <table>
            <thead><tr><th>Numero</th><th>Modelo</th><th>Status</th><th>Cliente</th><th>Total</th><th>Tentativas</th><th>Ultimo erro</th><th>Chave</th><th>Protocolo</th><th>Acoes</th></tr></thead>
            <tbody>${filteredRows.map((row) => `<tr><td>${row.id}</td><td>${row.model}</td><td><span class="badge ${row.status === "Autorizada" ? "ok" : row.status === "Cancelada" ? "danger" : "warn"}">${row.status}</span></td><td>${row.customer}</td><td>${money(row.total)}</td><td>${row.attempts || 0}</td><td>${row.lastFiscalError || "-"}</td><td>${row.key || "-"}</td><td>${row.protocol || "-"}</td><td>${row.taxSummary?`<button class="btn" data-fiscal-tax-summary="${row.id}">Conferir impostos</button> `:""}<button class="btn" data-fiscal-transmit="${row.id}">Transmitir</button> <button class="btn" data-fiscal-query="${row.id}">Consultar</button> <button class="btn" data-fiscal-print="${row.id}">${row.model === "NFS-e" ? "DANFSe" : row.model === "NFC-e" ? "DANFCE" : "DANFE"}</button> ${row.pdfUrl ? `<button class="btn" data-fiscal-pdf="${row.id}">Baixar PDF</button>` : ""} <button class="btn" data-fiscal-xml="${row.id}">XML</button> ${row.model === "NF-e" ? `<button class="btn" data-fiscal-cce="${row.id}">CC-e</button>` : ""} ${row.model === "NFC-e" ? `<button class="btn" data-fiscal-contingency="${row.id}">Contingencia</button>` : ""} <button class="btn danger" data-fiscal-cancel="${row.id}">Cancelar</button></td></tr>`).join("") || `<tr><td colspan="10">Nenhum documento encontrado para ${currentFiscalTab === "fila" ? "a fila fiscal" : currentModel}. Use o formulario acima para gerar um documento ou importe um XML.</td></tr>`}</tbody>
          </table>
        </div>
        </div>
      </div>
      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command" id="retry-fiscal-queue" type="button"><span>R</span>Reprocessar</button>
        <button class="desktop-command" id="fiscal-distribution" type="button"><span>D</span>Buscar DF-e</button>
        <button class="desktop-command" id="fiscal-manifest-key" type="button"><span>M</span>Manifestar</button>
        <button class="desktop-command" id="fiscal-inutilize" type="button"><span>I</span>Inutilizar</button>
        <button class="desktop-command" id="fiscal-export-batch" type="button"><span>X</span>Lote XML</button>
        <button class="desktop-command" id="fiscal-pdf-batch" type="button"><span>P</span>Lote PDF</button>
        <label class="desktop-command" for="fiscal-import-xml"><span>U</span>Importar XML</label>
        ${currentFiscalTab === "nfse" ? `<button class="desktop-command primary" id="issue-nfse" type="button"><span>S</span>Emitir NFS-e</button>` : `<button class="desktop-command primary" id="new-fiscal" type="button"><span>G</span>Gerar documento</button>`}
      </div>
    </section>
  `;
}

function contractedFiscalModule(tab) {
  const tenant = getCurrentTenant();
  const contracted = tenant?.modules || ["NF-e", "NFC-e", "NFS-e", "CTe", "CTe-OS", "MDFe", "SAT", "MFe", "SPED", "Sintegra"];
  const map = { nfe: "NF-e", nfce: "NFC-e", nfse: "NFS-e", cte: "CTe", cteos: "CTe-OS", mdfe: "MDFe", sat: "SAT", mfe: "MFe", sped: "SPED", sintegra: "Sintegra" };
  return contracted.includes(map[tab]);
}

function advancedFiscalTabs() {
  return ["cte", "cteos", "mdfe", "sat", "mfe", "sped", "sintegra"];
}

function fiscalTabModel(tab) {
  return ({ nfe: "NF-e", nfce: "NFC-e", nfse: "NFS-e", cte: "CTe", cteos: "CTe-OS", mdfe: "MDFe", sat: "SAT", mfe: "MFe", sped: "SPED", sintegra: "Sintegra" }[tab] || "NFC-e");
}

function selectFiscalTab(tab) {
  currentFiscalTab = tab || "fila";
  setInternalRoute({ module: "fiscal", fiscal: currentFiscalTab });
  renderShell();
}

window.selectFiscalTab = selectFiscalTab;

function renderSpecialFiscalFlows(){
 if(fiscalTabModel(currentFiscalTab)!=='NF-e')return '';
 return `<details class="card"><summary>Notas de ajuste, transferência, estorno e ZFM</summary><p>Documentos escriturais independentes de venda. Não geram cobrança ou movimentação automática de estoque. ZFM tipo 02 somente a partir de 2029.</p><div class="grid four">
 <div class="field"><label>Operação / cClassTrib</label><select id="special-operation"><option value="800001">800001 — Fusão, cisão ou incorporação</option><option value="800002">800002 — Crédito de associado/cooperativa</option><option value="811001">811001 — Anulação por saída imune/isenta</option><option value="811002">811002 — Nota não processada na apuração</option><option value="811003">811003 — Desenquadramento do Simples</option><option value="810001">810001 — Crédito presumido IBS ZFM</option><option value="410030">410030 — Estorno por perda</option><option value="620007">620007 — Perda no regime monofásico</option></select></div>
 <div class="field"><label>CNPJ destinatário cadastrado (ZFM: próprio CNPJ)</label><input id="special-recipient" maxlength="18" /></div><div class="field"><label>CFOP da operação escritural</label><input id="special-cfop" maxlength="4" /></div><div class="field"><label>Competência</label><input id="special-period" type="month" /></div>
 <div class="field"><label>Valor IBS (transferência/ajuste)</label><input id="special-ibs" type="number" min="0" step="0.01" value="0" /></div><div class="field"><label>Valor CBS (transferência/ajuste)</label><input id="special-cbs" type="number" min="0" step="0.01" value="0" /></div>
 <div class="field"><label>Crédito IBS a estornar</label><input id="special-ibs-reversal" type="number" min="0" step="0.01" value="0" /></div><div class="field"><label>Crédito CBS a estornar</label><input id="special-cbs-reversal" type="number" min="0" step="0.01" value="0" /></div>
 <div class="field"><label>Saldo devedor ZFM</label><input id="special-zfm-balance" type="number" min="0" step="0.01" /></div><div class="field"><label>Classificação ZFM</label><select id="special-zfm-type"><option value="1">Consumo final — 55%</option><option value="2">Bens de capital — 75%</option><option value="3">Bens intermediários — 90,25%</option><option value="4">Informática/outros legais — 100%</option></select></div>
 <div class="field"><label>Inscrição SUFRAMA</label><input id="special-suframa" /></div><div class="field"><label>Chave original (quando aplicável)</label><input id="special-reference" maxlength="44" /></div><div class="field"><label>Motivo da perda</label><input id="special-loss-reason" /></div><div class="field"><label>Fundamento/enquadramento legal</label><input id="special-basis" /></div>
 </div><button class="btn" id="create-special-fiscal" type="button">Conferir e criar nota escritural</button></details>
 <details class="card"><summary>Créditos e manifestações — eventos RTC</summary><p>Importe previamente o XML autorizado ou informe o número da nota própria autorizada. Registrar a solicitação não significa crédito aprovado na apuração. Bases e percentuais aplicam-se ao 211110; para quitação, informe o item/código e o comprovante. Aceites usam somente a declaração e o fundamento.</p><div class="grid four">
 <div class="field"><label>Evento RTC</label><select id="credit-event-type"><option value="211110">211110 — Crédito presumido</option><option value="112110">112110 — Declaração de quitação integral</option><option value="211128">211128 — Aceite de débito da nota de crédito</option><option value="212110">212110 — Manifestação de sucessora IBS</option><option value="212120">212120 — Manifestação de sucessora CBS</option></select></div><div class="field"><label>Declaração / aceite (eventos complementares)</label><select id="credit-event-accepted"><option value="">Selecione</option><option value="true">Confirmo / aceito</option><option value="false">Não aceito (quando permitido)</option></select></div><div class="field"><label>Referência do comprovante de quitação</label><input id="credit-event-proof" /></div><div class="field"><label>Chave do XML importado</label><input id="credit-event-key" maxlength="44" /></div><div class="field"><label>Número interno da nota própria (alternativo)</label><input id="credit-event-id" type="number" min="1" /></div><div class="field"><label>Autor</label><select id="credit-event-author"><option value="2">Destinatário — apropriação</option><option value="1">Emitente — correção</option></select></div><div class="field"><label>Fundamento e motivo</label><input id="credit-event-basis" /></div>
 </div>${[0,1,2].map(i=>`<div class="grid four"><div class="field"><label>Item original ${i+1} (deixe vazio se não usar)</label><input id="credit-item-${i}" type="number" min="1" max="990" /></div><div class="field"><label>cCredPres</label><input id="credit-code-${i}" maxlength="2" /></div><div class="field"><label>Base de crédito</label><input id="credit-base-${i}" type="number" min="0" step="0.01" /></div><div class="field"><label>Crédito IBS</label><select id="credit-ibs-enabled-${i}"><option value="false">Não</option><option value="true">Sim</option></select><input id="credit-ibs-rate-${i}" aria-label="Percentual crédito IBS" type="number" min="0" max="100" step="0.0001" /></div><div class="field"><label>Crédito CBS</label><select id="credit-cbs-enabled-${i}"><option value="false">Não</option><option value="true">Sim</option></select><input id="credit-cbs-rate-${i}" aria-label="Percentual crédito CBS" type="number" min="0" max="100" step="0.0001" /></div></div>`).join('')}
 <button class="btn" id="preview-credit-event" type="button">Conferir evento sem transmitir</button> <button class="btn" id="send-credit-event" type="button">Enviar solicitação à SEFAZ</button></details>`;
}
async function createSpecialFiscalNote(){
 const code=byId('special-operation').value,types={'800001':[6,'05'],'800002':[6,'01'],'811001':[6,'02'],'811002':[6,'03'],'811003':[6,'08'],'810001':[5,'02'],'410030':[6,'07'],'620007':[6,'07']},[purpose,type]=types[code];
 const document=code==='810001'?digits(state.settings.document):digits(byId('special-recipient').value),person=state.people.find(p=>digits(p.document)===document)||{};
 const adjustment={ibs:num('special-ibs'),cbs:num('special-cbs'),ibsReversal:num('special-ibs-reversal'),cbsReversal:num('special-cbs-reversal'),period:byId('special-period').value,zfmBalance:num('special-zfm-balance'),zfmType:Number(byId('special-zfm-type').value),suframa:byId('special-suframa').value,legalBasis:byId('special-basis').value,lossReason:byId('special-loss-reason').value};
 const row={id:nextId(state.fiscalQueue),model:'NF-e',purpose,debitType:purpose===6?type:undefined,creditType:purpose===5?type:undefined,includeIbsCbs:true,serie:byId('fiscal-serie')?.value||'1',nature:'Ajuste ou transferencia IBS/CBS',customer:person.name||state.settings.company,customerDocument:document,total:0,payments:[],status:'Pendente',issuedAt:new Date().toISOString(),referencedKey:digits(byId('special-reference').value),items:[{id:'RTC-'+code,description:'Registro escritural '+code,qty:1,price:0,ncm:'00',cfop:digits(byId('special-cfop').value),ibsCbsCst:code.slice(0,3),ibsClass:code,cbsClass:code,rtcAdjustment:adjustment}]};
 try{const preview=await previewFiscalRecord(row);row.xml=preview.xml;row.taxSummary=preview.taxSummary;row.rtcRelease=preview.release;state.fiscalQueue.push(row);audit('Nota escritural criada',code);save();renderShell();}catch(e){alert(e.message);}
}
function readCreditEvent(){return {type:byId('credit-event-type').value,accepted:byId('credit-event-accepted').value===''?undefined:byId('credit-event-accepted').value==='true',paymentProof:byId('credit-event-proof').value,id:Number(byId('credit-event-id').value)||undefined,key:digits(byId('credit-event-key').value),author:Number(byId('credit-event-author').value),correction:byId('credit-event-author').value==='1',legalBasis:byId('credit-event-basis').value,credits:[0,1,2].filter(i=>byId('credit-item-'+i).value!=='').map(i=>({item:Number(byId('credit-item-'+i).value),code:byId('credit-code-'+i).value,base:num('credit-base-'+i),ibsEnabled:byId('credit-ibs-enabled-'+i).value==='true',cbsEnabled:byId('credit-cbs-enabled-'+i).value==='true',ibsRate:num('credit-ibs-rate-'+i),cbsRate:num('credit-cbs-rate-'+i)}))};}
async function runCreditEvent(send){
 try{const body=readCreditEvent(),base=`/api/tenant/${state.settings.tenantCode}/fiscal/`,preview=await api(base+'credit-event/preview',{method:'POST',body:JSON.stringify(body)});
 if(!send){alert(`Evento conferido. IBS: ${money(preview.summary.ibs)}; CBS: ${money(preview.summary.cbs)}. Nenhuma transmissão realizada.`);return;}
 const result=await api(base+'event',{method:'POST',body:JSON.stringify(body)});alert('Solicitação registrada na SEFAZ. Protocolo: '+result.event.protocol+'. A aprovação do crédito depende da apuração fiscal.');
 }catch(e){alert(e.message);}
}

function renderRtcDocumentFields() {
  return `<div class="card"><h3>Reforma tributária - documento</h3><p>NT 2025.002 v1.52 e NT 2026.008. A data e o ambiente controlam os campos ativos. Notas escriturais e solicitações de crédito possuem formulários próprios abaixo.</p><div class="grid four">
    <div class="field"><label>Finalidade</label><select id="rtc-purpose"><option value="1">Venda normal</option><option value="4">Devolução NF-e</option></select></div>
    <div class="field"><label>Preços líquidos NT 2026.008</label><select id="rtc-net-prices"><option value="false">Não incluir campos opcionais</option><option value="true">Incluir (exige esquema oficial compatível)</option></select></div><div class="field"><label>IBS/CBS</label><select id="rtc-include"><option value="auto">Conforme regime e vigência</option><option value="true">Informar grupo IBS/CBS</option></select></div>
    <div class="field"><label>Chave da nota original (devolução)</label><input id="rtc-original-key" maxlength="44" /></div>
    <div class="field"><label>CFOP de entrada da devolução</label><input id="rtc-return-cfop" maxlength="4" /></div><div class="field"><label>Itens originais, na ordem dos itens devolvidos</label><input id="rtc-original-items" placeholder="Ex.: 1, 3" /></div>
    <div class="field"><label>ID da transação vinculada (opcional)</label><input id="rtc-payment-id" maxlength="35" /></div>
    <div class="field"><label>Meio de pagamento do vínculo</label><select id="rtc-payment-method"><option value="17">PIX</option><option value="18">TED</option><option value="20">PIX chave/estático</option><option value="23">PIX automático</option><option value="24">TEF/booktransfer</option><option value="15">Boleto</option></select></div>
    <div class="field"><label>CNPJ do recebedor</label><input id="rtc-payment-receiver" maxlength="14" /></div>
    <div class="field"><label>CNPJ base do prestador de pagamento (8 dígitos)</label><input id="rtc-payment-psp" maxlength="8" /></div>
    <div class="field"><label>Devolver IPI da nota original</label><select id="rtc-ipi-return"><option value="false">Não</option><option value="true">Sim</option></select></div>
    <div class="field"><label>Quantidades originais por item (separador ;)</label><input id="rtc-ipi-original-qty" /></div><div class="field"><label>IPI total original por item (separador ; e decimal com ponto)</label><input id="rtc-ipi-original-values" /></div><div class="field"><label>Preço dos itens devolvidos</label><select id="rtc-ipi-price-mode"><option value="">Selecione quando devolver IPI</option><option value="included">Já contém o IPI original</option><option value="added">IPI será somado ao valor dos produtos</option></select></div>
    </div><p>vItem e totais são calculados e conferidos pelo servidor. Preços líquidos e split payment dependem também da atualização dos esquemas oficiais do agente fiscal. Vínculo de pagamento não é comprovante de liquidação e não será enviado em produção em 2026.</p></div>${renderSpecialFiscalFlows()}`;
}
function readRtcDocumentFields(items) {
  const purpose=Number(byId("rtc-purpose")?.value||1),key=digits(byId("rtc-original-key")?.value||"");
  const map=String(byId("rtc-original-items")?.value||"").split(",").map(v=>Number(v.trim()));
  const linkId=byId("rtc-payment-id")?.value.trim();
  const returnIpi=byId('rtc-ipi-return')?.value==='true',originalQty=String(byId('rtc-ipi-original-qty')?.value||'').split(';'),originalIpi=String(byId('rtc-ipi-original-values')?.value||'').split(';');
  return {purpose,useNetPriceFields:byId("rtc-net-prices")?.value==='true',operationType:purpose===4?"return":"sale",includeIbsCbs:byId("rtc-include")?.value==='true',referencedKey:key,
    items:purpose===4?items.map((item,index)=>({...item,referencedKey:key,referencedItem:map[index],cfop:digits(byId("rtc-return-cfop")?.value),...(returnIpi?{ipi:{enabled:false},ipiRate:0,ipiReturn:{enabled:true,originalQuantity:originalQty[index],originalIpiValue:originalIpi[index],priceMode:byId("rtc-ipi-price-mode").value}}:{})})):items,
    paymentLinks:linkId?[{idTransacao:linkId,tpMeioPgto:byId("rtc-payment-method").value,CNPJReceb:digits(byId("rtc-payment-receiver").value),CNPJBasePSP:digits(byId("rtc-payment-psp").value)}]:[]};
}
async function previewFiscalRecord(row) {
  if(!apiOnline || !sessionId)throw Error("Conferência fiscal exige conexão com o servidor da unidade.");
  return api(`/api/tenant/${state.settings.tenantCode}/fiscal/preview`,{method:"POST",body:JSON.stringify({document:row})});
}

function renderAdvancedFiscalForm(model) {
  const isTransport = ["CTe", "CTe-OS", "MDFe"].includes(model);
  const isFile = ["SPED", "Sintegra"].includes(model);
  return `
    <div class="form-card">
      <h3>${model}</h3>
      <div class="grid four">
        <div class="field"><label>Modelo</label><input id="fiscal-model" value="${model}" readonly /></div>
        <div class="field"><label>Serie</label><input id="fiscal-serie" value="${escapeAttr(state.settings.nfeSerie || '1')}" /></div>
        <div class="field"><label>Natureza/Finalidade</label><input id="fiscal-nature" value="${isFile ? "Arquivo fiscal" : isTransport ? "Transporte" : "Venda fiscal"}" /></div>
        <div class="field"><label>Cliente/Tomador</label><input id="fiscal-customer" value="Consumidor Final" /></div>
        <div class="field"><label>Total</label><input id="fiscal-total" type="number" step="0.01" value="0" /></div>
        <div class="field"><label>CFOP</label><input id="fiscal-cfop-advanced" value="${isTransport ? "5353" : "5102"}" /></div>
        <div class="field"><label>Chave referenciada</label><input id="fiscal-ref-key" /></div>
        <div class="field"><label>Periodo inicial</label><input id="fiscal-period-from" type="date" value="${reportPeriod.from || today().slice(0, 8) + "01"}" /></div>
        <div class="field"><label>Periodo final</label><input id="fiscal-period-to" type="date" value="${reportPeriod.to || today()}" /></div>
        <div class="field"><label>UF origem</label><input id="fiscal-origin-uf" value="${state.settings.uf || "SP"}" maxlength="2" /></div>
        <div class="field"><label>UF destino</label><input id="fiscal-dest-uf" value="${state.settings.uf || "SP"}" maxlength="2" /></div>
        <div class="field"><label>Placa/veiculo</label><input id="fiscal-vehicle" /></div>
        <div class="field"><label>RNTRC</label><input id="fiscal-rntrc" /></div>
        <div class="field"><label>Motorista</label><select id="fiscal-driver"><option value="">Nao informado</option>${state.people.filter((person) => ["Motorista", "Entregador", "Funcionario"].includes(person.type)).map((person) => `<option>${escapeHtml(person.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Transportadora</label><select id="fiscal-carrier"><option value="">Nao informado</option>${state.people.filter((person) => ["Transportadora", "Fornecedor", "Parceiro"].includes(person.type)).map((person) => `<option>${escapeHtml(person.name)}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label>Observacoes fiscais</label><textarea id="fiscal-advanced-notes" rows="3">${isFile ? "Arquivo gerado a partir das vendas, compras, estoque e documentos fiscais do periodo." : ""}</textarea></div>
      <div class="fiscal-note">${model} fica registrado na fila fiscal para transmissao/geracao pelo agente fiscal homologado. SPED/Sintegra geram arquivo do periodo fiscal.</div>
    </div>
  `;
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
        <div class="field"><label>Tributação nacional (6 dígitos)</label><input id="nfse-national-code" maxlength="6" /></div>
        <div class="field"><label>IBS/CBS no serviço</label><select id="nfse-include-rtc"><option value="false">Conforme regime e vigência</option><option value="true">Informar IBS/CBS</option></select></div><div class="field"><label>CST IBS/CBS do serviço</label><input id="nfse-rtc-cst" maxlength="3" /></div>
        <div class="field"><label>cClassTrib do serviço</label><input id="nfse-rtc-class" maxlength="6" /></div>
        <div class="field"><label>Diferimento IBS UF %</label><input id="nfse-uf-deferral" type="number" min="0" max="100" step="0.01" value="0" /></div><div class="field"><label>Diferimento IBS municipal %</label><input id="nfse-city-deferral" type="number" min="0" max="100" step="0.01" value="0" /></div><div class="field"><label>Diferimento CBS %</label><input id="nfse-cbs-deferral" type="number" min="0" max="100" step="0.01" value="0" /></div><div class="field"><label>Indicador da operação cIndOp</label><input id="nfse-rtc-operation" maxlength="6" /></div>
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
    ["Conciliacao", "Movimentos bancarios importados por OFX e conciliacao."],
    ["Curva ABC", "Produtos por representatividade de venda no periodo."],
    ["Lucratividade", "Margem por produto vendido usando custo cadastrado."],
    ["Clientes", "Consumo por cliente, recorrencia e inatividade."],
    ["Mesas e Delivery", "Vendas por mesa, delivery, retirada e balcao."]
  ];
  const currentReport = reportTitle();
  return `
    <section class="panel reports-screen desktop-module-screen">
      <div class="desktop-module-titlebar">
        <strong>Relatorios</strong>
        <span>${currentReport}</span>
        <span>${reportPeriod.from} a ${reportPeriod.to}</span>
      </div>

      <div class="desktop-module-ribbon reports-ribbon">
        ${groups.map(([title, text]) => `
          <button class="desktop-ribbon-button ${currentTab === title ? "primary" : ""}" data-report="${title}" type="button">
            <span class="dashboard-module-icon icon-reports" aria-hidden="true"></span>
            <strong>${title}</strong>
            <small>${text.split(",")[0]}</small>
          </button>
        `).join("")}
      </div>

      <div class="desktop-context-strip reports-context-strip">
        <button class="active" data-report-step="period" type="button">Periodo</button>
        <button data-report-step="preview" type="button">Previa</button>
        <button data-report-step="audit" type="button">Auditoria</button>
        <span class="desktop-context-metric">${currentReport}</span>
      </div>

      <div class="desktop-work-area reports-work-area">
        <div class="desktop-summary-strip">
          <div><span>Vendas</span><strong>${money(salesTotal)}</strong></div>
          <div><span>Estoque a custo</span><strong>${money(stockCost)}</strong></div>
          <div><span>A receber aberto</span><strong>${money(receivableOpen)}</strong></div>
          <div><span>A pagar aberto</span><strong>${money(payableOpen)}</strong></div>
        </div>

        <div class="form-card grid four report-period-card" id="report-step-period" tabindex="-1">
          <div class="field"><label>Periodo inicial</label><input id="report-from" type="date" value="${reportPeriod.from}" /></div>
          <div class="field"><label>Periodo final</label><input id="report-to" type="date" value="${reportPeriod.to}" /></div>
          <button class="btn primary" id="apply-report-period" type="button">Aplicar periodo</button>
        </div>

        <div class="form-card report-preview-card" id="report-step-preview" tabindex="-1">
          <h3>${currentReport}</h3>
          ${reportTable()}
        </div>

        <div class="form-card report-audit-card" id="report-step-audit" tabindex="-1">
          <h3>Auditoria recente</h3>
          <div class="table-wrap"><table><thead><tr><th>Data</th><th>Usuario</th><th>Acao</th><th>Detalhe</th></tr></thead><tbody>${(state.auditLogs || []).slice(0, 12).map((log) => `<tr><td>${new Date(log.date).toLocaleString("pt-BR")}</td><td>${log.user}</td><td>${log.action}</td><td>${log.detail}</td></tr>`).join("")}</tbody></table></div>
        </div>
      </div>

      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command" id="apply-report-period-footer" type="button"><span>A</span>Aplicar periodo</button>
        <button class="desktop-command" id="print-report" type="button"><span>P</span>Imprimir / PDF</button>
        <button class="desktop-command primary" id="export-report" type="button"><span>C</span>Exportar CSV</button>
      </div>
    </section>
  `;
}

function reportTitle() {
  return ["Produtos", "Estoque", "Vendas", "Financeiro", "Fiscal", "Compras", "Producao", "Caixa", "Ticket Medio", "Operacao", "Rastreabilidade", "Depositos", "Devolucoes", "Conciliacao", "Curva ABC", "Lucratividade", "Clientes", "Mesas e Delivery"].includes(currentTab) ? `Relatorio - ${currentTab}` : "Resumo operacional";
}

function reportRows(rows, dateField = "date") {
  return (rows || []).filter((row) => {
    const value = String(row[dateField] || row.date || row.due || row.issuedAt || "").slice(0, 10);
    return !value || ((!reportPeriod.from || value >= reportPeriod.from) && (!reportPeriod.to || value <= reportPeriod.to));
  });
}

function readInternalRoute() {
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return {};
  return Object.fromEntries(new URLSearchParams(rawHash));
}

function applyInternalRoute() {
  const route = readInternalRoute();
  if (route.mode === "pdv") {
    currentMode = "pdv";
    return;
  }
  if (route.module && Object.prototype.hasOwnProperty.call({
    dashboard: 1,
    people: 1,
    products: 1,
    stock: 1,
    purchases: 1,
    sales: 1,
    online: 1,
    finance: 1,
    fiscal: 1,
    reports: 1,
    settings: 1
  }, route.module)) {
    currentMode = "backoffice";
    currentModule = route.module;
  }
  if (route.tab) currentTab = route.tab;
  if (route.fiscal) currentFiscalTab = route.fiscal;
  if (route.stock) currentStockTab = route.stock;
  if (route.people) currentPeopleTab = route.people;
  if (route.settings) currentSettingsTab = route.settings;
}

function setInternalRoute(values) {
  const route = new URLSearchParams(readInternalRoute());
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") route.delete(key);
    else route.set(key, value);
  });
  const nextHash = `#${route.toString()}`;
  if (window.location.hash !== nextHash) window.location.hash = nextHash;
}

function navigateBackofficeModule(module) {
  currentMode = "backoffice";
  currentModule = module || "dashboard";
  currentTab = "dados";
  setInternalRoute({
    mode: "",
    module: currentModule,
    tab: "",
    fiscal: currentModule === "fiscal" ? currentFiscalTab : "",
    stock: currentModule === "stock" ? currentStockTab : "",
    people: currentModule === "people" ? currentPeopleTab : "",
    settings: currentModule === "settings" ? currentSettingsTab : ""
  });
  renderShell();
}

window.navigateBackofficeModule = navigateBackofficeModule;

function navigateStockTab(tab = "producao") {
  currentMode = "backoffice";
  currentModule = "stock";
  currentStockTab = tab || "producao";
  setInternalRoute({ module: "stock", stock: currentStockTab, tab: "", fiscal: "", people: "", settings: "" });
  renderShell();
}

function productSalesTotals() {
  const map = new Map();
  reportRows(state.sales, "date").forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const key = item.id || item.productId || item.description;
      const row = map.get(key) || { productId: item.id || item.productId, product: item.description || `Produto ${key}`, qty: 0, total: 0 };
      row.qty += Number(item.qty || 0);
      row.total += Number(item.qty || 0) * Number(item.price || 0);
      map.set(key, row);
    });
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
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
  if (currentTab === "Curva ABC") {
    const totals = productSalesTotals();
    const grand = totals.reduce((sum, row) => sum + row.total, 0);
    let accumulated = 0;
    return table(["Classe", "Produto", "Qtd", "Total", "%", "Acumulado"], totals.map((row) => {
      accumulated += row.total;
      const percent = grand ? row.total / grand * 100 : 0;
      const acc = grand ? accumulated / grand * 100 : 0;
      const klass = acc <= 80 ? "A" : acc <= 95 ? "B" : "C";
      return [klass, row.product, formatQty(row.qty), money(row.total), pct(percent), pct(acc)];
    }));
  }
  if (currentTab === "Lucratividade") {
    return table(["Produto", "Qtd", "Venda", "Custo", "Lucro", "Margem"], productSalesTotals().map((row) => {
      const product = state.products.find((item) => item.id === row.productId) || {};
      const cost = Number(product.cost || 0) * row.qty;
      const profit = row.total - cost;
      return [row.product, formatQty(row.qty), money(row.total), money(cost), money(profit), pct(row.total ? profit / row.total * 100 : 0)];
    }));
  }
  if (currentTab === "Clientes") {
    const todayDate = new Date(`${today()}T00:00:00`);
    const byCustomer = reportRows(state.sales, "date").reduce((acc, sale) => {
      const key = sale.customer || "Consumidor Final";
      acc[key] = acc[key] || { customer: key, count: 0, total: 0, last: "" };
      acc[key].count += 1;
      acc[key].total += Number(sale.total || 0);
      if (!acc[key].last || sale.date > acc[key].last) acc[key].last = sale.date;
      return acc;
    }, {});
    return table(["Cliente", "Compras", "Total", "Ultima compra", "Dias sem comprar", "Acao"], Object.values(byCustomer).map((row) => {
      const diff = row.last ? Math.floor((todayDate - new Date(`${row.last}T00:00:00`)) / 86400000) : 0;
      return [row.customer, row.count, money(row.total), row.last || "-", diff, diff >= 30 ? "Enviar WhatsApp promocional" : "Acompanhar"];
    }));
  }
  if (currentTab === "Mesas e Delivery") {
    return table(["Venda", "Data", "Cliente", "Operacao", "Mesa", "Entregador", "Telefone", "Total"], reportRows(state.sales, "date").filter((sale) => sale.type === "PDV").map((sale) => [
      sale.id, sale.date, sale.customer, sale.operation || "Balcao", sale.table || "-", sale.deliveryDriver || "-", sale.deliveryPhone || "-", money(sale.total)
    ]));
  }
  return table(["Area", "Situacao"], [
    ["Produtos", `${state.products.length} cadastrados`],
    ["Vendas", `${state.sales.length} lancadas`],
    ["Financeiro", `${state.receivables.length + state.payables.length} titulos`],
    ["Fiscal", `${state.fiscalQueue.length} documentos na fila`]
  ]);
}

function renderSettings() {
  // Fiscal rules are configured explicitly; opening a screen must not create client data.
  const users = state.users || [];
  const readiness = operationReadiness();
  const editingRule = (state.fiscalRules || []).find((rule) => Number(rule.id) === Number(editingFiscalRuleId)) || {};
  const ruleValue = (key, fallback = "") => escapeAttr(editingRule[key] ?? fallback);
  const ruleNumber = (key, fallback = 0) => Number(editingRule[key] ?? fallback);
  const ruleSelected = (key, value, fallback = "") => (editingRule[key] || fallback) === value ? "selected" : "";
  const settingsTabs = [
    ["geral", "Empresa", "Identificacao da unidade"],
    ["endereco", "Endereco", "Endereco fiscal e cidade IBGE"],
    ["fiscal", "Fiscal e ACBr", "Certificado, SEFAZ, NFC-e e NFS-e"],
    ["regras", "Regras fiscais", "CFOP, impostos, servicos e reforma"],
    ["operacao", "Operacao", "Backup, caixa, impressora e terminais"],
    ["integracoes", "Integracoes", "Webhooks, pagamentos, PIX e boleto"],
    ["usuarios", "Usuarios", "Acessos, perfis e permissoes"],
    ["prontidao", "Prontidao", "Checklist para ir ao piloto"]
  ];
  if (!settingsTabs.some(([key]) => key === currentSettingsTab)) currentSettingsTab = "geral";
  const settingsPaneClass = (key) => `settings-pane ${currentSettingsTab === key ? "active" : ""}`;
  const activeSettingsTab = settingsTabs.find(([key]) => key === currentSettingsTab) || settingsTabs[0];
  return `
    <section class="panel settings-screen desktop-module-screen">
      <div class="desktop-module-titlebar settings-head">
        <strong>Configuracoes</strong>
        <span>${activeSettingsTab[1]}: ${activeSettingsTab[2]}</span>
        <span>${readiness.ready}/${readiness.items.length} pronto(s)</span>
      </div>

      <div class="desktop-module-ribbon settings-tabs" role="tablist" aria-label="Assuntos das configuracoes">
        ${settingsTabs.map(([key, label, description]) => `
          <button class="desktop-ribbon-button ${currentSettingsTab === key ? "primary active" : ""}" data-settings-tab="${key}" type="button" role="tab" aria-selected="${currentSettingsTab === key}">
            <span class="dashboard-module-icon icon-settings" aria-hidden="true"></span>
            <strong>${label}</strong>
            <small>${description}</small>
          </button>
        `).join("")}
      </div>

      <div class="desktop-context-strip settings-context-strip">
        <button class="active" data-settings-focus="current" type="button">${activeSettingsTab[1]}</button>
        <span class="desktop-context-metric">Fiscal: ${escapeHtml(state.settings.fiscalEnvironment || "Homologacao")}</span>
        <span class="desktop-context-metric">Usuarios: ${users.length}</span>
      </div>

      <div class="desktop-work-area settings-work-area">
      <div class="settings-overview desktop-summary-strip">
        <div><span>Unidade</span><strong>${escapeHtml(state.settings.company || "Tortela")}</strong></div>
        <div><span>Fiscal</span><strong>${escapeHtml(state.settings.fiscalEnvironment || "Homologacao")}</strong></div>
        <div><span>Prontidao</span><strong>${readiness.ready}/${readiness.items.length}</strong></div>
        <div><span>Usuarios</span><strong>${users.length}</strong></div>
      </div>
      <div class="panel-body settings-body">
        <div class="form-card ${settingsPaneClass("geral")}" id="settings-form" data-settings-pane="geral">
          <h3 class="settings-section-title">Identificacao da empresa</h3>
          <div class="field"><label>Empresa</label><input id="set-company" value="${state.settings.company}" /></div>
          <div class="field"><label>CNPJ/CPF</label><input id="set-document" value="${state.settings.document || ""}" /></div>
          <div class="grid two">
            <div class="field"><label>Inscricao estadual</label><input id="set-ie" value="${state.settings.stateRegistration || ""}" /></div>
            <div class="field"><label>Inscricao municipal</label><input id="set-im" value="${state.settings.municipalRegistration || ""}" /></div>
          </div>
          <div class="field"><label>UF</label><input id="set-uf" value="${state.settings.uf}" maxlength="2" /></div>
          <div class="field"><label>Regime tributario</label><select id="set-regime">${window.TortelaFiscalRegimes.regimes.map(item=>`<option>${escapeHtml(item.name)}</option>`).join('')}</select></div>
          <div class="field"><label>CRT aplicado</label><select id="set-crt"><option value="">Automático pelo regime</option><option value="1">1 - Simples Nacional</option><option value="2">2 - Simples: excesso de sublimite</option><option value="3">3 - Regime normal</option><option value="4">4 - MEI</option></select></div>
        </div>
        <div class="form-card ${settingsPaneClass("endereco")}" data-settings-pane="endereco">
          <h3 class="settings-section-title">Endereco fiscal da unidade</h3>
          <div class="grid two">
            <div class="field"><label>CEP</label><input id="set-cep" value="${state.settings.cep || ""}" /></div>
            <div class="field"><label>Cidade</label><input id="set-city" value="${state.settings.city || ""}" /></div>
            <div class="field"><label>Codigo IBGE da cidade</label><input id="set-city-code" value="${state.settings.cityCode || ""}" /></div>
            <div class="field"><label>Endereco</label><input id="set-address" value="${state.settings.address || ""}" /></div>
            <div class="field"><label>Numero</label><input id="set-number" value="${state.settings.number || ""}" /></div>
            <div class="field"><label>Bairro</label><input id="set-district" value="${state.settings.district || ""}" /></div>
          </div>
        </div>
        <div class="form-card ${settingsPaneClass("fiscal")}" data-settings-pane="fiscal">
          <h3 class="settings-section-title">Fiscal, certificado e ACBr</h3>
          <div class="field"><label>Ambiente fiscal</label><select id="set-env"><option>Homologacao</option><option>Producao</option></select></div>
          <div class="grid two">
            <div class="field"><label>Motor fiscal</label><select id="set-fiscal-engine"><option>ACBrLib</option><option>ACBrMonitor</option></select></div>
            <div class="field"><label>Host ACBrMonitor</label><input id="set-acbr-host" value="${escapeAttr(state.settings.acbrHost || "127.0.0.1")}" /></div>
            <div class="field"><label>Porta ACBrMonitor</label><input id="set-acbr-port" type="number" value="${Number(state.settings.acbrPort || 3436)}" /></div>
            <div class="field"><label>URL do agente fiscal Windows</label><input id="set-acbr-api-url" value="${escapeAttr(state.settings.acbrApiUrl || "")}" placeholder="URL HTTPS do agente fiscal da unidade" /></div>
            <div class="field"><label>Token do agente fiscal</label><input id="set-acbr-api-token" type="password" placeholder="${state.settings.acbrApiTokenConfigured ? "Token protegido configurado" : "Informe o token seguro"}" /></div>
            <div class="field"><label>XMLSignLib</label><input id="set-xmlsign-lib" value="${escapeAttr(state.settings.xmlSignLib || "libXml2")}" /></div>
            <div class="field"><label>HttpLib</label><input id="set-http-lib" value="${escapeAttr(state.settings.httpLib || "WinHttp")}" /></div>
            <div class="field"><label>CryptLib</label><input id="set-crypt-lib" value="${escapeAttr(state.settings.cryptLib || "WinCrypt")}" /></div>
            <div class="field"><label>SSLType</label><input id="set-ssl-type" value="${escapeAttr(state.settings.sslType || "LT_TLSv1_2")}" /></div>
            <div class="field"><label>Proxy host</label><input id="set-proxy-host" value="${escapeAttr(state.settings.proxyHost || "")}" /></div>
            <div class="field"><label>Proxy porta</label><input id="set-proxy-port" type="number" value="${Number(state.settings.proxyPort || 0)}" /></div>
            <div class="field"><label>Pasta XML</label><input id="set-xml-path" value="${escapeAttr(state.settings.xmlPath || "Fiscal/XML")}" /></div>
            <div class="field"><label>Pasta PDF</label><input id="set-pdf-path" value="${escapeAttr(state.settings.pdfPath || "Fiscal/PDF")}" /></div>
            <div class="field"><label>Pasta eventos</label><input id="set-event-path" value="${escapeAttr(state.settings.eventPath || "Fiscal/Eventos")}" /></div>
            <div class="field"><label>Logo fiscal</label><input id="set-fiscal-logo" value="${escapeAttr(state.settings.fiscalLogo || "")}" placeholder="URL ou caminho da logo Tortela" /></div>
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
            <div class="field"><label>Apuração NFS-e do Simples ME/EPP</label><select id="set-nfse-simple-assessment"><option value="1">Federais e ISS no Simples</option><option value="2">Federais no Simples; ISS fora</option><option value="3">Federais e ISS fora do Simples</option></select></div><div class="field"><label>Provedor NFS-e municipal</label><input id="set-nfse-provider" value="${escapeAttr(state.settings.nfseProvider || "")}" placeholder="Ex.: padrao nacional ou provedor municipal" /></div>
            <div class="field"><label>Codigo municipio NFS-e</label><input id="set-nfse-city-code" value="${escapeAttr(state.settings.nfseCityCode || "")}" /></div>
          </div>
          <div class="actions">
            <button class="btn" id="validate-fiscal-setup" type="button">Validar prontidao fiscal</button>
            <span class="badge ${fiscalReadiness().ok ? "ok" : "warn"}">${fiscalReadiness().label}</span>
          </div>
        </div>
        <div class="form-card ${settingsPaneClass("regras")}" data-settings-pane="regras">
          <h3>${editingFiscalRuleId ? "Editar regra fiscal" : "Regra fiscal"}</h3>
          <div class="grid four">
            <div class="field"><label>Nome da regra</label><input id="rule-name" value="${ruleValue("name")}" placeholder="Venda interna" /></div>
            <div class="field"><label>Modelo</label><select id="rule-model"><option ${ruleSelected("model", "NF-e", "NF-e")}>NF-e</option><option ${ruleSelected("model", "NFC-e", "NF-e")}>NFC-e</option><option ${ruleSelected("model", "NFS-e", "NF-e")}>NFS-e</option></select></div>
            <div class="field"><label>Regime</label><select id="rule-regime">${window.TortelaFiscalRegimes.regimes.map(item=>`<option ${ruleSelected("regime",item.name,"Simples Nacional")}>${escapeHtml(item.name)}</option>`).join('')}</select></div>
            <div class="field"><label>UF</label><input id="rule-uf" value="${ruleValue("uf", state.settings.uf)}" maxlength="2" /></div>
            <div class="field"><label>Municipio</label><input id="rule-municipio" value="${ruleValue("municipio", state.settings.city || "")}" /></div>
            <div class="field"><label>Operacao</label><input id="rule-operation" value="${ruleValue("operation", "Venda de mercadoria")}" /></div>
            <div class="field"><label>CFOP</label><input id="rule-cfop" value="${ruleValue("cfop", "5102")}" /></div>
            <div class="field"><label>CST/CSOSN</label><input id="rule-cst" value="${ruleValue("cst", "102")}" /></div>
            <div class="field"><label>CSOSN</label><input id="rule-csosn" value="${ruleValue("csosn", "102")}" /></div>
            <div class="field"><label>NCM</label><input id="rule-ncm" value="${ruleValue("ncm", "19059090")}" /></div>
            <div class="field"><label>CEST</label><input id="rule-cest" value="${ruleValue("cest")}" /></div>
            <div class="field"><label>Origem</label><input id="rule-origin" value="${ruleValue("origin", "0")}" /></div>
            <div class="field"><label>CRT da regra</label><select id="rule-crt"><option value="">Automático pelo regime</option>${["1","2","3","4"].map(code=>`<option value="${code}" ${String(editingRule.crt||"")===code?"selected":""}>${code}</option>`).join('')}</select></div><div class="field"><label>CST PIS/COFINS</label><input id="rule-pis-cofins-cst" value="${ruleValue("pisCofinsCst", "49")}" /></div>
            <div class="field"><label>PIS %</label><input id="rule-pis-rate" type="number" step="0.01" value="${ruleNumber("pisRate")}" /></div>
            <div class="field"><label>COFINS %</label><input id="rule-cofins-rate" type="number" step="0.01" value="${ruleNumber("cofinsRate")}" /></div>
            <div class="field"><label>ICMS %</label><input id="rule-icms-rate" type="number" step="0.01" value="${ruleNumber("icmsRate")}" /></div>
            <div class="field"><label>ISS %</label><input id="rule-iss-rate" type="number" step="0.01" value="${ruleNumber("issRate")}" /></div>
            <div class="field"><label>FCP %</label><input id="rule-fcp-rate" type="number" step="0.01" value="${ruleNumber("fcpRate")}" /></div>
            <div class="field"><label>MVA %</label><input id="rule-mva-rate" type="number" step="0.01" value="${ruleNumber("mvaRate")}" /></div>
            <div class="field"><label>Classificacao IBS</label><input id="rule-ibs" value="${ruleValue("ibsClass", "000001")}" /></div>
            <div class="field"><label>Classificacao CBS</label><input id="rule-cbs" value="${ruleValue("cbsClass", "000001")}" /></div>
            <div class="field"><label>CST IBS/CBS</label><input id="rule-ibs-cbs-cst" value="${ruleValue("ibsCbsCst", "000")}" /></div>
            <div class="field"><label>IBS %</label><input id="rule-ibs-rate" type="number" step="0.01" value="${ruleNumber("ibsRate")}" /></div>
            <div class="field"><label>CBS %</label><input id="rule-cbs-rate" type="number" step="0.01" value="${ruleNumber("cbsRate")}" /></div>
            <div class="field"><label>IBS UF %</label><input id="rule-ibs-uf-rate" type="number" step="0.01" value="${ruleNumber("ibsUfRate")}" /></div>
            <div class="field"><label>IBS Municipio %</label><input id="rule-ibs-city-rate" type="number" step="0.01" value="${ruleNumber("ibsCityRate")}" /></div>
            <div class="field"><label>CBS Federal %</label><input id="rule-cbs-federal-rate" type="number" step="0.01" value="${ruleNumber("cbsFederalRate")}" /></div>
            <div class="field"><label>Crédito presumido legado % (bloqueado; use cCredPres)</label><input id="rule-presumed-credit-rate" type="number" step="0.01" value="${ruleNumber("presumedCreditRate")}" /></div>
            <div class="field"><label>Ano de vigência da alíquota CBS</label><input id="rule-transition-year" type="number" value="${ruleValue("transitionYear", "2026")}" /></div>
            <div class="field"><label>Redução IBS %</label><input id="rule-ibs-reduction" type="number" min="0" max="100" step="0.01" value="${ruleNumber("ibsReductionRate")}" /></div>
            <div class="field"><label>Redução CBS %</label><input id="rule-cbs-reduction" type="number" min="0" max="100" step="0.01" value="${ruleNumber("cbsReductionRate")}" /></div>
            <div class="field"><label>Diferimento IBS UF %</label><input id="rule-ibs-uf-deferral" type="number" min="0" max="100" step="0.01" value="${ruleNumber("ibsUfDeferral")}" /></div>
            <div class="field"><label>Diferimento IBS municipal %</label><input id="rule-ibs-city-deferral" type="number" min="0" max="100" step="0.01" value="${ruleNumber("ibsCityDeferral")}" /></div>
            <div class="field"><label>Diferimento CBS %</label><input id="rule-cbs-deferral" type="number" min="0" max="100" step="0.01" value="${ruleNumber("cbsDeferral")}" /></div>
            <div class="field"><label>Reducao base reforma %</label><input id="rule-reform-reduction-rate" type="number" step="0.01" value="${ruleNumber("reformReductionRate")}" /></div>
            <div class="field"><label>Imp. seletivo % (emissão especializada)</label><input id="rule-selective-rate" type="number" step="0.01" value="${ruleNumber("selectiveTaxRate")}" /></div>
            <div class="field"><label>Diferimento reforma %</label><input id="rule-reform-deferral-rate" type="number" step="0.01" value="${ruleNumber("reformDeferralRate")}" /></div>
            <div class="field"><label>CST Imp. seletivo</label><input id="rule-selective-cst" value="${ruleValue("selectiveTaxCst")}" /></div>
            <div class="field"><label>Class. Imp. seletivo</label><input id="rule-selective-class" value="${ruleValue("selectiveTaxClass")}" /></div>
            <div class="field"><label>Monofásico (use CST 620 e parâmetros específicos)</label><select id="rule-monophase"><option value="false">Nao</option><option value="true" ${editingRule.monophase ? "selected" : ""}>Sim</option></select></div>
            <div class="field"><label>Aliquota ad rem</label><input id="rule-ad-rem-rate" type="number" step="0.0001" value="${ruleNumber("adRemRate")}" /></div>
            <div class="field"><label>Unidade ad rem</label><input id="rule-ad-rem-unit" value="${ruleValue("adRemUnit")}" /></div>
            <div class="field"><label>Servico LC 116</label><input id="rule-service-code" value="${ruleValue("serviceCode")}" /></div>
            <div class="field"><label>Servico municipal</label><input id="rule-city-service-code" value="${ruleValue("cityServiceCode")}" /></div>
            <div class="field"><label>Beneficio fiscal</label><input id="rule-tax-benefit" value="${ruleValue("taxBenefitCode")}" /></div>
            <div class="field"><label>Motivo desoneracao</label><input id="rule-reduction-reason" value="${ruleValue("reductionReason")}" /></div>
            <div class="field"><label>Vigencia inicial</label><input id="rule-valid-from" type="date" value="${ruleValue("validFrom", today())}" /></div>
            <div class="field"><label>Vigencia final</label><input id="rule-valid-to" type="date" value="${ruleValue("validTo")}" /></div>
          </div>
          <button class="btn primary" id="save-fiscal-rule" type="button">${editingFiscalRuleId ? "Atualizar regra" : "Cadastrar regra"}</button>
          ${editingFiscalRuleId ? `<button class="btn" id="cancel-fiscal-rule-edit" type="button">Cancelar edicao</button>` : ""}
          <div class="table-wrap">
            <table><thead><tr><th>Regra</th><th>Regime</th><th>UF</th><th>Modelo</th><th>CFOP</th><th>CST/CSOSN</th><th>NCM</th><th>ICMS</th><th>IBS</th><th>CBS</th><th>Vigencia</th><th>Status</th><th>Acoes</th></tr></thead>
            <tbody>${(state.fiscalRules || []).map((rule) => `<tr><td>${rule.name}</td><td>${rule.regime}</td><td>${rule.uf}</td><td>${rule.model}</td><td>${rule.cfop}</td><td>${rule.cst || rule.csosn}</td><td>${rule.ncm || "-"}</td><td>${pct(rule.icmsRate)}</td><td>${pct(rule.ibsRate)}</td><td>${pct(rule.cbsRate)}</td><td>${rule.validFrom || "-"} a ${rule.validTo || "sem fim"}</td><td><span class="badge ${rule.active === false ? "danger" : "ok"}">${rule.active === false ? "Inativa" : "Ativa"}</span></td><td><button class="btn" data-edit-fiscal-rule="${rule.id}">Editar</button> <button class="btn ${rule.active === false ? "" : "danger"}" data-toggle-fiscal-rule="${rule.id}">${rule.active === false ? "Ativar" : "Inativar"}</button></td></tr>`).join("")}</tbody></table>
          </div>
        </div>
        <div class="form-card ${settingsPaneClass("operacao")}" data-settings-pane="operacao">
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
            <div class="field"><label>Modelo balanca</label><input id="set-scale-model" value="${escapeAttr(state.settings.scaleModel || "Toledo/Filizola")}" /></div>
            <div class="field"><label>Porta balanca</label><input id="set-scale-port" value="${escapeAttr(state.settings.scalePort || "COM1")}" /></div>
            <div class="field"><label>Etiqueta produto</label><input id="set-label-model" value="${escapeAttr(state.settings.labelModel || "EAN13")}" /></div>
            <div id="pdv-terminal-settings" class="full" style="grid-column:1/-1"></div>
            <div class="field"><label>Terminal padrao</label><input id="set-default-terminal" value="${escapeAttr(state.settings.defaultTerminal || "SERIE 1")}" /></div>
            <div class="field"><label>SMTP host</label><input id="set-smtp-host" value="${escapeAttr(state.settings.smtpHost || "")}" /></div>
            <div class="field"><label>SMTP porta</label><input id="set-smtp-port" type="number" value="${Number(state.settings.smtpPort || 587)}" /></div>
            <div class="field"><label>Email fiscal remetente</label><input id="set-smtp-from" value="${escapeAttr(state.settings.smtpFrom || "")}" /></div>
            <div class="field"><label>Backup automatico</label><select id="set-auto-backup"><option value="true">Sim</option><option value="false" ${state.settings.autoBackup === false ? "selected" : ""}>Nao</option></select></div>
            <div class="field"><label>Raio entrega online km</label><input id="set-delivery-radius-km" type="number" step="0.1" value="${Number(state.settings.deliveryRadiusKm || 10)}" /></div>
            <div class="field terminal-token-field">
              <label>Token totem/cozinha/telao</label>
              <input id="set-public-terminal-token" value="${escapeAttr(state.settings.publicTerminalToken || "")}" placeholder="Sem token: links diretos; com token: links protegidos" ${publicTerminalGateDisabled ? "readonly" : ""} />
              <div class="actions">
                <button class="btn" id="copy-public-terminal-token" type="button" ${publicTerminalGateDisabled ? "disabled" : ""}>Copiar token</button>
                <button class="btn danger" id="rotate-public-terminal-token" type="button" ${publicTerminalGateDisabled ? "disabled" : ""}>Gerar novo token</button>
              </div>
              <small>${publicTerminalGateDisabled ? "Durante o desenvolvimento, os links do totem, cozinha e telao abrem direto por unidade." : "Ao gerar e salvar um novo token, os links antigos do totem, cozinha e telao sem token deixam de funcionar."}</small>
            </div>
          </div>
        </div>
        <div class="form-card ${settingsPaneClass("integracoes")}" data-settings-pane="integracoes">
          <h3>Integracoes e pagamentos</h3>
          <p class="muted">Webhooks, notificacoes, gateway online, PIX e boleto.</p>
          <div class="grid two">
            <div class="field"><label>Webhook geral de alertas</label><input id="set-alert-webhook" value="${escapeAttr(state.settings.alertWebhookUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>Token webhook de alertas</label><input id="set-alert-webhook-token" type="password" placeholder="${state.settings.alertWebhookTokenConfigured ? "Token protegido configurado" : "Informe se o provedor exigir"}" /></div>
            <div class="field"><label>Webhook WhatsApp</label><input id="set-whatsapp-webhook" value="${escapeAttr(state.settings.whatsappWebhookUrl || "")}" placeholder="Preencher ao escolher o provedor" /></div>
            <div class="field"><label>Token WhatsApp</label><input id="set-whatsapp-webhook-token" type="password" placeholder="${state.settings.whatsappWebhookTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
            <div class="field"><label>Webhook e-mail</label><input id="set-email-webhook" value="${escapeAttr(state.settings.emailWebhookUrl || "")}" placeholder="Preencher ao escolher o provedor" /></div>
            <div class="field"><label>Token e-mail</label><input id="set-email-webhook-token" type="password" placeholder="${state.settings.emailWebhookTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
            <div class="field"><label>Provedor PIX/boleto</label><input id="set-payment-provider" value="${escapeAttr(state.settings.paymentProvider || "")}" placeholder="Nome do provedor contratado" /></div>
            <div class="field"><label>URL gateway online PIX/cartao</label><input id="set-payment-api-url" value="${escapeAttr(state.settings.paymentApiUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>URL API PIX</label><input id="set-pix-api-url" value="${escapeAttr(state.settings.pixApiUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>URL API boleto</label><input id="set-boleto-api-url" value="${escapeAttr(state.settings.boletoApiUrl || "")}" placeholder="https://..." /></div>
            <div class="field"><label>Cabecalho de autenticacao</label><input id="set-payment-auth-header" value="${escapeAttr(state.settings.paymentAuthHeader || "Authorization")}" /></div>
            <div class="field"><label>Prefixo do token</label><input id="set-payment-auth-scheme" value="${escapeAttr(state.settings.paymentAuthScheme || "Bearer")}" placeholder="Bearer, Token ou vazio" /></div>
            <div class="field"><label>URL de retorno/callback</label><input id="set-payment-callback-url" value="${escapeAttr(state.settings.paymentCallbackUrl || "")}" placeholder="Preencher no dominio definitivo" /></div>
            <div class="field"><label>Token gateway online</label><input id="set-payment-api-token" type="password" placeholder="${state.settings.paymentApiTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o gateway"}" /></div>
            <div class="field"><label>Token API PIX</label><input id="set-pix-api-token" type="password" placeholder="${state.settings.pixApiTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
            <div class="field"><label>Token API boleto</label><input id="set-boleto-api-token" type="password" placeholder="${state.settings.boletoApiTokenConfigured ? "Token protegido configurado" : "Informe ao contratar o provedor"}" /></div>
          </div>
          <div class="actions"><button class="btn" id="generate-alerts" type="button">Atualizar alertas operacionais</button><button class="btn primary" id="dispatch-alerts" type="button">Enviar alertas pendentes</button></div>
          <div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Mensagem</th><th>Status</th></tr></thead><tbody>${(state.alertOutbox || []).slice(-10).reverse().map((row) => `<tr><td>${row.date}</td><td>${row.type}</td><td>${row.message}</td><td>${row.status}</td></tr>`).join("")}</tbody></table></div>
        </div>
        <div class="form-card ${settingsPaneClass("prontidao")}" data-settings-pane="prontidao">
          <h3>Prontidao para cliente piloto</h3>
          <p class="muted">${readiness.ready}/${readiness.items.length} pontos essenciais preparados.</p>
          <div class="table-wrap"><table><thead><tr><th>Item</th><th>Situacao</th></tr></thead><tbody>${readiness.items.map((item) => `<tr><td>${item.label}</td><td><span class="badge ${item.ok ? "ok" : "warn"}">${item.ok ? "Pronto" : "Pendente"}</span></td></tr>`).join("")}</tbody></table></div>
        </div>
        <div class="form-card ${settingsPaneClass("usuarios")}" data-settings-pane="usuarios">
          <h3>Novo usuario</h3>
          <div class="grid two">
            <div class="field"><label>Nome</label><input id="user-name" /></div>
            <div class="field"><label>Usuario</label><input id="user-login" /></div>
            <div class="field"><label>Senha inicial</label><input id="user-password" type="password" /></div>
            <div class="field"><label>Perfil</label><select id="user-role">${Object.keys(rolePermissions).map((role) => `<option>${role}</option>`).join("")}</select></div>
          </div>
          <div class="grid four">${rolePermissions.Administrador.map((permission) => `<label class="check-row"><input class="user-permission" type="checkbox" value="${permission}" /> ${permissionLabel(permission)}</label>`).join("")}</div>
          <h3>Permissoes por tela</h3>
          ${renderScreenPermissionMatrix()}
          <button class="btn primary" id="save-user" type="button">Cadastrar usuario</button>
        </div>
        <div class="form-card ${settingsPaneClass("usuarios")}" data-settings-pane="usuarios">
          <h3>Alterar minha senha</h3>
          <div class="grid two">
            <div class="field"><label>Senha atual</label><input id="current-password" type="password" /></div>
            <div class="field"><label>Nova senha</label><input id="new-password" type="password" minlength="8" /></div>
          </div>
          <button class="btn primary" id="change-password" type="button">Alterar senha</button>
        </div>
        <div class="table-wrap ${settingsPaneClass("usuarios")}" data-settings-pane="usuarios" style="grid-column: 1 / -1">
          <table>
            <thead><tr><th>Usuario</th><th>Nome</th><th>Perfil</th><th>Permissoes</th><th>Matriz</th><th>Status</th><th>Acoes</th></tr></thead>
            <tbody>${users.map((user) => `<tr><td>${user.username}</td><td>${user.name}</td><td>${user.role}</td><td>${(user.permissions || rolePermissions[user.role] || []).map(permissionLabel).join(", ")}</td><td>${user.screenPermissions ? "CRUD por tela" : "Padrao perfil"}</td><td><span class="badge ${user.active === false ? "danger" : "ok"}">${user.active === false ? "Bloqueado" : "Ativo"}</span></td><td><button class="btn ${user.active === false ? "" : "danger"}" data-toggle-user="${user.id}">${user.active === false ? "Ativar" : "Bloquear"}</button></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
      </div>
      <div class="desktop-action-bar erp-action-bar">
        <button class="desktop-command primary" id="save-settings" type="button"><span>S</span>Salvar configuracoes</button>
        <button class="desktop-command" id="validate-fiscal-setup-footer" type="button"><span>V</span>Validar fiscal</button>
        <button class="desktop-command" id="export-backup-footer" type="button"><span>B</span>Baixar backup</button>
        <button class="desktop-command" id="export-complete-csv-footer" type="button"><span>C</span>Exportar CSV</button>
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
  const terminal = currentPdvTerminal();
  const balance = currentCashBalance();
  const staleRegister = isCashRegisterStale();
  if(staleRegister)return `<div class="pdv closed"><aside class="pdv-side"><div class="pdv-title">CAIXA BLOQUEADO</div><p>${escapeHtml(terminal.name)}</p></aside><section class="pdv-main"><div class="form-card cash-open-card"><h2>Caixa anterior pendente de fechamento</h2><p>Aberto em ${new Date(register.openedAt).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})} por ${escapeHtml(register.openedBy||"")}.</p><p>Confira e feche este caixa. Depois abra o caixa de hoje para iniciar as vendas.</p><button class="btn danger" id="close-cash-register">Conferir e fechar caixa anterior</button><button class="btn" id="print-cash-summary">Resumo do caixa anterior</button></div></section></div>`;
  if (!register.open) {
    return `
      <div class="pdv closed">
        <aside class="pdv-side">
          <div class="pdv-title">CAIXA FECHADO</div>
          <div class="pdv-client"><strong>Terminal:</strong> ${escapeHtml(terminal.name)}<br />ID: ${escapeHtml(terminal.id)}<br />${terminal.emissionMode === "receipt" ? "RECIBO NAO FISCAL" : "NFC-e FISCAL"}</div>
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
            <button class="btn primary" id="open-cash-register">Abrir caixa do dia</button>
          </div>
        </section>
      </div>
    `;
  }
  return `
    <div class="pdv pdv-operational">
      <aside class="pdv-side">
        <div class="pdv-side-head">
          <div class="pdv-title">CAIXA ABERTO</div>
          <div class="pdv-meta"><strong>Venda ${nextId(state.sales)}</strong><span>${new Date().toLocaleString("pt-BR")}</span></div>
          <div class="pdv-client"><strong>Cliente:</strong> <span id="pdv-client-label">${escapeHtml(pdvSelectedCustomer?.name || "Identifique pelo CPF")}</span></div>
        </div>
        <div class="pdv-brand">
          ${brandMarkup()}
          <strong>${escapeHtml(state.settings.company)}</strong>
          <span>Operador: ${escapeHtml(state.settings.user)}</span>
          <small>${escapeHtml(terminal.name)} · ${terminal.emissionMode === "receipt" ? "Recibo não fiscal" : "NFC-e fiscal"}</small>
        </div>
        <div class="shortcut-grid">
          <p class="pdv-actions-label">Ações da venda</p><button class="btn" id="focus-sale-search">Buscar produto <kbd>F2</kbd></button>
          <button class="btn" id="focus-sale-customer">Cliente <kbd>F9</kbd></button>
          <button class="btn" id="hold-sale">Colocar em espera <kbd>F12</kbd></button>
          <button class="btn" id="recover-sale">Recuperar venda</button>
          <button class="btn" id="toggle-pdv-options">Opções do caixa <kbd>F1</kbd></button>
          <button class="btn" id="print-last-sale">Reimprimir recibo</button>
          <button class="btn danger" id="cancel-sale">Cancelar venda</button>
          <button class="btn danger" id="close-cash-register-main">Fechar caixa do dia</button>
        </div>
      </aside>
      <section class="pdv-main">
        <div class="pdv-main-title"><div><small>ATENDIMENTO</small><strong>Nova venda</strong>${pdvCompletionMessage ? `<small class="pdv-sale-success" role="status">${escapeHtml(pdvCompletionMessage)}</small>` : ''}</div></div>
        <div class="sale-inputs">
          <div class="field"><label for="pdv-club-cpf">CPF do cliente</label><input id="pdv-club-cpf" inputmode="numeric" maxlength="14" value="${escapeAttr(saleClubCpf)}" placeholder="Informe o CPF" /></div>
          <div class="field pdv-product-search"><label for="sale-search">Produto: código, barras ou nome</label><input id="sale-search" placeholder="Digite para buscar ou leia o código de barras" autocomplete="off" aria-controls="pdv-product-results" aria-expanded="false" /><div id="pdv-product-results" class="pdv-product-results" hidden></div></div>
          <div class="field"><label for="sale-qty">Quantidade</label><input id="sale-qty" type="number" value="1" /></div>
          <div class="field"><label for="sale-price">Preço unitário</label><input id="sale-price" type="number" step="0.01" value="0" /></div>
          <div class="field"><label for="sale-item-total">Total do item</label><input id="sale-item-total" readonly value="0,00" /></div>
        </div>
        <div class="table-wrap pdv-table">
          <table>
            <thead><tr><th>Item</th><th>Codigo</th><th>Descricao</th><th>Qtd</th><th>Un.</th><th>Preco</th><th>Total</th><th>Acao</th></tr></thead>
            <tbody>${saleItems.length?saleItems.map((item, index) => `<tr><td>${index + 1}</td><td>${item.id}</td><td style="${item.parentLineId?'padding-left:28px':''}">${item.parentLineId?escapeHtml(item.preparationRole==='Calda / cobertura'?'Cobertura':item.preparationRole)+': ':''}${escapeHtml(item.description)}${ItemPreparation.html(item)}</td><td>${item.qty}</td><td>${item.unit}</td><td>${money(item.price)}</td><td>${money(item.qty * item.price)}</td><td><button class="btn danger" data-remove-sale-item="${index}" type="button">${item.comboGroupId?"Remover combo":"Remover"}</button></td></tr>`).join(""):'<tr class="pdv-empty-row"><td colspan="8"><strong>Sua venda começa aqui</strong><span>Informe o CPF do cliente e adicione um produto pelo código, leitor de barras ou botão Buscar produto.</span></td></tr>'}</tbody>
          </table>
        </div>
        <div class="pdv-checkout"><div class="totals">
          <div class="total-box"><span>Desconto</span><strong>${money(discount)}</strong></div>
          <div class="total-box"><span>Acrescimo</span><strong>${money(addition)}</strong></div>
          <div class="total-box"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
          <div class="total-box grand-total"><span>Total</span><strong>${money(total)}</strong></div>
        </div>
        <button class="btn primary pdv-finish" id="finish-sale"><strong>Finalizar venda</strong><span>Pagamento · F7</span></button></div>
        <div class="pdv-options" id="pdv-options" aria-hidden="true">
          <div class="pdv-options-head"><h2>Opcoes do caixa</h2><button class="btn" id="close-pdv-options">Fechar</button></div>
          <div class="pdv-options-grid">
            ${staleRegister ? `<div class="alert danger-alert pdv-all-columns"><strong>Operacao bloqueada:</strong> este caixa foi aberto em ${new Date(register.openedAt).toLocaleString("pt-BR")}. Realize a conferencia e o fechamento antes de iniciar as vendas de hoje.</div>` : ""}
            <div class="field"><label>Cliente</label><input id="sale-customer" readonly value="${escapeAttr(pdvSelectedCustomer?.name || "Identifique pelo CPF")}" /></div>
            <div class="field"><label>Vendedor</label><input readonly value="${state.settings.user}" /></div>
            <div class="field"><label>Vendas em espera</label><input readonly value="${(state.heldSales || []).length}" /></div>
            <div class="field"><label>Operacao</label><select id="pdv-operation"><option>Balcao</option><option>Mesa</option><option>Delivery</option><option>Retirada</option></select></div>
            <div class="field"><label>Mesa/comanda</label><input id="pdv-table" placeholder="Ex.: Mesa 04" /></div>
            <div class="field"><label>Entregador</label><input id="pdv-delivery-driver" placeholder="Nome do entregador" /></div>
            <div class="field"><label>Telefone entrega</label><input id="pdv-delivery-phone" /></div>
            <div class="field pdv-wide"><label>Endereco entrega</label><input id="pdv-delivery-address" /></div>
            <div class="field"><label>Desconto</label><input id="pdv-discount" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Acrescimo</label><input id="pdv-addition" type="number" step="0.01" value="0" /></div>
            <div class="field"><label>Credito de troca</label><input readonly value="${money(pendingExchangeCredit)}" /></div>
            <p class="helper pdv-wide">A forma de pagamento sera escolhida ao finalizar a venda.</p><div class="pdv-options-balance"><span>Saldo atual do caixa</span><strong>${money(balance)}</strong></div>
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
            <button class="btn" id="pdv-tef-admin">TEF adm.</button>
            <button class="btn" id="pdv-open-drawer">Abrir gaveta</button>
            <button class="btn" id="pdv-print-kitchen">Imprimir cozinha</button>
            <button class="btn" id="pdv-transfer-table">Transferir mesa</button>
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
  const movements = (state.cash || []).filter((row) => row.cashRegisterOpenedAt === openedAt && (!row.paymentMethod || row.paymentMethod === "Dinheiro"));
  if (!movements.length) return Number(state.cashRegister?.initialAmount || 0);
  return movements.reduce((sum, row) => sum + Number(row.in || 0) - Number(row.out || 0), 0);
}

function bindCurrentModule() {
  const closuresPanel=byId("unit-cash-closures");
  if(closuresPanel&&window.CashReportsPanel)window.CashReportsPanel.mount(closuresPanel,{api,tenantCode:state.settings.tenantCode});
  document.querySelectorAll("[data-product-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      captureProductDraft();
      currentTab = button.dataset.productTab;
      setInternalRoute({ module: "products", tab: currentTab });
      renderShell();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      captureProductDraft();
      currentTab = button.dataset.tab;
      setInternalRoute({ module: currentModule, tab: currentTab });
      renderShell();
    });
  });

  const openPdv = byId("open-pdv");
  if (openPdv) openPdv.addEventListener("click", () => { currentMode = "pdv"; renderShell(); });
  document.querySelectorAll("[data-dashboard-module]").forEach((button) => {
    button.addEventListener("click", () => navigateBackofficeModule(button.dataset.dashboardModule || "dashboard"));
  });

  bindCepAutocomplete("person-cep", lookupPersonCep);
  bindCepAutocomplete("set-cep", lookupSettingsCep);

  const savePerson = byId("save-person");
  if (savePerson) savePerson.addEventListener("click", savePersonRecord);
  const newPerson = byId("new-person");
  if (newPerson) newPerson.addEventListener("click", newPersonRecord);
  document.querySelectorAll("[data-new-person-type]").forEach((button) => {
    button.addEventListener("click", () => newPersonRecord(button.dataset.newPersonType || "Cliente"));
  });
  const editSelectedPerson = byId("edit-selected-person");
  if (editSelectedPerson) editSelectedPerson.addEventListener("click", () => editPersonRecord(selectedPersonId || Number(document.querySelector("[data-select-person]")?.dataset.selectPerson || 0)));
  const printPeople = byId("print-people");
  if (printPeople) printPeople.addEventListener("click", printPeopleList);
  const refreshPeople = byId("refresh-people");
  if (refreshPeople) refreshPeople.addEventListener("click", renderShell);
  const closePeople = byId("close-people");
  if (closePeople) closePeople.addEventListener("click", () => { currentModule = "dashboard"; renderShell(); });
  const filterPeople = byId("filter-people");
  if (filterPeople) filterPeople.addEventListener("click", () => { personSearch = byId("person-search").value; renderShell(); });
  const copyPublicRegistration = byId("copy-public-registration");
  if (copyPublicRegistration) copyPublicRegistration.addEventListener("click", copyPublicRegistrationLink);
  document.querySelectorAll("[data-person-filter]").forEach((button) => button.addEventListener("click", () => {
    currentPeopleTab = button.dataset.personFilter || "Todos";
    setInternalRoute({ module: "people", people: currentPeopleTab });
    renderShell();
  }));
  document.querySelectorAll("[data-select-person]").forEach((row) => row.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    selectedPersonId = Number(row.dataset.selectPerson);
    renderShell();
  }));
  document.querySelectorAll("[data-edit-person]").forEach((button) => button.addEventListener("click", () => editPersonRecord(Number(button.dataset.editPerson))));
  document.querySelectorAll("[data-toggle-person]").forEach((button) => button.addEventListener("click", () => togglePersonRecord(Number(button.dataset.togglePerson))));

  const saveProduct = byId("save-product");
  if (saveProduct) saveProduct.addEventListener("click", saveProductRecord);
  bindComboBuilder();
  const newProduct = byId("new-product");
  if (newProduct) newProduct.addEventListener("click", newProductRecord);
  document.querySelectorAll("[data-new-product-type]").forEach((button) => {
    button.addEventListener("click", () => newProductRecord(button.dataset.newProductType || "Mercadoria para revenda"));
  });
  const editSelectedProduct = byId("edit-selected-product");
  if (editSelectedProduct) editSelectedProduct.addEventListener("click", () => editProductRecord(selectedProductId || Number(document.querySelector("[data-select-product]")?.dataset.selectProduct || 0)));
  const labelSelectedProduct = byId("label-selected-product");
  if (labelSelectedProduct) labelSelectedProduct.addEventListener("click", () => openProductLabelTab(selectedProductId || Number(document.querySelector("[data-select-product]")?.dataset.selectProduct || 0)));
  byId("export-products")?.addEventListener("click", exportProductsList);
  const printProducts = byId("print-products");
  if (printProducts) printProducts.addEventListener("click", printProductsList);
  const refreshProducts = byId("refresh-products");
  if (refreshProducts) refreshProducts.addEventListener("click", renderShell);
  const closeProducts = byId("close-products");
  if (closeProducts) closeProducts.addEventListener("click", () => { currentModule = "dashboard"; renderShell(); });
  document.querySelectorAll("[data-product-status]").forEach(button => button.addEventListener("click", () => { captureProductDraft(); productSearch = byId("product-search")?.value || ""; productStatusFilter = button.dataset.productStatus; renderShell(); }));
  byId("product-search")?.addEventListener("keydown", event => { if(event.key === "Enter") { event.preventDefault(); captureProductDraft(); productSearch=event.target.value; renderShell(); } });
  byId("toggle-selected-product")?.addEventListener("click", () => { if(selectedProductId) { captureProductDraft(); toggleProductRecord(Number(selectedProductId)); } });
  const filterProducts = byId("filter-products");
  if (filterProducts) filterProducts.addEventListener("click", () => { captureProductDraft(); productSearch = byId("product-search").value; renderShell(); });
  document.querySelectorAll("[data-select-product]").forEach((row) => row.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    captureProductDraft();
    const listScroll = document.querySelector(".product-catalog-scroll")?.scrollTop || 0;
    const pageScroll = window.scrollY;
    selectedProductId = Number(row.dataset.selectProduct);
    renderShell();
    const list = document.querySelector(".product-catalog-scroll");
    if (list) list.scrollTop = listScroll;
    window.scrollTo(0, pageScroll);
  }));
  document.querySelectorAll("[data-edit-product]").forEach((button) => button.addEventListener("click", () => editProductRecord(Number(button.dataset.editProduct))));
  document.querySelectorAll("[data-toggle-product]").forEach((button) => button.addEventListener("click", () => toggleProductRecord(Number(button.dataset.toggleProduct))));
  document.querySelectorAll("[data-label-product]").forEach((button) => button.addEventListener("click", () => openProductLabelTab(Number(button.dataset.labelProduct))));
  const refreshLabelPreview = byId("refresh-label-preview");
  if (refreshLabelPreview) refreshLabelPreview.addEventListener("click", () => {
    captureProductDraft();
    renderShell();
  });
  const generateProductLabels = byId("generate-product-labels");
  if (generateProductLabels) generateProductLabels.addEventListener("click", () => {
    captureProductDraft();
    printProductLabel(Number(byId("label-product")?.value || selectedProductId || editingProductId || 0));
  });
  const labelProduct = byId("label-product");
  if (labelProduct) labelProduct.addEventListener("change", () => {
    selectedProductId = Number(labelProduct.value || 0);
    captureProductDraft();
    renderShell();
  });

  document.querySelectorAll("[data-stock-tab]").forEach((button) => button.addEventListener("click", () => {
    navigateStockTab(button.dataset.stockTab || "producao");
  }));

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
  const receiveCentralQr = byId("receive-central-qr");
  if (receiveCentralQr) receiveCentralQr.addEventListener("click", receiveCentralShipmentQr);
  const inventoryBarcode = byId("inventory-barcode");
  if (inventoryBarcode) inventoryBarcode.addEventListener("keydown", inventoryBarcodeRead);
  const saveTransfer = byId("save-transfer");
  if (saveTransfer) saveTransfer.addEventListener("click", saveStockTransferRecord);

  const newPurchase = byId("new-purchase");
  if (newPurchase) newPurchase.addEventListener("click", savePurchaseRecord);
  const newPurchaseRibbon = byId("new-purchase-ribbon");
  if (newPurchaseRibbon) newPurchaseRibbon.addEventListener("click", savePurchaseRecord);
  const openPurchaseXmlRibbon = byId("open-purchase-xml-ribbon");
  if (openPurchaseXmlRibbon) openPurchaseXmlRibbon.addEventListener("click", openPurchaseXmlPicker);
  const openPurchaseXmlFooter = byId("open-purchase-xml-footer");
  if (openPurchaseXmlFooter) openPurchaseXmlFooter.addEventListener("click", openPurchaseXmlPicker);

  const addPurchaseItem = byId("add-purchase-item");
  if (addPurchaseItem) addPurchaseItem.addEventListener("click", addPurchaseItemRecord);
  const addPurchaseItemRibbon = byId("add-purchase-item-ribbon");
  if (addPurchaseItemRibbon) addPurchaseItemRibbon.addEventListener("click", addPurchaseItemRecord);
  const addPurchaseItemFooter = byId("add-purchase-item-footer");
  if (addPurchaseItemFooter) addPurchaseItemFooter.addEventListener("click", addPurchaseItemRecord);

  const clearPurchaseItems = byId("clear-purchase-items");
  if (clearPurchaseItems) clearPurchaseItems.addEventListener("click", clearPurchaseItemsRecord);
  const clearPurchaseItemsRibbon = byId("clear-purchase-items-ribbon");
  if (clearPurchaseItemsRibbon) clearPurchaseItemsRibbon.addEventListener("click", clearPurchaseItemsRecord);
  const clearPurchaseItemsFooter = byId("clear-purchase-items-footer");
  if (clearPurchaseItemsFooter) clearPurchaseItemsFooter.addEventListener("click", clearPurchaseItemsRecord);

  const purchaseXml = byId("purchase-xml");
  if (purchaseXml) purchaseXml.addEventListener("change", readPurchaseXml);

  document.querySelectorAll("[data-purchase-step]").forEach((button) => {
    button.addEventListener("click", () => focusPurchaseStep(button.dataset.purchaseStep || "document"));
  });

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
  const saveOrderRibbon = byId("save-order-ribbon");
  if (saveOrderRibbon) saveOrderRibbon.addEventListener("click", saveOrderRecord);
  const addOrderItem = byId("add-order-item");
  if (addOrderItem) addOrderItem.addEventListener("click", addOrderItemRecord);
  const addOrderItemRibbon = byId("add-order-item-ribbon");
  if (addOrderItemRibbon) addOrderItemRibbon.addEventListener("click", addOrderItemRecord);
  const addOrderItemFooter = byId("add-order-item-footer");
  if (addOrderItemFooter) addOrderItemFooter.addEventListener("click", addOrderItemRecord);
  const clearOrderItems = byId("clear-order-items");
  if (clearOrderItems) clearOrderItems.addEventListener("click", clearOrderItemsRecord);
  const clearOrderItemsRibbon = byId("clear-order-items-ribbon");
  if (clearOrderItemsRibbon) clearOrderItemsRibbon.addEventListener("click", clearOrderItemsRecord);
  const clearOrderItemsFooter = byId("clear-order-items-footer");
  if (clearOrderItemsFooter) clearOrderItemsFooter.addEventListener("click", clearOrderItemsRecord);
  document.querySelectorAll("[data-sales-step]").forEach((button) => {
    button.addEventListener("click", () => focusSalesStep(button.dataset.salesStep || "order"));
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
  document.querySelectorAll("[data-print-online-order]").forEach((button) => {
    button.addEventListener("click", () => printOnlineOrder(Number(button.dataset.printOnlineOrder)));
  });
  document.querySelectorAll("[data-online-status]").forEach((button) => {
    button.addEventListener("click", () => updateOnlineOrderStatus(Number(button.dataset.onlineStatus), button.dataset.status));
  });
  document.querySelectorAll("[data-online-step]").forEach((button) => {
    button.addEventListener("click", () => focusOnlineStep(button.dataset.onlineStep || "board"));
  });
  document.querySelectorAll("[data-copy-public-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      const link = button.dataset.copyPublicLink || "";
      try {
        await copyText(link);
        alert("Link da unidade copiado.");
      } catch {
        alert(`Nao foi possivel copiar automaticamente. Link: ${link}`);
      }
    });
  });

  const saveFinance = byId("save-finance");
  if (saveFinance) saveFinance.addEventListener("click", saveFinanceRecord);
  const saveReconciliation = byId("save-reconciliation");
  if (saveReconciliation) saveReconciliation.addEventListener("click", saveFinanceReconciliation);
  const saveReconciliationFooter = byId("save-reconciliation-footer");
  if (saveReconciliationFooter) saveReconciliationFooter.addEventListener("click", saveFinanceReconciliation);
  const importOfx = byId("import-ofx");
  if (importOfx) importOfx.addEventListener("change", importOfxFile);
  const generateRemittance = byId("generate-remittance");
  if (generateRemittance) generateRemittance.addEventListener("click", generateBoletoRemittance);
  const importReturnFile = byId("import-return-file");
  if (importReturnFile) importReturnFile.addEventListener("change", importBoletoReturn);
  const printIssuedBillsButton = byId("print-issued-bills");
  if (printIssuedBillsButton) printIssuedBillsButton.addEventListener("click", printIssuedBills);
  const saveAccount = byId("save-account");
  if (saveAccount) saveAccount.addEventListener("click", saveChartAccount);
  const saveAccountFooter = byId("save-account-footer");
  if (saveAccountFooter) saveAccountFooter.addEventListener("click", saveChartAccount);
  const cancelAccountEdit = byId("cancel-account-edit");
  if (cancelAccountEdit) cancelAccountEdit.addEventListener("click", () => {
    editingAccountId = 0;
    renderShell();
  });
  const cancelAccountEditFooter = byId("cancel-account-edit-footer");
  if (cancelAccountEditFooter) cancelAccountEditFooter.addEventListener("click", () => {
    editingAccountId = 0;
    renderShell();
  });
  document.querySelectorAll("[data-edit-account]").forEach((button) => {
    button.addEventListener("click", () => editChartAccount(Number(button.dataset.editAccount)));
  });
  document.querySelectorAll("[data-toggle-account]").forEach((button) => {
    button.addEventListener("click", () => toggleChartAccount(Number(button.dataset.toggleAccount)));
  });

  document.querySelectorAll("[data-pay]").forEach((button) => {
    button.addEventListener("click", () => payFinanceRecord(Number(button.dataset.pay)));
  });

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      currentSettingsTab = button.dataset.settingsTab || "geral";
      setInternalRoute({ module: "settings", settings: currentSettingsTab });
      document.querySelectorAll("[data-settings-tab]").forEach((tab) => {
        const active = tab.dataset.settingsTab === currentSettingsTab;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll(".settings-pane").forEach((pane) => {
        pane.classList.toggle("active", pane.dataset.settingsPane === currentSettingsTab);
      });
    });
  });

  const terminalSettings = byId("pdv-terminal-settings");
  if (terminalSettings && window.PdvTerminalSettings) window.PdvTerminalSettings.mount(terminalSettings, {
    api, tenantCode: state.settings.tenantCode, onSaved: terminals => { state.settings.pdvTerminals = terminals; }
  });
  const saveSettings = byId("save-settings");
  if (saveSettings) {
    byId("set-regime").value = state.settings.regime || "Simples Nacional";
    byId("set-crt").value = state.settings.crt || "";
    byId("set-regime").addEventListener("change",()=>{byId("set-crt").value="";});
    byId("set-env").value = state.settings.fiscalEnvironment || "Homologacao";
    byId("set-fiscal-engine").value = state.settings.fiscalEngine || "ACBrLib";
    byId("set-sefaz-credentialed").value = String(Boolean(state.settings.sefazCredentialed));
    byId("set-nfse-standard").value = state.settings.nfseStandard || "Nacional";
    byId("set-nfse-simple-assessment").value=String(state.settings.nfseSimpleAssessment||1);
    saveSettings.addEventListener("click", saveSettingsRecord);
  }

  const validateFiscalSetup = byId("validate-fiscal-setup");
  if (validateFiscalSetup) validateFiscalSetup.addEventListener("click", showFiscalReadiness);
  const validateFiscalSetupFooter = byId("validate-fiscal-setup-footer");
  if (validateFiscalSetupFooter) validateFiscalSetupFooter.addEventListener("click", showFiscalReadiness);
  const settingsFocusCurrent = byId("settings-focus-current");
  if (settingsFocusCurrent) settingsFocusCurrent.addEventListener("click", focusCurrentSettingsPane);
  document.querySelectorAll("[data-settings-focus]").forEach((button) => {
    button.addEventListener("click", focusCurrentSettingsPane);
  });
  const copyPublicToken = byId("copy-public-terminal-token");
  if (copyPublicToken) copyPublicToken.addEventListener("click", copyPublicTerminalToken);
  const rotatePublicToken = byId("rotate-public-terminal-token");
  if (rotatePublicToken) rotatePublicToken.addEventListener("click", rotatePublicTerminalToken);

  const saveUser = byId("save-user");
  if (saveUser) saveUser.addEventListener("click", saveUserRecord);
  document.querySelectorAll("[data-toggle-user]").forEach((button) => {
    button.addEventListener("click", () => toggleUserRecord(Number(button.dataset.toggleUser)));
  });

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

  document.querySelectorAll("[data-fiscal-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFiscalTab = button.dataset.fiscalTab || "fila";
      setInternalRoute({ module: "fiscal", fiscal: currentFiscalTab });
      renderShell();
    });
  });

  document.querySelectorAll("[data-fiscal-step]").forEach((button) => {
    button.addEventListener("click", () => focusFiscalStep(button.dataset.fiscalStep || "form"));
  });

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

  document.querySelectorAll('[data-fiscal-tax-summary]').forEach(button=>button.addEventListener('click',()=>{
    const row=state.fiscalQueue.find(r=>Number(r.id)===Number(button.dataset.fiscalTaxSummary)),summary=row?.taxSummary;
    if(!summary)return;
    const labels={transferredIbs:'IBS transferido/ajustado',transferredCbs:'CBS transferida/ajustada',ibsCreditReversal:'Crédito IBS estornado',cbsCreditReversal:'Crédito CBS estornado',zfmCredit:'Crédito ZFM',ipiReturned:'IPI devolvido',total:'Total da nota',icms:'ICMS próprio',ipi:'IPI',difal:'DIFAL emitente',fcpDestination:'FCP destino',difalRecipient:'DIFAL a cargo do destinatário (informativo)',icmsMono:'ICMS monofásico próprio',icmsMonoRetention:'ICMS monofásico retido nesta operação',icmsMonoPreviouslyRetained:'ICMS monofásico anteriormente retido (informativo)',ibs:'IBS',cbs:'CBS',ibsMono:'IBS monofásico',cbsMono:'CBS monofásica',ibsCredit:'Crédito presumido IBS',cbsCredit:'Crédito presumido CBS',ibsCreditSuspended:'Crédito IBS sob condição suspensiva',cbsCreditSuspended:'Crédito CBS sob condição suspensiva'};
    alert(Object.entries(labels).map(([key,label])=>label+': '+money(summary[key]||0)).join('\n'));
  }));
  byId('create-special-fiscal')?.addEventListener('click',createSpecialFiscalNote);
  byId('preview-credit-event')?.addEventListener('click',()=>runCreditEvent(false));
  byId('send-credit-event')?.addEventListener('click',()=>runCreditEvent(true));
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
  const fiscalExportBatch = byId("fiscal-export-batch");
  if (fiscalExportBatch) fiscalExportBatch.addEventListener("click", exportFiscalXmlBatch);
  const fiscalPdfBatch = byId("fiscal-pdf-batch");
  if (fiscalPdfBatch) fiscalPdfBatch.addEventListener("click", exportFiscalPdfBatch);

  const exportReport = byId("export-report");
  if (exportReport) exportReport.addEventListener("click", exportReportCsv);
  const printReportButton = byId("print-report");
  if (printReportButton) printReportButton.addEventListener("click", printCurrentReport);
  const applyReportPeriod = byId("apply-report-period");
  if (applyReportPeriod) applyReportPeriod.addEventListener("click", () => {
    reportPeriod = { from: byId("report-from").value, to: byId("report-to").value };
    renderShell();
  });
  const applyReportPeriodFooter = byId("apply-report-period-footer");
  if (applyReportPeriodFooter) applyReportPeriodFooter.addEventListener("click", () => {
    reportPeriod = { from: byId("report-from").value, to: byId("report-to").value };
    renderShell();
  });

  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      currentTab = button.dataset.report;
      renderShell();
    });
  });
  document.querySelectorAll("[data-report-step]").forEach((button) => {
    button.addEventListener("click", () => focusReportStep(button.dataset.reportStep || "preview"));
  });

  const exportBackup = byId("export-backup");
  if (exportBackup) exportBackup.addEventListener("click", exportBackupJson);
  const exportBackupFooter = byId("export-backup-footer");
  if (exportBackupFooter) exportBackupFooter.addEventListener("click", exportBackupJson);
  const exportCompleteCsv = byId("export-complete-csv");
  if (exportCompleteCsv) exportCompleteCsv.addEventListener("click", exportCompleteCsvRecord);
  const exportCompleteCsvFooter = byId("export-complete-csv-footer");
  if (exportCompleteCsvFooter) exportCompleteCsvFooter.addEventListener("click", exportCompleteCsvRecord);
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
  const cancelFiscalRuleEdit = byId("cancel-fiscal-rule-edit");
  if (cancelFiscalRuleEdit) cancelFiscalRuleEdit.addEventListener("click", () => {
    editingFiscalRuleId = 0;
    renderShell();
  });
  document.querySelectorAll("[data-edit-fiscal-rule]").forEach((button) => {
    button.addEventListener("click", () => editFiscalRuleRecord(Number(button.dataset.editFiscalRule)));
  });
  document.querySelectorAll("[data-toggle-fiscal-rule]").forEach((button) => {
    button.addEventListener("click", () => toggleFiscalRuleRecord(Number(button.dataset.toggleFiscalRule)));
  });

  const saleSearch = byId("sale-search");
  const productResults = byId("pdv-product-results");
  let searchMatches = [];
  let searchIndex = -1;
  const hideProductSearch = () => {
    if (productResults) productResults.hidden = true;
    saleSearch?.setAttribute("aria-expanded", "false");
  };
  const showProductSearch = () => {
    if (!saleSearch || !productResults) return;
    const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const query = normalize(saleSearch.value.trim());
    searchMatches = state.products.filter(p => p.active !== false && (!query || [p.id,p.barcode,p.reference,p.sku,p.description].some(value => normalize(value).includes(query)))).slice(0,50);
    searchIndex = -1;
    productResults.innerHTML = `<div class="pdv-search-hint">Selecione para adicionar à venda · ↑ ↓ e Enter</div>` + (searchMatches.length ? searchMatches.map((p,index) => `<button type="button" class="pdv-product-result" data-search-index="${index}"><span><strong>${escapeHtml(p.description)}</strong><small>Código ${escapeHtml(String(p.id))} · Estoque ${escapeHtml(String(p.stock ?? 0))}</small></span><b>${money(effectiveProductPrice(p,Number(byId("sale-qty")?.value || 1)))}</b></button>`).join("") : `<p class="pdv-search-empty">${state.products.length ? "Nenhum produto encontrado nesta unidade. Tente outro nome ou código." : "Esta unidade ainda não tem produtos cadastrados. Cadastre os produtos na retaguarda desta loja."}</p>`);
    productResults.hidden = false;
    saleSearch.setAttribute("aria-expanded", "true");
    productResults.querySelectorAll("[data-search-index]").forEach(button => button.addEventListener("click", () => {
      const product = searchMatches[Number(button.dataset.searchIndex)];
      if (product) { saleSearch.value = String(product.id); hideProductSearch(); addSaleItem(product.id); }
    }));
  };
  if (saleSearch) {
    saleSearch.focus();
    saleSearch.addEventListener("input", showProductSearch);
    saleSearch.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        if (productResults.hidden) showProductSearch();
        if (!searchMatches.length) return;
        searchIndex = (searchIndex + (event.key === "ArrowDown" ? 1 : -1) + searchMatches.length) % searchMatches.length;
        productResults.querySelectorAll("[data-search-index]").forEach((button,index) => {
          button.classList.toggle("selected",index === searchIndex);
          if(index === searchIndex) button.scrollIntoView({block:"nearest"});
        });
        return;
      }
      if (event.key === "Escape") { hideProductSearch(); return; }
      if (event.key === "Enter") {
        event.preventDefault();
        const query = saleSearch.value.trim();
        const exact = state.products.find(p => p.active !== false && (String(p.id) === query || p.barcode === query));
        if (searchIndex >= 0 && !productResults.hidden) { const product = searchMatches[searchIndex]; hideProductSearch(); addSaleItem(product.id); }
        else if (exact) { hideProductSearch(); addSaleItem(exact.id); }
        else { showProductSearch(); if (searchMatches.length === 1) { const product = searchMatches[0]; hideProductSearch(); addSaleItem(product.id); } }
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
  const focusSaleSearch = byId("focus-sale-search");
  if (focusSaleSearch) focusSaleSearch.addEventListener("click", () => { saleSearch?.focus(); showProductSearch(); });
  const focusSaleCustomer = byId("focus-sale-customer");
  if (focusSaleCustomer) focusSaleCustomer.addEventListener("click", () => {
    byId("pdv-club-cpf")?.focus();
  });
  const cpfInput = byId("pdv-club-cpf");
  if(cpfInput){
    const resolve=()=>{if(digits(cpfInput.value).length===11)ensurePdvCustomer().catch(error=>alert(error.message));};
    cpfInput.addEventListener('input',()=>{saleClubCpf=digits(cpfInput.value);if(pdvSelectedCustomer&&digits(pdvSelectedCustomer.document)!==saleClubCpf){pdvSelectedCustomer=null;updatePdvCustomerLabel();}resolve();});
    cpfInput.addEventListener('blur',resolve);
    cpfInput.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();resolve();}});
  }
  document.onkeydown = currentMode === "pdv" ? (event) => {
    if(document.querySelector("dialog[open]"))return;
    if (event.key === "F1") {
      event.preventDefault();
      setPdvOptions(!pdvOptions?.classList.contains("open"));
    } else if (event.key === "F2") {
      event.preventDefault();
      focusSaleSearch?.click();
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
    saleClubCpf = "";
    pdvSelectedCustomer = null;
    authorizedDiscountValue = 0;
    save();
    renderShell();
  });

  const openCash = byId("open-cash-register");
  if (openCash) openCash.addEventListener("click", openCashRegister);

  byId("close-cash-register-main")?.addEventListener("click",closeCashRegister);
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
  if (printLastSale) printLastSale.addEventListener("click", openPdvReceiptPicker);
  const connectPdvDevice = byId("connect-pdv-device");
  if (connectPdvDevice) connectPdvDevice.addEventListener("click", connectPdvPeripheral);
  const pdvTefAdmin = byId("pdv-tef-admin");
  if (pdvTefAdmin) pdvTefAdmin.addEventListener("click", runTefAdmin);
  const pdvOpenDrawer = byId("pdv-open-drawer");
  if (pdvOpenDrawer) pdvOpenDrawer.addEventListener("click", openCashDrawer);
  const pdvPrintKitchen = byId("pdv-print-kitchen");
  if (pdvPrintKitchen) pdvPrintKitchen.addEventListener("click", printKitchenOrder);
  const pdvTransferTable = byId("pdv-transfer-table");
  if (pdvTransferTable) pdvTransferTable.addEventListener("click", transferPdvTable);

  document.querySelectorAll("[data-remove-sale-item]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = saleItems[Number(button.dataset.removeSaleItem)];
      const authorization = await authorizePdvOperation("remove_item", "Autorizar exclusao de item");
      if (!authorization) return;
      saleItems=saleItems.filter(row=>item?.comboGroupId?row.comboGroupId!==item.comboGroupId:row!==item&&(!item?.lineId||row.parentLineId!==item.lineId));
      audit("Item removido do PDV", `${item?.description || "Item"} autorizado por ${authorization.authorizedBy}`);
      save();
      renderShell();
    });
  });
}

function cashBusinessDay(value = new Date()) {
  const date=new Date(value);if(!Number.isFinite(date.getTime()))return "";
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const get=type=>parts.find(part=>part.type===type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function isCashRegisterStale() {
  return Boolean(state.cashRegister?.open && (!cashBusinessDay(state.cashRegister.openedAt) || cashBusinessDay(state.cashRegister.openedAt)!==cashBusinessDay()));
}
async function refreshCashRegister() {
  if(apiOnline && sessionId && navigator.onLine){const result=await api(`/api/tenant/${state.settings.tenantCode}/cash-register`,{timeoutMs:45000});state.cashRegister=result.register;}
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

let cashOpeningInProgress = false;
async function openCashRegister() {
  if(cashOpeningInProgress)return;
  if(!apiOnline||!sessionId)return alert("Conecte-se ao sistema para abrir o caixa.");
  const password=byId("cash-open-password")?.value||"";
  if(!password)return alert("Informe a senha do operador para abrir o caixa.");
  cashOpeningInProgress=true;
  const button=byId("open-cash-register");
  if(button){button.disabled=true;button.textContent="Aguarde, confirmando abertura…";}
  try{
    const result=await api(`/api/tenant/${state.settings.tenantCode}/cash-register/open`,{timeoutMs:45000,method:"POST",body:JSON.stringify({password,initialAmount:num("cash-open-amount"),terminal:byId("cash-open-terminal").value||currentPdvTerminal().name})});
    state=withDefaults({...result.state,provider:state.provider,settings:{...result.state.settings,user:state.settings.user}});
    saleItems=[];localStorage.setItem("tortelaplus-state-v1",JSON.stringify(state));renderShell();
  }catch(error){
    let checked=false;
    try{await refreshCashRegister();checked=true;}catch{}
    const register=state.cashRegister;
    if(checked && register?.open && register.openedBy===state.settings.user && register.terminalId===currentPdvTerminal().id){
      localStorage.setItem("tortelaplus-state-v1",JSON.stringify(state));
      alert("A abertura foi confirmada no servidor. O caixa já está aberto.");
    }else alert(error.message + (checked ? " Confira a situação do caixa antes de tentar novamente." : " Não foi possível confirmar a situação do caixa. Aguarde a conexão voltar antes de tentar novamente."));
    renderShell();
  }finally{
    cashOpeningInProgress=false;
    const currentButton=byId("open-cash-register");
    if(currentButton){currentButton.disabled=false;currentButton.textContent="Abrir caixa do dia";}
  }
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
  if(!apiOnline||!sessionId)return alert("Conecte-se ao sistema para conferir e fechar o caixa.");
  if(saleItems.length && !confirm("Existe venda em andamento. Fechar o caixa mesmo assim?"))return;
  await syncChain;
  if(localStorage.getItem("tortelaplus-pending-sync") && await save()===false)return alert("Sincronize as vendas pendentes antes de fechar o caixa.");
  const user=prompt("Usuario gerente ou administrador responsavel pelo fechamento:",state.settings.user);if(!user)return;
  const password=prompt("Senha do responsavel pelo fechamento:","");if(!password)return;
  const countedText=prompt(`Valor em dinheiro contado no caixa. Esperado: ${money(currentCashBalance())}`,currentCashBalance().toFixed(2).replace(".",","));if(countedText===null)return;
  const countedAmount=Number(String(countedText).replace(",","."));if(!Number.isFinite(countedAmount)||countedAmount<0)return alert("Informe um valor contado valido.");
  const responsible=prompt("Responsavel pela conferencia:",user)||user,closingNote=prompt("Observacao da conferencia ou diferenca:","")||"";
  try{
    const result=await api(`/api/tenant/${state.settings.tenantCode}/cash-register/close`,{timeoutMs:45000,method:"POST",body:JSON.stringify({user,password,countedAmount,responsible,closingNote})});
    state=withDefaults({...result.state,provider:state.provider,settings:{...result.state.settings,user:state.settings.user}});saleItems=[];
    localStorage.setItem("tortelaplus-state-v1",JSON.stringify(state));printCashClosure(result.closure);renderShell();alert("Caixa fechado. Relatorio detalhado disponivel em Financeiro > Caixa e na Central > Vendas.");
  }catch(error){alert(error.message);await refreshCashRegister().catch(()=>{});renderShell();}
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
    clubCpf: saleClubCpf,
    items: structuredClone(ItemPreparation.ordered(saleItems))
  });
  saleItems = [];
  saleClubCpf = "";
  pdvSelectedCustomer = null;
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
  saleClubCpf = held.clubCpf || "";
  pdvSelectedCustomer = state.people.find(p=>p.type==="Cliente"&&digits(p.document)===saleClubCpf&&p.active!==false)||null;
  audit("Venda recuperada", `Espera ${held.id}`);
  save();
  renderShell();
}

function updatePdvTableFromSale(sale) {
  if (sale.operation !== "Mesa" || !sale.table) return;
  state.pdvTables = state.pdvTables || [];
  const table = state.pdvTables.find((row) => row.name === sale.table) || { id: nextId(state.pdvTables), name: sale.table };
  Object.assign(table, {
    status: "Fechada",
    lastSaleId: sale.id,
    customer: sale.customer,
    total: sale.total,
    closedAt: new Date().toISOString()
  });
  if (!state.pdvTables.some((row) => row.id === table.id)) state.pdvTables.push(table);
}

function printKitchenOrder() {
  if (!saleItems.length) return alert("Inclua itens para imprimir o pedido da cozinha.");
  const kitchenItems = saleItems.filter((item) => state.products.find((product) => product.id === item.id)?.kitchenRequest || state.products.find((product) => product.id === item.id)?.manufactured);
  const items = kitchenItems.length ? kitchenItems : saleItems;
  const content = [
    state.settings.company,
    "PEDIDO COZINHA",
    `Data: ${new Date().toLocaleString("pt-BR")}`,
    `Operacao: ${byId("pdv-operation")?.value || "Balcao"}  Mesa: ${byId("pdv-table")?.value || "-"}`,
    `Cliente: ${byId("sale-customer")?.value || "Consumidor Final"}`,
    "",
    ...items.flatMap((item) => [`${item.parentLineId?'  ':''}${item.qty} ${item.unit || "UN"} - ${item.description}`, ...ItemPreparation.lines(item).map(line=>`  ${line}`)]),
    "",
    "Conferencia: __________________________"
  ].join("\n");
  if (pdvPeripheralPort?.writable) writePdvPeripheral(content).catch(() => downloadText(`pedido-cozinha-${Date.now()}.txt`, content));
  else downloadText(`pedido-cozinha-${today()}.txt`, content);
  audit("Pedido cozinha impresso", `${items.length} itens`);
  save();
}

function transferPdvTable() {
  const from = byId("pdv-table")?.value.trim();
  if (!from) return alert("Informe a mesa/comanda atual.");
  const to = prompt("Transferir para qual mesa/comanda?");
  if (!to) return;
  byId("pdv-table").value = to.trim();
  state.pdvTables = state.pdvTables || [];
  const table = state.pdvTables.find((row) => row.name === from) || { id: nextId(state.pdvTables), name: from };
  Object.assign(table, { status: "Transferida", transferredTo: to.trim(), transferredAt: new Date().toISOString(), operator: state.settings.user });
  if (!state.pdvTables.some((row) => row.id === table.id)) state.pdvTables.push(table);
  audit("Mesa transferida", `${from} -> ${to.trim()}`);
  save();
  renderShell();
}

function runTefAdmin() {
  audit("TEF administrativo acessado", state.cashRegister?.terminal || "SERIE 1");
  alert("TEF administrativo registrado. Configure o provedor TEF em Configuracoes para acionar a rotina externa.");
  save();
}

function openCashDrawer() {
  const command = "\x1B\x70\x00\x19\xFA";
  if (pdvPeripheralPort?.writable) writePdvPeripheral(command).catch(() => undefined);
  audit("Gaveta acionada", state.cashRegister?.terminal || "SERIE 1");
  alert("Comando de abertura da gaveta enviado/registrado.");
  save();
}

function bindCepAutocomplete(inputId, callback) {
  const input = byId(inputId);
  if (!input) return;
  let lastCep = "";
  const run = () => {
    const cep = digits(input.value);
    if (cep.length !== 8 || cep === lastCep) return;
    lastCep = cep;
    callback().catch(() => undefined);
  };
  input.addEventListener("input", run);
  input.addEventListener("blur", run);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") run();
  });
}

async function fetchCepData(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error("Consulta de CEP indisponivel");
  const data = await response.json();
  if (data.erro) throw new Error("CEP nao encontrado");
  return data;
}

async function lookupPersonCep() {
  const cep = digits(byId("person-cep")?.value);
  if (cep.length !== 8) return;
  try {
    const data = await fetchCepData(cep);
    byId("person-address").value = data.logradouro || "";
    byId("person-district").value = data.bairro || "";
    byId("person-city").value = data.localidade || "";
    byId("person-uf").value = data.uf || "";
  } catch {
    undefined;
  }
}

async function lookupSettingsCep() {
  const cep = digits(byId("set-cep")?.value);
  if (cep.length !== 8) return;
  try {
    const data = await fetchCepData(cep);
    byId("set-address").value = data.logradouro || "";
    byId("set-district").value = data.bairro || "";
    byId("set-city").value = data.localidade || "";
    byId("set-uf").value = data.uf || byId("set-uf").value;
    if (data.ibge && byId("set-city-code")) byId("set-city-code").value = data.ibge;
  } catch {
    undefined;
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
    birthDate: byId("person-birth")?.value || "",
    contactName: byId("person-contact")?.value || "",
    driverLicense: byId("person-driver-license")?.value || "",
    vehiclePlate: byId("person-vehicle-plate")?.value || "",
    rntrc: byId("person-rntrc")?.value || "",
    jobTitle: byId("person-job-title")?.value || "",
    creditAlert: byId("person-credit-alert")?.value === "true",
    paymentType: byId("person-payment-type")?.value || "",
    cep,
    address: byId("person-address").value,
    number: byId("person-number").value,
    district: byId("person-district").value,
    complement: byId("person-complement").value,
    city: byId("person-city").value,
    uf,
    notes: byId("person-notes")?.value || "",
    active: byId("person-active").value === "true"
  };
  if (editingPersonId) Object.assign(state.people.find((person) => person.id === editingPersonId), record);
  else state.people.push(record);
  selectedPersonId = record.id;
  audit(editingPersonId ? "Pessoa alterada" : "Pessoa cadastrada", name);
  editingPersonId = 0;
  pendingPersonDraft = {};
  save();
  renderShell();
}

function newPersonRecord(type = "") {
  editingPersonId = 0;
  selectedPersonId = 0;
  pendingPersonDraft = type ? { type } : {};
  currentTab = "dados";
  currentMode = "backoffice";
  currentModule = "people";
  if (type && personFilters.includes(type)) currentPeopleTab = type;
  setInternalRoute({ module: "people", people: currentPeopleTab, tab: "", fiscal: "", stock: "", settings: "" });
  renderShell();
}

async function copyPublicRegistrationLink() {
  const link = `${location.origin}/cadastro-cliente.html?unidade=${encodeURIComponent(state.settings.tenantCode)}`;
  try {
    await copyText(link);
    alert("Link de cadastro desta unidade copiado.");
  } catch {
    alert(`Nao foi possivel copiar automaticamente. Link: ${link}`);
  }
}

function editPersonRecord(id) {
  const person = state.people.find((row) => row.id === id);
  if (!person) return;
  editingPersonId = id;
  selectedPersonId = id;
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

function createCentralApprovalRequest(type, title, detail, payload) {
  state.approvalRequests = Array.isArray(state.approvalRequests) ? state.approvalRequests : [];
  const justification = prompt(`${title}\nInforme a justificativa para a Central autorizar:`) || "";
  if (!justification.trim()) {
    alert("A solicitacao precisa de justificativa para ser enviada a Central.");
    return null;
  }
  const request = {
    id: nextId(state.approvalRequests),
    type,
    title,
    detail,
    payload,
    justification: justification.trim(),
    status: "Pendente",
    requestedBy: state.settings.user,
    requestedAt: new Date().toISOString(),
    decidedBy: "",
    decidedAt: "",
    decisionNote: ""
  };
  state.approvalRequests.unshift(request);
  audit("Solicitacao enviada para Central", `${title}: ${detail}`);
  return request;
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
  if(pendingProductDraft.comboPricing?.enabled){try{window.ComboSales.validate(pendingProductDraft.comboPricing,state.products);}catch(error){return alert(error.message);}}
  const previousProduct = editingProductId ? state.products.find((product) => product.id === editingProductId) : null;
  const priceChanged = previousProduct && Math.abs(Number(previousProduct.price || 0) - price) > 0.009;
  if (priceChanged) {
    const request = createCentralApprovalRequest(
      "price_change",
      "Alteracao de preco de produto",
      `${description}: ${money(previousProduct.price)} para ${money(price)}`,
      { productId: previousProduct.id, product: description, oldPrice: Number(previousProduct.price || 0), newPrice: price }
    );
    if (!request) return;
    alert("Solicitacao enviada para a Central. O preco so sera alterado apos autorizacao.");
  }
  const composition = pendingComposition.map((component) => ({ ...component }));
  if (composition.length && composition.some((component) => !state.products.some((product) => product.id === component.productId))) return alert("A composicao possui componente inexistente.");
  const coverageOptions = commaOptionList(pendingProductDraft.coverageOptions);
  const toppingOptions = commaOptionList(pendingProductDraft.toppingOptions || pendingProductDraft.additionalOptions || pendingProductDraft.extrasOptions);
  const compositionCost = composition.reduce((sum, component) => {
    const product = state.products.find((row) => row.id === component.productId);
    return sum + Number(product?.cost || 0) * componentStockQty(component, product);
  }, 0);
  const record = {
    id: editingProductId || nextId(state.products),
    description,
    barcode,
    type,
    unit: byId("product-unit").value,
    brand: byId("product-brand").value,
    group: byId("product-group").value,
    location: byId("product-location").value,
    reference: pendingProductDraft.reference || "",
    sku: pendingProductDraft.sku || "",
    packaging: pendingProductDraft.packaging || "",
    fiscalStatus: pendingProductDraft.fiscalStatus || "Conferir",
    movesStock: pendingProductDraft.movesStock !== false,
    allowsSale: pendingProductDraft.allowsSale !== false,
    paysCommission: Boolean(pendingProductDraft.paysCommission),
    complementary: Boolean(pendingProductDraft.complementary),
    pairProduct: Boolean(pendingProductDraft.pairProduct),
    showInApp: Boolean(pendingProductDraft.showInApp),
    usesPriceTable: Boolean(pendingProductDraft.usesPriceTable),
    controlsImei: Boolean(pendingProductDraft.controlsImei),
    manufactured: Boolean(pendingProductDraft.manufactured) || type === "Produto fabricado",
    explodeKitNf: Boolean(pendingProductDraft.explodeKitNf),
    adultOnly: Boolean(pendingProductDraft.adultOnly),
    additional: Boolean(pendingProductDraft.additional),
    hasCoverage: Boolean(pendingProductDraft.hasCoverage || coverageOptions.length),
    coverageOptions,
    toppingOptions,
    ecommerceIntegration: Boolean(pendingProductDraft.ecommerceIntegration),
    kitchenRequest: Boolean(pendingProductDraft.kitchenRequest),
    medicine: Boolean(pendingProductDraft.medicine),
    activePrinciple: pendingProductDraft.activePrinciple || "",
    cost: composition.length && cost <= 0 ? compositionCost : cost,
    price: priceChanged ? Number(previousProduct.price || 0) : price,
    stock: Number(byId("product-stock").value || 0),
    minStock: Number(byId("product-min").value || 0),
    ncm: type === "Servico" ? "" : ncm,
    cest: digits(byId("product-cest")?.value),
    cfop: byId("product-cfop")?.value || "5102",
    cst: byId("product-cst")?.value || "102",
    cbsClass: byId("product-cbs")?.value || "000001",
    ibsClass: byId("product-ibs")?.value || "000001",
    fiscal: structuredClone(pendingProductDraft.fiscal || {}),
    reform: structuredClone(pendingProductDraft.reform || {}),
    photo: pendingProductPhoto,
    isBundle: byId("product-is-bundle")?.checked || composition.length > 0,
    comboPricing: structuredClone(pendingProductDraft.comboPricing || null),
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
    labelConfig: structuredClone(pendingProductDraft.labelConfig || {}),
    active: byId("product-active").value === "true"
  };
  if (editingProductId) Object.assign(state.products.find((product) => product.id === editingProductId), record);
  else state.products.push(record);
  selectedProductId = record.id;
  audit(editingProductId ? "Produto alterado" : "Produto cadastrado", description);
  save();
  editingProductId = 0;
  pendingProductPhoto = "";
  pendingComposition = [];
  pendingProductDraft = {};
  renderShell();
}

function newProductRecord(type = "") {
  editingProductId = 0;
  selectedProductId = 0;
  pendingProductPhoto = "";
  pendingComposition = [];
  pendingProductDraft = type ? { type, manufactured: type === "Produto fabricado" } : {};
  currentTab = "dados";
  currentMode = "backoffice";
  currentModule = "products";
  setInternalRoute({ module: "products", tab: currentTab, fiscal: "", stock: "", people: "", settings: "" });
  renderShell();
}

function renderComboBuilder() {
 const c=pendingProductDraft.comboPricing||{},flavors=state.products.filter(p=>p.active!==false&&p.allowsSale!==false&&window.ComboSales.isFlavor(p)&&Number(p.id)!==Number(editingProductId)),drinks=state.products.filter(p=>p.active!==false&&p.allowsSale!==false&&window.ComboSales.isDrink(p)&&!p.comboPricing?.enabled);
 return `<section class="form-card combo-builder"><h3>Combo de Tortelas — sabores escolhidos no PDV</h3><p>Um combo tem pelo menos 2 Tortelas. Cobertura e acompanhamentos sao escolhidos para cada uma na venda.</p><div class="grid two"><label>Nome do combo<input id="combo-name" value="${escapeAttr(pendingProductDraft.description||'')}" placeholder="Combo 2 Tortelas"></label><label>Tortelas por combo<input id="combo-count" type="number" min="2" max="20" step="1" value="${Number(c.tortelaCount||2)}"></label></div><h4>Sabores permitidos</h4><div class="combo-product-list">${flavors.map(p=>`<label class="pdv-preparation-option"><input type="checkbox" data-combo-flavor="${p.id}" ${(c.flavorIds||[]).some(id=>Number(id)===Number(p.id))?'checked':''}><span>${escapeHtml(p.description)} · ${money(p.price)}</span></label>`).join('')||'<p>Cadastre os sabores como produtos Tortela antes de montar o combo.</p>'}</div><div class="grid two"><label>Desconto nas Tortelas do combo<select id="combo-discount-type"><option value="percent" ${c.type!=='amount'?'selected':''}>Percentual (%)</option><option value="amount" ${c.type==='amount'?'selected':''}>Valor por combo (R$)</option></select></label><label>Desconto<input id="combo-discount" type="number" min="0" step="0.01" value="${Number(c.discount||0)}"></label></div><h4>Bebidas opcionais e desconto exclusivo no combo</h4><p>O operador escolhe quais incluir. O desconto de cada bebida so vale quando vendida dentro deste combo.</p><div class="combo-product-list">${drinks.map(p=>{const rule=(c.beverages||[]).find(b=>Number(b.productId)===Number(p.id));return `<div class="combo-beverage-rule"><label><input type="checkbox" data-combo-beverage="${p.id}" ${rule?'checked':''}> ${escapeHtml(p.description)} · ${money(p.price)}</label><label>Tipo<select id="combo-drink-type-${p.id}"><option value="percent" ${rule?.type!=='amount'?'selected':''}>Desconto %</option><option value="amount" ${rule?.type==='amount'?'selected':''}>Desconto R$ por unidade</option></select></label><label>Desconto<input id="combo-drink-discount-${p.id}" type="number" min="0" step="0.01" value="${Number(rule?.discount||0)}"></label></div>`;}).join('')||'<p>Nenhuma agua, refrigerante ou milkshake ativo encontrado.</p>'}</div><p id="combo-feedback" role="status"></p><button class="btn primary" type="button" id="apply-combo">Aplicar combo ao cadastro</button><button class="btn" type="button" id="new-combo">Novo combo</button><p>Depois de aplicar, clique em Salvar novo ou Salvar alteracao. O preco final depende dos sabores e bebidas escolhidos; cada produto mantem sua propria tributacao.</p></section>`;
}
function bindComboBuilder() {
 if(!byId('apply-combo'))return;
 byId('new-combo').addEventListener('click',()=>{newProductRecord('Mercadoria para revenda');currentTab='composicao';setInternalRoute({module:'products',tab:currentTab});renderShell();});
 byId('apply-combo').addEventListener('click',()=>{try{
 const name=byId('combo-name').value.trim();if(!name)throw Error('Informe o nome do combo.');
 const config={enabled:true,dynamic:true,tortelaCount:Number(byId('combo-count').value),flavorIds:[...document.querySelectorAll('[data-combo-flavor]:checked')].map(i=>Number(i.dataset.comboFlavor)),type:byId('combo-discount-type').value,discount:Number(byId('combo-discount').value),beverages:[...document.querySelectorAll('[data-combo-beverage]:checked')].map(i=>({productId:Number(i.dataset.comboBeverage),type:byId('combo-drink-type-'+i.dataset.comboBeverage).value,discount:Number(byId('combo-drink-discount-'+i.dataset.comboBeverage).value)}))};
 window.ComboSales.validate(config,state.products);captureProductDraft();pendingComposition=[];pendingProductDraft.comboPricing=config;pendingProductDraft.description=name;
 const lowest=Math.min(...config.flavorIds.map(id=>Number(state.products.find(p=>Number(p.id)===id).price)));const base=lowest*config.tortelaCount;const price=Math.round((base-(config.type==='percent'?base*config.discount/100:config.discount))*100)/100;
 pendingProductDraft.price=price;byId('product-description').value=name;byId('product-price').value=price;byId('product-is-bundle').checked=false;renderShell();byId('combo-feedback').textContent='Combo aplicado. Salve o cadastro para liberar a escolha dos sabores no PDV.';
 }catch(error){byId('combo-feedback').textContent=error.message;}});
}

function addCompositionRecord() {
  captureProductDraft();
  const componentId = Number(byId("composition-product")?.value || 0);
  const qty = Number(byId("composition-qty")?.value || 0);
  const useUnit = byId("composition-use-unit")?.value || "AUTO";
  const mode = byId("composition-mode")?.value || "sale";
  if (!componentId || qty <= 0) {
    alert("Informe o componente e a quantidade usada.");
    return;
  }
  if (pendingComposition.some((component) => component.productId === componentId && component.mode !== mode)) {
    alert("Este componente ja foi incluido com outro tipo de baixa. Remova-o antes de alterar.");
    return;
  }
  const normalizedUseUnit = useUnit === "AUTO" ? "" : useUnit;
  const existing = pendingComposition.find((component) => component.productId === componentId && component.mode === mode && (component.useUnit || "") === normalizedUseUnit);
  if (existing) existing.qty += qty;
  else pendingComposition.push({ productId: componentId, qty, useUnit: normalizedUseUnit, mode });
  const bundleCheck = byId("product-is-bundle");
  if (bundleCheck) bundleCheck.checked = true;
  renderShell();
}

function captureProductDraft() {
  if (!byId("product-form")) return;
  const previous = pendingProductDraft;
  pendingProductDraft = {
    comboPricing: previous.comboPricing || null,
    description: byId("product-description")?.value || "",
    barcode: byId("product-barcode")?.value || "",
    type: byId("product-type")?.value || "Mercadoria para revenda",
    unit: byId("product-unit")?.value || "UN",
    brand: byId("product-brand")?.value || "",
    group: byId("product-group")?.value || "",
    location: byId("product-location")?.value || "",
    reference: byId("product-reference")?.value || previous.reference || "",
    sku: byId("product-sku")?.value || previous.sku || "",
    packaging: byId("product-packaging")?.value || previous.packaging || "",
    fiscalStatus: byId("product-fiscal-status")?.value || previous.fiscalStatus || "Conferir",
    movesStock: byId("product-moves-stock") ? byId("product-moves-stock").checked : previous.movesStock !== false,
    allowsSale: byId("product-allows-sale") ? byId("product-allows-sale").checked : previous.allowsSale !== false,
    paysCommission: byId("product-pays-commission") ? byId("product-pays-commission").checked : Boolean(previous.paysCommission),
    complementary: byId("product-complementary") ? byId("product-complementary").checked : Boolean(previous.complementary),
    pairProduct: byId("product-pair-product") ? byId("product-pair-product").checked : Boolean(previous.pairProduct),
    showInApp: byId("product-show-app") ? byId("product-show-app").checked : Boolean(previous.showInApp),
    usesPriceTable: byId("product-uses-price-table") ? byId("product-uses-price-table").checked : Boolean(previous.usesPriceTable),
    controlsImei: byId("product-controls-imei") ? byId("product-controls-imei").checked : Boolean(previous.controlsImei),
    manufactured: byId("product-manufactured") ? byId("product-manufactured").checked : Boolean(previous.manufactured),
    explodeKitNf: byId("product-explode-kit-nf") ? byId("product-explode-kit-nf").checked : Boolean(previous.explodeKitNf),
    adultOnly: byId("product-adult-only") ? byId("product-adult-only").checked : Boolean(previous.adultOnly),
    additional: byId("product-additional") ? byId("product-additional").checked : Boolean(previous.additional),
    hasCoverage: byId("product-has-coverage") ? byId("product-has-coverage").checked : Boolean(previous.hasCoverage),
    coverageOptions: commaOptionList(byId("product-coverage-options") ? byId("product-coverage-options").value : previous.coverageOptions),
    toppingOptions: commaOptionList(byId("product-topping-options") ? byId("product-topping-options").value : (previous.toppingOptions || previous.additionalOptions || previous.extrasOptions)),
    ecommerceIntegration: byId("product-ecommerce") ? byId("product-ecommerce").checked : Boolean(previous.ecommerceIntegration),
    kitchenRequest: byId("product-kitchen-request") ? byId("product-kitchen-request").checked : Boolean(previous.kitchenRequest),
    medicine: byId("product-medicine") ? byId("product-medicine").checked : Boolean(previous.medicine),
    activePrinciple: byId("product-active-principle")?.value || previous.activePrinciple || "",
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
    fiscal: structuredClone(previous.fiscal || {}),
    reform: structuredClone(previous.reform || {}),
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
    commissionRate: previous.commissionRate || 0,
    labelConfig: structuredClone(previous.labelConfig || {})
  };
  pendingProductDraft.labelConfig = {
    model: byId("label-model")?.value ?? pendingProductDraft.labelConfig?.model ?? state.settings.labelModel ?? "EAN13",
    copies: Number(byId("label-copies")?.value ?? pendingProductDraft.labelConfig?.copies ?? 1),
    width: Number(byId("label-width")?.value ?? pendingProductDraft.labelConfig?.width ?? 60),
    height: Number(byId("label-height")?.value ?? pendingProductDraft.labelConfig?.height ?? 35),
    columns: Number(byId("label-columns")?.value ?? pendingProductDraft.labelConfig?.columns ?? 2),
    showPrice: byId("label-show-price") ? byId("label-show-price").checked : pendingProductDraft.labelConfig?.showPrice !== false,
    showCompany: byId("label-show-company") ? byId("label-show-company").checked : pendingProductDraft.labelConfig?.showCompany !== false,
    showSku: byId("label-show-sku") ? byId("label-show-sku").checked : Boolean(pendingProductDraft.labelConfig?.showSku)
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
  pendingProductDraft.fiscal = {
    ...(pendingProductDraft.fiscal || {}),
    cst: byId("product-fiscal-cst")?.value ?? pendingProductDraft.fiscal?.cst,
    csosn: byId("product-fiscal-csosn")?.value ?? pendingProductDraft.fiscal?.csosn,
    origin: byId("product-origin")?.value ?? pendingProductDraft.fiscal?.origin ?? "0 Nacional",
    cbenef: byId("product-cbenef")?.value ?? pendingProductDraft.fiscal?.cbenef ?? "",
    motDeson: byId("product-mot-deson")?.value ?? pendingProductDraft.fiscal?.motDeson ?? "",
    icmsInternalRate: byId("product-icms-internal-rate")?.value ?? pendingProductDraft.fiscal?.icmsInternalRate ?? 0,
    cfopExternal: byId("product-cfop-external")?.value ?? pendingProductDraft.fiscal?.cfopExternal ?? "",
    cstExternal: byId("product-cst-external")?.value ?? pendingProductDraft.fiscal?.cstExternal ?? "",
    icmsExternalRate: byId("product-icms-external-rate")?.value ?? pendingProductDraft.fiscal?.icmsExternalRate ?? 0,
    icmsBaseReduction: byId("product-icms-base-reduction")?.value ?? pendingProductDraft.fiscal?.icmsBaseReduction ?? 0,
    icmsStRate: byId("product-icms-st-rate")?.value ?? pendingProductDraft.fiscal?.icmsStRate ?? 0,
    icmsDeferralRate: byId("product-icms-deferral")?.value ?? pendingProductDraft.fiscal?.icmsDeferralRate,
    retainedStBase: byId("product-retained-st-base")?.value ?? pendingProductDraft.fiscal?.retainedStBase,
    retainedStRate: byId("product-retained-st-rate")?.value ?? pendingProductDraft.fiscal?.retainedStRate,
    retainedStValue: byId("product-retained-st-value")?.value ?? pendingProductDraft.fiscal?.retainedStValue,
    icmsSubstituteValue: byId("product-icms-substitute-value")?.value ?? pendingProductDraft.fiscal?.icmsSubstituteValue,
    retainedFcpBase: byId("product-retained-fcp-base")?.value ?? pendingProductDraft.fiscal?.retainedFcpBase,
    retainedFcpRate: byId("product-retained-fcp-rate")?.value ?? pendingProductDraft.fiscal?.retainedFcpRate,
    retainedFcpValue: byId("product-retained-fcp-value")?.value ?? pendingProductDraft.fiscal?.retainedFcpValue,
    mva: byId("product-mva")?.value ?? pendingProductDraft.fiscal?.mva ?? 0,
    fcpRate: byId("product-fcp-rate")?.value ?? pendingProductDraft.fiscal?.fcpRate ?? 0,
    ipi: readAdvancedFiscal('ipi',pendingProductDraft.fiscal?.ipi),
    difal: readAdvancedFiscal('difal',pendingProductDraft.fiscal?.difal),
    fuel: readAdvancedFiscal('fuel',pendingProductDraft.fiscal?.fuel),
    ipiCst: byId("product-ipi-cst")?.value ?? pendingProductDraft.fiscal?.ipiCst ?? "",
    ipiRate: byId("product-ipi-rate")?.value ?? pendingProductDraft.fiscal?.ipiRate ?? 0,
    pisInCst: byId("product-pis-in-cst")?.value ?? pendingProductDraft.fiscal?.pisInCst ?? "",
    pisOutCst: byId("product-pis-out-cst")?.value ?? pendingProductDraft.fiscal?.pisOutCst ?? "",
    pisRate: byId("product-pis-rate")?.value ?? pendingProductDraft.fiscal?.pisRate ?? 0,
    cofinsInCst: byId("product-cofins-in-cst")?.value ?? pendingProductDraft.fiscal?.cofinsInCst ?? "",
    cofinsOutCst: byId("product-cofins-out-cst")?.value ?? pendingProductDraft.fiscal?.cofinsOutCst ?? "",
    cofinsRate: byId("product-cofins-rate")?.value ?? pendingProductDraft.fiscal?.cofinsRate ?? 0,
    revenueNature: byId("product-revenue-nature")?.value ?? pendingProductDraft.fiscal?.revenueNature ?? "",
    note: byId("product-fiscal-note")?.value ?? pendingProductDraft.fiscal?.note ?? ""
  };
  pendingProductDraft.reform = {
    ...(pendingProductDraft.reform || {}),
    rtcMono: readAdvancedFiscal('rtcMono',pendingProductDraft.reform?.rtcMono),
    rtcCredit: readAdvancedFiscal('rtcCredit',pendingProductDraft.reform?.rtcCredit),
    classTrib: byId("product-class-trib")?.value ?? pendingProductDraft.reform?.classTrib ?? pendingProductDraft.ibsClass ?? "000001",
    cst: byId("product-reform-cst")?.value ?? pendingProductDraft.reform?.cst ?? "",
    rateYear: byId("product-cbs-rate-year")?.value ?? pendingProductDraft.reform?.rateYear,
    cbsRate: byId("product-cbs-rate")?.value ?? pendingProductDraft.reform?.cbsRate ?? 0,
    ibsUfRate: byId("product-ibs-uf-rate")?.value ?? pendingProductDraft.reform?.ibsUfRate ?? 0,
    ibsCityRate: byId("product-ibs-city-rate")?.value ?? pendingProductDraft.reform?.ibsCityRate ?? 0,
    ibsReduction: byId("product-ibs-reduction")?.value ?? pendingProductDraft.reform?.ibsReduction,
    cbsReduction: byId("product-cbs-reduction")?.value ?? pendingProductDraft.reform?.cbsReduction,
    ibsUfDeferral: byId("product-uf-deferral")?.value ?? pendingProductDraft.reform?.ibsUfDeferral,
    ibsCityDeferral: byId("product-city-deferral")?.value ?? pendingProductDraft.reform?.ibsCityDeferral,
    cbsDeferral: byId("product-cbs-deferral")?.value ?? pendingProductDraft.reform?.cbsDeferral,
    reduction: byId("product-reform-reduction")?.value ?? pendingProductDraft.reform?.reduction ?? 0,
    deferral: byId("product-reform-deferral")?.value ?? pendingProductDraft.reform?.deferral ?? 0,
    presumedCredit: byId("product-presumed-credit")?.value ?? pendingProductDraft.reform?.presumedCredit ?? 0,
    selectiveTax: byId("product-selective-tax")?.value ?? pendingProductDraft.reform?.selectiveTax ?? 0,
    selectiveTaxCst: byId("product-selective-tax-cst")?.value ?? pendingProductDraft.reform?.selectiveTaxCst ?? "",
    selectiveTaxClass: byId("product-selective-tax-class")?.value ?? pendingProductDraft.reform?.selectiveTaxClass ?? "",
    from: byId("product-reform-from")?.value ?? pendingProductDraft.reform?.from ?? "",
    monophase: byId("product-reform-monophase") ? byId("product-reform-monophase").value === "true" : Boolean(pendingProductDraft.reform?.monophase),
    adRemRate: byId("product-ad-rem-rate")?.value ?? pendingProductDraft.reform?.adRemRate ?? 0,
    adRemUnit: byId("product-ad-rem-unit")?.value ?? pendingProductDraft.reform?.adRemUnit ?? "",
    imported: byId("product-imported") ? byId("product-imported").checked : Boolean(pendingProductDraft.reform?.imported),
    capitalGood: byId("product-capital-good") ? byId("product-capital-good").checked : Boolean(pendingProductDraft.reform?.capitalGood),
    returnRule: byId("product-return-rule") ? byId("product-return-rule").checked : Boolean(pendingProductDraft.reform?.returnRule),
    exteriorOperation: byId("product-exterior-operation") ? byId("product-exterior-operation").checked : Boolean(pendingProductDraft.reform?.exteriorOperation)
  };
  pendingProductDraft.promotion = {
    from: byId("product-promo-from")?.value ?? pendingProductDraft.promotion?.from ?? "",
    to: byId("product-promo-to")?.value ?? pendingProductDraft.promotion?.to ?? "",
    minQty: byId("product-promo-qty")?.value ?? pendingProductDraft.promotion?.minQty ?? 0,
    price: byId("product-promo-price")?.value ?? pendingProductDraft.promotion?.price ?? 0,
    retailPercent: byId("product-promo-retail-percent")?.value ?? pendingProductDraft.promotion?.retailPercent ?? 0,
    wholesalePercent: byId("product-promo-wholesale-percent")?.value ?? pendingProductDraft.promotion?.wholesalePercent ?? 0,
    wholesaleQty: byId("product-promo-wholesale-qty")?.value ?? pendingProductDraft.promotion?.wholesaleQty ?? 0,
    name: byId("product-promo-name")?.value ?? pendingProductDraft.promotion?.name ?? ""
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
  selectedProductId = id;
  pendingProductDraft = structuredClone(product);
  pendingComposition = structuredClone(product.composition || []);
  pendingProductPhoto = product.photo || "";
  currentTab = "dados";
  renderShell();
  document.querySelector(".product-edit-panel")?.scrollIntoView({block:"start", behavior:"smooth"});
  byId("product-description")?.focus({preventScroll:true});
}

function toggleProductRecord(id) {
  const product = state.products.find((row) => row.id === id);
  if (!product) return;
  product.active = product.active === false;
  audit(product.active ? "Produto ativado" : "Produto inativado", product.description);
  save();
  renderShell();
}

function openProductLabelTab(id) {
  if (id) selectedProductId = Number(id);
  const product = state.products.find((row) => Number(row.id) === Number(selectedProductId));
  if (product && !editingProductId) pendingProductDraft = { ...pendingProductDraft, labelConfig: structuredClone(product.labelConfig || pendingProductDraft.labelConfig || {}) };
  currentTab = "etiquetas";
  setInternalRoute({ module: "products", tab: currentTab });
  renderShell();
}

function printProductLabel(id) {
  const product = state.products.find((row) => row.id === id);
  if (!product) return alert("Selecione um produto para gerar a etiqueta.");
  const config = currentLabelConfig();
  const copies = Math.max(1, Math.min(99, Number(config.copies || 1)));
  const columns = Math.max(1, Math.min(4, Number(config.columns || 2)));
  const labels = Array.from({ length: copies }, () => labelPreviewHtml(product, config)).join("");
  downloadText(`etiquetas-${product.id}.html`, `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Etiquetas ${escapeHtml(product.description)}</title>
<style>
body{font-family:Arial,sans-serif;margin:12px;color:#07162f}
.sheet{display:grid;grid-template-columns:repeat(${columns}, ${config.width}mm);gap:4mm;align-items:start}
.product-label-preview{box-sizing:border-box;width:${config.width}mm;min-height:${config.height}mm;border:1px solid #111;padding:3mm;display:grid;gap:1.5mm;align-content:center;text-align:center;page-break-inside:avoid}
.product-label-preview strong{font-size:10pt;line-height:1.1}
.product-label-preview b{font-size:14pt}
.product-label-preview small,.product-label-preview em{font-size:8pt;color:#111;font-style:normal}
.barcode-art{height:12mm;display:flex;align-items:end;justify-content:center;gap:.45mm;margin-top:1mm}
.barcode-art i{display:block;background:#000;min-height:5mm}
@media print{body{margin:0}.product-label-preview{break-inside:avoid}}
</style>
</head>
<body><div class="sheet">${labels}</div></body>
</html>`);
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
  requirements.forEach((requirement) => {
    const raw = state.products.find((item) => item.id === requirement.productId);
    if (raw) {
      raw.stock -= requirement.qty;
      addStockMovement(raw, "Baixa producao", -requirement.qty, `Componente de ${product.description}`);
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
  const details = {
    lot: byId("stock-lot").value.trim(),
    expiry: byId("stock-expiry").value,
    location: byId("stock-location").value.trim(),
    serials: parseSerials(byId("stock-serials").value)
  };
  const direction = type === "Entrada" || type === "Ajuste" ? qty : -qty;
  const request = createCentralApprovalRequest(
    "stock_adjustment",
    "Ajuste manual de estoque",
    `${type} ${qty} ${product.unit} - ${product.description}`,
    { productId: product.id, product: product.description, qty, direction, type, history: byId("stock-history").value, details }
  );
  if (!request) return;
  alert("Solicitacao enviada para a Central. O estoque so sera ajustado apos autorizacao.");
  save();
  renderShell();
  return;
  if (type === "Entrada" || type === "Ajuste") product.stock += qty;
  else {
    if (product.stock < qty) {
      alert(`Estoque insuficiente. Saldo atual: ${product.stock} ${product.unit}.`);
      return;
    }
    product.stock -= qty;
  }
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
  const request = createCentralApprovalRequest(
    "stock_inventory",
    "Inventario/Ajuste de saldo",
    `${product.description}: saldo contado ${counted}`,
    { productId: product.id, product: product.description, counted, lot, serial }
  );
  if (!request) return;
  alert("Solicitacao enviada para a Central. O inventario so sera aplicado apos autorizacao.");
  save();
  renderShell();
  return;
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

function receiveCentralShipmentQr() {
  if (!requirePermission("stock_adjust")) return;
  const raw = byId("central-shipment-qr")?.value.trim();
  if (!raw) return alert("Leia ou cole o QR da remessa da Central.");
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return alert("QR invalido. O conteudo precisa ser JSON da remessa da Central.");
  }
  if (payload.type !== "tortela-central-shipment" || !Array.isArray(payload.items) || !payload.items.length) {
    return alert("QR nao corresponde a uma remessa da Central Tortela.");
  }
  const applied = [];
  for (const item of payload.items) {
    const product = state.products.find((row) => Number(row.id) === Number(item.productId) || (item.barcode && row.barcode === item.barcode));
    const qty = Number(item.qty || item.quantity || 0);
    if (!product || qty <= 0) continue;
    product.stock = Number(product.stock || 0) + qty;
    const details = { lot: item.lot || payload.lot || "", expiry: item.expiry || payload.expiry || "", location: "Recebimento Central", serials: Array.isArray(item.serials) ? item.serials : [] };
    addStockMovement(product, "Entrada Central QR", qty, `Remessa Central ${payload.shipmentId || payload.id || ""}`.trim(), details);
    if (details.lot) upsertStockLot(product, details.lot, details.expiry, qty);
    registerStockSerials(product, details.serials, details.lot, `Remessa Central ${payload.shipmentId || payload.id || ""}`.trim());
    applied.push(`${product.description}: ${qty} ${product.unit}`);
  }
  if (!applied.length) return alert("Nenhum item do QR foi localizado nos produtos da unidade.");
  audit("Entrada por QR da Central", applied.join("; "));
  save();
  alert(`Entrada concluida:\n${applied.join("\n")}`);
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

function openPurchaseXmlPicker() {
  byId("purchase-xml")?.click();
}

function clearPurchaseItemsRecord() {
  purchaseItems = [];
  renderShell();
}

function focusPurchaseStep(step) {
  const targets = {
    document: ["purchase-step-document", "purchase-supplier"],
    items: ["purchase-step-items", "purchase-product"],
    history: ["purchase-step-history", ""]
  };
  const [sectionId, fieldId] = targets[step] || targets.document;
  const section = byId(sectionId);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  section.focus({ preventScroll: true });
  const field = fieldId ? byId(fieldId) : null;
  if (field) setTimeout(() => field.focus(), 160);
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

function clearOrderItemsRecord() {
  orderItems = [];
  renderShell();
}

function focusSalesStep(step) {
  const targets = {
    order: ["sales-step-order", "order-customer"],
    items: ["sales-step-items", "order-product"],
    history: ["sales-step-history", ""]
  };
  const [sectionId, fieldId] = targets[step] || targets.order;
  const section = byId(sectionId);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  section.focus({ preventScroll: true });
  const field = fieldId ? byId(fieldId) : null;
  if (field) setTimeout(() => field.focus(), 160);
}

function focusOnlineStep(step) {
  const targets = {
    board: "online-step-board",
    links: "online-step-links",
    history: "online-step-history"
  };
  const section = byId(targets[step] || targets.board);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  section.focus({ preventScroll: true });
}

function focusFiscalStep(step) {
  const targets = {
    form: "fiscal-step-form",
    rules: "fiscal-step-rules",
    queue: "fiscal-step-queue"
  };
  const section = byId(targets[step] || targets.form);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  section.focus({ preventScroll: true });
}

function focusReportStep(step) {
  const targets = {
    period: "report-step-period",
    preview: "report-step-preview",
    audit: "report-step-audit"
  };
  const section = byId(targets[step] || targets.preview);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  section.focus({ preventScroll: true });
}

function focusCurrentSettingsPane() {
  const pane = document.querySelector(`.settings-pane[data-settings-pane="${currentSettingsTab}"]`);
  if (!pane) return;
  pane.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!pane.hasAttribute("tabindex")) pane.setAttribute("tabindex", "-1");
  pane.focus({ preventScroll: true });
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
    const shortage = stockShortages(saleStockRequirements(sale.items), true);
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
  const shortage = stockShortages(saleStockRequirements(quote.items || []), true);
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

function printProductsList() {
  const query = (byId("product-search")?.value ?? productSearch).trim().toLowerCase();
  const rows = state.products.filter((product) => (productStatusFilter === "all" || (productStatusFilter === "active" ? product.active !== false : product.active === false)) && (!query || [product.id, product.description, product.barcode, product.brand, product.group, product.ncm].some((value) => String(value || "").toLowerCase().includes(query))));
  const report = window.open("", "_blank");
  if (!report) return alert("Permita a janela de impressão e tente novamente.");
  report.opener = null;
  const title = "Produtos — " + ({all:"Todos",active:"Ativos",inactive:"Inativos"}[productStatusFilter] || "Todos");
  report.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeAttr(title)}</title><style>body{font:14px Arial,sans-serif;color:#152b3b;padding:24px}h1{font-size:24px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left}th{background:#fff5a6}thead{display:table-header-group}tr{break-inside:avoid}button{padding:10px 20px;background:#14743b;color:white;border:0;border-radius:8px}@media print{button{display:none}body{padding:0}}</style></head><body><button onclick="window.print()">Imprimir / Salvar em PDF</button><h1>${escapeAttr(title)}</h1><p>${escapeAttr(state.settings.company || "Tortela Plus")} · ${today()} · ${rows.length} produto(s)</p>${query?`<p>Busca: ${escapeAttr(query)}</p>`:""}<table><thead><tr><th>Código</th><th>Produto</th><th>Preço</th><th>Estoque</th><th>Situação</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${escapeAttr(p.id)}</td><td>${escapeAttr(p.description)}</td><td>${money(p.price)}</td><td>${escapeAttr(p.stock)}</td><td>${p.active===false?"Inativo":"Ativo"}</td></tr>`).join("") || '<tr><td colspan="5">Nenhum produto encontrado.</td></tr>'}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
  report.document.close();
}

function exportProductsList() {
  const query = (byId("product-search")?.value ?? productSearch).trim().toLowerCase();
  const rows = state.products.filter((product) => (productStatusFilter === "all" || (productStatusFilter === "active" ? product.active !== false : product.active === false)) && (!query || [product.id, product.description, product.barcode, product.brand, product.group, product.ncm].some((value) => String(value || "").toLowerCase().includes(query))));
  downloadText(`produtos-${today()}.csv`, [
    "Codigo;Referencia;SKU;Descricao;Tipo;NCM;CFOP;CST;Preco;Estoque;Minimo;Fiscal;Ecommerce;Cozinha;Status",
    ...rows.map((product) => [product.id, product.reference || "", product.sku || "", product.description, product.type, product.ncm || "", product.cfop || "", product.cst || "", product.price || 0, product.stock || 0, product.minStock || 0, product.fiscalStatus || "Conferir", product.ecommerceIntegration ? "Sim" : "Nao", product.kitchenRequest ? "Sim" : "Nao", product.active === false ? "Inativo" : "Ativo"].map(csvCell).join(";"))
  ].join("\n"));
}

function printPeopleList() {
  const query = personSearch.trim().toLowerCase();
  const filter = ["Cliente", "Fornecedor", "Funcionario", "Parceiro"].includes(currentTab) ? currentTab : "";
  const rows = state.people.filter((person) => (!filter || person.type === filter) && (!query || [person.name, person.alias, person.document, person.city, person.phone].some((value) => String(value || "").toLowerCase().includes(query))));
  downloadText(`pessoas-${today()}.csv`, [
    "Codigo;Tipo;Nome;Fantasia;CPF/CNPJ;Telefone;Cidade;UF;Status",
    ...rows.map((person) => [person.id, person.type, person.name, person.alias || "", person.document || "", person.phone || "", person.city || "", person.uf || "", person.active === false ? "Inativo" : "Ativo"].map(csvCell).join(";"))
  ].join("\n"));
}

function updateOnlineOrderStatus(id, status) {
  const sale = state.sales.find((row) => Number(row.id) === Number(id) && row.onlineOrder);
  if (!sale) return;
  if (status === "Cancelado" && !confirm(`Cancelar o pedido online ${id}? O estoque sera estornado.`)) return;
  if (status === "Cancelado" && sale.status !== "Cancelado") {
    restoreSaleStock(sale.items || [], id);
    state.receivables.filter((row) => Number(row.sourceSaleId) === Number(id) && !row.paid).forEach((row) => {
      row.cancelled = true;
      row.paid = true;
      row.balance = 0;
    });
  }
  sale.status = status;
  sale.updatedAt = new Date().toISOString();
  if (status === "Conferido") sale.checkedAt = sale.updatedAt;
  if (status === "Pronto") sale.readyAt = sale.updatedAt;
  if (status === "Saiu para entrega") sale.deliveryStartedAt = sale.updatedAt;
  if (status === "Entregue") sale.deliveredAt = sale.updatedAt;
  audit(`Pedido online ${status.toLowerCase()}`, `Pedido ${sale.id} - ${sale.customer}`);
  save();
  renderShell();
}

function onlineOrderReceipt(sale) {
  const customer = sale.customerData || {};
  const lines = [
    state.settings.company,
    `PEDIDO ONLINE ${sale.id}`,
    `Data: ${sale.date || today()}  Status: ${sale.status || "Aberto"}`,
    `Cliente: ${sale.customer}`,
    `Telefone: ${customer.phone || "-"}`,
    `Endereco: ${[customer.address, customer.number, customer.district].filter(Boolean).join(", ")}`,
    `${[customer.city, customer.uf, customer.cep].filter(Boolean).join(" - ")}`,
    `Entrega: ${sale.delivery || "Entrega"}  Pagamento: ${sale.payment || "PIX"}`,
    "",
    "ITENS"
  ];
  (sale.items || []).forEach((item) => {
    lines.push(`${item.qty} ${item.unit || "UN"} x ${item.description}`);
    lines.push(...ItemPreparation.lines(item).map(line=>`  ${line}`));
    lines.push(`  ${money(item.price)}  Total ${money(Number(item.qty || 0) * Number(item.price || 0))}`);
  });
  lines.push("", `TOTAL: ${money(sale.total || 0)}`, "", "Assinatura/recebimento: __________________________");
  return lines.join("\n");
}

function printOnlineOrder(id) {
  const sale = state.sales.find((row) => Number(row.id) === Number(id) && row.onlineOrder);
  if (!sale) return;
  sale.receiptPrintedAt = new Date().toISOString();
  audit("Comprovante pedido online impresso", `Pedido ${sale.id}`);
  save();
  downloadText(`comprovante-pedido-online-${sale.id}.txt`, onlineOrderReceipt(sale));
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
    else {
      item.customer = byId("finance-name").value;
      item.wallet = byId("finance-wallet")?.value || "";
      item.ourNumber = byId("finance-our-number")?.value || `${today().replace(/\D/g, "")}${String(item.id).padStart(5, "0")}`;
      item.boletoStatus = "A emitir";
    }
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

function generateBoletoRemittance() {
  const rows = (state.receivables || []).filter((row) => !row.paid && !row.cancelled);
  if (!rows.length) return alert("Nao ha contas a receber abertas para remessa.");
  rows.forEach((row) => {
    row.ourNumber = row.ourNumber || `${today().replace(/\D/g, "")}${String(row.id).padStart(5, "0")}`;
    row.wallet = row.wallet || "109";
    row.boletoStatus = "Remessa gerada";
    row.remittanceAt = new Date().toISOString();
  });
  const content = [
    `REMESSA TORTELA ${state.settings.company} ${today()}`,
    "id;documento;cliente;vencimento;valor;carteira;nosso_numero",
    ...rows.map((row) => [row.id, row.document || "", row.customer || "", row.due, Number(row.value || 0).toFixed(2), row.wallet, row.ourNumber].map(csvCell).join(";"))
  ].join("\n");
  downloadText(`remessa-boletos-${today()}.csv`, content);
  audit("Remessa de boletos gerada", `${rows.length} titulo(s)`);
  save();
  renderShell();
}

function printIssuedBills() {
  const rows = (state.receivables || []).filter((row) => row.ourNumber);
  if (!rows.length) return alert("Nao ha boletos emitidos.");
  const content = rows.map((row) => [
    state.settings.company,
    `BOLETO ${row.ourNumber}`,
    `Cliente: ${row.customer || ""}`,
    `Documento: ${row.document || row.id}`,
    `Vencimento: ${row.due}`,
    `Valor: ${money(row.value)}`,
    `Status: ${row.boletoStatus || "Aberto"}`,
    ""
  ].join("\n")).join("\n");
  downloadText(`boletos-emitidos-${today()}.txt`, content);
  audit("Boletos emitidos impressos", `${rows.length} titulo(s)`);
}

function importBoletoReturn(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lines = String(reader.result || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    let paid = 0;
    lines.forEach((line) => {
      const parts = line.includes(";") ? line.split(";") : line.split(/\s+/);
      const ourNumber = parts.find((part) => /^\d{8,}$/.test(part));
      const amountText = [...parts].reverse().find((part) => /^\d+([,.]\d{2})?$/.test(part));
      const row = (state.receivables || []).find((item) => item.ourNumber === ourNumber || String(item.id) === parts[0]);
      if (!row || row.paid) return;
      const amount = Number(String(amountText || row.value).replace(",", "."));
      row.paidValue = Math.min(Number(row.value || 0), Number(row.paidValue || 0) + amount);
      row.balance = financeBalance(row);
      row.paid = row.balance <= 0.009;
      row.boletoStatus = row.paid ? "Liquidado por retorno" : "Retorno parcial";
      row.returnAt = new Date().toISOString();
      if (row.paid) row.paidAt = today();
      paid += 1;
      state.cash.push({ id: nextId(state.cash), date: today(), account: row.accountCode || "1.1.01", history: `Retorno boleto ${row.ourNumber}`, in: amount, out: 0 });
    });
    audit("Retorno de boletos importado", `${paid} titulo(s) baixado(s)`);
    save();
    renderShell();
  };
  reader.readAsText(file);
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
  if (state.chartOfAccounts.some((account) => account.code === code && Number(account.id) !== Number(editingAccountId))) return alert("Ja existe uma conta com este codigo.");
  const existingAccount = state.chartOfAccounts.find((account) => Number(account.id) === Number(editingAccountId));
  const record = { id: existingAccount?.id || nextId(state.chartOfAccounts), code, name, type: byId("account-type").value, active: existingAccount?.active !== false };
  if (existingAccount) Object.assign(existingAccount, record);
  else state.chartOfAccounts.push(record);
  audit(existingAccount ? "Conta contabil alterada" : "Conta contabil cadastrada", `${code} - ${name}`);
  editingAccountId = 0;
  save();
  renderShell();
}

function editChartAccount(id) {
  const account = (state.chartOfAccounts || []).find((row) => Number(row.id) === Number(id));
  if (!account) return;
  editingAccountId = id;
  renderShell();
}

function toggleChartAccount(id) {
  const account = (state.chartOfAccounts || []).find((row) => Number(row.id) === Number(id));
  if (!account) return;
  account.active = account.active === false;
  if (Number(editingAccountId) === Number(id) && account.active === false) editingAccountId = 0;
  audit(account.active ? "Conta contabil ativada" : "Conta contabil inativada", `${account.code} - ${account.name}`);
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
  const fiscalProfile=window.TortelaFiscalRegimes.profile({regime:byId("set-regime").value,crt:byId("set-crt").value});
  if(fiscalProfile.errors.length)return alert(fiscalProfile.errors.join(", "));
  state.settings.company = company;
  state.settings.document = document;
  state.settings.stateRegistration = byId("set-ie").value;
  state.settings.municipalRegistration = byId("set-im").value;
  state.settings.uf = uf;
  state.settings.regime = byId("set-regime").value;
  state.settings.crt = byId("set-crt").value;
  state.settings.fiscalEnvironment = byId("set-env").value;
  state.settings.fiscalEngine = byId("set-fiscal-engine").value;
  state.settings.acbrHost = byId("set-acbr-host").value;
  state.settings.acbrPort = Number(byId("set-acbr-port").value || 3436);
  state.settings.acbrApiUrl = byId("set-acbr-api-url").value.trim().replace(/\/+$/, "");
  state.settings.xmlSignLib = byId("set-xmlsign-lib")?.value || "libXml2";
  state.settings.httpLib = byId("set-http-lib")?.value || "WinHttp";
  state.settings.cryptLib = byId("set-crypt-lib")?.value || "WinCrypt";
  state.settings.sslType = byId("set-ssl-type")?.value || "LT_TLSv1_2";
  state.settings.proxyHost = byId("set-proxy-host")?.value || "";
  state.settings.proxyPort = Number(byId("set-proxy-port")?.value || 0);
  state.settings.xmlPath = byId("set-xml-path")?.value || "Fiscal/XML";
  state.settings.pdfPath = byId("set-pdf-path")?.value || "Fiscal/PDF";
  state.settings.eventPath = byId("set-event-path")?.value || "Fiscal/Eventos";
  state.settings.fiscalLogo = byId("set-fiscal-logo")?.value || "";
  state.settings.fiscalResponsible = byId("set-fiscal-responsible").value;
  state.settings.certificateName = byId("set-certificate-name").value;
  state.settings.certificateExpiresAt = byId("set-certificate-expires").value;
  state.settings.sefazCredentialed = byId("set-sefaz-credentialed").value === "true";
  state.settings.sefazUf = byId("set-sefaz-uf").value.toUpperCase();
  state.settings.cscId = byId("set-csc-id").value;
  state.settings.nfceQrCodeUrl = byId("set-nfce-qrcode-url").value.trim();
  state.settings.nfceConsultaUrl = byId("set-nfce-consulta-url").value.trim();
  state.settings.nfseStandard = byId("set-nfse-standard").value;
  state.settings.nfseSimpleAssessment=Number(byId("set-nfse-simple-assessment").value);
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
  state.settings.scaleModel = byId("set-scale-model")?.value || "";
  state.settings.scalePort = byId("set-scale-port")?.value || "";
  state.settings.labelModel = byId("set-label-model")?.value || "EAN13";
  state.settings.defaultTerminal = byId("set-default-terminal")?.value || "SERIE 1";
  state.settings.smtpHost = byId("set-smtp-host")?.value || "";
  state.settings.smtpPort = Number(byId("set-smtp-port")?.value || 587);
  state.settings.smtpFrom = byId("set-smtp-from")?.value || "";
  state.settings.autoBackup = byId("set-auto-backup")?.value !== "false";
  state.settings.deliveryRadiusKm = Number(byId("set-delivery-radius-km")?.value || 10);
  state.settings.publicTerminalToken = byId("set-public-terminal-token")?.value.trim() || state.settings.publicTerminalToken || "";
  state.settings.alertWebhookUrl = byId("set-alert-webhook").value.trim();
  state.settings.whatsappWebhookUrl = byId("set-whatsapp-webhook").value.trim();
  state.settings.emailWebhookUrl = byId("set-email-webhook").value.trim();
  state.settings.paymentProvider = byId("set-payment-provider").value.trim();
  state.settings.paymentApiUrl = byId("set-payment-api-url").value.trim();
  state.settings.pixApiUrl = byId("set-pix-api-url").value.trim();
  state.settings.boletoApiUrl = byId("set-boleto-api-url").value.trim();
  state.settings.paymentAuthHeader = byId("set-payment-auth-header").value.trim() || "Authorization";
  state.settings.paymentAuthScheme = byId("set-payment-auth-scheme").value.trim();
  state.settings.paymentCallbackUrl = byId("set-payment-callback-url").value.trim();
  const certificatePassword = byId("set-certificate-password").value;
  const csc = byId("set-csc").value;
  const acbrApiToken = byId("set-acbr-api-token").value;
  const paymentApiToken = byId("set-payment-api-token")?.value || "";
  const pixApiToken = byId("set-pix-api-token").value;
  const boletoApiToken = byId("set-boleto-api-token").value;
  const alertWebhookToken = byId("set-alert-webhook-token").value;
  const whatsappWebhookToken = byId("set-whatsapp-webhook-token").value;
  const emailWebhookToken = byId("set-email-webhook-token").value;
  if ((certificatePassword || csc || acbrApiToken || paymentApiToken || pixApiToken || boletoApiToken || alertWebhookToken || whatsappWebhookToken || emailWebhookToken) && apiOnline && sessionId) {
    try {
      const result = await api(`/api/tenant/${state.settings.tenantCode}/fiscal/secrets`, {
        method: "POST",
        body: JSON.stringify({ certificatePassword, csc, acbrApiToken, paymentApiToken, pixApiToken, boletoApiToken, alertWebhookToken, whatsappWebhookToken, emailWebhookToken })
      });
      state.settings.certificatePasswordConfigured = result.certificatePasswordConfigured;
      state.settings.cscConfigured = result.cscConfigured;
      state.settings.acbrApiTokenConfigured = result.acbrApiTokenConfigured;
      state.settings.paymentApiTokenConfigured = result.paymentApiTokenConfigured;
      state.settings.pixApiTokenConfigured = result.pixApiTokenConfigured;
      state.settings.boletoApiTokenConfigured = result.boletoApiTokenConfigured;
      state.settings.alertWebhookTokenConfigured = result.alertWebhookTokenConfigured;
      state.settings.whatsappWebhookTokenConfigured = result.whatsappWebhookTokenConfigured;
      state.settings.emailWebhookTokenConfigured = result.emailWebhookTokenConfigured;
    } catch {
      alert("Dados comuns salvos. Para guardar senha do certificado e CSC, configure TORTELAPLUS_SECRET_KEY no provedor.");
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
    alert(`${provider} configurado para homologacao. Proximo passo: usar certificado e credenciais reais de homologacao para emitir documento no ambiente autorizado.`);
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
    && Number(rule.id) !== Number(editingFiscalRuleId)
    && rule.regime === regime && rule.model === model && rule.uf === uf
    && String(rule.municipio || "") === String(municipio || "")
    && (!rule.validTo || rule.validTo >= validFrom)
    && (!validTo || !rule.validFrom || rule.validFrom <= validTo));
  if (overlaps && !confirm("Ja existe uma regra ativa sobreposta para este regime, modelo, UF e municipio. Deseja cadastrar uma nova versao mesmo assim?")) return;
  const existingRule = state.fiscalRules.find((rule) => Number(rule.id) === Number(editingFiscalRuleId));
  const record = {
    id: existingRule?.id || nextId(state.fiscalRules),
    name: byId("rule-name").value || "Regra fiscal",
    regime,
    crt: byId("rule-crt")?.value || taxRegimeCode(regime),
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
    ibsReductionRate: num("rule-ibs-reduction"),
    cbsReductionRate: num("rule-cbs-reduction"),
    ibsUfDeferral: num("rule-ibs-uf-deferral"),
    ibsCityDeferral: num("rule-ibs-city-deferral"),
    cbsDeferral: num("rule-cbs-deferral"),
    transitionYear: byId("rule-transition-year").value || "2026",
    reformReductionRate: num("rule-reform-reduction-rate"),
    selectiveTaxRate: num("rule-selective-rate"),
    reformDeferralRate: num("rule-reform-deferral-rate"),
    selectiveTaxCst: byId("rule-selective-cst").value || "",
    selectiveTaxClass: byId("rule-selective-class").value || "",
    monophase: byId("rule-monophase").value === "true",
    adRemRate: num("rule-ad-rem-rate"),
    adRemUnit: byId("rule-ad-rem-unit").value || "",
    serviceCode: byId("rule-service-code").value || "",
    cityServiceCode: byId("rule-city-service-code").value || "",
    taxBenefitCode: byId("rule-tax-benefit").value || "",
    reductionReason: byId("rule-reduction-reason").value || "",
    validFrom,
    validTo,
    version: existingRule?.version || state.fiscalRules.filter((rule) => rule.regime === regime && rule.model === model && rule.uf === uf).length + 1,
    active: existingRule?.active !== false
  };
  if (existingRule) Object.assign(existingRule, record);
  else state.fiscalRules.push(record);
  audit(existingRule ? "Regra fiscal alterada" : "Regra fiscal cadastrada", byId("rule-name").value || "Regra fiscal");
  editingFiscalRuleId = 0;
  save();
  renderShell();
}

function editFiscalRuleRecord(id) {
  const rule = (state.fiscalRules || []).find((row) => Number(row.id) === Number(id));
  if (!rule) return;
  editingFiscalRuleId = id;
  renderShell();
}

function toggleFiscalRuleRecord(id) {
  const rule = (state.fiscalRules || []).find((row) => Number(row.id) === Number(id));
  if (!rule) return;
  rule.active = rule.active === false;
  if (Number(editingFiscalRuleId) === Number(id) && rule.active === false) editingFiscalRuleId = 0;
  audit(rule.active ? "Regra fiscal ativada" : "Regra fiscal inativada", rule.name);
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
  const screenMatrix = {};
  document.querySelectorAll(".screen-permission").forEach((input) => {
    const screen = input.dataset.screen;
    const action = input.dataset.action;
    screenMatrix[screen] = screenMatrix[screen] || {};
    screenMatrix[screen][action] = input.checked;
  });
  const payload = {
    name: byId("user-name").value || byId("user-login").value,
    username: byId("user-login").value,
    password: byId("user-password").value,
    role,
    permissions: selectedPermissions.length ? selectedPermissions : rolePermissions[role],
    screenPermissions: screenMatrix
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

async function toggleUserRecord(id) {
  if (!requirePermission("manage_users")) return;
  if (!apiOnline) return alert("Bloqueio de usuario exige API online para manter a seguranca.");
  const user = (state.users || []).find((row) => Number(row.id) === Number(id));
  if (!user) return;
  if (String(user.username || "").toLowerCase() === String(state.settings.user || "").toLowerCase()) {
    alert("O usuario logado nao pode bloquear a propria conta.");
    return;
  }
  const nextActive = user.active === false;
  if (!nextActive && !confirm(`Bloquear o usuario ${user.username}?`)) return;
  try {
    const result = await api(`/api/tenant/${state.settings.tenantCode}/users/${id}`, {
      method: "POST",
      body: JSON.stringify({ active: nextActive })
    });
    Object.assign(user, result.user);
    audit(nextActive ? "Usuario ativado" : "Usuario bloqueado", user.username);
    save();
    renderShell();
  } catch (error) {
    alert(`Nao foi possivel atualizar usuario: ${error.message}`);
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
  return window.TortelaFiscalRegimes.profile({regime}).crt;
}

function ensureFiscalRuleCoverage() {
  return state.fiscalRules || []; // Read-only: rules must be added explicitly.
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
    // NCM is validated per item by the server, including product overrides.
    if (window.TortelaFiscalRegimes.profile(state.settings).icmsSimple && !rule.csosn) missing.push("CSOSN");
    if (!window.TortelaFiscalRegimes.profile(state.settings).icmsSimple && !rule.cst) missing.push("CST");
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
    `  <ReformaTributaria cst="${escapeXml(rule.ibsCbsCst || "000")}" ibsClass="${escapeXml(rule.ibsClass || "000001")}" cbsClass="${escapeXml(rule.cbsClass || "000001")}" ibs="${Number(rule.ibsRate || 0).toFixed(2)}" ibsUf="${Number(rule.ibsUfRate || 0).toFixed(2)}" ibsMunicipio="${Number(rule.ibsCityRate || 0).toFixed(2)}" cbs="${Number(rule.cbsRate || 0).toFixed(2)}" cbsFederal="${Number(rule.cbsFederalRate || 0).toFixed(2)}" creditoPresumido="${Number(rule.presumedCreditRate || 0).toFixed(2)}" reducaoBase="${Number(rule.reformReductionRate || 0).toFixed(2)}" diferimento="${Number(rule.reformDeferralRate || 0).toFixed(2)}" anoTransicao="${escapeXml(rule.transitionYear || "2026")}" impostoSeletivo="${Number(rule.selectiveTaxRate || 0).toFixed(2)}" seletivoCst="${escapeXml(rule.selectiveTaxCst || "")}" seletivoClass="${escapeXml(rule.selectiveTaxClass || "")}" monofasico="${rule.monophase ? "sim" : "nao"}" adRem="${Number(rule.adRemRate || 0).toFixed(4)}" unidadeAdRem="${escapeXml(rule.adRemUnit || "")}" />`,
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
    (!item.crt || String(item.crt)===window.TortelaFiscalRegimes.profile(state.settings).crt) &&
    item.uf === state.settings.uf &&
    (!item.validFrom || item.validFrom <= todayText) &&
    (!item.validTo || item.validTo >= todayText) &&
    (!nature || !item.operation || String(nature).toLowerCase().includes(String(item.operation).toLowerCase().slice(0, 8)))
  ) || (state.fiscalRules || []).find((item) =>
    item.active !== false &&
    item.model === model &&
    item.regime === state.settings.regime &&
    (!item.crt || String(item.crt)===window.TortelaFiscalRegimes.profile(state.settings).crt) &&
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

async function createFiscalRecord() {
  const model = fiscalTabModel(currentFiscalTab);
  if (advancedFiscalTabs().includes(currentFiscalTab)) return createAdvancedFiscalRecord(model);
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
  Object.assign(row,readRtcDocumentFields(row.items));
  if(Number(row.purpose)===4)delete row.total;
  try { const preview=await previewFiscalRecord(row); row.xml=preview.xml; row.rtcRelease=preview.release; row.taxSummary=preview.taxSummary; if(Number(row.purpose)===4)row.total=preview.taxSummary.total; }
  catch(error){alert(`Não foi possível gerar ${model}: ${error.message}`);return;}
  state.fiscalQueue.push(row);
  audit("Documento fiscal gerado", `${model} ${row.customer} ${money(row.total)}`);
  save();
  renderShell();
}

function createAdvancedFiscalRecord(model) {
  const customer = byId("fiscal-customer")?.value || "Consumidor Final";
  const total = Number(byId("fiscal-total")?.value || 0);
  const isFile = ["SPED", "Sintegra"].includes(model);
  if (!isFile && total < 0) return alert("Informe um total valido.");
  const row = {
    id: nextId(state.fiscalQueue),
    model,
    serie: byId("fiscal-serie")?.value || "1",
    nature: byId("fiscal-nature")?.value || (isFile ? "Arquivo fiscal" : "Transporte"),
    status: isFile ? "Arquivo pendente" : "Pendente",
    customer,
    total,
    issuedAt: new Date().toISOString(),
    key: "",
    protocol: "",
    xml: "",
    fiscalAdvanced: {
      cfop: byId("fiscal-cfop-advanced")?.value || "",
      referencedKey: byId("fiscal-ref-key")?.value || "",
      periodFrom: byId("fiscal-period-from")?.value || "",
      periodTo: byId("fiscal-period-to")?.value || "",
      originUf: byId("fiscal-origin-uf")?.value || "",
      destUf: byId("fiscal-dest-uf")?.value || "",
      vehicle: byId("fiscal-vehicle")?.value || "",
      rntrc: byId("fiscal-rntrc")?.value || "",
      driver: byId("fiscal-driver")?.value || "",
      carrier: byId("fiscal-carrier")?.value || "",
      notes: byId("fiscal-advanced-notes")?.value || ""
    }
  };
  row.xml = advancedFiscalXml(row);
  state.fiscalQueue.push(row);
  audit(`${model} gerado`, `${customer} ${isFile ? `${row.fiscalAdvanced.periodFrom} a ${row.fiscalAdvanced.periodTo}` : money(total)}`);
  save();
  renderShell();
}

function advancedFiscalXml(row) {
  const advanced = row.fiscalAdvanced || {};
  return [
    `<TortelaFiscalAvancado modelo="${escapeXml(row.model)}" ambiente="${escapeXml(state.settings.fiscalEnvironment || "Homologacao")}">`,
    `  <Identificacao serie="${escapeXml(row.serie || "1")}" natureza="${escapeXml(row.nature || "")}" emissao="${escapeXml(row.issuedAt || "")}" />`,
    `  <Participante nome="${escapeXml(row.customer || "")}" />`,
    `  <Operacao cfop="${escapeXml(advanced.cfop || "")}" total="${Number(row.total || 0).toFixed(2)}" chaveReferenciada="${escapeXml(advanced.referencedKey || "")}" />`,
    `  <Periodo inicio="${escapeXml(advanced.periodFrom || "")}" fim="${escapeXml(advanced.periodTo || "")}" />`,
    `  <Transporte ufOrigem="${escapeXml(advanced.originUf || "")}" ufDestino="${escapeXml(advanced.destUf || "")}" veiculo="${escapeXml(advanced.vehicle || "")}" rntrc="${escapeXml(advanced.rntrc || "")}" motorista="${escapeXml(advanced.driver || "")}" transportadora="${escapeXml(advanced.carrier || "")}" />`,
    `  <Observacoes>${escapeXml(advanced.notes || "")}</Observacoes>`,
    `</TortelaFiscalAvancado>`
  ].join("\n");
}

async function createNfseRecord() {
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
    includeIbsCbs:byId("nfse-include-rtc").value==='true',
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
      nationalTaxCode: byId("nfse-national-code").value,
      reform: {cst:byId("nfse-rtc-cst").value,classTrib:byId("nfse-rtc-class").value,operationCode:byId("nfse-rtc-operation").value,ibsUfDeferral:Number(byId("nfse-uf-deferral").value),ibsCityDeferral:Number(byId("nfse-city-deferral").value),cbsDeferral:Number(byId("nfse-cbs-deferral").value)},
      cityServiceCode: byId("nfse-city-service-code").value,
      nbs: byId("nfse-nbs").value,
      cnae: byId("nfse-cnae").value,
      issRate: num("nfse-iss-rate"),
      issWithheld: byId("nfse-iss-withheld").value,
      issExigibility: byId("nfse-iss-exigibility").value,
      description: byId("nfse-description").value
    }
  };
  try { const preview=await previewFiscalRecord(row); row.xml=preview.xml; row.rtcRelease=preview.release; row.taxSummary=preview.taxSummary; }
  catch(error){alert(`Não foi possível gerar NFS-e: ${error.message}`);return;}
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
    return pending && !row.cancelledAt && validateFiscalDocument(row).length === 0 && (!row.nextAttemptAt || new Date(row.nextAttemptAt).getTime() <= now);
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
  const model = prompt("Modelo a inutilizar: NF-e ou NFC-e", currentFiscalTab === "nfce" ? "NFC-e" : "NF-e");
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

function exportFiscalXmlBatch() {
  const rows = reportRows(state.fiscalQueue || [], "issuedAt").filter((row) => row.xml || row.xmlUrl || row.status === "Autorizada");
  if (!rows.length) return alert("Nao ha XML fiscal no periodo selecionado.");
  const content = rows.map((row) => {
    const xmlContent = row.xml || fiscalXml(row);
    return [`===== ${row.model} ${row.id} ${row.key || ""} =====`, row.xmlUrl ? `URL XML: ${row.xmlUrl}` : xmlContent, ""].join("\n");
  }).join("\n");
  downloadText(`lote-xml-fiscal-${today()}.txt`, content);
  audit("Lote XML fiscal exportado", `${rows.length} documento(s)`);
  save();
}

function exportFiscalPdfBatch() {
  const rows = reportRows(state.fiscalQueue || [], "issuedAt").filter((row) => row.pdfUrl || row.status === "Autorizada");
  if (!rows.length) return alert("Nao ha DANFE/DANFCE/PDF no periodo selecionado.");
  const content = rows.map((row) => [
    `${row.model} ${row.id}`,
    `Cliente: ${row.customer}`,
    `Chave: ${row.key || "-"}`,
    `Protocolo: ${row.protocol || "-"}`,
    `PDF: ${row.pdfUrl || "Gerar pelo botao DANFE/DANFCE"}`,
    ""
  ].join("\n")).join("\n");
  downloadText(`lote-pdf-fiscal-${today()}.txt`, content);
  audit("Lote PDF fiscal exportado", `${rows.length} documento(s)`);
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

function validateBackupBeforeRestore(backup) {
  if (!backup || typeof backup !== "object") throw new Error("Arquivo de backup invalido.");
  if (backup.product && backup.product !== "Tortela Plus") throw new Error("Este backup nao pertence ao Tortela Plus.");
  const restoredState = backup.state || backup;
  if (!restoredState || typeof restoredState !== "object") throw new Error("Estado do backup invalido.");
  if (!restoredState.settings) throw new Error("Backup sem configuracoes da unidade.");
  if (restoredState.settings?.tenantCode && normalizeTenantCode(restoredState.settings.tenantCode) !== normalizeTenantCode(state.settings.tenantCode)) {
    throw new Error("Este backup pertence a outro cliente.");
  }
  if (!Array.isArray(restoredState.products)) throw new Error("Backup sem cadastro de produtos.");
  if (!Array.isArray(restoredState.users)) throw new Error("Backup sem usuarios.");
  if (!Array.isArray(restoredState.sales)) throw new Error("Backup sem historico de vendas.");
  return restoredState;
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
      const restoredState = validateBackupBeforeRestore(restored);
      if (!confirm("Restaurar este backup substituirá os dados atuais deste cliente. O servidor criara uma copia de seguranca antes da restauracao. Deseja continuar?")) return;
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

function validPdvCpf(value) {
 const cpf=digits(value);if(cpf.length!==11||/^(\d)\1{10}$/.test(cpf))return false;
 const digit=base=>{const n=[...base].reduce((sum,c,i)=>sum+Number(c)*(base.length+1-i),0)*10%11;return n===10?0:n;};
 return digit(cpf.slice(0,9))===Number(cpf[9])&&digit(cpf.slice(0,10))===Number(cpf[10]);
}
function updatePdvCustomerLabel(){
 const name=pdvSelectedCustomer?.name||'Identifique pelo CPF';
 if(byId('pdv-client-label'))byId('pdv-client-label').textContent=name;
 if(byId('sale-customer'))byId('sale-customer').value=name;
}
function registerPdvCustomer(cpf, existing = null) {
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='pdv-customer-dialog';dialog.setAttribute('aria-labelledby','pdv-customer-title');
  const field=(key,label,required=false)=>`<label>${label}<input name="${key}" value="${escapeAttr(existing?.[key]||'')}" maxlength="160" ${required?'required':''}></label>`;
  dialog.innerHTML=`<form><header><small>CLIENTE DA VENDA</small><h2 id="pdv-customer-title">${existing?'Completar cadastro do cliente':'Cadastrar novo cliente'}</h2><p>CPF ${escapeHtml(cpf)} · Informe nome, cidade e UF para continuar.</p></header><div class="pdv-customer-fields">${field('name','Nome completo',true)}${field('phone','Telefone (opcional)')}<label>CEP<input name="cep" inputmode="numeric" maxlength="9" value="${escapeAttr(existing?.cep||'')}" placeholder="Digite os 8 numeros"></label>${field('address','Rua / logradouro')}${field('number','Numero')}${field('district','Bairro')}${field('complement','Complemento')}${field('city','Cidade',true)}<label>UF<select name="uf" required><option value="">Selecione</option>${'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map(uf=>`<option ${existing?.uf===uf?'selected':''}>${uf}</option>`).join('')}</select></label></div><p role="status" data-status></p><footer><button class="btn danger" data-cancel type="button">Cancelar</button><button class="btn primary" type="submit">Salvar cliente e continuar</button></footer></form>`;
  const form=dialog.querySelector('form'),status=dialog.querySelector('[data-status]');let busy=false,cepSequence=0;
  const finish=value=>{dialog.close();dialog.remove();resolve(value);};
  const lookup=async()=>{const cep=digits(form.elements.cep.value),sequence=++cepSequence;if(cep.length!==8){status.textContent='Informe um CEP com 8 numeros.';return;}const keys=['address','district','city','uf'],original=Object.fromEntries(keys.map(k=>[k,form.elements[k].value]));status.textContent='Buscando endereco pelo CEP...';try{const data=await fetchCepData(cep);if(sequence!==cepSequence||digits(form.elements.cep.value)!==cep||!dialog.isConnected)return;const values={address:data.logradouro||'',district:data.bairro||'',city:data.localidade||'',uf:data.uf||''};for(const key of keys)if(form.elements[key].value===original[key])form.elements[key].value=values[key];status.textContent='Endereco preenchido. Digite o numero e confira o complemento.';form.elements.number.focus();}catch{if(sequence===cepSequence)status.textContent='CEP nao encontrado ou consulta indisponivel. Preencha o endereco manualmente.';}};
  let lastCep='';const autoCep=()=>{const cep=digits(form.elements.cep.value);if(cep.length!==8){lastCep='';return;}if(cep!==lastCep){lastCep=cep;lookup();}};form.elements.cep.addEventListener('input',autoCep);form.elements.cep.addEventListener('blur',autoCep);
  form.querySelector('[data-cancel]').addEventListener('click',()=>{if(!busy)finish(null);});dialog.addEventListener('cancel',event=>{event.preventDefault();if(!busy)finish(null);});
  form.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;busy=true;form.querySelector('button[type="submit"]').disabled=true;try{if(!apiOnline||!sessionId||!navigator.onLine)throw Error('Conecte-se para cadastrar um novo cliente.');await syncChain;const body={document:cpf,...Object.fromEntries(new FormData(form))};const result=await api(`/api/tenant/${state.settings.tenantCode}/pdv-customers/register`,{method:'POST',body:JSON.stringify(body)});const index=state.people.findIndex(p=>digits(p.document)===cpf&&p.type==='Cliente');if(index>=0)state.people[index]=result.customer;else state.people.push(result.customer);finish(result.customer);}catch(error){status.textContent=error.message;}finally{busy=false;form.querySelector('button[type="submit"]').disabled=false;}});
  document.body.appendChild(dialog);dialog.showModal();form.elements.name.focus();
 });
}
async function ensurePdvCustomer() {
 const cpf=digits(byId('pdv-club-cpf')?.value||saleClubCpf);saleClubCpf=cpf;
 if(!validPdvCpf(cpf)){alert('CPF invalido. Confira os 11 numeros antes de continuar.');byId('pdv-club-cpf')?.focus();return null;}
 if(pdvSelectedCustomer&&digits(pdvSelectedCustomer.document)===cpf)return pdvSelectedCustomer;
 if(pdvCustomerRequest){await pdvCustomerRequest;return digits(pdvSelectedCustomer?.document)===cpf?pdvSelectedCustomer:null;}
 pdvCustomerRequest=(async()=>{
  let customer=state.people.find(p=>p.type==='Cliente'&&digits(p.document)===cpf)||null;
  if(apiOnline&&sessionId&&navigator.onLine){const result=await api(`/api/tenant/${state.settings.tenantCode}/pdv-customers/lookup`,{method:'POST',body:JSON.stringify({document:cpf})});customer=result.customer;if(customer){const index=state.people.findIndex(p=>p.type==='Cliente'&&digits(p.document)===cpf);if(index>=0)state.people[index]=customer;else state.people.push(customer);}}
  if(digits(byId('pdv-club-cpf')?.value||saleClubCpf)!==cpf)return null;
  if(customer?.active===false){alert('Cliente inativo. Solicite a revisao do cadastro ao responsavel.');return null;}
  if(!customer||!customer.name||!customer.city||!customer.uf)customer=await registerPdvCustomer(cpf,customer);
  if(customer&&digits(byId('pdv-club-cpf')?.value||saleClubCpf)===cpf){pdvSelectedCustomer=customer;updatePdvCustomerLabel();return customer;}return null;
 })();
 try{return await pdvCustomerRequest;}finally{pdvCustomerRequest=null;}
}

function chooseComboSale(template, position='') {
 const config=window.ComboSales.validate(template.comboPricing,state.products);
 return new Promise(resolve=>{
 const dialog=document.createElement('dialog');dialog.className='pdv-customer-dialog';dialog.setAttribute('aria-labelledby','combo-sale-title');
 dialog.innerHTML=`<form><header><small>MONTAR COMBO ${escapeHtml(position)}</small><h2 id="combo-sale-title">${escapeHtml(template.description)}</h2><p>Escolha ${config.tortelaCount} Tortelas. Depois personalize a cobertura e os acompanhamentos de cada uma.</p></header><div class="pdv-customer-fields">${Array.from({length:config.tortelaCount},(_,i)=>`<label>Tortela ${i+1} — sabor<select required name="flavor${i}" data-flavor><option value="">Escolha o sabor</option>${config.flavorIds.map(id=>{const p=state.products.find(p=>Number(p.id)===Number(id));return `<option value="${p.id}">${escapeHtml(p.description)} · ${money(p.price)}</option>`;}).join('')}</select></label>`).join('')}${(config.beverages||[]).map(rule=>{const p=state.products.find(p=>Number(p.id)===Number(rule.productId));return `<label>${escapeHtml(p.description)} — opcional<small>Desconto no combo: ${rule.type==='percent'?rule.discount+'%':money(rule.discount)} por unidade</small><input type="number" data-beverage="${p.id}" value="0" min="0" max="20" step="1"></label>`;}).join('')}</div><p role="status" data-total>Escolha os sabores para calcular o total. Bebidas com quantidade zero nao serao incluidas.</p><footer><button class="btn danger" type="button" data-cancel>Cancelar</button><button class="btn primary" type="submit">Personalizar cada Tortela</button></footer></form>`;
 const form=dialog.querySelector('form'),read=()=>({flavors:[...form.querySelectorAll('[data-flavor]')].map(i=>Number(i.value)),beverages:[...form.querySelectorAll('[data-beverage]')].filter(i=>Number(i.value)>0).map(i=>({productId:Number(i.dataset.beverage),qty:Number(i.value)}))});
 const finish=value=>{dialog.close();dialog.remove();resolve(value);};
 form.addEventListener('input',()=>{try{const quote=window.ComboSales.quote(template,read(),state.products);form.querySelector('[data-total]').textContent='Combo: '+money(quote.total)+' · Economia: '+money(quote.discount)+' · Coberturas e acompanhamentos cobrados conforme cadastro.';}catch(error){form.querySelector('[data-total]').textContent=error.message;}});
 form.addEventListener('submit',event=>{event.preventDefault();try{finish(window.ComboSales.quote(template,read(),state.products));}catch(error){form.querySelector('[data-total]').textContent=error.message;}});
 form.querySelector('[data-cancel]').addEventListener('click',()=>finish(null));dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});document.body.appendChild(dialog);dialog.showModal();
 });
}
async function preparedTortela(target, product, price, metadata={}, position='') {
 const preparation=await chooseSalePreparation(product,position);if(!preparation)return false;
 const split=ItemPreparation.split(product,preparation,1,state.products);
 const parent=ItemPreparation.attach(target,{id:product.id,description:product.description,qty:1,unit:product.unit,price,...split.preparation,...metadata,note:[split.preparation.note,metadata.comboName?'Combo: '+metadata.comboName:''].filter(Boolean).join(' · ')});
 for(const component of split.components)ItemPreparation.attach(target,{id:component.id,description:component.description,qty:1,unit:component.unit,price:effectiveProductPrice(component,1),...(metadata.comboGroupId?{comboGroupId:metadata.comboGroupId,comboTemplateId:metadata.comboTemplateId,comboName:metadata.comboName,comboRole:'preparation'}:{})},parent.lineId);
 return true;
}
function commitPreparedPdvItems(items){
 const shortage=stockShortages(saleStockRequirements([...saleItems,...items]),true);if(shortage.length){alert('Estoque insuficiente: '+shortage.join('; '));return;}
 ItemPreparation.validateSale([...saleItems,...items]);saleItems.push(...items);saleItems=ItemPreparation.ordered(saleItems);byId('sale-search').value='';pdvCompletionMessage='';renderShell();
}
async function addDynamicCombo(template, qty){
 if(!Number.isInteger(qty)||qty<1||qty>10)return alert('Informe de 1 a 10 combos por vez.');
 const staged=[];
 for(let n=0;n<qty;n++){
 const quote=await chooseComboSale(template,`${n+1}/${qty}`);if(!quote)return;
 const group='combo-'+Date.now()+'-'+Math.random().toString(36).slice(2);
 let index=0;for(const item of quote.items){const metadata={comboGroupId:group,comboTemplateId:template.id,comboName:template.description,comboRole:item.comboRole,comboDiscount:item.comboDiscount,originalPrice:item.originalPrice};const product=state.products.find(p=>Number(p.id)===Number(item.id));if(item.comboRole==='flavor'){index++;if(!await preparedTortela(staged,product,item.price,metadata,`Combo ${n+1} · Tortela ${index}/${template.comboPricing.tortelaCount}`))return;}else staged.push({...item,...metadata,note:'Bebida do combo: '+template.description});}
 }
 window.ComboSales.validateSale(staged,state.products);commitPreparedPdvItems(staged);
}

let preparationDialogOpen=false;
function chooseSalePreparation(product, position = "") {
  if(preparationDialogOpen)return Promise.resolve(null);
  const choices=ItemPreparation.choices(product,state.products),coverage=choices.coverage,extras=choices.extras;
  const parents=ItemPreparation.role(product)?saleItems.filter(ItemPreparation.isTortela):[];
  if(!coverage.length&&!extras.length&&!parents.length)return Promise.resolve({});
  preparationDialogOpen=true;
  return new Promise(resolve=>{
    const dialog=document.createElement('dialog');dialog.className='pdv-preparation-dialog';dialog.setAttribute('aria-labelledby','preparation-title');
    dialog.innerHTML=`<form class="pdv-preparation-form"><header class="pdv-preparation-header"><small>PERSONALIZAR ITEM ${escapeHtml(position)}</small><h2 id="preparation-title">${escapeHtml(product.description)}</h2><p>Escolha uma cobertura e, se desejar, um acompanhamento para esta Tortela.</p></header><div class="pdv-preparation-body">${parents.length?`<div class="field"><label for="preparation-parent">Adicionar a qual Tortela?</label><select id="preparation-parent" name="parentLineId" required>${parents.map((parent,index)=>`<option value="${escapeAttr(parent.lineId)}" ${index===parents.length-1?'selected':''}>${index+1} - ${escapeHtml(parent.description)}</option>`).join('')}</select></div>`:''}${coverage.length?`<div class="field"><label for="preparation-coverage">Cobertura <small>Obrigatório</small></label><select id="preparation-coverage" name="coverage" required><option value="">Selecione uma opção</option>${coverage.map(value=>`<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`).join('')}</select></div>`:''}${extras.length?`<fieldset class="pdv-preparation-extras"><legend>Acompanhamentos <small>Opcional · escolha apenas 1</small></legend><div class="pdv-preparation-grid"><label class="pdv-preparation-option"><input type="radio" name="extra" value="" checked /><span>Sem acompanhamento</span></label>${extras.map((value,i)=>`<label class="pdv-preparation-option"><input type="radio" name="extra" value="${i}" /><span>${escapeHtml(value)}</span></label>`).join('')}</div></fieldset>`:''}</div><footer class="pdv-preparation-footer"><span data-selection-count>Nenhum acompanhamento selecionado</span><div><button class="btn" type="button" data-cancel>Cancelar</button><button class="btn primary" type="submit">Adicionar à venda</button></div></footer></form>`;
    dialog.querySelectorAll('[name="extra"]').forEach(input=>input.addEventListener('change',()=>{const count=[...dialog.querySelectorAll('[name="extra"]:checked')].filter(input=>input.value!=='').length;dialog.querySelector('[data-selection-count]').textContent=count?`${count} acompanhamento${count===1?'':'s'} selecionado${count===1?'':'s'}`:'Nenhum acompanhamento selecionado';}));
    let finished=false;const finish=value=>{if(finished)return;finished=true;preparationDialogOpen=false;dialog.close();dialog.remove();resolve(value);};
    dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();finish({parentLineId:dialog.querySelector('[name="parentLineId"]')?.value||'',coverage:dialog.querySelector('[name="coverage"]')?.value||'',extras:[...dialog.querySelectorAll('[name="extra"]:checked')].filter(input=>input.value!=='').map(input=>extras[Number(input.value)])});});
    dialog.querySelector('[data-cancel]').addEventListener('click',()=>finish(null));dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});document.body.appendChild(dialog);dialog.showModal();
  });
}

async function addSaleItem(productId) {
  if (isCashRegisterStale()) {
    alert("Feche o caixa do dia anterior antes de registrar novas vendas.");
    return;
  }
  saleClubCpf = digits(byId("pdv-club-cpf")?.value);
  if (saleClubCpf.length !== 11) {
    alert("Informe o CPF do Clube Tortela antes de iniciar a venda.");
    byId("pdv-club-cpf")?.focus();
    return;
  }
  if(!await ensurePdvCustomer())return;
  const query = byId("sale-search").value.trim().toLowerCase();
  const product = state.products.find((item) => item.active !== false && (productId !== undefined ? String(item.id) === String(productId) :
    String(item.id) === query || item.barcode === query || (query && item.description.toLowerCase().includes(query)))
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
  if(product.comboPricing?.enabled){try{await addDynamicCombo(product,qty);}catch(error){alert(error.message);}return;}
  const typedPrice = Number(byId("sale-price").value || 0);
  const normalPrice = effectiveProductPrice(product, qty);
  if (typedPrice > 0 && Math.abs(typedPrice - normalPrice) > 0.009) {
    const authorization = await authorizePdvOperation("price_override", "Autorizar alteracao de preco");
    if (!authorization) return;
    audit("Preco alterado no PDV", `${product.description}: ${money(normalPrice)} para ${money(typedPrice)} por ${authorization.authorizedBy}`);
  }
  const effectivePrice = typedPrice > 0 ? typedPrice : effectiveProductPrice(product, qty);
  if(ItemPreparation.isTortela(product)&&qty>1){
    if(!Number.isInteger(qty)||qty>20)return alert('Informe uma quantidade inteira de ate 20 Tortelas.');
    const staged=[];for(let i=0;i<qty;i++)if(!await preparedTortela(staged,product,effectivePrice,{},`Tortela ${i+1}/${qty}`))return;
    commitPreparedPdvItems(staged);return;
  }

  const preparation = await chooseSalePreparation(product);
  if (!preparation) return;
  const beforeItems=structuredClone(saleItems);
  try {
  const existing = !ItemPreparation.isTortela(product)&&!ItemPreparation.role(product)&&saleItems.find((item) => item.id === product.id && item.price === effectivePrice && ItemPreparation.same(item,preparation));
  if (existing) existing.qty += qty;
  else {
    const split=ItemPreparation.split(product,preparation,qty,state.products);
    const parent=ItemPreparation.attach(saleItems,{id:product.id,description:product.description,qty,unit:product.unit,price:effectivePrice,...split.preparation},preparation.parentLineId);
    for(const component of split.components)ItemPreparation.attach(saleItems,{id:component.id,description:component.description,qty,unit:component.unit,price:effectiveProductPrice(component,qty)},parent.lineId);
  }
  ItemPreparation.validateSale(saleItems);
  saleItems=ItemPreparation.ordered(saleItems);
  } catch(error){saleItems=beforeItems;alert(error.message);return;}
  const shortage = stockShortages(saleStockRequirements(saleItems), true);
  if (shortage.length) {
    saleItems=beforeItems;
    alert(`Estoque insuficiente:\n${shortage.join("\n")}`);
    return;
  }
  byId("sale-search").value = "";
  pdvCompletionMessage = "";
  renderShell();
}

let pdvSaleFinalizing = false;
let pdvCompletionMessage = "";
async function finishSaleRecord() {
  if (pdvSaleFinalizing) return;
  pdvSaleFinalizing = true;
  const button = byId("finish-sale"), original = button?.innerHTML;
  if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.innerHTML='<strong>Concluindo venda...</strong><span>Aguarde a gravação</span>';}
  try { await syncChain; await finalizePdvSaleRecord(); }
  catch(error){alert(`Nao foi possivel concluir a venda. ${error.message || 'Tente novamente.'}`);}
  finally { pdvSaleFinalizing = false;if(button?.isConnected){button.disabled=false;button.removeAttribute('aria-busy');button.innerHTML=original;} }
}

async function finalizePdvSaleRecord() {
  let terminal;
  try { await refreshCashRegister(); terminal = await refreshPdvEmission(); }
  catch (error) { alert(`Venda nao finalizada. ${error.message}`); return; }
  if (!state.cashRegister?.open) {
    alert("Abra o caixa antes de vender.");
    return;
  }
  if (isCashRegisterStale()) { renderShell(); alert("Feche o caixa do dia anterior antes de registrar novas vendas."); return; }
  if (!saleItems.length) {
    alert("Inclua ao menos um item.");
    return;
  }
  saleClubCpf = digits(byId("pdv-club-cpf")?.value);
  if (saleClubCpf.length !== 11) {
    alert("Informe o CPF do Clube Tortela antes de finalizar a venda.");
    byId("pdv-club-cpf")?.focus();
    return;
  }
  if (isCashRegisterStale()) {
    alert("Feche o caixa do dia anterior antes de registrar novas vendas.");
    return;
  }
  const identifiedCustomer=await ensurePdvCustomer();
  if(!identifiedCustomer)return;
  ItemPreparation.validateSale(saleItems);
  saleItems=ItemPreparation.ordered(saleItems);

  const shortage = stockShortages(saleStockRequirements(saleItems), true);
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
  const chosenPayment=await choosePdvPayment(total);
  if(!chosenPayment)return;
  const paymentInfo = pdvPaymentBreakdown(total,chosenPayment);
  if (paymentInfo.paid < total) {
    alert("O valor pago nao cobre o total da venda.");
    return;
  }
  const sale = {
    id: nextId(state.sales),
    date: cashBusinessDay(),
    soldAt: new Date().toISOString(),
    customer: identifiedCustomer.name,
    customerId: identifiedCustomer.id,
    customerCity: identifiedCustomer.city,
    customerUf: identifiedCustomer.uf,
    customerDistrict: identifiedCustomer.district||"",
    customerCep: identifiedCustomer.cep||"",
    customerRegion: [identifiedCustomer.district,identifiedCustomer.city,identifiedCustomer.uf].filter(Boolean).join(" / "),
    customerDocument: saleClubCpf,
    clubCpf: saleClubCpf,
    seller: state.settings.user,
    type: "PDV",
    terminalId: terminal.id,
    terminalName: terminal.name,
    emissionMode: terminal.emissionMode,
    operation: byId("pdv-operation")?.value || "Balcao",
    table: byId("pdv-table")?.value || "",
    deliveryDriver: byId("pdv-delivery-driver")?.value || "",
    deliveryPhone: byId("pdv-delivery-phone")?.value || "",
    deliveryAddress: byId("pdv-delivery-address")?.value || "",
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
    items: structuredClone(ItemPreparation.ordered(saleItems))
  };
  state.sales.push(sale);
  updatePdvTableFromSale(sale);
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
      history: `Venda PDV ${sale.id} - Crediario`,
      sourceSaleId: sale.id
    });
  }
  paymentInfo.cashEntries.forEach((entry) => {
    state.cash.push({
      id: nextId(state.cash),
      date: today(),
      account: "CAIXA",
      history: `Venda PDV ${sale.id} - ${entry.method}`,
      paymentMethod: entry.method,
      in: entry.in,
      out: entry.out,
      cashRegisterOpenedAt: state.cashRegister.openedAt
    });
  });
  applySaleStock(sale.items, `Venda PDV ${sale.id}`);
  let fiscalRow;
  if (terminal.emissionMode === "nfce") {
  fiscalRow = {
    id: nextId(state.fiscalQueue),
    terminalId: terminal.id,
    model: "NFC-e",
    serie: String(state.settings.nfceSerie || "1"),
    nature: "Venda de mercadoria",
    status: navigator.onLine ? "Aguardando transmissao" : "Fila offline",
    customer: sale.customer,
    customerDocument: sale.customerDocument,
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
  }
  saleItems = [];
  saleClubCpf = "";
  pdvSelectedCustomer = null;
  authorizedDiscountValue = 0;
  const persisted=await save();
  if(persisted===false){alert("A venda ainda nao foi confirmada no servidor. Os dados locais ficaram pendentes de sincronizacao. Nao refaca a venda antes de conferir Vendas na retaguarda.");renderShell();return;}
  await createConfiguredSaleCharges(sale);
  pdvCompletionMessage = `Venda ${sale.id} concluída · ${money(total)} · ${terminal.emissionMode === 'receipt' ? 'Recibo não fiscal' : 'NFC-e aguardando transmissão'}. Use Reimprimir recibo para imprimir.`;
  renderShell();
  if (sale.emissionMode === "receipt") autoPrintNonFiscalReceipt(sale);
  if (fiscalRow && navigator.onLine && apiOnline && sessionId) setTimeout(() => transmitFiscalRecord(fiscalRow.id), 200);
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

function renderNonFiscalReceipt(sale) {
  const e = escapeHtml;
  const rows = ItemPreparation.ordered(sale.items || []).map(item => `<tr class="${item.parentLineId ? "complement" : ""}"><td>${item.parentLineId ? "↳ " : ""}${e(item.description)}${ItemPreparation.lines(item).map(line => `<small>${e(line)}</small>`).join("")}<small>${e(item.qty)} ${e(item.unit || "UN")} × ${e(money(item.price))}</small></td><td>${e(money(Number(item.qty) * Number(item.price)))}</td></tr>`).join("");
  const logo = new URL("./assets/tortela/logo-tortela.gif?v=1", window.location.href).href;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recibo Tortela — Venda ${e(sale.id)}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#eef0f2;color:#111;font:12px Arial,sans-serif}.toolbar{padding:16px;text-align:center}.toolbar button{background:#15803d;color:white;border:0;border-radius:8px;padding:12px 24px;font-weight:bold;cursor:pointer}.ticket{width:80mm;margin:0 auto 24px;padding:5mm;background:white}header{text-align:center}header img{width:40mm;max-height:23mm;object-fit:contain}h1{font-size:15px;margin:8px 0}h2{font-size:13px;margin:12px 0;padding:8px 0;border-top:1px dashed;border-bottom:1px dashed}p{margin:5px 0}.meta{padding:9px 0;border-bottom:1px dashed}.pair{display:flex;justify-content:space-between;gap:10px}table{width:100%;border-collapse:collapse;margin-top:10px}th{text-align:left;font-size:10px;border-bottom:1px solid;padding:6px 0}th:last-child,td:last-child{text-align:right;white-space:nowrap}td{padding:8px 0;vertical-align:top}td:first-child{padding-right:8px}small{display:block;font-size:10px;margin-top:4px}.complement td{padding-top:0;font-size:11px}.totals{border-top:1px dashed;padding:10px 0}.total{font-size:19px;font-weight:bold;margin:10px 0}.footer{text-align:center;border-top:1px dashed;padding-top:12px;font-size:11px}@page{size:80mm auto;margin:0}@media print{body{background:white}.toolbar{display:none}.ticket{margin:0;width:80mm;padding:4mm}tr{break-inside:avoid}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimir / Salvar em PDF</button></div><article class="ticket"><header><img src="${e(logo)}" alt="Tortela"><h1>${e(state.settings.company || "Tortela")}</h1><h2>RECIBO NÃO FISCAL</h2></header><div class="meta"><div class="pair"><b>VENDA ${e(sale.id)}</b><span>${e(sale.date)}</span></div><p>Cliente: ${e(sale.customer || "Consumidor Final")}</p><p>Operador: ${e(sale.seller)} · ${e(sale.terminalName || "PDV")}</p></div><table><thead><tr><th>DESCRIÇÃO / QTD. × VALOR</th><th>VALOR</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="pair"><span>Desconto</span><span>${e(money(sale.discount || 0))}</span></div><div class="pair"><span>Acréscimo</span><span>${e(money(sale.addition || 0))}</span></div><div class="pair total"><span>TOTAL</span><span>${e(money(sale.total))}</span></div><div class="pair"><span>Pagamento</span><span>${e(sale.payment)}</span></div><div class="pair"><span>Troco</span><span>${e(money(sale.change || 0))}</span></div></div><div class="footer"><b>RECIBO NÃO FISCAL</b><p>Não substitui documento fiscal.</p><p>Obrigado pela preferência!</p></div></article></body></html>`;
}

// A same-origin print frame works after asynchronous persistence without popup permissions.
function autoPrintNonFiscalReceipt(sale) {
  try {
    document.getElementById("pdv-receipt-print-frame")?.remove();
    const frame = document.createElement("iframe");
    frame.id = "pdv-receipt-print-frame";
    frame.title = `Recibo nao fiscal da venda ${sale.id}`;
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:80mm;height:1px;border:0";
    frame.onload = () => {
      try { frame.contentWindow.focus(); frame.contentWindow.print(); }
      catch (error) { alert(`Venda ${sale.id} gravada. Nao foi possivel abrir a impressao. Use Reimprimir recibo; nao refaca a venda.`); }
    };
    frame.srcdoc = renderNonFiscalReceipt(sale);
    document.body.appendChild(frame);
  } catch (error) {
    alert(`Venda ${sale.id} gravada. Use Reimprimir recibo para imprimir; nao refaca a venda.`);
  }
}

function printNonFiscalReceipt(sale) {
  const receipt = window.open("", "_blank");
  if (!receipt) { alert("Permita abrir a janela de impressao neste navegador e clique novamente em Reimprimir recibo."); return false; }
  receipt.opener = null;
  receipt.document.write(renderNonFiscalReceipt(sale));
  receipt.document.close();
  return true;
}

function pdvReceiptSales(query = "", date = "") {
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const term = normalize(query).trim();
  return state.sales.filter(sale => sale.type === "PDV" && ["Fechado", "Parcialmente devolvido"].includes(sale.status)
    && (!date || String(sale.date).slice(0, 10) === date)
    && (!term || normalize([sale.id, sale.date, sale.customer, sale.seller, sale.terminalName].join(" ")).includes(term)))
    .sort((a, b) => Number(b.id) - Number(a.id));
}

function openPdvReceiptPicker() {
  if (document.getElementById("pdv-receipt-picker")) return;
  const dialog = document.createElement("dialog");
  dialog.id = "pdv-receipt-picker";
  dialog.className = "pdv-receipt-picker";
  dialog.setAttribute("aria-labelledby", "pdv-receipt-title");
  dialog.innerHTML = `<header><div><small>COMPROVANTES DA UNIDADE</small><h2 id="pdv-receipt-title">Qual venda deseja reimprimir?</h2><p>Escolha uma venda concluida. A reimpressao nao registra outra venda.</p></div><button class="btn danger" type="button" data-close>Fechar</button></header><div class="receipt-filters"><label>Buscar venda, cliente ou operador<input type="search" data-search placeholder="Ex.: 3, Consumidor Final ou bruno" /></label><label>Data da venda<input type="date" data-date /></label><button class="btn" type="button" data-clear>Limpar filtros</button></div><p role="status" data-count></p><div class="receipt-sale-list" data-list></div>`;
  const close = () => { dialog.close(); dialog.remove(); };
  const paint = () => {
    const rows = pdvReceiptSales(dialog.querySelector('[data-search]').value, dialog.querySelector('[data-date]').value);
    dialog.querySelector('[data-count]').textContent = `${rows.length} venda(s) encontrada(s), da mais recente para a mais antiga.`;
    dialog.querySelector('[data-list]').innerHTML = rows.length ? rows.map(sale => `<article><div><strong>Venda ${escapeHtml(sale.id)} <span>${escapeHtml(money(sale.total))}</span></strong><p>${escapeHtml(sale.date)} · ${escapeHtml(sale.customer || "Consumidor Final")}</p><small>${escapeHtml(sale.terminalName || "PDV")} · ${escapeHtml(sale.seller || "")} · ${sale.emissionMode === "receipt" ? "Recibo nao fiscal" : "Fiscal"}</small></div><button class="btn primary" type="button" data-print-sale="${escapeAttr(sale.id)}">Reimprimir venda ${escapeHtml(sale.id)}</button></article>`).join("") : '<p>Nenhuma venda concluida corresponde aos filtros.</p>';
  };
  dialog.querySelector('[data-close]').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.querySelector('[data-search]').addEventListener('input', paint);
  dialog.querySelector('[data-date]').addEventListener('change', paint);
  dialog.querySelector('[data-clear]').addEventListener('click', () => { dialog.querySelector('[data-search]').value = ''; dialog.querySelector('[data-date]').value = ''; paint(); });
  dialog.querySelector('[data-list]').addEventListener('click', event => {
    const button = event.target.closest('[data-print-sale]');
    if (button) printLastPdvSale(Number(button.dataset.printSale));
  });
  paint(); document.body.appendChild(dialog); dialog.showModal(); dialog.querySelector('[data-search]').focus();
}

function printLastPdvSale(saleId = null) {
  const sale = saleId !== null ? state.sales.find(item => item.type === "PDV" && Number(item.id) === Number(saleId) && ["Fechado", "Parcialmente devolvido"].includes(item.status)) : state.sales.find((item) => item.id === lastPdvSaleId) || state.sales.slice().reverse().find((item) => item.type === "PDV" && (!item.terminalId || item.terminalId === pdvTerminalId()));
  if (!sale) {
    alert("Ainda nao ha venda PDV para imprimir.");
    return;
  }
  const fiscal = state.fiscalQueue.find((row) => row.saleId === sale.id && row.model === "NFC-e" && row.status === "Autorizada");
  const printMode = sale.emissionMode ? (sale.emissionMode === "receipt" ? "Recibo simples" : "Cupom fiscal") : (state.settings.pdvPrintMode || "Ambos");
  if (printMode === "Cupom fiscal" && !fiscal) {
    alert("O PDV esta configurado para imprimir somente cupom fiscal. Autorize a NFC-e antes de imprimir.");
    return;
  }
  const useFiscal = printMode !== "Recibo simples" && Boolean(fiscal);
  if (!useFiscal) {
    if (printNonFiscalReceipt(sale)) { audit("Recibo nao fiscal aberto para impressao", `Venda ${sale.id}`); save(); }
    return;
  }
  const content = [
    state.settings.company,
    useFiscal ? "CUPOM FISCAL ELETRONICO - NFC-e" : "SIMPLES RECIBO - NAO E DOCUMENTO FISCAL",
    `Venda: ${sale.id} Data: ${sale.date}`,
    `Cliente: ${sale.customer}`,
    `CPF Clube Tortela: ${sale.clubCpf || sale.customerDocument || "-"}`,
    `Operador: ${sale.seller}`,
    `Terminal: ${sale.terminalName || "PDV"}`,
    useFiscal ? `Chave NFC-e: ${fiscal.key || "-"}` : "NFC-e nao autorizada para este comprovante",
    "",
    ...ItemPreparation.ordered(sale.items).flatMap((item) => [`${item.parentLineId?'  ':''}${item.qty} ${item.unit} ${item.description} ${money(item.qty * item.price)}`, ...ItemPreparation.lines(item).map(line=>`  ${line}`)]),
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
  for (const [originalIndex,item] of (sale.items || []).entries()) {
    const already = returnedBefore.reduce((sum, record) => sum + (record.items || []).filter((row) => (row.referencedItem ? row.referencedItem===originalIndex+1 : row.id === item.id)).reduce((value, row) => value + Number(row.qty || 0), 0), 0);
    const available = Math.max(0, Number(item.qty || 0) - already);
    if (!available) continue;
    const answer = prompt(`${item.description}\nQuantidade a ${exchange ? "trocar" : "devolver"} (disponivel ${available}):`, String(available).replace(".", ","));
    if (answer === null) return false;
    const qty = Number(answer.replace(",", ".") || 0);
    if (qty < 0 || qty > available) return alert(`Quantidade invalida para ${item.description}.`) || false;
    if (qty > 0) items.push({ ...structuredClone(item), qty, referencedItem: originalIndex+1 });
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
    items: items.map(item=>({...structuredClone(item),referencedKey:originalFiscal?.key||"",referencedItem:Number(item.referencedItem||sale.items.findIndex(original=>original.id===item.id&&original.description===item.description)+1)})),
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

function choosePdvPayment(total) {
 return new Promise(resolve=>{
 const dialog=document.createElement('dialog');dialog.className='pdv-customer-dialog pdv-payment-dialog';dialog.setAttribute('aria-labelledby','pdv-payment-title');
 dialog.innerHTML=`<form><header><small>CONCLUIR VENDA</small><h2 id="pdv-payment-title">Como o cliente vai pagar?</h2><p>Total: <strong>${money(total)}</strong></p></header><div class="pdv-customer-fields"><label>Forma de pagamento<select name="method" required><option value="">Selecione uma forma</option><option value="Dinheiro">Dinheiro</option><option value="Cartao credito">Credito</option><option value="Cartao debito">Debito</option><option value="PIX">PIX</option><option value="iFood">iFood</option></select></label><label>Valor recebido<input name="amount" type="number" min="0" step="0.01" value="${total.toFixed(2)}" required></label></div><p role="status" data-payment-status>Escolha uma forma para continuar. A venda ainda nao foi gravada.</p><footer><button class="btn danger" type="button" data-cancel>Voltar a venda</button><button class="btn primary" type="submit">Confirmar pagamento e concluir</button></footer></form>`;
 const form=dialog.querySelector('form'),status=form.querySelector('[data-payment-status]');const finish=value=>{dialog.close();dialog.remove();resolve(value);};
 const preview=()=>{if(!form.elements.method.value)return;form.elements.amount.readOnly=form.elements.method.value!=='Dinheiro';if(form.elements.amount.readOnly)form.elements.amount.value=total.toFixed(2);try{const payment=window.PdvPayments.calculate(total,{[form.elements.method.value]:Number(form.elements.amount.value)},true);status.textContent='Troco: '+money(payment.change)+(form.elements.method.value==='iFood'?' · Registra o recebimento pela plataforma; nao faz cobranca no iFood.':'');}catch(error){status.textContent=error.message;}};
 form.elements.method.addEventListener('change',preview);form.elements.amount.addEventListener('input',preview);form.addEventListener('submit',event=>{event.preventDefault();if(!form.elements.method.value)return;try{const raw={[form.elements.method.value]:Number(form.elements.amount.value)};window.PdvPayments.calculate(total,raw,true);finish(raw);}catch(error){status.textContent=error.message;}});form.querySelector('[data-cancel]').addEventListener('click',()=>finish(null));dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});document.body.appendChild(dialog);dialog.showModal();form.elements.method.focus();
 });
}
function pdvPaymentBreakdown(total, chosen = null) {
 const raw=chosen||{Dinheiro:num('pay-money'),PIX:num('pay-pix'),'Cartao debito':num('pay-debit'),'Cartao credito':num('pay-credit'),iFood:num('pay-ifood'),Crediario:num('pay-store-credit')};
 return window.PdvPayments.calculate(total,raw,Boolean(chosen));
}

function applySaleStock(items, reference = "Venda") {
  items.forEach((item) => {
    const product = state.products.find((productItem) => productItem.id === item.id);
    if (!product) return;
    const requirements = saleStockRequirements([item]);
    const directProductSale = requirements.length === 1 && Number(requirements[0].productId) === Number(product.id) && !saleComposition(product).length;
    item.componentTraceability = [];
    requirements.forEach((requirement) => {
      const stockProduct = state.products.find((row) => Number(row.id) === Number(requirement.productId));
      if (!stockProduct) return;
      const usedQty = Number(requirement.qty || 0);
      const traceability = consumeProductTraceability(stockProduct, usedQty, reference);
      stockProduct.stock = Number(stockProduct.stock || 0) - usedQty;
      if (directProductSale) {
        item.traceability = traceability;
        addStockMovement(stockProduct, "Venda", -usedQty, `Venda ${item.description}`);
      } else {
        item.componentTraceability.push({ productId: stockProduct.id, qty: usedQty, traceability });
        addStockMovement(stockProduct, "Baixa composicao", -usedQty, `Componente de ${product.description}`);
      }
    });
  });
}

function restoreSaleStock(items, saleId) {
  saleStockRequirements(items).forEach((requirement) => {
    const product = state.products.find((row) => Number(row.id) === Number(requirement.productId));
    if (!product) return;
    product.stock = Number(product.stock || 0) + Number(requirement.qty || 0);
    addStockMovement(product, "Estorno pedido online", Number(requirement.qty || 0), `Cancelamento pedido online ${saleId}`);
  });
}

function compositionRequirements(product, qty, modes) {
  return (product.composition || [])
    .filter((component) => modes.includes(component.mode || "both"))
    .map((component) => {
      const raw = state.products.find((row) => row.id === component.productId);
      return { productId: component.productId, qty: componentStockQty(component, raw) * Number(qty || 0), useQty: Number(component.qty || 0) * Number(qty || 0), useUnit: component.useUnit || raw?.unit || "" };
    });
}

function saleComposition(product) {
  return (product?.composition || []).filter((component) => (component.mode || "both") !== "production");
}

function collectSaleStockRequirements(product, qty, visited = new Set()) {
  if (!product) return [];
  const productId = Number(product.id);
  if (visited.has(productId)) return [{ productId, qty: Number(qty || 0) }];
  const components = saleComposition(product);
  if (!components.length) return [{ productId, qty: Number(qty || 0) }];
  const nextVisited = new Set(visited);
  nextVisited.add(productId);
  return components.flatMap((component) => {
    const raw = state.products.find((row) => Number(row.id) === Number(component.productId));
    const componentQty = componentStockQty(component, raw) * Number(qty || 0);
    return raw ? collectSaleStockRequirements(raw, componentQty, nextVisited) : [{ productId: Number(component.productId), qty: componentQty }];
  });
}

function saleStockRequirements(items) {
  const requirements = [];
  items.forEach((item) => {
    const product = state.products.find((row) => row.id === item.id);
    if (!product) return;
    requirements.push(...collectSaleStockRequirements(product, Number(item.qty || 0)));
  });
  return aggregateRequirements(requirements);
}

function aggregateRequirements(requirements) {
  const totals = new Map();
  requirements.forEach((row) => totals.set(row.productId, Number(totals.get(row.productId) || 0) + Number(row.qty || 0)));
  return Array.from(totals, ([productId, qty]) => ({ productId, qty }));
}

function stockShortages(requirements, allowNegative = false) {
  return aggregateRequirements(requirements).flatMap((requirement) => {
    const product = state.products.find((row) => row.id === requirement.productId);
    if (!product) return [];
    const problems = [];
    if (!allowNegative && Number(product.stock || 0) + 0.000001 < requirement.qty) problems.push(`${product.description}: necessario ${requirement.qty} ${product.unit}, disponivel ${product.stock} ${product.unit}`);
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
  const refundPayments = sale.type === "PDV" ? (sale.payments || []).filter(row=>row.method!=="Crediario") : [];
  for (const payment of refundPayments) {
    const cashRefund = Math.max(0, Number(payment.value||0) - (payment.method==="Dinheiro" ? Number(sale.change||0) : 0));
    if (!cashRefund) continue;
    state.cash.push({
      id: nextId(state.cash),
      date: today(),
      account: "CAIXA",
      history: `Estorno venda ${sale.id}`,
      in: 0,
      out: cashRefund,
      paymentMethod: payment.method,
      cashRegisterOpenedAt: state.cashRegister?.open ? state.cashRegister.openedAt : ""
    });
  }
  state.fiscalQueue.filter((row) => row.saleId === sale.id && !String(row.status || "").startsWith("Cancelada")).forEach((row) => {
    row.status = row.key || row.protocol || row.status === "Autorizada"
      ? "Cancelamento fiscal pendente"
      : "Cancelada antes da transmissao";
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
    const requirements = saleStockRequirements([item]);
    const directProductSale = requirements.length === 1 && Number(requirements[0].productId) === Number(product.id) && !saleComposition(product).length;
    requirements.forEach((requirement) => {
      const stockProduct = state.products.find((row) => Number(row.id) === Number(requirement.productId));
      if (!stockProduct) return;
      const qty = Number(requirement.qty || 0);
      stockProduct.stock = Number(stockProduct.stock || 0) + qty;
      const traceability = directProductSale
        ? item.traceability
        : (item.componentTraceability || []).find((row) => Number(row.productId) === Number(stockProduct.id))?.traceability;
      restoreProductTraceability(stockProduct, traceability, qty);
      addStockMovement(stockProduct, directProductSale ? "Estorno venda" : "Estorno composicao", qty, `Cancelamento venda ${saleId}`);
    });
  });
}

window.addEventListener("online", () => {
  renderShell();
  if (localStorage.getItem("tortelaplus-pending-sync") === "1") save();
  processPendingFiscalQueue();
});

window.addEventListener("hashchange", () => {
  if (byId("app")?.querySelector(".app-shell")) renderShell();
});

document.addEventListener("click", (event) => {
  const dashboardPdv = event.target.closest("#open-pdv");
  if (dashboardPdv) {
    event.preventDefault();
    event.stopPropagation();
    currentMode = "pdv";
    setInternalRoute({ mode: "pdv", module: "", tab: "", fiscal: "", stock: "", people: "", settings: "" });
    renderShell();
    return;
  }
  const newPersonType = event.target.closest("[data-new-person-type]");
  if (newPersonType) {
    event.preventDefault();
    event.stopPropagation();
    newPersonRecord(newPersonType.dataset.newPersonType || "Cliente");
    return;
  }
  const publicRegistration = event.target.closest("#copy-public-registration");
  if (publicRegistration) {
    event.preventDefault();
    event.stopPropagation();
    copyPublicRegistrationLink();
    return;
  }
  const newProductType = event.target.closest("[data-new-product-type]");
  if (newProductType) {
    event.preventDefault();
    event.stopPropagation();
    newProductRecord(newProductType.dataset.newProductType || "Mercadoria para revenda");
    return;
  }
  const dashboardModuleButton = event.target.closest("[data-dashboard-module]");
  if (dashboardModuleButton) {
    event.preventDefault();
    event.stopPropagation();
    navigateBackofficeModule(dashboardModuleButton.dataset.dashboardModule || "dashboard");
    return;
  }
  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) {
    event.preventDefault();
    event.stopPropagation();
    currentMode = modeButton.dataset.mode || "backoffice";
    if (currentMode === "pdv") setInternalRoute({ mode: "pdv", module: "", tab: "", fiscal: "", stock: "", people: "", settings: "" });
    else setInternalRoute({ mode: "", module: currentModule });
    renderShell();
    return;
  }
  const moduleButton = event.target.closest("[data-module]");
  if (moduleButton) {
    event.preventDefault();
    event.stopPropagation();
    navigateBackofficeModule(moduleButton.dataset.module || "dashboard");
    return;
  }
  const fiscalTab = event.target.closest("[data-fiscal-tab]");
  if (fiscalTab) {
    event.preventDefault();
    event.stopPropagation();
    currentFiscalTab = fiscalTab.dataset.fiscalTab || "fila";
    setInternalRoute({ module: "fiscal", fiscal: currentFiscalTab });
    renderShell();
    return;
  }
  const stockTab = event.target.closest("[data-stock-tab]");
  if (stockTab) {
    event.preventDefault();
    event.stopPropagation();
    navigateStockTab(stockTab.dataset.stockTab || "producao");
    return;
  }
  const openPurchaseXml = event.target.closest("#open-purchase-xml-ribbon, #open-purchase-xml-footer");
  if (openPurchaseXml) {
    event.preventDefault();
    event.stopPropagation();
    openPurchaseXmlPicker();
    return;
  }
  const addPurchaseShortcut = event.target.closest("#add-purchase-item-ribbon, #add-purchase-item-footer");
  if (addPurchaseShortcut) {
    event.preventDefault();
    event.stopPropagation();
    addPurchaseItemRecord();
    return;
  }
  const clearPurchaseShortcut = event.target.closest("#clear-purchase-items-ribbon, #clear-purchase-items-footer");
  if (clearPurchaseShortcut) {
    event.preventDefault();
    event.stopPropagation();
    clearPurchaseItemsRecord();
    return;
  }
  const savePurchaseShortcut = event.target.closest("#new-purchase-ribbon, #new-purchase");
  if (savePurchaseShortcut) {
    event.preventDefault();
    event.stopPropagation();
    savePurchaseRecord();
    return;
  }
  const purchaseStep = event.target.closest("[data-purchase-step]");
  if (purchaseStep) {
    event.preventDefault();
    event.stopPropagation();
    focusPurchaseStep(purchaseStep.dataset.purchaseStep || "document");
    return;
  }
  const addOrderShortcut = event.target.closest("#add-order-item-ribbon, #add-order-item-footer");
  if (addOrderShortcut) {
    event.preventDefault();
    event.stopPropagation();
    addOrderItemRecord();
    return;
  }
  const clearOrderShortcut = event.target.closest("#clear-order-items-ribbon, #clear-order-items-footer");
  if (clearOrderShortcut) {
    event.preventDefault();
    event.stopPropagation();
    clearOrderItemsRecord();
    return;
  }
  const saveOrderShortcut = event.target.closest("#save-order-ribbon, #save-order");
  if (saveOrderShortcut) {
    event.preventDefault();
    event.stopPropagation();
    saveOrderRecord();
    return;
  }
  const salesStep = event.target.closest("[data-sales-step]");
  if (salesStep) {
    event.preventDefault();
    event.stopPropagation();
    focusSalesStep(salesStep.dataset.salesStep || "order");
    return;
  }
  const personFilter = event.target.closest("[data-person-filter]");
  if (personFilter) {
    event.preventDefault();
    event.stopPropagation();
    currentPeopleTab = personFilter.dataset.personFilter || "Todos";
    setInternalRoute({ module: "people", people: currentPeopleTab });
    renderShell();
    return;
  }
  const productTab = event.target.closest("[data-product-tab]");
  if (productTab) {
    event.preventDefault();
    event.stopPropagation();
    captureProductDraft();
    currentTab = productTab.dataset.productTab || "dados";
    setInternalRoute({ module: "products", tab: currentTab });
    renderShell();
    return;
  }
  const settingsTab = event.target.closest("[data-settings-tab]");
  if (settingsTab) {
    event.preventDefault();
    event.stopPropagation();
    currentSettingsTab = settingsTab.dataset.settingsTab || "geral";
    setInternalRoute({ module: "settings", settings: currentSettingsTab });
    renderShell();
    return;
  }
  const genericTab = event.target.closest("[data-tab]");
  if (genericTab) {
    event.preventDefault();
    event.stopPropagation();
    captureProductDraft();
    currentTab = genericTab.dataset.tab || "dados";
    setInternalRoute({ module: currentModule, tab: currentTab });
    renderShell();
  }
}, true);

window.addEventListener("offline", renderShell);
window.addEventListener("beforeunload", endSession);
setInterval(processPendingFiscalQueue, 60000);

if ("caches" in window) {
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith("tortelaplus-operacao-")).map((key) => caches.delete(key))))
    .catch(() => undefined);
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations?.()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.update?.())))
    .catch(() => undefined);
  navigator.serviceWorker.register("/sw.js?v=settings-tabs-cleanup-v11").catch(() => undefined);
}

boot();

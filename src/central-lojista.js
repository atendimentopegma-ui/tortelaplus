let sessionId = sessionStorage.getItem("tortela-lojista-session") || "";
let tenantCode = sessionStorage.getItem("tortela-lojista-tenant") || "cliente-exemplo";
let authUser = JSON.parse(sessionStorage.getItem("tortela-lojista-user") || "null");
let tenant = JSON.parse(sessionStorage.getItem("tortela-lojista-tenant-info") || "null");
let state = null;
let currentModule = sessionStorage.getItem("tortela-lojista-module") || "overview";

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
  dashboard: "Painel",
  people: "Pessoas",
  products: "Produtos",
  stock: "Estoque",
  purchases: "Compras",
  sales: "Vendas",
  finance: "Financeiro",
  fiscal: "Fiscal",
  reports: "Relatorios",
  settings: "Configuracoes",
  pdv: "PDV",
  stock_adjust: "Ajustar estoque",
  purchase_cancel: "Cancelar compra",
  sales_cancel: "Cancelar venda",
  finance_settle: "Baixar financeiro",
  fiscal_transmit: "Transmitir fiscal",
  fiscal_cancel: "Cancelar fiscal",
  restore_backup: "Restaurar backup",
  manage_users: "Gerenciar usuarios"
};

const modules = [
  ["overview", "Painel", "Resumo da loja"],
  ["channels", "Pedidos", "PDV, totem e loja"],
  ["people", "Pessoas", "Clientes e fornecedores"],
  ["products", "Produtos", "Cadastro da unidade"],
  ["qr", "Entrada QR", "Remessa da Central"],
  ["stock", "Estoque", "Baixas e aprovacao"],
  ["purchases", "Compras", "Entrada de nota"],
  ["fiscal", "Fiscal", "NF-e e impressao"],
  ["imports", "Importacoes", "Vendas, financeiro e estoque"],
  ["payables", "A pagar", "Fornecedores e despesas"],
  ["receivables", "A receber", "Clientes e boletos"],
  ["reports", "Relatorios", "Operacao da unidade"],
  ["users", "Usuarios", "Hierarquia e acessos"]
];

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function amount(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(date) {
  const target = new Date(`${date || today()}T00:00:00`).getTime();
  const current = new Date(`${today()}T00:00:00`).getTime();
  return Math.floor((target - current) / 86400000);
}

function simpleHash(text) {
  let hash = 2166136261;
  for (const char of String(text || "")) {
    hash ^= char.charCodeAt(0);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
}

function licenseChallenge() {
  const user = authUser?.username || "Operador";
  return `S-${simpleHash(`${tenant?.tenantCode || tenantCode}|${tenant?.document || ""}|${tenant?.licenseExpiresAt || today()}|${user}`)}`;
}

function licenseExpired() {
  return daysUntil(tenant?.licenseExpiresAt || today()) < 0;
}

function nextId(items = []) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function brandMarkup() {
  return `<div class="tortela-logo"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela" /></div>`;
}

function userPermissions() {
  return authUser?.permissions || rolePermissions[authUser?.role] || [];
}

function can(permission) {
  return userPermissions().includes(permission);
}

function requirePermission(permission) {
  if (can(permission)) return true;
  alert(`Seu usuario nao possui permissao para ${permissionLabels[permission] || permission}.`);
  return false;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (sessionId) headers.Authorization = `Bearer ${sessionId}`;
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

function normalizeState(payload = {}) {
  const data = payload.state || payload;
  return {
    people: [],
    products: [],
    stockMovements: [],
    stockLots: [],
    sales: [],
    purchases: [],
    payables: [],
    receivables: [],
    fiscalQueue: [],
    approvalRequests: [],
    users: [],
    auditLogs: [],
    settings: { tenantCode },
    ...data,
    people: data.people || [],
    products: data.products || [],
    stockMovements: data.stockMovements || [],
    stockLots: data.stockLots || [],
    sales: data.sales || [],
    purchases: data.purchases || [],
    payables: data.payables || [],
    receivables: data.receivables || [],
    fiscalQueue: data.fiscalQueue || [],
    approvalRequests: data.approvalRequests || [],
    users: data.users || [],
    auditLogs: data.auditLogs || []
  };
}

function audit(action, detail) {
  state.auditLogs = state.auditLogs || [];
  state.auditLogs.unshift({
    id: nextId(state.auditLogs),
    at: new Date().toISOString(),
    user: authUser?.username || "franqueado",
    action,
    detail
  });
  state.auditLogs = state.auditLogs.slice(0, 400);
}

async function saveState(permission, action = "Dados salvos") {
  if (!requirePermission(permission)) return false;
  const result = await api(`/api/tenant/${encodeURIComponent(tenantCode)}/state`, {
    method: "POST",
    headers: { "x-pegma-permission": permission },
    body: JSON.stringify({ state, baseRevision: Number(state._meta?.revision || 0) })
  });
  state._meta = { ...(state._meta || {}), revision: result.revision };
  alert(action);
  return true;
}

function renderLogin() {
  byId("app").innerHTML = `
    <main class="login-shell tortela-login-shell">
      <section class="login-card">
        <div class="login-brand tortela-login-brand">
          ${brandMarkup()}
          <div><h1>Central do Franqueado</h1><p>Controle da unidade: financeiro, estoque, relatorios, QR e usuarios.</p></div>
        </div>
        <form class="login-panel" id="store-login">
          <h2>Acesso da loja</h2>
          <div class="field"><label>Codigo da unidade</label><input id="store-tenant" value="${escapeAttr(tenantCode)}" required /></div>
          <div class="field"><label>Usuario</label><input id="store-user" value="${escapeAttr(authUser?.username || "Operador")}" autocomplete="username" required /></div>
          <div class="field"><label>Senha</label><input id="store-password" type="password" value="123456" autocomplete="current-password" required /></div>
          <button class="btn primary" type="submit">Entrar</button>
        </form>
      </section>
    </main>`;
  byId("store-login").addEventListener("submit", login);
}

async function login(event) {
  event.preventDefault();
  try {
    tenantCode = byId("store-tenant").value.trim() || "cliente-exemplo";
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        user: byId("store-user").value.trim(),
        password: byId("store-password").value,
        terminalName: "Central do Franqueado"
      })
    });
    sessionId = result.sessionId;
    authUser = result.user;
    tenant = result.tenant;
    sessionStorage.setItem("tortela-lojista-session", sessionId);
    sessionStorage.setItem("tortela-lojista-tenant", tenantCode);
    sessionStorage.setItem("tortela-lojista-user", JSON.stringify(authUser));
    sessionStorage.setItem("tortela-lojista-tenant-info", JSON.stringify(tenant));
    if (licenseExpired()) {
      renderLicenseGate();
      return;
    }
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function boot() {
  if (!sessionId) return renderLogin();
  if (tenant && licenseExpired()) return renderLicenseGate();
  try {
    state = normalizeState(await api(`/api/tenant/${encodeURIComponent(tenantCode)}/state`));
    render();
  } catch {
    logout(false);
  }
}

function logout(callApi = true) {
  if (callApi && sessionId) {
    api("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ tenantCode, sessionId })
    }).catch(() => undefined);
  }
  sessionId = "";
  authUser = null;
  sessionStorage.removeItem("tortela-lojista-session");
  sessionStorage.removeItem("tortela-lojista-user");
  sessionStorage.removeItem("tortela-lojista-tenant-info");
  renderLogin();
}

function renderLicenseGate() {
  const challenge = licenseChallenge();
  const renewalDays = Number(tenant?.renewalDays || 30);
  byId("app").innerHTML = `
    <main class="login-shell tortela-login-shell">
      <section class="login-card">
        <div class="login-brand tortela-login-brand">
          ${brandMarkup()}
          <div>
            <h1>Verificacao da unidade</h1>
            <p>O periodo definido pela Central Administrativa venceu. Envie o codigo abaixo ao administrador para receber a contra-senha.</p>
          </div>
        </div>
        <form class="login-panel" id="license-form">
          <h2>Codigo do franqueado</h2>
          <div class="network-card kpi"><small>Enviar para a Central Administrativa</small><strong>${escapeHtml(challenge)}</strong><span>Prazo configurado: ${amount(renewalDays)} dia(s)</span></div>
          <div class="field"><label>Contra-senha recebida</label><input id="counter-password" placeholder="AAA-0000" autocomplete="off" required /></div>
          <button class="btn primary" type="submit">Liberar Central do Franqueado</button>
          <button class="btn ghost" id="license-refresh" type="button">Verificar liberacao da Central</button>
          <button class="btn ghost" id="license-logout" type="button">Voltar</button>
        </form>
      </section>
    </main>`;
  byId("license-form").addEventListener("submit", redeemLicense);
  byId("license-refresh").addEventListener("click", refreshLicenseStatus);
  byId("license-logout").addEventListener("click", () => logout(true));
}

async function redeemLicense(event) {
  event.preventDefault();
  try {
    const result = await api("/api/licenses/redeem", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        challenge: licenseChallenge(),
        counterPassword: byId("counter-password").value,
        days: Number(tenant?.renewalDays || 30),
        user: authUser?.username || "Operador"
      })
    });
    tenant.licenseExpiresAt = result.licenseExpiresAt;
    sessionStorage.setItem("tortela-lojista-tenant-info", JSON.stringify(tenant));
    alert(`Central liberada ate ${result.licenseExpiresAt}.`);
    await boot();
  } catch (error) {
    alert(error.message || "Contra-senha invalida.");
  }
}

async function refreshLicenseStatus() {
  try {
    const result = await api("/api/licenses/status", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        sessionId,
        user: authUser?.username || "Operador"
      })
    });
    tenant = result.tenant;
    sessionStorage.setItem("tortela-lojista-tenant-info", JSON.stringify(tenant));
    if (!result.expired) {
      alert(`Central liberada ate ${tenant.licenseExpiresAt}.`);
      await boot();
      return;
    }
    alert("A Central Administrativa ainda nao liberou esta unidade.");
    renderLicenseGate();
  } catch (error) {
    alert(error.message || "Nao foi possivel verificar a liberacao.");
  }
}

function render() {
  byId("app").innerHTML = `
    <header class="topbar tortela-topbar">
      <div class="brand">${brandMarkup()}<div><strong>Central do Franqueado</strong><small>${escapeHtml(state.settings?.company || tenant?.tradeName || tenantCode)} | ${escapeHtml(authUser?.role || "Usuario")}</small></div></div>
      <div class="top-right">
        <button class="btn network-white" id="refresh">Atualizar</button>
        <a class="btn network-white" href="./index.html#mode=pdv">PDV</a>
        <a class="btn network-white" href="./totem.html?unidade=${encodeURIComponent(tenantCode)}">Totem local</a>
        <a class="btn network-white" href="./loja.html?unidade=${encodeURIComponent(tenantCode)}">Loja online</a>
        <button class="btn network-white" id="logout">Sair</button>
      </div>
    </header>
    <main class="network-shell store-central-shell">
      <div class="network-dashboard">
        <aside class="network-nav">${renderNav()}</aside>
        <section class="network-stage">${renderCurrentModule()}</section>
      </div>
    </main>`;
  bind();
}

function renderNav() {
  return modules.map(([key, label, detail]) => `
    <button data-store-module="${key}" class="${currentModule === key ? "active" : ""}">
      ${label}<small>${detail}</small>
    </button>`).join("");
}

function renderCurrentModule() {
  const renderers = {
    overview: renderOverview,
    channels: renderChannels,
    people: renderPeople,
    products: renderProducts,
    qr: renderQr,
    stock: renderStock,
    purchases: renderPurchases,
    fiscal: renderFiscal,
    imports: renderImports,
    payables: renderPayables,
    receivables: renderReceivables,
    reports: renderReports,
    users: renderUsers
  };
  return (renderers[currentModule] || renderOverview)();
}

function moduleTitle(title, detail, action = "") {
  return `<div class="network-module-title"><div><h1>${title}</h1>${detail ? `<p>${detail}</p>` : ""}</div>${action}</div>`;
}

function kpi(label, value, note = "") {
  return `<div class="network-card kpi"><small>${label}</small><strong>${value}</strong>${note ? `<span>${note}</span>` : ""}</div>`;
}

function table(headers, rows, empty = "Sem registros.") {
  return `<div class="network-table-wrap"><table>
    <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
    <tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">${empty}</td></tr>`}</tbody>
  </table></div>`;
}

function financeBalance(item) {
  if (item.cancelled || item.status === "Pago" || item.status === "Recebido") return 0;
  return Math.max(0, Number(item.value || 0) + Number(item.interest || 0) - Number(item.discount || 0) - Number(item.paidValue || 0));
}

function totals() {
  const month = today().slice(0, 7);
  const sales = state.sales.filter((row) => String(row.date || row.createdAt || "").slice(0, 7) === month && !["Cancelado", "Cancelada", "Devolvido"].includes(row.status));
  const salesTotal = sales.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const payableOpen = state.payables.reduce((sum, row) => sum + financeBalance(row), 0);
  const receivableOpen = state.receivables.reduce((sum, row) => sum + financeBalance(row), 0);
  const stockCost = state.products.reduce((sum, product) => sum + Number(product.stock || 0) * Number(product.cost || 0), 0);
  const lowStock = state.products.filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0));
  return { sales, salesTotal, payableOpen, receivableOpen, stockCost, lowStock };
}

function channelLabel(sale = {}) {
  const source = String(sale.source || sale.origin || sale.channel || sale.type || sale.seller || "").toLowerCase();
  if (sale.kioskOrder || sale.kioskTicketNumber || source.includes("totem")) return "Totem local";
  if (sale.onlineOrder && sale.delivery === "Retirada") return "Loja online - retirada";
  if (sale.onlineOrder || source.includes("loja online") || source.includes("delivery")) return "Loja online";
  if (source.includes("pdv") || sale.cashRegisterId || sale.cashRegisterOpenedAt) return "PDV";
  if (source.includes("central do lojista") || source.includes("central do franqueado")) return "Importado";
  return sale.type === "Orcamento" ? "Orcamento" : "Venda da loja";
}

function channelSummary() {
  const rows = new Map();
  state.sales.forEach((sale) => {
    const channel = channelLabel(sale);
    const current = rows.get(channel) || { channel, count: 0, total: 0, pending: 0 };
    current.count += 1;
    current.total += Number(sale.total || 0);
    if (sale.onlineOrder && !["Entregue", "Cancelado", "Cancelada", "Devolvido"].includes(sale.status)) current.pending += 1;
    rows.set(channel, current);
  });
  return [...rows.values()].sort((a, b) => b.total - a.total);
}

function renderOverview() {
  const data = totals();
  const pendingOrders = state.sales.filter((sale) => sale.onlineOrder && !["Entregue", "Cancelado", "Cancelada"].includes(sale.status));
  return `<div class="network-module compact">
    ${moduleTitle("Painel do Franqueado", "")}
    <div class="network-grid four">
      ${kpi("Vendas no mes", money(data.salesTotal), `${amount(data.sales.length)} venda(s)`)}
      ${kpi("A receber aberto", money(data.receivableOpen))}
      ${kpi("A pagar aberto", money(data.payableOpen))}
      ${kpi("Pedidos em aberto", amount(pendingOrders.length), "PDV, totem e loja")}
    </div>
    <section class="network-card">
      <h2>Canais ligados a esta loja</h2>
      <div class="store-action-grid">
        <button class="desktop-ribbon-button primary" data-store-module="channels" type="button"><span class="dashboard-module-icon icon-sales"></span><strong>Pedidos</strong><small>Controlar canais</small></button>
        <a class="desktop-ribbon-button" href="./index.html#mode=pdv"><span class="dashboard-module-icon icon-pdv"></span><strong>PDV</strong><small>Venda no caixa</small></a>
        <a class="desktop-ribbon-button" href="./totem.html?unidade=${encodeURIComponent(tenantCode)}"><span class="dashboard-module-icon icon-products"></span><strong>Totem local</strong><small>Autoatendimento</small></a>
        <a class="desktop-ribbon-button" href="./loja.html?unidade=${encodeURIComponent(tenantCode)}"><span class="dashboard-module-icon icon-store"></span><strong>Loja online</strong><small>Pedidos delivery</small></a>
        <a class="desktop-ribbon-button" href="./cozinha?unidade=${encodeURIComponent(tenantCode)}"><span class="dashboard-module-icon icon-stock"></span><strong>Cozinha</strong><small>Preparo</small></a>
        <a class="desktop-ribbon-button" href="./telao.html?unidade=${encodeURIComponent(tenantCode)}"><span class="dashboard-module-icon icon-reports"></span><strong>Telao</strong><small>Chamada de senha</small></a>
      </div>
    </section>
    <section class="network-card">
      <h2>Controles da unidade</h2>
      <div class="store-action-grid">
        <button class="desktop-ribbon-button" data-store-module="people" type="button"><span class="dashboard-module-icon icon-people"></span><strong>Pessoas</strong><small>Clientes e fornecedores</small></button>
        <button class="desktop-ribbon-button" data-store-module="products" type="button"><span class="dashboard-module-icon icon-products"></span><strong>Produtos</strong><small>Cadastro local</small></button>
        <button class="desktop-ribbon-button primary" data-store-module="qr" type="button"><span class="dashboard-module-icon icon-pdv"></span><strong>Entrada QR</strong><small>Receber remessa</small></button>
        <button class="desktop-ribbon-button" data-store-module="stock" type="button"><span class="dashboard-module-icon icon-stock"></span><strong>Estoque</strong><small>Baixa auditada</small></button>
        <button class="desktop-ribbon-button" data-store-module="purchases" type="button"><span class="dashboard-module-icon icon-purchases"></span><strong>Compras</strong><small>Entrada de nota</small></button>
        <button class="desktop-ribbon-button" data-store-module="fiscal" type="button"><span class="dashboard-module-icon icon-fiscal"></span><strong>Fiscal</strong><small>NF-e e impressao</small></button>
        <button class="desktop-ribbon-button" data-store-module="imports" type="button"><span class="dashboard-module-icon icon-fiscal"></span><strong>Importar dados</strong><small>Venda, estoque e contas</small></button>
        <button class="desktop-ribbon-button" data-store-module="payables" type="button"><span class="dashboard-module-icon icon-finance"></span><strong>A pagar</strong><small>Despesas abertas</small></button>
        <button class="desktop-ribbon-button" data-store-module="receivables" type="button"><span class="dashboard-module-icon icon-sales"></span><strong>A receber</strong><small>Clientes e boletos</small></button>
        <button class="desktop-ribbon-button" data-store-module="users" type="button"><span class="dashboard-module-icon icon-people"></span><strong>Usuarios</strong><small>Hierarquia</small></button>
      </div>
    </section>
    <section class="network-card">
      <h2>Produtos abaixo do minimo</h2>
      ${table(["Produto", "Atual", "Minimo", "Custo"], data.lowStock.map((row) => [
        escapeHtml(row.description || row.product || "-"),
        amount(row.stock || 0),
        amount(row.minStock || 0),
        money(row.cost || 0)
      ]), "Nenhum produto abaixo do minimo.")}
    </section>
  </div>`;
}

function orderActions(sale) {
  if (!sale.onlineOrder || ["Entregue", "Cancelado", "Cancelada"].includes(sale.status)) return "-";
  return `
    ${!sale.kioskOrder && (sale.status || "Aberto") === "Aberto" ? `<button class="btn primary" data-order-status="${sale.id}" data-status="Conferido" type="button">Conferir</button>` : ""}
    ${!["Preparando", "Pronto", "Saiu para entrega"].includes(sale.status) ? `<button class="btn" data-order-status="${sale.id}" data-status="Preparando" type="button">Preparar</button>` : ""}
    ${sale.status === "Preparando" ? `<button class="btn primary" data-order-status="${sale.id}" data-status="Pronto" type="button">Pronto</button>` : ""}
    ${sale.status === "Pronto" && !sale.kioskOrder && sale.delivery !== "Retirada" ? `<button class="btn" data-order-status="${sale.id}" data-status="Saiu para entrega" type="button">Saiu entrega</button>` : ""}
    <button class="btn primary" data-order-status="${sale.id}" data-status="Entregue" type="button">Entregue</button>
    <button class="btn danger" data-order-status="${sale.id}" data-status="Cancelado" type="button">Cancelar</button>`;
}

function renderChannels() {
  const orders = state.sales.slice().sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || "")));
  const pendingOrders = orders.filter((sale) => sale.onlineOrder && !["Entregue", "Cancelado", "Cancelada"].includes(sale.status));
  const channelRows = channelSummary();
  return `<div class="network-module compact">
    ${moduleTitle("Pedidos e canais da loja", "Acompanhe PDV, totem local, loja online e a fila de preparo sem acessar a Retaguarda completa.")}
    <div class="network-grid four store-metric-grid" aria-label="Indicadores do painel">
      ${kpi("Pedidos abertos", amount(pendingOrders.length))}
      ${kpi("Canais ativos", amount(channelRows.length))}
      ${kpi("Vendas registradas", amount(state.sales.length))}
      ${kpi("Faturamento total", money(state.sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)))}
    </div>
    <section class="network-card">
      <h2>Resumo por canal</h2>
      ${table(["Canal", "Vendas", "Em aberto", "Total"], channelRows.map((row) => [
        escapeHtml(row.channel),
        amount(row.count),
        amount(row.pending),
        money(row.total)
      ]), "Nenhum canal com venda registrada.")}
    </section>
    <section class="network-card">
      <h2>Pedidos recebidos</h2>
      ${table(["Canal", "Data", "Cliente", "Itens", "Total", "Status", "Acao"], orders.map((sale) => [
        escapeHtml(channelLabel(sale)),
        escapeHtml(String(sale.createdAt || sale.date || "").slice(0, 16).replace("T", " ") || "-"),
        `${escapeHtml(sale.customer || sale.client || "Consumidor Final")}<br><small>${escapeHtml(sale.customerData?.phone || sale.customerDocument || "")}</small>`,
        amount((sale.items || []).length || sale.items || 0),
        money(sale.total || 0),
        `<span class="badge ${["Cancelado", "Cancelada", "Devolvido"].includes(sale.status) ? "danger" : ["Aberto", "Conferido", "Preparando"].includes(sale.status) ? "warn" : "ok"}">${escapeHtml(sale.status || "Fechado")}</span>`,
        orderActions(sale)
      ]), "Nenhum pedido recebido pelos canais da loja.")}
    </section>
  </div>`;
}

function renderPeople() {
  const people = (state.people || []).slice().sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  return `<div class="network-module compact">
    ${moduleTitle("Pessoas da unidade", "Cadastro operacional de clientes, fornecedores e equipe local.")}
    <section class="network-card">
      <h2>Novo cadastro</h2>
      <form class="network-form" id="person-form">
        <div class="field"><label>Tipo</label><select id="person-type">${["Cliente", "Fornecedor", "Funcionario", "Parceiro", "Entregador", "Transportadora", "Motorista", "Contador"].map((item) => `<option>${item}</option>`).join("")}</select></div>
        <div class="field wide"><label>Nome/Razao social</label><input id="person-name" required /></div>
        <div class="field"><label>Fantasia/Apelido</label><input id="person-alias" /></div>
        <div class="field"><label>CPF/CNPJ</label><input id="person-document" /></div>
        <div class="field"><label>Telefone</label><input id="person-phone" /></div>
        <div class="field"><label>WhatsApp</label><input id="person-whatsapp" /></div>
        <div class="field wide"><label>Email</label><input id="person-email" type="email" /></div>
        <button class="btn primary full" type="submit">Salvar pessoa</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Lista de pessoas</h2>
      ${table(["Codigo", "Tipo", "Nome", "Documento", "Telefone", "Status", "Acao"], people.map((person) => [
        amount(person.id || 0),
        escapeHtml(person.type || "-"),
        `<strong>${escapeHtml(person.name || "-")}</strong><br><small>${escapeHtml(person.alias || person.email || "")}</small>`,
        escapeHtml(person.document || "-"),
        escapeHtml(person.whatsapp || person.phone || "-"),
        `<span class="badge ${person.active === false ? "danger" : "ok"}">${person.active === false ? "Inativo" : "Ativo"}</span>`,
        `<button class="btn ${person.active === false ? "primary" : "danger"}" data-toggle-person="${person.id}">${person.active === false ? "Ativar" : "Inativar"}</button>`
      ]), "Nenhuma pessoa cadastrada nesta unidade.")}
    </section>
  </div>`;
}

async function savePerson(event) {
  event.preventDefault();
  if (!requirePermission("people")) return;
  const name = byId("person-name").value.trim();
  if (!name) return alert("Informe o nome.");
  state.people.push({
    id: nextId(state.people),
    type: byId("person-type").value,
    name,
    alias: byId("person-alias").value.trim(),
    document: byId("person-document").value.trim(),
    phone: byId("person-phone").value.trim(),
    whatsapp: byId("person-whatsapp").value.trim(),
    email: byId("person-email").value.trim(),
    active: true,
    registeredAt: new Date().toISOString(),
    source: "Central do Franqueado"
  });
  audit("Pessoa cadastrada", name);
  const saved = await saveState("people", "Pessoa salva.");
  if (saved) render();
}

async function togglePerson(id) {
  if (!requirePermission("people")) return;
  const person = state.people.find((row) => Number(row.id) === Number(id));
  if (!person) return;
  person.active = person.active === false;
  audit(person.active ? "Pessoa ativada" : "Pessoa inativada", person.name || String(id));
  const saved = await saveState("people", "Cadastro atualizado.");
  if (saved) render();
}

function renderProducts() {
  const products = (state.products || []).slice().sort((a, b) => String(a.description || "").localeCompare(String(b.description || "")));
  return `<div class="network-module compact">
    ${moduleTitle("Produtos da unidade", "Cadastro operacional usado pelo PDV, totem, loja online, estoque e fiscal.")}
    <section class="network-card">
      <h2>Novo produto</h2>
      <form class="network-form" id="product-form">
        <div class="field wide"><label>Descricao</label><input id="product-description" required /></div>
        <div class="field"><label>Codigo de barras</label><input id="product-barcode" /></div>
        <div class="field"><label>Tipo</label><select id="product-type">${["Mercadoria para revenda", "Materia-prima", "Produto fabricado", "Servico"].map((item) => `<option>${item}</option>`).join("")}</select></div>
        <div class="field"><label>Unidade</label><input id="product-unit" value="UN" /></div>
        <div class="field"><label>Preco venda</label><input id="product-price" type="number" step="0.01" min="0" /></div>
        <div class="field"><label>Custo</label><input id="product-cost" type="number" step="0.01" min="0" /></div>
        <div class="field"><label>Estoque minimo</label><input id="product-min-stock" type="number" step="0.001" min="0" /></div>
        <div class="field"><label>NCM</label><input id="product-ncm" /></div>
        <button class="btn primary full" type="submit">Salvar produto</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Lista de produtos</h2>
      ${table(["Codigo", "Produto", "Tipo", "Preco", "Estoque", "Fiscal", "Status", "Acao"], products.map((product) => [
        amount(product.id || 0),
        `<strong>${escapeHtml(product.description || "-")}</strong><br><small>${escapeHtml(product.barcode || product.reference || "")}</small>`,
        escapeHtml(product.type || "-"),
        money(product.price || 0),
        `${amount(product.stock || 0)} ${escapeHtml(product.unit || "")}`,
        escapeHtml(product.ncm || "-"),
        `<span class="badge ${product.active === false ? "danger" : Number(product.stock || 0) <= Number(product.minStock || 0) ? "warn" : "ok"}">${product.active === false ? "Inativo" : Number(product.stock || 0) <= Number(product.minStock || 0) ? "Comprar" : "OK"}</span>`,
        `<button class="btn ${product.active === false ? "primary" : "danger"}" data-toggle-product="${product.id}">${product.active === false ? "Ativar" : "Inativar"}</button>`
      ]), "Nenhum produto cadastrado nesta unidade.")}
    </section>
  </div>`;
}

async function saveProduct(event) {
  event.preventDefault();
  if (!requirePermission("products")) return;
  const description = byId("product-description").value.trim();
  if (!description) return alert("Informe a descricao.");
  state.products.push({
    id: nextId(state.products),
    description,
    barcode: byId("product-barcode").value.trim(),
    type: byId("product-type").value,
    unit: byId("product-unit").value.trim() || "UN",
    price: Number(byId("product-price").value || 0),
    cost: Number(byId("product-cost").value || 0),
    stock: 0,
    minStock: Number(byId("product-min-stock").value || 0),
    ncm: byId("product-ncm").value.trim(),
    fiscalStatus: byId("product-ncm").value.trim() ? "Conferir" : "Pendente",
    active: true,
    source: "Central do Franqueado"
  });
  audit("Produto cadastrado", description);
  const saved = await saveState("products", "Produto salvo.");
  if (saved) render();
}

async function toggleProduct(id) {
  if (!requirePermission("products")) return;
  const product = state.products.find((row) => Number(row.id) === Number(id));
  if (!product) return;
  product.active = product.active === false;
  audit(product.active ? "Produto ativado" : "Produto inativado", product.description || String(id));
  const saved = await saveState("products", "Produto atualizado.");
  if (saved) render();
}

function productOptions() {
  return state.products.map((product) => `<option value="${product.id}">${escapeHtml(product.description)} | ${escapeHtml(product.barcode || String(product.id))}</option>`).join("");
}

function findProduct(item = {}) {
  return state.products.find((product) =>
    Number(product.id) === Number(item.productId || item.id) ||
    (item.barcode && String(product.barcode || "") === String(item.barcode)) ||
    (item.code && String(product.id) === String(item.code))
  );
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

function upsertStockLot(product, lot, expiry, qty) {
  if (!lot) return;
  state.stockLots = state.stockLots || [];
  let row = state.stockLots.find((item) => item.productId === product.id && item.lot === lot);
  if (!row) {
    row = { id: nextId(state.stockLots), productId: product.id, product: product.description, lot, expiry, qty: 0 };
    state.stockLots.push(row);
  }
  row.expiry = expiry || row.expiry || "";
  row.qty = Number(row.qty || 0) + Number(qty || 0);
}

function renderQr() {
  return `<div class="network-module compact">
    ${moduleTitle("Entrada por QR da Central", "Receba produtos enviados pela Central sem digitar item por item.")}
    <section class="network-card">
      <h2>Codigo da remessa</h2>
      <p>Cole o JSON lido no QR Code da Central administrativa. O padrao ja existe como <strong>tortela-central-shipment</strong>.</p>
      <form class="network-form" id="qr-form">
        <div class="field full"><label>QR / codigo da remessa</label><textarea id="central-shipment-qr" rows="8" placeholder='{"type":"tortela-central-shipment","shipmentId":"REM-001","items":[{"productId":5014,"qty":10}]}'></textarea></div>
        <button class="btn primary full" type="submit">Dar entrada no estoque</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Ultimas entradas por QR</h2>
      ${table(["Data", "Produto", "Qtd.", "Historico"], state.stockMovements.filter((row) => row.type === "Entrada Central QR").slice(-20).reverse().map((row) => [
        escapeHtml(row.date || "-"),
        escapeHtml(row.product || "-"),
        amount(row.qty || 0),
        escapeHtml(row.history || "-")
      ]), "Nenhuma entrada por QR registrada.")}
    </section>
  </div>`;
}

function manualStockDropsThisMonth() {
  const month = today().slice(0, 7);
  return (state.stockMovements || []).filter((row) =>
    row.manualDrop
    && Number(row.qty || 0) < 0
    && String(row.date || row.createdAt || "").slice(0, 7) === month
  );
}

function pendingManualDropRequests() {
  return (state.approvalRequests || []).filter((row) => row.type === "stock_adjustment" && row.status === "Pendente");
}

function renderStock() {
  const drops = manualStockDropsThisMonth();
  const pending = pendingManualDropRequests();
  return `<div class="network-module compact">
    ${moduleTitle("Estoque local", "Receba remessas por QR e controle baixas manuais com rastreabilidade para a Central Administrativa.")}
    <div class="network-grid four">
      ${kpi("Baixas manuais no mes", amount(drops.length), drops.length >= 2 ? "proximas exigem aprovacao" : "limite local: 2")}
      ${kpi("Aprovacoes pendentes", amount(pending.length))}
      ${kpi("Produtos cadastrados", amount(state.products.length))}
      ${kpi("Entradas QR", amount((state.stockMovements || []).filter((row) => row.type === "Entrada Central QR").length))}
    </div>
    <section class="network-card">
      <h2>Baixa manual justificada</h2>
      <form class="network-form" id="manual-stock-form">
        <div class="field wide"><label>Produto</label><select id="manual-stock-product" required>${productOptions()}</select></div>
        <div class="field"><label>Quantidade a baixar</label><input id="manual-stock-qty" type="number" step="0.001" min="0.001" required /></div>
        <div class="field"><label>Motivo</label><select id="manual-stock-reason"><option>Perda</option><option>Quebra</option><option>Uso interno</option><option>Validade vencida</option><option>Ajuste conferido</option></select></div>
        <div class="field full"><label>Justificativa obrigatoria</label><textarea id="manual-stock-note" rows="4" required placeholder="Explique o motivo da baixa para auditoria da Central Administrativa"></textarea></div>
        <button class="btn primary full" type="submit">${drops.length >= 2 ? "Solicitar aprovacao da Central" : "Registrar baixa"}</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Solicitacoes pendentes da Central</h2>
      ${table(["Data", "Produto", "Quantidade", "Justificativa", "Status"], pending.map((row) => [
        escapeHtml(String(row.requestedAt || "").slice(0, 16).replace("T", " ") || "-"),
        escapeHtml(row.payload?.product || row.detail || "-"),
        amount(Math.abs(Number(row.payload?.direction || 0))),
        escapeHtml(row.justification || row.payload?.history || "-"),
        `<span class="badge warn">${escapeHtml(row.status || "Pendente")}</span>`
      ]), "Nenhuma baixa aguardando aprovacao.")}
    </section>
    <section class="network-card">
      <h2>Ultimas movimentacoes</h2>
      ${table(["Data", "Produto", "Tipo", "Qtd.", "Historico"], (state.stockMovements || []).slice(-30).reverse().map((row) => [
        escapeHtml(row.date || "-"),
        escapeHtml(row.product || "-"),
        escapeHtml(row.type || "-"),
        amount(row.qty || 0),
        escapeHtml(row.history || "-")
      ]), "Nenhuma movimentacao registrada.")}
    </section>
  </div>`;
}

function supplierOptions() {
  return (state.people || [])
    .filter((person) => ["Fornecedor", "Transportadora", "Parceiro"].includes(person.type) && person.active !== false)
    .map((person) => `<option value="${escapeAttr(person.name)}">${escapeHtml(person.name)}</option>`)
    .join("");
}

function renderPurchases() {
  const purchases = (state.purchases || []).slice().reverse();
  return `<div class="network-module compact">
    ${moduleTitle("Compras da unidade", "Entrada de mercadorias da loja com reflexo no estoque e visibilidade para a Central Administrativa.")}
    <section class="network-card">
      <h2>Nova compra</h2>
      <form class="network-form" id="purchase-form">
        <div class="field wide"><label>Fornecedor</label><input id="purchase-supplier" list="supplier-list" required /><datalist id="supplier-list">${supplierOptions()}</datalist></div>
        <div class="field"><label>Documento</label><input id="purchase-document" /></div>
        <div class="field"><label>Data</label><input id="purchase-date" type="date" value="${today()}" /></div>
        <div class="field wide"><label>Produto</label><select id="purchase-product" required>${productOptions()}</select></div>
        <div class="field"><label>Quantidade</label><input id="purchase-qty" type="number" step="0.001" min="0.001" required /></div>
        <div class="field"><label>Custo unitario</label><input id="purchase-cost" type="number" step="0.01" min="0" /></div>
        <button class="btn primary full" type="submit">Gravar compra e entrar estoque</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Compras lancadas</h2>
      ${table(["Data", "Fornecedor", "Documento", "Itens", "Total", "Status"], purchases.map((purchase) => [
        escapeHtml(purchase.date || "-"),
        escapeHtml(purchase.supplier || "-"),
        escapeHtml(purchase.document || "-"),
        amount((purchase.items || []).length || 1),
        money(purchase.total || 0),
        `<span class="badge ${purchase.status === "Cancelada" ? "danger" : "ok"}">${escapeHtml(purchase.status || "Confirmada")}</span>`
      ]), "Nenhuma compra lancada.")}
    </section>
  </div>`;
}

async function savePurchase(event) {
  event.preventDefault();
  if (!requirePermission("purchases")) return;
  const product = state.products.find((row) => Number(row.id) === Number(byId("purchase-product").value));
  const qty = Number(byId("purchase-qty").value || 0);
  const cost = Number(byId("purchase-cost").value || product?.cost || 0);
  if (!product || qty <= 0) return alert("Informe produto e quantidade.");
  const total = qty * cost;
  const purchase = {
    id: nextId(state.purchases),
    date: byId("purchase-date").value || today(),
    supplier: byId("purchase-supplier").value.trim(),
    document: byId("purchase-document").value.trim(),
    total,
    status: "Confirmada",
    source: "Central do Franqueado",
    items: [{ productId: product.id, description: product.description, qty, unit: product.unit || "UN", cost, total }]
  };
  state.purchases.push(purchase);
  product.stock = Number(product.stock || 0) + qty;
  if (cost > 0) product.cost = cost;
  addStockMovement(product, "Entrada compra", qty, `Compra ${purchase.id} - ${purchase.supplier}`, {
    location: "Central do Franqueado",
    purchaseId: purchase.id
  });
  audit("Compra lancada", `${purchase.supplier} ${money(total)}`);
  const saved = await saveState("purchases", "Compra gravada e estoque atualizado.");
  if (saved) render();
}

async function submitManualStockDrop(event) {
  event.preventDefault();
  if (!requirePermission("stock_adjust")) return;
  const product = state.products.find((row) => Number(row.id) === Number(byId("manual-stock-product").value));
  const qty = Number(byId("manual-stock-qty").value || 0);
  const reason = byId("manual-stock-reason").value;
  const note = byId("manual-stock-note").value.trim();
  if (!product || qty <= 0) return alert("Informe produto e quantidade.");
  if (note.length < 10) return alert("Justifique a baixa com pelo menos 10 caracteres.");
  const direction = -Math.abs(qty);
  if (manualStockDropsThisMonth().length >= 2) {
    state.approvalRequests = state.approvalRequests || [];
    state.approvalRequests.unshift({
      id: nextId(state.approvalRequests),
      type: "stock_adjustment",
      title: "Baixa manual de estoque",
      detail: `${product.description} - ${amount(qty)}`,
      justification: note,
      requestedBy: authUser?.username || "franqueado",
      requestedAt: new Date().toISOString(),
      status: "Pendente",
      priority: "Alta",
      payload: {
        productId: product.id,
        product: product.description,
        direction,
        type: "Baixa manual autorizada",
        history: `${reason}: ${note}`,
        details: { location: "Central do Franqueado", manualDrop: true, reason }
      }
    });
    audit("Baixa manual enviada para aprovacao", `${product.description}: ${amount(qty)} - ${reason}`);
    const saved = await saveState("stock_adjust", "Solicitacao enviada para a Central Administrativa.");
    if (saved) render();
    return;
  }
  product.stock = Number(product.stock || 0) + direction;
  addStockMovement(product, "Baixa manual", direction, `${reason}: ${note}`, {
    location: "Central do Franqueado",
    manualDrop: true,
    reason,
    requestedBy: authUser?.username || "franqueado",
    createdAt: new Date().toISOString()
  });
  audit("Baixa manual registrada", `${product.description}: ${amount(qty)} - ${reason}`);
  const saved = await saveState("stock_adjust", "Baixa manual registrada e informada para a Central Administrativa.");
  if (saved) render();
}

function renderFiscal() {
  const printMode = state.settings?.pdvPrintMode || "Ambos";
  return `<div class="network-module compact">
    ${moduleTitle("Fiscal e impressao da loja", "NF-e/DANFE ficam na Central do Franqueado. O PDV imprime recibo simples ou cupom fiscal conforme configuracao local.")}
    <section class="network-card">
      <h2>Configuracao do PDV</h2>
      <form class="network-form" id="print-settings-form">
        <div class="field"><label>Impressao permitida no PDV</label><select id="pdv-print-mode">
          ${["Ambos", "Recibo simples", "Cupom fiscal"].map((item) => `<option ${printMode === item ? "selected" : ""}>${item}</option>`).join("")}
        </select></div>
        <div class="field"><label>NF-e / DANFE pela Central do Franqueado</label><select id="lojista-danfe-enabled"><option value="true">Sim</option><option value="false" ${state.settings?.lojistaDanfeEnabled === false ? "selected" : ""}>Nao</option></select></div>
        <div class="field"><label>Ambiente fiscal</label><select id="fiscal-environment"><option ${state.settings?.fiscalEnvironment === "Homologacao" ? "selected" : ""}>Homologacao</option><option ${state.settings?.fiscalEnvironment === "Producao" ? "selected" : ""}>Producao</option></select></div>
        <div class="field"><label>Serie NF-e</label><input id="nfe-serie" value="${escapeAttr(state.settings?.nfeSerie || "1")}" /></div>
        <button class="btn primary full" type="submit">Salvar configuracao fiscal</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Fila fiscal da unidade</h2>
      ${table(["Modelo", "Data", "Cliente", "Total", "Status", "PDF/XML", "Acao"], (state.fiscalQueue || []).slice(-40).reverse().map((row) => [
        escapeHtml(row.model || "-"),
        escapeHtml(String(row.issuedAt || row.date || "").slice(0, 10) || "-"),
        escapeHtml(row.customer || "Consumidor Final"),
        money(row.total || 0),
        `<span class="badge ${row.status === "Autorizada" ? "ok" : row.status === "Cancelada" ? "danger" : "warn"}">${escapeHtml(row.status || "Pendente")}</span>`,
        `${row.pdfUrl ? `<a class="btn" href="${escapeAttr(row.pdfUrl)}">DANFE</a>` : "-"} ${row.xmlUrl ? `<a class="btn" href="${escapeAttr(row.xmlUrl)}">XML</a>` : ""}`,
        row.status === "Autorizada" || row.status === "Cancelada" ? "-" : `<button class="btn primary" data-fiscal-transmit="${row.id}">Transmitir</button>`
      ]), "Nenhum documento fiscal na fila.")}
    </section>
  </div>`;
}

async function savePrintSettings(event) {
  event.preventDefault();
  if (!requirePermission("fiscal_transmit")) return;
  state.settings = state.settings || {};
  state.settings.pdvPrintMode = byId("pdv-print-mode").value;
  state.settings.lojistaDanfeEnabled = byId("lojista-danfe-enabled").value === "true";
  state.settings.fiscalEnvironment = byId("fiscal-environment").value;
  state.settings.nfeSerie = byId("nfe-serie").value.trim() || "1";
  audit("Configuracao fiscal/impressao alterada", `PDV: ${state.settings.pdvPrintMode}; DANFE franqueado: ${state.settings.lojistaDanfeEnabled ? "sim" : "nao"}`);
  const saved = await saveState("fiscal_transmit", "Configuracao fiscal salva e visivel para a Central Administrativa.");
  if (saved) render();
}

async function transmitFiscalRow(id) {
  if (!requirePermission("fiscal_transmit")) return;
  const row = (state.fiscalQueue || []).find((item) => Number(item.id) === Number(id));
  if (!row) return alert("Documento fiscal nao encontrado.");
  if (row.model === "NFC-e" && state.settings?.pdvPrintMode === "Recibo simples") {
    return alert("O PDV esta configurado para recibo simples. Altere a configuracao fiscal antes de transmitir NFC-e.");
  }
  if (row.model === "NF-e" && state.settings?.lojistaDanfeEnabled === false) {
    return alert("NF-e/DANFE esta desativado para a Central do Franqueado.");
  }
  try {
    const result = await api(`/api/tenant/${encodeURIComponent(tenantCode)}/fiscal/transmit`, {
      method: "POST",
      body: JSON.stringify({ document: row })
    });
    Object.assign(row, result.document);
    audit("Documento fiscal transmitido pela Central do Franqueado", `${row.model} ${row.id}`);
    await saveState("fiscal_transmit", "Documento fiscal transmitido.");
  } catch (error) {
    alert(error.message || "Nao foi possivel transmitir o documento fiscal.");
  }
}

async function receiveQr(event) {
  event.preventDefault();
  if (!requirePermission("stock_adjust")) return;
  let payload;
  try {
    payload = JSON.parse(byId("central-shipment-qr").value.trim());
  } catch {
    alert("QR invalido. Cole o conteudo JSON da remessa.");
    return;
  }
  if (payload.type !== "tortela-central-shipment" || !Array.isArray(payload.items) || !payload.items.length) {
    alert("Este QR nao corresponde a uma remessa da Central Tortela.");
    return;
  }
  const applied = [];
  const missing = [];
  payload.items.forEach((item) => {
    const product = findProduct(item);
    const qty = Number(item.qty || item.quantity || 0);
    if (!product || qty <= 0) {
      missing.push(item.productId || item.barcode || item.code || "item sem codigo");
      return;
    }
    product.stock = Number(product.stock || 0) + qty;
    const details = { lot: item.lot || payload.lot || "", expiry: item.expiry || payload.expiry || "", location: "Central do Franqueado" };
    addStockMovement(product, "Entrada Central QR", qty, `Remessa Central ${payload.shipmentId || payload.id || ""}`.trim(), details);
    upsertStockLot(product, details.lot, details.expiry, qty);
    applied.push(`${product.description}: ${qty}`);
  });
  if (!applied.length) return alert(`Nenhum item localizado. Pendentes: ${missing.join(", ")}`);
  audit("Entrada por QR", applied.join("; "));
  const saved = await saveState("stock_adjust", `Entrada concluida:\n${applied.join("\n")}${missing.length ? `\n\nNao localizados: ${missing.join(", ")}` : ""}`);
  if (saved) render();
}

function renderImports() {
  return `<div class="network-module compact">
    ${moduleTitle("Importar informacoes", "Traga vendas, contas a pagar, contas a receber ou estoque por JSON/CSV.")}
    <section class="network-card">
      <h2>Importacao operacional</h2>
      <form class="network-form" id="import-form">
        <div class="field"><label>Tipo</label><select id="import-type"><option value="sales">Vendas</option><option value="payables">Contas a pagar</option><option value="receivables">Contas a receber</option><option value="stock">Estoque</option></select></div>
        <div class="field"><label>Formato</label><select id="import-format"><option value="json">JSON</option><option value="csv">CSV</option></select></div>
        <div class="field full"><label>Arquivo</label><input id="import-file" type="file" accept=".json,.csv,.txt,application/json,text/csv,text/plain" /></div>
        <div class="field full"><label>Conteudo</label><textarea id="import-content" rows="9" placeholder='JSON: [{"customer":"Consumidor Final","total":25.9}]\nCSV: customer;total;date'></textarea></div>
        <button class="btn primary full" type="submit">Importar agora</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Modelo rapido</h2>
      <div class="network-grid four">
        ${kpi("Vendas", "customer,total,date,status")}
        ${kpi("A pagar", "supplier,value,dueDate,status")}
        ${kpi("A receber", "customer,value,dueDate,status")}
        ${kpi("Estoque", "productId,barcode,qty,type")}
      </div>
    </section>
  </div>`;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const separator = lines[0].includes(";") ? ";" : ",";
  const headers = lines.shift().split(separator).map((header) => header.trim());
  return lines.map((line) => {
    const values = line.split(separator).map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function parseImportPayload(text, format) {
  if (format === "csv") return parseCsv(text);
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.items || parsed.rows || [];
}

async function runImport(event) {
  event.preventDefault();
  const type = byId("import-type").value;
  const format = byId("import-format").value;
  const text = byId("import-content").value.trim();
  if (!text) return alert("Cole ou carregue o conteudo antes de importar.");
  let rows;
  try {
    rows = parseImportPayload(text, format);
  } catch {
    alert("Conteudo invalido para o formato escolhido.");
    return;
  }
  if (!rows.length) return alert("Nenhum registro encontrado.");
  const permission = type === "stock" ? "stock_adjust" : type === "sales" ? "sales" : "finance";
  if (!requirePermission(permission)) return;
  const imported = applyImport(type, rows);
  audit("Importacao do franqueado", `${imported} registro(s) em ${type}`);
  const saved = await saveState(permission, `${imported} registro(s) importado(s).`);
  if (saved) render();
}

function applyImport(type, rows) {
  if (type === "sales") {
    rows.forEach((row) => state.sales.push({
      id: nextId(state.sales),
      date: row.date || row.createdAt || today(),
      customer: row.customer || row.client || "Consumidor Final",
      total: Number(String(row.total || row.value || 0).replace(",", ".")),
      status: row.status || "Importada",
      seller: row.seller || row.operator || authUser?.username || "Franqueado",
      payment: row.payment || row.paymentMethod || "",
      source: row.source || "Central do Franqueado",
      channel: row.channel || row.source || "Importado"
    }));
  }
  if (type === "payables") {
    rows.forEach((row) => state.payables.push({
      id: nextId(state.payables),
      supplier: row.supplier || row.provider || row.name || "Fornecedor",
      dueDate: row.dueDate || row.due || row.date || today(),
      value: Number(String(row.value || row.total || 0).replace(",", ".")),
      status: row.status || "Aberto",
      history: row.history || "Importado pela Central do Franqueado"
    }));
  }
  if (type === "receivables") {
    rows.forEach((row) => state.receivables.push({
      id: nextId(state.receivables),
      customer: row.customer || row.client || row.name || "Cliente",
      dueDate: row.dueDate || row.due || row.date || today(),
      value: Number(String(row.value || row.total || 0).replace(",", ".")),
      status: row.status || "Aberto",
      history: row.history || "Importado pela Central do Franqueado"
    }));
  }
  if (type === "stock") {
    rows.forEach((row) => {
      const product = findProduct(row);
      const qty = Number(String(row.qty || row.quantity || 0).replace(",", "."));
      if (!product || !qty) return;
      product.stock = Number(product.stock || 0) + qty;
      addStockMovement(product, row.type || "Importacao", qty, row.history || "Importado pela Central do Franqueado", {
        lot: row.lot || "",
        expiry: row.expiry || "",
        location: row.location || "Importacao"
      });
      upsertStockLot(product, row.lot || "", row.expiry || "", qty);
    });
  }
  return rows.length;
}

function renderPayables() {
  const rows = state.payables.slice().reverse();
  return `<div class="network-module compact">
    ${moduleTitle("Contas a pagar", "Controle simples de fornecedores, despesas e vencimentos da unidade.")}
    <section class="network-card">
      <h2>Novo pagamento</h2>
      <form class="network-form" id="payable-form">
        <div class="field wide"><label>Fornecedor/despesa</label><input id="payable-supplier" required /></div>
        <div class="field"><label>Vencimento</label><input id="payable-due" type="date" value="${today()}" required /></div>
        <div class="field"><label>Valor</label><input id="payable-value" type="number" step="0.01" min="0" required /></div>
        <button class="btn primary" type="submit">Adicionar conta</button>
      </form>
    </section>
    <section class="network-card">
      ${table(["Fornecedor", "Vencimento", "Valor", "Status", "Acao"], rows.map((row) => [
        escapeHtml(row.supplier || row.provider || row.history || "-"),
        escapeHtml(row.dueDate || row.date || "-"),
        money(row.value || 0),
        `<span class="badge ${financeBalance(row) > 0 ? "warn" : "ok"}">${escapeHtml(row.status || (financeBalance(row) > 0 ? "Aberto" : "Pago"))}</span>`,
        financeBalance(row) > 0 ? `<button class="btn primary" data-payable-settle="${row.id}">Baixar</button>` : "-"
      ]))}
    </section>
  </div>`;
}

async function addPayable(event) {
  event.preventDefault();
  if (!requirePermission("finance")) return;
  state.payables.push({
    id: nextId(state.payables),
    supplier: byId("payable-supplier").value.trim(),
    dueDate: byId("payable-due").value,
    value: Number(byId("payable-value").value || 0),
    status: "Aberto",
    history: "Lancado pela Central do Franqueado"
  });
  audit("Conta a pagar criada", byId("payable-supplier").value.trim());
  const saved = await saveState("finance", "Conta a pagar adicionada.");
  if (saved) render();
}

function renderReceivables() {
  const rows = state.receivables.slice().reverse();
  return `<div class="network-module compact">
    ${moduleTitle("Contas a receber", "Acompanhe clientes, vendas a prazo, boletos e recebimentos.")}
    <section class="network-card">
      <h2>Novo recebimento</h2>
      <form class="network-form" id="receivable-form">
        <div class="field wide"><label>Cliente</label><input id="receivable-customer" required /></div>
        <div class="field"><label>Vencimento</label><input id="receivable-due" type="date" value="${today()}" required /></div>
        <div class="field"><label>Valor</label><input id="receivable-value" type="number" step="0.01" min="0" required /></div>
        <button class="btn primary" type="submit">Adicionar conta</button>
      </form>
    </section>
    <section class="network-card">
      ${table(["Cliente", "Vencimento", "Valor", "Status", "Acao"], rows.map((row) => [
        escapeHtml(row.customer || row.client || row.history || "-"),
        escapeHtml(row.dueDate || row.date || "-"),
        money(row.value || 0),
        `<span class="badge ${financeBalance(row) > 0 ? "warn" : "ok"}">${escapeHtml(row.status || (financeBalance(row) > 0 ? "Aberto" : "Recebido"))}</span>`,
        financeBalance(row) > 0 ? `<button class="btn primary" data-receivable-settle="${row.id}">Receber</button>` : "-"
      ]))}
    </section>
  </div>`;
}

async function addReceivable(event) {
  event.preventDefault();
  if (!requirePermission("finance")) return;
  state.receivables.push({
    id: nextId(state.receivables),
    customer: byId("receivable-customer").value.trim(),
    dueDate: byId("receivable-due").value,
    value: Number(byId("receivable-value").value || 0),
    status: "Aberto",
    history: "Lancado pela Central do Franqueado"
  });
  audit("Conta a receber criada", byId("receivable-customer").value.trim());
  const saved = await saveState("finance", "Conta a receber adicionada.");
  if (saved) render();
}

async function settleFinance(type, id) {
  if (!requirePermission("finance_settle")) return;
  const collection = type === "payable" ? state.payables : state.receivables;
  const row = collection.find((item) => Number(item.id) === Number(id));
  if (!row) return;
  row.status = type === "payable" ? "Pago" : "Recebido";
  row.paidValue = Number(row.value || 0);
  row.paidAt = new Date().toISOString();
  audit(type === "payable" ? "Conta paga" : "Conta recebida", row.supplier || row.customer || String(id));
  const saved = await saveState("finance_settle", "Baixa registrada.");
  if (saved) render();
}

function restoreOrderStock(sale) {
  (sale.items || []).forEach((item) => {
    const product = findProduct(item);
    const qty = Number(item.qty || item.quantity || 0);
    if (!product || qty <= 0) return;
    product.stock = Number(product.stock || 0) + qty;
    addStockMovement(product, "Estorno pedido", qty, `Cancelamento do pedido ${sale.id}`, {
      location: "Central do Franqueado",
      sourceSaleId: sale.id
    });
  });
}

async function updateOrderStatus(id, status) {
  if (!requirePermission("sales")) return;
  const sale = state.sales.find((row) => Number(row.id) === Number(id) && row.onlineOrder);
  if (!sale) return alert("Pedido nao encontrado nesta unidade.");
  if (status === "Cancelado" && !confirm(`Cancelar o pedido ${id}? O estoque sera estornado quando houver itens baixados.`)) return;
  if (status === "Cancelado" && sale.status !== "Cancelado") {
    restoreOrderStock(sale);
    state.receivables.filter((row) => Number(row.sourceSaleId) === Number(id) && !row.paid).forEach((row) => {
      row.cancelled = true;
      row.paid = true;
      row.balance = 0;
      row.status = "Cancelado";
    });
  }
  sale.status = status;
  sale.updatedAt = new Date().toISOString();
  if (status === "Conferido") sale.checkedAt = sale.updatedAt;
  if (status === "Preparando") sale.preparingAt = sale.updatedAt;
  if (status === "Pronto") sale.readyAt = sale.updatedAt;
  if (status === "Saiu para entrega") sale.deliveryStartedAt = sale.updatedAt;
  if (status === "Entregue") sale.deliveredAt = sale.updatedAt;
  audit(`Pedido ${status.toLowerCase()}`, `Pedido ${sale.id} - ${sale.customer || "Consumidor Final"}`);
  const saved = await saveState("sales", `Pedido marcado como ${status}.`);
  if (saved) render();
}

function renderReports() {
  const data = totals();
  const manualDrops = (state.stockMovements || []).filter((row) => row.manualDrop);
  const fiscalDocs = state.fiscalQueue || [];
  const topProducts = {};
  state.sales.forEach((sale) => (sale.items || []).forEach((item) => {
    const name = item.description || item.product || `Produto ${item.productId || ""}`;
    topProducts[name] = (topProducts[name] || 0) + Number(item.qty || item.quantity || 1);
  }));
  const ranking = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return `<div class="network-module compact">
    ${moduleTitle("Relatorios da unidade", "Indicadores resumidos para tomada de decisao do franqueado.", `<button class="btn primary" id="export-report">Exportar CSV</button>`)}
    <div class="network-grid four">
      ${kpi("Vendas no mes", money(data.salesTotal))}
      ${kpi("Ticket medio", money(data.salesTotal / Math.max(1, data.sales.length)))}
      ${kpi("A pagar", money(data.payableOpen))}
      ${kpi("Baixas manuais", amount(manualDrops.length))}
    </div>
    <section class="network-card">
      <h2>Ultimas vendas</h2>
      ${table(["Data", "Cliente", "Total", "Status"], state.sales.slice(-30).reverse().map((sale) => [
        escapeHtml(String(sale.date || sale.createdAt || "").slice(0, 10)),
        escapeHtml(sale.customer || sale.client || "Consumidor Final"),
        money(sale.total || 0),
        escapeHtml(sale.status || "Concluida")
      ]))}
    </section>
    <section class="network-card">
      <h2>Produtos mais vendidos</h2>
      ${table(["Produto", "Qtd."], ranking.map(([name, qty]) => [escapeHtml(name), amount(qty)]), "As vendas importadas sem itens aparecem apenas no total financeiro.")}
    </section>
    <section class="network-card">
      <h2>Fiscal e impressao</h2>
      ${table(["Configuracao", "Valor"], [
        ["Impressao PDV", escapeHtml(state.settings?.pdvPrintMode || "Ambos")],
        ["NF-e/DANFE na Central do Franqueado", state.settings?.lojistaDanfeEnabled === false ? "Nao" : "Sim"],
        ["Ambiente fiscal", escapeHtml(state.settings?.fiscalEnvironment || "Homologacao")],
        ["Documentos fiscais", amount(fiscalDocs.length)]
      ])}
    </section>
    <section class="network-card">
      <h2>Baixas manuais auditadas</h2>
      ${table(["Data", "Produto", "Qtd.", "Justificativa"], manualDrops.slice(-20).reverse().map((row) => [
        escapeHtml(row.date || "-"),
        escapeHtml(row.product || "-"),
        amount(row.qty || 0),
        escapeHtml(row.history || "-")
      ]), "Nenhuma baixa manual registrada.")}
    </section>
  </div>`;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportReport() {
  const rows = [["tipo", "valor"], ["vendas_mes", totals().salesTotal], ["a_pagar", totals().payableOpen], ["a_receber", totals().receivableOpen], ["estoque_custo", totals().stockCost]];
  downloadText(`relatorio-lojista-${tenantCode}-${today()}.csv`, rows.map((row) => row.join(";")).join("\n"));
}

function renderUsers() {
  const permissions = Object.entries(permissionLabels);
  return `<div class="network-module compact">
    ${moduleTitle("Usuarios e hierarquia", "Cadastre usuarios da loja e defina o que cada perfil pode mexer.")}
    <section class="network-card">
      <h2>Novo usuario</h2>
      <form class="network-form" id="user-form">
        <div class="field"><label>Nome</label><input id="user-name" required /></div>
        <div class="field"><label>Usuario</label><input id="user-login" required /></div>
        <div class="field"><label>Senha inicial</label><input id="user-password" type="password" minlength="8" required /></div>
        <div class="field"><label>Hierarquia</label><select id="user-role">${Object.keys(rolePermissions).map((role) => `<option>${role}</option>`).join("")}</select></div>
        <div class="field full"><label>Preferencias do que pode mexer</label><div class="store-permission-grid">${permissions.map(([key, label]) => `<label class="check-row"><input class="user-permission" type="checkbox" value="${key}" /> ${label}</label>`).join("")}</div></div>
        <button class="btn primary full" type="submit">Criar usuario</button>
      </form>
    </section>
    <section class="network-card">
      ${table(["Usuario", "Nome", "Hierarquia", "Permissoes", "Status", "Acao"], state.users.map((user) => [
        escapeHtml(user.username || "-"),
        escapeHtml(user.name || "-"),
        escapeHtml(user.role || "-"),
        escapeHtml((user.permissions || rolePermissions[user.role] || []).map((item) => permissionLabels[item] || item).join(", ")),
        `<span class="badge ${user.active === false ? "danger" : "ok"}">${user.active === false ? "Bloqueado" : "Ativo"}</span>`,
        `<button class="btn ${user.active === false ? "primary" : "danger"}" data-toggle-user="${user.id}">${user.active === false ? "Ativar" : "Bloquear"}</button>`
      ]))}
    </section>
  </div>`;
}

function applyRolePermissions() {
  const role = byId("user-role")?.value || "Vendedor";
  document.querySelectorAll(".user-permission").forEach((input) => {
    input.checked = (rolePermissions[role] || []).includes(input.value);
  });
}

async function createUser(event) {
  event.preventDefault();
  if (!requirePermission("manage_users")) return;
  const permissions = Array.from(document.querySelectorAll(".user-permission:checked")).map((input) => input.value);
  try {
    await api(`/api/tenant/${encodeURIComponent(tenantCode)}/users`, {
      method: "POST",
      body: JSON.stringify({
        name: byId("user-name").value.trim(),
        username: byId("user-login").value.trim(),
        password: byId("user-password").value,
        role: byId("user-role").value,
        permissions
      })
    });
    alert("Usuario criado.");
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function toggleUser(id) {
  if (!requirePermission("manage_users")) return;
  const user = state.users.find((item) => Number(item.id) === Number(id));
  if (!user) return;
  try {
    await api(`/api/tenant/${encodeURIComponent(tenantCode)}/users/${id}`, {
      method: "POST",
      body: JSON.stringify({ active: user.active === false })
    });
    alert("Usuario atualizado.");
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function loadImportFile(event) {
  const file = event.currentTarget.files?.[0];
  if (!file) return;
  byId("import-content").value = await file.text();
  byId("import-format").value = file.name.toLowerCase().endsWith(".csv") ? "csv" : "json";
}

function bind() {
  document.querySelectorAll("[data-store-module]").forEach((button) => {
    button.addEventListener("click", () => {
      currentModule = button.dataset.storeModule;
      sessionStorage.setItem("tortela-lojista-module", currentModule);
      render();
    });
  });
  byId("refresh")?.addEventListener("click", boot);
  byId("logout")?.addEventListener("click", () => logout(true));
  byId("person-form")?.addEventListener("submit", savePerson);
  byId("product-form")?.addEventListener("submit", saveProduct);
  byId("qr-form")?.addEventListener("submit", receiveQr);
  byId("manual-stock-form")?.addEventListener("submit", submitManualStockDrop);
  byId("purchase-form")?.addEventListener("submit", savePurchase);
  byId("print-settings-form")?.addEventListener("submit", savePrintSettings);
  document.querySelectorAll("[data-fiscal-transmit]").forEach((button) => button.addEventListener("click", () => transmitFiscalRow(button.dataset.fiscalTransmit)));
  byId("import-file")?.addEventListener("change", loadImportFile);
  byId("import-form")?.addEventListener("submit", runImport);
  byId("payable-form")?.addEventListener("submit", addPayable);
  byId("receivable-form")?.addEventListener("submit", addReceivable);
  byId("export-report")?.addEventListener("click", exportReport);
  byId("user-role")?.addEventListener("change", applyRolePermissions);
  byId("user-form")?.addEventListener("submit", createUser);
  document.querySelectorAll("[data-payable-settle]").forEach((button) => button.addEventListener("click", () => settleFinance("payable", button.dataset.payableSettle)));
  document.querySelectorAll("[data-receivable-settle]").forEach((button) => button.addEventListener("click", () => settleFinance("receivable", button.dataset.receivableSettle)));
  document.querySelectorAll("[data-toggle-user]").forEach((button) => button.addEventListener("click", () => toggleUser(button.dataset.toggleUser)));
  document.querySelectorAll("[data-toggle-person]").forEach((button) => button.addEventListener("click", () => togglePerson(button.dataset.togglePerson)));
  document.querySelectorAll("[data-toggle-product]").forEach((button) => button.addEventListener("click", () => toggleProduct(button.dataset.toggleProduct)));
  document.querySelectorAll("[data-order-status]").forEach((button) => button.addEventListener("click", () => updateOrderStatus(button.dataset.orderStatus, button.dataset.status)));
  applyRolePermissions();
}

boot();

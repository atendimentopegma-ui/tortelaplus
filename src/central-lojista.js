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
  ["qr", "Entrada QR", "Remessa da Central"],
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
    users: data.users || [],
    auditLogs: data.auditLogs || []
  };
}

function audit(action, detail) {
  state.auditLogs = state.auditLogs || [];
  state.auditLogs.unshift({
    id: nextId(state.auditLogs),
    at: new Date().toISOString(),
    user: authUser?.username || "lojista",
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
          <div><h1>Central do Lojista</h1><p>Controle simples da unidade: financeiro, estoque, relatorios, QR e usuarios.</p></div>
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
        terminalName: "Central do Lojista"
      })
    });
    sessionId = result.sessionId;
    authUser = result.user;
    tenant = result.tenant;
    sessionStorage.setItem("tortela-lojista-session", sessionId);
    sessionStorage.setItem("tortela-lojista-tenant", tenantCode);
    sessionStorage.setItem("tortela-lojista-user", JSON.stringify(authUser));
    sessionStorage.setItem("tortela-lojista-tenant-info", JSON.stringify(tenant));
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function boot() {
  if (!sessionId) return renderLogin();
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

function render() {
  byId("app").innerHTML = `
    <header class="topbar tortela-topbar">
      <div class="brand">${brandMarkup()}<div><strong>Central do Lojista</strong><small>${escapeHtml(state.settings?.company || tenant?.tradeName || tenantCode)} | ${escapeHtml(authUser?.role || "Usuario")}</small></div></div>
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
    qr: renderQr,
    imports: renderImports,
    payables: renderPayables,
    receivables: renderReceivables,
    reports: renderReports,
    users: renderUsers
  };
  return (renderers[currentModule] || renderOverview)();
}

function moduleTitle(title, detail, action = "") {
  return `<div class="network-module-title"><div><h1>${title}</h1><p>${detail}</p></div>${action}</div>`;
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
  if (source.includes("central do lojista")) return "Importado";
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
    ${moduleTitle("Painel do lojista", "Operacao da unidade sem controles totais da Central administrativa.")}
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
        <button class="desktop-ribbon-button primary" data-store-module="qr" type="button"><span class="dashboard-module-icon icon-pdv"></span><strong>Entrada QR</strong><small>Receber remessa</small></button>
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
    <div class="network-grid four">
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
    const details = { lot: item.lot || payload.lot || "", expiry: item.expiry || payload.expiry || "", location: "Central do Lojista" };
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
  audit("Importacao do lojista", `${imported} registro(s) em ${type}`);
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
      seller: row.seller || row.operator || authUser?.username || "Lojista",
      payment: row.payment || row.paymentMethod || "",
      source: row.source || "Central do Lojista",
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
      history: row.history || "Importado pela Central do Lojista"
    }));
  }
  if (type === "receivables") {
    rows.forEach((row) => state.receivables.push({
      id: nextId(state.receivables),
      customer: row.customer || row.client || row.name || "Cliente",
      dueDate: row.dueDate || row.due || row.date || today(),
      value: Number(String(row.value || row.total || 0).replace(",", ".")),
      status: row.status || "Aberto",
      history: row.history || "Importado pela Central do Lojista"
    }));
  }
  if (type === "stock") {
    rows.forEach((row) => {
      const product = findProduct(row);
      const qty = Number(String(row.qty || row.quantity || 0).replace(",", "."));
      if (!product || !qty) return;
      product.stock = Number(product.stock || 0) + qty;
      addStockMovement(product, row.type || "Importacao", qty, row.history || "Importado pela Central do Lojista", {
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
    history: "Lancado pela Central do Lojista"
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
    history: "Lancado pela Central do Lojista"
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
      location: "Central do Lojista",
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
  const topProducts = {};
  state.sales.forEach((sale) => (sale.items || []).forEach((item) => {
    const name = item.description || item.product || `Produto ${item.productId || ""}`;
    topProducts[name] = (topProducts[name] || 0) + Number(item.qty || item.quantity || 1);
  }));
  const ranking = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return `<div class="network-module compact">
    ${moduleTitle("Relatorios da unidade", "Indicadores resumidos para tomada de decisao do lojista.", `<button class="btn primary" id="export-report">Exportar CSV</button>`)}
    <div class="network-grid four">
      ${kpi("Vendas no mes", money(data.salesTotal))}
      ${kpi("Ticket medio", money(data.salesTotal / Math.max(1, data.sales.length)))}
      ${kpi("A pagar", money(data.payableOpen))}
      ${kpi("A receber", money(data.receivableOpen))}
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
  byId("qr-form")?.addEventListener("submit", receiveQr);
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
  document.querySelectorAll("[data-order-status]").forEach((button) => button.addEventListener("click", () => updateOrderStatus(button.dataset.orderStatus, button.dataset.status)));
  applyRolePermissions();
}

boot();

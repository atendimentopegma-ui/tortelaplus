let sessionId = sessionStorage.getItem("tortela-central-session") || sessionStorage.getItem("tortela-rede-session") || "";
let summary = null;
let currentModule = sessionStorage.getItem("tortela-central-module") || "overview";

const modules = [
  ["overview", "Painel", "Visao geral"],
  ["sales", "Vendas", "Hora, dia e mes"],
  ["products", "Produtos", "Ranking e estoque"],
  ["orders", "Pedidos", "Automaticos"],
  ["promotions", "Promocoes", "Rede ou unidades"],
  ["finance", "Financeiro", "Contas e repasses"],
  ["permissions", "Permissoes", "Acesso das lojas"],
  ["production", "Producao", "Capacidade"],
  ["reports", "Relatorios", "Consultas"]
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

function brandMarkup() {
  return `<div class="tortela-logo"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela" /></div>`;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (sessionId) headers.Authorization = `Bearer ${sessionId}`;
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

function normalizeSummary(payload = {}) {
  return {
    totals: {},
    periods: { hour: 0, day: 0, week: 0, fortnight: 0, month: 0 },
    units: [],
    bestSellers: [],
    worstSellers: [],
    promotions: [],
    salesDetails: [],
    lowStockItems: [],
    automaticOrders: [],
    finance: [],
    permissions: [],
    productionCapacity: [],
    ...payload,
    totals: { ...(payload.totals || {}) },
    periods: { hour: 0, day: 0, week: 0, fortnight: 0, month: 0, ...(payload.periods || {}) }
  };
}

function renderLogin() {
  byId("app").innerHTML = `
    <main class="login-shell tortela-login-shell">
      <section class="login-card">
        <div class="login-brand tortela-login-brand">
          ${brandMarkup()}
          <div><h1>Central Tortela</h1><p>Controle de unidades, vendas, estoque, fiscal, promocoes e producao.</p></div>
        </div>
        <form class="login-panel" id="network-login">
          <h2>Acesso da administracao</h2>
          <div class="field"><label>Usuario</label><input id="network-user" autocomplete="username" required /></div>
          <div class="field"><label>Senha</label><input id="network-password" type="password" autocomplete="current-password" required /></div>
          <button class="btn primary" type="submit">Entrar</button>
        </form>
      </section>
    </main>`;
  byId("network-login").addEventListener("submit", login);
}

async function login(event) {
  event.preventDefault();
  try {
    const result = await api("/api/provider/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: byId("network-user").value, password: byId("network-password").value })
    });
    sessionId = result.sessionId;
    sessionStorage.setItem("tortela-central-session", sessionId);
    sessionStorage.setItem("tortela-rede-session", sessionId);
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function boot() {
  if (!sessionId) return renderLogin();
  try {
    summary = normalizeSummary(await api("/api/network/summary"));
    render();
  } catch {
    sessionId = "";
    sessionStorage.removeItem("tortela-central-session");
    sessionStorage.removeItem("tortela-rede-session");
    renderLogin();
  }
}

function render() {
  byId("app").innerHTML = `
    <header class="topbar tortela-topbar">
      <div class="brand">${brandMarkup()}<div><strong>Central Tortela</strong><small>Gestao consolidada das franquias</small></div></div>
      <div class="top-right">
        <button class="btn network-white" id="refresh">Atualizar</button>
        <a class="btn network-white" href="./index.html">Abrir sistema</a>
        <button class="btn network-white" id="logout">Sair</button>
      </div>
    </header>
    <main class="network-shell">
      <div class="network-dashboard">
        <aside class="network-nav">${renderNav()}</aside>
        <section class="network-stage">${renderCurrentModule()}</section>
      </div>
    </main>`;
  bindRender();
}

function renderNav() {
  return modules.map(([key, label, detail]) => `
    <button data-network-module="${key}" class="${currentModule === key ? "active" : ""}">
      ${label}<small>${detail}</small>
    </button>`).join("");
}

function renderCurrentModule() {
  const renderers = {
    overview: renderOverview,
    sales: renderSales,
    products: renderProducts,
    orders: renderOrders,
    promotions: renderPromotions,
    finance: renderFinance,
    permissions: renderPermissions,
    production: renderProduction,
    reports: renderReports
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

function unitName(unit = {}) {
  return escapeHtml(unit.tradeName || unit.name || unit.tenantName || unit.tenantCode || "Unidade");
}

function unitRegistrationUrl(unit = {}) {
  return unit.registrationUrl || `${location.origin}/cadastro-cliente.html?unidade=${encodeURIComponent(unit.tenantCode || "")}`;
}

function renderOverview() {
  const totals = summary.totals || {};
  return `<div class="network-module">
    ${moduleTitle("Painel da Central Tortela", "Resumo operacional das unidades sem misturar os bancos de dados.")}
    <div class="network-grid four">
      ${kpi("Faturamento", money(totals.salesTotal))}
      ${kpi("Vendas", amount(totals.salesCount))}
      ${kpi("Notas autorizadas", amount(totals.fiscalAuthorized))}
      ${kpi("Estoque baixo", amount(totals.lowStock))}
    </div>
    <section class="network-card">
      <h2>Unidades e links de cadastro</h2>
      ${table(["Unidade", "Vendas", "Notas", "Clientes", "Produtos", "Estoque baixo", "Cadastro publico"], summary.units.map((unit) => [
        `<strong>${unitName(unit)}</strong><br><small>${escapeHtml(unit.tenantCode || "")}</small>`,
        `${money(unit.salesTotal)}<br><small>${amount(unit.salesCount)} vendas</small>`,
        `${amount(unit.fiscalAuthorized)} autorizadas<br><small>${amount(unit.fiscalPending)} pendentes</small>`,
        amount(unit.customers),
        amount(unit.products),
        amount(unit.lowStock),
        `<button class="btn copy-registration" data-link="${escapeAttr(unitRegistrationUrl(unit))}">Copiar link</button>`
      ]))}
    </section>
  </div>`;
}

function renderSales() {
  const periods = summary.periods || {};
  const rows = (summary.salesDetails || []).map((sale) => [
    escapeHtml(sale.unit || sale.tradeName || sale.tenantCode || "-"),
    escapeHtml(sale.date || sale.createdAt || "-"),
    escapeHtml(sale.product || sale.description || "Venda"),
    amount(sale.qty || sale.quantity || sale.items || 0),
    money(sale.total || sale.value || 0),
    escapeHtml(sale.customer || sale.client || "Consumidor Final")
  ]);
  return `<div class="network-module">
    ${moduleTitle("Vendas da rede", "Movimento por hora, dia, semana, quinzena e mes.")}
    <div class="network-grid five">
      ${kpi("Hora atual", money(periods.hour))}
      ${kpi("Hoje", money(periods.day))}
      ${kpi("Semana", money(periods.week))}
      ${kpi("Quinzena", money(periods.fortnight))}
      ${kpi("Mes", money(periods.month))}
    </div>
    <section class="network-card">
      <h2>Detalhe de vendas</h2>
      ${table(["Unidade", "Data", "Produto", "Qtd.", "Total", "Cliente"], rows)}
    </section>
  </div>`;
}

function renderProducts() {
  return `<div class="network-module">
    ${moduleTitle("Produtos e estoque", "Produtos mais vendidos, menos vendidos e itens abaixo do minimo.")}
    <div class="network-grid three">
      <section class="network-card"><h2>Mais vendidos</h2>${table(["Produto", "Unidade", "Qtd."], summary.bestSellers.map((row) => [escapeHtml(row.product), escapeHtml(row.unit), amount(row.value)]))}</section>
      <section class="network-card"><h2>Menos vendidos</h2>${table(["Produto", "Unidade", "Qtd."], summary.worstSellers.map((row) => [escapeHtml(row.product), escapeHtml(row.unit), amount(row.value)]))}</section>
      <section class="network-card"><h2>Estoque baixo</h2>${table(["Unidade", "Produto", "Atual", "Minimo"], summary.lowStockItems.map((row) => [escapeHtml(row.unit || row.tenantCode), escapeHtml(row.product || row.description), amount(row.stock), amount(row.minStock)]))}</section>
    </div>
  </div>`;
}

function renderOrders() {
  return `<div class="network-module compact">
    ${moduleTitle("Pedidos automaticos", "Solicitacoes enviadas pelas unidades com base no estoque minimo.")}
    <section class="network-card">
      ${table(["Unidade", "Data", "Origem", "Itens", "Custo estimado", "Status"], summary.automaticOrders.map((order) => [
        escapeHtml(order.unit || order.tradeName || order.tenantCode || "-"),
        escapeHtml(order.date || order.createdAt || "-"),
        escapeHtml(order.origin || "Estoque minimo"),
        `${amount(order.totalItems || (order.items || []).length)}<br><small>${escapeHtml((order.items || []).slice(0, 3).map((item) => item.description).join(", "))}</small>`,
        money(order.estimatedCost || 0),
        escapeHtml(order.status || "Enviado")
      ]))}
    </section>
  </div>`;
}

function renderPromotions() {
  return `<div class="network-module">
    ${moduleTitle("Promocoes", "Cadastre uma promocao para toda a rede ou unidades selecionadas.")}
    <section class="network-card">
      <form class="network-form" id="promotion-form">
        <div class="field"><label>Aplicar em</label><select id="promotion-scope"><option value="all">Toda a rede</option><option value="selected">Unidades selecionadas</option></select></div>
        <div class="field wide"><label>Unidades</label><input id="promotion-units" placeholder="cliente-exemplo, loja-02" /></div>
        <div class="field wide"><label>Produto</label><input id="promotion-product" required /></div>
        <div class="field"><label>Preco</label><input id="promotion-price" type="number" step="0.01" min="0" required /></div>
        <div class="field"><label>Inicio</label><input id="promotion-from" type="date" /></div>
        <div class="field"><label>Fim</label><input id="promotion-to" type="date" /></div>
        <div class="field full"><label>Observacao</label><input id="promotion-note" /></div>
        <button class="btn primary full" type="submit">Disparar promocao</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Promocoes ativas</h2>
      ${table(["Produto", "Unidade", "Preco", "Validade"], summary.promotions.map((row) => [
        escapeHtml(row.product),
        escapeHtml(row.unit || row.scope || "Rede"),
        money(row.price || row.value),
        escapeHtml([row.from, row.to].filter(Boolean).join(" ate ") || "-")
      ]))}
    </section>
  </div>`;
}

async function submitPromotion(event) {
  event.preventDefault();
  const body = {
    scope: byId("promotion-scope").value,
    tenantCodes: byId("promotion-units").value.split(",").map((item) => item.trim()).filter(Boolean),
    product: byId("promotion-product").value,
    price: Number(byId("promotion-price").value || 0),
    from: byId("promotion-from").value,
    to: byId("promotion-to").value,
    note: byId("promotion-note").value
  };
  try {
    const result = await api("/api/network/promotions", { method: "POST", body: JSON.stringify(body) });
    alert(`Promocao enviada para ${amount(result.appliedUnits || 0)} unidade(s).`);
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

function renderFinance() {
  return `<div class="network-module compact">
    ${moduleTitle("Financeiro das franquias", "Contas a pagar, receber e controle de pagamento das unidades.")}
    <section class="network-card">
      ${table(["Unidade", "A receber", "A pagar", "Taxas em aberto", "Taxas pagas", "Situacao"], summary.finance.map((row) => [
        escapeHtml(row.unit || row.tradeName || row.tenantCode || "-"),
        money(row.receivables || 0),
        money(row.payables || 0),
        money(row.franchiseOpen || row.open || 0),
        money(row.franchisePaid || row.paid || 0),
        escapeHtml(row.status || "Acompanhar")
      ]))}
    </section>
  </div>`;
}

function renderPermissions() {
  return `<div class="network-module compact">
    ${moduleTitle("Permissoes dos franqueados", "Bloqueio, terminais, sessoes e modulos liberados por unidade.")}
    <section class="network-card">
      ${table(["Unidade", "Bloqueio", "Terminais", "Sessoes", "Modulos"], summary.permissions.map((row) => [
        escapeHtml(row.unit || row.tradeName || row.tenantCode || "-"),
        row.blocked ? "Bloqueada" : "Liberada",
        `${amount(row.terminalsUsed || row.activeSessions || 0)} / ${amount(row.terminalsLimit || 0)}`,
        amount(row.activeSessions || 0),
        escapeHtml(Array.isArray(row.modules) ? row.modules.join(", ") : (row.modules || "Todos"))
      ]))}
    </section>
  </div>`;
}

function renderProduction() {
  return `<div class="network-module compact">
    ${moduleTitle("Producao e materias primas", "Capacidade por receita com base no saldo de materia prima.")}
    <section class="network-card">
      ${table(["Unidade", "Produto", "Pode produzir", "Limitante", "Materias primas"], summary.productionCapacity.map((row) => [
        escapeHtml(row.unit || row.tradeName || row.tenantCode || "-"),
        escapeHtml(row.product || row.description || "-"),
        amount(row.canProduce || row.quantity || 0),
        escapeHtml(row.limitingItem || "-"),
        escapeHtml(Array.isArray(row.rawMaterials) ? row.rawMaterials.join(", ") : (row.rawMaterials || "-"))
      ]))}
    </section>
  </div>`;
}

function renderReports() {
  const reports = [
    ["Vendas", "Historico por unidade, vendedor, produto, hora e periodo."],
    ["Fiscal", "Notas emitidas, pendentes, XMLs, cancelamentos e contingencia."],
    ["Estoque", "Saldos, minimo, composicao, grade, lote e movimentacao."],
    ["Financeiro", "Contas, caixa, pagamentos das franquias e repasses."],
    ["Clientes", "Cadastros da rede, origem do link e duplicidade por CPF."],
    ["Producao", "Receitas, capacidade e consumo de materias primas."]
  ];
  return `<div class="network-module compact">
    ${moduleTitle("Relatorios", "Consultas separadas por assunto para manter a central limpa.")}
    <div class="network-grid three report-grid">${reports.map(([title, detail]) => `<section class="network-card"><h2>${title}</h2><p>${detail}</p></section>`).join("")}</div>
  </div>`;
}

function bindRender() {
  byId("logout").addEventListener("click", async () => {
    await api("/api/provider/auth/logout", { method: "POST" }).catch(() => {});
    sessionId = "";
    sessionStorage.removeItem("tortela-central-session");
    sessionStorage.removeItem("tortela-rede-session");
    renderLogin();
  });
  byId("refresh").addEventListener("click", boot);
  document.querySelectorAll("[data-network-module]").forEach((button) => button.addEventListener("click", () => {
    currentModule = button.dataset.networkModule;
    sessionStorage.setItem("tortela-central-module", currentModule);
    render();
  }));
  document.querySelectorAll(".copy-registration").forEach((button) => button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.dataset.link);
    button.textContent = "Link copiado";
  }));
  const promotionForm = byId("promotion-form");
  if (promotionForm) promotionForm.addEventListener("submit", submitPromotion);
}

boot();

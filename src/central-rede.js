let sessionId = sessionStorage.getItem("tortela-central-session") || sessionStorage.getItem("tortela-rede-session") || "";
let summary = null;
let currentModule = sessionStorage.getItem("tortela-central-module") || "overview";

const modules = [
  ["overview", "Painel", "Visao geral"],
  ["sales", "Vendas", "Hora, dia e mes"],
  ["products", "Produtos", "Ranking e estoque"],
  ["orders", "Pedidos", "Automaticos"],
  ["promotions", "Promocoes", "Rede ou unidades"],
  ["royalties", "Royalties", "Propaganda e taxas"],
  ["customers", "Clientes", "Consumo e retorno"],
  ["finance", "Financeiro", "Contas e repasses"],
  ["permissions", "Permissoes", "Acesso das lojas"],
  ["production", "Producao", "Capacidade"],
  ["deployment", "Implantacao", "Banco e seguranca"],
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

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function amount(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function saleChannelLabel(sale = {}) {
  const source = String(sale.channel || sale.source || sale.type || sale.seller || "").toLowerCase();
  if (source.includes("totem")) return "Totem local";
  if (source.includes("loja online") || source.includes("delivery") || source.includes("pedido online")) return "Loja online";
  if (source.includes("pdv")) return "PDV";
  if (source.includes("central do lojista")) return "Importado";
  if (source.includes("orcamento")) return "Orcamento";
  return sale.channel || sale.source || sale.type || "Venda da loja";
}

function groupedSales(keyFn) {
  const rows = new Map();
  (summary.salesDetails || []).forEach((sale) => {
    const key = keyFn(sale) || "-";
    const current = rows.get(key) || { key, count: 0, total: 0 };
    current.count += 1;
    current.total += Number(sale.total || sale.value || 0);
    rows.set(key, current);
  });
  return [...rows.values()].sort((a, b) => b.total - a.total);
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
    royalties: [],
    salesDetails: [],
    lowStockItems: [],
    automaticOrders: [],
    approvalRequests: [],
    finance: [],
    permissions: [],
    productionCapacity: [],
    customerConsumption: [],
    inactiveCustomers: [],
    whatsapp: {},
    whatsappGroupLeads: [],
    whatsappGroupQueue: [],
    deployment: { checks: [], blockers: [], warnings: [] },
    databaseIsolation: { expectedTenants: [], orphanSchemas: [], postgresActive: false, ready: false, mode: "" },
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
        <a class="btn network-white" href="./loja.html">Loja online</a>
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
    royalties: renderRoyalties,
    customers: renderCustomers,
    finance: renderFinance,
    permissions: renderPermissions,
    production: renderProduction,
    deployment: renderDeployment,
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
      ${kpi("Ticket medio rede", money((totals.salesTotal || 0) / Math.max(1, totals.salesCount || 0)))}
      ${kpi("Notas autorizadas", amount(totals.fiscalAuthorized))}
    </div>
    <section class="network-card">
      <h2>Unidades e links de cadastro</h2>
      ${table(["Unidade", "Vendas", "Ticket medio", "Notas", "Clientes", "Produtos", "Estoque baixo", "Cadastro publico", "Loja online"], summary.units.map((unit) => [
        `<strong>${unitName(unit)}</strong><br><small>${escapeHtml(unit.tenantCode || "")}</small>`,
        `${money(unit.salesTotal)}<br><small>${amount(unit.salesCount)} vendas</small>`,
        money(unit.averageTicket || 0),
        `${amount(unit.fiscalAuthorized)} autorizadas<br><small>${amount(unit.fiscalPending)} pendentes</small>`,
        amount(unit.customers),
        amount(unit.products),
        amount(unit.lowStock),
        `<button class="btn copy-registration" data-link="${escapeAttr(unitRegistrationUrl(unit))}">Copiar link</button>`,
        `<a class="btn" href="./loja.html?unidade=${encodeURIComponent(unit.tenantCode || "")}">Abrir loja</a>`
      ]))}
    </section>
  </div>`;
}

function renderSales() {
  const periods = summary.periods || {};
  const rows = (summary.salesDetails || []).map((sale) => [
    escapeHtml(sale.unit || sale.tradeName || sale.tenantCode || "-"),
    escapeHtml(sale.date || sale.createdAt || "-"),
    escapeHtml(saleChannelLabel(sale)),
    escapeHtml(sale.product || sale.description || "Venda"),
    amount(sale.qty || sale.quantity || sale.items || 0),
    money(sale.total || sale.value || 0),
    `${escapeHtml(sale.customer || sale.client || "Consumidor Final")}<br><small>${escapeHtml(sale.customerDocument || sale.customerPhone || "")}</small>`,
    escapeHtml(sale.seller || sale.operator || "-"),
    escapeHtml(sale.status || "Finalizada")
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
      ${table(["Unidade", "Data", "Canal", "Produto", "Qtd.", "Total", "Cliente", "Vendedor", "Status"], rows)}
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
  const pendingApprovals = (summary.approvalRequests || []).filter((row) => row.status === "Pendente");
  return `<div class="network-module compact">
    ${moduleTitle("Pedidos automaticos", "Solicitacoes enviadas pelas unidades com base no estoque minimo.")}
    <section class="network-card">
      <h2>QR de remessa da Central</h2>
      <form class="network-form" id="shipment-qr-form">
        <div class="field"><label>Unidade destino</label><input id="shipment-tenant" placeholder="cliente-exemplo" /></div>
        <div class="field full"><label>Itens da remessa</label><textarea id="shipment-items" rows="4" placeholder='[{"productId":5014,"qty":10},{"barcode":"7890000000011","qty":5}]'></textarea></div>
        <button class="btn primary full" type="submit">Gerar QR da remessa</button>
      </form>
      <div id="shipment-qr-result" class="network-qr-result"></div>
    </section>
    <section class="network-card">
      <h2>Aprovacoes pendentes da Central</h2>
      ${table(["Unidade", "Tipo", "Detalhe", "Justificativa", "Solicitado por", "Acoes"], pendingApprovals.map((row) => [
        escapeHtml(row.unit || row.tenantCode || "-"),
        escapeHtml(row.title || row.type || "-"),
        escapeHtml(row.detail || "-"),
        escapeHtml(row.justification || "-"),
        `${escapeHtml(row.requestedBy || "-")}<br><small>${escapeHtml(String(row.requestedAt || "").slice(0, 16).replace("T", " "))}</small>`,
        `<button class="btn primary" data-approve-request="${row.tenantCode}:${row.id}">Autorizar</button> <button class="btn danger" data-reject-request="${row.tenantCode}:${row.id}">Negar</button>`
      ]), "Nenhuma autorizacao pendente.")}
    </section>
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
    ${moduleTitle("Promocoes e tabela de precos", "Cadastre precos e campanhas somente pela Central, por rede, regiao ou unidade.")}
    <section class="network-card">
      <h2>Tabela de precos por regiao/unidade</h2>
      <form class="network-form" id="price-table-form">
        <div class="field"><label>Aplicar em</label><select id="price-table-scope"><option value="all">Toda a rede</option><option value="region">Regiao/UF</option><option value="selected">Unidades selecionadas</option></select></div>
        <div class="field"><label>Regiao/UF</label><input id="price-table-region" placeholder="SP, RJ ou Zona Leste" /></div>
        <div class="field wide"><label>Unidades</label><input id="price-table-units" placeholder="cliente-exemplo, loja-02" /></div>
        <div class="field wide"><label>Produto</label><input id="price-table-product" required /></div>
        <div class="field"><label>Preco autorizado</label><input id="price-table-price" type="number" step="0.01" min="0" required /></div>
        <div class="field full"><label>Justificativa/observacao</label><input id="price-table-note" /></div>
        <button class="btn primary full" type="submit">Aplicar tabela pela Central</button>
      </form>
    </section>
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

async function submitPriceTable(event) {
  event.preventDefault();
  const scope = byId("price-table-scope").value;
  const region = byId("price-table-region").value.trim();
  const body = {
    scope: scope === "selected" ? "selected" : "all",
    tenantCodes: byId("price-table-units").value.split(",").map((item) => item.trim()).filter(Boolean),
    product: byId("price-table-product").value,
    price: Number(byId("price-table-price").value || 0),
    from: new Date().toISOString().slice(0, 10),
    to: "",
    note: `Tabela de preco Central ${scope}${region ? ` - ${region}` : ""}. ${byId("price-table-note").value}`
  };
  try {
    const result = await api("/api/network/promotions", { method: "POST", body: JSON.stringify(body) });
    alert(`Tabela aplicada pela Central em ${amount(result.appliedUnits || 0)} unidade(s).`);
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

function generateShipmentQr(event) {
  event.preventDefault();
  const result = byId("shipment-qr-result");
  let items = [];
  try {
    items = JSON.parse(byId("shipment-items").value || "[]");
  } catch {
    alert("Itens invalidos. Use JSON com productId/barcode e qty.");
    return;
  }
  if (!Array.isArray(items) || !items.length) return alert("Informe ao menos um item.");
  const payload = {
    type: "tortela-central-shipment",
    shipmentId: `REM-${Date.now()}`,
    tenantCode: byId("shipment-tenant").value.trim(),
    issuedAt: new Date().toISOString(),
    items
  };
  const text = JSON.stringify(payload);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(text)}`;
  result.innerHTML = `<div class="network-qr-box"><img src="${qrUrl}" alt="QR remessa Central" /><textarea readonly rows="5">${escapeHtml(text)}</textarea></div>`;
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

function renderRoyalties() {
  const rows = summary.royalties || [];
  const total = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const open = rows.reduce((sum, row) => sum + Number(row.open || 0), 0);
  return `<div class="network-module compact">
    ${moduleTitle("Royalties da Rede Tortela", "Propaganda, faturamento, tecnologia, fundo de marketing, campanhas e minimo mensal.", `<button class="btn primary" id="generate-royalties">Gerar cobrancas do mes</button>`)}
    <div class="network-grid three">
      ${kpi("Royalties previstos", money(total))}
      ${kpi("Em aberto", money(open))}
      ${kpi("Unidades", amount(rows.length))}
    </div>
    <section class="network-card">
      ${table(["Unidade", "Base vendas", "Propaganda", "Royalties", "Tecnologia", "Marketing", "Campanha", "Minimo", "Total", "Status"], rows.map((row) => [
        escapeHtml(row.unit || row.tenantCode || "-"),
        money(row.salesBase || 0),
        money(row.advertising || 0),
        money(row.salesRoyalty || 0),
        money(row.technology || 0),
        money(row.marketingFund || 0),
        money(row.campaignFee || 0),
        money(row.minimumComplement || 0),
        `<strong>${money(row.total || 0)}</strong>`,
        escapeHtml(row.status || "A gerar")
      ]))}
    </section>
  </div>`;
}

function renderCustomers() {
  const consumptionRows = summary.customerConsumption || [];
  const inactiveRows = summary.inactiveCustomers || [];
  const whatsapp = summary.whatsapp || {};
  const whatsappLeads = summary.whatsappGroupLeads || [];
  const whatsappQueue = summary.whatsappGroupQueue || [];
  return `<div class="network-module compact">
    ${moduleTitle("Clientes da rede", "Consumo por unidade, retorno de compra e lista de clientes sem compra ha 30 dias ou mais.")}
    <div class="network-grid three">
      ${kpi("Clientes com compra", amount(consumptionRows.length))}
      ${kpi("Sem comprar 30+ dias", amount(inactiveRows.length))}
      ${kpi("Autorizados no grupo", amount(whatsappLeads.length))}
    </div>
    <section class="network-card">
      <h2>Conta WhatsApp da Central</h2>
      <form class="network-form" id="whatsapp-settings-form">
        <div class="field"><label>Nome da conta</label><input id="whatsapp-account-name" value="${escapeAttr(whatsapp.accountName || "Central Tortela")}" /></div>
        <div class="field"><label>Numero WhatsApp oficial</label><input id="whatsapp-phone" value="${escapeAttr(whatsapp.phone || "")}" placeholder="55 11 99999-9999" /></div>
        <div class="field"><label>Link do grupo Tortela</label><input id="whatsapp-group-url" value="${escapeAttr(whatsapp.groupInviteUrl || "")}" placeholder="https://chat.whatsapp.com/..." /></div>
        <div class="field"><label>ID do grupo na API</label><input id="whatsapp-group-id" value="${escapeAttr(whatsapp.groupId || "")}" placeholder="ID informado pela integradora" /></div>
        <div class="field"><label>Modo integracao</label><select id="whatsapp-integration-mode"><option value="generic" ${whatsapp.integrationMode === "generic" ? "selected" : ""}>Generico</option><option value="wapi" ${whatsapp.integrationMode === "wapi" ? "selected" : ""}>W-API</option></select></div>
        <div class="field"><label>URL API/integradora</label><input id="whatsapp-api-url" value="${escapeAttr(whatsapp.apiUrl || "")}" placeholder="https://api.whatsapp..." /></div>
        <div class="field"><label>Token API</label><input id="whatsapp-api-token" type="password" placeholder="${whatsapp.apiTokenConfigured ? "Token configurado" : "Informe quando contratar a API"}" /></div>
        <button class="btn primary" type="submit">Salvar WhatsApp</button>
      </form>
    </section>
    <section class="network-card">
      <h2>Automacao de entrada no grupo</h2>
      ${table(["Cliente", "WhatsApp", "Unidade", "Status", "Detalhe", "Atualizado"], whatsappQueue.map((row) => [
        escapeHtml(row.customer || "-"),
        escapeHtml(row.phone || "-"),
        escapeHtml(row.unit || row.tenantCode || "-"),
        escapeHtml(row.status || "-"),
        escapeHtml(row.detail || "-"),
        escapeHtml(String(row.updatedAt || row.createdAt || "").slice(0, 19).replace("T", " ") || "-")
      ]), "Nenhuma tentativa automatica registrada ainda.")}
    </section>
    <section class="network-card">
      <h2>Autorizados para grupo da Tortela</h2>
      ${table(["Cliente", "WhatsApp", "Nascimento", "Unidade", "Cidade", "Autorizado em"], whatsappLeads.map((row) => [
        escapeHtml(row.customer || "-"),
        escapeHtml(row.phone || "-"),
        escapeHtml(row.birthDate || "-"),
        escapeHtml(row.unit || row.tenantCode || "-"),
        escapeHtml(row.city || "-"),
        escapeHtml(String(row.authorizedAt || "").slice(0, 10) || "-")
      ]), "Nenhum cliente autorizou inclusao no grupo ainda.")}
    </section>
    <section class="network-card">
      <h2>Consumo entre unidades</h2>
      ${table(["Cliente", "Documento", "Unidades", "Compras", "Total", "Ultima compra", "Mais consumidos"], consumptionRows.map((row) => [
        `<strong>${escapeHtml(row.customer || "-")}</strong><br><small>${escapeHtml(row.whatsapp || "")}</small>`,
        escapeHtml(row.document || "-"),
        escapeHtml((row.units || []).join(", ") || "-"),
        amount(row.purchases || 0),
        money(row.total || 0),
        `${escapeHtml(String(row.lastPurchase || "").slice(0, 10) || "-")}<br><small>${row.daysSinceLastPurchase === null || row.daysSinceLastPurchase === undefined ? "-" : `${amount(row.daysSinceLastPurchase)} dias`}</small>`,
        escapeHtml((row.favoriteProducts || []).map((item) => item.product).join(", ") || "-")
      ]))}
    </section>
    <section class="network-card">
      <h2>Recuperacao por WhatsApp</h2>
      ${table(["Cliente", "WhatsApp", "Dias sem comprar", "Ultima compra", "Sugestao"], inactiveRows.map((row) => [
        escapeHtml(row.customer || "-"),
        escapeHtml(row.whatsapp || "-"),
        amount(row.daysSinceLastPurchase || 0),
        escapeHtml(String(row.lastPurchase || "").slice(0, 10) || "-"),
        "Enviar campanha de retorno"
      ]), "Nenhum cliente com 30 dias ou mais sem compra.")}
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

function statusBadge(ok, warning = false) {
  if (ok) return `<span class="badge ok">OK</span>`;
  return `<span class="badge ${warning ? "warn" : "danger"}">${warning ? "Aviso" : "Pendente"}</span>`;
}

function renderDeployment() {
  const deployment = summary.deployment || {};
  const isolation = summary.databaseIsolation || {};
  const checks = deployment.checks || [];
  const tenantRows = isolation.expectedTenants || [];
  return `<div class="network-module compact">
    ${moduleTitle("Implantacao e banco definitivo", "Conferencia para provedor pago, PostgreSQL e isolamento real por unidade.")}
    <div class="network-grid four">
      ${kpi("Modo atual", escapeHtml(isolation.mode || deployment.mode || "-"))}
      ${kpi("PostgreSQL", isolation.postgresActive ? "Ativo" : "Nao ativo")}
      ${kpi("Isolamento", isolation.ready ? "Pronto" : "Conferir")}
      ${kpi("Unidades", amount(tenantRows.length))}
    </div>
    ${isolation.warning ? `<section class="network-card"><p><strong>Atencao:</strong> ${escapeHtml(isolation.warning)}</p></section>` : ""}
    <section class="network-card">
      <h2>Checklist de producao</h2>
      ${table(["Item", "Status", "Orientacao"], checks.map((check) => [
        escapeHtml(check.label || check.id || "-"),
        statusBadge(check.ok, check.level === "warning"),
        escapeHtml(check.message || "")
      ]), "Nenhuma checagem retornada pelo servidor.")}
    </section>
    <section class="network-card">
      <h2>Isolamento por unidade</h2>
      ${table(["Unidade", "Armazenamento", "Base separada", "Status"], tenantRows.map((tenant) => [
        `<strong>${escapeHtml(tenant.unit || tenant.tenantCode || "-")}</strong><br><small>${escapeHtml(tenant.tenantCode || "")}</small>`,
        escapeHtml(tenant.storage || "-"),
        escapeHtml(tenant.schema || tenant.file || "-"),
        statusBadge(tenant.exists)
      ]), "Nenhuma unidade cadastrada na Central.")}
    </section>
    ${(isolation.orphanSchemas || []).length ? `<section class="network-card">
      <h2>Schemas sem unidade ativa</h2>
      ${table(["Schema"], isolation.orphanSchemas.map((schema) => [escapeHtml(schema)]))}
    </section>` : ""}
  </div>`;
}

function renderReports() {
  const byUnit = groupedSales((sale) => sale.unit || sale.tradeName || sale.tenantCode);
  const byCustomer = groupedSales((sale) => sale.customer || sale.client || "Consumidor Final").slice(0, 20);
  const byChannel = groupedSales((sale) => saleChannelLabel(sale));
  const bySeller = groupedSales((sale) => sale.seller || sale.operator || "Sem vendedor");
  const fiscalPending = (summary.units || []).reduce((sum, unit) => sum + Number(unit.fiscalPending || 0), 0);
  const financeOpen = (summary.finance || []).map((row) => [
    escapeHtml(row.unit || row.tradeName || row.tenantCode || "-"),
    money(row.receivableOpen || row.receivables || 0),
    money(row.payableOpen || row.payables || 0),
    money(row.franchiseOpen || row.open || 0)
  ]);
  return `<div class="network-module compact">
    ${moduleTitle("Relatorios da Central", "Visao consolidada para saber quanto cada loja vendeu, para quem vendeu e quais pontos precisam de acao.")}
    <div class="network-grid four">
      ${kpi("Vendas da rede", money((summary.totals || {}).salesTotal || 0), `${amount((summary.totals || {}).salesCount || 0)} venda(s)`)}
      ${kpi("Estoque baixo", amount((summary.lowStockItems || []).length), "itens nas unidades")}
      ${kpi("Fiscal pendente", amount(fiscalPending), "documentos")}
      ${kpi("Clientes rastreados", amount((summary.customerConsumption || []).length), "com historico")}
    </div>
    <section class="network-card">
      <h2>Vendas por unidade</h2>
      ${table(["Unidade", "Vendas", "Total"], byUnit.map((row) => [escapeHtml(row.key), amount(row.count), money(row.total)]))}
    </section>
    <section class="network-card">
      <h2>Vendas por canal</h2>
      ${table(["Canal", "Vendas", "Total"], byChannel.map((row) => [escapeHtml(row.key), amount(row.count), money(row.total)]))}
    </section>
    <section class="network-card">
      <h2>Vendas por vendedor</h2>
      ${table(["Vendedor", "Vendas", "Total"], bySeller.map((row) => [escapeHtml(row.key), amount(row.count), money(row.total)]))}
    </section>
    <section class="network-card">
      <h2>Quem comprou</h2>
      ${table(["Cliente", "Compras", "Total"], byCustomer.map((row) => [escapeHtml(row.key), amount(row.count), money(row.total)]))}
    </section>
    <section class="network-card">
      <h2>Financeiro por unidade</h2>
      ${table(["Unidade", "A receber", "A pagar", "Taxas abertas"], financeOpen)}
    </section>
    <section class="network-card">
      <h2>Estoque que precisa de remessa QR</h2>
      ${table(["Unidade", "Produto", "Atual", "Minimo", "Sugerido"], (summary.lowStockItems || []).map((row) => [
        escapeHtml(row.unit || row.tenantCode || "-"),
        escapeHtml(row.product || row.description || "-"),
        amount(row.stock || 0),
        amount(row.minStock || 0),
        amount(row.suggested || 0)
      ]), "Nenhum produto abaixo do minimo.")}
    </section>
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
    try {
      await copyText(button.dataset.link);
      button.textContent = "Link copiado";
    } catch {
      alert(`Nao foi possivel copiar automaticamente. Link: ${button.dataset.link}`);
    }
  }));
  const promotionForm = byId("promotion-form");
  if (promotionForm) promotionForm.addEventListener("submit", submitPromotion);
  const priceTableForm = byId("price-table-form");
  if (priceTableForm) priceTableForm.addEventListener("submit", submitPriceTable);
  const shipmentQrForm = byId("shipment-qr-form");
  if (shipmentQrForm) shipmentQrForm.addEventListener("submit", generateShipmentQr);
  document.querySelectorAll("[data-approve-request]").forEach((button) => button.addEventListener("click", () => decideApproval(button.dataset.approveRequest, "approved")));
  document.querySelectorAll("[data-reject-request]").forEach((button) => button.addEventListener("click", () => decideApproval(button.dataset.rejectRequest, "rejected")));
  const whatsappSettingsForm = byId("whatsapp-settings-form");
  if (whatsappSettingsForm) whatsappSettingsForm.addEventListener("submit", saveWhatsappSettings);
  const generateRoyalties = byId("generate-royalties");
  if (generateRoyalties) generateRoyalties.addEventListener("click", generateRoyaltiesForMonth);
}

async function decideApproval(key, decision) {
  const [tenantCode, requestId] = String(key || "").split(":");
  const note = prompt(decision === "approved" ? "Observacao da autorizacao:" : "Motivo da negativa:") || "";
  try {
    await api("/api/network/approvals/decide", {
      method: "POST",
      body: JSON.stringify({ tenantCode, requestId: Number(requestId), decision, note })
    });
    alert(decision === "approved" ? "Solicitacao autorizada e aplicada." : "Solicitacao negada.");
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function saveWhatsappSettings(event) {
  event.preventDefault();
  try {
    await api("/api/network/whatsapp/settings", {
      method: "POST",
      body: JSON.stringify({
        accountName: byId("whatsapp-account-name").value,
        phone: byId("whatsapp-phone").value,
        groupInviteUrl: byId("whatsapp-group-url").value,
        groupId: byId("whatsapp-group-id").value,
        integrationMode: byId("whatsapp-integration-mode").value,
        apiUrl: byId("whatsapp-api-url").value,
        apiToken: byId("whatsapp-api-token").value
      })
    });
    alert("WhatsApp da Central salvo.");
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function generateRoyaltiesForMonth() {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const result = await api("/api/network/royalties/generate", {
      method: "POST",
      body: JSON.stringify({ month })
    });
    alert(`Royalties gerados: ${amount(result.created || 0)} cobranca(s), total ${money(result.total || 0)}.`);
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

boot();

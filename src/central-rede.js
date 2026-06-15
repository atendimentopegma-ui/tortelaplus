let sessionId = sessionStorage.getItem("tortela-rede-session") || "";
let summary = null;

function byId(id) {
  return document.getElementById(id);
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

function renderLogin() {
  byId("app").innerHTML = `
    <main class="login-shell tortela-login-shell">
      <section class="login-card">
        <div class="login-brand tortela-login-brand">
          ${brandMarkup()}
          <div><h1>Central da Rede</h1><p>Resultados, clientes, estoque, fiscal e promocoes de todas as unidades Tortela.</p></div>
        </div>
        <form class="login-panel" id="network-login">
          <h2>Acesso da administracao da rede</h2>
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
    sessionStorage.setItem("tortela-rede-session", sessionId);
    await boot();
  } catch (error) {
    alert(error.message);
  }
}

async function boot() {
  if (!sessionId) return renderLogin();
  try {
    summary = await api("/api/network/summary");
    render();
  } catch {
    sessionId = "";
    sessionStorage.removeItem("tortela-rede-session");
    renderLogin();
  }
}

function unitTable() {
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>Unidade</th><th>Vendas</th><th>Notas</th><th>Clientes</th><th>Produtos</th><th>Estoque baixo</th><th>Cadastro publico</th></tr></thead>
      <tbody>${summary.units.map((unit) => `<tr>
        <td><strong>${unit.tradeName}</strong><br><small>${unit.tenantCode}</small></td>
        <td>${money(unit.salesTotal)}<br><small>${unit.salesCount} vendas</small></td>
        <td>${unit.fiscalAuthorized} autorizadas<br><small>${unit.fiscalPending} pendentes</small></td>
        <td>${unit.customers}</td><td>${unit.products}</td><td>${unit.lowStock}</td>
        <td><button class="btn copy-registration" data-link="${unit.registrationUrl}">Copiar link</button></td>
      </tr>`).join("")}</tbody>
    </table></div>`;
}

function rankingTable(title, rows, valueLabel) {
  return `<section class="panel"><div class="panel-head"><h2>${title}</h2></div><div class="table-wrap"><table>
    <thead><tr><th>Produto</th><th>Unidade</th><th>${valueLabel}</th></tr></thead>
    <tbody>${rows.length ? rows.map((row) => `<tr><td>${row.product}</td><td>${row.unit}</td><td>${row.value}</td></tr>`).join("") : `<tr><td colspan="3">Sem movimentacao no periodo.</td></tr>`}</tbody>
  </table></div></section>`;
}

function render() {
  byId("app").innerHTML = `
    <header class="topbar tortela-topbar">
      <div class="brand">${brandMarkup()}<div><strong>Central da Rede Tortela</strong><small>Gestao consolidada das unidades</small></div></div>
      <div class="top-right"><a class="btn network-white" href="./index.html">Abrir sistema</a><button class="btn network-white" id="logout">Sair</button></div>
    </header>
    <main class="network-shell">
      <section class="panel">
        <div class="panel-head"><h1>Visao geral da rede</h1><button class="btn primary" id="refresh">Atualizar dados</button></div>
        <div class="kpis network-kpis">
          <div class="kpi"><span>Faturamento</span><strong>${money(summary.totals.salesTotal)}</strong></div>
          <div class="kpi"><span>Vendas</span><strong>${summary.totals.salesCount}</strong></div>
          <div class="kpi"><span>Notas autorizadas</span><strong>${summary.totals.fiscalAuthorized}</strong></div>
          <div class="kpi"><span>Clientes</span><strong>${summary.totals.customers}</strong></div>
          <div class="kpi"><span>Produtos</span><strong>${summary.totals.products}</strong></div>
          <div class="kpi"><span>Estoque baixo</span><strong>${summary.totals.lowStock}</strong></div>
        </div>
      </section>
      <section class="panel"><div class="panel-head"><h2>Unidades e links de cadastro</h2></div>${unitTable()}</section>
      <div class="network-rankings">
        ${rankingTable("Produtos mais vendidos", summary.bestSellers, "Quantidade")}
        ${rankingTable("Produtos menos vendidos", summary.worstSellers, "Quantidade")}
        ${rankingTable("Promocoes ativas", summary.promotions, "Preco promocional")}
      </div>
    </main>`;

  byId("logout").addEventListener("click", async () => {
    await api("/api/provider/auth/logout", { method: "POST" }).catch(() => {});
    sessionId = "";
    sessionStorage.removeItem("tortela-rede-session");
    renderLogin();
  });
  byId("refresh").addEventListener("click", boot);
  document.querySelectorAll(".copy-registration").forEach((button) => button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.dataset.link);
    button.textContent = "Link copiado";
  }));
}

boot();

const storageKey = "pegmaplus-provider-state-v1";

const seed = {
  provider: {
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
        licenseExpiresAt: "2026-07-05",
        status: "Ativo",
        adminUser: "admin@cliente.com",
        modules: ["PDV", "NF-e", "NFC-e", "NFS-e", "Estoque", "Financeiro", "Relatorios", "Compras"]
      }
    ]
  }
};

let state = load();
let apiOnline = false;
let providerSession = sessionStorage.getItem("pegmaplus-central-session") || "";
let providerUser = JSON.parse(sessionStorage.getItem("pegmaplus-central-user") || "null");
let providerHealth = null;
let providerMonitoring = null;
let managedUsers = [];
let centralView = "main";
const availablePermissions = ["dashboard", "people", "products", "stock", "purchases", "sales", "finance", "fiscal", "reports", "settings", "pdv", "stock_adjust", "purchase_cancel", "sales_cancel", "finance_settle", "fiscal_transmit", "fiscal_cancel", "restore_backup", "manage_users"];
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
  purchase_cancel: "Cancelar compras",
  sales_cancel: "Cancelar vendas",
  finance_settle: "Baixar titulos",
  fiscal_transmit: "Transmitir documentos fiscais",
  fiscal_cancel: "Cancelar documentos fiscais",
  restore_backup: "Restaurar backup",
  manage_users: "Gerenciar usuarios"
};

function permissionLabel(permission) {
  return permissionLabels[permission] || permission;
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (providerSession) headers.Authorization = `Bearer ${providerSession}`;
  const response = await fetch(path, {
    ...options,
    headers
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `API ${response.status}`);
  return payload;
}

async function boot() {
  if (!providerSession) {
    renderLogin();
    return;
  }
  try {
    const me = await api("/api/provider/auth/me");
    providerUser = me.user;
    const remoteState = await api("/api/provider");
    state = { provider: remoteState.provider };
    providerHealth = await api("/api/health");
    providerMonitoring = await api("/api/provider/monitoring");
    apiOnline = true;
  } catch {
    providerSession = "";
    providerUser = null;
    sessionStorage.removeItem("pegmaplus-central-session");
    sessionStorage.removeItem("pegmaplus-central-user");
    renderLogin();
    return;
  }
  render();
}

function renderLogin() {
  byId("app").innerHTML = `
    <main class="login-shell">
      <section class="login-card">
        <div class="login-brand">
          ${brandMarkup()}
          <h1>Central SaaS</h1>
          <p>Administracao de clientes, usuarios, terminais, modulos e licencas do Pegma Plus.</p>
        </div>
        <form class="login-panel" id="central-login">
          <h2>Acesso administrativo</h2>
          <div class="field"><label>Usuario</label><input id="central-login-user" autocomplete="username" required /></div>
          <div class="field"><label>Senha</label><input id="central-login-password" type="password" autocomplete="current-password" required /></div>
          <button class="btn primary" type="submit">Entrar</button>
        </form>
      </section>
    </main>`;
  byId("central-login").addEventListener("submit", loginCentral);
}

async function loginCentral(event) {
  event.preventDefault();
  try {
    const result = await api("/api/provider/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: byId("central-login-user").value, password: byId("central-login-password").value })
    });
    providerSession = result.sessionId;
    providerUser = result.user;
    sessionStorage.setItem("pegmaplus-central-session", providerSession);
    sessionStorage.setItem("pegmaplus-central-user", JSON.stringify(providerUser));
    await boot();
  } catch {
    alert("Usuario ou senha invalidos.");
  }
}

async function logoutCentral() {
  await api("/api/provider/auth/logout", { method: "POST" }).catch(() => {});
  providerSession = "";
  providerUser = null;
  centralView = "main";
  sessionStorage.removeItem("pegmaplus-central-session");
  sessionStorage.removeItem("pegmaplus-central-user");
  renderLogin();
}

function load() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return structuredClone(seed);
  }
  const parsed = JSON.parse(stored);
  parsed.provider = parsed.provider || seed.provider;
  parsed.provider.clients = (parsed.provider.clients || seed.provider.clients).map((client) => ({
    renewalDays: 30,
    licenseExpiresAt: "2026-07-05",
    activeTerminals: 0,
    status: "Ativo",
    modules: ["PDV", "Estoque", "Financeiro", "Compras"],
    ...client
  }));
  return parsed;
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function byId(id) {
  return document.getElementById(id);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateText, days) {
  const date = dateText ? new Date(`${dateText}T00:00:00`) : new Date();
  date.setDate(date.getDate() + Number(days || 30));
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateText) {
  const target = new Date(`${dateText}T23:59:59`);
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

function simpleHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
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

function licenseChallenge(tenant) {
  return `S-${simpleHash(`${tenant.tenantCode}|${tenant.document}|${tenant.licenseExpiresAt}|Operador`)}`;
}

function licenseStatus(tenant) {
  const remaining = daysUntil(tenant.licenseExpiresAt);
  return {
    remaining,
    expired: remaining < 0,
    warning: remaining <= 7 && remaining >= 0
  };
}

function brandMarkup() {
  return `<div class="brand-mark logo"><img src="./assets/logo-pegmaplus-nova.png?v=1" alt="Pegma Plus" /></div>`;
}

function render() {
  if (centralView === "audit") {
    renderAudit();
    return;
  }
  const clients = state.provider.clients || [];
  const activeClients = clients.filter((client) => client.status === "Ativo").length;
  const terminals = clients.reduce((sum, client) => sum + Number(client.maxTerminals || 0), 0);
  const usedTerminals = clients.reduce((sum, client) => sum + Number(client.activeTerminals || 0), 0);
  const blockedClients = clients.filter((client) => client.status !== "Ativo" && client.status !== "Homologacao").length;
  const expiredLicenses = clients.filter((client) => licenseStatus(client).expired).length;
  const firstClient = clients[0];

  byId("app").innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <div class="top-left">
          ${brandMarkup()}
          <div>
            <div class="company">Central SaaS Pegma Plus</div>
          <small>${providerUser?.name || "Administrador"} | Licencas | Terminais | Clientes | ${apiOnline ? "API online" : "modo local"}</small>
          </div>
        </div>
        <div class="top-right">
          <button class="btn central-top-action" id="backup-all-clients" type="button">Backup de todos os clientes</button>
          <label class="btn central-top-action" for="restore-all-clients">Restaurar backup geral</label>
          <input id="restore-all-clients" type="file" accept=".json,application/json" hidden />
          <button class="btn central-top-action" id="open-audit" type="button">Auditoria</button>
          <a class="btn central-top-action" href="./index.html">Abrir sistema cliente</a>
          <button class="btn central-top-action" id="central-logout">Sair</button>
        </div>
      </header>
      <section class="content">
        <section class="panel">
          <div class="panel-head">
            <h2>Central SaaS do provedor</h2>
            <button class="btn primary" id="save-tenant">Cadastrar cliente</button>
          </div>
          <div class="panel-body grid">
            <div class="grid four">
              <div class="kpi"><small>Clientes ativos</small><strong>${activeClients}</strong></div>
              <div class="kpi"><small>Terminais liberados</small><strong>${terminals}</strong></div>
              <div class="kpi"><small>Terminais em uso</small><strong>${usedTerminals}</strong></div>
              <div class="kpi"><small>Persistencia</small><strong>${providerHealth?.isolation || "Banco separado"}</strong></div>
              <div class="kpi"><small>Clientes bloqueados</small><strong>${blockedClients}</strong></div>
              <div class="kpi"><small>Licencas vencidas</small><strong>${expiredLicenses}</strong></div>
              <div class="kpi"><small>Sessoes ativas</small><strong>${providerMonitoring?.activeTenantSessions || 0}</strong></div>
              <div class="kpi"><small>Pendencias fiscais</small><strong>${(providerMonitoring?.clients || []).reduce((sum, client) => sum + client.pendingFiscal, 0)}</strong></div>
            </div>

            <div class="form-card">
              <h3>Novo cliente</h3>
              <div class="grid four">
                <div class="field"><label>Nome fantasia</label><input id="tenant-name" placeholder="Nome do cliente" /></div>
                <div class="field"><label>CNPJ/CPF</label><input id="tenant-doc" /></div>
                <div class="field"><label>Nome do usuario admin</label><input id="tenant-admin-name" placeholder="Administrador" /></div>
                <div class="field"><label>Login do usuario admin</label><input id="tenant-user" placeholder="admin@cliente.com" /></div>
                <div class="field"><label>Codigo do cliente</label><input id="tenant-code" placeholder="cliente-loja-01" /></div>
                <div class="field"><label>Senha inicial admin</label><input id="tenant-admin-password" type="password" minlength="8" placeholder="Minimo 8 caracteres" /></div>
              </div>
              <div class="grid four">
                <div class="field"><label>Plano</label><select id="tenant-plan"><option>Essencial</option><option>Profissional</option><option>Fiscal completo</option><option>Multiempresa</option></select></div>
                <div class="field"><label>Terminais permitidos</label><input id="tenant-terminals" type="number" min="1" value="1" /></div>
                <div class="field"><label>Prazo da contra-senha</label><select id="tenant-renewal-days"><option value="30">30 dias</option><option value="45">45 dias</option><option value="60">60 dias</option><option value="90">90 dias</option></select></div>
                <div class="field"><label>Status</label><select id="tenant-status"><option>Ativo</option><option>Bloqueado</option><option>Homologacao</option><option>Cancelado</option></select></div>
              </div>
              <div class="grid four">
                ${["PDV", "NF-e", "NFC-e", "NFS-e", "Estoque", "Financeiro", "Relatorios", "Compras"].map((module) => `<label class="check-row"><input class="tenant-module" type="checkbox" value="${module}" checked /> ${module}</label>`).join("")}
              </div>
              <div class="field"><label>Senha-base da licenca</label><input id="tenant-license-password" type="password" placeholder="Gerada automaticamente se ficar vazia" /></div>
            </div>

            <div class="form-card">
              <h3>Criar usuario do cliente</h3>
              <div class="grid five">
                <div class="field"><label>Cliente</label><select id="user-tenant">${clients.map((client) => `<option value="${client.tenantCode}">${client.tradeName}</option>`).join("")}</select></div>
                <div class="field"><label>Nome do usuario</label><input id="central-user-name" placeholder="Nome completo" /></div>
                <div class="field"><label>Login</label><input id="central-user-login" placeholder="usuario@cliente.com" /></div>
                <div class="field"><label>Senha</label><input id="central-user-password" type="password" minlength="8" placeholder="Minimo 8 caracteres" /></div>
                <div class="field"><label>Perfil</label><select id="central-user-role"><option>Administrador</option><option>Gerente</option><option>Caixa</option><option>Fiscal</option><option>Financeiro</option><option>Estoque</option><option>Vendedor</option></select></div>
              </div>
              <div class="grid four">${availablePermissions.map((permission) => `<label class="check-row"><input class="central-user-permission" type="checkbox" value="${permission}" /> ${permissionLabel(permission)}</label>`).join("")}</div>
              <button class="btn primary" id="create-client-user" type="button">Criar usuario no cliente</button>
            </div>
            <div class="form-card">
              <h3>Usuarios do cliente</h3>
              <div class="actions">
                <div class="field"><label>Cliente</label><select id="users-tenant">${clients.map((client) => `<option value="${client.tenantCode}">${client.tradeName}</option>`).join("")}</select></div>
                <button class="btn" id="load-client-users" type="button">Atualizar usuarios</button>
              </div>
              <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Permissoes</th><th>Status</th><th>Acao</th></tr></thead><tbody>${managedUsers.length ? managedUsers.map((user) => `<tr><td>${user.name}</td><td>${user.username}</td><td>${user.role}</td><td>${(user.permissions || []).map(permissionLabel).join(", ")}</td><td><span class="badge ${user.active ? "ok" : "danger"}">${user.active ? "Ativo" : "Bloqueado"}</span></td><td><button class="btn" data-reset-user="${user.id}">Redefinir senha</button> <button class="btn ${user.active ? "danger" : "primary"}" data-toggle-user="${user.id}">${user.active ? "Bloquear" : "Ativar"}</button></td></tr>`).join("") : `<tr><td colspan="6">Selecione um cliente e atualize a lista.</td></tr>`}</tbody></table></div>
            </div>

            <div class="form-card">
              <h3>Plano, modulos e terminais</h3>
              <div class="grid four">
                <div class="field"><label>Cliente</label><select id="manage-tenant">${clients.map((client) => `<option value="${client.tenantCode}">${client.tradeName}</option>`).join("")}</select></div>
                <div class="field"><label>Plano</label><select id="manage-plan"><option>Essencial</option><option>Profissional</option><option>Fiscal completo</option><option>Multiempresa</option></select></div>
                <div class="field"><label>Terminais permitidos</label><input id="manage-terminals" type="number" min="1" /></div>
                <div class="field"><label>Status</label><select id="manage-status"><option>Ativo</option><option>Bloqueado</option><option>Homologacao</option><option>Cancelado</option></select></div>
              </div>
              <div class="grid four">
                ${["PDV", "NF-e", "NFC-e", "NFS-e", "Estoque", "Financeiro", "Relatorios", "Compras"].map((module) => `<label class="check-row"><input class="manage-module" type="checkbox" value="${module}" /> ${module}</label>`).join("")}
              </div>
              <button class="btn primary" id="save-managed-tenant" type="button">Salvar liberacoes</button>
            </div>

            <div class="form-card">
              <h3>Gerador de contra-senha</h3>
              <div class="grid four">
                <div class="field"><label>Cliente</label><select id="license-client">${clients.map((client) => `<option value="${client.tenantCode}">${client.tradeName}</option>`).join("")}</select></div>
                <div class="field"><label>Senha informada pelo cliente</label><input id="license-challenge" value="${firstClient ? licenseChallenge(firstClient) : ""}" /></div>
                <div class="field"><label>Liberar por</label><select id="license-days"><option value="30">30 dias</option><option value="45">45 dias</option><option value="60">60 dias</option><option value="90">90 dias</option></select></div>
                <div class="field"><label>Contra-senha gerada</label><input id="license-counter-result" readonly placeholder="Clique em gerar" /></div>
              </div>
              <div class="actions">
                <button class="btn primary" id="generate-counter" type="button">Gerar contra-senha</button>
                <button class="btn" id="expire-license" type="button">Simular vencimento</button>
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <thead><tr><th>Codigo</th><th>Cliente</th><th>Documento</th><th>Plano</th><th>Terminais</th><th>Em uso</th><th>Licenca ate</th><th>Renova</th><th>Admin</th><th>Modulos</th><th>Status</th><th>Sessoes</th><th>Banco</th><th>Acao</th></tr></thead>
                <tbody>${clients.map((client) => {
                  const license = licenseStatus(client);
                  const sessions = (client.activeSessions || []).map((session) => `${session.user} - ${session.terminalName || "terminal"}`).join("<br>") || "-";
                  const statusAction = client.status === "Ativo" ? "Bloquear" : "Ativar";
                  return `<tr><td>${client.tenantCode}</td><td>${client.tradeName}</td><td>${client.document}</td><td>${client.plan}</td><td>${client.maxTerminals}</td><td>${client.activeTerminals}</td><td><span class="badge ${license.expired ? "danger" : license.warning ? "warn" : "ok"}">${client.licenseExpiresAt}</span></td><td>${client.renewalDays} dias</td><td>${client.adminUser}</td><td>${(client.modules || []).join(", ")}</td><td><span class="badge ${client.status === "Ativo" ? "ok" : "warn"}">${client.status}</span></td><td>${sessions}</td><td>isolado</td><td><button class="btn" data-backup="${client.tenantCode}">Backup</button> <button class="btn" data-clear="${client.tenantCode}">Liberar terminais</button> <button class="btn ${client.status === "Ativo" ? "danger" : "primary"}" data-status="${client.tenantCode}">${statusAction}</button></td></tr>`;
                }).join("")}</tbody>
              </table>
            </div>
            <div class="form-card">
              <h3>Monitoramento operacional</h3>
              <div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Sessoes</th><th>Backup</th><th>Fiscal pendente</th><th>Erros</th><th>Atrasados</th><th>Estoque minimo</th><th>Prontidao</th><th>Fechado ate</th><th>Atualizacao</th></tr></thead><tbody>${(providerMonitoring?.clients || []).map((client) => `<tr><td>${client.tradeName}</td><td>${client.sessions}</td><td>${client.lastBackup || "Pendente"}</td><td>${client.pendingFiscal}</td><td>${client.fiscalErrors}</td><td>${client.overdueTitles || 0}</td><td>${client.lowStock || 0}</td><td>${client.readiness || "-"}</td><td>${client.closedThrough || "-"}</td><td>${client.updatedAt ? new Date(client.updatedAt).toLocaleString("pt-BR") : "-"}</td></tr>`).join("")}</tbody></table></div>
            </div>
          </div>
        </section>
      </section>
    </main>
  `;

  bind();
}

function renderAudit() {
  byId("app").innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <div class="top-left">
          ${brandMarkup()}
          <div>
            <div class="company">Central SaaS Pegma Plus</div>
            <small>Auditoria administrativa</small>
          </div>
        </div>
        <div class="top-right">
          <button class="btn central-top-action" id="close-audit" type="button">Voltar para a Central</button>
          <a class="btn central-top-action" href="./index.html">Abrir sistema cliente</a>
          <button class="btn central-top-action" id="central-logout">Sair</button>
        </div>
      </header>
      <section class="content">
        <section class="panel">
          <div class="panel-head"><h2>Auditoria da Central SaaS</h2></div>
          <div class="panel-body">
            <div class="table-wrap"><table><thead><tr><th>Data</th><th>Administrador</th><th>Acao</th><th>Detalhe</th><th>IP</th></tr></thead><tbody>${(state.provider.auditLogs || []).map((log) => `<tr><td>${new Date(log.date).toLocaleString("pt-BR")}</td><td>${log.username}</td><td>${log.action}</td><td>${log.detail}</td><td>${log.ipAddress || "-"}</td></tr>`).join("")}</tbody></table></div>
          </div>
        </section>
      </section>
    </main>`;
  byId("central-logout").addEventListener("click", logoutCentral);
  byId("close-audit").addEventListener("click", () => {
    centralView = "main";
    render();
  });
}

function bind() {
  byId("central-logout").addEventListener("click", logoutCentral);
  byId("backup-all-clients").addEventListener("click", downloadAllClientsBackup);
  byId("restore-all-clients").addEventListener("change", restoreAllClientsBackup);
  byId("open-audit").addEventListener("click", () => {
    centralView = "audit";
    render();
  });
  byId("save-tenant").addEventListener("click", saveTenant);
  byId("create-client-user").addEventListener("click", createClientUser);
  byId("load-client-users").addEventListener("click", loadClientUsers);
  byId("users-tenant").addEventListener("change", loadClientUsers);
  byId("manage-tenant").addEventListener("change", fillManagedTenant);
  byId("save-managed-tenant").addEventListener("click", saveManagedTenant);
  byId("generate-counter").addEventListener("click", generateCounter);
  byId("expire-license").addEventListener("click", expireLicense);
  byId("license-client").addEventListener("change", () => {
    const tenant = state.provider.clients.find((client) => client.tenantCode === byId("license-client").value);
    if (!tenant) return;
    byId("license-challenge").value = licenseChallenge(tenant);
    byId("license-days").value = String(tenant.renewalDays || 30);
    byId("license-counter-result").value = "";
  });
  document.querySelectorAll("[data-backup]").forEach((button) => {
    button.addEventListener("click", () => downloadTenantBackup(button.dataset.backup));
  });
  document.querySelectorAll("[data-clear]").forEach((button) => {
    button.addEventListener("click", () => clearTenantSessions(button.dataset.clear));
  });
  document.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => toggleTenantStatus(button.dataset.status));
  });
  document.querySelectorAll("[data-toggle-user]").forEach((button) => {
    button.addEventListener("click", () => toggleClientUser(Number(button.dataset.toggleUser)));
  });
  document.querySelectorAll("[data-reset-user]").forEach((button) => {
    button.addEventListener("click", () => resetClientUserPassword(Number(button.dataset.resetUser)));
  });
  fillManagedTenant();
}

function fillManagedTenant() {
  const tenant = state.provider.clients.find((client) => client.tenantCode === byId("manage-tenant").value);
  if (!tenant) return;
  byId("manage-plan").value = tenant.plan;
  byId("manage-terminals").value = tenant.maxTerminals;
  byId("manage-status").value = tenant.status;
  document.querySelectorAll(".manage-module").forEach((input) => {
    input.checked = (tenant.modules || []).includes(input.value);
  });
}

async function saveManagedTenant() {
  const tenant = state.provider.clients.find((client) => client.tenantCode === byId("manage-tenant").value);
  if (!tenant || !apiOnline) return;
  const payload = {
    plan: byId("manage-plan").value,
    maxTerminals: Number(byId("manage-terminals").value || 1),
    status: byId("manage-status").value,
    modules: Array.from(document.querySelectorAll(".manage-module:checked")).map((input) => input.value)
  };
  const result = await api(`/api/provider/tenant/${tenant.tenantCode}`, { method: "POST", body: JSON.stringify(payload) });
  Object.assign(tenant, result.tenant);
  save();
  render();
}

async function saveTenant() {
  const tradeName = byId("tenant-name").value || "Cliente sem nome";
  const tenantCode = normalizeTenantCode(byId("tenant-code").value || tradeName);
  if (state.provider.clients.some((client) => client.tenantCode === tenantCode)) {
    alert("Ja existe um cliente com esse codigo.");
    return;
  }
  const renewalDays = Number(byId("tenant-renewal-days").value || 30);
  const payload = {
    tradeName,
    document: byId("tenant-doc").value,
    tenantCode,
    plan: byId("tenant-plan").value,
    maxTerminals: Number(byId("tenant-terminals").value || 1),
    activeTerminals: 0,
    renewalDays,
    licensePassword: byId("tenant-license-password").value,
    status: byId("tenant-status").value,
    adminName: byId("tenant-admin-name").value || "Administrador",
    adminUser: byId("tenant-user").value || `admin@${tenantCode}.local`,
    adminPassword: byId("tenant-admin-password").value,
    modules: Array.from(document.querySelectorAll(".tenant-module:checked")).map((input) => input.value)
  };
  try {
    const tenant = await api("/api/tenants", { method: "POST", body: JSON.stringify(payload) });
    state.provider.clients.push(tenant);
  } catch (error) {
    alert("Nao foi possivel cadastrar pela API agora. Tente novamente.");
    return;
  }
  render();
}

async function createClientUser() {
  const tenantCode = byId("user-tenant").value;
  const permissions = [...document.querySelectorAll(".central-user-permission:checked")].map((input) => input.value);
  const payload = {
    name: byId("central-user-name").value || byId("central-user-login").value,
    username: byId("central-user-login").value,
    password: byId("central-user-password").value,
    role: byId("central-user-role").value,
    permissions: permissions.length ? permissions : undefined
  };
  if (!tenantCode || !payload.username || !payload.password) {
    alert("Informe cliente, login e senha.");
    return;
  }
  if (!apiOnline) {
    alert("Criar usuario pela Central SaaS exige API online.");
    return;
  }
  try {
    await api(`/api/provider/tenant/${tenantCode}/users`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    alert("Usuario criado no banco isolado do cliente.");
    byId("users-tenant").value = tenantCode;
    await loadClientUsers();
  } catch {
    alert("Nao foi possivel criar o usuario. Verifique se o login ja existe.");
  }
}

async function loadClientUsers() {
  const tenantCode = byId("users-tenant")?.value || byId("user-tenant")?.value;
  if (!tenantCode || !apiOnline) return;
  try {
    const result = await api(`/api/provider/tenant/${tenantCode}/users`);
    managedUsers = result.users || [];
    render();
    byId("users-tenant").value = tenantCode;
  } catch (error) {
    alert(`Usuarios nao carregados: ${error.message}`);
  }
}

async function toggleClientUser(userId) {
  const tenantCode = byId("users-tenant").value;
  const user = managedUsers.find((item) => Number(item.id) === Number(userId));
  if (!tenantCode || !user) return;
  try {
    await api(`/api/provider/tenant/${tenantCode}/users/${user.id}`, { method: "POST", body: JSON.stringify({ active: !user.active }) });
    await loadClientUsers();
  } catch (error) {
    alert(`Usuario nao atualizado: ${error.message}`);
  }
}

async function resetClientUserPassword(userId) {
  const tenantCode = byId("users-tenant").value;
  const user = managedUsers.find((item) => Number(item.id) === Number(userId));
  if (!tenantCode || !user) return;
  const password = prompt(`Nova senha para ${user.username} (minimo 8 caracteres):`);
  if (!password) return;
  try {
    await api(`/api/provider/tenant/${tenantCode}/users/${user.id}`, { method: "POST", body: JSON.stringify({ password }) });
    alert("Senha redefinida. O usuario ja pode acessar com a nova senha.");
  } catch (error) {
    alert(`Senha nao redefinida: ${error.message}`);
  }
}

async function generateCounter() {
  const tenant = state.provider.clients.find((client) => client.tenantCode === byId("license-client").value);
  if (!tenant) return;
  const challenge = byId("license-challenge").value.trim().toUpperCase();
  const days = Number(byId("license-days").value || tenant.renewalDays || 30);
  try {
    const result = await api("/api/licenses/counter", {
      method: "POST",
      body: JSON.stringify({ tenantCode: tenant.tenantCode, challenge, days })
    });
    tenant.renewalDays = result.days;
    byId("license-counter-result").value = result.counterPassword;
  } catch {
    alert("Nao foi possivel gerar a contra-senha. Verifique a conexao com a Central.");
  }
}

async function expireLicense() {
  const tenant = state.provider.clients.find((client) => client.tenantCode === byId("license-client").value);
  if (!tenant) return;
  try {
    await api("/api/licenses/expire", {
      method: "POST",
      body: JSON.stringify({ tenantCode: tenant.tenantCode })
    });
    tenant.licenseExpiresAt = addDays(today(), -1);
    save();
    render();
  } catch {
    alert("Nao foi possivel expirar a licenca. Verifique a conexao com a Central.");
  }
}

async function downloadTenantBackup(tenantCode) {
  if (!apiOnline) {
    alert("Backup do banco separado exige a API online.");
    return;
  }
  try {
    const snapshot = await api(`/api/tenant/${tenantCode}/backup`);
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup-${tenantCode}-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  } catch {
    alert("Nao foi possivel gerar o backup deste cliente.");
  }
}

async function downloadAllClientsBackup() {
  if (!apiOnline) {
    alert("O backup geral exige conexao com o servidor.");
    return;
  }
  const button = byId("backup-all-clients");
  button.disabled = true;
  button.textContent = "Gerando backup...";
  try {
    const backup = await api("/api/provider/backup-all");
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup-geral-pegmaplus-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    alert(`Backup concluido. ${backup.totalClients} clientes, XMLs e documentos fiscais foram incluidos.`);
  } catch (error) {
    alert(`Nao foi possivel gerar o backup geral: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Backup de todos os clientes";
  }
}

async function restoreAllClientsBackup(event) {
  const file = event.target.files?.[0];
  if (!file || !apiOnline) return;
  try {
    const backup = JSON.parse(await file.text());
    if (backup.type !== "backup-geral-central-saas" || !Array.isArray(backup.clients)) throw new Error("Arquivo de backup geral invalido.");
    if (!confirm(`Restaurar os dados e arquivos fiscais de ${backup.clients.length} clientes?`)) return;
    const result = await api("/api/provider/restore-all", { method: "POST", body: JSON.stringify(backup) });
    alert(`Restauracao concluida: ${result.totalClients} clientes e ${result.restoredFiles} arquivos fiscais.`);
    await boot();
  } catch (error) {
    alert(`Nao foi possivel restaurar o backup geral: ${error.message}`);
  } finally {
    event.target.value = "";
  }
}

async function clearTenantSessions(tenantCode) {
  const tenant = state.provider.clients.find((client) => client.tenantCode === tenantCode);
  if (!tenant) return;
  if (!apiOnline) return;
  await api(`/api/provider/tenant/${tenantCode}/sessions`, { method: "DELETE" });
  tenant.activeSessions = [];
  tenant.activeTerminals = 0;
  save();
  render();
}

async function toggleTenantStatus(tenantCode) {
  const tenant = state.provider.clients.find((client) => client.tenantCode === tenantCode);
  if (!tenant) return;
  tenant.status = tenant.status === "Ativo" ? "Bloqueado" : "Ativo";
  await api(`/api/provider/tenant/${tenantCode}`, { method: "POST", body: JSON.stringify({ status: tenant.status }) });
  save();
  render();
}

boot();

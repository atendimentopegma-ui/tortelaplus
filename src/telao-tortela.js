const displayParams = new URLSearchParams(location.search);
const displayTenantCode = displayParams.get("unidade") || "cliente-exemplo";
const displayTerminalToken = displayParams.get("terminalToken") || displayParams.get("token") || displayParams.get("limpar") || "";
const displayApiBase = location.protocol === "file:" ? "http://localhost:4173" : "";

const displayMoney = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const displayEscape = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

async function loadDisplayOrders() {
  const query = new URLSearchParams({ unidade: displayTenantCode });
  if (displayTerminalToken) query.set("terminalToken", displayTerminalToken);
  const response = await fetch(`${displayApiBase}/api/public/kiosk/orders?${query.toString()}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

function ticket(order) {
  return String(order.ticketNumber || order.id || "").padStart(3, "0");
}

function orderCard(order) {
  return `
    <div class="display-ticket">
      <div>
        <span>Senha</span>
        <strong>${ticket(order)}</strong>
      </div>
      <small>${displayEscape(order.status || "Preparando")}</small>
    </div>
  `;
}

function renderDisplay(payload) {
  const orders = payload.orders || [];
  const ready = orders.filter((order) => order.status === "Pronto");
  const preparing = orders.filter((order) => !["Pronto", "Entregue", "Cancelado"].includes(order.status));
  const nextReady = ready[0];
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("display-app").innerHTML = `
    <main class="display-shell">
      <header class="display-header">
        <div class="display-brand">
          <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
          <div>
            <span>Telao de retirada</span>
            <h1>${displayEscape(payload.unit || "Tortela")}</h1>
          </div>
        </div>
        <div class="display-summary">
          <div><span>Prontos</span><strong>${ready.length}</strong></div>
          <div><span>Em preparo</span><strong>${preparing.length}</strong></div>
        </div>
        <div class="display-clock">
          <span>Atualizado</span>
          <strong>${now}</strong>
        </div>
      </header>
      <section class="display-callout">
        <div class="display-next">
          <span>Proxima retirada</span>
          <strong>${nextReady ? ticket(nextReady) : "---"}</strong>
        </div>
        <div class="display-message">
          <span>${nextReady ? "Pedido pronto" : "Aguardando preparo"}</span>
          <p>${nextReady ? "Retire seu pedido no balcao." : "Quando seu pedido ficar pronto, a senha aparece em destaque aqui."}</p>
        </div>
      </section>
      <section class="display-grid">
        <div class="display-column ready">
          <h2>Prontos <span>${ready.length}</span></h2>
          <div class="display-list">${ready.map(orderCard).join("") || `<p>Aguardando pedidos prontos.</p>`}</div>
        </div>
        <div class="display-column preparing">
          <h2>Em preparo <span>${preparing.length}</span></h2>
          <div class="display-list">${preparing.map(orderCard).join("") || `<p>Nenhum pedido em preparo.</p>`}</div>
        </div>
      </section>
    </main>
  `;
}

async function refreshDisplay() {
  try {
    renderDisplay(await loadDisplayOrders());
  } catch (error) {
    const localFileHint = location.protocol === "file:" ? "Abra pelo servidor local do sistema, nao direto pelo arquivo." : error.message;
    document.getElementById("display-app").innerHTML = `<main class="display-shell"><section class="display-error"><h1>Telao indisponivel</h1><p>${displayEscape(localFileHint)}</p></section></main>`;
  }
}

refreshDisplay();
setInterval(refreshDisplay, 5000);

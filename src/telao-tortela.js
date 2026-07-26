const displayParams = new URLSearchParams(location.search);
const displayTenantCode = displayParams.get("unidade") || "cliente-exemplo";

const displayMoney = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const displayEscape = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

async function loadDisplayOrders() {
  const response = await fetch(`/api/public/kiosk/orders?unidade=${encodeURIComponent(displayTenantCode)}`);
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
      <strong>${ticket(order)}</strong>
      <span>${displayEscape(order.status || "Preparando")}</span>
      <small>${displayMoney(order.total || 0)}</small>
    </div>
  `;
}

function renderDisplay(payload) {
  const orders = payload.orders || [];
  const ready = orders.filter((order) => order.status === "Pronto");
  const preparing = orders.filter((order) => !["Pronto", "Entregue", "Cancelado"].includes(order.status));
  document.getElementById("display-app").innerHTML = `
    <main class="display-shell">
      <header class="display-header">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <div>
          <span>Pedidos do totem</span>
          <h1>${displayEscape(payload.unit || "Tortela")}</h1>
        </div>
      </header>
      <section class="display-grid">
        <div class="display-column preparing">
          <h2>Em preparo</h2>
          <div class="display-list">${preparing.map(orderCard).join("") || `<p>Nenhum pedido em preparo.</p>`}</div>
        </div>
        <div class="display-column ready">
          <h2>Pronto</h2>
          <div class="display-list">${ready.map(orderCard).join("") || `<p>Aguardando pedidos prontos.</p>`}</div>
        </div>
      </section>
    </main>
  `;
}

async function refreshDisplay() {
  try {
    renderDisplay(await loadDisplayOrders());
  } catch (error) {
    document.getElementById("display-app").innerHTML = `<main class="display-shell"><div class="display-column"><h1>Telao indisponivel</h1><p>${displayEscape(error.message)}</p></div></main>`;
  }
}

refreshDisplay();
setInterval(refreshDisplay, 5000);

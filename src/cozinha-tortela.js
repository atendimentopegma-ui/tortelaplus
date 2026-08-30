const kitchenParams = new URLSearchParams(location.search);
const kitchenTenantCode = kitchenParams.get("unidade") || "cliente-exemplo";
const kitchenTerminalToken = kitchenParams.get("terminalToken") || kitchenParams.get("token") || kitchenParams.get("limpar") || "";
const kitchenApp = document.getElementById("kitchen-app");
const kitchenApiBase = location.protocol === "file:" ? "http://localhost:4173" : "";

const kitchenMoney = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const kitchenEscape = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

async function kitchenApi(path, options = {}) {
  const response = await fetch(`${kitchenApiBase}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

function ticket(order) {
  return String(order.ticketNumber || order.id || "").padStart(3, "0");
}

function minutesSince(dateValue) {
  const date = new Date(dateValue || Date.now());
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  return minutes <= 1 ? "agora" : `${minutes} min`;
}

function orderActions(order) {
  if (order.status === "Pronto") {
    return `<button class="kitchen-action done" data-status-order="${order.id}" data-status="Entregue">Entregar pedido</button>`;
  }
  if (order.status === "Entregue" || order.status === "Cancelado") {
    return `<span class="kitchen-finished">Finalizado</span>`;
  }
  return `
    <button class="kitchen-action ready" data-status-order="${order.id}" data-status="Pronto">Marcar pronto</button>
    <button class="kitchen-action hold" data-status-order="${order.id}" data-status="Preparando">Em preparo</button>
  `;
}

function orderCard(order) {
  const status = order.status || "Preparando";
  const items = (order.items || []).map((item) => `
    <li>
      <strong>${Number(item.qty || 0).toLocaleString("pt-BR")}x</strong>
      <span>${kitchenEscape(item.description)}</span>
    </li>
  `).join("");
  return `
    <article class="kitchen-order ${status === "Pronto" ? "is-ready" : ""}">
      <header>
        <div>
          <span>Senha</span>
          <strong>${ticket(order)}</strong>
        </div>
        <b>${kitchenEscape(status)}</b>
      </header>
      <ul>${items}</ul>
      <div class="kitchen-meta">
        <span>${minutesSince(order.createdAt)}</span>
        <span>${kitchenMoney(order.total || 0)}</span>
        <span>${kitchenEscape(order.payment || "PIX")} · ${kitchenEscape(order.paymentStatus || "Pendente")}</span>
      </div>
      <footer>
        <div>${orderActions(order)}</div>
      </footer>
    </article>
  `;
}

function renderKitchen(payload) {
  const orders = (payload.orders || []).filter((order) => !["Entregue", "Cancelado"].includes(order.status));
  const ready = orders.filter((order) => order.status === "Pronto");
  const preparing = orders.filter((order) => order.status !== "Pronto");
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  kitchenApp.innerHTML = `
    <main class="kitchen-shell">
      <header class="kitchen-header">
        <div class="kitchen-brand">
          <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
          <div>
            <span>Cozinha do totem</span>
            <h1>${kitchenEscape(payload.unit || "Tortela")}</h1>
          </div>
        </div>
        <div class="kitchen-clock">
          <span>Atualizado</span>
          <strong>${now}</strong>
        </div>
        <button id="kitchen-refresh">Atualizar</button>
      </header>
      <section class="kitchen-hero">
        <div>
          <span>Cozinha do totem</span>
          <h2>Prepare, marque pronto e entregue pela senha.</h2>
        </div>
        <div><small>Em preparo</small><strong>${preparing.length}</strong></div>
        <div><small>Prontos</small><strong>${ready.length}</strong></div>
        <div><small>Total aberto</small><strong>${orders.length}</strong></div>
      </section>
      <section class="kitchen-columns">
        <div>
          <h2>Preparar agora</h2>
          <div class="kitchen-list">${preparing.map(orderCard).join("") || `<p>Nenhum pedido em preparo.</p>`}</div>
        </div>
        <div>
          <h2>Prontos para entrega</h2>
          <div class="kitchen-list">${ready.map(orderCard).join("") || `<p>Nenhum pedido pronto.</p>`}</div>
        </div>
      </section>
    </main>
  `;
}

async function loadKitchen() {
  try {
    const query = new URLSearchParams({ unidade: kitchenTenantCode });
    if (kitchenTerminalToken) query.set("terminalToken", kitchenTerminalToken);
    const payload = await kitchenApi(`/api/public/kiosk/orders?${query.toString()}`);
    renderKitchen(payload);
  } catch (error) {
    const localFileHint = location.protocol === "file:" ? "Abra pelo servidor local do sistema, nao direto pelo arquivo." : error.message;
    kitchenApp.innerHTML = `<main class="kitchen-shell"><section class="kitchen-error"><h1>Cozinha indisponivel</h1><p>${kitchenEscape(localFileHint)}</p><button id="kitchen-refresh">Tentar novamente</button></section></main>`;
  }
}

async function updateKitchenOrder(orderId, status) {
  await kitchenApi("/api/public/kiosk/orders/status", {
    method: "POST",
    body: JSON.stringify({ tenantCode: kitchenTenantCode, terminalToken: kitchenTerminalToken, orderId, status })
  });
  await loadKitchen();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.id === "kitchen-refresh") return loadKitchen();
  if (button.dataset.statusOrder) return updateKitchenOrder(Number(button.dataset.statusOrder), button.dataset.status).catch((error) => alert(error.message));
});

loadKitchen();
setInterval(loadKitchen, 5000);

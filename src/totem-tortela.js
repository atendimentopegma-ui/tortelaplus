const params = new URLSearchParams(location.search);
const tenantCode = params.get("unidade") || "cliente-exemplo";
let catalog = { products: [], nearest: null };
let cart = [];
let step = "menu";
let paymentMethod = "PIX";
let customerDocument = "";
let lastOrder = null;
let activeCategory = "Todos";

const byId = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

function categoryFor(product) {
  const text = `${product.description || ""} ${product.unit || ""}`.toLowerCase();
  if (text.includes("bebida") || text.includes("suco") || text.includes("refri") || text.includes("milk")) return "Bebidas";
  if (text.includes("combo") || text.includes("kit")) return "Combos";
  if (text.includes("bolo")) return "Bolos";
  return "Tortas";
}

function addToCart(productId) {
  const product = catalog.products.find((item) => Number(item.id) === Number(productId));
  if (!product) return;
  const current = cart.find((item) => Number(item.productId) === Number(product.id));
  if (current) current.qty += 1;
  else cart.push({ productId: product.id, description: product.description, price: Number(product.price || 0), qty: 1 });
  render();
}

function changeQty(productId, delta) {
  const item = cart.find((row) => Number(row.productId) === Number(productId));
  if (!item) return;
  item.qty += delta;
  cart = cart.filter((row) => row.qty > 0);
  render();
}

function total() {
  return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
}

function productCard(product) {
  const icon = categoryFor(product) === "Bebidas" ? "BEB" : categoryFor(product) === "Combos" ? "KIT" : "TP";
  return `
    <button class="kiosk-product" data-add="${product.id}">
      <span class="kiosk-product-icon">${icon}</span>
      <strong>${escapeHtml(product.description)}</strong>
      <small>${escapeHtml(categoryFor(product))}</small>
      <b>${money(product.price)}</b>
    </button>
  `;
}

function cartList() {
  if (!cart.length) return `<div class="kiosk-empty">Toque em um produto para montar seu pedido.</div>`;
  return cart.map((item) => `
    <div class="kiosk-cart-row">
      <div><strong>${escapeHtml(item.description)}</strong><small>${money(item.price)}</small></div>
      <div class="kiosk-stepper">
        <button data-qty="${item.productId}" data-delta="-1">-</button>
        <span>${item.qty}</span>
        <button data-qty="${item.productId}" data-delta="1">+</button>
      </div>
    </div>
  `).join("");
}

function renderMenu() {
  const categories = ["Todos", ...new Set(catalog.products.map(categoryFor))];
  const visibleProducts = activeCategory === "Todos" ? catalog.products : catalog.products.filter((product) => categoryFor(product) === activeCategory);
  return `
    <main class="kiosk-shell">
      <section class="kiosk-hero">
        <div class="kiosk-brand"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela" /></div>
        <span>Autoatendimento Tortela</span>
        <h1>Escolha, pague e acompanhe sua senha no telao.</h1>
        <p>${escapeHtml(catalog.nearest?.tradeName || "Loja Tortela local")}</p>
      </section>
      <section class="kiosk-menu">
        <div class="kiosk-category-row">${categories.map((category) => `<button class="${activeCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div>
        <div class="kiosk-products">${visibleProducts.map(productCard).join("") || `<div class="kiosk-empty">Nenhum produto liberado para esta categoria.</div>`}</div>
      </section>
      <aside class="kiosk-order">
        <h2>Seu pedido</h2>
        <div class="kiosk-cart-list">${cartList()}</div>
        <div class="kiosk-total"><span>Total</span><strong>${money(total())}</strong></div>
        <button class="kiosk-primary" id="go-payment" ${cart.length ? "" : "disabled"}>Finalizar pedido</button>
      </aside>
    </main>
  `;
}

function renderPayment() {
  return `
    <main class="kiosk-shell kiosk-payment-shell">
      <section class="kiosk-payment-card">
        <button class="kiosk-back" id="back-menu">Voltar</button>
        <h1>Como deseja pagar?</h1>
        <div class="kiosk-payment-methods">
          ${["PIX", "Debito", "Credito"].map((method) => `<button class="${paymentMethod === method ? "active" : ""}" data-payment="${method}">${method}</button>`).join("")}
        </div>
        <label class="kiosk-cpf">CPF do Clube Tortela
          <input id="kiosk-cpf" inputmode="numeric" value="${escapeHtml(customerDocument)}" placeholder="Opcional para NFC-e" />
        </label>
        <div class="kiosk-review">${cartList()}</div>
        <div class="kiosk-total"><span>Total</span><strong>${money(total())}</strong></div>
        <button class="kiosk-primary" id="confirm-order">Gerar pedido e NFC-e</button>
      </section>
    </main>
  `;
}

function renderSuccess() {
  return `
    <main class="kiosk-success">
      <div class="kiosk-success-card">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Pedido recebido</span>
        <h1>${String(lastOrder?.ticketNumber || "").padStart(3, "0")}</h1>
        <p>Essa e a sua senha. Acompanhe no telao e retire quando aparecer como pronto.</p>
        <strong>${money(lastOrder?.total || 0)} - ${escapeHtml(lastOrder?.payment || paymentMethod)}</strong>
        <button class="kiosk-primary" id="new-order">Novo pedido</button>
      </div>
    </main>
  `;
}

function render() {
  byId("kiosk-app").innerHTML = step === "payment" ? renderPayment() : step === "success" ? renderSuccess() : renderMenu();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.add)));
  document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.category || "Todos";
    render();
  }));
  document.querySelectorAll("[data-qty]").forEach((button) => button.addEventListener("click", () => changeQty(button.dataset.qty, Number(button.dataset.delta || 0))));
  byId("go-payment")?.addEventListener("click", () => { step = "payment"; render(); });
  byId("back-menu")?.addEventListener("click", () => { step = "menu"; render(); });
  document.querySelectorAll("[data-payment]").forEach((button) => button.addEventListener("click", () => {
    paymentMethod = button.dataset.payment;
    customerDocument = byId("kiosk-cpf")?.value || "";
    render();
  }));
  byId("confirm-order")?.addEventListener("click", submitOrder);
  byId("new-order")?.addEventListener("click", () => {
    cart = [];
    lastOrder = null;
    customerDocument = "";
    paymentMethod = "PIX";
    step = "menu";
    render();
  });
}

async function submitOrder() {
  customerDocument = byId("kiosk-cpf")?.value || "";
  try {
    const result = await api("/api/public/kiosk/orders", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        paymentMethod,
        customerDocument,
        items: cart.map((item) => ({ productId: item.productId, qty: item.qty }))
      })
    });
    lastOrder = result;
    step = "success";
    render();
  } catch (error) {
    alert(error.message);
  }
}

async function loadCatalog() {
  catalog = await api(`/api/public/store/catalog?unidade=${encodeURIComponent(tenantCode)}`);
  render();
}

loadCatalog().catch((error) => {
  byId("kiosk-app").innerHTML = `<main class="kiosk-success"><div class="kiosk-success-card"><h1>Totem indisponivel</h1><p>${escapeHtml(error.message)}</p></div></main>`;
});

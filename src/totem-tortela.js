const params = new URLSearchParams(location.search);
const tenantCode = params.get("unidade") || "cliente-exemplo";

let catalog = { products: [], nearest: null };
let cart = [];
let screen = "welcome";
let activeCategory = "Todos";
let orderMode = "Retirar no balcao";
let paymentMethod = "PIX";
let customerDocument = "";
let selectedProduct = null;
let customDraft = {};
let lastOrder = null;

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

function productCategory(product) {
  const text = `${product.description || ""} ${product.unit || ""}`.toLowerCase();
  if (text.includes("bebida") || text.includes("suco") || text.includes("refri") || text.includes("milk")) return "Bebidas";
  if (text.includes("combo") || text.includes("kit")) return "Combos";
  if (text.includes("bolo")) return "Bolos";
  if (text.includes("promoc") || text.includes("oferta")) return "Ofertas";
  return "Tortas";
}

function categories() {
  return ["Todos", ...new Set(catalog.products.map(productCategory))];
}

function productImage(product, className = "kiosk-product-photo") {
  if (product.photo) return `<img class="${className}" src="${product.photo}" alt="${escapeHtml(product.description)}" />`;
  return `<div class="${className} kiosk-photo-fallback"><span>Tortela</span></div>`;
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function go(next) {
  screen = next;
  render();
}

function selectProduct(productId) {
  selectedProduct = catalog.products.find((item) => Number(item.id) === Number(productId));
  if (!selectedProduct) return;
  customDraft = {
    qty: 1,
    size: "Padrao",
    coverage: selectedProduct.hasCoverage ? (selectedProduct.coverageOptions || ["Tradicional"])[0] : "",
    extras: [],
    note: ""
  };
  go("customize");
}

function addCustomizedProduct() {
  if (!selectedProduct) return;
  const extrasTotal = customDraft.extras.length * 2;
  const sizeAddition = customDraft.size === "Grande" ? 4 : 0;
  const item = {
    productId: selectedProduct.id,
    description: selectedProduct.description,
    price: Number(selectedProduct.price || 0) + extrasTotal + sizeAddition,
    basePrice: Number(selectedProduct.price || 0),
    qty: Number(customDraft.qty || 1),
    coverage: customDraft.coverage || "",
    size: customDraft.size || "Padrao",
    extras: [...customDraft.extras],
    note: customDraft.note || ""
  };
  cart.push(item);
  selectedProduct = null;
  customDraft = {};
  go("upsell");
}

function changeCartQty(index, delta) {
  const item = cart[index];
  if (!item) return;
  item.qty += delta;
  cart = cart.filter((row) => row.qty > 0);
  render();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  render();
}

function progress(current) {
  const steps = ["Inicio", "Pedido", "Cardapio", "Carrinho", "Pagamento"];
  return `<div class="kiosk-progress">${steps.map((step, index) => `<span class="${index <= current ? "active" : ""}">${step}</span>`).join("")}</div>`;
}

function header(current = 0) {
  return `
    <header class="kiosk-top">
      <button class="kiosk-logo-button" data-screen="welcome"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela" /></button>
      ${progress(current)}
      <button class="kiosk-cart-pill" data-screen="cart">${cartCount()} itens<br><strong>${money(cartTotal())}</strong></button>
    </header>
  `;
}

function renderWelcome() {
  return `
    <main class="kiosk-stage kiosk-welcome kiosk-mcd-welcome">
      <section class="kiosk-mcd-panel">
        <div class="kiosk-mcd-top">
          <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
          <button type="button">Ajuda</button>
        </div>
        <div class="kiosk-mcd-title">
          <span>${escapeHtml(catalog.nearest?.tradeName || "Tortela")}</span>
          <h1>Onde voce vai saborear hoje?</h1>
        </div>
        <div class="kiosk-mcd-choice-grid">
          <button class="kiosk-mcd-choice" data-welcome-mode="Comer na loja">
            <span class="kiosk-mcd-icon">IN</span>
            <strong>Comer na loja</strong>
            <small>Pedido para consumir aqui</small>
          </button>
          <button class="kiosk-mcd-choice" data-welcome-mode="Retirar para viagem">
            <span class="kiosk-mcd-icon">OUT</span>
            <strong>Retirar / viagem</strong>
            <small>Pedido embalado para levar</small>
          </button>
        </div>
        <div class="kiosk-mcd-bottom">
          <button type="button">PT</button>
          <button type="button">EN</button>
          <button type="button">Acessibilidade</button>
        </div>
      </section>
    </main>
  `;
}

function renderOrderType() {
  return `
    <main class="kiosk-stage kiosk-choice-stage">
      ${header(1)}
      <section class="kiosk-choice-panel">
        <span>Como deseja receber?</span>
        <h1>Escolha o tipo de pedido</h1>
        <div class="kiosk-choice-grid">
          ${["Comer na loja", "Retirar no balcao", "Retirar para viagem"].map((mode) => `
            <button class="kiosk-choice ${orderMode === mode ? "active" : ""}" data-order-mode="${mode}">
              <strong>${mode}</strong>
              <small>${mode === "Comer na loja" ? "Para consumir agora" : mode === "Retirar no balcao" ? "Acompanhe sua senha" : "Embalado para levar"}</small>
            </button>
          `).join("")}
        </div>
        <button class="kiosk-mega-action" data-screen="loyalty">Continuar</button>
      </section>
    </main>
  `;
}

function renderLoyalty() {
  return `
    <main class="kiosk-stage kiosk-choice-stage">
      ${header(1)}
      <section class="kiosk-choice-panel">
        <span>Clube Tortela</span>
        <h1>Deseja identificar seu CPF?</h1>
        <label class="kiosk-input-label">CPF para NFC-e / Clube Tortela
          <input id="kiosk-cpf" inputmode="numeric" value="${escapeHtml(customerDocument)}" placeholder="Opcional" />
        </label>
        <div class="kiosk-action-row">
          <button class="kiosk-secondary-action" data-screen="menu">Continuar sem CPF</button>
          <button class="kiosk-mega-action" id="save-cpf">Entrar no cardapio</button>
        </div>
      </section>
    </main>
  `;
}

function productCard(product) {
  return `
    <article class="kiosk-menu-product">
      ${productImage(product)}
      <div>
        <small>${escapeHtml(productCategory(product))}</small>
        <h2>${escapeHtml(product.description)}</h2>
        <p>Produto preparado pela unidade Tortela selecionada.</p>
        <strong>${money(product.price)}</strong>
      </div>
      <button data-product="${product.id}">Adicionar</button>
    </article>
  `;
}

function renderMenu() {
  const visible = activeCategory === "Todos" ? catalog.products : catalog.products.filter((product) => productCategory(product) === activeCategory);
  return `
    <main class="kiosk-app">
      ${header(2)}
      <section class="kiosk-menu-layout">
        <nav class="kiosk-sidebar">
          ${categories().map((category) => `<button class="${activeCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}
        </nav>
        <section class="kiosk-menu-area">
          <div class="kiosk-menu-banner">
            <div><span>Cardapio Tortela</span><h1>${escapeHtml(activeCategory)}</h1></div>
            <strong>${visible.length} opcoes</strong>
          </div>
          <div class="kiosk-menu-grid">${visible.map(productCard).join("") || `<div class="kiosk-empty-state">Nenhum produto disponivel nesta categoria.</div>`}</div>
        </section>
        <aside class="kiosk-mini-cart">
          <h2>Meu pedido</h2>
          ${cartRows(false)}
          <div class="kiosk-total-line"><span>Total</span><strong>${money(cartTotal())}</strong></div>
          <button class="kiosk-mega-action" data-screen="cart" ${cart.length ? "" : "disabled"}>Ver carrinho</button>
        </aside>
      </section>
    </main>
  `;
}

function renderCustomize() {
  if (!selectedProduct) return renderMenu();
  const extras = ["Calda extra", "Granulado", "Cobertura premium", "Castanha"];
  return `
    <main class="kiosk-stage kiosk-customize">
      ${header(2)}
      <section class="kiosk-custom-card">
        <div class="kiosk-custom-media">${productImage(selectedProduct, "kiosk-custom-photo")}</div>
        <div class="kiosk-custom-form">
          <span>Personalizacao</span>
          <h1>${escapeHtml(selectedProduct.description)}</h1>
          <div class="kiosk-toggle-row">
            ${["Padrao", "Grande"].map((size) => `<button class="${customDraft.size === size ? "active" : ""}" data-size="${size}">${size}${size === "Grande" ? " + R$ 4,00" : ""}</button>`).join("")}
          </div>
          ${selectedProduct.hasCoverage ? `<label class="kiosk-input-label">Cobertura
            <select id="kiosk-coverage">${(selectedProduct.coverageOptions || ["Tradicional"]).map((option) => `<option ${customDraft.coverage === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>
          </label>` : ""}
          <div class="kiosk-extra-grid">
            ${extras.map((extra) => `<button class="${customDraft.extras.includes(extra) ? "active" : ""}" data-extra="${extra}">${extra}<small>+ R$ 2,00</small></button>`).join("")}
          </div>
          <label class="kiosk-input-label">Observacao
            <input id="kiosk-note" value="${escapeHtml(customDraft.note)}" placeholder="Ex.: sem castanha" />
          </label>
          <div class="kiosk-custom-footer">
            <div class="kiosk-stepper big">
              <button data-draft-qty="-1">-</button>
              <span>${customDraft.qty}</span>
              <button data-draft-qty="1">+</button>
            </div>
            <button class="kiosk-mega-action" id="add-custom">Adicionar ao pedido</button>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderUpsell() {
  const suggestions = catalog.products.filter((product) => ["Bebidas", "Combos", "Bolos"].includes(productCategory(product))).slice(0, 3);
  return `
    <main class="kiosk-stage kiosk-choice-stage">
      ${header(2)}
      <section class="kiosk-choice-panel">
        <span>Sugestoes Tortela</span>
        <h1>Deseja completar seu pedido?</h1>
        <div class="kiosk-upsell-grid">${suggestions.map((product) => `
          <button class="kiosk-upsell-card" data-product="${product.id}">
            ${productImage(product, "kiosk-upsell-photo")}
            <strong>${escapeHtml(product.description)}</strong>
            <small>${money(product.price)}</small>
          </button>
        `).join("") || `<p>Continue para revisar seu pedido.</p>`}</div>
        <div class="kiosk-action-row">
          <button class="kiosk-secondary-action" data-screen="menu">Adicionar mais itens</button>
          <button class="kiosk-mega-action" data-screen="cart">Ir para o carrinho</button>
        </div>
      </section>
    </main>
  `;
}

function cartRows(editable = true) {
  if (!cart.length) return `<div class="kiosk-empty-state">Seu carrinho esta vazio.</div>`;
  return `<div class="kiosk-cart-list">${cart.map((item, index) => `
    <div class="kiosk-cart-item">
      <div>
        <strong>${escapeHtml(item.description)}</strong>
        <small>${[item.size, item.coverage, ...(item.extras || [])].filter(Boolean).join(" - ") || "Padrao"}</small>
      </div>
      ${editable ? `<div class="kiosk-stepper"><button data-cart-qty="${index}" data-delta="-1">-</button><span>${item.qty}</span><button data-cart-qty="${index}" data-delta="1">+</button></div>` : `<span>${item.qty}x</span>`}
      <b>${money(item.price * item.qty)}</b>
      ${editable ? `<button class="kiosk-remove" data-remove="${index}">Remover</button>` : ""}
    </div>
  `).join("")}</div>`;
}

function renderCart() {
  return `
    <main class="kiosk-stage kiosk-cart-stage">
      ${header(3)}
      <section class="kiosk-cart-panel">
        <div class="kiosk-section-title"><span>Carrinho</span><h1>Confira seu pedido</h1></div>
        ${cartRows(true)}
        <div class="kiosk-total-line large"><span>Total</span><strong>${money(cartTotal())}</strong></div>
        <div class="kiosk-action-row">
          <button class="kiosk-secondary-action" data-screen="menu">Adicionar produtos</button>
          <button class="kiosk-mega-action" data-screen="review" ${cart.length ? "" : "disabled"}>Revisar pedido</button>
        </div>
      </section>
    </main>
  `;
}

function renderReview() {
  return `
    <main class="kiosk-stage kiosk-cart-stage">
      ${header(3)}
      <section class="kiosk-cart-panel">
        <div class="kiosk-section-title"><span>Revisao</span><h1>Antes do pagamento</h1></div>
        <div class="kiosk-review-meta">
          <strong>${escapeHtml(orderMode)}</strong>
          <strong>${customerDocument ? `CPF ${escapeHtml(customerDocument)}` : "Sem CPF informado"}</strong>
        </div>
        ${cartRows(false)}
        <div class="kiosk-total-line large"><span>Total</span><strong>${money(cartTotal())}</strong></div>
        <div class="kiosk-action-row">
          <button class="kiosk-secondary-action" data-screen="cart">Editar pedido</button>
          <button class="kiosk-mega-action" data-screen="payment">Ir para pagamento</button>
        </div>
      </section>
    </main>
  `;
}

function renderPayment() {
  return `
    <main class="kiosk-stage kiosk-payment-stage">
      ${header(4)}
      <section class="kiosk-payment-panel">
        <div class="kiosk-section-title"><span>Pagamento</span><h1>Escolha como pagar</h1></div>
        <div class="kiosk-pay-grid">
          ${["PIX", "Debito", "Credito"].map((method) => `<button class="${paymentMethod === method ? "active" : ""}" data-payment="${method}"><strong>${method}</strong><small>${method === "PIX" ? "QR Code" : "Cartao / aproximacao"}</small></button>`).join("")}
        </div>
        <div class="kiosk-total-line large"><span>Total</span><strong>${money(cartTotal())}</strong></div>
        <div class="kiosk-action-row">
          <button class="kiosk-secondary-action" data-screen="review">Voltar</button>
          <button class="kiosk-mega-action" id="confirm-order">Confirmar e gerar NFC-e</button>
        </div>
      </section>
    </main>
  `;
}

function renderSuccess() {
  return `
    <main class="kiosk-stage kiosk-done-stage">
      <section class="kiosk-done-card">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Pedido concluido</span>
        <h1>${String(lastOrder?.ticketNumber || "").padStart(3, "0")}</h1>
        <p>Seu pedido foi recebido. Acompanhe essa senha no telao e retire quando aparecer como pronto.</p>
        <div class="kiosk-status-track"><span class="active">Recebido</span><span class="active">Em preparo</span><span>Pronto</span></div>
        <strong>${money(lastOrder?.total || cartTotal())} - ${escapeHtml(lastOrder?.payment || paymentMethod)}</strong>
        <button class="kiosk-mega-action" id="new-order">Novo pedido</button>
      </section>
    </main>
  `;
}

function render() {
  const app = byId("kiosk-app");
  if (!app) return;
  app.innerHTML = screen === "welcome" ? renderWelcome()
    : screen === "orderType" ? renderOrderType()
      : screen === "loyalty" ? renderLoyalty()
        : screen === "menu" ? renderMenu()
          : screen === "customize" ? renderCustomize()
            : screen === "upsell" ? renderUpsell()
              : screen === "cart" ? renderCart()
                : screen === "review" ? renderReview()
                  : screen === "payment" ? renderPayment()
                    : renderSuccess();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => go(button.dataset.screen)));
  document.querySelectorAll("[data-welcome-mode]").forEach((button) => button.addEventListener("click", () => {
    orderMode = button.dataset.welcomeMode;
    go("loyalty");
  }));
  document.querySelectorAll("[data-order-mode]").forEach((button) => button.addEventListener("click", () => {
    orderMode = button.dataset.orderMode;
    render();
  }));
  byId("save-cpf")?.addEventListener("click", () => {
    customerDocument = byId("kiosk-cpf")?.value || "";
    go("menu");
  });
  document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.category || "Todos";
    render();
  }));
  document.querySelectorAll("[data-product]").forEach((button) => button.addEventListener("click", () => selectProduct(button.dataset.product)));
  document.querySelectorAll("[data-size]").forEach((button) => button.addEventListener("click", () => {
    customDraft.size = button.dataset.size;
    render();
  }));
  document.querySelectorAll("[data-extra]").forEach((button) => button.addEventListener("click", () => {
    const extra = button.dataset.extra;
    customDraft.extras = customDraft.extras.includes(extra) ? customDraft.extras.filter((item) => item !== extra) : [...customDraft.extras, extra];
    render();
  }));
  document.querySelectorAll("[data-draft-qty]").forEach((button) => button.addEventListener("click", () => {
    customDraft.qty = Math.max(1, Number(customDraft.qty || 1) + Number(button.dataset.draftQty || 0));
    render();
  }));
  byId("add-custom")?.addEventListener("click", () => {
    customDraft.coverage = byId("kiosk-coverage")?.value || customDraft.coverage || "";
    customDraft.note = byId("kiosk-note")?.value || "";
    addCustomizedProduct();
  });
  document.querySelectorAll("[data-cart-qty]").forEach((button) => button.addEventListener("click", () => changeCartQty(Number(button.dataset.cartQty), Number(button.dataset.delta || 0))));
  document.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => removeCartItem(Number(button.dataset.remove))));
  document.querySelectorAll("[data-payment]").forEach((button) => button.addEventListener("click", () => {
    paymentMethod = button.dataset.payment;
    render();
  }));
  byId("confirm-order")?.addEventListener("click", submitOrder);
  byId("new-order")?.addEventListener("click", () => {
    cart = [];
    selectedProduct = null;
    customDraft = {};
    lastOrder = null;
    paymentMethod = "PIX";
    screen = "welcome";
    render();
  });
}

async function submitOrder() {
  try {
    const result = await api("/api/public/kiosk/orders", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        paymentMethod,
        customerDocument,
        orderMode,
        items: cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          coverage: [item.size, item.coverage, ...(item.extras || [])].filter(Boolean).join(" - "),
          note: item.note
        }))
      })
    });
    lastOrder = result;
    go("success");
  } catch (error) {
    alert(error.message);
  }
}

async function loadCatalog() {
  catalog = await api(`/api/public/store/catalog?unidade=${encodeURIComponent(tenantCode)}`);
  render();
}

loadCatalog().catch((error) => {
  byId("kiosk-app").innerHTML = `<main class="kiosk-stage kiosk-done-stage"><section class="kiosk-done-card"><h1>Totem indisponivel</h1><p>${escapeHtml(error.message)}</p></section></main>`;
});

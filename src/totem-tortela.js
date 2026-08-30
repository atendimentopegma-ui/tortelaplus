const params = new URLSearchParams(location.search);
const tenantCode = params.get("unidade") || "cliente-exemplo";

const state = {
  catalog: { products: [], nearest: null },
  screen: "welcome",
  category: "Todos",
  orderMode: "",
  customerDocument: "",
  paymentMethod: "PIX",
  selectedProduct: null,
  draft: null,
  cart: [],
  lastOrder: null,
  loading: false
};

const app = document.getElementById("kiosk-app");
const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const cleanText = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
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

function unitName() {
  const name = String(state.catalog.nearest?.tradeName || "").trim();
  return !name || /cliente\s*exemplo/i.test(name) ? "Tortela" : name;
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
  return ["Todos", ...new Set(state.catalog.products.map(productCategory))];
}

function visibleProducts() {
  return state.category === "Todos"
    ? state.catalog.products
    : state.catalog.products.filter((product) => productCategory(product) === state.category);
}

function cartCount() {
  return state.cart.reduce((total, item) => total + Number(item.qty || 0), 0);
}

function cartTotal() {
  return state.cart.reduce((total, item) => total + Number(item.qty || 0) * Number(item.price || 0), 0);
}

function productPhoto(product, className = "tk-product-photo") {
  if (product.photo) {
    return `<img class="${className}" src="${cleanText(product.photo)}" alt="${cleanText(product.description)}" />`;
  }
  return `<div class="${className} tk-product-fallback"><span>Tortela</span></div>`;
}

function setScreen(screen) {
  state.screen = screen;
  render();
}

function shell(content, step = 0) {
  const steps = ["Inicio", "Tipo", "Cardapio", "Carrinho", "Pagamento"];
  return `
    <main class="tk-shell tk-screen-${state.screen}">
      <header class="tk-header">
        <button class="tk-logo" data-screen="welcome" aria-label="Voltar ao inicio">
          <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        </button>
        <div class="tk-progress" aria-label="Progresso do pedido">
          ${steps.map((label, index) => `<span class="${index <= step ? "is-active" : ""}">${cleanText(label)}</span>`).join("")}
        </div>
        <button class="tk-cart-button" data-screen="cart" aria-label="Abrir carrinho">
          <span>${cartCount()} itens</span>
          <strong>${money(cartTotal())}</strong>
        </button>
      </header>
      ${content}
    </main>
  `;
}

function renderWelcome() {
  return `
    <main class="tk-welcome">
      <section class="tk-welcome-panel">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Autoatendimento</span>
        <h1>Onde voce vai comer hoje?</h1>
        <p>Monte seu pedido na tela, pague e acompanhe sua senha no telao.</p>
        <div class="tk-mode-grid">
          <button data-mode="Comer na loja">
            <b>Comer aqui</b>
            <small>Pedido para consumir na loja</small>
          </button>
          <button data-mode="Retirar para viagem">
            <b>Levar viagem</b>
            <small>Pedido embalado para retirar</small>
          </button>
        </div>
      </section>
      <footer class="tk-welcome-footer">
        <button data-screen="loyalty">Comecar pedido</button>
        <small>${cleanText(unitName())}</small>
      </footer>
    </main>
  `;
}

function renderLoyalty() {
  return shell(`
    <section class="tk-panel tk-centered-panel">
      <span class="tk-eyebrow">Clube Tortela</span>
      <h1>Informe seu CPF?</h1>
      <p>Use para identificar o cliente no pedido. Voce tambem pode continuar sem CPF.</p>
      <label class="tk-field">
        <span>CPF</span>
        <input id="tk-cpf" inputmode="numeric" autocomplete="off" value="${cleanText(state.customerDocument)}" placeholder="Opcional" />
      </label>
      <div class="tk-actions">
        <button class="tk-secondary" data-screen="menu">Continuar sem CPF</button>
        <button class="tk-primary" id="tk-save-cpf">Ir para o cardapio</button>
      </div>
    </section>
  `, 1);
}

function renderMenu() {
  const products = visibleProducts();
  return shell(`
    <section class="tk-menu">
      <aside class="tk-categories">
        ${categories().map((category) => `<button class="${state.category === category ? "is-active" : ""}" data-category="${cleanText(category)}">${cleanText(category)}</button>`).join("")}
      </aside>
      <section class="tk-menu-board">
        <div class="tk-menu-title">
          <div>
            <span class="tk-eyebrow">Cardapio Tortela</span>
            <h1>${cleanText(state.category)}</h1>
          </div>
          <strong>${products.length} opcoes</strong>
        </div>
        <div class="tk-products">
          ${products.map(productCard).join("") || `<div class="tk-empty">Nenhum produto real liberado para venda no totem.</div>`}
        </div>
      </section>
      <button class="tk-bottom-cart" data-screen="cart" ${state.cart.length ? "" : "disabled"}>
        <span>${cartCount()} item(ns)</span>
        <b>${money(cartTotal())}</b>
        <strong>Ver pedido</strong>
      </button>
    </section>
  `, 2);
}

function productCard(product) {
  return `
    <article class="tk-product-card">
      ${productPhoto(product)}
      <div>
        <small>${cleanText(productCategory(product))}</small>
        <h2>${cleanText(product.description)}</h2>
        <strong>${money(product.price)}</strong>
      </div>
      <button data-product="${product.id}">Adicionar</button>
    </article>
  `;
}

function selectProduct(productId) {
  const product = state.catalog.products.find((item) => Number(item.id) === Number(productId));
  if (!product) return;
  state.selectedProduct = product;
  state.draft = {
    qty: 1,
    size: "Padrao",
    coverage: product.hasCoverage ? (product.coverageOptions || ["Tradicional"])[0] : "",
    extras: [],
    note: ""
  };
  setScreen("customize");
}

function renderCustomize() {
  const product = state.selectedProduct;
  if (!product || !state.draft) return renderMenu();
  const extras = ["Calda extra", "Granulado", "Cobertura premium", "Castanha"];
  return shell(`
    <section class="tk-custom">
      <div class="tk-custom-photo-wrap">${productPhoto(product, "tk-custom-photo")}</div>
      <div class="tk-custom-info">
        <span class="tk-eyebrow">Personalize</span>
        <h1>${cleanText(product.description)}</h1>
        <strong>${money(product.price)}</strong>
        <div class="tk-option-row">
          ${["Padrao", "Grande"].map((size) => `<button class="${state.draft.size === size ? "is-active" : ""}" data-size="${size}">${size}${size === "Grande" ? " + R$ 4,00" : ""}</button>`).join("")}
        </div>
        ${product.hasCoverage ? `
          <label class="tk-field">
            <span>Cobertura</span>
            <select id="tk-coverage">${(product.coverageOptions || ["Tradicional"]).map((option) => `<option ${state.draft.coverage === option ? "selected" : ""}>${cleanText(option)}</option>`).join("")}</select>
          </label>
        ` : ""}
        <div class="tk-extra-grid">
          ${extras.map((extra) => `<button class="${state.draft.extras.includes(extra) ? "is-active" : ""}" data-extra="${cleanText(extra)}">${cleanText(extra)}<small>+ R$ 2,00</small></button>`).join("")}
        </div>
        <label class="tk-field">
          <span>Observacao</span>
          <input id="tk-note" value="${cleanText(state.draft.note)}" placeholder="Ex.: sem castanha" />
        </label>
        <div class="tk-custom-footer">
          <div class="tk-stepper">
            <button data-draft-qty="-1">-</button>
            <b>${state.draft.qty}</b>
            <button data-draft-qty="1">+</button>
          </div>
          <button class="tk-primary" id="tk-add-product">Adicionar</button>
        </div>
      </div>
    </section>
  `, 2);
}

function addProductToCart() {
  const product = state.selectedProduct;
  const draft = state.draft;
  if (!product || !draft) return;
  const extrasTotal = draft.extras.length * 2;
  const sizeAddition = draft.size === "Grande" ? 4 : 0;
  state.cart.push({
    productId: product.id,
    description: product.description,
    qty: Number(draft.qty || 1),
    price: Number(product.price || 0) + extrasTotal + sizeAddition,
    size: draft.size,
    coverage: draft.coverage,
    extras: [...draft.extras],
    note: draft.note || ""
  });
  state.selectedProduct = null;
  state.draft = null;
  setScreen("cart");
}

function cartRows(editable = true) {
  if (!state.cart.length) return `<div class="tk-empty">Seu carrinho esta vazio.</div>`;
  return state.cart.map((item, index) => `
    <article class="tk-cart-row">
      <div>
        <h2>${cleanText(item.description)}</h2>
        <small>${[item.size, item.coverage, ...(item.extras || [])].filter(Boolean).join(" - ") || "Padrao"}</small>
      </div>
      ${editable ? `
        <div class="tk-stepper">
          <button data-cart-index="${index}" data-delta="-1">-</button>
          <b>${item.qty}</b>
          <button data-cart-index="${index}" data-delta="1">+</button>
        </div>
      ` : `<b>${item.qty}x</b>`}
      <strong>${money(item.price * item.qty)}</strong>
    </article>
  `).join("");
}

function renderCart() {
  return shell(`
    <section class="tk-panel tk-order-panel">
      <span class="tk-eyebrow">Meu pedido</span>
      <h1>Confira seu carrinho</h1>
      <div class="tk-cart-list">${cartRows(true)}</div>
      <div class="tk-total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
      <div class="tk-actions">
        <button class="tk-secondary" data-screen="menu">Adicionar mais</button>
        <button class="tk-primary" data-screen="payment" ${state.cart.length ? "" : "disabled"}>Finalizar</button>
      </div>
    </section>
  `, 3);
}

function renderPayment() {
  return shell(`
    <section class="tk-panel tk-payment-panel">
      <span class="tk-eyebrow">Pagamento</span>
      <h1>Como deseja pagar?</h1>
      <div class="tk-payment-grid">
        ${["PIX", "Debito", "Credito"].map((method) => `<button class="${state.paymentMethod === method ? "is-active" : ""}" data-payment="${method}"><b>${method}</b><small>${method === "PIX" ? "QR Code na tela" : "Cartao / aproximacao"}</small></button>`).join("")}
      </div>
      <div class="tk-review">
        <b>${cleanText(state.orderMode || "Retirar para viagem")}</b>
        <b>${state.customerDocument ? `CPF ${cleanText(state.customerDocument)}` : "Sem CPF"}</b>
      </div>
      <div class="tk-cart-list">${cartRows(false)}</div>
      <div class="tk-total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
      <div class="tk-actions">
        <button class="tk-secondary" data-screen="cart">Voltar</button>
        <button class="tk-primary" id="tk-confirm-order" ${state.loading ? "disabled" : ""}>${state.loading ? "Enviando..." : "Confirmar pedido"}</button>
      </div>
    </section>
  `, 4);
}

function renderSuccess() {
  return `
    <main class="tk-success">
      <section class="tk-success-card">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Pedido concluido</span>
        <h1>${String(state.lastOrder?.ticketNumber || "").padStart(3, "0")}</h1>
        <p>Acompanhe sua senha no telao. Quando aparecer como pronto, retire no balcao.</p>
        <strong>${money(state.lastOrder?.total || cartTotal())}</strong>
        <button class="tk-primary" id="tk-new-order">Novo pedido</button>
      </section>
    </main>
  `;
}

function renderError(message) {
  app.innerHTML = `
    <main class="tk-success">
      <section class="tk-success-card">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Totem indisponivel</span>
        <h1>Ops</h1>
        <p>${cleanText(message)}</p>
        <button class="tk-primary" id="tk-retry">Tentar novamente</button>
      </section>
    </main>
  `;
}

function render() {
  if (!app) return;
  app.innerHTML = state.screen === "welcome" ? renderWelcome()
    : state.screen === "loyalty" ? renderLoyalty()
      : state.screen === "menu" ? renderMenu()
        : state.screen === "customize" ? renderCustomize()
          : state.screen === "cart" ? renderCart()
            : state.screen === "payment" ? renderPayment()
              : renderSuccess();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.screen) return setScreen(button.dataset.screen);
  if (button.dataset.mode) {
    state.orderMode = button.dataset.mode;
    return setScreen("loyalty");
  }
  if (button.id === "tk-save-cpf") {
    state.customerDocument = document.getElementById("tk-cpf")?.value || "";
    return setScreen("menu");
  }
  if (button.dataset.category) {
    state.category = button.dataset.category;
    return render();
  }
  if (button.dataset.product) return selectProduct(button.dataset.product);
  if (button.dataset.size) {
    state.draft.size = button.dataset.size;
    return render();
  }
  if (button.dataset.extra) {
    const extra = button.dataset.extra;
    state.draft.extras = state.draft.extras.includes(extra)
      ? state.draft.extras.filter((item) => item !== extra)
      : [...state.draft.extras, extra];
    return render();
  }
  if (button.dataset.draftQty) {
    state.draft.qty = Math.max(1, Number(state.draft.qty || 1) + Number(button.dataset.draftQty || 0));
    return render();
  }
  if (button.id === "tk-add-product") {
    state.draft.coverage = document.getElementById("tk-coverage")?.value || state.draft.coverage || "";
    state.draft.note = document.getElementById("tk-note")?.value || "";
    return addProductToCart();
  }
  if (button.dataset.cartIndex) {
    const index = Number(button.dataset.cartIndex);
    const item = state.cart[index];
    if (!item) return;
    item.qty += Number(button.dataset.delta || 0);
    state.cart = state.cart.filter((row) => row.qty > 0);
    return render();
  }
  if (button.dataset.payment) {
    state.paymentMethod = button.dataset.payment;
    return render();
  }
  if (button.id === "tk-confirm-order") return submitOrder();
  if (button.id === "tk-new-order") {
    state.cart = [];
    state.lastOrder = null;
    state.paymentMethod = "PIX";
    state.orderMode = "";
    state.customerDocument = "";
    return setScreen("welcome");
  }
  if (button.id === "tk-retry") return loadCatalog();
});

async function submitOrder() {
  if (!state.cart.length || state.loading) return;
  try {
    state.loading = true;
    render();
    const result = await api("/api/public/kiosk/orders", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        paymentMethod: state.paymentMethod,
        customerDocument: state.customerDocument,
        orderMode: state.orderMode || "Retirar para viagem",
        items: state.cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          coverage: [item.size, item.coverage, ...(item.extras || [])].filter(Boolean).join(" - "),
          note: item.note
        }))
      })
    });
    state.lastOrder = result;
    state.screen = "success";
    render();
  } catch (error) {
    alert(error.message);
  } finally {
    state.loading = false;
    if (state.screen !== "success") render();
  }
}

async function loadCatalog() {
  try {
    state.catalog = await api(`/api/public/store/catalog?unidade=${encodeURIComponent(tenantCode)}`);
    render();
  } catch (error) {
    renderError(error.message);
  }
}

loadCatalog();

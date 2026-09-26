const params = new URLSearchParams(location.search);
const tenantCode = params.get("unidade") || "cliente-exemplo";
const terminalToken = params.get("terminalToken") || params.get("token") || params.get("limpar") || "";
const apiBase = location.protocol === "file:" ? "http://localhost:4173" : "";
const SUCCESS_RESET_MS = 6000;
let successResetTimer = null;

const state = {
  catalog: { products: [], nearest: null },
  screen: "welcome",
  category: "Tortela",
  orderMode: "",
  customerDocument: "",
  paymentMethod: "PIX",
  selectedProduct: null,
  selectedChoiceKey: "",
  draft: null,
  cart: [],
  lastOrder: null,
  loading: false
};

const app = document.getElementById("kiosk-app");
const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const onlyDigits = (value = "") => String(value).replace(/\D/g, "");
const validCpf = (value = "") => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base) => {
    let sum = 0;
    for (let index = 0; index < base.length; index += 1) sum += Number(base[index]) * (base.length + 1 - index);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(cpf.slice(0, 9)) === Number(cpf[9]) && calc(cpf.slice(0, 10)) === Number(cpf[10]);
};
const cleanText = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));
const defaultCoverageOptions = [
  "Chocolate ao leite",
  "Chocolate branco",
  "Chocolate meio amargo",
  "Ovomaltine",
  "Kinder Bueno",
  "Avela",
  "Morango",
  "Pistache"
];
const defaultToppingOptions = [
  "Granulado",
  "Chocoball",
  "Cookies baunilha",
  "Farofa de pacoca",
  "Amendoim granulado",
  "Gotas cookies chocolate",
  "Ovomaltine"
];

function optionList(options, fallback = []) {
  const source = Array.isArray(options) ? options : String(options || "").split(",");
  const normalized = source.map((option) => String(option || "").trim()).filter(Boolean);
  const chosen = normalized.length ? normalized : fallback;
  return [...new Set(chosen.map((option) => String(option || "").trim()).filter(Boolean))];
}

function productCoverageOptions(product) {
  if (!product?.hasCoverage && !Array.isArray(product?.coverageOptions)) return [];
  return optionList(product.coverageOptions, defaultCoverageOptions);
}

function productToppingOptions(product) {
  return optionList(product?.toppingOptions || product?.additionalOptions || product?.extrasOptions, defaultToppingOptions);
}

function resetOrder() {
  if (successResetTimer) {
    clearTimeout(successResetTimer);
    successResetTimer = null;
  }
  state.cart = [];
  state.lastOrder = null;
  state.paymentMethod = "PIX";
  state.orderMode = "";
  state.customerDocument = "";
  setScreen("welcome");
}

function scheduleSuccessReset() {
  if (successResetTimer) clearTimeout(successResetTimer);
  successResetTimer = setTimeout(resetOrder, SUCCESS_RESET_MS);
}

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
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
  return ["Tortela", "Shake", "Bebidas"];
}

function visibleProducts() {
  const products = state.catalog.products;
  if (state.category === "Shake") {
    return products.filter((product) => /shake|milk/i.test(product.description || ""));
  }
  if (state.category === "Bebidas") {
    return products.filter((product) => /bebida|suco|refri|agua|refrigerante/i.test(product.description || ""));
  }
  return products.filter((product) => /torta|combo/i.test(product.description || "") && !/shake|milk/i.test(product.description || ""));
}

function cartCount() {
  return state.cart.reduce((total, item) => total + Number(item.qty || 0), 0);
}

function cartTotal() {
  return state.cart.reduce((total, item) => total + Number(item.qty || 0) * Number(item.price || 0), 0);
}

function progressDots(step = 0) {
  return Array.from({ length: 5 }, (_, index) => `
    <span class="${index <= step ? "is-active" : ""}" aria-label="Etapa ${index + 1}"></span>
  `).join("");
}

function decorativeTreats(className = "") {
  return `
    <div class="tk-treats ${className}" aria-hidden="true">
      <span class="tk-treat tk-treat-a"></span>
      <span class="tk-treat tk-treat-b"></span>
      <span class="tk-treat tk-treat-c"></span>
    </div>
  `;
}

function productPhoto(product, className = "tk-product-photo") {
  if (product.photo) {
    return `<img class="${className}" src="${cleanText(product.photo)}" alt="${cleanText(product.description)}" />`;
  }
  const category = productCategory(product);
  return `
    <div class="${className} tk-product-fallback" aria-label="${cleanText(product.description)}">
      <span>${cleanText(category)}</span>
      <b>${cleanText(product.description)}</b>
    </div>
  `;
}

function hasCpf() {
  return validCpf(state.customerDocument);
}

function setScreen(screen) {
  if (["menu", "cart", "payment"].includes(screen) && !hasCpf()) {
    state.screen = "loyalty";
    render();
    return;
  }
  if (screen === "payment" && !state.cart.length) {
    state.screen = "cart";
    render();
    return;
  }
  state.screen = screen;
  render();
}

function shell(content, step = 0) {
  return `
    <main class="tk-shell tk-screen-${state.screen}">
      <div class="tk-bg-words" aria-hidden="true">
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
        <span>FELICIDADE EM PALITOS FELICIDADE EM PALITOS</span>
      </div>
      <header class="tk-header tk-ref-header">
        <button class="tk-logo" data-screen="welcome" aria-label="Voltar ao inicio">
          <img src="./assets/tortela/logo-tortela-orange.png" alt="Tortela" />
        </button>
        <div class="tk-progress-wrap">
          <strong>Palitando</strong>
          <div class="tk-progress" aria-label="Progresso do pedido">
            ${progressDots(step)}
          </div>
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
    <main class="tk-welcome tk-start-screen">
      <div class="tk-start-pattern" aria-hidden="true">FELICIDADE EM PALITOS</div>
      <img class="tk-start-logo" src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
      <section class="tk-start-copy">
        <h1>Comece seu pedido</h1>
        <p>Aperte nos icones</p>
      </section>
      <div class="tk-start-actions">
        <button class="tk-start-button" data-mode="Comer na loja">
          <b>Comer aqui</b>
          <small>Pedido para consumir na loja</small>
        </button>
        <button class="tk-start-button" data-mode="Retirar para viagem">
          <b>Levar - Viagem</b>
          <small>Pedido embalado para retirar</small>
        </button>
      </div>
      <div class="tk-hero-treat" aria-hidden="true"></div>
    </main>
  `;
}

function renderLoyalty() {
  return shell(`
    <section class="tk-panel tk-centered-panel tk-reference-panel">
      <div class="tk-panel-mark">Clube Tortela</div>
      <h1>Informe o CPF</h1>
      <p>Para continuar a venda, insira o seu cpf</p>
      <label class="tk-field">
        <span>Cpf</span>
        <input id="tk-cpf" class="tk-pink-input" inputmode="numeric" autocomplete="off" value="${cleanText(state.customerDocument)}" placeholder="Digite o CPF" />
      </label>
      <div id="tk-cpf-warning" class="tk-warning ${hasCpf() ? "" : "is-visible"}">Digite um CPF valido para liberar o cardapio.</div>
      <div class="tk-actions tk-actions-single">
        <button class="tk-primary tk-orange-button" id="tk-save-cpf" ${hasCpf() ? "" : "disabled"}>Continuar</button>
      </div>
      ${decorativeTreats("tk-panel-treats")}
    </section>
  `, 1);
}

function renderMenu() {
  const products = visibleProducts();
  const selectedKey = state.selectedChoiceKey;
  const classicProducts = tortelaChoices(products, "classic", 3);
  const specialProducts = tortelaChoices(products, "special", 4);
  return shell(`
    <section class="tk-menu tk-tortela-menu">
      <aside class="tk-categories tk-tortela-tabs">
        ${categories().map((category) => `<button class="${state.category === category ? "is-active" : ""}" data-category="${cleanText(category)}"><span class="tk-tab-label">${cleanText(category)}</span></button>`).join("")}
      </aside>
      <section class="tk-menu-board tk-tortela-board">
        <div class="tk-tortela-ribbon">3 passos para montar<br>a sua Tortela:</div>
        <h1>1º Escolha a sua Tortela</h1>
        <div class="tk-tortela-columns">
          <div>
            <strong class="tk-column-title tk-classic-title">Clássicas</strong>
            <div class="tk-choice-list">
              ${classicProducts.map((choice) => productChoice(choice, selectedKey, "classic")).join("")}
            </div>
          </div>
          <div>
            <strong class="tk-column-title tk-special-title">Especiais</strong>
            <div class="tk-choice-list">
              ${specialProducts.map((choice) => productChoice(choice, selectedKey, "special")).join("")}
            </div>
          </div>
        </div>
        ${products.length ? "" : `<div class="tk-empty">Nenhum produto real liberado para esta categoria.</div>`}
        <button class="tk-primary tk-menu-continue" id="tk-continue-product" ${state.selectedProduct ? "" : "disabled"}>Continuar</button>
      </section>
      <button class="tk-bottom-cart" data-screen="cart" ${state.cart.length ? "" : "disabled"}>
        <span>item</span>
        <b>R$</b>
        <strong>Ver pedido</strong>
      </button>
    </section>
  `, 2);
}

function tortelaChoices(products, tone, amount) {
  const fallback = products[0] || state.catalog.products[0];
  return Array.from({ length: amount }, (_, index) => {
    const product = products[index] || products[index % Math.max(products.length, 1)] || fallback;
    return {
      key: `${tone}-${index}`,
      product,
      label: "Limão"
    };
  }).filter((choice) => choice.product);
}

function productChoice(choice, selectedKey, tone) {
  const active = selectedKey === choice.key;
  return `
    <button class="tk-tortela-choice ${tone === "special" ? "is-special" : "is-classic"} ${active ? "is-active" : ""}" data-product-option="${choice.product.id}" data-choice-key="${choice.key}">
      <span class="tk-choice-photo" aria-hidden="true"></span>
      <span class="tk-choice-copy">
        <b>${cleanText(choice.label)}</b>
        <small>${money(choice.product.price)}</small>
      </span>
    </button>
  `;
}

function productCard(product) {
  return `
    <article class="tk-product-card">
      ${productPhoto(product)}
      <div class="tk-product-copy">
        <small>${cleanText(productCategory(product))}</small>
        <h2>${cleanText(product.description)}</h2>
        <div class="tk-product-footer">
          <strong>${money(product.price)}</strong>
          <span>${Number(product.stock || 0) > 0 ? "Disponivel" : "Indisponivel"}</span>
        </div>
      </div>
      <button class="tk-hot-button" data-product="${product.id}">Escolher</button>
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
    coverage: productCoverageOptions(product)[0] || "",
    extras: [],
    note: ""
  };
  setScreen("customize");
}

function renderCustomize() {
  const product = state.selectedProduct;
  if (!product || !state.draft) return renderMenu();
  const coverageOptions = productCoverageOptions(product);
  if (!coverageOptions.length) return renderTopping();
  if (!state.draft.coverage || !coverageOptions.includes(state.draft.coverage)) {
    state.draft.coverage = coverageOptions[0];
  }
  return shell(`
    <section class="tk-custom tk-reference-panel tk-coverage-panel">
      <div class="tk-coverage-ribbon">3 passos para montar<br>a sua Tortela:</div>
      <h1>2º Escolha a sua cobertura</h1>
      <div class="tk-coverage-grid">
        ${coverageOptions.map((option) => `
          <button class="${state.draft.coverage === option ? "is-active" : ""}" data-coverage-option="${cleanText(option)}">${cleanText(option)}</button>
        `).join("")}
      </div>
      <div class="tk-coverage-image" aria-hidden="true"></div>
      <button class="tk-primary tk-coverage-continue" id="tk-continue-topping">Continuar</button>
    </section>
  `, 2);
}

function renderTopping() {
  const product = state.selectedProduct;
  if (!product || !state.draft) return renderMenu();
  const toppingOptions = productToppingOptions(product);
  if (!toppingOptions.length) return addProductToCart();
  if (!state.draft.extras.length || !toppingOptions.includes(state.draft.extras[0])) {
    state.draft.extras = [toppingOptions[0]];
  }
  return shell(`
    <section class="tk-custom tk-reference-panel tk-coverage-panel tk-topping-panel">
      <div class="tk-coverage-ribbon">3 passos para montar<br>a sua Tortela:</div>
      <h1>3º Escolha o seu Topping</h1>
      <div class="tk-coverage-grid tk-topping-grid">
        ${toppingOptions.map((option) => `
          <button class="${state.draft.extras[0] === option ? "is-active" : ""}" data-topping-option="${cleanText(option)}">${cleanText(option)}</button>
        `).join("")}
      </div>
      <div class="tk-topping-image" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <button class="tk-primary tk-coverage-continue tk-topping-continue" id="tk-add-product">Continuar</button>
    </section>
  `, 3);
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
  state.selectedChoiceKey = "";
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
        <div class="tk-cart-controls">
          <div class="tk-stepper">
            <button data-cart-index="${index}" data-delta="-1" aria-label="Diminuir quantidade">-</button>
            <b>${item.qty}</b>
            <button data-cart-index="${index}" data-delta="1" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="tk-remove-item" data-remove-cart-index="${index}" type="button">Remover item</button>
        </div>
      ` : `<b>${item.qty}x</b>`}
      <strong>${money(item.price * item.qty)}</strong>
    </article>
  `).join("");
}

function renderCart() {
  return shell(`
    <section class="tk-panel tk-order-panel tk-cart-panel">
      <header class="tk-cart-panel-head">
        <span>MEU PEDIDO</span>
        <h1>Confira seu carrinho</h1>
      </header>
      <div class="tk-cart-panel-body">
        <div class="tk-cart-list">${cartRows(true)}</div>
        <div class="tk-total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
        <div class="tk-actions">
          <button class="tk-primary" data-screen="menu">Adicionar</button>
          <button class="tk-primary" data-screen="payment" ${state.cart.length ? "" : "disabled"}>Pagamento</button>
        </div>
      </div>
    </section>
  `, 3);
}

function renderPayment() {
  return shell(`
    <section class="tk-panel tk-payment-panel tk-checkout-panel">
      <header class="tk-checkout-head">
        <span>Pagamento</span>
        <h1>Como deseja pagar?</h1>
      </header>
      <div class="tk-checkout-body">
        <small class="tk-payment-info">Informacoes do pedido: ${cleanText(state.orderMode || "Para viagem")} - CPF: ${cleanText(state.customerDocument)}</small>
        <div class="tk-payment-grid">
          ${["PIX", "Debito", "Credito"].map((method) => `<button class="${state.paymentMethod === method ? "is-active" : ""}" data-payment="${method}"><b>${method}</b><small>${method === "PIX" ? "QR Code na tela" : "Cartao / aproximacao"}</small></button>`).join("")}
        </div>
        <div class="tk-cart-list">${cartRows(false)}</div>
        <div class="tk-total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
        <div class="tk-actions">
          <button class="tk-secondary" data-screen="cart">Voltar</button>
          <button class="tk-primary" id="tk-confirm-order" ${state.loading ? "disabled" : ""}>${state.loading ? "Enviando..." : "Confirma pedido"}</button>
        </div>
      </div>
    </section>
  `, 4);
}

function renderSuccess() {
  return shell(`
      <section class="tk-success-card tk-final-card">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Pedido concluido</span>
        <h1>${String(state.lastOrder?.ticketNumber || "").padStart(3, "0")}</h1>
        <p>Acompanhe sua senha no telao. Quando aparecer como pronto, retire no balcao.</p>
        <small class="tk-auto-reset">Novo pedido sera iniciado automaticamente</small>
      </section>
  `, 4);
}

function renderError(message) {
  const localFileHint = location.protocol === "file:"
    ? "Abra pelo servidor local do sistema, nao direto pelo arquivo."
    : "";
  app.innerHTML = `
    <main class="tk-success">
      <section class="tk-success-card">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <span>Totem indisponivel</span>
        <h1>Ops</h1>
        <p>${cleanText(localFileHint || message)}</p>
        ${localFileHint ? `<small class="tk-payment-status">${cleanText(message)}</small>` : ""}
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
            : state.screen === "topping" ? renderTopping()
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
    state.customerDocument = onlyDigits(document.getElementById("tk-cpf")?.value || "");
    if (!hasCpf()) {
      document.getElementById("tk-cpf-warning")?.classList.add("is-visible");
      document.getElementById("tk-cpf")?.focus();
      return;
    }
    return setScreen("menu");
  }
  if (button.dataset.category) {
    state.category = button.dataset.category;
    state.selectedProduct = null;
    state.selectedChoiceKey = "";
    return render();
  }
  if (button.dataset.productOption) {
    const product = state.catalog.products.find((item) => Number(item.id) === Number(button.dataset.productOption));
    if (!product) return;
    state.selectedProduct = product;
    state.selectedChoiceKey = button.dataset.choiceKey || "";
    return render();
  }
  if (button.id === "tk-continue-product") {
    if (!state.selectedProduct) return;
    return selectProduct(state.selectedProduct.id);
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
  if (button.dataset.coverageOption) {
    state.draft.coverage = button.dataset.coverageOption;
    return render();
  }
  if (button.dataset.toppingOption) {
    state.draft.extras = [button.dataset.toppingOption];
    return render();
  }
  if (button.dataset.draftQty) {
    state.draft.qty = Math.max(1, Number(state.draft.qty || 1) + Number(button.dataset.draftQty || 0));
    return render();
  }
  if (button.id === "tk-continue-topping") {
    return setScreen("topping");
  }
  if (button.id === "tk-add-product") {
    state.draft.coverage = state.draft.coverage || "";
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
  if (button.dataset.removeCartIndex) {
    state.cart.splice(Number(button.dataset.removeCartIndex), 1);
    return render();
  }
  if (button.dataset.payment) {
    state.paymentMethod = button.dataset.payment;
    return render();
  }
  if (button.id === "tk-confirm-order") return submitOrder();
  if (button.id === "tk-retry") return loadCatalog();
});

async function submitOrder() {
  if (!state.cart.length || state.loading) return;
  if (!hasCpf()) {
    alert("Informe o CPF do cliente para finalizar a venda.");
    return setScreen("loyalty");
  }
  try {
    state.loading = true;
    render();
    const result = await api("/api/public/kiosk/orders", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        terminalToken,
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
    scheduleSuccessReset();
  } catch (error) {
    alert(error.message);
  } finally {
    state.loading = false;
    if (state.screen !== "success") render();
  }
}

async function loadCatalog() {
  try {
    const query = new URLSearchParams({ unidade: tenantCode });
    if (terminalToken) query.set("terminalToken", terminalToken);
    state.catalog = await api(`/api/public/store/catalog?${query.toString()}`);
    render();
  } catch (error) {
    renderError(error.message);
  }
}

loadCatalog();

document.addEventListener("input", (event) => {
  if (event.target?.id !== "tk-cpf") return;
  state.customerDocument = onlyDigits(event.target.value);
  event.target.value = state.customerDocument;
  const button = document.getElementById("tk-save-cpf");
  const warning = document.getElementById("tk-cpf-warning");
  if (button) button.disabled = !hasCpf();
  if (warning) warning.classList.toggle("is-visible", !hasCpf());
});

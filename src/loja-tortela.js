let catalog = { products: [], units: [], nearest: null };
let cart = [];
const params = new URLSearchParams(location.search);

const byId = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const publicUnitName = (unit) => {
  const name = String(unit?.tradeName || "").trim();
  return !name || /cliente\s*exemplo/i.test(name) ? "Loja Tortela mais proxima" : name;
};
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

function fieldValue(id, fallback = "") {
  return byId(id)?.value || fallback;
}

function productCategory(product) {
  const text = `${product.description || ""} ${product.unit || ""}`.toLowerCase();
  if (text.includes("bebida") || text.includes("suco") || text.includes("refri") || text.includes("milk")) return "Bebidas";
  if (text.includes("kit") || text.includes("combo") || text.includes("famil")) return "Combos";
  if (text.includes("bolo") || text.includes("fatia")) return "Bolos";
  if (text.includes("torta") || text.includes("palito")) return "Tortas no palito";
  return "Mais pedidos";
}

function categories() {
  const names = ["Todos", ...new Set(catalog.products.map(productCategory))];
  return names.filter(Boolean);
}

function render() {
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const currentCep = fieldValue("store-cep", params.get("cep") || "");
  const currentSearch = fieldValue("store-search", params.get("q") || "");
  const selectedPayment = document.querySelector('input[name="payment-method"]:checked')?.value || "PIX";
  const deliveryBlocked = catalog.deliveryAvailable === false;
  const deliveryKnown = catalog.deliveryAvailable === true;
  const formValues = {
    name: fieldValue("customer-name"),
    phone: fieldValue("customer-phone"),
    address: fieldValue("customer-address", catalog.deliveryAddress?.address || ""),
    number: fieldValue("customer-number"),
    district: fieldValue("customer-district", catalog.deliveryAddress?.district || ""),
    city: fieldValue("customer-city", catalog.deliveryAddress?.city || ""),
    uf: fieldValue("customer-uf", catalog.deliveryAddress?.uf || "SP"),
    delivery: fieldValue("delivery-mode", "Entrega"),
    payment: selectedPayment
  };

  byId("store-app").innerHTML = `
    <header class="store-header">
      <div class="store-topbar">
        <div class="store-brand">
          <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
          <div>
            <strong>Tortela Online</strong>
            <span>Pedidos para entrega e retirada</span>
          </div>
        </div>
        <button class="store-location" id="store-focus-cep">
          <span>Entregar em</span>
          <strong>${currentCep ? escapeHtml(currentCep) : "Informe seu CEP"}</strong>
        </button>
        <div class="store-searchbar">
          <span>Produto</span>
          <input id="store-search" value="${escapeHtml(currentSearch)}" placeholder="O que voce quer comer hoje?" />
        </div>
        <button class="store-chip" id="store-jump-cart">
          <span>Sacola</span>
          <strong>${itemCount} item(ns) - ${money(total)}</strong>
        </button>
      </div>
    </header>

    <main class="store-main">
      <section class="store-delivery-panel">
        <div>
          <span class="store-kicker">Loja Tortela</span>
          <h1>Escolha, confira a sacola e envie seu pedido.</h1>
          <p>${catalog.nearest ? `${escapeHtml(publicUnitName(catalog.nearest))} recebe o pedido, baixa o estoque e acompanha a entrega.` : "Informe o CEP para localizar a loja Tortela mais proxima."}</p>
          <div class="store-service-strip" aria-label="Informacoes do pedido">
            <span>Entrega ou retirada</span>
            <span>Pagamento no pedido</span>
            <span>Preparo acompanhado</span>
          </div>
          <div class="store-delivery-status ${deliveryBlocked ? "blocked" : deliveryKnown ? "ok" : ""}">
            ${escapeHtml(catalog.deliveryMessage || "Informe o CEP para localizar sua loja Tortela.")}
          </div>
        </div>
        <div class="store-delivery-actions">
          <strong>Encontre a unidade de atendimento</strong>
          <div class="field"><label>CEP de entrega</label><input id="store-cep" inputmode="numeric" value="${escapeHtml(currentCep)}" placeholder="Digite seu CEP" /></div>
          <button class="btn primary" id="store-refresh">Encontrar loja</button>
        </div>
      </section>

      <nav class="store-categories" aria-label="Categorias do cardapio">
        ${categories().map((category, index) => `<button class="${index === 0 ? "active" : ""}" data-store-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}
      </nav>

      <section class="store-layout">
        <section class="store-menu" id="store-products-area">
          <div class="store-section-title">
            <div>
              <span>Cardapio</span>
              <h2>Produtos disponiveis</h2>
            </div>
            <small>${catalog.products.length} item(ns)</small>
          </div>
          <div class="store-products">
            ${catalog.products.map(productCard).join("") || `<div class="store-empty">Nenhum produto disponivel para venda online.</div>`}
          </div>
        </section>

        <aside class="store-cart" id="store-cart">
          <div class="store-cart-title">
            <div>
              <span>Sacola</span>
              <small>${itemCount} item(ns) selecionado(s)</small>
            </div>
            <strong>${money(total)}</strong>
          </div>
          ${cart.length ? cart.map((item, index) => cartLine(item, index)).join("") : `<p class="muted">Sua sacola esta vazia.</p>`}
          <div class="store-total"><span>Total</span><strong>${money(total)}</strong></div>
          <div class="store-checkout-steps">
            <span class="active">Sacola</span>
            <span>Entrega</span>
            <span>Pagamento</span>
          </div>
          <div class="grid two">
            <div class="field"><label>Nome</label><input id="customer-name" value="${escapeHtml(formValues.name)}" /></div>
            <div class="field"><label>Telefone</label><input id="customer-phone" value="${escapeHtml(formValues.phone)}" /></div>
            <div class="field"><label>Endereco</label><input id="customer-address" value="${escapeHtml(formValues.address)}" /></div>
            <div class="field"><label>Numero</label><input id="customer-number" value="${escapeHtml(formValues.number)}" /></div>
            <div class="field"><label>Bairro</label><input id="customer-district" value="${escapeHtml(formValues.district)}" /></div>
            <div class="field"><label>Cidade</label><input id="customer-city" value="${escapeHtml(formValues.city)}" /></div>
            <div class="field"><label>UF</label><input id="customer-uf" maxlength="2" value="${escapeHtml(formValues.uf)}" /></div>
            <div class="field"><label>Como receber</label><select id="delivery-mode"><option ${formValues.delivery === "Entrega" ? "selected" : ""}>Entrega</option><option ${formValues.delivery === "Retirada" ? "selected" : ""}>Retirada</option></select></div>
          </div>
          <div class="store-payment">
            ${paymentOption("PIX", "PIX", "Mais rapido", formValues.payment)}
            ${paymentOption("Debito", "Debito", "Online", formValues.payment)}
            ${paymentOption("Credito", "Credito", "Online", formValues.payment)}
          </div>
          <button class="btn primary full" id="send-online-order" ${cart.length && !deliveryBlocked ? "" : "disabled"}>${deliveryBlocked ? "Entrega indisponivel" : "Finalizar pedido"}</button>
        </aside>
      </section>
    </main>`;
  bind();
}

function cartLine(item, index) {
  return `<div class="cart-line">
    <div><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(item.unit)} ${item.coverage ? `- ${escapeHtml(item.coverage)}` : ""}</small></div>
    <div class="cart-line-actions">
      <button class="btn" data-cart-minus="${index}">-</button>
      <span>${item.qty}</span>
      <button class="btn" data-cart-plus="${index}">+</button>
      <button class="btn danger" data-cart-remove="${index}">Remover</button>
    </div>
    <strong>${money(item.qty * item.price)}</strong>
  </div>`;
}

function paymentOption(value, title, detail, selected) {
  return `<label class="payment-option ${selected === value ? "selected" : ""}">
    <input type="radio" name="payment-method" value="${value}" ${selected === value ? "checked" : ""} />
    <span><strong>${title}</strong><small>${detail}</small></span>
  </label>`;
}

function productCard(product) {
  const img = product.photo
    ? `<img src="${product.photo}" alt="${escapeHtml(product.description)}" />`
    : `<div class="store-product-placeholder"><strong>Tortela</strong><span>Produto fresco</span></div>`;
  return `<article class="store-product" data-category="${escapeHtml(productCategory(product))}">
    <div class="store-product-body">
      <small>${escapeHtml(productCategory(product))}</small>
      <h2>${escapeHtml(product.description)}</h2>
      <p>Preparado pela unidade Tortela selecionada.</p>
      ${product.hasCoverage ? `<div class="field compact"><label>Cobertura</label><select data-coverage="${product.id}">${(product.coverageOptions || []).map((option) => `<option>${escapeHtml(option)}</option>`).join("")}</select></div>` : ""}
      <div class="store-price"><strong>${money(product.price)}</strong><button class="btn primary" data-add-product="${product.id}" data-tenant="${escapeHtml(product.tenantCode)}">Adicionar</button></div>
    </div>
    <div class="store-product-media">${img}</div>
  </article>`;
}

function bind() {
  byId("store-refresh")?.addEventListener("click", loadCatalog);
  byId("store-cep")?.addEventListener("input", (event) => {
    const cep = String(event.target.value || "").replace(/\D/g, "");
    if (cep.length === 8) loadCatalog();
  });
  byId("store-cep")?.addEventListener("blur", loadCatalog);
  byId("store-search")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadCatalog();
  });
  byId("store-focus-cep")?.addEventListener("click", () => byId("store-cep")?.focus());
  document.querySelectorAll("[data-store-category]").forEach((button) => button.addEventListener("click", () => filterCategory(button.dataset.storeCategory)));
  document.querySelectorAll("[data-add-product]").forEach((button) => button.addEventListener("click", () => {
    const product = catalog.products.find((item) => Number(item.id) === Number(button.dataset.addProduct) && item.tenantCode === button.dataset.tenant);
    if (!product) return;
    const coverage = document.querySelector(`[data-coverage="${product.id}"]`)?.value || "";
    const existing = cart.find((item) => item.productId === product.id && item.tenantCode === product.tenantCode && item.coverage === coverage);
    if (existing) existing.qty += 1;
    else cart.push({ productId: product.id, tenantCode: product.tenantCode, description: product.description, unit: product.unitMeasure, price: product.price, qty: 1, coverage });
    render();
  }));
  document.querySelectorAll("[data-cart-minus]").forEach((button) => button.addEventListener("click", () => {
    const item = cart[Number(button.dataset.cartMinus)];
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) cart = cart.filter((row) => row !== item);
    render();
  }));
  document.querySelectorAll("[data-cart-plus]").forEach((button) => button.addEventListener("click", () => {
    const item = cart[Number(button.dataset.cartPlus)];
    if (item) item.qty += 1;
    render();
  }));
  document.querySelectorAll("[data-cart-remove]").forEach((button) => button.addEventListener("click", () => {
    cart.splice(Number(button.dataset.cartRemove), 1);
    render();
  }));
  document.querySelectorAll('input[name="payment-method"]').forEach((input) => input.addEventListener("change", render));
  byId("send-online-order")?.addEventListener("click", sendOrder);
  byId("store-jump-cart")?.addEventListener("click", () => byId("store-cart")?.scrollIntoView({ behavior: "smooth" }));
}

function filterCategory(category) {
  document.querySelectorAll("[data-store-category]").forEach((button) => button.classList.toggle("active", button.dataset.storeCategory === category));
  document.querySelectorAll(".store-product").forEach((card) => {
    card.hidden = category !== "Todos" && card.dataset.category !== category;
  });
}

async function loadCatalog() {
  const cep = byId("store-cep")?.value || "";
  const q = byId("store-search")?.value || "";
  const unidade = params.get("unidade") || "";
  catalog = await api(`/api/public/store/catalog?cep=${encodeURIComponent(cep)}&q=${encodeURIComponent(q)}&unidade=${encodeURIComponent(unidade)}`);
  if (catalog.nearest) cart = cart.filter((item) => item.tenantCode === catalog.nearest.tenantCode);
  fillAddressFromCatalog();
  render();
}

function fillAddressFromCatalog() {
  const address = catalog.deliveryAddress || {};
  if (!address.cep) return;
  const setIfEmpty = (id, value) => {
    const input = byId(id);
    if (input && value && !input.value) input.value = value;
  };
  setIfEmpty("customer-address", address.address);
  setIfEmpty("customer-district", address.district);
  setIfEmpty("customer-city", address.city);
  setIfEmpty("customer-uf", address.uf);
}

async function sendOrder() {
  const tenantCode = catalog.nearest?.tenantCode || cart[0]?.tenantCode || "";
  try {
    const result = await api("/api/public/store/orders", {
      method: "POST",
      body: JSON.stringify({
        tenantCode,
        cep: byId("store-cep").value,
        deliveryMode: byId("delivery-mode").value,
        paymentMethod: document.querySelector('input[name="payment-method"]:checked')?.value || "PIX",
        customer: {
          name: byId("customer-name").value,
          phone: byId("customer-phone").value,
          address: byId("customer-address").value,
          number: byId("customer-number").value,
          district: byId("customer-district").value,
          city: byId("customer-city").value,
          uf: byId("customer-uf").value,
          cep: byId("store-cep").value
        },
        items: cart.map((item) => ({ productId: item.productId, qty: item.qty, coverage: item.coverage }))
      })
    });
    cart = [];
    render();
    const paymentLink = result.paymentInfo?.paymentUrl ? `\nPagamento: ${result.paymentInfo.paymentUrl}` : "";
    alert(`Pedido ${result.orderId} enviado para ${result.unit}. Total ${money(result.total)}. Pagamento: ${result.payment}.${paymentLink}`);
  } catch (error) {
    alert(error.message);
  }
}

loadCatalog().catch((error) => {
  byId("store-app").innerHTML = `<main class="store-main"><div class="store-empty">${escapeHtml(error.message)}</div></main>`;
});

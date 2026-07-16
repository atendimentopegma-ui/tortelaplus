let catalog = { products: [], units: [], nearest: null };
let cart = [];
const params = new URLSearchParams(location.search);

const byId = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const publicUnitName = (unit) => {
  const name = String(unit?.tradeName || "").trim();
  return !name || /cliente\s*exemplo/i.test(name) ? "Loja Tortela selecionada" : name;
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

function render() {
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const currentCep = fieldValue("store-cep", params.get("cep") || "");
  const currentSearch = fieldValue("store-search", params.get("q") || "");
  const selectedPayment = document.querySelector('input[name="payment-method"]:checked')?.value || "PIX";
  const formValues = {
    name: fieldValue("customer-name"),
    phone: fieldValue("customer-phone"),
    address: fieldValue("customer-address"),
    number: fieldValue("customer-number"),
    district: fieldValue("customer-district"),
    city: fieldValue("customer-city"),
    uf: fieldValue("customer-uf", "SP"),
    delivery: fieldValue("delivery-mode", "Entrega"),
    payment: selectedPayment
  };

  byId("store-app").innerHTML = `
    <header class="store-header">
      <div class="store-brand">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <div>
          <strong>Tortela</strong>
          <small>${catalog.nearest ? escapeHtml(publicUnitName(catalog.nearest)) : "Pedido online"}</small>
        </div>
      </div>
      <div class="store-header-actions">
        <button class="store-chip" id="store-jump-cart">${itemCount} item(ns) - ${money(total)}</button>
      </div>
    </header>
    <main>
      <section class="store-hero">
        <div class="store-hero-copy">
          <img class="store-hero-logo" src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
          <span class="store-kicker">pedido online tortela</span>
          <h1>Tortas no palito, bebidas e kits para pedir agora.</h1>
          <p>Escolha os sabores, informe o CEP e o pedido segue para a loja Tortela mais indicada para preparar, conferir e entregar.</p>
          <div class="store-hero-actions">
            <button class="btn primary store-jump" id="store-jump-products">Ver cardapio</button>
            <span>PIX, debito e credito</span>
          </div>
          <div class="store-metrics">
            <span><strong>${catalog.products.length}</strong> itens disponiveis</span>
            <span><strong>${catalog.nearest ? "1" : "CEP"}</strong> loja indicada</span>
            <span><strong>4</strong> etapas ate o pedido</span>
          </div>
        </div>
        <div class="store-hero-card">
          <div class="store-showcase">
            <div class="store-showcase-stick">Tortela</div>
            <div class="store-showcase-stick alt">No palito</div>
            <div class="store-showcase-cup">Milk shake</div>
          </div>
          <div class="store-hero-card-copy">
            <strong>${catalog.nearest ? escapeHtml(publicUnitName(catalog.nearest)) : "Informe seu CEP"}</strong>
            <span>${catalog.nearest ? "Esta unidade recebe o pedido e baixa o estoque automaticamente." : "Localizamos a loja mais proxima para atender melhor."}</span>
          </div>
        </div>
      </section>

      <section class="store-shell" id="store-products-area">
        <section class="store-tools">
          <div class="field"><label>CEP de entrega</label><input id="store-cep" inputmode="numeric" value="${escapeHtml(currentCep)}" placeholder="Digite seu CEP" /></div>
          <div class="field"><label>Buscar no cardapio</label><input id="store-search" value="${escapeHtml(currentSearch)}" placeholder="Torta, cobertura, bebida" /></div>
          <button class="btn primary" id="store-refresh">Encontrar loja</button>
        </section>

        <section class="store-layout">
          <div class="store-products">
            ${catalog.products.map(productCard).join("") || `<div class="store-empty">Nenhum produto disponivel para venda online.</div>`}
          </div>

          <aside class="store-cart" id="store-cart">
            <div class="store-cart-title">
              <span>Seu pedido</span>
              <strong>${money(total)}</strong>
            </div>
            ${cart.length ? cart.map((item, index) => cartLine(item, index)).join("") : `<p class="muted">Inclua produtos para fechar o pedido.</p>`}
            <div class="store-total"><span>Total do pedido</span><strong>${money(total)}</strong></div>
            <div class="store-checkout-steps">
              <span class="active">1 Carrinho</span>
              <span>2 Dados</span>
              <span>3 Pagamento</span>
            </div>
            <div class="grid two">
              <div class="field"><label>Nome</label><input id="customer-name" value="${escapeHtml(formValues.name)}" /></div>
              <div class="field"><label>Telefone</label><input id="customer-phone" value="${escapeHtml(formValues.phone)}" /></div>
              <div class="field"><label>Endereco</label><input id="customer-address" value="${escapeHtml(formValues.address)}" /></div>
              <div class="field"><label>Numero</label><input id="customer-number" value="${escapeHtml(formValues.number)}" /></div>
              <div class="field"><label>Bairro</label><input id="customer-district" value="${escapeHtml(formValues.district)}" /></div>
              <div class="field"><label>Cidade</label><input id="customer-city" value="${escapeHtml(formValues.city)}" /></div>
              <div class="field"><label>UF</label><input id="customer-uf" maxlength="2" value="${escapeHtml(formValues.uf)}" /></div>
              <div class="field"><label>Entrega</label><select id="delivery-mode"><option ${formValues.delivery === "Entrega" ? "selected" : ""}>Entrega</option><option ${formValues.delivery === "Retirada" ? "selected" : ""}>Retirada</option></select></div>
            </div>
            <div class="store-payment">
              ${paymentOption("PIX", "PIX", "Aprovacao rapida", formValues.payment)}
              ${paymentOption("Debito", "Debito", "Cartao na entrega", formValues.payment)}
              ${paymentOption("Credito", "Credito", "Cartao na entrega", formValues.payment)}
            </div>
            <button class="btn primary full" id="send-online-order" ${cart.length ? "" : "disabled"}>Finalizar pedido</button>
          </aside>
        </section>
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
    : `<div class="store-product-placeholder">Tortela</div>`;
  return `<article class="store-product">
    <div class="store-product-media">${img}</div>
    <div class="store-product-body">
      <small>${escapeHtml(product.unit)} - ${escapeHtml(product.unitMeasure || "UN")}</small>
      <h2>${escapeHtml(product.description)}</h2>
      <div class="store-price"><strong>${money(product.price)}</strong><span>Pronto para pedir</span></div>
      ${product.hasCoverage ? `<div class="field compact"><label>Cobertura</label><select data-coverage="${product.id}">${(product.coverageOptions || []).map((option) => `<option>${escapeHtml(option)}</option>`).join("")}</select></div>` : ""}
      <button class="btn primary" data-add-product="${product.id}" data-tenant="${escapeHtml(product.tenantCode)}">Incluir no carrinho</button>
    </div>
  </article>`;
}

function bind() {
  byId("store-refresh")?.addEventListener("click", loadCatalog);
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
  byId("store-jump-products")?.addEventListener("click", () => byId("store-products-area")?.scrollIntoView({ behavior: "smooth" }));
  byId("store-jump-cart")?.addEventListener("click", () => byId("store-cart")?.scrollIntoView({ behavior: "smooth" }));
}

async function loadCatalog() {
  const cep = byId("store-cep")?.value || "";
  const q = byId("store-search")?.value || "";
  const unidade = params.get("unidade") || "";
  catalog = await api(`/api/public/store/catalog?cep=${encodeURIComponent(cep)}&q=${encodeURIComponent(q)}&unidade=${encodeURIComponent(unidade)}`);
  if (catalog.nearest) cart = cart.filter((item) => item.tenantCode === catalog.nearest.tenantCode);
  render();
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
    alert(`Pedido ${result.orderId} enviado para ${result.unit}. Total ${money(result.total)}. Pagamento: ${result.payment}.`);
  } catch (error) {
    alert(error.message);
  }
}

loadCatalog().catch((error) => {
  byId("store-app").innerHTML = `<main class="store-shell"><div class="store-empty">${escapeHtml(error.message)}</div></main>`;
});

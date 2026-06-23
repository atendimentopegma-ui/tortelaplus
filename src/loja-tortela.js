let catalog = { products: [], units: [], nearest: null };
let cart = [];
const params = new URLSearchParams(location.search);

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

function render() {
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const currentCep = byId("store-cep")?.value || params.get("cep") || "";
  const currentSearch = byId("store-search")?.value || params.get("q") || "";
  const formValues = {
    name: byId("customer-name")?.value || "",
    phone: byId("customer-phone")?.value || "",
    address: byId("customer-address")?.value || "",
    number: byId("customer-number")?.value || "",
    district: byId("customer-district")?.value || "",
    city: byId("customer-city")?.value || "",
    uf: byId("customer-uf")?.value || "SP",
    delivery: byId("delivery-mode")?.value || "Entrega",
    payment: byId("payment-method")?.value || "PIX"
  };
  byId("store-app").innerHTML = `
    <header class="store-header">
      <div class="store-brand">
        <img src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
        <div><strong>Tortela</strong><small>${catalog.nearest ? `Loja sugerida: ${escapeHtml(catalog.nearest.tradeName)}` : "Pedido online"}</small></div>
      </div>
      <div class="store-header-actions">
        <span>${cart.length} item(ns) · ${money(total)}</span>
        <a class="btn" href="./central-rede.html">Central</a>
      </div>
    </header>
    <main>
      <section class="store-hero">
        <div class="store-hero-copy">
          <img class="store-hero-logo" src="./assets/tortela/logo-tortela.gif" alt="Tortela" />
          <h1>SABORES TORTELA PARA PEDIR AGORA</h1>
          <div class="store-pills"><span>NO PALITO</span><span>NA SUA CASA</span></div>
          <p>A loja mais proxima recebe seu pedido, separa os produtos, baixa o estoque e acompanha a entrega pela retaguarda Tortela Plus.</p>
        </div>
        <div class="store-hero-card">
          <div class="store-hero-photo">Tortela</div>
          <strong>${catalog.nearest ? escapeHtml(catalog.nearest.tradeName) : "Escolha seu CEP"}</strong>
          <span>${catalog.products.length} produto(s) disponiveis</span>
        </div>
      </section>
      <div class="store-cta-strip">
        <button class="btn store-jump" id="store-jump-products">Quero pedir Tortela!</button>
      </div>
      <section class="store-shell" id="store-products-area">
      <section class="store-tools">
        <div class="field"><label>CEP do pedido</label><input id="store-cep" value="${escapeHtml(currentCep)}" placeholder="01001000" /></div>
        <div class="field"><label>Buscar produto</label><input id="store-search" value="${escapeHtml(currentSearch)}" placeholder="pao, bolo, torta" /></div>
        <button class="btn primary" id="store-refresh">Atualizar loja</button>
      </section>
      <section class="store-layout">
        <div class="store-products">
          ${catalog.products.map(productCard).join("") || `<div class="store-empty">Nenhum produto disponivel para venda online.</div>`}
        </div>
        <aside class="store-cart">
          <h2>Carrinho</h2>
          ${cart.length ? cart.map((item, index) => `
            <div class="cart-line">
              <div><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(item.unit)} ${item.coverage ? `- ${escapeHtml(item.coverage)}` : ""}</small></div>
              <div class="cart-line-actions">
                <button class="btn" data-cart-minus="${index}">-</button>
                <span>${item.qty}</span>
                <button class="btn" data-cart-plus="${index}">+</button>
                <button class="btn danger" data-cart-remove="${index}">Remover</button>
              </div>
              <strong>${money(item.qty * item.price)}</strong>
            </div>`).join("") : `<p class="muted">Inclua produtos para fechar o pedido.</p>`}
          <div class="store-total"><span>Total</span><strong>${money(total)}</strong></div>
          <div class="grid two">
            <div class="field"><label>Nome</label><input id="customer-name" value="${escapeHtml(formValues.name)}" /></div>
            <div class="field"><label>Telefone</label><input id="customer-phone" value="${escapeHtml(formValues.phone)}" /></div>
            <div class="field"><label>Endereco</label><input id="customer-address" value="${escapeHtml(formValues.address)}" /></div>
            <div class="field"><label>Numero</label><input id="customer-number" value="${escapeHtml(formValues.number)}" /></div>
            <div class="field"><label>Bairro</label><input id="customer-district" value="${escapeHtml(formValues.district)}" /></div>
            <div class="field"><label>Cidade</label><input id="customer-city" value="${escapeHtml(formValues.city)}" /></div>
            <div class="field"><label>UF</label><input id="customer-uf" maxlength="2" value="${escapeHtml(formValues.uf)}" /></div>
            <div class="field"><label>Entrega</label><select id="delivery-mode"><option ${formValues.delivery === "Entrega" ? "selected" : ""}>Entrega</option><option ${formValues.delivery === "Retirada" ? "selected" : ""}>Retirada</option></select></div>
            <div class="field"><label>Pagamento</label><select id="payment-method"><option ${formValues.payment === "PIX" ? "selected" : ""}>PIX</option><option ${formValues.payment === "Debito" ? "selected" : ""}>Debito</option><option ${formValues.payment === "Credito" ? "selected" : ""}>Credito</option></select></div>
          </div>
          <button class="btn primary full" id="send-online-order" ${cart.length ? "" : "disabled"}>Finalizar pedido</button>
        </aside>
      </section>
      </section>
    </main>`;
  bind();
}

function productCard(product) {
  const img = product.photo
    ? `<img src="${product.photo}" alt="${escapeHtml(product.description)}" />`
    : `<div class="store-product-placeholder">Tortela</div>`;
  return `<article class="store-product">
    <div class="store-product-media">${img}</div>
    <div class="store-product-body">
      <small>${escapeHtml(product.unit)} - ${escapeHtml(product.unitMeasure)}</small>
      <h2>${escapeHtml(product.description)}</h2>
      <div class="store-price"><strong>${money(product.price)}</strong><span>Custo ${money(product.cost)}</span></div>
      ${product.hasCoverage ? `<select data-coverage="${product.id}">${(product.coverageOptions || []).map((option) => `<option>${escapeHtml(option)}</option>`).join("")}</select>` : ""}
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
  byId("send-online-order")?.addEventListener("click", sendOrder);
  byId("store-jump-products")?.addEventListener("click", () => byId("store-products-area")?.scrollIntoView({ behavior: "smooth" }));
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
        paymentMethod: byId("payment-method").value,
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

let catalog = { products: [], units: [], nearest: null };
let cart = [];
const params = new URLSearchParams(location.search);
let catalogLoadInFlight = null;
let catalogWarning = "";
let orderInFlight = false;
let activeCategory = "Tortelas";
let checkoutOpen = false;

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
  if(ItemPreparation.role(product))return "Complementos";
  const text=String(product.description||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(/bebida|suco|refri|shake|milk|\bagua\b|coca|guarana|fanta|sprite/.test(text))return "Bebidas";
  if(/kit|combo|famil/.test(text))return "Combos";
  if(ItemPreparation.isTortela(product))return "Tortelas";
  return "Outros produtos";
}
function menuProducts(){return catalog.products.filter(p=>!ItemPreparation.role(p));}
function categories(){return ["Tortelas","Bebidas","Combos","Outros produtos","Todos"].filter(c=>c==='Todos'||menuProducts().some(p=>productCategory(p)===c));}

function render() {
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const itemCount = cart.filter(item=>!item.parentLineId).reduce((sum, item) => sum + item.qty, 0);
  const currentCep = fieldValue("store-cep", params.get("cep") || "");
  const currentSearch = fieldValue("store-search", params.get("q") || "");
  if(!categories().includes(activeCategory))activeCategory=categories()[0]||"Todos";
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
          <h1>Monte seu pedido, uma escolha de cada vez.</h1>
          <p>${catalog.nearest ? `${escapeHtml(publicUnitName(catalog.nearest))} prepara seu pedido para entrega ou retirada.` : "Informe o CEP para localizar a loja Tortela mais proxima."}</p>
          <div class="store-service-strip" aria-label="Informacoes do pedido">
            <span>1 · Escolha a Tortela</span><span>2 · Acompanhamento</span><span>3 · Cobertura</span><span>4 · Bebidas e sacola</span>
          </div>
          <div class="store-delivery-status ${deliveryBlocked ? "blocked" : deliveryKnown ? "ok" : ""}">
            ${escapeHtml(catalog.deliveryMessage || "Informe o CEP para localizar sua loja Tortela.")}
          </div>
          ${catalogWarning ? `<div class="store-delivery-status blocked" role="status">${escapeHtml(catalogWarning)}</div>` : ""}
        </div>
        <div class="store-delivery-actions">
          <strong>Encontre a unidade de atendimento</strong>
          <div class="field"><label>CEP de entrega</label><input id="store-cep" inputmode="numeric" value="${escapeHtml(currentCep)}" placeholder="Digite seu CEP" /></div>
          <button class="btn primary" id="store-refresh" ${catalogLoadInFlight ? "disabled" : ""}>${catalogLoadInFlight ? "Atualizando..." : "Encontrar loja"}</button>
        </div>
      </section>

      <nav class="store-categories" aria-label="Categorias do cardapio">
        ${categories().map((category, index) => `<button class="${category === activeCategory ? "active" : ""}" data-store-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}
      </nav>

      <section class="store-layout">
        <section class="store-menu" id="store-products-area">
          <div class="store-section-title">
            <div>
              <span>Cardapio</span>
              <h2>Produtos disponiveis</h2>
            </div>
            <small>${menuProducts().length} produtos</small>
          </div>
          <div class="store-products">
            ${menuProducts().map(productCard).join("") || `<div class="store-empty">Nenhum produto disponivel para venda online.</div>`}
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
          <button class="btn primary full" id="store-checkout-toggle" ${cart.length?"":"disabled"}>${checkoutOpen?"Continuar escolhendo produtos":"Continuar para entrega e pagamento"}</button><section class="store-checkout-form" ${checkoutOpen?"":"hidden"}><h3>Entrega e pagamento</h3><div class="store-checkout-steps">
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
            ${paymentOption("PIX", "PIX", "Escolha a forma", formValues.payment)}
            ${paymentOption("Debito", "Debito", "Escolha a forma", formValues.payment)}
            ${paymentOption("Credito", "Credito", "Escolha a forma", formValues.payment)}
          </div>
          <button class="btn primary full" id="send-online-order" ${cart.length && !deliveryBlocked && !orderInFlight ? "" : "disabled"}>${orderInFlight ? "Enviando pedido..." : deliveryBlocked ? "Entrega indisponivel" : "Finalizar pedido"}</button>
        </section></aside>
      </section>
    </main>`;
  bind();
  filterCategory(activeCategory);
}

function cartLine(item, index) {
  return `<div class="cart-line">
    <div style="${item.parentLineId?'padding-left:20px':''}"><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(item.unit)}</small>${ItemPreparation.html(item)}</div>
    ${item.parentLineId?'<small class="store-complement-label">Complemento da Tortela · '+item.qty+'</small>':`<div class="cart-line-actions">
      <button class="btn" data-cart-minus="${index}">-</button>
      <span>${item.qty}</span>
      <button class="btn" data-cart-plus="${index}">+</button>
      <button class="btn danger" data-cart-remove="${index}">Remover</button>
    </div>`}
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
  const category=productCategory(product),tortela=ItemPreparation.isTortela(product);
  const img=product.photo?`<img loading="lazy" src="${escapeHtml(product.photo)}" alt="${escapeHtml(product.description)}">`:`<img class="store-card-logo" src="./assets/tortela/logo-tortela.gif" alt="Tortela">`;
  return `<article class="store-product" data-category="${escapeHtml(category)}" data-name="${escapeHtml(product.description.toLowerCase())}"><div class="store-product-media">${img}</div><div class="store-product-body"><small>${category}</small><h2>${escapeHtml(product.description)}</h2><p>${tortela?'Escolha o acompanhamento e a cobertura no próximo passo.':'Adicione ao seu pedido com um clique.'}</p><div class="store-price"><strong>${money(product.price)}</strong><button class="btn primary" data-add-product="${product.id}" data-tenant="${escapeHtml(product.tenantCode)}">${tortela?'Escolher Tortela':'Adicionar'}</button></div></div></article>`;
}
function addConfiguredProduct(product,preparation={}){
  const split=ItemPreparation.split(product,preparation,1,catalog.products);
  const parent=ItemPreparation.attach(cart,{productId:product.id,tenantCode:product.tenantCode,description:product.description,unit:product.unitMeasure,price:product.price,qty:1,...split.preparation});
  for(const component of split.components)ItemPreparation.attach(cart,{productId:component.id,tenantCode:component.tenantCode,description:component.description,unit:component.unitMeasure,price:component.price,qty:1},parent.lineId);
  ItemPreparation.validateSale(cart);render();
}
function configureProduct(product){
  if(!ItemPreparation.isTortela(product)){addConfiguredProduct(product);return;}
  const choices=ItemPreparation.choices(product,catalog.products),steps=[];
  if(choices.extras.length)steps.push({key:'extras',title:'Escolha 1 acompanhamento',options:['Sem acompanhamento',...choices.extras]});
  if(choices.coverage.length)steps.push({key:'coverage',title:'Escolha a cobertura',options:choices.coverage});
  if(!steps.length){addConfiguredProduct(product);return;}
  const dialog=document.createElement('dialog');dialog.className='store-configurator';dialog.setAttribute('aria-label','Personalizar Tortela');let step=0;const selected={};
  const close=()=>{dialog.close();dialog.remove();};
  function draw(){
    const current=steps[step];
    dialog.innerHTML=`<header><small>MONTE SUA TORTELA · PASSO ${step+1} DE ${steps.length}</small><h2>${escapeHtml(product.description)}</h2><p>${current.title}</p></header><div class="store-choice-grid">${current.options.map((option,i)=>`<button type="button" class="store-choice ${selected[current.key]===option?'selected':''}" data-choice="${i}" aria-pressed="${selected[current.key]===option}"><span>${escapeHtml(option.replace(/\s*-\s*TOPPING$/i,'').replace(/^COBERTURA - /i,''))}</span><small>${i===0&&current.key==='extras'?'Sem adicional':optionPrice(option)}</small></button>`).join('')}</div><footer><button class="btn danger" data-cancel>Cancelar</button>${step?'<button class="btn" data-back>Voltar</button>':''}<button class="btn primary" data-next ${selected[current.key]?'':'disabled'}>${step===steps.length-1?'Adicionar à sacola':'Escolher cobertura →'}</button></footer>`;
    dialog.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected[current.key]=current.options[Number(button.dataset.choice)];draw();});
    dialog.querySelector('[data-cancel]').onclick=close;
    dialog.querySelector('[data-back]')?.addEventListener('click',()=>{step--;draw();});
    dialog.querySelector('[data-next]').onclick=()=>{if(!selected[current.key])return;if(step<steps.length-1){step++;draw();}else{close();addConfiguredProduct(product,{coverage:selected.coverage||'',extras:selected.extras&&selected.extras!=='Sem acompanhamento'?[selected.extras]:[]});}};
  }
  function optionPrice(option){const p=catalog.products.find(p=>p.description===option&&p.tenantCode===product.tenantCode);return p?'+ '+money(p.price):'Selecionar';}
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});document.body.append(dialog);draw();dialog.showModal();
}

function bind() {
  byId("store-checkout-toggle")?.addEventListener("click",()=>{checkoutOpen=!checkoutOpen;render();if(checkoutOpen)document.querySelector(".store-checkout-form")?.scrollIntoView({behavior:"smooth",block:"start"});});
  byId("store-refresh")?.addEventListener("click", loadCatalog);
  byId("store-cep")?.addEventListener("input", (event) => {
    const cep = String(event.target.value || "").replace(/\D/g, "");
    if (cep.length === 8) loadCatalog();
  });
  byId("store-cep")?.addEventListener("blur", loadCatalog);
  byId("store-search")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") filterCategory(activeCategory);
  });
  byId("store-search")?.addEventListener("input",()=>filterCategory(activeCategory));
  byId("store-focus-cep")?.addEventListener("click", () => byId("store-cep")?.focus());
  document.querySelectorAll("[data-store-category]").forEach((button) => button.addEventListener("click", () => filterCategory(button.dataset.storeCategory)));
  document.querySelectorAll("[data-add-product]").forEach((button) => button.addEventListener("click", () => {
    const product = catalog.products.find((item) => Number(item.id) === Number(button.dataset.addProduct) && item.tenantCode === button.dataset.tenant);
    if (!product) return;
    configureProduct(product);
  }));
  document.querySelectorAll("[data-cart-minus]").forEach((button) => button.addEventListener("click", () => {
    const item = cart[Number(button.dataset.cartMinus)];
    if (!item) return;
    const previousQty=item.qty;item.qty -= 1;
    if(item.lineId)cart.filter(row=>row.parentLineId===item.lineId).forEach(row=>row.qty=row.qty/previousQty*item.qty);
    if (item.qty <= 0) cart = cart.filter((row) => row !== item&&(!item.lineId||row.parentLineId!==item.lineId));
    render();
  }));
  document.querySelectorAll("[data-cart-plus]").forEach((button) => button.addEventListener("click", () => {
    const item = cart[Number(button.dataset.cartPlus)];
    if (item) {const previousQty=item.qty;item.qty += 1;if(item.lineId)cart.filter(row=>row.parentLineId===item.lineId).forEach(row=>row.qty=row.qty/previousQty*item.qty);}
    render();
  }));
  document.querySelectorAll("[data-cart-remove]").forEach((button) => button.addEventListener("click", () => {
    const item=cart[Number(button.dataset.cartRemove)];cart=cart.filter(row=>row!==item&&(!item?.lineId||row.parentLineId!==item.lineId));
    render();
  }));
  document.querySelectorAll('input[name="payment-method"]').forEach((input) => input.addEventListener("change", render));
  byId("send-online-order")?.addEventListener("click", sendOrder);
  byId("store-jump-cart")?.addEventListener("click", () => byId("store-cart")?.scrollIntoView({ behavior: "smooth" }));
}

function filterCategory(category) {
  activeCategory=category;
  const search=fieldValue("store-search").toLowerCase().trim();
  document.querySelectorAll("[data-store-category]").forEach((button) => button.classList.toggle("active", button.dataset.storeCategory === category));
  document.querySelectorAll(".store-product").forEach((card) => {
    card.hidden = (category !== "Todos" && card.dataset.category !== category)||!card.dataset.name.includes(search);
  });
}

async function loadCatalog() {
  if (catalogLoadInFlight) return catalogLoadInFlight;
  const cep = byId("store-cep")?.value || "";
  const q = byId("store-search")?.value || "";
  const unidade = params.get("unidade") || "";
  catalogWarning = "";
  catalogLoadInFlight = (async () => {
    try {
      const nextCatalog = await api(`/api/public/store/catalog?cep=${encodeURIComponent(cep)}&unidade=${encodeURIComponent(unidade)}`);
      const firstLoad=!catalog.products.length;
      catalog = nextCatalog;
      if(catalog.nearest?.tenantCode)catalog.products=catalog.products.filter(p=>p.tenantCode===catalog.nearest.tenantCode);
      if(firstLoad)activeCategory="Tortelas";
      cart = cart.filter(item => catalog.products.some(product => Number(product.id) === Number(item.productId) && product.tenantCode === item.tenantCode));
      if (catalog.nearest) cart = cart.filter((item) => item.tenantCode === catalog.nearest.tenantCode);
      fillAddressFromCatalog();
    } catch (error) {
      if (!catalog.products.length) throw error;
      catalogWarning = `Nao foi possivel atualizar agora. Mantivemos o ultimo cardapio carregado. ${error.message}`;
    } finally {
      catalogLoadInFlight = null;
      render();
    }
  })();
  render();
  return catalogLoadInFlight;
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
  if (orderInFlight) return;
  const tenantCode = catalog.nearest?.tenantCode || cart[0]?.tenantCode || "";
  orderInFlight = true;
  render();
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
        items: ItemPreparation.ordered(cart).map((item) => ({ productId: item.productId, qty: item.qty, coverage: item.coverage, extras:item.extras, lineId:item.lineId,parentLineId:item.parentLineId }))
      })
    });
    cart = [];
    render();
    const paymentLink = result.paymentInfo?.paymentUrl ? `\nPagamento: ${result.paymentInfo.paymentUrl}` : "";
    alert(`Pedido ${result.orderId} enviado para ${result.unit}. Total ${money(result.total)}. Pagamento: ${result.payment}.${paymentLink}`);
  } catch (error) {
    alert(error.message);
  } finally {
    orderInFlight = false;
    render();
  }
}

loadCatalog().catch((error) => {
  byId("store-app").innerHTML = `<main class="store-main"><div class="store-empty">${escapeHtml(error.message)}</div></main>`;
});

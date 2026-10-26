let catalog = { products: [], units: [], nearest: null };
let cart = [];
const params = new URLSearchParams(location.search);
let catalogLoadInFlight = null;
let catalogWarning = "";
let orderInFlight = false;
let activeCategory = "Tortelas";
let checkoutOpen = false;
let locationOpen = false;
let storeNotice = "";

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

function storeIcon(name, cls='') {
 const paths={bag:'<path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',spark:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/>',check:'<path d="m5 12 4 4L19 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',cup:'<path d="M7 7h10l-1 14H8L7 7ZM5 7h14M13 7l2-5h4"/>'};
 return `<svg class="store-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.spark}</svg>`;
}
function productArt(product){
 const category=productCategory(product),name=String(product.description).toLowerCase();
 if(product.photo)return `<img loading="lazy" src="${escapeHtml(product.photo)}" alt="${escapeHtml(product.description)}">`;
 if(category==='Bebidas')return `<div class="store-drink-art">${storeIcon('cup')}<span>BEBIDAS</span></div>`;
 const color=/pistache|lima|limã/.test(name)?'#b0bd78':/morango/.test(name)?'#e8a1a0':/ninho|branco/.test(name)?'#f2ddb4':'#77513f';
 return `<svg class="store-dessert-art" viewBox="0 0 180 160" fill="none" aria-hidden="true"><ellipse cx="90" cy="141" rx="52" ry="8" fill="#4a2d2414"/><rect x="82" y="109" width="16" height="39" rx="8" fill="#d9b48a" transform="rotate(-12 90 120)"/><path d="M78 24c4-7 12-7 17 0l48 83c5 9 1 16-9 16H47c-10 0-14-7-9-16L78 24Z" fill="${color}"/><path d="M80 29c3-5 8-5 11 0l45 79c3 5 0 8-5 8H49c-5 0-8-3-5-8L80 29Z" fill="white" opacity=".12"/><path d="m58 83 57-8m-66 24 77-11" stroke="#fff1d1" stroke-width="5" stroke-linecap="round" opacity=".7"/><circle cx="88" cy="50" r="3" fill="#fff1d1"/><circle cx="70" cy="69" r="3" fill="#fff1d1"/><circle cx="110" cy="101" r="3" fill="#fff1d1"/></svg>`;
}
function searchText(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function displayProductName(value){return String(value||'').toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g,c=>c.toLocaleUpperCase('pt-BR'));}

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
    <div class="store-announcement">A sua Tortela. O seu momento. <span>Peça online, escolha do seu jeito.</span></div>
    <header class="store-header"><div class="store-topbar">
      <a class="store-brand" href="./loja.html" aria-label="Tortela início"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela"><span>LOJA ONLINE</span></a>
      <nav class="store-header-nav" aria-label="Navegação principal"><a href="#store-products-area">Cardápio</a><a href="#store-how">Como pedir</a></nav>
      <div class="store-header-actions"><button class="store-location" id="store-focus-cep">${storeIcon('pin')}<span><small>Sua unidade</small><strong>${currentCep?escapeHtml(currentCep):'Informe seu CEP'}</strong></span></button>
      <button class="store-chip" id="store-jump-cart" aria-label="Ver sacola">${storeIcon('bag')}<span>Sacola <b>${itemCount}</b></span><strong>${money(total)}</strong></button></div>
    </div></header>
    <main class="store-main">
      <section class="store-radius-intro" aria-labelledby="store-radius-title">${storeIcon('pin')}<div><h2 id="store-radius-title">Antes de pedir: compras online somente em até 10 km da loja mais próxima</h2><p>Esse cuidado ajuda a preservar a qualidade da sua Tortela e proporcionar uma melhor experiência com o produto. Informe seu CEP para conferir se atendemos seu endereço antes de montar o pedido.</p></div><button type="button" id="store-check-radius">Consultar meu CEP ${storeIcon('arrow')}</button></section>
      <section class="store-hero" aria-labelledby="store-hero-title"><div class="store-hero-copy"><span class="store-eyebrow"><i></i> MUITO MAIS QUE UMA SOBREMESA</span><h1 id="store-hero-title">Seu momento<br>pede uma <em>Tortela.</em></h1><p>Escolha seu sabor, combine o topping e finalize com a cobertura que você ama.</p><div class="store-hero-actions"><a class="store-cta" href="#store-products-area">Quero a minha ${storeIcon('arrow')}</a><span>Do seu jeito.<br>Em poucos cliques.</span></div><div class="store-hero-footnote">${storeIcon('spark')} Pequenas escolhas. Um grande momento.</div></div><div class="store-hero-media"><img fetchpriority="high" decoding="async" width="1536" height="1024" src="./assets/tortela/store-campaign-v1.png" alt="Tortelas com cobertura de chocolate e chocolate branco sobre uma base clara"><div class="store-hero-stamp">ESCOLHA.<br>COMBINE.<br><strong>APAIXONE-SE.</strong></div><small>Imagem ilustrativa</small></div></section>
      <section class="store-how" id="store-how" aria-label="Como fazer seu pedido"><div><b>01</b><span><strong>Encontre seu sabor</strong><small>Uma Tortela para cada vontade.</small></span></div><div><b>02</b><span><strong>Deixe com a sua cara</strong><small>Sua cobertura e um topping.</small></span></div><div><b>03</b><span><strong>Escolha como receber</strong><small>Entrega ou retirada na unidade.</small></span></div></section>
      <details class="store-unit-panel" id="store-unit-panel" ${locationOpen?'open':''}><summary>${storeIcon('pin')}<span><strong>${catalog.nearest?escapeHtml(publicUnitName(catalog.nearest)):'Onde você vai aproveitar sua Tortela?'}</strong><small>${currentCep?'CEP '+escapeHtml(currentCep):'Informe seu CEP para encontrar a unidade que atende você.'}</small></span><b>Alterar unidade ${storeIcon('arrow')}</b></summary><div class="store-unit-content"><div><label for="store-cep">CEP de entrega</label><div class="store-cep-row"><input id="store-cep" inputmode="numeric" maxlength="9" autocomplete="postal-code" value="${escapeHtml(currentCep)}" placeholder="00000-000"><button class="btn primary" id="store-refresh" ${catalogLoadInFlight?'disabled':''}>${catalogLoadInFlight?'Buscando…':'Encontrar unidade'}</button></div></div><p class="store-unit-message ${deliveryBlocked?'blocked':''}" role="status">${escapeHtml(catalog.deliveryMessage||'Consulte a disponibilidade de entrega pelo seu CEP.')}</p></div></details>
      ${currentCep.replace(/\D/g,'').length===8?`<section class="store-coverage-result ${deliveryBlocked?'blocked':deliveryKnown?'available':'checking'}" role="status">${storeIcon(deliveryBlocked?'pin':'check')}<div><strong>${catalogLoadInFlight?'Verificando a unidade mais próxima…':deliveryBlocked?'Ainda não atendemos este endereço':deliveryKnown?'Sua Tortela está por perto!':'Verifique seu endereço'}</strong><p>${escapeHtml(catalogLoadInFlight?'Consultando o atendimento em um raio de até 10 km.':catalog.deliveryMessage||'Consulte seu CEP para continuar.')}</p></div></section>`:''}
      ${catalogWarning?`<p class="store-warning" role="status">${escapeHtml(catalogWarning)}</p>`:''}
      <section class="store-catalog-intro"><div><span class="store-eyebrow">ESCOLHA O SEU MOMENTO</span><h2>Qual vai ser a sua?</h2><p>Sabores, combinações e aquele toque que é só seu.</p></div><label class="store-searchbar" for="store-search">${storeIcon('search')}<input id="store-search" value="${escapeHtml(currentSearch)}" placeholder="Buscar no cardápio" type="search"></label></section>
      <nav class="store-categories" aria-label="Categorias do cardápio">${categories().map(category=>`<button class="${category===activeCategory?'active':''}" data-store-category="${escapeHtml(category)}" aria-pressed="${category===activeCategory}">${escapeHtml(category)}<small>${category==='Todos'?menuProducts().length:menuProducts().filter(p=>productCategory(p)===category).length}</small></button>`).join('')}</nav>
      <section class="store-layout">
        <section class="store-menu" id="store-products-area">
          <div class="store-section-title">
            <div>
              <h2 id="store-category-title">${escapeHtml(activeCategory)}</h2>
            </div>
            <small id="store-results-count"></small>
          </div>
          <div class="store-products">
            ${menuProducts().map(productCard).join("")}<div class="store-empty" id="store-no-results" ${menuProducts().length?'hidden':''}>${catalogLoadInFlight?'Carregando nosso cardápio…':'Nenhum produto encontrado. Experimente outro nome ou categoria.'}</div>
          </div>
        </section>

        <aside class="store-cart" id="store-cart">
          <div class="store-cart-title">
            <div>
              <span>${storeIcon('bag')} Sua sacola</span>
              <small>${itemCount} item(ns) selecionado(s)</small>
            </div>
            <strong>${money(total)}</strong>
          </div>
          ${cart.length ? cart.map((item, index) => cartLine(item, index)).join("") : `<div class="store-bag-empty">${storeIcon('bag')}<strong>Seu próximo momento<br>começa aqui.</strong><p>Escolha uma Tortela e monte<br>do seu jeito.</p></div>`}
          <div class="store-total"><span>Total</span><strong>${money(total)}</strong></div>
          <button class="btn primary full" id="store-checkout-toggle" ${cart.length&&!deliveryBlocked&&!catalogLoadInFlight?"":"disabled"}>${checkoutOpen?"Continuar escolhendo produtos":"Continuar pedido"}</button><section class="store-checkout-form" ${checkoutOpen?"":"hidden"}><h3>Entrega e pagamento</h3><div class="store-checkout-steps">
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
            ${paymentOption("Debito", "Débito", "Escolha a forma", formValues.payment)}
            ${paymentOption("Credito", "Crédito", "Escolha a forma", formValues.payment)}
          </div>
          <button class="btn primary full" id="send-online-order" ${cart.length && !deliveryBlocked && !orderInFlight ? "" : "disabled"}>${orderInFlight ? "Enviando pedido..." : deliveryBlocked ? "Entrega indisponivel" : "Enviar pedido"}</button>
        </section></aside>
      </section>
      <footer class="store-footer"><a href="./loja.html" aria-label="Tortela início"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela"></a><p>Seu sabor. Sua combinação. Seu momento.</p><span>Pedidos para entrega ou retirada · Tortela Online</span><a href="#store-products-area">Voltar ao cardápio ↑</a></footer>
      <div class="store-added-notice" role="status" aria-live="polite">${escapeHtml(storeNotice)}</div><p class="store-map-attribution">Raio geográfico de atendimento: 10 km · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a> · Photon</p>
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
 const category=productCategory(product),tortela=ItemPreparation.isTortela(product),title=displayProductName(product.description);
 return `<article class="store-product" data-category="${escapeHtml(category)}" data-name="${escapeHtml(searchText(product.description))}"><div class="store-product-media">${productArt(product)}${!product.photo?'<small>Ilustração</small>':''}</div><div class="store-product-body"><small>${escapeHtml(category)}</small><h3>${escapeHtml(title)}</h3><p>${tortela?'O sabor é seu. A combinação também.':'Complete seu momento Tortela.'}</p><div class="store-price"><strong>${money(product.price)}</strong><button class="btn primary" ${catalog.deliveryAvailable===false?'disabled':''} data-add-product="${product.id}" data-tenant="${escapeHtml(product.tenantCode)}" aria-label="${tortela?'Personalizar':'Adicionar'} ${escapeHtml(title)}">${tortela?'Personalizar':'Adicionar'} ${storeIcon('plus')}</button></div></div></article>`;
}
function addConfiguredProduct(product,preparation={}){
  const split=ItemPreparation.split(product,preparation,1,catalog.products);
  const parent=ItemPreparation.attach(cart,{productId:product.id,tenantCode:product.tenantCode,description:product.description,unit:product.unitMeasure,price:product.price,qty:1,...split.preparation});
  for(const component of split.components)ItemPreparation.attach(cart,{productId:component.id,tenantCode:component.tenantCode,description:component.description,unit:component.unitMeasure,price:component.price,qty:1},parent.lineId);
  ItemPreparation.validateSale(cart);storeNotice=displayProductName(product.description)+" adicionado à sacola.";render();
}
function configureProduct(product){
  if(!ItemPreparation.isTortela(product)){addConfiguredProduct(product);return;}
  const choices=ItemPreparation.choices(product,catalog.products),steps=[];
  if(choices.extras.length)steps.push({key:'extras',title:'Escolha 1 topping',options:['Sem topping',...choices.extras]});
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
    dialog.querySelector('[data-next]').onclick=()=>{if(!selected[current.key])return;if(step<steps.length-1){step++;draw();}else{close();addConfiguredProduct(product,{coverage:selected.coverage||'',extras:selected.extras&&selected.extras!=='Sem topping'?[selected.extras]:[]});}};
  }
  function optionPrice(option){const p=catalog.products.find(p=>p.description===option&&p.tenantCode===product.tenantCode);return p?'+ '+money(p.price):'Selecionar';}
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});document.body.append(dialog);draw();dialog.showModal();
}

function bind() {
  byId("store-checkout-toggle")?.addEventListener("click",()=>{
    if(!checkoutOpen&&String(fieldValue('store-cep')).replace(/\D/g,'').length!==8){locationOpen=true;byId('store-unit-panel').open=true;byId('store-unit-panel').scrollIntoView({behavior:'smooth',block:'center'});byId('store-cep').focus({preventScroll:true});return;}
    checkoutOpen=!checkoutOpen;render();if(checkoutOpen)document.querySelector(".store-checkout-form")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
  byId("store-refresh")?.addEventListener("click", loadCatalog);
  byId("store-cep")?.addEventListener("input", (event) => {
    const cep = String(event.target.value || "").replace(/\D/g, "");
    if (cep.length === 8) loadCatalog();
  });

  byId("store-search")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") filterCategory(activeCategory);
  });
  byId("store-search")?.addEventListener("input",()=>filterCategory(activeCategory));
  byId("store-unit-panel")?.addEventListener("toggle",event=>{locationOpen=event.target.open;});
  ["store-focus-cep","store-check-radius"].forEach(id=>byId(id)?.addEventListener("click", () => {byId("store-unit-panel").open=true;byId("store-unit-panel").scrollIntoView({behavior:"smooth",block:"center"});byId("store-cep")?.focus({preventScroll:true});}));
  document.querySelectorAll("[data-store-category]").forEach((button) => button.addEventListener("click", () => {byId("store-search").value="";filterCategory(button.dataset.storeCategory);}));
  document.querySelectorAll("[data-add-product]").forEach((button) => button.addEventListener("click", () => {
    const product = catalog.products.find((item) => Number(item.id) === Number(button.dataset.addProduct) && item.tenantCode === button.dataset.tenant);
    if (!product) return;
    if(catalog.deliveryAvailable===false||catalogLoadInFlight)return;
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
  const search=searchText(fieldValue("store-search"));
  document.querySelectorAll("[data-store-category]").forEach((button) => (button.classList.toggle("active", button.dataset.storeCategory === category),button.setAttribute("aria-pressed",String(button.dataset.storeCategory===category))));
  let visible=0;
  document.querySelectorAll(".store-product").forEach((card) => {
    card.hidden = (category !== "Todos" && card.dataset.category !== category)||!card.dataset.name.includes(search);
    if(!card.hidden)visible++;
  });
  if(byId("store-category-title"))byId("store-category-title").textContent=category;
  if(byId("store-results-count"))byId("store-results-count").textContent=visible+(visible===1?" opção":" opções");
  if(byId("store-no-results"))byId("store-no-results").hidden=visible>0;
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
      const previousCartCount=cart.length;
      cart = cart.filter(item => catalog.products.some(product => Number(product.id) === Number(item.productId) && product.tenantCode === item.tenantCode));
      if (catalog.nearest) cart = cart.filter((item) => item.tenantCode === catalog.nearest.tenantCode);
      if(previousCartCount&&cart.length<previousCartCount)storeNotice="A unidade de atendimento mudou. Confira os produtos e monte sua sacola na loja indicada.";
      fillAddressFromCatalog();
    } catch (error) {
      catalog.deliveryAvailable=false;catalog.deliveryMessage="Não foi possível confirmar o atendimento. Confira o CEP e tente novamente antes de enviar o pedido.";
      if (!catalog.products.length) throw error;
      catalogWarning = `Nao foi possivel atualizar agora. Mantivemos o ultimo cardapio carregado. ${error.message}`;
    } finally {
      const changedCep=String(fieldValue("store-cep")).replace(/\D/g,"")!==String(cep).replace(/\D/g,"");
      catalogLoadInFlight = null;
      render();
      if(changedCep)loadCatalog().catch(()=>{});
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
  if(catalog.deliveryAvailable!==true){locationOpen=true;render();byId("store-unit-panel").scrollIntoView({behavior:"smooth",block:"center"});return;}
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
  catalogWarning="Não foi possível carregar o cardápio agora. Tente novamente em Encontrar unidade. "+error.message;
  render();
});

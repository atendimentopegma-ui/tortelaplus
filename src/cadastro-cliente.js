const params = new URLSearchParams(location.search);
const tenantCode = params.get("unidade") || "";
let unit = null;
let nearestUnit = null;

function byId(id) {
  return document.getElementById(id);
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

async function boot() {
  if (tenantCode) {
    try {
      unit = await api(`/api/public/unit/${encodeURIComponent(tenantCode)}`);
    } catch (error) {
      renderInvalid(error.message);
      return;
    }
  }
  render();
}

function renderInvalid(message) {
  byId("app").innerHTML = `<main class="public-register-shell"><section class="public-register-card public-register-error"><h1>Cadastro indisponivel</h1><p>${escapeHtml(message)}</p></section></main>`;
}

function render() {
  byId("app").innerHTML = `
    <main class="public-register-shell">
      <section class="public-register-card">
        <div class="public-register-hero">
          <div class="public-logo-plate"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela" /></div>
          <div class="public-register-copy">
            <span>${unit ? "Unidade selecionada" : "Cadastro da rede"}</span>
            <h1>${escapeHtml(unit ? unit.tradeName : "Encontre sua Tortela mais proxima")}</h1>
            <p>Complete seus dados uma unica vez. O sistema localiza a loja indicada pelo seu CEP e deixa seu cadastro pronto para pedidos, entregas e ofertas da rede.</p>
          </div>
          <div class="public-register-steps">
            <strong>1</strong><span>Informe seu CEP</span>
            <strong>2</strong><span>Confira a loja sugerida</span>
            <strong>3</strong><span>Conclua o cadastro</span>
          </div>
        </div>
        <form id="customer-form" class="public-register-form">
          <div class="public-form-head">
            <span>${unit ? "Cadastro de cliente" : "Minha loja mais proxima"}</span>
            <h2>Dados para atendimento</h2>
          </div>
          <div class="public-form-grid">
            <div class="field wide"><label>Nome completo</label><input id="name" required autocomplete="name" /></div>
            <div class="field"><label>CPF</label><input id="document" inputmode="numeric" maxlength="14" required autocomplete="off" /></div>
            <div class="field"><label>Data de nascimento</label><input id="birth-date" type="date" required autocomplete="bday" /></div>
            <div class="field"><label>Telefone / WhatsApp</label><input id="phone" inputmode="tel" required autocomplete="tel" /></div>
            <div class="field cep-field"><label>CEP</label><input id="cep" inputmode="numeric" maxlength="9" required placeholder="Digite o CEP" autocomplete="postal-code" /></div>
            <div class="field wide"><label>Endereco</label><input id="address" required autocomplete="street-address" /></div>
            <div class="field"><label>Numero</label><input id="number" required autocomplete="address-line2" /></div>
            <div class="field"><label>Complemento</label><input id="complement" autocomplete="address-line3" /></div>
            <div class="field"><label>Bairro</label><input id="district" required /></div>
            <div class="field"><label>Cidade</label><input id="city" required autocomplete="address-level2" /></div>
            <div class="field uf-field"><label>UF</label><input id="uf" maxlength="2" required autocomplete="address-level1" /></div>
          </div>
          <div id="nearest-store" class="public-nearest" hidden></div>
          <label class="check-row public-consent public-whatsapp-consent"><input id="whatsapp-group-authorized" type="checkbox" /> Autorizo que coloque meu numero de celular no grupo da Tortela.</label>
          <label class="check-row public-consent"><input id="consent" type="checkbox" required /> Autorizo o uso dos meus dados para cadastro, atendimento de pedidos, comunicacoes operacionais e ofertas da rede Tortela.</label>
          <button class="btn primary public-submit" type="submit">Concluir cadastro</button>
          <div id="message" class="public-message" hidden></div>
        </form>
      </section>
    </main>`;
  bindCepAutocomplete();
  byId("customer-form").addEventListener("submit", submit);
}

function bindCepAutocomplete() {
  const input = byId("cep");
  let lastCep = "";
  const run = () => {
    const cep = digits(input.value);
    if (cep.length !== 8 || cep === lastCep) return;
    lastCep = cep;
    lookupCep().catch(() => undefined);
    refreshNearestStore().catch(() => undefined);
  };
  input.addEventListener("input", run);
  input.addEventListener("blur", run);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") run();
  });
}

async function lookupCep() {
  const cep = digits(byId("cep").value);
  if (cep.length !== 8) return;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error("CEP nao encontrado.");
    byId("address").value = data.logradouro || "";
    byId("district").value = data.bairro || "";
    byId("city").value = data.localidade || "";
    byId("uf").value = data.uf || "";
    byId("number").focus();
    await refreshNearestStore();
  } catch (error) {
    show(error.message || "Nao foi possivel consultar o CEP.", true);
  }
}

async function refreshNearestStore() {
  const panel = byId("nearest-store");
  const cep = digits(byId("cep")?.value);
  if (!panel || cep.length !== 8) return;
  const query = unit ? `cep=${encodeURIComponent(cep)}&unidade=${encodeURIComponent(unit.tenantCode)}` : `cep=${encodeURIComponent(cep)}`;
  const catalog = await api(`/api/public/store/catalog?${query}`);
  nearestUnit = catalog.nearest || null;
  if (!nearestUnit) {
    panel.hidden = false;
    panel.textContent = "Nenhuma unidade Tortela disponivel para este CEP no momento.";
    return;
  }
  panel.hidden = false;
  panel.innerHTML = `<strong>Minha loja mais proxima:</strong> ${escapeHtml(nearestUnit.tradeName)}<span>${escapeHtml([nearestUnit.city, nearestUnit.uf, nearestUnit.cep].filter(Boolean).join(" - "))}</span>`;
}

function show(message, error = false) {
  const element = byId("message");
  element.hidden = false;
  element.className = `public-message ${error ? "error" : "success"}`;
  element.textContent = message;
}

async function submit(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const selectedTenant = unit?.tenantCode || nearestUnit?.tenantCode || "";
    if (!selectedTenant) {
      await refreshNearestStore();
      if (!nearestUnit?.tenantCode) throw new Error("Informe o CEP para localizar sua loja Tortela mais proxima.");
    }
    const result = await api(unit ? `/api/public/unit/${encodeURIComponent(unit.tenantCode)}/customers` : "/api/public/customers", {
      method: "POST",
      body: JSON.stringify({
        tenantCode: selectedTenant || nearestUnit?.tenantCode,
        name: byId("name").value,
        document: byId("document").value,
        birthDate: byId("birth-date").value,
        phone: byId("phone").value,
        whatsappGroupAuthorized: byId("whatsapp-group-authorized").checked,
        cep: byId("cep").value,
        address: byId("address").value,
        number: byId("number").value,
        complement: byId("complement").value,
        district: byId("district").value,
        city: byId("city").value,
        uf: byId("uf").value,
        consent: byId("consent").checked
      })
    });
    event.target.reset();
    const whatsappMessage = result.whatsappGroup?.status === "Enviado"
      ? " Autorizacao de grupo recebida e enviada automaticamente ao WhatsApp."
      : result.whatsappGroup?.status
        ? ` Autorizacao de grupo registrada: ${result.whatsappGroup.status}.`
        : "";
    show(`${result.message}${whatsappMessage}`);
  } catch (error) {
    show(error.message, true);
  } finally {
    button.disabled = false;
  }
}

boot();

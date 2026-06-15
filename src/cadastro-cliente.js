const params = new URLSearchParams(location.search);
const tenantCode = params.get("unidade") || "";
let unit = null;

function byId(id) {
  return document.getElementById(id);
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erro ${response.status}`);
  return payload;
}

async function boot() {
  if (!tenantCode) return renderInvalid("Este link nao identifica uma unidade Tortela.");
  try {
    unit = await api(`/api/public/unit/${encodeURIComponent(tenantCode)}`);
    render();
  } catch (error) {
    renderInvalid(error.message);
  }
}

function renderInvalid(message) {
  byId("app").innerHTML = `<main class="public-register-shell"><section class="public-register-card"><h1>Cadastro indisponivel</h1><p>${message}</p></section></main>`;
}

function render() {
  byId("app").innerHTML = `
    <main class="public-register-shell">
      <section class="public-register-card">
        <div class="public-register-brand"><img src="./assets/tortela/logo-tortela.gif" alt="Tortela" /><div><strong>${unit.tradeName}</strong><span>Cadastro de cliente</span></div></div>
        <form id="customer-form">
          <div class="grid two">
            <div class="field"><label>Nome completo</label><input id="name" required /></div>
            <div class="field"><label>CPF</label><input id="document" inputmode="numeric" maxlength="14" required /></div>
            <div class="field"><label>Telefone / WhatsApp</label><input id="phone" inputmode="tel" required /></div>
            <div class="field"><label>CEP</label><div class="field-action"><input id="cep" inputmode="numeric" maxlength="9" required /><button class="btn" id="lookup-cep" type="button">Buscar CEP</button></div></div>
            <div class="field"><label>Endereco</label><input id="address" required /></div>
            <div class="field"><label>Numero</label><input id="number" required /></div>
            <div class="field"><label>Complemento</label><input id="complement" /></div>
            <div class="field"><label>Bairro</label><input id="district" required /></div>
            <div class="field"><label>Cidade</label><input id="city" required /></div>
            <div class="field"><label>UF</label><input id="uf" maxlength="2" required /></div>
          </div>
          <label class="check-row public-consent"><input id="consent" type="checkbox" required /> Autorizo o uso destes dados para meu cadastro e atendimento nesta unidade.</label>
          <button class="btn primary public-submit" type="submit">Concluir cadastro</button>
          <div id="message" class="public-message" hidden></div>
        </form>
      </section>
    </main>`;
  byId("lookup-cep").addEventListener("click", lookupCep);
  byId("customer-form").addEventListener("submit", submit);
}

async function lookupCep() {
  const cep = digits(byId("cep").value);
  if (cep.length !== 8) return show("Informe um CEP com 8 digitos.", true);
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error("CEP nao encontrado.");
    byId("address").value = data.logradouro || "";
    byId("district").value = data.bairro || "";
    byId("city").value = data.localidade || "";
    byId("uf").value = data.uf || "";
    byId("number").focus();
  } catch (error) {
    show(error.message || "Nao foi possivel consultar o CEP.", true);
  }
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
    const result = await api(`/api/public/unit/${encodeURIComponent(tenantCode)}/customers`, {
      method: "POST",
      body: JSON.stringify({
        name: byId("name").value,
        document: byId("document").value,
        phone: byId("phone").value,
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
    show(result.message);
  } catch (error) {
    show(error.message, true);
  } finally {
    button.disabled = false;
  }
}

boot();

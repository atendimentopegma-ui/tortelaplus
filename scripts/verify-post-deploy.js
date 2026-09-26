const DEFAULT_APP_URL = "https://tortelaplus-app.onrender.com";
const DEFAULT_NETWORK_URL = "https://tortelaplus-rede.onrender.com";
const DEFAULT_TENANT = "cliente-exemplo";

const appUrl = normalizeBaseUrl(process.env.TORTELA_APP_URL || DEFAULT_APP_URL);
const networkUrl = normalizeBaseUrl(process.env.TORTELA_NETWORK_URL || DEFAULT_NETWORK_URL);
const tenantCode = process.env.TORTELA_TENANT || DEFAULT_TENANT;
const terminalToken = process.env.TORTELA_TERMINAL_TOKEN || "";

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(url, expectedStatus = 200) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  assert(response.status === expectedStatus, `${url} retornou ${response.status}, esperado ${expectedStatus}.`);
  return { response, text };
}

async function readJson(url, expectedStatus = 200) {
  const { text } = await readText(url, expectedStatus);
  return JSON.parse(text);
}

async function readJsonAllowingStatuses(url, expectedStatuses) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  assert(expectedStatuses.includes(response.status), `${url} retornou ${response.status}, esperado ${expectedStatuses.join(" ou ")}.`);
  return { status: response.status, payload: JSON.parse(text) };
}

async function checkHealth(baseUrl, label) {
  const health = await readJson(`${baseUrl}/api/health`);
  assert(health.ok === true, `${label}: health nao retornou ok=true.`);
  assert(health.product === "Tortela Plus", `${label}: produto inesperado no health.`);
  assert(health.databaseMode === "postgresql-schema-per-tenant", `${label}: banco publicado nao esta em PostgreSQL por tenant.`);
  assert(health.isolation === "postgresql-schema-per-tenant", `${label}: isolamento publicado nao esta por schema PostgreSQL.`);
  assert(health.deployment?.product === "Tortela Plus", `${label}: prontidao de deploy nao identifica Tortela Plus.`);
  assert(!health.deployment?.blockers?.length, `${label}: deploy possui bloqueadores: ${health.deployment.blockers.join(", ")}.`);
  return health;
}

async function checkPage(url, expectedText) {
  const { text } = await readText(url);
  assert(text.includes(expectedText), `${url} nao contem marcador esperado: ${expectedText}.`);
  assert(!/totem-botoes-acima-v(2[2-9]|[3-9]\d+)/i.test(text), `${url} contem sufixo de versao novo indevido.`);
  return text.length;
}

async function checkPublicApis() {
  const unit = await readJson(`${appUrl}/api/public/unit/${encodeURIComponent(tenantCode)}`);
  assert(unit.ok === true, "API publica da unidade nao retornou ok=true.");
  assert(unit.tenantCode === tenantCode, "API publica retornou unidade diferente da esperada.");

  const catalog = await readJson(`${appUrl}/api/public/store/catalog?unidade=${encodeURIComponent(tenantCode)}`);
  assert(catalog.ok === true, "Catalogo publico nao retornou ok=true.");
  assert(Array.isArray(catalog.products) && catalog.products.length > 0, "Catalogo publico esta vazio.");
  assert(catalog.products.some((product) => /tortela|torta|milk shake|combo/i.test(product.description || "")), "Catalogo publico nao contem produtos Tortela.");

  const tokenQuery = terminalToken ? `&terminalToken=${encodeURIComponent(terminalToken)}` : "";
  const boardResult = await readJsonAllowingStatuses(`${appUrl}/api/public/kiosk/orders?unidade=${encodeURIComponent(tenantCode)}${tokenQuery}`, terminalToken ? [200] : [200, 403]);
  if (boardResult.status === 403) {
    assert(/token/i.test(boardResult.payload.error || ""), "Painel publico retornou 403 por motivo diferente de token.");
    return;
  }
  const board = boardResult.payload;
  assert(board.ok === true, "Painel publico de pedidos nao retornou ok=true.");
  assert(Array.isArray(board.activeOrders), "Painel publico precisa retornar activeOrders.");
  assert(Array.isArray(board.history), "Painel publico precisa retornar history.");
}

async function main() {
  await checkHealth(appUrl, "app");
  await checkHealth(networkUrl, "rede");
  await checkPage(`${appUrl}/totem.html?unidade=${encodeURIComponent(tenantCode)}`, "totem-tortela.js");
  await checkPage(`${appUrl}/loja.html?unidade=${encodeURIComponent(tenantCode)}`, "loja-tortela.js");
  await checkPage(`${appUrl}/cozinha?unidade=${encodeURIComponent(tenantCode)}`, "cozinha-tortela.js");
  await checkPage(`${appUrl}/telao.html?unidade=${encodeURIComponent(tenantCode)}`, "telao-tortela.js");
  const centralSaas = await readText(`${appUrl}/src/central-saas.js`);
  assert(centralSaas.text.includes("Central SaaS Tortela Plus"), "Central SaaS publicada ainda nao identifica Tortela Plus.");
  assert(!/Pegma Plus|logo-pegmaplus|backup-geral-pegmaplus|pegmaplus-provider-state/i.test(centralSaas.text), "Central SaaS publicada ainda contem identificacao visual antiga.");
  await checkPublicApis();
  console.log(`OK - pos-deploy Tortela validado em ${appUrl} e ${networkUrl} para unidade ${tenantCode}.`);
}

main().catch((error) => {
  console.error(`FALHA - pos-deploy Tortela: ${error.message}`);
  process.exit(1);
});

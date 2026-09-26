const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function requestJson(baseUrl, route) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${route}`, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        let json = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch (error) {
          reject(new Error(`Resposta invalida em ${route}: ${raw}`));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(json.error || `HTTP ${res.statusCode}`));
          return;
        }
        resolve(json);
      });
    }).on("error", reject);
  });
}

function waitForServer(child, baseUrl) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Servidor temporario nao iniciou a tempo.")), 12000);
    child.once("exit", (code) => reject(new Error(`Servidor encerrou antes do teste. Codigo ${code}`)));
    const tick = () => {
      http.get(`${baseUrl}/api/health`, (res) => {
        res.resume();
        clearTimeout(timeout);
        resolve();
      }).on("error", () => setTimeout(tick, 200));
    };
    tick();
  });
}

const kioskSource = fs.readFileSync(path.join(root, "src", "totem-tortela.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
assert(kioskSource.includes("function productCoverageOptions"), "Totem precisa usar coberturas vindas do produto.");
assert(kioskSource.includes("function productToppingOptions"), "Totem precisa usar toppings/adicionais vindos do produto.");
assert(appSource.includes("product-coverage-options"), "Cadastro de produto precisa editar coberturas do totem.");
assert(appSource.includes("product-topping-options"), "Cadastro de produto precisa editar toppings/adicionais do totem.");
assert(serverSource.includes("toppingOptions"), "API do catalogo precisa expor toppings/adicionais.");

(async () => {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tortela-products-flow-"));
  const baseUrl = `http://localhost:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      PEGMA_DB_DIR: dataDir
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(child, baseUrl);
    const catalog = await requestJson(baseUrl, "/api/public/store/catalog?unidade=cliente-exemplo");
    const products = catalog.products || [];
    const tortela = products.find((product) => Number(product.id) === 7001);
    const combo = products.find((product) => Number(product.id) === 7003);
    const shake = products.find((product) => Number(product.id) === 7004);

    assert(tortela, "Catalogo nao retornou a torta no palito.");
    assert(combo, "Catalogo nao retornou o combo 4 Tortelas.");
    assert(shake, "Catalogo nao retornou o milk shake Tortela.");
    assert(tortela.hasCoverage && tortela.coverageOptions.includes("Chocolate ao leite"), "Produto Tortela nao preservou coberturas especificas.");
    assert(Array.isArray(tortela.toppingOptions) && tortela.toppingOptions.includes("Granulado"), "Produto Tortela nao retornou toppings.");
    assert(combo.isBundle && combo.coverageOptions.includes("Sortidas"), "Combo nao foi identificado com cobertura propria.");
    assert(Array.isArray(combo.toppingOptions) && combo.toppingOptions.includes("Sortidos"), "Combo nao retornou toppings proprios.");
    assert(shake.toppingOptions.includes("Chantilly"), "Produto bebida nao retornou topping especifico.");

    console.log("OK - catalogo de produtos, combos, coberturas e adicionais validado para o totem.");
  } finally {
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

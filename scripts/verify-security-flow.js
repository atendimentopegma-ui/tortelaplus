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

function requestJson(baseUrl, method, route, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = http.request(`${baseUrl}${route}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers
      }
    }, (res) => {
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
          const error = new Error(json.error || `HTTP ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.body = json;
          reject(error);
          return;
        }
        resolve(json);
      });
    });
    req.once("error", reject);
    req.write(payload);
    req.end();
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

function tenantFile(dataDir) {
  return path.join(dataDir, "tenants", "cliente-exemplo.json");
}

function readTenant(dataDir) {
  return JSON.parse(fs.readFileSync(tenantFile(dataDir), "utf8"));
}

function writeTenant(dataDir, state) {
  fs.writeFileSync(tenantFile(dataDir), JSON.stringify(state, null, 2));
}

(async () => {
  const appSource = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
  const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
  assert(appSource.includes("const publicTerminalGateDisabled = false"), "App deve operar links de totem como ambiente real.");
  assert(serverSource.includes("const publicTerminalAuthDisabled = false"), "Servidor deve permitir protecao por token publico.");
  assert(serverSource.includes("if (!expected) return true;"), "Servidor deve manter link direto enquanto a unidade nao tiver token salvo.");

  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tortela-security-flow-"));
  const baseUrl = `http://localhost:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      PEGMA_DB_DIR: dataDir,
      DATABASE_URL: ""
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(child, baseUrl);

    let invalidLoginBlocked = false;
    try {
      await requestJson(baseUrl, "POST", "/api/auth/login", {
        tenantCode: "cliente-exemplo",
        user: "Operador",
        password: "senha-errada"
      });
    } catch (error) {
      invalidLoginBlocked = error.statusCode === 403;
    }
    assert(invalidLoginBlocked, "Login com senha invalida nao foi bloqueado.");

    const login = await requestJson(baseUrl, "POST", "/api/auth/login", {
      tenantCode: "cliente-exemplo",
      user: "Operador",
      password: "123456",
      terminalName: "Seguranca Teste"
    });
    assert(login.sessionId && login.user?.role === "Administrador", "Login administrador nao retornou sessao valida.");
    const adminAuth = { Authorization: `Bearer ${login.sessionId}` };

    let stateBlocked = false;
    try {
      await requestJson(baseUrl, "GET", "/api/tenant/cliente-exemplo/state");
    } catch (error) {
      stateBlocked = error.statusCode === 401;
    }
    assert(stateBlocked, "Estado da unidade foi exposto sem sessao.");

    const tenantState = await requestJson(baseUrl, "GET", "/api/tenant/cliente-exemplo/state", null, adminAuth);
    assert(tenantState.state?.settings?.tenantCode === "cliente-exemplo", "Sessao valida nao acessou a propria unidade.");
    const openTerminalState = { ...tenantState.state, settings: { ...tenantState.state.settings, publicTerminalToken: "" } };
    await requestJson(baseUrl, "POST", "/api/tenant/cliente-exemplo/state", {
      state: openTerminalState,
      baseRevision: tenantState.state._meta?.revision || 0
    }, { ...adminAuth, "X-PEGMA-PERMISSION": "settings" });

    await requestJson(baseUrl, "POST", "/api/tenant/cliente-exemplo/users", {
      username: "caixa-seguranca",
      name: "Caixa Seguranca",
      password: "SenhaTeste123",
      role: "Caixa"
    }, adminAuth);

    const cashierLogin = await requestJson(baseUrl, "POST", "/api/auth/login", {
      tenantCode: "cliente-exemplo",
      user: "caixa-seguranca",
      password: "SenhaTeste123",
      terminalName: "Caixa Seguranca"
    });
    const cashierAuth = { Authorization: `Bearer ${cashierLogin.sessionId}` };

    let permissionBlocked = false;
    try {
      await requestJson(baseUrl, "POST", "/api/tenant/cliente-exemplo/state", { state: openTerminalState }, { ...cashierAuth, "X-PEGMA-PERMISSION": "settings" });
    } catch (error) {
      permissionBlocked = error.statusCode === 403;
    }
    assert(permissionBlocked, "Usuario Caixa conseguiu salvar configuracoes sem permissao.");

    await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo");
    const currentState = await requestJson(baseUrl, "GET", "/api/tenant/cliente-exemplo/state", null, adminAuth);
    const protectedState = { ...currentState.state, settings: { ...currentState.state.settings, publicTerminalToken: "token-seguro-totem" } };
    await requestJson(baseUrl, "POST", "/api/tenant/cliente-exemplo/state", {
      state: protectedState,
      baseRevision: currentState.state._meta?.revision || 0
    }, { ...adminAuth, "X-PEGMA-PERMISSION": "settings" });

    let missingTokenBlocked = false;
    try {
      await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo");
    } catch (error) {
      missingTokenBlocked = error.statusCode === 403;
    }
    assert(missingTokenBlocked, "Totem/cozinha sem token nao foi bloqueado apos configurar token publico.");

    let invalidTokenBlocked = false;
    try {
      await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo&terminalToken=errado");
    } catch (error) {
      invalidTokenBlocked = error.statusCode === 403;
    }
    assert(invalidTokenBlocked, "Token publico invalido foi aceito.");

    const board = await requestJson(baseUrl, "GET", "/api/public/kiosk/orders?unidade=cliente-exemplo&terminalToken=token-seguro-totem");
    assert(Array.isArray(board.orders), "Token publico valido nao liberou cozinha/telao.");

    console.log("OK - seguranca validada: login, sessao, permissao, isolamento e token publico do totem.");
  } finally {
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

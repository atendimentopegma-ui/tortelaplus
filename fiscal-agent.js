const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { parseAcbrResponse } = require("./src/server/fiscal-documents");

const root = __dirname;
const host = process.env.PEGMA_AGENT_HOST || "127.0.0.1";
const port = Number(process.env.PEGMA_AGENT_PORT || 4180);
const token = process.env.PEGMA_AGENT_TOKEN || "";
const runtime = path.resolve(process.env.PEGMA_AGENT_RUNTIME || path.join(root, "runtime", "fiscal"));
const workDir = path.resolve(process.env.PEGMA_AGENT_DATA || path.join(root, "data", "fiscal-agent"));
const bridge = path.join(runtime, "Bridge", "ProdutoFiscal.AcbrLibBridge.exe");
const baseIni = path.join(runtime, "ACBrLib", "ACBrLib.ini");
const engines = {
  nfe: { dll: path.join(runtime, "ACBrLib", "ACBrNFe64.dll"), process: null, buffer: "", pending: new Map(), sequence: 0, config: "" },
  nfse: { dll: path.join(runtime, "ACBrLib", "ACBrNFSe64.dll"), process: null, buffer: "", pending: new Map(), sequence: 0, config: "" }
};

fs.mkdirSync(workDir, { recursive: true });

function safeName(value) {
  return String(value || "cliente").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "cliente";
}

function replaceIniValue(content, section, key, value) {
  const sectionPattern = new RegExp(`(\\[${section}\\][\\s\\S]*?)(?=\\r?\\n\\[|$)`, "i");
  if (!sectionPattern.test(content)) return `${content.trimEnd()}\n\n[${section}]\n${key}=${value ?? ""}\n`;
  return content.replace(sectionPattern, (block) => {
    const keyPattern = new RegExp(`(^|\\r?\\n)${key}=.*`, "i");
    if (keyPattern.test(block)) return block.replace(keyPattern, `$1${key}=${value ?? ""}`);
    return `${block}\n${key}=${value ?? ""}`;
  });
}

function authorized(req) {
  return Boolean(token) && req.headers.authorization === `Bearer ${token}`;
}

function json(res, status, value) {
  const content = Buffer.from(JSON.stringify(value));
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": content.length });
  res.end(content);
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function start(engineName) {
  const engine = engines[engineName];
  if (!engine) throw new Error("Motor ACBr invalido.");
  if (engine.process && !engine.process.killed) return engine.process;
  for (const file of [bridge, engine.dll, baseIni]) if (!fs.existsSync(file)) throw new Error(`Arquivo ACBr ausente: ${file}`);
  engine.process = spawn(bridge, [engine.dll], { cwd: path.dirname(bridge), windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
  engine.process.stdout.on("data", (chunk) => {
    engine.buffer += chunk.toString("utf8");
    const lines = engine.buffer.split(/\r?\n/);
    engine.buffer = lines.pop() || "";
    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        const pending = engine.pending.get(result.id);
        if (!pending) continue;
        clearTimeout(pending.timer);
        engine.pending.delete(result.id);
        result.ok ? pending.resolve(result) : pending.reject(new Error(result.error || "Falha ACBr"));
      } catch {
        undefined;
      }
    }
  });
  engine.process.on("exit", () => {
    engine.process = null;
    engine.config = "";
    for (const pending of engine.pending.values()) pending.reject(new Error("Bridge ACBr encerrado."));
    engine.pending.clear();
  });
  return engine.process;
}

function command(engineName, method, args = [], timeout = 65000) {
  return new Promise((resolve, reject) => {
    const engine = engines[engineName];
    const process = start(engineName);
    const id = `${engineName}-${Date.now()}-${++engine.sequence}`;
    const timer = setTimeout(() => {
      engine.pending.delete(id);
      reject(new Error(`Tempo esgotado no ACBr: ${method}`));
    }, timeout);
    engine.pending.set(id, { resolve, reject, timer });
    process.stdin.write(`${JSON.stringify({ id, method, args: args.map(String) })}\n`);
  });
}

async function initialize(engineName, tenantCode) {
  const engine = engines[engineName];
  const tenantDir = path.join(workDir, safeName(tenantCode));
  fs.mkdirSync(tenantDir, { recursive: true });
  const pdfDir = path.join(tenantDir, "pdf");
  const xmlDir = path.join(tenantDir, "xml");
  fs.mkdirSync(pdfDir, { recursive: true });
  fs.mkdirSync(xmlDir, { recursive: true });
  const config = path.join(tenantDir, engineName === "nfse" ? "ACBrLibNFSe.ini" : "ACBrLib.ini");
  let ini = fs.existsSync(config) ? fs.readFileSync(config, "utf8") : fs.readFileSync(baseIni, "utf8");
  ini = replaceIniValue(ini, "NFe", "PathSalvar", xmlDir);
  ini = replaceIniValue(ini, "NFe", "PathNFe", xmlDir);
  ini = replaceIniValue(ini, "NFe", "PathEvento", xmlDir);
  ini = replaceIniValue(ini, "NFSe", "PathSalvar", xmlDir);
  ini = replaceIniValue(ini, "DANFE", "PathPDF", pdfDir);
  ini = replaceIniValue(ini, "DANFSE", "PathPDF", pdfDir);
  fs.writeFileSync(config, ini);
  if (engine.config !== config) {
    if (engine.process && !engine.process.killed) engine.process.kill();
    engine.config = "";
    const result = await command(engineName, "inicializar", [config, ""], 15000);
    if (Number(result.code) !== 0) throw new Error(result.response || `Falha ao inicializar ACBr ${engineName}.`);
    engine.config = config;
  }
  return tenantDir;
}

function saveContent(tenantDir, filename, content) {
  const target = path.join(tenantDir, safeName(filename));
  fs.writeFileSync(target, content, "utf8");
  return target;
}

async function transmit(payload) {
  const document = payload.document || {};
  const engineName = document.model === "NFS-e" ? "nfse" : "nfe";
  const tenantDir = await initialize(engineName, payload.tenantCode);
  const xmlPath = saveContent(tenantDir, `${document.model || "fiscal"}-${document.id || Date.now()}.xml`, document.xml || "");
  await command(engineName, "carregarxml", [xmlPath]);
  const response = engineName === "nfse"
    ? await command("nfse", "emitir", ["1", "1", "false"])
    : await (async () => {
      await command("nfe", "assinar");
      await command("nfe", "validar");
      return command("nfe", "enviar", ["1", "false", "true", "false"]);
    })();
  const parsed = parseAcbrResponse(response.response);
  return {
    document: {
      ...document,
      acbrCode: Number(response.code),
      acbrResponse: parsed.raw,
      key: parsed.key || document.key || "",
      protocol: parsed.protocol || "",
      statusCode: parsed.statusCode,
      statusMessage: parsed.statusMessage,
      retryable: parsed.retryable,
      status: parsed.authorized || (engineName === "nfse" && parsed.protocol) ? "Autorizada" : `Rejeitada/pendente ACBr${parsed.statusCode ? ` ${parsed.statusCode}` : ""}`
    }
  };
}

async function execute(payload) {
  const engineName = payload.engine === "nfse" ? "nfse" : "nfe";
  const tenantDir = await initialize(engineName, payload.tenantCode);
  const results = [];
  const pdfStartedAt = Date.now();
  for (const step of payload.steps || []) {
    const args = [...(step.args || [])];
    if (step.file) args[Number(step.file.argIndex || 0)] = saveContent(tenantDir, step.file.filename, step.file.content);
    results.push(await command(engineName, step.method, args, Number(step.timeout || 65000)));
  }
  const final = results.at(-1) || {};
  let pdfBase64 = "";
  if (payload.collectPdf) {
    const pdf = fs.readdirSync(tenantDir, { recursive: true })
      .map((name) => path.join(tenantDir, name))
      .filter((name) => name.toLowerCase().endsWith(".pdf") && fs.statSync(name).isFile())
      .filter((name) => fs.statSync(name).mtimeMs >= pdfStartedAt - 1000)
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (pdf) pdfBase64 = fs.readFileSync(pdf).toString("base64");
    else {
      const raw = String(final.response || "").replace(/^data:application\/pdf;base64,/i, "").replace(/\s/g, "");
      const buffer = /^[A-Za-z0-9+/=]+$/.test(raw) ? Buffer.from(raw, "base64") : null;
      if (buffer?.subarray(0, 4).equals(Buffer.from("%PDF"))) pdfBase64 = raw;
    }
  }
  return { results, parsed: parseAcbrResponse(final.response), response: final, pdfBase64 };
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    if (!authorized(req)) return json(res, 401, { ok: false, error: "Token invalido." });
    return json(res, 200, { ok: true, agent: "Pegma Plus Fiscal Agent", acbr: true, runtime, host, port });
  }
  if (!authorized(req)) return json(res, 401, { ok: false, error: "Token invalido." });
  try {
    const payload = await body(req);
    if (req.url === "/fiscal/transmit" && req.method === "POST") return json(res, 200, { ok: true, ...(await transmit(payload)) });
    if (req.url === "/fiscal/execute" && req.method === "POST") return json(res, 200, { ok: true, ...(await execute(payload)) });
    return json(res, 404, { ok: false, error: "Rota inexistente." });
  } catch (error) {
    return json(res, 503, { ok: false, error: error.message });
  }
});

server.listen(port, host, () => console.log(`Pegma Plus Fiscal Agent em http://${host}:${port}`));

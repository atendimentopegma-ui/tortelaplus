const fs = require("fs");
const path = require("path");

const requiredFiles = ["server.js", "central-saas.html", "fiscal-agent.js", "render.yaml", "Dockerfile"];
const missingFiles = requiredFiles.filter((name) => !fs.existsSync(path.join(__dirname, "..", name)));
const requiredEnv = ["DATABASE_URL", "PEGMA_SECRET_KEY", "PEGMA_CENTRAL_USER", "PEGMA_CENTRAL_PASSWORD"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

console.log(JSON.stringify({
  ready: missingFiles.length === 0 && missingEnv.length === 0,
  missingFiles,
  missingEnv,
  surfaces: { client: "/", central: "/central-saas.html", health: "/api/health", readiness: "/api/tenant/:tenant/readiness" }
}, null, 2));
process.exitCode = missingFiles.length || missingEnv.length ? 1 : 0;

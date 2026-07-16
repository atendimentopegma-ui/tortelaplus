const fs = require("fs");
const path = require("path");
const { buildDeploymentReadiness } = require("../src/server/deployment-readiness");

const requiredFiles = ["server.js", "central-saas.html", "fiscal-agent.js", "render.yaml", "Dockerfile"];
const missingFiles = requiredFiles.filter((name) => !fs.existsSync(path.join(__dirname, "..", name)));
const deployment = buildDeploymentReadiness(process.env);
const missingEnv = deployment.checks
  .filter((check) => check.level === "blocker" && !check.ok)
  .map((check) => check.id);

console.log(JSON.stringify({
  ready: missingFiles.length === 0 && deployment.ready,
  missingFiles,
  missingEnv,
  deployment,
  surfaces: { client: "/", central: "/central-saas.html", health: "/api/health", deploymentReadiness: "/api/deployment/readiness", tenantReadiness: "/api/tenant/:tenant/readiness" }
}, null, 2));
process.exitCode = missingFiles.length || !deployment.ready ? 1 : 0;

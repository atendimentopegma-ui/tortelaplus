function envFlag(value) {
  return ["1", "true", "yes", "sim", "on"].includes(String(value || "").trim().toLowerCase());
}

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function looksStrongSecret(value) {
  const text = String(value || "");
  if (text.length < 32) return false;
  if (/troque|change|senha|password|secret|pegma@2026|123456/i.test(text)) return false;
  return true;
}

function buildSecurityHeaders(env = process.env) {
  const origins = parseOrigins(env.PEGMA_ALLOWED_ORIGINS);
  return {
    "Access-Control-Allow-Origin": origins[0] || "*",
    "Vary": "Origin"
  };
}

function buildDeploymentReadiness(env = process.env, runtime = {}) {
  const paidMode = envFlag(env.PEGMA_REQUIRE_PAID_PROVIDER) || ["production-paid", "provedor-pago"].includes(String(env.PEGMA_ENV || "").toLowerCase());
  const origins = parseOrigins(env.PEGMA_ALLOWED_ORIGINS);
  const checks = [];

  function add(id, label, ok, message, level = "blocker") {
    checks.push({ id, label, ok: Boolean(ok), level, message });
  }

  add(
    "database-postgres",
    "Banco PostgreSQL por tenant",
    Boolean(env.DATABASE_URL),
    env.DATABASE_URL ? "PostgreSQL configurado; o sistema usa schema separado por franquia." : "Configure DATABASE_URL antes de levar para provedor pago."
  );
  add(
    "database-ssl",
    "Conexao segura com banco",
    String(env.PGSSL || "").toLowerCase() === "require" || /sslmode=require/i.test(String(env.DATABASE_URL || "")),
    "Use PGSSL=require ou sslmode=require no DATABASE_URL.",
    "warning"
  );
  add(
    "secret-key",
    "Chave criptografica forte",
    looksStrongSecret(env.PEGMA_SECRET_KEY),
    "PEGMA_SECRET_KEY precisa ter 32+ caracteres e nao pode ser valor padrao."
  );
  add(
    "central-password",
    "Senha forte da Central",
    looksStrongSecret(env.PEGMA_CENTRAL_PASSWORD) && !/pegma@2026/i.test(String(env.PEGMA_CENTRAL_PASSWORD || "")),
    "Troque PEGMA_CENTRAL_PASSWORD por senha forte antes da publicacao paga."
  );
  add(
    "provider-token",
    "Token administrativo do provedor",
    looksStrongSecret(env.PEGMA_PROVIDER_TOKEN),
    "Configure PEGMA_PROVIDER_TOKEN com token longo para automacoes administrativas."
  );
  add(
    "public-link-secret",
    "Segredo dos links de totem/cozinha/telao",
    looksStrongSecret(env.PEGMA_PUBLIC_LINK_SECRET),
    "Configure PEGMA_PUBLIC_LINK_SECRET com chave forte para gerar tokens de unidade nao previsiveis."
  );
  add(
    "allowed-origins",
    "Origens HTTP permitidas",
    origins.length > 0,
    "Configure PEGMA_ALLOWED_ORIGINS com o dominio final HTTPS do sistema."
  );
  add(
    "backup-external",
    "Backup fora do servidor da aplicacao",
    Boolean(env.PEGMA_BACKUP_DIR) && !String(env.PEGMA_BACKUP_DIR).replace(/\\/g, "/").startsWith("data/"),
    "Use PEGMA_BACKUP_DIR em disco persistente, storage externo ou rotina equivalente.",
    "warning"
  );
  add(
    "fiscal-agent",
    "Agente fiscal Windows protegido",
    Boolean(env.PEGMA_ACBR_AGENT_URL && env.PEGMA_ACBR_AGENT_TOKEN) || Boolean(env.PEGMA_ACBR_HOST),
    "Para emissao fiscal real na nuvem, configure agente ACBr HTTPS com token por unidade.",
    "warning"
  );

  const blockers = checks.filter((check) => check.level === "blocker" && !check.ok);
  const warnings = checks.filter((check) => check.level === "warning" && !check.ok);
  return {
    ready: blockers.length === 0,
    paidMode,
    product: "Tortela Plus",
    mode: runtime.databaseMode || (env.DATABASE_URL ? "postgresql-schema-per-tenant" : "local-json-contingency"),
    isolation: env.DATABASE_URL ? "schema-postgresql-por-franquia" : "arquivos-locais-somente-contingencia",
    blockers: blockers.map((check) => check.id),
    warnings: warnings.map((check) => check.id),
    checks
  };
}

module.exports = {
  buildDeploymentReadiness,
  buildSecurityHeaders,
  parseOrigins
};

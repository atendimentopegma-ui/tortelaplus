function envFlag(value) {
  return ["1", "true", "yes", "sim", "on"].includes(String(value || "").trim().toLowerCase());
}

function envValue(env, primary, fallback) {
  const value = env[primary];
  if (value !== undefined && String(value).trim() !== "") return value;
  return fallback ? env[fallback] : undefined;
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
  const origins = parseOrigins(envValue(env, "TORTELAPLUS_ALLOWED_ORIGINS", "PEGMA_ALLOWED_ORIGINS"));
  return {
    "Access-Control-Allow-Origin": origins[0] || "*",
    "Vary": "Origin"
  };
}

function buildDeploymentReadiness(env = process.env, runtime = {}) {
  const paidMode = envFlag(envValue(env, "TORTELAPLUS_REQUIRE_PAID_PROVIDER", "PEGMA_REQUIRE_PAID_PROVIDER")) || ["production-paid", "provedor-pago"].includes(String(envValue(env, "TORTELAPLUS_ENV", "PEGMA_ENV") || "").toLowerCase());
  const secretKey = envValue(env, "TORTELAPLUS_SECRET_KEY", "PEGMA_SECRET_KEY");
  const centralPassword = envValue(env, "TORTELAPLUS_CENTRAL_PASSWORD", "PEGMA_CENTRAL_PASSWORD");
  const providerToken = envValue(env, "TORTELAPLUS_PROVIDER_TOKEN", "PEGMA_PROVIDER_TOKEN");
  const publicLinkSecret = envValue(env, "TORTELAPLUS_PUBLIC_LINK_SECRET", "PEGMA_PUBLIC_LINK_SECRET");
  const backupDir = envValue(env, "TORTELAPLUS_BACKUP_DIR", "PEGMA_BACKUP_DIR");
  const acbrAgentUrl = envValue(env, "TORTELAPLUS_ACBR_AGENT_URL", "PEGMA_ACBR_AGENT_URL");
  const acbrAgentToken = envValue(env, "TORTELAPLUS_ACBR_AGENT_TOKEN", "PEGMA_ACBR_AGENT_TOKEN");
  const acbrHost = envValue(env, "TORTELAPLUS_ACBR_HOST", "PEGMA_ACBR_HOST");
  const origins = parseOrigins(envValue(env, "TORTELAPLUS_ALLOWED_ORIGINS", "PEGMA_ALLOWED_ORIGINS"));
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
    looksStrongSecret(secretKey),
    "TORTELAPLUS_SECRET_KEY precisa ter 32+ caracteres e nao pode ser valor padrao."
  );
  add(
    "central-password",
    "Senha forte da Central",
    looksStrongSecret(centralPassword) && !/pegma@2026/i.test(String(centralPassword || "")),
    "Troque TORTELAPLUS_CENTRAL_PASSWORD por senha forte antes da publicacao paga."
  );
  add(
    "provider-token",
    "Token administrativo do provedor",
    looksStrongSecret(providerToken),
    "Configure TORTELAPLUS_PROVIDER_TOKEN com token longo para automacoes administrativas."
  );
  add(
    "public-link-secret",
    "Segredo dos links de totem/cozinha/telao",
    looksStrongSecret(publicLinkSecret),
    "Configure TORTELAPLUS_PUBLIC_LINK_SECRET com chave forte para gerar tokens de unidade nao previsiveis."
  );
  add(
    "allowed-origins",
    "Origens HTTP permitidas",
    origins.length > 0,
    "Configure TORTELAPLUS_ALLOWED_ORIGINS com o dominio final HTTPS do sistema."
  );
  add(
    "backup-external",
    "Backup fora do servidor da aplicacao",
    Boolean(backupDir) && !String(backupDir).replace(/\\/g, "/").startsWith("data/"),
    "Use TORTELAPLUS_BACKUP_DIR em disco persistente, storage externo ou rotina equivalente.",
    "warning"
  );
  add(
    "fiscal-agent",
    "Agente fiscal Windows protegido",
    Boolean(acbrAgentUrl && acbrAgentToken) || Boolean(acbrHost),
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
  envValue,
  parseOrigins
};

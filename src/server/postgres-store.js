const { Pool } = require("pg");

function tenantSchema(tenantCode) {
  const normalized = String(tenantCode || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!normalized) throw new Error("Codigo do cliente invalido");
  return `tenant_${normalized}`;
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

class PostgresStore {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false },
      max: Number(process.env.PGPOOL_MAX || 10)
    });
    this.pending = Promise.resolve();
  }

  async initialize() {
    await this.pool.query(`
      create table if not exists provider_state (
        id smallint primary key default 1 check (id = 1),
        document jsonb not null,
        updated_at timestamptz not null default now()
      );
      create table if not exists provider_audit_logs (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        username text not null,
        action text not null,
        detail text,
        ip_address text
      );
      create table if not exists provider_backups (
        id bigserial primary key,
        reason text not null,
        document jsonb not null,
        created_at timestamptz not null default now()
      );
    `);
  }

  async ensureTenant(tenantCode) {
    const schema = quoteIdentifier(tenantSchema(tenantCode));
    await this.pool.query(`
      create schema if not exists ${schema};
      create table if not exists ${schema}.state_document (
        id smallint primary key default 1 check (id = 1),
        document jsonb not null,
        updated_at timestamptz not null default now()
      );
      create table if not exists ${schema}.file_objects (
        category text not null,
        filename text not null,
        mime_type text not null,
        content bytea not null,
        created_at timestamptz not null default now(),
        primary key (category, filename)
      );
    `);
  }

  async readProvider() {
    const result = await this.pool.query("select document from provider_state where id = 1");
    return result.rows[0]?.document || null;
  }

  async writeProvider(provider) {
    await this.pool.query(
      `insert into provider_state (id, document, updated_at) values (1, $1::jsonb, now())
       on conflict (id) do update set document = excluded.document, updated_at = now()`,
      [JSON.stringify(provider)]
    );
  }

  async readTenant(tenantCode) {
    await this.ensureTenant(tenantCode);
    const schema = quoteIdentifier(tenantSchema(tenantCode));
    const result = await this.pool.query(`select document from ${schema}.state_document where id = 1`);
    return result.rows[0]?.document || null;
  }

  async tenantExists(tenantCode) {
    const schemaName = tenantSchema(tenantCode);
    const result = await this.pool.query(
      "select exists(select 1 from information_schema.schemata where schema_name = $1) as exists",
      [schemaName]
    );
    return Boolean(result.rows[0]?.exists);
  }

  async health() {
    const result = await this.pool.query("select current_database() as database, now() as checked_at");
    return result.rows[0];
  }

  async writeTenant(tenantCode, state) {
    await this.ensureTenant(tenantCode);
    const schema = quoteIdentifier(tenantSchema(tenantCode));
    await this.pool.query(
      `insert into ${schema}.state_document (id, document, updated_at) values (1, $1::jsonb, now())
       on conflict (id) do update set document = excluded.document, updated_at = now()`,
      [JSON.stringify(state)]
    );
  }

  async writeFile(tenantCode, category, filename, mimeType, content) {
    await this.ensureTenant(tenantCode);
    const schema = quoteIdentifier(tenantSchema(tenantCode));
    await this.pool.query(
      `insert into ${schema}.file_objects (category, filename, mime_type, content)
       values ($1, $2, $3, $4)
       on conflict (category, filename) do update set mime_type = excluded.mime_type, content = excluded.content`,
      [category, filename, mimeType, content]
    );
  }

  async readFile(tenantCode, category, filename) {
    await this.ensureTenant(tenantCode);
    const schema = quoteIdentifier(tenantSchema(tenantCode));
    const result = await this.pool.query(
      `select mime_type, content from ${schema}.file_objects where category = $1 and filename = $2`,
      [category, filename]
    );
    return result.rows[0] || null;
  }

  async listFiles(tenantCode, category) {
    await this.ensureTenant(tenantCode);
    const schema = quoteIdentifier(tenantSchema(tenantCode));
    const result = await this.pool.query(
      `select category, filename, mime_type, content, created_at
       from ${schema}.file_objects
       where category = $1
       order by created_at desc`,
      [category]
    );
    return result.rows;
  }

  async audit(username, action, detail, ipAddress = "") {
    await this.pool.query(
      "insert into provider_audit_logs (username, action, detail, ip_address) values ($1, $2, $3, $4)",
      [username, action, detail, ipAddress]
    );
  }

  async writeProviderBackup(reason, document) {
    await this.pool.query(
      "insert into provider_backups (reason, document) values ($1, $2::jsonb)",
      [reason, JSON.stringify(document)]
    );
    await this.pool.query(`
      delete from provider_backups
      where id not in (select id from provider_backups order by created_at desc limit 30)
    `);
  }

  queue(operation) {
    this.pending = this.pending.then(operation).catch((error) => console.error(`[PostgreSQL] ${error.message}`));
    return this.pending;
  }

  async close() {
    await this.pending;
    await this.pool.end();
  }
}

module.exports = { PostgresStore, tenantSchema };

-- Schema relacional de referencia para evolucao do Pegma Plus.
-- A implementacao atual usa public.provider_state para a Central e cria um
-- schema tenant_<codigo> separado para cada cliente, com seu state_document.

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

create table provider_clients (
  id bigserial primary key,
  tenant_code text not null unique,
  trade_name text not null,
  document text,
  plan text not null,
  max_terminals integer not null default 1,
  renewal_days integer not null default 30,
  license_password_hash text,
  license_expires_at date,
  status text not null default 'Ativo',
  admin_user text,
  modules jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table provider_sessions (
  id bigserial primary key,
  tenant_code text not null references provider_clients(tenant_code),
  session_id text not null unique,
  username text not null,
  role text not null,
  terminal_name text,
  ip_address text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table tenant_users (
  id bigserial primary key,
  username text not null unique,
  name text not null,
  role text not null,
  active boolean not null default true,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table tenant_entities (
  id bigserial primary key,
  type text not null,
  name text not null,
  document text,
  email text,
  phone text,
  cep text,
  address text,
  number text,
  district text,
  city text,
  uf text,
  active boolean not null default true
);

create table tenant_products (
  id bigserial primary key,
  description text not null,
  barcode text,
  type text,
  unit text,
  cost numeric(15,4) not null default 0,
  price numeric(15,4) not null default 0,
  stock numeric(15,4) not null default 0,
  min_stock numeric(15,4) not null default 0,
  ncm text,
  cfop text,
  cst text,
  ibs_class text,
  cbs_class text,
  photo_url text,
  active boolean not null default true
);

create table tenant_product_components (
  id bigserial primary key,
  product_id bigint not null references tenant_products(id),
  component_product_id bigint not null references tenant_products(id),
  qty numeric(15,6) not null,
  mode text not null default 'both'
);

create table tenant_sales (
  id bigserial primary key,
  date date not null,
  customer text,
  seller text,
  type text,
  status text,
  payment text,
  total numeric(15,2) not null default 0,
  items jsonb not null default '[]'
);

create table tenant_finance_titles (
  id bigserial primary key,
  kind text not null,
  person_name text,
  due date,
  value numeric(15,2) not null default 0,
  paid boolean not null default false,
  paid_at date,
  history text
);

create table tenant_fiscal_documents (
  id bigserial primary key,
  model text not null,
  serie text,
  status text not null,
  customer text,
  total numeric(15,2) not null default 0,
  access_key text,
  protocol text,
  xml text,
  created_at timestamptz not null default now()
);

create table tenant_audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  username text,
  action text not null,
  detail text
);

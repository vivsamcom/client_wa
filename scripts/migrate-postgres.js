const { Pool } = require('pg');
require('dotenv').config();

const dbProvider = process.env.DB_PROVIDER || 'postgres';

if (dbProvider !== 'postgres') {
  console.log(`Skipping PostgreSQL migration because DB_PROVIDER=${dbProvider}`);
  process.exit(0);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://wa_user:wa_password@localhost:5432/wa_loan_demo' });

const sql = `
create table if not exists customers (
  wa_id varchar(32) primary key,
  profile_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_preferences (
  wa_id varchar(32) primary key references customers(wa_id),
  preferred_language varchar(50) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inbound_messages (
  id bigserial primary key,
  message_id text unique not null,
  wa_id varchar(32) not null references customers(wa_id),
  message_type varchar(50) not null,
  body text,
  action_id text,
  raw_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists loan_leads (
  id bigserial primary key,
  wa_id varchar(32) not null references customers(wa_id),
  loan_type varchar(100) not null,
  stage varchar(50) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
`;

async function run() {
  await pool.query(sql);
  console.log('PostgreSQL migration completed');
  await pool.end();
}

run().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

const { Pool } = require('pg');
require('dotenv').config();

const dbProvider = process.env.DB_PROVIDER || 'postgres';

if (dbProvider !== 'postgres') {
  console.log(`Skipping PostgreSQL migration because DB_PROVIDER=${dbProvider}`);
  process.exit(0);
}

const pool = new Pool({
  connectionString: process.env.DB_URI || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/client_wa'
});

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

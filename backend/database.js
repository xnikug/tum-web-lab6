const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://lab7user:lab7pass@localhost:5432/lab7',
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS subscriptions (
    id            TEXT PRIMARY KEY,
    "serviceName" TEXT NOT NULL,
    category      TEXT NOT NULL DEFAULT 'Other',
    cost          NUMERIC(10,2) NOT NULL CHECK(cost > 0),
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    currency      TEXT NOT NULL DEFAULT 'USD',
    "renewalDate" TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'active',
    notes         TEXT NOT NULL DEFAULT '',
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id          TEXT PRIMARY KEY,
    provider    TEXT NOT NULL,
    name        TEXT NOT NULL,
    key         TEXT NOT NULL,
    "projectTag" TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS api_usage (
    id              TEXT PRIMARY KEY,
    "keyId"         TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    tokens          INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" NUMERIC(10,4) NOT NULL DEFAULT 0
  );
`;

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(SCHEMA);
    console.log('Database schema ready');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDb };

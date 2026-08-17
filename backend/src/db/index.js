const { Pool } = require("pg");
const logger = require("../utils/logger");

// ── PostgreSQL Pool ───────────────────────────────────────────────
// Supports two modes:
//   1. DATABASE_URL (Neon.tech / Render / Heroku style) — production
//   2. Individual DB_* env vars — local development
// ─────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";

let poolConfig;

if (process.env.DATABASE_URL) {
  // Production: Neon.tech / Render-style connection string
  // Neon requires SSL. rejectUnauthorized:false accepts Neon's self-signed cert.
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
} else {
  // Local development: individual variables
  poolConfig = {
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || "vlivechat",
    user:     process.env.DB_USER     || "vlcuser",
    password: process.env.DB_PASSWORD || "vlcpassword123",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
    ssl: false,
  };
}

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL pool error:", err);
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    logger.info("✅ PostgreSQL connected");
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };

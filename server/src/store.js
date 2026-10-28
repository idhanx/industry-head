// Persistence behind one async interface:
//   - Postgres (DATABASE_URL, e.g. Neon / Vercel Postgres) — used in production on Vercel
//   - SQLite file via node:sqlite — local development only (Vercel's filesystem is read-only/ephemeral)
//   - "unconfigured" — on Vercel without DATABASE_URL: content still works, storage routes answer 503

export const STATUSES = ["new", "contacted", "scheduled", "closed"];

const COLS = "reference,name,email,company,role,country,sites,priority,date,time,timezone,duration";
const newReference = () => "IH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();
const vals = (e, ref) => [ref, e.name, e.email, e.company, e.role, e.country, e.sites, e.priority, e.date, e.time, e.timezone, e.duration];
const iso = (v) => (v instanceof Date ? v.toISOString() : v);
const normRow = (r) => (r ? { ...r, created_at: iso(r.created_at) } : r);

/** Postgres over any `query(sql, params) => rows` function (pg Pool, PGlite in tests). */
export function postgresStore(rawQuery, { close } = {}) {
  let ready;
  const query = async (sql, params) => {
    try { return await rawQuery(sql, params); }
    catch (e) {
      console.error("[store] postgres query failed:", e); // full detail goes to the server log only
      const err = new Error(`Database unavailable (${e.code || e.name || "error"})`);
      err.status = 503; err.dbCode = e.code || e.name || "error";
      throw err;
    }
  };
  const init = () => (ready ??= (async () => {
    await query(`CREATE TABLE IF NOT EXISTS enquiries (
      id SERIAL PRIMARY KEY, reference TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL,
      role TEXT NOT NULL, country TEXT NOT NULL, sites TEXT NOT NULL, priority TEXT NOT NULL DEFAULT '', date TEXT NOT NULL,
      time TEXT NOT NULL, timezone TEXT NOT NULL, duration TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await query("CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status, created_at)");
    await query("CREATE TABLE IF NOT EXISTS tour_sessions (session TEXT PRIMARY KEY, state TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())");
  })().catch((e) => { ready = undefined; throw e; })); // retry on the next request if the first attempt failed

  return {
    kind: "postgres",
    async ping() { await init(); await query("SELECT 1"); },
    async createEnquiry(e) {
      await init(); const reference = newReference();
      const rows = await query(`INSERT INTO enquiries (${COLS}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`, vals(e, reference));
      return { id: Number(rows[0].id), reference };
    },
    async listEnquiries(status) {
      await init();
      const rows = status
        ? await query("SELECT * FROM enquiries WHERE status = $1 ORDER BY created_at DESC, id DESC", [status])
        : await query("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC");
      return rows.map(normRow);
    },
    async setEnquiryStatus(id, status) {
      await init();
      const rows = await query("UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
      return rows.length ? normRow(rows[0]) : null;
    },
    async loadSession(session) {
      await init();
      const rows = await query("SELECT state FROM tour_sessions WHERE session = $1", [session]);
      return rows.length ? JSON.parse(rows[0].state) : null;
    },
    async saveSession(session, state) {
      await init();
      await query(`INSERT INTO tour_sessions (session, state, updated_at) VALUES ($1, $2, now())
        ON CONFLICT (session) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`, [session, JSON.stringify(state)]);
      if (Math.random() < 0.02) await this.pruneSessions().catch(() => {}); // serverless has no timers: prune opportunistically
    },
    async pruneSessions(hours = 24) {
      await init();
      await query("DELETE FROM tour_sessions WHERE updated_at < now() - ($1 || ' hours')::interval", [String(hours)]);
    },
    async close() { await close?.(); }
  };
}

export async function pgPoolStore(databaseUrl) {
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 3, idleTimeoutMillis: 10_000, ssl: /sslmode=disable|localhost|127\.0\.0\.1/.test(databaseUrl) ? false : { rejectUnauthorized: false } });
  return postgresStore((sql, params) => pool.query(sql, params).then((r) => r.rows), { close: () => pool.end() });
}

/** SQLite file (local development). */
export async function sqliteStore(path) {
  const { DatabaseSync } = await import("node:sqlite");
  const { mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL,
      role TEXT NOT NULL, country TEXT NOT NULL, sites TEXT NOT NULL, priority TEXT NOT NULL DEFAULT '', date TEXT NOT NULL,
      time TEXT NOT NULL, timezone TEXT NOT NULL, duration TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status, created_at);
    CREATE TABLE IF NOT EXISTS tour_sessions (session TEXT PRIMARY KEY, state TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
  `);
  return {
    kind: "sqlite",
    async ping() { db.prepare("SELECT 1").get(); },
    async createEnquiry(e) {
      const reference = newReference();
      const r = db.prepare(`INSERT INTO enquiries (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(...vals(e, reference));
      return { id: Number(r.lastInsertRowid), reference };
    },
    async listEnquiries(status) {
      return status
        ? db.prepare("SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC, id DESC").all(status)
        : db.prepare("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC").all();
    },
    async setEnquiryStatus(id, status) {
      const r = db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
      return r.changes > 0 ? db.prepare("SELECT * FROM enquiries WHERE id = ?").get(id) : null;
    },
    async loadSession(session) {
      const row = db.prepare("SELECT state FROM tour_sessions WHERE session = ?").get(session);
      return row ? JSON.parse(row.state) : null;
    },
    async saveSession(session, state) {
      db.prepare(`INSERT INTO tour_sessions (session, state, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        ON CONFLICT(session) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`).run(session, JSON.stringify(state));
    },
    async pruneSessions(hours = 24) {
      db.prepare("DELETE FROM tour_sessions WHERE updated_at < strftime('%Y-%m-%dT%H:%M:%fZ','now', ?)").run(`-${hours} hours`);
    },
    async close() { db.close(); }
  };
}

/** Vercel without a database: everything that needs storage answers 503 with a clear message. */
export function unconfiguredStore() {
  const fail = async () => { const e = new Error("Storage is not configured: set DATABASE_URL (Postgres) in the Vercel project settings."); e.status = 503; throw e; };
  return { kind: "unconfigured", ping: fail, createEnquiry: fail, listEnquiries: fail, setEnquiryStatus: fail, loadSession: fail, saveSession: fail, pruneSessions: async () => {}, close: async () => {} };
}

/**
 * Finds a Postgres connection string. DATABASE_URL / POSTGRES_URL win; otherwise any variable (for example the
 * <PREFIX>_URL or <PREFIX>_DATABASE_URL that a Vercel storage integration creates with a custom prefix) whose value
 * is a postgres:// URL. Pooled URLs are preferred over "unpooled / non-pooling" ones — better for serverless.
 */
export function postgresUrlFromEnv(env = process.env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (env.POSTGRES_URL) return env.POSTGRES_URL;
  const isPg = (v) => typeof v === "string" && /^postgres(ql)?:\/\//i.test(v);
  const keys = Object.keys(env).filter((k) => isPg(env[k]) && !/PRISMA/i.test(k)).sort((a, b) => /UNPOOLED|NON_POOLING/i.test(a) - /UNPOOLED|NON_POOLING/i.test(b));
  return keys.length ? env[keys[0]] : undefined;
}

/** Picks the store from the environment. */
export async function storeFromEnv(env = process.env) {
  const url = postgresUrlFromEnv(env);
  if (url) return pgPoolStore(url);
  if (env.VERCEL) return unconfiguredStore();
  return sqliteStore(env.DB_PATH || new URL("../data/industryhead.db", import.meta.url).pathname);
}

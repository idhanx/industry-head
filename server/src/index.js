// Long-running server: local development, and any host that runs a Node process (Render, Fly, a VM, Docker).
// On Vercel the same app is exported from /api/index.js instead.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { storeFromEnv } from "./store.js";
import { createApp } from "./app.js";

const here = dirname(fileURLToPath(import.meta.url));
const prod = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 4000);
let adminToken = process.env.ADMIN_TOKEN;
if (!adminToken && !prod) { adminToken = "dev-admin-token"; console.warn("[admin] ADMIN_TOKEN not set — using the development token 'dev-admin-token'."); }
if (!adminToken && prod) console.warn("[admin] ADMIN_TOKEN not set — the admin API is disabled.");

const store = await storeFromEnv();
console.log(`[store] ${store.kind}`);
await store.pruneSessions().catch((e) => console.warn("[store] prune skipped:", e.message));
setInterval(() => store.pruneSessions().catch(() => {}), 6 * 3600_000).unref();

const app = createApp({ store, adminToken, staticDir: resolve(here, process.env.CLIENT_DIST || "../../client/dist"), trustProxy: process.env.TRUST_PROXY === "1" });
const server = app.listen(port, () => console.log(`Industryhead API listening on http://localhost:${port}${prod ? "" : " (dev)"}`));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.close(async () => { await store.close(); process.exit(0); }));

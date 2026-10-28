import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as content from "./content.js";
import { STATUSES } from "./store.js";
import { validateEnquiry, SESSION_RE } from "./validate.js";

const clone = (o) => JSON.parse(JSON.stringify(o));
const safeEqual = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export function createApp({ store, adminToken, staticDir, trustProxy = false, now = () => Date.now() }) {
  const app = express();
  if (trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: { directives: { "default-src": ["'self'"], "style-src": ["'self'", "'unsafe-inline'"], "img-src": ["'self'", "data:"], "connect-src": ["'self'"], "object-src": ["'none'"], "frame-ancestors": ["'none'"], "upgrade-insecure-requests": null } }
  }));
  app.use(express.json({ limit: "20kb" }));

  // ---------- public content ----------
  const publicContent = {
    features: content.features, stages: content.stages, chain: content.chain, comparison: content.comparison,
    industries: content.industries, services: content.services, steps: content.steps, trust: content.trust,
    form: { timezones: content.timezones, sites: content.sitesOptions, durations: content.durations }
  };
  // /api/health is a liveness check; /api/health?db=1 also tries the database and reports the failure code (never the connection string)
  app.get("/api/health", async (req, res) => {
    const out = { ok: true, store: store.kind };
    if (req.query.db) { try { await store.ping(); out.db = "ok"; } catch (e) { out.db = "error"; out.detail = e.message; } }
    res.json(out);
  });
  app.get("/api/content", (_req, res) => { res.set("Cache-Control", "public, max-age=300"); res.json(publicContent); });

  // ---------- illustrative cost ticker ----------
  // A pure function of the wall clock, so every serverless instance agrees. The client syncs once and then ticks locally.
  const cost = () => {
    const at = now(), sec = Math.floor(at / 1000) % 3600; // wraps hourly so the demo figure never grows without bound
    const { baseCost: b } = content.tourStatic;
    return { total: b.total + b.perSecond * sec, stop: b.stop + b.perSecond * sec, perSecond: b.perSecond, at };
  };
  app.get("/api/cost", (_req, res) => { res.set("Cache-Control", "no-store"); res.json(cost()); });

  // ---------- product tour: state is private to each visitor's session ----------
  const tourLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false });
  const tour = express.Router();
  tour.use(tourLimiter, async (req, res, next) => {
    const s = req.get("x-demo-session");
    if (!s || !SESSION_RE.test(s)) return res.status(400).json({ error: "Missing or invalid X-Demo-Session header." });
    req.session = s;
    req.state = (await store.loadSession(s)) ?? clone(content.tourSeed);
    next();
  });
  const view = (state) => ({ ...clone(content.tourStatic), machines: state.machines, actions: state.actions });
  tour.get("/", (req, res) => res.json(view(req.state)));
  tour.post("/machines/:id/reason", async (req, res) => {
    const m = req.state.machines.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: "Unknown machine." });
    if (m.st !== "stop") return res.status(409).json({ error: "Only a stopped machine has a stop reason." });
    const reason = req.body?.reason;
    if (!content.tourStatic.reasons.includes(reason)) return res.status(422).json({ error: "Unknown reason." });
    m.note = reason; await store.saveSession(req.session, req.state);
    res.json(view(req.state));
  });
  tour.post("/actions", async (req, res) => {
    const m = req.state.machines.find((x) => x.id === req.body?.machineId);
    if (!m) return res.status(404).json({ error: "Unknown machine." });
    if (req.state.actions.length >= 25) return res.status(409).json({ error: "Demo limit reached." });
    const id = Math.max(0, ...req.state.actions.map((a) => a.id)) + 1;
    req.state.actions.unshift({ id, title: `${m.id}: ${m.note}`, owner: "Owner assigned · due Thu", cost: m.st === "stop" ? `₹${cost().stop.toLocaleString("en-IN")}` : "—", stage: 0 });
    await store.saveSession(req.session, req.state);
    res.status(201).json(view(req.state));
  });
  tour.patch("/actions/:id", async (req, res) => {
    const a = req.state.actions.find((x) => x.id === Number(req.params.id));
    if (!a) return res.status(404).json({ error: "Unknown action." });
    const stage = req.body?.stage;
    if (!Number.isInteger(stage) || stage < 0 || stage > 3) return res.status(422).json({ error: "Stage must be 0-3." });
    a.stage = stage; await store.saveSession(req.session, req.state);
    res.json(view(req.state));
  });
  app.use("/api/tour", tour);

  // ---------- demo enquiries ----------
  const enquiryLimiter = rateLimit({ windowMs: 60 * 60_000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: "Too many enquiries from this address. Please try again later." } });
  app.post("/api/enquiries", enquiryLimiter, async (req, res) => {
    if (req.body?.website) return res.status(201).json({ id: 0, reference: "IH-RECEIVED" }); // honeypot: quietly accept, store nothing
    const r = validateEnquiry(req.body);
    if (r.errors) return res.status(422).json({ error: "Please check the highlighted fields.", errors: r.errors });
    res.status(201).json(await store.createEnquiry(r.value));
  });

  // ---------- admin ----------
  const admin = express.Router();
  admin.use(rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }), (req, res, next) => {
    if (!adminToken) return res.status(503).json({ error: "Admin is disabled: set ADMIN_TOKEN." });
    const h = req.get("authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token || !safeEqual(token, adminToken)) return res.status(401).json({ error: "Invalid admin token." });
    next();
  });
  admin.get("/enquiries", async (req, res) => {
    const status = req.query.status;
    if (status && !STATUSES.includes(status)) return res.status(422).json({ error: "Unknown status." });
    res.json({ statuses: STATUSES, items: await store.listEnquiries(status) });
  });
  admin.patch("/enquiries/:id", async (req, res) => {
    if (!STATUSES.includes(req.body?.status)) return res.status(422).json({ error: "Unknown status." });
    const row = await store.setEnquiryStatus(Number(req.params.id), req.body.status);
    row ? res.json(row) : res.status(404).json({ error: "Enquiry not found." });
  });
  admin.get("/enquiries.csv", async (_req, res) => {
    const cols = ["reference", "created_at", "status", "name", "email", "company", "role", "country", "sites", "date", "time", "timezone", "duration", "priority"];
    // quote every cell; neutralise spreadsheet formulas
    const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
    const csv = [cols.join(","), ...(await store.listEnquiries()).map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
    res.set({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="industryhead-enquiries.csv"' }).send(csv);
  });
  app.use("/api/admin", admin);

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

  // ---------- built client (production) ----------
  if (staticDir && existsSync(join(staticDir, "index.html"))) {
    app.use(express.static(staticDir, { index: false, maxAge: "1h", setHeaders: (res, p) => { if (p.includes("/assets/")) res.set("Cache-Control", "public, max-age=31536000, immutable"); } }));
    app.get("/{*splat}", (_req, res) => res.sendFile(join(staticDir, "index.html")));
  }

  app.use((err, _req, res, _next) => {
    if (err.status === 503) return res.status(503).json({ error: err.dbCode ? "The demo is temporarily unavailable. Please try again shortly." : err.message });
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
    if (err.type === "entity.too.large") return res.status(413).json({ error: "Request too large." });
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  });
  return app;
}

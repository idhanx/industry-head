import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { sqliteStore, postgresStore, unconfiguredStore } from "../src/store.js";
import { createApp } from "../src/app.js";

const TOKEN = "test-token";
const future = () => new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
const good = () => ({ name: "Asha Rao", email: "Asha@Example.com", company: "Rao Castings", role: "Owner", country: "India", sites: "2–5 sites", priority: "Recurring stops", date: future(), time: "10:30", timezone: "Asia/Kolkata", duration: "30 minutes" });

async function start(store) {
  const app = createApp({ store, adminToken: TOKEN });
  const server = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const j = (path, opts = {}) => fetch(base + path, { ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) }, body: opts.body && JSON.stringify(opts.body) });
  return { j, close: () => new Promise((r) => server.close(r)) };
}
const A = { authorization: `Bearer ${TOKEN}` };

// The same suite runs against SQLite (local dev) and Postgres (production on Vercel — here via in-process PGlite).
const stores = [
  ["sqlite", () => sqliteStore(":memory:")],
  ["postgres (pglite)", async () => { const db = new PGlite(); return postgresStore((sql, params) => db.query(sql, params).then((r) => r.rows)); }]
];

for (const [name, make] of stores) {
  describe(name, () => {
    let s;
    before(async () => { s = await start(await make()); });
    after(() => s.close());

    test("content endpoint serves the layers, stages, chain and comparison", async () => {
      const c = await (await s.j("/api/content")).json();
      assert.equal(c.features.length, 6); assert.equal(c.stages.length, 6); assert.equal(c.chain.length, 8); assert.equal(c.comparison.rows.length, 11);
    });

    test("enquiry: valid submission is stored; admin can list and update it", async () => {
      const r = await s.j("/api/enquiries", { method: "POST", body: good() });
      assert.equal(r.status, 201); const { id, reference } = await r.json(); assert.match(reference, /^IH-/); assert.equal(typeof id, "number");
      assert.equal((await s.j("/api/admin/enquiries")).status, 401);
      const list = await (await s.j("/api/admin/enquiries", { headers: A })).json();
      const row = list.items.find((x) => x.id === id);
      assert.equal(row.email, "asha@example.com"); assert.equal(row.status, "new"); assert.match(row.created_at, /^\d{4}-\d\d-\d\dT/);
      const up = await s.j(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: A, body: { status: "contacted" } });
      assert.equal((await up.json()).status, "contacted");
      const filtered = await (await s.j("/api/admin/enquiries?status=contacted", { headers: A })).json();
      assert.ok(filtered.items.some((x) => x.id === id));
      assert.equal((await s.j("/api/admin/enquiries/99999", { method: "PATCH", headers: A, body: { status: "closed" } })).status, 404);
    });

    test("enquiry: invalid input returns per-field errors", async () => {
      const r = await s.j("/api/enquiries", { method: "POST", body: { ...good(), email: "nope", date: "2020-01-01", sites: "" } });
      assert.equal(r.status, 422); const { errors } = await r.json();
      assert.ok(errors.email && errors.date && errors.sites); assert.equal(errors.name, undefined);
    });

    test("enquiry: honeypot is accepted but not stored", async () => {
      const count = async () => (await (await s.j("/api/admin/enquiries", { headers: A })).json()).items.length;
      const before = await count();
      assert.equal((await s.j("/api/enquiries", { method: "POST", body: { ...good(), website: "http://spam" } })).status, 201);
      assert.equal(await count(), before);
    });

    test("csv export neutralises spreadsheet formulas", async () => {
      await s.j("/api/enquiries", { method: "POST", body: { ...good(), name: "=HYPERLINK(\"x\")" } });
      const csv = await (await s.j("/api/admin/enquiries.csv", { headers: A })).text();
      assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
    });

    test("tour: state is per session and mutations persist", async () => {
      const SA = { "x-demo-session": "session-aaaaaaaa" }, SB = { "x-demo-session": "session-bbbbbbbb" };
      assert.equal((await s.j("/api/tour")).status, 400);
      let a = await (await s.j("/api/tour/machines/CNC-02/reason", { method: "POST", headers: SA, body: { reason: "Breakdown" } })).json();
      assert.equal(a.machines.find((m) => m.id === "CNC-02").note, "Breakdown");
      a = await (await s.j("/api/tour/actions", { method: "POST", headers: SA, body: { machineId: "CNC-02" } })).json();
      assert.equal(a.actions.length, 4);
      a = await (await s.j("/api/tour/actions/1", { method: "PATCH", headers: SA, body: { stage: 3 } })).json();
      assert.equal(a.actions.find((x) => x.id === 1).stage, 3);
      const again = await (await s.j("/api/tour", { headers: SA })).json(); // reloaded from the store
      assert.equal(again.actions.length, 4);
      const b = await (await s.j("/api/tour", { headers: SB })).json();
      assert.equal(b.actions.length, 3); assert.equal(b.machines.find((m) => m.id === "CNC-02").note, "Tool change");
      assert.equal((await s.j("/api/tour/machines/CNC-01/reason", { method: "POST", headers: SA, body: { reason: "Breakdown" } })).status, 409);
      assert.equal((await s.j("/api/tour/actions/1", { method: "PATCH", headers: SA, body: { stage: 9 } })).status, 422);
    });
  });
}

describe("api basics", () => {
  let s;
  before(async () => { s = await start(await sqliteStore(":memory:")); });
  after(() => s.close());
  test("cost is a time-based figure the client can tick from", async () => {
    const d = await (await s.j("/api/cost")).json();
    assert.ok(d.total >= 18420 && d.stop >= 2140 && d.perSecond === 4 && d.at > 0);
  });
  test("unknown api route is a JSON 404", async () => { const r = await s.j("/api/nope"); assert.equal(r.status, 404); assert.ok((await r.json()).error); });
});

describe("vercel without a database", () => {
  let s;
  before(async () => { s = await start(unconfiguredStore()); });
  after(() => s.close());
  test("content and cost still work; storage routes say 503 clearly", async () => {
    assert.equal((await s.j("/api/content")).status, 200);
    assert.equal((await s.j("/api/cost")).status, 200);
    const r = await s.j("/api/enquiries", { method: "POST", body: good() });
    assert.equal(r.status, 503); assert.match((await r.json()).error, /DATABASE_URL/);
    assert.equal((await s.j("/api/tour", { headers: { "x-demo-session": "session-aaaaaaaa" } })).status, 503);
  });
});

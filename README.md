# Industryhead

Decision intelligence for manufacturing — marketing site and product tour. **React (Vite)** client + **Node (Express)** API,
deployable on **Vercel**.

```
client/        React 19 + Vite  (src/components, src/hooks, src/styles.css, src/editorial.css)
server/src/    Express 5 API    (app.js routes · content.js site copy · store.js persistence · validate.js)
api/index.js   Vercel serverless entry (wraps the same Express app)
vercel.json    build, rewrites, security headers
index.html     the original static page, kept for reference
```

## Local development

Requires Node 22.5+.

```bash
npm run install:all
npm run dev        # API :4000 + Vite :5173 (proxies /api)  →  http://localhost:5173   (admin: /admin, dev token: dev-admin-token)
npm test           # API tests: SQLite and Postgres (in-process PGlite)
```

Without `DATABASE_URL` the API stores data in a local SQLite file (`server/data/`, git-ignored).

## Deploy on Vercel

1. **Import** `idhanx/industry-head` in Vercel. The framework preset can stay *Other*; `vercel.json` sets the install/build commands and the
   output directory (`client/dist`). Node 22 is selected from `package.json`.
2. **Add a Postgres database** (Vercel → Storage → *Neon* or any Postgres) and make sure `DATABASE_URL` (or `POSTGRES_URL`) is set for the project — the integration usually adds it for you.
   Tables are created on first use.
3. **Set environment variables** (Production + Preview): `DATABASE_URL` and `ADMIN_TOKEN` (a long random string). See `.env.example`.
4. Deploy. The site is served from the CDN; `/api/*` runs as a serverless function; `/admin` is the enquiries dashboard.

Without `DATABASE_URL`, the site and `/api/content` still work, but the enquiry form and the stored product-tour state answer
`503 Storage is not configured`. Without `ADMIN_TOKEN`, the admin API answers 503.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | liveness + which store is active |
| GET | `/api/content` | platform layers, method stages, supply chain, comparison, industries, services, steps, trust, form options |
| GET | `/api/cost` | illustrative cost-of-stops figure + per-second rate (the client ticks from it) |
| GET/POST/PATCH | `/api/tour…` | product-tour state, private to a visitor (`X-Demo-Session` header) |
| POST | `/api/enquiries` | demo enquiry — validated, stored, rate-limited, honeypot field |
| GET | `/api/admin/enquiries[?status=]` | list — `Authorization: Bearer $ADMIN_TOKEN` |
| PATCH | `/api/admin/enquiries/:id` | status: `new` · `contacted` · `scheduled` · `closed` |
| GET | `/api/admin/enquiries.csv` | CSV export (spreadsheet formulas neutralised) |

## Things to know

- **Enquiries are stored, not emailed.** Check `/admin`, or add a mail/webhook call in `POST /api/enquiries`. No calendar is connected;
  the form collects a *preferred* slot only.
- **Rate limits are per serverless instance** (in-memory), so they slow abuse but are not a hard cap on Vercel. Put Vercel's Firewall /
  WAF rate limiting in front for a hard limit.
- Figures in the hero and product tour are illustrative sample data, as labelled on the page.
- Running on your own host instead: `npm start` builds the client and serves everything from one Node process (`server/src/index.js`).

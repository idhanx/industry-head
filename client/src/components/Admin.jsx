import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

const KEY = "ih-admin-token";
const read = () => { try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; } };

export default function Admin() {
  const [token, setToken] = useState(read);
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true); setError("");
    try { setData(await api.admin.list(token, filter)); }
    catch (e) { if (e.status === 401 || e.status === 503) { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setToken(""); } setError(e.message); }
    finally { setBusy(false); }
  }, [token, filter]);
  useEffect(() => { load(); }, [load]);

  const login = (e) => { e.preventDefault(); const t = input.trim(); if (!t) return; try { sessionStorage.setItem(KEY, t); } catch { /* ignore */ } setToken(t); setInput(""); };
  const logout = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setToken(""); setData(null); };
  const setStatus = async (id, status) => {
    try { const row = await api.admin.setStatus(token, id, status); setData((d) => ({ ...d, items: d.items.map((x) => (x.id === id ? row : x)) })); } catch (e) { setError(e.message); }
  };
  const csv = async () => {
    try { const b = await api.admin.csv(token); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "industryhead-enquiries.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); } catch (e) { setError(e.message); }
  };

  return (
    <div className="adm">
      <header className="adm-top">
        <a className="brand" href="/" aria-label="Industryhead — back to site"><span className="brand-mark" aria-hidden="true">ih</span><span><b>Industryhead</b><small>Demo enquiries</small></span></a>
        {token && <div className="adm-actions"><button className="btn btn-sm mt-btn" onClick={load} disabled={busy}>{busy ? "Refreshing…" : "Refresh"}</button><button className="btn btn-sm mt-btn" onClick={csv}>Export CSV</button><button className="btn btn-sm btn-primary" onClick={logout}>Sign out</button></div>}
      </header>
      <main className="adm-main">
        {!token ? (
          <form className="adm-login" onSubmit={login}>
            <h1>Admin sign-in</h1>
            <p>Enter the admin token to view demo enquiries.</p>
            <label>Admin token<input type="password" autoComplete="current-password" value={input} onChange={(e) => setInput(e.target.value)} autoFocus /></label>
            {error && <p className="field-err" role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit">Sign in</button>
          </form>
        ) : (
          <>
            <div className="adm-bar">
              <h1>Demo enquiries <span className="adm-count">{data ? data.items.length : "…"}</span></h1>
              <label className="adm-filter">Status
                <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All</option>{(data?.statuses || ["new", "contacted", "scheduled", "closed"]).map((s) => <option key={s}>{s}</option>)}</select>
              </label>
            </div>
            {error && <p className="field-err" role="alert">{error}</p>}
            {data && data.items.length === 0 && <p className="adm-empty">No enquiries{filter ? ` with status “${filter}”` : " yet"}.</p>}
            {data && data.items.length > 0 && (
              <div className="adm-table"><table>
                <thead><tr><th>Received</th><th>Who</th><th>Company</th><th>Plant</th><th>Preferred slot</th><th>Status</th></tr></thead>
                <tbody>
                  {data.items.map((r) => (
                    <tr key={r.id}>
                      <td><span className="mono">{r.reference}</span><br /><small>{new Date(r.created_at).toLocaleString()}</small></td>
                      <td><b>{r.name}</b><br /><a href={`mailto:${r.email}`}>{r.email}</a><br /><small>{r.role} · {r.country}</small></td>
                      <td>{r.company}</td>
                      <td>{r.sites}{r.priority && <><br /><small>{r.priority}</small></>}</td>
                      <td>{r.date} {r.time}<br /><small>{r.timezone} · {r.duration}</small></td>
                      <td><select className={`st st-${r.status}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} aria-label={`Status for ${r.name}`}>{data.statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

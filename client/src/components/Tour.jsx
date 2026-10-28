import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { useCost } from "../hooks/useLiveCost.jsx";
import { Reveal, CountUp, useGrow } from "../hooks/useReveal.jsx";
import { inr, tabKeyTarget } from "../util.js";

const TABS = [["grid", "Machine Grid"], ["oee", "OEE & FPY"], ["loss", "Downtime cost"], ["fin", "Financial view"], ["act", "Actions"]];
const LABEL = { run: "Running", stop: "Stopped", slow: "Running slow", hold: "Hold" };
const STAGES = ["P", "D", "C", "A"], STAGE_FULL = ["Plan", "Do", "Check", "Act"];

function GridPane({ data, run, notify }) {
  const cost = useCost();
  const [sel, setSel] = useState(1);
  const m = data.machines[sel];
  return (
    <div className="pane-grid">
      <div className="glass">
        <h4>Machine Grid · Shift A</h4>
        <p className="sub">Select a machine for details.</p>
        <div className="mgrid">
          {data.machines.map((x, i) => (
            <button key={x.id} type="button" className={`mc ${x.st}`} aria-pressed={i === sel} onClick={() => setSel(i)}>
              <b>{x.id}</b><span>{x.job}</span><span>{x.note}</span>
              {x.st === "stop" && <span className="c">{inr(cost.stop)}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="glass detail" aria-live="polite">
        <span className={`pill ${m.st}`}>{LABEL[m.st]}</span>
        <h4>{m.id}</h4>
        <dl className="dl"><div><dt>Job · operation</dt><dd>{m.job}</dd></div><div><dt>Status</dt><dd>{m.note}</dd></div></dl>
        {m.st === "stop" ? (
          <>
            <small style={{ color: "#7FA3A8" }}>Cost of this stop, ticking</small>
            <div className="big">{inr(cost.stop)}</div>
            <div className="chips" role="group" aria-label="Stop reason">
              {data.reasons.map((r) => (
                <button key={r} type="button" className="chip" aria-pressed={r === m.note} onClick={() => run(() => api.setReason(m.id, r), "Stop reason logged: " + r)}>{r}</button>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: "#9FBFC3", fontSize: ".9rem", margin: "6px 0 14px" }}>{m.st === "run" ? "No loss logged on this machine this shift." : "Loss is priced the moment it is logged and ranked with the rest."}</p>
        )}
        <button type="button" className="btn btn-gold btn-sm" onClick={() => run(() => api.addAction(m.id), `Action raised for ${m.id} — see the Actions tab`)}>
          Raise action <svg aria-hidden="true"><use href="#arrow" /></svg>
        </button>
        <p className="ill">Illustrative data.</p>
      </div>
    </div>
  );
}

function OeePane({ data }) {
  const on = useGrow();
  const o = data.oee;
  const rings = [["Availability", o.availability, 0], ["Performance", o.performance, 0], ["Quality (FPY)", o.quality, 1], ["OEE", o.oee, 0, "oee"]];
  return (
    <div className="pane-grid">
      <div className="glass">
        <h4>OEE breakdown · Shift A</h4>
        <p className="sub">Availability × Performance × Quality</p>
        <div className="rings">
          {rings.map(([label, v, dec, cls]) => (
            <div className={`ring${cls ? " " + cls : ""}`} key={label}>
              <svg viewBox="0 0 120 120" aria-hidden="true"><circle className="bg" cx="60" cy="60" r="50" /><circle className="fg" cx="60" cy="60" r="50" style={{ strokeDashoffset: on ? 314 * (1 - v / 100) : 314 }} /></svg>
              <b><CountUp to={v} dec={dec} suffix="%" /></b><small>{label}</small>
            </div>
          ))}
        </div>
        <p className="ill">Illustrative values. Target {o.target}%.</p>
      </div>
      <div className="glass">
        <h4>OEE by hour</h4>
        <p className="sub">Dips show where the shift lost ground</p>
        <div className="hours-wrap"><div className="hours">
          {data.oeeHours.map((h) => <div key={h.hour} className={h.oee < 70 ? "lo" : ""} style={{ height: on ? h.oee * 1.4 + "%" : 0 }} title={`${h.hour}:00 · OEE ${h.oee}%`}><i>{h.hour}</i></div>)}
        </div></div>
      </div>
    </div>
  );
}

function LossPane({ data }) {
  const on = useGrow();
  const total = data.stopSplit.reduce((a, x) => a + x.amount, 0);
  return (
    <div className="pane-grid">
      <div className="glass">
        <h4>Where the shift's money went</h4>
        <p className="sub">Ranked loss, in rupees</p>
        {data.loss.map((l) => (
          <div className="lossbar" key={l.label}><span>{l.label}</span><div className="tr"><i className={l.hot ? "r" : ""} style={{ width: on ? l.pct + "%" : 0 }}></i></div><em>{inr(l.amount)}</em></div>
        ))}
        <p className="ill">Illustrative figures.</p>
      </div>
      <div className="glass">
        <h4>Anatomy of one stop · CNC-02</h4>
        <p className="sub">Machine, labour, overhead and lost margin — counted once</p>
        <div className="big"><CountUp to={total} prefix="₹" indian /></div>
        <div className="split">{data.stopSplit.map((x) => <i key={x.label} style={{ background: x.color, width: on ? (x.amount / total) * 100 + "%" : 0 }}></i>)}</div>
        <div className="legend-i">{data.stopSplit.map((x) => <div key={x.label}><span><i style={{ background: x.color }}></i>{x.label}</span><b className="mono" style={{ color: "#fff" }}>{inr(x.amount)}</b></div>)}</div>
      </div>
    </div>
  );
}

function FinPane({ data }) {
  const on = useGrow();
  const est = data.loss.reduce((a, l) => a + l.amount, 0);
  const [areaOn, setAreaOn] = useState(false);
  useEffect(() => { if (!on) return; const t = setTimeout(() => setAreaOn(true), 1600); return () => clearTimeout(t); }, [on]);
  return (
    <>
      <div className="fin">
        <div className="glass"><small>Estimated loss · this shift</small><strong><CountUp to={est} prefix="₹" indian /></strong></div>
        <div className="glass"><small>Finance actuals</small><strong>Kept separate</strong></div>
        <div className="glass gold"><small>Recovered profit</small><strong>Verified only</strong></div>
      </div>
      <div className="pane-grid">
        <div className="glass">
          <h4>Estimate → action → verified saving</h4>
          <p className="sub">A saving counts only when it is re-measured against its frozen baseline.</p>
          <svg viewBox="0 0 520 190" style={{ width: "100%", height: "auto" }} role="img" aria-label="Chart: loss falls after an action is raised and the saving is verified against a baseline">
            <defs><linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EBC958" stopOpacity=".35" /><stop offset="1" stopColor="#EBC958" stopOpacity="0" /></linearGradient></defs>
            <g stroke="rgba(255,255,255,.08)"><path d="M0 30H520M0 80H520M0 130H520M0 180H520" /></g>
            <path d="M0 55 H300" stroke="#FF9D87" strokeWidth="2" strokeDasharray="6 6" fill="none" />
            <text x="8" y="46" fill="#FF9D87" fontSize="11" fontFamily="monospace">frozen baseline</text>
            <path d="M0 60 L60 52 L120 62 L180 50 L240 58 L300 56 L360 88 L420 118 L480 126 L520 130 L520 190 L0 190Z" fill="url(#fg1)" style={{ opacity: areaOn ? 1 : 0, transition: "opacity 1s" }} />
            <path d="M0 60 L60 52 L120 62 L180 50 L240 58 L300 56 L360 88 L420 118 L480 126 L520 130" fill="none" stroke="#EBC958" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, transition: "stroke-dashoffset 2s cubic-bezier(.2,.7,.2,1)" }} />
            <line x1="300" x2="300" y1="10" y2="180" stroke="#5FE0AE" strokeDasharray="3 5" />
            <text x="306" y="24" fill="#5FE0AE" fontSize="11" fontFamily="monospace">action completed</text>
            <text x="438" y="106" fill="#fff" fontSize="11" fontFamily="monospace">re-measured</text>
          </svg>
          <p className="ill">Illustrative shape only — not a performance claim.</p>
        </div>
        <div className="glass">
          <h4>What stays apart</h4>
          <p className="sub">So the numbers can be trusted</p>
          <div className="legend-i" style={{ gap: 14 }}>
            {[["var(--gold)", "Estimates from logged stops"], ["#5FE0AE", "Finance actuals, entered separately"], ["#FF8A70", "Frozen baseline for each loss"], ["#fff", "Savings verified after the fix"]].map(([c, t]) => <div key={t}><span><i style={{ background: c }}></i>{t}</span></div>)}
          </div>
        </div>
      </div>
    </>
  );
}

function ActPane({ data, run }) {
  return (
    <div className="glass">
      <h4>Actions · PDCA</h4>
      <p className="sub">Select a stage to move an action forward. Raise new ones from the Machine Grid.</p>
      <div className="acts">
        {data.actions.map((a) => (
          <div className="act" key={a.id}>
            <div><b>{a.title}</b><small>{a.owner}</small></div>
            <span className="cost">{a.cost}</span>
            <div className="stages" role="group" aria-label="PDCA stage">
              {STAGES.map((n, k) => (
                <button key={n} type="button" className={k < a.stage ? "done" : k === a.stage ? "cur" : ""} aria-label={STAGE_FULL[k]} aria-pressed={k === a.stage}
                  onClick={() => run(() => api.setStage(a.id, k), k === 3 ? "Moved to Act — saving will be verified against the baseline" : null)}>{n}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Tour() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState("");
  const tabRefs = useRef([]);
  const toastT = useRef();

  const load = useCallback(() => { setError(""); api.tour().then(setData).catch((e) => setError(e.message)); }, []);
  useEffect(load, [load]);

  const notify = useCallback((m) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(""), 2600); }, []);
  const run = useCallback(async (fn, msg) => {
    try { setData(await fn()); if (msg) notify(msg); } catch (e) { notify(e.message || "Something went wrong"); }
  }, [notify]);

  const onKey = (e, i) => { const t = tabKeyTarget(e, i, TABS.length); if (t !== null) { e.preventDefault(); setTab(t); tabRefs.current[t]?.focus(); } };

  return (
    <section id="tour" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Interactive product tour</span>
          <h2>Click around. This is what your owner and supervisors <em>see.</em></h2>
          <p className="lead">A working model of the Industryhead screens — select a machine, log a reason, raise an action and move it through PDCA.</p>
        </Reveal>
        <Reveal className="demo-shell">
          <div className="tabs" role="tablist" aria-label="Product views">
            {TABS.map(([id, label], i) => (
              <button key={id} ref={(el) => (tabRefs.current[i] = el)} className="tab" role="tab" id={`t-${id}`} aria-controls={`p-${id}`} aria-selected={tab === i} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} onKeyDown={(e) => onKey(e, i)}>{label}</button>
            ))}
          </div>
          {!data && !error && <div className="pane on"><p className="ill" role="status">Loading the demo…</p></div>}
          {error && <div className="pane on"><p className="ill" role="alert">Couldn't load the demo ({error}). <button className="chip" onClick={load}>Retry</button></p></div>}
          {data && (
            <div className="pane on" role="tabpanel" id={`p-${TABS[tab][0]}`} aria-labelledby={`t-${TABS[tab][0]}`} key={tab}>
              {tab === 0 && <GridPane data={data} run={run} />}
              {tab === 1 && <OeePane data={data} />}
              {tab === 2 && <LossPane data={data} />}
              {tab === 3 && <FinPane data={data} />}
              {tab === 4 && <ActPane data={data} run={run} />}
            </div>
          )}
        </Reveal>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </section>
  );
}

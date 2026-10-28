import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { useCost } from "../hooks/useLiveCost.jsx";
import { useReduced } from "../hooks/useReduced.js";
import { Reveal, CountUp, useGrow, useInView } from "../hooks/useReveal.jsx";
import { inr, tabKeyTarget } from "../util.js";

const TABS = [["grid", "Machine Grid"], ["oee", "OEE & FPY"], ["loss", "Downtime cost"], ["fin", "Financial view"], ["act", "Actions"]];
const LABEL = { run: "Running", stop: "Stopped", slow: "Running slow", hold: "Hold" };
const STAGES = ["P", "D", "C", "A"], STAGE_FULL = ["Plan", "Do", "Check", "Act"];
const TOUR_MS = 7000;

/** Ticking number: a digit that changes slides up into place (no backwards roll when 9 wraps to 0). */
function Roll({ value }) {
  const chars = [...value];
  return (
    <span className="roll" role="img" aria-label={value}>
      {chars.map((ch, i) => <span className="dg" key={`${chars.length - i}-${ch}`} aria-hidden="true">{ch}</span>)}
    </span>
  );
}

/** A tiny activity strip per machine (illustrative): running = steady, slow = dips, stopped = flat red tail, hold = amber. */
function Strip({ id, st }) {
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bars = Array.from({ length: 16 }, (_, i) => {
    const wave = 52 + Math.sin(i * 1.1 + seed) * 22 + Math.cos(i * 0.5 + seed) * 10;
    if (st === "stop") return i > 10 ? { h: 14, c: "stop" } : { h: wave, c: "" };
    if (st === "slow") return { h: i % 4 === 3 ? 28 : wave * 0.8, c: i % 4 === 3 ? "slow" : "" };
    if (st === "hold") return { h: i > 12 ? 20 : wave, c: i > 12 ? "slow" : "" };
    return { h: wave, c: "" };
  });
  return <span className="mc-strip" aria-hidden="true">{bars.map((b, i) => <i key={i} className={b.c} style={{ "--h": b.h + "%", "--i": i }} />)}</span>;
}

function GridPane({ data, run, notify }) {
  const cost = useCost();
  const [sel, setSel] = useState(1);
  const [raised, setRaised] = useState(false);
  const m = data.machines[sel];
  const raise = async () => { await run(() => api.addAction(m.id), `Action raised for ${m.id} — see the Actions tab`); setRaised(true); setTimeout(() => setRaised(false), 1800); };
  return (
    <div className="pane-grid">
      <div className="glass">
        <h4>Machine Grid · Shift A</h4>
        <p className="sub">Select a machine for details.</p>
        <div className="mgrid">
          {data.machines.map((x, i) => (
            <button key={x.id} type="button" className={`mc ${x.st}`} aria-pressed={i === sel} style={{ "--i": i }} onClick={() => setSel(i)}>
              <b>{x.id}</b><span>{x.job}</span><span>{x.note}</span>
              <span className="c" aria-hidden={x.st !== "stop"}>{x.st === "stop" ? inr(cost.stop) : " "}</span>
              <Strip id={x.id} st={x.st} />
            </button>
          ))}
        </div>
      </div>
      <div className="glass detail" aria-live="polite">
        <div className="detail-in" key={m.id}>
          <div className="dt-head"><h4>{m.id}</h4><span className={`pill ${m.st}`}>{LABEL[m.st]}</span></div>
          <p className="sub">Selected machine</p>
          <dl className="dl"><div><dt>Job · operation</dt><dd>{m.job}</dd></div><div><dt>Status</dt><dd>{m.note}</dd></div></dl>
          {m.st === "stop" ? (
            <>
              <small style={{ color: "#7FA3A8" }}>Cost of this stop, ticking</small>
              <div className="big"><Roll value={inr(cost.stop)} /></div>
              <div className="chips" role="group" aria-label="Stop reason">
                {data.reasons.map((r) => (
                  <button key={r} type="button" className="chip" aria-pressed={r === m.note} onClick={() => run(() => api.setReason(m.id, r), "Stop reason logged: " + r)}>{r}</button>
                ))}
              </div>
            </>
          ) : (
            <p className="calm">{m.st === "run" ? "No loss logged on this machine this shift." : "Loss is priced the moment it is logged and ranked with the rest."}</p>
          )}
          <button type="button" className={`btn btn-gold btn-sm${raised ? " done" : ""}`} onClick={raise}>
            {raised ? <>Action raised <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></> : <>Raise action <svg aria-hidden="true"><use href="#arrow" /></svg></>}
          </button>
          <p className="ill">Illustrative data.</p>
        </div>
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
          {rings.map(([label, v, dec, cls], i) => (
            <div className={`ring${cls ? " " + cls : ""}`} key={label}>
              <svg viewBox="0 0 120 120" aria-hidden="true"><circle className="bg" cx="60" cy="60" r="50" /><circle className="fg" cx="60" cy="60" r="50" style={{ strokeDashoffset: on ? 314 * (1 - v / 100) : 314, transitionDelay: i * 140 + "ms" }} /></svg>
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
          <span className="target" style={{ bottom: o.target + "%" }}><em>Target {o.target}%</em></span>
          {data.oeeHours.map((h, i) => <div key={h.hour} className={h.oee < o.target - 5 ? "lo" : ""} style={{ height: on ? h.oee + "%" : 0, transitionDelay: i * 70 + "ms" }} title={`${h.hour}:00 · OEE ${h.oee}%`}><b>{h.oee}</b><i>{h.hour}</i></div>)}
        </div></div>
      </div>
    </div>
  );
}

function LossPane({ data }) {
  const on = useGrow();
  const [hov, setHov] = useState(-1);
  const total = data.stopSplit.reduce((a, x) => a + x.amount, 0);
  return (
    <div className="pane-grid">
      <div className="glass">
        <h4>Where the shift's money went</h4>
        <p className="sub">Ranked loss, in rupees</p>
        {data.loss.map((l, i) => (
          <div className="lossbar" key={l.label}><span>{l.label}</span><div className="tr"><i className={l.hot ? "r" : ""} style={{ width: on ? l.pct + "%" : 0, transitionDelay: i * 110 + "ms" }}></i></div><em>{inr(l.amount)}</em></div>
        ))}
        <p className="ill">Illustrative figures.</p>
      </div>
      <div className="glass">
        <h4>Anatomy of one stop · CNC-02</h4>
        <p className="sub">Machine, labour, overhead and lost margin — counted once</p>
        <div className="big"><CountUp to={total} prefix="₹" indian /></div>
        <div className={`split${hov >= 0 ? " has-hov" : ""}`}>{data.stopSplit.map((x, i) => <i key={x.label} className={hov === i ? "hov" : ""} style={{ background: x.color, width: on ? (x.amount / total) * 100 + "%" : 0, transitionDelay: i * 120 + "ms" }} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(-1)}></i>)}</div>
        <div className="legend-i">{data.stopSplit.map((x, i) => (
          <div key={x.label} className={hov === i ? "hov" : ""} tabIndex={0} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(-1)} onFocus={() => setHov(i)} onBlur={() => setHov(-1)}>
            <span><i style={{ background: x.color }}></i>{x.label}</span><b className="mono" style={{ color: "#fff" }}>{inr(x.amount)} <small>{Math.round((x.amount / total) * 100)}%</small></b>
          </div>
        ))}</div>
      </div>
    </div>
  );
}

function FinPane({ data }) {
  const on = useGrow();
  const est = data.loss.reduce((a, l) => a + l.amount, 0);
  const [areaOn, setAreaOn] = useState(false);
  useEffect(() => { if (!on) return; const t = setTimeout(() => setAreaOn(true), 1700); return () => clearTimeout(t); }, [on]);
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
          <svg viewBox="0 0 520 190" style={{ width: "100%", height: "auto", overflow: "visible" }} role="img" aria-label="Chart: loss falls after an action is raised and the saving is verified against a baseline">
            <defs><linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EBC958" stopOpacity=".35" /><stop offset="1" stopColor="#EBC958" stopOpacity="0" /></linearGradient></defs>
            <g stroke="rgba(255,255,255,.08)"><path d="M0 30H520M0 80H520M0 130H520M0 180H520" /></g>
            <path d="M0 55 H300" stroke="#FF9D87" strokeWidth="2" strokeDasharray="6 6" fill="none" style={{ opacity: on ? 1 : 0, transition: "opacity .8s .2s" }} />
            <text x="8" y="46" fill="#FF9D87" fontSize="11" fontFamily="monospace">frozen baseline</text>
            <path d="M0 60 L60 52 L120 62 L180 50 L240 58 L300 56 L360 88 L420 118 L480 126 L520 130 L520 190 L0 190Z" fill="url(#fg1)" style={{ opacity: areaOn ? 1 : 0, transition: "opacity 1s" }} />
            <path d="M0 60 L60 52 L120 62 L180 50 L240 58 L300 56 L360 88 L420 118 L480 126 L520 130" fill="none" stroke="#EBC958" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, transition: "stroke-dashoffset 2s cubic-bezier(.2,.7,.2,1)" }} />
            <g style={{ opacity: on ? 1 : 0, transition: "opacity .4s 1.9s" }}>
              <line x1="300" x2="300" y1="10" y2="180" stroke="#5FE0AE" strokeDasharray="3 5" />
              <text x="306" y="24" fill="#5FE0AE" fontSize="11" fontFamily="monospace">action completed</text>
              <circle className="ping" cx="520" cy="130" r="5" fill="#EBC958" />
              <circle cx="520" cy="130" r="5" fill="#EBC958" />
              <text x="438" y="106" fill="#fff" fontSize="11" fontFamily="monospace">re-measured</text>
            </g>
          </svg>
          <p className="ill">Illustrative shape only — not a performance claim.</p>
        </div>
        <div className="glass">
          <h4>What stays apart</h4>
          <p className="sub">So the numbers can be trusted</p>
          <div className="legend-i keep">
            {[["var(--gold)", "Estimates from logged stops"], ["#5FE0AE", "Finance actuals, entered separately"], ["#FF8A70", "Frozen baseline for each loss"], ["#fff", "Savings verified after the fix"]].map(([c, t], i) => <div key={t} style={{ "--i": i }}><span><i style={{ background: c }}></i>{t}</span></div>)}
          </div>
        </div>
      </div>
    </>
  );
}

function ActPane({ data, run, lastId }) {
  return (
    <div className="glass">
      <h4>Actions · PDCA</h4>
      <p className="sub">Select a stage to move an action forward. Raise new ones from the Machine Grid.</p>
      <div className="acts">
        {data.actions.map((a, i) => (
          <div className={`act${a.id === lastId ? " fresh" : ""}${a.stage === 3 ? " verified" : ""}`} key={a.id} style={{ "--i": i }}>
            <div><b>{a.title}</b><small>{a.owner}</small></div>
            <span className="cost">{a.cost}</span>
            <div className="stages" role="group" aria-label="PDCA stage" style={{ "--p": a.stage / 3 }}>
              {STAGES.map((n, k) => (
                <button key={n} type="button" data-l={STAGE_FULL[k]} className={k < a.stage ? "done" : k === a.stage ? "cur" : ""} aria-label={STAGE_FULL[k]} aria-pressed={k === a.stage}
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
  const reduced = useReduced();
  const cost = useCost();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState("");
  const [auto, setAuto] = useState(true);       // the self-playing tour stops for good when the visitor interacts
  const [hold, setHold] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [bump, setBump] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [viewRef, inView] = useInView({ threshold: 0.35 }, false);
  const tabRefs = useRef([]), barRef = useRef(null), prev = useRef(0), toastT = useRef(), openCount = useRef(null);
  const dir = tab >= prev.current ? "fwd" : "back";
  useEffect(() => { prev.current = tab; }, [tab]);
  useEffect(() => { const f = () => setHidden(document.hidden); document.addEventListener("visibilitychange", f); return () => document.removeEventListener("visibilitychange", f); }, []);

  const load = useCallback(() => { setError(""); api.tour().then(setData).catch((e) => setError(e.message)); }, []);
  useEffect(load, [load]);

  const notify = useCallback((m) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(""), 2600); }, []);
  const run = useCallback(async (fn, msg) => {
    try {
      const before = new Set((data?.actions || []).map((a) => a.id));
      const next = await fn();
      const added = next.actions.find((a) => !before.has(a.id));
      if (added) { setLastId(added.id); setBump((b) => b + 1); }
      setData(next); if (msg) notify(msg);
    } catch (e) { notify(e.message || "Something went wrong"); }
  }, [notify, data]);

  // sliding tab indicator
  const place = useCallback(() => {
    const el = tabRefs.current[tab], bar = barRef.current;
    if (el && bar) { bar.style.setProperty("--ix", el.offsetLeft + "px"); bar.style.setProperty("--iw", el.offsetWidth + "px"); }
  }, [tab]);
  useLayoutEffect(place, [place, data]);
  useEffect(() => { addEventListener("resize", place); return () => removeEventListener("resize", place); }, [place]);

  const choose = (i) => { setTab(i); setAuto(false); };
  const onKey = (e, i) => { const t = tabKeyTarget(e, i, TABS.length); if (t !== null) { e.preventDefault(); choose(t); tabRefs.current[t]?.focus(); } };
  const playing = auto && !reduced;
  const paused = hold || hidden || !inView;
  const open = data ? data.actions.filter((a) => a.stage < 3).length : 0;

  return (
    <section id="tour" style={{ paddingTop: 0 }} ref={viewRef}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Interactive product tour</span>
          <h2>Click around. This is what your owner and supervisors <em>see.</em></h2>
          <p className="lead">A working model of the Industryhead screens — select a machine, log a reason, raise an action and move it through PDCA.</p>
        </Reveal>

        <Reveal className={`tour-win${paused ? " paused" : ""}`} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
          <div className="win-bar"><i></i><i></i><i></i><span>industryhead · product tour</span><b className="live">Live</b></div>

          <div className="kpi-strip" aria-label="Shift summary">
            <div className="ks money"><small>Cost of stops · this shift</small><strong><Roll value={inr(cost.total)} /></strong></div>
            <div className="ks"><small>OEE</small><strong>{data ? data.oee.oee : 71}%</strong><em>target {data ? data.oee.target : 75}%</em></div>
            <div className="ks"><small>FPY</small><strong>{data ? data.oee.quality : 97.8}%</strong></div>
            <div className="ks"><small>Actions open</small><strong key={bump} className={bump ? "bump" : undefined} ref={openCount}>{open}</strong></div>
          </div>

          <div className="tour-tabs">
            <div className="tabs" role="tablist" aria-label="Product views">
              {TABS.map(([id, label], i) => (
                <button key={id} ref={(el) => (tabRefs.current[i] = el)} className="tab" role="tab" id={`t-${id}`} aria-controls={`p-${id}`} aria-selected={tab === i} tabIndex={tab === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={(e) => onKey(e, i)}>
                  {label}{id === "act" && data && <span className="tab-n" key={bump}>{open}</span>}
                </button>
              ))}
              <span className="tab-ind" ref={barRef} aria-hidden="true">
                <i key={tab + (playing ? "p" : "s")} className={playing ? "run" : "full"} onAnimationEnd={(e) => { if (e.animationName === "tour-count" && playing) setTab((t) => (t + 1) % TABS.length); }}></i>
              </span>
            </div>
            <button type="button" className="tour-play" aria-label={auto ? "Pause the automatic tour" : "Play the automatic tour"} onClick={() => setAuto((a) => !a)} disabled={reduced}>
              {auto && !reduced
                ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                : <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z" /></svg>}
            </button>
          </div>

          <div className="tour-stage" onPointerDownCapture={() => setAuto(false)} onKeyDownCapture={() => setAuto(false)}>
            {!data && !error && <div className="pane on"><p className="ill" role="status">Loading the demo…</p></div>}
            {error && <div className="pane on"><p className="ill" role="alert">Couldn't load the demo ({error}). <button className="chip" onClick={load}>Retry</button></p></div>}
            {data && (
              <div className={`pane on ${dir}`} role="tabpanel" id={`p-${TABS[tab][0]}`} aria-labelledby={`t-${TABS[tab][0]}`} key={tab}>
                {tab === 0 && <GridPane data={data} run={run} />}
                {tab === 1 && <OeePane data={data} />}
                {tab === 2 && <LossPane data={data} />}
                {tab === 3 && <FinPane data={data} />}
                {tab === 4 && <ActPane data={data} run={run} lastId={lastId} />}
              </div>
            )}
          </div>
        </Reveal>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </section>
  );
}

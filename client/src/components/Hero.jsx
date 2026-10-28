import { useEffect, useRef, useState } from "react";
import { useCost } from "../hooks/useLiveCost.jsx";
import { useReduced } from "../hooks/useReduced.js";
import { inr, tabKeyTarget } from "../util.js";

const NAMES = ["Machine grid", "Decisions", "Copilot", "Plant Memory", "Assurance"];
const DUR = 6000;
const Arrow = () => <svg aria-hidden="true"><use href="#arrow" /></svg>;
const Tick = () => <svg aria-hidden="true"><use href="#tick" /></svg>;
const rise = (i) => ({ "--i": i });

function Slide({ idx, on, title, label, children }) {
  return (
    <div className={`slide${on ? " on" : ""}`} role="group" aria-roledescription="slide" aria-label={`${idx + 1} of 5: ${label}`} data-title={title} aria-hidden={!on} inert={!on}>
      {children}
    </div>
  );
}

function Showcase() {
  const reduced = useReduced();
  const cost = useCost();
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(reduced);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const sx = useRef(null);
  const n = NAMES.length;
  const go = (i) => setIdx((i + n) % n);

  useEffect(() => { if (reduced) setUserPaused(true); }, [reduced]);
  useEffect(() => { const f = () => setHidden(document.hidden); document.addEventListener("visibilitychange", f); return () => document.removeEventListener("visibilitychange", f); }, []);

  const paused = userPaused || hoverPaused || hidden;
  const titles = ["machine-grid", "decision-intelligence", "manufacturing-copilot", "plant-memory", "action-assurance"];

  return (
    <div className={`show${paused ? " paused" : ""}`} id="show" role="region" aria-roledescription="carousel" aria-label="Industryhead product preview"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHoverPaused(true)} onPointerLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)} onBlur={() => setHoverPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(idx + 1); else if (e.key === "ArrowLeft") go(idx - 1); }}>
      <div className="show-win">
        <div className="app-bar"><i></i><i></i><i></i><span>industryhead · {titles[idx]}</span><b className="live" style={{ marginLeft: "auto" }}>Live</b></div>
        <div className="show-view"
          onPointerDown={(e) => { sx.current = e.clientX; }}
          onPointerUp={(e) => { if (sx.current === null) return; const dx = e.clientX - sx.current; sx.current = null; if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1)); }}
          onPointerCancel={() => { sx.current = null; }}>
          <div className="show-track" style={{ transform: `translateX(${-idx * 100}%)` }}>

            <Slide idx={0} on={idx === 0} label="Machine grid">
              <div className="main-head rise" style={rise(0)}><h4>Machine Grid · Shift A</h4><span className="sl-k">6 machines</span></div>
              <div className="kpis rise" style={rise(1)}>
                <div className="kpi money"><small>Cost of stops · this shift</small><strong>{inr(cost.total)}</strong></div>
                <div className="kpi"><small>OEE</small><strong>71%</strong><em>target 75%</em></div>
                <div className="kpi"><small>FPY</small><strong>97.8%</strong></div>
              </div>
              <div className="machines rise" style={rise(2)}>
                <div className="m"><b>CNC-01</b><span>BR-110 · Op10</span></div>
                <div className="m stop"><b>CNC-02</b><span>Tool change</span><span className="c">{inr(cost.stop)}</span></div>
                <div className="m"><b>VMC-03</b><span>PL-330 · Op20</span></div>
                <div className="m slow"><b>PRS-01</b><span>Slow cycle −12%</span></div>
                <div className="m"><b>ASM-L1</b><span>Line 1 · 8 / 8</span></div>
                <div className="m"><b>INSP-1</b><span>3 on hold</span></div>
              </div>
            </Slide>

            <Slide idx={1} on={idx === 1} label="Decision Intelligence">
              <div className="sl-head rise" style={rise(0)}><small>Decision Intelligence</small><h4>Which issue needs a decision first?</h4></div>
              <div className="sl-flow">
                <div className="sl-step rise" style={rise(1)}><b>Problem</b><span>A recurring stop threatens an urgent order.</span><em className="mono">{inr(cost.stop)}</em></div>
                <div className="sl-step rise" style={rise(2)}><b>Decision</b><span>Compare the estimated cost, delivery exposure and previous evidence.</span></div>
                <div className="sl-step rise" style={rise(3)}><b>Response</b><span>Approve a countermeasure, assign an owner and set a review.</span></div>
              </div>
            </Slide>

            <Slide idx={2} on={idx === 2} label="Manufacturing Copilot">
              <div className="sl-head rise" style={rise(0)}><small>Manufacturing Copilot</small><h4>Ask a practical question. Follow the evidence.</h4></div>
              <div className="sl-chat">
                <p className="q rise" style={rise(1)}>“Why did this order miss its planned completion?”</p>
                <div className="a rise" style={rise(2)}>
                  <small>Copilot · bringing the evidence together</small>
                  <div className="ev"><span>Related stops</span><span>Quality holds</span><span>Shift notes</span></div>
                </div>
                <p className="sl-foot rise" style={rise(3)}>Review the evidence before deciding the next action.</p>
              </div>
            </Slide>

            <Slide idx={3} on={idx === 3} label="Plant Memory">
              <div className="sl-head rise" style={rise(0)}><small>Plant Memory</small><h4>A familiar fault returns on a different shift.</h4></div>
              <div className="sl-flow">
                <div className="sl-step rise" style={rise(1)}><b>Earlier cause</b><span>Find what was found the last time.</span></div>
                <div className="sl-step rise" style={rise(2)}><b>Repair</b><span>See what was tried and what worked.</span></div>
                <div className="sl-step rise" style={rise(3)}><b>Verification record</b><span>Reuse the proven response and keep the new evidence attached.</span></div>
              </div>
            </Slide>

            <Slide idx={4} on={idx === 4} label="Action and Assurance">
              <div className="sl-head rise" style={rise(0)}><small>Action &amp; Assurance</small><h4>Make the improvement hold.</h4></div>
              <div className="sl-act rise" style={rise(1)}>
                <span className="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" /></svg></span>
                <span><b>Action raised · CNC-02</b><small>Owner: Maintenance · due Thu</small></span>
              </div>
              <ul className="sl-check">
                <li className="rise" style={rise(2)}><i>✓</i>Improvement action marked complete</li>
                <li className="rise" style={rise(3)}><i>✓</i>Outcome checked against its baseline and review period</li>
                <li className="rise" style={rise(4)}><i>✓</i>Result confirmed, standard updated, follow-up scheduled</li>
              </ul>
            </Slide>

          </div>
        </div>
        <div className="show-foot">
          <p className="show-cap" aria-live="off"><b>{String(idx + 1).padStart(2, "0")}</b><span key={idx}>{NAMES[idx]}</span></p>
          <div className="segs" onAnimationEnd={(e) => { if (e.animationName === "segfill" && !userPaused) go(idx + 1); }}>
            {NAMES.map((t, k) => (
              <button key={t} type="button" className={`seg${k < idx ? " done" : ""}${k === idx ? " on" : ""}${k === idx && userPaused && reduced ? " static" : ""}`}
                style={{ "--dur": DUR + "ms" }} aria-label={`Show slide ${k + 1}: ${t}`} title={t} aria-current={k === idx ? "true" : undefined} onClick={() => go(k)}>
                <span className="bar-t"><i></i></span>
              </button>
            ))}
          </div>
          <div className="show-ctl">
            <button type="button" className="ctl" aria-label="Previous slide" onClick={() => go(idx - 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
            <button type="button" className="ctl" aria-label={userPaused ? "Play automatic slides" : "Pause automatic slides"} onClick={() => setUserPaused((p) => !p)}>
              {userPaused
                ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z" /></svg>
                : <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>}
            </button>
            <button type="button" className="ctl" aria-label="Next slide" onClick={() => go(idx + 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
          </div>
        </div>
      </div>
      <p className="concept-note">Illustrative Industryhead live view · sample figures, not a live plant connection.</p>
    </div>
  );
}

export default function Hero() {
  const reduced = useReduced();
  const vis = useRef(null), tilt = useRef(null);
  useEffect(() => {
    if (reduced || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const el = vis.current, t = tilt.current;
    const move = (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; t.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; };
    const leave = () => { t.style.transform = ""; };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [reduced]);

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div>
          <span className="badge fadeup"><i className="dotl"></i>Decision intelligence for manufacturing</span>
          <h1 className="words" aria-label="A Factory that forgets nothing.">
            <span style={rise(0)} aria-hidden="true">A</span> <span style={rise(1)} aria-hidden="true">Factory</span> <span style={rise(2)} aria-hidden="true">that</span><br />
            <span className="hl" style={rise(4)} aria-hidden="true">forgets</span> <span className="hl" style={rise(5)} aria-hidden="true">nothing.</span>
          </h1>
          <p className="positioning fadeup" style={{ "--d": "600ms" }}>Not a <s>Dashboard.</s> <strong>Manufacturing intelligence.</strong></p>
          <p className="hero-summary fadeup" style={{ "--d": "680ms" }}>A system for decisions, solutions and lasting change.</p>
          <p className="lead fadeup" style={{ "--d": "760ms" }}>Connect production, quality, maintenance and delivery. Turn problems into decisions, decisions into action, and proven improvements into the way your plant runs.</p>
          <div className="hero-ctas fadeup" style={{ "--d": "880ms" }}>
            <a className="btn btn-gold" href="#platform">See decision intelligence at work <Arrow /></a>
            <a className="btn btn-line" href="#demo">Pricing &amp; demo</a>
          </div>
          <div className="hero-meta fadeup" style={{ "--d": "1000ms" }}>
            <span><Tick />Cost intelligence</span><span><Tick />System-driven follow-through</span><span><Tick />Plant memory</span>
          </div>
        </div>
        <div className="hero-visual fadeup" style={{ "--d": "450ms" }} ref={vis}>
          <div className="tilt" ref={tilt}><Showcase /></div>
        </div>
      </div>
    </section>
  );
}

export function Strip() {
  return (
    <div className="strip">
      <div className="wrap">
        <div><b>Decisions</b><span>Know what needs attention</span></div>
        <div><b>Solutions</b><span>Give the response an owner</span></div>
        <div><b>Lasting change</b><span>Verify and standardise</span></div>
        <div><b>Plant memory</b><span>Carry learning into the next shift</span></div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useCost } from "../hooks/useLiveCost.jsx";
import { useReduced } from "../hooks/useReduced.js";
import { clamp, inr } from "../util.js";

const NOTES = ["Registers, spreadsheets and WhatsApp", "Data starts flowing in…", "Losses priced in rupees", "Live. Every machine, every shift."];
const DELTAS = [
  ["Visibility", "Month-end surprise", "Live, every shift"],
  ["Cost of a stop", "Not calculated", "₹ per stop, counted once"],
  ["Morning meeting", "Prepared by hand", "Agenda built automatically"],
  ["Follow-up", "Lost in chats", "Owners, dates, verified"]
];

/** The before/after section: scroll position drives --p on the stage; the slider drives scroll. */
export default function Transform() {
  const reduced = useReduced();
  const cost = useCost();
  const track = useRef(null), stage = useRef(null), applyRef = useRef(() => {});
  const [snap, setSnap] = useState({ pct: 0, noteIdx: 0, flips: [false, false, false, false], zero: true });

  useEffect(() => {
    document.documentElement.classList.toggle("no-sticky", reduced);
    return () => document.documentElement.classList.remove("no-sticky");
  }, [reduced]);

  useEffect(() => {
    const navH = () => document.getElementById("nav")?.offsetHeight ?? 0;
    const trackProgress = () => {
      const r = track.current.getBoundingClientRect();
      const span = r.height - (innerHeight - navH());
      return span > 0 ? clamp((navH() - r.top) / span) : 0;
    };
    let p = 0, target = 0, raf = 0, last = "";
    const apply = (v) => {
      p = v;
      stage.current?.style.setProperty("--p", v.toFixed(4));
      const pct = Math.round(v * 100), noteIdx = Math.min(3, Math.floor(v * 4));
      const flips = [0, 1, 2, 3].map((i) => v > 0.2 + i * 0.2);
      const key = `${pct}|${noteIdx}|${flips}|${v === 0}`;
      if (key !== last) { last = key; setSnap({ pct, noteIdx, flips, zero: v === 0 }); }
    };
    applyRef.current = apply;
    const onScroll = () => { if (!reduced) target = clamp(trackProgress() * 1.12); }; // finish slightly before the section unpins
    const loop = () => { if (!reduced && Math.abs(target - p) > 0.0005) apply(p + (target - p) * 0.14); raf = requestAnimationFrame(loop); };
    apply(0); onScroll(); loop();
    addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [reduced]);

  const onRange = (e) => {
    const v = e.target.value / 100;
    if (reduced) { applyRef.current(v); return; } // manual mode: the slider sets the position directly
    const r = track.current.getBoundingClientRect(), navH = document.getElementById("nav")?.offsetHeight ?? 0, span = r.height - (innerHeight - navH);
    scrollTo({ top: scrollY + r.top - navH + (v / 1.12) * span, behavior: "auto" });
  };
  const after = snap.pct > 50;

  return (
    <section className="xform dark" id="transform" aria-labelledby="xf-h">
      <div className="xform-track" ref={track}>
        <div className="xform-sticky wrap">
          <div className="xform-head">
            <div style={{ display: "grid", gap: 14 }}>
              <span className="eyebrow">The transformation</span>
              <h2 id="xf-h">From registers and WhatsApp to a live factory.</h2>
            </div>
          </div>

          <div className="stage" ref={stage} role="group" aria-label="Before and after comparison. Use the slider below to move between the two.">

            <div className="layer-before" aria-hidden="true">
              <div className="reg">
                <h5>Production register · Shift A</h5>
                CNC-02 &nbsp;&nbsp;<span className="blot">stopped ~ 8:10?</span><br />
                tool change <s>20 min</s> <span className="blot">45 min??</span><br />
                PRS-01 &nbsp;<span className="blot">slow — ask Ramesh</span><br />
                rejects: <s>12</s> <span className="blot">14 (check)</span><br />
                cost of stop: <span className="blot">— not calculated —</span><br />
                manpower ASM-L1: <span className="blot">8 ... 6?</span>
              </div>
              <div className="sheet">
                <div className="tb"><span>Production_Final_v7_REAL.xlsx</span><span>⨯</span></div>
                <table>
                  <thead><tr><th>Machine</th><th>Output</th><th>Stop</th><th>Loss ₹</th></tr></thead>
                  <tbody>
                    <tr><td>CNC-01</td><td>412</td><td>12</td><td className="hi">?</td></tr>
                    <tr><td>CNC-02</td><td>188</td><td>45</td><td className="err">#REF!</td></tr>
                    <tr><td>VMC-03</td><td>301</td><td></td><td className="err">#N/A</td></tr>
                    <tr><td>PRS-01</td><td>—</td><td>?</td><td className="hi"></td></tr>
                    <tr><td>ASM-L1</td><td>96</td><td>0</td><td className="err">#VALUE!</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="wa">
                <div className="h"><span>Plant Supervisors 📱</span><span>14 new</span></div>
                <p><small>Ramesh</small>CNC-2 stopped again 😡</p>
                <p><small>Ops</small>how long? what reason?</p>
                <p className="me">tool change, will confirm later</p>
                <p><small>Owner</small>photo of register please</p>
                <p><small>Qa</small>which lot is on hold??</p>
                <span className="unread">47 unread</span>
              </div>
            </div>

            <div className="layer-after">
              <div className="app" aria-hidden="true">
                <div className="app-bar"><i></i><i></i><i></i><span>industryhead · live</span></div>
                <div className="app-body">
                  <div className="side"><b className="on"></b><b></b><b></b><b></b><b></b></div>
                  <div className="main">
                    <div className="main-head"><h4>Machine Grid · Shift A</h4><span className="live">Live</span></div>
                    <div className="kpis">
                      <div className="kpi money"><small>Cost of stops · this shift</small><strong>{inr(cost.total)}</strong></div>
                      <div className="kpi"><small>OEE</small><strong>71%</strong><em>target 75%</em></div>
                      <div className="kpi"><small>FPY</small><strong>97.8%</strong></div>
                      <div className="kpi"><small>Actions open</small><strong>3</strong></div>
                    </div>
                    <div className="machines">
                      <div className="m"><b>CNC-01</b><span>BR-110 · Op10</span></div>
                      <div className="m stop"><b>CNC-02</b><span>Tool change</span><span className="c">{inr(cost.stop)}</span></div>
                      <div className="m"><b>VMC-03</b><span>PL-330 · Op20</span></div>
                      <div className="m slow"><b>PRS-01</b><span>Slow −12%</span></div>
                      <div className="m"><b>ASM-L1</b><span>8 / 8</span></div>
                      <div className="m"><b>INSP-1</b><span>3 on hold</span></div>
                    </div>
                    <div className="spark">
                      <div className="spark-top"><span>Loss by hour</span><span>06:00 → now</span></div>
                      <svg viewBox="0 0 300 56" preserveAspectRatio="none"><path d="M0 46 L37 40 L75 44 L112 22 L150 30 L187 12 L225 26 L262 18 L300 8 L300 56 L0 56Z" fill="url(#g)" /><path d="M0 46 L37 40 L75 44 L112 22 L150 30 L187 12 L225 26 L262 18 L300 8" fill="none" stroke="#EBC958" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scan" aria-hidden="true"></div>
            <div className="stage-note" aria-live="off">{NOTES[snap.noteIdx]}{snap.zero ? "  ·  scroll ↓" : ""}</div>
          </div>

          <div>
            <div className="deltas">
              {DELTAS.map(([label, o, n], i) => (
                <div key={label} className={`delta${snap.flips[i] ? " flip" : ""}`}><small>{label}</small><div className="sw"><span className="o">{o}</span><span className="n">{n}</span></div></div>
              ))}
            </div>
            <div className="xform-ctl" style={{ marginTop: 12 }}>
              <label htmlFor="xRange" className={`xr-state${after ? " with" : ""}`}><span key={after ? "with" : "without"}>{after ? "With Industryhead" : "Without Industryhead"}</span></label>
              <input type="range" id="xRange" min="0" max="100" step="1" value={snap.pct} onChange={onRange} aria-valuetext={`${snap.pct}% transformed`} aria-label="Transformation progress: before to after" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useRef, useState } from "react";
import { Reveal } from "../hooks/useReveal.jsx";
import { useReduced } from "../hooks/useReduced.js";
import { tabKeyTarget } from "../util.js";

export default function Method({ stages }) {
  const reduced = useReduced();
  const [i, setI] = useState(0);
  const refs = useRef([]);
  const d = stages[i], n = stages.length, pad = (k) => String(k).padStart(2, "0");
  const select = (k, focus) => { setI(k); if (focus) refs.current[k]?.focus(); };
  return (
    <section id="method" className="method" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">The Industryhead improvement journey</span>
          <h2>See it. Solve it.<br />Make the change <em>last.</em></h2>
          <p className="lead">Six connected stages turn factory visibility into decisions, action and sustained improvement. Select a stage to follow one illustrative example.</p>
        </Reveal>
        <Reveal className="mt-route" role="tablist" aria-label="Six stages of improvement" style={{ "--mp": (i / (n - 1)).toFixed(3) }}>
          {stages.map((s, k) => (
            <button key={s.name} ref={(el) => (refs.current[k] = el)} type="button" id={`mt-tab-${k}`} className={`mt-stage${k < i ? " past" : ""}`} role="tab" aria-controls="mtPanel" aria-selected={k === i} tabIndex={k === i ? 0 : -1}
              onClick={() => select(k)} onKeyDown={(e) => { const t = tabKeyTarget(e, k, n, true); if (t !== null) { e.preventDefault(); select(t, true); } }}>
              <small>{pad(k + 1)}</small><strong>{s.name}</strong><span>{s.tag}</span>
            </button>
          ))}
        </Reveal>
        <div className="mt-loop" aria-hidden="true"><span>↺ back to Visualise</span></div>
        <Reveal className={`mt-panel${reduced ? "" : " swap"}`} id="mtPanel" role="tabpanel" aria-labelledby={`mt-tab-${i}`} tabIndex={0}>
          <div className="mt-copy" key={"c" + i}>
            <span className="mt-ghost" aria-hidden="true">{pad(i + 1)}</span>
            <span className="eyebrow">{pad(i + 1)} · {d.name}</span>
            <h3>{d.title}</h3>
            <p>{d.description}</p>
            <div className="mt-out"><b>What moves forward</b><span>{d.output}</span></div>
          </div>
          <div className="mt-ex" key={"e" + i}>
            <header><span>ILLUSTRATIVE WORKFLOW</span><span>{pad(i + 1)} / {pad(n)}</span></header>
            <h4>{d.example}</h4>
            <div className="mt-recs">
              {d.records.map(([t, p], k) => <div className="mt-rec" key={t}><span>{pad(k + 1)}</span><div><b>{t}</b><p>{p}</p></div></div>)}
            </div>
            <p className="mt-foot">Example scenario · team validation required at each decision.</p>
          </div>
        </Reveal>
        <div className="mt-return">
          <span>↻ Optimise feeds the next cycle. Every cycle strengthens plant memory.</span>
          <div className="mt-ctl">
            <button type="button" className="btn btn-sm mt-btn" disabled={i === 0} onClick={() => select(Math.max(0, i - 1))}>← Previous</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => select((i + 1) % n)}>{i === n - 1 ? "Restart: Visualise ↻" : `Next: ${stages[i + 1].name} →`}</button>
          </div>
        </div>
        <p className="scope-note"><a href="#day">Explore the full supply chain ↓</a></p>
      </div>
    </section>
  );
}

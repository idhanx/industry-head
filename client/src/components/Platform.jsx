import { useRef, useState } from "react";
import { Reveal } from "../hooks/useReveal.jsx";
import { useReduced } from "../hooks/useReduced.js";
import { tabKeyTarget } from "../util.js";

const LABELS = ["Problem", "Decision", "Response"];

export default function Platform({ features }) {
  const reduced = useReduced();
  const [i, setI] = useState(1);
  const [token, setToken] = useState(0); // bumping this restarts the flow animation
  const refs = useRef([]);
  const f = features[i];
  const select = (n, focus) => { setI(n); setToken((t) => t + 1); if (focus) refs.current[n]?.focus(); };
  return (
    <section id="platform" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">The platform</span>
          <h2>Six layers.<br />One connected <em>intelligence system.</em></h2>
          <p className="lead">Beyond an OEE dashboard: manufacturing cost intelligence that connects what happened, what it means and what to do next.</p>
        </Reveal>
        <div className="pl-split">
        <Reveal className="pl-tabs" role="tablist" aria-label="Explore the six platform layers">
          {features.map((x, k) => (
            <button key={x.title} ref={(el) => (refs.current[k] = el)} className="pl-tab" id={`pl-tab-${k}`} role="tab" aria-selected={k === i} aria-controls="plPanel" tabIndex={k === i ? 0 : -1}
              onClick={() => select(k)} onKeyDown={(e) => { const t = tabKeyTarget(e, k, features.length, true); if (t !== null) { e.preventDefault(); select(t, true); } }}>
              <span className="n">{String(k + 1).padStart(2, "0")}</span><h3>{x.title}</h3><p>{x.tag}</p>
            </button>
          ))}
        </Reveal>
        <Reveal className="pl-panel" id="plPanel" role="tabpanel" aria-labelledby={`pl-tab-${i}`} tabIndex={0}>
          <div className="pl-copy">
            <span className="eyebrow">See it work</span>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <button className="replay" type="button" onClick={() => setToken((t) => t + 1)}>Replay illustration ↻</button>
          </div>
          <div className={`pl-flow${reduced ? "" : " animate"}`} key={token}>
            {f.flow.map((text, k) => <div key={k}><b>{LABELS[k]}</b><span>{text}</span></div>)}
          </div>
        </Reveal>
        </div>
        <p className="scope-note">Illustrative workflows. Available modules, data connections and rollout scope are confirmed during your demo.</p>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Reveal, useInView } from "../hooks/useReveal.jsx";
import { useReduced } from "../hooks/useReduced.js";

const LEVEL_NAME = ["Not typical", "Partly / varies", "Built in"];

function Glyph({ level, mark, label }) {
  return (
    <span className={`fc-g l${level}`} role="img" aria-label={`${label}: ${LEVEL_NAME[level]}`}>
      {level === 2 && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{mark === "↗" ? <path d="M7 17L17 7M9 7h8v8" /> : <path d="M5 12.5l4.5 4.5L19 7.5" />}</svg>}
    </span>
  );
}

/** Visual comparison: a coverage meter per approach and a mark per need — the difference reads at a glance. */
function Matrix({ data, active }) {
  const [ref, seen] = useInView({ threshold: 0.01, rootMargin: "0px 0px -12% 0px" }); // tall on phones, so never ask for a share of its height
  const on = seen && active;
  const n = data.rows.length;
  return (
    <div className={`fc-matrix${on ? " seen" : ""}`} ref={ref}>
      <table>
        <caption className="sr">Industryhead compared with four other approaches across {n} plant needs. Each cell shows a mark for whether the need is built in, partly covered or not typical for that approach, with the detail in words.</caption>
        <colgroup><col className="c-need" /><col className="c-fh" /><col /><col /><col /><col /></colgroup>
        <thead>
          <tr>
            <th scope="col" className="fc-corner"><span>What your plant needs</span><small>Illustrative coverage →</small></th>
            {data.columns.map(([h, sub], i) => (
              <th key={h} scope="col" className={i === 0 ? "fh" : undefined}>
                <span className="fc-th">{h}</span>
                <span className="fc-th-sub" dangerouslySetInnerHTML={{ __html: sub }} />
                <span className="fc-cov" aria-hidden="true"><i style={{ "--w": data.coverage[i], "--c": i }} /></span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, ri) => (
            <tr key={r.need}>
              <th scope="row"><span className="fc-idx" aria-hidden="true">{String(ri + 1).padStart(2, "0")}</span><span>{r.need}</span></th>
              {r.cells.map((c, ci) => (
                <td key={ci} className={ci === 0 ? "fh" : undefined} style={{ "--r": ri, "--c": ci }}>
                  <Glyph level={c.l} mark={r.mark} label={data.columns[ci][0]} />
                  <span className="fc-lbl">{data.columns[ci][0]}</span>
                  <span className="fc-t">{c.t}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fc-key" aria-hidden="true">
        <span><i className="fc-g l2 sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></i>Built in</span>
        <span><i className="fc-g l1 sm"></i>Partly / varies by product</span>
        <span><i className="fc-g l0 sm"></i>Not typical</span>
      </div>
    </div>
  );
}

function Lane({ lane, step, factory }) {
  const last = Math.max(0, lane.steps.length - 1);
  return (
    <article className={`fc-lane ${factory ? "fc-factory" : "fc-oee"}`} {...(factory ? {} : { "aria-live": "polite", "aria-atomic": "true" })}>
      <p className="fc-label">{lane.label}</p>
      <h3>{lane.title[0]}<br />{lane.title[1]}</h3>
      <p className="fc-question">{lane.question}</p>
      <p className="fc-purpose">{lane.purpose}</p>
      <ol className="fc-flow" aria-label={`${lane.title.join(" ")} workflow`}>
        {lane.steps.map(([a, b], i) => (
          <li key={a} className={(factory ? i === step : i === Math.min(step, last) && step >= 0) ? "fc-active" : undefined}>
            <span className="fc-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><span><strong>{a}</strong> {b}</span>
          </li>
        ))}
      </ol>
      <p className="fc-outcome">{lane.outcome}</p>
    </article>
  );
}

export default function Compare({ data }) {
  const reduced = useReduced();
  const [view, setView] = useState("live");
  const [choice, setChoice] = useState("oee");
  const [run, setRun] = useState(0); // bump to replay
  const [step, setStep] = useState(-1);
  const [ref, seen] = useInView({ threshold: 0.35 });
  const factory = data.factory, lane = data.lanes[choice];

  useEffect(() => {
    setStep(-1);
    if (view !== "live" || !seen || reduced) return;
    let s = 0, t;
    const advance = () => { setStep(s); s++; if (s >= factory.steps.length) clearInterval(t); };
    advance(); t = setInterval(advance, 850);
    const vis = () => document.hidden && clearInterval(t);
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [view, choice, run, seen, reduced, factory.steps.length]);

  const onTabKey = (e) => {
    const order = ["live", "table"], i = order.indexOf(view);
    let n = null;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") n = order[(i + 1) % 2]; else if (e.key === "Home") n = "live"; else if (e.key === "End") n = "table";
    if (n) { e.preventDefault(); setView(n); document.getElementById(n === "live" ? "fh-view-live" : "fh-view-table")?.focus(); }
  };

  return (
    <section id="compare">
      <div className="wrap">
        <section id="fh-comparison-switcher" aria-label="Why Industryhead: workflow and feature comparison" style={{ padding: 0 }}>
          <Reveal className="sec-head">
            <span className="eyebrow">Why Industryhead</span>
            <h2>Beyond dashboards.<br /><em>Decision intelligence</em> for manufacturing.</h2>
            <p className="lead">See how Industryhead connects factory visibility to decisions, accountable action and verified improvement.</p>
          </Reveal>
          <Reveal className="fc-toolbar">
            <div className="fc-tabs" role="tablist" aria-label="Choose comparison view" onKeyDown={onTabKey}>
              <button type="button" className="fc-tab" role="tab" id="fh-view-live" aria-controls="fh-panel-live" aria-selected={view === "live"} tabIndex={view === "live" ? 0 : -1} onClick={() => setView("live")}>Live flow</button>
              <button type="button" className="fc-tab" role="tab" id="fh-view-table" aria-controls="fh-panel-table" aria-selected={view === "table"} tabIndex={view === "table" ? 0 : -1} onClick={() => setView("table")}>Table comparison</button>
            </div>
            <p className="fc-toolbar-note">{view === "live" ? "Follow the work from insight to improvement." : "Compare five approaches, side by side."}</p>
          </Reveal>

          <div role="tabpanel" id="fh-panel-live" aria-labelledby="fh-view-live" hidden={view !== "live"} ref={ref}>
            <span className="fc-compare-label" id="fh-compare-label">Compare Industryhead with</span>
            <div className="fc-choices" role="group" aria-labelledby="fh-compare-label">
              {data.choices.map(([k, label]) => <button key={k} type="button" className="fc-choice" aria-pressed={choice === k} onClick={() => setChoice(k)}>{label}</button>)}
            </div>
            <div className="fc-live-grid">
              <Lane lane={lane} step={step} />
              <Lane lane={factory} step={step} factory />
            </div>
            <div className="fc-live-bottom">
              <p className="fc-connected"><strong>Connected in Core:</strong> {data.connected}</p>
              <button type="button" className="fc-replay" onClick={() => setRun((r) => r + 1)}>Replay flow ↻</button>
            </div>
          </div>

          <div role="tabpanel" id="fh-panel-table" aria-labelledby="fh-view-table" hidden={view !== "table"}>
            <Matrix data={data} active={view === "table"} />
          </div>
          <p className="fc-note">{data.note}</p>
        </section>
      </div>
    </section>
  );
}

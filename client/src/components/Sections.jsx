import { cloneElement, useState } from "react";
import { Reveal } from "../hooks/useReveal.jsx";
import { useReduced } from "../hooks/useReduced.js";

const TRUST_ICONS = {
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  shield: <><path d="M9 12l2 2 4-4" /><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></>,
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1" /><path d="M3 3l18 18" /></>
};
const d = (k) => (k % 4) * 0.06;

export function Industries({ items }) {
  return (
    <section id="industries" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head"><span className="eyebrow">Where it fits</span><h2>Made for <em>discrete</em> manufacturing — machines, lines and shifts.</h2></Reveal>
        <div className="inds">
          {items.map((x, k) => <Reveal className="ind" delay={d(k)} key={x.title}><b>{x.title}</b><span>{x.text}</span><span className="tag">{x.tag}</span></Reveal>)}
        </div>
      </div>
    </section>
  );
}

const SVC_ICONS = {
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 12.5l9 5 9-5" /><path d="M3 17l9 5 9-5" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" /><circle cx="17.5" cy="9" r="2.4" /><path d="M17 14.2a4 4 0 0 1 4 4V20" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4" /></>,
  rupee: <><path d="M6 4h12M6 9h12M14 4c3 0 4 2.5 4 5s-1 5-4 5H6l8 7" /></>,
  wrench: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  loop: <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>
};

/** SVG shapes drawn on with pathLength=1 so the icon traces itself (see .svc-draw in editorial.css). */
function SvcIcon({ name, className }) {
  const shapes = SVC_ICONS[name];
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Array.isArray(shapes.props.children) ? shapes.props.children.map((c, i) => cloneElement(c, { key: i, pathLength: 1 })) : cloneElement(shapes.props.children, { pathLength: 1 })}
    </svg>
  );
}

export function Services({ items }) {
  const reduced = useReduced();
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);       // stops for good once the visitor picks a service
  const [hold, setHold] = useState(false);      // hover / focus pauses the countdown
  const n = items.length, cur = items[idx];
  const running = auto && !reduced;
  const pick = (i) => { setIdx(i); setAuto(false); };
  return (
    <section className="services" id="services">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">What we provide</span>
          <h2>Software, plus the people who make it <em>stick.</em></h2>
          <p className="lead">We don't just install Industryhead. We set it up on your data, train your floor and coach the habits that turn numbers into savings.</p>
        </Reveal>
        <div className="svc-split" onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)} onPointerLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
          <Reveal className="svc-stage" aria-hidden="true">
            <div className="svc-disc">
              <svg className="svc-ring" viewBox="0 0 120 120">
                <circle className="trk" cx="60" cy="60" r="56" />
                <circle key={idx + (running ? "r" : "s")} className={`bar${running ? "" : " idle"}${hold ? " held" : ""}`} cx="60" cy="60" r="56" pathLength="1"
                  onAnimationEnd={(e) => { if (e.animationName === "svc-count" && running) setIdx((i) => (i + 1) % n); }} />
              </svg>
              <SvcIcon key={cur.icon} name={cur.icon} className="svc-ic" />
            </div>
            <p className="svc-count"><b key={idx}>{String(idx + 1).padStart(2, "0")}</b><span> / {String(n).padStart(2, "0")}</span></p>
            <p className="svc-now" key={"n" + idx}>{cur.title}</p>
          </Reveal>
          <ul className="svc-list">
            {items.map((x, k) => (
              <Reveal as="li" className={`svc-item${k === idx ? " open" : ""}`} delay={(k % 8) * 0.05} key={x.k}>
                <button type="button" className="svc-head" aria-expanded={k === idx} aria-controls={`svc-b-${k}`} id={`svc-h-${k}`} onClick={() => pick(k)}>
                  <span className="k">{x.k}</span>
                  <SvcIcon name={x.icon} className="svc-mini" />
                  <h3>{x.title}</h3>
                  <span className="plus" aria-hidden="true"></span>
                </button>
                <div className="svc-body" id={`svc-b-${k}`} role="region" aria-labelledby={`svc-h-${k}`}><div><p>{x.text}</p></div></div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Steps({ items }) {
  return (
    <section>
      <div className="wrap">
        <Reveal className="sec-head"><span className="eyebrow">Getting started</span><h2>Four steps from first meeting to first <em>verified saving.</em></h2></Reveal>
        <div className="steps">
          {items.map((x, k) => <Reveal className="step" delay={k * 0.1} key={x.title}><h3>{x.title}</h3><p>{x.text}</p></Reveal>)}
        </div>
      </div>
    </section>
  );
}

export function Trust({ items }) {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap trust">
        {items.map((x, k) => (
          <Reveal delay={k * 0.1} key={x.title}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{TRUST_ICONS[x.icon]}</svg>
            <p><b>{x.title}</b><span>{x.text}</span></p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Team() {
  return (
    <section className="team dark" id="team">
      <div className="wrap">
        <Reveal className="sec-head"><span className="eyebrow">Built around manufacturing</span><h2>System-driven.<br /><em>People empowered.</em></h2></Reveal>
        <div className="team-grid">
          <Reveal as="p" className="team-copy">A team of <strong>lean, operations and business excellence professionals</strong> with over 20 years of international experience across the UK, Europe and Asia, including India.</Reveal>
          <Reveal as="p" className="team-copy" delay={0.12}>People bring judgement. The system carries ownership, follow-through and learning—across shifts, teams and changes in personnel.</Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <a className="brand" href="#top" aria-label="Industryhead home"><img src="/logo.png" alt="Industryhead" className="brand-logo" /></a>
        <nav aria-label="Footer"><a href="#transform">Before &amp; after</a><a href="#platform">Platform</a><a href="#method">Our method</a><a href="#compare">Compare</a><a href="#demo">Pricing &amp; demo</a></nav>
        <span>© {new Date().getFullYear()} Industryhead</span>
      </div>
      <p className="foot-mark" aria-hidden="true">Industryhead</p>
    </footer>
  );
}

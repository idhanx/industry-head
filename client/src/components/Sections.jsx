import { Reveal } from "../hooks/useReveal.jsx";

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

export function Services({ items }) {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">What we provide</span>
          <h2>Software, plus the people who make it <em>stick.</em></h2>
          <p className="lead">We don't just install Industryhead. We set it up on your data, train your floor and coach the habits that turn numbers into savings.</p>
        </Reveal>
        <div className="svc">
          {items.map((x, k) => <Reveal as="article" delay={d(k)} key={x.k}><span className="k">{x.k}</span><h3>{x.title}</h3><p>{x.text}</p></Reveal>)}
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
        <a className="brand" href="#top" aria-label="Industryhead home"><span className="brand-mark" aria-hidden="true">ih</span><span><b>Industryhead</b><small>Decision intelligence for manufacturing</small></span></a>
        <nav aria-label="Footer"><a href="#transform">Before &amp; after</a><a href="#platform">Platform</a><a href="#method">Our method</a><a href="#compare">Compare</a><a href="#demo">Pricing &amp; demo</a></nav>
        <span>© {new Date().getFullYear()} Industryhead</span>
      </div>
      <p className="foot-mark" aria-hidden="true">Industryhead</p>
    </footer>
  );
}

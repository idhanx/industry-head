import { useEffect, useRef, useState } from "react";
import { Reveal } from "../hooks/useReveal.jsx";
import { useReduced } from "../hooks/useReduced.js";

export default function Chain({ chain }) {
  const reduced = useReduced();
  const refs = useRef([]);
  const [lit, setLit] = useState(() => chain.map(() => false));
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const next = refs.current.map((el) => reduced || (el && el.getBoundingClientRect().top < innerHeight * 0.85));
      setLit((prev) => (prev.every((v, k) => v === next[k]) ? prev : next));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [reduced, chain]);
  return (
    <section className="day dark" id="day">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Across the supply chain</span>
          <h2>From the first count<br />to a <em>verified saving.</em></h2>
          <p className="lead">See the wider chain—from supplier and material to production, customer delivery and feedback. Connect each issue to its downstream impact and the decision it needs.</p>
        </Reveal>
        <div className="chain" aria-label="Supply-chain flow, stages one through eight">
          {chain.map((c, k) => (
            <article key={c.n} ref={(el) => (refs.current[k] = el)} className={lit[k] ? "lit" : undefined} style={{ transitionDelay: (k % 4) * 90 + "ms" }}>
              <small>{c.n}</small><h3>{c.title}</h3><p>{c.text}</p>
            </article>
          ))}
        </div>
        <Reveal as="p" className="loop-back">↺ Evidence from every stage feeds the improvement journey—and proven learning returns to planning, standards and future decisions.</Reveal>
      </div>
    </section>
  );
}

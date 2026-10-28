import { useEffect, useRef, useState } from "react";
import { useReduced } from "./useReduced.js";

/** Scroll-triggered reveal. Content is visible unless IntersectionObserver is available (html.js is set in main.jsx). */
export function useInView(options = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }, once = true) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || (once && seen)) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); if (once) io.disconnect(); } else if (!once) setSeen(false); }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [seen]); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, seen];
}

export function Reveal({ as: Tag = "div", className = "", delay, style, children, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag ref={ref} className={`${className} reveal${seen ? " in" : ""}`.trim()} style={delay ? { "--dl": delay + "s", ...style } : style} {...rest}>
      {children}
    </Tag>
  );
}

/** Runs `go` true shortly after mount so CSS transitions (bars, rings) animate in. */
export function useGrow() {
  const reduced = useReduced();
  const [on, setOn] = useState(reduced);
  useEffect(() => {
    if (reduced) { setOn(true); return; }
    let a = requestAnimationFrame(() => { a = requestAnimationFrame(() => setOn(true)); });
    return () => cancelAnimationFrame(a);
  }, [reduced]);
  return on;
}

export function CountUp({ to, dec = 0, prefix = "", suffix = "", indian = false }) {
  const reduced = useReduced();
  const [ref, seen] = useInView({ threshold: 0.6 });
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setV(to); return; }
    let raf; const t0 = performance.now(), dur = 1500;
    const f = (t) => { const k = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - k, 4))); if (k < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, reduced]);
  const shown = indian ? Math.round(v).toLocaleString("en-IN") : v.toFixed(dec);
  return <span ref={ref}>{prefix}{shown}{suffix}</span>;
}

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api.js";
import { CostProvider } from "./hooks/useLiveCost.jsx";
import Nav from "./components/Nav.jsx";
import Hero, { Strip } from "./components/Hero.jsx";
import Transform from "./components/Transform.jsx";
import Problem from "./components/Problem.jsx";
import Tour from "./components/Tour.jsx";
import Platform from "./components/Platform.jsx";
import Suite from "./components/Suite.jsx";
import Method from "./components/Method.jsx";
import Chain from "./components/Chain.jsx";
import Compare from "./components/Compare.jsx";
import Demo from "./components/Demo.jsx";
import { Industries, Services, Steps, Trust, Team, Footer } from "./components/Sections.jsx";
import Admin from "./components/Admin.jsx";
import { clamp } from "./util.js";

/** Scroll progress bar, sticky-nav state and the active section for the menu. */
function useScrollState(deps) {
  const bar = useRef(null);
  const [state, setState] = useState({ scrolled: false, active: "" });
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      if (bar.current) bar.current.style.transform = `scaleX(${clamp(scrollY / Math.max(1, h.scrollHeight - innerHeight))})`;
      let cur = "";
      document.querySelectorAll("main section[id]").forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
      const scrolled = scrollY > 8;
      setState((p) => (p.scrolled === scrolled && p.active === cur ? p : { scrolled, active: cur }));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [deps]);
  return [bar, state];
}

function ContentGate({ children }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(() => { setError(""); api.content().then(setContent).catch((e) => setError(e.message)); }, []);
  useEffect(load, [load]);
  if (content) return children(content);
  return (
    <section style={{ padding: "96px 0" }}>
      <div className="wrap" style={{ textAlign: "center", color: "var(--muted)" }}>
        {error ? <><p role="alert">We couldn't load the rest of the page ({error}).</p><button className="btn btn-primary btn-sm" onClick={load} style={{ marginTop: 14 }}>Try again</button></> : <p role="status">Loading…</p>}
      </div>
    </section>
  );
}

function Site() {
  const [loaded, setLoaded] = useState(false);
  const [bar, { scrolled, active }] = useScrollState(loaded);
  return (
    <CostProvider>
      <div className="progress" ref={bar} aria-hidden="true"></div>
      <Nav scrolled={scrolled} active={active} />
      <main>
        <Hero />
        <Strip />
        <Transform />
        <Problem />
        <Tour />
        <ContentGate>
          {(c) => (
            <Loaded onMount={() => setLoaded(true)}>
              <Platform features={c.features} />
              <Suite />
              <Method stages={c.stages} />
              <Chain chain={c.chain} />
              <Compare data={c.comparison} />
              <Industries items={c.industries} />
              <Services items={c.services} />
              <Steps items={c.steps} />
              <Trust items={c.trust} />
              <Team />
              <Demo form={c.form} />
            </Loaded>
          )}
        </ContentGate>
      </main>
      <Footer />
    </CostProvider>
  );
}
function Loaded({ onMount, children }) { useEffect(onMount, [onMount]); return children; }

export default function App() {
  return location.pathname.replace(/\/+$/, "") === "/admin" ? <Admin /> : <Site />;
}

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";
import { useReduced } from "./useReduced.js";

const CostContext = createContext({ total: 18420, stop: 2140 });
export const useCost = () => useContext(CostContext);

/**
 * Illustrative cost-of-stops figure. The API gives the current value and the per-second rate (a pure function of server time),
 * the client ticks locally once a second and re-syncs every minute. Works on serverless hosting (no long-lived stream needed).
 */
export function CostProvider({ children }) {
  const reduced = useReduced();
  const [cost, setCost] = useState({ total: 18420, stop: 2140 });

  useEffect(() => {
    let tick, sync, rate = 4, cancelled = false;
    const load = () => api.cost().then((c) => { if (!cancelled) { rate = c.perSecond ?? 4; setCost({ total: c.total, stop: c.stop }); } }).catch(() => {});
    load();
    if (reduced) return () => { cancelled = true; };
    tick = setInterval(() => !document.hidden && setCost((c) => ({ total: c.total + rate, stop: c.stop + rate })), 1000);
    sync = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(tick); clearInterval(sync); };
  }, [reduced]);

  return <CostContext.Provider value={cost}>{children}</CostContext.Provider>;
}

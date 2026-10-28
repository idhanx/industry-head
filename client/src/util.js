export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export const prefersReduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Arrow/Home/End navigation for role=tablist widgets. Returns the next index or null. */
export function tabKeyTarget(e, i, n, vertical = false) {
  const next = ["ArrowRight", ...(vertical ? ["ArrowDown"] : [])], prev = ["ArrowLeft", ...(vertical ? ["ArrowUp"] : [])];
  if (next.includes(e.key)) return (i + 1) % n;
  if (prev.includes(e.key)) return (i + n - 1) % n;
  if (e.key === "Home") return 0;
  if (e.key === "End") return n - 1;
  return null;
}

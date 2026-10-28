import { useSyncExternalStore } from "react";

const query = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
const subscribe = (cb) => { query?.addEventListener("change", cb); return () => query?.removeEventListener("change", cb); };
export const useReduced = () => useSyncExternalStore(subscribe, () => !!query?.matches, () => false);

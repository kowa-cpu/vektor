import { useEffect, useState } from "react";
import type { RoleId } from "./vektor";

const KEY = "vektor-v1";

export type VektorState = {
  name: string;
  current: RoleId;
  target: RoleId;
  done: string[];
};

const DEFAULT: VektorState = {
  name: "Артём",
  current: "jbe",
  target: "mbe",
  done: [],
};

export function loadState(): VektorState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function useVektor() {
  const [state, setState] = useState<VektorState>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const patch = (p: Partial<VektorState>) => setState((s) => ({ ...s, ...p }));

  const toggle = (id: string) =>
    setState((s) => ({
      ...s,
      done: s.done.includes(id) ? s.done.filter((x) => x !== id) : [...s.done, id],
    }));

  return { state, ready, patch, toggle };
}

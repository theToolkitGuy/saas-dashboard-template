"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import config from "@/saas.config";
import { useTheme } from "@/lib/theme";
import { isPreset, resolveState } from "./selectors";
import { isAllowedOrigin, isEmbedded, isHostMessage, manifest, postToHost } from "./embed";
import type { AppState } from "./types";

// Holds the AppState every screen renders from. Where it comes from, last one
// wins:
//   1. config.state in saas.config.ts (edit it, or ask Claude to)
//   2. ?state=<preset> in the URL, read once on load
//   3. the state switcher, an embedding host page, or a demo action (Upgrade,
//      Connect, ...) - kept in memory until the next full reload
// Editing saas.config.ts clears 3, so a config change always shows up.

type Resolved = { state: AppState; preset: string | null };

type AppStateContextValue = {
  state: AppState;
  // The preset name while the state is an untouched preset, else null.
  preset: string | null;
  // Rendered inside an <iframe> (a showcase page drives it).
  embedded: boolean;
  applyPreset: (name: string) => void;
  setState: (state: AppState) => void;
  // Change part of the state, e.g. update((s) => ({ ...s, product: { used: true } })).
  update: (fn: (s: AppState) => AppState) => void;
  // Back to config.state.
  reset: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

// `initialState`: the real user's state from lib/backend.ts loadAppState().
// Without it the app renders config.state.
export function AppStateProvider({ initialState, children }: { initialState?: AppState | null; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setChoice } = useTheme();

  // Keyed on the serialized value so a hot-reloaded config re-resolves.
  const source = initialState ?? config.state;
  const baseKey = JSON.stringify(source);
  const base = useMemo(() => resolveState(source), [baseKey]);
  const [override, setOverride] = useState<Resolved | null>(null);
  const [embedded, setEmbedded] = useState(false);
  const current = override ?? base;

  // saas.config.ts changed (hot reload): drop the override so the edit shows.
  const firstBase = useRef(true);
  useEffect(() => {
    if (firstBase.current) {
      firstBase.current = false;
      return;
    }
    setOverride(null);
  }, [baseKey]);

  // ?state=<preset> on load.
  useEffect(() => {
    setEmbedded(isEmbedded());
    const name = new URLSearchParams(window.location.search).get("state");
    if (isPreset(name)) setOverride(resolveState(name));
  }, []);

  // Commands from an allowed host page.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!isAllowedOrigin(e.origin) || !isHostMessage(e.data)) return;
      const m = e.data;
      if (m.type === "set-preset" && isPreset(m.preset)) setOverride(resolveState(m.preset));
      else if (m.type === "set-state") setOverride({ state: m.state, preset: null });
      else if (m.type === "reset") setOverride(null);
      else if (m.type === "navigate" && m.path.startsWith("/")) router.push(m.path);
      else if (m.type === "set-theme") setChoice(m.theme);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router, setChoice]);

  // Tell the host what is showing: "ready" (with the manifest) once, then
  // "state" on every change of state or page.
  const announced = useRef(false);
  useEffect(() => {
    const snapshot = { state: current.state, preset: current.preset, path: pathname };
    if (!announced.current) {
      announced.current = true;
      postToHost("ready", { ...snapshot, manifest: manifest() });
    } else {
      postToHost("state", snapshot);
    }
  }, [current, pathname]);

  const applyPreset = useCallback((name: string) => {
    if (isPreset(name)) setOverride(resolveState(name));
  }, []);
  const setState = useCallback((state: AppState) => setOverride({ state, preset: null }), []);
  const update = useCallback(
    (fn: (s: AppState) => AppState) => setOverride((prev) => ({ state: fn((prev ?? base).state), preset: null })),
    [base],
  );
  const reset = useCallback(() => setOverride(null), []);

  const value = useMemo(
    () => ({ state: current.state, preset: current.preset, embedded, applyPreset, setState, update, reset }),
    [current, embedded, applyPreset, setState, update, reset],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}

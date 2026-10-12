// The postMessage protocol that lets a parent page (e.g. a template showcase)
// drive this app inside an <iframe>: switch presets, edit the state, change
// page or theme, and hear back what the app is showing.
//
// Only origins in config.embed.allowedOrigins can send commands, and replies
// are posted to those origins only, so a real app built from this template
// never hands its user's state to an unknown page.
//
// Host -> app   { source: "saas-template-host", type, ... }
//   set-preset  { preset: "free-at-limit" }
//   set-state   { state: AppState }
//   reset       {}                        back to config.state
//   navigate    { path: "/settings/billing" }
//   set-theme   { theme: "light" | "dark" }
//
// App -> host   { source: "saas-template", type, ... }
//   ready       first message once mounted: the snapshot below + `manifest`
//   state       on every change of state, preset or page: the snapshot

import config from "@/saas.config";
import { presets } from "@/saas.states";
import type { AppState } from "./types";

export const HOST_SOURCE = "saas-template-host";
export const APP_SOURCE = "saas-template";

export type HostMessage =
  | { source: typeof HOST_SOURCE; type: "set-preset"; preset: string }
  | { source: typeof HOST_SOURCE; type: "set-state"; state: AppState }
  | { source: typeof HOST_SOURCE; type: "reset" }
  | { source: typeof HOST_SOURCE; type: "navigate"; path: string }
  | { source: typeof HOST_SOURCE; type: "set-theme"; theme: "light" | "dark" };

export type Snapshot = { state: AppState; preset: string | null; path: string };

export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin parent: reading window.top throws
  }
}

export function isAllowedOrigin(origin: string): boolean {
  return config.embed.allowedOrigins.includes(origin);
}

export function isHostMessage(data: unknown): data is HostMessage {
  return typeof data === "object" && data !== null && (data as { source?: unknown }).source === HOST_SOURCE;
}

// Everything a host needs to build its controls, sent once with "ready".
// Plain data only (icons stay behind).
export function manifest() {
  return {
    app: config.app,
    usage: config.usage,
    plans: config.plans.map(({ id, name, limits }) => ({ id, name, limits })),
    onboarding: config.onboarding.map(({ id, label }) => ({ id, label })),
    integrations: config.integrations.map(({ id, name }) => ({ id, name })),
    presets,
    routes: ["/", "/projects", "/get-started", "/settings/profile", "/settings/appearance", "/settings/billing", "/settings/integrations", "/community"],
  };
}

// The embedding page's origin: ancestorOrigins where supported (Chrome,
// Safari), else the referrer (Firefox).
function parentOrigin(): string | null {
  const ancestor = window.location.ancestorOrigins?.[0];
  if (ancestor) return ancestor;
  try {
    return document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    return null;
  }
}

export function postToHost(type: "ready" | "state", payload: Record<string, unknown>) {
  if (!isEmbedded()) return;
  const origin = parentOrigin();
  // Only an allowed parent hears anything; targetOrigin makes the browser
  // enforce it too.
  if (!origin || !isAllowedOrigin(origin)) return;
  window.parent.postMessage({ source: APP_SOURCE, type, ...payload }, origin);
}

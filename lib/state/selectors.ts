// Everything the UI asks about the state, derived in one place so every screen
// answers the same way. Components call these instead of reading raw fields.

import config from "@/saas.config";
import { presets } from "@/saas.states";
import type { AppState, Plan } from "./types";

// ── Resolving a state ─────────────────────────────────────────────────────────

export function isPreset(name: unknown): name is keyof typeof presets {
  return typeof name === "string" && Object.prototype.hasOwnProperty.call(presets, name);
}

// config.state (or any preset name / object) as a full AppState. Unknown
// preset names fall back to the first preset rather than crashing the app.
export function resolveState(value: string | AppState): { state: AppState; preset: string | null } {
  if (typeof value !== "string") return { state: value, preset: null };
  const name = isPreset(value) ? value : (Object.keys(presets)[0] as keyof typeof presets);
  return { state: presets[name] as AppState, preset: name };
}

// ── Plan ──────────────────────────────────────────────────────────────────────

export function getPlan(state: AppState): Plan {
  return config.plans.find((p) => p.id === state.billing.plan) ?? config.plans[0];
}

export function isPaid(state: AppState): boolean {
  return getPlan(state).price.month > 0;
}

// Feature gate: does the user's plan unlock `feature` (a key from plan.unlocks)?
// A past-due subscription keeps its features while Stripe retries; change that
// here if you lock on failed payment.
export function canUse(state: AppState, feature: string): boolean {
  return getPlan(state).unlocks.includes(feature);
}

// The next plan up, for "Upgrade" prompts. null on the top plan.
export function nextPlan(state: AppState): Plan | null {
  const i = config.plans.findIndex((p) => p.id === state.billing.plan);
  return config.plans[i + 1] ?? null;
}

// ── Setup ─────────────────────────────────────────────────────────────────────

export function setupProgress(state: AppState) {
  const total = config.onboarding.length;
  const done = config.onboarding.filter((s) => state.setup.completed.includes(s.id)).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 100, complete: done >= total };
}

// ── Usage ─────────────────────────────────────────────────────────────────────

export type UsageStatus = "below" | "atLimit" | "reached";

// below -> plenty left; atLimit -> one left (warn); reached -> blocked.
export function usageInfo(state: AppState) {
  const limit = getPlan(state).limits.usage;
  const used = state.usage.used;
  if (limit === null) return { used, limit, unlimited: true, pct: 0, status: "below" as UsageStatus, left: Infinity };
  const status: UsageStatus = used >= limit ? "reached" : used >= limit - 1 ? "atLimit" : "below";
  return { used, limit, unlimited: false, pct: Math.min(100, Math.round((used / Math.max(limit, 1)) * 100)), status, left: Math.max(0, limit - used) };
}

// Count color per usage state.
export const USAGE_TEXT: Record<UsageStatus, string> = {
  below: "text-base-content",
  atLimit: "text-sand",
  reached: "text-teracotta",
};

// ── Integrations ──────────────────────────────────────────────────────────────

export function integrationInfo(state: AppState) {
  const limit = getPlan(state).limits.integrations;
  const used = state.integrations.connected.length;
  return { used, limit, unlimited: limit === null, full: limit !== null && used >= limit };
}

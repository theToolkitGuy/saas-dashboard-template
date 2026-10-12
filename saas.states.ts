// Named user states ("presets"). Each one is a complete AppState: a snapshot of
// where one user stands. Point `state` in saas.config.ts at one of these names,
// open /?state=<name>, or pick one in the state switcher (bottom-right).
//
// Add your own: copy a preset, rename it, change the fields. The keys are
// what the switcher and the ?state= param show.

import type { AppState } from "./lib/state/types";

// "Nov 12, 2026"-style date `days` from today (UTC, so server and browser agree).
function inDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const USER = { name: "Alex Morgan", email: "alex@example.com" };
const ALL_STEPS = ["create-account", "invite-team", "connect-integration", "create-first", "choose-plan"];

export const presets = {
  // Just signed up: nothing done, nothing used, on the free plan.
  "new-signup": {
    user: USER,
    setup: { completed: ["create-account"] },
    billing: { plan: "free", status: "active", interval: "month", trialDaysLeft: 0, periodEnd: inDays(30) },
    usage: { used: 0 },
    product: { used: false },
    integrations: { connected: [] },
  },

  // Halfway through setup, still has not done the core action.
  onboarding: {
    user: USER,
    setup: { completed: ["create-account", "invite-team", "connect-integration"] },
    billing: { plan: "free", status: "active", interval: "month", trialDaysLeft: 0, periodEnd: inDays(30) },
    usage: { used: 0 },
    product: { used: false },
    integrations: { connected: ["slack"] },
  },

  // Activated on the free plan, comfortably under the limit.
  "activated-free": {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "free", status: "active", interval: "month", trialDaysLeft: 0, periodEnd: inDays(18) },
    usage: { used: 2 },
    product: { used: true },
    integrations: { connected: ["slack"] },
  },

  // One left before the free limit: the meter warns.
  "free-near-limit": {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "free", status: "active", interval: "month", trialDaysLeft: 0, periodEnd: inDays(11) },
    usage: { used: 4 },
    product: { used: true },
    integrations: { connected: ["slack"] },
  },

  // Free limit reached: creating more is blocked, upgrade prompts show.
  "free-at-limit": {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "free", status: "active", interval: "month", trialDaysLeft: 0, periodEnd: inDays(6) },
    usage: { used: 5 },
    product: { used: true },
    integrations: { connected: ["slack"] },
  },

  // On a Pro trial with a few days left.
  "pro-trial": {
    user: USER,
    setup: { completed: ["create-account", "invite-team", "create-first", "choose-plan"] },
    billing: { plan: "pro", status: "trialing", interval: "month", trialDaysLeft: 4, periodEnd: inDays(4) },
    usage: { used: 9 },
    product: { used: true },
    integrations: { connected: ["slack", "notion"] },
  },

  // Paying Pro customer, fully set up. The "happy path".
  "pro-active": {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "pro", status: "active", interval: "year", trialDaysLeft: 0, periodEnd: inDays(214) },
    usage: { used: 23 },
    product: { used: true },
    integrations: { connected: ["slack", "notion", "google-sheets"] },
  },

  // The last payment failed; Stripe is retrying.
  "pro-past-due": {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "pro", status: "past_due", interval: "month", trialDaysLeft: 0, periodEnd: inDays(3) },
    usage: { used: 31 },
    product: { used: true },
    integrations: { connected: ["slack", "notion"] },
  },

  // Canceled, keeps access until the paid period ends.
  "pro-canceled": {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "pro", status: "canceled", interval: "month", trialDaysLeft: 0, periodEnd: inDays(9) },
    usage: { used: 12 },
    product: { used: true },
    integrations: { connected: ["slack"] },
  },

  // Top plan: everything unlocked, no limits.
  business: {
    user: USER,
    setup: { completed: ALL_STEPS },
    billing: { plan: "business", status: "active", interval: "year", trialDaysLeft: 0, periodEnd: inDays(301) },
    usage: { used: 184 },
    product: { used: true },
    integrations: { connected: ["slack", "notion", "google-sheets", "stripe", "github"] },
  },
} satisfies Record<string, AppState>;

export type PresetName = keyof typeof presets;

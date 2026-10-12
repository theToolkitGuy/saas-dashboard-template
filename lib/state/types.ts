// Types for the two halves of the template:
// - SaasConfig: what your product IS (name, plans, onboarding steps,
//   integrations). Changes when you change the product.
// - AppState: where ONE signed-in user stands right now (setup progress, plan,
//   usage, whether they used the core product, connected integrations).
//   Changes per user and over time; every screen renders from it.
// No JSX here, safe to import anywhere.

import type { IconSvgElement } from "@hugeicons/react";

// ── AppState ──────────────────────────────────────────────────────────────────

export type BillingStatus = "active" | "trialing" | "past_due" | "canceled";
export type BillingInterval = "month" | "year";

export type AppState = {
  user: {
    name: string;
    email: string;
  };
  setup: {
    // Ids of the onboarding steps (config.onboarding) this user has finished.
    // All of them = setup complete.
    completed: string[];
  };
  billing: {
    // A plan id from config.plans.
    plan: string;
    status: BillingStatus;
    interval: BillingInterval;
    // Only read while status is "trialing".
    trialDaysLeft: number;
    // When the paid period ends: renews (active), access ends (canceled),
    // or the retry deadline (past_due). Display string, e.g. "Nov 12, 2026".
    periodEnd: string;
  };
  usage: {
    // How much of the plan's metered allowance (config.usage) is used this
    // period. Compared against the plan's limits.usage.
    used: number;
  };
  product: {
    // Has the user done the core action at least once (created a project,
    // sent a campaign, ...)? false = empty states everywhere.
    used: boolean;
  };
  integrations: {
    // Ids from config.integrations that are connected.
    connected: string[];
  };
};

// ── SaasConfig ────────────────────────────────────────────────────────────────

export type Plan = {
  id: string;
  name: string;
  blurb: string;
  // $ per month. `year` is the per-month price when billed annually.
  price: { month: number; year: number };
  // Your Stripe Price ids (Dashboard -> Product catalog). null for free plans.
  stripePriceId: { month: string | null; year: string | null };
  // null = unlimited.
  limits: { usage: number | null; integrations: number | null };
  // Feature keys this plan unlocks (see `canUse` in lib/state/selectors.ts).
  unlocks: string[];
  featuresTitle: string;
  features: string[];
};

export type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  // Where the step happens, and the label of the button that goes there.
  href?: string;
  action?: string;
};

export type Integration = {
  id: string;
  name: string;
  description: string;
  icon: IconSvgElement;
  // Tailwind classes for the icon tile: an accent pair, e.g.
  // "bg-azure text-aviation".
  tint: string;
};

export type SaasConfig = {
  app: {
    name: string;
    // The thing your users create. Drives copy across the app:
    // "No projects yet", "New project", ...
    coreObject: { singular: string; plural: string };
  };
  // The metered allowance shown in the sidebar footer and on Billing.
  usage: { label: string; period: "week" | "month" };
  plans: Plan[];
  onboarding: OnboardingStep[];
  integrations: Integration[];
  community: { discordUrl: string; changelogUrl: string };
  // Which state the app renders: a preset name from saas.states.ts, or a full
  // AppState object.
  state: string | AppState;
  // The floating state switcher (bottom-right). Turn off before shipping.
  devtools: { enabled: boolean };
  // Pages allowed to drive this app from an <iframe> (see lib/state/embed.ts).
  embed: { allowedOrigins: string[] };
};

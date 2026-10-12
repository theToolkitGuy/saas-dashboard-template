// ─────────────────────────────────────────────────────────────────────────────
// Backend placeholders. Every function the UI calls to change something on
// the server lives here, returning demo results. Replace each body with the
// real call when you wire this up; the UI does not need to change.
//
// Where each AppState field comes from in a real app:
//
//   user.name / user.email     your auth provider's session (Clerk, Auth.js, ...)
//   setup.completed            your DB: one row per finished onboarding step,
//                              or derive it (has a teammate? has a project?)
//   billing.plan               Stripe: subscription.items[0].price.lookup_key,
//                              mapped to a plan id in saas.config.ts
//   billing.status             Stripe: subscription.status ("active",
//                              "trialing", "past_due", "canceled")
//   billing.interval           Stripe: price.recurring.interval
//   billing.trialDaysLeft      Stripe: subscription.trial_end - now
//   billing.periodEnd          Stripe: subscription.current_period_end
//   usage.used                 your DB: count of the metered thing this period
//   product.used               your DB: has the core action happened once?
//   integrations.connected     your DB: the user's stored OAuth connections
//
// Keep Stripe state in your DB (written by the webhook) and read it from there,
// rather than calling Stripe on every page load.
// ─────────────────────────────────────────────────────────────────────────────

import type { AppState, BillingInterval } from "./state/types";

// Demo results return `url: null`; the caller then applies the change to the
// local state itself, standing in for what your webhook would have written.
type Redirect = { url: string | null };

// Load the signed-in user's AppState. The template renders from
// saas.config.ts instead; call this from a server component (or a route
// handler) once real data exists, and pass the result to AppStateProvider.
export async function loadAppState(): Promise<AppState | null> {
  // const session = await auth();
  // const sub = await db.subscription.findUnique({ where: { userId: session.userId } });
  // return { user: {...}, billing: { plan: sub.planId, status: sub.status, ... }, ... };
  return null;
}

// "Upgrade" / "Downgrade" on Billing.
export async function startCheckout(planId: string, interval: BillingInterval): Promise<Redirect> {
  // const res = await fetch("/api/stripe/checkout", { method: "POST", body: JSON.stringify({ planId, interval }) });
  // Server side: stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   line_items: [{ price: plan.stripePriceId[interval], quantity: 1 }],
  //   customer: user.stripeCustomerId,
  //   success_url: `${origin}/settings/billing?checkout=success`,
  //   cancel_url: `${origin}/settings/billing`,
  // });
  // return { url: session.url };
  void planId;
  void interval;
  return { url: null };
}

// "Manage billing", "Update payment method" and "Cancel subscription".
export async function openBillingPortal(): Promise<Redirect> {
  // Server side: stripe.billingPortal.sessions.create({ customer, return_url })
  return { url: null };
}

// "Connect" on Integrations. Usually a redirect into the provider's OAuth flow.
export async function connectIntegration(id: string): Promise<Redirect> {
  // return { url: `/api/integrations/${id}/oauth/start` };
  void id;
  return { url: null };
}

export async function disconnectIntegration(id: string): Promise<void> {
  // await fetch(`/api/integrations/${id}`, { method: "DELETE" });
  void id;
}

// The core action ("Create project"). Increments usage on the server.
export async function createCoreObject(name: string): Promise<{ id: string }> {
  // return await fetch("/api/projects", { method: "POST", body: JSON.stringify({ name }) }).then((r) => r.json());
  return { id: name.toLowerCase().replace(/\s+/g, "-") };
}

export async function updateProfile(fields: { name?: string; email?: string }): Promise<void> {
  // await fetch("/api/me", { method: "PATCH", body: JSON.stringify(fields) });
  void fields;
}

export async function deleteAccount(): Promise<void> {
  // await fetch("/api/me", { method: "DELETE" });
}

export async function signOut(): Promise<void> {
  // await auth.signOut(); window.location.href = "/login";
}

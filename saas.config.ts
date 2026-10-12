// ─────────────────────────────────────────────────────────────────────────────
// saas.config.ts: the one file that describes your product to this template.
//
// Top half: your product (name, plans, onboarding, integrations). Edit once.
// Bottom: `state`, the user the app renders right now. Flip it to preview any
// screen in any state: a preset name from saas.states.ts, or a full object.
//
// In production `state` is replaced by real data: see lib/backend.ts, which
// documents where each field comes from (your DB, Stripe, your auth).
// ─────────────────────────────────────────────────────────────────────────────

import { SlackIcon, NotionIcon, GoogleSheetIcon, StripeIcon, GithubIcon, FigmaIcon } from "@hugeicons/core-free-icons";
import type { SaasConfig } from "./lib/state/types";
import type { PresetName } from "./saas.states";

const config: SaasConfig = {
  app: {
    name: "Acme",
    coreObject: { singular: "Project", plural: "Projects" },
  },

  // The metered thing your plans limit. Shown in the sidebar footer + Billing.
  usage: { label: "Projects this month", period: "month" },

  // Your pricing. Paste the Stripe Price ids once the products exist in Stripe.
  plans: [
    {
      id: "free",
      name: "Free",
      blurb: "For trying things out on your own.",
      price: { month: 0, year: 0 },
      stripePriceId: { month: null, year: null },
      limits: { usage: 5, integrations: 1 },
      unlocks: [],
      featuresTitle: "What's included",
      features: ["5 projects a month", "1 integration", "Core dashboard", "Community support"],
    },
    {
      id: "pro",
      name: "Pro",
      blurb: "For small teams shipping every week.",
      price: { month: 29, year: 24 },
      stripePriceId: { month: "price_PRO_MONTHLY", year: "price_PRO_YEARLY" },
      limits: { usage: 50, integrations: 3 },
      unlocks: ["advanced-analytics"],
      featuresTitle: "Everything in Free, plus:",
      features: ["50 projects a month", "3 integrations", "Advanced analytics", "Email support"],
    },
    {
      id: "business",
      name: "Business",
      blurb: "For companies running on it.",
      price: { month: 79, year: 66 },
      stripePriceId: { month: "price_BUSINESS_MONTHLY", year: "price_BUSINESS_YEARLY" },
      limits: { usage: null, integrations: null },
      unlocks: ["advanced-analytics", "audit-log"],
      featuresTitle: "Everything in Pro, plus:",
      features: ["Unlimited projects", "Unlimited integrations", "Audit log", "Priority support"],
    },
  ],

  // The Get started checklist. A user's progress is state.setup.completed.
  onboarding: [
    { id: "create-account", label: "Create your account", description: "You're in. This one is already done." },
    { id: "invite-team", label: "Invite your team", description: "Projects move faster with more than one person on them" },
    { id: "connect-integration", label: "Connect an integration", description: "Bring in the tools you already work with", href: "/settings/integrations", action: "Connect" },
    { id: "create-first", label: "Create your first project", description: "The dashboard fills in as soon as there's something to measure", href: "/projects", action: "Create project" },
    { id: "choose-plan", label: "Pick a plan", description: "Stay on Free or unlock more when you're ready", href: "/settings/billing", action: "See plans" },
  ],

  integrations: [
    { id: "slack", name: "Slack", description: "Post updates to a channel", icon: SlackIcon, tint: "bg-lavender text-amethyst" },
    { id: "notion", name: "Notion", description: "Sync projects to a database", icon: NotionIcon, tint: "bg-chalk text-ink" },
    { id: "google-sheets", name: "Google Sheets", description: "Export reports on a schedule", icon: GoogleSheetIcon, tint: "bg-honeydew text-sage" },
    { id: "stripe", name: "Stripe", description: "Attach revenue to projects", icon: StripeIcon, tint: "bg-azure text-aviation" },
    { id: "github", name: "GitHub", description: "Link pull requests to tasks", icon: GithubIcon, tint: "bg-chalk text-ink" },
    { id: "figma", name: "Figma", description: "Preview designs inline", icon: FigmaIcon, tint: "bg-rose text-teracotta" },
  ],

  community: { discordUrl: "#", changelogUrl: "#" },

  // ── The state the app renders ───────────────────────────────────────────────
  // A preset from saas.states.ts ("new-signup", "free-at-limit", "pro-past-due",
  // ...) or a full AppState object. Ask Claude: "show me a free user at their
  // limit" and it changes this line.
  state: "pro-active" satisfies PresetName,

  devtools: { enabled: true },

  embed: {
    allowedOrigins: ["https://gaidd.co", "https://www.gaidd.co", "http://localhost:3000"],
  },
};

export default config;

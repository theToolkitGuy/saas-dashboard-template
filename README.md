# SaaS Dashboard Template

A production-grade SaaS dashboard shell where **every screen is driven by one
state config**: setup progress, Stripe plan and status, usage against limits,
whether the user has touched the core product, and connected integrations.

Design every state your users can be in (the empty first visit, the free user
at their limit, the failed payment) before you write a line of backend, then
swap the config for real data.

Built by [Gaidd](https://gaidd.co), UX product design for product teams.

## Quick start

```bash
npm install
npm start
```

Open http://localhost:3000. The **State** pill in the bottom-right corner
switches between presets or flips any single field; every page re-renders.

Requires Node 20.9+.

## How it works

```
saas.config.ts      your product: name, plans, onboarding steps, integrations
                    + `state`: the user the app renders right now
saas.states.ts      named user states (presets)
lib/state/          types, selectors (limits, progress, gates), provider,
                    the actions hook, the iframe bridge
lib/backend.ts      placeholders for every server call + where each state
                    field comes from in production (auth, DB, Stripe)
app/                Dashboard, Projects, Get started, Settings (Profile,
                    Appearance, Billing, Integrations), Community
components/         atom / molecule / organism
```

### Pick a state

Any of these works:

1. **Edit the config.** In `saas.config.ts` set `state: "free-at-limit"`.
2. **Use the URL.** http://localhost:3000/settings/billing?state=pro-past-due
3. **Use the switcher** (bottom-right). "Copy for saas.config.ts" gives you the
   matching line to paste.
4. **Ask Claude.** Open the repo in [Claude Code](https://claude.com/claude-code)
   and say *"show me a Pro trial user with nothing connected"*, or run
   `/state free user at their limit`. `CLAUDE.md` teaches it the state model, so
   it picks or writes the preset for you.

### Presets

| Preset            | What it shows                                                   |
| ----------------- | --------------------------------------------------------------- |
| `new-signup`      | Empty states everywhere, 1 of 5 setup steps, free plan          |
| `onboarding`      | Setup half done, core product still unused                      |
| `activated-free`  | Free plan, used the product, well under the limit               |
| `free-near-limit` | One left: the usage meter warns                                 |
| `free-at-limit`   | Limit reached: create is blocked, upgrade prompts everywhere    |
| `pro-trial`       | Pro trial with 4 days left: trial banner                        |
| `pro-active`      | Paying, fully set up: the happy path                            |
| `pro-past-due`    | Payment failed: banner + "Update payment method"                |
| `pro-canceled`    | Canceled, access until period end: "Resume"                     |
| `business`        | Top plan: everything unlocked, no limits                        |

The demo is clickable end to end: **New project** fills the dashboard and
counts against the limit, **Upgrade** changes the plan, **Connect** adds an
integration. Each one calls its `lib/backend.ts` placeholder first.

## Make it yours

- **Product:** `saas.config.ts` (name, core object, plans, steps, integrations).
- **Data:** replace `lib/sample-data.ts` with your queries.
- **Backend:** fill in `lib/backend.ts` (Stripe Checkout, Billing Portal,
  OAuth, your API), then pass the real user's state to
  `<AppStateProvider initialState={...}>` in `app/layout.tsx` and set
  `devtools.enabled: false`.
- **Brand:** `app/globals.css`. Change `--color-primary` and the accent pairs;
  keep the neutrals. Replace `components/atom/Mark.tsx` with your logo.

## Embedding (for showcase pages)

The app can be driven from a parent page through `postMessage`, which is how
the interactive demo on gaidd.co works. Only origins in
`embed.allowedOrigins` can send commands or receive updates. The protocol is
documented at the top of `lib/state/embed.ts`:

```js
iframe.contentWindow.postMessage(
  { source: "saas-template-host", type: "set-preset", preset: "free-at-limit" },
  "https://your-template.example.com",
);
```

## Stack

Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, DaisyUI 5 (theme
tokens only), Hugeicons, TypeScript. No other runtime dependencies.

## License

MIT

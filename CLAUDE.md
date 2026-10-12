# SaaS Dashboard Template: instructions for Claude

A Next.js 16 dashboard shell where **every screen renders from one `AppState`**.
The point of the template is to preview, design and build every user state
(new signup, mid-onboarding, free at its limit, trialing, past due, ...) before
a real backend exists.

## The two files that matter

- `saas.config.ts`: the product (name, core object, plans with Stripe price ids,
  onboarding steps, integrations) and, at the bottom, **`state`**: the user the
  app renders right now. A preset name or a full `AppState` object.
- `saas.states.ts`: named presets. Each one is a complete `AppState`.

`lib/state/types.ts` documents every field. `lib/backend.ts` documents where
each field comes from in production (auth, DB, Stripe).

## When the user asks to see a state

"Show me a free user who hit their limit", "what does a past-due Pro account
look like", "new signup with nothing connected":

1. If a preset in `saas.states.ts` matches, set `state: "<preset>"` in
   `saas.config.ts`. That is the whole change.
2. If none matches, add a new preset to `saas.states.ts` (copy the closest one,
   give it a kebab-case name that says what it is) and point `state` at it.
   Prefer a preset over an inline object: presets show up in the state switcher
   and work as `?state=<name>` links.
3. Tell the user which page shows it best (Dashboard `/`, `/projects`,
   `/get-started`, `/settings/billing`, `/settings/integrations`) and that
   `http://localhost:3000/?state=<name>` opens it directly.

The dev server hot-reloads `saas.config.ts`; a config edit always wins over
anything picked in the switcher.

## Adding a new kind of state

E.g. "add a seats limit" or "track whether email is verified":

1. Add the field to `AppState` in `lib/state/types.ts` (with a comment saying
   where it comes from in production).
2. Add it to **every** preset in `saas.states.ts` (TypeScript will list them).
3. If it is derived (a limit, a percentage, a status), add a selector in
   `lib/state/selectors.ts`. Components call selectors; they never re-derive.
4. Add a control for it in `components/organism/StatePanel.tsx`.
5. Document its production source in the header of `lib/backend.ts`.
6. If a plan limits it, add it to `Plan.limits` and to each plan in
   `saas.config.ts`.

## Conventions

- Components live in `components/atom` (primitives), `components/molecule`
  (composed pieces), `components/organism` (shell + large sections). Every
  exported component gets a JSDoc block with a one-line summary and an
  `@example`.
- Every progress or usage bar is a `StrokeBar` (thin vertical strokes), never a
  plain filled bar.
- Settings-style pages are `PageContent > SettingsPage > SettingsSection`.
- Colors: neutrals are `base-100/200/300`, `base-content`, `neutral`, plus the
  grayscale (`chalk` ... `ink`). Theme colors are the Gaidd accent **pairs**:
  a pale tint for surfaces/fills and its partner for text/icons:
  `vanilla/sand`, `azure/aviation`, `lavender/amethyst`, `honeydew/sage`,
  `rose/teracotta`. Status surfaces use `bg-success|warning|error|info` with
  their `-content` text. Do not add new hex colors in components.
- User actions go through `useActions()` (`lib/state/actions.ts`), which calls
  the `lib/backend.ts` placeholder and applies the change locally in the demo.
- Gate features with `<PlanGate feature="...">` and `canUse()`, keyed by
  `plan.unlocks` in `saas.config.ts`.
- Sample numbers come from `lib/sample-data.ts` (seeded, deterministic).

## Wiring a real backend

Replace the bodies in `lib/backend.ts`. Load the real user's state in
`app/layout.tsx` and pass it as `<AppStateProvider initialState={...}>`, then
set `devtools.enabled: false` in `saas.config.ts`. Keep the embed allow-list
(`embed.allowedOrigins`) empty in production unless you want to be embeddable.

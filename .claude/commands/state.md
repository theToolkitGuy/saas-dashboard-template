---
description: Preview the app in a given user state (plan, setup, usage, ...)
argument-hint: <describe the user, e.g. "free user at their limit">
---

Show the app in this user state: $ARGUMENTS

Follow "When the user asks to see a state" in CLAUDE.md:

1. Read `saas.states.ts` and pick the preset that matches. If none does, add a
   new kebab-case preset (copy the closest one and change only what differs).
2. Set `state: "<preset>"` in `saas.config.ts`.
3. Reply with: the preset name, the 2-3 fields that define it, the page that
   shows it best, and the direct link `http://localhost:3000/<page>?state=<preset>`.

If no argument was given, list the presets with a one-line description each
and ask which one to show.

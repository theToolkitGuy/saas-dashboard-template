"use client";

import { useCallback, useMemo } from "react";
import config from "@/saas.config";
import { connectIntegration, createCoreObject, disconnectIntegration, startCheckout } from "@/lib/backend";
import { useAppState } from "./provider";
import type { AppState, BillingInterval } from "./types";

// The things a user can DO, as one hook. Each calls its lib/backend.ts
// placeholder; when that returns a redirect we follow it (real Stripe /
// OAuth), otherwise we apply the change to the local state ourselves, which
// is what your webhook / DB write would have done. That makes the demo
// clickable end to end: create a project and the dashboard fills in, upgrade
// and the limits change.

const withStep = (s: AppState, id: string): AppState["setup"] =>
  s.setup.completed.includes(id) ? s.setup : { completed: [...s.setup.completed, id] };

export function useActions() {
  const { update } = useAppState();

  const createProject = useCallback(
    async (name = `New ${config.app.coreObject.singular.toLowerCase()}`) => {
      await createCoreObject(name);
      update((s) => ({
        ...s,
        product: { used: true },
        usage: { used: s.usage.used + 1 },
        setup: withStep(s, "create-first"),
      }));
    },
    [update],
  );

  const changePlan = useCallback(
    async (planId: string, interval: BillingInterval) => {
      const { url } = await startCheckout(planId, interval);
      if (url) {
        window.location.href = url;
        return;
      }
      update((s) => ({
        ...s,
        billing: { ...s.billing, plan: planId, interval, status: "active", trialDaysLeft: 0 },
        setup: withStep(s, "choose-plan"),
      }));
    },
    [update],
  );

  const connect = useCallback(
    async (id: string) => {
      const { url } = await connectIntegration(id);
      if (url) {
        window.location.href = url;
        return;
      }
      update((s) => ({
        ...s,
        integrations: { connected: s.integrations.connected.includes(id) ? s.integrations.connected : [...s.integrations.connected, id] },
        setup: withStep(s, "connect-integration"),
      }));
    },
    [update],
  );

  const disconnect = useCallback(
    async (id: string) => {
      await disconnectIntegration(id);
      update((s) => ({ ...s, integrations: { connected: s.integrations.connected.filter((c) => c !== id) } }));
    },
    [update],
  );

  const completeStep = useCallback((id: string) => update((s) => ({ ...s, setup: withStep(s, id) })), [update]);

  return useMemo(() => ({ createProject, changePlan, connect, disconnect, completeStep }), [createProject, changePlan, connect, disconnect, completeStep]);
}

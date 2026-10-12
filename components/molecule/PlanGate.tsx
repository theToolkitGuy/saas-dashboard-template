"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { canUse } from "@/lib/state/selectors";

/**
 * Feature gate. Renders `children` when the user's plan unlocks `feature`
 * (a key from plan.unlocks in saas.config.ts); otherwise shows them blurred
 * and inert under an upgrade prompt naming the cheapest plan that has it.
 * The parent should be `relative`.
 *
 * @example
 * <StatCard title="Cycle time by project" className="relative">
 *   <PlanGate feature="advanced-analytics"><CycleBars /></PlanGate>
 * </StatCard>
 */
export function PlanGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { state } = useAppState();
  if (canUse(state, feature)) return <>{children}</>;
  const unlockedBy = config.plans.find((p) => p.unlocks.includes(feature));

  return (
    <>
      <div aria-hidden="true" inert className="pointer-events-none select-none blur-[3px] opacity-60 w-full h-full">
        {children}
      </div>
      <div className="absolute inset-0 rounded-md flex flex-col items-center justify-center gap-2 text-center p-4 bg-base-100/40">
        <span className="size-8 rounded-lg bg-base-100 border border-base-300 flex items-center justify-center">
          <HugeiconsIcon icon={SquareLock02Icon} size={16} strokeWidth={2} className="text-base-content" />
        </span>
        <p className="text-sm font-semibold text-base-content">Available on {unlockedBy?.name ?? "a paid plan"}</p>
        <Link href="/settings/billing" className="text-xs font-semibold text-base-content underline underline-offset-2">
          Upgrade
        </Link>
      </div>
    </>
  );
}

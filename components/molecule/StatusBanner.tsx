"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Clock01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/state/provider";
import { getPlan } from "@/lib/state/selectors";
import { openBillingPortal } from "@/lib/backend";

/**
 * The billing-status strip above every page. Shows only when the
 * subscription needs attention: trialing, past_due or canceled. Reads the
 * AppState; renders nothing while billing.status is "active".
 *
 * @example
 * <StatusBanner />
 */
export function StatusBanner() {
  const { state, update } = useAppState();
  const { status, trialDaysLeft, periodEnd } = state.billing;
  const plan = getPlan(state);
  if (status === "active") return null;

  // Demo stand-in for the webhook: the portal "fixed" the subscription.
  const fixInPortal = async () => {
    const { url } = await openBillingPortal();
    if (url) window.location.href = url;
    else update((s) => ({ ...s, billing: { ...s.billing, status: "active" } }));
  };

  const content = {
    trialing: {
      tone: "bg-info text-info-content",
      icon: Clock01Icon,
      text: `${trialDaysLeft} ${trialDaysLeft === 1 ? "day" : "days"} left in your ${plan.name} trial.`,
      action: <Link href="/settings/billing" className="font-semibold underline underline-offset-2">Choose a plan</Link>,
    },
    past_due: {
      tone: "bg-error text-error-content",
      icon: Alert02Icon,
      text: `Your last payment failed. Update your card by ${periodEnd} to keep ${plan.name}.`,
      action: <button type="button" onClick={fixInPortal} className="font-semibold underline underline-offset-2 cursor-pointer">Update payment</button>,
    },
    canceled: {
      tone: "bg-warning text-warning-content",
      icon: InformationCircleIcon,
      text: `Your ${plan.name} plan ends on ${periodEnd}. You keep access until then.`,
      action: <button type="button" onClick={fixInPortal} className="font-semibold underline underline-offset-2 cursor-pointer">Resume plan</button>,
    },
  }[status];

  return (
    <div role="status" className={"w-full min-h-9 px-3 py-2 flex flex-row items-center justify-center gap-2 text-xs !leading-snug text-center " + content.tone}>
      <HugeiconsIcon icon={content.icon} size={14} strokeWidth={2} className="shrink-0" />
      <p>
        {content.text} {content.action}
      </p>
    </div>
  );
}

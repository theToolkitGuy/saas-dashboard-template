"use client";

import { useState } from "react";
import { CreditCardIcon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { useActions } from "@/lib/state/actions";
import { getPlan, integrationInfo, usageInfo, USAGE_TEXT, type UsageStatus } from "@/lib/state/selectors";
import { openBillingPortal } from "@/lib/backend";
import type { BillingInterval, BillingStatus } from "@/lib/state/types";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { Button } from "@/components/atom/Button";
import { StrokeBar } from "@/components/atom/StrokeBar";
import { SettingsPage, SettingsSection } from "@/components/molecule/SettingsSection";

// Billing: current plan + status, usage against the plan's limits, the Stripe
// portal (manage / cancel), and the plan cards. Every button goes through
// lib/backend.ts (Stripe Checkout / Billing Portal); in the demo the change is
// applied locally instead.

const STATUS_PILL: Record<BillingStatus, string> = {
  active: "bg-base-300/50 text-neutral",
  trialing: "bg-info text-info-content",
  past_due: "bg-error text-error-content",
  canceled: "bg-warning text-warning-content",
};

export default function BillingPage() {
  const { state, update } = useAppState();
  const { changePlan } = useActions();
  const [annual, setAnnual] = useState(state.billing.interval === "year");
  const [note, setNote] = useState<string | null>(null);

  const current = getPlan(state);
  const currentIndex = config.plans.indexOf(current);
  const { status, periodEnd, trialDaysLeft, interval } = state.billing;
  const isFree = current.price.month === 0;
  const usage = usageInfo(state);
  const integ = integrationInfo(state);

  const statusText: Record<BillingStatus, string> = {
    active: isFree ? "Active" : `Renews ${periodEnd}`,
    trialing: `Trial · ${trialDaysLeft} ${trialDaysLeft === 1 ? "day" : "days"} left`,
    past_due: `Payment failed · retry by ${periodEnd}`,
    canceled: `Canceled · access until ${periodEnd}`,
  };

  // Manage / cancel / resume all happen in the Stripe Billing Portal.
  const portal = async (demo?: () => void) => {
    setNote(null);
    const { url } = await openBillingPortal();
    if (url) window.location.href = url;
    else if (demo) demo();
    else setNote("This opens the Stripe Billing Portal once lib/backend.ts is wired up.");
  };

  const rows: { label: string; used: number; limit: number | null; status: UsageStatus; pct: number }[] = [
    { label: config.usage.label, used: usage.used, limit: usage.limit, status: usage.status, pct: usage.pct },
    { label: "Integrations", used: integ.used, limit: integ.limit, status: integ.full ? "reached" : "below", pct: integ.limit ? Math.min(100, (integ.used / integ.limit) * 100) : 0 },
  ];

  return (
    <Layout title="Billing" titleIcon={CreditCardIcon} titleIconClass="text-neutral" titleHref="/settings/billing" activeItem="Billing">
      <PageContent>
        <SettingsPage>
          <SettingsSection title="Plan" description="The plan you are on right now">
            <div className="w-full flex flex-row items-center justify-between gap-4 p-3 rounded-md border border-base-300">
              <div className="flex flex-col gap-1.5 items-start justify-start min-w-0">
                <p className="text-sm !leading-[1] font-semibold text-base-content">{current.name}</p>
                <p className="text-sm !leading-[1.3] font-normal lowercase text-neutral">
                  ${interval === "year" ? current.price.year : current.price.month}/mo{!isFree && interval === "year" ? " billed annually" : ""} · {current.blurb}
                </p>
              </div>
              <span className={"shrink-0 px-2 py-1 rounded-sm text-xs !leading-[1] font-medium " + STATUS_PILL[status]}>{statusText[status]}</span>
            </div>
          </SettingsSection>

          <SettingsSection title="Usage" description="What you have used of your plan">
            <div className="flex flex-col gap-4 w-full">
              {rows.map((r) => (
                <div key={r.label} className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <p className="text-xs !leading-[1] font-medium text-neutral">{r.label}</p>
                    <p className="text-xs !leading-[1] font-medium text-neutral">
                      {r.limit === null ? (
                        "Unlimited"
                      ) : (
                        <>
                          <span className={"font-semibold " + USAGE_TEXT[r.status]}>{r.used}</span> / {r.limit}
                          {r.label === config.usage.label ? ` this ${config.usage.period}` : ""}
                        </>
                      )}
                    </p>
                  </div>
                  <StrokeBar value={r.limit === null ? 0 : r.pct} label={r.label} fillClass={r.status === "reached" ? "bg-teracotta" : "bg-primary"} />
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="Manage" description="Payment method, invoices and billing details">
            <div className="flex flex-col items-start gap-1.5">
              <Button
                label={status === "past_due" ? "Update payment method" : "Manage billing"}
                disabled={isFree}
                onClick={() => portal(status === "past_due" ? () => update((s) => ({ ...s, billing: { ...s.billing, status: "active" } })) : undefined)}
              />
              {note && <p className="text-xs text-neutral">{note}</p>}
            </div>
          </SettingsSection>

          <SettingsSection
            title={status === "canceled" ? "Resume your subscription" : "Cancel your subscription"}
            description={status === "canceled" ? `It ends on ${periodEnd} unless you resume it` : "You keep access until the end of the period you paid for"}
          >
            <Button
              label={status === "canceled" ? "Resume subscription" : "Cancel subscription"}
              disabled={isFree || status === "trialing"}
              onClick={() => portal(() => update((s) => ({ ...s, billing: { ...s.billing, status: status === "canceled" ? "active" : "canceled" } })))}
            />
          </SettingsSection>

          <SettingsSection
            title="Pricing plans"
            description="Compare plans and pick what fits you"
            aside={
              <div role="radiogroup" aria-label="Billing interval" className="shrink-0 flex flex-row gap-1 p-0.5 rounded-md bg-base-300/40">
                {[
                  { value: false, label: "Monthly" },
                  { value: true, label: "Annual" },
                ].map(({ value, label }) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={annual === value}
                    onClick={() => setAnnual(value)}
                    className={(annual === value ? "bg-base-100 text-base-content " : "text-neutral hover:text-base-content ") + "px-2 py-1 rounded-sm text-xs !leading-[1] font-medium cursor-pointer transition-all duration-125 ease-in-out"}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {config.plans.map((plan, i) => {
                const isCurrent = plan.id === current.id;
                const chosenInterval: BillingInterval = annual ? "year" : "month";
                const price = annual ? plan.price.year : plan.price.month;
                const saving = (plan.price.month - plan.price.year) * 12;
                // The current plan's button only does something mid-trial or
                // when switching its billing interval.
                const label = isCurrent
                  ? status === "trialing"
                    ? "Start subscription"
                    : !isFree && chosenInterval !== interval
                      ? `Switch to ${annual ? "annual" : "monthly"}`
                      : "Current plan"
                  : i > currentIndex
                    ? "Upgrade"
                    : "Downgrade";
                return (
                  <div key={plan.id} className={(isCurrent ? "border-silver ring-1 ring-silver " : "border-base-300 ") + "flex flex-col gap-4 p-4 rounded-md border"}>
                    <div className="flex flex-col gap-3">
                      <p className="text-sm !leading-[1] font-semibold text-base-content">{plan.name}</p>
                      <p className="text-2xl !leading-[1] font-semibold text-base-content">
                        ${price}
                        <span className="text-sm font-normal text-neutral">/mo</span>
                      </p>
                      <p className="text-sm !leading-[1.3] font-normal lowercase text-neutral">{plan.blurb}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Button label={label} disabled={label === "Current plan"} onClick={() => changePlan(plan.id, chosenInterval)} />
                      {annual && saving > 0 && <p className="text-xs !leading-[1] font-medium text-neutral">save ${saving}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs !leading-[1] font-medium text-neutral">{plan.featuresTitle}</p>
                      {plan.features.map((f) => (
                        <div key={f} className="flex flex-row gap-2 items-center justify-start">
                          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} strokeWidth={2} className="shrink-0 text-neutral" />
                          <p className="text-sm !leading-[1] text-base-content/80">{f}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsSection>
        </SettingsPage>
      </PageContent>
    </Layout>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SlidersHorizontalIcon, Cancel01Icon, Copy01Icon, Refresh01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import config from "@/saas.config";
import { presets } from "@/saas.states";
import { useAppState } from "@/lib/state/provider";
import { getPlan } from "@/lib/state/selectors";
import type { AppState, BillingStatus } from "@/lib/state/types";

const STATUSES: BillingStatus[] = ["active", "trialing", "past_due", "canceled"];

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] !leading-[1] font-medium uppercase tracking-wide text-neutral">{label}</p>
      {children}
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-row flex-wrap gap-1 p-0.5 rounded-md bg-base-300/40">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={(value === o.value ? "bg-base-100 text-base-content shadow-xs " : "text-neutral hover:text-base-content ") + "flex-1 px-2 py-1 rounded-sm text-xs !leading-[1] font-medium whitespace-nowrap cursor-pointer transition-all duration-125"}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Check({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <label className="flex flex-row items-center gap-2 text-xs text-base-content/80 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-3.5 accent-[var(--color-primary)] cursor-pointer" />
      {label}
    </label>
  );
}

const toggleIn = (list: string[], id: string, on: boolean) => (on ? Array.from(new Set([...list, id])) : list.filter((x) => x !== id));

/**
 * Floating state switcher (bottom-right): pick a preset or flip any field of
 * the AppState and every screen re-renders. "Copy" puts the matching
 * `state:` line for saas.config.ts on the clipboard. Hidden when embedded in
 * a showcase page (the host has its own controls) or when
 * config.devtools.enabled is false.
 *
 * @example
 * <StatePanel />
 */
export function StatePanel() {
  const { state, preset, embedded, applyPreset, setState, reset } = useAppState();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!config.devtools.enabled || embedded) return null;

  const set = (fn: (s: AppState) => AppState) => setState(fn(state));
  const plan = getPlan(state);
  const usageMax = (plan.limits.usage ?? 200) + 1;

  const copy = async () => {
    const line = preset ? `state: "${preset}",` : `state: ${JSON.stringify(state, null, 2)},`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard blocked: nothing to do.
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[200] flex flex-row items-center gap-2 pl-2.5 pr-3 py-2 rounded-full bg-primary text-primary-content shadow-lg text-xs font-semibold cursor-pointer hover:opacity-90"
      >
        <HugeiconsIcon icon={SlidersHorizontalIcon} size={14} strokeWidth={2} />
        State: {preset ?? "custom"}
      </button>
    );
  }

  return (
    <div role="dialog" aria-label="State switcher" className="fixed bottom-4 right-4 z-[200] w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] flex flex-col rounded-lg border border-base-300 bg-base-100 shadow-xl">
      <div className="h-[45px] min-h-[45px] px-3 flex flex-row items-center justify-between border-b border-base-300">
        <div className="flex flex-row items-center gap-1.5">
          <HugeiconsIcon icon={SlidersHorizontalIcon} size={14} strokeWidth={2} className="text-base-content" />
          <p className="text-sm font-semibold text-base-content">State switcher</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close state switcher" className="group p-1 rounded-md hover:bg-base-300/40 cursor-pointer">
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} className="text-ash group-hover:text-stone" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <Group label="Preset">
          <select
            value={preset ?? ""}
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md border border-base-300 bg-base-200 text-sm text-base-content cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-silver"
          >
            {!preset && <option value="">Custom</option>}
            {Object.keys(presets).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Group>

        <Group label="Stripe plan">
          <Segmented label="Plan" value={state.billing.plan} options={config.plans.map((p) => ({ value: p.id, label: p.name }))} onChange={(v) => set((s) => ({ ...s, billing: { ...s.billing, plan: v } }))} />
          <Segmented
            label="Subscription status"
            value={state.billing.status}
            options={STATUSES.map((v) => ({ value: v, label: v.replace("_", " ") }))}
            onChange={(v) => set((s) => ({ ...s, billing: { ...s.billing, status: v, trialDaysLeft: v === "trialing" ? s.billing.trialDaysLeft || 7 : s.billing.trialDaysLeft } }))}
          />
        </Group>

        <Group label={`${config.usage.label}: ${state.usage.used}${plan.limits.usage === null ? "" : ` / ${plan.limits.usage}`}`}>
          <input
            type="range"
            min={0}
            max={usageMax}
            value={Math.min(state.usage.used, usageMax)}
            onChange={(e) => set((s) => ({ ...s, usage: { used: Number(e.target.value) } }))}
            aria-label={config.usage.label}
            className="w-full accent-[var(--color-primary)] cursor-pointer"
          />
        </Group>

        <Group label="Core product">
          <Check checked={state.product.used} label={`Has created a ${config.app.coreObject.singular.toLowerCase()}`} onChange={(v) => set((s) => ({ ...s, product: { used: v } }))} />
        </Group>

        <Group label="Setup completed">
          {config.onboarding.map((step) => (
            <Check
              key={step.id}
              checked={state.setup.completed.includes(step.id)}
              label={step.label}
              onChange={(v) => set((s) => ({ ...s, setup: { completed: toggleIn(s.setup.completed, step.id, v) } }))}
            />
          ))}
        </Group>

        <Group label="Integrations connected">
          {config.integrations.map((it) => (
            <Check
              key={it.id}
              checked={state.integrations.connected.includes(it.id)}
              label={it.name}
              onChange={(v) => set((s) => ({ ...s, integrations: { connected: toggleIn(s.integrations.connected, it.id, v) } }))}
            />
          ))}
        </Group>
      </div>

      <div className="p-3 flex flex-row items-center gap-2 border-t border-base-300">
        <button type="button" onClick={copy} className="flex-1 flex flex-row items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-primary text-primary-content text-xs font-semibold cursor-pointer hover:opacity-90">
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={14} strokeWidth={2} />
          {copied ? "Copied" : "Copy for saas.config.ts"}
        </button>
        <button type="button" onClick={reset} aria-label="Reset to saas.config.ts" title="Reset to saas.config.ts" className="p-1.5 rounded-md bg-base-300/50 hover:bg-ash/20 cursor-pointer">
          <HugeiconsIcon icon={Refresh01Icon} size={14} strokeWidth={2} className="text-base-content" />
        </button>
      </div>
    </div>
  );
}

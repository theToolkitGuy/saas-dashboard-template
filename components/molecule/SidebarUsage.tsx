"use client";

import Link from "next/link";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { usageInfo, USAGE_TEXT } from "@/lib/state/selectors";
import { ProgressCircle } from "@/components/atom/ProgressCircle";
import { Tooltip } from "@/components/atom/Tooltip";
import { StrokeBar } from "@/components/atom/StrokeBar";

/**
 * Sidebar footer: the plan's metered usage. Copy and color shift across
 * below -> atLimit -> reached; "Upgrade" appears once the limit is hit.
 * Collapsed, it degrades to a ring with a tooltip. Reads the AppState.
 *
 * @example
 * <SidebarUsage collapsed={false} />
 */
export function SidebarUsage({ collapsed }: { collapsed: boolean }) {
  const { state } = useAppState();
  const u = usageInfo(state);
  const label = config.usage.label;

  return (
    <div className={"w-full py-4 border-t-1 border-base-300 bg-base-100 flex flex-col justify-center " + (collapsed ? "items-center px-2" : "items-stretch px-3")}>
      {collapsed ? (
        <div className="group relative flex items-center justify-center">
          <ProgressCircle value={u.unlimited ? 100 : u.pct} size={18} strokeWidth={2.5} />
          <Tooltip text={u.unlimited ? "Unlimited" : `${u.used} / ${u.limit} ${label.toLowerCase()}`} />
        </div>
      ) : (
        <div className="relative w-full flex flex-col gap-1.5">
          <div className="pointer-events-none absolute left-0 w-full bottom-full h-12 bg-linear-to-b from-base-100/0 to-base-100" />
          <div className="flex flex-row items-center justify-between gap-2">
            <p className={"text-sm font-medium " + (u.status === "reached" ? "text-teracotta" : "text-base-content")}>
              {u.status === "reached" ? "Limit reached" : label}
            </p>
            {u.unlimited ? (
              <span className="text-xs font-medium text-neutral">Unlimited</span>
            ) : u.status === "reached" ? (
              <Link href="/settings/billing" className="text-xs font-semibold text-base-content hover:underline">
                Upgrade
              </Link>
            ) : (
              <span className="text-xs font-medium text-neutral">
                <span className={"font-semibold " + USAGE_TEXT[u.status]}>{u.used}</span> / {u.limit}
              </span>
            )}
          </div>
          <StrokeBar value={u.unlimited ? 0 : u.pct} label={label} fillClass={u.status === "reached" ? "bg-teracotta" : "bg-primary"} />
        </div>
      )}
    </div>
  );
}

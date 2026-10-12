"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, ArrowUp02Icon, ArrowDown02Icon, MinusSignIcon } from "@hugeicons/core-free-icons";

/**
 * The "(i)" after a card title. Opens on hover or keyboard focus, closes on
 * leave, blur, Escape or scroll. Fixed to the viewport so cards that clip
 * their overflow cannot cut it off.
 *
 * @example
 * <InfoTip text="Tasks finished in this period." />
 */
export function InfoTip({ text }: { text: string }) {
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left + r.width / 2, y: r.bottom + 6 });
  };
  const hide = () => setPos(null);
  useEffect(() => {
    if (!pos) return;
    document.addEventListener("scroll", hide, true);
    return () => document.removeEventListener("scroll", hide, true);
  }, [pos]);
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label="What this shows"
        aria-describedby={pos ? id : undefined}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Escape") hide();
        }}
        className="shrink-0 flex items-center rounded-sm text-ash hover:text-base-content/80 cursor-help outline-none focus-visible:ring-1 focus-visible:ring-silver"
      >
        <HugeiconsIcon icon={InformationCircleIcon} size={14} strokeWidth={2} />
      </button>
      {pos && (
        <div
          id={id}
          role="tooltip"
          className="pointer-events-none fixed z-50 w-60 -translate-x-1/2 rounded-md border border-base-300 bg-base-100 px-2.5 py-2 text-xs leading-snug text-base-content"
          style={{ left: Math.min(Math.max(pos.x, 128), window.innerWidth - 128), top: pos.y }}
        >
          {text}
        </div>
      )}
    </>
  );
}

/**
 * "↑ 12%": relative change vs the previous period, in a pill colored by sign
 * (sage up, teracotta down, gray flat). `invert` when lower is better.
 * Renders nothing when there is no comparison to make.
 *
 * @example
 * <Delta cur={128} prev={110} label="this month" />
 */
export function Delta({ cur, prev, label, invert = false }: { cur: number | null; prev: number | null; label: string | null; invert?: boolean }) {
  if (label === null || cur === null || prev === null) return null;
  if (prev === 0 && cur !== 0) return null;
  const change = prev === 0 ? 0 : ((cur - prev) / Math.abs(prev)) * 100;
  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const good = invert ? !up : up;
  const pill = flat ? "bg-base-300/60 text-neutral" : good ? "bg-honeydew text-sage dark:bg-sage/20" : "bg-rose text-teracotta dark:bg-teracotta/20";
  const amount = Math.abs(change) >= 10 ? Math.abs(change).toFixed(0) : Math.abs(change).toFixed(1);
  return (
    <p className="flex flex-row items-center gap-1.5 text-xs !leading-[1]">
      <span className={"inline-flex flex-row items-center gap-0.5 rounded-sm px-1.5 py-1 font-display font-semibold tabular-nums " + pill}>
        <HugeiconsIcon icon={flat ? MinusSignIcon : up ? ArrowUp02Icon : ArrowDown02Icon} size={12} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
        <span className="sr-only">{flat ? "No change," : up ? "Up" : "Down"}</span>
        {amount}%
      </span>
      <span className="sr-only">{`vs the previous period (${label})`}</span>
    </p>
  );
}

/**
 * A dashboard card. `kpi` = title top-left, value block bottom-left.
 *
 * @example
 * <StatCard title="Tasks completed" kpi info="Tasks finished in this period.">
 *   <StatValue value="1,284"><Delta cur={1284} prev={1100} label="this month" /></StatValue>
 * </StatCard>
 */
export function StatCard({
  title,
  info,
  action,
  dense = false,
  kpi = false,
  className = "",
  children,
}: {
  title: string;
  info?: string;
  // Right of the title (a link, a lock).
  action?: ReactNode;
  dense?: boolean;
  kpi?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={(kpi ? "gap-2 justify-between items-start " : dense ? "gap-3 " : "gap-4 ") + "relative min-w-0 rounded-md border border-base-300 bg-base-100 p-4 flex flex-col " + className}>
      <div className="w-full flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-1.5 min-w-0">
          <p className="text-base font-sans font-semibold text-base-content truncate">{title}</p>
          {info && <InfoTip text={info} />}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/**
 * The big number in a KPI card, with an optional Delta under it.
 *
 * @example
 * <StatValue value="92.4%" size="lg"><Delta cur={92.4} prev={90} label="this week" /></StatValue>
 */
export function StatValue({ value, size = "lg", children }: { value: string; size?: "md" | "lg"; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className={(size === "lg" ? "text-3xl " : "text-2xl ") + "!leading-[1] font-display font-bold text-base-content tabular-nums"}>{value}</p>
      {children}
    </div>
  );
}

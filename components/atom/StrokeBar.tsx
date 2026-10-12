"use client";

import { useLayoutEffect, useRef, useState } from "react";

// 3px strokes about 2px apart; the count follows the bar's width so spacing
// stays the same at any size.
const STROKE = 3;
const GAP = 2.25;

/**
 * The progress bar used for every progress or usage readout: a row of thin,
 * rounded vertical strokes, the done share in primary and the rest base-300.
 * Use it instead of a plain filled bar.
 *
 * @example
 * <StrokeBar value={60} label="Projects this month" />
 * <StrokeBar value={100} label="Setup" className="h-6" fillClass="bg-sage" />
 */
export function StrokeBar({
  value,
  label,
  fillClass = "bg-primary",
  className = "h-3.5",
}: {
  value: number; // 0-100
  label: string; // what the bar measures, for screen readers
  fillClass?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setCount(Math.max(1, Math.floor((el.clientWidth + GAP) / (STROKE + GAP))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pct = Math.min(100, Math.max(0, value));
  const filled = Math.round((pct / 100) * count);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={"w-full flex flex-row items-stretch justify-between " + className}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={"w-[3px] rounded-full transition-colors duration-300 ease-in-out " + (i < filled ? fillClass : "bg-base-300")} />
      ))}
    </div>
  );
}

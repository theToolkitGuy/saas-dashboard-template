"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent, type RefObject } from "react";

export type LinePoint = { key: string; label: string; value: number };

function useWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

// Whole-number ticks from 0 to at least `max`, in steps of 1 / 2 / 5 x 10^n.
function countTicks(max: number): number[] {
  if (max <= 4) return Array.from({ length: Math.max(max, 1) + 1 }, (_, i) => i);
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

/**
 * Line + soft area over time, with a hairline grid, a hover / arrow-key
 * readout and three x labels. Thin marks, text in text colors.
 *
 * @example
 * <ActivityLine points={[{ key: "2026-10-01", label: "Oct 1", value: 12 }]} unit="task" />
 */
export function ActivityLine({ points, unit, height = 240 }: { points: LinePoint[]; unit: string; height?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const width = useWidth(boxRef);
  const [hover, setHover] = useState<number | null>(null);
  const n = points.length;
  const H = height, L = 32, R = 8, TOP = 8, AXIS = 20;
  const plotW = Math.max(0, width - L - R);
  const plotH = H - TOP - AXIS;
  const ticks = countTicks(Math.max(0, ...points.map((b) => b.value)));
  const top = ticks[ticks.length - 1] || 1;
  const x = (i: number) => L + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => TOP + (1 - v / top) * plotH;
  const line = points.map((b, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(b.value).toFixed(1)}`).join(" ");
  const area = n > 0 ? `${line} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z` : "";
  const xLabels = n > 0 ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i) : [];

  const pick = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = n <= 1 ? 0 : Math.round(((e.clientX - box.left) / (box.width || 1)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.min(n - 1, Math.max(0, (h ?? n - 1) + (e.key === "ArrowRight" ? 1 : -1))));
  };
  const tipLeft = hover !== null ? (x(hover) + 152 > width ? x(hover) - 152 : x(hover) + 12) : 0;

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      role="img"
      aria-label={`${unit}s over time. Use the left and right arrow keys to read each point.`}
      onKeyDown={onKey}
      onFocus={() => setHover((h) => h ?? n - 1)}
      onBlur={() => setHover(null)}
      className="relative w-full outline-none focus-visible:ring-1 focus-visible:ring-silver rounded-sm"
    >
      <svg width={width} height={H} className="block overflow-visible">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={L + plotW} y1={y(t)} y2={y(t)} className="stroke-base-300" strokeWidth={1} shapeRendering="crispEdges" />
            <text x={L - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-neutral text-[10px] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        <path d={area} className="fill-primary/10" />
        <path d={line} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={TOP + plotH} className="stroke-base-content/40" strokeWidth={1} shapeRendering="crispEdges" />}
        {n > 0 && <circle cx={x(hover ?? n - 1)} cy={y(points[hover ?? n - 1].value)} r={4} className="fill-primary stroke-base-100" strokeWidth={2} />}
        {xLabels.map((i, k) => (
          <text
            key={i}
            x={x(i)}
            y={H - 4}
            textAnchor={xLabels.length > 1 && k === 0 ? "start" : xLabels.length > 1 && k === xLabels.length - 1 ? "end" : "middle"}
            className="fill-neutral text-[10px]"
          >
            {points[i].label.replace("Week of ", "")}
          </text>
        ))}
        <rect x={L} y={TOP} width={plotW} height={plotH} fill="transparent" onPointerMove={pick} onPointerLeave={() => setHover(null)} />
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-1 z-10 w-36 rounded-md border border-base-300 bg-base-100 px-2.5 py-2" style={{ left: tipLeft }}>
          <p className="text-[11px] text-neutral">{points[hover].label}</p>
          <p className="mt-1.5 flex flex-row items-center gap-1.5 text-xs">
            <span className="h-0.5 w-3 rounded-full bg-primary" />
            <span className="font-semibold text-base-content tabular-nums">{points[hover].value}</span>
            <span className="text-neutral">{points[hover].value === 1 ? unit : `${unit}s`}</span>
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export type Column = { label: string; value: number };

// A bar with a 4px rounded top and a square base.
function barPath(x: number, w: number, base: number, tip: number): string {
  const h = base - tip;
  if (h < 0.5) return "";
  const r = Math.min(4, w / 2, h);
  return `M${x},${base} V${tip + r} Q${x},${tip} ${x + r},${tip} H${x + w - r} Q${x + w},${tip} ${x + w},${tip + r} V${base} Z`;
}

/**
 * Vertical bars that fill the box they are given (at least 96px tall). Only
 * the highest bar carries a value label; hover shows any of them.
 *
 * @example
 * <ColumnBars columns={[{ label: "Mon", value: 42 }, { label: "Tue", value: 51 }]} unit="task" />
 */
export function ColumnBars({ columns, unit, fillClass = "fill-aviation" }: { columns: Column[]; unit: string; fillClass?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = Math.max(96, size.height || 132), TOP = 14, AXIS = 18;
  const max = Math.max(1, ...columns.map((c) => c.value));
  const base = H - AXIS;
  const scale = (base - TOP) / max;
  const slot = columns.length ? size.width / columns.length : 0;
  const bw = Math.max(4, Math.min(24, slot - 8));
  const best = columns.reduce((b, c, i) => (c.value > (columns[b]?.value ?? -1) ? i : b), 0);

  return (
    <div ref={boxRef} className="relative w-full h-full min-h-24" role="img" aria-label={columns.map((c) => `${c.label} ${c.value}`).join(", ")}>
      <svg width={size.width} height={H} className="absolute inset-0 block overflow-visible">
        <line x1={0} x2={size.width} y1={base} y2={base} className="stroke-base-300" strokeWidth={1} shapeRendering="crispEdges" />
        {columns.map((c, i) => {
          const cx = slot * (i + 0.5);
          const tip = base - c.value * scale;
          return (
            <g key={c.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={slot * i} y={0} width={slot} height={H} fill="transparent" />
              <path d={barPath(cx - bw / 2, bw, base, tip)} className={fillClass + (hover !== null && hover !== i ? " opacity-50" : "")} />
              {(hover === i || (hover === null && i === best)) && (
                <text x={cx} y={tip - 4} textAnchor="middle" className="fill-base-content text-[10px] font-semibold tabular-nums">
                  {c.value}
                </text>
              )}
              <text x={cx} y={H - 4} textAnchor="middle" className="fill-neutral text-[10px]">
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <p className="absolute -top-1 right-0 text-[11px] text-neutral tabular-nums">
          {columns[hover].label}: <span className="font-semibold text-base-content">{columns[hover].value}</span> {columns[hover].value === 1 ? unit : `${unit}s`}
        </p>
      )}
    </div>
  );
}

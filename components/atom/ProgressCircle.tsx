/**
 * SVG progress ring, filling clockwise from the top. Used for the Get started
 * ring and the collapsed usage meter.
 *
 * @example
 * <ProgressCircle value={60} size={16} strokeWidth={2} />
 */
export function ProgressCircle({
  value,
  size = 16,
  strokeWidth = 2,
  progressClass = "stroke-primary",
  trackClass = "stroke-base-300",
}: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  progressClass?: string;
  trackClass?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), 100);
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden="true">
      <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className={trackClass} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={progressClass + " transition-all duration-300 ease-in-out"}
      />
    </svg>
  );
}

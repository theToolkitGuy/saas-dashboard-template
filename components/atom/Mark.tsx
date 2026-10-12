/**
 * Placeholder logo: the app name's first letter on a primary tile. Replace
 * with your own mark (an <Image> or inline SVG) at the same size.
 *
 * @example
 * <Mark name="Acme" size={24} />
 */
export function Mark({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-md bg-primary text-primary-content font-display font-bold flex items-center justify-center select-none"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/**
 * Hover tooltip for icon-only controls (the collapsed sidebar). Sits to the
 * right of its parent, which must be `group relative`.
 *
 * @example
 * <button className="group relative"><Icon /><Tooltip text="Settings" /></button>
 */
export function Tooltip({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute left-[140%] top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-125 ease-in-out">
      <div className="bg-base-100 border-1 border-base-300 rounded-md px-2 py-1 text-xs font-medium text-base-content whitespace-nowrap">{text}</div>
    </div>
  );
}

"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Tooltip } from "@/components/atom/Tooltip";

/**
 * A top-of-sidebar tab (Home / Settings). The active tab shows its label;
 * collapsed, every tab is icon-only with a tooltip.
 *
 * @example
 * <NavButton label="Home" icon={Home04Icon} active collapsed={false} onClick={openHome} />
 */
export function NavButton({
  label,
  icon,
  active,
  collapsed,
  onClick,
}: {
  label: string;
  icon: IconSvgElement;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={
        (active ? "bg-base-300/40 hover:bg-base-300 " : "hover:bg-base-300/40 ") +
        (collapsed ? "w-full justify-center p-1.5 " : "w-full max-w-max justify-start pl-1 pr-1.5 py-1 ") +
        "group relative rounded-md flex flex-row gap-2 items-center transition-all duration-125 ease-in-out cursor-pointer"
      }
    >
      <HugeiconsIcon
        icon={icon}
        size={16}
        className={active ? "text-base-content transition-all duration-125 ease-in-out" : "text-ash group-hover:text-base-content/80 transition-all duration-125 ease-in-out"}
        strokeWidth={2}
      />
      <p className={(!collapsed && active ? "" : "hidden ") + "text-base-content/80 text-sm font-semibold"}>{label}</p>
      {collapsed && <Tooltip text={label} />}
    </button>
  );
}

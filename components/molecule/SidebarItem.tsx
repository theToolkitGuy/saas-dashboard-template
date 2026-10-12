"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Tooltip } from "@/components/atom/Tooltip";

/**
 * One sidebar row: icon + label, optional right slot (a count, a lock).
 * A link with `href`, a button with `onClick`, otherwise a plain row.
 * Collapsed, it is icon-only with a tooltip.
 *
 * @example
 * <SidebarItem label="Dashboard" icon={Activity04Icon} iconClass="text-base-content" href="/" active collapsed={false} />
 */
export function SidebarItem({
  label,
  icon,
  iconClass,
  active = false,
  collapsed,
  href,
  onClick,
  rightSlot,
}: {
  label: string;
  icon: IconSvgElement;
  iconClass: string;
  active?: boolean;
  collapsed: boolean;
  href?: string;
  onClick?: () => void;
  rightSlot?: ReactNode;
}) {
  const className =
    (active ? "bg-base-300/50 " : "hover:bg-base-300/50 ") +
    (collapsed ? "w-full justify-center p-1.5 " : "pl-1 pr-1.5 py-1.5 w-full justify-start ") +
    "group relative rounded-md flex flex-row gap-2 items-center transition-all duration-125 ease-in-out cursor-pointer";

  const inner = (
    <>
      <HugeiconsIcon icon={icon} size={16} className={iconClass + " group-hover:opacity-90 transition-all duration-125 ease-in-out"} strokeWidth={2} />
      <p className={(collapsed ? "hidden " : active ? "text-base-content " : "text-neutral group-hover:text-base-content/80 ") + "text-sm !leading-[1] font-semibold truncate"}>{label}</p>
      {!collapsed && rightSlot}
      {collapsed && <Tooltip text={label} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={className}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={className}>
        {inner}
      </button>
    );
  }
  return (
    <div aria-label={label} className={className}>
      {inner}
    </div>
  );
}

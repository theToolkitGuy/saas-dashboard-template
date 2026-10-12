"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon, Wrench01Icon, PlusIcon } from "@hugeicons/core-free-icons";

/**
 * A collapsible section header inside the expanded sidebar. Clicking toggles
 * the section; a wrench (and optional plus) reveal on hover.
 *
 * @example
 * <SidebarHeader title="Pinned" expanded={open} onToggle={() => setOpen(!open)} showPlus />
 */
export function SidebarHeader({
  title,
  expanded,
  onToggle,
  showPlus = false,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  showPlus?: boolean;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className="group hover:bg-base-300/50 py-1.5 w-full rounded-md flex flex-row gap-1 items-center justify-start transition-all duration-125 ease-in-out cursor-pointer"
    >
      <span className="text-neutral ml-1 text-xs font-medium">{title}</span>
      <HugeiconsIcon icon={ChevronDownIcon} size={14} className={"text-ash transition-all duration-125 ease-in-out " + (expanded ? "" : "-rotate-90")} strokeWidth={2} />
      <span aria-hidden="true" className="opacity-0 group-hover:opacity-100 p-0.5 ml-auto mr-1 flex flex-row gap-2 items-center justify-start">
        <HugeiconsIcon icon={Wrench01Icon} size={14} className="text-ash" strokeWidth={2} />
        {showPlus && <HugeiconsIcon icon={PlusIcon} size={14} className="text-ash" strokeWidth={2} />}
      </span>
    </button>
  );
}

"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

/**
 * Full-height right drawer that slides over the page content. Its 45px header
 * lines up with the action bar; the body scrolls. Width is w-sm, matching the
 * action bar's right-group shift when open. Layout renders it; pages pass
 * `drawerTitle` / `drawerContent` to Layout.
 *
 * @example
 * <Drawer open={open} onClose={() => setOpen(false)} title="Details">...</Drawer>
 */
export function Drawer({
  open,
  onClose,
  title = "Details",
  leading,
  actions,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  // Top-left, before the title.
  leading?: ReactNode;
  // Top-right, left of the close button.
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <aside
      aria-hidden={!open}
      inert={!open}
      className={
        "absolute top-0 right-0 h-full w-sm max-w-full bg-base-200 border-l-1 border-base-300 z-20 flex flex-col transition-transform duration-200 ease-in-out " +
        (open ? "translate-x-0" : "translate-x-full")
      }
    >
      <div className="h-[45px] min-h-[45px] w-full bg-base-100 border-b-1 border-base-300 flex flex-row items-center justify-between px-3">
        <div className="flex flex-row items-center gap-1.5 min-w-0">
          {leading}
          <p className="text-base-content text-sm !leading-[1] font-semibold truncate">{title}</p>
        </div>
        <div className="flex flex-row items-center gap-1 shrink-0">
          {actions}
          <button type="button" onClick={onClose} aria-label="Close panel" className="group p-1 rounded-md flex items-center justify-center hover:bg-base-300/40 transition-all duration-125 ease-in-out cursor-pointer">
            <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-ash group-hover:text-stone transition-all duration-125 ease-in-out" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full overflow-y-auto p-3">{children}</div>
    </aside>
  );
}

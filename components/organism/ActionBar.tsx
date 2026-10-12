"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { PanelLeftCloseIcon, PlusIcon, EllipsisIcon, SquareLock02Icon } from "@hugeicons/core-free-icons";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { useActions } from "@/lib/state/actions";
import { usageInfo } from "@/lib/state/selectors";
import { Button } from "@/components/atom/Button";

/**
 * The default primary action: "New <core object>". Once the plan's usage
 * limit is reached it turns into an upgrade link instead.
 *
 * @example
 * <NewObjectButton />
 */
export function NewObjectButton() {
  const { state } = useAppState();
  const { createProject } = useActions();
  const singular = config.app.coreObject.singular.toLowerCase();
  if (usageInfo(state).status === "reached") {
    return <Button label="Upgrade to add more" icon={SquareLock02Icon} href="/settings/billing" />;
  }
  return <Button label={`New ${singular}`} icon={PlusIcon} onClick={() => createProject()} />;
}

/**
 * Top bar of the main column: page title (or "title / crumb") on the left,
 * the primary action + drawer toggle on the right. The right group slides
 * left by the drawer width while the drawer is open. Layout renders it.
 *
 * @example
 * <ActionBar collapsed={false} onOpenSidebar={open} title="Dashboard" titleIcon={Activity04Icon} drawerOpen={false} onToggleDrawer={toggle} />
 */
export function ActionBar({
  collapsed,
  onOpenSidebar,
  title,
  titleIcon,
  titleIconClass = "text-base-content",
  titleHref = "#",
  crumb,
  actions,
  drawerOpen,
  onToggleDrawer,
  hasDrawer,
}: {
  collapsed: boolean;
  onOpenSidebar: () => void;
  title: string;
  titleIcon: IconSvgElement;
  titleIconClass?: string;
  titleHref?: string;
  crumb?: string;
  // Replaces the default "New <core object>" button.
  actions?: ReactNode;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  hasDrawer: boolean;
}) {
  return (
    <section className="h-[45px] min-h-[45px] px-2 flex flex-row items-center justify-between bg-base-100 border-b-1 border-base-300 w-full">
      <div className="flex flex-row gap-2 items-center justify-start min-w-0">
        {collapsed && (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="group max-w-max p-1 rounded-md flex items-center justify-center hover:bg-base-300/40 transition-all duration-125 ease-in-out cursor-pointer"
          >
            <HugeiconsIcon icon={PanelLeftCloseIcon} size={16} className="text-ash group-hover:text-stone transition-all duration-125 ease-in-out" strokeWidth={2} />
          </button>
        )}
        <nav aria-label={crumb ? "Breadcrumb" : undefined} className="flex flex-row gap-1 items-center min-w-0">
          <Link href={titleHref} className="group px-1 max-w-max rounded-md flex flex-row gap-1.5 items-center justify-start transition-all duration-125 ease-in-out cursor-pointer">
            <HugeiconsIcon icon={titleIcon} size={16} className={titleIconClass + " group-hover:opacity-90 transition-all duration-125 ease-in-out"} strokeWidth={2} />
            <p className="text-base-content text-sm !leading-[1] font-semibold whitespace-nowrap">{title}</p>
          </Link>
          {crumb && (
            <>
              <span aria-hidden="true" className="text-neutral text-sm !leading-[1] font-semibold">/</span>
              <p aria-current="page" className="px-1 text-neutral text-sm !leading-[1] font-semibold truncate">{crumb}</p>
            </>
          )}
        </nav>
      </div>

      <div className={"flex flex-row gap-2 items-center justify-end transition-[margin] duration-200 ease-in-out " + (drawerOpen ? "sm:mr-[var(--container-sm)]" : "mr-0")}>
        {actions ?? <NewObjectButton />}
        {hasDrawer && (
          <button
            type="button"
            onClick={onToggleDrawer}
            aria-pressed={drawerOpen}
            aria-label="Toggle details panel"
            className={(drawerOpen ? "bg-base-300/50 " : "hover:bg-base-300/50 ") + "group px-1 py-1 max-w-max rounded-md flex items-center transition-all duration-125 ease-in-out cursor-pointer"}
          >
            <HugeiconsIcon icon={EllipsisIcon} size={16} className="text-ash group-hover:text-base-content/80 transition-all duration-125 ease-in-out" strokeWidth={2} />
          </button>
        )}
      </div>
    </section>
  );
}

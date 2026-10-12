"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { Sidebar } from "./Sidebar";
import { ActionBar } from "./ActionBar";
import { Drawer } from "./Drawer";
import { StatusBanner } from "@/components/molecule/StatusBanner";

/**
 * The app shell every page renders: sidebar + main column (billing banner,
 * action bar, optional filter row, content) + right drawer. Owns the shared
 * UI state (sidebar collapse, drawer open). Pages pass their title and
 * content; everything else is reusable chrome.
 *
 * @example
 * <Layout
 *   title="Dashboard"
 *   titleIcon={Activity04Icon}
 *   activeItem="Dashboard"
 *   drawerTitle="Details"
 *   drawerContent={<Filters />}
 * >
 *   <PageContent>...</PageContent>
 * </Layout>
 */
export function Layout({
  title,
  titleIcon,
  titleIconClass,
  titleHref,
  crumb,
  actions,
  activeItem,
  drawerTitle,
  drawerContent,
  drawerLeading,
  drawerActions,
  drawerOpen: drawerOpenProp,
  onDrawerOpenChange,
  filters,
  filterSpacer = true,
  children,
}: {
  title: string;
  titleIcon: IconSvgElement;
  titleIconClass?: string;
  // Breadcrumb: "title / crumb", the title linking to titleHref.
  titleHref?: string;
  crumb?: string;
  // Replaces the action bar's default "New <core object>" button.
  actions?: ReactNode;
  // The sidebar row to highlight (its label).
  activeItem?: string;
  drawerTitle?: string;
  drawerContent?: ReactNode;
  drawerLeading?: ReactNode;
  drawerActions?: ReactNode;
  // Pass both to control the drawer from the page (e.g. a row click).
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  filters?: ReactNode;
  // The empty row under the action bar when there is no filter bar.
  filterSpacer?: boolean;
  children?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  // Start as an icon rail on narrow screens.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setCollapsed(true);
  }, []);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const drawerOpen = drawerOpenProp ?? internalDrawerOpen;
  const setDrawerOpen = (open: boolean) => {
    if (drawerOpenProp === undefined) setInternalDrawerOpen(open);
    onDrawerOpenChange?.(open);
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-base-100 flex flex-row items-start justify-start">
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(true)} activeItem={activeItem} />
      <main className="flex-1 min-w-0 h-full bg-base-200 flex flex-col">
        <StatusBanner />
        {/* Everything under the banner. The drawer spans this whole column, so
            its 45px header lines up with the action bar. */}
        <div className="relative overflow-hidden flex-1 min-h-0 w-full flex flex-col">
          <ActionBar
            collapsed={collapsed}
            onOpenSidebar={() => setCollapsed(false)}
            title={title}
            titleIcon={titleIcon}
            titleIconClass={titleIconClass}
            titleHref={titleHref}
            crumb={crumb}
            actions={actions}
            drawerOpen={drawerOpen}
            onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
            hasDrawer={drawerContent !== undefined}
          />
          {filters ? (
            <div className={"transition-[margin] duration-200 ease-in-out " + (drawerOpen ? "sm:mr-[var(--container-sm)]" : "mr-0")}>{filters}</div>
          ) : filterSpacer ? (
            <div className="w-full py-2 bg-base-200" />
          ) : null}
          {/* min-h-0 lets this shrink, so PageContent's own scroll reaches the bottom. */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">{children}</div>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerTitle} leading={drawerLeading} actions={drawerActions}>
            {drawerContent}
          </Drawer>
        </div>
      </main>
    </div>
  );
}

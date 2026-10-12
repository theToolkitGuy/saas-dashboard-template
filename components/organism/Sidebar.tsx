"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PanelLeftOpenIcon, PinIcon } from "@hugeicons/core-free-icons";
import config from "@/saas.config";
import { TOP_NAV, SUB_NAV, SETTINGS_OTHER, type NavKey } from "@/lib/nav";
import { useAppState } from "@/lib/state/provider";
import { setupProgress } from "@/lib/state/selectors";
import { signOut } from "@/lib/backend";
import { SAMPLE_PROJECTS } from "@/lib/sample-data";
import { Mark } from "@/components/atom/Mark";
import { ProgressCircle } from "@/components/atom/ProgressCircle";
import { Tooltip } from "@/components/atom/Tooltip";
import { NavButton } from "@/components/molecule/NavButton";
import { SidebarHeader } from "@/components/molecule/SidebarHeader";
import { SidebarItem } from "@/components/molecule/SidebarItem";
import { SidebarUsage } from "@/components/molecule/SidebarUsage";

// Which top tab a path belongs to.
const tabOf = (path: string): NavKey => (path.startsWith("/settings") || path === "/community" ? "settings" : "home");

/**
 * The app sidebar: brand + collapse, the Home / Settings tabs with the
 * Get started ring, the active tab's sections, pinned items (Home), and the
 * usage meter. Collapses to an icon rail. Reads the AppState for setup
 * progress, pinned items and usage. Layout renders it.
 *
 * @example
 * <Sidebar collapsed={false} onCollapse={() => setCollapsed(true)} activeItem="Dashboard" />
 */
export function Sidebar({ collapsed, onCollapse, activeItem }: { collapsed: boolean; onCollapse: () => void; activeItem?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useAppState();
  const setup = setupProgress(state);
  const activeNav = tabOf(pathname);

  // Which sections the user has collapsed by clicking their header.
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setClosed((prev) => ({ ...prev, [id]: !prev[id] }));

  const sections = [
    { id: activeNav as string, section: SUB_NAV[activeNav] },
    ...(activeNav === "settings" ? [{ id: "other", section: SETTINGS_OTHER }] : []),
  ];
  // Pinned items exist only once the core product has been used.
  const pinned = state.product.used ? SAMPLE_PROJECTS.filter((p) => p.pinned) : [];

  return (
    <aside
      className={
        (collapsed ? "w-14 min-w-14 max-w-14 " : "w-3xs min-w-3xs max-w-3xs ") +
        "bg-base-100 border-r-1 border-base-300 h-full flex flex-col gap-0 items-start justify-start transition-all duration-150 ease-in-out"
      }
    >
      {/* Brand + collapse */}
      <div className={"h-[45px] min-h-[45px] w-full bg-base-100 border-b-1 border-base-300 flex flex-row gap-0 items-center " + (collapsed ? "px-2 justify-center" : "px-3 justify-between")}>
        <div className="flex flex-row gap-1.5 items-center justify-start">
          <Mark name={config.app.name} size={22} />
          {!collapsed && <p className="text-base font-display !leading-[1] font-semibold text-base-content">{config.app.name}</p>}
        </div>
        {!collapsed && (
          <button type="button" onClick={onCollapse} aria-label="Collapse sidebar" className="group cursor-pointer flex items-center justify-center">
            <HugeiconsIcon icon={PanelLeftOpenIcon} size={16} className="text-ash group-hover:text-stone transition-all duration-125 ease-in-out" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Tabs + Get started ring */}
      <div className={(collapsed ? "flex-col px-2 " : "flex-row px-3 ") + "w-full bg-base-100 flex gap-1 items-center justify-start py-2 border-b-1 border-base-300"}>
        {TOP_NAV.map(({ key, label, icon }) => (
          <NavButton
            key={key}
            label={label}
            icon={icon}
            active={activeNav === key}
            collapsed={collapsed}
            onClick={() => {
              const first = SUB_NAV[key].items[0]?.href;
              if (first) router.push(first);
            }}
          />
        ))}
        <Link
          href="/get-started"
          aria-current={activeItem === "Get started" ? "page" : undefined}
          aria-label={`Get started checklist, ${setup.pct}% complete`}
          className={
            (activeItem === "Get started" ? "bg-base-300/40 " : "hover:bg-base-300/40 ") +
            (collapsed ? "w-full justify-center " : "ml-auto ") +
            "group relative p-1 rounded-md flex flex-row items-center transition-all duration-125 ease-in-out cursor-pointer"
          }
        >
          <ProgressCircle value={setup.pct} size={16} strokeWidth={2} progressClass={setup.complete ? "stroke-sage" : "stroke-primary"} />
          {collapsed && <Tooltip text="Get started" />}
        </Link>
      </div>

      {/* Scrollable sections */}
      <div className={(collapsed ? "items-center px-2 overflow-visible " : "items-start px-3 overflow-y-auto ") + "w-full flex-1 min-h-0 flex flex-col gap-4 justify-start py-3"}>
        {sections.map(({ id, section }) => (
          <div key={id} className={(collapsed ? "items-center " : "items-start ") + "w-full flex flex-col gap-1 justify-start py-2"}>
            {!collapsed && <SidebarHeader title={section.header} expanded={!closed[id]} onToggle={() => toggle(id)} />}
            <div className={(collapsed ? "items-center " : "items-start ") + "w-full flex flex-col gap-0.5 justify-start"}>
              {(collapsed || !closed[id]) &&
                section.items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    iconClass={item.iconClass}
                    active={item.label === activeItem}
                    collapsed={collapsed}
                    href={item.href}
                    onClick={item.action === "signout" ? () => void signOut() : undefined}
                  />
                ))}
            </div>
          </div>
        ))}

        {activeNav === "home" && (
          <div className={(collapsed ? "items-center " : "items-start ") + "w-full flex flex-col gap-1 justify-start py-2"}>
            {!collapsed && <SidebarHeader title="Pinned" expanded={!closed.pinned} onToggle={() => toggle("pinned")} showPlus={pinned.length === 0} />}
            <div className={(collapsed ? "items-center " : "items-start ") + "w-full flex flex-col gap-0.5 justify-start"}>
              {(collapsed || !closed.pinned) &&
                pinned.map((p) => (
                  <SidebarItem key={p.id} label={p.name} icon={PinIcon} iconClass="text-sage fill-honeydew" collapsed={collapsed} href={`/projects?open=${p.id}`} active={p.name === activeItem} />
                ))}
              {!collapsed && !closed.pinned && pinned.length === 0 && <p className="ml-1 text-xs text-neutral">Pin a {config.app.coreObject.singular.toLowerCase()} to keep it here.</p>}
            </div>
          </div>
        )}
      </div>

      <SidebarUsage collapsed={collapsed} />
    </aside>
  );
}

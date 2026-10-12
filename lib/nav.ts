// Sidebar navigation. Top tabs switch which section list shows below them;
// each item is a page. Add a page: create app/<path>/page.tsx, add it here.

import {
  Settings02Icon,
  Home04Icon,
  Activity04Icon,
  Folder01Icon,
  UserIcon,
  PaintBoardIcon,
  CreditCardIcon,
  ConnectIcon,
  UserGroupIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import config from "@/saas.config";

export type NavKey = "home" | "settings";

export type NavItem = {
  label: string;
  icon: IconSvgElement;
  iconClass: string;
  href?: string;
  // A button instead of a link; the Sidebar wires the action.
  action?: "signout";
};

export type NavSection = { header: string; items: NavItem[] };

export const TOP_NAV: { key: NavKey; label: string; icon: IconSvgElement }[] = [
  { key: "home", label: "Home", icon: Home04Icon },
  { key: "settings", label: "Settings", icon: Settings02Icon },
];

const SETTINGS_ICON = "text-neutral group-hover:text-base-content";

export const SUB_NAV: Record<NavKey, NavSection> = {
  home: {
    header: "Home",
    items: [
      { label: "Dashboard", icon: Activity04Icon, iconClass: "text-base-content fill-base-content/10", href: "/" },
      { label: config.app.coreObject.plural, icon: Folder01Icon, iconClass: "text-aviation fill-azure", href: "/projects" },
    ],
  },
  settings: {
    header: "Settings",
    items: [
      { label: "Profile", icon: UserIcon, iconClass: SETTINGS_ICON, href: "/settings/profile" },
      { label: "Appearance", icon: PaintBoardIcon, iconClass: SETTINGS_ICON, href: "/settings/appearance" },
      { label: "Billing", icon: CreditCardIcon, iconClass: SETTINGS_ICON, href: "/settings/billing" },
      { label: "Integrations", icon: ConnectIcon, iconClass: SETTINGS_ICON, href: "/settings/integrations" },
    ],
  },
};

// Second section on the Settings tab.
export const SETTINGS_OTHER: NavSection = {
  header: "Other",
  items: [
    { label: "Community", icon: UserGroupIcon, iconClass: SETTINGS_ICON, href: "/community" },
    { label: "Log out", icon: Logout01Icon, iconClass: SETTINGS_ICON, action: "signout" },
  ],
};

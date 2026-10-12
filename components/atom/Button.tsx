"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

/**
 * The compact base-300/50 pill used across the app (action bar, settings,
 * cards): optional leading icon + label. Renders a Link when `href` is set.
 *
 * @example
 * <Button label="New project" icon={PlusIcon} onClick={create} />
 * <Button label="See plans" href="/settings/billing" />
 */
export function Button({
  label,
  icon,
  onClick,
  href,
  iconSize = 14,
  disabled = false,
  className = "",
  children,
}: {
  label: string;
  icon?: IconSvgElement;
  onClick?: () => void;
  href?: string;
  iconSize?: number;
  disabled?: boolean;
  className?: string;
  // Extra content after the label (e.g. a count).
  children?: ReactNode;
}) {
  const cls =
    "bg-base-300/50 pl-1.5 pr-1.5 py-1 w-full max-w-max rounded-md flex flex-row gap-2 items-center justify-start hover:bg-ash/20 transition-all duration-125 ease-in-out cursor-pointer disabled:opacity-50 disabled:pointer-events-none " +
    className;
  const inner = (
    <>
      {icon && <HugeiconsIcon icon={icon} size={iconSize} className="text-base-content transition-all duration-125 ease-in-out" strokeWidth={2} />}
      <span className="text-base-content/80 text-sm font-semibold whitespace-nowrap">{label}</span>
      {children}
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/**
 * The solid primary call to action (empty states, upgrade prompts).
 *
 * @example
 * <PrimaryButton label="Create your first project" onClick={create} />
 */
export function PrimaryButton({ label, onClick, href, disabled = false }: { label: string; onClick?: () => void; href?: string; disabled?: boolean }) {
  const cls =
    "rounded-full bg-primary px-3 py-2.5 !leading-[1] border border-primary/20 shadow-[inset_0_-2px_0px_1px_rgba(255,255,255,0.25)] transition-all duration-125 ease-in-out hover:opacity-90 text-sm font-display font-semibold text-primary-content cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {label}
    </button>
  );
}

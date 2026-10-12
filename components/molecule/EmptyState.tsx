import type { ReactNode } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

/**
 * Centered empty state. The page decides WHEN to show it (its own "is this
 * empty?" check) and passes CTAs as children; this only owns the look.
 *
 * @example
 * <EmptyState icon={Folder01Icon} title="No projects yet" description="Create one to get started.">
 *   <PrimaryButton label="Create project" onClick={create} />
 * </EmptyState>
 */
export function EmptyState({
  icon,
  iconClass = "text-base-content",
  title,
  description,
  children,
}: {
  icon?: IconSvgElement;
  iconClass?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 max-w-sm px-6">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-base-100 border-1 border-base-300 flex items-center justify-center">
          <HugeiconsIcon icon={icon} size={24} className={iconClass} strokeWidth={2} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-base-content">{title}</h2>
        {description && <p className="text-sm text-neutral !leading-snug">{description}</p>}
      </div>
      {children && <div className="flex flex-col items-center gap-2.5">{children}</div>}
    </div>
  );
}

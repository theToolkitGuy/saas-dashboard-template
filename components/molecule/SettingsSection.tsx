import type { ReactNode } from "react";

/**
 * One block of a settings-style page: a bold title, a lowercase one-line
 * description, then the controls. Stack several inside <SettingsPage>.
 *
 * @example
 * <SettingsSection title="Plan" description="The plan you are on right now">
 *   <PlanRow />
 * </SettingsSection>
 */
export function SettingsSection({
  title,
  description,
  aside,
  gap = "gap-6",
  children,
}: {
  title: string;
  description?: string;
  // Right of the title (e.g. a Monthly / Annual toggle).
  aside?: ReactNode;
  gap?: string;
  children?: ReactNode;
}) {
  return (
    <div className={"py-6 flex flex-col " + gap}>
      <div className="flex flex-row items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 items-start justify-start">
          <p className="text-sm !leading-[1] font-semibold text-base-content">{title}</p>
          {description && <p className="text-sm !leading-[1.3] font-normal lowercase text-neutral">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

/**
 * The centered 3xl column settings-style pages share. Goes inside PageContent.
 *
 * @example
 * <PageContent><SettingsPage><SettingsSection title="Theme" /></SettingsPage></PageContent>
 */
export function SettingsPage({ children }: { children?: ReactNode }) {
  return <section className="px-6 w-full max-w-3xl my-4 h-full max-h-max mx-auto">{children}</section>;
}

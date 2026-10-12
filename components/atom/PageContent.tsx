import type { ReactNode } from "react";

/**
 * Wrapper for real page content inside <Layout>: fills the content area,
 * top-anchored, padded, scrolls vertically. (A centered EmptyState goes
 * straight into Layout instead.) The title lives in the action bar, so the
 * content should not repeat it.
 *
 * @example
 * <Layout title="Billing" titleIcon={CreditCardIcon}><PageContent>...</PageContent></Layout>
 */
export function PageContent({ children, padding = "px-6 py-4" }: { children?: ReactNode; padding?: string }) {
  return <div className={"w-full h-full overflow-y-auto flex flex-col items-start justify-start text-left gap-5 " + padding}>{children}</div>;
}

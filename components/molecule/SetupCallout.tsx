"use client";

import { useAppState } from "@/lib/state/provider";
import { setupProgress } from "@/lib/state/selectors";
import { StrokeBar } from "@/components/atom/StrokeBar";
import { Button } from "@/components/atom/Button";

/**
 * "Finish setting up" strip for the top of a page. Renders nothing once
 * every onboarding step is done. Reads the AppState.
 *
 * @example
 * <SetupCallout />
 */
export function SetupCallout() {
  const { state } = useAppState();
  const setup = setupProgress(state);
  if (setup.complete) return null;
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-3 rounded-md border border-base-300 bg-base-100">
      <div className="flex flex-col gap-1.5 shrink-0">
        <p className="text-sm !leading-[1] font-semibold text-base-content">Finish setting up</p>
        <p className="text-xs !leading-[1] text-neutral">
          {setup.done} of {setup.total} steps done
        </p>
      </div>
      <StrokeBar value={setup.pct} label="Setup progress" className="h-5 flex-1" />
      <Button label="Continue setup" href="/get-started" className="shrink-0" />
    </div>
  );
}

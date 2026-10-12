"use client";

import { PlayIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { setupProgress } from "@/lib/state/selectors";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { Button } from "@/components/atom/Button";
import { StrokeBar } from "@/components/atom/StrokeBar";
import { SettingsPage } from "@/components/molecule/SettingsSection";

// The onboarding checklist. Steps are config.onboarding; which are done is
// state.setup.completed. The sidebar ring reads the same numbers.

export default function GetStartedPage() {
  const { state } = useAppState();
  const setup = setupProgress(state);

  return (
    <Layout title="Get started" titleIcon={PlayIcon} titleIconClass="text-base-content fill-base-content/10" titleHref="/get-started" activeItem="Get started">
      <PageContent>
        <SettingsPage>
          <div className="py-6 flex gap-6 flex-col">
            <div className="flex flex-col gap-1.5 items-start justify-start">
              <p className="text-base !leading-[1] font-semibold text-base-content">{setup.complete ? "You're all set" : "Get started"}</p>
              <p className="text-sm !leading-[1.3] font-normal lowercase text-neutral">
                {setup.complete ? `Every step is done. Enjoy ${config.app.name}.` : `Finish these steps to get the most out of ${config.app.name}.`}
              </p>
            </div>

            <StrokeBar value={setup.pct} label="Get started progress" className="h-6" fillClass={setup.complete ? "bg-sage" : "bg-primary"} />

            <div className="py-6 flex flex-col gap-3 w-full">
              <p className="text-lg !leading-[1] font-semibold text-base-content">
                {setup.done} of {setup.total} steps completed
              </p>
              <ol className="flex flex-col gap-3 w-full">
                {config.onboarding.map((step) => {
                  const done = state.setup.completed.includes(step.id);
                  return (
                    <li key={step.id} className="w-full flex flex-row items-center gap-4 p-3 rounded-md border border-base-300 bg-base-300/40">
                      <span aria-hidden="true" className={(done ? "bg-primary " : "border border-base-300 bg-base-100 ") + "shrink-0 size-5 rounded-full flex items-center justify-center"}>
                        {done && <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} className="text-primary-content" />}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5 items-start justify-start">
                        <p className={(done ? "text-neutral " : "text-base-content ") + "text-sm !leading-[1] font-semibold"}>
                          {step.label}
                          <span className="sr-only">{done ? " (done)" : " (not done)"}</span>
                        </p>
                        <p className="text-sm leading-snug font-normal lowercase text-neutral">{step.description}</p>
                      </div>
                      {!done && step.href && <Button label={step.action ?? "Start"} href={step.href} />}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </SettingsPage>
      </PageContent>
    </Layout>
  );
}

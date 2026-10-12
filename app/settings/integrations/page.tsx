"use client";

import Link from "next/link";
import { ConnectIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { useActions } from "@/lib/state/actions";
import { getPlan, integrationInfo } from "@/lib/state/selectors";
import type { Integration } from "@/lib/state/types";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { Button } from "@/components/atom/Button";
import { SettingsPage, SettingsSection } from "@/components/molecule/SettingsSection";

// Integrations: what is connected (state.integrations.connected) and what can
// be added (config.integrations), capped by the plan's limits.integrations.
// Connect goes through lib/backend.ts connectIntegration (usually an OAuth
// redirect); the demo connects it locally.

function Tile({ it }: { it: Integration }) {
  return (
    <span className={"shrink-0 size-8 rounded-md flex items-center justify-center " + it.tint}>
      <HugeiconsIcon icon={it.icon} size={16} strokeWidth={2} />
    </span>
  );
}

export default function IntegrationsPage() {
  const { state } = useAppState();
  const { connect, disconnect } = useActions();
  const info = integrationInfo(state);
  const plan = getPlan(state);
  const connected = config.integrations.filter((it) => state.integrations.connected.includes(it.id));
  const available = config.integrations.filter((it) => !state.integrations.connected.includes(it.id));

  return (
    <Layout title="Integrations" titleIcon={ConnectIcon} titleIconClass="text-neutral" titleHref="/settings/integrations" activeItem="Integrations">
      <PageContent>
        <SettingsPage>
          <SettingsSection
            title="Connected"
            description={info.unlimited ? "Connect as many tools as you like on your plan" : `${info.used} of ${info.limit} on the ${plan.name} plan`}
          >
            {connected.length === 0 ? (
              <div className="w-full p-3 rounded-md border border-dashed border-base-300 text-sm text-neutral">Nothing connected yet. Pick a tool below.</div>
            ) : (
              <ul className="flex flex-col gap-2 w-full">
                {connected.map((it) => (
                  <li key={it.id} className="w-full flex flex-row items-center gap-3 p-3 rounded-md border border-base-300 bg-base-300/40">
                    <Tile it={it} />
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <p className="text-sm !leading-[1] font-semibold text-base-content">{it.name}</p>
                      <p className="text-xs !leading-[1] text-neutral">Connected · syncing</p>
                    </div>
                    <Button label="Disconnect" onClick={() => disconnect(it.id)} />
                  </li>
                ))}
              </ul>
            )}
          </SettingsSection>

          <SettingsSection title="Add an integration" description="Bring in the tools you already work with">
            {info.full && (
              <p className="w-full p-3 rounded-md bg-warning text-warning-content text-sm">
                You&apos;ve used every integration on {plan.name}.{" "}
                <Link href="/settings/billing" className="font-semibold underline underline-offset-2">
                  Upgrade for more
                </Link>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {available.map((it) => (
                <div key={it.id} className="flex flex-row items-center gap-3 p-3 rounded-md border border-base-300">
                  <Tile it={it} />
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <p className="text-sm !leading-[1] font-semibold text-base-content">{it.name}</p>
                    <p className="text-xs !leading-[1.3] text-neutral truncate">{it.description}</p>
                  </div>
                  <Button label="Connect" disabled={info.full} onClick={() => connect(it.id)} />
                </div>
              ))}
            </div>
          </SettingsSection>
        </SettingsPage>
      </PageContent>
    </Layout>
  );
}

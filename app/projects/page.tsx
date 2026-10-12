"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { useActions } from "@/lib/state/actions";
import { usageInfo } from "@/lib/state/selectors";
import { SAMPLE_PROJECTS, type ProjectStatus } from "@/lib/sample-data";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { PrimaryButton } from "@/components/atom/Button";
import { StrokeBar } from "@/components/atom/StrokeBar";
import { EmptyState } from "@/components/molecule/EmptyState";

// The core-object list. Empty until product.used; rows come from
// lib/sample-data.ts. A row (or a pinned item in the sidebar, via ?open=<id>)
// opens its details in the drawer.

const STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  "on-track": { label: "On track", cls: "bg-success text-success-content" },
  "at-risk": { label: "At risk", cls: "bg-warning text-warning-content" },
  done: { label: "Done", cls: "bg-base-300/60 text-neutral" },
};
const updated = (days: number) => (days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`);

function ProjectsPage() {
  const { state } = useAppState();
  const { createProject } = useActions();
  const router = useRouter();
  const params = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);
  const object = config.app.coreObject;

  // ?open=<id> (from a pinned item) opens that row's drawer.
  useEffect(() => {
    const id = params.get("open");
    if (id) setOpenId(id);
  }, [params]);

  const open = SAMPLE_PROJECTS.find((p) => p.id === openId) ?? null;
  const close = () => {
    setOpenId(null);
    if (params.get("open")) router.replace("/projects");
  };

  const details = open && (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-base-content">{open.name}</p>
        <span className={"self-start px-1.5 py-1 rounded-sm text-xs !leading-[1] font-medium " + STATUS[open.status].cls}>{STATUS[open.status].label}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-row items-center justify-between text-xs text-neutral">
          <span>Tasks</span>
          <span>
            <span className="font-semibold text-base-content">{open.tasksDone}</span> / {open.tasksTotal}
          </span>
        </div>
        <StrokeBar value={(open.tasksDone / open.tasksTotal) * 100} label="Tasks done" />
      </div>
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <dt className="text-neutral">Owner</dt>
        <dd className="text-base-content font-medium">{open.owner}</dd>
        <dt className="text-neutral">Updated</dt>
        <dd className="text-base-content font-medium">{updated(open.updatedDaysAgo)}</dd>
      </dl>
    </div>
  );

  return (
    <Layout
      title={object.plural}
      titleIcon={Folder01Icon}
      titleIconClass="text-aviation fill-azure"
      titleHref="/projects"
      crumb={open?.name}
      activeItem={open?.pinned ? open.name : object.plural}
      drawerTitle="Details"
      drawerContent={state.product.used ? (details ?? <p className="text-sm text-neutral">Select a {object.singular.toLowerCase()} to see its details.</p>) : undefined}
      drawerOpen={open !== null}
      onDrawerOpenChange={(o) => {
        if (!o) close();
        else setOpenId(SAMPLE_PROJECTS[0].id);
      }}
    >
      {!state.product.used ? (
        <EmptyState icon={Folder01Icon} iconClass="text-aviation fill-azure" title={`No ${object.plural.toLowerCase()} yet`} description={`${object.plural} are where the work happens. Create one to get going.`}>
          <PrimaryButton label={`Create your first ${object.singular.toLowerCase()}`} onClick={() => createProject()} disabled={usageInfo(state).status === "reached"} />
        </EmptyState>
      ) : (
        <PageContent>
          <div className="w-full max-w-6xl mx-auto rounded-md border border-base-300 bg-base-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_7rem_7rem] gap-4 px-4 py-2.5 border-b border-base-300 text-xs font-medium text-neutral">
              <span>Name</span>
              <span>Owner</span>
              <span>Progress</span>
              <span>Status</span>
              <span className="text-right">Updated</span>
            </div>
            <ul>
              {SAMPLE_PROJECTS.map((p) => (
                <li key={p.id} className="border-b border-base-300 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(p.id)}
                    className={(openId === p.id ? "bg-base-300/40 " : "hover:bg-base-300/30 ") + "w-full grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_7rem_7rem] gap-x-4 gap-y-1 items-center px-4 py-3 text-left cursor-pointer transition-colors duration-125"}
                  >
                    <span className="text-sm font-semibold text-base-content truncate">{p.name}</span>
                    <span className="hidden md:block text-sm text-neutral truncate">{p.owner}</span>
                    <span className="hidden md:flex flex-row items-center gap-2">
                      <span className="flex-1 h-1 rounded-full bg-base-300 overflow-hidden">
                        <span className="block h-full rounded-full bg-aviation" style={{ width: `${(p.tasksDone / p.tasksTotal) * 100}%` }} />
                      </span>
                      <span className="w-12 text-right text-xs text-neutral tabular-nums">
                        {p.tasksDone}/{p.tasksTotal}
                      </span>
                    </span>
                    <span className={"justify-self-end md:justify-self-start px-1.5 py-1 rounded-sm text-xs !leading-[1] font-medium " + STATUS[p.status].cls}>{STATUS[p.status].label}</span>
                    <span className="hidden md:block text-right text-xs text-neutral">{updated(p.updatedDaysAgo)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </PageContent>
      )}
    </Layout>
  );
}

// useSearchParams needs a Suspense boundary for static rendering.
export default function Page() {
  return (
    <Suspense>
      <ProjectsPage />
    </Suspense>
  );
}

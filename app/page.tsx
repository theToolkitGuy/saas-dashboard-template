"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity04Icon, AnalyticsUpIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import config from "@/saas.config";
import { useAppState } from "@/lib/state/provider";
import { useActions } from "@/lib/state/actions";
import { setupProgress, usageInfo } from "@/lib/state/selectors";
import { SAMPLE_PROJECTS, sampleActivity, isoLocal, type DayActivity } from "@/lib/sample-data";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { PrimaryButton } from "@/components/atom/Button";
import { EmptyState } from "@/components/molecule/EmptyState";
import { FilterBar, useSavedFilters, type FilterValues } from "@/components/molecule/FilterBar";
import { StatCard, StatValue, Delta } from "@/components/molecule/StatCard";
import { ActivityLine, type LinePoint } from "@/components/molecule/ActivityLine";
import { ColumnBars } from "@/components/molecule/ColumnBars";
import { PlanGate } from "@/components/molecule/PlanGate";
import { SetupCallout } from "@/components/molecule/SetupCallout";

// The Dashboard: the template's key page. Three states, all from the AppState:
// - product.used false   -> empty state with the first core action
// - setup not complete   -> a "Finish setting up" strip above the cards
// - plan without "advanced-analytics" -> the gated card shows an upgrade
// Numbers come from lib/sample-data.ts; swap in your own queries.
// Press F to show / hide the filter bar; the details panel holds the same
// filter as a list.

// ── Periods ───────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "3m" | "ytd";
const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "3m", label: "Last 3 months" },
  { key: "ytd", label: "Year to date" },
];
const DELTA_LABEL: Record<Period, string> = { "7d": "this week", "30d": "this month", "3m": "this quarter", ytd: "this year" };
const SAVED_KEY = "dashboard.filters";

const asDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => asDate(iso).toLocaleDateString("en-US", opts);

function periodStart(p: Period | undefined): string | null {
  if (!p) return null;
  const d = new Date();
  if (p === "7d") d.setDate(d.getDate() - 7);
  else if (p === "30d") d.setDate(d.getDate() - 30);
  else if (p === "3m") d.setMonth(d.getMonth() - 3);
  else d.setMonth(0, 1);
  return isoLocal(d);
}

// The window before the selected one, same length, as [from, to).
function previousWindow(p: Period | undefined): { from: string; to: string } | null {
  if (!p) return null;
  const start = asDate(periodStart(p)!);
  if (p === "ytd") {
    const t = new Date();
    return { from: isoLocal(new Date(t.getFullYear() - 1, 0, 1)), to: isoLocal(new Date(t.getFullYear() - 1, t.getMonth(), t.getDate() + 1)) };
  }
  const from = new Date(start);
  if (p === "7d") from.setDate(from.getDate() - 7);
  else if (p === "30d") from.setDate(from.getDate() - 30);
  else from.setMonth(from.getMonth() - 3);
  return { from: isoLocal(from), to: isoLocal(start) };
}

// The saved period if still valid, else the default: last 30 days. (Removing
// the chip shows all time for the visit.)
function cleanSaved(raw: Record<string, unknown>): FilterValues {
  return { period: PERIODS.some((p) => p.key === raw.period) ? (raw.period as Period) : "30d" };
}

// ── Numbers ───────────────────────────────────────────────────────────────────

type Kpis = { completed: number | null; created: number | null; completionRate: number | null; onTimeRate: number | null; cycle: number | null };
function computeKpis(days: DayActivity[]): Kpis {
  if (days.length === 0) return { completed: null, created: null, completionRate: null, onTimeRate: null, cycle: null };
  const completed = days.reduce((a, d) => a + d.completed, 0);
  const created = days.reduce((a, d) => a + d.created, 0);
  const onTime = days.reduce((a, d) => a + d.onTime, 0);
  const cycle = days.reduce((a, d) => a + d.cycleDays, 0);
  return {
    completed,
    created,
    completionRate: created ? Math.min(100, (completed / created) * 100) : null,
    onTimeRate: completed ? (onTime / completed) * 100 : null,
    cycle: completed ? cycle / completed : null,
  };
}

// Day buckets up to ~6 weeks, weeks up to ~7 months, months beyond.
function buckets(days: DayActivity[]): { unit: "day" | "week" | "month"; points: LinePoint[] } {
  if (days.length === 0) return { unit: "day", points: [] };
  const span = (asDate(days[days.length - 1].date).getTime() - asDate(days[0].date).getTime()) / 86_400_000;
  const unit = span <= 45 ? "day" : span <= 210 ? "week" : "month";
  const keyOf = (iso: string) => {
    const d = asDate(iso);
    if (unit === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    if (unit === "month") d.setDate(1);
    return isoLocal(d);
  };
  const map = new Map<string, number>();
  for (const d of days) map.set(keyOf(d.date), (map.get(keyOf(d.date)) ?? 0) + d.completed);
  const points = Array.from(map.entries()).map(([key, value]) => ({
    key,
    value,
    label: unit === "day" ? fmt(key, { month: "short", day: "numeric" }) : unit === "week" ? `Week of ${fmt(key, { month: "short", day: "numeric" })}` : fmt(key, { month: "short", year: "numeric" }),
  }));
  return { unit, points };
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pct = (v: number | null) => (v === null ? "-" : `${v.toFixed(1)}%`);
const num = (v: number | null) => (v === null ? "-" : v.toLocaleString("en-US"));

// A stable made-up cycle time per project, for the gated card.
const cycleOf = (id: string) => 2 + (Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0) % 60) / 10;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { state, update } = useAppState();
  const { createProject } = useActions();
  const { values, setValue, dirty, save, barOpen } = useSavedFilters(SAVED_KEY, cleanSaved);
  const period = values.period as Period | undefined;
  const activity = useMemo(() => sampleActivity(), []);
  const object = config.app.coreObject;

  const start = periodStart(period);
  const visible = activity.filter((d) => !start || d.date >= start);
  const prevWin = previousWindow(period);
  const prevDays = prevWin ? activity.filter((d) => d.date >= prevWin.from && d.date < prevWin.to) : [];
  const cur = computeKpis(visible);
  const prev = computeKpis(prevDays);
  const deltaLabel = period ? DELTA_LABEL[period] : null;
  const { unit, points } = buckets(visible);

  const weekdays = WEEKDAYS.map((label) => ({ label, value: 0 }));
  for (const d of visible) weekdays[(asDate(d.date).getDay() + 6) % 7].value += d.completed;

  const topProjects = [...SAMPLE_PROJECTS].sort((a, b) => b.tasksDone - a.tasksDone).slice(0, 5);
  const topMax = topProjects[0]?.tasksDone ?? 1;
  const active = SAMPLE_PROJECTS.filter((p) => p.status !== "done").length;
  const atRisk = SAMPLE_PROJECTS.filter((p) => p.status === "at-risk").length;
  const team = state.setup.completed.includes("invite-team") ? 6 : 1;
  const used = state.product.used;
  const setup = setupProgress(state);

  const filterDefs = [{ key: "period", label: "Time period", options: PERIODS.map((p) => ({ value: p.key, label: p.label })), initial: 1 }];
  const filterBar = <FilterBar defs={filterDefs} values={values} onChange={setValue} dirty={dirty} onSave={save} />;

  const detailsPanel = (
    <div className="flex flex-col gap-6">
      <p className="text-xs leading-snug text-neutral">
        Press <kbd className="px-1 py-0.5 rounded-sm border border-base-300 bg-base-200 text-[11px] font-semibold text-base-content">F</kbd> to show or hide the filter bar.
      </p>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs !leading-[1] font-medium text-neutral mb-1">Time period</p>
        <div role="radiogroup" aria-label="Time period" className="flex flex-col gap-0.5">
          {[{ value: undefined as string | undefined, label: "All time" }, ...filterDefs[0].options].map((o) => {
            const on = period === o.value;
            return (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setValue("period", o.value)}
                className={(on ? "bg-base-300/50 text-base-content font-medium " : "text-base-content/80 hover:bg-base-300/40 ") + "w-full flex flex-row items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm text-left cursor-pointer transition-all duration-125 ease-in-out"}
              >
                {o.label}
                {on && <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} className="text-neutral" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <Layout
      title="Dashboard"
      titleIcon={Activity04Icon}
      titleIconClass="text-base-content fill-base-content/10"
      titleHref="/"
      activeItem="Dashboard"
      filters={used && barOpen ? filterBar : undefined}
      filterSpacer={false}
      drawerTitle="Details"
      drawerContent={used ? detailsPanel : undefined}
    >
      {!used ? (
        <EmptyState
          icon={AnalyticsUpIcon}
          title={`No ${object.plural.toLowerCase()} yet`}
          description={`Create your first ${object.singular.toLowerCase()} and this dashboard fills in: throughput, completion rate, cycle time and more.`}
        >
          <PrimaryButton label={`Create your first ${object.singular.toLowerCase()}`} onClick={() => createProject()} disabled={usageInfo(state).status === "reached"} />
          <button
            type="button"
            onClick={() => update((s) => ({ ...s, product: { used: true } }))}
            className="text-xs font-medium text-neutral hover:text-base-content transition-all duration-125 ease-in-out cursor-pointer"
          >
            or explore with sample data
          </button>
          {!setup.complete && (
            <p className="text-xs text-neutral">
              Setup {setup.done} of {setup.total} done.{" "}
              <Link href="/get-started" className="font-semibold text-base-content underline underline-offset-2">
                Continue
              </Link>
            </p>
          )}
        </EmptyState>
      ) : (
        <PageContent>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 lg:flex-1 lg:min-h-0">
            <SetupCallout />

            {/* On lg the grid fills the height left under the bars, split
                1 : 2 : 1 across its rows; smaller screens stack and scroll. */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:flex-1 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4">
              <StatCard title="Tasks completed" kpi info="Tasks marked done in this period, across every project.">
                <StatValue value={num(cur.completed)}>
                  <Delta cur={cur.completed} prev={prev.completed} label={deltaLabel} />
                </StatValue>
              </StatCard>
              <StatCard title="Completion rate" kpi info="Tasks completed as a share of tasks created in this period.">
                <StatValue value={pct(cur.completionRate)}>
                  <Delta cur={cur.completionRate} prev={prev.completionRate} label={deltaLabel} />
                </StatValue>
              </StatCard>
              <StatCard title="On-time rate" kpi info="The share of completed tasks finished by their due date.">
                <StatValue value={pct(cur.onTimeRate)}>
                  <Delta cur={cur.onTimeRate} prev={prev.onTimeRate} label={deltaLabel} />
                </StatValue>
              </StatCard>
              <StatCard title="Avg. cycle time" kpi info="Average days from a task's start to done. Lower is better.">
                <StatValue value={cur.cycle === null ? "-" : `${cur.cycle.toFixed(1)} days`}>
                  <Delta cur={cur.cycle} prev={prev.cycle} label={deltaLabel} invert />
                </StatValue>
              </StatCard>

              {/* Row 2: the timeline spans 2 columns, four small cards 1. */}
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard title={`Tasks completed per ${unit}`} info={`How many tasks were completed each ${unit}.`} className="lg:col-span-2 min-h-72 lg:min-h-0">
                  <ActivityLine points={points} unit="task" />
                </StatCard>
                <div className="lg:col-span-1 lg:relative">
                  <div className="grid grid-cols-2 grid-rows-2 gap-4 lg:absolute lg:inset-0">
                    <StatCard title="Active" kpi dense info={`${object.plural} not marked done.`} className="min-h-32 lg:min-h-0">
                      <StatValue value={String(active)} size="md" />
                    </StatCard>
                    <StatCard title="At risk" kpi dense info="Behind schedule on their current milestone." className="min-h-32 lg:min-h-0">
                      <StatValue value={String(atRisk)} size="md" />
                    </StatCard>
                    <StatCard title="Created" kpi dense info="Tasks created in this period." className="min-h-32 lg:min-h-0">
                      <StatValue value={num(cur.created)} size="md">
                        <Delta cur={cur.created} prev={prev.created} label={deltaLabel} />
                      </StatValue>
                    </StatCard>
                    <StatCard title="Team" kpi dense info="People in this workspace." className="min-h-32 lg:min-h-0">
                      <StatValue value={team === 1 ? "Just you" : `${team} people`} size="md" />
                    </StatCard>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Completed by weekday" info="Tasks completed on each day of the week in this period." className="min-h-48 lg:min-h-0">
                  <div className="flex-1 min-h-0">
                    <ColumnBars columns={weekdays} unit="task" />
                  </div>
                </StatCard>
                <StatCard title={`Top ${object.plural.toLowerCase()}`} info={`The ${object.plural.toLowerCase()} with the most completed tasks.`} className="min-h-48 lg:min-h-0">
                  <div className="flex flex-col gap-2 overflow-hidden">
                    {topProjects.map((p) => (
                      <div key={p.id} className="flex flex-col gap-1">
                        <div className="flex flex-row items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-base-content truncate">{p.name}</span>
                          <span className="text-neutral tabular-nums">{p.tasksDone}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-base-300 overflow-hidden">
                          <div className="h-full rounded-full bg-aviation" style={{ width: `${(p.tasksDone / topMax) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </StatCard>
                <StatCard title={`Cycle time by ${object.singular.toLowerCase()}`} info="Average days from start to done, per project. An advanced analytics card." className="min-h-48 lg:min-h-0">
                  <PlanGate feature="advanced-analytics">
                    <div className="flex flex-col gap-2 overflow-hidden">
                      {SAMPLE_PROJECTS.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex flex-row items-center gap-2 text-xs">
                          <span className="w-28 shrink-0 font-semibold text-base-content truncate">{p.name}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-base-300 overflow-hidden">
                            <div className="h-full rounded-full bg-amethyst" style={{ width: `${(cycleOf(p.id) / 8) * 100}%` }} />
                          </div>
                          <span className="w-12 text-right text-neutral tabular-nums">{cycleOf(p.id).toFixed(1)}d</span>
                        </div>
                      ))}
                    </div>
                  </PlanGate>
                </StatCard>
              </div>
            </div>
          </div>
        </PageContent>
      )}
    </Layout>
  );
}

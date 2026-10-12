// Made-up data for the "used the core product" state, so the dashboard and
// lists have something to show. Deterministic (seeded), so every reload and
// every screenshot look the same. Replace with your own queries.

export type ProjectStatus = "on-track" | "at-risk" | "done";
export type SampleProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  owner: string;
  tasksDone: number;
  tasksTotal: number;
  updatedDaysAgo: number;
  pinned?: boolean;
};

export const SAMPLE_PROJECTS: SampleProject[] = [
  { id: "website-relaunch", name: "Website relaunch", status: "on-track", owner: "Alex Morgan", tasksDone: 34, tasksTotal: 41, updatedDaysAgo: 0, pinned: true },
  { id: "onboarding-v2", name: "Onboarding v2", status: "at-risk", owner: "Sam Lee", tasksDone: 12, tasksTotal: 30, updatedDaysAgo: 1, pinned: true },
  { id: "pricing-page", name: "Pricing page test", status: "on-track", owner: "Jordan Kim", tasksDone: 8, tasksTotal: 11, updatedDaysAgo: 1, pinned: true },
  { id: "mobile-app", name: "Mobile app beta", status: "at-risk", owner: "Taylor Reed", tasksDone: 21, tasksTotal: 58, updatedDaysAgo: 2 },
  { id: "q4-campaign", name: "Q4 campaign", status: "on-track", owner: "Alex Morgan", tasksDone: 17, tasksTotal: 24, updatedDaysAgo: 3 },
  { id: "help-center", name: "Help center refresh", status: "done", owner: "Casey Park", tasksDone: 19, tasksTotal: 19, updatedDaysAgo: 5 },
  { id: "billing-migration", name: "Billing migration", status: "on-track", owner: "Sam Lee", tasksDone: 26, tasksTotal: 33, updatedDaysAgo: 6 },
  { id: "partner-portal", name: "Partner portal", status: "done", owner: "Jordan Kim", tasksDone: 40, tasksTotal: 40, updatedDaysAgo: 9 },
  { id: "design-system", name: "Design system tokens", status: "on-track", owner: "Taylor Reed", tasksDone: 14, tasksTotal: 22, updatedDaysAgo: 12 },
];

// ── Daily activity ────────────────────────────────────────────────────────────

export type DayActivity = {
  date: string; // YYYY-MM-DD, local
  created: number; // tasks created
  completed: number; // tasks completed
  onTime: number; // of `completed`, finished by their due date
  cycleDays: number; // summed days from start to done, over `completed`
};

// Small seeded PRNG (mulberry32).
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// The last `days` days up to today, oldest first. A slow upward trend, quieter
// weekends, and the seed keyed to the day so values never shift on reload.
export function sampleActivity(days = 420): DayActivity[] {
  const out: DayActivity[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const date = isoLocal(d);
    const r = rng(Number(date.replaceAll("-", "")));
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const trend = 1 + (days - i) / days; // 1 -> 2 over the range
    const base = (weekend ? 2 : 9) * trend;
    const completed = Math.max(0, Math.round(base + (r() - 0.5) * base));
    const created = Math.max(0, Math.round(completed * (0.9 + r() * 0.4)));
    const onTime = Math.round(completed * (0.72 + r() * 0.2));
    const cycleDays = Math.round(completed * (2.4 + r() * 1.8) * 10) / 10;
    out.push({ date, created, completed, onTime, cycleDays });
  }
  return out;
}

"use client";

import { PaintBoardIcon } from "@hugeicons/core-free-icons";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { SettingsPage, SettingsSection } from "@/components/molecule/SettingsSection";

// Appearance: light / dark / system, saved on this device (lib/theme.tsx).

const OPTIONS: { key: ThemeChoice; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];
// Mini previews use the theme's own base colors.
const PREVIEW = {
  light: { bg: "#F9F9F9", line: "#EBEBEB", accent: "#2A2A2A" },
  dark: { bg: "#1A1A1A", line: "#2A2A2A", accent: "#F2F2F2" },
};

export default function AppearancePage() {
  const { choice, setChoice } = useTheme();

  return (
    <Layout title="Appearance" titleIcon={PaintBoardIcon} titleIconClass="text-neutral" titleHref="/settings/appearance" activeItem="Appearance">
      <PageContent>
        <SettingsPage>
          <SettingsSection title="Theme" description="How the app looks on this device">
            <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-4 w-full">
              {OPTIONS.map(({ key, label }) => {
                const active = choice === key;
                const previews = key === "system" ? [PREVIEW.light, PREVIEW.dark] : [PREVIEW[key]];
                return (
                  <button key={key} type="button" role="radio" aria-checked={active} onClick={() => setChoice(key)} className="group flex flex-col gap-2 items-start text-left cursor-pointer">
                    <p className={(active ? "text-base-content" : "text-neutral group-hover:text-base-content") + " text-sm !leading-[1] font-medium"}>{label}</p>
                    <div className={(active ? "border-silver ring-1 ring-silver " : "border-base-300 group-hover:border-ash ") + "relative w-full h-36 rounded-md border overflow-hidden flex flex-row transition-all duration-125 ease-in-out"}>
                      {previews.map((p, i) => (
                        <div key={i} className="flex-1 h-full p-2.5 flex flex-col gap-1.5" style={{ background: p.bg }}>
                          <span className="h-1.5 w-3/4 rounded-full" style={{ background: p.line }} />
                          <span className="h-1.5 w-1/2 rounded-full" style={{ background: p.line }} />
                          <span className="h-1.5 w-1/3 rounded-full" style={{ background: p.accent }} />
                        </div>
                      ))}
                      {active && (
                        <span aria-hidden="true" className="absolute bottom-2 right-2 size-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="size-1.5 rounded-full bg-primary-content" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </SettingsSection>
        </SettingsPage>
      </PageContent>
    </Layout>
  );
}

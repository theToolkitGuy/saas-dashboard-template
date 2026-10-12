"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon, PlusSignIcon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/atom/Button";

export type FilterOption = { value: string; label: string };
export type FilterDef = {
  key: string;
  label: string;
  options: FilterOption[];
  initial?: number; // the option picked when the filter is added (default 0)
};
export type FilterValues = Record<string, string>;

/**
 * The filter bar under the action bar (same height): a + menu to add a
 * filter, one chip per applied filter (label, value, dropdown, x), and Save.
 * The page owns the values through `useSavedFilters`.
 *
 * @example
 * const f = useSavedFilters("dashboard.filters", clean);
 * <FilterBar defs={[{ key: "period", label: "Time period", options: PERIODS }]} values={f.values} onChange={f.setValue} dirty={f.dirty} onSave={f.save} />
 */
export function FilterBar({
  defs,
  values,
  onChange,
  dirty,
  onSave,
}: {
  defs: FilterDef[];
  values: FilterValues;
  onChange: (key: string, value: string | undefined) => void;
  dirty: boolean;
  onSave: () => void;
}) {
  // The open menu: "add" or a filter key.
  const [menu, setMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(`[data-menu="${menu}"]`)) setMenu(null);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menu]);

  const defOf = (key: string) => defs.find((d) => d.key === key);
  const valueLabel = (key: string) => defOf(key)?.options.find((o) => o.value === values[key])?.label ?? values[key];
  const addable = defs.filter((d) => !(d.key in values) && d.options.length > 0);
  const add = (d: FilterDef) => {
    onChange(d.key, d.options[d.initial ?? 0].value);
    setMenu(d.key);
  };

  return (
    <section className="px-2 flex flex-row items-center justify-between gap-2 bg-base-100 border-b-1 border-base-300 w-full py-2">
      <div className="flex flex-row items-center gap-1.5 min-w-0">
        <div className="relative" data-menu="add">
          <button
            type="button"
            aria-label="Add filter"
            aria-haspopup="menu"
            aria-expanded={menu === "add"}
            disabled={addable.length === 0}
            onClick={() => setMenu(menu === "add" ? null : "add")}
            className="group p-1 rounded-md flex items-center justify-center hover:bg-base-300/50 transition-all duration-125 ease-in-out cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} className="text-ash group-hover:text-base-content/80 transition-all duration-125 ease-in-out" />
          </button>
          {menu === "add" && (
            <ul role="menu" className="absolute z-30 top-full mt-1 left-0 min-w-44 rounded-md border border-base-300 bg-base-100 shadow-lg p-1">
              {addable.map((d) => (
                <li key={d.key} role="none">
                  <button type="button" role="menuitem" onClick={() => add(d)} className="w-full text-left px-2 py-1.5 rounded-sm text-sm text-base-content/80 hover:bg-base-300/50 cursor-pointer">
                    {d.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {Object.keys(values)
          .filter((key) => defOf(key))
          .map((key) => {
            const d = defOf(key)!;
            return (
              <div key={key} className="relative flex flex-row items-center rounded-md bg-base-300/50" data-menu={key}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={menu === key}
                  onClick={() => setMenu(menu === key ? null : key)}
                  className="pl-1.5 pr-1 py-1 flex flex-row items-center gap-1.5 rounded-l-md hover:bg-base-200 transition-all duration-125 ease-in-out cursor-pointer"
                >
                  <span className="text-sm font-medium text-neutral">{d.label}</span>
                  <span className="text-sm font-semibold text-base-content/80">{valueLabel(key)}</span>
                  <HugeiconsIcon icon={ChevronDownIcon} size={14} strokeWidth={2} className={"text-ash transition-transform duration-125 ease-in-out " + (menu === key ? "rotate-180" : "")} />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${d.label} filter`}
                  onClick={() => {
                    onChange(key, undefined);
                    setMenu(null);
                  }}
                  className="group pl-0.5 pr-1.5 py-1 self-stretch flex items-center rounded-r-md hover:bg-base-200 transition-all duration-125 ease-in-out cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} className="text-ash group-hover:text-base-content/80" />
                </button>
                {menu === key && (
                  <ul role="listbox" aria-label={d.label} className="absolute z-30 top-full mt-1 left-0 min-w-44 rounded-md border border-base-300 bg-base-100 shadow-lg p-1">
                    {d.options.map((o) => (
                      <li key={o.value} role="option" aria-selected={values[key] === o.value}>
                        <button
                          type="button"
                          onClick={() => {
                            onChange(key, o.value);
                            setMenu(null);
                          }}
                          className={(values[key] === o.value ? "text-base-content font-medium " : "text-base-content/80 ") + "w-full flex flex-row items-center justify-between gap-2 px-2 py-1.5 rounded-sm text-sm text-left hover:bg-base-300/50 cursor-pointer"}
                        >
                          {o.label}
                          {values[key] === o.value && <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} className="text-neutral" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
      </div>

      <Button className="shrink-0" label="Save" disabled={!dirty} onClick={onSave} />
    </section>
  );
}

/**
 * Filter values kept in localStorage under `storageKey`, plus whether the bar
 * is open (open on load when filters were saved; F toggles it unless typing).
 * `clean` turns what was saved into values the page still accepts; pass a
 * module-level function so it stays stable between renders.
 *
 * @example
 * const { values, setValue, dirty, save, barOpen } = useSavedFilters("dashboard.filters", cleanSaved);
 */
export function useSavedFilters(storageKey: string, clean: (raw: Record<string, unknown>) => FilterValues) {
  const [values, setValues] = useState<FilterValues>({});
  const [saved, setSaved] = useState<FilterValues>({});
  const [barOpen, setBarOpen] = useState(false);

  useEffect(() => {
    let s: FilterValues = {};
    try {
      s = clean(JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch {
      // Unreadable or blocked storage: start with no filters.
    }
    setValues(s);
    setSaved(s);
    setBarOpen(Object.keys(s).length > 0);
  }, [storageKey, clean]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "f" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || el.closest("input, textarea, select"))) return;
      e.preventDefault();
      setBarOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setValue = (key: string, value: string | undefined) =>
    setValues((v) => {
      const next = { ...v };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      // Private mode: kept for this visit only.
    }
    setSaved(values);
  };

  return { values, setValue, dirty, save, barOpen, setBarOpen };
}

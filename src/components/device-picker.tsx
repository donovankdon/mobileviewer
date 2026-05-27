"use client";

import { DEVICES, type Device, type DeviceCategory } from "@/lib/devices";
import { useMemo, useState } from "react";

interface DevicePickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const CATEGORIES: { value: DeviceCategory | "all"; label: string }[] = [
  { value: "all", label: "all" },
  { value: "phone", label: "phone" },
  { value: "tablet", label: "tab" },
  { value: "desktop", label: "desk" },
];

const BRAND_ORDER: Device["brand"][] = ["apple", "google", "samsung", "other"];
const BRAND_LABEL: Record<Device["brand"], string> = {
  apple: "apple",
  google: "google",
  samsung: "samsung",
  other: "other",
};

export function DevicePicker({ selected, onChange }: DevicePickerProps) {
  const [filter, setFilter] = useState<DeviceCategory | "all">("all");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const byCategory = filter === "all" ? DEVICES : DEVICES.filter((d) => d.category === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((d) => d.name.toLowerCase().includes(q) || d.brand.includes(q));
  }, [filter, search]);

  const grouped = useMemo(() => {
    const map = new Map<Device["brand"], Device[]>();
    for (const d of visible) {
      if (!map.has(d.brand)) map.set(d.brand, []);
      map.get(d.brand)!.push(d);
    }
    return BRAND_ORDER.filter((b) => map.has(b)).map((b) => [b, map.get(b)!] as const);
  }, [visible]);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="eyebrow">devices</label>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mono text-[10px] text-fg-dim hover:text-fg"
          >
            clear ({selected.length})
          </button>
        )}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search"
        className="mono w-full rounded border border-line-strong bg-bg-elevated px-2.5 py-1.5 text-[11px] text-fg placeholder:text-fg-dim focus:border-fg-muted focus:outline-none"
      />

      <div className="flex gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setFilter(c.value)}
            className={`mono flex-1 rounded border px-1 py-1 text-[10px] transition ${
              filter === c.value
                ? "border-fg-muted bg-bg-elevated text-fg"
                : "border-line text-fg-dim hover:border-line-strong hover:text-fg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="scroll-thin -mr-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-2">
        {grouped.map(([brand, devices]) => (
          <div key={brand} className="flex flex-col gap-0.5">
            <div className="mono mb-1 text-[9px] tracking-widest text-fg-dim uppercase">
              {BRAND_LABEL[brand]}
            </div>
            {devices.map((d) => {
              const isSelected = selected.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggle(d.id)}
                  className={`flex items-center justify-between rounded px-2 py-1 text-left text-xs transition ${
                    isSelected
                      ? "bg-bg-elevated text-fg"
                      : "text-fg-muted hover:bg-bg-elevated/50 hover:text-fg"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full transition ${
                        isSelected ? "bg-fg" : "bg-fg-dim"
                      }`}
                    />
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="mono shrink-0 text-[9px] text-fg-dim">
                    {d.width}×{d.height}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="mono py-4 text-center text-[10px] text-fg-dim">no matches</div>
        )}
      </div>
    </div>
  );
}

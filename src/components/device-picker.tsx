"use client";

import { DEVICES, type DeviceCategory } from "@/lib/devices";
import { useMemo, useState } from "react";
import { Magnetic } from "./magnetic";

interface DevicePickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const CATEGORIES: { value: DeviceCategory | "all"; label: string }[] = [
  { value: "all", label: "all" },
  { value: "phone", label: "phones" },
  { value: "tablet", label: "tablets" },
  { value: "desktop", label: "desktop" },
];

export function DevicePicker({ selected, onChange }: DevicePickerProps) {
  const [filter, setFilter] = useState<DeviceCategory | "all">("all");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const byCategory = filter === "all" ? DEVICES : DEVICES.filter((d) => d.category === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((d) => d.name.toLowerCase().includes(q) || d.brand.includes(q));
  }, [filter, search]);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-3">
        <div className="flex items-baseline gap-3">
          <span className="eyebrow">filter</span>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={`mono text-xs tracking-tight transition ${
                filter === c.value ? "text-fg" : "text-fg-muted hover:text-fg"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-baseline gap-3">
          <span className="eyebrow">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="iphone, pixel…"
            className="mono w-40 bg-transparent text-xs text-fg outline-none placeholder:text-fg-dim"
          />
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mono text-xs text-fg-muted hover:text-fg"
            >
              clear({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3">
        {visible.map((d) => {
          const isSelected = selected.includes(d.id);
          return (
            <Magnetic key={d.id} strength={0.2}>
              <button
                type="button"
                onClick={() => toggle(d.id)}
                className={`group flex items-baseline gap-2 transition ${
                  isSelected ? "text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full transition ${
                    isSelected ? "bg-fg" : "bg-fg-dim group-hover:bg-fg-muted"
                  }`}
                />
                <span className="text-sm tracking-tight">{d.name}</span>
                <span className="mono text-[10px] text-fg-dim">
                  {d.width}×{d.height}
                </span>
              </button>
            </Magnetic>
          );
        })}
        {visible.length === 0 && <span className="mono text-xs text-fg-dim">no matches</span>}
      </div>
    </div>
  );
}

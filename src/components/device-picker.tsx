"use client";

import { DEVICES, type DeviceCategory } from "@/lib/devices";
import { useMemo, useState } from "react";

interface DevicePickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const CATEGORIES: { value: DeviceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "phone", label: "Phones" },
  { value: "tablet", label: "Tablets" },
  { value: "desktop", label: "Desktop" },
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filter === c.value
                  ? "bg-white text-neutral-900"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter devices…"
            className="h-7 w-44 rounded-md border border-neutral-700 bg-neutral-900 px-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none"
          />
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              Clear ({selected.length})
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((d) => {
          const isSelected = selected.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                isSelected
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                  : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500"
              }`}
            >
              {d.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

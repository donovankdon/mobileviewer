"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_DEVICE_IDS, DEVICES_BY_ID } from "@/lib/devices";
import { DevicePicker } from "./device-picker";
import { DevicePreview } from "./device-preview";
import { UrlBar } from "./url-bar";

type ViewMode = "compare" | "single";
type Density = "fit" | "100" | "75" | "50";

export function Studio() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const url = searchParams.get("url");
  const deviceParam = searchParams.get("devices");
  const selectedIds = useMemo(() => {
    if (!deviceParam) return DEFAULT_DEVICE_IDS;
    return deviceParam.split(",").filter((id) => id in DEVICES_BY_ID);
  }, [deviceParam]);

  const [mode, setMode] = useState<ViewMode>("compare");
  const [density, setDensity] = useState<Density>("fit");

  const updateQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const setUrl = (u: string) => updateQuery({ url: u });
  const setDevices = (ids: string[]) => updateQuery({ devices: ids.join(",") || null });

  const activeIds = mode === "single" ? selectedIds.slice(0, 1) : selectedIds;
  const devices = activeIds.map((id) => DEVICES_BY_ID[id]).filter(Boolean);

  // Choose a global scale that gives readable previews in compare mode.
  const scale = useMemo(() => {
    if (density === "100") return 1;
    if (density === "75") return 0.75;
    if (density === "50") return 0.5;
    // Fit: pick a scale so phones land around ~360px wide, tablets ~600, desktops ~800.
    if (mode === "single") return 1;
    if (!devices.length) return 0.5;
    const maxW = Math.max(...devices.map((d) => d.width));
    if (maxW <= 500) return 0.85;
    if (maxW <= 900) return 0.55;
    return 0.4;
  }, [density, mode, devices]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">📱 Viewport</span>
              <span className="text-xs text-neutral-500">multi-device preview</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <ViewToggle mode={mode} onChange={setMode} />
              <DensityToggle density={density} onChange={setDensity} />
              <CopyLinkButton />
            </div>
          </div>
          <UrlBar value={url} onSubmit={setUrl} />
          <DevicePicker selected={selectedIds} onChange={setDevices} />
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1600px] px-6 py-10">
          {devices.length === 0 ? (
            <div className="py-20 text-center text-neutral-500">
              Select at least one device to preview.
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-10">
              {devices.map((d) => (
                <DevicePreview key={d.id} device={d} url={url} scale={scale} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-neutral-700 text-xs">
      {(["compare", "single"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 ${
            mode === m ? "bg-white text-neutral-900" : "bg-neutral-900 text-neutral-300"
          }`}
        >
          {m === "compare" ? "Compare" : "Single"}
        </button>
      ))}
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:border-neutral-500"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function DensityToggle({ density, onChange }: { density: Density; onChange: (d: Density) => void }) {
  const options: { value: Density; label: string }[] = [
    { value: "fit", label: "Fit" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];
  return (
    <div className="flex overflow-hidden rounded-md border border-neutral-700 text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 ${
            density === o.value ? "bg-white text-neutral-900" : "bg-neutral-900 text-neutral-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

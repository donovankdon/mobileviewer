"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_DEVICE_IDS, DEVICES_BY_ID } from "@/lib/devices";
import { DevicePicker } from "./device-picker";
import { DevicePreview } from "./device-preview";
import { UrlBar } from "./url-bar";

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

  const devices = selectedIds.map((id) => DEVICES_BY_ID[id]).filter(Boolean);

  const scale = useMemo(() => {
    if (density === "100") return 1;
    if (density === "75") return 0.75;
    if (density === "50") return 0.5;
    if (!devices.length) return 0.5;
    const maxW = Math.max(...devices.map((d) => d.width));
    if (maxW <= 500) return 0.85;
    if (maxW <= 900) return 0.55;
    return 0.4;
  }, [density, devices]);

  return (
    <div className="flex h-screen bg-bg text-fg">
      <Sidebar
        url={url}
        onUrl={setUrl}
        selected={selectedIds}
        onSelected={setDevices}
        density={density}
        onDensity={setDensity}
      />
      <Canvas devices={devices} url={url} scale={scale} />
    </div>
  );
}

function Sidebar({
  url,
  onUrl,
  selected,
  onSelected,
  density,
  onDensity,
}: {
  url: string | null;
  onUrl: (u: string) => void;
  selected: string[];
  onSelected: (ids: string[]) => void;
  density: Density;
  onDensity: (d: Density) => void;
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-5 border-r border-line bg-bg p-4">
      <header className="flex items-baseline justify-between">
        <span className="text-sm font-medium tracking-tight">viewport</span>
        <span className="mono text-[9px] text-fg-dim">v0.2</span>
      </header>

      <UrlBar value={url} onSubmit={onUrl} />

      <DevicePicker selected={selected} onChange={onSelected} />

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <label className="eyebrow">zoom</label>
        <div className="flex gap-1">
          {(["fit", "50", "75", "100"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDensity(d)}
              className={`mono flex-1 rounded border px-1 py-1 text-[10px] transition ${
                density === d
                  ? "border-fg-muted bg-bg-elevated text-fg"
                  : "border-line text-fg-dim hover:border-line-strong hover:text-fg-muted"
              }`}
            >
              {d === "fit" ? "fit" : `${d}%`}
            </button>
          ))}
        </div>
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-line pt-3">
        <CopyLinkButton disabled={!url} />
        <a
          href="https://github.com/donovankdon/mobileviewer"
          target="_blank"
          rel="noreferrer"
          className="mono text-[10px] text-fg-dim hover:text-fg"
        >
          github ↗
        </a>
      </footer>
    </aside>
  );
}

function Canvas({
  devices,
  url,
  scale,
}: {
  devices: ReturnType<typeof Array.prototype.filter>;
  url: string | null;
  scale: number;
}) {
  return (
    <main className="scroll-thin flex-1 overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/90 px-6 py-3 backdrop-blur">
        <span className="mono text-[10px] tracking-widest text-fg-dim uppercase">
          {devices.length.toString().padStart(2, "0")} preview{devices.length === 1 ? "" : "s"}
        </span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mono max-w-md truncate text-[11px] text-fg-muted hover:text-fg"
            title={url}
          >
            {url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
          </a>
        )}
      </div>

      <div className="px-8 py-10">
        {devices.length === 0 ? (
          <div className="mono pt-32 text-center text-[11px] tracking-widest text-fg-dim uppercase">
            select a device from the sidebar
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-x-10 gap-y-14">
            {devices.map((d) => (
              <DevicePreview key={d.id} device={d} url={url} scale={scale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CopyLinkButton({ disabled }: { disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (typeof window === "undefined") return;
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
      className={`mono text-[10px] transition ${
        disabled ? "text-fg-dim opacity-40" : "text-fg-muted hover:text-fg"
      }`}
    >
      {copied ? "copied" : "copy link"}
    </button>
  );
}

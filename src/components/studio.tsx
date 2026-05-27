"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DEFAULT_DEVICE_IDS, DEVICES_BY_ID } from "@/lib/devices";
import { DevicePicker } from "./device-picker";
import { DevicePreview } from "./device-preview";
import { UrlBar } from "./url-bar";
import { WordReveal } from "./reveal";

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

  const scale = useMemo(() => {
    if (density === "100") return 1;
    if (density === "75") return 0.75;
    if (density === "50") return 0.5;
    if (mode === "single") return 1;
    if (!devices.length) return 0.5;
    const maxW = Math.max(...devices.map((d) => d.width));
    if (maxW <= 500) return 0.85;
    if (maxW <= 900) return 0.55;
    return 0.4;
  }, [density, mode, devices]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Header
        mode={mode}
        setMode={setMode}
        density={density}
        setDensity={setDensity}
        deviceCount={devices.length}
        url={url}
      />

      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-[1600px] px-8 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-7 lg:col-span-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="eyebrow mb-6"
              >
                viewport / 001
              </motion.p>
              <h1 className="display text-[clamp(3rem,8vw,7rem)] leading-[0.95] text-fg">
                <WordReveal text="Every screen." />
                <br />
                <span className="text-fg-muted italic">
                  <WordReveal text="At once." delay={0.3} />
                </span>
              </h1>
            </div>
            <div className="col-span-12 flex flex-col gap-4 md:col-span-5 lg:col-span-4 md:items-end md:justify-end md:text-right">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xs text-sm leading-relaxed text-fg-muted"
              >
                Paste a URL. Drop it through phone, tablet, and desktop bezels in the same breath.
                <br />
                Sites that block embedding fall back to a static screenshot.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="mono text-[10px] tracking-widest text-fg-dim uppercase"
              >
                — Don K. Don · 2026
              </motion.p>
            </div>
          </div>

          <div className="mt-12 md:mt-20">
            <UrlBar value={url} onSubmit={setUrl} />
          </div>

          <div className="mt-8">
            <DevicePicker selected={selectedIds} onChange={setDevices} />
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1600px] px-8 py-16">
          <div className="mb-10 flex items-baseline justify-between border-b border-line pb-4">
            <div className="flex items-baseline gap-4">
              <span className="eyebrow">previews</span>
              <span className="mono text-xs text-fg-muted">
                {devices.length.toString().padStart(2, "0")} / {selectedIds.length.toString().padStart(2, "0")} selected
              </span>
            </div>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mono truncate text-xs text-fg-muted hover:text-fg"
                title={url}
              >
                {url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
              </a>
            )}
          </div>

          {devices.length === 0 ? (
            <div className="mono py-32 text-center text-xs tracking-widest text-fg-dim uppercase">
              Select a device above.
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-x-12 gap-y-16">
              {devices.map((d, i) => (
                <DevicePreview key={d.id} device={d} url={url} scale={scale} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-line px-8 py-6">
        <div className="mx-auto flex w-full max-w-[1600px] items-baseline justify-between">
          <span className="mono text-[10px] tracking-widest text-fg-dim uppercase">
            viewport — {new Date().getFullYear()}
          </span>
          <a
            href="https://github.com/donovankdon/mobileviewer"
            target="_blank"
            rel="noreferrer"
            className="mono text-[10px] tracking-widest text-fg-dim uppercase hover:text-fg"
          >
            github ↗
          </a>
        </div>
      </footer>
    </div>
  );
}

function Header({
  mode,
  setMode,
  density,
  setDensity,
  deviceCount,
  url,
}: {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  density: Density;
  setDensity: (d: Density) => void;
  deviceCount: number;
  url: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-8">
        <a href="/" className="flex items-baseline gap-2">
          <span className="display text-base tracking-tight">viewport</span>
          <span className="mono text-[10px] text-fg-dim">v0.1</span>
        </a>
        <nav className="flex items-baseline gap-6">
          <span className="mono text-[10px] tracking-widest text-fg-dim uppercase">
            {deviceCount.toString().padStart(2, "0")} active
          </span>
          <Toggle
            value={mode}
            options={[
              { value: "compare", label: "compare" },
              { value: "single", label: "single" },
            ]}
            onChange={(v) => setMode(v as ViewMode)}
          />
          <Toggle
            value={density}
            options={[
              { value: "fit", label: "fit" },
              { value: "50", label: "50" },
              { value: "75", label: "75" },
              { value: "100", label: "100" },
            ]}
            onChange={(v) => setDensity(v as Density)}
          />
          <CopyLinkButton disabled={!url} />
        </nav>
      </div>
    </header>
  );
}

function Toggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-baseline gap-3">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`mono text-[11px] tracking-tight transition ${
            value === o.value ? "text-fg" : "text-fg-dim hover:text-fg-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
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
      className={`mono text-[11px] tracking-tight transition ${
        disabled ? "text-fg-dim opacity-40" : "text-fg-muted hover:text-fg"
      }`}
    >
      {copied ? "copied" : "copy link"}
    </button>
  );
}

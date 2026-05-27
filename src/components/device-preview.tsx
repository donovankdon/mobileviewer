"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DeviceFrame } from "./device-frame";
import type { Device } from "@/lib/devices";
import { microlinkScreenshotUrl } from "@/lib/url";

interface DevicePreviewProps {
  device: Device;
  url: string | null;
  scale: number;
  index?: number;
}

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "iframe" }
  | { kind: "screenshot"; reason?: string }
  | { kind: "error"; reason: string };

export function DevicePreview({ device, url, scale, index = 0 }: DevicePreviewProps) {
  const [state, setState] = useState<CheckState>({ kind: "idle" });

  useEffect(() => {
    if (!url) {
      setState({ kind: "idle" });
      return;
    }
    let cancelled = false;
    setState({ kind: "checking" });
    fetch(`/api/check?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data: { canIframe: boolean; reason?: string; error?: string }) => {
        if (cancelled) return;
        if (data.error) setState({ kind: "error", reason: data.error });
        else if (data.canIframe) setState({ kind: "iframe" });
        else setState({ kind: "screenshot", reason: data.reason });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error", reason: "Couldn't reach URL" });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 + index * 0.06 }}
      className="flex flex-col items-center gap-4"
    >
      <DeviceFrame device={device} scale={scale}>
        <PreviewContent device={device} url={url} state={state} />
      </DeviceFrame>
      <div className="text-center">
        <div className="text-sm tracking-tight text-fg">{device.name}</div>
        <div className="mono mt-0.5 text-[10px] text-fg-dim">
          {device.width} × {device.height}
          {state.kind === "screenshot" && <span className="ml-2">· static</span>}
        </div>
      </div>
    </motion.div>
  );
}

function PreviewContent({
  device,
  url,
  state,
}: {
  device: Device;
  url: string | null;
  state: CheckState;
}) {
  if (!url) return <EmptyState />;
  if (state.kind === "checking") return <CheckingState />;
  if (state.kind === "iframe") {
    return (
      <iframe
        src={url}
        title={`${device.name} preview`}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  if (state.kind === "screenshot") {
    const src = microlinkScreenshotUrl(url, { width: device.width, height: device.height });
    return (
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${device.name} screenshot`} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 text-center">
      <div className="mono text-[10px] tracking-widest text-neutral-400 uppercase">unreachable</div>
      <div className="mt-2 max-w-xs text-sm text-neutral-700">
        {state.kind === "error" ? state.reason : "Couldn't load"}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="mono text-[10px] tracking-widest text-neutral-300 uppercase">empty</div>
    </div>
  );
}

function CheckingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <motion.div
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="mono text-[10px] tracking-widest text-neutral-400 uppercase"
      >
        loading
      </motion.div>
    </div>
  );
}

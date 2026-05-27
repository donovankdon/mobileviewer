"use client";

import { useEffect, useState } from "react";
import { DeviceFrame } from "./device-frame";
import type { Device } from "@/lib/devices";
import { microlinkScreenshotUrl } from "@/lib/url";

interface DevicePreviewProps {
  device: Device;
  url: string | null;
  scale: number;
}

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "iframe" }
  | { kind: "screenshot"; reason?: string }
  | { kind: "error"; reason: string };

export function DevicePreview({ device, url, scale }: DevicePreviewProps) {
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
        if (data.error) {
          setState({ kind: "error", reason: data.error });
        } else if (data.canIframe) {
          setState({ kind: "iframe" });
        } else {
          setState({ kind: "screenshot", reason: data.reason });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error", reason: "Could not reach URL" });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-3">
      <DeviceFrame device={device} scale={scale}>
        <PreviewContent device={device} url={url} state={state} />
      </DeviceFrame>
      <div className="text-center">
        <div className="text-sm font-medium text-neutral-200">{device.name}</div>
        <div className="text-xs text-neutral-500">
          {device.width} × {device.height}
        </div>
      </div>
    </div>
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
        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white">
          Static preview (site blocks embedding)
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-50 p-4 text-center text-sm text-neutral-500">
      <div className="mb-2 text-lg">😕</div>
      <div>{state.kind === "error" ? state.reason : "Could not load"}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 text-neutral-400">
      <div className="text-center">
        <div className="mb-2 text-3xl">🌐</div>
        <div className="text-xs">Enter a URL above</div>
      </div>
    </div>
  );
}

function CheckingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
    </div>
  );
}

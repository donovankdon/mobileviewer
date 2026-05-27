"use client";

import type { Device } from "@/lib/devices";
import type { ReactNode } from "react";

interface DeviceFrameProps {
  device: Device;
  scale?: number;
  children?: ReactNode;
}

// Each frame renders the device chrome (bezel/notch/etc) and a content slot at
// the device's reported pixel dimensions. The wrapper is then scaled.
export function DeviceFrame({ device, scale = 1, children }: DeviceFrameProps) {
  const inner = (() => {
    switch (device.frame) {
      case "iphone-dynamic-island":
        return <IPhoneDynamicIslandFrame device={device}>{children}</IPhoneDynamicIslandFrame>;
      case "iphone-notch":
        return <IPhoneNotchFrame device={device}>{children}</IPhoneNotchFrame>;
      case "iphone-classic":
        return <IPhoneClassicFrame device={device}>{children}</IPhoneClassicFrame>;
      case "android":
        return <AndroidFrame device={device}>{children}</AndroidFrame>;
      case "tablet":
        return <TabletFrame device={device}>{children}</TabletFrame>;
      case "desktop":
        return <DesktopFrame device={device}>{children}</DesktopFrame>;
    }
  })();

  // Outer bounding box must reserve scaled space so layout doesn't overlap.
  const outerW = scaledOuterWidth(device, scale);
  const outerH = scaledOuterHeight(device, scale);

  return (
    <div style={{ width: outerW, height: outerH }} className="relative shrink-0">
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        {inner}
      </div>
    </div>
  );
}

// Frame chrome adds extra px around the device's content area.
const CHROME: Record<string, { x: number; y: number }> = {
  "iphone-dynamic-island": { x: 24, y: 24 },
  "iphone-notch": { x: 24, y: 24 },
  "iphone-classic": { x: 20, y: 100 },
  android: { x: 18, y: 18 },
  tablet: { x: 32, y: 32 },
  desktop: { x: 4, y: 32 },
};

function scaledOuterWidth(d: Device, scale: number) {
  return (d.width + CHROME[d.frame].x) * scale;
}
function scaledOuterHeight(d: Device, scale: number) {
  return (d.height + CHROME[d.frame].y) * scale;
}

// Shared chrome class — flat, minimal, no ring.
const CHROME_BG = "bg-[#181818]";
const SCREEN_BG = "bg-white";

function IPhoneDynamicIslandFrame({ device, children }: { device: Device; children: ReactNode }) {
  return (
    <div
      className={`relative rounded-[56px] ${CHROME_BG} p-3`}
      style={{ width: device.width + 24, height: device.height + 24 }}
    >
      <div className="absolute top-3.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black" style={{ width: 110, height: 32 }} />
      <div
        className={`relative overflow-hidden rounded-[44px] ${SCREEN_BG}`}
        style={{ width: device.width, height: device.height }}
      >
        {children}
      </div>
    </div>
  );
}

function IPhoneNotchFrame({ device, children }: { device: Device; children: ReactNode }) {
  return (
    <div
      className={`relative rounded-[52px] ${CHROME_BG} p-3`}
      style={{ width: device.width + 24, height: device.height + 24 }}
    >
      <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-b-2xl bg-black" style={{ width: 180, height: 28 }} />
      <div
        className={`relative overflow-hidden rounded-[40px] ${SCREEN_BG}`}
        style={{ width: device.width, height: device.height }}
      >
        {children}
      </div>
    </div>
  );
}

function IPhoneClassicFrame({ device, children }: { device: Device; children: ReactNode }) {
  return (
    <div
      className={`relative rounded-[44px] ${CHROME_BG} px-2.5 py-12`}
      style={{ width: device.width + 20, height: device.height + 100 }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#0e0e0e]" style={{ width: 56, height: 8 }} />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#222] ring-1 ring-[#2a2a2a]" style={{ width: 44, height: 44 }} />
      <div
        className={`relative overflow-hidden rounded-[6px] ${SCREEN_BG}`}
        style={{ width: device.width, height: device.height }}
      >
        {children}
      </div>
    </div>
  );
}

function AndroidFrame({ device, children }: { device: Device; children: ReactNode }) {
  return (
    <div
      className={`relative rounded-[44px] ${CHROME_BG} p-[9px]`}
      style={{ width: device.width + 18, height: device.height + 18 }}
    >
      <div className="absolute top-4 left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#0e0e0e]" />
      <div
        className={`relative overflow-hidden rounded-[36px] ${SCREEN_BG}`}
        style={{ width: device.width, height: device.height }}
      >
        {children}
      </div>
    </div>
  );
}

function TabletFrame({ device, children }: { device: Device; children: ReactNode }) {
  return (
    <div
      className={`relative rounded-[32px] ${CHROME_BG} p-4`}
      style={{ width: device.width + 32, height: device.height + 32 }}
    >
      <div
        className={`relative overflow-hidden rounded-[16px] ${SCREEN_BG}`}
        style={{ width: device.width, height: device.height }}
      >
        {children}
      </div>
    </div>
  );
}

function DesktopFrame({ device, children }: { device: Device; children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-[#222] bg-[#131313]"
      style={{ width: device.width + 4, height: device.height + 32 }}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-[#1f1f1f] px-3">
        <div className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
      </div>
      <div
        className={`relative ${SCREEN_BG}`}
        style={{ width: device.width, height: device.height, marginLeft: 2 }}
      >
        {children}
      </div>
    </div>
  );
}

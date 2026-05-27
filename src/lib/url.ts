export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withScheme);
    return u.toString();
  } catch {
    return null;
  }
}

interface ScreenshotOptions {
  fullPage?: boolean;
  // Override the device-pixel-ratio. Full-page screenshots at DPR=2 can balloon
  // past Anthropic's 5MB-per-image cap, so audits default to DPR=1.
  deviceScaleFactor?: number;
}

export function microlinkScreenshotUrl(
  url: string,
  viewport: { width: number; height: number },
  options: ScreenshotOptions = {},
): string {
  const dpr = options.deviceScaleFactor ?? 2;
  const params: Record<string, string> = {
    url,
    screenshot: "true",
    embed: "screenshot.url",
    "viewport.width": String(viewport.width),
    "viewport.height": String(viewport.height),
    "viewport.deviceScaleFactor": String(dpr),
    meta: "false",
    waitForTimeout: "1500",
  };
  if (options.fullPage) {
    params["screenshot.fullPage"] = "true";
    // Microlink: when fullPage is on, give the page extra time to lazy-load.
    params.waitForTimeout = "3000";
  }
  return `https://api.microlink.io/?${new URLSearchParams(params).toString()}`;
}

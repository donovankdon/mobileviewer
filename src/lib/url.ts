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

export function microlinkScreenshotUrl(
  url: string,
  viewport: { width: number; height: number },
): string {
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    embed: "screenshot.url",
    "viewport.width": String(viewport.width),
    "viewport.height": String(viewport.height),
    "viewport.deviceScaleFactor": "2",
    meta: "false",
    waitForTimeout: "1500",
  });
  return `https://api.microlink.io/?${params.toString()}`;
}

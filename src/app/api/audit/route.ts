import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { DEVICES_BY_ID } from "@/lib/devices";
import { AuditResultSchema } from "@/lib/audit";
import { microlinkScreenshotUrl, normalizeUrl } from "@/lib/url";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior product designer reviewing FULL-PAGE screenshots of a website rendered at multiple device viewports. Each image shows the entire scrollable page for one device (top to bottom). Identify visual and UX issues across the whole page — hero, mid-page sections, and footer.

Focus on issues clearly visible in the screenshots:
- Horizontal overflow / content bleeding past viewport edges
- Text truncation, overlap, or clipped lines
- Tap targets that look too small for fingers on mobile
- Layout breaks between breakpoints (hero collapses, columns mismatched, broken grids)
- Illegible font sizes
- Sticky/fixed elements covering content
- Off-screen or partially clipped CTAs
- Z-index conflicts (overlay covering everything)
- Missing or broken images
- Obvious color contrast problems (white text on light bg, etc.)
- Forms or footers that break at narrow widths

DO NOT report:
- Things that look intentional or just stylistic preferences
- Issues you can't actually see in the screenshot
- Generic advice ("consider adding…", "could be better")
- Performance, SEO, accessibility-by-DOM (no DOM access available)

CRITICAL — GROUPING:
If the same issue appears on multiple devices (e.g., the same logo overflows on both phones AND the tablet), report it ONCE with all affected devices listed in device_ids. Do NOT create a separate entry per device for the same issue. Only split into separate entries when the issue is meaningfully different per device (different element, different cause, or only appears at one breakpoint).

Be terse, specific, and confident. If the site looks fine across all devices, return an empty issues array — that's a valid answer.`;

interface AuditRequest {
  url: string;
  deviceIds: string[];
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it in Vercel env vars." },
      { status: 500 },
    );
  }

  let body: AuditRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(body.url ?? "");
  if (!normalizedUrl) {
    return Response.json({ error: "Invalid url" }, { status: 400 });
  }

  const devices = (body.deviceIds ?? [])
    .map((id) => DEVICES_BY_ID[id])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  if (devices.length === 0) {
    return Response.json({ error: "Pass at least one valid deviceId" }, { status: 400 });
  }
  if (devices.length > 6) {
    return Response.json({ error: "Max 6 devices per audit" }, { status: 400 });
  }

  const client = new Anthropic();

  // Fetch screenshots server-side and send as base64 — Anthropic respects
  // robots.txt for URL-mode images, which trips on Microlink's CDN.
  let screenshots: { device: (typeof devices)[number]; data: string; mediaType: string }[];
  try {
    screenshots = await Promise.all(
      devices.map(async (d) => {
        const shotUrl = microlinkScreenshotUrl(
          normalizedUrl,
          { width: d.width, height: d.height },
          // Full-page capture, DPR=1 to keep file size under Anthropic's 5MB/image cap.
          { fullPage: true, deviceScaleFactor: 1 },
        );
        const r = await fetch(shotUrl, { signal: AbortSignal.timeout(45000) });
        if (!r.ok) throw new Error(`Screenshot ${d.id} returned ${r.status}`);
        const mediaType = r.headers.get("content-type") ?? "image/jpeg";
        const buffer = Buffer.from(await r.arrayBuffer());
        return { device: d, data: buffer.toString("base64"), mediaType };
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown screenshot error";
    return Response.json({ error: `Screenshot capture failed: ${msg}` }, { status: 502 });
  }

  const userContent: Anthropic.ContentBlockParam[] = [
    {
      type: "text",
      text: `Audit this URL across ${devices.length} device viewports.\n\nURL: ${normalizedUrl}\n\nDevices (in screenshot order):\n${devices
        .map((d, i) => `${i + 1}. ${d.id} — ${d.name} (${d.width}×${d.height}, ${d.category})`)
        .join("\n")}\n\nIssues you report must reference the device by its id (e.g. "${devices[0].id}").`,
    },
    ...screenshots.map((s) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: s.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: s.data,
      },
    })),
  ];

  try {
    const response = await client.messages.parse({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output_config: { format: zodOutputFormat(AuditResultSchema) },
    });

    return Response.json(response.parsed_output, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Audit failed:", error);
    return Response.json({ error: `Audit failed: ${message}` }, { status: 502 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { DEVICES_BY_ID } from "@/lib/devices";
import { AuditResultSchema } from "@/lib/audit";
import { microlinkScreenshotUrl, normalizeUrl } from "@/lib/url";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior product designer reviewing screenshots of a website rendered at multiple device viewports. Identify visual and UX issues that would harm users.

Focus on issues that are clearly visible in the screenshot:
- Horizontal overflow / content bleeding past viewport edges
- Text truncation, overlap, or clipped lines
- Tap targets that look too small for fingers on mobile
- Layout breaks between breakpoints (hero collapses, columns mismatched)
- Illegible font sizes
- Sticky/fixed elements covering content
- Off-screen or partially clipped CTAs
- Z-index conflicts (overlay covering everything)
- Missing or broken images
- Obvious color contrast problems (white text on light bg, etc.)

DO NOT report:
- Things that look intentional or just stylistic preferences
- Issues you can't actually see in the screenshot
- Generic advice ("consider adding…", "could be better")
- Performance, SEO, accessibility-by-DOM (no DOM access available)

Be terse, specific, and confident. If the site looks fine on a device, don't invent issues. Empty issues array is a valid answer.`;

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

  const userContent: Anthropic.ContentBlockParam[] = [
    {
      type: "text",
      text: `Audit this URL across ${devices.length} device viewports.\n\nURL: ${normalizedUrl}\n\nDevices (in screenshot order):\n${devices
        .map((d, i) => `${i + 1}. ${d.id} — ${d.name} (${d.width}×${d.height}, ${d.category})`)
        .join("\n")}\n\nIssues you report must reference the device by its id (e.g. "${devices[0].id}").`,
    },
    ...devices.map((d) => ({
      type: "image" as const,
      source: {
        type: "url" as const,
        url: microlinkScreenshotUrl(normalizedUrl, { width: d.width, height: d.height }),
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

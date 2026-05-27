// Detect whether a target URL can be loaded inside a same-origin iframe.
// We check X-Frame-Options and CSP frame-ancestors. If either forbids embedding,
// the client should fall back to a screenshot.
export const dynamic = "force-dynamic";

interface CheckResult {
  url: string;
  canIframe: boolean;
  reason?: "x-frame-options" | "csp-frame-ancestors" | "fetch-error";
  status?: number;
}

async function probe(url: string): Promise<CheckResult> {
  let response: Response;
  try {
    // Some servers return different headers for HEAD vs GET, so we GET with no body read.
    response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 mobileviewer.io clone",
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { url, canIframe: false, reason: "fetch-error" };
  }

  // Drain so the connection can close; we only care about headers.
  try {
    await response.body?.cancel();
  } catch {
    // ignore
  }

  const xfo = response.headers.get("x-frame-options")?.toLowerCase() ?? "";
  if (xfo.includes("deny") || xfo.includes("sameorigin")) {
    return { url, canIframe: false, reason: "x-frame-options", status: response.status };
  }

  const csp = response.headers.get("content-security-policy") ?? "";
  const frameAncestors = /frame-ancestors\s+([^;]+)/i.exec(csp)?.[1]?.trim().toLowerCase() ?? "";
  if (frameAncestors) {
    if (frameAncestors === "'none'" || frameAncestors === "'self'") {
      return { url, canIframe: false, reason: "csp-frame-ancestors", status: response.status };
    }
    // Anything else (whitelisted hosts) — we can't iframe unless our origin is in the list.
    // Conservative: treat as blocked.
    if (!frameAncestors.includes("*")) {
      return { url, canIframe: false, reason: "csp-frame-ancestors", status: response.status };
    }
  }

  return { url, canIframe: true, status: response.status };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  if (!raw) {
    return Response.json({ error: "Missing 'url' query param" }, { status: 400 });
  }

  let normalized: string;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    normalized = u.toString();
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await probe(normalized);
  return Response.json(result, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}

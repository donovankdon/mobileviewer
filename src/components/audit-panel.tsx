"use client";

import { useState } from "react";
import { DEVICES_BY_ID } from "@/lib/devices";
import type { AuditResult, Issue, Severity, Category } from "@/lib/audit";

interface AuditPanelProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  deviceIds: string[];
}

type State =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "result"; result: AuditResult }
  | { kind: "error"; message: string };

export function AuditPanel({ open, onClose, url, deviceIds }: AuditPanelProps) {
  const [state, setState] = useState<State>({ kind: "idle" });

  const run = async () => {
    if (!url || deviceIds.length === 0) return;
    setState({ kind: "running" });
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, deviceIds: deviceIds.slice(0, 6) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? "Audit failed" });
        return;
      }
      setState({ kind: "result", result: data });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Network error",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l border-line bg-bg">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="eyebrow">audit</span>
          <span className="mono text-[10px] text-fg-dim">claude vision</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mono text-[11px] text-fg-dim hover:text-fg"
        >
          close
        </button>
      </header>

      <div className="flex flex-col gap-3 border-b border-line p-4">
        <div className="text-xs text-fg-muted">
          {url ? (
            <>
              Audit{" "}
              <span className="mono text-fg">
                {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </span>{" "}
              across{" "}
              <span className="mono text-fg">
                {deviceIds.length.toString().padStart(2, "0")}
              </span>{" "}
              viewport{deviceIds.length === 1 ? "" : "s"}.
            </>
          ) : (
            <span className="mono text-fg-dim">Load a URL first.</span>
          )}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={
            !url || deviceIds.length === 0 || state.kind === "running"
          }
          className="mono w-full rounded border border-fg-muted bg-bg-elevated px-3 py-2 text-xs text-fg transition hover:bg-fg hover:text-bg disabled:opacity-40 disabled:hover:bg-bg-elevated disabled:hover:text-fg"
        >
          {state.kind === "running" ? "auditing…" : "run audit →"}
        </button>
        {deviceIds.length > 6 && (
          <p className="mono text-[10px] text-fg-dim">
            (only first 6 devices audited)
          </p>
        )}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto p-4">
        {state.kind === "idle" && (
          <p className="mono mt-12 text-center text-[11px] tracking-widest text-fg-dim uppercase">
            run an audit
          </p>
        )}
        {state.kind === "running" && <RunningState />}
        {state.kind === "error" && (
          <div className="rounded border border-red-900/40 bg-red-950/20 p-3">
            <div className="mono text-[10px] tracking-widest text-red-400 uppercase">
              failed
            </div>
            <div className="mt-1 text-xs text-fg-muted">{state.message}</div>
          </div>
        )}
        {state.kind === "result" && <Results result={state.result} />}
      </div>
    </div>
  );
}

function RunningState() {
  return (
    <div className="flex flex-col gap-3 pt-8 text-center">
      <div className="mono animate-pulse text-[11px] tracking-widest text-fg-muted uppercase">
        capturing screenshots…
      </div>
      <div className="mono text-[10px] text-fg-dim">
        microlink → claude sonnet 4.6
      </div>
      <div className="mono mt-2 text-[10px] text-fg-dim">~10-20s</div>
    </div>
  );
}

function Results({ result }: { result: AuditResult }) {
  const grouped = new Map<string, Issue[]>();
  for (const issue of result.issues) {
    if (!grouped.has(issue.device_id)) grouped.set(issue.device_id, []);
    grouped.get(issue.device_id)!.push(issue);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-line pb-3">
        <div className="eyebrow mb-2">summary</div>
        <p className="text-xs leading-relaxed text-fg">{result.summary}</p>
      </div>

      {result.issues.length === 0 && (
        <div className="rounded border border-emerald-900/40 bg-emerald-950/20 p-3">
          <div className="mono text-[10px] tracking-widest text-emerald-400 uppercase">
            clean
          </div>
          <div className="mt-1 text-xs text-fg-muted">
            No visible issues across the audited devices.
          </div>
        </div>
      )}

      {Array.from(grouped.entries()).map(([deviceId, issues]) => {
        const device = DEVICES_BY_ID[deviceId];
        return (
          <div key={deviceId} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between border-b border-line pb-1.5">
              <div className="text-xs text-fg">
                {device?.name ?? deviceId}
              </div>
              <div className="mono text-[10px] text-fg-dim">
                {issues.length} issue{issues.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {issues.map((issue, i) => (
                <IssueRow key={i} issue={issue} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "text-red-300 border-red-900/40 bg-red-950/20",
  warning: "text-amber-300 border-amber-900/40 bg-amber-950/20",
  info: "text-fg-muted border-line-strong bg-bg-elevated",
};

const CATEGORY_LABEL: Record<Category, string> = {
  overflow: "overflow",
  text: "text",
  "tap-target": "tap target",
  layout: "layout",
  image: "image",
  contrast: "contrast",
  nav: "nav",
  other: "other",
};

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <div className={`rounded border p-2.5 ${SEVERITY_STYLES[issue.severity]}`}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="mono text-[9px] tracking-widest uppercase">
          {issue.severity} · {CATEGORY_LABEL[issue.category]}
        </span>
        <span className="mono text-[9px] text-fg-dim">{issue.area}</span>
      </div>
      <p className="text-xs leading-relaxed text-fg">{issue.description}</p>
      <p className="mt-1.5 border-t border-line-strong/50 pt-1.5 text-[11px] leading-relaxed text-fg-muted">
        → {issue.suggestion}
      </p>
    </div>
  );
}

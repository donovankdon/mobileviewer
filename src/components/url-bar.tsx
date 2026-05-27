"use client";

import { useEffect, useState, type FormEvent } from "react";
import { normalizeUrl } from "@/lib/url";

interface UrlBarProps {
  value: string | null;
  onSubmit: (url: string) => void;
}

export function UrlBar({ value, onSubmit }: UrlBarProps) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized = normalizeUrl(draft);
    if (!normalized) {
      setError("Not a valid URL");
      return;
    }
    setError(null);
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <label className="eyebrow">url</label>
      <input
        type="text"
        inputMode="url"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="example.com"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="mono w-full rounded border border-line-strong bg-bg-elevated px-2.5 py-2 text-xs text-fg placeholder:text-fg-dim focus:border-fg-muted focus:outline-none"
      />
      {error && <span className="mono text-[10px] text-red-400">{error}</span>}
    </form>
  );
}

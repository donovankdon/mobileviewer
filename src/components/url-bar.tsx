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
      setError("Enter a valid URL");
      return;
    }
    setError(null);
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://example.com"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none"
        />
        {error && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-400">{error}</div>
        )}
      </div>
      <button
        type="submit"
        className="h-11 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-neutral-900 hover:bg-emerald-300"
      >
        Preview
      </button>
    </form>
  );
}

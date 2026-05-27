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
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized = normalizeUrl(draft);
    if (!normalized) {
      setError("That doesn't look like a URL.");
      return;
    }
    setError(null);
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-baseline gap-3 border-b border-line-strong pb-3">
        <span className="eyebrow shrink-0">url</span>
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="example.com"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="mono flex-1 bg-transparent text-2xl tracking-tight text-fg outline-none placeholder:text-fg-dim md:text-3xl"
        />
        <button
          type="submit"
          className="mono shrink-0 text-xs uppercase tracking-widest text-fg-muted transition hover:text-fg"
        >
          {focused ? "press ↵" : "load →"}
        </button>
      </div>
      <div
        aria-hidden
        className={`absolute right-0 bottom-0 left-0 h-px origin-left bg-fg transition-transform duration-500 ${
          focused ? "scale-x-100" : "scale-x-0"
        }`}
      />
      {error && <div className="eyebrow mt-2 text-red-400">{error}</div>}
    </form>
  );
}

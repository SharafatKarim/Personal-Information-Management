"use client";

import { useEffect, useRef, useState } from "react";
import { Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_EMOJIS = [
  "📄", "🪪", "📋", "📜", "⚖️", "🏛️", "🗂️", "🔑",
  "🏥", "💊", "💉", "🩺", "🦷", "⚕️", "🧬", "🩹",
  "💰", "💳", "🏦", "📈", "💵", "📊", "🪙", "💼",
  "🏠", "🚗", "✈️", "🧳", "🗺️", "🛂", "🏖️", "🌍",
  "🎓", "📚", "🏫", "📖", "🧠", "🏅", "🎯", "📝",
  "👤", "❤️", "⭐", "🎂", "🎁", "📞", "📧", "📅",
];

export function EmojiPicker({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commit = (emoji: string | undefined) => {
    onChange(emoji && emoji.trim() ? emoji.trim() : undefined);
    setCustom("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={value ? "Change icon" : "Pick icon"}
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-input bg-background text-2xl shadow-sm transition-colors hover:bg-accent",
          !value && "text-muted-foreground",
        )}
      >
        {value ? (
          <span className="leading-none">{value}</span>
        ) : (
          <Smile className="h-5 w-5" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[300px] rounded-lg border border-border bg-popover p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pick an icon</span>
            {value && (
              <button
                type="button"
                onClick={() => commit(undefined)}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-8 gap-1">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => commit(e)}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded text-lg transition-colors hover:bg-accent",
                  value === e && "bg-accent ring-1 ring-foreground/20",
                )}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Or paste any emoji"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim()) {
                  e.preventDefault();
                  commit(custom);
                }
              }}
              maxLength={8}
              className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => custom.trim() && commit(custom)}
              disabled={!custom.trim()}
              className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

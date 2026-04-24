"use client";

import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import type { PimCard } from "@/lib/types";

export function PrintCardContent({
  card,
  className,
  showFooter = true,
}: {
  card: PimCard;
  className?: string;
  showFooter?: boolean;
}) {
  const updatedAt = card.updatedAt?.toDate?.();
  const isPdf = card.attachmentUrl?.toLowerCase().endsWith(".pdf");

  return (
    <article
      className={cn(
        "print-avoid-break mx-auto max-w-[800px] px-10 py-12 print:px-0 print:py-0",
        className,
      )}
    >
      <header className="mb-8 border-b-2 border-black pb-4">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="flex items-baseline gap-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            {card.icon && (
              <span className="text-3xl leading-none sm:text-4xl" aria-hidden>
                {card.icon}
              </span>
            )}
            <span>{card.title}</span>
          </h1>
          <div className="shrink-0 text-right text-[10px] uppercase tracking-widest text-gray-600">
            {card.category}
          </div>
        </div>
        {updatedAt && (
          <p className="mt-3 text-[11px] uppercase tracking-wider text-gray-500">
            Last updated {formatDateTime(updatedAt)}
          </p>
        )}
      </header>

      {card.fields.length === 0 ? (
        <p className="text-sm italic text-gray-600">No information recorded.</p>
      ) : (
        <dl className="grid grid-cols-[200px_1fr] gap-x-8 gap-y-0">
          {card.fields.map((f, idx) => (
            <div
              key={f.id}
              className="contents"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <dt
                className={cn(
                  "py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-600",
                  idx > 0 && "border-t border-gray-200",
                )}
              >
                {f.label || "—"}
              </dt>
              <dd
                className={cn(
                  "break-words py-3 font-serif text-base text-black",
                  idx > 0 && "border-t border-gray-200",
                )}
              >
                {f.value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {card.attachmentUrl && !isPdf && (
        <section className="mt-10 print-page-break">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            Attached Document
          </h2>
          <div className="relative w-full overflow-hidden rounded-sm border border-gray-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.attachmentUrl}
              alt="attachment"
              className="h-auto w-full object-contain"
            />
          </div>
        </section>
      )}

      {card.attachmentUrl && isPdf && (
        <section className="mt-10">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            Attached Document
          </h2>
          <p className="text-sm text-gray-700">
            A PDF document is attached — please view digitally:{" "}
            <span className="break-all font-mono text-xs">{card.attachmentUrl}</span>
          </p>
        </section>
      )}

      {showFooter && (
        <footer className="mt-16 border-t border-gray-200 pt-3 text-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
          Generated from your PIM vault
        </footer>
      )}
    </article>
  );
}

function useAutoPrint() {
  useEffect(() => {
    const id = setTimeout(() => {
      if (typeof window !== "undefined") window.print();
    }, 500);
    return () => clearTimeout(id);
  }, []);
}

function PrintToolbar({ backHref, title }: { backHref: string; title?: string }) {
  return (
    <div className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
      <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-700">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>
      {title && (
        <div className="min-w-0 flex-1 truncate text-center text-xs font-medium text-gray-600">
          {title}
        </div>
      )}
      <Button size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print
      </Button>
    </div>
  );
}

export function PrintView({ card }: { card: PimCard }) {
  useAutoPrint();

  return (
    <div className="min-h-[100dvh] bg-white text-black">
      <PrintToolbar backHref={`/cards/${card.id}`} />
      <PrintCardContent card={card} />
    </div>
  );
}

export function PrintAllView({ cards }: { cards: PimCard[] }) {
  useAutoPrint();

  if (cards.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-white text-black">
        <PrintToolbar backHref="/dashboard" />
        <div className="mx-auto max-w-[800px] px-10 py-16 text-center text-sm text-gray-600">
          No cards to print.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white text-black">
      <PrintToolbar
        backHref="/dashboard"
        title={`Printing ${cards.length} card${cards.length === 1 ? "" : "s"}`}
      />

      <div className="mx-auto max-w-[800px] px-10 pt-12 print:px-0 print:pt-0">
        <header className="mb-4 text-center">
          <h1 className="font-serif text-2xl font-normal tracking-tight">Personal Information Vault</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gray-500">
            {cards.length} card{cards.length === 1 ? "" : "s"} · {formatDateTime(new Date())}
          </p>
        </header>
      </div>

      {cards.map((card, idx) => (
        <div key={card.id} className={cn(idx > 0 && "print-page-break")}>
          <PrintCardContent card={card} showFooter={idx === cards.length - 1} />
        </div>
      ))}
    </div>
  );
}

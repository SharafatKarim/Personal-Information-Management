"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CardForm } from "@/components/card-form";

export default function CreateCardPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 md:pt-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          New card
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Title it, fill the fields that matter, and pin it if you use it often.
        </p>
      </header>

      <CardForm mode="create" />
    </div>
  );
}

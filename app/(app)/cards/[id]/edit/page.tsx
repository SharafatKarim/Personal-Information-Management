"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getCard } from "@/lib/cards";
import { CardForm } from "@/components/card-form";
import type { PimCard } from "@/lib/types";

export default function EditCardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const key = user && params?.id ? ["card", user.uid, params.id] : null;
  const { data, isLoading } = useSWR<PimCard | null>(key, () => getCard(user!.uid, params.id));

  useEffect(() => {
    if (!isLoading && data === null) {
      toast.error("Card not found");
      router.replace("/dashboard");
    }
  }, [isLoading, data, router]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[60dvh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 md:pt-6">
      <Link
        href={`/cards/${data.id}`}
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to card
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Edit card</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your fields. Drag to reorder.
        </p>
      </header>

      <CardForm mode="edit" card={data} />
    </div>
  );
}

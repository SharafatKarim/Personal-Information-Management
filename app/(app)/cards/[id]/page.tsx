"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import {
  ChevronLeft,
  FileText,
  Loader2,
  Pencil,
  Pin,
  PinOff,
  Printer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { deleteCard, getCard, togglePin } from "@/lib/cards";
import { formatDateTime } from "@/lib/utils";
import type { PimCard } from "@/lib/types";

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const key = user && params?.id ? ["card", user.uid, params.id] : null;
  const { data, isLoading, error } = useSWR<PimCard | null>(key, () =>
    getCard(user!.uid, params.id),
  );

  useEffect(() => {
    if (!isLoading && data === null) {
      toast.error("Card not found");
      router.replace("/dashboard");
    }
  }, [isLoading, data, router]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[60dvh] items-center justify-center text-muted-foreground">
        {error ? "Failed to load card" : <Loader2 className="h-5 w-5 animate-spin" />}
      </div>
    );
  }

  const card = data;
  const isPdf = card.attachmentUrl?.toLowerCase().endsWith(".pdf");
  const updatedAt = card.updatedAt?.toDate?.();

  const handleTogglePin = async () => {
    if (!user) return;
    try {
      await togglePin(user.uid, card.id, !card.isPinned);
      toast.success(card.isPinned ? "Unpinned" : "Pinned");
      mutate(key);
      mutate(["cards", user.uid]);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      setDeleting(true);
      await deleteCard(user.uid, card.id);
      toast.success("Card deleted");
      mutate(["cards", user.uid]);
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not delete");
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10 md:pt-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-medium">
              {card.category}
            </Badge>
            {card.isPinned && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                <Pin className="mr-1 h-3 w-3" /> Pinned
              </Badge>
            )}
          </div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {card.icon && (
              <span className="text-3xl leading-none sm:text-4xl" aria-hidden>
                {card.icon}
              </span>
            )}
            <span className="min-w-0 break-words">{card.title}</span>
          </h1>
          {updatedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Last updated {formatDateTime(updatedAt)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleTogglePin}>
            {card.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            {card.isPinned ? "Unpin" : "Pin"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cards/${card.id}/print`}>
              <Printer className="h-4 w-4" /> Print
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cards/${card.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {card.fields.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">This card has no fields yet.</p>
        ) : (
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-[minmax(180px,240px)_1fr]">
            {card.fields.map((f) => (
              <div
                key={f.id}
                className="contents [&>dt]:border-b [&>dt]:border-border/50 [&>dt]:pb-3 [&>dd]:border-b [&>dd]:border-border/50 [&>dd]:pb-3 last:[&>dt]:border-0 last:[&>dd]:border-0"
              >
                <dt className="text-sm font-medium text-muted-foreground">{f.label || "—"}</dt>
                <dd className="break-words text-sm text-foreground">{f.value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {card.attachmentUrl && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Attachment</h2>
          {isPdf ? (
            <a
              href={card.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">PDF document</div>
                <div className="text-xs text-muted-foreground">Click to open</div>
              </div>
            </a>
          ) : (
            <a
              href={card.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={card.attachmentUrl}
                  alt="attachment"
                  fill
                  sizes="(max-width: 768px) 100vw, 56rem"
                  className="object-contain"
                />
              </div>
            </a>
          )}
        </section>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this card?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The card and its fields will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

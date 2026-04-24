"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  GripVertical,
  Loader2,
  Pin,
  PinOff,
  Plus,
  Printer,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth-provider";
import { listCards, reorderCards, togglePin } from "@/lib/cards";
import { cn } from "@/lib/utils";
import type { PimCard } from "@/lib/types";

function categoryTint(category: string): string {
  const palette: Record<string, string> = {
    Personal: "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-400 dark:border-sky-500/20",
    Legal: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/20",
    Medical: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400 dark:border-rose-500/20",
    Financial: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/20",
    Work: "bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-400 dark:border-violet-500/20",
    Education: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30 dark:text-indigo-400 dark:border-indigo-500/20",
    Travel: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:text-cyan-400 dark:border-cyan-500/20",
    Other: "bg-muted text-muted-foreground border-border",
  };
  return palette[category] ?? palette.Other;
}

function sortGroup(cards: PimCard[]): PimCard[] {
  return [...cards].sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    const at = a.updatedAt?.toMillis?.() ?? 0;
    const bt = b.updatedAt?.toMillis?.() ?? 0;
    return bt - at;
  });
}

interface TileProps {
  card: PimCard;
  draggable: boolean;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

function CardTileInner({
  card,
  draggable,
  dragListeners,
  dragAttributes,
  isDragging,
  onClick,
  onTogglePin,
}: TileProps & {
  dragListeners?: Record<string, any>;
  dragAttributes?: Record<string, any>;
  isDragging?: boolean;
}) {
  const preview = card.fields.slice(0, 3);
  const tint = categoryTint(card.category);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex h-[18rem] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200",
        draggable && "pl-9",
        !isDragging && "hover:-translate-y-0.5 hover:shadow-md",
        isDragging && "ring-2 ring-foreground/30",
      )}
    >
      {draggable && (
        <button
          type="button"
          {...dragListeners}
          {...dragAttributes}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
          className="absolute left-1.5 top-1/2 z-10 inline-flex h-7 w-6 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/60 opacity-70 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {card.icon ? (
              <span className="text-2xl leading-none" aria-hidden>
                {card.icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-base font-semibold leading-tight">
                  {card.title}
                </span>
                {card.isPinned && (
                  <Pin className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
                )}
              </div>
              <Badge variant="outline" className={`${tint} mt-1 text-[10px] font-medium`}>
                {card.category}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={onTogglePin}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={card.isPinned ? "Unpin" : "Pin"}
          >
            {card.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        {preview.length > 0 ? (
          preview.map((f) => (
            <div
              key={f.id}
              className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-1 last:border-0 last:pb-0"
            >
              <span className="truncate text-muted-foreground">{f.label || "—"}</span>
              <span className="truncate font-medium text-foreground">{f.value || "—"}</span>
            </div>
          ))
        ) : (
          <div className="italic text-muted-foreground">No fields yet</div>
        )}
        {card.fields.length > 3 && (
          <div className="pt-1 text-[11px] text-muted-foreground">
            +{card.fields.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

function SortableCardTile(props: TileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.card.id,
    disabled: !props.draggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isDragging ? 0.25 : 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <CardTileInner
        {...props}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const swrKey = user ? ["cards", user.uid] : null;
  const { data: cards, isLoading } = useSWR<PimCard[]>(swrKey, () => listCards(user!.uid));

  const { pinned, unpinned, filteredFlat } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = cards ?? [];
    const filtered = !q
      ? list
      : list.filter((c) => {
          if (c.title.toLowerCase().includes(q)) return true;
          if (c.category.toLowerCase().includes(q)) return true;
          if (c.icon && c.icon.includes(q)) return true;
          return c.fields.some(
            (f) => f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q),
          );
        });

    if (q) {
      return { pinned: [], unpinned: [], filteredFlat: sortGroup(filtered) };
    }
    return {
      pinned: sortGroup(filtered.filter((c) => c.isPinned)),
      unpinned: sortGroup(filtered.filter((c) => !c.isPinned)),
      filteredFlat: null as PimCard[] | null,
    };
  }, [cards, search]);

  const canReorder = !search.trim();
  const activeCard = activeId ? (cards ?? []).find((c) => c.id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = async (e: DragEndEvent, group: "pinned" | "unpinned") => {
    setActiveId(null);
    const { active, over } = e;
    if (!user || !over || active.id === over.id) return;

    const list = group === "pinned" ? pinned : unpinned;
    const oldIndex = list.findIndex((c) => c.id === active.id);
    const newIndex = list.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(list, oldIndex, newIndex);
    const nextIds = next.map((c) => c.id);

    // Optimistic update: rewrite orders locally before the roundtrip.
    await mutate(
      swrKey,
      (current?: PimCard[]) => {
        if (!current) return current;
        const byId = new Map(current.map((c) => [c.id, c]));
        next.forEach((c, idx) => {
          const existing = byId.get(c.id);
          if (existing) byId.set(c.id, { ...existing, order: idx });
        });
        return Array.from(byId.values());
      },
      { revalidate: false },
    );

    try {
      await reorderCards(user.uid, nextIds);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save new order");
      mutate(swrKey);
    }
  };

  const handleTogglePin = async (card: PimCard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await togglePin(user.uid, card.id, !card.isPinned);
      toast.success(card.isPinned ? "Unpinned" : "Pinned to top");
      mutate(swrKey);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update pin");
    }
  };

  const gridClass =
    "grid w-full auto-rows-[18rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:pt-6">
      <header className="mb-8 flex flex-col gap-4 pl-12 sm:flex-row sm:items-end sm:justify-between md:pl-0">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cards
              ? `${cards.length} card${cards.length === 1 ? "" : "s"}${
                  canReorder ? " · drag to reorder" : " · clear search to reorder"
                }`
              : "Loading…"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards…"
              className="h-10 pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {cards && cards.length > 0 && (
            <Button asChild variant="outline">
              <Link href="/cards/print-all">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print all</span>
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/create">
              <Plus className="h-4 w-4" /> New
            </Link>
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : cards && cards.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No cards yet"
          description="Create your first card to start building your personal information vault."
          actionLabel="Create a card"
          actionHref="/create"
        />
      ) : filteredFlat ? (
        filteredFlat.length === 0 ? (
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            title="No matches"
            description={`Nothing matches "${search}". Try a different query.`}
          />
        ) : (
          <div className={gridClass}>
            <AnimatePresence mode="popLayout">
              {filteredFlat.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardTileInner
                    card={c}
                    draggable={false}
                    onClick={() => router.push(`/cards/${c.id}`)}
                    onTogglePin={(e) => handleTogglePin(c, e)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={(e) => handleDragEnd(e, "pinned")}
              onDragCancel={() => setActiveId(null)}
            >
              <div className="flex items-center gap-2">
                <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pinned
                </span>
              </div>
              <SortableContext items={pinned.map((c) => c.id)} strategy={rectSortingStrategy}>
                <div className={gridClass}>
                  <AnimatePresence mode="popLayout">
                    {pinned.map((c) => (
                      <SortableCardTile
                        key={c.id}
                        card={c}
                        draggable={canReorder}
                        onClick={() => router.push(`/cards/${c.id}`)}
                        onTogglePin={(e) => handleTogglePin(c, e)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}

          {unpinned.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={(e) => handleDragEnd(e, "unpinned")}
              onDragCancel={() => setActiveId(null)}
            >
              {pinned.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    All cards
                  </span>
                </div>
              )}
              <SortableContext items={unpinned.map((c) => c.id)} strategy={rectSortingStrategy}>
                <div className={gridClass}>
                  <AnimatePresence mode="popLayout">
                    {unpinned.map((c) => (
                      <SortableCardTile
                        key={c.id}
                        card={c}
                        draggable={canReorder}
                        onClick={() => router.push(`/cards/${c.id}`)}
                        onTogglePin={(e) => handleTogglePin(c, e)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
                {activeCard ? (
                  <div className="rotate-2 scale-[1.02] opacity-95 shadow-2xl">
                    <CardTileInner
                      card={activeCard}
                      draggable={false}
                      onClick={() => {}}
                      onTogglePin={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="no-print fixed bottom-6 right-6 sm:hidden"
        data-fab
      >
        <Button asChild size="lg" className="h-14 w-14 rounded-full p-0 shadow-xl">
          <Link href="/create" aria-label="Create card">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

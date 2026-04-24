"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { GripVertical, Loader2, Pin, PinOff, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttachmentUploader } from "@/components/attachment-uploader";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { CATEGORIES, type PimCard } from "@/lib/types";
import { createCard, updateCard } from "@/lib/cards";
import { useAuth } from "@/components/auth-provider";
import { randomId } from "@/lib/utils";

interface CardFormValues {
  title: string;
  category: string;
  isPinned: boolean;
  icon?: string;
  attachmentUrl?: string;
  fields: { id: string; label: string; value: string }[];
}

function SortableFieldRow({
  fieldId,
  index,
  onRemove,
  register,
}: {
  fieldId: string;
  index: number;
  onRemove: () => void;
  register: ReturnType<typeof useForm<CardFormValues>>["register"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: fieldId,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="group flex items-start gap-2 rounded-lg border border-border bg-background p-2"
    >
      <button
        type="button"
        className="mt-1.5 cursor-grab touch-none rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Input
          placeholder="Label e.g. Policy Number"
          {...register(`fields.${index}.label` as const)}
        />
        <Input placeholder="Value" {...register(`fields.${index}.value` as const)} />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-0.5 text-muted-foreground hover:text-destructive"
        aria-label="Remove field"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export function CardForm({ mode, card }: { mode: "create" | "edit"; card?: PimCard }) {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: CardFormValues = card
    ? {
        title: card.title,
        category: card.category || "Personal",
        isPinned: card.isPinned,
        icon: card.icon,
        attachmentUrl: card.attachmentUrl,
        fields:
          card.fields.length > 0
            ? card.fields.map((f) => ({ id: f.id || randomId(), label: f.label, value: f.value }))
            : [{ id: randomId(), label: "", value: "" }],
      }
    : {
        title: "",
        category: "Personal",
        isPinned: false,
        icon: undefined,
        attachmentUrl: undefined,
        fields: [
          { id: randomId(), label: "", value: "" },
          { id: randomId(), label: "", value: "" },
        ],
      };

  const { register, handleSubmit, control, watch, setValue } = useForm<CardFormValues>({
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "fields",
    keyName: "_rhfId",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    move(oldIndex, newIndex);
  };

  const onSubmit = async (data: CardFormValues) => {
    if (!user) return;
    if (!data.title.trim()) {
      toast.error("Give your card a title");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: data.title.trim(),
        category: data.category,
        isPinned: data.isPinned,
        icon: data.icon,
        attachmentUrl: data.attachmentUrl,
        fields: data.fields
          .filter((f) => f.label.trim() || f.value.trim())
          .map((f) => ({
            id: f.id || randomId(),
            label: f.label.trim(),
            value: f.value.trim(),
          })),
      };

      if (mode === "create") {
        const id = await createCard(user.uid, payload);
        toast.success("Card saved successfully");
        router.replace(`/cards/${id}`);
      } else if (card) {
        await updateCard(user.uid, card.id, payload);
        toast.success("Changes saved");
        router.replace(`/cards/${card.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save card");
    } finally {
      setSubmitting(false);
    }
  };

  const isPinned = watch("isPinned");
  const attachmentUrl = watch("attachmentUrl");
  const icon = watch("icon");

  const itemIds = fields.map((f) => f.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <div className="flex items-start gap-2">
            <EmojiPicker
              value={icon}
              onChange={(v) => setValue("icon", v, { shouldDirty: true })}
            />
            <Input
              id="title"
              placeholder="e.g. Health Insurance"
              className="h-11 text-base"
              {...register("title")}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Category</Label>
          <Select
            defaultValue={defaultValues.category}
            onValueChange={(v) => setValue("category", v, { shouldDirty: true })}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Fields</Label>
          <span className="text-xs text-muted-foreground">Drag to reorder</span>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {fields.map((f, idx) => (
                  <SortableFieldRow
                    key={f.id}
                    fieldId={f.id}
                    index={idx}
                    onRemove={() => remove(idx)}
                    register={register}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ id: randomId(), label: "", value: "" })}
          className="mt-1 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add field
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Document scan</Label>
        <AttachmentUploader
          value={attachmentUrl}
          onChange={(url) => setValue("attachmentUrl", url, { shouldDirty: true })}
        />
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-2 border-t border-border bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button
          type="button"
          variant={isPinned ? "secondary" : "outline"}
          onClick={() => setValue("isPinned", !isPinned, { shouldDirty: true })}
        >
          {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          {isPinned ? "Pinned" : "Pin to top"}
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "create" ? "Save card" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAttachment } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface AttachmentUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function AttachmentUploader({ value, onChange, className }: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const isPdf = value?.toLowerCase().endsWith(".pdf");

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const url = await uploadAttachment(file);
      onChange(url);
      toast.success("Attachment uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value ? (
        <div className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-3">
          {isPdf ? (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image src={value} alt="attachment" fill sizes="80px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {isPdf ? "PDF document" : "Image attached"}
            </div>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Open original
            </a>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => onChange(undefined)}
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/30"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload document or image
            </>
          )}
        </button>
      )}
    </div>
  );
}

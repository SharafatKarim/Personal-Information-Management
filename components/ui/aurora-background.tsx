"use client";

import { cn } from "@/lib/utils";

export function AuroraBackground({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-40" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 animate-aurora-shift rounded-full bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-sky-500/20 blur-3xl" />
        </div>
      </div>
      {children}
    </div>
  );
}

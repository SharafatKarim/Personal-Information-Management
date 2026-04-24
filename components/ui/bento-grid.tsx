"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[18rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  header,
  title,
  description,
  icon,
  footer,
  onClick,
  index = 0,
}: {
  className?: string;
  header?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  index?: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "group/bento relative row-span-1 flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/bento:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), hsl(var(--accent) / 0.25), transparent 40%)",
        }}
      />

      <div className="flex min-h-0 flex-col gap-3">
        {header}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            {title && (
              <div className="truncate text-base font-semibold leading-tight text-foreground">
                {title}
              </div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
          {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}
        </div>
      </div>

      {footer && <div className="mt-3">{footer}</div>}
    </motion.div>
  );
}

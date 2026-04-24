"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutGrid,
  Plus,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Moon,
  Sun,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { href: "/dashboard", label: "Dashboard", description: "All your cards", icon: LayoutGrid },
  { href: "/create", label: "New card", description: "Capture something new", icon: Plus },
];

function ThemeToggle({ compact }: { compact: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        compact && "justify-center px-2",
      )}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        {mounted ? (
          isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )
        ) : (
          <span className="h-4 w-4" />
        )}
      </span>
      {!compact && (
        <span className="flex min-w-0 flex-col text-left leading-tight">
          <span className="text-sm">{mounted && isDark ? "Dark mode" : "Light mode"}</span>
          <span className="truncate text-[11px] text-muted-foreground/70">
            Tap to switch theme
          </span>
        </span>
      )}
    </button>
  );
}

interface NavBodyProps {
  compact: boolean;
  onDesktopToggleCollapse?: () => void;
  onMobileClose?: () => void;
  onLinkNavigate?: () => void;
}

function NavBody({ compact, onDesktopToggleCollapse, onMobileClose, onLinkNavigate }: NavBodyProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between border-b border-border px-3 py-4",
          compact && "px-2",
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          {!compact && (
            <span className="text-sm font-semibold tracking-tight">PIM</span>
          )}
        </Link>

        {onDesktopToggleCollapse && (
          <button
            type="button"
            onClick={onDesktopToggleCollapse}
            className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
          >
            {compact ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                compact && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!compact && (
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-sm">{item.label}</span>
                  <span className="truncate text-[11px] text-muted-foreground/70">
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-2">
        <ThemeToggle compact={compact} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent",
                compact && "justify-center",
              )}
            >
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted">
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt="" fill sizes="28px" className="object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs font-medium text-muted-foreground">
                    {user?.displayName?.[0] ?? "?"}
                  </div>
                )}
              </div>
              {!compact && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">
                    {user?.displayName ?? "Account"}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{user?.email}</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="truncate text-xs font-medium">{user?.displayName}</div>
              <div className="truncate text-[11px] font-normal text-muted-foreground">
                {user?.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopWidth = collapsed ? "w-[68px]" : "w-[232px]";

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="no-print fixed left-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <aside
        className={cn(
          "no-print sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-r border-border bg-background/60 backdrop-blur md:flex",
          desktopWidth,
          "transition-[width] duration-200 ease-out",
        )}
      >
        <NavBody
          compact={collapsed}
          onDesktopToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-print fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="absolute left-0 top-0 flex h-full w-[260px] flex-col border-r border-border bg-background"
            >
              <NavBody
                compact={false}
                onMobileClose={() => setMobileOpen(false)}
                onLinkNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

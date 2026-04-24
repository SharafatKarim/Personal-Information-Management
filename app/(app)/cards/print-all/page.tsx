"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { listCards } from "@/lib/cards";
import { PrintAllView } from "@/components/print-view";
import type { PimCard } from "@/lib/types";

export default function PrintAllCardsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const key = user ? ["cards", user.uid] : null;
  const { data, isLoading } = useSWR<PimCard[]>(key, () => listCards(user!.uid));

  useEffect(() => {
    if (!isLoading && data && data.length === 0) {
      toast.info("You have no cards to print");
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

  const sorted = [...data].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const at = a.updatedAt?.toMillis?.() ?? 0;
    const bt = b.updatedAt?.toMillis?.() ?? 0;
    return bt - at;
  });

  return <PrintAllView cards={sorted} />;
}

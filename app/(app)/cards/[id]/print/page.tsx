"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getCard } from "@/lib/cards";
import { PrintView } from "@/components/print-view";
import type { PimCard } from "@/lib/types";

export default function PrintCardPage() {
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

  return <PrintView card={data} />;
}

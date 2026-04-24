"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSignIn = async () => {
    try {
      setBusy(true);
      await signInWithGoogle();
      toast.success("Welcome back");
      router.replace("/dashboard");
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(err?.message ?? "Sign in failed");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-sm rounded-2xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with Google to access your cards.
          </p>
        </div>

        <Button
          onClick={handleSignIn}
          disabled={busy || loading}
          className="h-11 w-full"
          variant="outline"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.45c-.24 1.37-1.63 4.02-5.45 4.02-3.28 0-5.95-2.72-5.95-6.07 0-3.35 2.67-6.07 5.95-6.07 1.87 0 3.12.8 3.84 1.48l2.62-2.53C16.86 3.4 14.64 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12S6.76 21.5 12 21.5c6.93 0 9.57-4.87 9.57-7.42 0-.5-.05-.88-.13-1.26H12z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to keep your data private.
        </p>
      </motion.div>
    </AuroraBackground>
  );
}

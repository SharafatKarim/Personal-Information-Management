"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Pin, Printer, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <AuroraBackground>
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3 w-3" /> Minimal, print-perfect PIM
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
        >
          The details that matter,{" "}
          <span className="font-serif italic text-muted-foreground">kept quiet.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          A personal information vault for your IDs, prescriptions, policies, passports — anything
          worth remembering. Fast to capture. Beautiful to print.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/login">
              Get started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6">
            <Link href="#features">See features</Link>
          </Button>
        </motion.div>

        <motion.div
          id="features"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-24 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              icon: FileText,
              title: "Any shape of data",
              body: "Unlimited key-value fields per card. Drag to reorder.",
            },
            {
              icon: Search,
              title: "Instant search",
              body: "Filters across titles and every field value in real-time.",
            },
            {
              icon: Pin,
              title: "Pin what matters",
              body: "Keep your most-used cards at the top of the grid.",
            },
            {
              icon: Printer,
              title: "Print-perfect",
              body: "One click to a formal, paper-ready document.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur transition-colors hover:bg-card/80"
            >
              <Icon className="mb-3 h-5 w-5 text-foreground" />
              <div className="text-sm font-semibold">{title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{body}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </AuroraBackground>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookMarked,
  GitMerge,
  ChevronRight,
  Check,
  X,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

const ONBOARDING_KEY = "terrivio_onboarded";

// ─── Steps config ────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "generator",
    icon: Sparkles,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
    title: "Generate prompts that actually work",
    desc: "Choose your role, industry, and outcome. Terrivio builds multi-strategy prompts tailored to your exact context — not generic templates.",
    cta: "Try the Generator",
    ctaTo: "/generator",
    freeNote: "Free: 3 strategies. Pro: all 6.",
  },
  {
    id: "save",
    icon: BookMarked,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    title: "Save & build your personal library",
    desc: "Every great prompt is an asset. Save up to 5 prompts free, or go Pro for an unlimited library with analytics and performance tracking.",
    cta: "View My Library",
    ctaTo: "/saved",
    freeNote: "Free: 5 saves. Pro: unlimited.",
  },
  {
    id: "pipeline",
    icon: GitMerge,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/20",
    title: "Scale with the Pipeline Builder",
    desc: "Upload a CSV of 100+ leads, pick a workflow, and generate a full personalised email sequence for every row — exported in seconds.",
    cta: "Open Pipeline",
    ctaTo: "/pipeline",
    freeNote: "Pro feature. Start with a free preview.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-primary to-sky-500" />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 pb-6">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-8 bg-primary"
                    : i < step
                    ? "w-4 bg-primary/40"
                    : "w-4 bg-border"
                )}
              />
            ))}
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border ring-4",
                  current.bg,
                  current.color,
                  "border-transparent",
                  current.ring
                )}
              >
                <Icon className="w-7 h-7" />
              </div>

              {/* Title + desc */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {current.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {current.desc}
                </p>
              </div>

              {/* Free/Pro note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border/50 rounded-lg px-3 py-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {current.freeNote}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center gap-3">
          {/* CTA */}
          <Button asChild className="flex-1 font-bold gap-2 shadow-lg shadow-primary/20" onClick={dismiss}>
            <Link to={current.ctaTo}>
              {current.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {isLast ? (
            <Button
              variant="outline"
              onClick={dismiss}
              className="gap-2 font-medium"
            >
              <Check className="w-4 h-4 text-emerald-500" />
              Done
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s + 1)}
              className="gap-2 font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Step feature list for current step */}
        <div className="border-t border-border bg-muted/20 px-8 py-4">
          <div className="flex items-center gap-6">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex items-center gap-2 text-xs font-medium transition-all",
                    i === step
                      ? s.color + " opacity-100"
                      : "text-muted-foreground opacity-60 hover:opacity-80"
                  )}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  {i === 0 ? "Generate" : i === 1 ? "Save" : "Pipeline"}
                </button>
              );
            })}
            <button
              onClick={dismiss}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useOnboarding(isAuthenticated: boolean) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Small delay so the page settles before modal appears
    const timer = setTimeout(() => {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setShow(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShow(false);
  };

  return { show, dismiss };
}

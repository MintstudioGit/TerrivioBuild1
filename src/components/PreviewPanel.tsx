/**
 * PreviewPanel — AI Output Preview (Phase 2.5)
 *
 * Slides in from the right when the user clicks "Preview Output" on a generated prompt.
 * Shows:
 *  - Model selector (free → gpt-4o-mini; Pro → gpt-4o / gpt-4-turbo)
 *  - Live AI-generated output
 *  - Quality score + conversion likelihood
 *  - Strength/weakness signals
 *  - Actionable improvement suggestions
 *  - Actions: Regenerate · Save · Send to Pipeline
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  X, Zap, RefreshCw, Copy, Save, Layers, CheckCircle2,
  AlertCircle, Lightbulb, TrendingUp, ChevronRight, Loader2,
  Sparkles, Lock, FlaskConical,
} from "lucide-react";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";
import { analytics, EVENTS } from "../utils/analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PreviewResult {
  output: string;
  model_used: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  conversion_likelihood: "Low" | "Medium" | "High";
  suggestions: string[];
  quota_remaining: number | null;
  is_pro: boolean;
}

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  promptApproach?: string;
  /** Called when the user clicks "Send to Pipeline" */
  onSendToPipeline?: (prompt: string) => void;
  /** Called when the user saves the prompt */
  onSave?: (prompt: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color =
    score >= 75 ? "#22c55e" : score >= 52 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function ConversionBadge({ likelihood }: { likelihood: "Low" | "Medium" | "High" }) {
  const map = {
    High:   { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", label: "High" },
    Medium: { cls: "bg-amber-500/10 text-amber-600 border-amber-500/30",       label: "Medium" },
    Low:    { cls: "bg-red-500/10 text-red-500 border-red-500/30",             label: "Low" },
  };
  const { cls, label } = map[likelihood];
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", cls)}>
      {label} conversion
    </span>
  );
}

const MODEL_OPTIONS = [
  { id: "gpt-4o-mini",  label: "GPT-4o Mini",  desc: "Fast · Free",       pro: false },
  { id: "gpt-4o",       label: "GPT-4o",        desc: "Best quality · Pro", pro: true  },
  { id: "gpt-4-turbo",  label: "GPT-4 Turbo",   desc: "128k context · Pro", pro: true  },
];

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function PreviewPanel({
  isOpen,
  onClose,
  prompt,
  promptApproach,
  onSendToPipeline,
  onSave,
}: PreviewPanelProps) {
  const { session, userState } = useDesignContext();
  const isPro = userState === "pro";

  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runPreview = useCallback(async (model: string) => {
    if (!session?.access_token) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/preview-prompt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, model }),
        }
      );

      const data = await res.json();

      if (res.status === 429) {
        toast.error("Preview rate limit reached. Try again shortly.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "AI generation failed. Please try again.");
        return;
      }

      setResult(data as PreviewResult);

      analytics.track(EVENTS.PREVIEW_RUN, {
        model,
        score: data.score,
        conversion_likelihood: data.conversion_likelihood,
        approach: promptApproach,
        is_pro: isPro,
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [session, prompt, promptApproach, isPro]);

  const handleModelChange = (id: string) => {
    if (!isPro && MODEL_OPTIONS.find(m => m.id === id)?.pro) return;
    setSelectedModel(id);
  };

  const handleCopy = () => {
    if (!result?.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    analytics.track(EVENTS.PREVIEW_OUTPUT_COPIED);
  };

  const handleSave = () => {
    if (result?.output && onSave) {
      onSave(result.output);
      analytics.track(EVENTS.PREVIEW_SAVED);
    }
  };

  const handlePipeline = () => {
    if (onSendToPipeline) {
      onSendToPipeline(prompt);
      toast.success("Prompt added to Pipeline");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (semi-transparent so the generator remains visible) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-[90] w-full max-w-[540px] bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base leading-tight">Preview Output</h2>
                  {promptApproach && (
                    <p className="text-xs text-muted-foreground">{promptApproach}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">

                {/* Model selector */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Model
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {MODEL_OPTIONS.map((m) => {
                      const locked = !isPro && m.pro;
                      const active = selectedModel === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleModelChange(m.id)}
                          disabled={locked}
                          className={cn(
                            "relative px-3 py-2.5 rounded-xl border text-left transition-all",
                            active
                              ? "bg-primary/10 border-primary text-primary"
                              : locked
                              ? "bg-muted/30 border-border text-muted-foreground/50 cursor-not-allowed"
                              : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          <p className="text-xs font-bold">{m.label}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">{m.desc}</p>
                          {locked && (
                            <Lock className="w-3 h-3 absolute top-1.5 right-1.5 text-muted-foreground/40" />
                          )}
                          {active && !locked && (
                            <CheckCircle2 className="w-3 h-3 absolute top-1.5 right-1.5 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!isPro && (
                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <Link to="/pricing" className="text-amber-600 hover:underline font-medium">
                        Upgrade to Pro
                      </Link>
                      <span>to unlock GPT-4o and GPT-4 Turbo</span>
                    </p>
                  )}
                </div>

                {/* Prompt preview (collapsible) */}
                <div className="bg-muted/20 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Your Prompt
                  </p>
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-words leading-relaxed line-clamp-6 font-sans">
                    {prompt}
                  </pre>
                </div>

                {/* Run button */}
                {!result && !isLoading && (
                  <Button
                    size="lg"
                    className="w-full font-bold h-12 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                    onClick={() => runPreview(selectedModel)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Run AI Preview
                  </Button>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Generating output…</span>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-4 bg-muted/50 rounded animate-pulse"
                          style={{ width: `${100 - i * 7}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {[60, 75, 45].map((w, i) => (
                        <div key={i} className="h-10 bg-muted/40 rounded-xl animate-pulse" style={{ width: `${w}px` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Generation failed</p>
                      <p className="opacity-80 text-xs mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                {/* ── RESULT ── */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* Score block */}
                    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-5">
                      <ScoreRing score={result.score} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">Quality Score</span>
                          <ConversionBadge likelihood={result.conversion_likelihood} />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Model: <span className="font-medium text-foreground">{result.model_used}</span>
                          {result.quota_remaining !== null && (
                            <> · <span className="text-amber-600 font-medium">{result.quota_remaining} previews left today</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Signals grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Strengths */}
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                            Strengths
                          </p>
                        </div>
                        {result.strengths.length > 0 ? (
                          <ul className="space-y-1.5">
                            {result.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">None detected</p>
                        )}
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                            Weaknesses
                          </p>
                        </div>
                        {result.weaknesses.length > 0 ? (
                          <ul className="space-y-1.5">
                            {result.weaknesses.map((w, i) => (
                              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">None detected</p>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {result.suggestions.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Lightbulb className="w-3.5 h-3.5 text-primary" />
                          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                            Improvement Suggestions
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {result.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <ChevronRight className="w-3 h-3 text-primary/60 mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Output */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Output
                      </p>
                      <div className="bg-muted/20 border border-border rounded-xl p-4 relative group">
                        <pre className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed font-sans">
                          {result.output}
                        </pre>
                        <button
                          onClick={handleCopy}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-lg px-2 py-1 text-[11px] font-medium hover:bg-muted flex items-center gap-1"
                        >
                          {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── Action footer ── */}
            <div className="shrink-0 border-t border-border bg-card/60 px-6 py-4 space-y-3">
              {result && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 font-semibold gap-1.5 h-9"
                    onClick={() => runPreview(selectedModel)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 font-semibold gap-1.5 h-9"
                    onClick={handleSave}
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 font-semibold gap-1.5 h-9"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              )}
              <Button
                size="sm"
                className="w-full font-bold gap-2 h-9 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 transition-all"
                onClick={handlePipeline}
              >
                <Layers className="w-3.5 h-3.5" />
                Use as Step in Workflow
                <TrendingUp className="w-3 h-3 ml-auto opacity-60" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

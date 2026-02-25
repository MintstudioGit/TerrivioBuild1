import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Layers, Search, Globe, Loader2, CheckCircle2, Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import { useDesignContext } from "../DesignController";
import {
  CategoryType,
  generateWorkflowSequence,
  WORKFLOW_PACKS,
  VARIANT_TEMPLATES,
  cleanText,
  generateCOSTARPrompt,
  generateContextualPrompt,
} from "../prompt-engine";
import { generateWithQualityGate } from "../prompt-quality-gate";
import { scrapeWebsiteContext } from "../../utils/website-scraper";
import { ActionLockModal } from "./ActionLockModal";
import { VARIANT_TYPE_MAP } from "./generator-constants";

interface PackBuilderViewProps {
  onBack: () => void;
}

export function PackBuilderView({ onBack: _onBack }: PackBuilderViewProps) {
  const [searchParams] = useSearchParams();
  const initialPackId = searchParams.get("pack");

  const { userState } = useDesignContext();
  const isPro = userState === "pro";

  const [selectedPackId, setSelectedPackId] = useState<string>(initialPackId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "All">("All");

  const selectedTemplate = WORKFLOW_PACKS.find((p) => p.id === selectedPackId);

  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<{
    step: any;
    prompt: string;
    variants?: any[];
    totalVariants?: number;
  }[] | null>(null);
  const [showLock, setShowLock] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number[]>>({});

  // Context scraping for pack
  const [packYourUrl, setPackYourUrl] = useState("");
  const [packLeadUrl, setPackLeadUrl] = useState("");
  const [packYourContext, setPackYourContext] = useState("");
  const [packLeadContext, setPackLeadContext] = useState("");
  const [packScrapingYour, setPackScrapingYour] = useState(false);
  const [packScrapingLead, setPackScrapingLead] = useState(false);
  const [packYourStatus, setPackYourStatus] = useState<"idle" | "ok" | "error">("idle");
  const [packLeadStatus, setPackLeadStatus] = useState<"idle" | "ok" | "error">("idle");
  const [packUseCOSTAR, setPackUseCOSTAR] = useState(false);

  const scrapePackUrl = async (url: string, type: "your" | "lead") => {
    if (!url.trim()) return;
    type === "your" ? setPackScrapingYour(true) : setPackScrapingLead(true);
    try {
      const result = await scrapeWebsiteContext(url);
      if (type === "your") {
        setPackYourContext(result.summary);
        setPackYourStatus("ok");
      } else {
        setPackLeadContext(result.summary);
        setPackLeadStatus("ok");
      }
    } catch {
      type === "your" ? setPackYourStatus("error") : setPackLeadStatus("error");
    } finally {
      type === "your" ? setPackScrapingYour(false) : setPackScrapingLead(false);
    }
  };

  const previewContent = useMemo(() => {
    if (!selectedTemplate || generatedPack) return null;
    const step1 = selectedTemplate.steps[0];
    const previewResult = generateWithQualityGate({
      useCase: step1.useCase,
      outcome: step1.outcome,
      role: step1.role,
      industry: selectedTemplate.industry,
      category: selectedTemplate.category,
      signal: step1.signal,
    });
    return previewResult.prompt;
  }, [selectedTemplate, generatedPack]);

  useEffect(() => {
    if (!generatedPack && selectedTemplate) {
      const defaults: Record<number, number[]> = {};
      selectedTemplate.steps.forEach((_, idx) => {
        defaults[idx] = [0];
      });
      setSelectedVariants(defaults);
    } else if (generatedPack) {
      const defaults: Record<number, number[]> = {};
      generatedPack.forEach((_, idx) => {
        defaults[idx] = [0];
      });
      setSelectedVariants(defaults);
    }
  }, [generatedPack, selectedTemplate]);

  const toggleVariant = (stepIdx: number, variantIdx: number) => {
    setSelectedVariants((prev) => {
      const current = prev[stepIdx] || [];
      if (current.includes(variantIdx)) {
        return { ...prev, [stepIdx]: current.filter((v) => v !== variantIdx) };
      } else {
        return { ...prev, [stepIdx]: [...current, variantIdx].sort((a, b) => a - b) };
      }
    });
  };

  const handleBulkSelect = (variantIndex: number | "ALL") => {
    const count = generatedPack
      ? generatedPack.length
      : selectedTemplate?.steps.length || 0;
    const newSelection: Record<number, number[]> = {};
    for (let i = 0; i < count; i++) {
      newSelection[i] =
        variantIndex === "ALL" ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [variantIndex as number];
    }
    setSelectedVariants(newSelection);
  };

  const filteredPacks = useMemo(() => {
    return WORKFLOW_PACKS.filter((pack) => {
      const matchesSearch =
        pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || pack.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleGeneratePack = () => {
    if (!selectedPackId || !selectedTemplate) return;
    if (!isPro) {
      setShowLock(true);
      return;
    }

    setIsGeneratingPack(true);
    setTimeout(() => {
      const contextSnippet = [packYourContext, packLeadContext]
        .filter(Boolean)
        .join(" | ")
        .slice(0, 400);
      const results = generateWorkflowSequence(selectedPackId, {
        variationMode: "consistent",
        variantNum: 0,
      });
      setGeneratedPack(
        results.map((res) => {
          let prompt = res.prompt;
          if (packUseCOSTAR) {
            prompt = generateCOSTARPrompt({
              useCase: res.stepName,
              outcome: selectedTemplate.primaryGoal,
              role: res.role,
              industry: selectedTemplate.industry,
              signal: res.signal,
              context: contextSnippet || undefined,
            });
          } else if (contextSnippet) {
            prompt = generateContextualPrompt(res.prompt, {
              websiteContext: packLeadContext || undefined,
              yourOffer: packYourContext || undefined,
              industry: selectedTemplate.industry,
            });
          }
          return {
            step: { name: res.stepName, role: res.role, signal: res.signal },
            prompt,
            variants: res.variants,
            totalVariants: res.totalVariants,
          };
        })
      );
      setIsGeneratingPack(false);
      const modeLabel = packUseCOSTAR
        ? " (CO-STAR mode)"
        : contextSnippet
        ? " (with context)"
        : "";
      toast.success("Workflow Sequence Generated", {
        description: `${results.length} interconnected prompts${modeLabel}.`,
        duration: 4000,
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto pb-20"
    >
      <ActionLockModal
        isOpen={showLock}
        onClose={() => setShowLock(false)}
        action="Build Prompt Packs"
      />

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedPackId && (
            <>
              <span className="text-border">/</span>
              <span className="font-semibold">{selectedTemplate?.name}</span>
            </>
          )}
        </div>
      </div>

      {!selectedPackId ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Workflow Library</h2>
              <p className="text-muted-foreground">
                Select from {WORKFLOW_PACKS.length} professional templates.
              </p>
            </div>
            <div className="relative flex-1 md:w-64 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-9 bg-card border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
            {(["All", "Sales", "Marketing", "Development", "Content", "Design", "General"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPacks.map((pack) => (
              <Link
                key={pack.id}
                to={`/packs/${pack.id}`}
                className="group relative flex flex-col p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden text-left"
              >
                {pack.isRecommended && (
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-primary/20">
                    Recommended
                  </div>
                )}
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                    {pack.name}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {pack.industry}
                  </p>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{pack.primaryGoal}</p>
                  <div className="flex items-center gap-1 mt-auto pt-2">
                    {pack.steps.slice(0, 5).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          i < 2 ? "bg-primary/40" : "bg-border/40"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in-95 duration-200">
          {/* Left sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                      {selectedTemplate?.industry}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {selectedTemplate?.category}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight">{selectedTemplate?.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-primary/20 pl-4">
                  {selectedTemplate?.primaryGoal}
                </p>
              </div>

              <div className="h-px bg-border/50" />

              {/* How it works */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  How it works
                </h4>
                <ul className="text-sm text-muted-foreground space-y-3 pl-1">
                  {[
                    "Review the blueprint steps on the right.",
                    "Select specific variants for each step to customize the tone and approach.",
                    "Click Generate to build your full workflow sequence.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: step.replace("variants", "<strong>variants</strong>") }} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Context Scraping */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Context Scraping
                </h4>
                {(
                  [
                    { label: "Your website", url: packYourUrl, setUrl: setPackYourUrl, status: packYourStatus, setStatus: setPackYourStatus, scraping: packScrapingYour, context: packYourContext, type: "your" as const, dot: "bg-primary/60" },
                    { label: "Lead website", url: packLeadUrl, setUrl: setPackLeadUrl, status: packLeadStatus, setStatus: setPackLeadStatus, scraping: packScrapingLead, context: packLeadContext, type: "lead" as const, dot: "bg-amber-500/70" },
                  ] as const
                ).map(({ label, url, setUrl, status, setStatus, scraping, context, type, dot }) => (
                  <div key={type} className="space-y-1.5">
                    <label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", dot)} /> {label}
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setStatus("idle"); }}
                        onBlur={() => scrapePackUrl(url, type)}
                        placeholder={type === "your" ? "yourproduct.com" : "prospect.com"}
                        className="h-8 text-xs flex-1 min-w-0"
                      />
                      <button
                        onClick={() => scrapePackUrl(url, type)}
                        disabled={scraping || !url.trim()}
                        className={cn(
                          "h-8 w-8 rounded-md border flex items-center justify-center transition-all shrink-0",
                          status === "ok"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
                            : status === "error"
                            ? "border-red-400/50 text-red-500"
                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {scraping ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : status === "ok" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Search className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {context && (
                      <p className="text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1 line-clamp-1">
                        {context.slice(0, 100)}…
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* CO-STAR toggle */}
              <div
                onClick={() => setPackUseCOSTAR((p) => !p)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none",
                  packUseCOSTAR
                    ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-muted/20 hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                    packUseCOSTAR ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">CO-STAR Mode</p>
                  <p className="text-[10px] text-muted-foreground">Structured outputs with constraints</p>
                </div>
                <div
                  className={cn(
                    "w-8 h-4 rounded-full border transition-all",
                    packUseCOSTAR ? "bg-primary border-primary" : "bg-muted border-border"
                  )}
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full bg-white m-0.5 transition-all",
                      packUseCOSTAR ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </div>

              {/* Generate button */}
              <div className="pt-2">
                <Button
                  onClick={handleGeneratePack}
                  disabled={isGeneratingPack}
                  className="w-full h-14 text-base font-bold shadow-xl shadow-primary/10 relative overflow-hidden group"
                >
                  {isGeneratingPack ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Building Sequence...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                      Generate Sequence <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
                  Generates {selectedTemplate?.steps.length} interconnected prompts. Select multiple
                  variants to explore different working styles and strategies.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Blueprint */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm sticky top-24 z-20 backdrop-blur-md bg-card/90">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold">Blueprint Configuration</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBulkSelect("ALL")}
                    className="text-xs h-8 hover:bg-primary/10 hover:text-primary"
                  >
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleBulkSelect(0)} className="text-xs h-8">
                    Reset
                  </Button>
                </div>
              </div>

              <div className="relative pl-8 pb-10">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
                <div className="space-y-8">
                  {selectedTemplate?.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center z-10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="h-8 px-3 text-sm bg-card border-primary/30 text-foreground font-semibold shadow-sm"
                          >
                            {step.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                            {step.role}
                          </span>
                        </div>

                        <div className="bg-card/50 rounded-xl border border-border/60 p-5 hover:border-primary/20 transition-colors">
                          <div className="flex flex-wrap gap-2">
                            {VARIANT_TEMPLATES.map((tmpl, vIdx) => {
                              const isSelected = (selectedVariants[idx] || []).includes(vIdx);
                              return (
                                <div
                                  key={vIdx}
                                  onClick={() => toggleVariant(idx, vIdx)}
                                  className={cn(
                                    "cursor-pointer text-[11px] px-3 py-1.5 rounded-full border transition-all select-none font-medium flex items-center gap-1.5",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                                      : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-muted/30"
                                  )}
                                >
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                  )}
                                  {tmpl.approach}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {generatedPack && generatedPack[idx] ? (
                          <div className="mt-4 space-y-4">
                            {(selectedVariants[idx] && selectedVariants[idx].length > 0
                              ? selectedVariants[idx]
                              : [0]
                            )
                              .sort((a, b) => a - b)
                              .map((variantId) => (
                                <div
                                  key={variantId}
                                  className="p-4 bg-muted/20 rounded-lg border border-border/50 text-sm font-mono whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 relative overflow-hidden"
                                >
                                  <div className="absolute top-2 right-2 opacity-50 flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] bg-background/50 backdrop-blur-sm border-border/50"
                                    >
                                      {VARIANT_TEMPLATES[variantId]?.approach || "Default"} Mode
                                    </Badge>
                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                      Generated
                                    </Badge>
                                  </div>
                                  {generatedPack[idx].variants && generatedPack[idx].variants[variantId]
                                    ? cleanText(generatedPack[idx].variants[variantId].content)
                                    : generatedPack[idx].prompt}
                                </div>
                              ))}
                          </div>
                        ) : (
                          idx === 0 &&
                          previewContent &&
                          !isGeneratingPack && (
                            <div className="mt-4 relative group">
                              <div className="p-4 bg-muted/5 rounded-lg border border-border/40 text-sm font-mono whitespace-pre-wrap text-foreground/70 h-auto overflow-hidden">
                                {previewContent}
                              </div>
                              <div className="absolute top-2 right-2">
                                <div className="bg-background/80 border border-primary/20 shadow-sm px-2 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1.5 backdrop-blur-md">
                                  <Sparkles className="w-3 h-3" />
                                  Preview
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// silence unused import warning — VARIANT_TYPE_MAP is consumed by PackBuilderView callers
export { VARIANT_TYPE_MAP };

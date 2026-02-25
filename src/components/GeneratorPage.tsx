import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner@2.0.3";
import { useDesignContext } from "./DesignController";
import { 
  Lock, ArrowRight, Copy, Terminal, Wand2, Sparkles, Zap, Target, Layers, 
  Briefcase, CheckCircle2, Package, Play, Download, Save, BarChart3, 
  Search, Filter, ArrowLeft, Grid, List as ListIcon, FileText, ChevronDown, ChevronRight,
  Minimize2, RefreshCw, SlidersHorizontal, LayoutTemplate, AlertTriangle, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  SignalType, 
  CategoryType, 
  FrameworkType,
  AngleType,
  generateWorkflowSequence, 
  WORKFLOW_PACKS, 
  deriveCategory,
  WorkflowPack,
  VARIANT_TEMPLATES,
  cleanText,
  generateCOSTARPrompt,
  generateFrameworkPrompt,
  inferBestAngle
} from "./prompt-engine";
import { generateWithQualityGate } from "./prompt-quality-gate";
import { OfferExtractorComponent, type ExtractedOffer } from "./OfferExtractorComponent";
import { PreviewPanel } from "./PreviewPanel";
import { scrapeWebsiteContext, type StructuredContext } from "../utils/website-scraper";
import { scoreContext, scoreColour, scoreBadgeClass } from "../utils/context-scorer";
import { scoreOutput, outputScoreEmoji, outputScoreBadgeClass, type OutputScoreResult } from "../utils/output-scorer";
import { improveContext } from "../utils/context-improver";
import { runEnrichmentWaterfall, extractDomain, type WaterfallOptions } from "../utils/enrichment-waterfall";
import type { EnrichmentResult } from "../utils/enrichment-types";
import { VARIANT_TYPE_MAP } from "./generator/generator-constants";

// --- COMPONENTS ---

// Shows the auto-enrich pipeline steps + current status inline below a scrape field
function ScrapePhaseCard({ phase }: { phase: string }) {
  const isActive  = phase.includes("...");
  const isWarning = phase.includes("sign in");
  const isDone    = !isActive && !isWarning;

  // Derive step states from phase string
  const step1Done = true; // scrape always ran first
  const step2Active = phase.includes("LLM repair") || phase.includes("repair...");
  const step2Done   = phase.includes("Improved") || phase.includes("Still weak") || phase.includes("repair skipped") || phase.includes("enrichment signals");
  const step2Skip   = phase.includes("repair skipped");
  const step3Active = phase.includes("LinkedIn") || phase.includes("external signals");
  const step3Done   = phase.includes("enrichment signals injected");

  const borderClass = isWarning
    ? "border-amber-500/40 bg-amber-500/5"
    : isDone
    ? "border-emerald-500/30 bg-emerald-500/5"
    : "border-primary/20 bg-primary/5";

  type StepState = "pending" | "active" | "done" | "skip";

  function StepIcon({ state }: { state: StepState }) {
    if (state === "active") return (
      <span className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </span>
    );
    if (state === "done") return (
      <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
    if (state === "skip") return (
      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-[8px] text-muted-foreground font-bold">—</span>
      </span>
    );
    return <span className="w-4 h-4 rounded-full border-2 border-border shrink-0" />;
  }

  const steps: { label: string; sub: string; state: StepState }[] = [
    {
      label: "Website scrape",
      sub: step1Done ? "Extracted raw page text" : "Reading page...",
      state: step1Done ? "done" : "active",
    },
    {
      label: "LLM context repair",
      sub: step2Skip
        ? "Skipped — moving to external sources"
        : step2Done
        ? "Fields rewritten from raw text"
        : step2Active
        ? "Rewriting fields using raw text..."
        : "Runs if score < 60",
      state: step2Skip ? "skip" : step2Done ? "done" : step2Active ? "active" : "pending",
    },
    {
      label: "Deep enrich (LinkedIn + Tech)",
      sub: step3Done
        ? "Signals injected into prompt"
        : step3Active
        ? "Fetching LinkedIn company + tech stack..."
        : "Runs if score still < 60 after repair",
      state: step3Done ? "done" : step3Active ? "active" : "pending",
    },
  ];

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${borderClass}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        {isWarning && <span className="text-amber-500 text-[10px]">⚠️</span>}
        {isDone && !isWarning && <span className="text-emerald-500 text-[10px]">✓</span>}
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Context Intelligence Pipeline
        </span>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="mt-0.5">
              <StepIcon state={step.state} />
            </div>
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold leading-tight ${
                step.state === "active" ? "text-primary" :
                step.state === "done" ? "text-foreground" :
                "text-muted-foreground"
              }`}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{step.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Final status line */}
      <p className={`text-[10px] font-medium pt-1 border-t ${
        isWarning ? "border-amber-500/20 text-amber-600" :
        isDone ? "border-emerald-500/20 text-emerald-600" :
        "border-primary/10 text-primary"
      }`}>
        {phase}
      </p>
    </div>
  );
}

function ActionLockModal({ isOpen, onClose, action, description }: { isOpen: boolean, onClose: () => void, action: string, description?: string }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock className="w-6 h-6" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">Unlock {action}</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            {description || <>Saved prompts become reusable systems. <br/> Upgrade to Pro to {action.toLowerCase()}.</>}
          </p>
          
          <div className="space-y-3">
            <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
            <p className="text-[10px] text-muted-foreground">
              €9 for your first 30 days. Cancel anytime.
            </p>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
              Maybe later
            </Button>
          </div>
        </div>
        
        <div className="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
           <Zap className="w-3 h-3 text-amber-500" />
           <span>Pro users save ~4 hours per week.</span>
        </div>
      </motion.div>
    </div>
  );
}

// --- CONSTANTS ---

const USE_CASE_OPTIONS = [
  { category: "Development", items: ["React Component", "TypeScript Function", "API Endpoint", "SQL Query", "Unit Test", "Python Script"] },
  { category: "Content", items: ["Blog Post Outline", "SEO Article", "Social Media Caption", "Email Newsletter", "Product Description"] },
  { category: "Marketing", items: ["Ad Copy", "Landing Page Headline", "Value Proposition", "Meta Description"] },
  { category: "Sales", items: ["Cold Email", "Follow-up Email", "LinkedIn Outreach", "Sales Script", "Objection Handling"] },
  { category: "Design", items: ["UI Component Specs", "User Persona", "User Journey Map", "Design System Tokens"] }
];

const ROLES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["Frontend Engineer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "QA Automation Engineer"],
  Content: ["Content Strategist", "SEO Specialist", "Technical Writer", "Social Media Manager", "Ghostwriter"],
  Marketing: ["Growth Marketer", "Digital Marketing Manager", "Copywriter", "Brand Strategist", "PPC Specialist"],
  Sales: ["Sales Development Rep (SDR)", "Account Executive", "Sales Manager", "Business Development Manager"],
  Design: ["Product Designer", "UI/UX Designer", "Design Systems Lead", "Brand Designer"],
  General: ["Project Manager", "Product Owner", "Business Analyst", "Executive Assistant"]
};

const OUTCOMES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["Ensure Type Safety", "Optimize Performance", "Improve Readability", "Clarify Complex Logic", "Modularize Code", "Reduce Technical Debt"],
  Content: ["Educate Audience", "Improve SEO Ranking", "Drive Engagement", "Increase Viral Potential", "Simplify Complex Topic"],
  Marketing: ["Increase Conversion", "Generate Leads", "Drive Click-Throughs", "Build Brand Awareness", "Target Specific Persona"],
  Sales: ["Book More Meetings", "Overcome Objections", "Build Rapport", "Close the Deal", "Re-engage Cold Leads"],
  Design: ["Improve User Experience", "Ensure Consistency", "Enhance Accessibility", "Modernize Visuals", "Streamline User Flow"],
  General: ["Save Time", "Improve Clarity", "Organize Information", "Solve Specific Problem", "Automate Workflow"]
};

const INDUSTRIES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["SaaS", "FinTech", "HealthTech", "E-commerce", "Web3/Blockchain", "EdTech", "Cybersecurity"],
  Marketing: ["B2B SaaS", "D2C Brands", "Digital Agency", "E-commerce", "Media & Publishing"],
  Sales: ["B2B Technology", "Enterprise Software", "Real Estate", "Financial Services", "Consulting"],
  Content: ["Lifestyle", "Technology", "Finance", "Health & Wellness", "Education"],
  Design: ["Tech Startups", "Creative Agency", "Fashion & Retail", "Consumer Apps"],
  General: ["Technology", "Healthcare", "Finance", "Retail", "Education", "Manufacturing"]
};

const FRAMEWORK_OPTIONS: FrameworkType[] = ["RISEN", "RTF", "APE", "RACE"];

// --- PACK BUILDER VIEW (Re-implemented for context) ---

function PackBuilderView({ onBack }: { onBack: () => void }) {
  const [searchParams] = useSearchParams();
  const initialPackId = searchParams.get("pack");

  const { userState, session } = useDesignContext();
  const navigate = useNavigate();
  const isPro = userState === 'pro';
  
  const [selectedPackId, setSelectedPackId] = useState<string>(initialPackId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "All">("All");

  const selectedTemplate = WORKFLOW_PACKS.find(p => p.id === selectedPackId);

  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<{ 
    step: any, 
    prompt: string,
    variants?: any[],
    totalVariants?: number
  }[] | null>(null);
  const [showLock, setShowLock] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number[]>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [previewApproach, setPreviewApproach] = useState<string | undefined>(undefined);

  // --- PREVIEW / TEASER LOGIC ---
  // We want to show a "Sample" of the first step to prove quality
  // But we don't want to run the full generator engine unless they click generate.
  // We'll create a static preview for the first step of the selected template.
  const previewContent = useMemo(() => {
    if (!selectedTemplate || generatedPack) return null;
    
    // Generate a single "preview" prompt for Step 1
    const step1 = selectedTemplate.steps[0];
    const previewResult = generateWithQualityGate({
        useCase: step1.useCase, 
        outcome: step1.outcome, 
        role: step1.role, 
        industry: selectedTemplate.industry, 
        category: selectedTemplate.category, 
        signal: step1.signal
    });
    return previewResult.prompt;
  }, [selectedTemplate, generatedPack]);

  useEffect(() => {
    if (!generatedPack && selectedTemplate) {
        const defaults: Record<number, number[]> = {};
        selectedTemplate.steps.forEach((_, idx) => { defaults[idx] = [0]; });
        setSelectedVariants(defaults);
    } else if (generatedPack) {
      const defaults: Record<number, number[]> = {};
      generatedPack.forEach((_, idx) => { defaults[idx] = [0]; });
      setSelectedVariants(defaults);
    }
  }, [generatedPack, selectedTemplate]);

  const toggleVariant = (stepIdx: number, variantIdx: number) => {
    setSelectedVariants(prev => {
        const current = prev[stepIdx] || [];
        if (current.includes(variantIdx)) {
            return { ...prev, [stepIdx]: current.filter(v => v !== variantIdx) };
        } else {
            return { ...prev, [stepIdx]: [...current, variantIdx].sort((a,b) => a-b) };
        }
    });
  };

  const handleBulkSelect = (variantIndex: number | "ALL") => {
     const count = generatedPack ? generatedPack.length : (selectedTemplate?.steps.length || 0);
     const newSelection: Record<number, number[]> = {};
     for (let i = 0; i < count; i++) {
         if (variantIndex === "ALL") {
             newSelection[i] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
         } else {
             newSelection[i] = [variantIndex];
         }
     }
     setSelectedVariants(newSelection);
  };
  
  const filteredPacks = useMemo(() => {
    return WORKFLOW_PACKS.filter(pack => {
      const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pack.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || pack.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleGeneratePack = () => {
    if (!selectedPackId || !selectedTemplate) return;
    if (!isPro) { setShowLock(true); return; }

    setIsGeneratingPack(true);
    setTimeout(() => {
      const results = generateWorkflowSequence(selectedPackId);
      setGeneratedPack(results.map(res => ({
        step: { name: res.stepName, role: res.role, signal: res.signal },
        prompt: res.prompt,
        variants: res.variants,
        totalVariants: res.totalVariants
      })));
      setIsGeneratingPack(false);
      toast.success("Workflow Sequence Generated", {
        description: `Successfully created ${results.length} interconnected prompts.`,
        duration: 4000,
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  const openPreview = (prompt: string, approach?: string) => {
    setPreviewPrompt(prompt);
    setPreviewApproach(approach);
    setPreviewOpen(true);
  };

  const sendToPipeline = (prompt: string) => {
    localStorage.setItem("pipeline_seed_prompt", prompt);
    navigate("/pipeline");
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto pb-20">
      <ActionLockModal isOpen={showLock} onClose={() => setShowLock(false)} action="Build Prompt Packs" />

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
                <p className="text-muted-foreground">Select from {WORKFLOW_PACKS.length} professional templates.</p>
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
              {(["All", "Sales", "Marketing", "Development", "Content", "Design", "General"] as const).map(cat => (
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
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPacks.map(pack => (
                <Link 
                  key={pack.id}
                  to={`/packs/${pack.id}`}
                  className="group relative flex flex-col p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden text-left"
                >
                   {pack.isRecommended && (
                     <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-primary/20">Recommended</div>
                   )}
                   <div className="mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{pack.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{pack.industry}</p>
                   </div>
                   <div className="flex-1 space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{pack.primaryGoal}</p>
                      <div className="flex items-center gap-1 mt-auto pt-2">
                        {pack.steps.slice(0, 5).map((_, i) => (
                          <div key={i} className={cn("h-1 flex-1 rounded-full", i < 2 ? "bg-primary/40" : "bg-border/40")} />
                        ))}
                      </div>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in-95 duration-200">
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
                
                {/* Header */}
                <div className="space-y-4">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <Layers className="w-6 h-6" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{selectedTemplate?.industry}</Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{selectedTemplate?.category}</Badge>
                      </div>
                      <h3 className="text-2xl font-bold leading-tight">{selectedTemplate?.name}</h3>
                   </div>
                   <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-primary/20 pl-4">
                      {selectedTemplate?.primaryGoal}
                   </p>
                </div>

                <div className="h-px bg-border/50" />

                {/* Context/Instructions */}
                <div className="space-y-4">
                   <h4 className="text-sm font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      How it works
                   </h4>
                   <ul className="text-sm text-muted-foreground space-y-3 pl-1">
                      <li className="flex gap-3">
                         <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">1</span>
                         <span>Review the blueprint steps on the right.</span>
                      </li>
                      <li className="flex gap-3">
                         <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">2</span>
                         <span>Select specific <strong>variants</strong> for each step to customize the tone and approach.</span>
                      </li>
                      <li className="flex gap-3">
                         <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">3</span>
                         <span>Click Generate to build your full workflow sequence.</span>
                      </li>
                   </ul>
                </div>

                {/* Action */}
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
                      Generates {selectedTemplate?.steps.length} interconnected prompts. Select multiple variants to explore different working styles and strategies.
                   </p>
                </div>
             </div>
          </div>

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
                      <Button variant="ghost" size="sm" onClick={() => handleBulkSelect("ALL")} className="text-xs h-8 hover:bg-primary/10 hover:text-primary">Select All</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBulkSelect(0)} className="text-xs h-8">Reset</Button>
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
                                <Badge variant="outline" className="h-8 px-3 text-sm bg-card border-primary/30 text-foreground font-semibold shadow-sm">
                                   {step.name}
                                </Badge>
                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">{step.role}</span>
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
                                         {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                                         {tmpl.approach}
                                       </div>
                                     );
                                   })}
                                </div>
                             </div>
                             
                             {generatedPack && generatedPack[idx] ? (
                                <div className="mt-4 space-y-4">
                                   {(selectedVariants[idx] && selectedVariants[idx].length > 0 ? selectedVariants[idx] : [0]).sort((a,b) => a-b).map(variantId => (
                                      <div key={variantId} className="p-4 bg-muted/20 rounded-lg border border-border/50 text-sm font-mono whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                                         <div className="absolute top-2 right-2 opacity-50 flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] bg-background/50 backdrop-blur-sm border-border/50">
                                               {VARIANT_TEMPLATES[variantId]?.approach || "Default"} Mode
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] uppercase">Generated</Badge>
                                         </div>
                                         {generatedPack[idx].variants && generatedPack[idx].variants[variantId] 
                                             ? cleanText(generatedPack[idx].variants[variantId].content) 
                                             : generatedPack[idx].prompt
                                         }
                                         <div className="mt-3 flex items-center gap-2">
                                           <Button
                                             variant="ghost"
                                             size="sm"
                                             className="h-7 text-xs text-muted-foreground hover:text-primary"
                                             onClick={() => {
                                               const content = generatedPack[idx].variants && generatedPack[idx].variants[variantId]
                                                 ? cleanText(generatedPack[idx].variants[variantId].content)
                                                 : generatedPack[idx].prompt;
                                               openPreview(content, VARIANT_TEMPLATES[variantId]?.approach);
                                             }}
                                           >
                                             <Play className="w-3 h-3 mr-1.5" /> Preview Output
                                           </Button>
                                           <Button
                                             variant="ghost"
                                             size="sm"
                                             className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                             onClick={() => {
                                               const content = generatedPack[idx].variants && generatedPack[idx].variants[variantId]
                                                 ? cleanText(generatedPack[idx].variants[variantId].content)
                                                 : generatedPack[idx].prompt;
                                               copyToClipboard(content);
                                             }}
                                           >
                                             <Copy className="w-3 h-3 mr-1.5" /> Copy
                                           </Button>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             ) : (
                                idx === 0 && previewContent && !isGeneratingPack && (
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

      <PreviewPanel
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        prompt={previewPrompt}
        promptApproach={previewApproach}
        onSendToPipeline={sendToPipeline}
      />
      {previewPrompt && (
        <button
          onClick={() => setPreviewOpen(true)}
          className="fixed bottom-24 right-6 z-[90] rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          Reopen Preview
        </button>
      )}
    </>
  );
}

// --- MAIN GENERATOR PAGE ---

export function GeneratorPage({ initialTab = "builder" }: { initialTab?: "builder" | "packs" }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const { userState, session } = useDesignContext();
  const isPro = userState === 'pro';

  // Builder State
  const [useCase, setUseCase] = useState("");
  const [outcome, setOutcome] = useState("");
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState<CategoryType>("General");
  const [signal, setSignal] = useState<SignalType>("Quality");
  const [useCostar, setUseCostar] = useState(true);
  const [framework, setFramework] = useState<FrameworkType>("RISEN");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteContext, setWebsiteContext] = useState("");
  const [leadWebsiteUrl, setLeadWebsiteUrl] = useState("");
  const [leadWebsiteContext, setLeadWebsiteContext] = useState("");
  const [yourOffer, setYourOffer] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState<"idle" | "ok" | "error">("idle");
  const [leadScrapeStatus, setLeadScrapeStatus] = useState<"idle" | "ok" | "error">("idle");
  const [isScraping, setIsScraping] = useState(false);
  const [isLeadScraping, setIsLeadScraping] = useState(false);
  
  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("generator_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.useCase) setUseCase(parsed.useCase);
        if (parsed.role) setRole(parsed.role);
        if (parsed.industry) setIndustry(parsed.industry);
        if (parsed.outcome) setOutcome(parsed.outcome);
        if (parsed.signal) setSignal(parsed.signal);
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("generator_state", JSON.stringify({
      category, useCase, role, industry, outcome, signal
    }));
  }, [category, useCase, role, industry, outcome, signal]);

  // Structured context from scraping (replaces raw text dumps)
  const [senderContext, setSenderContext] = useState<StructuredContext | null>(null);
  const [leadContext, setLeadContext] = useState<StructuredContext | null>(null);
  const [suggestedAngle, setSuggestedAngle] = useState<AngleType | null>(null);
  // User-edited overrides for context fields
  const [editSenderOpen, setEditSenderOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [editedSenderCtx, setEditedSenderCtx] = useState<StructuredContext | null>(null);
  const [editedLeadCtx, setEditedLeadCtx] = useState<StructuredContext | null>(null);

  // Raw scraped text (for LLM context repair)
  const [senderRawText, setSenderRawText] = useState<string>("");
  const [leadRawText, setLeadRawText] = useState<string>("");
  const [isImprovingCtx, setIsImprovingCtx] = useState(false);
  const [improvedCtxMessage, setImprovedCtxMessage] = useState<string | null>(null);

  // Enrichment waterfall
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  // Per-scrape auto-pipeline phase labels
  const [senderScrapePhase, setSenderScrapePhase] = useState<string | null>(null);
  const [leadScrapePhase, setLeadScrapePhase] = useState<string | null>(null);

  // Core enrich runner — accepts explicit domain so it can be called automatically
  const runEnrich = async (domain: string): Promise<EnrichmentResult | null> => {
    if (!session) return null;
    setIsEnriching(true);
    try {
      const result = await runEnrichmentWaterfall({
        domain,
        sources: ["linkedin", "tech"],
        accessToken: session.access_token,
        timeoutMs: 20_000,
      });
      setEnrichmentResult(result);
      return result;
    } catch {
      return null;
    } finally {
      setIsEnriching(false);
    }
  };

  // Manual "Deep Enrich" button still works
  const handleEnrich = async () => {
    const targetUrl = leadWebsiteUrl || websiteUrl;
    if (!targetUrl) return;
    const result = await runEnrich(extractDomain(targetUrl));
    if (!result) toast.error("Enrichment failed", { description: "Could not reach enrichment service." });
  };

  // Full auto-pipeline: scrape → LLM improve (if weak) → deep enrich (if still weak)
  const runScrapeAutoEnrich = async (
    url: string,
    setPhase: (p: string | null) => void,
    setCtx: (c: StructuredContext) => void,
    setRawText: (t: string) => void,
    setSummary: (s: string) => void,
    setStatus: (s: "idle" | "ok" | "error") => void,
    setEditedCtx: (c: StructuredContext | null) => void,
  ) => {
    setPhase("Scraping...");
    setStatus("idle");
    let ctx: StructuredContext;
    let raw: string;
    try {
      const res = await scrapeWebsiteContext(url);
      ctx = res.structured;
      raw = res.rawText ?? "";
      setSummary(res.summary);
      setCtx(ctx);
      setRawText(raw);
      setStatus("ok");
    } catch {
      setStatus("error");
      setPhase(null);
      return;
    }

    const initialConf = ctx.confidence ?? 0;

    // Phase 2: LLM improve if score < 60 and user is signed in
    if (initialConf < 60 && session) {
      setPhase("Score low ("+initialConf+"/100) — running LLM repair...");
      try {
        const improved = await improveContext(ctx, raw, session.access_token);
        ctx = improved;
        setEditedCtx(improved);
        const newConf = improved.confidence ?? 0;

        // Phase 3: deep enrich if still weak
        if (newConf < 60) {
          setPhase("Still weak ("+newConf+"/100) — fetching LinkedIn + tech stack...");
          await runEnrich(extractDomain(url));
          setPhase("Done — enrichment signals injected into prompt");
        } else {
          setPhase("Improved to "+newConf+"/100 ✓");
        }
      } catch {
        // LLM improve failed — try enrichment anyway
        setPhase("LLM repair skipped — fetching external signals...");
        await runEnrich(extractDomain(url));
        setPhase("Done — enrichment signals injected into prompt");
      }
    } else if (initialConf < 60) {
      // No session — skip LLM improve, still try enrichment
      setPhase("Score low ("+initialConf+"/100) — sign in to auto-repair");
    } else {
      setPhase(null); // Good score, no message needed
    }
  };

  useEffect(() => {
    const ctx = leadContext ?? senderContext;
    if (ctx) setSuggestedAngle(inferBestAngle(ctx));
  }, [leadContext, senderContext]);

  // Deterministic multi-dim context quality score (updates live with edits)
  const contextScore = useMemo(() => {
    const active = editedLeadCtx ?? leadContext ?? editedSenderCtx ?? senderContext;
    if (!active) return null;
    return scoreContext(active);
  }, [leadContext, senderContext, editedLeadCtx, editedSenderCtx]);

  const handleImproveContext = async () => {
    const activeCtx = editedLeadCtx ?? leadContext ?? editedSenderCtx ?? senderContext;
    const rawText = leadRawText || senderRawText;
    if (!activeCtx || !session) return;
    setIsImprovingCtx(true);
    setImprovedCtxMessage(null);
    try {
      const improved = await improveContext(activeCtx, rawText, session.access_token);
      if (leadContext || editedLeadCtx) {
        setEditedLeadCtx(improved);
      } else {
        setEditedSenderCtx(improved);
      }
      const newScore = improved.confidence ?? 0;
      setImprovedCtxMessage(`Context improved → ${newScore}/100 confidence`);
    } catch (err) {
      toast.error("Could not improve context", { description: "Try editing the fields manually." });
    } finally {
      setIsImprovingCtx(false);
    }
  };

  // Matrix State (Wow Effect)
  const [selectedApproaches, setSelectedApproaches] = useState<number[]>([0]); // Default selected
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    approach: string,
    type: string,
    content: string,
    outputScore: number,
    fullScore: OutputScoreResult,
  }[] | null>(null);

  // Batch pipeline mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<{
    rowLabel: string;
    content: string;
    fullScore: OutputScoreResult;
  }[] | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const [showLock, setShowLock] = useState(false);
  const [showWorkflowUpsell, setShowWorkflowUpsell] = useState(false);
  const [showSaveLock, setShowSaveLock] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [previewApproach, setPreviewApproach] = useState<string | undefined>(undefined);

  const toggleApproach = (index: number) => {
    if (selectedApproaches.includes(index)) {
      if (selectedApproaches.length > 1) { // Prevent deselecting last one
        setSelectedApproaches(prev => prev.filter(i => i !== index));
      }
    } else {
      if (!isPro && index > 2) { // Limit free users to first 3 approaches
         setShowLock(true);
         return;
      }
      setSelectedApproaches(prev => [...prev, index].sort((a,b) => a-b));
    }
  };

  const handleBulkSelect = (type: "ALL" | "Recommended" | "Clear") => {
    if (!isPro && type === "ALL") {
      setShowLock(true);
      return;
    }
    
    if (type === "ALL") {
      setSelectedApproaches(VARIANT_TEMPLATES.map((_, i) => i));
    } else if (type === "Recommended") {
      setSelectedApproaches([0, 1, 2]); // First 3
    } else {
      setSelectedApproaches([0]); // Reset to default
    }
  };

  const handleGenerate = () => {
    if (!useCase) return;
    setIsGenerating(true);
    setGeneratedResults(null);

    // Simulate API / Processing time with staggered effect
    setTimeout(() => {
      let basePrompt = "";
      try {
        const result = generateWithQualityGate({
          useCase, 
          outcome, 
          role, 
          industry, 
          category, 
          signal
        });

        // Analytics Hook
        console.log("prompt_generation_attempt", {
          attempts: result.attempts,
          health: result.health,
          status: result.status
        });

        if (result.status === "failed") {
           throw new Error("Prompt failed quality gate");
        }
        
        basePrompt = result.prompt;
      } catch (err) {
        setIsGenerating(false);
        toast.error("Generation Failed", {
          description: "We couldn't generate a high-quality prompt. Please refine your inputs and try again."
        });
        return;
      }
      
      // Context Compression: use structured context when available, never raw dump
      // editedCtx overrides scraped ctx if user manually corrected fields
      const activeLead   = editedLeadCtx   ?? leadContext   ?? null;
      const activeSender = editedSenderCtx ?? senderContext ?? null;
      const primaryCtx   = activeLead ?? activeSender ?? null;

      // Quality gate: warn if context confidence is very low but still allow generation
      if (primaryCtx && (primaryCtx.confidence ?? 0) < 40 && !editedLeadCtx && !editedSenderCtx) {
        toast.warning("Context is generic — output quality may be lower", {
          description: "The scraped page didn't yield specific signal. Edit the Evidence field or paste a sentence from their site for better results."
        });
        // fall through — still generate
      }

      const structuredCtxForPrompt = primaryCtx ? {
        ...primaryCtx,
        sender_what: (activeSender && activeSender !== primaryCtx) ? activeSender.what_they_do : undefined,
        your_offer: yourOffer ? yourOffer.slice(0, 150) : undefined,
      } : undefined;
      // Text fallback for framework prompts (no structured support)
      // If enrichment ran, splice top signals into the context string for richer outputs
      const enrichedExtra = enrichmentResult?.enriched_context ?? "";
      const textCtxFallback = primaryCtx
        ? [[primaryCtx.what_they_do, primaryCtx.evidence, primaryCtx.high_risk_area, primaryCtx.what_breaks_if_done_badly, yourOffer]
            .filter(v => v && v !== "unknown").join(" | "), enrichedExtra].filter(Boolean).join("\n").slice(0, 700)
        : ([enrichedExtra, yourOffer].filter(Boolean).join("\n") || undefined);

      const results = selectedApproaches.map(idx => {
        const tmpl = VARIANT_TEMPLATES[idx];
        const content = useCostar
          ? generateCOSTARPrompt({
              useCase,
              outcome,
              role,
              industry,
              signal,
              structuredContext: structuredCtxForPrompt,
              context: structuredCtxForPrompt ? undefined : textCtxFallback,
              variant: VARIANT_TYPE_MAP[tmpl.approach]
            })
          : generateFrameworkPrompt({
              framework,
              basePrompt,
              useCase,
              outcome,
              role,
              industry,
              signal,
              context: textCtxFallback,
              approach: tmpl.approach
            });
        
        return {
          approach: tmpl.approach,
          type: tmpl.type,
          content,
          fullScore: scoreOutput(content, structuredCtxForPrompt as StructuredContext | undefined),
          outputScore: scoreOutput(content, structuredCtxForPrompt as StructuredContext | undefined).total,
        };
      });

      setGeneratedResults(results);
      setIsGenerating(false);
      setBatchResults(null); // clear batch when single mode runs
      
      // Workflow Upsell
      setTimeout(() => setShowWorkflowUpsell(true), 1000);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ── Batch Pipeline in Generator ──────────────────────────────────────────────
  // Parses textarea lines: "Company | Role | Context" or just "Company | Context"
  // Generates one prompt per row using the same angle/context config.
  const handleBatchGenerate = () => {
    if (!useCase) { toast.error("Set a Use Case first"); return; }
    const lines = batchInput.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) { toast.error("Paste at least one prospect row"); return; }
    setIsBatchRunning(true);
    setBatchResults(null);

    setTimeout(() => {
      const activeLead   = editedLeadCtx   ?? leadContext   ?? null;
      const activeSender = editedSenderCtx ?? senderContext ?? null;
      const baseCtx      = activeLead ?? activeSender ?? null;
      const firstAngle   = (VARIANT_TYPE_MAP[VARIANT_TEMPLATES[selectedApproaches[0]]?.approach] as AngleType) || "missed_opportunity";

      const results = lines.map(line => {
        const parts = line.split("|").map(p => p.trim());
        const company  = parts[0] || "";
        const roleOrCtx = parts[1] || "";
        const ctxStr    = parts[2] || roleOrCtx;
        const painPoint = parts[3] || "";

        // Build StructuredContext from the batch row — evidence = the context field
        const rowCtx: StructuredContext & { your_offer?: string } = {
          what_they_do: company
            ? `${company}${parts[1] && parts.length > 2 ? ` — ${roleOrCtx}` : ""}`
            : (baseCtx?.what_they_do ?? "unknown"),
          who_they_serve: (parts.length > 2 ? roleOrCtx : "unknown") || baseCtx?.who_they_serve || "unknown",
          key_activity: (baseCtx?.key_activity) ?? "unknown",
          high_risk_area: (baseCtx?.high_risk_area) ?? "unknown",
          how_they_make_money: (baseCtx?.how_they_make_money) ?? "unknown",
          what_breaks_if_done_badly: (baseCtx?.what_breaks_if_done_badly) ?? "unknown",
          evidence: (painPoint || ctxStr).slice(0, 220) || baseCtx?.evidence || "unknown",
          confidence: company ? 70 : 45,
          is_valid: true,
          your_offer: yourOffer ? yourOffer.slice(0, 150) : undefined,
        };

        const prompt = generateCOSTARPrompt({
          useCase: useCase + (company ? ` to ${company}` : ""),
          outcome,
          role: role || (parts.length > 2 ? roleOrCtx : "VP"),
          industry,
          signal,
          structuredContext: rowCtx,
          variant: firstAngle,
        });

        const fullScore = scoreOutput(prompt, rowCtx as StructuredContext);
        return {
          rowLabel: company || `Row ${lines.indexOf(line) + 1}`,
          content: prompt,
          fullScore,
        };
      });

      setBatchResults(results);
      setIsBatchRunning(false);
      setGeneratedResults(null);
    }, 800);
  };

  const openPreview = (prompt: string, approach?: string) => {
    setPreviewPrompt(prompt);
    setPreviewApproach(approach);
    setPreviewOpen(true);
  };

  const sendToPipeline = (prompt: string) => {
    localStorage.setItem("pipeline_seed_prompt", prompt);
    navigate("/pipeline");
  };

  const handleSave = async (content: string, type: string) => {
    if (!session) {
      toast.error("Please sign in to save prompts");
      return;
    }

    if (!isPro) {
      // Check count or just force upgrade
      // For this specific request "Save -> Upgrade modal", we'll enforce the lock strictly or check limit.
      // Let's assume strict lock based on prompt, or fallback to the free limit check used in SavedPromptsPage.
      // But since we can't easily check the count here without fetching, let's assume the user wants an upsell moment.
      // However, making it usable for free users (limit 5) is better UX.
      // We'll fetch count first? No, that's slow.
      // Let's rely on the server response "LIMIT_REACHED" which we implemented in SavedPromptsPage logic
      // But wait, the backend endpoint I wrote returns 403 LIMIT_REACHED.
      // So we just need to handle that error.
    }

    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/prompts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${useCase} (${type})`,
          useCase,
          content,
          industry,
          role,
          category
        })
      });

      const data = await res.json();

      if (!res.ok) {
         if (res.status === 403 && data.code === "LIMIT_REACHED") {
            setShowSaveLock(true);
            return;
         }
         throw new Error("Failed to save");
      }

      toast.success(`Saved to Library`, {
        description: "You can access this in your Saved Prompts.",
        duration: 3000,
      });
    } catch (e) {
      toast.error("Failed to save prompt");
    }
  };

  if (activeTab === "packs") {
    return <PackBuilderView onBack={() => navigate("/generator")} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <ActionLockModal 
        isOpen={showLock} 
        onClose={() => setShowLock(false)} 
        action="Use Advanced Strategies" 
        description="Unlock all 10+ professional strategies including Viral, Executive, and Technical modes."
      />

      <ActionLockModal 
        isOpen={showSaveLock} 
        onClose={() => setShowSaveLock(false)} 
        action="Save Unlimited Prompts" 
        description="You've reached the free limit of 5 saved prompts. Upgrade to build your personal library."
      />
      
      {/* Workflow Upsell Modal */}
      {showWorkflowUpsell && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
           <div className="bg-card border border-border shadow-2xl rounded-xl p-5 relative overflow-hidden">
              <button onClick={() => setShowWorkflowUpsell(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                 <Minimize2 className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                 <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <Layers className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-base mb-1">Turn this into a Workflow?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                       Don't stop at one prompt. Generate a complete <strong>{category} Sequence</strong> with our new Packs.
                    </p>
                    <div className="flex gap-2">
                       <Button size="sm" onClick={() => { setShowWorkflowUpsell(false); setActiveTab("packs"); }} className="font-bold text-xs">
                          Explore Packs
                       </Button>
                       <Button size="sm" variant="ghost" onClick={() => setShowWorkflowUpsell(false)} className="text-xs">
                          Dismiss
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Hero / Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                <Link 
                  to="/generator"
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all inline-block", activeTab === "builder" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  Prompt Builder
                </Link>
                <Link 
                  to="/packs"
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all inline-block", activeTab === "packs" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  Workflow Packs
                </Link>
              </div>
           </div>

           <div className="flex items-center gap-2">
              {!isPro && (
                <Link to="/pricing" className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1">
                   <Zap className="w-3 h-3" /> Upgrade to Pro
                </Link>
              )}
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Inputs */}
          <div className="lg:col-span-4 space-y-6">
           <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-40 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Terminal className="w-4 h-4" />
                 </div>
                 <h2 className="text-lg font-bold">Core Context</h2>
              </div>

              <div className="space-y-5">
                 {/* Category Selection */}
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {(["General", "Development", "Marketing", "Sales", "Content", "Design"] as const).map(cat => (
                         <Badge 
                           key={cat} 
                           variant={category === cat ? "default" : "outline"}
                           className={cn(
                             "cursor-pointer py-1.5 px-3 transition-all", 
                             category !== cat && "hover:border-primary/50 text-muted-foreground bg-transparent"
                           )}
                           onClick={() => { 
                              setCategory(cat); 
                              setUseCase(""); 
                              setRole(""); 
                              setIndustry(""); 
                              setOutcome(""); 
                           }}
                         >
                           {cat}
                         </Badge>
                      ))}
                    </div>
                 </div>

                 {/* Use Case Select */}
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Use Case</Label>
                    <Select value={useCase} onValueChange={setUseCase}>
                      <SelectTrigger className="bg-background border-border h-10">
                        <SelectValue placeholder="Select a use case..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(USE_CASE_OPTIONS.find(o => o.category === category)?.items || ["General Task", "Automate Workflow", "Structure Data", "Rewrite Content"]).map(item => (
                           <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</Label>
                       <Select value={role} onValueChange={setRole}>
                          <SelectTrigger className="bg-background border-border h-10"><SelectValue placeholder="Select role..." /></SelectTrigger>
                          <SelectContent>
                             {(ROLES_BY_CATEGORY[category] || ROLES_BY_CATEGORY["General"]).map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry</Label>
                       <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="bg-background border-border h-10"><SelectValue placeholder="Select industry..." /></SelectTrigger>
                          <SelectContent>
                             {(INDUSTRIES_BY_CATEGORY[category] || INDUSTRIES_BY_CATEGORY["General"]).map(i => (
                                <SelectItem key={i} value={i}>{i}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Outcome</Label>
                    <Select value={outcome} onValueChange={setOutcome}>
                        <SelectTrigger className="bg-background border-border h-10"><SelectValue placeholder="Select target outcome..." /></SelectTrigger>
                        <SelectContent>
                           {(OUTCOMES_BY_CATEGORY[category] || OUTCOMES_BY_CATEGORY["General"]).map(o => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                 </div>

                 {/* Context */}
                 <div className="pt-4 border-t border-border space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Context</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <Input
                           placeholder="Your website (optional)"
                           value={websiteUrl}
                           onChange={(e) => { setWebsiteUrl(e.target.value); setScrapeStatus("idle"); }}
                           className="h-10"
                         />
                         <Button
                           variant="outline"
                           size="sm"
                           className="h-10"
                           disabled={!websiteUrl.trim() || isScraping}
                           onClick={async () => {
                             setIsScraping(true);
                             await runScrapeAutoEnrich(
                               websiteUrl,
                               setSenderScrapePhase,
                               setSenderContext,
                               setSenderRawText,
                               setWebsiteContext,
                               setScrapeStatus,
                               setEditedSenderCtx,
                             );
                             setIsScraping(false);
                           }}
                         >
                           {isScraping ? "Scraping..." : "Scrape"}
                         </Button>
                      </div>
                      {senderScrapePhase && <ScrapePhaseCard phase={senderScrapePhase} />}
                      {senderContext && (() => {
                        const sc = editedSenderCtx ?? senderContext;
                        const conf = sc.confidence ?? Math.round((sc.quality_score ?? 0) * 100);
                        const isWeak = conf < 60;
                        return (
                          <div className={`rounded-md border p-3 space-y-1 ${isWeak ? "border-amber-500/40 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className={`text-[9px] font-bold uppercase tracking-wider ${isWeak ? "text-amber-600" : "text-emerald-600"}`}>Your Company — Extracted</p>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isWeak ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{conf}/100{isWeak ? " ⚠️" : ""}</span>
                                <button onClick={() => setEditSenderOpen(v => !v)} className={`text-[9px] hover:underline ${isWeak ? "text-amber-700" : "text-emerald-700"}`}>{editSenderOpen ? "Done" : "Edit"}</button>
                              </div>
                            </div>
                            {isWeak && !editSenderOpen && (
                              <p className="text-[10px] text-amber-700 mb-1">⚠️ Context too generic — edit Evidence field to improve output quality</p>
                            )}
                            {editSenderOpen ? (
                              <div className="space-y-1.5">
                                {(["what_they_do", "who_they_serve", "key_activity", "how_they_make_money", "evidence"] as const).map(field => (
                                  <div key={field}>
                                    <p className="text-[9px] text-emerald-700 mb-0.5 capitalize">{field === "evidence" ? "Evidence (verbatim from site)" : field.replace(/_/g, " ")}</p>
                                    <input
                                      className="w-full text-[11px] bg-background border border-border rounded px-2 py-1"
                                      value={((editedSenderCtx ?? senderContext) as Record<string, unknown>)[field] === "unknown" ? "" : String(((editedSenderCtx ?? senderContext) as Record<string, unknown>)[field] ?? "")}
                                      placeholder={field === "evidence" ? "Paste a sentence from their website..." : `Enter ${field.replace(/_/g, " ")}...`}
                                      onChange={e => {
                                        const base = editedSenderCtx ?? { ...senderContext };
                                        const updated = { ...base, [field]: e.target.value || "unknown" } as typeof senderContext;
                                        if (updated) {
                                          const fs = [updated.what_they_do, updated.who_they_serve, updated.key_activity, updated.high_risk_area, updated.how_they_make_money, updated.what_breaks_if_done_badly];
                                          const resolved = fs.filter(v => v && v !== "unknown").length;
                                          const evBonus = (updated.evidence && updated.evidence !== "unknown") ? 20 : 0;
                                          const actBonus = (updated.key_activity && updated.key_activity !== "unknown") ? 5 : 0;
                                          updated.confidence = Math.min(resolved * 12 + evBonus + actBonus, 100);
                                          updated.is_valid = (updated.confidence ?? 0) >= 60;
                                          updated.quality_score = Math.round((updated.confidence ?? 0)) / 100;
                                        }
                                        setEditedSenderCtx(updated);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                {sc.what_they_do !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Does:</span> {sc.what_they_do.slice(0, 90)}</p>}
                                {sc.who_they_serve !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Customers:</span> {sc.who_they_serve.slice(0, 80)}</p>}
                                {sc.how_they_make_money !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Revenue:</span> {sc.how_they_make_money.slice(0, 80)}</p>}
                                {sc.evidence && sc.evidence !== "unknown" && <p className="text-[11px] text-foreground/80 italic border-l-2 border-emerald-400 pl-2 mt-1"><span className="font-semibold not-italic">Evidence:</span> "{sc.evidence.slice(0, 100)}"</p>}
                              </>
                            )}
                          </div>
                        );
                      })()}
                      {scrapeStatus === "error" && (
                        <div className="text-[11px] rounded-md px-3 py-2 border border-red-500/30 bg-red-500/5 text-red-600">
                          Failed to scrape. Check the URL and try again.
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <Input
                           placeholder="Lead website (optional)"
                           value={leadWebsiteUrl}
                           onChange={(e) => { setLeadWebsiteUrl(e.target.value); setLeadScrapeStatus("idle"); }}
                           className="h-10"
                         />
                         <Button
                           variant="outline"
                           size="sm"
                           className="h-10"
                           disabled={!leadWebsiteUrl.trim() || isLeadScraping}
                           onClick={async () => {
                             setIsLeadScraping(true);
                             await runScrapeAutoEnrich(
                               leadWebsiteUrl,
                               setLeadScrapePhase,
                               setLeadContext,
                               setLeadRawText,
                               setLeadWebsiteContext,
                               setLeadScrapeStatus,
                               setEditedLeadCtx,
                             );
                             setIsLeadScraping(false);
                           }}
                         >
                           {isLeadScraping ? "Scraping..." : "Scrape"}
                         </Button>
                      </div>
                      {leadScrapePhase && <ScrapePhaseCard phase={leadScrapePhase} />}
                      {leadContext && (() => {
                        const lc = editedLeadCtx ?? leadContext;
                        const conf = lc.confidence ?? Math.round((lc.quality_score ?? 0) * 100);
                        const isWeak = conf < 60;
                        return (
                          <div className={`rounded-md border p-3 space-y-1 ${isWeak ? "border-amber-500/40 bg-amber-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className={`text-[9px] font-bold uppercase tracking-wider ${isWeak ? "text-amber-600" : "text-blue-600"}`}>Lead Company — Extracted</p>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isWeak ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{conf}/100{isWeak ? " ⚠️" : ""}</span>
                                <button onClick={() => setEditLeadOpen(v => !v)} className={`text-[9px] hover:underline ${isWeak ? "text-amber-700" : "text-blue-700"}`}>{editLeadOpen ? "Done" : "Edit"}</button>
                              </div>
                            </div>
                            {isWeak && !editLeadOpen && (
                              <p className="text-[10px] text-amber-700 mb-1">⚠️ Context too generic — paste a real sentence from their site into Evidence</p>
                            )}
                            {editLeadOpen ? (
                              <div className="space-y-1.5">
                                {(["what_they_do", "who_they_serve", "key_activity", "high_risk_area", "how_they_make_money", "what_breaks_if_done_badly", "evidence"] as const).map(field => (
                                  <div key={field}>
                                    <p className="text-[9px] text-blue-700 mb-0.5 capitalize">{field === "evidence" ? "Evidence (verbatim from site)" : field.replace(/_/g, " ")}</p>
                                    <input
                                      className="w-full text-[11px] bg-background border border-border rounded px-2 py-1"
                                      value={((editedLeadCtx ?? leadContext) as Record<string, unknown>)[field] === "unknown" ? "" : String(((editedLeadCtx ?? leadContext) as Record<string, unknown>)[field] ?? "")}
                                      placeholder={field === "evidence" ? "Paste a sentence from their website..." : `Enter ${field.replace(/_/g, " ")}...`}
                                      onChange={e => {
                                        const base = editedLeadCtx ?? { ...leadContext };
                                        const updated = { ...base, [field]: e.target.value || "unknown" } as typeof leadContext;
                                        if (updated) {
                                          const fs = [updated.what_they_do, updated.who_they_serve, updated.key_activity, updated.high_risk_area, updated.how_they_make_money, updated.what_breaks_if_done_badly];
                                          const resolved = fs.filter(v => v && v !== "unknown").length;
                                          const evBonus = (updated.evidence && updated.evidence !== "unknown") ? 20 : 0;
                                          const actBonus = (updated.key_activity && updated.key_activity !== "unknown") ? 5 : 0;
                                          updated.confidence = Math.min(resolved * 12 + evBonus + actBonus, 100);
                                          updated.is_valid = (updated.confidence ?? 0) >= 60;
                                          updated.quality_score = Math.round((updated.confidence ?? 0)) / 100;
                                        }
                                        setEditedLeadCtx(updated);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                {lc.what_they_do !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Does:</span> {lc.what_they_do.slice(0, 90)}</p>}
                                {lc.who_they_serve !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Customers:</span> {lc.who_they_serve.slice(0, 80)}</p>}
                                {lc.high_risk_area !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Risk area:</span> {lc.high_risk_area.slice(0, 80)}</p>}
                                {lc.what_breaks_if_done_badly !== "unknown" && <p className="text-[11px] text-foreground/80"><span className="font-semibold text-foreground">Breaks if:</span> {lc.what_breaks_if_done_badly.slice(0, 80)}</p>}
                                {lc.evidence && lc.evidence !== "unknown" && <p className="text-[11px] text-foreground/80 italic border-l-2 border-blue-400 pl-2 mt-1"><span className="font-semibold not-italic">Evidence:</span> "{lc.evidence.slice(0, 110)}"</p>}
                              </>
                            )}
                            {suggestedAngle && !editLeadOpen && (
                              <p className="text-[9px] mt-1.5 pt-1.5 border-t border-blue-500/20 text-blue-700 font-bold">
                                ⚡ Suggested angle: {VARIANT_TEMPLATES.find(t => t.angle === suggestedAngle)?.approach}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      {leadScrapeStatus === "error" && (
                        <div className="text-[11px] rounded-md px-3 py-2 border border-red-500/30 bg-red-500/5 text-red-600">
                          Failed to scrape. Check the URL and try again.
                        </div>
                      )}

                      {/* Deep Enrich button — always visible once a URL is entered */}
                      {(leadWebsiteUrl.trim() || websiteUrl.trim()) && (
                        <div className="pt-1 space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs gap-1.5 border-violet-500/30 hover:border-violet-500/60 text-violet-700 hover:bg-violet-500/5 disabled:opacity-50"
                            disabled={isEnriching || !session}
                            onClick={handleEnrich}
                          >
                            {isEnriching
                              ? <><RefreshCw className="w-3 h-3 animate-spin" /> Enriching...</>
                              : <><Zap className="w-3 h-3" /> Deep Enrich (LinkedIn + Tech Stack)</>}
                          </Button>
                          {!session && (
                            <p className="text-[10px] text-muted-foreground text-center">
                              <Link to="/sign-in" className="underline hover:text-foreground">Sign in</Link> to unlock deep enrichment
                            </p>
                          )}
                        </div>
                      )}

                      {/* Enrichment signal cards */}
                      {enrichmentResult && enrichmentResult.top_signals.length > 0 && (
                        <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-violet-700">Enrichment Signals</span>
                            <span className="text-[9px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">
                              {enrichmentResult.enrichment_score}/100 depth
                            </span>
                          </div>
                          {enrichmentResult.top_signals.map((sig, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded shrink-0">
                                +{sig.score}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-foreground leading-tight">{sig.label}</p>
                                <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">{sig.context_snippet}</p>
                              </div>
                            </div>
                          ))}
                          <p className="text-[9px] text-violet-600 pt-1 border-t border-violet-500/20">
                            {enrichmentResult.sources_used.join(" + ")} — {enrichmentResult.top_signals.length} signal{enrichmentResult.top_signals.length > 1 ? "s" : ""} injected into prompt
                          </p>
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder="Your offer or product summary (optional)"
                      value={yourOffer}
                      onChange={(e) => setYourOffer(e.target.value)}
                      className="min-h-[90px] text-sm"
                    />
                 </div>
                 
                 <div className="pt-4 border-t border-border">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Signal Optimization</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {(["Quality", "Conversion", "Creative", "Speed", "Accuracy", "Detail"] as const).map(s => (
                         <div
                           key={s}
                           onClick={() => setSignal(s)}
                           className={cn(
                             "cursor-pointer px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between group",
                             signal === s 
                               ? "bg-primary/10 border-primary text-primary shadow-sm" 
                               : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                           )}
                         >
                           {s}
                           {signal === s && <CheckCircle2 className="w-3 h-3" />}
                         </div>
                       ))}
                     </div>
                 </div>

                 {/* CO-STAR + Frameworks */}
                 <div className="pt-4 border-t border-border space-y-3">
                    <div
                      onClick={() => setUseCostar((p) => !p)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none",
                        useCostar
                          ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-muted/20 hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                        useCostar ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">CO-STAR Mode</p>
                        <p className="text-[10px] text-muted-foreground">Structured outputs with constraints</p>
                      </div>
                      <div className={cn("w-8 h-4 rounded-full border transition-all", useCostar ? "bg-primary border-primary" : "bg-muted border-border")}>
                        <div className={cn("w-3 h-3 rounded-full bg-white m-0.5 transition-all", useCostar ? "translate-x-4" : "translate-x-0")} />
                      </div>
                    </div>

                    {!useCostar && (
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Framework</Label>
                        <div className="flex flex-wrap gap-2">
                          {FRAMEWORK_OPTIONS.map((fw) => (
                            <button
                              key={fw}
                              onClick={() => setFramework(fw)}
                              className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all",
                                framework === fw
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                              )}
                            >
                              {fw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>

                 {/* Context Quality Score Panel */}
                 {contextScore && (
                   <div className={`rounded-lg border p-3 space-y-1.5 ${
                     contextScore.grade === "strong" ? "border-emerald-500/30 bg-emerald-500/5" :
                     contextScore.grade === "ok" ? "border-blue-500/20 bg-blue-500/5" :
                     contextScore.grade === "weak" ? "border-amber-500/30 bg-amber-500/5" :
                     "border-red-500/30 bg-red-500/5"
                   }`}>
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                         <TrendingUp className="w-3 h-3" /> Context Quality
                       </span>
                       <div className="flex items-center gap-2">
                         <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${scoreBadgeClass(contextScore.total)}`}>
                           {contextScore.total}/100
                         </span>
                         {session && (
                           <Button
                             size="sm"
                             variant="outline"
                             className="h-6 text-[10px] px-2 gap-1"
                             disabled={isImprovingCtx}
                             onClick={handleImproveContext}
                           >
                             {isImprovingCtx
                               ? <><RefreshCw className="w-2.5 h-2.5 animate-spin" /> Improving...</>
                               : <><Zap className="w-2.5 h-2.5" /> Improve ⚡</>}
                           </Button>
                         )}
                       </div>
                     </div>
                     {contextScore.issues.slice(0, 2).map((issue, i) => (
                       <p key={i} className="text-[10px] text-amber-700 flex items-start gap-1">
                         <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0" />{issue}
                       </p>
                     ))}
                     {improvedCtxMessage && (
                       <p className="text-[10px] text-emerald-600 font-medium">✓ {improvedCtxMessage}</p>
                     )}
                   </div>
                 )}

                 {/* Single / Batch mode toggle */}
                 <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
                   <button
                     onClick={() => setBatchMode(false)}
                     className={cn(
                       "flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5",
                       !batchMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <Wand2 className="w-3 h-3" /> Single
                   </button>
                   <button
                     onClick={() => setBatchMode(true)}
                     className={cn(
                       "flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5",
                       batchMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <Layers className="w-3 h-3" /> Batch Pipeline
                   </button>
                 </div>

                 {batchMode ? (
                   <div className="space-y-3">
                     <div className="space-y-1">
                       <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paste Prospects</Label>
                       <p className="text-[10px] text-muted-foreground">One per line — format: <code className="bg-muted px-1 rounded text-[10px]">Company | Role | Pain point / context</code></p>
                     </div>
                     <Textarea
                       value={batchInput}
                       onChange={(e) => setBatchInput(e.target.value)}
                       placeholder={`Acme Corp | VP Sales | Struggling to personalise outreach at scale\nBeta Inc | CMO | Just raised Series B, building demand gen\nGamma Ltd | Head of Growth | Moving from inbound to outbound`}
                       className="min-h-[140px] font-mono text-xs resize-none"
                     />
                     <Button
                       size="lg"
                       className="w-full font-bold h-12 text-base shadow-lg shadow-primary/20"
                       onClick={handleBatchGenerate}
                       disabled={isBatchRunning || !useCase || !batchInput.trim()}
                     >
                       {isBatchRunning ? (
                         <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Running Batch...</>
                       ) : (
                         <><Zap className="w-4 h-4 mr-2" /> Run Batch Pipeline</>
                       )}
                     </Button>
                   </div>
                 ) : (
                   <Button
                     size="lg"
                     className="w-full font-bold h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
                     onClick={handleGenerate}
                     disabled={isGenerating || !useCase}
                   >
                     {isGenerating ? (
                       <>
                         <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                       </>
                     ) : (
                       <>
                         <Wand2 className="w-4 h-4 mr-2" /> Generate {selectedApproaches.length} {selectedApproaches.length === 1 ? "Angle" : "Angles"}
                       </>
                     )}
                   </Button>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT: Strategy Matrix & Results */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Strategy Matrix (The "Wow" Selector) */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
           >
              <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                       <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold">Angle Engine</h3>
                       <p className="text-[10px] text-muted-foreground">Each angle changes output logic — not just tone.</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkSelect("Clear")}>Reset</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkSelect("Recommended")}>Recommended</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10" onClick={() => handleBulkSelect("ALL")}>Select All (6)</Button>
                 </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-background to-muted/20">
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {VARIANT_TEMPLATES.map((tmpl, idx) => {
                       const isSelected = selectedApproaches.includes(idx);
                       const isLocked = !isPro && idx > 2;
                       const isSuggested = !isSelected && !isLocked && suggestedAngle !== null && tmpl.angle === suggestedAngle;

                       return (
                         <motion.button
                           key={idx}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => toggleApproach(idx)}
                           className={cn(
                             "relative h-28 rounded-lg border flex flex-col items-center justify-center text-center p-3 transition-all duration-300",
                             isSelected 
                               ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10" 
                               : isSuggested
                                 ? "bg-amber-500/5 border-amber-500/50 text-foreground ring-1 ring-amber-500/30"
                                 : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                             isLocked && "opacity-60 cursor-not-allowed bg-muted/50"
                           )}
                         >
                            <span className="text-xs font-bold mb-1.5 leading-tight">{tmpl.approach}</span>
                            <span className={cn("text-[9px] leading-tight", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                              {tmpl.desc}
                            </span>
                            
                            {isSelected && (
                               <motion.div 
                                 initial={{ scale: 0 }} animate={{ scale: 1 }}
                                 className="absolute top-1.5 right-1.5"
                               >
                                  <CheckCircle2 className="w-3 h-3" />
                               </motion.div>
                            )}
                            {isSuggested && (
                               <div className="absolute top-1 left-1">
                                  <span className="text-[8px] font-bold bg-amber-400/30 text-amber-700 px-1 py-0.5 rounded leading-none">AI ✦</span>
                               </div>
                            )}
                            {isLocked && (
                               <div className="absolute top-1.5 right-1.5 text-muted-foreground">
                                  <Lock className="w-3 h-3" />
                               </div>
                            )}
                         </motion.button>
                       );
                    })}
                 </div>
              </div>
           </motion.div>

           {/* Results Area */}
           <AnimatePresence mode="wait">
             {generatedResults ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="grid grid-cols-1 gap-6"
               >
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> 
                        Generated Results 
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{generatedResults.length} variations</span>
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {generatedResults.map((result, i) => (
                       <motion.div
                         key={i}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="group bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                       >
                          <div className="px-5 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">{result.approach}</span>
                                <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">{result.type}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${outputScoreBadgeClass(result.outputScore)}`}>
                                  {outputScoreEmoji(result.outputScore)} {result.outputScore}/100
                                </span>
                             </div>
                             <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSave(result.content, result.type)}>
                                   <Save className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(result.content)}>
                                   <Copy className="w-3 h-3" />
                                </Button>
                             </div>
                          </div>
                          
                          <div className="p-5 flex-1 relative overflow-hidden">
                             <pre className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed font-sans transition-all duration-500">
                                {result.content}
                             </pre>
                          </div>

                          {/* ── Score Breakdown ── */}
                          {(() => {
                            const s = result.fullScore;
                            const dims = [
                              { label: "Specificity",     val: s.specificity,     max: 25, color: "bg-violet-500" },
                              { label: "Personalization", val: s.personalization,  max: 20, color: "bg-blue-500" },
                              { label: "Angle",           val: s.angle,           max: 20, color: "bg-emerald-500" },
                              { label: "Structure",       val: s.structure,       max: 15, color: "bg-teal-500" },
                              { label: "CTA",             val: s.cta,             max: 10, color: "bg-amber-500" },
                              { label: "Hook Bonus",      val: s.hook,            max: 10, color: "bg-orange-400" },
                            ];
                            return (
                              <div className="px-5 pt-3 pb-4 border-t border-border bg-muted/5 space-y-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <BarChart3 className="w-3 h-3" /> Score Breakdown
                                </p>
                                {dims.map(d => (
                                  <div key={d.label} className="flex items-center gap-2">
                                    <p className="text-[10px] text-muted-foreground w-28 shrink-0">{d.label}</p>
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${d.color}`}
                                        style={{ width: `${Math.min((d.val / d.max) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <p className={`text-[10px] font-bold tabular-nums w-10 text-right ${d.val === d.max ? "text-emerald-600" : ""}`}>{d.val}/{d.max}</p>
                                  </div>
                                ))}
                                {s.genericPenalty > 0 && (
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-red-500 w-28 shrink-0">Penalty</p>
                                    <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full bg-red-400" style={{ width: `${(s.genericPenalty / 20) * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] font-bold tabular-nums w-10 text-right text-red-500">-{s.genericPenalty}</p>
                                  </div>
                                )}
                                {s.issues.length > 0 && (
                                  <div className="mt-2 space-y-0.5">
                                    {s.issues.map((issue, ii) => (
                                      <p key={ii} className="text-[9px] text-amber-600 flex items-start gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5 mt-px shrink-0" />{issue}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="px-5 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
                             <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-primary" onClick={() => openPreview(result.content, result.approach)}>
                                <Play className="w-3 h-3 mr-1.5" /> Preview Output
                             </Button>
                             <Button size="sm" className="text-xs h-7 font-bold gap-1.5" onClick={() => handleSave(result.content, result.type)}>
                                <Save className="w-3 h-3" /> Save
                             </Button>
                             <Button size="sm" variant="outline" className="text-xs h-7 font-bold gap-1.5" onClick={() => copyToClipboard(result.content)}>
                                <Copy className="w-3 h-3" /> Copy
                             </Button>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               </motion.div>
             ) : (
               !isGenerating && (
                 <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/5">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                       <LayoutTemplate className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="font-bold text-foreground">Ready to Generate</h3>
                    <p className="max-w-md mt-2 text-sm">
                      Configure your prompt context on the left, select your strategies above, and hit Generate to see the magic happen.
                    </p>
                 </div>
               )
             )}

             {isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse p-6 space-y-4">
                        <div className="h-6 w-1/3 bg-muted rounded"></div>
                        <div className="space-y-2">
                           <div className="h-4 w-full bg-muted/50 rounded"></div>
                           <div className="h-4 w-full bg-muted/50 rounded"></div>
                           <div className="h-4 w-2/3 bg-muted/50 rounded"></div>
                        </div>
                     </div>
                   ))}
                </div>
             )}
           </AnimatePresence>

           {/* ── Batch Pipeline Results ── */}
           {batchResults && batchResults.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-4"
             >
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <Zap className="w-4 h-4 text-primary" />
                   Batch Results
                   <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{batchResults.length} prospects</span>
                 </h3>
                 <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5"
                   onClick={() => {
                     const csv = ["Prospect,TotalScore,Specificity,Personalization,Angle,Structure,CTA,Hook,Penalty",
                       ...batchResults.map(r =>
                         [r.rowLabel, r.fullScore.total, r.fullScore.specificity, r.fullScore.personalization,
                          r.fullScore.angle, r.fullScore.structure, r.fullScore.cta, r.fullScore.hook, -r.fullScore.genericPenalty].join(",")
                       )].join("\n");
                     const blob = new Blob([csv], { type: "text/csv" });
                     const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                     a.download = "batch-results.csv"; a.click();
                   }}
                 >
                   <Download className="w-3 h-3" /> Export CSV
                 </Button>
               </div>

               {/* Summary bar */}
               <div className="grid grid-cols-3 gap-3">
                 {(() => {
                   const avg = Math.round(batchResults.reduce((s, r) => s + r.fullScore.total, 0) / batchResults.length);
                   const strong = batchResults.filter(r => r.fullScore.total >= 90).length;
                   const weak   = batchResults.filter(r => r.fullScore.total < 50).length;
                   return [
                     { label: "Avg Score", val: `${avg}/100`, col: avg >= 85 ? "text-emerald-600" : avg >= 70 ? "text-blue-600" : "text-amber-600" },
                     { label: "Strong 🔥", val: strong.toString(), col: "text-emerald-600" },
                     { label: "Weak ❌",   val: weak.toString(),   col: weak > 0 ? "text-red-500" : "text-muted-foreground" },
                   ].map(m => (
                     <div key={m.label} className="bg-card border border-border rounded-lg p-3 text-center">
                       <p className={`text-xl font-bold ${m.col}`}>{m.val}</p>
                       <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                     </div>
                   ));
                 })()}
               </div>

               {/* Per-row cards */}
               <div className="space-y-3">
                 {batchResults.map((row, i) => {
                   const s = row.fullScore;
                   const dims = [
                     { label: "Spec",  val: s.specificity,    max: 25, color: "bg-violet-500" },
                     { label: "Pers",  val: s.personalization, max: 20, color: "bg-blue-500" },
                     { label: "Angle", val: s.angle,          max: 20, color: "bg-emerald-500" },
                     { label: "Struct",val: s.structure,      max: 15, color: "bg-teal-500" },
                     { label: "CTA",   val: s.cta,            max: 10, color: "bg-amber-500" },
                     { label: "Hook",  val: s.hook,           max: 10, color: "bg-orange-400" },
                   ];
                   return (
                     <motion.div
                       key={i}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="bg-card border border-border rounded-xl overflow-hidden"
                     >
                       {/* Row header */}
                       <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between gap-3">
                         <div className="flex items-center gap-2 min-w-0">
                           <span className="text-xs font-bold text-foreground truncate">{row.rowLabel}</span>
                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${outputScoreBadgeClass(s.total)}`}>
                             {outputScoreEmoji(s.total)} {s.total}/100
                           </span>
                         </div>
                         <div className="flex items-center gap-1 shrink-0">
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(row.content)}>
                             <Copy className="w-3 h-3" />
                           </Button>
                         </div>
                       </div>

                       {/* Score bars inline */}
                       <div className="px-4 py-2 grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-1.5 border-b border-border bg-muted/5">
                         {dims.map(d => (
                           <div key={d.label} className="space-y-0.5">
                             <div className="flex items-center justify-between">
                               <p className="text-[9px] text-muted-foreground">{d.label}</p>
                               <p className={`text-[9px] font-bold tabular-nums ${d.val === d.max ? "text-emerald-600" : ""}`}>{d.val}</p>
                             </div>
                             <div className="h-1 bg-muted rounded-full overflow-hidden">
                               <div className={`h-full rounded-full ${d.color}`} style={{ width: `${(d.val / d.max) * 100}%` }} />
                             </div>
                           </div>
                         ))}
                       </div>

                       {/* Prompt preview (collapsible) */}
                       <details className="group">
                         <summary className="px-4 py-2 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 select-none">
                           <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> View prompt
                         </summary>
                         <div className="px-4 pb-4">
                           <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-words leading-relaxed font-mono bg-muted/30 rounded-lg p-3">
                             {row.content}
                           </pre>
                         </div>
                       </details>
                     </motion.div>
                   );
                 })}
               </div>
             </motion.div>
           )}

           {isBatchRunning && (
             <div className="grid grid-cols-1 gap-3">
               {[1,2,3].map(i => (
                 <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
               ))}
             </div>
           )}

        </div>
      </div>

      <PreviewPanel
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        prompt={previewPrompt}
        promptApproach={previewApproach}
        onSendToPipeline={sendToPipeline}
        onSave={(content) => handleSave(content, previewApproach || "Preview")}
      />
      {previewPrompt && (
        <button
          onClick={() => setPreviewOpen(true)}
          className="fixed bottom-24 right-6 z-[90] rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          Reopen Preview
        </button>
      )}
    </div>
  );
}

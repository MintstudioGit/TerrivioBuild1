import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  Maximize2, Minimize2, RefreshCw, SlidersHorizontal, LayoutTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  SignalType, 
  CategoryType, 
  generateEnginePrompt, 
  generateVariations, 
  generateWorkflowSequence, 
  WORKFLOW_PACKS, 
  deriveCategory,
  WorkflowPack,
  VARIANT_TEMPLATES,
  cleanText
} from "./prompt-engine";
import { generateWithQualityGate } from "./prompt-quality-gate";

// --- COMPONENTS ---

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

// --- PACK BUILDER VIEW (Re-implemented for context) ---

function PackBuilderView({ onBack }: { onBack: () => void }) {
  const [searchParams] = useSearchParams();
  const initialPackId = searchParams.get("pack");

  const { userState } = useDesignContext();
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

  return (
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

  // Matrix State (Wow Effect)
  const [selectedApproaches, setSelectedApproaches] = useState<number[]>([0]); // Default selected
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    approach: string,
    type: string,
    content: string
  }[] | null>(null);

  const [showLock, setShowLock] = useState(false);
  const [showWorkflowUpsell, setShowWorkflowUpsell] = useState(false);
  const [showSaveLock, setShowSaveLock] = useState(false);

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
      
      const results = selectedApproaches.map(idx => {
        const tmpl = VARIANT_TEMPLATES[idx];
        const variation = generateVariations(basePrompt).find(v => v.title === tmpl.approach);
        
        // If exact match not found in helper (helper only returns 4), generate custom
        const content = variation ? variation.content : `[MODIFIER: ${tmpl.approach} Approach]\n\n${basePrompt}\n\nConstraint: Apply ${tmpl.desc.toLowerCase()}.`;
        
        return {
          approach: tmpl.approach,
          type: tmpl.type,
          content: cleanText(content)
        };
      });

      setGeneratedResults(results);
      setIsGenerating(false);
      
      // Workflow Upsell
      setTimeout(() => setShowWorkflowUpsell(true), 1000);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
                       <Wand2 className="w-4 h-4 mr-2" /> Generate {selectedApproaches.length} Variations
                     </>
                   )}
                 </Button>
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
                       <h3 className="text-sm font-bold">Strategy Deck</h3>
                       <p className="text-[10px] text-muted-foreground">Select approaches to generate in parallel.</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkSelect("Clear")}>Reset</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkSelect("Recommended")}>Recommended</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10" onClick={() => handleBulkSelect("ALL")}>Select All (10)</Button>
                 </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-background to-muted/20">
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {VARIANT_TEMPLATES.map((tmpl, idx) => {
                       const isSelected = selectedApproaches.includes(idx);
                       const isLocked = !isPro && idx > 2;

                       return (
                         <motion.button
                           key={idx}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => toggleApproach(idx)}
                           className={cn(
                             "relative h-24 rounded-lg border flex flex-col items-center justify-center text-center p-2 transition-all duration-300",
                             isSelected 
                               ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10" 
                               : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                             isLocked && "opacity-60 cursor-not-allowed bg-muted/50"
                           )}
                         >
                            <span className="text-xs font-bold mb-1">{tmpl.approach}</span>
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
                             <pre className={cn(
                               "text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed font-sans transition-all duration-500",
                               !session && "blur-md select-none opacity-50"
                             )}>
                                {result.content}
                             </pre>
                             
                             {!session && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center bg-background/10 backdrop-blur-[2px]">
                                  <div className="bg-card/90 border border-border p-6 rounded-xl shadow-xl flex flex-col items-center">
                                    <Lock className="w-8 h-8 text-primary mb-3 bg-primary/10 p-1.5 rounded-full" />
                                    <h4 className="font-bold text-foreground mb-1 text-base">Login to View</h4>
                                    <p className="text-xs text-muted-foreground mb-4 max-w-[200px] leading-relaxed">
                                      Sign in to unlock your personalized prompt and save it to your library.
                                    </p>
                                    <Button size="sm" asChild className="font-bold shadow-lg w-full">
                                       <Link to="/signin">Sign In / Sign Up</Link>
                                    </Button>
                                  </div>
                               </div>
                             )}
                          </div>

                          <div className="px-5 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
                             <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-primary">
                                <Maximize2 className="w-3 h-3 mr-1.5" /> Expand
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

        </div>
      </div>
    </div>
  );
}

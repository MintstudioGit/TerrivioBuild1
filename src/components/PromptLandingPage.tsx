import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { 
  Check, CheckCircle2, ArrowRight, Copy, Star, ShieldCheck, Zap, Lock, 
  ChevronDown, RotateCw, Sparkles, X, LayoutGrid, FileText, Bookmark, Share2,
  Terminal, Settings, Briefcase, Box, Cpu, Target, Wand2, Layers, ArrowLeft,
  SlidersHorizontal, Minimize2, Save, Maximize2, LayoutTemplate, RefreshCw,
  Lightbulb, Workflow
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion, AnimatePresence } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter
} from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { 
  SignalType, 
  CategoryType, 
  generateEnginePrompt,
  VARIANT_TEMPLATES, 
  cleanText,
  generateVariations
} from "./prompt-engine";
import { generateWithQualityGate } from "./prompt-quality-gate";

import { PromptCardNew, ThemeConfig } from "./PromptCard";

// --- TYPES ---

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  useCase: string;
  signal: string;
  badge: string;
  tags: string[];
  verb: string;
  benefit: string;
  reusabilityScore: number;
  uses: number;
  verified?: boolean;
  author?: string;
  cta?: string;
}

interface PromptLandingPageProps {
  prompt: Prompt;
  relatedPrompts: Prompt[];
  theme: any;
  onViewRelated: (prompt: Prompt) => void;
  selectedUseCase: string;
  selectedSignal: string;
  onUseCaseClick: () => void;
  onSignalClick: () => void;
  categorySlug?: string;
}

// --- TAXONOMY & CONSTANTS ---

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

const INDUSTRIES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["SaaS", "FinTech", "HealthTech", "E-commerce", "Web3/Blockchain", "EdTech", "Cybersecurity"],
  Marketing: ["B2B SaaS", "D2C Brands", "Digital Agency", "E-commerce", "Media & Publishing"],
  Sales: ["B2B Technology", "Enterprise Software", "Real Estate", "Financial Services", "Consulting"],
  Content: ["Lifestyle", "Technology", "Finance", "Health & Wellness", "Education"],
  Design: ["Tech Startups", "Creative Agency", "Fashion & Retail", "Consumer Apps"],
  General: ["Technology", "Healthcare", "Finance", "Retail", "Education", "Manufacturing"]
};

// --- COMPONENTS ---

function ActionLockModal({ isOpen, onClose, action, description }: { isOpen: boolean, onClose: () => void, action: string, description?: string }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Unlock {action}</h3>
          <p className="text-muted-foreground text-base mb-8 max-w-xs mx-auto leading-relaxed">
            {description || <>Saved prompts become reusable systems. <br/> Upgrade to Pro to {action.toLowerCase()}.</>}
          </p>
          
          <div className="space-y-4">
            <Button size="lg" className="w-full font-bold h-12 shadow-lg shadow-primary/20" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
            <p className="text-xs text-muted-foreground font-medium">
              €9 for your first 30 days. Cancel anytime.
            </p>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
              Maybe later
            </Button>
          </div>
        </div>
        
        <div className="bg-muted/30 px-6 py-4 border-t border-border flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
           <Zap className="w-3.5 h-3.5 text-amber-500" />
           <span>Pro users save ~4 hours per week.</span>
        </div>
      </motion.div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export function PromptLandingPage({ prompt, relatedPrompts, theme, onViewRelated, selectedUseCase, selectedSignal, onUseCaseClick, onSignalClick, categorySlug }: PromptLandingPageProps) {
  // --- HANDLERS ---
  const { userState, session, supabase } = useDesignContext();
  const isPro = userState === 'pro';

  // --- STATE ---
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [showLock, setShowLock] = useState<{ action: string; description?: string } | null>(null);

  // Generator Config
  const [category, setCategory] = useState<CategoryType>("General");
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [outcome, setOutcome] = useState("Get a reply");
  const [signal, setSignal] = useState<SignalType>(prompt.signal as SignalType || "Quality");
  
  // Variations Matrix
  const [selectedApproaches, setSelectedApproaches] = useState<number[]>([0]); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    approach: string,
    type: string,
    content: string
  }[] | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
     // Infer context from prompt tags
     const inferredCat = (prompt.tags.find(t => Object.keys(ROLES_BY_CATEGORY).includes(t)) || "General") as CategoryType;
     setCategory(inferredCat);

     // Pre-fill fields based on taxonomy
     if (prompt.cta) setOutcome(prompt.cta);
  }, [prompt]);

  // --- HANDLERS ---

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Manual copy required");
    }
  };

  const handleSave = async (content: string, type: string) => {
    if (!session) {
      setShowLock({ action: "Saving Prompts", description: "Sign in to build your personal prompt library." });
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          title: `${prompt.title} (${type})`,
          content: content,
          description: prompt.description,
          tags: prompt.tags,
          badge: prompt.badge,
          uses: 0,
          rating: "5.0",
          author: "Terrivio Signal Explorer",
          verified: true
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 403 && resData.code === "LIMIT_REACHED") {
           setShowLock({ 
             action: "Unlimited Library", 
             description: "You have reached the free limit of 5 prompts. Upgrade to Pro to save more." 
           }); 
           return;
        }
        throw new Error(resData.error || "Failed to save");
      }
      toast.success("Saved to Library");
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        }
      });
    } catch (error) {
      toast.error("Failed to start Google sign in");
    }
  };

  // --- GENERATION LOGIC (Inside Sheet) ---

  const toggleApproach = (index: number) => {
    if (selectedApproaches.includes(index)) {
      if (selectedApproaches.length > 1) {
        setSelectedApproaches(prev => prev.filter(i => i !== index));
      }
    } else {
      // STRICT LOCK: Indices > 2 (0,1,2 are free) are locked for non-pro
      if (!isPro && index > 2) {
        setShowLock({ action: "Advanced Strategies", description: "Unlock 10+ professional strategies including Viral, Executive, and Technical modes." });
        return;
      }
      setSelectedApproaches(prev => [...prev, index].sort((a,b) => a-b));
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedResults(null);
    
    setTimeout(() => {
      // 1. Generate Base Prompt
      const result = generateWithQualityGate({
        useCase: prompt.useCase,
        outcome: outcome || "Achieve results",
        role: role || "Expert",
        industry: industry || "General",
        category: category,
        signal: signal
      });

      const basePrompt = result.prompt;
      const allVariations = generateVariations(basePrompt);

      // 2. Map selected approaches
      const results = selectedApproaches.map(idx => {
        const tmpl = VARIANT_TEMPLATES[idx];
        const variation = allVariations.find(v => v.title === tmpl.approach);
        const content = variation ? variation.content : `[MODIFIER: ${tmpl.approach} Approach]\n\n${basePrompt}`;
        
        return {
          approach: tmpl.approach,
          type: tmpl.type,
          content: cleanText(content)
        };
      });

      setGeneratedResults(results);
      setIsGenerating(false);
      
      // If guest, show FULL SCREEN login gate immediately
      if (!session) {
        setShowLoginGate(true);
      }
    }, 1500);
  };

  // --- DYNAMIC CONTENT HELPERS ---
  
  // Deterministic random subset based on prompt ID
  const getStableSubset = (templates: ((p: Prompt) => string)[], count: number) => {
    let hash = 0;
    for (let i = 0; i < prompt.id.length; i++) {
        hash = ((hash << 5) - hash) + prompt.id.charCodeAt(i);
        hash |= 0;
    }
    const shuffled = [...templates];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const seed = Math.abs(hash + i * 31337) % 10000;
        const j = Math.floor((seed / 10000) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count).map(fn => fn(prompt));
  };

  const USE_CASE_DESC = [
    (p: Prompt) => `When you need to **${p.verb.toLowerCase()}** in a high-stakes ${p.tags[1] || "professional"} environment`,
    (p: Prompt) => `If your current workflow isn't delivering **${p.signal.toLowerCase()}** results consistently`,
    (p: Prompt) => `To target specific outcomes like **${p.cta ? p.cta.toLowerCase() : "better engagement"}** with precision`,
    (p: Prompt) => `When ensuring your communication is **${p.benefit.toLowerCase()}** is non-negotiable`,
    (p: Prompt) => `For situations requiring **${p.tags[0] || "clear"}** logic to drive **${p.signal.toLowerCase()}**`,
    (p: Prompt) => `When you need to **${p.verb.toLowerCase()}** efficiently without sacrificing tone or quality`
  ];

  const WHY_IT_WORKS_DESC = [
    (p: Prompt) => `It leverages proven ${p.tags[0] || "industry"} frameworks to generate **${p.useCase.toLowerCase()}** that actually convert`,
    (p: Prompt) => `The structure is engineered to drive **${p.signal.toLowerCase()}** by reducing cognitive load`,
    (p: Prompt) => `It helps you **${p.benefit.toLowerCase()}** while maintaining a natural, authentic voice`,
    (p: Prompt) => `It adapts seamlessly to **${p.useCase.toLowerCase()}** scenarios, ensuring relevance across contexts`
  ];

  const staticUseCases = getStableSubset(USE_CASE_DESC, 4);
  const staticWhyItWorks = getStableSubset(WHY_IT_WORKS_DESC, 4);

  return (
    <div className={cn("flex flex-col animate-in fade-in duration-500 w-full", theme.bg)}>
      <ActionLockModal isOpen={!!showLock} onClose={() => setShowLock(null)} action={showLock?.action || ""} description={showLock?.description} />
      
      {/* Flattened Layout - No Container/Grid constraints since parent handles it */}
      <div className="space-y-10 w-full">
            
            {/* 1. Prompt Preview Card (Above Fold) */}
            <div className={cn("relative rounded-xl border shadow-xl overflow-hidden bg-card ring-1 ring-border/50 transition-all", theme.card)}>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary opacity-50" />
                
                {/* Window Controls */}
                <div className="h-10 bg-muted/30 border-b flex items-center px-4 justify-between">
                    <div className="flex gap-1.5 opacity-70">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground font-medium uppercase tracking-widest opacity-60 pl-8">
                        MASTER_TEMPLATE.md
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background/50" onClick={() => handleCopy(prompt.content)}>
                        <Copy className="w-3.5 h-3.5" />
                    </Button> 
                </div>

                <div className="p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 bg-card">
                    {prompt.content}
                </div>
                
                <div className="bg-muted/30 p-4 border-t border-border">
                     <Button 
                        size="lg" 
                        className="w-full h-12 text-base font-bold shadow-md shadow-primary/10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                        onClick={() => setIsGeneratorOpen(true)}
                     >
                        <Sparkles className="w-4 h-4 fill-primary-foreground/20" />
                        Generate Personalized Version
                     </Button>
                     <p className="text-center mt-3 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                        Adapts to your Role, Industry & Goals
                     </p>
                </div>
            </div>

            {/* 2. Variations List */}
            <div className="space-y-4">
               <h3 className="text-lg font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Available Variations
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {VARIANT_TEMPLATES.map((t, i) => (
                     <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs group-hover:scale-110 transition-transform">
                           {i + 1}
                        </div>
                        <div>
                           <div className="font-bold text-sm mb-1">{t.approach}</div>
                           <p className="text-xs text-muted-foreground leading-snug">{t.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* 3. Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-border mt-8">
               <div className="space-y-4 p-6 bg-card border border-border rounded-xl">
                  <h4 className="font-bold text-base flex items-center gap-2">
                     <Lightbulb className="w-4 h-4 text-amber-500" />
                     Use Cases
                  </h4>
                  <ul className="space-y-3">
                     {staticUseCases.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                           <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                           <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<span class="text-foreground font-medium">$1</span>') }} />
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-4 p-6 bg-card border border-border rounded-xl">
                  <h4 className="font-bold text-base flex items-center gap-2">
                     <Cpu className="w-4 h-4 text-emerald-500" />
                     Why it Works
                  </h4>
                  <ul className="space-y-3">
                     {staticWhyItWorks.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                           <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<span class="text-foreground font-medium">$1</span>') }} />
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* 4. Related Templates (Grid) - Moved to bottom full width */}
            <div className="pt-10 border-t border-border">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                     <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold tracking-tight">More {categorySlug ? categorySlug + " " : ""}Signals</h2>
                     <p className="text-sm text-muted-foreground">Explore other outcomes for {selectedUseCase}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {relatedPrompts.map(p => (
                       <PromptCardNew 
                          key={p.id}
                          prompt={p}
                          theme={{...theme, cardStyle: 'grid'}}
                          onView={() => onViewRelated(p)}
                       />
                   ))}
               </div>
            </div>

      </div>

      {/* 6. GENERATOR SHEET (The "Magic" Part) */}
      <Sheet open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <SheetContent side="right" className="w-full sm:w-[600px] overflow-y-auto sm:max-w-[600px] p-0 gap-0 border-l shadow-2xl bg-background border-border">
            
            {/* Header */}
            <SheetHeader className="p-8 border-b border-border bg-muted/30 backdrop-blur-xl sticky top-0 z-20 text-left space-y-2">
               <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Generator</span>
               </div>
               <SheetTitle className="text-2xl font-bold tracking-tight">Personalize this Template</SheetTitle>
               <SheetDescription className="text-base text-muted-foreground">
                 Adapt <span className="font-semibold text-foreground">"{prompt.title}"</span> to your specific context.
               </SheetDescription>
            </SheetHeader>

            <div className="p-8 space-y-10">
                
                {/* 1. Context Inputs */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</Label>
                          <Select value={role} onValueChange={setRole}>
                             <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                             <SelectContent>
                                {(ROLES_BY_CATEGORY[category] || []).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry</Label>
                          <Select value={industry} onValueChange={setIndustry}>
                             <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                             <SelectContent>
                                {(INDUSTRIES_BY_CATEGORY[category] || []).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                  
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Outcome</Label>
                        <Input 
                           value={outcome} 
                           onChange={(e) => setOutcome(e.target.value)} 
                           placeholder="e.g. Book a meeting, Get a reply"
                           className="bg-background"
                        />
                    </div>
                </div>

                {/* 2. Strategy Matrix (Embedded) */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Variations</Label>
                      <span className="text-xs text-muted-foreground">{selectedApproaches.length} Selected</span>
                   </div>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {VARIANT_TEMPLATES.slice(0, 6).map((tmpl, idx) => {
                         const isSelected = selectedApproaches.includes(idx);
                         const isLocked = !isPro && idx > 2;
                         return (
                            <button
                               key={idx}
                               onClick={() => toggleApproach(idx)}
                               className={cn(
                                  "relative h-20 rounded-lg border flex flex-col items-center justify-center text-center p-2 transition-all",
                                  isSelected 
                                    ? "bg-primary/5 text-primary border-primary ring-1 ring-primary/20" 
                                    : "bg-card text-muted-foreground border-border hover:border-primary/50",
                                  isLocked && "opacity-60 cursor-not-allowed bg-muted/50"
                               )}
                            >
                               <span className="text-xs font-bold mb-0.5">{tmpl.approach}</span>
                               <span className="text-[9px] text-muted-foreground leading-tight">{tmpl.desc}</span>
                               {isSelected && <CheckCircle2 className="w-3 h-3 absolute top-1.5 right-1.5 text-primary" />}
                               {isLocked && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 text-muted-foreground" />}
                            </button>
                         );
                      })}
                   </div>
                   {!isPro && (
                      <div className="text-[10px] text-center text-muted-foreground bg-muted/30 py-2 rounded-md border border-border/50">
                         Unlock <span className="font-bold">Creative, Technical, & Viral</span> modes with Pro
                      </div>
                   )}
                </div>

                {/* 3. Generate Action */}
                <div className="pt-4 border-t border-border">
                    {!generatedResults && !isGenerating && (
                        <Button 
                            size="lg" 
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                            onClick={handleGenerate}
                            disabled={!outcome}
                        >
                            <Sparkles className="w-4 h-4 mr-2" /> Generate Variations
                        </Button>
                    )}

                    {isGenerating && (
                        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <RotateCw className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm font-medium text-primary animate-pulse">Analyzing context & generating...</p>
                        </div>
                    )}

                    {/* 4. Results Display (Inside Sheet) */}
                    {generatedResults && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
                           
                           {/* (Inline gate removed as requested - moving to Dialog) */}

                           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                               <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Generated successfully</span>
                           </div>

                           <div className={cn("space-y-4", !session && "filter blur-md opacity-20 pointer-events-none select-none")}>
                              {generatedResults.map((res, i) => (
                                 <div key={i} className="group relative bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-center mb-2">
                                       <Badge variant="secondary" className="text-[10px]">{res.approach}</Badge>
                                       <div className="flex gap-1">
                                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSave(res.content, res.type)}><Save className="w-3 h-3" /></Button>
                                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(res.content)}><Copy className="w-3 h-3" /></Button>
                                       </div>
                                    </div>
                                    <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                       {res.content}
                                    </div>
                                 </div>
                              ))}
                           </div>
                           
                           <Button variant="outline" className="w-full" onClick={() => setGeneratedResults(null)}>
                               Generate Again
                           </Button>
                        </div>
                    )}
                </div>

            </div>
        </SheetContent>
      </Sheet>

      {/* Login Modal (Full Screen) */}
      <Dialog open={showLoginGate} onOpenChange={setShowLoginGate}>
         <DialogContent className="sm:max-w-md text-center p-10 gap-8 border-border shadow-2xl">
             <DialogHeader className="space-y-4">
                 <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Sparkles className="w-8 h-8" />
                 </div>
                 <DialogTitle className="text-3xl font-bold text-center tracking-tight">Your Variations are Ready</DialogTitle>
                 <DialogDescription className="text-center text-lg pt-2 text-muted-foreground leading-relaxed">
                     Join Terrivio Signal Explorer to unlock your <span className="font-bold text-foreground">{generatedResults?.length || 3} personalized variations</span>.
                 </DialogDescription>
             </DialogHeader>
             
             <div className="flex flex-col gap-4 w-full">
                 <Button size="xl" className="w-full gap-3 relative overflow-hidden h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] transition-transform" onClick={handleGoogleLogin}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#FFFFFF"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#FFFFFF"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FFFFFF"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#FFFFFF"
                        />
                    </svg>
                    Continue with Google
                 </Button>
                 
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                 </div>

                 <Button variant="outline" size="xl" className="w-full h-14 text-base font-medium border-border hover:bg-muted hover:text-foreground" asChild>
                    <Link to="/signin">Continue with Email</Link>
                 </Button>
             </div>
             
             <DialogFooter className="flex flex-col sm:flex-col gap-2 sm:justify-center">
                <p className="text-xs text-center text-muted-foreground w-full">
                  By clicking continue, you agree to our Terms of Service and Privacy Policy.
                </p>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => { setShowLoginGate(false); setIsGeneratorOpen(false); }}
                >
                    Back to preview
                </Button>
             </DialogFooter>
         </DialogContent>
      </Dialog>

    </div>
  );
}

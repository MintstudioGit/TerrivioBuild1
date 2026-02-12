import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation, Navigate } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { 
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { cn } from "./ui/utils";
import { generateWithQualityGate } from "./prompt-quality-gate";
import { useDesignContext } from "./DesignController";
import { ThemeConfig } from "./PromptCard";
import { PromptLandingPage } from "./PromptLandingPage";
import { TAXONOMY, CATEGORIES } from "../utils/taxonomy";
import { slugify } from "../utils/slugify";
import { DirectoryLevelOne, DirectoryLevelTwo, DirectoryLevelThree } from "./directory/DirectoryLevels";
import { SignalExplorer, MODELS } from "./directory/SignalExplorer";

// --- Types ---

// "System Default" strictly adheres to globals.css variables
const SYSTEM_THEME = {
  bg: "bg-background",
  text: "text-foreground",
  textMuted: "text-muted-foreground",
  card: "bg-card",
  cardBorder: "border-border",
  cardHover: "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
  buttonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  buttonSecondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  explorer: "bg-card border-border shadow-sm",
  explorerHeader: "bg-muted/30 border-border",
  input: "bg-input border-border text-foreground focus-visible:ring-ring",
  badgeSignal: "bg-primary/10 text-primary border-primary/20 border",
  badgeCategory: "bg-secondary text-secondary-foreground border-transparent border",
  radius: "rounded-lg",
};

const generateSignalMetadata = (signal: string, category: string) => {
    const signalLower = signal.toLowerCase();
    
    // Determine verb based on signal type
    let signalVerb = `achieve ${signalLower}`;
    if (["high", "low", "quick", "fast", "rapid"].some(w => signalLower.includes(w))) {
        signalVerb = `achieve ${signalLower}`;
    } else if (["generated", "created", "booked", "scheduled", "sent", "signed", "closed"].some(w => signalLower.includes(w))) {
        signalVerb = `generate ${signalLower}`;
    } else if (["optimized", "ready", "tested", "safe", "hardened"].some(w => signalLower.includes(w))) {
        signalVerb = `create ${signalLower} outputs`;
    } else if (["friendly", "accessible", "aligned", "appealing"].some(w => signalLower.includes(w))) {
        signalVerb = `design for ${signalLower}`;
    }

    // Create benefit description
    let signalBenefit = `achieve ${signalLower}`;
    if (signal.includes("High") || signal.includes("Low")) {
        signalBenefit = `achieve ${signalLower} results`;
    } else if (signal.includes("Ready") || signal.includes("Tested")) {
        signalBenefit = `create ${signalLower} solutions`;
    } else if (signal.includes("Optimized")) {
        signalBenefit = `deliver ${signalLower} performance`;
    }

    const ctaFocus = `achieving ${signalLower}`;
    
    // Create signal phrase for title
    let signalPhrase = `for ${signal}`;
    if (signal.includes("High")) {
        signalPhrase = `for ${signal}`;
    } else if (signal.includes("Low")) {
        signalPhrase = `with ${signal}`;
    }

    return { signalVerb, signalBenefit, ctaFocus, signalPhrase };
};

const generatePrompts = (count: number, context: { model: string, category: string, useCase: string, signal: string }, type: 'signal' | 'category') => {
  const nouns = ["Generator", "Builder", "Assistant", "Architect", "Expert", "Creator", "Engine", "Optimizer"];
  const adjectives = ["Advanced", "Smart", "Automated", "Strategic", "Pro", "Intelligent", "Dynamic", "Custom"];

  let targetSignals = [context.signal];
  
  if (type === 'category') {
      const catSignals = TAXONOMY[context.category]?.signals || [];
      const startIndex = catSignals.indexOf(context.signal);
      targetSignals = Array.from({length: count}).map((_, i) => {
          const idx = (startIndex + i + 1) % catSignals.length;
          return catSignals[idx] || context.signal;
      });
  } else {
      targetSignals = Array(count).fill(context.signal);
  }

  return targetSignals.map((sig, i) => {
    const meta = generateSignalMetadata(sig, context.category);
    // Use the ported engine logic
    const gateResult = generateWithQualityGate({
        useCase: context.useCase,      // useCase
        outcome: sig,                  // outcome (signal acts as the desired outcome)
        role: "Expert",             // role
        industry: context.category,     // industry (using category as proxy)
        category: context.category,     // category
        signal: sig                   // signal
    });
    const fullContent = gateResult.prompt;
    
    // Calculate Reusability Score (SaaS Feature)
    const baseUses = 1000 + (i * 342) % 4000;
    const variantCount = 5 + (i * 3) % 15;
    const hasVariables = true; // All engine prompts have variables
    const copyCount = 200 + (i * 50) % 500;
    
    // Formula: Uses (30) + Variants (20) + Variables (20) + Copies (20) + Recent (10)
    const scoreUses = Math.min(30, Math.floor((baseUses / 5000) * 30));
    const scoreVariants = Math.min(20, Math.floor((variantCount / 20) * 20));
    const scoreVars = hasVariables ? 20 : 0;
    const scoreCopies = Math.min(20, Math.floor((copyCount / 500) * 20));
    const scoreRecent = 10; // Mocked recent activity
    
    const reusabilityScore = scoreUses + scoreVariants + scoreVars + scoreCopies + scoreRecent;

    const noun = nouns[i % nouns.length];
    const adj = adjectives[i % adjectives.length];
    
    // For 'signal' view, we want variations of the SAME signal
    // For 'category' view, the signal name itself provides variety
    let title = "";
    if (type === 'signal') {
        title = `${adj} ${sig} ${noun}`;
    } else {
        title = `${sig} ${context.useCase}`;
    }

    // Database Flag Simulation: Manual Breakout (Tier B -> A override)
    // In a real app, this boolean would come from the 'prompts' table
    const isManualBreakout = i === 1; 

    return {
      id: `${type}-${i}-${slugify(sig)}`,
      manualBreakout: isManualBreakout,
      title: title,
      badge: sig,
      uses: baseUses,
      tags: [context.model, context.category, "Pro"],
      rating: (4.5 + (i * 0.1) % 0.5).toFixed(1),
      author: "PromptVault",
      verified: i % 3 === 0,
      saves: 2000 + (i * 123) % 1000,
      ratingsCount: 120 + (i * 45) % 500,
      description: `Designed to ${meta.signalVerb} and ${meta.signalBenefit}. Perfect for ${meta.ctaFocus}.`,
      signalPhrase: meta.signalPhrase,
      verb: meta.signalVerb,
      benefit: meta.signalBenefit,
      cta: meta.ctaFocus,
      useCase: context.useCase,
      signal: sig,
      content: fullContent,
      // SaaS Features
      reusabilityScore,
      reusabilityBreakdown: [
        { label: "Usage Volume", value: scoreUses, max: 30 },
        { label: "Variant Depth", value: scoreVariants, max: 20 },
        { label: "Variables", value: scoreVars, max: 20 },
        { label: "Pro Copies", value: scoreCopies, max: 20 },
        { label: "Recent Activity", value: scoreRecent, max: 10 },
      ]
    };
  });
};

// --- SEO Management ---

function SEOHead({ 
  title, 
  description, 
  path,
  tier = 'A',
  categorySlug
}: { 
  title: string, 
  description: string, 
  path: string,
  tier?: 'A' | 'B' | 'C',
  categorySlug?: string
}) {
  useEffect(() => {
    // 1. Normalize Path (Lowercase, remove trailing slash)
    const normalizedPath = path.toLowerCase().replace(/\/+$/, "") || "/";
    const origin = window.location.origin;

    // 2. Update Title
    document.title = title;

    // 3. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 4. Update Robots Meta (Tier Logic)
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    
    // Tier C = Noindex
    if (tier === 'C') {
        robotsMeta.setAttribute('content', 'noindex,follow');
    } else {
        robotsMeta.setAttribute('content', 'index,follow');
    }

    // 5. Update Canonical (Tier Logic)
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }

    let canonicalUrl = origin + normalizedPath;
    
    // Tier B = Points to Category Parent (Safe Default)
    // Prevents thin content/cannibalization unless manually broken out (which upgrades to Tier A)
    if (tier === 'B' && categorySlug) {
        canonicalUrl = `${origin}/prompts/${categorySlug.toLowerCase()}`;
    }

    linkCanonical.setAttribute('href', canonicalUrl);
  }, [title, description, path, tier, categorySlug]);

  return null;
}

// --- Layout & Content Wrapper ---

function DirectoryPageContent({ theme, category, useCase, signal }: { theme: ThemeConfig, category: string, useCase: string, signal: string }) {
  const { userState } = useDesignContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- Tier Calculation Logic ---
  const getPromptTier = (prompt: any): 'A' | 'B' | 'C' => {
     if (!prompt) return 'A'; // Default safe
     if (prompt.manualBreakout) return 'A';
     const structureScore = 85 + (prompt.uses % 15);
     const similarityScore = 0.5 + ((prompt.uses % 30) / 100);
     const reuseScore = prompt.reusabilityScore;
     if (structureScore >= 90 && similarityScore <= 0.65 && reuseScore >= 60) return 'A';
     if (structureScore >= 80 && similarityScore <= 0.75) return 'B';
     return 'C';
  };

  // Model is effectively a filter now
  const [selectedModel, setSelectedModel] = useState("GPT-4");

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(true);

  const handleOpenExplorer = (colId: string) => {
      setIsExplorerCollapsed(false);
      setTimeout(() => scrollToColumn(colId), 300);
  };

  const navigateTo = (newModel: string, newCategory: string, newUseCase: string, newSignal: string) => {
    // New Flat URL Structure: /prompts/{category}/{use-case}-{signal}
    const catSlug = slugify(newCategory);
    const ucSlug = slugify(newUseCase);
    const sigSlug = slugify(newSignal);
    
    // We don't have model in URL, so we update state or just keep it local
    setSelectedModel(newModel);

    navigate(`/prompts/${catSlug}/${ucSlug}-${sigSlug}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleModelSelect = (newModel: string) => setSelectedModel(newModel); // Only updates local state
  const handleCategorySelect = (newCategory: string) => {
    // Navigate to category page
    navigate(`/prompts/${slugify(newCategory)}`);
  };
  const handleUseCaseSelect = (newUseCase: string) => navigateTo(selectedModel, category, newUseCase, signal);
  const handleSignalSelect = (newSignal: string) => navigateTo(selectedModel, category, useCase, newSignal);

  // Scroll to explorer column function
  const scrollToColumn = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      el.classList.add('ring-4', 'ring-primary', 'bg-primary/5', 'scale-[1.02]', 'shadow-xl');
      setTimeout(() => el.classList.remove('ring-4', 'ring-primary', 'bg-primary/5', 'scale-[1.02]', 'shadow-xl'), 1200);
    }
  };

  // Search Logic
  const availableUseCases = TAXONOMY[category]?.useCases || [];
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return availableUseCases.filter(uc => uc.toLowerCase().includes(query)).map(uc => ({
       label: uc, type: "Use Case", action: () => navigateTo(selectedModel, category, uc, signal)
    })).slice(0, 5);
  }, [searchQuery, availableUseCases, selectedModel, category, signal]);

  const signalPrompts = useMemo(() => 
    generatePrompts(1, { model: selectedModel, category: category, useCase: useCase, signal: signal }, 'signal'),
    [selectedModel, category, useCase, signal]
  );

  const categoryPrompts = useMemo(() => 
    generatePrompts(6, { model: selectedModel, category: category, useCase: useCase, signal: signal }, 'category'),
    [selectedModel, category, useCase, signal]
  );

  const currentPrompt = signalPrompts[0];
  const currentTier = getPromptTier(currentPrompt);

  const pageTitle = `${useCase} for ${signal} - ${category} Prompts | Terrivio`;
  const pageDescription = `Generate expert ${signal} for ${useCase}. Optimized for ${category} professionals using ${selectedModel}.`;

  return (
    <div className={cn("flex-grow flex flex-col font-[var(--font-family-inter)] transition-colors duration-500", theme.bg, theme.text)}>
      <SEOHead 
        title={pageTitle} 
        description={pageDescription} 
        path={location.pathname} 
        tier={currentTier}
        categorySlug={slugify(category)}
      />
      
      {/* Hero Header Area - Redesigned */}
      <div className="relative border-b border-border bg-background overflow-hidden">
         {/* Subtle Background Pattern */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none opacity-50" />

         <div className="relative max-w-[1600px] mx-auto px-6 py-12 md:py-16 z-10 flex flex-col items-center text-center">
             <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Breadcrumb>
                  <BreadcrumbList className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/prompts" className="hover:text-primary transition-colors">Directory</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-border" />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/prompts/${slugify(category)}`} className="hover:text-primary transition-colors">{category}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-border" />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/prompts/${slugify(category)}/${slugify(useCase)}`} className="hover:text-primary transition-colors">{useCase}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-border" />
                    <BreadcrumbItem><BreadcrumbPage className="text-foreground">{signal}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-5xl animate-in fade-in slide-in-from-bottom-3 duration-700">
              <span className="text-muted-foreground font-medium opacity-60">Advanced </span> 
              <span 
                onClick={() => handleOpenExplorer('col-usecase')}
                className="text-foreground border-b-2 border-foreground/10 hover:border-primary pb-1 px-1 cursor-pointer transition-all hover:bg-primary/5 hover:text-primary"
                title="Change Use Case"
              >
                {useCase}
              </span>
              <span className="text-muted-foreground font-medium opacity-60"> Prompts</span>
              <br className="hidden sm:block" />
              <span className="text-muted-foreground font-medium opacity-60">optimized for </span>
              <span 
                onClick={() => handleOpenExplorer('col-signal')}
                className="text-primary border-b-2 border-primary/20 hover:border-primary pb-1 px-1 cursor-pointer transition-all hover:bg-primary/10"
                title="Change Signal"
              >
                {signal}
              </span>
            </h1>

            {currentPrompt && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {currentPrompt.description}
              </p>
            )}
            
            {/* Compact Badges */}
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border shadow-sm">
                 <Cpu className="w-3.5 h-3.5 text-primary" />
                 <span>Optimized for <span className="font-bold text-foreground">{selectedModel}</span></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border shadow-sm">
                 <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                 <span>Verified by Engineers</span>
              </div>
            </div>

            {/* State Banners */}
            {userState === 'free' && (
               <div className="mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 max-w-xl w-full flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-700">
                  <div className="text-left text-sm text-muted-foreground">
                     <span className="font-bold text-amber-600 block mb-0.5">Free Plan Limit Reached Soon</span>
                     Unlock unlimited prompt generations with Pro.
                  </div>
                  <Button size="sm" variant="outline" className="border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700 text-amber-600 font-bold" asChild>
                     <Link to="/pricing">Upgrade</Link>
                  </Button>
               </div>
            )}
         </div>
      </div>

      {/* Main Content - Compacted Spacing */}
      <div className="px-6 py-6 mx-auto w-full max-w-5xl flex flex-col gap-8">
        
        {/* Explorer (Compacted) */}
        <div className="w-full">
           <SignalExplorer 
             selectedModel={selectedModel} onModelSelect={handleModelSelect}
             selectedCategory={category} onCategorySelect={handleCategorySelect}
             selectedUseCase={useCase} onUseCaseSelect={handleUseCaseSelect}
             selectedSignal={signal} onSignalSelect={handleSignalSelect}
             theme={theme}
             isCollapsed={isExplorerCollapsed}
             setIsCollapsed={setIsExplorerCollapsed}
             searchQuery={searchQuery}
             setSearchQuery={setSearchQuery}
             showSuggestions={showSuggestions}
             setShowSuggestions={setShowSuggestions}
             searchSuggestions={searchSuggestions}
           />
        </div>

        {/* Results */}
           <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
               <PromptLandingPage 
                  prompt={signalPrompts[0]} 
                  relatedPrompts={categoryPrompts}
                  theme={theme}
                  onViewRelated={(p) => navigateTo(selectedModel, category, p.useCase, p.signal)}
                  selectedUseCase={useCase}
                  selectedSignal={signal}
                  onUseCaseClick={() => handleOpenExplorer('col-usecase')}
                  onSignalClick={() => handleOpenExplorer('col-signal')}
                  categorySlug={slugify(category)}
               />
           </div>
      </div>
    </div>
  );
}

// --- Global App Header ---

export function DirectoryPage() {
  const { category, slug } = useParams();
  
  // 1. Root Level (/prompts)
  if (!category) {
    return (
      <div className="flex flex-col flex-1 bg-background text-foreground font-[var(--font-family-inter)] selection:bg-primary/20">
        <DirectoryLevelOne model="GPT-4" />
      </div>
    );
  }

  // 2. Validate Category
  const matchedCategory = CATEGORIES.find(c => slugify(c) === slugify(category));
  if (!matchedCategory) {
     return <Navigate to="/prompts" replace />;
  }
  const catData = TAXONOMY[matchedCategory];

  // 3. Category Level (/prompts/:category)
  if (!slug) {
    return (
      <div className="flex flex-col flex-1 bg-background text-foreground font-[var(--font-family-inter)] selection:bg-primary/20">
        <DirectoryLevelTwo model="GPT-4" category={matchedCategory} />
      </div>
    );
  }

  // 4. Parse Slug (Greedy Match Strategy)
  // Slug format: {use-case}-{signal} OR {use-case}
  const useCases = catData.useCases || [];
  const signals = catData.signals || [];
  
  // Sort Use Cases by length (descending) to match longest prefix first
  const sortedUseCases = [...useCases].sort((a, b) => b.length - a.length);
  
  for (const uc of sortedUseCases) {
     const ucSlug = slugify(uc);
     
     // Case A: Exact Match for Use Case (Level 3 View)
     if (slug === ucSlug) {
        return (
           <div className="flex flex-col flex-1 bg-background text-foreground font-[var(--font-family-inter)] selection:bg-primary/20">
             <DirectoryLevelThree model="GPT-4" category={matchedCategory} motion={uc} />
           </div>
        );
     }

     // Case B: Use Case + Signal Match (Level 4 View)
     if (slug.startsWith(ucSlug + "-")) {
        const remainder = slug.substring(ucSlug.length + 1); // remove prefix and dash
        
        // Try to match remainder to a signal
        // We iterate signals to find exact match
        const matchedSignal = signals.find(s => slugify(s) === remainder);
        
        if (matchedSignal) {
           return (
             <div className="flex flex-col flex-1 bg-background text-foreground font-[var(--font-family-inter)] selection:bg-primary/20">
                <DirectoryPageContent 
                   theme={SYSTEM_THEME} 
                   category={matchedCategory}
                   useCase={uc}
                   signal={matchedSignal}
                />
             </div>
           );
        }
     }
  }

  // Fallback: If parsing fails, redirect to Category page
  return <Navigate to={`/prompts/${slugify(matchedCategory)}`} replace />;
}
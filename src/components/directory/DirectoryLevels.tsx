import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { 
  ArrowRight, 
  LayoutGrid, 
  Target, 
  BarChart3, 
  Cpu, 
  Briefcase, 
  PenTool, 
  Code, 
  Palette, 
  Users, 
  Zap, 
  Search, 
  Shield, 
  Headphones, 
  Globe, 
  Video, 
  Megaphone, 
  Heart, 
  Gamepad2, 
  Music, 
  Home, 
  ShoppingBag, 
  Stethoscope, 
  Calendar, 
  Map, 
  GraduationCap, 
  Database,
  Building2,
  Shirt,
  HandHeart
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { AppPageTopBar } from "../AppPageTopBar";
import { Button } from "../ui/button";
import { TAXONOMY, CATEGORIES } from "../../utils/taxonomy";
import { slugify } from "../../utils/slugify";
import { SignalExplorer } from "./SignalExplorer";

// --- Icons Mapping ---
const CATEGORY_ICONS: Record<string, any> = {
  "Sales": Briefcase,
  "Marketing": Megaphone,
  "Content": PenTool,
  "Writing": PenTool,
  "Product": Target,
  "Development": Code,
  "Design": Palette,
  "Customer Success": Headphones,
  "Operations": Zap,
  "Analytics": BarChart3,
  "HR & Recruiting": Users,
  "Legal": Shield,
  "Finance": BarChart3,
  "Education": GraduationCap,
  "Real Estate": Home,
  "E-commerce": ShoppingBag,
  "Healthcare": Stethoscope,
  "Executive Admin": Calendar,
  "Social Media": Globe,
  "Event Planning": Calendar,
  "Travel & Logistics": Map,
  "Academic Research": Search,
  "Data Science": Database,
  "Cybersecurity": Shield,
  "IT Support": Cpu,
  "Quality Assurance": Shield,
  "Localization": Globe,
  "Video & Media": Video,
  "Public Relations": Megaphone,
  "Fundraising": Heart,
  "Gaming": Gamepad2,
  "Music": Music,
  "Architecture": Building2,
  "Fashion": Shirt,
  "Nonprofit": HandHeart
};

// --- Helper Components ---

function DirectoryHeader({ title, subline, breadcrumbs, badge, align = "center" }: { title: React.ReactNode, subline: string, breadcrumbs: React.ReactNode, badge?: string, align?: "center" | "left" }) {
  return (
    <div className="relative border-b border-border bg-background overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="relative max-w-[1600px] mx-auto px-6 py-16 md:py-24 z-10">
        <div className={cn("flex flex-col gap-6 max-w-4xl", align === "center" ? "items-center text-center mx-auto" : "items-start text-left")}>
          
          {/* Breadcrumbs Wrapper */}
          <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-1.5 shadow-sm mb-2">
            {breadcrumbs}
          </div>

          <div className={cn("space-y-6", align === "center" && "flex flex-col items-center")}>
             {badge && (
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold transition-colors text-primary uppercase tracking-wider shadow-[0_0_10px_-3px_rgba(var(--primary),0.3)]">
                  {badge}
                </div>
             )}
             
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm">
               {title}
             </h1>
             
             <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
               {subline}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectoryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
}

function DirectoryCard({ 
  to, 
  title, 
  description, 
  icon: Icon, 
  cta = "Explore outcomes", 
  badge 
}: { 
  to: string, 
  title: string, 
  description?: string, 
  icon?: any, 
  cta?: string,
  badge?: string 
}) {
  return (
    <Link 
      to={to} 
      className="group relative flex flex-col h-full bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {Icon ? <Icon className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
        </div>
        {badge && (
          <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-muted text-muted-foreground border border-border/50">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      
      {description && (
        <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="mt-auto flex items-center text-sm font-semibold text-primary">
        {cta} <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

// --- Explorer Wrapper ---

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

function DirectoryExplorerContainer({ 
  initialModel = "GPT-4", 
  initialCategory = "Sales", 
  initialUseCase, 
  initialSignal 
}: any) {
  const navigate = useNavigate();
  
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Default to collapsed on directory pages to keep focus on grid
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(true);

  // Initialize defaults if missing
  const categoryData = TAXONOMY[initialCategory];
  const useCase = initialUseCase || categoryData?.useCases[0] || "";
  const signal = initialSignal || categoryData?.signals[0] || "";

  const navigateTo = (newModel: string, newCategory: string, newUseCase: string, newSignal: string) => {
    const catSlug = slugify(newCategory);
    const ucSlug = slugify(newUseCase);
    const sigSlug = slugify(newSignal);
    
    setSelectedModel(newModel);
    navigate(`/prompts/${catSlug}/${ucSlug}-${sigSlug}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleModelSelect = (newModel: string) => setSelectedModel(newModel);
  const handleCategorySelect = (newCategory: string) => navigate(`/prompts/${slugify(newCategory)}`);
  const handleUseCaseSelect = (newUseCase: string) => navigateTo(selectedModel, initialCategory, newUseCase, signal);
  const handleSignalSelect = (newSignal: string) => navigateTo(selectedModel, initialCategory, useCase, newSignal);

  const availableUseCases = categoryData?.useCases || [];
  
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return availableUseCases.filter(uc => uc.toLowerCase().includes(query)).map(uc => ({
       label: uc, type: "Use Case", action: () => navigateTo(selectedModel, initialCategory, uc, signal)
    })).slice(0, 5);
  }, [searchQuery, availableUseCases, selectedModel, initialCategory, signal]);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 w-full">
       <SignalExplorer 
         selectedModel={selectedModel} onModelSelect={handleModelSelect}
         selectedCategory={initialCategory} onCategorySelect={handleCategorySelect}
         selectedUseCase={useCase} onUseCaseSelect={handleUseCaseSelect}
         selectedSignal={signal} onSignalSelect={handleSignalSelect}
         theme={SYSTEM_THEME}
         isCollapsed={isExplorerCollapsed}
         setIsCollapsed={setIsExplorerCollapsed}
         searchQuery={searchQuery}
         setSearchQuery={setSearchQuery}
         showSuggestions={showSuggestions}
         setShowSuggestions={setShowSuggestions}
         searchSuggestions={searchSuggestions}
       />
    </div>
  );
}

// --- Level 1: Platform (GPT-4) ---

export function DirectoryLevelOne({ model }: { model: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-[1600px] mx-auto w-full px-6 pt-8">
        <AppPageTopBar right={<Button variant="outline" asChild><Link to="/generator">Open Generator</Link></Button>} />
      </div>
      <DirectoryHeader 
        align="center"
        badge="Platform Directory"
        breadcrumbs={
           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest justify-center">
             <Link to="/prompts" className="hover:text-primary transition-colors">Directory</Link>
             <span className="text-border">/</span>
             <span className="text-foreground">{model}</span>
           </div>
        }
        title={<>High-Impact <span className="text-primary">{model}</span> Workflows</>}
        subline={`Explore outcome-driven prompt systems optimized specifically for ${model} reasoning and reliability.`}
      />
      
      <DirectoryExplorerContainer initialModel={model} initialCategory="Sales" />
      
      <DirectoryGrid>
        {CATEGORIES.map((category) => {
           const Icon = CATEGORY_ICONS[category] || LayoutGrid;
           return (
             <DirectoryCard
               key={category}
               to={`/prompts/${slugify(category)}`}
               title={category}
               icon={Icon}
               description={`Professional ${category.toLowerCase()} workflows optimized for ${model}.`}
               cta="Explore outcomes"
             />
           );
        })}
      </DirectoryGrid>
    </div>
  );
}

// --- Level 2: Domain (Category) ---

export function DirectoryLevelTwo({ model, category }: { model: string, category: string }) {
  const catData = TAXONOMY[category];
  
  if (!catData) {
    return <div className="p-12 text-center">Category not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DirectoryHeader 
        align="center"
        badge={`${category} Systems`}
        breadcrumbs={
           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest justify-center">
             <Link to={`/prompts`} className="hover:text-primary transition-colors">Directory</Link>
             <span className="text-border">/</span>
             <Link to={`/prompts`} className="hover:text-primary transition-colors">{model}</Link>
             <span className="text-border">/</span>
             <span className="text-foreground">{category}</span>
           </div>
        }
        title={<>{model} <span className="text-primary">{category}</span> Library</>}
        subline={`Outcome-driven prompts designed for real ${category.toLowerCase()} workflows — from planning to execution.`}
      />
      
      <DirectoryExplorerContainer initialModel={model} initialCategory={category} />

      <DirectoryGrid>
        {catData.useCases.map((useCase) => (
          <DirectoryCard
            key={useCase}
            to={`/prompts/${slugify(category)}/${slugify(useCase)}`}
            title={useCase}
            icon={Target}
            description={`Achieve specific ${useCase.toLowerCase()} outcomes with precision prompts.`}
            cta="View outcomes"
          />
        ))}
      </DirectoryGrid>
    </div>
  );
}

// --- Level 3: Motion (Use Case) ---

export function DirectoryLevelThree({ model, category, motion }: { model: string, category: string, motion: string }) {
  const catData = TAXONOMY[category];
  
  if (!catData) {
    return <div className="p-12 text-center">Category not found</div>;
  }

  // Find the original casing for the motion if possible
  const originalMotion = catData.useCases.find(uc => slugify(uc) === slugify(motion)) || motion;

  return (
    <div className="flex flex-col min-h-screen">
      <DirectoryHeader 
        align="center"
        badge="Actionable Use Cases"
        breadcrumbs={
           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest justify-center flex-wrap">
             <Link to={`/prompts`} className="hover:text-primary transition-colors">Directory</Link>
             <span className="text-border">/</span>
             <Link to={`/prompts`} className="hover:text-primary transition-colors">{model}</Link>
             <span className="text-border">/</span>
             <Link to={`/prompts/${slugify(category)}`} className="hover:text-primary transition-colors">{category}</Link>
             <span className="text-border">/</span>
             <span className="text-foreground">{originalMotion}</span>
           </div>
        }
        title={<><span className="text-primary">{originalMotion}</span> Outcomes</>}
        subline={`Proven prompt systems designed to achieve specific ${category.toLowerCase()} outcomes via ${originalMotion.toLowerCase()}.`}
      />
      
      <DirectoryExplorerContainer initialModel={model} initialCategory={category} initialUseCase={originalMotion} />

      <DirectoryGrid>
        {catData.signals.map((signal, index) => (
          <DirectoryCard
            key={signal}
            to={`/prompts/${slugify(category)}/${slugify(motion)}-${slugify(signal)}`}
            title={signal}
            icon={BarChart3}
            badge="Outcome"
            description={`Prompt system to reliably ${signal.toLowerCase()} using ${model}.`}
            cta="View prompt"
          />
        ))}
      </DirectoryGrid>
    </div>
  );
}

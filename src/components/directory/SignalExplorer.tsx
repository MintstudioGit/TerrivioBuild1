import { useEffect, useMemo, useState } from "react";
import { 
  ChevronRight, 
  Search, 
  Cpu, 
  LayoutGrid, 
  Target, 
  BarChart3, 
  Filter,
  Check 
} from "lucide-react";
import { cn } from "../ui/utils";
import { Input } from "../ui/input";
import { TAXONOMY, CATEGORIES } from "../../utils/taxonomy";
import { slugify } from "../../utils/slugify";

export const MODELS = ["GPT-4", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "GPT-4o"];

// MOVED OUTSIDE to prevent re-mounting issues
const ListSection = ({ id, title, tooltip, items, selected, onSelect, isSignal = false, icon: Icon, theme }: any) => {
  // Auto-scroll active item into view
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeItem = document.getElementById(`item-${slugify(selected)}`);
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure render
    return () => clearTimeout(timer);
  }, [selected]);

  return (
    <div id={id} className={cn("flex flex-col gap-0.5 scroll-mt-24 transition-all duration-500", theme.layout === 'dashboard' ? "min-w-[140px]" : "h-full overflow-hidden")}>
      <div className="flex items-center gap-1.5 mb-2 px-1 group cursor-help relative w-fit">
        {Icon && <Icon className={cn("w-3.5 h-3.5", theme.textMuted)} />}
        <div className={cn("text-[10px] uppercase tracking-wider font-bold", theme.textMuted)}>
          {title}
        </div>
      </div>
      <div className={cn(
        "space-y-1 pr-1",
        theme.layout === 'dashboard' ? "flex flex-col" : "overflow-y-auto custom-scrollbar"
      )}
      style={theme.layout === 'default' || theme.layout === 'centered' ? { maxHeight: '180px' } : {}} 
      >
        {items.map((item: string) => (
          <div 
            key={item}
            id={`item-${slugify(item)}`}
            onClick={() => onSelect(item)}
            className={cn(
              "px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-all flex items-center justify-between group",
              theme.radius,
              selected === item 
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
                : `${theme.text} hover:bg-muted`
            )}
          >
            {item}
            {selected === item && (
              <Check className={cn("w-3 h-3", selected === item ? "text-primary-foreground/70" : "text-primary")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function SignalExplorer({ 
  selectedModel, onModelSelect,
  selectedCategory, onCategorySelect,
  selectedUseCase, onUseCaseSelect,
  selectedSignal, onSignalSelect,
  theme,
  isCollapsed,
  setIsCollapsed,
  searchQuery,
  setSearchQuery,
  showSuggestions,
  setShowSuggestions,
  searchSuggestions
}: any) {
  
  const availableUseCases = TAXONOMY[selectedCategory]?.useCases || [];
  const availableSignals = TAXONOMY[selectedCategory]?.signals || [];

  const containerClasses = cn(
    "flex flex-col w-full border transition-all duration-300 relative z-20",
    theme.explorer,
    theme.radius,
    theme.layout === 'sidebar' ? "h-[calc(100vh-80px)] sticky top-6" : "h-auto" 
  );

  return (
    <div className={containerClasses}>
      {/* Explorer Window Header */}
      <div 
        className={cn(
            "px-4 py-2 flex items-center justify-between border-b bg-muted/20 transition-all", 
            theme.explorerHeader,
            "rounded-t-[inherit]",
            isCollapsed && "rounded-b-[inherit] border-b-0"
        )}
      >
         <div className="flex items-center gap-4 flex-1" onClick={() => setIsCollapsed(!isCollapsed)}>
           <div className="flex gap-1.5 cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
           </div>
           <div className="w-px h-4 bg-border hidden sm:block"></div>
           <div className={cn("text-xs font-medium tracking-tight flex items-center gap-1.5 cursor-pointer", theme.textMuted)}>
             <Filter className="w-3 h-3" />
             <span className="hidden sm:inline">Terrivio Outcome Prompt Explorer</span>
             <span className="sm:hidden">Explorer</span>
           </div>
        </div>

        {/* Compact Search Bar in Header */}
        <div className="relative w-full max-w-xs mx-4 group">
           <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
             <Search className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           </div>
           <Input 
             placeholder="Search outcomes..."
             value={searchQuery}
             onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
             className="pl-8 h-8 text-xs bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-all rounded-md w-full"
           />
           {showSuggestions && searchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl z-[100] text-left ring-1 ring-black/5">
                 {searchSuggestions.map((s: any, i: number) => (
                    <div key={i} onClick={s.action} className="px-3 py-2 text-xs rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors font-medium">
                       {s.label}
                    </div>
                 ))}
              </div>
           )}
        </div>

        <ChevronRight 
          className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 cursor-pointer", !isCollapsed && "rotate-90")} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden bg-card/50",
        isCollapsed ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100"
      )}>
        <div className={cn(
          "p-3 flex-grow",
          theme.layout === 'dashboard' ? "flex gap-4 overflow-x-auto" : 
          theme.layout === 'sidebar' ? "flex flex-col gap-4 overflow-y-auto" :
          "grid grid-cols-2 sm:grid-cols-4 gap-4"
        )}>
          <ListSection 
            id="col-model"
            title="AI Model" 
            tooltip="Which AI should run this prompt?"
            items={MODELS} 
            selected={selectedModel} 
            onSelect={onModelSelect}
            icon={Cpu}
            theme={theme}
          />
          <ListSection 
            id="col-category"
            title="Category" 
            tooltip="What domain are you working in?"
            items={CATEGORIES} 
            selected={selectedCategory} 
            onSelect={onCategorySelect} 
            icon={LayoutGrid}
            theme={theme}
          />
          <ListSection 
            id="col-usecase"
            title="Use Case" 
            tooltip="What's the exact task?"
            items={availableUseCases} 
            selected={selectedUseCase} 
            onSelect={onUseCaseSelect} 
            icon={Target}
            theme={theme}
          />
          <ListSection 
            id="col-signal"
            title="Signal" 
            tooltip="What result do you want?"
            items={availableSignals} 
            selected={selectedSignal} 
            onSelect={onSignalSelect}
            isSignal={true}
            icon={BarChart3}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
import { ArrowRight, Zap } from "lucide-react";
import { cn } from "./ui/utils";

// --- Types ---

export interface ThemeConfig {
  bg: string;
  text: string;
  textMuted: string;
  card: string;
  cardBorder: string;
  cardHover: string;
  buttonPrimary: string;
  buttonSecondary: string;
  explorer: string;
  explorerHeader: string;
  input: string;
  badgeSignal: string;
  badgeCategory: string;
  radius: string;
  cardStyle?: 'default' | 'grid' | 'minimal';
}

export function PromptCardNew({ prompt, theme, onView }: { prompt: any, theme: ThemeConfig, onView: (p: any) => void }) {
  // Logic to extract preview text (first ~150 chars or first section)
  const previewText = prompt.content.slice(0, 150) + "...";

  return (
    <div 
       onClick={() => onView(prompt)}
       className={cn(
         "group relative flex flex-col justify-between overflow-hidden transition-all duration-300 cursor-pointer border hover:shadow-xl hover:-translate-y-1",
         theme.bg,
         theme.cardBorder,
         theme.cardHover,
         theme.radius,
         // Apply grid-specific styles if needed
         "h-[320px] p-5"
       )}
    >
       {/* Top: Badges & Rating */}
       <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-1.5">
             <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", theme.badgeCategory)}>
               {prompt.tags[1]}
             </span>
             {prompt.manualBreakout && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                   Featured
                </span>
             )}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-md">
             <span className="text-amber-500">★</span> {prompt.rating}
          </div>
       </div>

       {/* Middle: Content Preview */}
       <div className="flex-grow flex flex-col relative">
          
          <h3 className={cn("text-base font-bold mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2", theme.text)}>
            {prompt.title}
          </h3>
          
          {prompt.signalPhrase && (
             <div className="text-[10px] uppercase tracking-widest font-bold text-primary/80 mb-2 flex items-center gap-1">
               <Zap className="w-3 h-3" /> {prompt.signalPhrase}
             </div>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {prompt.description}
          </p>

          {/* Text Preview with Blur Effect */}
          <div className="mt-auto mb-4 relative h-28 overflow-hidden rounded bg-muted/20 border border-border/50 group-hover:border-primary/20 transition-colors">
             <div className="p-3 text-[10px] font-mono leading-relaxed text-muted-foreground opacity-90 break-words whitespace-pre-wrap select-none">
                {previewText}
             </div>
             {/* Gradient & Blur Overlay - Starts fading from middle */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-card pointer-events-none" />
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/80 to-transparent backdrop-blur-[1px] pointer-events-none" />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
               <span className="text-primary font-bold">{prompt.uses.toLocaleString()}</span> uses
             </div>
             
             <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
               Open Prompt <ArrowRight className="w-3 h-3 ml-1" />
             </div>
          </div>
       </div>
    </div>
  );
}

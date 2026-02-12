import { Link } from "react-router";
import { Button } from "./ui/button";
import { CheckCircle2, HelpCircle, CreditCard, Sparkles, Zap, ShieldCheck, Layers, BookOpen, Users, Lock, ArrowRight } from "lucide-react";
import { cn } from "./ui/utils";

// --- Theme ---

interface ThemeConfig {
  name: string;
  bg: string;
  text: string;
  textMuted: string;
  card: string;
  cardBorder: string;
  cardHover: string;
  buttonPrimary: string;
  buttonSecondary: string;
  radius: string;
  badgeCategory: string;
  badgeSignal: string;
}

const SYSTEM_THEME: ThemeConfig = {
  name: "System Default",
  bg: "bg-background",
  text: "text-foreground",
  textMuted: "text-muted-foreground",
  card: "bg-card",
  cardBorder: "border-border",
  cardHover: "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
  buttonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  buttonSecondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  radius: "rounded-lg",
  badgeSignal: "bg-primary/10 text-primary border-primary/20 border",
  badgeCategory: "bg-secondary text-secondary-foreground border-transparent border",
};

// --- Components ---

function FeatureItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  const theme = SYSTEM_THEME;
  return (
    <div className={cn("flex gap-4 items-start p-5 rounded-xl border border-transparent hover:border-border/50 transition-colors duration-300 hover:bg-muted/20 group")}>
      <div className={cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-primary/10 group-hover:text-primary", theme.bg, "border border-border shadow-sm")}>
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="space-y-2 p-4 rounded-lg hover:bg-muted/30 transition-colors">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-muted-foreground/70" />
        {question}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed pl-6 border-l-2 border-border/50 ml-2">{answer}</p>
    </div>
  );
}

export function PricingPage() {
  const theme = SYSTEM_THEME;

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-sans selection:bg-primary/20">
      
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-20 relative">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Turn prompts into a real working system.</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground leading-tight">
            Build prompts you can <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">actually reuse</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/10 -rotate-1 rounded-full z-0"></span>
            </span>.
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
            Stop copying prompts. Start building systems.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button size="lg" className={cn("h-12 px-8 text-base font-bold shadow-xl shadow-primary/10 transition-transform hover:scale-105", theme.radius)} asChild>
               <Link to="/upgrade">
                 Upgrade to Pro <ArrowRight className="w-4 h-4 ml-2" />
               </Link>
             </Button>
             <p className="text-xs text-muted-foreground sm:max-w-[150px] text-left leading-tight">
               €9 for your first 30 days. Cancel anytime.
             </p>
          </div>
        </section>

        {/* Value Block - The "One Sentence" Concept */}
        <section className="text-center mb-20">
          <div className="inline-block relative p-8 md:p-10 rounded-2xl bg-muted/20 border border-border/50 max-w-3xl mx-auto">
             <p className="text-xl md:text-2xl font-serif font-medium text-foreground italic leading-relaxed">
               "Prompts are easy to copy. <br/>
               <span className="text-primary not-italic font-bold">Good systems are hard to design.</span>"
             </p>
          </div>
        </section>

        {/* Value Props + Pricing Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-24 items-start">
          
          {/* Left Column: Why Pro? */}
          <div className="lg:col-span-2">
             <div className="mb-8">
               <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-4">
                 <Zap className="w-5 h-5 text-primary" />
                 Why upgrade to Pro?
               </h2>
               <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-8">
                  <p className="text-sm font-medium text-foreground">
                    You don’t pay for text. You pay for clarity, structure, and prompts you can trust in real scenarios.
                  </p>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FeatureItem 
                 icon={BookOpen}
                 title="Unlimited prompt runs"
                 description="Generate as many variations as you need to find the perfect structure."
               />
               <FeatureItem 
                 icon={Layers}
                 title="Save & reuse prompts"
                 description="Build your personal library. Don't start from scratch every time."
               />
               <FeatureItem 
                 icon={ShieldCheck}
                 title="Generate prompt variations"
                 description="Automatically create different tones and formats for the same core task."
               />
               <FeatureItem 
                 icon={Users}
                 title="Personal workspace"
                 description="Organize your prompts into packs and workflows for specific projects."
               />
               <FeatureItem 
                 icon={Lock}
                 title="Private by default"
                 description="Your custom prompts and data remain yours. We don't train on your inputs."
               />
               <FeatureItem 
                 icon={Sparkles}
                 title="Advanced signals"
                 description="Target specific outcomes like 'High Conversion' or 'Speed' explicitly."
               />
             </div>
          </div>

          {/* Right Column: Pricing Card */}
          <div className="lg:col-span-1 h-full">
            <div className={cn(
               "group relative flex flex-col h-full overflow-hidden transition-all duration-500", 
               theme.card, 
               theme.radius,
               theme.cardBorder + " border",
               "shadow-2xl shadow-primary/5 hover:shadow-primary/10 hover:border-primary/30"
            )}>
               {/* Decorative top bar gradient */}
               <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary/40"></div>
               
               <div className="p-8 flex flex-col h-full relative">
                  
                  <div className="mb-8">
                     <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-2">
                        Pro Membership
                     </h3>
                     <p className="text-xs text-muted-foreground mb-4 font-medium">For people who depend on AI.</p>
                     
                     <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold text-foreground tracking-tight">€39</span>
                        <span className="text-muted-foreground font-medium">/mo</span>
                     </div>
                     <p className="text-sm text-emerald-600 font-medium mt-3 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20 inline-block">
                        <span className="font-bold">€9</span> for your first 30 days
                     </p>
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                     <li className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground"><strong className="text-foreground">Unlimited</strong> prompt runs</span>
                     </li>
                     <li className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground"><strong className="text-foreground">Save & Copy</strong> prompts</span>
                     </li>
                     <li className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Generate <strong className="text-foreground">Variations</strong></span>
                     </li>
                     <li className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Build <strong className="text-foreground">Prompt Packs</strong></span>
                     </li>
                  </ul>

                  <div className="text-xs text-muted-foreground italic mb-6 border-l-2 border-border pl-3">
                    "This is not a prompt dump. It’s a working system for people who depend on AI."
                  </div>

                  <Button size="lg" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" asChild>
                     <Link to="/upgrade">
                        Upgrade to Pro
                     </Link>
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-60">
                     <CreditCard className="w-3 h-3" />
                     <span>Secure Payment via Stripe</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto mb-24">
           <div className="flex items-center gap-2 mb-8 justify-center">
              <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                 <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Common Questions</h2>
           </div>
           
           <div className="grid gap-4">
             <FaqItem 
               question="What does 'Pro Access' include?" 
               answer="You get the full, unredacted source code for every prompt system in the library, plus the ability to save your own collections, generate variations, and build workflows."
             />
             <FaqItem 
               question="How does the €9 trial work?" 
               answer="You get full Pro privileges for 30 days for just €9. This lets you validate the ROI in your actual workflow before the standard rate applies."
             />
             <FaqItem 
               question="Can I cancel anytime?" 
               answer="Yes. There are no long-term contracts. You can cancel your subscription at any time from your account settings."
             />
           </div>
        </section>

      </main>
    </div>
  );
}

import { useParams, Link, Navigate, useNavigate } from "react-router";
import { WORKFLOW_PACKS, WorkflowPack } from "./prompt-engine";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, CheckCircle2, Layers, Zap, ArrowRight, ShieldCheck, Play } from "lucide-react";
import { cn } from "./ui/utils";
import { useDesignContext } from "./DesignController";

export function PackLandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userState } = useDesignContext();
  const isPro = userState === 'pro';

  // Find the pack based on the URL slug (which we assume is the pack ID)
  const pack = WORKFLOW_PACKS.find(p => p.id === slug);

  if (!pack) {
    return <Navigate to="/marketplace" replace />;
  }

  const handleUsePack = () => {
    navigate(`/packs?pack=${pack.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation / Breadcrumbs */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="pl-0 gap-2 text-muted-foreground hover:text-foreground">
                 <Link to="/marketplace">
                    <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                 </Link>
              </Button>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2 text-sm font-medium">
                 <span className="text-muted-foreground">{pack.category}</span>
                 <span className="text-border">/</span>
                 <span className="text-foreground">{pack.name}</span>
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-12 pb-24">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
           <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                 <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    {pack.industry}
                 </Badge>
                 {pack.isRecommended && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent">
                       <Zap className="w-3 h-3 mr-1 fill-current" /> Recommended
                    </Badge>
                 )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                 {pack.name}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                 A professional {pack.steps.length}-step workflow designed to {pack.primaryGoal.toLowerCase()}. 
                 Automate your {pack.category.toLowerCase()} process with {pack.tone.toLowerCase()} precision.
              </p>

              <div className="flex items-center gap-4 pt-4">
                 <Button size="lg" onClick={handleUsePack} className="h-14 px-8 text-base font-bold shadow-lg shadow-primary/20 rounded-full group">
                    Start this Workflow
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 {!isPro && (
                   <p className="text-xs text-muted-foreground max-w-[150px] leading-tight">
                     Free to preview. <br/> Pro to generate.
                   </p>
                 )}
              </div>

              <div className="flex flex-wrap gap-6 pt-6 text-sm text-muted-foreground">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Tested Quality</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>{pack.steps.length} Interconnected Steps</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-500" />
                    <span>Ready to Run</span>
                 </div>
              </div>
           </div>

           {/* Visual Preview Card */}
           <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-purple-500/10 to-transparent blur-3xl rounded-full opacity-60" />
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                 <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-400/80" />
                       <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                       <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">workflow_sequence.json</div>
                 </div>
                 
                 <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                    {pack.steps.map((step, idx) => (
                       <div key={idx} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                             <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {idx + 1}
                             </div>
                             {idx < pack.steps.length - 1 && (
                                <div className="w-px h-full bg-border my-2 group-hover:bg-primary/30 transition-colors min-h-[40px]" />
                             )}
                          </div>
                          <div className="pb-8 pt-1 flex-1">
                             <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                {step.name}
                                <span className="text-[10px] font-normal text-muted-foreground border border-border rounded-full px-2 py-0.5">
                                   {step.role}
                                </span>
                             </h3>
                             <p className="text-sm text-muted-foreground mb-3">
                                Generates {step.useCase} to {step.outcome}.
                             </p>
                             <div className="bg-muted/30 rounded border border-border/50 p-2 text-[10px] font-mono text-muted-foreground/70 truncate">
                                <span>Output Signal: </span>
                                <span className={cn(
                                   "font-bold", 
                                   step.signal === "Quality" && "text-blue-500",
                                   step.signal === "Conversion" && "text-green-500",
                                   step.signal === "Creative" && "text-purple-500",
                                )}>{step.signal}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="bg-muted/30 border-t border-border px-6 py-4 text-center">
                    <p className="text-xs text-muted-foreground italic">
                       Each step uses the output of the previous step as context.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
           <div className="bg-card border border-border p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                 <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Automated Context Passing</h3>
              <p className="text-muted-foreground text-sm">
                 Stop repeating yourself. This workflow automatically passes context from step 1 to step {pack.steps.length}, ensuring consistency.
              </p>
           </div>
           
           <div className="bg-card border border-border p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Expert-Vetted Prompts</h3>
              <p className="text-muted-foreground text-sm">
                 Each step uses our {pack.industry} specific prompt engineering patterns to ensure high-quality, professional output.
              </p>
           </div>
           
           <div className="bg-card border border-border p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                 <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Full Process Coverage</h3>
              <p className="text-muted-foreground text-sm">
                 Don't just write one email or one function. Generate the entire lifecycle from {pack.steps[0].name.toLowerCase()} to {pack.steps[pack.steps.length-1].name.toLowerCase()}.
              </p>
           </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Ready to automate your {pack.category.toLowerCase()}?</h2>
              <p className="text-muted-foreground text-lg">
                 Launch the {pack.name} in the builder and get your results in seconds.
              </p>
              <Button size="lg" onClick={handleUsePack} className="h-12 px-8 text-base font-bold shadow-xl shadow-primary/20">
                 Open in Builder <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </div>

      </main>
    </div>
  );
}

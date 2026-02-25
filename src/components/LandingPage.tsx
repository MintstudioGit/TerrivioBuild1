import { Link } from "react-router";
import { Button } from "./ui/button";
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  Zap, 
  Layers, 
  CheckCircle2, 
  BarChart3, 
  Code, 
  PenTool, 
  MessageSquare,
  ShieldCheck,
  Globe
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "./ui/utils";

// Using the Unsplash image I found earlier
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1686425374911-e0d752e09806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRpZ2l0YWwlMjB3YXZlJTIwdGVjaG5vbG9neSUyMGRhcmslMjBtb2RlJTIwZ3JhZGllbnR8ZW58MXx8fHwxNzcwNTU5MTY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-in fade-in duration-500 font-[var(--font-family-inter)]">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground mb-2"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Now with advanced workflow packs</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[var(--text-6xl)] font-bold tracking-tight leading-[1.1]"
              >
                Turn Signals into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                  Intelligent Systems
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[var(--text-xl)] text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Stop guessing with your prompts. Terrivio helps you engineer high-precision AI directives for Sales, Marketing, and Development.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Button size="lg" className="h-14 px-8 text-[var(--text-base)] font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                  <Link to="/pipeline">
                    Upload CSV <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-[var(--text-base)]" asChild>
                  <Link to="/app">
                    Open App Hub
                  </Link>
                </Button>
              </motion.div>
              <div className="text-sm text-muted-foreground">
                Prefer browsing? <Link to="/prompts" className="text-primary font-medium hover:underline">Explore the Directory</Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-[var(--text-sm)] text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Forever Mode
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 w-full max-w-[600px] lg:max-w-none"
            >
              <div className="relative rounded-[var(--radius)] border border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-[4/3] group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-overlay" />
                <img 
                  src={HERO_IMAGE_URL} 
                  alt="Terrivio Interface Abstract" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating UI Elements Mockup */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="bg-card/90 backdrop-blur-md border border-border p-4 rounded-[var(--radius)] shadow-lg mb-4 max-w-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-[var(--radius)] bg-primary/20 flex items-center justify-center text-primary">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-sm)]">Conversion Signal</h4>
                        <p className="text-[10px] text-muted-foreground">Optimized for CTR</p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full w-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[92%]" />
                    </div>
                  </div>

                   <div className="bg-card/90 backdrop-blur-md border border-border p-4 rounded-[var(--radius)] shadow-lg max-w-xs self-end translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[var(--radius)] bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-sm)]">Executive Tone</h4>
                        <p className="text-[10px] text-muted-foreground">B2B Professional</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[var(--text-sm)] font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Powering workflows for modern teams
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale mix-blend-multiply dark:mix-blend-screen">
             {/* Simple Text Logos for "Generic Tech Companies" */}
             {["Acme Corp", "Nebula Systems", "Vertex AI", "Horizon Labs", "Quantum Soft"].map((name) => (
               <span key={name} className="text-[var(--text-xl)] font-bold font-mono tracking-tighter">{name}</span>
             ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-background relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[var(--text-3xl)] md:text-[var(--text-3xl)] font-bold tracking-tight mb-4">Why Terrivio?</h2>
            <p className="text-[var(--text-xl)] text-muted-foreground">
              Generic prompts give generic results. We use a signal-based architecture to decompose your request into engineered components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Target}
              title="Precision Context"
              desc="Define precise roles, industries, and outcomes. Our engine adapts the vocabulary and structure to match."
            />
            <FeatureCard 
              icon={Layers}
              title="Workflow Packs"
              desc="Don't just generate one prompt. Build entire sequences that handle complex tasks from start to finish."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Impact Analytics"
              desc="Track usage and performance. See exactly which prompts are saving time and driving results."
            />
          </div>
        </div>
      </section>

      {/* USE CASE GRID */}
      <section className="py-24 border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-[var(--text-3xl)] font-bold tracking-tight mb-2">Explore by Category</h2>
                <p className="text-muted-foreground text-[var(--text-base)]">Jump start your next task with pre-built templates.</p>
              </div>
              <Button variant="ghost" className="gap-2" asChild>
                <Link to="/prompts">View all categories <ArrowRight className="w-4 h-4" /></Link>
              </Button>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CategoryCard icon={MessageSquare} title="Sales" count="120+ Prompts" link="/prompts/sales" />
              <CategoryCard icon={PenTool} title="Content" count="85+ Prompts" link="/prompts/content" />
              <CategoryCard icon={Code} title="Development" count="200+ Prompts" link="/prompts/development" />
              <CategoryCard icon={Globe} title="Marketing" count="95+ Prompts" link="/prompts/marketing" />
           </div>

           {/* Directory Structure Preview */}
           <div className="mt-16 pt-16 border-t border-border/50">
             <div className="flex flex-col gap-6">
               <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Directory Structure Preview</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Link 
                   to="/prompts" 
                   className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors flex flex-col gap-2 group"
                 >
                   <span className="text-xs font-mono text-muted-foreground group-hover:text-primary">Level 1</span>
                   <span className="font-medium text-sm">Directory Root</span>
                   <span className="text-[10px] text-muted-foreground truncate">/prompts</span>
                 </Link>
                 
                 <Link 
                   to="/prompts/sales" 
                   className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors flex flex-col gap-2 group"
                 >
                   <span className="text-xs font-mono text-muted-foreground group-hover:text-primary">Level 2</span>
                   <span className="font-medium text-sm">Category Dashboard</span>
                   <span className="text-[10px] text-muted-foreground truncate">/prompts/sales</span>
                 </Link>
                 
                 <Link 
                   to="/prompts/sales/cold-email-outreach" 
                   className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors flex flex-col gap-2 group"
                 >
                   <span className="text-xs font-mono text-muted-foreground group-hover:text-primary">Level 3</span>
                   <span className="font-medium text-sm">Motion Outcomes List</span>
                   <span className="text-[10px] text-muted-foreground truncate">/prompts/sales/cold-email-outreach</span>
                 </Link>
                 
                 <Link 
                   to="/prompts/product/product-roadmaps-high-impact-feature" 
                   className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors flex flex-col gap-2 group"
                 >
                   <span className="text-xs font-mono text-muted-foreground group-hover:text-primary">Level 4</span>
                   <span className="font-medium text-sm">Prompt Generator Tool</span>
                   <span className="text-[10px] text-muted-foreground truncate">.../product-roadmaps-high-impact-feature</span>
                 </Link>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-[var(--radius)] p-12 md:p-20 text-center relative overflow-hidden text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-[var(--text-3xl)] md:text-[var(--text-6xl)] font-bold tracking-tight">Ready to stop guessing?</h2>
            <p className="text-[var(--text-xl)] text-primary-foreground/80 max-w-2xl mx-auto">
              Join thousands of professionals who have generated over 50,000 high-performance prompts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" variant="secondary" className="h-14 px-8 text-[var(--text-base)] font-bold text-primary" asChild>
                 <Link to="/generator">Start Building for Free</Link>
               </Button>
            </div>
            <p className="text-[var(--text-sm)] text-primary-foreground/60">No credit card required. Free plan available forever.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[var(--radius)] border border-border bg-card hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="w-12 h-12 rounded-[var(--radius)] bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[var(--text-xl)] font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-[var(--text-base)]">
        {desc}
      </p>
    </div>
  );
}

function CategoryCard({ icon: Icon, title, count, link }: any) {
  return (
    <Link to={link} className="group p-6 rounded-[var(--radius)] border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-center flex flex-col items-center">
       <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
         <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
       </div>
       <h3 className="font-bold text-foreground text-[var(--text-base)]">{title}</h3>
       <span className="text-[var(--text-sm)] text-muted-foreground">{count}</span>
    </Link>
  );
}

import { Users, Target, Zap } from "lucide-react";

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
      
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">We build systems, not just prompts.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
           Terrivio is the first prompt engineering platform designed for professionals who need reliability, consistency, and scale.
        </p>
      </section>

      {/* Mission */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
               <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Precision First</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
               We believe in "Signal over Noise". Every prompt in our library is verified by engineering teams to ensure it delivers specific, measurable outcomes.
            </p>
         </div>
         <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
               <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Built for Teams</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
               Prompt engineering shouldn't be a solo silo. We build tools that help organizations standardize their AI workflows.
            </p>
         </div>
         <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
               <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Speed to Value</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
               Our "Packs" and "Workflows" are designed to get you from blank page to finished output in seconds, not hours.
            </p>
         </div>
      </section>

      {/* Story */}
      <section className="space-y-6">
         <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
         <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p>
               Terrivio was born from a simple frustration: prompt libraries were full of "cool tricks" but lacked the rigorous engineering needed for business production.
            </p>
            <p>
               Our team of engineers, designers, and marketers set out to create a repository of <strong>working code for the mind</strong>—prompts that function like reliable software functions.
            </p>
            <p>
               Today, we help thousands of professionals across sales, marketing, and development stop guessing and start building with AI.
            </p>
         </div>
      </section>

    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import {
  Smartphone,
  Bell,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Mail,
  Loader2,
  Check,
  Star,
  BarChart3,
  FileText,
} from "lucide-react";
import { cn } from "./ui/utils";

const FEATURES = [
  {
    icon: Zap,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "On-the-go generation",
    desc: "Run the full Terrivio prompt generator from your phone. Pick your signal, enter your context, get a high-quality prompt in seconds.",
  },
  {
    icon: Bell,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    title: "Pipeline notifications",
    desc: "Get a push notification the moment your pipeline finishes running. Never check back manually again.",
  },
  {
    icon: BarChart3,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Analytics at a glance",
    desc: "See your prompt usage stats, quality scores, and ROI summary in a native mobile dashboard.",
  },
  {
    icon: FileText,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Saved prompts library",
    desc: "Access, copy, and manage your saved prompts from anywhere. Full search and filter support.",
  },
  {
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Offline-first design",
    desc: "Your last 50 prompts are cached locally. Write drafts offline — they sync when you reconnect.",
  },
  {
    icon: Sparkles,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    title: "Quick-capture mode",
    desc: "Share any webpage or LinkedIn profile to the app. It auto-scrapes the context and pre-fills your prompt.",
  },
];

const TESTIMONIALS = [
  { name: "Marco R.", role: "Head of Sales, SaaS", text: "I want to be able to run a pipeline while I'm on the train. This would change how I prep for meetings." },
  { name: "Lena K.", role: "Founder, Agency", text: "The desktop version is already part of my workflow. A mobile app would make Terrivio essential, not optional." },
  { name: "James T.", role: "SDR Manager", text: "Push notifications for pipeline completion is the one feature I want. My team checks manually every 5 minutes." },
];

export function MobileAppPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    // Simulate submission (replace with real endpoint / email list)
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <Button variant="ghost" asChild>
            <Link to="/app">← App Hub</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pipeline">View Pipeline</Link>
          </Button>
        </div>

        {/* Hero */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Coming soon — iOS &amp; Android
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Terrivio in your pocket
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-10 leading-relaxed">
            The full Terrivio prompt engine, pipeline builder, and analytics — natively on iOS and Android. Get notified the moment your pipeline finishes.
          </p>

          {/* Waitlist form */}
          <div className="max-w-md mx-auto">
            {submitted ? (
              <div className="flex items-center justify-center gap-3 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-emerald-700 text-sm">You're on the list!</p>
                  <p className="text-xs text-muted-foreground">We'll email you when beta opens.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button type="submit" className="h-[46px] px-5 font-bold gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Join waitlist
                </Button>
              </form>
            )}
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground mt-3">No spam. Early access when beta opens. Unsubscribe anytime.</p>
          </div>
        </section>

        {/* Mock phone + feature list */}
        <section className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Phone mockup */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative w-64">
              {/* Phone frame */}
              <div className="w-64 h-[500px] rounded-[40px] border-[8px] border-foreground/10 bg-card shadow-2xl shadow-primary/10 overflow-hidden relative">
                {/* Status bar */}
                <div className="h-8 bg-muted/40 flex items-center justify-between px-5">
                  <span className="text-[9px] text-foreground/50 font-bold">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-1.5 rounded-full bg-foreground/30" />
                    <div className="w-3 h-1.5 rounded-full bg-foreground/30" />
                    <div className="w-3 h-1.5 rounded-full bg-foreground/30" />
                  </div>
                </div>
                {/* App content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-sm text-foreground">Terrivio</span>
                  </div>
                  {/* Pipeline card */}
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wide">Pipeline</span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Running
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">SaaS Outbound Q1</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">47 / 200 rows complete</p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[23.5%] bg-primary rounded-full" />
                    </div>
                  </div>
                  {/* Prompt card */}
                  <div className="rounded-xl bg-card border border-border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Saved Prompt</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-2">Enterprise Pain-Point Opener</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={cn("w-2.5 h-2.5", s <= 4 ? "fill-amber-400 text-amber-400" : "text-border")} />
                      ))}
                      <span className="text-[9px] text-muted-foreground">(12)</span>
                    </div>
                  </div>
                  {/* Notification preview */}
                  <div className="rounded-xl bg-muted/40 border border-border p-3 flex gap-2">
                    <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-foreground">Pipeline complete</p>
                      <p className="text-[9px] text-muted-foreground">200 prompts ready · avg score 82</p>
                    </div>
                  </div>
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-foreground/20" />
              </div>
              {/* Glow */}
              <div className="absolute inset-0 -z-10 blur-3xl bg-primary/10 scale-75" />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-5 order-1 lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Everything you need on mobile</h2>
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/20 transition-all">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", f.bg)}>
                  <f.icon className={cn("w-5 h-5", f.color)} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Social proof */}
        <section className="mb-16">
          <h2 className="text-center text-base font-bold text-muted-foreground uppercase tracking-widest mb-8">What users are asking for</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-xs font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform badges + CTA */}
        <section className="text-center border-t border-border pt-14">
          <h2 className="text-2xl font-bold mb-3">Be first in line</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
            Beta opens to waitlist members first. Drop your email above, or explore the full web app now.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            {/* App Store placeholder */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card opacity-60 cursor-not-allowed">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-foreground"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <span className="text-sm font-bold">App Store</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card opacity-60 cursor-not-allowed">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-foreground"><path d="M3.18 23.76c.34.19.73.21 1.1.04l11.65-6.73-2.48-2.49zm15.54-9.75L16.4 12l2.33-2.01L5.29.22C4.92.04 4.53.07 4.18.26L16.72 12zm2.52-1.83c.38-.47.38-1.17 0-1.64L19.3 9.4l-2.52 2.17 2.5 2.17zM4.18 23.74l12.22-7.04-2.48-2.49z"/></svg>
              <span className="text-sm font-bold">Google Play</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Available after beta · iOS 16+ · Android 10+</p>
          <Button asChild size="lg" variant="outline" className="font-bold">
            <Link to="/generator">Use the web app <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </section>
      </main>
    </div>
  );
}

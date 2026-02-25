import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { WORKFLOW_PACKS } from "./prompt-engine";
import {
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  Star,
  Filter,
  Code2,
  Users,
  BarChart2,
  Megaphone,
  ShoppingCart,
  Briefcase,
} from "lucide-react";
import { cn } from "./ui/utils";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Sales:      Users,
  Development: Code2,
  Marketing:  Megaphone,
  Analytics:  BarChart2,
  "E-commerce": ShoppingCart,
  HR:         Briefcase,
};

const PACK_PRICES: Record<string, { price: number; includedWith: string[] }> = {
  "saas-outbound":           { price: 29,  includedWith: ["pro", "team", "agency"] },
  "enterprise-sales-cycle":  { price: 39,  includedWith: ["team", "agency"] },
  "inbound-lead-nurture":    { price: 19,  includedWith: ["pro", "team", "agency"] },
  "saas-product-build":      { price: 29,  includedWith: ["pro", "team", "agency"] },
  "microservices-architecture": { price: 49, includedWith: ["team", "agency"] },
};

const ALL_CATEGORIES = ["All", ...Array.from(new Set(WORKFLOW_PACKS.map((p) => p.category)))];

function PackCard({ pack }: { pack: typeof WORKFLOW_PACKS[number] }) {
  const pricing = PACK_PRICES[pack.id];
  const Icon = CATEGORY_ICONS[pack.category] ?? Layers;
  const isIncludedWithPro = pricing?.includedWith.includes("pro") ?? true;

  return (
    <div className="group relative flex flex-col h-full rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {pack.isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-600 border border-amber-400/30">
            <Star className="w-3 h-3 fill-amber-400 stroke-none" />
            Featured
          </span>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm leading-snug">{pack.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{pack.industry}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">{pack.category}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">{pack.tone}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">{pack.steps.length} steps</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
          Goal: <span className="font-semibold text-foreground">{pack.primaryGoal}</span>
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          {isIncludedWithPro ? (
            <div>
              <div className="text-[11px] text-muted-foreground line-through">€{pricing?.price ?? 29}</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Included with Pro
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-foreground">€{pricing?.price ?? 29}</div>
              <div className="text-[10px] text-muted-foreground">one-time</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold">
              <Link to={`/packs/${pack.id}`}>Preview</Link>
            </Button>
            <Button asChild size="sm" className="h-8 text-xs font-semibold">
              <Link to={`/pipeline?template=${pack.id}`}>
                Use <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PacksMarketplacePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return WORKFLOW_PACKS.filter((pack) => {
      const matchesCategory = activeCategory === "All" || pack.category === activeCategory;
      const q = query.toLowerCase();
      const matchesQuery = !q
        || pack.name.toLowerCase().includes(q)
        || pack.industry.toLowerCase().includes(q)
        || pack.primaryGoal.toLowerCase().includes(q)
        || pack.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const featured = filtered.filter((p) => p.isRecommended);
  const rest = filtered.filter((p) => !p.isRecommended);

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12 md:py-20">

        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground mb-5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Curated multi-step prompt workflows</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Workflow Pack Marketplace
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8 leading-relaxed">
            Ready-to-run prompt pipelines for sales, dev, marketing, and more. Pick a pack, load it into the Pipeline Builder, and run it against your CRM in minutes.
          </p>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-medium">
            <Sparkles className="w-4 h-4" />
            All packs included with Pro — no extra cost
          </div>
        </section>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packs by name, industry, or goal…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Featured Packs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((pack) => <PackCard key={pack.id} pack={pack} />)}
            </div>
          </section>
        )}

        {/* All packs */}
        {rest.length > 0 && (
          <section className="mb-16">
            {featured.length > 0 && (
              <h2 className="text-base font-bold text-muted-foreground uppercase tracking-widest mb-4">All Packs</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((pack) => <PackCard key={pack.id} pack={pack} />)}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No packs match your search.</p>
            <p className="text-sm mt-1">Try a different keyword or category.</p>
          </div>
        )}

        {/* CTA */}
        <section className="text-center border-t border-border pt-16">
          <h2 className="text-2xl font-bold mb-3">Don't see what you need?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
            Pro users can build custom multi-step pipelines in the Pipeline Builder — and save them as reusable templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="font-bold">
              <Link to="/pipeline">Open Pipeline Builder <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold">
              <Link to="/pricing">View all plans</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

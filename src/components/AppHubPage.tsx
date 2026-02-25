import { Link } from "react-router";
import {
  LayoutGrid,
  Terminal,
  Layers,
  Package,
  Store,
  BookOpen,
  BarChart3,
  Plug,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Wand2,
  Globe,
  Users,
  Palette,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { useDesignContext } from "./DesignController";

type HubItem = {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  status: "live" | "beta" | "coming";
  requiredPlan?: "free" | "pro" | "team" | "agency";
  action?: string;
};

const CORE_ITEMS: HubItem[] = [
  {
    title: "Prompt Directory",
    description: "Browse verified prompt patterns by signal and taxonomy.",
    path: "/prompts",
    icon: LayoutGrid,
    status: "live",
  },
  {
    title: "Generator",
    description: "CO-STAR mode, quality gate, and variant generation.",
    path: "/generator",
    icon: Terminal,
    status: "live",
  },
  {
    title: "Pipeline Builder",
    description: "CSV → context engine → workflow builder → export.",
    path: "/pipeline",
    icon: Layers,
    status: "live",
    requiredPlan: "pro",
  },
  {
    title: "Pack Builder",
    description: "Create reusable prompt systems and templates.",
    path: "/packs",
    icon: Package,
    status: "live",
  },
  {
    title: "Marketplace",
    description: "Browse curated prompt packs and frameworks.",
    path: "/marketplace",
    icon: Store,
    status: "live",
  },
  {
    title: "Saved Prompts",
    description: "Library, history, and usage analytics in one place.",
    path: "/saved",
    icon: BookOpen,
    status: "live",
  },
];

const GROWTH_ITEMS: HubItem[] = [
  {
    title: "Advanced Analytics",
    description: "ROI funnel and leaderboard for prompt performance.",
    path: "/analytics",
    icon: BarChart3,
    status: "beta",
    requiredPlan: "pro",
  },
  {
    title: "Integrations",
    description: "Webhooks, Slack, Clay, Zapier, and CRM exports.",
    path: "/integrations",
    icon: Plug,
    status: "beta",
    requiredPlan: "pro",
  },
  {
    title: "API Keys",
    description: "Generate keys for programmatic pipeline access.",
    path: "/api-keys",
    icon: KeyRound,
    status: "beta",
    requiredPlan: "pro",
  },
  {
    title: "White Label",
    description: "Custom domains, logo, and branding control.",
    path: "/white-label",
    icon: ShieldCheck,
    status: "coming",
    requiredPlan: "agency",
  },
  {
    title: "Mobile App",
    description: "On-the-go prompt generation and pipeline alerts.",
    path: "/mobile",
    icon: Smartphone,
    status: "coming",
  },
];

const COMPANY_ITEMS: HubItem[] = [
  {
    title: "Blog",
    description: "Guides, frameworks, and comparisons.",
    path: "/blog",
    icon: BookOpen,
    status: "live",
  },
  {
    title: "About",
    description: "Product story, mission, and team.",
    path: "/about",
    icon: Users,
    status: "live",
  },
  {
    title: "Contact",
    description: "Talk to the team or request support.",
    path: "/contact",
    icon: Globe,
    status: "live",
  },
];

const LAB_ITEMS: HubItem[] = [
  {
    title: "UI Lab",
    description: "Experimental layouts and navigation patterns.",
    path: "/labs/sidebar",
    icon: Palette,
    status: "beta",
  },
];

function StatusBadge({ status }: { status: HubItem["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Live
      </span>
    );
  }
  if (status === "beta") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
        <Sparkles className="h-3 w-3" />
        Beta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Coming
    </span>
  );
}

function Section({ title, items }: { title: string; items: HubItem[] }) {
  const { userState } = useDesignContext();
  const planRank = (plan?: string) => {
    if (!plan || plan === "free") return 0;
    if (plan === "pro") return 1;
    if (plan === "team") return 2;
    if (plan === "agency") return 3;
    return 0;
  };
  const userRank = planRank(userState);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const locked = item.requiredPlan && userRank < planRank(item.requiredPlan);
          return (
            <div
              key={item.title}
              className={cn(
                "rounded-xl border border-border bg-card p-5 flex flex-col gap-3 transition-all",
                locked ? "opacity-85" : "hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center justify-between">
                {locked ? (
                  <div className="inline-flex items-center gap-2 text-xs text-amber-600 font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    Requires {item.requiredPlan?.toUpperCase()}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Ready</div>
                )}
                {locked ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/pricing">Upgrade</Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link to={item.path}>
                      {item.action ?? "Open"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AppHubPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Wand2 className="w-3.5 h-3.5" />
            App Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
            Everything in Terrivio, in one place.
          </h1>
          <p className="text-muted-foreground text-base mt-3 max-w-2xl">
            Launch every core feature, see platform capabilities, and jump into the
            tools that map directly to your roadmap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/pricing">View Plans</Link>
          </Button>
          <Button asChild>
            <Link to="/pipeline">Run a Pipeline</Link>
          </Button>
        </div>
      </div>

      <Section title="Core Workspace" items={CORE_ITEMS} />
      <Section title="Growth & Scale" items={GROWTH_ITEMS} />
      <Section title="Company" items={COMPANY_ITEMS} />
      <Section title="Labs" items={LAB_ITEMS} />
    </div>
  );
}

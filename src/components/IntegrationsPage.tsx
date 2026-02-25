import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import {
  Webhook,
  Slack,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  ExternalLink,
  Code2,
  Bell,
  Database,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { cn } from "./ui/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "CRM" | "Automation" | "Notifications" | "Export" | "API";
  status: "available" | "coming-soon" | "beta";
  requiredPlan: "free" | "pro" | "team" | "agency";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  docsUrl?: string;
  setupSteps?: string[];
  features: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "webhook",
    name: "Webhook Export",
    description: "Send pipeline output to any URL — your CRM, automation tool, or custom backend — as a POST request with structured JSON.",
    category: "Export",
    status: "available",
    requiredPlan: "pro",
    icon: Webhook,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    docsUrl: "/pipeline",
    setupSteps: [
      "Open the Pipeline Builder",
      "Add your target URL in the Webhook step",
      "Run the pipeline — results POST to your endpoint automatically",
    ],
    features: ["JSON payload with all generated prompts", "Per-row delivery", "Custom headers support", "Retry on failure"],
  },
  {
    id: "clay",
    name: "Clay",
    description: "Native Clay table integration. Map pipeline columns directly to Clay rows and push enriched prompt data without leaving Terrivio.",
    category: "CRM",
    status: "beta",
    requiredPlan: "team",
    icon: Database,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    setupSteps: [
      "Connect your Clay workspace via API key in Settings",
      "Choose a target Clay table in Pipeline settings",
      "Run pipeline — rows sync automatically after generation",
    ],
    features: ["Map any pipeline column to a Clay field", "Sync to existing rows by email/domain", "Auto-create rows for new contacts", "Bidirectional field mapping"],
  },
  {
    id: "slack",
    name: "Slack Notifications",
    description: "Get a Slack message when your pipeline finishes, including a summary of rows processed, quality scores, and a direct link to results.",
    category: "Notifications",
    status: "available",
    requiredPlan: "pro",
    icon: Slack,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    setupSteps: [
      "Click 'Connect Slack' below",
      "Authorise Terrivio in your Slack workspace",
      "Choose a channel for notifications",
      "Run any pipeline — you'll get a completion summary",
    ],
    features: ["Pipeline completion summary", "Row count + avg quality score", "Direct link to full results", "Error alerts"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Push generated prompts directly to HubSpot contact records as notes, tasks, or custom properties. Sync pipeline results to deals.",
    category: "CRM",
    status: "coming-soon",
    requiredPlan: "team",
    icon: RefreshCw,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    features: ["Sync prompts to contact notes", "Update deal custom fields", "Trigger HubSpot workflows", "Map pipeline columns to HubSpot properties"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Write pipeline output to Salesforce leads, contacts, or opportunities. Auto-create tasks for SDRs with the generated prompt as the body.",
    category: "CRM",
    status: "coming-soon",
    requiredPlan: "agency",
    icon: Database,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
    features: ["Create / update contact records", "Auto-generate tasks for SDRs", "Map to custom Salesforce objects", "Flow-triggered sync"],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Trigger any Zap when a pipeline completes. Connect Terrivio to 7,000+ apps without writing a line of code.",
    category: "Automation",
    status: "coming-soon",
    requiredPlan: "pro",
    icon: Zap,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    features: ["Pipeline complete → trigger any Zap", "Row-level triggers", "Filter by quality score", "Send to Google Sheets, Notion, Airtable…"],
  },
  {
    id: "make",
    name: "Make (Integromat)",
    description: "Use Make scenarios to process Terrivio pipeline output through advanced multi-step automation flows.",
    category: "Automation",
    status: "coming-soon",
    requiredPlan: "pro",
    icon: Code2,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    features: ["HTTP module support via webhook", "Structured JSON output for mapping", "Scenario triggers on pipeline end", "Error branch support"],
  },
  {
    id: "pipeline-api",
    name: "Pipeline REST API",
    description: "Run pipelines programmatically from your own code. Authenticate with an API key and POST a list of rows to get prompt output back as JSON.",
    category: "API",
    status: "available",
    requiredPlan: "team",
    icon: Code2,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    docsUrl: "/api-keys",
    features: ["API key authentication", "Async pipeline execution", "Webhook callback when done", "Full JSON response with all step outputs"],
  },
];

const STATUS_STYLES = {
  available:     { label: "Available",    classes: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  beta:          { label: "Beta",         classes: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "coming-soon": { label: "Coming soon",  classes: "bg-muted text-muted-foreground border-border" },
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free", pro: "Pro", team: "Team", agency: "Agency",
};

const CATEGORIES = ["All", "CRM", "Automation", "Notifications", "Export", "API"] as const;

function IntegrationCard({ integration }: { integration: Integration }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLES[integration.status];
  const Icon = integration.icon;
  const isAvailable = integration.status !== "coming-soon";

  return (
    <div className={cn(
      "rounded-2xl border bg-card transition-all duration-200",
      isAvailable ? "border-border hover:border-primary/30 hover:shadow-md" : "border-border opacity-75"
    )}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", integration.iconBg)}>
            <Icon className={cn("w-5 h-5", integration.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-foreground">{integration.name}</h3>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", status.classes)}>
                {status.label}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                {PLAN_LABELS[integration.requiredPlan]}+
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{integration.description}</p>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {integration.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-3">
          {integration.status === "available" || integration.status === "beta" ? (
            <>
              {integration.docsUrl ? (
                <Button asChild size="sm" className="h-8 text-xs font-bold gap-1.5">
                  <Link to={integration.docsUrl}>
                    Set up <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              ) : (
                <Button size="sm" className="h-8 text-xs font-bold gap-1.5" disabled={integration.status === "beta"}>
                  {integration.status === "beta" ? "Beta access" : "Connect"}
                </Button>
              )}
              {integration.setupSteps && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  How to set up
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>On the roadmap — <Link to="/contact" className="underline hover:text-foreground">request priority access</Link></span>
            </div>
          )}
        </div>

        {expanded && integration.setupSteps && (
          <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Setup steps</p>
            <ol className="space-y-2">
              {integration.setupSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = INTEGRATIONS.filter(
    (i) => activeCategory === "All" || i.category === activeCategory
  );

  const available = filtered.filter((i) => i.status !== "coming-soon");
  const comingSoon = filtered.filter((i) => i.status === "coming-soon");

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <Button variant="ghost" asChild>
            <Link to="/app">← App Hub</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pipeline">Go to Pipeline</Link>
          </Button>
        </div>

        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground mb-5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Connect Terrivio to your stack</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Integrations Hub</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-6 leading-relaxed">
            Send pipeline output to your CRM, automation tools, and notification channels. No copy-paste, no exports — just data where you need it.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> {INTEGRATIONS.filter(i => i.status !== "coming-soon").length} available now
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {INTEGRATIONS.filter(i => i.status === "coming-soon").length} coming soon
            </span>
          </div>
        </section>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
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

        {/* Available */}
        {available.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Available now
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {available.map((i) => <IntegrationCard key={i.id} integration={i} />)}
            </div>
          </section>
        )}

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <section className="mb-16">
            <h2 className="text-base font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Coming soon
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {comingSoon.map((i) => <IntegrationCard key={i.id} integration={i} />)}
            </div>
          </section>
        )}

        {/* Build your own CTA */}
        <section className="p-8 rounded-2xl border border-border bg-card text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Need a custom integration?</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Use the Pipeline API to push data anywhere. Any CRM, data warehouse, or internal tool with an HTTP endpoint can receive Terrivio pipeline output.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="font-bold">
              <Link to="/api-keys">Get API Key <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold">
              <Link to="/contact">Request an integration</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

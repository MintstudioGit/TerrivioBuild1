import { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  Search,
  FileText,
  Database,
  Mail,
  MessageSquare,
  Users,
  Layers,
  Play,
  Download,
  Send,
  ChevronRight,
  X,
  Sparkles,
  RefreshCw,
  Settings2,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// ─── TYPES ───────────────────────────────────────────────
type PipelineStep =
  | "upload"
  | "context"
  | "business"
  | "mapping"
  | "workflow"
  | "preview"
  | "variations"
  | "execution"
  | "output";

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  csvField: string;
  mappedTo: string;
  confidence: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
  icon: React.ComponentType<{ className?: string }>;
}

// ─── CONSTANTS ───────────────────────────────────────────
const STEPS: { id: PipelineStep; label: string; number: number }[] = [
  { id: "upload", label: "Upload CSV", number: 1 },
  { id: "context", label: "Context Engine", number: 2 },
  { id: "business", label: "Business Context", number: 3 },
  { id: "mapping", label: "Field Mapping", number: 4 },
  { id: "workflow", label: "Workflow", number: 5 },
  { id: "preview", label: "Preview", number: 6 },
  { id: "variations", label: "Variations", number: 7 },
  { id: "execution", label: "Execute", number: 8 },
  { id: "output", label: "Output", number: 9 },
];

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "saas-outbound",
    name: "SaaS Outbound Pipeline",
    description: "Full-cycle outbound system for B2B SaaS companies with ICP matching and pain signal detection.",
    steps: ["ICP Analysis", "Pain Detection", "Cold Email", "Follow-up", "Breakup"],
    icon: Zap,
  },
  {
    id: "lead-gen",
    name: "Lead Gen Pipeline",
    description: "Qualify and nurture inbound leads with personalized multi-touch sequences.",
    steps: ["ICP Analysis", "Pain Detection", "Intro Email", "Value Add", "Breakup"],
    icon: Target,
  },
  {
    id: "recruiter",
    name: "Recruiter Pipeline",
    description: "Personalized recruiting outreach with company research and role-matching context.",
    steps: ["ICP Analysis", "Role Match", "Outreach Email", "Follow-up", "Breakup"],
    icon: Users,
  },
];

const SAMPLE_CSV_DATA: CSVRow[] = [
  { first_name: "Sarah", last_name: "Chen", company: "Acme Corp", website: "https://acme.com", title: "VP of Sales", email: "sarah@acme.com" },
  { first_name: "Marcus", last_name: "Williams", company: "TechFlow", website: "https://techflow.io", title: "Head of Growth", email: "marcus@techflow.io" },
  { first_name: "Elena", last_name: "Rodriguez", company: "ScaleAI", website: "", title: "CRO", email: "elena@scaleai.co" },
  { first_name: "James", last_name: "Park", company: "Nebula", website: "https://nebula.dev", title: "Director of Sales", email: "james@nebula.dev" },
  { first_name: "Priya", last_name: "Sharma", company: "CloudSync", website: "https://cloudsync.com", title: "VP Revenue", email: "priya@cloudsync.com" },
];

const AUTO_FIELD_MAPPINGS: FieldMapping[] = [
  { csvField: "first_name", mappedTo: "First Name", confidence: 98 },
  { csvField: "last_name", mappedTo: "Last Name", confidence: 97 },
  { csvField: "company", mappedTo: "Company", confidence: 99 },
  { csvField: "website", mappedTo: "Website", confidence: 95 },
  { csvField: "title", mappedTo: "Job Title", confidence: 92 },
  { csvField: "email", mappedTo: "Email", confidence: 99 },
];

const SAMPLE_OUTPUTS = {
  icp: "SaaS company selling to mid-market B2B teams. Key decision makers are VPs and Directors of Sales/Revenue. Values data-driven approaches and workflow automation. Currently scaling from Series A to B.",
  pain: "Struggling with outbound personalization at scale. Current process involves manual research per lead, taking 15-20 minutes per contact. Missing pipeline targets by 30% due to low reply rates on generic messaging.",
  email: `Hi Sarah,

I noticed Acme Corp recently expanded your sales team by 40% -- congratulations on the growth.

When teams scale that fast, outbound personalization usually breaks first. Most reps end up sending the same 3 templates to everyone, and reply rates tank.

We built a system that generates context-aware outreach using real company signals -- not just {{first_name}} merge tags.

Worth a 15-minute look?

Best,
[Your name]`,
  followup: `Sarah, quick follow-up on my note last week.

I dug into Acme's recent product launch and noticed you're targeting enterprise accounts now. That shift typically means your outbound motion needs to evolve too.

Happy to share how similar teams at your stage are approaching this.

Would Thursday work for a quick call?`,
  breakup: `Sarah -- I'll keep this short.

I've reached out a couple of times about helping Acme's outbound team personalize at scale. I understand timing might not be right.

If this becomes a priority, my calendar is always open: [link]

Wishing you and the team continued success.`,
};

// ─── MAIN COMPONENT ──────────────────────────────────────
export function PipelineBuilderPage() {
  const [currentStep, setCurrentStep] = useState<PipelineStep>("upload");
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [contextEngineOn, setContextEngineOn] = useState(true);
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [businessOffer, setBusinessOffer] = useState("");
  const [businessTone, setBusinessTone] = useState("Professional");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [variationMode, setVariationMode] = useState<"consistent" | "mixed">("mixed");
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const csvStats = useMemo(() => {
    if (!csvData.length) return null;
    const total = csvData.length;
    const withWebsite = csvData.filter((r) => r.website && r.website.trim() !== "").length;
    const missingData = csvData.filter((r) => Object.values(r).some((v) => !v || v.trim() === "")).length;
    return {
      total,
      withWebsite,
      withWebsitePercent: Math.round((withWebsite / total) * 100),
      missingData,
      missingDataPercent: Math.round((missingData / total) * 100),
    };
  }, [csvData]);

  const goNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
  }, [currentStep]);

  const goPrev = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
  }, [currentStep]);

  const handleCSVUpload = useCallback(() => {
    setCsvData(SAMPLE_CSV_DATA);
    setCsvUploaded(true);
    toast.success("CSV uploaded successfully", {
      description: `${SAMPLE_CSV_DATA.length} rows detected.`,
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleCSVUpload();
    },
    [handleCSVUpload]
  );

  const handleRunWorkflow = useCallback(() => {
    setIsRunning(true);
    setRunProgress(0);
    const interval = setInterval(() => {
      setRunProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setIsComplete(true);
          toast.success("Pipeline complete", {
            description: "All rows processed successfully.",
          });
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  }, []);

  const handleCopyOutput = useCallback(
    (key: string, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedStep(key);
      setTimeout(() => setCopiedStep(null), 2000);
      toast.success("Copied to clipboard");
    },
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-[var(--font-family-inter)]">
      {/* HEADER SECTION */}
      <section className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-3"
          >
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-balance">
              Turn your lead list into a structured outbound system
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
              Upload a CSV &rarr; enrich with real website context &rarr; generate multi-step prompts &rarr; export to Clay/Zapier.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STEP NAVIGATOR */}
      <div className="border-b border-border bg-card/50 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all min-h-[44px]",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : i < currentStepIndex
                      ? "text-foreground bg-muted/60 hover:bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
                    currentStep === step.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : i < currentStepIndex
                        ? "bg-primary/20 text-primary"
                        : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {i < currentStepIndex ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    step.number
                  )}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <AnimatePresence mode="wait">
            {currentStep === "upload" && (
              <StepContainer key="upload">
                <StepHeader
                  number={1}
                  title="Upload Your Lead List"
                  description="Drop your CSV file to get started. We'll analyze the data quality automatically."
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !csvUploaded && fileInputRef.current?.click()}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-all cursor-pointer min-h-[200px] flex flex-col items-center justify-center",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : csvUploaded
                        ? "border-primary/40 bg-primary/5 cursor-default"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                  {csvUploaded ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">leads_q1_2026.csv</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          File uploaded successfully
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                        <Upload className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Drop your CSV here, or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports .csv files up to 10MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCSVUpload();
                        }}
                      >
                        Use sample data
                      </Button>
                    </div>
                  )}
                </div>

                {csvStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
                  >
                    <StatCard label="Total Rows" value={csvStats.total.toString()} />
                    <StatCard
                      label="With Website"
                      value={`${csvStats.withWebsitePercent}%`}
                      accent="primary"
                    />
                    <StatCard
                      label="Missing Data"
                      value={`${csvStats.missingDataPercent}%`}
                      accent={csvStats.missingDataPercent > 30 ? "destructive" : "muted"}
                    />
                  </motion.div>
                )}

                {csvStats && csvStats.missingDataPercent > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Rows without a website will produce lower quality outputs
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        We recommend enriching missing websites before running the pipeline.
                      </p>
                    </div>
                  </motion.div>
                )}
              </StepContainer>
            )}

            {currentStep === "context" && (
              <StepContainer key="context">
                <StepHeader
                  number={2}
                  title="Context Engine"
                  description="We automatically extract real company context from each website to avoid generic outputs."
                  badge="Recommended"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between p-5 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Enable Context Engine</p>
                        <p className="text-sm text-muted-foreground">
                          Extract real signals from each lead's website
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={contextEngineOn}
                      onCheckedChange={setContextEngineOn}
                      className="min-w-[44px]"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {contextEngineOn ? (
                      <motion.div
                        key="on"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex flex-col gap-3"
                      >
                        {[
                          { label: "Website scraping per row", desc: "Extracts key messaging, products, and positioning from each site" },
                          { label: "ICP extraction", desc: "Identifies ideal customer profile signals from company data" },
                          { label: "Pain signal detection", desc: "Discovers potential pain points and buying triggers" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="off"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20"
                      >
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Outputs may sound generic
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Without the context engine, prompts will rely solely on CSV data (name, company, title) without real company intelligence.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StepContainer>
            )}

            {currentStep === "business" && (
              <StepContainer key="business">
                <StepHeader
                  number={3}
                  title="Your Business Context"
                  description="Tell us about your company so we can tailor every output to your positioning."
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="biz-website" className="text-sm font-medium">
                      Your website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="biz-website"
                        placeholder="https://yourcompany.com"
                        value={businessWebsite}
                        onChange={(e) => setBusinessWebsite(e.target.value)}
                        className="pl-10 h-12 text-base"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll auto-fill your ICP summary, offer, and CTA from your site.
                    </p>
                  </div>

                  {businessWebsite && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-primary/20 bg-primary/5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Auto-detected
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        B2B SaaS helping sales teams personalize outbound at scale using AI-powered context extraction and multi-step prompt workflows.
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="biz-offer" className="text-sm font-medium">
                      Your offer
                    </Label>
                    <Textarea
                      id="biz-offer"
                      placeholder="What do you sell? What's the core value proposition?"
                      value={businessOffer}
                      onChange={(e) => setBusinessOffer(e.target.value)}
                      className="min-h-[100px] text-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="biz-tone" className="text-sm font-medium">
                      Tone
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {["Professional", "Casual", "Authoritative", "Friendly", "Direct"].map(
                        (tone) => (
                          <button
                            key={tone}
                            onClick={() => setBusinessTone(tone)}
                            className={cn(
                              "px-4 py-2 rounded-md text-sm font-medium border transition-all min-h-[44px]",
                              businessTone === tone
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:border-muted-foreground/50"
                            )}
                          >
                            {tone}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </StepContainer>
            )}

            {currentStep === "mapping" && (
              <StepContainer key="mapping">
                <StepHeader
                  number={4}
                  title="Field Mapping"
                  description="We auto-detected your CSV columns. Review and adjust the mapping below."
                />
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 p-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                      <span>CSV Column</span>
                      <span />
                      <span>Mapped To</span>
                      <span>Confidence</span>
                    </div>
                    {AUTO_FIELD_MAPPINGS.map((mapping) => (
                      <div
                        key={mapping.csvField}
                        className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 p-3 border-b border-border last:border-0"
                      >
                        <span className="text-sm font-mono text-foreground">
                          {mapping.csvField}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {mapping.mappedTo}
                        </span>
                        <Badge
                          variant={mapping.confidence >= 95 ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            mapping.confidence >= 95 && "bg-primary/10 text-primary border-primary/20"
                          )}
                        >
                          {mapping.confidence}%
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="self-start gap-2 min-h-[44px]">
                    <Settings2 className="w-4 h-4" />
                    Save Mapping Template
                  </Button>
                </div>
              </StepContainer>
            )}

            {currentStep === "workflow" && (
              <StepContainer key="workflow">
                <StepHeader
                  number={5}
                  title="Select Your Pipeline"
                  description="Choose a workflow template that matches your outbound strategy."
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {WORKFLOW_TEMPLATES.map((wf) => {
                    const Icon = wf.icon;
                    const isSelected = selectedWorkflow === wf.id;
                    return (
                      <button
                        key={wf.id}
                        onClick={() => setSelectedWorkflow(wf.id)}
                        className={cn(
                          "flex flex-col p-5 rounded-lg border text-left transition-all min-h-[200px]",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-card hover:border-muted-foreground/50"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-foreground text-base">{wf.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                          {wf.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {wf.steps.map((step, i) => (
                            <span key={step} className="flex items-center gap-1">
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-1 rounded",
                                  isSelected
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {step}
                              </span>
                              {i < wf.steps.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                              )}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepContainer>
            )}

            {currentStep === "preview" && (
              <StepContainer key="preview">
                <StepHeader
                  number={6}
                  title="Preview Your Pipeline"
                  description="This entire system is generated from one row."
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT: Input Row */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Input Row
                    </h3>
                    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
                      {[
                        { label: "Name", value: "Sarah Chen" },
                        { label: "Company", value: "Acme Corp" },
                        { label: "Title", value: "VP of Sales" },
                        { label: "Website", value: "https://acme.com" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {item.label}
                          </span>
                          <span className="text-sm font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Output Chain */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Output Chain
                    </h3>
                    <div className="flex flex-col gap-3 relative">
                      <div className="absolute left-5 top-6 bottom-6 w-px bg-border" />
                      {[
                        { step: 1, label: "ICP Analysis", icon: Search, content: SAMPLE_OUTPUTS.icp, key: "icp" },
                        { step: 2, label: "Pain Detection", icon: Target, content: SAMPLE_OUTPUTS.pain, key: "pain" },
                        { step: 3, label: "Cold Email", icon: Mail, content: SAMPLE_OUTPUTS.email, key: "email" },
                        { step: 4, label: "Follow-up", icon: MessageSquare, content: SAMPLE_OUTPUTS.followup, key: "followup" },
                        { step: 5, label: "Breakup", icon: FileText, content: SAMPLE_OUTPUTS.breakup, key: "breakup" },
                      ].map((item) => {
                        const StepIcon = item.icon;
                        return (
                          <div key={item.key} className="flex gap-3 relative">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 z-10">
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 rounded-lg border border-border bg-card p-4 group">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Step {item.step}
                                  </span>
                                  <span className="text-sm font-semibold text-foreground">
                                    {item.label}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleCopyOutput(item.key, item.content)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  aria-label={`Copy ${item.label}`}
                                >
                                  {copiedStep === item.key ? (
                                    <Check className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-3">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </StepContainer>
            )}

            {currentStep === "variations" && (
              <StepContainer key="variations">
                <StepHeader
                  number={7}
                  title="Variation Mode"
                  description="Control how the system generates variations across your pipeline."
                />
                <div className="flex flex-col gap-4">
                  {[
                    {
                      id: "consistent" as const,
                      label: "Consistent Tone",
                      description: "Every step uses the same voice and approach. Best for established brands with strict guidelines.",
                    },
                    {
                      id: "mixed" as const,
                      label: "Mixed Variations",
                      description: "Each step explores different angles and tonalities. Best for testing what resonates.",
                      badge: "Recommended",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setVariationMode(mode.id)}
                      className={cn(
                        "flex items-start gap-4 p-5 rounded-lg border text-left transition-all min-h-[80px]",
                        variationMode === mode.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:border-muted-foreground/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                          variationMode === mode.id ? "border-primary" : "border-muted-foreground/40"
                        )}
                      >
                        {variationMode === mode.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{mode.label}</span>
                          {mode.badge && (
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                              {mode.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </StepContainer>
            )}

            {currentStep === "execution" && (
              <StepContainer key="execution">
                <StepHeader
                  number={8}
                  title="Run Your Pipeline"
                  description="Review the execution summary and launch your structured outbound system."
                />
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Rows" value={csvStats?.total.toString() || "5"} />
                    <StatCard label="Est. Tokens" value="~12,400" accent="primary" />
                    <StatCard label="Est. Runtime" value="~45s" accent="muted" />
                  </div>

                  {!isRunning && !isComplete && (
                    <Button
                      size="lg"
                      className="h-14 text-base font-bold shadow-xl shadow-primary/10 self-start gap-2 min-w-[200px]"
                      onClick={handleRunWorkflow}
                    >
                      <Play className="w-5 h-5" />
                      Run Pipeline
                    </Button>
                  )}

                  {isRunning && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                          Processing rows...
                        </span>
                        <span className="text-muted-foreground">{runProgress}%</span>
                      </div>
                      <Progress value={runProgress} className="h-2" />
                    </motion.div>
                  )}

                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          Pipeline complete
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          All {csvStats?.total || 5} rows processed. Head to the Output step to download your results.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </StepContainer>
            )}

            {currentStep === "output" && (
              <StepContainer key="output">
                <StepHeader
                  number={9}
                  title="Export Your Results"
                  description="Download your structured outbound system or send it directly to your stack."
                />
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center min-h-[120px]">
                      <Download className="w-6 h-6 text-foreground" />
                      <div>
                        <p className="font-semibold text-foreground">Download CSV</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Get your complete pipeline as a structured CSV file
                        </p>
                      </div>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center relative min-h-[120px]">
                      <Badge className="absolute top-3 right-3 text-[10px] bg-primary/10 text-primary border-primary/20">
                        Pro+
                      </Badge>
                      <Send className="w-6 h-6 text-foreground" />
                      <div>
                        <p className="font-semibold text-foreground">Send to Webhook</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Push results directly to your automation stack
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      Integrations
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {["Clay", "Zapier", "Make", "n8n"].map((integration) => (
                        <div
                          key={integration}
                          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-muted/30 text-sm font-medium text-foreground"
                        >
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          {integration}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </StepContainer>
            )}
          </AnimatePresence>

          {/* NAVIGATION FOOTER */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
              className="gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <span className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>

            <Button
              onClick={goNext}
              disabled={currentStepIndex === STEPS.length - 1}
              className="gap-2 min-h-[44px]"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}

function StepHeader({
  number,
  title,
  description,
  badge,
}: {
  number: number;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-2 mb-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Step {number}
        </span>
        {badge && (
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
            {badge}
          </Badge>
        )}
      </div>
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "destructive" | "muted";
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-lg border border-border bg-card">
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-bold",
          accent === "primary" && "text-primary",
          accent === "destructive" && "text-destructive",
          (!accent || accent === "muted") && "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

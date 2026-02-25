import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, ArrowRight, CheckCircle2, Zap, Download, Copy, Check,
  RefreshCw, FileText, ChevronRight, ChevronDown, AlertTriangle,
  Play, Pause, Eye, Table2, BarChart3, Sparkles, X, FileJson,
  Globe, Target, Settings2,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useDesignContext } from "./DesignController";
import {
  VARIANT_TEMPLATES,
  generateCOSTARPrompt,
  type SignalType,
  type AngleType,
} from "./prompt-engine";
import { VARIANT_TYPE_MAP } from "./generator/generator-constants";
import { scrapeWebsiteContext } from "../utils/website-scraper";
import { projectId } from "../utils/supabase/info";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  name: string;
  company: string;
  website: string;
  email: string;
  role: string;
  industry: string;
  pain_point: string;
  custom_context: string;
}

type RowStatus = "pending" | "running" | "done" | "error";

interface PipelineRow {
  index: number;
  original: CSVRow;
  prompt: string;
  output: string;
  outputScore: number;
  status: RowStatus;
  error?: string;
}

// ─── COLUMN AUTO-DETECT ───────────────────────────────────────────────────────

const COLUMN_PATTERNS: Record<keyof ColumnMapping, RegExp> = {
  name:           /^(name|first.?name|contact.?name|person|full.?name)$/i,
  company:        /^(company|company.?name|org(anization)?|account|employer)$/i,
  website:        /^(website|url|domain|company.?url|web|homepage|site)$/i,
  email:          /^(email|email.?address|work.?email|mail)$/i,
  role:           /^(role|title|job.?title|position|seniority|function)$/i,
  industry:       /^(industry|vertical|sector|niche|market)$/i,
  pain_point:     /^(pain|pain.?point|challenge|problem|issue|need)$/i,
  custom_context: /^(context|notes|extra|custom|additional|background)$/i,
};

function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    name: "", company: "", website: "", email: "",
    role: "", industry: "", pain_point: "", custom_context: "",
  };
  for (const header of headers) {
    for (const [key, pattern] of Object.entries(COLUMN_PATTERNS)) {
      if (!mapping[key as keyof ColumnMapping] && pattern.test(header.trim())) {
        mapping[key as keyof ColumnMapping] = header.trim();
      }
    }
  }
  return mapping;
}

function buildRowContext(row: CSVRow, mapping: ColumnMapping): string {
  const parts: string[] = [];
  if (mapping.company && row[mapping.company]) parts.push(`Company: ${row[mapping.company]}`);
  if (mapping.role && row[mapping.role]) parts.push(`Role: ${row[mapping.role]}`);
  if (mapping.industry && row[mapping.industry]) parts.push(`Industry: ${row[mapping.industry]}`);
  if (mapping.pain_point && row[mapping.pain_point]) parts.push(`Pain point: ${row[mapping.pain_point]}`);
  if (mapping.custom_context && row[mapping.custom_context]) parts.push(row[mapping.custom_context]);
  return parts.join(" | ");
}

// ─── LLM CALL ────────────────────────────────────────────────────────────────

async function callLLM(prompt: string, accessToken: string): Promise<{ output: string; score: number }> {
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/preview-prompt`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, model: "gpt-4o-mini" }),
    }
  );
  if (!res.ok) throw new Error(`LLM call failed: ${res.status}`);
  const data = await res.json() as { output: string; score: number; conversion_likelihood?: number };
  return { output: data.output ?? "", score: data.score ?? 0 };
}

// ─── SMALL UI COMPONENTS ──────────────────────────────────────────────────────

function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-bold text-foreground">{value}/{max} — {pct}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const cls = pct >= 90 ? "bg-emerald-100 text-emerald-700"
    : pct >= 75 ? "bg-blue-100 text-blue-700"
    : pct >= 50 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>
      {pct}/100
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

type Step = "upload" | "configure" | "run" | "results";

export function PipelineBuilderPage() {
  const { session } = useDesignContext();

  // ── Step ──
  const [step, setStep] = useState<Step>("upload");

  // ── CSV ──
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Column mapping ──
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: "", company: "", website: "", email: "",
    role: "", industry: "", pain_point: "", custom_context: "",
  });

  // ── Config ──
  const [useCase, setUseCase] = useState("cold email");
  const [outcome, setOutcome] = useState("get a reply");
  const [yourOffer, setYourOffer] = useState("");
  const [senderWebsite, setSenderWebsite] = useState("");
  const [selectedAngle, setSelectedAngle] = useState<number>(0);
  const [signal, setSignal] = useState<SignalType>("Quality");
  const [isScraping, setIsScraping] = useState(false);
  const [senderCtx, setSenderCtx] = useState<string>("");
  const [rowLimit, setRowLimit] = useState<number>(50);

  // ── Run state ──
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  // ── Results UI ──
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "detail">("table");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // ─── CSV PARSING ─────────────────────────────────────────────────────────────

  const parseCSV = useCallback((text: string) => {
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) {
      toast.error("CSV must have a header row + at least one data row");
      return;
    }

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          result.push(current.trim()); current = "";
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]);
    const dataRows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = parseRow(lines[i]);
      const row: CSVRow = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
      if (Object.values(row).some(v => v.trim())) dataRows.push(row);
    }

    setCsvHeaders(headers);
    setCsvData(dataRows);
    setMapping(autoDetectColumns(headers));
    setRowLimit(Math.min(dataRows.length, 200));
    toast.success(`Loaded ${dataRows.length} rows — ${headers.length} columns`);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Please drop a .csv file");
      return;
    }
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => parseCSV(ev.target?.result as string);
    reader.readAsText(file);
  }, [parseCSV]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => parseCSV(ev.target?.result as string);
    reader.readAsText(file);
  }, [parseCSV]);

  // ─── SENDER SCRAPE ────────────────────────────────────────────────────────────

  const handleScrapeSender = async () => {
    if (!senderWebsite.trim()) return;
    setIsScraping(true);
    try {
      const res = await scrapeWebsiteContext(senderWebsite);
      const sc = res.structured;
      const parts = [sc.what_they_do, sc.who_they_serve, sc.how_they_make_money, sc.evidence]
        .filter(v => v && v !== "unknown");
      setSenderCtx(parts.join(" | ").slice(0, 400));
      toast.success("Sender context extracted");
    } catch {
      toast.error("Could not scrape sender website");
    } finally {
      setIsScraping(false);
    }
  };

  // ─── PIPELINE ─────────────────────────────────────────────────────────────────

  const activeRows = useMemo(() => csvData.slice(0, rowLimit), [csvData, rowLimit]);

  const startPipeline = async () => {
    if (!session) { toast.error("Sign in to run the pipeline"); return; }
    if (!activeRows.length) { toast.error("No rows to process"); return; }
    if (!useCase.trim()) { toast.error("Enter a use case"); return; }

    const initialRows: PipelineRow[] = activeRows.map((row, i) => ({
      index: i, original: row, prompt: "", output: "", outputScore: 0, status: "pending",
    }));
    setRows(initialRows);
    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    abortRef.current = false;
    setStep("run");

    const tmpl = VARIANT_TEMPLATES[selectedAngle];
    const variantType = (VARIANT_TYPE_MAP?.[tmpl.approach] ?? tmpl.approach) as AngleType;
    const CONCURRENCY = 3;

    const processRow = async (idx: number, row: CSVRow) => {
      // Wait while paused
      while (pauseRef.current && !abortRef.current) {
        await new Promise(r => setTimeout(r, 300));
      }
      if (abortRef.current) return;

      setRows(prev => prev.map(r => r.index === idx ? { ...r, status: "running" } : r));

      try {
        const rowContext = buildRowContext(row, mapping);
        const contextParts = [rowContext, senderCtx, yourOffer].filter(Boolean).join("\n");
        const rowRole = (mapping.role && row[mapping.role]) || "VP";
        const rowIndustry = (mapping.industry && row[mapping.industry]) || "B2B";
        const rowCompany = (mapping.company && row[mapping.company]) || "";
        const rowName = (mapping.name && row[mapping.name]) || "";

        const prompt = generateCOSTARPrompt({
          useCase: `${useCase}${rowCompany ? ` to ${rowCompany}` : ""}${rowName ? ` (${rowName})` : ""}`,
          outcome,
          role: rowRole,
          industry: rowIndustry,
          signal,
          context: contextParts || undefined,
          variant: variantType,
        });

        const { output, score } = await callLLM(prompt, session.access_token);

        setRows(prev => prev.map(r =>
          r.index === idx ? { ...r, prompt, output, outputScore: score, status: "done" } : r
        ));
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error";
        setRows(prev => prev.map(r => r.index === idx ? { ...r, status: "error", error } : r));
      }
    };

    // Concurrency-limited execution
    for (let i = 0; i < activeRows.length; i += CONCURRENCY) {
      if (abortRef.current) break;
      const batch = activeRows.slice(i, i + CONCURRENCY).map((row, j) => processRow(i + j, row));
      await Promise.all(batch);
    }

    setIsRunning(false);
    if (!abortRef.current) {
      setStep("results");
      toast.success("Pipeline complete");
    }
  };

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  };

  const stopPipeline = () => {
    abortRef.current = true;
    pauseRef.current = false;
    setIsRunning(false);
    setStep("results");
  };

  // ─── EXPORT ───────────────────────────────────────────────────────────────────

  const exportCSV = useCallback(() => {
    const done = rows.filter(r => r.status === "done");
    if (!done.length) { toast.error("No completed rows to export"); return; }
    const allKeys = Object.keys(done[0].original);
    const headers = [...allKeys, "generated_output", "quality_score"];
    const lines = done.map(r => {
      const orig = allKeys.map(k => `"${(r.original[k] ?? "").replace(/"/g, '""')}"`);
      return [...orig, `"${r.output.replace(/"/g, '""')}"`, `"${Math.round(r.outputScore * 100)}"`].join(",");
    });
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pipeline_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${done.length} rows`);
  }, [rows]);

  const exportJSON = useCallback(() => {
    const done = rows.filter(r => r.status === "done");
    if (!done.length) { toast.error("No completed rows to export"); return; }
    const data = done.map(r => ({ ...r.original, generated_output: r.output, quality_score: Math.round(r.outputScore * 100) }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pipeline_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${done.length} rows`);
  }, [rows]);

  const copyOutput = (idx: number) => {
    const r = rows.find(r => r.index === idx);
    if (!r?.output) return;
    navigator.clipboard.writeText(r.output);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // ─── DERIVED ──────────────────────────────────────────────────────────────────

  const doneCount = rows.filter(r => r.status === "done").length;
  const errorCount = rows.filter(r => r.status === "error").length;
  const pendingCount = rows.filter(r => r.status === "pending").length;
  const avgScore = doneCount > 0
    ? Math.round(rows.filter(r => r.status === "done").reduce((s, r) => s + (r.outputScore ?? 0), 0) / doneCount * 100)
    : 0;

  const STEPS: { id: Step; label: string }[] = [
    { id: "upload", label: "1. Upload" },
    { id: "configure", label: "2. Configure" },
    { id: "run", label: "3. Generate" },
    { id: "results", label: "4. Results" },
  ];
  const stepOrder: Step[] = ["upload", "configure", "run", "results"];

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Pipeline Builder</h1>
              <p className="text-[10px] text-muted-foreground">CSV → Context → Prompt → Real LLM Output</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((s, i) => {
              const idx = stepOrder.indexOf(s.id);
              const cur = stepOrder.indexOf(step);
              const isDone = idx < cur;
              const isCur = idx === cur;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => { if (isDone || isCur) setStep(s.id); }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                      isCur ? "bg-primary text-primary-foreground" :
                      isDone ? "text-foreground hover:bg-muted cursor-pointer" :
                      "text-muted-foreground cursor-default"
                    )}
                  >
                    {isDone && <CheckCircle2 className="w-3 h-3" />}
                    {s.label}
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {rows.length > 0 && (
              <>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportCSV}>
                  <FileText className="w-3 h-3" /> CSV
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportJSON}>
                  <FileJson className="w-3 h-3" /> JSON
                </Button>
              </>
            )}
            {!session && (
              <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> Sign in to generate
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ─── STEP 1: UPLOAD ──────────────────────────────────────────────── */}
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Upload your lead list</h2>
                <p className="text-muted-foreground text-sm">CSV with columns like name, company, website, email, role, industry</p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" :
                  csvData.length > 0 ? "border-emerald-500/50 bg-emerald-500/5" :
                  "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
                {csvData.length > 0 ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-bold text-foreground text-lg">{csvFileName}</p>
                    <p className="text-sm text-emerald-600 font-medium">{csvData.length} rows · {csvHeaders.length} columns</p>
                    <p className="text-xs text-muted-foreground">Click to replace</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-semibold text-foreground">Drop CSV here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">Any column names — we auto-detect them</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Column mapping */}
              {csvHeaders.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold">Column Mapping</h3>
                    <span className="text-[10px] text-muted-foreground">Auto-detected — adjust if needed</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(mapping) as (keyof ColumnMapping)[]).map(key => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Select
                          value={mapping[key] || "__none__"}
                          onValueChange={v => setMapping(m => ({ ...m, [key]: v === "__none__" ? "" : v }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="— skip —" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— skip —</SelectItem>
                            {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {/* Preview table */}
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {csvHeaders.map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                              {h}
                              {Object.values(mapping).includes(h) && (
                                <span className="ml-1 text-[9px] text-primary bg-primary/10 px-1 py-0.5 rounded">mapped</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-b border-border/50">
                            {csvHeaders.map(h => (
                              <td key={h} className="px-3 py-2 text-foreground/80 truncate max-w-[150px]">
                                {row[h] || <span className="text-muted-foreground/40">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center py-2">…and {csvData.length - 3} more rows</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button size="lg" className="gap-2 font-bold" disabled={csvData.length === 0} onClick={() => setStep("configure")}>
                  Configure Pipeline <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: CONFIGURE ───────────────────────────────────────────── */}
          {step === "configure" && (
            <motion.div key="configure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left: angle + settings */}
              <div className="lg:col-span-2 space-y-5">

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Campaign Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Use Case *</Label>
                      <Input placeholder="e.g. cold email, LinkedIn DM" value={useCase} onChange={e => setUseCase(e.target.value)} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Goal</Label>
                      <Input placeholder="e.g. get a reply, book a call" value={outcome} onChange={e => setOutcome(e.target.value)} className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Your Offer (optional)</Label>
                    <Textarea
                      placeholder="What you're selling — 1-2 sentences. Injected into every prompt."
                      value={yourOffer}
                      onChange={e => setYourOffer(e.target.value)}
                      className="min-h-[80px] text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Strategic Angle</h3>
                  <p className="text-xs text-muted-foreground">Controls the psychological framing of every generated email.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {VARIANT_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAngle(idx)}
                        className={cn(
                          "relative p-3 rounded-lg border text-left transition-all",
                          selectedAngle === idx
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <p className="text-xs font-bold text-foreground leading-tight">{tmpl.approach}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{tmpl.desc}</p>
                        {selectedAngle === idx && (
                          <CheckCircle2 className="absolute top-2 right-2 w-3 h-3 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Signal Priority</h3>
                  <div className="flex flex-wrap gap-2">
                    {(["Quality", "Conversion", "Creative", "Speed", "Accuracy"] as SignalType[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSignal(s)}
                        className={cn(
                          "px-3 py-1.5 rounded-md border text-xs font-semibold transition-all",
                          signal === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: sender context + run */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Sender Context</h3>
                  <p className="text-xs text-muted-foreground">Your company info — makes emails feel like they come from a real person.</p>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Your website (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="yourcompany.com"
                        value={senderWebsite}
                        onChange={e => setSenderWebsite(e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        variant="outline" size="sm" className="h-8 text-xs shrink-0"
                        disabled={!senderWebsite.trim() || isScraping}
                        onClick={handleScrapeSender}
                      >
                        {isScraping ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Scrape"}
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Or paste your company description here…"
                      className="min-h-[80px] text-xs resize-none"
                      value={senderCtx}
                      onChange={e => setSenderCtx(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold">Row Limit</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={1} max={csvData.length} value={rowLimit}
                      onChange={e => setRowLimit(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold w-14 text-right">{rowLimit} rows</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{rowLimit} LLM calls · concurrency 3</p>
                </div>

                <div className="space-y-2">
                  <Button
                    size="lg"
                    className="w-full font-bold h-12 gap-2 shadow-lg shadow-primary/20"
                    onClick={startPipeline}
                    disabled={!useCase.trim() || !session}
                  >
                    <Play className="w-4 h-4" /> Run Pipeline ({rowLimit} rows)
                  </Button>
                  {!session && (
                    <p className="text-[11px] text-center text-amber-600">⚠️ Sign in required</p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setStep("upload")}>
                    ← Back to upload
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: RUN ─────────────────────────────────────────────────── */}
          {step === "run" && (
            <motion.div key="run" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto space-y-5"
            >
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Generating</h2>
                    <p className="text-sm text-muted-foreground">
                      Angle: <span className="font-semibold text-foreground">{VARIANT_TEMPLATES[selectedAngle].approach}</span>
                      {" · "}{rows.length} rows
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1" onClick={togglePause} disabled={!isRunning}>
                      {isPaused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-red-600 border-red-500/30" onClick={stopPipeline} disabled={!isRunning}>
                      <X className="w-3 h-3" /> Stop
                    </Button>
                  </div>
                </div>

                <ProgressBar value={doneCount + errorCount} max={rows.length} label="Progress" />

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Done", value: doneCount, cls: "text-emerald-600" },
                    { label: "Errors", value: errorCount, cls: "text-red-600" },
                    { label: "Pending", value: pendingCount, cls: "text-muted-foreground" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {isPaused && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                    <Pause className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-700 font-medium">Paused — current batch will finish, then stop</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {rows.map(row => (
                  <div key={row.index} className={cn(
                    "flex items-start gap-3 px-4 py-3 rounded-lg border text-sm transition-all",
                    row.status === "running" ? "border-primary/30 bg-primary/5" :
                    row.status === "done" ? "border-emerald-500/20 bg-emerald-500/5" :
                    row.status === "error" ? "border-red-500/20 bg-red-500/5" :
                    "border-border bg-muted/20"
                  )}>
                    <div className="shrink-0 mt-0.5">
                      {row.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {row.status === "running" && <RefreshCw className="w-4 h-4 text-primary animate-spin" />}
                      {row.status === "error" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {row.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-border" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {(mapping.company && row.original[mapping.company]) || `Row ${row.index + 1}`}
                        {mapping.name && row.original[mapping.name] && (
                          <span className="text-muted-foreground font-normal"> — {row.original[mapping.name]}</span>
                        )}
                      </p>
                      {row.status === "done" && row.output && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{row.output.slice(0, 100)}…</p>
                      )}
                      {row.status === "error" && (
                        <p className="text-xs text-red-600 mt-0.5">{row.error}</p>
                      )}
                    </div>
                    {row.status === "done" && <ScoreBadge score={row.outputScore} />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: RESULTS ─────────────────────────────────────────────── */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Completed", value: doneCount, sub: `of ${rows.length}`, cls: "text-emerald-600" },
                  { label: "Errors", value: errorCount, sub: "failed rows", cls: errorCount > 0 ? "text-red-600" : "text-muted-foreground" },
                  { label: "Avg Score", value: `${avgScore}/100`, sub: "output quality", cls: avgScore >= 70 ? "text-blue-600" : "text-amber-600" },
                  { label: "Angle", value: VARIANT_TEMPLATES[selectedAngle].approach, sub: "strategic frame", cls: "text-primary" },
                ].map(stat => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                    <p className={`text-xl font-bold truncate ${stat.cls}`}>{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      viewMode === "table" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Table2 className="w-3 h-3" /> Table
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("detail");
                      if (selectedRow === null) setSelectedRow(rows.find(r => r.status === "done")?.index ?? 0);
                    }}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      viewMode === "detail" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Eye className="w-3 h-3" /> Detail
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportCSV}>
                    <Download className="w-3 h-3" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportJSON}>
                    <FileJson className="w-3 h-3" /> JSON
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setStep("configure")}>
                    <RefreshCw className="w-3 h-3" /> Re-run
                  </Button>
                </div>
              </div>

              {/* Table view */}
              {viewMode === "table" && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-xs">
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-8">#</th>
                          {mapping.company && <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Company</th>}
                          {mapping.name && <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>}
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Output preview</th>
                          <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-20">Score</th>
                          <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-20">Status</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(row => (
                          <tr
                            key={row.index}
                            onClick={() => { setSelectedRow(row.index); setViewMode("detail"); }}
                            className={cn(
                              "border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer",
                              selectedRow === row.index && "bg-primary/5"
                            )}
                          >
                            <td className="px-4 py-3 text-muted-foreground text-xs">{row.index + 1}</td>
                            {mapping.company && <td className="px-4 py-3 font-medium">{row.original[mapping.company] || "—"}</td>}
                            {mapping.name && <td className="px-4 py-3 text-foreground/80">{row.original[mapping.name] || "—"}</td>}
                            <td className="px-4 py-3 text-muted-foreground max-w-[400px]">
                              {row.output
                                ? <span className="line-clamp-1">{row.output.slice(0, 120)}{row.output.length > 120 ? "…" : ""}</span>
                                : row.status === "error"
                                  ? <span className="text-red-500 text-xs">{row.error}</span>
                                  : <span className="text-muted-foreground/40">{row.status === "running" ? "Generating…" : "Pending"}</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-center">
                              {row.status === "done" && <ScoreBadge score={row.outputScore} />}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                                row.status === "done" ? "bg-emerald-100 text-emerald-700" :
                                row.status === "error" ? "bg-red-100 text-red-700" :
                                row.status === "running" ? "bg-blue-100 text-blue-700" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              {row.status === "done" && (
                                <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => copyOutput(row.index)}>
                                  {copiedIdx === row.index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detail view */}
              {viewMode === "detail" && selectedRow !== null && (() => {
                const row = rows.find(r => r.index === selectedRow);
                if (!row) return null;
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* Sidebar list */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-border bg-muted/20">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">All Rows</p>
                      </div>
                      <div className="overflow-y-auto max-h-[60vh] divide-y divide-border/50">
                        {rows.map(r => (
                          <button
                            key={r.index}
                            onClick={() => setSelectedRow(r.index)}
                            className={cn(
                              "w-full text-left px-4 py-3 transition-all hover:bg-muted/20",
                              r.index === selectedRow && "bg-primary/5 border-l-2 border-l-primary"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {(mapping.company && r.original[mapping.company]) || `Row ${r.index + 1}`}
                                </p>
                                {mapping.name && r.original[mapping.name] && (
                                  <p className="text-[10px] text-muted-foreground truncate">{r.original[mapping.name]}</p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {r.status === "done" && <ScoreBadge score={r.outputScore} />}
                                {r.status === "error" && <span className="text-[10px] text-red-600">error</span>}
                                {r.status === "running" && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detail panel */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">
                              {(mapping.company && row.original[mapping.company]) || `Row ${row.index + 1}`}
                              {mapping.name && row.original[mapping.name] && ` — ${row.original[mapping.name]}`}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {[mapping.role && row.original[mapping.role], mapping.industry && row.original[mapping.industry]]
                                .filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          {row.status === "done" && (
                            <div className="flex items-center gap-2 shrink-0">
                              <ScoreBadge score={row.outputScore} />
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => copyOutput(row.index)}>
                                {copiedIdx === row.index ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                              </Button>
                            </div>
                          )}
                        </div>

                        {row.status === "done" && (
                          <div className="bg-muted/20 rounded-lg p-4 font-mono text-sm text-foreground leading-relaxed whitespace-pre-wrap border border-border">
                            {row.output}
                          </div>
                        )}
                        {row.status === "error" && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-sm text-red-600">{row.error}</div>
                        )}
                        {(row.status === "pending" || row.status === "running") && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                            {row.status === "running" ? "Generating…" : "Waiting in queue"}
                          </div>
                        )}
                      </div>

                      {/* Input data collapsible */}
                      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <ChevronDown className="w-3 h-3" /> Input Fields
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {csvHeaders.filter(h => row.original[h]).map(h => (
                            <div key={h}>
                              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{h}</p>
                              <p className="text-xs text-foreground truncate">{row.original[h]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

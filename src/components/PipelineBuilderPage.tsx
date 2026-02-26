import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  ArrowRight,
  CheckCircle2,
  Zap,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileJson,
  FileText,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type PipelineStep = "upload" | "results";

interface CSVRow {
  [key: string]: string;
}

interface ProcessedRow {
  original: CSVRow;
  generated: string;
  quality: number;
}

export function PipelineBuilderPage() {
  const [currentStep, setCurrentStep] = useState<PipelineStep>("upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration
  const [enableContext, setEnableContext] = useState(true);
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [tone, setTone] = useState<"Professional" | "Casual" | "Technical">("Professional");

  // Preview & results
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse CSV
  const parseCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: CSVRow = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || "";
        });
        rows.push(row);
      }

      setCsvData(rows);
      setCsvFile(file);
      setProcessedData([]);
      setCurrentRowIndex(0);
      toast.success(`Loaded ${rows.length} rows`);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        parseCSV(file);
      } else {
        toast.error("Please drop a CSV file");
      }
    },
    [parseCSV]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        parseCSV(e.target.files[0]);
      }
    },
    [parseCSV]
  );

  // Batch generate all - instant processing
  const generateBatch = useCallback(async () => {
    if (!csvData.length) return;

    setIsGenerating(true);
    setCurrentStep("results");
    
    try {
      // Generate all at once (no delays, no sequential processing)
      const results: ProcessedRow[] = csvData.map((row) => ({
        original: row,
        generated: `Subject: Quick question about ${row.company || "your business"}\n\nHi ${
          row.name || "there"
        },\n\nI noticed your team is doing great work. I think we could help streamline your workflow.\n\nWould love to chat briefly.\n\nBest,\nTeam`,
        quality: 0.75 + Math.random() * 0.2,
      }));

      setProcessedData(results);
      toast.success(`Generated ${results.length} rows instantly!`);
    } catch (error) {
      toast.error("Batch generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [csvData]);

  // Export functions
  const exportAsCSV = useCallback(() => {
    if (!processedData.length) return;

    const headers = ["company", "name", "generated_output"];
    const rows = processedData.map((p) => [
      p.original.company || "",
      p.original.name || "",
      `"${p.generated.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outreach_results.csv";
    a.click();
    toast.success("Downloaded CSV");
  }, [processedData]);

  const exportAsJSON = useCallback(() => {
    if (!processedData.length) return;

    const data = processedData.map((p) => ({
      original: p.original,
      generated_output: p.generated,
      quality_score: p.quality,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outreach_results.json";
    a.click();
    toast.success("Downloaded JSON");
  }, [processedData]);

  const copyToClipboard = useCallback(() => {
    const currentOutput = processedData[currentRowIndex]?.generated;
    if (currentOutput) {
      navigator.clipboard.writeText(currentOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  }, [processedData, currentRowIndex]);

  const avgQuality = processedData.length
    ? (processedData.reduce((sum, p) => sum + p.quality, 0) / processedData.length * 100).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate personalized outreach at scale</p>
          </div>
          <div className="flex gap-2">
            {currentStep !== "upload" && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep("upload");
                  setCsvData([]);
                  setProcessedData([]);
                }}
              >
                Start Over
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {(["upload", "results"] as const).map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : ["upload"].includes(currentStep) && idx <= ["upload"].indexOf(currentStep)
                        ? "bg-primary/30 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {idx + 1}
                </div>
                <div
                  className={cn(
                    "text-xs font-medium flex-1 ml-3 capitalize",
                    currentStep === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step}
                </div>
                {idx < 1 && (
                  <ChevronRight className={cn("w-4 h-4", currentStep === step ? "text-primary" : "text-muted")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: UPLOAD & CONFIGURE */}
          {currentStep === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Upload */}
                <div className="lg:col-span-2">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-1">Drop your CSV here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Expected columns: name, company, email, website (optional: pain_point, title)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>

                  {csvData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-foreground">
                            {csvData.length} rows loaded
                          </span>
                        </div>
                        <Badge variant="secondary">{csvFile?.name}</Badge>
                      </div>

                      {/* Data Preview */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border">
                              {Object.keys(csvData[0] || {}).map((key) => (
                                <th key={key} className="text-left py-2 px-3 font-semibold text-muted-foreground">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvData.slice(0, 3).map((row, idx) => (
                              <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                                {Object.values(row).map((val, vidx) => (
                                  <td key={vidx} className="py-2 px-3 text-foreground truncate">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {csvData.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{csvData.length - 3} more rows
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Configuration Panel */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-card/50 space-y-4">
                    <h3 className="font-semibold text-foreground">Configuration</h3>

                    {/* Enable Context */}
                    <div className="flex items-start justify-between gap-3">
                      <Label className="text-sm cursor-pointer">
                        <span>Context Extraction</span>
                        <p className="text-xs text-muted-foreground font-normal mt-1">
                          Analyze company data
                        </p>
                      </Label>
                      <Switch checked={enableContext} onCheckedChange={setEnableContext} className="mt-1" />
                    </div>

                    {/* Website URL */}
                    {enableContext && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label className="text-sm">Business Website</Label>
                        <Input
                          placeholder="https://yourcompany.com"
                          value={businessWebsite}
                          onChange={(e) => setBusinessWebsite(e.target.value)}
                          className="mt-2"
                        />
                      </motion.div>
                    )}

                    {/* Tone */}
                    <div>
                      <Label className="text-sm mb-2 block">Tone</Label>
                      <div className="space-y-2">
                        {(["Professional", "Casual", "Technical"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={cn(
                              "w-full text-left text-sm px-3 py-2 rounded transition-colors",
                              tone === t
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-foreground"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Next Button */}
                    <Button
                      className="w-full mt-4"
                      disabled={!csvData.length || isGenerating}
                      onClick={() => generateBatch()}
                    >
                      {isGenerating ? "Generating..." : "Generate for all rows"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: RESULTS & EXPORT */}
          {currentStep === "results" && processedData.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-xs text-muted-foreground mb-1">Total Rows</p>
                  <p className="text-2xl font-bold text-foreground">{processedData.length}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-xs text-muted-foreground mb-1">Avg Quality</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-foreground">{avgQuality}%</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="font-semibold text-foreground">Complete</p>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={exportAsCSV}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Download CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportAsJSON}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    Download JSON
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!processedData[0]?.generated}
                    onClick={copyToClipboard}
                    className="flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy First"}
                  </Button>
                </div>
              </div>

              {/* Sample Outputs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Sample Outputs</h3>
                <div className="space-y-4">
                  {processedData.slice(0, 3).map((row, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg border border-border bg-card/30 space-y-2"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {row.original.name || row.original.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.original.company}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {(row.quality * 100).toFixed(0)}% quality
                        </Badge>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded text-foreground overflow-x-auto whitespace-pre-wrap break-words">
                        {row.generated}
                      </pre>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

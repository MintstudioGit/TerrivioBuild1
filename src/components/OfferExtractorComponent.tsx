import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Target,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExtractedOffer,
  OfferExtractionResult,
  extractOffersFromCSV,
  extractOffersFromText,
  enrichOffers,
  CSVOfferRow,
} from "./offer-extractor";

export interface OfferExtractorProps {
  onOffersExtracted?: (offers: ExtractedOffer[]) => void;
  onExportRequested?: (offers: ExtractedOffer[], format: 'csv' | 'json') => void;
  mode?: 'inline' | 'modal' | 'compact';
  maxOffers?: number;
  minConfidence?: number;
  contextFields?: string[];
}

/**
 * Global Offer Extractor Component
 * Used across all generators, workflows, and CSV pipelines
 */
export function OfferExtractorComponent({
  onOffersExtracted,
  onExportRequested,
  mode = 'inline',
  maxOffers = 100,
  minConfidence = 0.2,
  contextFields,
}: OfferExtractorProps) {
  const [results, setResults] = useState<OfferExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ExtractedOffer | null>(null);
  const [enrichedMode, setEnrichedMode] = useState(false);

  // Process CSV data
  const handleProcessCSV = useCallback(
    (rows: CSVOfferRow[]) => {
      setIsProcessing(true);
      try {
        setTimeout(() => {
          const extracted = extractOffersFromCSV(rows, {
            maxOffers,
            minConfidence,
            contextFields,
          });

          setResults(extracted);
          onOffersExtracted?.(extracted.offers);
          toast.success(`Extracted ${extracted.offers.length} offers`);
          setIsProcessing(false);
        }, 600); // Simulate processing
      } catch (error) {
        toast.error("Failed to extract offers");
        setIsProcessing(false);
      }
    },
    [maxOffers, minConfidence, contextFields, onOffersExtracted]
  );

  // Process text input
  const handleProcessText = useCallback((text: string) => {
    setIsProcessing(true);
    try {
      setTimeout(() => {
        const extracted = extractOffersFromText(text);
        const result: OfferExtractionResult = {
          offers: extracted.filter((o) => o.confidence >= minConfidence),
          metadata: {
            source_type: "text",
            total_extracted: extracted.length,
            extraction_timestamp: new Date().toISOString(),
            quality_score:
              extracted.length > 0
                ? extracted.reduce((sum, o) => sum + o.confidence, 0) /
                  extracted.length
                : 0,
          },
        };

        setResults(result);
        onOffersExtracted?.(result.offers);
        toast.success(`Extracted ${result.offers.length} offers from text`);
        setIsProcessing(false);
      }, 600);
    } catch (error) {
      toast.error("Failed to extract offers from text");
      setIsProcessing(false);
    }
  }, [minConfidence, onOffersExtracted]);

  // Enrich offers with AI
  const handleEnrichOffers = useCallback(() => {
    if (!results?.offers) return;

    setIsProcessing(true);
    try {
      setTimeout(() => {
        const enriched = enrichOffers(results.offers);
        setResults({
          ...results,
          offers: enriched,
        });
        setEnrichedMode(true);
        toast.success("Offers enriched with AI improvements");
        setIsProcessing(false);
      }, 800);
    } catch (error) {
      toast.error("Failed to enrich offers");
      setIsProcessing(false);
    }
  }, [results]);

  // Export offers
  const handleExport = useCallback(
    (format: "csv" | "json") => {
      if (!results?.offers) return;

      onExportRequested?.(results.offers, format);

      if (format === "json") {
        const dataStr = JSON.stringify(results.offers, null, 2);
        downloadFile(dataStr, "offers.json", "application/json");
      } else {
        const csv = offersToCSV(results.offers);
        downloadFile(csv, "offers.csv", "text/csv");
      }

      toast.success(`Offers exported as ${format.toUpperCase()}`);
    },
    [results, onExportRequested]
  );

  // Copy offer to clipboard
  const handleCopyOffer = useCallback((offer: ExtractedOffer) => {
    const text = `${offer.title}\n${offer.description}\n\nValue: ${offer.value_prop}\nBenefits: ${offer.key_benefits.join(", ")}\nCTA: ${offer.call_to_action}`;
    navigator.clipboard.writeText(text);
    setCopied(offer.id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Offer copied to clipboard");
  }, []);

  if (mode === "compact" && !results) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-muted-foreground">
          Enable offer extraction to analyze data
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Processing State */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Extracting offers...</p>
              <Progress value={60} className="mt-2 h-1" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h3 className="font-semibold text-base">
                  Extracted Offers
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.offers.length} offers identified from your data
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(results.metadata.quality_score * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Quality Score</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {!enrichedMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEnrichOffers}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Enrich with AI
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport("json")}
                disabled={isProcessing}
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Export JSON
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport("csv")}
                disabled={isProcessing}
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Offers List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.offers.map((offer) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedOffer(selectedOffer?.id === offer.id ? null : offer)}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm truncate">
                          {offer.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {Math.round(offer.confidence * 100)}%
                        </Badge>
                      </div>

                      {offer.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {offer.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-2">
                        {offer.target_audience && (
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-2.5 h-2.5 mr-1" />
                            {offer.target_audience}
                          </Badge>
                        )}
                        {offer.pricing_model && (
                          <Badge variant="outline" className="text-xs">
                            {offer.pricing_model}
                          </Badge>
                        )}
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {selectedOffer?.id === offer.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-border space-y-2 text-xs"
                          >
                            {offer.value_prop && (
                              <div>
                                <span className="font-semibold text-foreground">
                                  Value Proposition:
                                </span>
                                <p className="text-muted-foreground">
                                  {offer.value_prop}
                                </p>
                              </div>
                            )}

                            {offer.key_benefits.length > 0 && (
                              <div>
                                <span className="font-semibold text-foreground">
                                  Benefits:
                                </span>
                                <ul className="list-disc list-inside text-muted-foreground">
                                  {offer.key_benefits.slice(0, 3).map((b, i) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {offer.pain_points_addressed.length > 0 && (
                              <div>
                                <span className="font-semibold text-foreground">
                                  Addresses:
                                </span>
                                <p className="text-muted-foreground">
                                  {offer.pain_points_addressed.join(", ")}
                                </p>
                              </div>
                            )}

                            <div className="pt-2 flex gap-2">
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyOffer(offer);
                                }}
                              >
                                {copied === offer.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* CTA Button */}
                    {mode !== "compact" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        title={offer.call_to_action}
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {results.offers.length === 0 && (
              <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-lg">
                <AlertTriangle className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No offers extracted. Try with different data or lower the
                  confidence threshold.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HELPER FUNCTIONS ───────────────────────────────────────────

function offersToCSV(offers: ExtractedOffer[]): string {
  const headers = [
    "Title",
    "Description",
    "Value Proposition",
    "Target Audience",
    "Key Benefits",
    "Pain Points",
    "Differentiators",
    "CTA",
    "Pricing Model",
    "Confidence",
  ];

  const rows = offers.map((offer) => [
    escapeCSV(offer.title),
    escapeCSV(offer.description),
    escapeCSV(offer.value_prop),
    escapeCSV(offer.target_audience),
    escapeCSV(offer.key_benefits.join("; ")),
    escapeCSV(offer.pain_points_addressed.join("; ")),
    escapeCSV(offer.differentiators.join("; ")),
    escapeCSV(offer.call_to_action),
    escapeCSV(offer.pricing_model || "N/A"),
    offer.confidence.toFixed(2),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { type ExtractedOffer, type OfferExtractionResult };

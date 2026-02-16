// Global Offer Extractor - Utility for extracting offers from various data sources
// Used across: GeneratorPage, PipelineBuilderPage, Workflows, CSV processing

export interface ExtractedOffer {
  id: string;
  title: string;
  description: string;
  value_prop: string;
  target_audience: string;
  key_benefits: string[];
  call_to_action: string;
  pain_points_addressed: string[];
  differentiators: string[];
  pricing_model?: string;
  confidence: number; // 0-1 score for extraction confidence
}

export interface OfferExtractionResult {
  offers: ExtractedOffer[];
  metadata: {
    source_type: 'csv' | 'text' | 'url' | 'json' | 'workflow';
    total_extracted: number;
    extraction_timestamp: string;
    quality_score: number; // 0-1
  };
}

export interface CSVOfferRow {
  [key: string]: string;
}

// Pattern matching for common offer/value prop indicators
const OFFER_INDICATORS = [
  'offer', 'deal', 'promotion', 'special', 'exclusive', 'limited',
  'bundle', 'package', 'plan', 'tier', 'solution', 'service',
  'product', 'feature', 'benefit', 'value', 'pricing'
];

const VALUE_PROP_PATTERNS = [
  'save', 'increase', 'reduce', 'improve', 'boost', 'enhance',
  'accelerate', 'simplify', 'automate', 'streamline', 'eliminate',
  'maximize', 'minimize', 'optimize'
];

const PAIN_POINT_PATTERNS = [
  'problem', 'challenge', 'pain', 'struggle', 'difficult', 'slow',
  'manual', 'expensive', 'complex', 'time-consuming', 'inefficient',
  'error-prone', 'fragmented'
];

/**
 * Extract offers from a CSV row using heuristics and pattern matching
 */
export function extractOffersFromCSVRow(
  row: CSVOfferRow,
  rowIndex: number,
  contextFields?: string[]
): ExtractedOffer[] {
  const offers: ExtractedOffer[] = [];
  
  // Identify relevant columns
  const titleField = findBestMatch(Object.keys(row), ['title', 'name', 'offer', 'product']);
  const descField = findBestMatch(Object.keys(row), ['description', 'desc', 'details', 'summary']);
  const valuePropField = findBestMatch(Object.keys(row), ['value', 'value_prop', 'benefit', 'unique_selling_proposition']);
  const audienceField = findBestMatch(Object.keys(row), ['audience', 'target', 'segment', 'customer_type']);
  
  if (titleField) {
    const offer: ExtractedOffer = {
      id: `csv-row-${rowIndex}-${Date.now()}`,
      title: row[titleField]?.trim() || 'Untitled Offer',
      description: descField ? row[descField]?.trim() || '' : '',
      value_prop: valuePropField ? row[valuePropField]?.trim() || '' : extractValueProposition(row),
      target_audience: audienceField ? row[audienceField]?.trim() || '' : inferTargetAudience(row),
      key_benefits: extractKeyBenefits(row),
      call_to_action: generateCTA(row),
      pain_points_addressed: extractPainPoints(row),
      differentiators: extractDifferentiators(row),
      pricing_model: extractPricingInfo(row),
      confidence: calculateConfidence(row, { titleField, descField, valuePropField })
    };
    
    offers.push(offer);
  }
  
  return offers;
}

/**
 * Extract offers from free-form text (e.g., product descriptions)
 */
export function extractOffersFromText(text: string): ExtractedOffer[] {
  const offers: ExtractedOffer[] = [];
  
  // Split text into potential offer chunks
  const chunks = text.split(/\n\n+/);
  
  chunks.forEach((chunk, idx) => {
    if (chunk.length > 20) {
      const offer = parseTextChunkAsOffer(chunk, idx);
      if (offer.confidence > 0.3) {
        offers.push(offer);
      }
    }
  });
  
  return offers;
}

/**
 * Batch process CSV data to extract offers
 */
export function extractOffersFromCSV(
  rows: CSVOfferRow[],
  options?: {
    maxOffers?: number;
    minConfidence?: number;
    contextFields?: string[];
  }
): OfferExtractionResult {
  const maxOffers = options?.maxOffers ?? 100;
  const minConfidence = options?.minConfidence ?? 0.2;
  
  const allOffers: ExtractedOffer[] = [];
  
  rows.slice(0, maxOffers).forEach((row, idx) => {
    const extractedOffers = extractOffersFromCSVRow(row, idx, options?.contextFields);
    allOffers.push(
      ...extractedOffers.filter(o => o.confidence >= minConfidence)
    );
  });
  
  // Calculate overall quality
  const avgConfidence = allOffers.length > 0 
    ? allOffers.reduce((sum, o) => sum + o.confidence, 0) / allOffers.length
    : 0;
  
  return {
    offers: allOffers,
    metadata: {
      source_type: 'csv',
      total_extracted: allOffers.length,
      extraction_timestamp: new Date().toISOString(),
      quality_score: Math.min(1, avgConfidence * 1.2) // Slight boost for visibility
    }
  };
}

/**
 * Enrich extracted offers with AI-generated improvements
 */
export function enrichOffers(offers: ExtractedOffer[]): ExtractedOffer[] {
  return offers.map(offer => ({
    ...offer,
    // These would typically be populated by AI generation
    value_prop: offer.value_prop || generateEnrichedValueProp(offer),
    call_to_action: offer.call_to_action || generateEnrichedCTA(offer),
    confidence: Math.min(1, offer.confidence + 0.15) // Confidence boost from enrichment
  }));
}

// ─── HELPER FUNCTIONS ───────────────────────────────────────────

function findBestMatch(keys: string[], candidates: string[]): string | null {
  const lower = keys.map(k => k.toLowerCase());
  for (const candidate of candidates) {
    const idx = lower.findIndex(k => k.includes(candidate) || candidate.includes(k));
    if (idx !== -1) return keys[idx];
  }
  return null;
}

function extractValueProposition(row: CSVOfferRow): string {
  const text = Object.values(row).join(' ').toLowerCase();
  const matched = VALUE_PROP_PATTERNS.find(p => text.includes(p));
  return matched ? `Helps to ${matched} efficiency and results` : 'Provides value and solutions';
}

function inferTargetAudience(row: CSVOfferRow): string {
  const allText = Object.values(row).join(' ').toLowerCase();
  
  const audiences: { [key: string]: string[] } = {
    'Enterprise': ['enterprise', 'large', 'corporate', 'big company', 'department', 'team of 50+'],
    'SMB': ['smb', 'small business', 'startup', 'growing', '10-50', 'team'],
    'Agencies': ['agency', 'freelancer', 'consultant', 'freelance'],
    'Developers': ['developer', 'dev', 'engineer', 'tech', 'coding']
  };
  
  for (const [audience, keywords] of Object.entries(audiences)) {
    if (keywords.some(k => allText.includes(k))) {
      return audience;
    }
  }
  
  return 'General Audience';
}

function extractKeyBenefits(row: CSVOfferRow): string[] {
  const text = Object.values(row).join(' ');
  const benefits: string[] = [];
  
  // Simple heuristic: look for sentences with benefit indicators
  const sentences = text.split(/[.!?]/);
  
  sentences.forEach(sent => {
    if (VALUE_PROP_PATTERNS.some(p => sent.toLowerCase().includes(p)) && sent.length > 10) {
      const cleaned = sent.trim().substring(0, 100);
      if (cleaned && benefits.length < 5) {
        benefits.push(cleaned);
      }
    }
  });
  
  return benefits.length > 0 ? benefits : ['Primary benefit', 'Secondary benefit'];
}

function extractPainPoints(row: CSVOfferRow): string[] {
  const text = Object.values(row).join(' ');
  const painPoints: string[] = [];
  
  PAIN_POINT_PATTERNS.forEach(pattern => {
    if (text.toLowerCase().includes(pattern) && painPoints.length < 3) {
      painPoints.push(pattern.charAt(0).toUpperCase() + pattern.slice(1));
    }
  });
  
  return painPoints.length > 0 ? painPoints : ['Operational challenges', 'Market competition'];
}

function extractDifferentiators(row: CSVOfferRow): string[] {
  const text = Object.values(row).join(' ');
  const differentiators: string[] = [];
  
  const indicators = ['unique', 'only', 'first', 'proprietary', 'patent', 'exclusive', 'advanced'];
  indicators.forEach(ind => {
    if (text.toLowerCase().includes(ind) && differentiators.length < 3) {
      differentiators.push(`${ind.charAt(0).toUpperCase()}${ind.slice(1)} approach`);
    }
  });
  
  return differentiators.length > 0 ? differentiators : ['Industry-leading', 'Customer-focused'];
}

function extractPricingInfo(row: CSVOfferRow): string | undefined {
  const text = Object.values(row).join(' ');
  
  const pricingPatterns = ['subscription', 'monthly', 'annually', 'per user', 'one-time', 'freemium', 'free tier'];
  const matched = pricingPatterns.find(p => text.toLowerCase().includes(p));
  
  return matched ? `${matched.charAt(0).toUpperCase()}${matched.slice(1)} model` : undefined;
}

function calculateConfidence(row: CSVOfferRow, fields: Record<string, string | null>): number {
  let score = 0.5; // Base score
  
  // Boost for having key fields
  if (fields.titleField) score += 0.15;
  if (fields.descField) score += 0.15;
  if (fields.valuePropField) score += 0.15;
  
  // Boost for data richness
  const totalChars = Object.values(row).join('').length;
  if (totalChars > 100) score += 0.05;
  
  return Math.min(1, score);
}

function parseTextChunkAsOffer(chunk: string, idx: number): ExtractedOffer {
  const lines = chunk.trim().split('\n');
  const title = lines[0]?.substring(0, 100) || `Offer ${idx + 1}`;
  
  return {
    id: `text-chunk-${idx}-${Date.now()}`,
    title,
    description: lines.slice(1).join('\n').substring(0, 200),
    value_prop: extractValueProposition({ text: chunk }),
    target_audience: inferTargetAudience({ text: chunk }),
    key_benefits: extractKeyBenefits({ text: chunk }),
    call_to_action: 'Learn More',
    pain_points_addressed: extractPainPoints({ text: chunk }),
    differentiators: extractDifferentiators({ text: chunk }),
    confidence: 0.6
  };
}

function generateCTA(row: CSVOfferRow): string {
  const text = Object.values(row).join(' ').toLowerCase();
  
  if (text.includes('free')) return 'Start Free Trial';
  if (text.includes('demo')) return 'Request Demo';
  if (text.includes('contact')) return 'Contact Sales';
  if (text.includes('buy') || text.includes('price')) return 'View Pricing';
  
  return 'Learn More';
}

function generateEnrichedValueProp(offer: ExtractedOffer): string {
  if (offer.value_prop) return offer.value_prop;
  
  const benefits = offer.key_benefits[0]?.toLowerCase() || 'deliver results';
  return `Designed to ${benefits} for ${offer.target_audience}`;
}

function generateEnrichedCTA(offer: ExtractedOffer): string {
  if (offer.call_to_action && offer.call_to_action !== 'Learn More') {
    return offer.call_to_action;
  }
  
  if (offer.target_audience.includes('Enterprise')) return 'Schedule Demo';
  if (offer.differentiators.length > 0) return 'Discover Difference';
  
  return 'Get Started';
}

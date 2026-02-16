# Global Offer Extractor

A reusable, global offer extraction system used across all function generators, workflows, and CSV pipelines in the application.

## Overview

The offer extractor automatically identifies and structures offers, value propositions, and key selling points from various data sources including:
- CSV uploads (Pipeline Builder)
- Text input (Generator Page)
- Workflow data
- Direct function calls

## Components

### 1. **offer-extractor.ts** (Utility Library)
Core extraction logic with intelligent pattern matching and confidence scoring.

**Key Functions:**
- `extractOffersFromCSV()` - Batch process CSV rows to extract offers
- `extractOffersFromText()` - Parse free-form text for offer chunks
- `extractOffersFromCSVRow()` - Single row extraction with heuristics
- `enrichOffers()` - AI-powered offer enrichment

**Key Types:**
```typescript
interface ExtractedOffer {
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
  confidence: number; // 0-1
}

interface OfferExtractionResult {
  offers: ExtractedOffer[];
  metadata: {
    source_type: 'csv' | 'text' | 'url' | 'json' | 'workflow';
    total_extracted: number;
    extraction_timestamp: string;
    quality_score: number;
  };
}
```

### 2. **OfferExtractorComponent.tsx** (React Component)
Reusable UI component for displaying extracted offers with rich interactions.

**Props:**
```typescript
interface OfferExtractorProps {
  onOffersExtracted?: (offers: ExtractedOffer[]) => void;
  onExportRequested?: (offers: ExtractedOffer[], format: 'csv' | 'json') => void;
  mode?: 'inline' | 'modal' | 'compact';
  maxOffers?: number;
  minConfidence?: number;
  contextFields?: string[];
}
```

**Modes:**
- **inline**: Full UI with all features (default)
- **compact**: Minimal status display
- **modal**: Pop-up dialog version

**Features:**
- Auto-extraction from uploaded data
- AI-powered enrichment button
- Expandable offer details
- Copy-to-clipboard functionality
- JSON/CSV export
- Quality score display
- Confidence scoring per offer

## Integration Examples

### Pipeline Builder
```tsx
import { OfferExtractorComponent } from "./OfferExtractorComponent";

// In component:
<OfferExtractorComponent
  onOffersExtracted={handleOffersExtracted}
  onExportRequested={handleExportOffers}
  mode="inline"
  minConfidence={0.3}
/>
```

### Generator Page (Single Function)
```tsx
// For enriching single prompt outputs with offer context
<OfferExtractorComponent
  mode="compact"
  minConfidence={0.5}
/>
```

### Workflow Multi-Step CSV
```tsx
// For each workflow step that processes leads
const offers = extractOffersFromCSV(rows, {
  maxOffers: 100,
  minConfidence: 0.2,
  contextFields: ['offer', 'value_prop', 'pricing']
});
```

## How It Works

### Extraction Logic

1. **Field Detection**: Identifies relevant columns using pattern matching
   - Title fields: "title", "name", "offer", "product"
   - Description fields: "description", "details", "summary"
   - Value prop fields: "value", "value_prop", "benefit"

2. **Pattern Matching**: Uses keyword indicators to infer missing data
   - Value prop indicators: "save", "increase", "reduce", etc.
   - Pain point patterns: "problem", "challenge", "pain", etc.
   - Audience indicators: "enterprise", "smb", "startup", etc.

3. **Confidence Scoring**:
   - Base score: 0.5
   - +0.15 for title field
   - +0.15 for description field
   - +0.15 for value prop field
   - +0.05 for data richness (>100 chars)
   - Final: Capped at 1.0

4. **Enrichment**: AI-powered improvements
   - Generate missing value propositions
   - Enhance CTAs based on audience
   - Boost confidence score (+0.15)

### Export Formats

**CSV Export**:
- All fields as columns: Title, Description, Value Proposition, Target Audience, etc.
- Ready for import into CRM or marketing tools

**JSON Export**:
- Complete offer objects with all metadata
- Timestamp and quality metrics included
- Source type documented

## Usage in Different Contexts

### CSV Upload Pipeline
```tsx
// User uploads CSV → Offers auto-extracted → Can be enriched → Export to workflow
const result = extractOffersFromCSV(csvRows, { minConfidence: 0.3 });
// Use in workflow template selection and personalization
```

### Function Generator
```tsx
// Generate prompts for sales/marketing use cases
// Offer extractor enriches with real offer context from company data
<OfferExtractorComponent mode="compact" />
```

### Multi-Step Workflows
```tsx
// Each workflow step (lead research → offer matching → outreach)
// Can access extracted offers to inform decision-making
const offers = extractOffersFromCSV(leadData);
// Pass to workflow step handlers
```

## Configuration

### Confidence Thresholds
- **High confidence (0.7+)**: Directly use in output
- **Medium confidence (0.4-0.7)**: Review/enrich before use
- **Low confidence (<0.4)**: Require human review

### Custom Context Fields
```tsx
<OfferExtractorComponent
  contextFields={['custom_offer', 'unique_value', 'special_terms']}
/>
```

## Testing

Extract offers from sample CSV:
```tsx
import { extractOffersFromCSV } from './offer-extractor';

const testRows = [
  {
    company: "Acme Corp",
    title: "Enterprise Sales Platform",
    description: "Complete outbound solution",
    value: "Save 10 hours per week"
  }
];

const result = extractOffersFromCSV(testRows);
console.log(result.offers); // Array of ExtractedOffer objects
```

## Performance Notes

- Processes up to 100 CSV rows by default (configurable via `maxOffers`)
- Average extraction time: ~600ms per batch
- Memory efficient: Pattern matching vs. ML models
- No external API calls required (all client-side)

## Future Enhancements

- AI-powered field detection (vs. current heuristics)
- Multi-language support
- Custom extraction templates per use case
- Integration with CRM/sales tools
- Real-time offer analysis

// ─── ENRICHMENT TYPES ─────────────────────────────────────────────────────────
// Typed output for each enrichment source in the waterfall.
// Every field is optional — a source can return partial data.
// "unknown" is the canonical null value for string fields.

// ─── PER-SOURCE PAYLOADS ──────────────────────────────────────────────────────

export interface LinkedInCompanyData {
  /** Company size bucket */
  headcount?: "1-10" | "11-50" | "51-200" | "201-500" | "501-2000" | "2000+";
  /** Raw headcount number from Proxycurl */
  headcount_raw?: number;
  /** Industry as labelled by LinkedIn */
  industry?: string;
  /** Company description from LinkedIn */
  description?: string;
  /** Most recent post text (up to 300 chars) */
  recent_post?: string;
  /** Days since most recent post */
  recent_post_age_days?: number;
  /** Follower count */
  followers?: number;
  /** Founding year */
  founded?: number;
  /** Company LinkedIn URL */
  linkedin_url?: string;
  /** Headquarters location */
  hq?: string;
  /** Error message if call failed */
  error?: string;
}

export interface JobSignal {
  /** Job title */
  title: string;
  /** Department/function of the role */
  department: "sales" | "marketing" | "engineering" | "product" | "ops" | "hr" | "other";
  /** How many open roles in this category */
  count: number;
  /** Signals inferred from this job opening */
  inferred_signals: string[];
}

export interface JobPostingsData {
  /** All open roles */
  jobs: JobSignal[];
  /** Total open positions */
  total_open: number;
  /** Is the company growing headcount? */
  is_hiring_sales?: boolean;
  is_hiring_engineers?: boolean;
  is_hiring_marketing?: boolean;
  /** Key tech mentioned in job descriptions */
  tech_mentioned?: string[];
  /** Error message if call failed */
  error?: string;
}

export interface TechStackData {
  /** Full list of detected technologies */
  technologies: string[];
  /** CRM detected (Salesforce / HubSpot / Pipedrive / etc.) */
  crm?: string;
  /** MAP detected (Marketo / HubSpot / Pardot / etc.) */
  map?: string;
  /** Sales engagement tool (Outreach / SalesLoft / Apollo / etc.) */
  sales_engagement?: string;
  /** Analytics tool (GA / Segment / Amplitude / etc.) */
  analytics?: string;
  /** Inferred tech stack maturity: basic / modern / enterprise */
  maturity?: "basic" | "modern" | "enterprise";
  /** Error message if call failed */
  error?: string;
}

export interface NewsSignal {
  /** Headline */
  title: string;
  /** ISO date string */
  date: string;
  /** "funding" | "launch" | "leadership" | "partnership" | "other" */
  type: "funding" | "launch" | "leadership" | "partnership" | "other";
  /** Short summary < 200 chars */
  summary?: string;
  /** Source name */
  source?: string;
}

export interface NewsData {
  articles: NewsSignal[];
  /** Most recent event type */
  top_signal?: NewsSignal;
  /** How many days ago was most recent news */
  recency_days?: number;
  /** Error message if call failed */
  error?: string;
}

// ─── SCORED SIGNAL ─────────────────────────────────────────────────────────────

export type SignalType =
  | "hiring_sales"     // SDR/AE/RevOps hire = outbound push signal
  | "hiring_engineers" // Engineering hire = product building / scaling phase
  | "hiring_marketing" // Marketing hire = growth push, budget available
  | "recent_funding"   // Recent fundraise = budget, expansion
  | "recent_launch"    // New product/feature = need for awareness messaging
  | "leadership_change"// New exec = re-evaluation window
  | "tech_mismatch"    // Using basic tools = upgrade opportunity
  | "crm_identified"   // We know their CRM = hyper-relevant hook
  | "tech_stack_gap"   // Missing key tool in category
  | "active_on_linkedin" // Posts recently = warm to engage
  | "company_growth"   // Growing headcount = scaling pain
  | "recent_news"      // General news coverage
  | "long_tenure"      // Company exists >3 years = stable, buying power
  | "website_evidence" // Strong evidence found on website

export interface ScoredSignal {
  type: SignalType;
  /** Points value (0–10) */
  score: number;
  /** Short human-readable description for use in prompt context */
  label: string;
  /** One-paragraph context string suitable for COSTAR injection */
  context_snippet: string;
  /** Source that produced this signal */
  source: "website" | "linkedin" | "jobs" | "tech" | "news";
}

// ─── FULL ENRICHMENT RESULT ───────────────────────────────────────────────────

export interface EnrichmentResult {
  /** Original domain that was enriched */
  domain: string;
  /** Per-source data (null if source wasn't called or failed) */
  linkedin: LinkedInCompanyData | null;
  jobs: JobPostingsData | null;
  tech: TechStackData | null;
  news: NewsData | null;
  /** All scored signals, sorted descending by score */
  all_signals: ScoredSignal[];
  /** Top 3 signals to inject into prompt */
  top_signals: ScoredSignal[];
  /** Final context string ready for COSTAR prompt injection */
  enriched_context: string;
  /** 0–100 enrichment confidence */
  enrichment_score: number;
  /** ISO timestamp */
  enriched_at: string;
  /** Which sources were successfully called */
  sources_used: ("website" | "linkedin" | "jobs" | "tech" | "news")[];
}

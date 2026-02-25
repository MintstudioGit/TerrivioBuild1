// ─── SIGNAL SCORER ────────────────────────────────────────────────────────────
// Converts raw enrichment data into ranked, scored signals.
// RULE: never dump all data — pick top 3, max 2-3 sharp insights.
//
// Score breakdown (max 10 per signal):
//   hiring_sales      +8   (strongest buying signal for outbound tools)
//   recent_funding    +8   (budget exists, growth mode)
//   hiring_marketing  +7   (growth phase, CAC pressure)
//   leadership_change +7   (re-evaluation window)
//   recent_launch     +6   (awareness push needed)
//   tech_mismatch     +6   (upgrade hook)
//   crm_identified    +5   (specific reference hook)
//   hiring_engineers  +5   (product scaling = infra pain)
//   company_growth    +4   (growing pains angle)
//   active_linkedin   +4   (warm to outreach)
//   tech_gap          +4   (missing tool hook)
//   recent_news       +3   (conversation opener)
//   website_evidence  +3   (has concrete story on site)
//   long_tenure       +2   (baseline credibility)

import type {
  LinkedInCompanyData,
  JobPostingsData,
  TechStackData,
  NewsData,
  ScoredSignal,
} from "./enrichment-types";
import type { StructuredContext } from "./website-scraper";

// ─── SCORING RULES ────────────────────────────────────────────────────────────

function scoreLinkedIn(li: LinkedInCompanyData): ScoredSignal[] {
  const signals: ScoredSignal[] = [];

  if (li.recent_post && (li.recent_post_age_days ?? 999) <= 30) {
    signals.push({
      type: "active_on_linkedin",
      score: 4,
      label: "Active on LinkedIn",
      context_snippet: `Posted on LinkedIn recently: "${li.recent_post.slice(0, 120)}"`,
      source: "linkedin",
    });
  }

  if (li.headcount_raw && li.headcount_raw >= 20) {
    signals.push({
      type: "company_growth",
      score: 4,
      label: `~${li.headcount_raw} employees`,
      context_snippet: `${li.headcount_raw}-person team${li.hq ? ` based in ${li.hq}` : ""}, ${li.industry ?? "B2B"}.`,
      source: "linkedin",
    });
  }

  if (li.founded && new Date().getFullYear() - li.founded >= 3) {
    signals.push({
      type: "long_tenure",
      score: 2,
      label: `Founded ${li.founded}`,
      context_snippet: `Founded in ${li.founded} — ${new Date().getFullYear() - li.founded} years in market.`,
      source: "linkedin",
    });
  }

  return signals;
}

function scoreJobs(jobs: JobPostingsData): ScoredSignal[] {
  const signals: ScoredSignal[] = [];

  if (jobs.is_hiring_sales && jobs.jobs.some(j => j.department === "sales")) {
    const count = jobs.jobs.filter(j => j.department === "sales").reduce((a, b) => a + b.count, 0);
    signals.push({
      type: "hiring_sales",
      score: 8,
      label: `Hiring ${count} sales role${count > 1 ? "s" : ""}`,
      context_snippet: `Actively hiring ${count} sales role${count > 1 ? "s" : ""} — pipeline push is a current priority.`,
      source: "jobs",
    });
  }

  if (jobs.is_hiring_marketing) {
    const count = jobs.jobs.filter(j => j.department === "marketing").reduce((a, b) => a + b.count, 0);
    signals.push({
      type: "hiring_marketing",
      score: 7,
      label: `Hiring ${count} marketing role${count > 1 ? "s" : ""}`,
      context_snippet: `Growing marketing team (+${count} roles open) — growth phase, CAC likely a pressure point.`,
      source: "jobs",
    });
  }

  if (jobs.is_hiring_engineers) {
    const count = jobs.jobs.filter(j => j.department === "engineering").reduce((a, b) => a + b.count, 0);
    signals.push({
      type: "hiring_engineers",
      score: 5,
      label: `Hiring ${count} engineering role${count > 1 ? "s" : ""}`,
      context_snippet: `Scaling engineering team — product under active development.`,
      source: "jobs",
    });
  }

  if (jobs.tech_mentioned && jobs.tech_mentioned.length > 0) {
    signals.push({
      type: "tech_stack_gap",
      score: 4,
      label: `Uses ${jobs.tech_mentioned.slice(0, 3).join(", ")}`,
      context_snippet: `Tech stack from job postings includes: ${jobs.tech_mentioned.slice(0, 5).join(", ")}.`,
      source: "jobs",
    });
  }

  return signals;
}

function scoreTech(tech: TechStackData): ScoredSignal[] {
  const signals: ScoredSignal[] = [];

  if (tech.crm) {
    signals.push({
      type: "crm_identified",
      score: 5,
      label: `CRM: ${tech.crm}`,
      context_snippet: `Using ${tech.crm} as their CRM — can reference this specifically.`,
      source: "tech",
    });
  }

  if (tech.maturity === "basic" || (!tech.crm && !tech.sales_engagement)) {
    signals.push({
      type: "tech_mismatch",
      score: 6,
      label: "Basic tech stack",
      context_snippet: "Minimal sales/marketing tooling detected — likely running manually or on low-cost tools.",
      source: "tech",
    });
  }

  if (tech.sales_engagement) {
    signals.push({
      type: "crm_identified",
      score: 4,
      label: `Sales engagement: ${tech.sales_engagement}`,
      context_snippet: `Active sales engagement tool: ${tech.sales_engagement}.`,
      source: "tech",
    });
  }

  return signals;
}

function scoreNews(news: NewsData): ScoredSignal[] {
  const signals: ScoredSignal[] = [];

  if (!news.top_signal) return signals;

  if (news.top_signal.type === "funding") {
    signals.push({
      type: "recent_funding",
      score: 8,
      label: "Recent fundraise",
      context_snippet: `Recent funding event: "${news.top_signal.title.slice(0, 120)}" — budget and growth mandate.`,
      source: "news",
    });
  } else if (news.top_signal.type === "launch") {
    signals.push({
      type: "recent_launch",
      score: 6,
      label: "Recent product launch",
      context_snippet: `Recent launch: "${news.top_signal.title.slice(0, 120)}" — awareness push likely a priority.`,
      source: "news",
    });
  } else if (news.top_signal.type === "leadership") {
    signals.push({
      type: "leadership_change",
      score: 7,
      label: "Leadership change",
      context_snippet: `Leadership news: "${news.top_signal.title.slice(0, 120)}" — re-evaluation window open.`,
      source: "news",
    });
  } else if ((news.recency_days ?? 999) <= 60) {
    signals.push({
      type: "recent_news",
      score: 3,
      label: "In the news recently",
      context_snippet: `"${news.top_signal.title.slice(0, 120)}"`,
      source: "news",
    });
  }

  return signals;
}

function scoreWebsite(ctx: StructuredContext): ScoredSignal[] {
  const signals: ScoredSignal[] = [];

  if (ctx.evidence && ctx.evidence !== "unknown" && ctx.evidence.length > 50) {
    signals.push({
      type: "website_evidence",
      score: 3,
      label: "Website quote",
      context_snippet: `"${ctx.evidence.slice(0, 160)}"`,
      source: "website",
    });
  }

  return signals;
}

// ─── MAIN SCORER ──────────────────────────────────────────────────────────────

export interface SignalScorerInput {
  website?: StructuredContext;
  linkedin?: LinkedInCompanyData;
  jobs?: JobPostingsData;
  tech?: TechStackData;
  news?: NewsData;
}

/**
 * Score all available enrichment data → return sorted signal list.
 * Top 3 are the ones to inject into the prompt.
 */
export function scoreAllSignals(input: SignalScorerInput): ScoredSignal[] {
  const all: ScoredSignal[] = [];

  if (input.website) all.push(...scoreWebsite(input.website));
  if (input.linkedin && !input.linkedin.error) all.push(...scoreLinkedIn(input.linkedin));
  if (input.jobs && !input.jobs.error) all.push(...scoreJobs(input.jobs));
  if (input.tech && !input.tech.error) all.push(...scoreTech(input.tech));
  if (input.news && !input.news.error) all.push(...scoreNews(input.news));

  // Deduplicate by type (keep highest score)
  const seen = new Map<string, ScoredSignal>();
  for (const sig of all) {
    const existing = seen.get(sig.type);
    if (!existing || sig.score > existing.score) seen.set(sig.type, sig);
  }

  return [...seen.values()].sort((a, b) => b.score - a.score);
}

/**
 * Build a compact context string from top signals (≤ 3).
 * This is what gets injected into `generateCOSTARPrompt({ context: ... })`.
 */
export function buildEnrichedContext(
  signals: ScoredSignal[],
  website?: StructuredContext
): string {
  const top = signals.slice(0, 3);
  if (top.length === 0 && !website) return "";

  const parts: string[] = [];

  if (website && website.what_they_do !== "unknown") {
    parts.push(`Company: ${website.what_they_do}`);
    if (website.who_they_serve !== "unknown") {
      parts.push(`ICP: ${website.who_they_serve}`);
    }
  }

  for (const sig of top) {
    parts.push(`${sig.label}: ${sig.context_snippet}`);
  }

  return parts.join("\n");
}

/**
 * Compute an enrichment score (0-100) as proxy for context depth.
 */
export function computeEnrichmentScore(signals: ScoredSignal[]): number {
  const top3Total = signals.slice(0, 3).reduce((s, sig) => s + sig.score, 0);
  return Math.min(100, Math.round((top3Total / 24) * 100));
}

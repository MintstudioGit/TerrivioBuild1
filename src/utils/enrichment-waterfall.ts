// ─── ENRICHMENT WATERFALL ─────────────────────────────────────────────────────
// MVP orchestrator. Priority order:
//   1. Website scrape (Jina, already built — client side)
//   2. LinkedIn company (Proxycurl → via Supabase edge fn)
//   3. Tech stack (BuiltWith → via Supabase edge fn)
//   4. Job postings (Apify → via Supabase edge fn)       [optional]
//   5. News (NewsAPI → via Supabase edge fn)             [optional]
//
// External API calls always go through the Supabase edge function
// `/enrich-company` to keep API keys server-side only.

import { projectId } from "./supabase/info";
import { scrapeWebsiteContext } from "./website-scraper";
import {
  scoreAllSignals,
  buildEnrichedContext,
  computeEnrichmentScore,
} from "./signal-scorer";
import type {
  LinkedInCompanyData,
  JobPostingsData,
  TechStackData,
  NewsData,
  EnrichmentResult,
} from "./enrichment-types";

// ─── EDGE FUNCTION CALL ───────────────────────────────────────────────────────

interface EnrichEdgePayload {
  domain: string;
  sources: ("linkedin" | "tech" | "jobs" | "news")[];
}

interface EnrichEdgeResponse {
  linkedin?: LinkedInCompanyData;
  tech?: TechStackData;
  jobs?: JobPostingsData;
  news?: NewsData;
  error?: string;
}

async function callEnrichEdgeFunction(
  payload: EnrichEdgePayload,
  accessToken: string
): Promise<EnrichEdgeResponse> {
  const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/enrich-company`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Enrichment edge function failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

// ─── DOMAIN EXTRACTOR ────────────────────────────────────────────────────────

export function extractDomain(url: string): string {
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
  }
}

// ─── WATERFALL ────────────────────────────────────────────────────────────────

export interface WaterfallOptions {
  /** Domain or URL to enrich */
  domain: string;
  /** Which external sources to call — omit to skip paid APIs */
  sources?: ("linkedin" | "tech" | "jobs" | "news")[];
  /** Required for external API calls. Skip external if not provided. */
  accessToken?: string;
  /** Abort if enrichment takes longer than this (ms). Default 15000. */
  timeoutMs?: number;
}

/**
 * Run the enrichment waterfall for a single company.
 *
 * Returns an `EnrichmentResult` with:
 *   - per-source raw data
 *   - all scored signals (sorted)
 *   - top 3 signals
 *   - `enriched_context` ready to inject into `generateCOSTARPrompt`
 */
export async function runEnrichmentWaterfall(
  opts: WaterfallOptions
): Promise<EnrichmentResult> {
  const {
    domain,
    sources = ["linkedin", "tech"],
    accessToken,
    timeoutMs = 15_000,
  } = opts;

  const cleanDomain = extractDomain(domain);
  const sourcesUsed: EnrichmentResult["sources_used"] = [];

  // ── Tier 1a: Website scrape (always free, client-side) ──────────────────
  let websiteCtx = null;
  try {
    const scrape = await Promise.race([
      scrapeWebsiteContext(cleanDomain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("website scrape timeout")), timeoutMs / 2)
      ),
    ]);
    websiteCtx = scrape.structured;
    sourcesUsed.push("website");
  } catch (err) {
    console.warn("[waterfall] website scrape failed:", err);
  }

  // ── Tier 1b: External enrichment (via edge function) ────────────────────
  let linkedin: LinkedInCompanyData | null = null;
  let jobs: JobPostingsData | null = null;
  let tech: TechStackData | null = null;
  let news: NewsData | null = null;

  if (accessToken && sources.length > 0) {
    try {
      const edgeResult = await Promise.race([
        callEnrichEdgeFunction({ domain: cleanDomain, sources }, accessToken),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("enrichment timeout")), timeoutMs)
        ),
      ]);

      if (edgeResult.linkedin && !edgeResult.linkedin.error) {
        linkedin = edgeResult.linkedin;
        sourcesUsed.push("linkedin");
      }
      if (edgeResult.tech && !edgeResult.tech.error) {
        tech = edgeResult.tech;
        sourcesUsed.push("tech");
      }
      if (edgeResult.jobs && !edgeResult.jobs.error) {
        jobs = edgeResult.jobs;
        sourcesUsed.push("jobs");
      }
      if (edgeResult.news && !edgeResult.news.error) {
        news = edgeResult.news;
        sourcesUsed.push("news");
      }
    } catch (err) {
      console.warn("[waterfall] external enrichment failed:", err);
    }
  }

  // ── Signal scoring ──────────────────────────────────────────────────────
  const allSignals = scoreAllSignals({
    website: websiteCtx ?? undefined,
    linkedin: linkedin ?? undefined,
    jobs: jobs ?? undefined,
    tech: tech ?? undefined,
    news: news ?? undefined,
  });

  const topSignals = allSignals.slice(0, 3);
  const enrichedContext = buildEnrichedContext(topSignals, websiteCtx ?? undefined);
  const enrichmentScore = computeEnrichmentScore(allSignals);

  return {
    domain: cleanDomain,
    linkedin,
    jobs,
    tech,
    news,
    all_signals: allSignals,
    top_signals: topSignals,
    enriched_context: enrichedContext,
    enrichment_score: enrichmentScore,
    enriched_at: new Date().toISOString(),
    sources_used: sourcesUsed,
  };
}

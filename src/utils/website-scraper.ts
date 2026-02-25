// ─── STRUCTURED CONTEXT ─────────────────────────────────────────────────────
// Context Engine V2 — evidence-based, specificity-scored.
// Every field is either a concrete extracted string or "unknown".
// NEVER use generic fallbacks — unknown is always better than wrong.

export interface StructuredContext {
  /** What the company actually does — pulled from their own language */
  what_they_do: string;
  /** Who they serve — role, segment, or industry */
  who_they_serve: string;
  /** The thing they do repeatedly to deliver value */
  key_activity: string;
  /** Biggest area that can go wrong in their business */
  high_risk_area: string;
  /** How they make money */
  how_they_make_money: string;
  /** What breaks if their core process fails */
  what_breaks_if_done_badly: string;
  /** The single best sentence found on the page — grounded evidence */
  evidence: string;
  /** 0–100 confidence score. Below 60 = not enough signal */
  confidence: number;
  /** true when confidence >= 60 */
  is_valid: boolean;
  // Legacy compat aliases
  quality_score?: number;
}

export type ScrapeResult = {
  summary: string;
  rawText: string;
  structured: StructuredContext;
};

const scrapeCache = new Map<string, ScrapeResult>();

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// ─── TEXT CLEANING ────────────────────────────────────────────────────────────

/** Strip Jina reader metadata and markdown junk before extraction */
function cleanRawText(raw: string): string {
  return raw
    .replace(/Title:.*?\n/gi, "")
    .replace(/URL Source:.*?\n/gi, "")
    .replace(/Markdown Content:/gi, "")
    .replace(/Published Time:.*?\n/gi, "")
    .replace(/\[.*?\]\(.*?\)/g, "")  // markdown links
    .replace(/#{1,6}\s/g, "")        // headings
    .replace(/[*_`>|]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripToSummary(text: string, maxLen = 1200): string {
  const cleaned = text.replace(/\s+/g, " ").replace(/[#>*`]/g, "").trim();
  return cleaned.length <= maxLen ? cleaned : cleaned.slice(0, maxLen).trim();
}

// ─── PRIORITY TEXT EXTRACTION ─────────────────────────────────────────────────
// Jina reader delivers a text/markdown document. We extract from it in priority
// order: H1 lines → meta-like lines → first dense paragraphs (>= 40 chars).
// This gives us a similar signal to H1 + meta + hero text from raw HTML.

function extractPriorityText(jinaText: string): {
  h1: string;
  meta: string;
  hero_paragraphs: string;
} {
  const lines = jinaText.split("\n").map(l => l.trim()).filter(Boolean);

  // H1: lines that start with a single #, or are short ALL-CAPS, or come first
  const h1Lines = lines
    .filter(l => /^#\s/.test(l) || /^[A-Z][^a-z]{10,60}$/.test(l))
    .map(l => l.replace(/^#+\s*/, "").trim())
    .slice(0, 3);

  // Meta-like: short lines that read like taglines (40-160 chars, no markdown noise)
  const metaLike = lines
    .filter(l => l.length >= 30 && l.length <= 180 && !/^(https?|www|©|cookie|privacy|terms)/i.test(l))
    .filter(l => /[a-z]/.test(l)) // has lowercase = readable sentence
    .slice(0, 5);

  // Hero paragraphs: first ~8 substantial lines
  const heroParagraphs = lines
    .filter(l => l.length >= 40 && !/^(https?|www|©|cookie|privacy|terms|nav|menu)/i.test(l))
    .slice(0, 8)
    .join(" ");

  return {
    h1: h1Lines.join(" "),
    meta: metaLike.join(" "),
    hero_paragraphs: heroParagraphs,
  };
}

// ─── EVIDENCE EXTRACTION ─────────────────────────────────────────────────────
// Find the single most informative sentence on the page.
// Ports the Python scoring logic from the design spec.

const EVIDENCE_KEYWORDS = [
  "help", "enable", "provide", "deliver",
  "platform", "software", "service",
  "we ", "our ", "solution",
];

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
}

function scoreEvidence(sentence: string): number {
  const len = sentence.length;
  if (len < 30 || len > 250) return 0;

  let score = 0;
  if (len >= 40 && len <= 200) score += 2;
  for (const kw of EVIDENCE_KEYWORDS) {
    if (sentence.toLowerCase().includes(kw)) score += 2;
  }
  if (/\d/.test(sentence)) score += 1;
  // Penalise nav/footer junk
  if (/cookie|privacy|terms|©|login|sign up|subscribe/i.test(sentence)) score -= 5;
  return score;
}

function findBestEvidence(text: string): string {
  const sentences = splitSentences(text);
  if (!sentences.length) return "unknown";

  let best = "";
  let bestScore = -Infinity;
  for (const s of sentences) {
    const sc = scoreEvidence(s);
    if (sc > bestScore) { bestScore = sc; best = s; }
  }
  return bestScore > 0 ? best.slice(0, 220) : "unknown";
}

// ─── FIELD EXTRACTION PATTERNS ───────────────────────────────────────────────
// Ordered by specificity. First match wins. No match → "unknown".

const WHAT_THEY_DO_PATTERNS: RegExp[] = [
  /[Ww]e (?:help|build|provide|offer|enable|power|connect|make|create|give) ([^.!?\n]{15,120})/,
  /(?:[Tt]he|[Aa]n?) (?:leading|premier|best|top|only|first|fastest) ([^.!?\n]{15,100})/,
  /(?:[Oo]ur (?:platform|solution|tool|software|service|product)) (?:helps?|enables?|powers?|gives?) ([^.!?\n]{15,100})/,
  /(?:[Pp]latform|[Ss]olution|[Tt]ool|[Ss]oftware|[Ss]ervice) (?:that|for|to) ([^.!?\n]{15,100})/,
];

const WHO_THEY_SERVE_PATTERNS: RegExp[] = [
  /(?:for|serving|built for|designed for|used by|trusted by|helps?)\s+((?:enterprise|startup|smb|b2b|b2c|agency|recruiter|founder|executive|cmo|ceo|vp|director|marketer|sales team|hr|finance team|developer|engineer)[^.,\n]{0,80})/i,
  /(?:our (?:customers?|clients?|users?)(?:\s+are)?)\s+([^.,\n]{15,100})/i,
  /(?:teams? at|companies? like|brands? like)\s+([^.,\n]{10,80})/i,
];

const KEY_ACTIVITY_PATTERNS: RegExp[] = [
  /[Ww]e (?:automate|manage|generate|build|place|recruit|source|publish|analyze|track|score|route|convert) ([^.!?\n]{10,100})/,
  /(?:automates?|manages?|generates?|builds?|places?|sources?|publishes?|analyzes?|tracks?|scores?|routes?|converts?) ([^.!?\n]{10,100})/i,
];

const HIGH_RISK_PATTERNS: [RegExp, string][] = [
  [/rely on manual|manual process|done by hand|spreadsheet/i, "manual processes that break under scale"],
  [/miss (?:a|the) (?:hire|candidate|deal|moment|window|timing)/i, "timing-sensitive decisions where missing the window is costly"],
  [/wrong hire|bad hire|mismatch|mis-hire/i, "bad hires that are expensive and slow to reverse"],
  [/churn|cancel|lose customer|customer leave/i, "customer churn from poor delivery or fit"],
  [/compliance|regulat|audit|legal risk|liability/i, "compliance failures and regulatory exposure"],
  [/data (?:breach|leak|loss)|security/i, "data security and breach risk"],
  [/slow (?:to|delivery|execution)|bottleneck|delay/i, "slow execution creating competitive disadvantage"],
  [/generic outreach|impersonal|template|mass email/i, "generic outreach that damages brand trust"],
  [/high cost|expensive|overhead|burn rate/i, "high cost structure limiting growth"],
  [/compet|lose (?:to|against)|market share/i, "competitive pressure from faster-moving rivals"],
];

const HOW_MONEY_PATTERNS: [RegExp, string][] = [
  [/subscription|monthly fee|annual plan|per seat|per user|saas/i, "subscription / SaaS model"],
  [/commission|placement fee|recruiter fee/i, "placement / success fees"],
  [/transact|per transaction|marketplace|take rate/i, "transaction fees or marketplace take-rate"],
  [/retainer|managed service|professional service/i, "retainer or professional services"],
  [/freemium|free tier.*paid|upgrade/i, "freemium with paid upgrades"],
  [/license|perpetual|one.time purchase/i, "licensing / one-time purchase"],
  [/consulting|project.based|statement of work/i, "project-based consulting"],
  [/agency|done.for.you|done for you/i, "done-for-you agency model"],
];

const BREAKS_BADLY_PATTERNS: [RegExp, string][] = [
  [/recruit|hire|talent|headhunt/i, "wrong leaders slow down the entire portfolio company"],
  [/outreach|cold email|prospect/i, "generic, mistimed outreach burns the lead list permanently"],
  [/automate|workflow|pipeline/i, "broken automation silently corrupts downstream data or output"],
  [/analytics|data|insight|report/i, "wrong analysis leads to decisions built on bad data"],
  [/payment|billing|invoice|finance/i, "payment failures block revenue and trigger churn"],
  [/compliance|audit|regulat/i, "compliance failures create legal exposure and fines"],
  [/content|publish|brand|seo/i, "poor content erodes brand trust and SEO authority"],
  [/security|breach|protect/i, "a breach damages customer trust in ways that take years to recover"],
];

// ─── SPECIFICITY PENALTY ──────────────────────────────────────────────────────
// Pure generic B2B buzzwords without a niche context = penalised.

const GENERIC_BUZZWORDS = [
  /\bb2b\b/i,
  /\befficiency\b/i,
  /\bstreamline\b/i,
  /\binnovative\b/i,
  /\bseamless\b/i,
  /\bbest.in.class\b/i,
  /\bworld.class\b/i,
  /\bsolutions?\b/i,
  /\bleverage\b/i,
  /\bsynergy\b/i,
];

const NICHE_INDICATORS = [
  /\bpe\b|\bprivate equity\b|\bportfolio\b/i,
  /\bsaas\b/i,
  /\becommerce\b|\be-commerce\b/i,
  /\bfintech\b|\binsurtech\b|\bproptech\b/i,
  /\brecruit|headhunt|talent/i,
  /\bhealthcare|medtech|clinical/i,
  /\blegal|compliance|regtech/i,
  /\bsecurity|infosec|cyber/i,
  /\bmarketing agency|demand gen|growth/i,
];

function specificityPenalty(text: string): number {
  const lower = text.toLowerCase();
  const genericCount = GENERIC_BUZZWORDS.filter(p => p.test(lower)).length;
  const nicheCount = NICHE_INDICATORS.filter(p => p.test(lower)).length;
  // If heavily generic and no niche indicators, penalise heavily
  if (genericCount >= 3 && nicheCount === 0) return -20;
  if (genericCount >= 2 && nicheCount === 0) return -10;
  return 0;
}

// ─── CONFIDENCE SCORING ───────────────────────────────────────────────────────
// Port of the Python calculate_confidence + specificity check.
// Max 100. Gate: is_valid = confidence >= 60.

function calculateConfidence(fields: {
  what_they_do: string;
  who_they_serve: string;
  key_activity: string;
  high_risk_area: string;
  how_they_make_money: string;
  what_breaks_if_done_badly: string;
  evidence: string;
}, fullText: string): number {
  let score = 0;
  const resolved = [
    fields.what_they_do,
    fields.who_they_serve,
    fields.key_activity,
    fields.high_risk_area,
    fields.how_they_make_money,
    fields.what_breaks_if_done_badly,
  ].filter(v => v !== "unknown" && v.length > 10);

  score += resolved.length * 12; // max 72 for 6 fields

  if (fields.evidence !== "unknown" && fields.evidence.length > 20) score += 20;
  if (fields.key_activity !== "unknown") score += 5; // bonus for specificity indicator

  score += specificityPenalty(fullText);

  return Math.min(Math.max(Math.round(score), 0), 100);
}

// ─── CONTEXT COMPRESSOR ───────────────────────────────────────────────────────

/**
 * Context Engine V2 — evidence-based structured extraction.
 *
 * - Pulls priority text (H1, meta, hero) before running patterns
 * - Extracts the best evidence sentence from the page
 * - Scores specificity (penalises generic B2B buzzwords)
 * - confidence >= 60 → is_valid → safe to generate
 */
export function compressToStructuredContext(rawText: string): StructuredContext {
  const clean = cleanRawText(rawText);

  // Hard reject: nothing useful
  if (clean.length < 200) {
    return {
      what_they_do: "unknown", who_they_serve: "unknown", key_activity: "unknown",
      high_risk_area: "unknown", how_they_make_money: "unknown",
      what_breaks_if_done_badly: "unknown", evidence: "unknown",
      confidence: 0, is_valid: false, quality_score: 0,
    };
  }

  // Build a priority-ordered working text: H1 + meta + hero first, then full clean
  const priority = extractPriorityText(rawText); // runs on raw before strip
  const workingText = [priority.h1, priority.meta, priority.hero_paragraphs, clean]
    .filter(Boolean).join(" ").slice(0, 4000);
  const lower = workingText.toLowerCase();

  // Evidence — best sentence from priority text
  const evidence = findBestEvidence(workingText);

  // what_they_do — try exact patterns on full working text, fallback to trimmed evidence
  let what_they_do = "unknown";
  for (const p of WHAT_THEY_DO_PATTERNS) {
    const m = workingText.match(p);
    const candidate = m?.[1]?.trim();
    if (candidate && candidate.length > 15 && !/title|url|source|markdown/i.test(candidate)) {
      what_they_do = candidate.slice(0, 130);
      break;
    }
  }
  // If still unknown and we have a good evidence sentence, use a trimmed version
  if (what_they_do === "unknown" && evidence !== "unknown" && evidence.length > 25) {
    what_they_do = evidence.slice(0, 130);
  }

  // who_they_serve
  let who_they_serve = "unknown";
  for (const p of WHO_THEY_SERVE_PATTERNS) {
    const m = workingText.match(p);
    const candidate = m?.[1]?.trim();
    if (candidate && candidate.length > 8) { who_they_serve = candidate.slice(0, 100); break; }
  }

  // key_activity
  let key_activity = "unknown";
  for (const p of KEY_ACTIVITY_PATTERNS) {
    const m = workingText.match(p);
    const candidate = m?.[1]?.trim();
    if (candidate && candidate.length > 8) { key_activity = candidate.slice(0, 100); break; }
  }

  // high_risk_area
  let high_risk_area = "unknown";
  for (const [pattern, label] of HIGH_RISK_PATTERNS) {
    if (pattern.test(lower)) { high_risk_area = label; break; }
  }

  // how_they_make_money
  let how_they_make_money = "unknown";
  for (const [pattern, label] of HOW_MONEY_PATTERNS) {
    if (pattern.test(lower)) { how_they_make_money = label; break; }
  }

  // what_breaks_if_done_badly
  let what_breaks_if_done_badly = "unknown";
  for (const [pattern, label] of BREAKS_BADLY_PATTERNS) {
    if (pattern.test(lower)) { what_breaks_if_done_badly = label; break; }
  }

  const confidence = calculateConfidence(
    { what_they_do, who_they_serve, key_activity, high_risk_area, how_they_make_money, what_breaks_if_done_badly, evidence },
    workingText
  );
  const is_valid = confidence >= 60;

  return {
    what_they_do, who_they_serve, key_activity,
    high_risk_area, how_they_make_money, what_breaks_if_done_badly,
    evidence, confidence, is_valid,
    quality_score: Math.round((confidence / 100) * 100) / 100, // legacy compat
  };
}

export async function scrapeWebsiteContext(url: string): Promise<ScrapeResult> {
  const normalized = normalizeUrl(url);
  if (!normalized) throw new Error("Invalid URL");
  if (scrapeCache.has(normalized)) return scrapeCache.get(normalized)!;

  const fetchUrl = `https://r.jina.ai/${normalized}`;
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`Failed to fetch context (${res.status})`);

  const raw = await res.text();
  const summary = stripToSummary(raw);
  const structured = compressToStructuredContext(raw);
  const result = { summary, rawText: raw, structured };
  scrapeCache.set(normalized, result);
  return result;
}

export function clearScrapeCache() {
  scrapeCache.clear();
}

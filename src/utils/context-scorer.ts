// ─── CONTEXT SCORER ──────────────────────────────────────────────────────────
// Multi-dimensional deterministic quality scoring for StructuredContext.
// No LLM required. Returns 0–100 with issues list and letter grade.
//
// Dimensions:
//   completeness  0–30  (are required fields filled?)
//   specificity   0–25  (are values specific vs generic?)
//   evidence      0–15  (does an evidence sentence exist?)
//   consistency   0–15  (do fields contradict each other?)
//   actionability 0–15  (can we write a real email from this?)
//
// Scoring inspired by Clay's context quality system.

import type { StructuredContext } from "./website-scraper";

export interface ContextScoreResult {
  total: number;
  completeness: number;
  specificity: number;
  evidence: number;
  consistency: number;
  actionability: number;
  issues: string[];
  grade: "strong" | "ok" | "weak" | "garbage";
}

// ─── SIGNAL LISTS ─────────────────────────────────────────────────────────────

/** Vague terms that describe nothing specific — each hit penalises specificity */
const VAGUE_TERMS = [
  "technology company",
  "innovative solutions",
  "digital transformation",
  "electronics",
  "b2b companies",
  "businesses",
  "organizations",
  "enterprises",
  "solutions provider",
  "service provider",
  "technology solutions",
  "software solutions",
  "innovative platform",
];

/**
 * Garbage signals: scraped the wrong page, or caught a holding/loading page.
 * Two or more hits = almost certainly garbage.
 */
const GARBAGE_SIGNALS = [
  "lorem ipsum",
  "coming soon",
  "loading...",
  "electronic lover",
  "eletronic",      // common typo in low-quality pages
  "shop for",
  "buy now",
  "sign in",
  "403 forbidden",
  "404 not found",
  "access denied",
];

// ─── DIMENSION FUNCTIONS ──────────────────────────────────────────────────────

function scoreCompleteness(ctx: StructuredContext): { score: number; issues: string[] } {
  const issues: string[] = [];
  const fields: { key: keyof StructuredContext; label: string; points: number }[] = [
    { key: "what_they_do",            label: "Business description", points: 7.5 },
    { key: "who_they_serve",          label: "Customer definition",  points: 7.5 },
    { key: "how_they_make_money",     label: "Business model",       points: 7.5 },
    { key: "key_activity",            label: "Core activity",        points: 7.5 },
  ];

  let score = 0;
  for (const { key, label, points } of fields) {
    const val = ctx[key] as string | undefined;
    if (val && val !== "unknown" && val.length > 8) {
      score += points;
    } else {
      issues.push(`Missing: ${label}`);
    }
  }
  return { score, issues }; // max 30
}

function scoreSpecificity(ctx: StructuredContext): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 25;

  const allText = [
    ctx.what_they_do,
    ctx.who_they_serve,
    ctx.key_activity,
    ctx.how_they_make_money,
    ctx.evidence || "",
  ].join(" ").toLowerCase();

  // Garbage detection — if 2+ garbage signals hit, this is a broken scrape
  const garbageHits = GARBAGE_SIGNALS.filter(g => allText.includes(g));
  if (garbageHits.length >= 2) {
    issues.push("Garbage signals detected — scrape may have returned the wrong page");
    return { score: 0, issues };
  }
  if (garbageHits.length === 1) {
    score -= 12;
    issues.push(`Garbage signal: "${garbageHits[0]}" — context may be unreliable`);
  }

  // Vague term penalties
  let vaguePenalty = 0;
  for (const term of VAGUE_TERMS) {
    if (allText.includes(term)) vaguePenalty += 5;
  }
  score -= Math.min(vaguePenalty, 20);

  if (allText.replace(/\s/g, "").length < 80) {
    score -= 10;
    issues.push("Context too sparse — not enough text extracted");
  }

  if (score < 12) {
    issues.push("Too generic — description could apply to any company");
  }

  return { score: Math.max(score, 0), issues };
}

function scoreEvidence(ctx: StructuredContext): { score: number; issues: string[] } {
  if (!ctx.evidence || ctx.evidence === "unknown") {
    return {
      score: 0,
      issues: ["No evidence sentence — outputs cannot be grounded in their language"],
    };
  }
  if (ctx.evidence.length > 50) return { score: 15, issues: [] };
  return { score: 8, issues: ["Evidence sentence too short — try pasting a fuller sentence"] };
}

function scoreConsistency(ctx: StructuredContext): { score: number; issues: string[] } {
  const text = JSON.stringify(ctx).toLowerCase();

  // B2B + consumer contradiction (common with Apple misclassification)
  if (text.includes("b2b") && /\bconsumer\b/.test(text)) {
    return {
      score: 5,
      issues: ["Consistency: B2B and consumer signals conflict — verify the company type"],
    };
  }

  // Electronics + SaaS — likely a wrong page scrape
  if (/\belectronic/.test(text) && /\bsubscription\b|\bsaas\b/.test(text)) {
    return {
      score: 8,
      issues: ["Consistency: electronics + SaaS signals conflict — scrape may have hit the wrong page"],
    };
  }

  return { score: 15, issues: [] };
}

function scoreActionability(ctx: StructuredContext): { score: number; issues: string[] } {
  const has = (v: string | undefined) => !!(v && v !== "unknown" && v.length > 5);

  if (has(ctx.what_they_do) && has(ctx.who_they_serve) && has(ctx.key_activity)) {
    return { score: 15, issues: [] };
  }
  if (has(ctx.what_they_do) && has(ctx.who_they_serve)) {
    return { score: 10, issues: [] };
  }
  if (has(ctx.what_they_do)) {
    return {
      score: 6,
      issues: ["Low actionability — need customer + activity fields to write a targeted email"],
    };
  }
  return {
    score: 2,
    issues: ["Cannot generate a specific email from this context — please edit the fields"],
  };
}

// ─── MAIN SCORER ──────────────────────────────────────────────────────────────

export function scoreContext(ctx: StructuredContext): ContextScoreResult {
  const c    = scoreCompleteness(ctx);
  const s    = scoreSpecificity(ctx);
  const e    = scoreEvidence(ctx);
  const cons = scoreConsistency(ctx);
  const a    = scoreActionability(ctx);

  const raw = c.score + s.score + e.score + cons.score + a.score;
  const total = Math.min(100, Math.max(0, Math.round(raw)));

  const allIssues = [
    ...c.issues, ...s.issues, ...e.issues, ...cons.issues, ...a.issues,
  ];

  let grade: ContextScoreResult["grade"];
  if (total >= 80) grade = "strong";
  else if (total >= 65) grade = "ok";
  else if (total >= 40) grade = "weak";
  else grade = "garbage";

  return {
    total,
    completeness: Math.round(c.score),
    specificity: Math.round(s.score),
    evidence: Math.round(e.score),
    consistency: Math.round(cons.score),
    actionability: Math.round(a.score),
    issues: allIssues,
    grade,
  };
}

/** Colour class for a score 0–100 */
export function scoreColour(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 65) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

/** Badge background class for a score 0–100 */
export function scoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 65) return "bg-blue-100 text-blue-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

// ─── OUTPUT SCORER ────────────────────────────────────────────────────────────
// Grades generated prompt/email output on 7 dimensions (max 100 pts).
// Deterministic — no LLM required.
//
// Dimensions:
//   specificity      0–25   (concrete or vague?)
//   personalization  0–20   (does it reference the context?)
//   angle            0–20   (does it create tension / a question?)
//   structure        0–15   (multi-line or wall of text?)
//   cta              0–10   (soft reply CTA or hard ask?)
//   hook             0–10   (opening question + strong CTA together)
//   genericPenalty  −0–20   (penalty for buzzwords)

import type { StructuredContext } from "./website-scraper";

export interface OutputScoreResult {
  total: number;
  specificity: number;
  personalization: number;
  angle: number;
  structure: number;
  cta: number;
  hook: number;
  genericPenalty: number;
  issues: string[];
  grade: "strong" | "good" | "weak" | "bad";
}

const GENERIC_PHRASES = [
  "improve efficiency",
  "drive growth",
  "streamline workflows",
  "leverage",
  "innovative solution",
  "synergy",
  "best-in-class",
  "world-class",
  "cutting-edge",
  "next-level",
  "game-changing",
  "digital transformation",
  "scalable solution",
  "empower",
  "holistic",
  "robust solution",
];

// ─── DIMENSIONS ───────────────────────────────────────────────────────────────

function scoreSpecificity(output: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 25;

  if (output.length < 50) {
    score -= 15;
    issues.push("Output too short");
  }

  let genericCount = 0;
  for (const phrase of GENERIC_PHRASES) {
    if (output.toLowerCase().includes(phrase)) {
      genericCount++;
      score -= 4;
    }
  }
  if (genericCount >= 3) {
    issues.push("Too many generic phrases — sounds like every other outreach");
  }

  return { score: Math.max(score, 0), issues };
}

function scorePersonalization(
  output: string,
  ctx?: StructuredContext
): { score: number; issues: string[] } {
  const issues: string[] = [];
  if (!ctx) return { score: 5, issues: ["No context available — personalization not possible"] };

  let score = 0;
  const lower = output.toLowerCase();

  // Collect meaningful words from context (>5 chars, alphanumeric)
  const contextWords = [
    ctx.what_they_do,
    ctx.who_they_serve,
    ctx.key_activity,
    ctx.evidence || "",
  ]
    .filter(v => v && v !== "unknown")
    .flatMap(v => v.split(/\s+/).filter(w => w.length > 5 && /^[a-z]/i.test(w)));

  const matches = contextWords.filter(w => lower.includes(w.toLowerCase()));
  score += Math.min(matches.length * 3, 15);

  // Extra points if the evidence sentence is echoed
  if (ctx.evidence && ctx.evidence !== "unknown") {
    const evidenceWords = ctx.evidence
      .split(/\s+/)
      .filter(w => w.length > 5 && /^[a-z]/i.test(w));
    const evidenceMatches = evidenceWords.filter(w => lower.includes(w.toLowerCase()));
    if (evidenceMatches.length >= 2) {
      score += 5;
    } else {
      issues.push("Weak grounding — output doesn't reference the evidence sentence");
    }
  }

  if (score < 8) {
    issues.push("Low personalization — output could be sent to any company");
  }

  return { score: Math.min(score, 20), issues };
}

function scoreAngle(output: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  const firstLine = output.split(/\n+/)[0] || "";

  // Strong: question in opening line
  if (firstLine.includes("?") && firstLine.length > 15) return { score: 20, issues: [] };

  // Good: question anywhere
  if (output.includes("?")) return { score: 15, issues: [] };

  // Decent: insight framing words
  const insightWords = ["because", "which means", "that's why", "the reason", "when ", "while "];
  if (insightWords.some(w => output.toLowerCase().includes(w)) && output.length >= 100) {
    return { score: 13, issues: [] };
  }

  issues.push("Weak angle — opener doesn't create a question or reframe a belief");
  return { score: 5, issues };
}

function scoreStructure(output: string): { score: number; issues: string[] } {
  const lines = output.split("\n").filter(l => l.trim().length > 0);
  if (lines.length >= 3) return { score: 15, issues: [] };
  if (lines.length === 2) return { score: 10, issues: [] };
  return {
    score: 4,
    issues: ["Single block — needs a break between hook, insight, and CTA"],
  };
}

function scoreCTA(output: string): { score: number; issues: string[] } {
  const lower = output.toLowerCase();
  const strongCTA = [
    "worth",
    "curious",
    "makes sense",
    "relevant",
    "open to",
    "thoughts?",
    "sound familiar",
    "ring true",
    "resonates",
  ];
  if (strongCTA.some(w => lower.includes(w))) return { score: 10, issues: [] };
  if (lower.includes("?")) return { score: 7, issues: [] };
  return {
    score: 2,
    issues: ["No soft CTA — ends without inviting a reply"],
  };
}

// +10 bonus: rewards outputs that open with a pointed question AND land a strong CTA.
// Both criteria are exactly what the prompt engine now enforces, so well-formed
// missed_opportunity emails will always earn the full 10 pts.
function scoreHook(output: string): { score: number; issues: string[] } {
  const lower = output.toLowerCase();
  const firstLine = output.split(/\n+/)[0] || "";
  const strongCTA = [
    "worth", "curious", "makes sense", "relevant", "open to",
    "thoughts?", "sound familiar", "ring true", "resonates",
  ];
  let score = 0;
  const issues: string[] = [];
  if (firstLine.includes("?") && firstLine.length > 15) {
    score += 5;
  } else {
    issues.push("Hook: opening line should be a question");
  }
  if (strongCTA.some(w => lower.includes(w))) {
    score += 5;
  } else {
    issues.push("Hook: CTA should use a soft-reply word (worth/curious/resonates…)");
  }
  return { score, issues };
}

function penaltyGeneric(output: string): number {
  const bad = ["solution", "platform", "optimize", "scalable", "leverage", "synergy", "robust"];
  let penalty = 0;
  for (const word of bad) {
    if (output.toLowerCase().includes(word)) penalty += 4;
  }
  return Math.min(penalty, 20);
}

// ─── MAIN SCORER ──────────────────────────────────────────────────────────────

export function scoreOutput(output: string, ctx?: StructuredContext): OutputScoreResult {
  const spec    = scoreSpecificity(output);
  const pers    = scorePersonalization(output, ctx);
  const angle   = scoreAngle(output);
  const struct  = scoreStructure(output);
  const cta     = scoreCTA(output);
  const hook    = scoreHook(output);
  const penalty = penaltyGeneric(output);

  const total = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        spec.score + pers.score + angle.score + struct.score +
        cta.score + hook.score - penalty
      )
    )
  );

  const issues: string[] = [
    ...spec.issues, ...pers.issues, ...angle.issues,
    ...struct.issues, ...cta.issues, ...hook.issues,
  ];

  let grade: OutputScoreResult["grade"];
  if (total >= 90) grade = "strong";
  else if (total >= 75) grade = "good";
  else if (total >= 50) grade = "weak";
  else grade = "bad";

  return {
    total,
    specificity: Math.round(spec.score),
    personalization: Math.round(pers.score),
    angle: Math.round(angle.score),
    structure: Math.round(struct.score),
    cta: Math.round(cta.score),
    hook: Math.round(hook.score),
    genericPenalty: penalty,
    issues,
    grade,
  };
}

/** Emoji indicator for an output score */
export function outputScoreEmoji(total: number): string {
  if (total >= 90) return "🔥";
  if (total >= 75) return "👍";
  if (total >= 50) return "⚠️";
  return "❌";
}

/** Tailwind badge class for output score */
export function outputScoreBadgeClass(total: number): string {
  if (total >= 90) return "bg-green-100 text-green-700";
  if (total >= 75) return "bg-blue-100 text-blue-700";
  if (total >= 50) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

// ─── CONTEXT IMPROVER ─────────────────────────────────────────────────────────
// Sends weak context + raw scraped text to the LLM (via Supabase /preview-prompt)
// and returns an improved StructuredContext with recalculated confidence.

import { projectId } from "./supabase/info";
import type { StructuredContext } from "./website-scraper";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildRepairPrompt(ctx: StructuredContext, rawText: string): string {
  const current = JSON.stringify(
    {
      what_they_do: ctx.what_they_do,
      who_they_serve: ctx.who_they_serve,
      how_they_make_money: ctx.how_they_make_money,
      key_activity: ctx.key_activity,
      high_risk_area: ctx.high_risk_area,
      what_breaks_if_done_badly: ctx.what_breaks_if_done_badly,
      evidence: ctx.evidence,
    },
    null,
    2
  );

  // Feed up to 2000 chars of raw page text to avoid token limits
  const snippet = rawText.slice(0, 2000).replace(/\n{3,}/g, "\n\n");

  return `You are a B2B sales intelligence analyst. Improve the structured context below using the raw page text.

CURRENT CONTEXT (may be weak or generic):
${current}

RAW PAGE TEXT (use this to find specific, concrete details):
---
${snippet}
---

Rules:
1. Replace "unknown" values or generic descriptions with specific details from the raw text.
2. Keep fields that are already good (specific, concrete) exactly as-is.
3. "evidence" must be a real sentence (verbatim or close paraphrase) from the page that proves what the company does — >50 chars, no marketing fluff.
4. "how_they_make_money" should name the pricing model or customer type, e.g. "SaaS subscription for mid-market HR teams".
5. "key_activity" must be the single most important action users take, e.g. "run automated payroll for hourly workers".
6. "what_breaks_if_done_badly" should name a real operational/financial consequence.
7. All values must be <120 characters and factual — no invented statistics.

Return ONLY a raw JSON object (no markdown, no explanation) with these exact keys:
what_they_do, who_they_serve, how_they_make_money, key_activity, high_risk_area, what_breaks_if_done_badly, evidence`;
}

function recalcConfidence(ctx: StructuredContext): number {
  const fields: (keyof StructuredContext)[] = [
    "what_they_do",
    "who_they_serve",
    "how_they_make_money",
    "key_activity",
    "high_risk_area",
    "what_breaks_if_done_badly",
  ];
  const resolved = fields.filter(f => {
    const v = ctx[f] as string | undefined;
    return v && v !== "unknown" && v.trim().length > 5;
  }).length;

  const evBonus = ctx.evidence && ctx.evidence !== "unknown" && ctx.evidence.length > 50 ? 20 : 0;
  const actBonus = ctx.key_activity && ctx.key_activity !== "unknown" ? 5 : 0;

  return Math.min(100, Math.round(resolved * 12 + evBonus + actBonus));
}

function mergeImproved(
  original: StructuredContext,
  improved: Record<string, string>
): StructuredContext {
  const merged: StructuredContext = { ...original };

  const fields = [
    "what_they_do",
    "who_they_serve",
    "how_they_make_money",
    "key_activity",
    "high_risk_area",
    "what_breaks_if_done_badly",
    "evidence",
  ] as const;

  for (const key of fields) {
    const val = improved[key];
    if (val && typeof val === "string" && val.trim().length > 5 && val !== "unknown") {
      (merged as unknown as Record<string, unknown>)[key] = val.trim();
    }
  }

  const newConfidence = recalcConfidence(merged);
  merged.confidence = newConfidence;
  merged.is_valid = newConfidence >= 60;
  merged.quality_score = newConfidence; // legacy compat

  return merged;
}

// ─── MAIN FUNCTION ─────────────────────────────────────────────────────────────

export async function improveContext(
  ctx: StructuredContext,
  rawText: string,
  accessToken: string
): Promise<StructuredContext> {
  const prompt = buildRepairPrompt(ctx, rawText);

  const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/preview-prompt`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, model: "gpt-4o-mini" }),
  });

  if (!response.ok) {
    throw new Error(`Context improver request failed: ${response.status}`);
  }

  const data: { output: string; score?: number; conversion_likelihood?: number } =
    await response.json();

  // Extract JSON from the output — handle markdown code fences if present
  const raw = data.output || "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("LLM did not return a JSON object in its output");
  }

  let improved: Record<string, string>;
  try {
    improved = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Failed to parse JSON from LLM output");
  }

  return mergeImproved(ctx, improved);
}

import { generateEnginePrompt, cleanText, CategoryType, SignalType } from "./prompt-engine";

export interface GenerationResult {
    prompt: string;
    health: number;
    breakdown: any;
    attempts: number;
    status: "ok" | "failed";
}

const RETRY_CONSTRAINTS = [
  "",
  "Use a strict structure with clear sections, explicit constraints, and a measurable output format.",
  "Avoid generic language. Include specific numbers, limits, and role-specific context. Make the prompt reusable.",
  "Use a fixed template. Include: task, constraints (3+), output format, and success criteria.",
  "This prompt must be reusable, specific, and impossible to answer generically."
];

export interface HealthResult {
    health: number;
    score: number;
    issues: string[];
}

export function calculatePromptHealth(prompt: string, history: string[] = []): HealthResult {
  let score = 65; // Start decent
  const issues: string[] = [];
  
  // 1. Length Bonus
  if (prompt.length > 200) score += 10;
  if (prompt.length > 300) score += 5;

  // 2. Structure/Keywords Bonus
  const strongKeywords = ["Ensure", "Implement", "Context", "Constraint", "Output", "Format", "Structure"];
  let keywordCount = 0;
  strongKeywords.forEach(word => {
    if (prompt.includes(word)) keywordCount++;
  });
  score += Math.min(20, keywordCount * 5);

  // 3. Negative Penalties
  const weakWords = ["etc", "stuff", "things", "various", "maybe", "please", "kindly"];
  weakWords.forEach(word => {
    if (prompt.toLowerCase().includes(word)) {
      score -= 5;
      issues.push(`Weak word: ${word}`);
    }
  });

  // 4. History Penalty (prevent loops)
  if (history.some(h => h === prompt)) {
      score -= 50;
      issues.push("Duplicate generation");
  }

  // 5. Complexity Check (sentence count)
  const sentenceCount = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  if (sentenceCount < 3) {
      score -= 10;
      issues.push("Too short/simple");
  }

  return {
    health: Math.min(100, Math.max(0, score)),
    score,
    issues
  };
}

export function generateWithQualityGate(
    params: {
        useCase: string;
        outcome: string;
        role: string;
        industry: string;
        category: CategoryType | string;
        signal: SignalType | string;
    },
    history: string[] = [],
    minHealth = 80,
    maxRetries = 4
): GenerationResult {

    let attempt = 0;
    let lastResult: { prompt: string; healthResult: HealthResult } | null = null;

    while (attempt <= maxRetries) {
        const escalation = RETRY_CONSTRAINTS[attempt] || "";
        
        const prompt = cleanText(
            generateEnginePrompt(
                params.useCase,
                params.outcome + (escalation ? `. ${escalation}` : ""),
                params.role,
                params.industry,
                params.category,
                params.signal
            )
        );

        const healthResult = calculatePromptHealth(prompt, history);
        lastResult = { prompt, healthResult };

        if (healthResult.health >= minHealth) {
            return {
                prompt,
                health: healthResult.health,
                breakdown: healthResult,
                attempts: attempt + 1,
                status: "ok"
            };
        }

        attempt++;
    }

    // 🚨 HARD FAIL — DO NOT PUBLISH
    return {
        prompt: lastResult?.prompt || "",
        health: lastResult?.healthResult?.health || 0,
        breakdown: lastResult?.healthResult || {},
        attempts: maxRetries + 1,
        status: "failed"
    };
}

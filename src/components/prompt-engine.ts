// Prompt Generator Engine - Ported from Python
// This file contains the core generator logic.

export type SignalType = "Quality" | "Speed" | "Accuracy" | "Detail" | "Creative" | "Conversion";
export type CategoryType = "Development" | "Marketing" | "Sales" | "Content" | "Design" | "General";

// Angle types — these change LOGIC not just tone
export type AngleType =
    | "missed_opportunity"
    | "hidden_risk"
    | "timing_trigger"
    | "inefficiency"
    | "pattern_interrupt"
    | "social_proof";

// Backward compat alias
export type VariantType = AngleType;

export type FrameworkType = "RISEN" | "RTF" | "APE" | "RACE";

const PHRASE_REPLACEMENTS: Record<string, string> = {
    "ensure high-quality standards": "use clear structure, precise language, and specific instructions",
    "professional output": "a result that can be used immediately without further clarification",
    "industry-standard": "commonly used patterns that are familiar to practitioners",
    "best practices": "techniques that are widely adopted and easy to understand",
    "maintain consistency": "keep terminology, tone, and structure consistent throughout",
    "clear structure and engaging content": "a clear headline, logically ordered sections, and a strong closing",
    "professional-grade output": "output that can be used immediately without edits",
    "exceed quality standards": "meet specific requirements with clear, actionable results",
    "meet user expectations": "provide exactly what is needed without additional explanation",
    "maintainable": "easy to understand and modify",
    "production-ready": "ready to use without additional work",
    "well-documented": "includes clear explanations and examples",
    "comprehensive coverage": "includes all necessary elements and details",
    "attention to detail": "includes specific requirements and precise specifications"
};

const FORBIDDEN_VERBS: Record<string, string> = {
    "deliver": "provide",
    "maintain": "keep",
    "enable": "include",
    "facilitate": "support",
    "leverage": "use",
    "adhere to": "follow",
    "align with": "match",
    "maintain consistency": "keep terminology and structure consistent",
    "deliver value": "provide useful results"
};

const CATEGORY_TERMS: Record<string, { constraints: string[], practices: string[], qualities: string[] }> = {
    "Development": {
        "constraints": ["strong type safety", "modular architecture", "efficient memory usage", "immutable state patterns", "strict linting rules"],
        "practices": ["DRY principles", "functional programming patterns", "clean code standards", "solid principles", "component composition"],
        "qualities": ["comprehensive error handling", "high test coverage", "performance optimization", "inline documentation", "semantic naming"]
    },
    "Marketing": {
        "constraints": ["brand voice consistency", "clear call-to-action", "scannable formatting", "persuasive psychological triggers", "mobile-first readability"],
        "practices": ["AIDA framework", "benefit-driven copy", "storytelling elements", "social proof integration", "emotional resonance"],
        "qualities": ["engaging headline", "strong hook", "clear value proposition", "objection handling", "urgent closing"]
    },
    "Sales": {
        "constraints": ["respectful tone", "clear next step", "concise value prop", "personalized opener", "low-friction ask"],
        "practices": ["consultative selling", "challenger sale methodology", "SPIN selling techniques", "pain-point focusing", "relationship building"],
        "qualities": ["credibility markers", "relevant case studies", "risk reversal", "mutual action plan", "empathetic understanding"]
    },
    "Content": {
        "constraints": ["SEO optimization", "readability score > 60", "keyword integration", "engaging subheaders", "short paragraphs"],
        "practices": ["inverted pyramid style", "skimmable structure", "data-backed claims", "storytelling arcs", "conversational tone"],
        "qualities": ["compelling intro", "shareable insights", "authoritative voice", "clear takeaways", "internal linking opportunities"]
    },
    "Design": {
        "constraints": ["accessibility (WCAG AA)", "consistent spacing", "responsive layout", "visual hierarchy", "color contrast compliance"],
        "practices": ["atomic design principles", "grid system alignment", "gestalt principles", "mobile-first approach", "user-centered design"],
        "qualities": ["intuitive navigation", "feedback states", "micro-interactions", "scalable typography", "unified design language"]
    },
    "General": {
        "constraints": ["clear structure", "precise language", "specific instructions", "logical flow", "unambiguous terms"],
        "practices": ["widely adopted techniques", "industry standards", "familiar patterns", "proven methodologies", "efficient workflows"],
        "qualities": ["actionable results", "comprehensive details", "error-free output", "easy-to-read format", "high utility"]
    }
};

const VERBS = ["build", "create", "design", "write", "develop", "generate", "construct", "formulate", "draft", "architect"];

// Helpers
function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getThreeRandom<T>(arr: T[]): [T, T, T] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1], shuffled[2]];
}

export const deriveCategory = (useCase: string): CategoryType => {
    if (!useCase) return "General";
    
    const lower = useCase.toLowerCase();
    
    const salesPatterns = ["email", "sales", "outreach", "prospecting", "demo", "proposal", "closing",
                      "lead", "qualification", "discovery", "negotiation", "objection", "account",
                      "territory", "contact", "warm introduction", "call prep", "presentation",
                      "follow-up", "pricing", "contract", "deal", "revenue"];
    if (salesPatterns.some(p => lower.includes(p))) return "Sales";
    
    const marketingPatterns = ["ad", "marketing", "campaign", "funnel", "roi", "conversion", "retargeting",
                         "creative", "landing page", "cta", "launch", "webinar", "event", "promotion",
                         "growth", "channel", "attribution", "engagement", "brand"];
    if (marketingPatterns.some(p => lower.includes(p))) return "Marketing";
    
    const contentPatterns = ["blog", "post", "article", "caption", "seo", "white paper", "ebook",
                       "case study", "pillar", "listicle", "tutorial", "report", "research",
                       "calendar", "cluster", "guide", "meta description", "internal linking"];
    if (contentPatterns.some(p => lower.includes(p))) return "Content";
    
    const devPatterns = ["code", "react", "function", "api", "script", "component", "database", "docker",
                   "vue", "authentication", "endpoint", "schema", "query", "pipeline", "deployment",
                   "state management", "routing", "integration", "error handling", "websocket",
                   "cron", "ci/cd", "config", "monitoring", "form handling"];
    if (devPatterns.some(p => lower.includes(p))) return "Development";
    
    const designPatterns = ["design", "ui", "ux", "logo", "wireframe", "prototype", "user flow",
                      "layout", "navigation", "animation", "style guide", "icon", "illustration",
                      "empty state", "error state", "loading state", "micro-interaction", "system",
                      "research", "usability", "testing"];
    if (designPatterns.some(p => lower.includes(p))) return "Design";
    
    return "General";
};

export const cleanText = (text: string): string => {
    let cleaned = text;

    for (const [oldPhrase, newPhrase] of Object.entries(PHRASE_REPLACEMENTS)) {
        const pattern = new RegExp(`\\b${oldPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        cleaned = cleaned.replace(pattern, newPhrase);
    }

    for (const [forbidden, allowed] of Object.entries(FORBIDDEN_VERBS)) {
        const pattern = new RegExp(`\\b${forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        cleaned = cleaned.replace(pattern, allowed);
    }

    const metaCleanup = [
        "that can be used immediately without further clarification",
        "that are widely adopted and easy to understand",
        "commonly used patterns that are familiar to practitioners",
        "without further clarification"
    ];
    for (const phrase of metaCleanup) {
        const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        cleaned = cleaned.replace(pattern, "");
    }

    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\s+([,\.])/g, '$1');
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.replace(/\.\s*\./g, '.');
    cleaned = cleaned.replace(/ and and /g, ' and ');
    return cleaned.trim();
};

export const generateEnginePrompt = (
    useCase: string, 
    outcome: string, 
    role: string, 
    industry: string, 
    category: CategoryType | string, 
    signal: SignalType | string
): string => {
    // Note: The Python code has `category` and `signal` as typed args, but here we allow string and cast
    const safeCategory = (Object.keys(CATEGORY_TERMS).includes(category) ? category : "General") as CategoryType;
    let safeSignal: SignalType = "Quality";
    const sLower = signal.toLowerCase();
    
    if (sLower.includes("speed")) safeSignal = "Speed";
    else if (sLower.includes("accuracy")) safeSignal = "Accuracy";
    else if (sLower.includes("creative")) safeSignal = "Creative";
    else if (sLower.includes("conversion")) safeSignal = "Conversion";
    else if (sLower.includes("detail")) safeSignal = "Detail";

    let artifact = `a ${useCase.toLowerCase()}`;
    if (safeCategory === "Content") {
        if (useCase.toLowerCase().includes("blog")) artifact = "a blog post outline";
        else if (useCase.toLowerCase().includes("email")) artifact = "an email newsletter";
    } else if (safeCategory === "Sales" && useCase.toLowerCase().includes("email")) {
        artifact = "a cold outreach email";
    }

    const terms = CATEGORY_TERMS[safeCategory] || CATEGORY_TERMS["General"];
    const [constraint1, constraint2, constraint3] = getThreeRandom(terms.constraints);
    const [practice1, practice2, practice3] = getThreeRandom(terms.practices);
    const [quality1, quality2] = getThreeRandom(terms.qualities).slice(0, 2);

    let behavior1 = "provide exactly what is needed";
    let behavior2 = "include useful results";
    let behavior3 = "keep terminology consistent";

    if (safeSignal === "Quality") {
        behavior1 = "use clear structure and precise language";
        behavior2 = "provide results that can be used immediately";
        behavior3 = "keep terminology and structure consistent";
    } else if (safeSignal === "Speed") {
        behavior1 = "minimize time to completion";
        behavior2 = "support rapid iteration";
        behavior3 = "reduce unnecessary steps";
    } else if (safeSignal === "Accuracy") {
        behavior1 = "ensure precision and correctness";
        behavior2 = "minimize errors";
        behavior3 = "validate all inputs";
    } else if (safeSignal === "Conversion") {
        behavior1 = "focus on persuasive elements";
        behavior2 = "drive user action";
        behavior3 = "maximize engagement metrics";
    } else if (safeSignal === "Creative") {
        behavior1 = "think innovatively";
        behavior2 = "generate unique approaches";
        behavior3 = "stand out from standard solutions";
    } else if (safeSignal === "Detail") {
        behavior1 = "include all necessary details";
        behavior2 = "cover all aspects thoroughly";
        behavior3 = "provide clear examples and explanations";
    }

    const verb = getRandom(VERBS);
    const capitalizedVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
    
    const roleContext = role ? `Acting as a ${role} in the ${industry} industry, ` : "";
    
    const primaryGoal = outcome ? outcome.toLowerCase() : "achieve specific results";
    const environment = `${industry} context`;
    const errorHandling = safeCategory === "Development" ? "graceful error handling" : "proper review and refinement";

    const variations = [
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. Ensure ${constraint1}, implement ${constraint2}, and include ${constraint3}. Structure it to ${behavior1}, ${behavior2}, and ${behavior3}, following ${practice1}, ${practice2}, and ${practice3}. Include ${quality1} and ${quality2}, handle edge cases with ${errorHandling}, and make it work within the ${environment}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. Use ${constraint1}, implement ${constraint2}, and ensure ${constraint3}. Build it to ${behavior1} and ${behavior2}, following ${practice1}, ${practice2}. Include ${quality1}, support ${quality2}, and handle errors through ${errorHandling}. Make sure all outputs work with ${environment} and can be used immediately.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. Implement ${constraint1}, ensure ${constraint2}, and include ${constraint3}. Design it to ${behavior1}, ${behavior2}, and ${behavior3}, applying ${practice1}, ${practice2}, and ${practice3}. Provide ${quality1} and ${quality2}, with proper ${errorHandling} and support for ${environment}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. The implementation must enforce ${constraint1}, include ${constraint2}, and ensure ${constraint3}. Design the system to ${behavior1}, ${behavior2}, and ${behavior3}, incorporating ${practice1}, ${practice2}, and ${practice3}. Ensure ${quality1} and ${quality2} are included.`,
        `${roleContext}${capitalizedVerb} ${artifact} following ${practice1}, ${practice2}, and ${practice3} to ${primaryGoal}. Apply ${constraint1}, ${constraint2}, and ${constraint3}. The system should ${behavior1}, ${behavior2}, and ${behavior3}. Include ${quality1} and ${quality2}, handle errors with ${errorHandling}, and ensure compatibility with ${environment}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal} with ${quality1} and ${quality2}. Implement ${constraint1}, ${constraint2}, and ${constraint3}. The architecture should ${behavior1}, ${behavior2}, and ${behavior3}, following ${practice1}, ${practice2}, and ${practice3}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${behavior1}, ${behavior2}, and ${behavior3} to ${primaryGoal}. Implement with ${constraint1}, ${constraint2}, and ${constraint3}. Follow ${practice1}, ${practice2}, and ${practice3}. Include ${quality1} and ${quality2}, provide ${errorHandling}, and ensure compatibility with ${environment}.`,
        `${roleContext}${capitalizedVerb} ${artifact} to ${primaryGoal}. The implementation requires ${constraint1}, ${constraint2}, and ${constraint3}. Design it to ${behavior1}, ${behavior2}, and ${behavior3}, applying ${practice1}, ${practice2}, and ${practice3}. Include ${quality1} and ${quality2}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. Ensure ${constraint1}, implement ${constraint2}, and include ${constraint3}. Build it to ${behavior1}, ${behavior2}, and ${behavior3}, using ${practice1}, ${practice2}, and ${practice3}. Provide ${quality1} and ${quality2}, handle errors with ${errorHandling}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}, ensuring ${constraint1}, ${constraint2}, and ${constraint3}. The implementation should ${behavior1}, ${behavior2}, and ${behavior3}, using ${practice1}, ${practice2}, and ${practice3}. Include ${quality1} and ${quality2}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. Implement ${constraint1}, ${constraint2}, and ${constraint3}. The system should ${behavior1} and ${behavior2}, following ${practice1}, ${practice2}, and ${practice3}. Include ${quality1}, handle errors with ${errorHandling}, and support ${environment}.`,
        `${roleContext}${capitalizedVerb} ${artifact} that ${primaryGoal}. Enforce ${constraint1}, implement ${constraint2}, and ensure ${constraint3}. Design it to ${behavior1}, ${behavior2}, and ${behavior3}, following ${practice1}, ${practice2}, and ${practice3}. Include ${quality1} and ${quality2}, with ${errorHandling} and support for ${environment}.`
    ];

    const rawPrompt = getRandom(variations);
    return cleanText(rawPrompt);
};

export interface VariationResult {
    type: string;
    title: string;
    content: string;
    isLocked: boolean;
}

// Angle templates — 6 real strategic angles that change output LOGIC
export const ANGLE_TEMPLATES = [
    {
        approach: "Missed Opportunity",
        angle: "missed_opportunity" as AngleType,
        type: "Angle",
        desc: "What they're NOT doing but should be"
    },
    {
        approach: "Hidden Risk",
        angle: "hidden_risk" as AngleType,
        type: "Angle",
        desc: "A risk they likely underestimate"
    },
    {
        approach: "Timing Trigger",
        angle: "timing_trigger" as AngleType,
        type: "Angle",
        desc: "Tied to hiring, funding, or growth signals"
    },
    {
        approach: "Inefficiency",
        angle: "inefficiency" as AngleType,
        type: "Angle",
        desc: "Expose waste or manual processes"
    },
    {
        approach: "Pattern Interrupt",
        angle: "pattern_interrupt" as AngleType,
        type: "Angle",
        desc: "Break the expected cold outreach pattern"
    },
    {
        approach: "Social Proof",
        angle: "social_proof" as AngleType,
        type: "Angle",
        desc: "Reference a similar company outcome"
    },
];

// Backward compat alias — GeneratorPage & PackBuilderView import VARIANT_TEMPLATES
export const VARIANT_TEMPLATES = ANGLE_TEMPLATES;

interface AngleDefinition {
    label: string;
    salesInstruction: string;
    generalInstruction: string;
    structure: [string, string, string, string];
    constraint: string;
}

const ANGLE_DEFINITIONS: Record<AngleType, AngleDefinition> = {
    missed_opportunity: {
        label: "Missed Opportunity",
        salesInstruction: `Step 1 — Read the CONTEXT 'Evidence' field. That is the verbatim sentence from their website. It tells you exactly what they claim to do and for whom.
Step 2 — From that sentence, extract: (a) the core outcome they promise, and (b) the customer segment they serve.
Step 3 — Identify ONE specific tactic, channel, or capability that high-performers in this segment use to drive that same outcome — but this company is likely NOT doing it, based on what is absent from the Evidence.
Step 4 — Write the email:
  LINE 1: Open with a pointed question that names the specific gap — must end with "?". Use a word or phrase directly from the Evidence. Format: "Is [specific gap in their segment] why [their stated outcome] is harder than it needs to be?"
  LINE 2: One sentence on what this gap is likely costing them right now. Be concrete: pipeline, positioning, deal speed, or retention — pick one. Never say "efficiency" or "ROI".
  LINE 3: One sentence on what closing this gap would unlock. Must be traceable to their stated outcome (from Evidence).
  LINE 4: CTA — one sentence using one of these exact words: "worth", "curious", "makes sense", "open to", "thoughts?", "sound familiar", "resonates". Example: "Curious if this is on your radar for this quarter?" or "Worth a quick look at whether [gap] is holding back [their outcome]?"
If Evidence is missing → use 'Core activity' + 'Customers' to infer the gap.
If both are missing → output exactly: [CONTEXT NEEDED — please complete the context fields before generating].`,
        generalInstruction: "Identify the single most important tactic or capability missing from the current approach and frame it as a specific, recoverable gap with a named cost and a clear unlock.",
        structure: [
            "LINE 1: Open with a pointed question naming the gap — must end with '?' — use a word directly from Evidence",
            "LINE 2: One sentence — what this gap is costing them right now (pick one: pipeline, positioning, deal speed, or retention)",
            "LINE 3: One sentence — what closing this gap unlocks, tied to their stated outcome",
            "LINE 4: CTA — must use one of: worth / curious / makes sense / open to / thoughts? / sound familiar / resonates",
        ],
        constraint: "Every line must be traceable to the Evidence or Context fields. If any line could apply to any company in any industry → rewrite that line with explicit specificity before outputting."
    },
    hidden_risk: {
        label: "Hidden Risk",
        salesInstruction: "Read the CONTEXT 'Evidence' field. That sentence reveals how this company positions itself. Use it to infer what they are implicitly assuming will work perfectly — that is your hidden risk. Then cross-reference with 'High-risk area' if present. Your email must name the risk in terms of their own language (use a word or phrase from the Evidence). Example: if Evidence says 'We deliver leaders with EQ to multiply capital', the risk is 'a wrong leadership hire delays portfolio growth' — not generic churn. Never state a risk that is not traceable to the Evidence or Context fields.",
        generalInstruction: "Identify the highest-impact risk in the current workflow or approach that is easy to overlook but expensive when it hits.",
        structure: [
            "Name the specific risk without catastrophizing it",
            "Explain why it's easy to miss and when it typically surfaces",
            "Position your solution as the early-warning or prevention layer",
            "Soft CTA — offer a quick check or insight, not a demo"
        ],
        constraint: "If the risk sounds generic ('security', 'compliance', 'churn') → add the specific trigger condition that makes it real for this prospect."
    },
    timing_trigger: {
        label: "Timing Trigger",
        salesInstruction: "Read the CONTEXT 'Evidence' field. That sentence positions what this company is actively delivering right now. Use it to identify what inflection event in their business makes this moment different from 6 months ago. Anchor to one specific trigger type: hiring surge, fund deployment, product launch, expansion to a new segment — must be consistent with 'Core activity' and 'Revenue model'. Quote or rephrase one word from Evidence in your opening line to signal you actually read their site. Do not fabricate events you cannot trace to context.",
        generalInstruction: "Connect the recommendation to a time-sensitive event or inflection point that creates urgency without manufactured pressure.",
        structure: [
            "Reference the specific trigger event naturally (not 'I saw your LinkedIn')",
            "Explain why this moment is different from 3 months ago",
            "Connect your solution to the need that trigger created",
            "CTA tied to the window — 'catching you at the right time'"
        ],
        constraint: "If there is no real trigger named → do not invent one. Use a different angle."
    },
    inefficiency: {
        label: "Inefficiency",
        salesInstruction: "Read the CONTEXT 'Evidence' and 'Core activity' fields. The Evidence tells you what they claim to do; Core activity tells you how. Identify the most likely manual step, repeated task, or coordination overhead in that activity. Name it by its actual process name — not 'workflows' or 'efficiency'. Use 'What breaks badly' if present to sharpen the failure mode. Your opening line must describe the friction in terms their team would immediately recognise. If Evidence contains a specific verb ('placing', 'sourcing', 'generating'), front that verb in your description.",
        generalInstruction: "Pinpoint the exact step in the current workflow that is creating the most friction, rework, or cost — and show what removing it would unlock.",
        structure: [
            "Name the specific inefficiency (the manual step, the workaround, the duplicated effort)",
            "Quantify or estimate the drag it creates",
            "Show the direct fix — not just 'we automate this' but how specifically",
            "CTA: ask if this matches what they're dealing with"
        ],
        constraint: "If the inefficiency is vague ('streamline workflows') → rewrite with a specific process and measurable waste."
    },
    pattern_interrupt: {
        label: "Pattern Interrupt",
        salesInstruction: "Read the CONTEXT 'Evidence' field. That is how they describe themselves to the world. Now write the opposite frame — the sharpest, most counter-intuitive observation that reinterprets that sentence in a way they have never heard. Open with it. No greeting, no 'I noticed', no pitch. Use one word or phrase directly from the Evidence to signal specificity. Example: if Evidence says 'We help founders hire fast', your opener could be 'Hiring fast is usually where growth slows.' — a complete reframe. If Evidence is unknown, use 'High-risk area' as the surprise reveal instead.",
        generalInstruction: "Break the standard structural pattern for this type of content. Deliver the most important point first, remove all setup, and end where most outputs begin.",
        structure: [
            "Open with the sharpest possible observation — no preamble",
            "One sentence that reframes how they think about the problem",
            "One specific outcome they could achieve differently",
            "Ultra-light CTA: one word reply or a yes/no question"
        ],
        constraint: "If the output reads like any other cold email or content piece → it failed. Rewrite from a completely different entry point."
    },
    social_proof: {
        label: "Social Proof",
        salesInstruction: "Read the CONTEXT 'Evidence' field. That sentence reveals the outcome this company promises. Build your social proof around a peer company that had the same promise and found out whether it was delivering. Use 'Customers' and 'Revenue model' to make the peer scenario credible — same segment, same motion, same stakes. Your result metric must be traceable: if Evidence mentions 'capital multiplication', the proof metric is portfolio growth speed, not generic ROI. If Evidence is unknown, anchor to 'What breaks badly' — prove you fixed that exact thing.",
        generalInstruction: "Ground the recommendation in a reference case — similar context, observable outcome, transferable lesson. Make it feel like proof, not a claim.",
        structure: [
            "Name the analogous company or scenario (specific enough to be credible)",
            "State the exact problem they had and how they solved it",
            "Bridge to this prospect's situation — 'similar setup, similar gap'",
            "CTA: ask if they're dealing with the same dynamic"
        ],
        constraint: "If the social proof is generic ('our clients see 3x ROI') → rewrite with a specific company type, problem, and outcome."
    }
};

export const generateVariations = (basePrompt: string): VariationResult[] => {
    return ANGLE_TEMPLATES.map((tmpl, i) => {
        const def = ANGLE_DEFINITIONS[tmpl.angle];
        return {
            type: tmpl.type,
            title: tmpl.approach,
            content: [
                `ANGLE: ${tmpl.approach.toUpperCase()}`,
                "",
                def.generalInstruction,
                "",
                "STRUCTURE:",
                ...def.structure.map((s, n) => `${n + 1}. ${s}`),
                "",
                `CONSTRAINT: ${def.constraint}`,
                "",
                "BASE TASK:",
                basePrompt
            ].join("\n"),
            isLocked: i > 0
        };
    });
};

export function generateContextualPrompt(
    basePrompt: string,
    opts: { websiteContext?: string; yourOffer?: string; industry?: string }
): string {
    const contextLines = [
        opts.industry ? `Industry: ${opts.industry}` : null,
        opts.websiteContext ? `Website context: ${opts.websiteContext}` : null,
        opts.yourOffer ? `Offer: ${opts.yourOffer}` : null,
    ].filter(Boolean) as string[];

    if (!contextLines.length) return basePrompt;
    return [
        "Context:",
        ...contextLines.map((l) => `- ${l}`),
        "",
        basePrompt
    ].join("\n");
}

// Mirrors StructuredContext from website-scraper — no circular import
interface ContextShape {
  what_they_do: string;
  who_they_serve: string;
  key_activity?: string;             // what they do repeatedly
  high_risk_area: string;
  how_they_make_money: string;
  what_breaks_if_done_badly: string;
  evidence?: string;                 // best verbatim sentence from the page
  confidence?: number;               // 0–100
  is_valid?: boolean;
  quality_score?: number;            // legacy compat 0–1
  // legacy compat fields
  target_customer?: string;
  core_motion?: string;
  likely_problem?: string;
}

/**
 * Angle-Context binding: maps extracted company signals → best strategic angle.
 * Uses new StructuredContext field names. Falls back to legacy compat fields.
 */
export function inferBestAngle(ctx: ContextShape): AngleType {
  const risk     = ctx.high_risk_area           || ctx.likely_problem  || "";
  const breaks   = ctx.what_breaks_if_done_badly || "";
  const does     = ctx.what_they_do             || "";
  const money    = ctx.how_they_make_money      || ctx.core_motion     || "";
  const serves   = ctx.who_they_serve           || ctx.target_customer || "";
  const activity = ctx.key_activity             || "";
  const evidence = ctx.evidence                 || "";

  // Include evidence sentence in the blob for richer signal
  const blob = [does, risk, breaks, money, serves, activity, evidence].join(" ").toLowerCase();

  if (/manual|process|slow|spreadsheet|copy.paste|time.consuming|hand.made/.test(blob)) return "inefficiency";
  if (/timing|window|miss|hire|recruit|moment|time.sensitive/.test(blob))               return "timing_trigger";
  if (/risk|breach|compliance|fail|loss|liability|break/.test(blob))                    return "hidden_risk";
  if (/compet|behind|gap|market share|miss.*opportunity|not doing/.test(blob))          return "missed_opportunity";
  if (/proof|result|outcome|case|revenue|customer.*success/.test(blob))                 return "social_proof";
  return "pattern_interrupt";
}

export function generateCOSTARPrompt(opts: {
    useCase: string;
    outcome: string;
    role: string;
    industry: string;
    signal: SignalType | string;
    context?: string;
    structuredContext?: ContextShape & { sender_what?: string; your_offer?: string };
    variant?: VariantType;
}): string {
    const angleKey = (opts.variant as AngleType) || "missed_opportunity";
    const def = ANGLE_DEFINITIONS[angleKey] || ANGLE_DEFINITIONS["missed_opportunity"];
    const isSales = deriveCategory(opts.useCase) === "Sales";
    const role = opts.role || "B2B Outbound Strategist";
    const industry = opts.industry || "B2B";
    const useCase = opts.useCase || "cold email";
    const outcome = opts.outcome || "get a reply";

    // ── Context Block Builder ──────────────────────────────────────────────────
    // Structured context → clean labelled block. Skip "unknown" values.
    // Evidence line = the anchor every angle must ground itself in.
    let contextBlock = "";
    if (opts.structuredContext) {
        const sc = opts.structuredContext;
        const ok = (v?: string) => !!(v && v !== "unknown" && v.trim().length > 3);
        const lines: string[] = ["CONTEXT:"];
        if (ok(sc.what_they_do))               lines.push(`- Business: ${sc.what_they_do}`);
        if (ok(sc.who_they_serve ?? sc.target_customer)) lines.push(`- Customers: ${sc.who_they_serve ?? sc.target_customer}`);
        if (ok(sc.key_activity))               lines.push(`- Core activity: ${sc.key_activity}`);
        if (ok(sc.high_risk_area))             lines.push(`- High-risk area: ${sc.high_risk_area}`);
        if (ok(sc.how_they_make_money ?? sc.core_motion)) lines.push(`- Revenue model: ${sc.how_they_make_money ?? sc.core_motion}`);
        if (ok(sc.what_breaks_if_done_badly ?? sc.likely_problem)) lines.push(`- What breaks badly: ${sc.what_breaks_if_done_badly ?? sc.likely_problem}`);
        // Evidence: the verbatim sentence that grounds everything — this is critical
        if (ok(sc.evidence))                   lines.push(`- Evidence (from their site): "${sc.evidence}"`);
        if (ok(sc.sender_what))                lines.push(`- Sender company: ${sc.sender_what}`);
        if (ok(sc.your_offer))                 lines.push(`- Offer: ${sc.your_offer}`);
        if (lines.length > 1) contextBlock = "\n" + lines.join("\n");
    } else if (opts.context) {
        const clean = opts.context
            .replace(/Title:|URL Source|Source:|Markdown Content:/gi, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 300);
        if (clean.length > 20) contextBlock = `\nCONTEXT:\n- ${clean}`;
    }

    if (isSales) {
        // New master prompt — forces specificity, angle, and hard constraints
        return [
            `You are an elite B2B outbound strategist — does every sentence prove you know this company specifically?`,

            `Role: ${role}`,
            `Industry: ${industry}`,
            "",
            "TASK:",
            `Write a ${useCase} that gets a reply, not a meeting.`,
            "",
            "ANGLE:",
            `${def.label} — ${def.salesInstruction}`,
            "",
            "STRUCTURE:",
            ...def.structure.map((s, i) => `${i + 1}. ${s}`),
            "",
            "RULES:",
            "- Max 75 words total",
            "- No buzzwords — ban all vendor-speak (efficiency, ROI, innovative, game-changer, disruptive, transformative)",
            "- No filler openers (\"I came across your company\", \"Hope this finds you well\", \"I wanted to reach out\")",
            "- Every sentence must contain a specific, verifiable claim — no vague generalities",
            "- Use one word or phrase directly from the CONTEXT to prove you read it",
            "- CTA must use one of these exact words: worth / curious / makes sense / open to / thoughts? / sound familiar / resonates — never a meeting request or calendar link",
            "- Tone: peer writing to peer — no marketing voice, no flattery, no pressure",
            "- The gap named in line 1 must be specific to their segment — not reusable across industries",
            "",
            "SELF-CHECK (run before outputting):",
            `- ${def.constraint}`,
            "- Could this email be sent to 100 random companies unchanged? If yes → rewrite line 1",
            "- Does line 1 contain a sharp, specific insight? If no → rewrite line 1",
            "- Does the CTA ask for time or a meeting? If yes → replace with a yes/no question",
            "- Is any buzzword from the RULES list present? If yes → remove it",
            "- Is Evidence present in CONTEXT and NOT referenced in the email? If yes → rewrite",
            "- Rate your email 0-100 on specificity and relevance. If below 75 → rewrite and re-rate",
            "",
            "GOAL:",
            `The reader should think: "this person understands my business specifically — not just my industry."`,
            `The email scores 80+ out of 100 on: specificity, relevance to their context, insight quality, and CTA clarity.`,
            `The CTA must include one of: "worth", "curious", "makes sense", "open to", "thoughts?", "sound familiar", "ring true", "resonates" — this is not optional.`,
            `Output ONLY the email body. No subject line. No preamble. No meta-commentary.`,
            contextBlock
        ].filter(Boolean).join("\n");
    }

    // Non-sales: angle-driven structured prompt
    return [
        `You are a ${role} specializing in ${industry}.`,
        "",
        "TASK:",
        `Create ${useCase} to ${outcome}.`,
        "",
        "ANGLE:",
        `${def.label} — ${def.generalInstruction}`,
        "",
        "STRUCTURE:",
        ...def.structure.map((s, i) => `${i + 1}. ${s}`),
        "",
        "CONSTRAINTS:",
        "- Be specific — if a statement applies to any company, rewrite it",
        "- No generic filler phrases",
        "- Every claim must be actionable or verifiable",
        `- Optimization signal: ${opts.signal || "Quality"}`,
        "",
        "SELF-CHECK:",
        `- ${def.constraint}`,
        "- If output is generic → regenerate with more specificity",
        "",
        "DELIVER:",
        "A clean, ready-to-use output. No preamble. No meta-commentary.",
        contextBlock
    ].filter(Boolean).join("\n");
}

export function generateFrameworkPrompt(opts: {
    framework: FrameworkType;
    basePrompt: string;
    useCase: string;
    outcome: string;
    role: string;
    industry: string;
    signal: SignalType | string;
    context?: string;
    approach?: string;
}): string {
    const header = `Framework: ${opts.framework}${opts.approach ? ` (${opts.approach})` : ""}`;
    const roleLine = opts.role ? `Role: ${opts.role}` : "Role: Expert";
    const industryLine = opts.industry ? `Industry: ${opts.industry}` : "";
    const contextLine = opts.context ? `Context: ${opts.context}` : "";
    const outcomeLine = opts.outcome ? `Outcome: ${opts.outcome}` : "";
    const signalLine = opts.signal ? `Optimization: ${opts.signal}` : "";

    if (opts.framework === "RTF") {
        return [
            header,
            roleLine,
            industryLine,
            contextLine,
            "",
            "Task",
            opts.basePrompt,
            "",
            "Format",
            "Provide a structured, ready-to-use output with clear sections and constraints.",
            "",
            outcomeLine,
            signalLine
        ].filter(Boolean).join("\n");
    }

    if (opts.framework === "APE") {
        return [
            header,
            roleLine,
            industryLine,
            contextLine,
            "",
            "Action",
            opts.basePrompt,
            "",
            "Purpose",
            opts.outcome || "Achieve the desired outcome.",
            "",
            "Execution",
            "List steps, constraints, and formatting requirements explicitly.",
            "",
            signalLine
        ].filter(Boolean).join("\n");
    }

    if (opts.framework === "RACE") {
        return [
            header,
            roleLine,
            industryLine,
            "",
            "Action",
            opts.basePrompt,
            "",
            "Context",
            contextLine || "Use only the provided inputs.",
            "",
            "Expectations",
            "Clear structure, precise language, and measurable success criteria.",
            "",
            outcomeLine,
            signalLine
        ].filter(Boolean).join("\n");
    }

    // RISEN
    return [
        header,
        roleLine,
        industryLine,
        "",
        "Instructions",
        opts.basePrompt,
        "",
        "Steps",
        "1. Clarify constraints and assumptions.",
        "2. Produce the output with structure.",
        "3. Validate against success criteria.",
        "",
        "End Goal",
        opts.outcome || "Deliver a usable, high-signal output.",
        "",
        "Narrowing",
        contextLine || "Use only the provided context.",
        "",
        signalLine
    ].filter(Boolean).join("\n");
}

export interface WorkflowStep {
    name: string;
    role: string;
    outcome: string;
    signal: SignalType;
    useCase: string;
}

export interface WorkflowPack {
    id: string;
    name: string;
    category: CategoryType;
    industry: string;
    tone: string;
    primaryGoal: string;
    isRecommended: boolean;
    steps: WorkflowStep[];
}

export const WORKFLOW_PACKS: WorkflowPack[] = [
    // SALES WORKFLOWS
    {
        id: "saas-outbound",
        name: "SaaS Outbound Sequence (Sales)",
        category: "Sales",
        industry: "B2B SaaS",
        tone: "Professional & Persuasive",
        primaryGoal: "Book Demo",
        isRecommended: true,
        steps: [
            {name: "1. ICP Definition", role: "Sales Strategist", outcome: "define ideal customer profile", signal: "Accuracy", useCase: "saas outbound sequence"},
            {name: "2. Prospect Research", role: "Researcher", outcome: "analyze prospect pain points", signal: "Detail", useCase: "saas outbound sequence"},
            {name: "3. Cold Email (Touch 1)", role: "Copywriter", outcome: "generate curiosity hook", signal: "Conversion", useCase: "saas outbound sequence"},
            {name: "4. Value Add (Touch 2)", role: "Account Executive", outcome: "provide relevant case study", signal: "Quality", useCase: "saas outbound sequence"},
            {name: "5. Breakup Email", role: "Sales Rep", outcome: "trigger fear of loss", signal: "Creative", useCase: "saas outbound sequence"}
        ]
    },
    {
        id: "enterprise-sales-cycle",
        name: "Enterprise Sales Cycle",
        category: "Sales",
        industry: "Enterprise Software",
        tone: "Consultative & Strategic",
        primaryGoal: "Close Enterprise Deal",
        isRecommended: false,
        steps: [
            {name: "1. Discovery Call Prep", role: "Sales Engineer", outcome: "identify technical requirements", signal: "Detail", useCase: "enterprise sales discovery"},
            {name: "2. Executive Presentation", role: "Account Director", outcome: "present ROI framework", signal: "Quality", useCase: "enterprise sales presentation"},
            {name: "3. Technical Deep Dive", role: "Solutions Architect", outcome: "address integration concerns", signal: "Accuracy", useCase: "enterprise technical demo"},
            {name: "4. Proposal Draft", role: "Sales Manager", outcome: "create custom proposal", signal: "Quality", useCase: "enterprise sales proposal"},
            {name: "5. Negotiation Strategy", role: "VP Sales", outcome: "structure win-win terms", signal: "Creative", useCase: "enterprise contract negotiation"}
        ]
    },
    {
        id: "inbound-lead-nurture",
        name: "Inbound Lead Nurture Sequence",
        category: "Sales",
        industry: "B2B Tech",
        tone: "Helpful & Educational",
        primaryGoal: "Convert MQL to SQL",
        isRecommended: false,
        steps: [
            {name: "1. Lead Qualification", role: "SDR", outcome: "assess lead fit and intent", signal: "Accuracy", useCase: "inbound lead qualification"},
            {name: "2. Welcome Email", role: "Marketing Automation", outcome: "deliver value immediately", signal: "Conversion", useCase: "inbound welcome sequence"},
            {name: "3. Educational Content", role: "Content Marketer", outcome: "establish thought leadership", signal: "Quality", useCase: "inbound content nurture"},
            {name: "4. Product Demo Invite", role: "Sales Development", outcome: "schedule discovery call", signal: "Conversion", useCase: "inbound demo invitation"},
            {name: "5. Re-engagement Campaign", role: "Email Marketer", outcome: "reactivate cold leads", signal: "Creative", useCase: "inbound re-engagement"}
        ]
    },
    
    // DEVELOPMENT WORKFLOWS
    {
        id: "saas-product-build",
        name: "Build SaaS Product (Development)",
        category: "Development",
        industry: "SaaS Development",
        tone: "Technical & Precise",
        primaryGoal: "Launch MVP",
        isRecommended: true,
        steps: [
            {name: "1. Architecture Design", role: "Tech Lead", outcome: "design scalable system architecture", signal: "Quality", useCase: "saas product architecture"},
            {name: "2. Database Schema", role: "Backend Engineer", outcome: "create optimized data models", signal: "Accuracy", useCase: "saas database design"},
            {name: "3. API Development", role: "API Developer", outcome: "build RESTful endpoints", signal: "Quality", useCase: "saas api development"},
            {name: "4. Frontend Components", role: "Frontend Engineer", outcome: "create reusable UI components", signal: "Quality", useCase: "saas frontend development"},
            {name: "5. Deployment Pipeline", role: "DevOps Engineer", outcome: "setup CI/CD workflow", signal: "Speed", useCase: "saas deployment automation"}
        ]
    },
    {
        id: "microservices-architecture",
        name: "Microservices Architecture Setup",
        category: "Development",
        industry: "Enterprise Software",
        tone: "Technical & Systematic",
        primaryGoal: "Build Scalable System",
        isRecommended: false,
        steps: [
            {name: "1. Service Boundaries", role: "System Architect", outcome: "define service domains", signal: "Accuracy", useCase: "microservices design"},
            {name: "2. API Gateway Setup", role: "Platform Engineer", outcome: "configure routing and auth", signal: "Quality", useCase: "microservices gateway"},
            {name: "3. Service Communication", role: "Backend Developer", outcome: "implement event-driven patterns", signal: "Quality", useCase: "microservices communication"},
            {name: "4. Data Consistency", role: "Database Architect", outcome: "design distributed data strategy", signal: "Accuracy", useCase: "microservices data"},
            {name: "5. Monitoring & Observability", role: "SRE", outcome: "setup distributed tracing", signal: "Detail", useCase: "microservices monitoring"}
        ]
    },
    {
        id: "mobile-app-development",
        name: "Mobile App Development",
        category: "Development",
        industry: "Mobile Tech",
        tone: "Technical & User-Focused",
        primaryGoal: "Launch Mobile App",
        isRecommended: false,
        steps: [
            {name: "1. App Architecture", role: "Mobile Architect", outcome: "design app structure", signal: "Quality", useCase: "mobile app architecture"},
            {name: "2. State Management", role: "Mobile Developer", outcome: "implement state patterns", signal: "Quality", useCase: "mobile state management"},
            {name: "3. API Integration", role: "Backend Developer", outcome: "connect to backend services", signal: "Accuracy", useCase: "mobile api integration"},
            {name: "4. UI/UX Implementation", role: "Mobile UI Developer", outcome: "build responsive screens", signal: "Quality", useCase: "mobile ui development"},
            {name: "5. Testing & QA", role: "QA Engineer", outcome: "create test coverage", signal: "Detail", useCase: "mobile app testing"}
        ]
    },
    {
        id: "ai-integration",
        name: "AI Feature Integration",
        category: "Development",
        industry: "AI/ML Tech",
        tone: "Technical & Innovative",
        primaryGoal: "Add AI Capabilities",
        isRecommended: false,
        steps: [
            {name: "1. AI Use Case Analysis", role: "AI Product Manager", outcome: "identify AI opportunities", signal: "Accuracy", useCase: "ai feature planning"},
            {name: "2. Model Selection", role: "ML Engineer", outcome: "choose optimal AI model", signal: "Quality", useCase: "ai model selection"},
            {name: "3. API Integration", role: "Backend Developer", outcome: "integrate AI endpoints", signal: "Quality", useCase: "ai api integration"},
            {name: "4. Prompt Engineering", role: "AI Engineer", outcome: "optimize prompt templates", signal: "Creative", useCase: "ai prompt optimization"},
            {name: "5. Performance Optimization", role: "ML Ops Engineer", outcome: "optimize inference speed", signal: "Speed", useCase: "ai performance tuning"}
        ]
    },
    
    // MARKETING WORKFLOWS
    {
        id: "product-launch",
        name: "Product Launch Campaign",
        category: "Marketing",
        industry: "Tech Startup",
        tone: "Exciting & Urgent",
        primaryGoal: "Drive Launch Signups",
        isRecommended: false,
        steps: [
            {name: "1. Launch Strategy", role: "Product Marketer", outcome: "define launch positioning", signal: "Accuracy", useCase: "product launch strategy"},
            {name: "2. Landing Page", role: "Conversion Copywriter", outcome: "drive signups", signal: "Conversion", useCase: "product launch landing page"},
            {name: "3. Email Campaign", role: "Email Marketer", outcome: "announce launch", signal: "Conversion", useCase: "product launch email"},
            {name: "4. Social Media Blitz", role: "Social Media Manager", outcome: "build hype", signal: "Creative", useCase: "product launch social"},
            {name: "5. Influencer Outreach", role: "PR Manager", outcome: "secure coverage", signal: "Creative", useCase: "product launch pr"}
        ]
    },
    {
        id: "content-marketing-funnel",
        name: "Content Marketing Funnel",
        category: "Marketing",
        industry: "B2B SaaS",
        tone: "Educational & Trustworthy",
        primaryGoal: "Generate MQLs",
        isRecommended: false,
        steps: [
            {name: "1. Content Strategy", role: "Content Strategist", outcome: "plan content calendar", signal: "Quality", useCase: "content marketing strategy"},
            {name: "2. Top-Funnel Blog", role: "Content Writer", outcome: "attract organic traffic", signal: "Conversion", useCase: "content blog post"},
            {name: "3. Middle-Funnel Guide", role: "Technical Writer", outcome: "educate prospects", signal: "Quality", useCase: "content guide creation"},
            {name: "4. Bottom-Funnel Case Study", role: "Marketing Manager", outcome: "demonstrate results", signal: "Conversion", useCase: "content case study"},
            {name: "5. Email Nurture", role: "Email Marketer", outcome: "convert to trial", signal: "Conversion", useCase: "content email nurture"}
        ]
    },
    {
        id: "paid-ad-campaign",
        name: "Paid Advertising Campaign",
        category: "Marketing",
        industry: "E-commerce",
        tone: "Persuasive & Action-Oriented",
        primaryGoal: "Drive Conversions",
        isRecommended: false,
        steps: [
            {name: "1. Audience Research", role: "Media Buyer", outcome: "identify target segments", signal: "Accuracy", useCase: "paid ads audience research"},
            {name: "2. Ad Creative Brief", role: "Creative Director", outcome: "design compelling ads", signal: "Creative", useCase: "paid ads creative"},
            {name: "3. Copywriting", role: "Copywriter", outcome: "write high-converting copy", signal: "Conversion", useCase: "paid ads copywriting"},
            {name: "4. A/B Test Plan", role: "Growth Hacker", outcome: "define testing variables", signal: "Accuracy", useCase: "paid ads testing"},
            {name: "5. Performance Reporting", role: "Data Analyst", outcome: "analyze campaign results", signal: "Detail", useCase: "paid ads reporting"}
        ]
    }
];

// --- ADDED MISSING EXPORT ---

export const generateWorkflowSequence = (packId: string, _options?: { variationMode?: "consistent" | "mixed"; variantNum?: number }): { 
    stepName: string, 
    role: string, 
    signal: SignalType, 
    prompt: string, 
    variants: any[],
    totalVariants: number 
}[] => {
    const pack = WORKFLOW_PACKS.find(p => p.id === packId);
    if (!pack) return [];

    return pack.steps.map(step => {
        const prompt = generateEnginePrompt(
            step.useCase, 
            step.outcome, 
            step.role, 
            pack.industry, 
            pack.category, 
            step.signal
        );
        
        return {
            stepName: step.name,
            role: step.role,
            signal: step.signal,
            prompt: prompt,
            variants: generateVariations(prompt),
            totalVariants: 10
        };
    });
};

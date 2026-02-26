// Prompt Generator Engine - Ported from Python
// This file contains the core generator logic.

export type SignalType = "Quality" | "Speed" | "Accuracy" | "Detail" | "Creative" | "Conversion";
export type CategoryType = "Development" | "Marketing" | "Sales" | "Content" | "Design" | "General";

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

export const VARIANT_TEMPLATES = [
    { approach: "Default", type: "Standard", desc: "Balanced and standard output" },
    { approach: "Direct", type: "Tone", desc: "To the point, no fluff" },
    { approach: "Persuasive", type: "Tone", desc: "Focus on conversion and benefits" },
    { approach: "Detailed", type: "Depth", desc: "Comprehensive coverage" },
    { approach: "Creative", type: "Style", desc: "Out of the box thinking" },
    { approach: "Technical", type: "Depth", desc: "Deep technical specifications" },
    { approach: "Executive", type: "Level", desc: "High-level summary for leaders" },
    { approach: "Step-by-Step", type: "Format", desc: "Clear instructional steps" },
    { approach: "QA / Audit", type: "Role", desc: "Critical review mode" },
    { approach: "Viral", type: "Style", desc: "Optimized for engagement" }
];

export const generateVariations = (basePrompt: string): VariationResult[] => {
    return VARIANT_TEMPLATES.map((tmpl, i) => ({
        type: tmpl.type,
        title: tmpl.approach,
        content: `[MODIFIER: ${tmpl.approach} Approach]\n\n${basePrompt}\n\nConstraint: Apply ${tmpl.desc.toLowerCase()}.`,
        isLocked: i > 0 // Only first is free in some contexts
    }));
};

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

export const generateWorkflowSequence = (packId: string): { 
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

import type { VariantType } from "../prompt-engine";

// Maps ANGLE_TEMPLATES / INSIGHT_TYPES approach names → VariantType keys used by generateCOSTARPrompt
export const VARIANT_TYPE_MAP: Record<string, VariantType> = {
  // Legacy angle names
  "Missed Opportunity": "missed_opportunity",
  "Hidden Risk":        "hidden_risk",
  "Timing Trigger":     "timing_trigger",
  "Inefficiency":       "inefficiency",
  "Pattern Interrupt":  "pattern_interrupt",
  "Social Proof":       "social_proof",
  // New insight type names
  "Focus Trap":         "focus_trap",
  "Blind Spot":         "blind_spot",
  "Scaling Wrong":      "scaling_wrong",
  "Hidden Bottleneck":  "hidden_bottleneck",
};

export const USE_CASE_OPTIONS = [
  { category: "Development", items: ["React Component", "TypeScript Function", "API Endpoint", "SQL Query", "Unit Test", "Python Script"] },
  { category: "Content",     items: ["Blog Post Outline", "SEO Article", "Social Media Caption", "Email Newsletter", "Product Description"] },
  { category: "Marketing",   items: ["Ad Copy", "Landing Page Headline", "Value Proposition", "Meta Description"] },
  { category: "Sales",       items: ["Cold Email", "Follow-up Email", "LinkedIn Outreach", "Sales Script", "Objection Handling"] },
  { category: "Design",      items: ["UI Component Specs", "User Persona", "User Journey Map", "Design System Tokens"] },
];

export const ROLES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["Frontend Engineer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "QA Automation Engineer"],
  Content:     ["Content Strategist", "SEO Specialist", "Technical Writer", "Social Media Manager", "Ghostwriter"],
  Marketing:   ["Growth Marketer", "Digital Marketing Manager", "Copywriter", "Brand Strategist", "PPC Specialist"],
  Sales:       ["Sales Development Rep (SDR)", "Account Executive", "Sales Manager", "Business Development Manager"],
  Design:      ["Product Designer", "UI/UX Designer", "Design Systems Lead", "Brand Designer"],
  General:     ["Project Manager", "Product Owner", "Business Analyst", "Executive Assistant"],
};

export const OUTCOMES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["Ensure Type Safety", "Optimize Performance", "Improve Readability", "Clarify Complex Logic", "Modularize Code", "Reduce Technical Debt"],
  Content:     ["Educate Audience", "Improve SEO Ranking", "Drive Engagement", "Increase Viral Potential", "Simplify Complex Topic"],
  Marketing:   ["Increase Conversion", "Generate Leads", "Drive Click-Throughs", "Build Brand Awareness", "Target Specific Persona"],
  Sales:       ["Book More Meetings", "Overcome Objections", "Build Rapport", "Close the Deal", "Re-engage Cold Leads"],
  Design:      ["Improve User Experience", "Ensure Consistency", "Enhance Accessibility", "Modernize Visuals", "Streamline User Flow"],
  General:     ["Save Time", "Improve Clarity", "Organize Information", "Solve Specific Problem", "Automate Workflow"],
};

export const INDUSTRIES_BY_CATEGORY: Record<string, string[]> = {
  Development: ["SaaS", "FinTech", "HealthTech", "E-commerce", "Web3/Blockchain", "EdTech", "Cybersecurity"],
  Marketing:   ["B2B SaaS", "D2C Brands", "Digital Agency", "E-commerce", "Media & Publishing"],
  Sales:       ["B2B Technology", "Enterprise Software", "Real Estate", "Financial Services", "Consulting"],
  Content:     ["Lifestyle", "Technology", "Finance", "Health & Wellness", "Education"],
  Design:      ["Tech Startups", "Creative Agency", "Fashion & Retail", "Consumer Apps"],
  General:     ["Technology", "Healthcare", "Finance", "Retail", "Education", "Manufacturing"],
};

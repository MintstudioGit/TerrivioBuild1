# Terrivio — Product Roadmap
**Updated:** 23 February 2026  
**Vision:** The professional prompt engineering platform for Sales, Marketing, and Development teams.

---

## Current State (v0.1 — Feb 2026)

Core product is built and working. The pipeline is the flagship feature — no competitor does CSV → AI prompt pipeline → webhook export in a single UI.

**What exists today:**
- Prompt Generator (variants, quality gate, 6 signals)
- Pipeline Builder (CSV → AI prompts → export)
- Prompt Directory (taxonomy, signal explorer)
- Saved Prompts (library, history, analytics)
- Supabase Auth (email + Google OAuth)
- Backend API (prompts CRUD, history, rate limiting)
- Stripe backend (needs env vars to go live)
- Free tier + Pro gating

---

## Phase 0 — Launch (This Week)

> **Goal:** Go live with real payments by end of this week.

| # | Task | Est. | Priority |
|---|---|---|---|
| 0.1 | Set Stripe env vars in Supabase Dashboard | 1h | 🔴 Blocker |
| 0.2 | Create Stripe product + price (€9 intro / €39/mo) | 30m | 🔴 Blocker |
| 0.3 | Register Stripe webhook (`checkout.session.completed`) | 30m | 🔴 Blocker |
| 0.4 | Smoke test full upgrade flow (Stripe test card) | 1h | 🔴 Blocker |
| 0.5 | Add favicon.ico to `/public/` | 15m | 🟡 Pre-launch |
| 0.6 | Add `og:image` meta tag in `index.html` | 15m | 🟡 Pre-launch |
| 0.7 | Fix footer social links (real URLs or remove) | 15m | 🟡 Pre-launch |
| 0.8 | Wire contact form to Resend (free tier) | 1h | 🟡 Pre-launch |
| 0.9 | Restrict Edge Function CORS to `terrivio.com` | 15m | 🟡 Pre-launch |
| 0.10 | Deploy to production host (Vercel / Netlify / Cloudflare) | 1h | 🔴 Blocker |

**Deliverable:** Live product at `terrivio.com` accepting real payments.

---

## Phase 1 — Post-Launch Stability (Week 1–2)

> **Goal:** Fix the things you'll notice the moment real users arrive.

| # | Task | Est. | Why |
|---|---|---|---|
| 1.1 | Add Plausible or PostHog analytics | 2h | Know what users actually do |
| 1.2 | Add Sentry error tracking | 1h | Know when things break |
| 1.3 | Stripe Customer Portal (cancel / change plan) | 2h | Avoid chargebacks, reduce churn friction |
| 1.4 | Email confirmation flow (optional) | 2h | Reduce fake signups |
| 1.5 | Add Zod validation to Edge Function endpoints | 3h | Prevent bad data |
| 1.6 | Write `.env.example` for contributors | 30m | Dev onboarding |
| 1.7 | Update README.md with real setup guide | 1h | Project credibility |
| 1.8 | Test on Safari, Firefox, mobile devices | 2h | Catch CSS bugs |
| 1.9 | Write first 3 blog posts (SEO) | 4h | Organic growth starts here |

---

## Phase 2 — Growth Features (Month 1)

> **Goal:** Increase activation (free → engaged) and conversion (free → pro).

### 2.1 Onboarding Flow
- Add a "Welcome" modal or page after signup
- Walk user through: Generator → Save → Pipeline (3 steps)
- Show what Pro unlocks before they hit the limit
- **Impact:** Higher activation rate

### 2.2 Pipeline Templates Library
- Pre-built templates: SaaS Outbound, Agency Pitch, Product Launch
- One-click "Use Template" → pre-fills pipeline
- Share template links (public URLs)
- **Impact:** Lower time-to-value for new users

### 2.3 Prompt Rating & Community
- Rate saved prompts (1–5 stars)
- "Mark as used" → increment use count
- Top-rated prompts appear in Directory
- **Impact:** Social proof, return visits

### 2.4 Team Workspaces (Pro+)
- Invite team members to shared workspace
- Shared prompt library
- Pipeline results visible to team
- **Impact:** Increases Pro ARPU, reduces churn

### 2.5 AI Integration (OpenAI / Anthropic)
- Option to run prompts through real LLM inside the tool
- Show output preview alongside the prompt
- Rate the output → improve next iteration
- **Impact:** "Generate + See result" in one place = massive retention

---

## Phase 3 — Monetization Expansion (Month 2–3)

> **Goal:** Increase MRR per user and add new revenue streams.

### 3.1 Annual Plan
- €290/year (save ~35% vs monthly)
- Reduces churn, improves cash flow
- Add to Pricing page alongside monthly

### 3.2 Prompt Packs Marketplace
- Sell curated packs (e.g. "SaaS Cold Outbound Pack — 50 prompts")
- One-time purchase or included with Pro
- Affiliate/creator revenue share

### 3.3 Agency / Team Plan
- €99/month — 5 seats
- €199/month — unlimited seats
- Shared pipelines, branded exports

### 3.4 Pipeline API
- REST API to run pipelines programmatically
- API key management in dashboard
- Pricing: pay-per-row or included in Pro

### 3.5 White-Label
- Remove Terrivio branding
- Custom domain support
- Target: agencies reselling to clients

---

## Phase 4 — Platform & Scale (Month 3–6)

### 4.1 Blog & Content Engine
- Technical guides: "How to write a SaaS cold email prompt"
- Comparison pages: "Terrivio vs ChatGPT for sales prompts"
- SEO → organic signups

### 4.2 Integrations Hub
- Native Clay integration (not just webhook)
- HubSpot / Salesforce sync
- Slack notifications on pipeline complete

### 4.3 Prompt A/B Testing
- Run two prompts against the same row set
- Compare output quality scores
- Pick winner and apply to full CSV

### 4.4 Advanced Analytics
- Real conversion tracking (prompt → reply → booked → closed)
- Team leaderboards
- ROI calculator ("this pipeline generated X meetings")

### 4.5 Mobile App
- iOS / Android (React Native)
- Quick prompt generation on-the-go
- Pipeline run status notifications

---

## MRR Milestones

| Milestone | Target | Key Actions |
|---|---|---|
| **€500 MRR** | Month 1 | 13 Pro users — activate Stripe, tell 50 people |
| **€2,000 MRR** | Month 2 | 52 Pro users — onboarding, blog, Product Hunt |
| **€5,000 MRR** | Month 3 | Team plan + annual plan live |
| **€10,000 MRR** | Month 4–5 | Integrations + referral program |
| **€25,000 MRR** | Month 6 | Agency plan + API + SEO organic |

---

## Tech Debt to Address

| Item | Priority | When |
|---|---|---|
| Restrict CORS to production domain | High | Phase 0 |
| Add Zod request validation | Medium | Phase 1 |
| Split large components (GeneratorPage 1112 lines) | Low | Phase 2 |
| Add E2E tests (Playwright) | Medium | Phase 2 |
| Add CI/CD pipeline (GitHub Actions) | Medium | Phase 2 |
| Remove version pins from vite.config.ts aliases | Low | Phase 2 |

---

## Competitive Differentiators (Keep These)

1. **Pipeline Builder** — Nobody does CSV → AI prompt → webhook in one SPA
2. **Signal-based generation** — Not just "write a prompt", but target specific outcomes
3. **Quality gate** — Auto-detects vague language and rewrites it
4. **Email style rotation** — Prevents domain burn at scale (contrarian, peer, minimalist, etc.)
5. **Free tier** — 5 saved prompts is enough to get value, not enough to replace Pro

---

## Engine Quality Audit (23 Feb 2026)

> Deep audit of: Prompt Engine, Quality Gate, Website Scraper, Offer Extractor.  
> Each rated on current quality and what "world-class" looks like.

---

### 1. Prompt Engine (`prompt-engine.ts`)

#### Current state — 7/10
| What | Status |
|---|---|
| 12 structural variants | ✅ Works |
| 6 signal types (Quality, Speed, Accuracy…) | ✅ Works |
| Category-specific constraints / practices / qualities | ✅ Works |
| Grammar fixes + word-window trimming | ✅ Works |
| cleanText() — forbidden verbs + phrase replacements | ✅ Works |
| Email style rotation (6 styles × 3 step types) | ✅ Excellent |
| `generateVariations()` — 10 approaches | ✅ **Fixed** — now applies real modifier functions, not just label tags |
| CO-STAR structured prompt | ✅ **New** — `generateCOSTARPrompt()` added |
| Context injection from website/offer | ✅ **New** — `generateContextualPrompt()` added |
| Variant diversity | ⚠️ The 12 variants are sentence-shuffle of same template |
| No context injection in generator | ⚠️ Generator doesn't use scraped context in prompt body |

#### What "world-class" looks like (roadmap items)
- **W1.1** — Connect `generateContextualPrompt()` to GeneratorPage: when user inputs their offer URL, inject scraped context into the prompt  
- **W1.2** — Add `generateCOSTARPrompt()` as a "Structured Mode" toggle in the Generator UI  
- **W1.3** — Genuine 12 variants: different frameworks (RISEN, RTF, APE, RACE) not just shuffled clauses  
- **W1.4** — Prompt chaining: step N receives step N-1's output spec as context  
- **W1.5** — Few-shot example injection: prepend 1-2 examples of the desired output format  

---

### 2. Quality Gate (`prompt-quality-gate.ts`)

#### Before fix — 4/10 (bug)
- Base score was **65/100** → almost every prompt passed on attempt 1
- Scored +5 per keyword match, no penalty for missing role/format/specificity
- Weak prompt like `"Write a good email please."` would score **75/100** and pass

#### After fix — 8/10 ✅
| Test prompt | Before | After |
|---|---|---|
| `"Write a good email please."` | 75 (pass!) | **22** (retries ✓) |
| Medium — no role/format | 85 (pass!) | **51** (retries ✓) |
| Strong engine prompt | 90 | **84** (passes ✓) |
| CO-STAR structured prompt | 90 | **86** (passes ✓) |

**Changes made:**
- Base score: 65 → **40** (must earn the score)  
- Added: role/persona check (+8 — also recognises `## Audience` CO-STAR header)  
- Added: specificity check (+10 — has numbers, format constraints, or output format instruction)  
- Added: outcome clarity check (+8 — has "to / that / so that" clause)  
- Added: CO-STAR header recognition for structure scoring  
- Added: buzzword penalties (`leverage`, `synergy`, `robust solution`)  
- Penalty increased per weak word: -5 → **-6**  
- Duplicate penalty: -50 → **-60**  

#### What "world-class" looks like (roadmap items)
- **W2.1** — Add RISEN/APE rubric scoring: does the prompt have Role, Instructions, Steps, End-goal, Narrowing?  
- **W2.2** — Cosine similarity duplicate check against full history (not just exact match)  
- **W2.3** — Readability scoring: Flesch-Kincaid grade level target for different use-cases  
- **W2.4** — Anti-hallucination check: does the prompt have "only state facts" or "do not invent" guard?  

---

### 3. Website Scraper (`website-scraper.ts`)

#### Before fix — 5/10 (critical bug)
- **🐛 Critical URL bug**: built `https://r.jina.ai/http://example.com` for ALL sites
  - This forced HTTP on HTTPS-only sites → redirects fail → scrape fails silently
  - Root cause: stripped protocol then prepended `https://r.jina.ai/http://`
- No caching: same URL scraped again on every pipeline row that shares a company URL
- Sentences < 45 chars filtered out (misses short, punchy marketing claims)
- 4000-char rawText cap (may truncate important content)

#### After fix — 8/10 ✅
| Fix | Detail |
|---|---|
| **URL bug fixed** | Now uses `https://r.jina.ai/${normalizedUrl}` — preserves https:// |
| **Session cache added** | `scrapeCache` Map — same URL returns cached result instantly |
| **Cache clear function** | `clearScrapeCache()` exported for use between pipeline runs |

**Impact**: Pipeline scraping now works correctly on HTTPS-only sites (which is ~99% of modern SaaS companies). Cache eliminates N duplicate scrapes for N rows with the same company domain.

#### What "world-class" looks like (roadmap items)
- **W3.1** — Try `og:description` + `meta description` extraction via HTML parse before Jina (faster, more accurate)  
- **W3.2** — Try schema.org `Organization`, `Product`, `Service` structured data extraction  
- **W3.3** — Multi-source fallback: Jina → direct fetch → `<meta>` tags only  
- **W3.4** — Persist cache in `sessionStorage` so it survives page navigations within a session  
- **W3.5** — Rate-aware batch scraper: scrape max 2 URLs in parallel, queue the rest  
- **W3.6** — Language detection: skip non-English pages or run translation  

---

### 4. Offer Extractor (`offer-extractor.ts`)

#### Before fix — 5/10 (honesty issues)
- `calculateConfidence()` started at **0.5** — a row with 3 characters of data scored 50% confidence
- `extractPainPoints()` returned the **keyword itself** ("Problem", "Challenge"), not text from the row
- `extractDifferentiators()` returned `"Unique approach"` regardless of what the row said
- `enrichOffers()` added a flat +0.15 confidence boost with no real enrichment

#### After fix — 7/10 ✅
| Fix | Detail |
|---|---|
| **Confidence rebalanced** | Base: 0.5 → **0.2** — must earn score from field presence + text richness |
| **Pain points** | Now extracts **actual sentences** containing pain pattern words |
| **Differentiators** | Now extracts **surrounding sentence context**, not just the indicator word |
| **Confidence adds up honestly** | +0.10 per real field, +0.05 per richness tier, +0.10 for value signals |

#### What "world-class" looks like (roadmap items)
- **W4.1** — Use scraped website context to fill missing offer fields (if title is blank, use `og:title`)  
- **W4.2** — Merge CSV offer + website offer: combine both sources into one enriched offer object  
- **W4.3** — Add `icp_signals` field: list of signals about the prospect (industry, size, tech stack)  
- **W4.4** — Named entity recognition (NER): extract company name, product name, pricing from raw text  
- **W4.5** — Deduplication: hash-based dedup across CSV rows with same domain/product  

---

### Engine Upgrade Implementation Roadmap

#### Sprint 1 — Wire new functions to UI (1–2 days)
| # | Task | Files |
|---|---|---|
| S1.1 | Add "Structured (CO-STAR)" toggle to GeneratorPage | `GeneratorPage.tsx`, `prompt-engine.ts` |
| S1.2 | Wire `generateContextualPrompt()` to Pipeline: inject website context into prompts | `PipelineBuilderPage.tsx`, `prompt-engine.ts` |
| S1.3 | Show quality score breakdown in GeneratorPage (not just %) | `GeneratorPage.tsx`, `prompt-quality-gate.ts` |
| S1.4 | Call `clearScrapeCache()` at start of each new Pipeline run | `PipelineBuilderPage.tsx` |

#### Sprint 2 — Genuine variation system (2–3 days)
| # | Task | Detail |
|---|---|---|
| S2.1 | Add 4 new prompt frameworks: RISEN, RTF, APE, RACE | `prompt-engine.ts` |
| S2.2 | Framework picker in GeneratorPage (dropdown alongside signal) | `GeneratorPage.tsx` |
| S2.3 | Show framework used in prompt card metadata | `PromptCard.tsx` |

#### Sprint 3 — Website context in generator (2 days)
| # | Task | Detail |
|---|---|---|
| S3.1 | Add "Your website" input to GeneratorPage | `GeneratorPage.tsx` |
| S3.2 | Auto-scrape on blur, inject into prompt via `generateContextualPrompt()` | `GeneratorPage.tsx`, `website-scraper.ts` |
| S3.3 | Show scraped context preview in UI | `GeneratorPage.tsx` |

#### Sprint 4 — True world-class (1–2 weeks)
| # | Task | Detail |
|---|---|---|
| S4.1 | OpenAI API integration: run prompt through GPT-4o, show output preview | New `ai-runner.ts` |
| S4.2 | Output quality scoring: rate AI output using rubric, suggest prompt improvements | `prompt-quality-gate.ts` extension |
| S4.3 | Prompt A/B testing mode in Pipeline | `PipelineBuilderPage.tsx` |
| S4.4 | HTML meta-tag extraction before Jina scrape | `website-scraper.ts` |
| S4.5 | NER-based offer extraction from website text | `offer-extractor.ts` |

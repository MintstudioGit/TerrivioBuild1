# PRODUCT.md — Terriv.io Future Architecture
> Last updated: February 2026  
> Thesis: Data depth + distribution are the only two levers that matter at scale.

---

## The One-Sentence Vision

**Turn any sales signal into a sent, personalized message — without touching a spreadsheet.**

Clay owns the enrichment table. We own what happens after the table is full: the intelligence layer that decides *what to say*, *how to say it*, and *sends it*.

---

## The Honest Current State

| Layer | Status | Gap |
|---|---|---|
| Prompt quality engine | ✅ World-class (CO-STAR, 10 variants, quality gate) | — |
| Context scraping | ✅ Jina AI, session cache, HTTPS fixed | Surface-level only |
| Pipeline builder | ✅ CSV → enrich → generate → export | No real data sources |
| Workflow packs | ✅ 15+ curated sequences | Not shareable/forkable |
| Auth + billing | ✅ Supabase + Stripe ready | 4 env vars missing |
| Team features | ❌ | Zero |
| Enrichment | ❌ | Zero (just website scraping) |
| Distribution | ❌ Chrome extension, sharing | Zero |
| CRM sync | ❌ | Zero |

---

## Part 1 — DATA DEPTH

The prompt engine is already better than anything else on the market. The problem is garbage in, garbage out. A great prompt template applied to "John at Acme" produces nothing. The same template applied to:

> "John was promoted to VP Sales 6 weeks ago, they just raised Series B, they're hiring 4 SDRs, they use Salesforce + Outreach, and their CEO posted about pipeline problems 3 days ago"

...produces something John replies to.

### The Enrichment Waterfall (Priority Order)

Every data source below feeds directly into `generateCOSTARPrompt({ context: enrichedContext })` — no UI changes needed, just deeper context strings.

#### Tier 1 — Free / Near-free (build now)
| Source | Signal | API |
|---|---|---|
| Website scraping | Offer, ICP, tone | Jina AI (already built) |
| LinkedIn company page | Size, industry, recent posts | Proxycurl ($0.003/call) |
| Google News | Recent coverage, funding, launches | SerpAPI / NewsAPI |
| Job postings | Hiring signals, tech stack, growth | Coresignal / Apify |
| BuiltWith / Wappalyzer | Tech stack (CRM, MAP, tools used) | BuiltWith API |

#### Tier 2 — Paid signals (build at $500k ARR)
| Source | Signal | API |
|---|---|---|
| LinkedIn personal profile | Role tenure, past companies, posts | Proxycurl |
| Crunchbase | Funding rounds, investors, ARR range | Crunchbase API |
| G2 reviews | Pain points from their own customers | G2 Buyer Intent |
| Bombora | Intent data — what topics they're researching | Bombora API |

#### Tier 3 — Proprietary (build at $2M ARR)
- **Reply signal tracking**: did they open, click, reply? Feed that back as variant selection input.
- **A/B outcome database**: which variant × industry × role combinations get the highest reply rates across all users. Anonymous, aggregated. This becomes a moat no API can replicate.

### The Enrichment Waterfall Architecture

```
Input: { name, company, website?, email? }
         ↓
[Tier 1: always run]
  Website scrape → offer, ICP, tone
  LinkedIn company → headcount, recent posts, industry
  Job postings → hiring signals, stack
  News → funding, launches, leadership changes
         ↓
[Tier 2: run if Pro]
  LinkedIn personal → tenure, seniority, background
  Crunchbase → funding stage, ARR range
  Tech stack → tools they use (BuiltWith)
         ↓
[Signal Synthesis]
  score_each_signal() → pick top 3 most relevant signals
  build_context_string() → structured 400-char context block
         ↓
[Prompt Engine]
  generateCOSTARPrompt({ context: enrichedContext, variant: best_variant })
         ↓
Output: Personalized message ready to send
```

This architecture already exists in the codebase — `context:` is already wired into `generateCOSTARPrompt`. We just need to fill the pipeline above it.

---

## Part 2 — DISTRIBUTION

The product can be world-class and still grow at zero if nobody shares it. Distribution is not marketing — it's product decisions that create sharing as a side effect of using the tool.

### Distribution Lever 1 — Shareable Template Library

**What:** Every workflow pack and generated prompt sequence gets a public `/t/[slug]` URL. One click to fork into your own workspace.

**Why it grows:** The person who builds the "Series B SaaS cold email pack" shares it on LinkedIn. 500 people fork it. Each of those is an activation. Zero CAC.

**Build complexity:** Low. Add `is_public: boolean` and `slug: string` to the pack schema. The `/t/[slug]` page is basically `PackLandingPage.tsx` with a "Fork to my workspace" button.

**Viral coefficient estimate:** 1 good shared template = 50–200 signups based on comparable tools (Notion templates, Loom videos, Clay tables).

### Distribution Lever 2 — Chrome Extension

**What:** Button on LinkedIn profiles and Sales Navigator. Click → sidebar opens pre-filled with their name, company, role, LinkedIn data. Generate → copy to clipboard.

**Why it grows:** SDRs live in LinkedIn 4 hours a day. This makes the tool appear in their workflow without any behaviour change. Daily active usage skyrockets.

**Flywheel:** Extension usage → more data on which variants work → better variant auto-selection → better outputs → more shares → more installs.

**Build complexity:** Medium. Manifest V3 Chrome extension, content script injects sidebar, calls existing `/api/generate` endpoint.

### Distribution Lever 3 — Native Clay HTTP Action

**What:** A published Clay HTTP action that calls the Terriv.io prompt API. Clay users add it to their table like any other enrichment column.

**Why it's strategic:** Clay has 100k+ GTM users who are already paying, already have the enrichment data, and already want better copy. We don't compete with Clay — we plug into it. Their distribution becomes our distribution.

**Revenue model:** Free tier gets 50 calls/month via Clay. Pro unlocks unlimited + all variants.

**Build complexity:** Low. One POST endpoint `/api/v1/generate` that accepts `{ name, company, context, variant, useCase }` and returns `{ prompt: string, variant: string, score: number }`. The Clay action config is just JSON.

### Distribution Lever 4 — Team Workspaces

**What:** Invite teammates. Shared prompt library. Shared workflow packs. One subscription, 3–10 seats.

**Why it grows:** A single SDR who loves it sends an invite to their whole team. The team signs up. One $49/mo account becomes a $299/mo team account. This is the Clay playbook exactly.

**Revenue impact:** Median contract goes from $49 → $249. Same number of customers, 5x revenue.

**Build complexity:** Medium. `team_id` on users, shared pack ownership, invite-by-email flow.

---

## Part 3 — THE MOAT

Speed is not a moat. UI is not a moat. Even prompt quality is not a moat after 18 months. The real moat is:

### 1. Outcome-trained variant selection

Every generated prompt that gets sent → if reply tracking is on → we know which variant × ICP combination works. After 1M sends, we have a dataset no competitor can buy. Auto-variant selection becomes genuinely predictive.

This is the difference between "here are 10 variants, pick one" and "for a VP Engineering at a Series B FinTech who's been in role 8 months, use Insight variant — it has a 34% reply rate in this segment."

### 2. The template network effect

The more templates get shared and forked, the better the library gets. Users curate it organically. After 10,000 forks, the template library is an asset no one can replicate by writing code.

### 3. Workflow intelligence that compounds

Right now: user inputs → one prompt. 

Future: signal detected (job change, funding, new hire) → workflow automatically triggered → message drafted → queued for review → sent on approval. The system learns which signals → which workflows → which outcomes, for each industry vertical.

---

## Part 4 — THE ROADMAP

### Phase 0 — Launch blocker (this week)
- [ ] Set 4 Stripe env vars
- [ ] Deploy to production
- [ ] Test payment flow end-to-end

### Phase 1 — Distribution foundation ($0 → $10k MRR)
- [ ] Shareable template URLs `/t/[slug]`
- [ ] Public template gallery with fork button
- [ ] Chrome extension MVP (LinkedIn sidebar, generate button)
- [ ] Clay HTTP action published
- [ ] Referral program: "Share a template → get 1 month free"

### Phase 2 — Data depth ($10k → $50k MRR)
- [ ] Proxycurl integration (LinkedIn company + personal)
- [ ] Job postings signal (Apify scraper)
- [ ] News signal (Google News API)
- [ ] BuiltWith tech stack detection
- [ ] Enrichment waterfall UI in pipeline builder
- [ ] Context quality score shown to user (0–100)

### Phase 3 — Team + compounding ($50k → $200k MRR)
- [ ] Team workspaces + seat-based billing
- [ ] Shared prompt library per team
- [ ] Reply tracking pixel (optional, user-installed)
- [ ] Variant performance analytics per team
- [ ] CRM sync: HubSpot (read contacts, write activity)

### Phase 4 — Intelligence layer ($200k → $1M MRR)
- [ ] Auto-variant selection based on outcome data
- [ ] Signal-triggered workflow automation
- [ ] Salesforce sync
- [ ] API access (developers building on top of us)
- [ ] Custom variant training per company

### Phase 5 — Platform ($1M MRR → $50M ARR)
- [ ] Marketplace: sell workflow packs (rev share)
- [ ] Bombora intent data integration
- [ ] Enterprise contracts (custom onboarding, SSO, compliance)
- [ ] Vertical-specific products: Recruiting, RevOps, Partnerships
- [ ] International: EU, DACH, UK market packs

---

## Part 5 — WHAT NOT TO BUILD

These look like good ideas. They are traps.

| Don't build | Why |
|---|---|
| AI email writer (generate the full email) | Lavender, Regie, Copy.ai already own this. We own the *prompt* that goes into the AI — different category. |
| Sending infrastructure | Instantly, Smartlead, Apollo own this. Integration > competition. |
| More prompt variants | 10 is already more than users can evaluate. Depth > breadth. |
| Mobile app | SDRs work at desks. Chrome extension > mobile app. |
| Generic "AI assistant" features | Focus is the product. Every unfocused feature dilutes the brand. |

---

## The One Metric That Matters

**Prompts that resulted in a reply / total prompts sent**

Not signups. Not MRR (yet). Not prompts generated.

Reply rate. Because if the prompts work, everything else — retention, expansion, referrals, brand — follows automatically.

Everything in this document is in service of moving that number.

---

*Built in public. Steal what's useful.*

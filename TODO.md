# Terrivio — Launch TODO
**Date:** 23 February 2026  
**Status:** Product is feature-complete. Stripe env vars = the only blocker.

---

## 🔴 TODAY — Launch Blockers (Est. 4–5 hours total)

### STEP 1: Configure Stripe (2 hours)

- [ ] **Create Stripe account** at stripe.com (if not done)
- [ ] **Create Product** in Stripe Dashboard → Products → "Terrivio Pro"
- [ ] **Create Price:**
  - First price: €9.00 / month (intro) — or use a Stripe coupon on €39 price
  - Recurring price: €39.00 / month
  - Copy the Price ID: `price_XXXXXXXXXXXXXXXX`
- [ ] **Get Stripe Secret Key** from Stripe Dashboard → Developers → API Keys
  - Live key: `sk_live_...`
- [ ] **Set environment variables** in Supabase Dashboard:
  - Go to: supabase.com → Project `klxtpbyrhxlaxatgsskk` → Edge Functions → Secrets
  - Add: `STRIPE_SECRET_KEY` = `sk_live_...`
  - Add: `STRIPE_PRICE_ID` = `price_...`
  - Add: `SITE_URL` = `https://terrivio.com`
- [ ] **Register Stripe webhook:**
  - Stripe Dashboard → Developers → Webhooks → Add endpoint
  - URL: `https://klxtpbyrhxlaxatgsskk.supabase.co/functions/v1/make-server-a2b5dce9/stripe-webhook`
  - Event: `checkout.session.completed`
  - Copy webhook signing secret: `whsec_...`
  - Add to Supabase Secrets: `STRIPE_WEBHOOK_SECRET` = `whsec_...`

### STEP 2: Test Full Upgrade Flow (1 hour)

- [ ] Sign up as a new user on `localhost:3001`
- [ ] Go to `/pricing` → click "Upgrade to Pro"
- [ ] On `/upgrade` → click "Pay €9.00 & Upgrade"
- [ ] You should be redirected to Stripe Checkout
- [ ] Complete with test card: `4242 4242 4242 4242` / any expiry / any CVC
- [ ] Verify redirect back to `/upgrade?success=1`
- [ ] Verify user status updates to `pro` in the header
- [ ] Test "Manage subscription" in header dropdown → opens Stripe Customer Portal
- [ ] Test Pro features: save more than 5 prompts, run pipeline webhook export

### STEP 3: Quick UX Fixes (30 min)

- [ ] **Add favicon** — drop any `.ico` or `.png` file into `/public/favicon.ico`  
  Then add to `index.html`: `<link rel="icon" href="/favicon.ico" />`
- [ ] **Add og:image** — create a 1200×630 screenshot or logo image, host at `/public/og-image.png`  
  Add to `index.html`: `<meta property="og:image" content="https://terrivio.com/og-image.png" />`
- [ ] **Fix footer social links** in `src/components/GlobalFooter.tsx` — replace `href="#"` with real Twitter/LinkedIn/GitHub URLs, or remove the social icons entirely

### STEP 4: Fix Contact Form (1 hour)

The contact form shows a success message but doesn't actually send email.

- [ ] Sign up for [Resend](https://resend.com) (free tier: 3,000 emails/month)
- [ ] Get Resend API key
- [ ] Add `RESEND_API_KEY` to Supabase Secrets
- [ ] Add a `/contact` endpoint to the Edge Function that sends the email via Resend API
- [ ] Wire `ContactPage.tsx` form submit to call that endpoint instead of `setTimeout`

### STEP 5: Deploy to Production (30 min)

- [ ] Run `npm run build` → verify `build/` directory is clean
- [ ] Deploy to Vercel / Netlify / Cloudflare Pages
  - Set build command: `npm run build`
  - Set output directory: `build`
  - Set environment: no frontend env vars needed (Supabase keys are hardcoded as public anon keys)
- [ ] Verify the live URL resolves and loads correctly
- [ ] Test sign-up, sign-in, generator, pipeline on the live domain

---

## 🟡 THIS WEEK — Post-Launch (Days 2–7)

### Monitoring & Analytics

- [ ] **Install Plausible** (privacy-first analytics, €9/month)
  - Add `<script defer data-domain="terrivio.com" src="https://plausible.io/js/script.js"></script>` to `index.html`
- [ ] **Install Sentry** for error tracking
  - `npm install @sentry/react`
  - Init in `main.tsx`
  - Wrap app in `Sentry.ErrorBoundary`

### Backend Hardening

- [ ] **Restrict CORS** in `src/supabase/functions/server/index.tsx`:
  ```ts
  // Change:
  origin: "*",
  // To:
  origin: ["https://terrivio.com", "https://www.terrivio.com"],
  ```
- [ ] **Add Zod validation** for prompt create/update body in Edge Function
- [ ] **Add `.env.example`** file at project root:
  ```
  # Supabase (public, safe to commit)
  VITE_SUPABASE_PROJECT_ID=klxtpbyrhxlaxatgsskk
  VITE_SUPABASE_ANON_KEY=...
  
  # Set in Supabase Edge Function Secrets (never commit)
  # STRIPE_SECRET_KEY=sk_live_...
  # STRIPE_PRICE_ID=price_...
  # STRIPE_WEBHOOK_SECRET=whsec_...
  # SITE_URL=https://terrivio.com
  # RESEND_API_KEY=re_...
  ```

### Content

- [ ] Write blog post: "How to write a cold email prompt that books meetings"
- [ ] Write blog post: "The 6 AI prompt signals that change your output"
- [ ] Add blog route (replace ComingSoonPage or use a static blog)

---

## 🟢 NEXT 2 WEEKS — Growth

- [ ] Submit to Product Hunt
- [ ] Post on LinkedIn/Twitter with pipeline demo GIF
- [ ] Reach out to 20 potential users (SDRs, marketers, agencies)
- [ ] Set up referral system (ReferralHero or manual coupon codes)
- [ ] Add annual plan to Pricing page (€290/year)
- [ ] Add Stripe Customer Portal cancel flow test
- [ ] Write onboarding email sequence (3 emails via Resend):
  1. Welcome + "Here's what to do first"
  2. Day 3: "Have you tried the Pipeline?"
  3. Day 7: "Upgrade to Pro — here's why"
- [ ] Add "Invite a teammate" flow for Pro users

---

## 🔵 MONTH 1 — Feature Sprint

- [ ] Onboarding wizard (post-signup guided tour)
- [ ] Pipeline templates library (pre-built workflows)
- [ ] AI output preview (run prompt through OpenAI API inside the tool)
- [ ] Prompt A/B testing mode
- [ ] Team workspace (invite members)
- [ ] Mobile responsive testing pass (iOS Safari, Android Chrome)

---

## Notes

- **Do not remove the Stripe fallback code** in `UpgradePage.tsx` yet — it's useful for dev testing. Remove after Stripe is confirmed live.
- **The DesignController** is already hidden in production (`import.meta.env.DEV`). No action needed.
- **History backend** is wired — `SavedPromptsPage` fetches from `/history` endpoint. No mocks.
- **Google OAuth** is real on all auth pages. Needs Google provider enabled in Supabase Auth settings if not already.

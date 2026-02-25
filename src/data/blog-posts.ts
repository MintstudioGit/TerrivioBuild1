/**
 * Blog post data — static seed posts for SEO (Phase 1.9)
 * Add new posts here. They'll appear on /blog and /blog/:slug.
 */

export interface BlogPost {
  slug:        string;
  title:       string;
  description: string;
  date:        string;       // ISO 8601
  readingTime: string;       // "5 min read"
  category:    string;
  tags:        string[];
  body:        string;       // Markdown-style content rendered as HTML
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-saas-cold-email-prompt",
    title: "How to Write a SaaS Cold Email Prompt That Actually Books Meetings",
    description:
      "Most cold email prompts are generic. Here's a step-by-step framework for writing signal-based prompts that generate personalised emails your prospects actually reply to.",
    date: "2026-02-24",
    readingTime: "6 min read",
    category: "Prompt Engineering",
    tags: ["cold email", "saas", "outbound", "prompt engineering"],
    body: `
<h2>Why most AI cold email prompts fail</h2>
<p>The typical prompt looks like this: <em>"Write a cold email to a SaaS founder about our product."</em></p>
<p>ChatGPT obediently produces something polished, professional, and completely forgettable. Why? Because the prompt gave the model nothing real to work with — no signal, no tension, no specificity.</p>
<p>The output mirrors the input. Vague prompt → generic email.</p>

<h2>The signal-based framework</h2>
<p>A signal is a specific, observable fact about your prospect: a job change, a funding round, a tech stack, a recent hire, a pain pattern in their reviews. Signals give the AI something concrete to personalise against.</p>
<p>Here's the structure we use at Terrivio:</p>

<pre><code>## Role
You are a senior SDR at [Your Company], writing the first cold email to [Prospect Name], [Title] at [Company].

## Context
[Company] just [signal — e.g. raised Series B / hired 5 AEs / moved off Salesforce].
Your company helps [ICP] to [outcome] without [pain they want to avoid].

## Task
Write a 3-sentence cold email (max 80 words).
- Line 1: reference the signal naturally, not as a compliment
- Line 2: connect it to the problem you solve
- Line 3: one low-friction CTA (15-min call or "worth a chat?")

## Constraints
- No buzzwords: leverage, synergy, game-changer
- No "I hope this finds you well"
- Do not mention features — only outcomes
- Output format: plain text, no subject line</code></pre>

<h2>Why this works</h2>
<p>Three things make this prompt structurally strong:</p>
<ol>
  <li><strong>Role declaration</strong> — tells the model whose voice to write in</li>
  <li><strong>Signal injection</strong> — gives it a real hook, not a made-up one</li>
  <li><strong>Constraint list</strong> — prevents the exact phrases that get emails deleted</li>
</ol>

<h2>Scaling it with Pipeline Builder</h2>
<p>Once you have a prompt that works on one row, you can scale it across your entire CSV. Terrivio's Pipeline Builder maps your CSV columns (company, signal, first name) directly into the prompt template and generates a personalised version for every row.</p>
<p>The output can be exported to CSV or sent directly to Clay, Zapier, or Make via webhook.</p>

<h2>The quality gate</h2>
<p>Before any prompt is saved or used in a pipeline, Terrivio's quality gate scores it against a rubric: role/persona presence, specificity (numbers, format constraints), outcome clarity, and buzzword penalties. A prompt scoring below 70 is automatically rewritten.</p>
<p>This means the batch output you get back is consistently high-quality — not a lottery.</p>

<h2>Next steps</h2>
<p>Try the <a href="/generator">Prompt Generator</a> to build your first signal-based cold email prompt in under 2 minutes. The free tier includes 5 saved prompts — enough to test your first sequence.</p>
    `.trim(),
  },
  {
    slug: "terrivio-vs-chatgpt-for-sales-prompts",
    title: "Terrivio vs ChatGPT for Sales Prompts — What's the Difference?",
    description:
      "ChatGPT can write prompts. So can Terrivio. Here's why the approach — and the output quality — is fundamentally different for Sales and Marketing teams.",
    date: "2026-02-25",
    readingTime: "5 min read",
    category: "Comparison",
    tags: ["chatgpt", "comparison", "sales", "prompt tools"],
    body: `
<h2>The obvious question</h2>
<p>If ChatGPT can write a cold email in 10 seconds, why would you need a dedicated prompt engineering platform?</p>
<p>Fair question. Here's the honest answer: for one-off emails, you probably don't. ChatGPT is fine. The problem appears when you need to:</p>
<ul>
  <li>Generate 500 personalised emails from a CSV of leads</li>
  <li>Maintain consistent tone, structure, and constraints across all of them</li>
  <li>Rotate email styles to avoid domain burn</li>
  <li>Track which prompts produce replies vs silence</li>
  <li>Prevent the quality regression that happens when you iterate prompts ad-hoc</li>
</ul>

<h2>What ChatGPT gives you</h2>
<p>ChatGPT is a brilliant general-purpose reasoning engine. It will write whatever you ask it to write. That's also its weakness for production outbound: it has no opinion on quality, no memory of what worked before, and no way to scale across a dataset without manual copy-paste.</p>

<h2>What Terrivio adds on top</h2>

<h3>1. Signal-based generation</h3>
<p>Instead of "write a cold email", you specify a signal type (job change, funding round, tech stack, company pain) and Terrivio structures the prompt to use that signal as the hook. The result is a prompt that generates personalised emails — not just varied ones.</p>

<h3>2. Quality gate</h3>
<p>Every prompt is scored before it's used. The rubric checks for role/persona, specificity, outcome clarity, and penalises buzzwords. Prompts below 70 are automatically rewritten. ChatGPT has no equivalent — it'll happily produce a prompt with "leverage our synergies" if you don't catch it.</p>

<h3>3. Pipeline Builder</h3>
<p>Upload a CSV of 500 leads. Map columns to prompt variables. Run the pipeline. Get 500 personalised AI prompts back, with the option to export to CSV or push to Clay/Zapier via webhook. ChatGPT requires manual row-by-row work or a custom script.</p>

<h3>4. Email style rotation</h3>
<p>Sending the same email style at volume burns your domain. Terrivio rotates across 6 styles (contrarian, peer-to-peer, minimalist, data-driven, story-led, challenger) across your pipeline steps. ChatGPT writes in whatever style you prompt it to — no rotation, no awareness of volume risk.</p>

<h3>5. Prompt library with analytics</h3>
<p>Every prompt you generate can be saved, tagged, and tracked. When you mark a reply or a booked meeting, it's attached to the prompt that generated it. Over time you build an evidence base for what actually works — ChatGPT has no persistent memory of your results.</p>

<h2>The summary</h2>
<p>ChatGPT is a tool. Terrivio is a system built on top of LLM capabilities, designed specifically for Sales and Marketing teams who need reliable, scalable prompt output — not a conversation interface.</p>
<p>If you're generating more than 20 prompts a week, the structured approach pays for itself in time saved and quality consistency.</p>
    `.trim(),
  },
  {
    slug: "prompt-engineering-pipeline-for-outbound-sales",
    title: "Building a Prompt Engineering Pipeline for Outbound Sales in 2026",
    description:
      "A step-by-step guide to building a repeatable system that turns a CSV of leads into a personalised AI prompt sequence — ready for Clay, Instantly, or Smartlead.",
    date: "2026-02-26",
    readingTime: "8 min read",
    category: "Tutorial",
    tags: ["pipeline", "outbound", "clay", "tutorial", "automation"],
    body: `
<h2>The goal: one CSV in, personalised sequence out</h2>
<p>By the end of this guide you'll have a repeatable pipeline that takes a CSV of leads (with company names, first names, and one signal column) and produces a 3-step personalised email sequence for each row — ready to paste into your sending tool.</p>

<h2>Step 1: Prepare your CSV</h2>
<p>Your CSV needs at minimum:</p>
<ul>
  <li><code>first_name</code></li>
  <li><code>company</code></li>
  <li><code>signal</code> — one specific, observable fact (e.g. "raised Series B in Jan 2026", "recently moved to HubSpot", "hired 3 AEs this quarter")</li>
  <li><code>website</code> — optional but powerful (Terrivio scrapes it for offer context)</li>
</ul>
<p>You can source signals from Apollo, Clay, LinkedIn Sales Navigator, or Crunchbase exports. Even a basic CSV with company name and industry works — the pipeline will generate reasonable prompts with less personalisation.</p>

<h2>Step 2: Upload to Pipeline Builder</h2>
<p>In Terrivio, navigate to <strong>Pipeline → Upload CSV</strong>. The field mapper automatically detects <code>first_name</code>, <code>company</code>, <code>email</code>, and website columns. For non-standard column names (e.g. "Corp" instead of "company") you can manually remap.</p>

<h2>Step 3: Choose your workflow template</h2>
<p>Templates define the 3 steps your pipeline will generate:</p>
<ul>
  <li><strong>SaaS Outbound</strong>: Initial contact → Value proof → Breakup</li>
  <li><strong>Agency Pitch</strong>: Problem → Case study → CTA</li>
  <li><strong>Product Launch</strong>: Announcement → Feature highlight → Trial offer</li>
</ul>
<p>You can also define a custom workflow with your own step names and prompts.</p>

<h2>Step 4: Set your business context</h2>
<p>Enter your website URL and Terrivio will scrape your offer — product name, value proposition, ICP, pricing — and inject it into every prompt as context. This is what makes the output feel like it was written by someone who knows your product, not a generic AI.</p>

<h2>Step 5: Run the pipeline</h2>
<p>Hit Run. Terrivio generates a prompt for each row × each step. For a 100-row CSV with 3 steps, that's 300 prompts. Each one has the company signal in the hook, your offer context in the value proposition, and the step-specific structure (initial / follow-up / breakup).</p>
<p>The quality gate runs on each prompt. Any that score below 70 are automatically rewritten before being included in the output.</p>

<h2>Step 6: Export or webhook</h2>
<p>Two options:</p>
<ul>
  <li><strong>Download CSV</strong>: Three columns per step — <code>step_1_prompt</code>, <code>step_2_prompt</code>, <code>step_3_prompt</code> — ready to import into Instantly, Smartlead, or Lemlist</li>
  <li><strong>Send to Clay</strong>: Webhook to your Clay table, which can then run the prompts through Claude or GPT-4o and populate the email body directly</li>
</ul>

<h2>Pro tip: enable CO-STAR mode</h2>
<p>In Step 5 of the pipeline, toggle on <strong>CO-STAR Mode</strong>. This restructures every prompt into the CO-STAR framework (Context, Objective, Style, Tone, Audience, Response), which produces more structurally consistent output from GPT-4o and Claude — especially useful for longer, more nuanced emails.</p>

<h2>The result</h2>
<p>A reusable pipeline template you can run against any new CSV. The next time you have 200 new leads from a conference or Apollo export, you upload, run, and export in under 10 minutes.</p>
<p>That's the compounding value of building a system rather than writing one-off prompts.</p>
    `.trim(),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

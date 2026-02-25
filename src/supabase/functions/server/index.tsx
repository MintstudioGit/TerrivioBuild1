import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const DEFAULT_RATE_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT = 60;
const PIPELINE_RATE_LIMIT = 12;

const ORIGIN_ENV = Deno.env.get("CORS_ORIGINS");
const ALLOWED_ORIGINS = ORIGIN_ENV ? ORIGIN_ENV.split(",").map((o) => o.trim()).filter(Boolean) : ["*"];
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") || "").split(",").map((e) => e.trim()).filter(Boolean);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: ALLOWED_ORIGINS.length === 1 ? ALLOWED_ORIGINS[0] : ALLOWED_ORIGINS,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Trace id middleware
app.use("*", async (c, next) => {
  const traceId = crypto.randomUUID();
  c.set("traceId", traceId);
  c.header("x-trace-id", traceId);
  await next();
});

// Helper to get user from auth header
async function getUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || ''
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  return user;
}

async function requireUser(c: any) {
  const user = await getUser(c);
  if (!user) {
    return null;
  }
  return user;
}

function jsonOk(c: any, data: any, status = 200) {
  return c.json({ ok: true, data, traceId: c.get("traceId") }, status);
}

function jsonError(c: any, status: number, code: string, message: string, details?: any) {
  return c.json({ ok: false, code, message, details, traceId: c.get("traceId") }, status);
}

async function parseJson(c: any) {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

function zodFail(c: any, error: z.ZodError) {
  return jsonError(c, 422, "VALIDATION_ERROR", "Invalid request payload.", error.flatten());
}

async function enforceRateLimit(key: string, limit: number, windowMs = DEFAULT_RATE_WINDOW_MS) {
  const now = Date.now();
  const existing = await kv.get(key).catch(() => null);
  if (!existing || typeof existing !== "object") {
    await kv.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  const { count, resetAt } = existing as { count: number; resetAt: number };
  if (now > resetAt) {
    await kv.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (count >= limit) {
    return { ok: false, remaining: 0, resetAt };
  }
  await kv.set(key, { count: count + 1, resetAt });
  return { ok: true, remaining: limit - (count + 1), resetAt };
}

async function requireRateLimit(c: any, key: string, limit: number, windowMs?: number) {
  const res = await enforceRateLimit(key, limit, windowMs);
  c.header("x-rate-limit-remaining", String(res.remaining));
  c.header("x-rate-limit-reset", String(res.resetAt));
  if (!res.ok) {
    return jsonError(c, 429, "RATE_LIMITED", "Too many requests. Please slow down.");
  }
  return null;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashApiKey(key: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return toHex(digest);
}

function buildApiKey(prefix = "trv") {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return `${prefix}_${raw}`;
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80),
});

const promptSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().optional(),
  content: z.string().min(1),
  useCase: z.string().optional(),
  signal: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const statusSchema = z.object({
  status: z.enum(["guest", "free", "pro", "team", "agency"]),
});

const outcomeSchema = z.object({
  type: z.string().min(1).max(40),
  note: z.string().max(500).optional(),
});

const apiKeySchema = z.object({
  name: z.string().min(2).max(60),
});

const whiteLabelSchema = z.object({
  companyName: z.string().max(120).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  customDomain: z.string().max(120).optional(),
  hideBranding: z.boolean().optional(),
});

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(2000),
});

const previewSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
  options: z.record(z.any()).optional(),
});

const pipelineSchema = z.object({
  offer: z.record(z.any()).optional(),
  steps: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    framework: z.string().optional(),
    signal: z.string().optional(),
    instruction: z.string().optional(),
  })).min(1),
  rows: z.array(z.record(z.any())).min(1).max(500),
  options: z.object({
    dryRun: z.boolean().optional(),
    maxRetries: z.number().min(0).max(5).optional(),
  }).optional(),
});

// Health check endpoint
app.get("/make-server-a2b5dce9/health", (c) => {
  return jsonOk(c, { status: "ok" });
});

// --- Auth Routes (Sign Up) ---
// Note: Sign In is handled client-side via Supabase Auth, but we can have a helper for SignUp if we want admin creation,
// but usually client-side signUp is fine. The instructions say "For sign up, you should create a new /signup route in the server."
app.post("/make-server-a2b5dce9/signup", async (c) => {
  const body = await parseJson(c);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);
  const { email, password, name } = parsed.data;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });

  if (error) {
    return jsonError(c, 400, "AUTH_SIGNUP_FAILED", error.message);
  }

  return jsonOk(c, data);
});


// --- Prompts CRUD ---

// List Prompts
app.get("/make-server-a2b5dce9/prompts", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:prompts:list`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  // Fetch all keys for this user
  const prefix = `user:${user.id}:prompt:`;
  const prompts = await kv.getByPrefix(prefix);
  
  // Sort by lastModified desc
  prompts.sort((a: any, b: any) => (b.lastModified || 0) - (a.lastModified || 0));

  return jsonOk(c, prompts);
});

// Create Prompt
app.post("/make-server-a2b5dce9/prompts", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:prompts:create`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  // Check user status and enforce limit for non-pro users
  const statusKey = `user:${user.id}:status`;
  const userStatus = await kv.get(statusKey) || "free";

  if (userStatus !== "pro") {
    const prefix = `user:${user.id}:prompt:`;
    const prompts = await kv.getByPrefix(prefix);
    if (prompts.length >= 5) {
      return jsonError(
        c,
        403,
        "LIMIT_REACHED",
        "Free users are limited to 5 prompts. Please upgrade to Pro to save more."
      );
    }
  }

  const body = await parseJson(c);
  const parsed = promptSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const id = crypto.randomUUID();
  const newPrompt = {
    ...parsed.data,
    id,
    userId: user.id,
    lastModified: Date.now()
  };

  const key = `user:${user.id}:prompt:${id}`;
  await kv.set(key, newPrompt);

  return jsonOk(c, newPrompt, 201);
});

// Update Prompt
app.put("/make-server-a2b5dce9/prompts/:id", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:prompts:update`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const id = c.req.param("id");
  const body = await parseJson(c);
  const parsed = promptSchema.partial().safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const key = `user:${user.id}:prompt:${id}`;
  const existing = await kv.get(key);

  if (!existing) return jsonError(c, 404, "NOT_FOUND", "Prompt not found");

  const updatedPrompt = {
    ...existing,
    ...parsed.data,
    id, // Ensure ID doesn't change
    userId: user.id,
    lastModified: Date.now()
  };

  await kv.set(key, updatedPrompt);

  return jsonOk(c, updatedPrompt);
});

// Delete Prompt
app.delete("/make-server-a2b5dce9/prompts/:id", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:prompts:delete`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const id = c.req.param("id");
  const key = `user:${user.id}:prompt:${id}`;

  await kv.del(key);

  return jsonOk(c, { success: true });
});

// --- User Status Management (Simulating Subscription) ---

// Get User Status
app.get("/make-server-a2b5dce9/user-status", async (c) => {
  const user = await getUser(c);
  if (!user) return jsonOk(c, { status: "guest" });

  const key = `user:${user.id}:status`;
  const status = await kv.get(key);

  return jsonOk(c, { status: status || "free" }); // Default to free if logged in but no status set
});

// Set User Status (Simulating Webhook/Admin Action)
app.post("/make-server-a2b5dce9/user-status", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");

  const body = await parseJson(c);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);
  const { status } = parsed.data;

  const key = `user:${user.id}:status`;
  await kv.set(key, status);

  return jsonOk(c, { status });
});

// --- Outcome Tracking ---

app.post("/make-server-a2b5dce9/prompts/:id/outcome", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:prompts:outcome`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const id = c.req.param("id");
  const body = await parseJson(c);
  const parsed = outcomeSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);
  const { type, note } = parsed.data; // type: "Reply", "Booked", "Closed", etc.

  const key = `user:${user.id}:prompt:${id}`;
  const prompt = await kv.get(key);

  if (!prompt) return jsonError(c, 404, "NOT_FOUND", "Prompt not found");

  const outcome = {
    type,
    note,
    timestamp: Date.now()
  };

  const updatedPrompt = {
    ...prompt,
    outcomes: [...(prompt.outcomes || []), outcome],
    lastModified: Date.now() // Bump modification to show recent activity
  };

  await kv.set(key, updatedPrompt);

  return jsonOk(c, updatedPrompt);
});

// --- API Keys ---

app.get("/make-server-a2b5dce9/api-keys", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:apikeys:list`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const prefix = `user:${user.id}:apikey:`;
  const keys = await kv.getByPrefix(prefix);
  const safe = (keys || []).map((k: any) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed ?? null,
  }));
  return jsonOk(c, { keys: safe });
});

app.post("/make-server-a2b5dce9/api-keys", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:apikeys:create`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const body = await parseJson(c);
  const parsed = apiKeySchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const rawKey = buildApiKey();
  const hash = await hashApiKey(rawKey);
  const id = crypto.randomUUID();
  const prefix = rawKey.split("_")[0];
  const createdAt = new Date().toISOString();

  const record = {
    id,
    name: parsed.data.name,
    prefix,
    createdAt,
    lastUsed: null,
    hash,
  };

  await kv.set(`user:${user.id}:apikey:${id}`, record);
  await kv.set(`apikey:${hash}`, { userId: user.id, id });

  return jsonOk(c, { key: rawKey }, 201);
});

app.delete("/make-server-a2b5dce9/api-keys/:id", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:apikeys:delete`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const id = c.req.param("id");
  const record = await kv.get(`user:${user.id}:apikey:${id}`);
  if (!record) return jsonError(c, 404, "NOT_FOUND", "API key not found");

  await kv.del(`user:${user.id}:apikey:${id}`);
  if (record.hash) {
    await kv.del(`apikey:${record.hash}`);
  }
  return jsonOk(c, { success: true });
});

// --- White Label ---

app.get("/make-server-a2b5dce9/white-label", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const config = await kv.get(`user:${user.id}:white-label`);
  return jsonOk(c, { config: config || {} });
});

app.put("/make-server-a2b5dce9/white-label", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");

  const body = await parseJson(c);
  const parsed = whiteLabelSchema.safeParse(body?.config ?? body);
  if (!parsed.success) return zodFail(c, parsed.error);

  await kv.set(`user:${user.id}:white-label`, parsed.data);
  return jsonOk(c, { config: parsed.data });
});

// --- Preview Prompt ---

app.post("/make-server-a2b5dce9/preview-prompt", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");
  const rl = await requireRateLimit(c, `rate:${user.id}:preview`, DEFAULT_RATE_LIMIT);
  if (rl) return rl;

  const body = await parseJson(c);
  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const summary = parsed.data.prompt.slice(0, 400);
  const result = `Preview (model=${parsed.data.model || "default"}): ${summary}${parsed.data.prompt.length > 400 ? "..." : ""}`;
  return jsonOk(c, { output: result });
});

// --- Contact ---

app.post("/make-server-a2b5dce9/contact", async (c) => {
  const body = await parseJson(c);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const record = {
    ...parsed.data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await kv.set(`contact:${record.createdAt}:${record.id}`, record);
  return jsonOk(c, { received: true });
});

// --- Pipeline API (API key auth) ---

async function getUserFromApiKey(key: string | null) {
  if (!key) return null;
  const hash = await hashApiKey(key);
  const record = await kv.get(`apikey:${hash}`);
  if (!record) return null;
  return { ...record, hash } as { userId: string; id: string; hash: string };
}

function scoreFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100;
  }
  return Math.max(40, hash);
}

app.post("/make-server-a2b5dce9/pipeline/run", async (c) => {
  const authHeader = c.req.header("Authorization");
  const apiKey = c.req.header("x-api-key") || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
  const apiRecord = await getUserFromApiKey(apiKey);
  if (!apiRecord) return jsonError(c, 401, "UNAUTHORIZED", "Invalid API key.");

  const rl = await requireRateLimit(c, `rate:${apiRecord.userId}:pipeline:run`, PIPELINE_RATE_LIMIT);
  if (rl) return rl;

  const body = await parseJson(c);
  const parsed = pipelineSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  const results = parsed.data.rows.map((row, idx) => {
    const outputs = parsed.data.steps.map((step) => {
      const label = step.name || step.id;
      const context = row.company || row.name || row.email || "lead";
      const text = `${label} output for ${context}`;
      return {
        stepId: step.id,
        stepName: label,
        output: text,
        qualityScore: scoreFromString(text),
      };
    });
    return {
      rowIndex: idx,
      input: row,
      outputs,
    };
  });

  const response = {
    runId,
    status: "completed",
    startedAt,
    completedAt: new Date().toISOString(),
    rowCount: results.length,
    results,
  };

  const keyRecord = await kv.get(`user:${apiRecord.userId}:apikey:${apiRecord.id}`);
  if (keyRecord) {
    await kv.set(`user:${apiRecord.userId}:apikey:${apiRecord.id}`, {
      ...keyRecord,
      lastUsed: new Date().toISOString(),
    });
  }
  await kv.set(`pipeline:${apiRecord.userId}:${runId}`, response);
  return jsonOk(c, response, 201);
});

// ─── Enrichment Waterfall ─────────────────────────────────────────────────────
// Calls third-party enrichment APIs server-side (keys never exposed to client).
// Sources: linkedin | tech | jobs | news
// Env vars required:
//   PROXYCURL_API_KEY   — https://nubela.co/proxycurl (LinkedIn company lookup)
//   BUILTWITH_API_KEY   — https://api.builtwith.com   (tech stack detection)
//   NEWSAPI_KEY         — https://newsapi.org          (recent news)
//   APIFY_API_KEY       — https://apify.com            (job postings)

const enrichSchema = z.object({
  domain: z.string().min(3).max(255),
  sources: z.array(z.enum(["linkedin", "tech", "jobs", "news"])).min(1).max(4),
});

// --- LinkedIn (Proxycurl) ---
async function fetchLinkedIn(domain: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("PROXYCURL_API_KEY");
  if (!apiKey) return { error: "PROXYCURL_API_KEY not set" };

  const url = `https://nubela.co/proxycurl/api/linkedin/company/resolve?company_domain=${encodeURIComponent(domain)}&company_location=GLOBAL`;
  const resolveRes = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!resolveRes.ok) return { error: `Proxycurl resolve failed: ${resolveRes.status}` };
  const resolved = await resolveRes.json() as { url?: string };

  if (!resolved.url) return { error: "Could not resolve LinkedIn URL" };

  const profileRes = await fetch(
    `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(resolved.url)}&extra=include`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!profileRes.ok) return { error: `Proxycurl profile failed: ${profileRes.status}` };

  const p = await profileRes.json() as Record<string, unknown>;
  const headcountRaw = (p.company_size_on_linkedin ?? p.staff_count) as number | undefined;

  const headcountBucket = !headcountRaw
    ? undefined
    : headcountRaw <= 10 ? "1-10"
    : headcountRaw <= 50 ? "11-50"
    : headcountRaw <= 200 ? "51-200"
    : headcountRaw <= 500 ? "201-500"
    : headcountRaw <= 2000 ? "501-2000"
    : "2000+";

  const recentPost = Array.isArray(p.updates) && p.updates.length > 0
    ? ((p.updates[0] as Record<string, unknown>).text as string | undefined)?.slice(0, 300)
    : undefined;

  return {
    headcount: headcountBucket,
    headcount_raw: headcountRaw,
    industry: p.industries?.[0] ?? p.industry,
    description: (p.description as string | undefined)?.slice(0, 400),
    recent_post: recentPost,
    recent_post_age_days: undefined,
    followers: p.follower_count,
    founded: p.founded_on ? (p.founded_on as Record<string, unknown>).year : undefined,
    linkedin_url: resolved.url,
    hq: p.hq ? `${(p.hq as Record<string, unknown>).city ?? ""}, ${(p.hq as Record<string, unknown>).country ?? ""}`.trim().replace(/^,\s*/, "") : undefined,
  };
}

// --- Tech Stack (BuiltWith) ---
async function fetchTechStack(domain: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("BUILTWITH_API_KEY");
  if (!apiKey) return { error: "BUILTWITH_API_KEY not set" };

  const url = `https://api.builtwith.com/v21/api.json?KEY=${apiKey}&LOOKUP=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  if (!res.ok) return { error: `BuiltWith failed: ${res.status}` };

  const data = await res.json() as Record<string, unknown>;
  const results = (data.Results as unknown[]) ?? [];
  if (results.length === 0) return { error: "No BuiltWith results" };

  // Flatten all tech names from all result paths
  const techNames: string[] = [];
  for (const result of results) {
    const paths = ((result as Record<string, unknown>).Paths as unknown[]) ?? [];
    for (const path of paths) {
      const technologies = ((path as Record<string, unknown>).Technologies as unknown[]) ?? [];
      for (const t of technologies) {
        const name = (t as Record<string, unknown>).Name as string | undefined;
        if (name) techNames.push(name);
      }
    }
  }

  // Classify key categories
  const lower = techNames.map(n => n.toLowerCase());
  const crm = techNames.find(n => /salesforce|hubspot|pipedrive|dynamics|zoho crm/i.test(n));
  const map_ = techNames.find(n => /marketo|pardot|eloqua|hubspot|mailchimp|active campaign/i.test(n));
  const se = techNames.find(n => /outreach|salesloft|apollo|groove|yesware|gong/i.test(n));
  const analytics = techNames.find(n => /google analytics|segment|amplitude|mixpanel|heap/i.test(n));

  const maturity = (crm && se) ? "enterprise"
    : (crm || map_) ? "modern"
    : "basic";

  return {
    technologies: techNames.slice(0, 30),
    crm: crm ?? undefined,
    map: map_ ?? undefined,
    sales_engagement: se ?? undefined,
    analytics: analytics ?? undefined,
    maturity,
  };
}

// --- Job Postings (Apify LinkedIn scraper) ---
async function fetchJobPostings(domain: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("APIFY_API_KEY");
  if (!apiKey) return { error: "APIFY_API_KEY not set" };

  // Use Apify's LinkedIn Jobs scraper task
  const taskInput = {
    search: domain,
    location: "",
    maxItems: 25,
    extendOutputFunction: "($) => { return {} }",
  };

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/runs?token=${apiKey}&timeout=30&memory=512`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskInput),
    }
  );
  if (!runRes.ok) return { error: `Apify run failed: ${runRes.status}` };

  const run = await runRes.json() as { data: { id: string } };
  const runId = run.data?.id;
  if (!runId) return { error: "No Apify run ID" };

  // Poll for completion (max 25s, 2s intervals)
  let items: unknown[] = [];
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 2500));
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
    const statusData = await statusRes.json() as { data: { status: string } };
    if (statusData.data?.status === "SUCCEEDED") {
      const itemsRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}&limit=25`);
      items = await itemsRes.json() as unknown[];
      break;
    }
    if (statusData.data?.status === "FAILED" || statusData.data?.status === "ABORTED") {
      return { error: "Apify job failed" };
    }
  }

  if (items.length === 0) return { error: "No job postings found" };

  // Process jobs
  const depts = { sales: 0, marketing: 0, engineering: 0, product: 0, ops: 0, hr: 0, other: 0 };
  const techMentioned = new Set<string>();
  const jobs = [];

  for (const item of items as Record<string, unknown>[]) {
    const title = (item.title as string ?? "").toLowerCase();
    const desc = (item.description as string ?? "").toLowerCase();

    let dept: keyof typeof depts = "other";
    if (/sales|sdr|account exec|ae |bdr|revenue/.test(title)) dept = "sales";
    else if (/marketing|growth|demand gen|content/.test(title)) dept = "marketing";
    else if (/engineer|developer|backend|frontend|full.?stack/.test(title)) dept = "engineering";
    else if (/product manager|product owner|pm /i.test(title)) dept = "product";
    else if (/ops|operations|analyst/.test(title)) dept = "ops";
    else if (/recruiter|hr |people/.test(title)) dept = "hr";
    depts[dept]++;

    // Tech mentions in job descriptions
    const techPatterns = ["salesforce", "hubspot", "outreach", "salesloft", "apollo", "gong", "python", "react", "typescript", "aws", "gcp", "azure", "postgres"];
    for (const tech of techPatterns) {
      if (desc.includes(tech)) techMentioned.add(tech);
    }

    jobs.push({
      title: item.title as string,
      department: dept,
      count: 1,
      inferred_signals: dept === "sales" ? ["outbound push", "pipeline growth priority"] : [],
    });
  }

  return {
    jobs,
    total_open: items.length,
    is_hiring_sales: depts.sales > 0,
    is_hiring_engineers: depts.engineering > 0,
    is_hiring_marketing: depts.marketing > 0,
    tech_mentioned: [...techMentioned],
  };
}

// --- News (NewsAPI) ---
async function fetchNews(domain: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("NEWSAPI_KEY");
  if (!apiKey) return { error: "NEWSAPI_KEY not set" };

  // Search by domain name (strip TLD for broader match)
  const companyName = domain.split(".")[0];
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(`"${companyName}"`)}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return { error: `NewsAPI failed: ${res.status}` };

  const data = await res.json() as { articles?: unknown[] };
  const articles = (data.articles ?? []).map((a) => {
    const art = a as Record<string, unknown>;
    const title = (art.title as string ?? "");
    const publishedAt = art.publishedAt as string ?? new Date().toISOString();
    const recencyDays = Math.floor((Date.now() - new Date(publishedAt).getTime()) / 86400000);

    let type = "other";
    if (/fund|raise|series [a-e]|invest|round/i.test(title)) type = "funding";
    else if (/launch|release|announc|introduc|new product/i.test(title)) type = "launch";
    else if (/appoint|hire|join|new ceo|new cto|promoted/i.test(title)) type = "leadership";
    else if (/partner|integrat|deal/i.test(title)) type = "partnership";

    return {
      title: title.slice(0, 200),
      date: publishedAt,
      type,
      summary: (art.description as string | undefined)?.slice(0, 200),
      source: (art.source as Record<string, unknown>)?.name,
      recency_days: recencyDays,
    };
  });

  const topSignal = articles[0];
  const recencyDays = topSignal ? (topSignal as Record<string, unknown>).recency_days as number : undefined;

  return {
    articles,
    top_signal: topSignal ?? null,
    recency_days: recencyDays,
  };
}

// --- Route ---
app.post("/make-server-a2b5dce9/enrich-company", async (c) => {
  const user = await requireUser(c);
  if (!user) return jsonError(c, 401, "UNAUTHORIZED", "Unauthorized");

  const rl = await requireRateLimit(c, `rate:${user.id}:enrich`, 20);
  if (rl) return rl;

  const body = await parseJson(c);
  const parsed = enrichSchema.safeParse(body);
  if (!parsed.success) return zodFail(c, parsed.error);

  const { domain, sources } = parsed.data;

  // Run all requested sources in parallel (failures are isolated)
  const [linkedinRaw, techRaw, jobsRaw, newsRaw] = await Promise.allSettled([
    sources.includes("linkedin") ? fetchLinkedIn(domain) : Promise.resolve(null),
    sources.includes("tech") ? fetchTechStack(domain) : Promise.resolve(null),
    sources.includes("jobs") ? fetchJobPostings(domain) : Promise.resolve(null),
    sources.includes("news") ? fetchNews(domain) : Promise.resolve(null),
  ]);

  const result = {
    linkedin: linkedinRaw.status === "fulfilled" ? linkedinRaw.value : { error: (linkedinRaw as PromiseRejectedResult).reason?.message },
    tech: techRaw.status === "fulfilled" ? techRaw.value : { error: (techRaw as PromiseRejectedResult).reason?.message },
    jobs: jobsRaw.status === "fulfilled" ? jobsRaw.value : { error: (jobsRaw as PromiseRejectedResult).reason?.message },
    news: newsRaw.status === "fulfilled" ? newsRaw.value : { error: (newsRaw as PromiseRejectedResult).reason?.message },
  };

  return jsonOk(c, result);
});

Deno.serve(app.fetch);

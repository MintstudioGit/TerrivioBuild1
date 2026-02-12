import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

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

// Health check endpoint
app.get("/make-server-a2b5dce9/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Auth Routes (Sign Up) ---
// Note: Sign In is handled client-side via Supabase Auth, but we can have a helper for SignUp if we want admin creation,
// but usually client-side signUp is fine. The instructions say "For sign up, you should create a new /signup route in the server."
app.post("/make-server-a2b5dce9/signup", async (c) => {
  const body = await c.req.json();
  const { email, password, name } = body;

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
    return c.json({ error: error.message }, 400);
  }

  return c.json({ data });
});


// --- Prompts CRUD ---

// List Prompts
app.get("/make-server-a2b5dce9/prompts", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  // Fetch all keys for this user
  const prefix = `user:${user.id}:prompt:`;
  const prompts = await kv.getByPrefix(prefix);
  
  // Sort by lastModified desc
  prompts.sort((a: any, b: any) => (b.lastModified || 0) - (a.lastModified || 0));

  return c.json({ data: prompts });
});

// Create Prompt
app.post("/make-server-a2b5dce9/prompts", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  // Check user status and enforce limit for non-pro users
  const statusKey = `user:${user.id}:status`;
  const userStatus = await kv.get(statusKey) || "free";

  if (userStatus !== "pro") {
    const prefix = `user:${user.id}:prompt:`;
    const prompts = await kv.getByPrefix(prefix);
    if (prompts.length >= 5) {
      return c.json({ 
        error: "Limit Reached", 
        message: "Free users are limited to 5 prompts. Please upgrade to Pro to save more.",
        code: "LIMIT_REACHED"
      }, 403);
    }
  }

  const body = await c.req.json();
  // Validate body if needed
  
  const id = crypto.randomUUID();
  const newPrompt = {
    ...body,
    id,
    userId: user.id,
    lastModified: Date.now()
  };

  const key = `user:${user.id}:prompt:${id}`;
  await kv.set(key, newPrompt);

  return c.json({ data: newPrompt });
});

// Update Prompt
app.put("/make-server-a2b5dce9/prompts/:id", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const body = await c.req.json();

  const key = `user:${user.id}:prompt:${id}`;
  const existing = await kv.get(key);

  if (!existing) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  const updatedPrompt = {
    ...existing,
    ...body,
    id, // Ensure ID doesn't change
    userId: user.id,
    lastModified: Date.now()
  };

  await kv.set(key, updatedPrompt);

  return c.json({ data: updatedPrompt });
});

// Delete Prompt
app.delete("/make-server-a2b5dce9/prompts/:id", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const key = `user:${user.id}:prompt:${id}`;

  await kv.del(key);

  return c.json({ success: true });
});

// --- User Status Management (Simulating Subscription) ---

// Get User Status
app.get("/make-server-a2b5dce9/user-status", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ status: "guest" });

  const key = `user:${user.id}:status`;
  const status = await kv.get(key);

  return c.json({ status: status || "free" }); // Default to free if logged in but no status set
});

// Set User Status (Simulating Webhook/Admin Action)
app.post("/make-server-a2b5dce9/user-status", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { status } = body;

  if (!['guest', 'free', 'pro'].includes(status)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const key = `user:${user.id}:status`;
  await kv.set(key, status);

  return c.json({ status });
});

// --- Outcome Tracking ---

app.post("/make-server-a2b5dce9/prompts/:id/outcome", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const body = await c.req.json();
  const { type, note } = body; // type: "Reply", "Booked", "Closed", etc.

  const key = `user:${user.id}:prompt:${id}`;
  const prompt = await kv.get(key);

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

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

  return c.json({ data: updatedPrompt });
});

Deno.serve(app.fetch);

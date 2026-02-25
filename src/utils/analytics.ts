/**
 * Analytics — PostHog wrapper
 *
 * Usage:
 *   import { analytics } from "@/utils/analytics";
 *   analytics.track("prompt_generated", { category: "Sales", signal: "Conversion" });
 *   analytics.page();   // call on route change
 *
 * Env-var: VITE_POSTHOG_KEY (set in .env.local)
 * If the key is absent the module is a silent no-op, so local dev never
 * sends events unless you explicitly set it.
 */

import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
  "https://eu.i.posthog.com";

let initialised = false;

function init() {
  if (initialised || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only", // GDPR-friendly default
    capture_pageview: false,            // we call page() manually on route change
    capture_pageleave: true,
    autocapture: false,                 // only explicit track() calls
    persistence: "localStorage",
  });
  initialised = true;
}

export const analytics = {
  /** Call once after the user signs in or is identified */
  identify(userId: string, traits?: Record<string, unknown>) {
    init();
    if (!POSTHOG_KEY) return;
    posthog.identify(userId, traits);
  },

  /** Call on every route change */
  page(pageName?: string) {
    init();
    if (!POSTHOG_KEY) return;
    posthog.capture("$pageview", pageName ? { page: pageName } : undefined);
  },

  /** Track a named event with optional properties */
  track(event: string, properties?: Record<string, unknown>) {
    init();
    if (!POSTHOG_KEY) return;
    posthog.capture(event, properties);
  },

  /** Call when the user signs out */
  reset() {
    if (!POSTHOG_KEY) return;
    posthog.reset();
  },
};

// ─── Standard event names (use these instead of freeform strings) ───────────
export const EVENTS = {
  // Auth
  SIGNED_UP:           "signed_up",
  SIGNED_IN:           "signed_in",
  SIGNED_OUT:          "signed_out",
  // Generator
  PROMPT_GENERATED:    "prompt_generated",
  PROMPT_SAVED:        "prompt_saved",
  PROMPT_COPIED:       "prompt_copied",
  // Preview
  PREVIEW_RUN:         "preview_run",
  PREVIEW_OUTPUT_COPIED: "preview_output_copied",
  PREVIEW_SAVED:       "preview_saved",
  // Pipeline
  PIPELINE_STARTED:    "pipeline_started",
  PIPELINE_COMPLETED:  "pipeline_completed",
  PIPELINE_EXPORTED:   "pipeline_exported",
  PIPELINE_WEBHOOK_SENT: "pipeline_webhook_sent",
  // Upgrade
  UPGRADE_CLICKED:     "upgrade_clicked",
  CHECKOUT_STARTED:    "checkout_started",
  // Contact
  CONTACT_SUBMITTED:   "contact_submitted",
} as const;

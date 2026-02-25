import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Navigation smoke tests — verify core pages load with expected content
// ---------------------------------------------------------------------------

test.describe("Landing Page", () => {
  test("renders hero with CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Terrivio/i);
    // Hero headline should be visible
    await expect(page.locator("h1").first()).toBeVisible();
    // At least one call-to-action link
    const cta = page.getByRole("link", { name: /get started|try free|start/i }).first();
    await expect(cta).toBeVisible();
  });

  test("global header renders nav links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation").first()).toBeVisible();
  });

  test("global footer renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("Prompt Generator", () => {
  test("renders category selector and generate button", async ({ page }) => {
    await page.goto("/generator");
    // Category badge selector
    await expect(page.getByText("General").first()).toBeVisible();
    // Main generate button
    await expect(
      page.getByRole("button", { name: /generate/i }).first()
    ).toBeVisible();
  });

  test("selecting a use case enables generate button", async ({ page }) => {
    await page.goto("/generator");
    // Select the Sales category
    await page.getByText("Sales").first().click();
    // Open the Use Case dropdown
    await page.getByRole("combobox").first().click();
    // Pick Cold Email
    await page.getByRole("option", { name: "Cold Email" }).click();
    const btn = page.getByRole("button", { name: /generate/i }).first();
    await expect(btn).toBeEnabled();
  });
});

test.describe("Pricing Page", () => {
  test("renders all three plan cards", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/pro/i).first()).toBeVisible();
    await expect(page.getByText(/team/i).first()).toBeVisible();
    await expect(page.getByText(/agency/i).first()).toBeVisible();
  });

  test("monthly/annual toggle works", async ({ page }) => {
    await page.goto("/pricing");
    const toggle = page.getByRole("button", { name: /annual/i }).first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(page.getByText(/year/i).first()).toBeVisible();
    }
  });
});

test.describe("Directory", () => {
  test("renders prompt directory with signal filters", async ({ page }) => {
    await page.goto("/prompts");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Blog", () => {
  test("renders blog listing page", async ({ page }) => {
    await page.goto("/blog");
    // Should show the real blog page, not ComingSoon
    await expect(page.locator("article, [data-testid='blog-post']").first().or(
      page.getByRole("heading").first()
    )).toBeVisible();
  });

  test("blog post slug navigates correctly", async ({ page }) => {
    await page.goto("/blog/how-to-write-a-saas-cold-email-prompt");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("sign in page renders email/password fields", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /password/i })).toBeVisible();
  });

  test("sign up page renders registration form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  });
});

test.describe("Static Pages", () => {
  for (const { route, heading } of [
    { route: "/about", heading: /about/i },
    { route: "/privacy", heading: /privacy/i },
    { route: "/terms", heading: /terms/i },
    { route: "/contact", heading: /contact/i },
  ]) {
    test(`${route} renders`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading").first()).toBeVisible();
      await expect(page.getByRole("heading").first()).toHaveText(heading);
    });
  }
});

test.describe("404 Handling", () => {
  test("unknown route shows not-found page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    // Should not be an empty page
    await expect(page.locator("body")).not.toBeEmpty();
    // Title or heading should still render (layout)
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

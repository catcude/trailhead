import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. The runnable spec here is the no-auth interactive hero (WS8) —
 * it needs no Supabase/Stripe/LLM keys, so it runs anywhere. The authed flows
 * (full Green/Yellow, evening, fallbacks, habits, quiz, paywall, resume) are
 * documented in docs/content-review/m2-for-cat.md and run against a preview
 * with real Supabase auth, recorded in the PR.
 *
 * Chromium is pre-installed in this environment; executablePath points at it
 * so we never trigger a download.
 */
const PORT = 3100;
// Locally, use the pre-installed Chromium (no download). In CI, leave it unset
// so Playwright uses the browser installed by `playwright install chromium`.
const explicit = process.env.PLAYWRIGHT_CHROMIUM;
const executablePath =
  explicit && explicit.length > 0
    ? explicit
    : process.env.CI
      ? undefined
      : "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath },
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});

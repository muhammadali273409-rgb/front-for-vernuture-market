import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests against a running stack: the backend (docker-compose or
 * `npm run start:dev`) and this app (`next start -p 3001` with API_URL
 * pointing at the backend). See e2e/README.md.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    // Uses the installed Chrome; set E2E_BROWSER_CHANNEL="" to use Playwright's Chromium.
    channel: process.env.E2E_BROWSER_CHANNEL ?? "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});

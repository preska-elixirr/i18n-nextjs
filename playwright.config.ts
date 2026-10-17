import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3215",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  reporter: "list",
});


import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Trailing slash matters: goto('index.htm') resolves under /parabank/.
// A leading slash in page.goto('/index.htm') would drop the /parabank path segment.
const configuredBase = process.env.BASE_URL ?? 'https://parabank.parasoft.com/parabank';
const baseURL = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
const isCI = !!process.env.CI;
// Default to 1 worker against the shared Cloudflare-fronted demo to reduce 1015 rate limits.
const workers = process.env.WORKERS ? Number(process.env.WORKERS) : 1;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  // CI emits blob reports per shard/project so Jobs can merge Chromium+Firefox+WebKit (+ smoke).
  reporter: isCI
    ? [['list'], ['blob', { outputDir: 'blob-report' }]]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ],
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'smoke',
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      grepInvert: /@smoke|@quarantine/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      grepInvert: /@smoke|@quarantine/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      grepInvert: /@smoke|@quarantine/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});

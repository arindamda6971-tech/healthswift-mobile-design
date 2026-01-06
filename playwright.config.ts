import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'test/e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    actionTimeout: 5000,
  },
  // Only spawn the dev server in CI. Locally we prefer reusing an already-running server
  webServer: process.env.CI === 'true' ? {
    command: 'pnpm dev',
    url: process.env.BASE_URL || 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  } : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

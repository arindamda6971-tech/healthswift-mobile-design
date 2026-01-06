import { test, expect } from '@playwright/test';

test('trace console and network requests on load', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (msg) => messages.push(`${msg.type()}: ${msg.text()}`));
  const failedRequests: { url: string }[] = [];
  page.on('requestfailed', (req) => failedRequests.push({ url: req.url() }));

  await page.goto('/');
  await page.waitForTimeout(1200);

  console.log('console messages:', messages.slice(0, 50));
  console.log('failed requests:', failedRequests.slice(0, 50));

  // Check for a known page string
  const hasBrand = await page.locator('text=HealthSwift').count();
  expect(hasBrand).toBeGreaterThan(0);
});

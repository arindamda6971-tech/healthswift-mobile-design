import { test, expect } from '@playwright/test';

test('load root and capture console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  // wait for potential mount
  await page.waitForTimeout(1000);
  const bannerCount = await page.locator('#debug-banner').count();
  const banner = bannerCount > 0 ? await page.locator('#debug-banner').textContent() : '';
  console.log('debug-banner:', banner?.trim());

  expect(errors, 'console errors').toEqual([]);
  expect(banner?.trim() || '', 'debug banner should be empty or removed').toEqual('');
});

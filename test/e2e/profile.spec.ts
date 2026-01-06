import { test, expect } from '@playwright/test';

test('navigate to profile and ensure no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/profile');
  await page.waitForSelector('text=Profile');
  const heading = await page.locator('text=Profile').count();
  expect(heading).toBeGreaterThan(0);
  expect(errors, 'console errors on /profile').toEqual([]);
});

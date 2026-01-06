import { test, expect } from '@playwright/test';

test('categories list loads and category detail shows tests', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/categories');
  await page.waitForSelector('text=Browse by Category');

  // Click the first category card
  const firstCard = page.locator('.category-card').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  // Ensure we navigated to a category page and tests are visible
  await page.waitForSelector('text=Tests in');
  const testsCount = await page.locator('text=Tests in').count();
  expect(testsCount).toBeGreaterThan(0);
  expect(errors, 'console errors on /categories and category detail').toEqual([]);
});
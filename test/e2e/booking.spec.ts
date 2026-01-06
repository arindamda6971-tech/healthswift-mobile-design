import { test, expect } from '@playwright/test';

test('booking flow attempts and fails when unauthenticated', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/categories');
  await page.waitForSelector('text=Browse by Category');

  // Click first category
  const firstCard = page.locator('.category-card').first();
  await firstCard.click();

  // Wait for tests list and click first test
  await page.waitForSelector('text=Tests in');
  const firstTest = page.locator('text=Tests in').locator('..').locator('.soft-card').first();
  if (await firstTest.count() === 0) {
    // fallback: click first test row by selector
    await page.click('.soft-card');
  } else {
    await firstTest.click();
  }

  // Now on test selection - choose a lab and add to cart
  await page.waitForSelector('text=Choose Your Favourite Lab');

  // Click Add on first lab
  const addButtons = page.locator('button:has-text("Add")');
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();

  // Navigate to booking
  await page.goto('/booking');
  await page.waitForSelector('text=Book Appointment');

  // Click Confirm Booking (will attempt to create order but unauthenticated users should receive an error toast)
  await page.click('button:has-text("Confirm Booking")');

  // Wait for error toast text
  await page.waitForSelector('text=Failed to create booking', { timeout: 5000 });

  expect(errors, 'console errors during booking flow').toEqual([]);
});
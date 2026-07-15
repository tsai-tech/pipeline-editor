import { test, expect } from '@playwright/test';

test('the board editor loads', async ({ page }) => {
  await page.goto('/board');

  // The editor host and its always-available toolbar render.
  await expect(page.locator('pe-board')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
});

test('the board playground fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/board');

  await expect(page.locator('pe-board')).toBeVisible();
  await expect(page.getByText('On mobile, tap palette items')).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('the ui kit playground fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui-kit');

  await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

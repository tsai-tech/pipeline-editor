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

test('the pipeline ui kit playground renders composable primitives', async ({
  page,
}) => {
  await page.goto('/pipeline-ui-kit');

  await expect(
    page.getByRole('heading', { name: 'Pipeline UI Kit' }),
  ).toBeVisible();
  await expect(page.locator('pe-board-surface')).toBeVisible();
  await expect(page.locator('pe-pipeline-node')).toHaveCount(3);
  await expect(
    page.locator('pe-pipeline-edge-layer path[marker-end]'),
  ).toHaveCount(2);

  await page.getByText('Webhook').first().click();
  await expect(
    page.getByRole('heading', { name: 'Node Inspector' }),
  ).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('mayor data, event filtering and timezone selection', async ({ page }) => {
  await page.route('**/api/election', route => route.fulfill({ json: { data: { mayor: { name: 'Marina', perks: [{ name: 'Fishing Festival' }] } }, fetchedAt: Date.now() } }));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('イベント予定');
  await expect(page.getByText('Marina', { exact: true })).toBeVisible();
  await page.getByLabel('イベントの種類').selectOption('市長イベント');
  await expect(page.locator('tbody tr')).toHaveCount(12);
  await expect(page.locator('tbody tr').first()).toContainText('Fishing Festival');
  const before = await page.locator('tbody time').first().textContent();
  await page.getByLabel('表示する時間帯').selectOption('UTC');
  await expect(page.locator('tbody time').first()).not.toHaveText(before!);
  await expect(page.getByRole('button', { name: '市長情報を再取得' })).toBeEnabled();
});

test('failed API leaves seasonal schedule available and retry recovers', async ({ page }) => {
  let available = false;
  await page.route('**/api/election', route => available ? route.fulfill({ json: { data: { mayor: { name: 'Marina', perks: [] } }, fetchedAt: Date.now() } }) : route.fulfill({ status: 503, json: { error: 'unavailable' } }));
  await page.goto('/');
  await expect(page.getByText('市長情報を取得できませんでした')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Spooky Festival' }).first()).toBeVisible();
  await page.getByLabel('イベントの種類').selectOption('市長イベント');
  await expect(page.locator('tbody tr')).toHaveCount(0);
  await expect(page.getByText('表示できるイベントがありません。', { exact: false })).toBeVisible();
  available = true;
  await page.getByRole('button', { name: '市長情報を再取得' }).click();
  await expect(page.getByText('Marina', { exact: true })).toBeVisible();
});

test('mobile layout, keyboard navigation and DADS styling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/election', route => route.fulfill({ status: 503 }));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '本文へ移動' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.table-scroll').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  await expect(page.getByLabel('表示する時間帯')).toHaveCSS('height', '48px');
  await expect(page.getByLabel('表示する時間帯')).toHaveCSS('appearance', 'none');
});

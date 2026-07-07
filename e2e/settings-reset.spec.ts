import { test, expect } from '@playwright/test';

test('resetting data requires a two-step confirmation and returns to onboarding', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="number"]').first().fill('60');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();

  await page.getByRole('link', { name: '設定' }).click();
  await expect(page.getByText('データを書き出す', { exact: false })).toBeVisible();

  // First tap only reveals the confirmation — it must not reset immediately.
  await page.getByRole('button', { name: 'データをリセットする' }).click();
  await expect(page.getByText('本当にすべての記録を削除しますか', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'キャンセル' }).click();
  await expect(page.getByText('本当にすべての記録を削除しますか', { exact: false })).toHaveCount(0);
  await expect(page.getByText('StudyFit Primer')).toHaveCount(0);

  await page.getByRole('button', { name: 'データをリセットする' }).click();
  await page.getByRole('button', { name: '削除する' }).click();

  await expect(page.getByText('StudyFit Primer')).toBeVisible();
});

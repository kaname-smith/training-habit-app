import { test, expect } from '@playwright/test';

test('data survives a full page reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="number"]').first().fill('58');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();

  await page.getByRole('button', { name: '今日は休息にする' }).first().click();
  await expect(page.getByText('今日はもう完了しました')).toBeVisible();

  await page.reload();

  // Reloading must NOT show onboarding again, and the logged rest day must
  // still be there — this is the whole point of localStorage-first storage.
  await expect(page.getByText('今日はもう完了しました')).toBeVisible();
  await expect(page.getByText('StudyFit Primer')).toHaveCount(0);
});

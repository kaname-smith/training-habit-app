import { test, expect } from '@playwright/test';

test('bottom nav reaches Body/Study/records/settings, and the Body hub reaches Workout and Nutrition', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('input[type="number"]').first().fill('60');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();

  await page.getByRole('link', { name: 'Body' }).click();
  await expect(page).toHaveURL(/\/body/);
  await expect(page.getByText('トレーニング')).toBeVisible();
  await expect(page.getByText('栄養・プロテイン')).toBeVisible();

  await page.getByText('トレーニング').click();
  await expect(page).toHaveURL(/\/workout/);

  await page.getByRole('link', { name: 'Body' }).click();
  await page.getByText('栄養・プロテイン').click();
  await expect(page).toHaveURL(/\/nutrition/);

  await page.getByRole('link', { name: 'Study' }).click();
  await expect(page).toHaveURL(/\/study/);
  await expect(page.getByText('科目・試験・教材・不明点を整理する機能は準備中です。')).toBeVisible();
  await expect(page.getByText('登録済みの科目: 0件')).toBeVisible();

  await page.getByRole('link', { name: '記録' }).click();
  await expect(page).toHaveURL(/\/records/);
  await expect(page.getByText('総実施回数', { exact: false })).toBeVisible();

  await page.getByRole('link', { name: '設定' }).click();
  await expect(page).toHaveURL(/\/settings/);

  await page.getByRole('link', { name: '今日' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();
});

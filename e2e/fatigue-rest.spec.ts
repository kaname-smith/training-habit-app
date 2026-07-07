import { test, expect } from '@playwright/test';

const BANNED_WORDS = ['サボり', '失敗', '連続記録が途切れた', 'もっと追い込め', '根性'];

test('heavy fatigue recommends the short version, then switching to rest reflects on the calendar', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('input[type="number"]').first().fill('65');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();

  // FatigueCheckCard starts collapsed — expand it before selecting an option.
  await page.getByRole('button', { name: '睡眠・疲労チェック', exact: false }).click();
  await page.getByRole('button', { name: '重い' }).click();
  await expect(page.getByText('10分版', { exact: true })).toBeVisible();
  await expect(page.getByText('睡眠不足や疲労が重い日は', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: '今日は休息にする' }).first().click();
  await expect(page.getByText('今日はもう完了しました')).toBeVisible();
  await expect(page.getByText('休息も計画の一部です', { exact: false })).toBeVisible();

  await page.getByRole('link', { name: '記録' }).click();
  await expect(page.getByText('総実施回数', { exact: false })).toBeVisible();
  // The status dot's aria-label carries the raw WorkoutStatus ("rest"), so this
  // confirms today's cell specifically — not just the legend chip's label.
  await expect(page.locator('[aria-label="rest"]')).toHaveCount(1);

  const bodyText = (await page.textContent('body')) ?? '';
  for (const banned of BANNED_WORDS) {
    expect(bodyText).not.toContain(banned);
  }
});

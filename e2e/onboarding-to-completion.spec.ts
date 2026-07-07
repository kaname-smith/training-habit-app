import { test, expect } from '@playwright/test';

const BANNED_WORDS = ['サボり', '失敗', '連続記録が途切れた', 'もっと追い込め', '根性'];

test('onboarding -> short workout -> completion -> protein log -> records reflect it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('StudyFit Primer')).toBeVisible();

  await page.locator('input[type="number"]').first().fill('60');
  await page.getByRole('button', { name: '今日から始める' }).click();

  await expect(page.getByText('今日のおすすめ')).toBeVisible();
  await page.getByRole('button', { name: '10分版にする' }).click();
  await expect(page).toHaveURL(/\/workout\/short/);

  for (let i = 0; i < 10; i++) {
    const setButtons = page.getByRole('button', { name: /セット/ });
    const count = await setButtons.count();
    for (let j = 0; j < count; j++) {
      await setButtons.nth(j).click();
    }
    await page.waitForTimeout(100);

    const finishButton = page.getByRole('button', { name: '終了する' });
    if (await finishButton.count()) {
      await finishButton.click();
      break;
    }
    await page.getByRole('button', { name: '次の種目へ' }).click();
  }

  await expect(page.getByText('お疲れさまでした')).toBeVisible();
  await page.getByRole('button', { name: 'ちょうどよい' }).click();
  await expect(page.getByRole('button', { name: 'プロテインを記録する' })).toBeVisible();

  await page.getByRole('button', { name: 'プロテインを記録する' }).click();
  await expect(page).toHaveURL(/\/nutrition/);
  await page.getByRole('button', { name: '1杯' }).click();
  // Anchored to the start so this only matches the protein total display,
  // not the "(1杯 20g)" shake-size label elsewhere on the same page.
  await expect(page.getByText(/^20g/)).toBeVisible();

  await page.getByRole('link', { name: '記録' }).click();
  await expect(page.getByText('総実施回数', { exact: false })).toBeVisible();

  const bodyText = (await page.textContent('body')) ?? '';
  for (const banned of BANNED_WORDS) {
    expect(bodyText).not.toContain(banned);
  }
});

import { test, expect } from '@playwright/test';

test('Study S1 golden path: register a course, see unknowns, generate Discovery Tasks, record a fixed schedule', async ({
  page,
}) => {
  // 1. Onboarding
  await page.goto('/');
  await page.locator('input[type="number"]').first().fill('60');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();

  // 2. Move to Study
  await page.getByRole('link', { name: 'Study' }).click();
  await expect(page).toHaveURL(/\/study$/);

  // 3. Register a course
  await page.getByRole('link', { name: /^科目/ }).click();
  await expect(page).toHaveURL(/\/study\/courses/);
  await page.getByLabel('科目名').fill('材料力学');
  await page.getByRole('button', { name: '追加する' }).click();
  await expect(page.getByText('材料力学')).toBeVisible();

  // 4. Leave the exam date confidence unconfirmed
  await page.getByRole('link', { name: 'Study' }).click();
  await page.getByRole('link', { name: /^試験情報/ }).click();
  await expect(page).toHaveURL(/\/study\/exams/);
  await expect(page.getByText('材料力学')).toBeVisible();
  await page.getByRole('button', { name: '低い' }).first().click();

  // 5. Mark one required material as only partially checked
  await page.getByRole('link', { name: 'Study' }).click();
  await page.getByRole('link', { name: /^教材/ }).click();
  await expect(page).toHaveURL(/\/study\/materials/);
  await page.getByRole('button', { name: '一部確認' }).first().click();

  // 6-8. Open Discovery Tasks; generation runs automatically and finds unknowns
  await page.getByRole('link', { name: 'Study' }).click();
  await page.getByRole('link', { name: /^Discovery Tasks/ }).click();
  await expect(page).toHaveURL(/\/study\/discovery/);
  await expect(page.getByText(/新しく\d+件の不明点が見つかりました。/)).toBeVisible();
  await expect(page.getByText('材料力学の試験日を確認する')).toBeVisible();

  // Complete one Discovery Task
  await page.getByRole('button', { name: '完了にする' }).first().click();
  await expect(page.getByRole('button', { name: '未完了に戻す' })).toBeVisible();

  // 9. Add a fixed schedule block
  await page.getByRole('link', { name: 'Study' }).click();
  await page.getByRole('link', { name: /^固定予定/ }).click();
  await expect(page).toHaveURL(/\/study\/availability/);
  await page.getByLabel('ラベル').fill('材料力学の講義');
  await page.getByLabel('開始日時').fill('2026-07-13T10:00');
  await page.getByLabel('終了日時').fill('2026-07-13T11:30');
  await page.getByRole('button', { name: '追加する' }).click();
  await expect(page.getByText('材料力学の講義')).toBeVisible();

  // 10. Study data survives a reload
  await page.reload();
  await expect(page.getByText('材料力学の講義')).toBeVisible();
  await page.getByRole('link', { name: 'Study' }).click();
  await expect(page.getByText('登録済みの科目: 1件')).toBeVisible();

  // 11. Return to an existing Body screen
  await page.getByRole('link', { name: '今日' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();
});

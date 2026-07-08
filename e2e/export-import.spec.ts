import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BANNED_WORDS = ['サボり', '失敗', '連続記録が途切れた', 'もっと追い込め', '根性'];
const IMPORT_OVERWRITE_MARKER = '現在のデータを、選択したファイルの内容で上書きします';

test('export, reject an invalid file, then reset and restore from the export', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="number"]').first().fill('62');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await expect(page.getByText('今日のおすすめ')).toBeVisible();

  await page.getByRole('button', { name: '今日は休息にする' }).first().click();
  await expect(page.getByText('今日はもう完了しました')).toBeVisible();

  await page.getByRole('link', { name: '設定' }).click();
  await expect(page.getByText('データを書き出す', { exact: false })).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'データを書き出す(JSON)' }).click(),
  ]);
  const exportPath = path.join(os.tmpdir(), `studyfit-export-test-${test.info().workerIndex}.json`);
  await download.saveAs(exportPath);
  const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  expect(exported.schemaVersion).toBe(1);
  expect(exported.profile.bodyWeightKg).toBe(62);

  // An unrelated JSON file must be rejected, with existing data left alone.
  const wrongShapePath = path.join(os.tmpdir(), `studyfit-wrong-shape-${test.info().workerIndex}.json`);
  fs.writeFileSync(wrongShapePath, JSON.stringify({ hello: 'world' }));
  await page.setInputFiles('input[type="file"]', wrongShapePath);
  await expect(page.getByText('対応していないデータ形式です', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: '読み込んで上書きする' })).toHaveCount(0);

  await page.getByRole('link', { name: '今日' }).click();
  await expect(page.getByText('今日はもう完了しました')).toBeVisible();

  // Now actually lose the data, and restore it from the export.
  await page.getByRole('link', { name: '設定' }).click();
  await page.getByRole('button', { name: 'データをリセットする' }).click();
  await page.getByRole('button', { name: '削除する' }).click();
  await expect(page.getByText('StudyFit Primer')).toBeVisible();

  // Reset wipes the profile, and there is no way to reach Settings without
  // one — re-onboard with throwaway values just to get back to the import UI.
  // Weight must clear the input's own min={20} validation or the browser
  // silently blocks submission.
  await page.locator('input[type="number"]').first().fill('20');
  await page.getByRole('button', { name: '今日から始める' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('link', { name: '設定' }).click();
  await expect(page.getByText('データを書き出す', { exact: false })).toBeVisible();

  await page.setInputFiles('input[type="file"]', exportPath);
  await expect(page.getByText(IMPORT_OVERWRITE_MARKER, { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '読み込んで上書きする' }).click();

  await expect(page.locator('input[type="number"]').first()).toHaveValue('62');

  await page.getByRole('link', { name: '今日' }).click();
  await expect(page.getByText('今日はもう完了しました')).toBeVisible();

  const bodyText = (await page.textContent('body')) ?? '';
  for (const banned of BANNED_WORDS) {
    expect(bodyText).not.toContain(banned);
  }

  fs.rmSync(exportPath, { force: true });
  fs.rmSync(wrongShapePath, { force: true });
});

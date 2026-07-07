import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SafetyNotice } from '../../components/ui/SafetyNotice';
import { SettingsSection } from '../../components/settings/SettingsSection';
import { useAppData } from '../../app/hooks';
import { exportAllData, validateDataExport } from '../../storage/repositories';
import type { NotificationTime, DataExport } from '../../storage/repositories';
import {
  AUGUST_PREVIEW_TITLE,
  AUGUST_PREVIEW_BODY,
  RESET_CONFIRM_TEXT,
  IMPORT_EXPORT_FIRST_HINT,
  IMPORT_OVERWRITE_CONFIRM_TEXT,
  IMPORT_INVALID_FILE_TEXT,
} from '../../content/messages';

const NOTIFICATION_TIME_OPTIONS: { value: NotificationTime; label: string }[] = [
  { value: 'morning', label: '朝' },
  { value: 'evening', label: '夕方' },
  { value: 'night', label: '夜' },
];

const inputClassName =
  'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)]';

export function SettingsPage() {
  const { profile, saveProfile, settings, updateSettings, resetAll, importAll } = useAppData();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<DataExport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // These two fields need to be controlled (not defaultValue) because an
  // import can replace `profile` while this page stays mounted — a plain
  // defaultValue would keep showing the old number in that case.
  const [weightInput, setWeightInput] = useState(String(profile?.bodyWeightKg ?? ''));
  const [proteinPerShakeInput, setProteinPerShakeInput] = useState(String(profile?.proteinPerShakeG ?? ''));

  useEffect(() => {
    if (profile) setWeightInput(String(profile.bodyWeightKg));
    // Deliberately keyed on the field, not the whole profile object: an
    // unrelated field update (e.g. toggling exam mode) shouldn't reset
    // this input while the user might be mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.bodyWeightKg]);

  useEffect(() => {
    if (profile) setProteinPerShakeInput(String(profile.proteinPerShakeG));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.proteinPerShakeG]);

  if (!profile) return null;

  async function handleWeightChange(value: string) {
    const weight = Number(value);
    if (!weight || weight <= 0) return;
    await saveProfile({ ...profile!, bodyWeightKg: weight, updatedAt: new Date().toISOString() });
  }

  async function handleProteinPerShakeChange(value: string) {
    const amount = Number(value);
    await saveProfile({
      ...profile!,
      proteinPerShakeG: amount || 0,
      updatedAt: new Date().toISOString(),
    });
  }

  async function handleExamModeChange(examMode: boolean) {
    await saveProfile({ ...profile!, examMode, updatedAt: new Date().toISOString() });
  }

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyfit-export-${data.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleResetConfirmed() {
    await resetAll();
    setConfirmingReset(false);
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file again still fires onChange.
    event.target.value = '';
    if (!file) return;

    setImportError(null);
    setPendingImport(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setImportError(IMPORT_INVALID_FILE_TEXT);
      return;
    }

    const validation = validateDataExport(parsed);
    if (!validation.ok) {
      setImportError(validation.reason);
      return;
    }
    setPendingImport(validation.data);
  }

  async function handleImportConfirmed() {
    if (!pendingImport) return;
    const result = await importAll(pendingImport);
    if (!result.ok) {
      setImportError(result.reason);
    }
    setPendingImport(null);
  }

  return (
    <PageContainer title="設定">
      <SettingsSection title="プロフィール">
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
          体重(kg)
          <input
            type="number"
            inputMode="decimal"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            onBlur={(e) => handleWeightChange(e.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
          プロテイン1杯量(g)
          <input
            type="number"
            inputMode="numeric"
            value={proteinPerShakeInput}
            onChange={(e) => setProteinPerShakeInput(e.target.value)}
            onBlur={(e) => handleProteinPerShakeChange(e.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex items-center justify-between text-sm font-medium text-[var(--text-primary)]">
          試験モード
          <input
            type="checkbox"
            checked={profile.examMode}
            onChange={(e) => handleExamModeChange(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </SettingsSection>

      <SettingsSection title="通知">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">通知のおすすめ時刻</p>
          <div className="flex gap-2">
            {NOTIFICATION_TIME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={settings.notificationTime === option.value ? 'primary' : 'secondary'}
                className="flex-1"
                onClick={() => updateSettings({ ...settings, notificationTime: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <label className="flex items-center justify-between text-sm font-medium text-[var(--text-primary)]">
          通知を表示する
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => updateSettings({ ...settings, notificationsEnabled: e.target.checked })}
            className="h-5 w-5"
          />
        </label>
      </SettingsSection>

      <SettingsSection title="データ">
        <Button variant="secondary" fullWidth onClick={handleExport}>
          データを書き出す(JSON)
        </Button>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelected}
            className="hidden"
          />
          <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()}>
            データを読み込む(JSON)
          </Button>
          {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
        </div>

        {pendingImport && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-600 dark:text-red-400">{IMPORT_EXPORT_FIRST_HINT}</p>
            <p className="text-sm text-red-600 dark:text-red-400">{IMPORT_OVERWRITE_CONFIRM_TEXT}</p>
            <p className="text-xs text-[var(--text-muted)]">
              このファイルのエクスポート日時：
              {new Date(pendingImport.exportedAt).toLocaleString('ja-JP')}(記録{pendingImport.workoutLogs.length}件)
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setPendingImport(null)}>
                キャンセル
              </Button>
              <Button variant="primary" fullWidth onClick={handleImportConfirmed}>
                読み込んで上書きする
              </Button>
            </div>
          </div>
        )}

        {!confirmingReset ? (
          <Button variant="ghost" fullWidth onClick={() => setConfirmingReset(true)}>
            データをリセットする
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-600 dark:text-red-400">{RESET_CONFIRM_TEXT}</p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setConfirmingReset(false)}>
                キャンセル
              </Button>
              <Button variant="primary" fullWidth onClick={handleResetConfirmed}>
                削除する
              </Button>
            </div>
          </div>
        )}
      </SettingsSection>

      <Card>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{AUGUST_PREVIEW_TITLE}</p>
        <p className="text-sm text-[var(--text-secondary)]">{AUGUST_PREVIEW_BODY}</p>
      </Card>

      <SafetyNotice />
    </PageContainer>
  );
}

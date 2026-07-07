import { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SafetyNotice } from '../../components/ui/SafetyNotice';
import { SettingsSection } from '../../components/settings/SettingsSection';
import { useAppData } from '../../app/hooks';
import { exportAllData } from '../../storage/repositories';
import type { NotificationTime } from '../../storage/repositories';
import { AUGUST_PREVIEW_TITLE, AUGUST_PREVIEW_BODY, RESET_CONFIRM_TEXT } from '../../content/messages';

const NOTIFICATION_TIME_OPTIONS: { value: NotificationTime; label: string }[] = [
  { value: 'morning', label: '朝' },
  { value: 'evening', label: '夕方' },
  { value: 'night', label: '夜' },
];

const inputClassName =
  'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)]';

export function SettingsPage() {
  const { profile, saveProfile, settings, updateSettings, resetAll } = useAppData();
  const [confirmingReset, setConfirmingReset] = useState(false);

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

  return (
    <PageContainer title="設定">
      <SettingsSection title="プロフィール">
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
          体重(kg)
          <input
            type="number"
            inputMode="decimal"
            defaultValue={profile.bodyWeightKg}
            onBlur={(e) => handleWeightChange(e.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
          プロテイン1杯量(g)
          <input
            type="number"
            inputMode="numeric"
            defaultValue={profile.proteinPerShakeG}
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

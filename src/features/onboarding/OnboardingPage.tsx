import { useState, type FormEvent } from 'react';
import { useAppData } from '../../app/hooks';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SafetyNotice } from '../../components/ui/SafetyNotice';
import { JULY_PLAN_END_DATE } from '../../data/julyPlan';
import { ONBOARDING_INTRO, EXAM_MODE_HELPER_TEXT } from '../../content/messages';
import type { ExperienceLevel, UserProfile } from '../../domain/habitTypes';

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: '初心者' },
  { value: 'returning', label: '再開' },
  { value: 'active', label: '継続中' },
];

export function OnboardingPage() {
  const { saveProfile } = useAppData();

  const [nickname, setNickname] = useState('');
  const [bodyWeightKg, setBodyWeightKg] = useState('60');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [examMode, setExamMode] = useState(true);
  const [examEndDate, setExamEndDate] = useState(JULY_PLAN_END_DATE);
  const [proteinPerShakeG, setProteinPerShakeG] = useState('20');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const weight = Number(bodyWeightKg);
    const proteinPerShake = Number(proteinPerShakeG);

    if (!weight || weight <= 0) {
      setError('体重を正しく入力してください。');
      return;
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      nickname: nickname.trim() || undefined,
      bodyWeightKg: weight,
      experienceLevel,
      examMode,
      examEndDate,
      proteinPerShakeG: proteinPerShake || 20,
      createdAt: now,
      updatedAt: now,
    };

    await saveProfile(profile);
  }

  return (
    <div className="mx-auto max-w-md min-h-screen px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">StudyFit Primer</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{ONBOARDING_INTRO}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Card>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            ニックネーム(任意)
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-base"
              placeholder="例：かなめ"
            />
          </label>
        </Card>

        <Card>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            体重(kg)
            <input
              type="number"
              inputMode="decimal"
              min={20}
              max={200}
              step="0.1"
              value={bodyWeightKg}
              onChange={(e) => setBodyWeightKg(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-base"
              required
            />
          </label>
        </Card>

        <Card>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">運動経験</p>
          <div className="flex gap-2">
            {EXPERIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setExperienceLevel(option.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  experienceLevel === option.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                }`}
                aria-pressed={experienceLevel === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label className="flex items-center justify-between gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            試験モード
            <input
              type="checkbox"
              checked={examMode}
              onChange={(e) => setExamMode(e.target.checked)}
              className="h-5 w-5"
            />
          </label>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{EXAM_MODE_HELPER_TEXT}</p>
        </Card>

        <Card>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            試験期間の終了日
            <input
              type="date"
              value={examEndDate}
              onChange={(e) => setExamEndDate(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-base"
            />
          </label>
        </Card>

        <Card>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            プロテイン1杯あたりのタンパク質量(g)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={proteinPerShakeG}
              onChange={(e) => setProteinPerShakeG(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-base"
            />
          </label>
        </Card>

        <SafetyNotice />

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" fullWidth>
          今日から始める
        </Button>
      </form>
    </div>
  );
}

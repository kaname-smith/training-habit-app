import { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProteinProgressCard } from '../../components/nutrition/ProteinProgressCard';
import { useAppData, todayIsoDate } from '../../app/hooks';

const SHAKE_OPTIONS = [0, 1, 2];

export function NutritionPage() {
  const { profile, nutritionLogs, upsertNutritionLog } = useAppData();
  const today = todayIsoDate();
  const existing = nutritionLogs.find((log) => log.date === today);

  const [mealProteinInput, setMealProteinInput] = useState(String(existing?.proteinFromMealsG ?? 0));

  if (!profile) return null;

  const shakeCount = existing?.shakeCount ?? 0;
  const manualProteinG = existing?.manualProteinG ?? 0;

  async function setShakeCount(count: number) {
    await upsertNutritionLog({
      date: today,
      proteinFromMealsG: Number(mealProteinInput) || 0,
      shakeCount: count,
      manualProteinG,
    });
  }

  async function commitMealProtein(value: string) {
    setMealProteinInput(value);
    await upsertNutritionLog({
      date: today,
      proteinFromMealsG: Number(value) || 0,
      shakeCount,
      manualProteinG,
    });
  }

  return (
    <PageContainer title="栄養">
      <ProteinProgressCard
        bodyWeightKg={profile.bodyWeightKg}
        proteinPerShakeG={profile.proteinPerShakeG}
        log={existing}
      />

      <Card>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
          プロテイン杯数(1杯 {profile.proteinPerShakeG}g)
        </p>
        <div className="flex gap-2">
          {SHAKE_OPTIONS.map((count) => (
            <Button
              key={count}
              variant={shakeCount === count ? 'primary' : 'secondary'}
              className="flex-1"
              onClick={() => setShakeCount(count)}
            >
              {count}杯
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          食事から取ったタンパク質の概算(g)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={300}
            value={mealProteinInput}
            onChange={(e) => commitMealProtein(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-base"
          />
        </label>
      </Card>

      <Card>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">体重別の目標について</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          7月の目安は体重×1.4〜1.6gです。一般的な運動者の参考範囲は体重×1.4〜2.0g/日とされています。プロテインは食事の代替ではなく、不足分を埋める道具として使いましょう。
        </p>
      </Card>
    </PageContainer>
  );
}

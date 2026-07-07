import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Stepper';
import { ProteinProgressCard } from '../../components/nutrition/ProteinProgressCard';
import { useAppData, todayIsoDate } from '../../app/hooks';
import { NUTRITION_EXPLAINER_TITLE, NUTRITION_EXPLAINER_BODY } from '../../content/messages';

const SHAKE_OPTIONS = [0, 1, 2];

export function NutritionPage() {
  const { profile, nutritionLogs, upsertNutritionLog } = useAppData();
  const today = todayIsoDate();
  const existing = nutritionLogs.find((log) => log.date === today);

  if (!profile) return null;

  const shakeCount = existing?.shakeCount ?? 0;
  const proteinFromMealsG = existing?.proteinFromMealsG ?? 0;
  const manualProteinG = existing?.manualProteinG ?? 0;

  async function setShakeCount(count: number) {
    await upsertNutritionLog({
      date: today,
      proteinFromMealsG,
      shakeCount: count,
      manualProteinG,
    });
  }

  async function setMealProtein(next: number) {
    await upsertNutritionLog({
      date: today,
      proteinFromMealsG: next,
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
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
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
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">食事から取ったタンパク質の概算</p>
        <Stepper
          value={proteinFromMealsG}
          onChange={setMealProtein}
          min={0}
          max={300}
          step={5}
          unit="g"
          aria-label="食事から取ったタンパク質の概算"
        />
      </Card>

      <Card>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{NUTRITION_EXPLAINER_TITLE}</p>
        <p className="text-sm text-[var(--text-secondary)]">{NUTRITION_EXPLAINER_BODY}</p>
      </Card>
    </PageContainer>
  );
}

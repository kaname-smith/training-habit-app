import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getCompletionMessage, getMonthlyAchievementLine, WORKOUT_NEXT_STEP_HINT } from '../../content/messages';
import type { WorkoutType, PerceivedEffort } from '../../domain/workoutTypes';

const EFFORT_OPTIONS: { value: PerceivedEffort; label: string }[] = [
  { value: 'easy', label: '軽い' },
  { value: 'good', label: 'ちょうどよい' },
  { value: 'hard', label: 'きつい' },
];

export interface WorkoutCompleteViewProps {
  workoutType: WorkoutType;
  templateTitle: string;
  monthlyCount: number;
  effort: PerceivedEffort | null;
  savedLogId: string | null;
  onFinish: (effort: PerceivedEffort) => void;
  onGoToNutrition: () => void;
  onGoHome: () => void;
}

export function WorkoutCompleteView({
  workoutType,
  templateTitle,
  monthlyCount,
  effort,
  savedLogId,
  onFinish,
  onGoToNutrition,
  onGoHome,
}: WorkoutCompleteViewProps) {
  return (
    <PageContainer title="完了">
      <Card className="flex flex-col gap-2 animate-fade-in">
        <p className="text-xl font-semibold text-[var(--text-primary)]">お疲れさまでした</p>
        <p className="text-sm text-[var(--text-secondary)]">{getCompletionMessage(workoutType)}</p>
        <p className="text-sm text-[var(--text-muted)]">実施内容：{templateTitle}</p>
        {savedLogId && (
          <p className="text-sm font-medium text-[var(--accent)]">{getMonthlyAchievementLine(monthlyCount)}</p>
        )}
      </Card>

      {!savedLogId ? (
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">体感強度はどうでしたか</p>
          <div className="flex gap-2">
            {EFFORT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={effort === option.value ? 'primary' : 'secondary'}
                className="flex-1"
                onClick={() => onFinish(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col gap-3 animate-fade-in">
          <p className="text-sm text-[var(--text-secondary)]">{WORKOUT_NEXT_STEP_HINT}</p>
          <Button variant="primary" fullWidth onClick={onGoToNutrition}>
            プロテインを記録する
          </Button>
          <Button variant="ghost" fullWidth onClick={onGoHome}>
            今日の画面に戻る
          </Button>
        </Card>
      )}
    </PageContainer>
  );
}

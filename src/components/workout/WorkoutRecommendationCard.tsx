import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import type { WorkoutType } from '../../domain/workoutTypes';

const WORKOUT_LABEL: Record<WorkoutType, string> = {
  intro: '導入10分',
  A: '筋トレA',
  B: '筋トレB',
  short: '10分版',
  rest: '休息',
  walk: '歩行・ストレッチ',
};

const WORKOUT_ICON: Record<WorkoutType, IconName> = {
  intro: 'workout',
  A: 'workout',
  B: 'workout',
  short: 'workout',
  rest: 'rest',
  walk: 'rest',
};

interface WorkoutRecommendationCardProps {
  workoutType: WorkoutType;
  reason: string;
  estimatedMinutes: number;
  onStart: () => void;
  onSwitchToShort: () => void;
  onRest: () => void;
}

export function WorkoutRecommendationCard({
  workoutType,
  reason,
  estimatedMinutes,
  onStart,
  onSwitchToShort,
  onRest,
}: WorkoutRecommendationCardProps) {
  const isRest = workoutType === 'rest';
  const isShort = workoutType === 'short';

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-surface)] text-[var(--accent)]">
          <Icon name={WORKOUT_ICON[workoutType]} className="w-6 h-6" />
        </span>
        <div>
          <p className="text-xs text-[var(--text-muted)]">今日のおすすめ</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{WORKOUT_LABEL[workoutType]}</p>
          {estimatedMinutes > 0 && (
            <p className="text-sm text-[var(--text-muted)]">所要時間 約{estimatedMinutes}分</p>
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)]">{reason}</p>

      <Button variant="primary" fullWidth onClick={onStart}>
        {isRest ? '今日は休息にする' : '今日のメニューを始める'}
      </Button>

      <div className="flex gap-2">
        {!isShort && !isRest && (
          <Button variant="secondary" fullWidth onClick={onSwitchToShort}>
            10分版にする
          </Button>
        )}
        {!isRest && (
          <Button variant="secondary" fullWidth onClick={onRest}>
            今日は休息にする
          </Button>
        )}
      </div>
    </Card>
  );
}

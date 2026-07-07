import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { WorkoutType } from '../../domain/workoutTypes';

const WORKOUT_LABEL: Record<WorkoutType, string> = {
  intro: '導入10分',
  A: '筋トレA',
  B: '筋トレB',
  short: '10分版',
  rest: '休息',
  walk: '歩行・ストレッチ',
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
      <div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">今日のおすすめ</p>
        <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {WORKOUT_LABEL[workoutType]}
        </p>
        {estimatedMinutes > 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">所要時間 約{estimatedMinutes}分</p>
        )}
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-300">{reason}</p>

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

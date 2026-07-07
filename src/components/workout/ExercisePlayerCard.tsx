import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { ExerciseDefinition, WorkoutExercise } from '../../domain/workoutTypes';

interface ExercisePlayerCardProps {
  exercise: WorkoutExercise;
  definition: ExerciseDefinition;
  completedSets: boolean[];
  onToggleSet: (setIndex: number) => void;
  stepLabel: string;
}

function formatAmount(exercise: WorkoutExercise): string {
  const side = exercise.side === 'left-right' ? '(左右)' : '';
  if (exercise.reps) return `${exercise.reps}回${side}`;
  if (exercise.seconds) return `${exercise.seconds}秒${side}`;
  return '';
}

export function ExercisePlayerCard({
  exercise,
  definition,
  completedSets,
  onToggleSet,
  stepLabel,
}: ExercisePlayerCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{stepLabel}</p>
      <div>
        <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{definition.name}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{formatAmount(exercise)}</p>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">{definition.formCue}</p>

      <div className="flex gap-2">
        {completedSets.map((done, index) => (
          <Button
            key={index}
            type="button"
            variant={done ? 'primary' : 'secondary'}
            onClick={() => onToggleSet(index)}
            className="flex-1"
          >
            セット{index + 1}
          </Button>
        ))}
      </div>
    </Card>
  );
}

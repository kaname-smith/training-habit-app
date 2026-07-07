import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SafetyNotice } from '../../components/ui/SafetyNotice';
import { ExercisePlayerCard } from '../../components/workout/ExercisePlayerCard';
import { useAppData, todayIsoDate } from '../../app/hooks';
import { workoutTemplates, exercises } from '../../data/seedWorkouts';
import type { WorkoutType, PerceivedEffort, ExerciseLog } from '../../domain/workoutTypes';

const EFFORT_OPTIONS: { value: PerceivedEffort; label: string }[] = [
  { value: 'easy', label: '軽い' },
  { value: 'good', label: 'ちょうどよい' },
  { value: 'hard', label: 'きつい' },
];

interface WorkoutPlayerProps {
  workoutType: WorkoutType;
}

export function WorkoutPlayer({ workoutType }: WorkoutPlayerProps) {
  const navigate = useNavigate();
  const { addWorkoutLog } = useAppData();
  const template = workoutTemplates[workoutType];

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setsDone, setSetsDone] = useState<boolean[][]>(
    template.exercises.map((exercise) => new Array(exercise.sets).fill(false)),
  );
  const [phase, setPhase] = useState<'playing' | 'complete'>(
    template.exercises.length === 0 ? 'complete' : 'playing',
  );
  const [effort, setEffort] = useState<PerceivedEffort | null>(null);
  const [savedLogId, setSavedLogId] = useState<string | null>(null);

  useEffect(() => {
    setExerciseIndex(0);
    setSetsDone(template.exercises.map((exercise) => new Array(exercise.sets).fill(false)));
    setPhase(template.exercises.length === 0 ? 'complete' : 'playing');
    setEffort(null);
    setSavedLogId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutType]);

  function toggleSet(exIndex: number, setIndex: number) {
    setSetsDone((prev) =>
      prev.map((sets, i) => (i === exIndex ? sets.map((v, j) => (j === setIndex ? !v : v)) : sets)),
    );
  }

  function goNext() {
    if (exerciseIndex + 1 >= template.exercises.length) {
      setPhase('complete');
    } else {
      setExerciseIndex((i) => i + 1);
    }
  }

  async function handleFinish(selectedEffort: PerceivedEffort) {
    setEffort(selectedEffort);
    const exerciseLogs: ExerciseLog[] = template.exercises.map((exercise, i) => ({
      exerciseId: exercise.exerciseId,
      completedSets: setsDone[i].map((completed, setIndex) => ({
        setIndex,
        reps: exercise.reps,
        seconds: exercise.seconds,
        completed,
      })),
    }));

    const id = crypto.randomUUID();
    await addWorkoutLog({
      id,
      date: todayIsoDate(),
      workoutType,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      effort: selectedEffort,
      exerciseLogs,
    });
    setSavedLogId(id);
  }

  async function handleAbortToRest() {
    await addWorkoutLog({
      id: crypto.randomUUID(),
      date: todayIsoDate(),
      workoutType: 'rest',
      completedAt: new Date().toISOString(),
      exerciseLogs: [],
    });
    navigate('/');
  }

  function handleSwitchToShort() {
    navigate('/workout/short', { replace: true });
  }

  if (phase === 'complete') {
    return (
      <PageContainer title="完了">
        <Card className="flex flex-col gap-2">
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">お疲れさまでした</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            今日はこれで十分です。試験月の目的は、途切れさせないことです。
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            実施内容：{template.title}
          </p>
        </Card>

        {!savedLogId ? (
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">体感強度はどうでしたか</p>
            <div className="flex gap-2">
              {EFFORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={effort === option.value ? 'primary' : 'secondary'}
                  className="flex-1"
                  onClick={() => handleFinish(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              次回はA/Bを交互に、無理のない範囲で続けましょう。
            </p>
            <Button variant="primary" fullWidth onClick={() => navigate('/nutrition')}>
              プロテインを記録する
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/')}>
              今日の画面に戻る
            </Button>
          </Card>
        )}
      </PageContainer>
    );
  }

  const currentExercise = template.exercises[exerciseIndex];
  const definition = exercises[currentExercise.exerciseId];

  return (
    <PageContainer title={template.title}>
      <SafetyNotice compact />

      <ExercisePlayerCard
        exercise={currentExercise}
        definition={definition}
        completedSets={setsDone[exerciseIndex]}
        onToggleSet={(setIndex) => toggleSet(exerciseIndex, setIndex)}
        stepLabel={`種目 ${exerciseIndex + 1} / ${template.exercises.length}`}
      />

      <Button variant="primary" fullWidth onClick={goNext}>
        {exerciseIndex + 1 >= template.exercises.length ? '終了する' : '次の種目へ'}
      </Button>

      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={handleSwitchToShort} disabled={workoutType === 'short'}>
          軽量版へ変更
        </Button>
        <Button variant="secondary" fullWidth onClick={handleAbortToRest}>
          中止して休息記録
        </Button>
      </div>
    </PageContainer>
  );
}

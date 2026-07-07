import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { SafetyNotice } from '../../components/ui/SafetyNotice';
import { StepDots } from '../../components/ui/StepDots';
import { ExercisePlayerCard } from '../../components/workout/ExercisePlayerCard';
import { WorkoutCompleteView } from './WorkoutCompleteView';
import { useAppData, todayIsoDate } from '../../app/hooks';
import { workoutTemplates, exercises } from '../../data/seedWorkouts';
import { JULY_PLAN_START_DATE, JULY_PLAN_END_DATE } from '../../data/julyPlan';
import type { WorkoutType, PerceivedEffort, ExerciseLog } from '../../domain/workoutTypes';

interface WorkoutPlayerProps {
  workoutType: WorkoutType;
}

export function WorkoutPlayer({ workoutType }: WorkoutPlayerProps) {
  const navigate = useNavigate();
  const { workoutLogs, addWorkoutLog } = useAppData();
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

  // By the time savedLogId is set, addWorkoutLog has already updated the
  // shared workoutLogs state (its setter runs before the repository write is
  // awaited), so the just-finished session is already reflected here.
  const monthlyCount = useMemo(
    () =>
      workoutLogs.filter(
        (log) => log.completedAt && log.date >= JULY_PLAN_START_DATE && log.date <= JULY_PLAN_END_DATE,
      ).length,
    [workoutLogs],
  );

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
      <WorkoutCompleteView
        workoutType={workoutType}
        templateTitle={template.title}
        monthlyCount={monthlyCount}
        effort={effort}
        savedLogId={savedLogId}
        onFinish={handleFinish}
        onGoToNutrition={() => navigate('/nutrition')}
        onGoHome={() => navigate('/')}
      />
    );
  }

  const currentExercise = template.exercises[exerciseIndex];
  const definition = exercises[currentExercise.exerciseId];

  return (
    <PageContainer title={template.title}>
      <StepDots total={template.exercises.length} currentIndex={exerciseIndex} />

      <SafetyNotice compact />

      <ExercisePlayerCard
        exercise={currentExercise}
        definition={definition}
        completedSets={setsDone[exerciseIndex]}
        onToggleSet={(setIndex) => toggleSet(exerciseIndex, setIndex)}
        stepLabel={`種目 ${exerciseIndex + 1} / ${template.exercises.length}`}
      />

      <div className="sticky bottom-16 flex flex-col gap-2 bg-[var(--surface-alt)]/95 backdrop-blur pt-2 pb-1 -mx-4 px-4">
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
      </div>
    </PageContainer>
  );
}

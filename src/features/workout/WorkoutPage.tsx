import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppData, todayIsoDate } from '../../app/hooks';
import { workoutTemplates } from '../../data/seedWorkouts';
import { WorkoutPlayer } from './WorkoutPlayer';
import type { WorkoutType } from '../../domain/workoutTypes';

const SELECTABLE_TYPES: WorkoutType[] = ['A', 'B', 'short', 'walk', 'rest'];

function isWorkoutType(value: string): value is WorkoutType {
  return value in workoutTemplates;
}

function RestQuickLog() {
  const navigate = useNavigate();
  const { addWorkoutLog } = useAppData();

  useEffect(() => {
    void addWorkoutLog({
      id: crypto.randomUUID(),
      date: todayIsoDate(),
      workoutType: 'rest',
      completedAt: new Date().toISOString(),
      exerciseLogs: [],
    }).then(() => navigate('/', { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer title="休息">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">休息を記録しています...</p>
    </PageContainer>
  );
}

function WorkoutSelection() {
  const navigate = useNavigate();

  return (
    <PageContainer title="トレーニングを選ぶ">
      {SELECTABLE_TYPES.map((type) => (
        <Card key={type} className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">{workoutTemplates[type].title}</p>
            {workoutTemplates[type].estimatedMinutes > 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                約{workoutTemplates[type].estimatedMinutes}分
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate(`/workout/${type}`)}>
            選ぶ
          </Button>
        </Card>
      ))}
    </PageContainer>
  );
}

export function WorkoutPage() {
  const { workoutType } = useParams<{ workoutType?: string }>();

  if (!workoutType) {
    return <WorkoutSelection />;
  }

  if (workoutType === 'rest') {
    return <RestQuickLog />;
  }

  if (!isWorkoutType(workoutType)) {
    return <WorkoutSelection />;
  }

  return <WorkoutPlayer workoutType={workoutType} />;
}

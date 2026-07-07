import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { WorkoutRecommendationCard } from '../../components/workout/WorkoutRecommendationCard';
import { FatigueCheckCard } from '../../components/workout/FatigueCheckCard';
import { ProteinProgressCard } from '../../components/nutrition/ProteinProgressCard';
import { ReminderBanner } from '../../components/today/ReminderBanner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  useAppData,
  useTodayRecommendation,
  todayIsoDate,
  parseIsoDateAsLocal,
  DEFAULT_FATIGUE_INPUT,
  type TodayFatigueInput,
} from '../../app/hooks';
import { getWeekRange, getWeeklyCompletedCount } from '../../domain/schedule';
import { JULY_PLAN_START_DATE, JULY_PLAN_END_DATE } from '../../data/julyPlan';
import { workoutTemplates } from '../../data/seedWorkouts';
import { getCompletionMessage, EFFORT_LABEL } from '../../content/messages';

export function TodayPage() {
  const navigate = useNavigate();
  const { profile, workoutLogs, nutritionLogs, fatigueCheckIns, settings, addWorkoutLog, upsertFatigueCheckIn } =
    useAppData();
  const today = todayIsoDate();

  const existingCheckIn = fatigueCheckIns.find((entry) => entry.date === today);
  const [fatigueInput, setFatigueInput] = useState<TodayFatigueInput>(
    existingCheckIn
      ? {
          hasPainOrSickness: existingCheckIn.hasPainOrSickness,
          sleepLevel: existingCheckIn.sleepLevel,
          fatigueLevel: existingCheckIn.fatigueLevel,
          examTomorrow: existingCheckIn.examTomorrow,
        }
      : DEFAULT_FATIGUE_INPUT,
  );

  const recommendation = useTodayRecommendation(today, fatigueInput);
  const todayLog = workoutLogs.find((log) => log.date === today && log.completedAt);
  const todayNutrition = nutritionLogs.find((log) => log.date === today);

  const monthlyCount = useMemo(
    () =>
      workoutLogs.filter(
        (log) => log.completedAt && log.date >= JULY_PLAN_START_DATE && log.date <= JULY_PLAN_END_DATE,
      ).length,
    [workoutLogs],
  );
  const weekRange = getWeekRange(today);
  const weeklyCount = useMemo(
    () => getWeeklyCompletedCount(workoutLogs, weekRange.start, weekRange.end),
    [workoutLogs, weekRange.start, weekRange.end],
  );

  async function handleFatigueChange(next: TodayFatigueInput) {
    setFatigueInput(next);
    await upsertFatigueCheckIn({ date: today, ...next });
  }

  async function handleRest() {
    await addWorkoutLog({
      id: crypto.randomUUID(),
      date: today,
      workoutType: 'rest',
      completedAt: new Date().toISOString(),
      exerciseLogs: [],
    });
  }

  async function handleStart() {
    if (recommendation.workoutType === 'rest') {
      await handleRest();
      return;
    }
    navigate(`/workout/${recommendation.workoutType}`);
  }

  function handleSwitchToShort() {
    navigate('/workout/short');
  }

  const estimatedMinutes = workoutTemplates[recommendation.workoutType]?.estimatedMinutes ?? 0;

  return (
    <PageContainer title={parseIsoDateAsLocal(today).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}>
      <ReminderBanner
        notificationsEnabled={settings.notificationsEnabled}
        notificationTime={settings.notificationTime}
        hasTodayLog={Boolean(todayLog)}
      />

      {todayLog ? (
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-primary)]">今日はもう完了しました</p>
            <StatusBadge status={todayLog.workoutType === 'rest' ? 'rest' : todayLog.workoutType === 'short' ? 'short_done' : 'completed'} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{getCompletionMessage(todayLog.workoutType)}</p>
          {todayLog.effort && (
            <p className="text-xs text-[var(--text-muted)]">体感強度：{EFFORT_LABEL[todayLog.effort]}</p>
          )}
        </Card>
      ) : (
        <WorkoutRecommendationCard
          workoutType={recommendation.workoutType}
          reason={recommendation.reason}
          estimatedMinutes={estimatedMinutes}
          onStart={handleStart}
          onSwitchToShort={handleSwitchToShort}
          onRest={handleRest}
        />
      )}

      <FatigueCheckCard value={fatigueInput} onChange={handleFatigueChange} />

      {profile && (
        <ProteinProgressCard
          bodyWeightKg={profile.bodyWeightKg}
          proteinPerShakeG={profile.proteinPerShakeG}
          log={todayNutrition}
        />
      )}

      <Card className="flex justify-around text-center">
        <div>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{monthlyCount}</p>
          <p className="text-xs text-[var(--text-muted)]">今月の実施回数</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{weeklyCount}</p>
          <p className="text-xs text-[var(--text-muted)]">今週の実施回数</p>
        </div>
      </Card>
    </PageContainer>
  );
}

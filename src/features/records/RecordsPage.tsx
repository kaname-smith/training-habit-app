import { useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MonthlyCalendar, type CalendarDay } from '../../components/records/MonthlyCalendar';
import { useAppData, todayIsoDate, parseIsoDateAsLocal } from '../../app/hooks';
import { getWeekRange, getWeeklyCompletedCount } from '../../domain/schedule';
import { workoutTemplates } from '../../data/seedWorkouts';
import { EFFORT_LABEL, NO_RECORD_FOR_DAY_TEXT } from '../../content/messages';
import type { WorkoutLog, WorkoutStatus } from '../../domain/workoutTypes';

function statusForDate(dateIso: string, logs: WorkoutLog[], today: string): WorkoutStatus {
  const log = logs.find((l) => l.date === dateIso && l.completedAt);
  if (log) {
    if (log.workoutType === 'rest') return 'rest';
    if (log.workoutType === 'short') return 'short_done';
    return 'completed';
  }
  return dateIso < today ? 'skipped' : 'planned';
}

export function RecordsPage() {
  const { dailyPlans, workoutLogs } = useAppData();
  const today = todayIsoDate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarDays: CalendarDay[] = useMemo(
    () =>
      dailyPlans.map((plan) => ({
        date: plan.date,
        dayOfMonth: Number(plan.date.slice(-2)),
        status: statusForDate(plan.date, workoutLogs, today),
      })),
    [dailyPlans, workoutLogs, today],
  );

  const selectedPlan = selectedDate ? dailyPlans.find((plan) => plan.date === selectedDate) : undefined;
  const selectedLog = selectedDate
    ? workoutLogs.find((log) => log.date === selectedDate && log.completedAt)
    : undefined;

  const totalCompleted = workoutLogs.filter((log) => log.completedAt).length;

  const weeklyTotals = useMemo(() => {
    const seen = new Set<string>();
    const totals: { label: string; count: number }[] = [];
    for (const plan of dailyPlans) {
      const range = getWeekRange(plan.date);
      const key = `${range.start}_${range.end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      totals.push({
        label: `${range.start.slice(5)} 〜 ${range.end.slice(5)}`,
        count: getWeeklyCompletedCount(workoutLogs, range.start, range.end),
      });
    }
    return totals;
  }, [dailyPlans, workoutLogs]);

  const bestPlankSeconds = useMemo(() => {
    let best = 0;
    for (const log of workoutLogs) {
      for (const exerciseLog of log.exerciseLogs) {
        if (exerciseLog.exerciseId !== 'plank') continue;
        for (const set of exerciseLog.completedSets) {
          if (set.completed && set.seconds && set.seconds > best) best = set.seconds;
        }
      }
    }
    return best;
  }, [workoutLogs]);

  const bestPushUpReps = useMemo(() => {
    let best = 0;
    for (const log of workoutLogs) {
      for (const exerciseLog of log.exerciseLogs) {
        if (exerciseLog.exerciseId !== 'pushUp') continue;
        for (const set of exerciseLog.completedSets) {
          if (set.completed && set.reps && set.reps > best) best = set.reps;
        }
      }
    }
    return best;
  }, [workoutLogs]);

  return (
    <PageContainer title="記録">
      <MonthlyCalendar
        days={calendarDays}
        selectedDate={selectedDate}
        onSelectDay={(day) => setSelectedDate(day.date === selectedDate ? null : day.date)}
      />

      {selectedPlan && (
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {parseIsoDateAsLocal(selectedPlan.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
            </p>
            <StatusBadge status={statusForDate(selectedPlan.date, workoutLogs, today)} />
          </div>
          {selectedLog ? (
            <>
              <p className="text-sm text-[var(--text-secondary)]">
                実施内容：{workoutTemplates[selectedLog.workoutType]?.title ?? selectedLog.workoutType}
              </p>
              {selectedLog.effort && (
                <p className="text-xs text-[var(--text-muted)]">体感強度：{EFFORT_LABEL[selectedLog.effort]}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">{NO_RECORD_FOR_DAY_TEXT}</p>
          )}
        </Card>
      )}

      <Card className="text-center">
        <p className="text-2xl font-semibold text-[var(--text-primary)]">{totalCompleted}</p>
        <p className="text-xs text-[var(--text-muted)]">7月の総実施回数(休息含む)</p>
      </Card>

      <Card>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">週ごとの実施数</p>
        <div className="flex flex-col gap-1">
          {weeklyTotals.map((week) => (
            <div key={week.label} className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>{week.label}</span>
              <span>{week.count}回</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">種目別の記録</p>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xl font-semibold text-[var(--text-primary)]">{bestPlankSeconds}秒</p>
            <p className="text-xs text-[var(--text-muted)]">プランク最長</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-[var(--text-primary)]">{bestPushUpReps}回</p>
            <p className="text-xs text-[var(--text-muted)]">腕立て最多</p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

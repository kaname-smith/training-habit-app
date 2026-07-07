import type { WorkoutLog, WorkoutType } from './workoutTypes';
import type { FatigueCheckIn } from './habitTypes';

export interface RecommendationInput {
  hasPainOrSickness: boolean;
  sleepLevel: FatigueCheckIn['sleepLevel'];
  fatigueLevel: FatigueCheckIn['fatigueLevel'];
  examTomorrow: boolean;
  hoursSinceLastWorkout: number | null;
  lastWorkoutType: WorkoutType | null;
  trainedYesterday: boolean;
  weeklyCompletedCount: number;
  fallbackRestType: 'rest' | 'walk';
}

export interface RecommendationResult {
  workoutType: WorkoutType;
  reason: string;
}

const TWO_DAYS_HOURS = 48;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Date-only (no time-of-day) arithmetic helpers, implemented purely in UTC
 * epoch milliseconds so results never shift with the runtime's local timezone.
 */
export function parseIsoDateToUtcMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function isoDateFromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDaysToIsoDate(iso: string, days: number): string {
  return isoDateFromUtcMs(parseIsoDateToUtcMs(iso) + days * ONE_DAY_MS);
}

export function getUtcWeekday(iso: string): number {
  return new Date(parseIsoDateToUtcMs(iso)).getUTCDay();
}

export function getNextAlternateWorkoutType(lastWorkoutType: WorkoutType | null): 'A' | 'B' {
  return lastWorkoutType === 'A' ? 'B' : 'A';
}

export function getTodayRecommendation(input: RecommendationInput): RecommendationResult {
  if (input.hasPainOrSickness) {
    return {
      workoutType: 'rest',
      reason: '体調がすぐれない日は、無理せず休息にしましょう。',
    };
  }

  if (input.sleepLevel === 'very_low') {
    return {
      workoutType: 'rest',
      reason: '睡眠がかなり少ない日は、筋トレより回復を優先して問題ありません。',
    };
  }

  if (input.sleepLevel === 'low' || input.fatigueLevel === 'heavy') {
    return {
      workoutType: 'short',
      reason: '睡眠不足や疲労が重い日は、10分版で十分です。',
    };
  }

  if (input.examTomorrow) {
    return {
      workoutType: 'short',
      reason: '明日試験がある日は、10分版で十分です。勉強と睡眠を優先しましょう。',
    };
  }

  if (input.hoursSinceLastWorkout === null || input.hoursSinceLastWorkout >= TWO_DAYS_HOURS) {
    const next = getNextAlternateWorkoutType(input.lastWorkoutType);
    return {
      workoutType: next,
      reason: `少し間が空きました。今日は筋トレ${next}で無理なく再開しましょう。`,
    };
  }

  if (input.trainedYesterday) {
    return {
      workoutType: input.fallbackRestType,
      reason: '前日に運動できたので、今日は休息や散歩で回復に充てましょう。',
    };
  }

  if (input.weeklyCompletedCount < 3) {
    const next = getNextAlternateWorkoutType(input.lastWorkoutType);
    return {
      workoutType: next,
      reason: `今週はまだ${input.weeklyCompletedCount}回です。筋トレ${next}を試しましょう。`,
    };
  }

  return {
    workoutType: input.fallbackRestType,
    reason: '今週の目安回数はすでに達成しています。休息や散歩でつなぎましょう。',
  };
}

export function getHoursSinceLastWorkout(
  logs: WorkoutLog[],
  now: Date,
): number | null {
  const completed = logs.filter((log) => log.completedAt);
  if (completed.length === 0) return null;

  const latest = completed.reduce((latestLog, log) => {
    if (!log.completedAt) return latestLog;
    if (!latestLog.completedAt) return log;
    return new Date(log.completedAt) > new Date(latestLog.completedAt) ? log : latestLog;
  });

  if (!latest.completedAt) return null;
  const diffMs = now.getTime() - new Date(latest.completedAt).getTime();
  return diffMs / (1000 * 60 * 60);
}

export function getLastWorkoutType(logs: WorkoutLog[]): WorkoutType | null {
  const completed = logs.filter((log) => log.completedAt && (log.workoutType === 'A' || log.workoutType === 'B'));
  if (completed.length === 0) return null;

  const latest = completed.reduce((latestLog, log) => {
    if (!log.completedAt || !latestLog.completedAt) return log;
    return new Date(log.completedAt) > new Date(latestLog.completedAt) ? log : latestLog;
  });

  return latest.workoutType;
}

export function wasTrainedYesterday(logs: WorkoutLog[], todayIso: string): boolean {
  const yesterdayIso = isoDateFromUtcMs(parseIsoDateToUtcMs(todayIso) - ONE_DAY_MS);
  return logs.some((log) => log.date === yesterdayIso && log.completedAt);
}

export function getWeeklyCompletedCount(logs: WorkoutLog[], weekStartIso: string, weekEndIso: string): number {
  return logs.filter((log) => {
    if (!log.completedAt) return false;
    return log.date >= weekStartIso && log.date <= weekEndIso;
  }).length;
}

export function getWeekRange(dateIso: string): { start: string; end: string } {
  const ms = parseIsoDateToUtcMs(dateIso);
  const day = new Date(ms).getUTCDay();
  const mondayOffsetDays = day === 0 ? -6 : 1 - day;
  const mondayMs = ms + mondayOffsetDays * ONE_DAY_MS;
  const sundayMs = mondayMs + 6 * ONE_DAY_MS;

  return {
    start: isoDateFromUtcMs(mondayMs),
    end: isoDateFromUtcMs(sundayMs),
  };
}

import { useContext, useMemo } from 'react';
import { AppDataContext, type AppDataContextValue } from './appDataContextDefinition';
import {
  getTodayRecommendation,
  getHoursSinceLastWorkout,
  getLastWorkoutType,
  wasTrainedYesterday,
  getWeeklyCompletedCount,
  getWeekRange,
  type RecommendationResult,
} from '../domain/schedule';
import type { SleepLevel, FatigueLevel } from '../domain/habitTypes';

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

export interface TodayFatigueInput {
  hasPainOrSickness: boolean;
  sleepLevel: SleepLevel;
  fatigueLevel: FatigueLevel;
  examTomorrow: boolean;
}

export const DEFAULT_FATIGUE_INPUT: TodayFatigueInput = {
  hasPainOrSickness: false,
  sleepLevel: 'enough',
  fatigueLevel: 'normal',
  examTomorrow: false,
};

export function useTodayRecommendation(
  todayIso: string,
  fatigueInput: TodayFatigueInput,
): RecommendationResult {
  const { workoutLogs, dailyPlans } = useAppData();

  return useMemo(() => {
    const scheduledType = dailyPlans.find((plan) => plan.date === todayIso)?.recommendedWorkoutType;
    const fallbackRestType = scheduledType === 'walk' ? 'walk' : 'rest';
    const weekRange = getWeekRange(todayIso);

    return getTodayRecommendation({
      hasPainOrSickness: fatigueInput.hasPainOrSickness,
      sleepLevel: fatigueInput.sleepLevel,
      fatigueLevel: fatigueInput.fatigueLevel,
      examTomorrow: fatigueInput.examTomorrow,
      hoursSinceLastWorkout: getHoursSinceLastWorkout(workoutLogs, new Date()),
      lastWorkoutType: getLastWorkoutType(workoutLogs),
      trainedYesterday: wasTrainedYesterday(workoutLogs, todayIso),
      weeklyCompletedCount: getWeeklyCompletedCount(workoutLogs, weekRange.start, weekRange.end),
      fallbackRestType,
    });
  }, [workoutLogs, dailyPlans, todayIso, fatigueInput]);
}

// Uses local calendar date, not UTC — a habit app must key "today" off the
// user's own wall-clock day. toISOString() is UTC and would land on the
// previous day for JST users any time before 9am.
export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses a "YYYY-MM-DD" string as local midnight rather than UTC midnight, so
// display formatting (toLocaleDateString etc.) never shifts by a day.
export function parseIsoDateAsLocal(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

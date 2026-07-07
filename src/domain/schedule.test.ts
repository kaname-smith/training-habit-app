import { describe, it, expect } from 'vitest';
import {
  getTodayRecommendation,
  getNextAlternateWorkoutType,
  getHoursSinceLastWorkout,
  getLastWorkoutType,
  wasTrainedYesterday,
  getWeeklyCompletedCount,
  getWeekRange,
  type RecommendationInput,
} from './schedule';
import type { WorkoutLog } from './workoutTypes';

function baseInput(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    hasPainOrSickness: false,
    sleepLevel: 'enough',
    fatigueLevel: 'normal',
    examTomorrow: false,
    hoursSinceLastWorkout: 72,
    lastWorkoutType: 'B',
    trainedYesterday: false,
    weeklyCompletedCount: 1,
    fallbackRestType: 'rest',
    ...overrides,
  };
}

describe('getTodayRecommendation priority order', () => {
  it('1. pain or sickness always recommends rest', () => {
    const result = getTodayRecommendation(baseInput({ hasPainOrSickness: true }));
    expect(result.workoutType).toBe('rest');
  });

  it('2. very low sleep recommends rest even if otherwise due for a workout', () => {
    const result = getTodayRecommendation(baseInput({ sleepLevel: 'very_low' }));
    expect(result.workoutType).toBe('rest');
  });

  it('3a. low sleep recommends the short version', () => {
    const result = getTodayRecommendation(baseInput({ sleepLevel: 'low' }));
    expect(result.workoutType).toBe('short');
  });

  it('3b. heavy fatigue recommends the short version', () => {
    const result = getTodayRecommendation(baseInput({ fatigueLevel: 'heavy' }));
    expect(result.workoutType).toBe('short');
  });

  it('4. exam tomorrow recommends the short version', () => {
    const result = getTodayRecommendation(baseInput({ examTomorrow: true }));
    expect(result.workoutType).toBe('short');
  });

  it('5. 48+ hours since last workout recommends the alternating A/B workout', () => {
    const result = getTodayRecommendation(
      baseInput({ hoursSinceLastWorkout: 50, lastWorkoutType: 'A' }),
    );
    expect(result.workoutType).toBe('B');
  });

  it('5b. never having worked out also triggers the A/B recommendation', () => {
    const result = getTodayRecommendation(
      baseInput({ hoursSinceLastWorkout: null, lastWorkoutType: null }),
    );
    expect(result.workoutType).toBe('A');
  });

  it('6. trained yesterday recommends rest or a walk', () => {
    const result = getTodayRecommendation(
      baseInput({ hoursSinceLastWorkout: 20, trainedYesterday: true, fallbackRestType: 'walk' }),
    );
    expect(result.workoutType).toBe('walk');
  });

  it('7. under 3 workouts this week recommends the alternating A/B workout', () => {
    const result = getTodayRecommendation(
      baseInput({
        hoursSinceLastWorkout: 30,
        trainedYesterday: false,
        weeklyCompletedCount: 1,
        lastWorkoutType: 'B',
      }),
    );
    expect(result.workoutType).toBe('A');
  });

  it('8. 3+ workouts this week recommends rest or a walk', () => {
    const result = getTodayRecommendation(
      baseInput({
        hoursSinceLastWorkout: 30,
        trainedYesterday: false,
        weeklyCompletedCount: 3,
        fallbackRestType: 'rest',
      }),
    );
    expect(result.workoutType).toBe('rest');
  });

  it('never uses shaming language in any reason text', () => {
    const scenarios = [
      baseInput({ hasPainOrSickness: true }),
      baseInput({ sleepLevel: 'very_low' }),
      baseInput({ sleepLevel: 'low' }),
      baseInput({ examTomorrow: true }),
      baseInput({ hoursSinceLastWorkout: 50 }),
      baseInput({ hoursSinceLastWorkout: 20, trainedYesterday: true }),
      baseInput({ hoursSinceLastWorkout: 30, weeklyCompletedCount: 3 }),
    ];
    const bannedWords = ['サボり', '失敗', '根性'];
    for (const scenario of scenarios) {
      const result = getTodayRecommendation(scenario);
      for (const banned of bannedWords) {
        expect(result.reason).not.toContain(banned);
      }
    }
  });
});

describe('getNextAlternateWorkoutType', () => {
  it('alternates from A to B', () => {
    expect(getNextAlternateWorkoutType('A')).toBe('B');
  });
  it('alternates from B to A', () => {
    expect(getNextAlternateWorkoutType('B')).toBe('A');
  });
  it('defaults to A when there is no history', () => {
    expect(getNextAlternateWorkoutType(null)).toBe('A');
  });
});

describe('log-derived helpers', () => {
  const logs: WorkoutLog[] = [
    {
      id: '1',
      date: '2026-07-08',
      workoutType: 'A',
      completedAt: '2026-07-08T10:00:00.000Z',
      exerciseLogs: [],
    },
    {
      id: '2',
      date: '2026-07-10',
      workoutType: 'B',
      completedAt: '2026-07-10T10:00:00.000Z',
      exerciseLogs: [],
    },
  ];

  it('getHoursSinceLastWorkout computes hours from the most recent completed log', () => {
    const now = new Date('2026-07-11T10:00:00.000Z');
    expect(getHoursSinceLastWorkout(logs, now)).toBe(24);
  });

  it('getHoursSinceLastWorkout returns null with no completed logs', () => {
    expect(getHoursSinceLastWorkout([], new Date())).toBeNull();
  });

  it('getLastWorkoutType returns the most recent A/B type', () => {
    expect(getLastWorkoutType(logs)).toBe('B');
  });

  it('wasTrainedYesterday detects a completed log on the previous calendar day', () => {
    expect(wasTrainedYesterday(logs, '2026-07-09')).toBe(true);
    expect(wasTrainedYesterday(logs, '2026-07-12')).toBe(false);
  });

  it('getWeeklyCompletedCount counts completed logs within an inclusive date range', () => {
    expect(getWeeklyCompletedCount(logs, '2026-07-06', '2026-07-12')).toBe(2);
    expect(getWeeklyCompletedCount(logs, '2026-07-09', '2026-07-12')).toBe(1);
  });

  it('getWeekRange returns the Monday-Sunday range containing the date', () => {
    expect(getWeekRange('2026-07-08')).toEqual({ start: '2026-07-06', end: '2026-07-12' });
    expect(getWeekRange('2026-07-12')).toEqual({ start: '2026-07-06', end: '2026-07-12' });
  });
});

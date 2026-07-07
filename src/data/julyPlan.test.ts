import { describe, it, expect } from 'vitest';
import { generateJulyPlan, JULY_PLAN_START_DATE, JULY_PLAN_END_DATE } from './julyPlan';

describe('generateJulyPlan', () => {
  const plan = generateJulyPlan();

  it('covers every day from 7/7 to 7/31 with no gaps', () => {
    expect(plan[0].date).toBe(JULY_PLAN_START_DATE);
    expect(plan[plan.length - 1].date).toBe(JULY_PLAN_END_DATE);
    expect(plan).toHaveLength(25);
    const dates = plan.map((p) => p.date);
    expect(new Set(dates).size).toBe(25);
  });

  it('starts with the 7/7 intro session', () => {
    expect(plan[0].recommendedWorkoutType).toBe('intro');
  });

  it('matches the documented first-week overrides', () => {
    const byDate = new Map(plan.map((p) => [p.date, p]));
    expect(byDate.get('2026-07-08')?.recommendedWorkoutType).toBe('A');
    expect(byDate.get('2026-07-10')?.recommendedWorkoutType).toBe('B');
    expect(byDate.get('2026-07-12')?.recommendedWorkoutType).toBe('A');
  });

  it('downgrades A/B weekday sessions to the short version from 7/20 onward', () => {
    const byDate = new Map(plan.map((p) => [p.date, p]));
    // 2026-07-20 is a Monday (a scheduled A day) and falls in the exam-heavy window.
    expect(byDate.get('2026-07-20')?.recommendedWorkoutType).toBe('short');
    // 2026-07-22 is a Wednesday (a scheduled B day) and should also be downgraded.
    expect(byDate.get('2026-07-22')?.recommendedWorkoutType).toBe('short');
  });

  it('keeps walk/rest days untouched during the exam-heavy window', () => {
    const byDate = new Map(plan.map((p) => [p.date, p]));
    // 2026-07-21 is a Tuesday (walk day).
    expect(byDate.get('2026-07-21')?.recommendedWorkoutType).toBe('walk');
    // 2026-07-23 is a Thursday (rest day).
    expect(byDate.get('2026-07-23')?.recommendedWorkoutType).toBe('rest');
  });

  it('never uses shaming language in any reason text', () => {
    const bannedWords = ['サボり', '失敗', '根性'];
    for (const day of plan) {
      for (const banned of bannedWords) {
        expect(day.reason).not.toContain(banned);
      }
    }
  });

  it('marks every generated day as planned', () => {
    expect(plan.every((day) => day.status === 'planned')).toBe(true);
  });
});

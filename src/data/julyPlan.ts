import type { DailyPlan, WorkoutType } from '../domain/workoutTypes';
import { addDaysToIsoDate, getUtcWeekday } from '../domain/schedule';

export const JULY_PLAN_START_DATE = '2026-07-07';
export const JULY_PLAN_END_DATE = '2026-07-31';
const EXAM_HEAVY_FROM_DATE = '2026-07-20';

// The first two weeks ease in with a fixed start (docs/02_training_recipe_july.md §3)
// rather than the steady-state weekday pattern below.
const EXPLICIT_OVERRIDES: Record<string, WorkoutType> = {
  '2026-07-07': 'intro',
  '2026-07-08': 'A',
  '2026-07-10': 'B',
  '2026-07-12': 'A',
};

function weekdayWorkoutType(iso: string): WorkoutType {
  const weekday = getUtcWeekday(iso);
  switch (weekday) {
    case 1: // Monday
    case 5: // Friday
      return 'A';
    case 3: // Wednesday
      return 'B';
    case 2: // Tuesday
    case 6: // Saturday
      return 'walk';
    default: // Sunday, Thursday
      return 'rest';
  }
}

function reasonFor(type: WorkoutType, isExamHeavy: boolean): string {
  if (type === 'intro') {
    return '初日は10分だけ動く導入メニューです。';
  }
  if (isExamHeavy && type === 'short') {
    return '試験期間なので、10分版で十分です。無理をしないことが今月の目的です。';
  }
  switch (type) {
    case 'A':
    case 'B':
      return `今日は筋トレ${type}の予定日です。あと2〜3回できる余裕を残しましょう。`;
    case 'short':
      return '今日は10分版の予定日です。短時間でつなぎましょう。';
    case 'walk':
      return '歩行・ストレッチで軽く体を動かす日です。';
    case 'rest':
    default:
      return '休息の日です。計画の一部として、しっかり休みましょう。';
  }
}

export function generateJulyPlan(): DailyPlan[] {
  const plans: DailyPlan[] = [];

  for (let date = JULY_PLAN_START_DATE; date <= JULY_PLAN_END_DATE; date = addDaysToIsoDate(date, 1)) {
    const isExamHeavy = date >= EXAM_HEAVY_FROM_DATE;
    const override = EXPLICIT_OVERRIDES[date];

    let type: WorkoutType;
    if (override) {
      type = override;
    } else {
      type = weekdayWorkoutType(date);
      // Downgrade scheduled A/B sessions to the short version during the
      // exam-heavy back half of July so no fatigue is carried into exams.
      if (isExamHeavy && (type === 'A' || type === 'B')) {
        type = 'short';
      }
    }

    plans.push({
      date,
      recommendedWorkoutType: type,
      reason: reasonFor(type, isExamHeavy),
      status: 'planned',
    });
  }

  return plans;
}

import { Card } from '../ui/Card';
import type { WorkoutStatus } from '../../domain/workoutTypes';
import { getUtcWeekday } from '../../domain/schedule';

const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

const STATUS_DOT_CLASS: Record<WorkoutStatus, string> = {
  planned: 'bg-neutral-200 dark:bg-neutral-700',
  completed: 'bg-brand-500',
  short_done: 'bg-brand-300',
  rest: 'bg-sky-400',
  skipped: 'bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700',
  rescheduled: 'bg-violet-400',
};

const STATUS_GLYPH: Record<WorkoutStatus, string> = {
  planned: '',
  completed: '✓',
  short_done: '✓',
  rest: '◦',
  skipped: '',
  rescheduled: '↻',
};

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  status: WorkoutStatus;
}

interface MonthlyCalendarProps {
  days: CalendarDay[];
}

// Monday-first weekday index (0=Mon..6=Sun) derived from the JS Sunday-first getUtcWeekday.
function toMondayFirstIndex(dateIso: string): number {
  const sundayFirst = getUtcWeekday(dateIso);
  return sundayFirst === 0 ? 6 : sundayFirst - 1;
}

export function MonthlyCalendar({ days }: MonthlyCalendarProps) {
  const leadingBlankCount = days.length > 0 ? toMondayFirstIndex(days[0].date) : 0;
  const leadingBlanks = Array.from({ length: leadingBlankCount });

  return (
    <Card>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-400 dark:text-neutral-500 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-xs text-neutral-700 dark:text-neutral-200"
          >
            <span>{day.dayOfMonth}</span>
            <span
              aria-label={day.status}
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${STATUS_DOT_CLASS[day.status]}`}
            >
              {STATUS_GLYPH[day.status]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

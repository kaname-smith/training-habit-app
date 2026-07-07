import type { WorkoutStatus } from '../../domain/workoutTypes';

const STATUS_LABEL: Record<WorkoutStatus, string> = {
  planned: '予定',
  completed: '完了',
  short_done: '10分版完了',
  rest: '休息',
  skipped: '未記録',
  rescheduled: '変更済み',
};

// Each status pairs a distinct icon glyph with its color so meaning never
// depends on color alone (docs/03_ui_ux_spec.md §7 accessibility requirement).
const STATUS_GLYPH: Record<WorkoutStatus, string> = {
  planned: '·',
  completed: '✓',
  short_done: '✓',
  rest: '◦',
  skipped: '',
  rescheduled: '↻',
};

const STATUS_CLASSES: Record<WorkoutStatus, string> = {
  planned: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  completed: 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200',
  short_done: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  rest: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  skipped: 'bg-neutral-50 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600',
  rescheduled: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
};

interface StatusBadgeProps {
  status: WorkoutStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      <span aria-hidden="true">{STATUS_GLYPH[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}

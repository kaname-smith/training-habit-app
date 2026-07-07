import { Card } from '../ui/Card';
import type { TodayFatigueInput } from '../../app/hooks';
import type { SleepLevel, FatigueLevel } from '../../domain/habitTypes';

const SLEEP_OPTIONS: { value: SleepLevel; label: string }[] = [
  { value: 'enough', label: '十分' },
  { value: 'low', label: '少なめ' },
  { value: 'very_low', label: 'かなり少ない' },
];

const FATIGUE_OPTIONS: { value: FatigueLevel; label: string }[] = [
  { value: 'light', label: '軽い' },
  { value: 'normal', label: '普通' },
  { value: 'heavy', label: '重い' },
];

interface FatigueCheckCardProps {
  value: TodayFatigueInput;
  onChange: (next: TodayFatigueInput) => void;
}

function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          aria-pressed={selected === option.value}
          className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium ${
            selected === option.value
              ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
              : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FatigueCheckCard({ value, onChange }: FatigueCheckCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">睡眠・疲労チェック</p>

      <div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">睡眠</p>
        <SegmentedControl
          options={SLEEP_OPTIONS}
          selected={value.sleepLevel}
          onSelect={(sleepLevel) => onChange({ ...value, sleepLevel })}
        />
      </div>

      <div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">疲労</p>
        <SegmentedControl
          options={FATIGUE_OPTIONS}
          selected={value.fatigueLevel}
          onSelect={(fatigueLevel) => onChange({ ...value, fatigueLevel })}
        />
      </div>

      <label className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-200">
        明日試験がある
        <input
          type="checkbox"
          checked={value.examTomorrow}
          onChange={(e) => onChange({ ...value, examTomorrow: e.target.checked })}
          className="h-5 w-5"
        />
      </label>

      <label className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-200">
        痛み・体調不良がある
        <input
          type="checkbox"
          checked={value.hasPainOrSickness}
          onChange={(e) => onChange({ ...value, hasPainOrSickness: e.target.checked })}
          className="h-5 w-5"
        />
      </label>
    </Card>
  );
}

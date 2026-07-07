import { useState } from 'react';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
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
              ? 'border-[var(--accent)] bg-[var(--accent-surface)] text-[var(--accent)]'
              : 'border-[var(--border-color)] text-[var(--text-secondary)]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function summarize(value: TodayFatigueInput): string {
  const sleepLabel = SLEEP_OPTIONS.find((o) => o.value === value.sleepLevel)?.label;
  const fatigueLabel = FATIGUE_OPTIONS.find((o) => o.value === value.fatigueLevel)?.label;
  const parts = [`睡眠${sleepLabel}`, `疲労${fatigueLabel}`];
  if (value.examTomorrow) parts.push('明日試験あり');
  if (value.hasPainOrSickness) parts.push('体調不良あり');
  return parts.join(' ・ ');
}

export function FatigueCheckCard({ value, onChange }: FatigueCheckCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">睡眠・疲労チェック</p>
          <p className="text-xs text-[var(--text-muted)]">{summarize(value)}</p>
        </div>
        <Icon
          name="chevronDown"
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">睡眠</p>
            <SegmentedControl
              options={SLEEP_OPTIONS}
              selected={value.sleepLevel}
              onSelect={(sleepLevel) => onChange({ ...value, sleepLevel })}
            />
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">疲労</p>
            <SegmentedControl
              options={FATIGUE_OPTIONS}
              selected={value.fatigueLevel}
              onSelect={(fatigueLevel) => onChange({ ...value, fatigueLevel })}
            />
          </div>

          <label className="flex items-center justify-between text-sm text-[var(--text-primary)]">
            明日試験がある
            <input
              type="checkbox"
              checked={value.examTomorrow}
              onChange={(e) => onChange({ ...value, examTomorrow: e.target.checked })}
              className="h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between text-sm text-[var(--text-primary)]">
            痛み・体調不良がある
            <input
              type="checkbox"
              checked={value.hasPainOrSickness}
              onChange={(e) => onChange({ ...value, hasPainOrSickness: e.target.checked })}
              className="h-5 w-5"
            />
          </label>
        </div>
      )}
    </Card>
  );
}

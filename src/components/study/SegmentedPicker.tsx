export interface SegmentedPickerOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedPickerProps<T extends string | number> {
  options: SegmentedPickerOption<T>[];
  // undefined means "not yet rated" (e.g. Course.currentMastery before the
  // user has set it) — deliberately not defaulted to an option, since a
  // fabricated default would hide a real unknown from confidenceAudit.
  value: T | undefined;
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

// Generic segmented button-row picker, styled like the experience-level
// picker on OnboardingPage. Reused across ConfidenceLevel, ExamFormat,
// FiveLevelScale, and MaterialStatus so each doesn't need its own markup.
export function SegmentedPicker<T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel,
}: SegmentedPickerProps<T>) {
  return (
    <div className={`flex gap-2 ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            value === option.value
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

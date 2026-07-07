interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  'aria-label': string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 5,
  unit = '',
  'aria-label': ariaLabel,
}: StepperProps) {
  function clamp(next: number): number {
    return Math.min(max, Math.max(min, next));
  }

  return (
    <div className="flex items-center gap-3" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label="減らす"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] text-lg font-medium text-[var(--text-primary)] disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-14 text-center text-lg font-semibold text-[var(--text-primary)]">
        {value}
        {unit}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label="増やす"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] text-lg font-medium text-[var(--text-primary)] disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

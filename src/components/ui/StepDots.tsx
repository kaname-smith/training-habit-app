interface StepDotsProps {
  total: number;
  currentIndex: number;
}

export function StepDots({ total, currentIndex }: StepDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="img"
      aria-label={`種目 ${currentIndex + 1} / ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === currentIndex
              ? 'w-4 bg-[var(--accent)]'
              : i < currentIndex
                ? 'w-2 bg-[var(--accent)]'
                : 'w-2 bg-[var(--border-color)]'
          }`}
        />
      ))}
    </div>
  );
}

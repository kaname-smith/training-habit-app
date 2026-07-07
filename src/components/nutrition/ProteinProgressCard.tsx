import { Card } from '../ui/Card';
import { calculateProteinTarget, calculateTotalProteinG } from '../../domain/calculations';
import type { NutritionLog } from '../../domain/nutritionTypes';

interface ProteinProgressCardProps {
  bodyWeightKg: number;
  proteinPerShakeG: number;
  log?: NutritionLog;
}

export function ProteinProgressCard({ bodyWeightKg, proteinPerShakeG, log }: ProteinProgressCardProps) {
  const target = calculateProteinTarget(bodyWeightKg);
  const total = log
    ? calculateTotalProteinG(log, proteinPerShakeG)
    : 0;
  const progressRatio = target.maxG > 0 ? Math.min(total / target.maxG, 1) : 0;

  return (
    <Card>
      <p className="text-xs text-[var(--text-muted)]">今日のタンパク質</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
        {Math.round(total)}g
        <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">
          / 目標 {Math.round(target.minG)}〜{Math.round(target.maxG)}g
        </span>
      </p>
      <div className="mt-2 h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progressRatio * 100}%` }} />
      </div>
    </Card>
  );
}

import type { NutritionLog, ProteinTarget } from './nutritionTypes';

const JULY_PROTEIN_MIN_G_PER_KG = 1.4;
const JULY_PROTEIN_MAX_G_PER_KG = 1.6;
const GENERAL_ATHLETE_UPPER_G_PER_KG = 2.0;

export function calculateProteinTarget(bodyWeightKg: number): ProteinTarget {
  return {
    minG: bodyWeightKg * JULY_PROTEIN_MIN_G_PER_KG,
    maxG: bodyWeightKg * JULY_PROTEIN_MAX_G_PER_KG,
    generalUpperG: bodyWeightKg * GENERAL_ATHLETE_UPPER_G_PER_KG,
  };
}

export function calculateProteinFromShakes(
  shakeCount: number,
  proteinPerShakeG: number,
): number {
  return shakeCount * proteinPerShakeG;
}

export function calculateTotalProteinG(
  log: Pick<NutritionLog, 'proteinFromMealsG' | 'shakeCount' | 'manualProteinG'>,
  proteinPerShakeG: number,
): number {
  const fromShakes = calculateProteinFromShakes(log.shakeCount, proteinPerShakeG);
  return log.proteinFromMealsG + fromShakes + (log.manualProteinG ?? 0);
}

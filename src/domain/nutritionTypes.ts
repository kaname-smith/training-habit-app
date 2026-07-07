export interface NutritionLog {
  date: string;
  proteinFromMealsG: number;
  shakeCount: number;
  manualProteinG?: number;
}

export interface ProteinTarget {
  minG: number;
  maxG: number;
  generalUpperG: number;
}

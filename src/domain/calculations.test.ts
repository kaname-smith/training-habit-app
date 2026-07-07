import { describe, it, expect } from 'vitest';
import {
  calculateProteinTarget,
  calculateProteinFromShakes,
  calculateTotalProteinG,
} from './calculations';

describe('calculateProteinTarget', () => {
  it('matches the documented reference table', () => {
    expect(calculateProteinTarget(55)).toEqual({ minG: 77, maxG: 88, generalUpperG: 110 });
    expect(calculateProteinTarget(60)).toEqual({ minG: 84, maxG: 96, generalUpperG: 120 });
    expect(calculateProteinTarget(65)).toEqual({ minG: 91, maxG: 104, generalUpperG: 130 });
    expect(calculateProteinTarget(70)).toEqual({ minG: 98, maxG: 112, generalUpperG: 140 });
  });

  it('returns zero for zero body weight', () => {
    expect(calculateProteinTarget(0)).toEqual({ minG: 0, maxG: 0, generalUpperG: 0 });
  });
});

describe('calculateProteinFromShakes', () => {
  it('multiplies shake count by protein per shake', () => {
    expect(calculateProteinFromShakes(2, 20)).toBe(40);
    expect(calculateProteinFromShakes(0, 20)).toBe(0);
  });
});

describe('calculateTotalProteinG', () => {
  it('sums meals, shakes, and manual entry', () => {
    const total = calculateTotalProteinG(
      { proteinFromMealsG: 40, shakeCount: 2, manualProteinG: 10 },
      20,
    );
    expect(total).toBe(40 + 40 + 10);
  });

  it('treats missing manual entry as zero', () => {
    const total = calculateTotalProteinG(
      { proteinFromMealsG: 30, shakeCount: 1 },
      20,
    );
    expect(total).toBe(50);
  });
});

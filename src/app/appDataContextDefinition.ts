import { createContext } from 'react';
import type { UserProfile, FatigueCheckIn } from '../domain/habitTypes';
import type { DailyPlan, WorkoutLog } from '../domain/workoutTypes';
import type { NutritionLog } from '../domain/nutritionTypes';
import type { AppSettings } from '../storage/repositories';

export interface AppDataContextValue {
  loading: boolean;
  profile: UserProfile | null;
  saveProfile: (profile: UserProfile) => Promise<void>;
  dailyPlans: DailyPlan[];
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: WorkoutLog) => Promise<void>;
  updateWorkoutLog: (id: string, updater: (log: WorkoutLog) => WorkoutLog) => Promise<void>;
  nutritionLogs: NutritionLog[];
  upsertNutritionLog: (log: NutritionLog) => Promise<void>;
  fatigueCheckIns: FatigueCheckIn[];
  upsertFatigueCheckIn: (entry: FatigueCheckIn) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => Promise<void>;
  resetAll: () => Promise<void>;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

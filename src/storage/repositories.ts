import { storageClient } from './storageClient';
import { STORAGE_KEYS } from './migrations';
import type { UserProfile, FatigueCheckIn } from '../domain/habitTypes';
import type { DailyPlan, WorkoutLog } from '../domain/workoutTypes';
import type { NutritionLog } from '../domain/nutritionTypes';

export const userProfileRepository = {
  get: () => storageClient.get<UserProfile>(STORAGE_KEYS.userProfile),
  set: (profile: UserProfile) => storageClient.set(STORAGE_KEYS.userProfile, profile),
  remove: () => storageClient.remove(STORAGE_KEYS.userProfile),
};

export const dailyPlansRepository = {
  get: async () => (await storageClient.get<DailyPlan[]>(STORAGE_KEYS.dailyPlans)) ?? [],
  set: (plans: DailyPlan[]) => storageClient.set(STORAGE_KEYS.dailyPlans, plans),
};

export const workoutLogsRepository = {
  get: async () => (await storageClient.get<WorkoutLog[]>(STORAGE_KEYS.workoutLogs)) ?? [],
  set: (logs: WorkoutLog[]) => storageClient.set(STORAGE_KEYS.workoutLogs, logs),
};

export const nutritionLogsRepository = {
  get: async () => (await storageClient.get<NutritionLog[]>(STORAGE_KEYS.nutritionLogs)) ?? [],
  set: (logs: NutritionLog[]) => storageClient.set(STORAGE_KEYS.nutritionLogs, logs),
};

export const fatigueCheckInsRepository = {
  get: async () => (await storageClient.get<FatigueCheckIn[]>(STORAGE_KEYS.fatigueCheckIns)) ?? [],
  set: (entries: FatigueCheckIn[]) => storageClient.set(STORAGE_KEYS.fatigueCheckIns, entries),
};

export type NotificationTime = 'morning' | 'evening' | 'night';

export interface AppSettings {
  notificationsEnabled: boolean;
  notificationTime: NotificationTime;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notificationTime: 'evening',
};

export const settingsRepository = {
  get: async () => (await storageClient.get<AppSettings>(STORAGE_KEYS.settings)) ?? DEFAULT_SETTINGS,
  set: (settings: AppSettings) => storageClient.set(STORAGE_KEYS.settings, settings),
};

export interface DataExport {
  exportedAt: string;
  profile: UserProfile | null;
  workoutLogs: WorkoutLog[];
  nutritionLogs: NutritionLog[];
  fatigueCheckIns: FatigueCheckIn[];
}

export async function exportAllData(): Promise<DataExport> {
  const [profile, workoutLogs, nutritionLogs, fatigueCheckIns] = await Promise.all([
    userProfileRepository.get(),
    workoutLogsRepository.get(),
    nutritionLogsRepository.get(),
    fatigueCheckInsRepository.get(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile,
    workoutLogs,
    nutritionLogs,
    fatigueCheckIns,
  };
}

export async function resetAllData(): Promise<void> {
  await Promise.all([
    storageClient.remove(STORAGE_KEYS.userProfile),
    storageClient.remove(STORAGE_KEYS.dailyPlans),
    storageClient.remove(STORAGE_KEYS.workoutLogs),
    storageClient.remove(STORAGE_KEYS.nutritionLogs),
    storageClient.remove(STORAGE_KEYS.fatigueCheckIns),
    storageClient.remove(STORAGE_KEYS.settings),
  ]);
}

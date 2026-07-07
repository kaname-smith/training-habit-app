import { storageClient } from './storageClient';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from './migrations';
import type { UserProfile, FatigueCheckIn, ExperienceLevel, SleepLevel, FatigueLevel } from '../domain/habitTypes';
import type { DailyPlan, WorkoutLog, WorkoutType, PerceivedEffort } from '../domain/workoutTypes';
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
  schemaVersion: number;
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
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    workoutLogs,
    nutritionLogs,
    fatigueCheckIns,
  };
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'returning', 'active'];
const SLEEP_LEVELS: SleepLevel[] = ['enough', 'low', 'very_low'];
const FATIGUE_LEVELS: FatigueLevel[] = ['light', 'normal', 'heavy'];
const WORKOUT_TYPES: WorkoutType[] = ['intro', 'A', 'B', 'short', 'rest', 'walk'];
const PERCEIVED_EFFORTS: PerceivedEffort[] = ['easy', 'good', 'hard', 'too_hard'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.bodyWeightKg === 'number' &&
    EXPERIENCE_LEVELS.includes(value.experienceLevel as ExperienceLevel) &&
    typeof value.examMode === 'boolean' &&
    typeof value.examEndDate === 'string' &&
    typeof value.proteinPerShakeG === 'number' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

function isValidWorkoutLog(value: unknown): value is WorkoutLog {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.date === 'string' &&
    WORKOUT_TYPES.includes(value.workoutType as WorkoutType) &&
    Array.isArray(value.exerciseLogs) &&
    (value.effort === undefined || PERCEIVED_EFFORTS.includes(value.effort as PerceivedEffort))
  );
}

function isValidNutritionLog(value: unknown): value is NutritionLog {
  if (!isRecord(value)) return false;
  return (
    typeof value.date === 'string' &&
    typeof value.proteinFromMealsG === 'number' &&
    typeof value.shakeCount === 'number'
  );
}

function isValidFatigueCheckIn(value: unknown): value is FatigueCheckIn {
  if (!isRecord(value)) return false;
  return (
    typeof value.date === 'string' &&
    SLEEP_LEVELS.includes(value.sleepLevel as SleepLevel) &&
    FATIGUE_LEVELS.includes(value.fatigueLevel as FatigueLevel) &&
    typeof value.examTomorrow === 'boolean' &&
    typeof value.hasPainOrSickness === 'boolean'
  );
}

export type DataImportValidation =
  | { ok: true; data: DataExport }
  | { ok: false; reason: string };

/**
 * Pure validation, no storage access — lets the caller reject a bad file
 * (and show why) before anything currently saved is touched.
 */
export function validateDataExport(raw: unknown): DataImportValidation {
  if (!isRecord(raw)) {
    return { ok: false, reason: 'JSONの形式が正しくありません。' };
  }
  if (raw.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `対応していないデータ形式です(schemaVersion: ${String(raw.schemaVersion)})。このアプリのバージョンでエクスポートしたファイルを選んでください。`,
    };
  }
  if (typeof raw.exportedAt !== 'string') {
    return { ok: false, reason: 'エクスポート日時の情報が読み取れません。' };
  }
  if (raw.profile !== null && !isValidProfile(raw.profile)) {
    return { ok: false, reason: 'プロフィール情報の形式が正しくありません。' };
  }
  if (!Array.isArray(raw.workoutLogs) || !raw.workoutLogs.every(isValidWorkoutLog)) {
    return { ok: false, reason: 'トレーニング記録の形式が正しくありません。' };
  }
  if (!Array.isArray(raw.nutritionLogs) || !raw.nutritionLogs.every(isValidNutritionLog)) {
    return { ok: false, reason: '栄養記録の形式が正しくありません。' };
  }
  if (!Array.isArray(raw.fatigueCheckIns) || !raw.fatigueCheckIns.every(isValidFatigueCheckIn)) {
    return { ok: false, reason: '疲労チェックの記録の形式が正しくありません。' };
  }

  return {
    ok: true,
    data: {
      schemaVersion: raw.schemaVersion,
      exportedAt: raw.exportedAt,
      profile: raw.profile as UserProfile | null,
      workoutLogs: raw.workoutLogs,
      nutritionLogs: raw.nutritionLogs,
      fatigueCheckIns: raw.fatigueCheckIns,
    },
  };
}

export type DataImportResult = { ok: true } | { ok: false; reason: string };

/**
 * Validates first and only writes to storage if the whole file is valid —
 * an unexpected/corrupt file never partially overwrites existing data.
 */
export async function importAllData(raw: unknown): Promise<DataImportResult> {
  const validation = validateDataExport(raw);
  if (!validation.ok) {
    return validation;
  }

  const { data } = validation;
  await Promise.all([
    data.profile ? userProfileRepository.set(data.profile) : userProfileRepository.remove(),
    workoutLogsRepository.set(data.workoutLogs),
    nutritionLogsRepository.set(data.nutritionLogs),
    fatigueCheckInsRepository.set(data.fatigueCheckIns),
  ]);

  return { ok: true };
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

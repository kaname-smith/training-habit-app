import { storageClient } from './storageClient';

export const STORAGE_KEYS = {
  userProfile: 'studyfit:userProfile',
  dailyPlans: 'studyfit:dailyPlans',
  workoutLogs: 'studyfit:workoutLogs',
  nutritionLogs: 'studyfit:nutritionLogs',
  fatigueCheckIns: 'studyfit:fatigueCheckIns',
  settings: 'studyfit:settings',
  schemaVersion: 'studyfit:schemaVersion',
} as const;

export const CURRENT_SCHEMA_VERSION = 1;

export async function ensureSchemaVersion(): Promise<number> {
  const version = await storageClient.get<number>(STORAGE_KEYS.schemaVersion);
  if (version === null) {
    await storageClient.set(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
    return CURRENT_SCHEMA_VERSION;
  }
  // Future schema migrations run here when CURRENT_SCHEMA_VERSION increases.
  return version;
}

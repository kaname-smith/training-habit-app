import { storageClient } from './storageClient';

export const STORAGE_KEYS = {
  userProfile: 'studyfit:userProfile',
  dailyPlans: 'studyfit:dailyPlans',
  workoutLogs: 'studyfit:workoutLogs',
  nutritionLogs: 'studyfit:nutritionLogs',
  fatigueCheckIns: 'studyfit:fatigueCheckIns',
  settings: 'studyfit:settings',
  schemaVersion: 'studyfit:schemaVersion',
  studyCourses: 'studyfit:studyCourses',
  studyExamInfos: 'studyfit:studyExamInfos',
  studyMaterials: 'studyfit:studyMaterials',
  studyTasks: 'studyfit:studyTasks',
  studyAvailabilityBlocks: 'studyfit:studyAvailabilityBlocks',
} as const;

/**
 * Stays at 1: the Study Planner keys above are purely additive (new keys,
 * no change to any existing field's meaning/type/structure), so existing
 * local data and old exports remain valid without a version bump or
 * migration. Bump this only when an existing field's shape changes or a
 * migration is needed to transform already-stored data (docs/24 §7).
 */
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

import { storageClient } from './storageClient';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from './migrations';
import type { UserProfile, FatigueCheckIn, ExperienceLevel, SleepLevel, FatigueLevel } from '../domain/habitTypes';
import type { DailyPlan, WorkoutLog, WorkoutType, PerceivedEffort } from '../domain/workoutTypes';
import type { NutritionLog } from '../domain/nutritionTypes';
import type {
  Course,
  ConfidenceLevel,
  ExamFormat,
  ExamInfo,
  MaterialItem,
  MaterialKind,
  MaterialStatus,
  StudyTask,
  StudyTaskType,
  StudyTaskStatus,
  AvailabilityBlock,
  AvailabilityBlockSource,
} from '../domain/study/studyTypes';
import {
  studyCoursesRepository,
  studyExamInfosRepository,
  studyMaterialsRepository,
  studyTasksRepository,
  studyAvailabilityBlocksRepository,
} from './studyRepositories';

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
  studyCourses: Course[];
  studyExamInfos: ExamInfo[];
  studyMaterials: MaterialItem[];
  studyTasks: StudyTask[];
  studyAvailabilityBlocks: AvailabilityBlock[];
}

export async function exportAllData(): Promise<DataExport> {
  const [
    profile,
    workoutLogs,
    nutritionLogs,
    fatigueCheckIns,
    studyCourses,
    studyExamInfos,
    studyMaterials,
    studyTasks,
    studyAvailabilityBlocks,
  ] = await Promise.all([
    userProfileRepository.get(),
    workoutLogsRepository.get(),
    nutritionLogsRepository.get(),
    fatigueCheckInsRepository.get(),
    studyCoursesRepository.get(),
    studyExamInfosRepository.get(),
    studyMaterialsRepository.get(),
    studyTasksRepository.get(),
    studyAvailabilityBlocksRepository.get(),
  ]);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    workoutLogs,
    nutritionLogs,
    fatigueCheckIns,
    studyCourses,
    studyExamInfos,
    studyMaterials,
    studyTasks,
    studyAvailabilityBlocks,
  };
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'returning', 'active'];
const SLEEP_LEVELS: SleepLevel[] = ['enough', 'low', 'very_low'];
const FATIGUE_LEVELS: FatigueLevel[] = ['light', 'normal', 'heavy'];
const WORKOUT_TYPES: WorkoutType[] = ['intro', 'A', 'B', 'short', 'rest', 'walk'];
const PERCEIVED_EFFORTS: PerceivedEffort[] = ['easy', 'good', 'hard', 'too_hard'];
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['unknown', 'low', 'medium', 'confirmed'];
const EXAM_FORMATS: ExamFormat[] = ['written', 'oral', 'report', 'unknown'];
const MATERIAL_KINDS: MaterialKind[] = [
  'syllabus',
  'lecture_slides',
  'textbook_scope',
  'assignments',
  'past_exams',
  'peer_or_instructor_confirmation',
  'other',
];
const MATERIAL_STATUSES: MaterialStatus[] = ['missing', 'partial', 'complete', 'not_applicable'];
const STUDY_TASK_TYPES: StudyTaskType[] = ['discovery', 'learning', 'practice', 'review', 'administrative'];
const STUDY_TASK_STATUSES: StudyTaskStatus[] = [
  'backlog',
  'ready',
  'scheduled',
  'in_progress',
  'done',
  'blocked',
];
const AVAILABILITY_BLOCK_SOURCES: AvailabilityBlockSource[] = ['manual', 'calendar', 'recurring_schedule'];

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

function isValidCourse(value: unknown): value is Course {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string';
}

function isValidExamInfo(value: unknown): value is ExamInfo {
  if (!isRecord(value)) return false;
  return (
    typeof value.courseId === 'string' &&
    CONFIDENCE_LEVELS.includes(value.examDateConfidence as ConfidenceLevel) &&
    CONFIDENCE_LEVELS.includes(value.scopeConfidence as ConfidenceLevel) &&
    (value.format === undefined || EXAM_FORMATS.includes(value.format as ExamFormat))
  );
}

function isValidMaterialItem(value: unknown): value is MaterialItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.courseId === 'string' &&
    MATERIAL_KINDS.includes(value.kind as MaterialKind) &&
    MATERIAL_STATUSES.includes(value.status as MaterialStatus)
  );
}

function isValidStudyTask(value: unknown): value is StudyTask {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.courseId === 'string' &&
    typeof value.title === 'string' &&
    STUDY_TASK_TYPES.includes(value.taskType as StudyTaskType) &&
    typeof value.estimatedMinutes === 'number' &&
    typeof value.remainingMinutes === 'number' &&
    Array.isArray(value.prerequisiteTaskIds) &&
    STUDY_TASK_STATUSES.includes(value.status as StudyTaskStatus)
  );
}

function isValidAvailabilityBlock(value: unknown): value is AvailabilityBlock {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.start === 'string' &&
    typeof value.end === 'string' &&
    AVAILABILITY_BLOCK_SOURCES.includes(value.source as AvailabilityBlockSource)
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

  // Study Planner fields are optional on the raw input: exports made before
  // Study Planner existed have none of these keys at all. Absent means "no
  // Study data yet" (defaults to []), not an invalid file — this is what
  // lets a pre-Study export still import successfully.
  const studyCourses = raw.studyCourses ?? [];
  if (!Array.isArray(studyCourses) || !studyCourses.every(isValidCourse)) {
    return { ok: false, reason: 'Studyの科目情報の形式が正しくありません。' };
  }
  const studyExamInfos = raw.studyExamInfos ?? [];
  if (!Array.isArray(studyExamInfos) || !studyExamInfos.every(isValidExamInfo)) {
    return { ok: false, reason: 'Studyの試験情報の形式が正しくありません。' };
  }
  const studyMaterials = raw.studyMaterials ?? [];
  if (!Array.isArray(studyMaterials) || !studyMaterials.every(isValidMaterialItem)) {
    return { ok: false, reason: 'Studyの資料情報の形式が正しくありません。' };
  }
  const studyTasks = raw.studyTasks ?? [];
  if (!Array.isArray(studyTasks) || !studyTasks.every(isValidStudyTask)) {
    return { ok: false, reason: 'Studyの学習タスクの形式が正しくありません。' };
  }
  const studyAvailabilityBlocks = raw.studyAvailabilityBlocks ?? [];
  if (!Array.isArray(studyAvailabilityBlocks) || !studyAvailabilityBlocks.every(isValidAvailabilityBlock)) {
    return { ok: false, reason: 'Studyの固定予定の形式が正しくありません。' };
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
      studyCourses,
      studyExamInfos,
      studyMaterials,
      studyTasks,
      studyAvailabilityBlocks,
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
    studyCoursesRepository.set(data.studyCourses),
    studyExamInfosRepository.set(data.studyExamInfos),
    studyMaterialsRepository.set(data.studyMaterials),
    studyTasksRepository.set(data.studyTasks),
    studyAvailabilityBlocksRepository.set(data.studyAvailabilityBlocks),
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
    storageClient.remove(STORAGE_KEYS.studyCourses),
    storageClient.remove(STORAGE_KEYS.studyExamInfos),
    storageClient.remove(STORAGE_KEYS.studyMaterials),
    storageClient.remove(STORAGE_KEYS.studyTasks),
    storageClient.remove(STORAGE_KEYS.studyAvailabilityBlocks),
  ]);
}

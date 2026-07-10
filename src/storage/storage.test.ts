import { describe, it, expect, beforeEach } from 'vitest';
import { storageClient } from './storageClient';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION, ensureSchemaVersion } from './migrations';
import {
  userProfileRepository,
  workoutLogsRepository,
  nutritionLogsRepository,
  fatigueCheckInsRepository,
  settingsRepository,
  resetAllData,
  exportAllData,
  importAllData,
  validateDataExport,
  type DataExport,
} from './repositories';
import {
  studyCoursesRepository,
  studyExamInfosRepository,
  studyMaterialsRepository,
  studyTasksRepository,
  studyAvailabilityBlocksRepository,
} from './studyRepositories';
import type { UserProfile } from '../domain/habitTypes';
import type { WorkoutLog } from '../domain/workoutTypes';
import type { Course, ExamInfo, MaterialItem, StudyTask, AvailabilityBlock } from '../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

describe('storageClient', () => {
  it('returns null for a missing key', async () => {
    expect(await storageClient.get('missing:key')).toBeNull();
  });

  it('round-trips a value through set/get', async () => {
    await storageClient.set('test:key', { a: 1 });
    expect(await storageClient.get('test:key')).toEqual({ a: 1 });
  });

  it('removes a value', async () => {
    await storageClient.set('test:key', 42);
    await storageClient.remove('test:key');
    expect(await storageClient.get('test:key')).toBeNull();
  });

  it('recovers to null on corrupted JSON instead of throwing', async () => {
    window.localStorage.setItem('test:corrupt', '{not valid json');
    expect(await storageClient.get('test:corrupt')).toBeNull();
  });
});

describe('ensureSchemaVersion', () => {
  it('initializes the schema version when absent', async () => {
    const version = await ensureSchemaVersion();
    expect(version).toBe(CURRENT_SCHEMA_VERSION);
    expect(await storageClient.get(STORAGE_KEYS.schemaVersion)).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('leaves an existing schema version untouched', async () => {
    await storageClient.set(STORAGE_KEYS.schemaVersion, 1);
    const version = await ensureSchemaVersion();
    expect(version).toBe(1);
  });
});

describe('repositories', () => {
  it('userProfileRepository persists under the studyfit:userProfile key', async () => {
    const profile: UserProfile = {
      id: 'u1',
      bodyWeightKg: 60,
      experienceLevel: 'beginner',
      examMode: true,
      examEndDate: '2026-07-31',
      proteinPerShakeG: 20,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    };
    await userProfileRepository.set(profile);
    expect(await storageClient.get(STORAGE_KEYS.userProfile)).toEqual(profile);
    expect(await userProfileRepository.get()).toEqual(profile);
  });

  it('workoutLogsRepository defaults to an empty array', async () => {
    expect(await workoutLogsRepository.get()).toEqual([]);
  });

  it('settingsRepository returns defaults when unset', async () => {
    const settings = await settingsRepository.get();
    expect(settings.notificationsEnabled).toBe(false);
    expect(settings.notificationTime).toBe('evening');
  });

  it('resetAllData clears profile, logs, and settings', async () => {
    const profile: UserProfile = {
      id: 'u1',
      bodyWeightKg: 60,
      experienceLevel: 'beginner',
      examMode: true,
      examEndDate: '2026-07-31',
      proteinPerShakeG: 20,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    };
    const logs: WorkoutLog[] = [
      { id: 'w1', date: '2026-07-07', workoutType: 'intro', exerciseLogs: [] },
    ];
    await userProfileRepository.set(profile);
    await workoutLogsRepository.set(logs);

    await resetAllData();

    expect(await userProfileRepository.get()).toBeNull();
    expect(await workoutLogsRepository.get()).toEqual([]);
  });

  it('resetAllData also clears Study Planner collections', async () => {
    await studyCoursesRepository.set([{ id: 'c1', name: '材料力学' }]);
    await studyTasksRepository.set([
      {
        id: 't1',
        courseId: 'c1',
        title: '試験日を確認する',
        taskType: 'discovery',
        estimatedMinutes: 15,
        remainingMinutes: 15,
        prerequisiteTaskIds: [],
        importance: 5,
        uncertainty: 5,
        status: 'ready',
      },
    ]);

    await resetAllData();

    expect(await studyCoursesRepository.get()).toEqual([]);
    expect(await studyTasksRepository.get()).toEqual([]);
  });

  it('exportAllData bundles profile and logs together', async () => {
    const profile: UserProfile = {
      id: 'u1',
      bodyWeightKg: 60,
      experienceLevel: 'beginner',
      examMode: true,
      examEndDate: '2026-07-31',
      proteinPerShakeG: 20,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    };
    await userProfileRepository.set(profile);

    const exported = await exportAllData();
    expect(exported.profile).toEqual(profile);
    expect(exported.workoutLogs).toEqual([]);
    expect(typeof exported.exportedAt).toBe('string');
    expect(exported.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('exportAllData includes Study Planner collections', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);

    const exported = await exportAllData();
    expect(exported.studyCourses).toEqual([course]);
    expect(exported.studyExamInfos).toEqual([]);
    expect(exported.studyMaterials).toEqual([]);
    expect(exported.studyTasks).toEqual([]);
    expect(exported.studyAvailabilityBlocks).toEqual([]);
  });
});

describe('studyRepositories', () => {
  it('default to an empty array when nothing is stored', async () => {
    expect(await studyCoursesRepository.get()).toEqual([]);
    expect(await studyExamInfosRepository.get()).toEqual([]);
    expect(await studyMaterialsRepository.get()).toEqual([]);
    expect(await studyTasksRepository.get()).toEqual([]);
    expect(await studyAvailabilityBlocksRepository.get()).toEqual([]);
  });

  it('round-trips courses, exam infos, and availability blocks', async () => {
    const course: Course = { id: 'c1', name: '材料力学', currentMastery: 3 };
    const examInfo: ExamInfo = {
      courseId: 'c1',
      examDateConfidence: 'low',
      scopeConfidence: 'unknown',
    };
    const block: AvailabilityBlock = {
      id: 'b1',
      label: '材料力学の講義',
      start: '2026-07-13T10:00:00.000Z',
      end: '2026-07-13T11:30:00.000Z',
      source: 'manual',
    };

    await studyCoursesRepository.set([course]);
    await studyExamInfosRepository.set([examInfo]);
    await studyAvailabilityBlocksRepository.set([block]);

    expect(await studyCoursesRepository.get()).toEqual([course]);
    expect(await studyExamInfosRepository.get()).toEqual([examInfo]);
    expect(await studyAvailabilityBlocksRepository.get()).toEqual([block]);
  });

  it('round-trips a MaterialItem whose status is not_applicable', async () => {
    const material: MaterialItem = {
      id: 'm1',
      courseId: 'c1',
      kind: 'past_exams',
      status: 'not_applicable',
      notes: '過去問は配布されていないと教員に確認済み',
    };

    await studyMaterialsRepository.set([material]);

    expect(await studyMaterialsRepository.get()).toEqual([material]);
  });

  it('round-trips a discovery StudyTask', async () => {
    const task: StudyTask = {
      id: 'discovery:c1:exam_date_unknown:',
      courseId: 'c1',
      title: '材料力学の試験日を確認する',
      taskType: 'discovery',
      estimatedMinutes: 15,
      remainingMinutes: 15,
      prerequisiteTaskIds: [],
      importance: 5,
      uncertainty: 5,
      status: 'ready',
    };

    await studyTasksRepository.set([task]);

    expect(await studyTasksRepository.get()).toEqual([task]);
  });
});

const VALID_PROFILE = {
  id: 'u1',
  bodyWeightKg: 60,
  experienceLevel: 'beginner' as const,
  examMode: true,
  examEndDate: '2026-07-31',
  proteinPerShakeG: 20,
  createdAt: '2026-07-07T00:00:00.000Z',
  updatedAt: '2026-07-07T00:00:00.000Z',
};

function validExport(overrides: Partial<DataExport> = {}): DataExport {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: '2026-07-08T00:00:00.000Z',
    profile: VALID_PROFILE,
    workoutLogs: [{ id: 'w1', date: '2026-07-07', workoutType: 'intro', exerciseLogs: [] }],
    nutritionLogs: [{ date: '2026-07-07', proteinFromMealsG: 30, shakeCount: 1 }],
    fatigueCheckIns: [
      {
        date: '2026-07-07',
        sleepLevel: 'enough',
        fatigueLevel: 'normal',
        examTomorrow: false,
        hasPainOrSickness: false,
      },
    ],
    studyCourses: [],
    studyExamInfos: [],
    studyMaterials: [],
    studyTasks: [],
    studyAvailabilityBlocks: [],
    ...overrides,
  };
}

// Represents a real export produced before Study Planner existed: no
// studyXxx keys at all, not even empty arrays.
function legacyExportWithoutStudyFields(): unknown {
  const full = validExport();
  return {
    schemaVersion: full.schemaVersion,
    exportedAt: full.exportedAt,
    profile: full.profile,
    workoutLogs: full.workoutLogs,
    nutritionLogs: full.nutritionLogs,
    fatigueCheckIns: full.fatigueCheckIns,
  };
}

describe('validateDataExport', () => {
  it('accepts a well-formed export', () => {
    const result = validateDataExport(validExport());
    expect(result.ok).toBe(true);
  });

  it('accepts a null profile (no onboarding completed)', () => {
    const result = validateDataExport(validExport({ profile: null }));
    expect(result.ok).toBe(true);
  });

  it.each([null, undefined, 'a string', 42, ['array']])('rejects non-object input: %s', (raw) => {
    const result = validateDataExport(raw);
    expect(result.ok).toBe(false);
  });

  it('rejects a mismatched schemaVersion', () => {
    const result = validateDataExport(validExport({ schemaVersion: 999 }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('schemaVersion');
  });

  it('rejects a malformed profile without touching the ok=false reason', () => {
    const result = validateDataExport(validExport({ profile: { nickname: 'missing fields' } as never }));
    expect(result.ok).toBe(false);
  });

  it('rejects workoutLogs that are not an array', () => {
    const result = validateDataExport(validExport({ workoutLogs: 'not-an-array' as never }));
    expect(result.ok).toBe(false);
  });

  it('rejects a workout log with an invalid workoutType', () => {
    const result = validateDataExport(
      validExport({ workoutLogs: [{ id: 'w1', date: '2026-07-07', workoutType: 'bogus', exerciseLogs: [] }] as never }),
    );
    expect(result.ok).toBe(false);
  });

  it('accepts an export with no Study Planner fields at all and defaults them to []', () => {
    const result = validateDataExport(legacyExportWithoutStudyFields());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.studyCourses).toEqual([]);
      expect(result.data.studyExamInfos).toEqual([]);
      expect(result.data.studyMaterials).toEqual([]);
      expect(result.data.studyTasks).toEqual([]);
      expect(result.data.studyAvailabilityBlocks).toEqual([]);
    }
  });

  it('accepts a MaterialItem whose status is not_applicable', () => {
    const result = validateDataExport(
      validExport({
        studyMaterials: [{ id: 'm1', courseId: 'c1', kind: 'past_exams', status: 'not_applicable' }],
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects a MaterialItem with an invalid status', () => {
    const result = validateDataExport(
      validExport({
        studyMaterials: [{ id: 'm1', courseId: 'c1', kind: 'past_exams', status: 'bogus' }] as never,
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects studyCourses that are not an array', () => {
    const result = validateDataExport(validExport({ studyCourses: 'not-an-array' as never }));
    expect(result.ok).toBe(false);
  });

  it('rejects a StudyTask with an invalid taskType', () => {
    const result = validateDataExport(
      validExport({
        studyTasks: [
          {
            id: 't1',
            courseId: 'c1',
            title: 'x',
            taskType: 'bogus',
            estimatedMinutes: 15,
            remainingMinutes: 15,
            prerequisiteTaskIds: [],
            importance: 5,
            uncertainty: 5,
            status: 'ready',
          },
        ] as never,
      }),
    );
    expect(result.ok).toBe(false);
  });
});

describe('importAllData', () => {
  it('writes a valid export into storage', async () => {
    const result = await importAllData(validExport());
    expect(result.ok).toBe(true);
    expect(await userProfileRepository.get()).toEqual(VALID_PROFILE);
    expect(await workoutLogsRepository.get()).toHaveLength(1);
    expect(await nutritionLogsRepository.get()).toHaveLength(1);
    expect(await fatigueCheckInsRepository.get()).toHaveLength(1);
  });

  it('does not touch existing data when the file is invalid', async () => {
    await userProfileRepository.set(VALID_PROFILE);
    await workoutLogsRepository.set([
      { id: 'existing', date: '2026-07-01', workoutType: 'A', exerciseLogs: [] },
    ]);

    const result = await importAllData({ schemaVersion: 999, garbage: true });

    expect(result.ok).toBe(false);
    expect(await userProfileRepository.get()).toEqual(VALID_PROFILE);
    expect(await workoutLogsRepository.get()).toEqual([
      { id: 'existing', date: '2026-07-01', workoutType: 'A', exerciseLogs: [] },
    ]);
  });

  it('does not touch existing data when only the Study fields are malformed', async () => {
    await userProfileRepository.set(VALID_PROFILE);
    await workoutLogsRepository.set([
      { id: 'existing', date: '2026-07-01', workoutType: 'A', exerciseLogs: [] },
    ]);
    await studyCoursesRepository.set([{ id: 'existing-course', name: '既存の科目' }]);

    const result = await importAllData(validExport({ studyCourses: 'not-an-array' as never }));

    expect(result.ok).toBe(false);
    expect(await userProfileRepository.get()).toEqual(VALID_PROFILE);
    expect(await workoutLogsRepository.get()).toEqual([
      { id: 'existing', date: '2026-07-01', workoutType: 'A', exerciseLogs: [] },
    ]);
    expect(await studyCoursesRepository.get()).toEqual([{ id: 'existing-course', name: '既存の科目' }]);
  });

  it('imports a pre-Study-Planner export (no studyXxx fields) without breaking existing Body data', async () => {
    // Simulates restoring a real 4-days-of-use export captured before Study
    // Planner existed, onto a device that may already have Study data.
    await studyCoursesRepository.set([{ id: 'stale-course', name: '古いStudyデータ' }]);

    const result = await importAllData(legacyExportWithoutStudyFields());

    expect(result.ok).toBe(true);
    expect(await userProfileRepository.get()).toEqual(VALID_PROFILE);
    expect(await workoutLogsRepository.get()).toHaveLength(1);
    expect(await nutritionLogsRepository.get()).toHaveLength(1);
    expect(await fatigueCheckInsRepository.get()).toHaveLength(1);
    // A full import always overwrites, same as it already does for every
    // other collection — an old export has no Study data to restore, so
    // Study collections reset to empty rather than silently keeping stale
    // local data.
    expect(await studyCoursesRepository.get()).toEqual([]);
  });

  it('round-trips through exportAllData', async () => {
    await userProfileRepository.set(VALID_PROFILE);
    await workoutLogsRepository.set([{ id: 'w1', date: '2026-07-07', workoutType: 'short', exerciseLogs: [] }]);

    const exported = await exportAllData();
    await resetAllData();
    expect(await userProfileRepository.get()).toBeNull();

    const result = await importAllData(exported);
    expect(result.ok).toBe(true);
    expect(await userProfileRepository.get()).toEqual(VALID_PROFILE);
    expect(await workoutLogsRepository.get()).toEqual([
      { id: 'w1', date: '2026-07-07', workoutType: 'short', exerciseLogs: [] },
    ]);
  });
});

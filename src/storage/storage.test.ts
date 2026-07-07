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
import type { UserProfile } from '../domain/habitTypes';
import type { WorkoutLog } from '../domain/workoutTypes';

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
    ...overrides,
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

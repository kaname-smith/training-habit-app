import { describe, it, expect, beforeEach } from 'vitest';
import { storageClient } from './storageClient';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION, ensureSchemaVersion } from './migrations';
import {
  userProfileRepository,
  workoutLogsRepository,
  settingsRepository,
  resetAllData,
  exportAllData,
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
  });
});

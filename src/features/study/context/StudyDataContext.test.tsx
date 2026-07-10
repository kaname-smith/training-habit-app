import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { StudyDataProvider } from './StudyDataContext';
import { useStudyData } from './useStudyData';
import {
  studyCoursesRepository,
  studyExamInfosRepository,
  studyMaterialsRepository,
  studyTasksRepository,
  studyAvailabilityBlocksRepository,
} from '../../../storage/studyRepositories';
import { userProfileRepository, workoutLogsRepository } from '../../../storage/repositories';
import type {
  Course,
  ExamInfo,
  MaterialItem,
  StudyTask,
  AvailabilityBlock,
} from '../../../domain/study/studyTypes';
import type { UserProfile } from '../../../domain/habitTypes';
import type { WorkoutLog } from '../../../domain/workoutTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderStudyData() {
  return renderHook(() => useStudyData(), { wrapper: StudyDataProvider });
}

async function waitForLoaded(result: ReturnType<typeof renderStudyData>['result']) {
  await waitFor(() => expect(result.current.loading).toBe(false));
}

describe('StudyDataProvider', () => {
  it('loads Study collections from storage on mount', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);

    const { result } = renderStudyData();
    await waitForLoaded(result);

    expect(result.current.courses).toEqual([course]);
  });

  it('defaults every collection to an empty array when nothing is stored', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    expect(result.current.courses).toEqual([]);
    expect(result.current.examInfos).toEqual([]);
    expect(result.current.materials).toEqual([]);
    expect(result.current.studyTasks).toEqual([]);
    expect(result.current.availabilityBlocks).toEqual([]);
  });

  it('adds, updates, and removes a Course', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    const course: Course = { id: 'c1', name: '材料力学' };
    await act(async () => {
      await result.current.addCourse(course);
    });
    expect(result.current.courses).toEqual([course]);
    expect(await studyCoursesRepository.get()).toEqual([course]);

    await act(async () => {
      await result.current.updateCourse('c1', (c) => ({ ...c, currentMastery: 3 }));
    });
    expect(result.current.courses).toEqual([{ ...course, currentMastery: 3 }]);

    await act(async () => {
      await result.current.removeCourse('c1');
    });
    expect(result.current.courses).toEqual([]);
    expect(await studyCoursesRepository.get()).toEqual([]);
  });

  it('upserts and removes an ExamInfo keyed by courseId', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    const examInfo: ExamInfo = {
      courseId: 'c1',
      examDateConfidence: 'unknown',
      scopeConfidence: 'unknown',
    };
    await act(async () => {
      await result.current.upsertExamInfo(examInfo);
    });
    expect(result.current.examInfos).toEqual([examInfo]);

    const confirmed: ExamInfo = { ...examInfo, examDateConfidence: 'confirmed', examDate: '2026-07-20' };
    await act(async () => {
      await result.current.upsertExamInfo(confirmed);
    });
    // Upserting the same courseId replaces the entry rather than appending.
    expect(result.current.examInfos).toEqual([confirmed]);
    expect(await studyExamInfosRepository.get()).toEqual([confirmed]);

    await act(async () => {
      await result.current.removeExamInfo('c1');
    });
    expect(result.current.examInfos).toEqual([]);
  });

  it('adds, updates, and removes a MaterialItem, including not_applicable', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    const material: MaterialItem = { id: 'm1', courseId: 'c1', kind: 'past_exams', status: 'missing' };
    await act(async () => {
      await result.current.addMaterial(material);
    });
    expect(result.current.materials).toEqual([material]);

    await act(async () => {
      await result.current.updateMaterial('m1', (m) => ({ ...m, status: 'not_applicable' }));
    });
    expect(result.current.materials[0].status).toBe('not_applicable');
    expect(await studyMaterialsRepository.get()).toEqual([{ ...material, status: 'not_applicable' }]);

    await act(async () => {
      await result.current.removeMaterial('m1');
    });
    expect(result.current.materials).toEqual([]);
  });

  it('adds, updates, and removes a StudyTask', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    const task: StudyTask = {
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
    };
    await act(async () => {
      await result.current.addStudyTask(task);
    });
    expect(result.current.studyTasks).toEqual([task]);

    await act(async () => {
      await result.current.updateStudyTask('t1', (t) => ({ ...t, status: 'done' }));
    });
    expect(result.current.studyTasks[0].status).toBe('done');
    expect(await studyTasksRepository.get()).toEqual([{ ...task, status: 'done' }]);

    await act(async () => {
      await result.current.removeStudyTask('t1');
    });
    expect(result.current.studyTasks).toEqual([]);
  });

  it('adds, updates, and removes an AvailabilityBlock', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    const block: AvailabilityBlock = {
      id: 'b1',
      label: '材料力学の講義',
      start: '2026-07-13T10:00:00.000Z',
      end: '2026-07-13T11:30:00.000Z',
      source: 'manual',
    };
    await act(async () => {
      await result.current.addAvailabilityBlock(block);
    });
    expect(result.current.availabilityBlocks).toEqual([block]);

    await act(async () => {
      await result.current.updateAvailabilityBlock('b1', (b) => ({ ...b, energyLevel: 'low' }));
    });
    expect(result.current.availabilityBlocks[0].energyLevel).toBe('low');
    expect(await studyAvailabilityBlocksRepository.get()).toEqual([{ ...block, energyLevel: 'low' }]);

    await act(async () => {
      await result.current.removeAvailabilityBlock('b1');
    });
    expect(result.current.availabilityBlocks).toEqual([]);
  });

  it('reload() re-reads storage so context state matches what is actually stored', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    // Simulate a change made through a different path (e.g. import), bypassing
    // this provider's own state entirely.
    const course: Course = { id: 'c1', name: '線形代数' };
    await studyCoursesRepository.set([course]);
    expect(result.current.courses).toEqual([]); // stale until reload

    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.courses).toEqual([course]);
  });

  it('runDiscoveryTaskGeneration persists newly generated discovery tasks and is idempotent', async () => {
    const { result } = renderStudyData();
    await waitForLoaded(result);

    const course: Course = { id: 'c1', name: '材料力学' };
    await act(async () => {
      await result.current.addCourse(course);
    });

    let created: StudyTask[] = [];
    await act(async () => {
      created = await result.current.runDiscoveryTaskGeneration();
    });
    expect(created.length).toBeGreaterThan(0);
    expect(result.current.studyTasks.length).toBe(created.length);
    expect(await studyTasksRepository.get()).toEqual(result.current.studyTasks);

    let secondRun: StudyTask[] = [];
    await act(async () => {
      secondRun = await result.current.runDiscoveryTaskGeneration();
    });
    expect(secondRun).toEqual([]);
    expect(result.current.studyTasks.length).toBe(created.length);
  });

  it('does not affect existing Body-side storage (userProfile, workoutLogs)', async () => {
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
    const logs: WorkoutLog[] = [{ id: 'w1', date: '2026-07-07', workoutType: 'intro', exerciseLogs: [] }];
    await userProfileRepository.set(profile);
    await workoutLogsRepository.set(logs);

    const { result } = renderStudyData();
    await waitForLoaded(result);

    await act(async () => {
      await result.current.addCourse({ id: 'c1', name: '材料力学' });
      await result.current.addStudyTask({
        id: 't1',
        courseId: 'c1',
        title: 'x',
        taskType: 'learning',
        estimatedMinutes: 30,
        remainingMinutes: 30,
        prerequisiteTaskIds: [],
        importance: 3,
        uncertainty: 3,
        status: 'backlog',
      });
    });

    expect(await userProfileRepository.get()).toEqual(profile);
    expect(await workoutLogsRepository.get()).toEqual(logs);
  });
});

import { describe, it, expect } from 'vitest';
import { generateDiscoveryTasks } from './discoveryTasks';
import type { MissingInfoFlag } from './confidenceAudit';
import type { Course, StudyTask } from './studyTypes';

const course: Course = { id: 'course-1', name: '材料力学' };

const dateFlag: MissingInfoFlag = { courseId: 'course-1', reason: 'exam_date_unknown' };
const materialFlag: MissingInfoFlag = {
  courseId: 'course-1',
  reason: 'material_missing',
  materialKind: 'past_exams',
};

describe('generateDiscoveryTasks', () => {
  it('creates a discovery task per flag with the course name in the title', () => {
    const tasks = generateDiscoveryTasks({ flags: [dateFlag], courses: [course], existingTasks: [] });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      courseId: 'course-1',
      taskType: 'discovery',
      status: 'ready',
    });
    expect(tasks[0].title).toContain('材料力学');
    expect(tasks[0].title).toContain('試験日');
  });

  it('includes the Japanese material label for material_missing flags', () => {
    const tasks = generateDiscoveryTasks({ flags: [materialFlag], courses: [course], existingTasks: [] });
    expect(tasks[0].title).toContain('過去問');
  });

  it('falls back to a generic course label when the course is not found', () => {
    const tasks = generateDiscoveryTasks({ flags: [dateFlag], courses: [], existingTasks: [] });
    expect(tasks[0].title).toContain('未登録の科目');
  });

  it('is idempotent: re-running with the same flags and prior output creates nothing new', () => {
    const firstRun = generateDiscoveryTasks({ flags: [dateFlag, materialFlag], courses: [course], existingTasks: [] });
    const secondRun = generateDiscoveryTasks({
      flags: [dateFlag, materialFlag],
      courses: [course],
      existingTasks: firstRun,
    });
    expect(secondRun).toEqual([]);
  });

  it('does not duplicate a task whose matching discovery task is already done', () => {
    const firstRun = generateDiscoveryTasks({ flags: [dateFlag], courses: [course], existingTasks: [] });
    const doneTask: StudyTask = { ...firstRun[0], status: 'done' };
    const secondRun = generateDiscoveryTasks({
      flags: [dateFlag],
      courses: [course],
      existingTasks: [doneTask],
    });
    expect(secondRun).toEqual([]);
  });

  it('only creates tasks for flags that do not already have a matching task', () => {
    const existing = generateDiscoveryTasks({ flags: [dateFlag], courses: [course], existingTasks: [] });
    const nextRun = generateDiscoveryTasks({
      flags: [dateFlag, materialFlag],
      courses: [course],
      existingTasks: existing,
    });
    expect(nextRun).toHaveLength(1);
    expect(nextRun[0].title).toContain('過去問');
  });

  it('produces unique ids for flags on different courses with the same reason', () => {
    const courseB: Course = { id: 'course-2', name: '線形代数' };
    const tasks = generateDiscoveryTasks({
      flags: [dateFlag, { ...dateFlag, courseId: 'course-2' }],
      courses: [course, courseB],
      existingTasks: [],
    });
    const ids = tasks.map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

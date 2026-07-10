import { describe, it, expect } from 'vitest';
import { auditCourse, auditAllCourses } from './confidenceAudit';
import type { Course, ExamInfo, MaterialItem } from './studyTypes';

const course: Course = {
  id: 'course-1',
  name: '材料力学',
};

const completeMaterials: MaterialItem[] = [
  { id: 'm1', courseId: 'course-1', kind: 'syllabus', status: 'complete' },
  { id: 'm2', courseId: 'course-1', kind: 'lecture_slides', status: 'complete' },
  { id: 'm3', courseId: 'course-1', kind: 'textbook_scope', status: 'complete' },
  { id: 'm4', courseId: 'course-1', kind: 'assignments', status: 'complete' },
  { id: 'm5', courseId: 'course-1', kind: 'past_exams', status: 'complete' },
];

const confirmedExamInfo: ExamInfo = {
  courseId: 'course-1',
  examDate: '2026-07-20',
  examDateConfidence: 'confirmed',
  scopeText: '第1章から第5章',
  scopeConfidence: 'confirmed',
  format: 'written',
};

describe('auditCourse', () => {
  it('flags exam_info_not_registered when no ExamInfo exists for the course', () => {
    const flags = auditCourse({ course, examInfo: null, materials: completeMaterials });
    expect(flags).toContainEqual({ courseId: 'course-1', reason: 'exam_info_not_registered' });
  });

  it('flags exam date and scope when confidence is not confirmed', () => {
    const examInfo: ExamInfo = {
      ...confirmedExamInfo,
      examDateConfidence: 'low',
      scopeConfidence: 'unknown',
    };
    const flags = auditCourse({
      course: { ...course, currentMastery: 3 },
      examInfo,
      materials: completeMaterials,
    });
    expect(flags).toContainEqual({ courseId: 'course-1', reason: 'exam_date_unknown' });
    expect(flags).toContainEqual({ courseId: 'course-1', reason: 'exam_scope_unknown' });
  });

  it('flags exam_format_unknown when format is missing or explicitly unknown', () => {
    const noFormat = auditCourse({
      course: { ...course, currentMastery: 3 },
      examInfo: { ...confirmedExamInfo, format: undefined },
      materials: completeMaterials,
    });
    expect(noFormat).toContainEqual({ courseId: 'course-1', reason: 'exam_format_unknown' });

    const explicitUnknown = auditCourse({
      course: { ...course, currentMastery: 3 },
      examInfo: { ...confirmedExamInfo, format: 'unknown' },
      materials: completeMaterials,
    });
    expect(explicitUnknown).toContainEqual({ courseId: 'course-1', reason: 'exam_format_unknown' });
  });

  it('flags every required material kind as missing when none are recorded', () => {
    const flags = auditCourse({
      course: { ...course, currentMastery: 3 },
      examInfo: confirmedExamInfo,
      materials: [],
    });
    const materialFlags = flags.filter((flag) => flag.reason === 'material_missing');
    expect(materialFlags).toHaveLength(5);
    expect(materialFlags.map((flag) => flag.materialKind).sort()).toEqual(
      ['assignments', 'lecture_slides', 'past_exams', 'syllabus', 'textbook_scope'].sort(),
    );
  });

  it('does not flag a material kind whose status is complete', () => {
    const flags = auditCourse({
      course: { ...course, currentMastery: 3 },
      examInfo: confirmedExamInfo,
      materials: completeMaterials,
    });
    expect(flags.some((flag) => flag.reason === 'material_missing')).toBe(false);
  });

  it('flags mastery_unknown when currentMastery is not set', () => {
    const flags = auditCourse({ course, examInfo: confirmedExamInfo, materials: completeMaterials });
    expect(flags).toContainEqual({ courseId: 'course-1', reason: 'mastery_unknown' });
  });

  it('returns no flags once everything is confirmed, complete, and rated', () => {
    const flags = auditCourse({
      course: { ...course, currentMastery: 3 },
      examInfo: confirmedExamInfo,
      materials: completeMaterials,
    });
    expect(flags).toEqual([]);
  });
});

describe('auditAllCourses', () => {
  it('keeps each course’s flags scoped to that course only', () => {
    const courseA: Course = { id: 'a', name: '材料力学', currentMastery: 3 };
    const courseB: Course = { id: 'b', name: '線形代数' };

    const flags = auditAllCourses({
      courses: [courseA, courseB],
      examInfos: [{ ...confirmedExamInfo, courseId: 'a' }],
      materials: completeMaterials.map((item) => ({ ...item, courseId: 'a' })),
    });

    const courseAFlags = flags.filter((flag) => flag.courseId === 'a');
    const courseBFlags = flags.filter((flag) => flag.courseId === 'b');

    expect(courseAFlags).toEqual([]);
    // Course B has no ExamInfo and no materials at all, so it should surface
    // its own full set of unknowns, independent of course A.
    expect(courseBFlags).toContainEqual({ courseId: 'b', reason: 'exam_info_not_registered' });
    expect(courseBFlags.filter((flag) => flag.reason === 'material_missing')).toHaveLength(5);
    expect(courseBFlags).toContainEqual({ courseId: 'b', reason: 'mastery_unknown' });
  });
});

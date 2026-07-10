import type { Course, ExamInfo, MaterialItem, MaterialKind } from './studyTypes';

export type MissingInfoReason =
  | 'exam_info_not_registered'
  | 'exam_date_unknown'
  | 'exam_scope_unknown'
  | 'exam_format_unknown'
  | 'material_missing'
  | 'mastery_unknown';

export interface MissingInfoFlag {
  courseId: string;
  reason: MissingInfoReason;
  /** Only set when reason === 'material_missing'. */
  materialKind?: MaterialKind;
}

// Kinds checked by default even before any MaterialItem row exists for the
// course. 'peer_or_instructor_confirmation' and 'other' are opt-in additions
// a user can log, not part of the baseline checklist.
const REQUIRED_MATERIAL_KINDS: MaterialKind[] = [
  'syllabus',
  'lecture_slides',
  'textbook_scope',
  'assignments',
  'past_exams',
];

export interface AuditCourseInput {
  course: Course;
  examInfo: ExamInfo | null;
  materials: MaterialItem[];
}

export function auditCourse({ course, examInfo, materials }: AuditCourseInput): MissingInfoFlag[] {
  const flags: MissingInfoFlag[] = [];

  if (!examInfo) {
    flags.push({ courseId: course.id, reason: 'exam_info_not_registered' });
  } else {
    if (examInfo.examDateConfidence !== 'confirmed') {
      flags.push({ courseId: course.id, reason: 'exam_date_unknown' });
    }
    if (examInfo.scopeConfidence !== 'confirmed') {
      flags.push({ courseId: course.id, reason: 'exam_scope_unknown' });
    }
    if (!examInfo.format || examInfo.format === 'unknown') {
      flags.push({ courseId: course.id, reason: 'exam_format_unknown' });
    }
  }

  const statusByKind = new Map(materials.map((item) => [item.kind, item.status]));
  for (const kind of REQUIRED_MATERIAL_KINDS) {
    if (statusByKind.get(kind) !== 'complete') {
      flags.push({ courseId: course.id, reason: 'material_missing', materialKind: kind });
    }
  }

  if (course.currentMastery === undefined) {
    flags.push({ courseId: course.id, reason: 'mastery_unknown' });
  }

  return flags;
}

export interface AuditAllCoursesInput {
  courses: Course[];
  examInfos: ExamInfo[];
  materials: MaterialItem[];
}

export function auditAllCourses({ courses, examInfos, materials }: AuditAllCoursesInput): MissingInfoFlag[] {
  const examInfoByCourseId = new Map(examInfos.map((info) => [info.courseId, info]));
  const materialsByCourseId = new Map<string, MaterialItem[]>();
  for (const item of materials) {
    const list = materialsByCourseId.get(item.courseId) ?? [];
    list.push(item);
    materialsByCourseId.set(item.courseId, list);
  }

  return courses.flatMap((course) =>
    auditCourse({
      course,
      examInfo: examInfoByCourseId.get(course.id) ?? null,
      materials: materialsByCourseId.get(course.id) ?? [],
    }),
  );
}

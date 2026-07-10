import type { Course, MaterialKind, StudyTask } from './studyTypes';
import type { MissingInfoFlag } from './confidenceAudit';

const DISCOVERY_TASK_ESTIMATED_MINUTES = 15;

const MATERIAL_LABELS: Record<MaterialKind, string> = {
  syllabus: 'シラバス',
  lecture_slides: '講義スライド',
  textbook_scope: '教科書の範囲',
  assignments: '課題',
  past_exams: '過去問',
  peer_or_instructor_confirmation: '友人・教員への確認',
  other: '資料',
};

function describeFlag(courseName: string, flag: MissingInfoFlag): string {
  switch (flag.reason) {
    case 'exam_info_not_registered':
      return `${courseName}の試験情報を登録する`;
    case 'exam_date_unknown':
      return `${courseName}の試験日を確認する`;
    case 'exam_scope_unknown':
      return `${courseName}の試験範囲を確認する`;
    case 'exam_format_unknown':
      return `${courseName}の試験形式を確認する`;
    case 'material_missing':
      return `${courseName}の${MATERIAL_LABELS[flag.materialKind ?? 'other']}を確認する`;
    case 'mastery_unknown':
      return `${courseName}の現在の理解度を自己評価する`;
    default: {
      const exhaustiveCheck: never = flag.reason;
      return exhaustiveCheck;
    }
  }
}

// Deterministic so re-running generation against the same flags never
// creates a second task for the same (course, reason[, material]) triple —
// this is what makes generateDiscoveryTasks idempotent.
function buildDiscoveryTaskId(flag: MissingInfoFlag): string {
  return ['discovery', flag.courseId, flag.reason, flag.materialKind ?? ''].join(':');
}

export interface GenerateDiscoveryTasksInput {
  flags: MissingInfoFlag[];
  courses: Course[];
  existingTasks: StudyTask[];
}

/**
 * Returns only the newly created discovery tasks. Tasks whose deterministic
 * id already exists in existingTasks are skipped, regardless of their
 * current status, so completed discovery tasks are never recreated.
 */
export function generateDiscoveryTasks({
  flags,
  courses,
  existingTasks,
}: GenerateDiscoveryTasksInput): StudyTask[] {
  const courseNameById = new Map(courses.map((course) => [course.id, course.name]));
  const existingIds = new Set(
    existingTasks.filter((task) => task.taskType === 'discovery').map((task) => task.id),
  );

  const created: StudyTask[] = [];
  for (const flag of flags) {
    const id = buildDiscoveryTaskId(flag);
    if (existingIds.has(id)) continue;
    existingIds.add(id);

    created.push({
      id,
      courseId: flag.courseId,
      title: describeFlag(courseNameById.get(flag.courseId) ?? '未登録の科目', flag),
      taskType: 'discovery',
      estimatedMinutes: DISCOVERY_TASK_ESTIMATED_MINUTES,
      remainingMinutes: DISCOVERY_TASK_ESTIMATED_MINUTES,
      prerequisiteTaskIds: [],
      importance: 5,
      uncertainty: 5,
      status: 'ready',
    });
  }
  return created;
}

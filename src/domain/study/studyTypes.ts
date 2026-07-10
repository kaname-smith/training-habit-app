export type ConfidenceLevel = 'unknown' | 'low' | 'medium' | 'confirmed';

export type ExamFormat = 'written' | 'oral' | 'report' | 'unknown';

/** Shared 1-5 scale used for importance, uncertainty, and mastery ratings. */
export type FiveLevelScale = 1 | 2 | 3 | 4 | 5;

export interface Course {
  id: string;
  name: string;
  dayOfWeek?: string;
  period?: string;
  credits?: number;
  instructor?: string;
  lmsUrl?: string;
  attendanceStatus?: string;
  currentMastery?: FiveLevelScale;
  importance?: FiveLevelScale;
}

export interface ExamInfo {
  courseId: string;
  examDate?: string;
  examDateConfidence: ConfidenceLevel;
  scopeText?: string;
  scopeConfidence: ConfidenceLevel;
  format?: ExamFormat;
  allowedMaterials?: string;
  weightPercent?: number;
}

export type MaterialKind =
  | 'syllabus'
  | 'lecture_slides'
  | 'textbook_scope'
  | 'assignments'
  | 'past_exams'
  | 'peer_or_instructor_confirmation'
  | 'other';

/**
 * 'not_applicable' means the material kind was confirmed to not exist or not
 * be needed for this course (e.g. no past exams are available) — distinct
 * from 'missing', which still needs to be resolved by a Discovery Task.
 */
export type MaterialStatus = 'missing' | 'partial' | 'complete' | 'not_applicable';

export interface MaterialItem {
  id: string;
  courseId: string;
  kind: MaterialKind;
  label?: string;
  status: MaterialStatus;
  notes?: string;
}

/**
 * Discovery Task is not a separate entity: it is a StudyTask whose
 * taskType is 'discovery'. "Discovery task generation" (docs/19) is an
 * algorithm step that produces StudyTask records, not a distinct type.
 */
export type StudyTaskType = 'discovery' | 'learning' | 'practice' | 'review' | 'administrative';

export type StudyTaskStatus = 'backlog' | 'ready' | 'scheduled' | 'in_progress' | 'done' | 'blocked';

export interface StudyTask {
  id: string;
  courseId: string;
  title: string;
  taskType: StudyTaskType;
  estimatedMinutes: number;
  remainingMinutes: number;
  prerequisiteTaskIds: string[];
  deadline?: string;
  importance: FiveLevelScale;
  uncertainty: FiveLevelScale;
  masteryBefore?: FiveLevelScale;
  masteryAfter?: FiveLevelScale;
  status: StudyTaskStatus;
}

export type AvailabilityBlockSource = 'manual' | 'calendar' | 'recurring_schedule';
export type EnergyLevel = 'low' | 'medium' | 'high';

/**
 * Represents one already-expanded, concrete time interval (a single class
 * session, a single exam, etc.), not a recurrence rule. S1 does not model
 * weekly/repeating schedules — a recurring class is entered as one
 * AvailabilityBlock per occurrence. Recurrence representation is deferred
 * until an Availability input UI actually needs it.
 */
export interface AvailabilityBlock {
  id: string;
  label: string;
  start: string;
  end: string;
  source: AvailabilityBlockSource;
  energyLevel?: EnergyLevel;
}

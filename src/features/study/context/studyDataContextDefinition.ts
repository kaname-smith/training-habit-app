import { createContext } from 'react';
import type {
  Course,
  ExamInfo,
  MaterialItem,
  StudyTask,
  AvailabilityBlock,
} from '../../../domain/study/studyTypes';

export interface StudyDataContextValue {
  loading: boolean;
  courses: Course[];
  examInfos: ExamInfo[];
  materials: MaterialItem[];
  studyTasks: StudyTask[];
  availabilityBlocks: AvailabilityBlock[];

  reload: () => Promise<void>;

  addCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, updater: (course: Course) => Course) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  // Removes the course plus every ExamInfo/MaterialItem/StudyTask tied to
  // its courseId. AvailabilityBlock is intentionally left untouched — it
  // isn't required to reference a course.
  removeCourseCascade: (courseId: string) => Promise<void>;

  // ExamInfo has no id of its own (docs/18): it is keyed 1:1 by courseId,
  // so add/update collapse into a single upsert-by-courseId operation.
  upsertExamInfo: (examInfo: ExamInfo) => Promise<void>;
  removeExamInfo: (courseId: string) => Promise<void>;

  addMaterial: (material: MaterialItem) => Promise<void>;
  updateMaterial: (id: string, updater: (material: MaterialItem) => MaterialItem) => Promise<void>;
  removeMaterial: (id: string) => Promise<void>;

  addStudyTask: (task: StudyTask) => Promise<void>;
  updateStudyTask: (id: string, updater: (task: StudyTask) => StudyTask) => Promise<void>;
  removeStudyTask: (id: string) => Promise<void>;

  addAvailabilityBlock: (block: AvailabilityBlock) => Promise<void>;
  updateAvailabilityBlock: (
    id: string,
    updater: (block: AvailabilityBlock) => AvailabilityBlock,
  ) => Promise<void>;
  removeAvailabilityBlock: (id: string) => Promise<void>;

  // Runs the domain-layer audit + discovery task generation (pure functions)
  // against current state, persists any newly created tasks, and returns them.
  runDiscoveryTaskGeneration: () => Promise<StudyTask[]>;
}

export const StudyDataContext = createContext<StudyDataContextValue | null>(null);

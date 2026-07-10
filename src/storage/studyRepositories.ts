import { storageClient } from './storageClient';
import { STORAGE_KEYS } from './migrations';
import type {
  Course,
  ExamInfo,
  MaterialItem,
  StudyTask,
  AvailabilityBlock,
} from '../domain/study/studyTypes';

export const studyCoursesRepository = {
  get: async () => (await storageClient.get<Course[]>(STORAGE_KEYS.studyCourses)) ?? [],
  set: (courses: Course[]) => storageClient.set(STORAGE_KEYS.studyCourses, courses),
};

export const studyExamInfosRepository = {
  get: async () => (await storageClient.get<ExamInfo[]>(STORAGE_KEYS.studyExamInfos)) ?? [],
  set: (examInfos: ExamInfo[]) => storageClient.set(STORAGE_KEYS.studyExamInfos, examInfos),
};

export const studyMaterialsRepository = {
  get: async () => (await storageClient.get<MaterialItem[]>(STORAGE_KEYS.studyMaterials)) ?? [],
  set: (materials: MaterialItem[]) => storageClient.set(STORAGE_KEYS.studyMaterials, materials),
};

export const studyTasksRepository = {
  get: async () => (await storageClient.get<StudyTask[]>(STORAGE_KEYS.studyTasks)) ?? [],
  set: (tasks: StudyTask[]) => storageClient.set(STORAGE_KEYS.studyTasks, tasks),
};

export const studyAvailabilityBlocksRepository = {
  get: async () =>
    (await storageClient.get<AvailabilityBlock[]>(STORAGE_KEYS.studyAvailabilityBlocks)) ?? [],
  set: (blocks: AvailabilityBlock[]) =>
    storageClient.set(STORAGE_KEYS.studyAvailabilityBlocks, blocks),
};

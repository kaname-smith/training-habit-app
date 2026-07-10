import { useEffect, useState, type ReactNode } from 'react';
import {
  studyCoursesRepository,
  studyExamInfosRepository,
  studyMaterialsRepository,
  studyTasksRepository,
  studyAvailabilityBlocksRepository,
} from '../../../storage/studyRepositories';
import { auditAllCourses } from '../../../domain/study/confidenceAudit';
import { generateDiscoveryTasks } from '../../../domain/study/discoveryTasks';
import type {
  Course,
  ExamInfo,
  MaterialItem,
  StudyTask,
  AvailabilityBlock,
} from '../../../domain/study/studyTypes';
import { StudyDataContext, type StudyDataContextValue } from './studyDataContextDefinition';

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [examInfos, setExamInfos] = useState<ExamInfo[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityBlock[]>([]);

  async function load() {
    const [
      loadedCourses,
      loadedExamInfos,
      loadedMaterials,
      loadedStudyTasks,
      loadedAvailabilityBlocks,
    ] = await Promise.all([
      studyCoursesRepository.get(),
      studyExamInfosRepository.get(),
      studyMaterialsRepository.get(),
      studyTasksRepository.get(),
      studyAvailabilityBlocksRepository.get(),
    ]);
    setCourses(loadedCourses);
    setExamInfos(loadedExamInfos);
    setMaterials(loadedMaterials);
    setStudyTasks(loadedStudyTasks);
    setAvailabilityBlocks(loadedAvailabilityBlocks);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      await load();
      if (cancelled) return;
      setLoading(false);
    }

    void initialLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    await load();
  }

  async function addCourse(course: Course) {
    const next = [...courses, course];
    setCourses(next);
    await studyCoursesRepository.set(next);
  }

  async function updateCourse(id: string, updater: (course: Course) => Course) {
    const next = courses.map((course) => (course.id === id ? updater(course) : course));
    setCourses(next);
    await studyCoursesRepository.set(next);
  }

  async function removeCourse(id: string) {
    const next = courses.filter((course) => course.id !== id);
    setCourses(next);
    await studyCoursesRepository.set(next);
  }

  async function removeCourseCascade(courseId: string) {
    const nextCourses = courses.filter((course) => course.id !== courseId);
    const nextExamInfos = examInfos.filter((info) => info.courseId !== courseId);
    const nextMaterials = materials.filter((material) => material.courseId !== courseId);
    const nextStudyTasks = studyTasks.filter((task) => task.courseId !== courseId);

    setCourses(nextCourses);
    setExamInfos(nextExamInfos);
    setMaterials(nextMaterials);
    setStudyTasks(nextStudyTasks);

    await Promise.all([
      studyCoursesRepository.set(nextCourses),
      studyExamInfosRepository.set(nextExamInfos),
      studyMaterialsRepository.set(nextMaterials),
      studyTasksRepository.set(nextStudyTasks),
    ]);
  }

  async function upsertExamInfo(examInfo: ExamInfo) {
    const next = [...examInfos.filter((info) => info.courseId !== examInfo.courseId), examInfo];
    setExamInfos(next);
    await studyExamInfosRepository.set(next);
  }

  async function removeExamInfo(courseId: string) {
    const next = examInfos.filter((info) => info.courseId !== courseId);
    setExamInfos(next);
    await studyExamInfosRepository.set(next);
  }

  async function addMaterial(material: MaterialItem) {
    const next = [...materials, material];
    setMaterials(next);
    await studyMaterialsRepository.set(next);
  }

  async function updateMaterial(id: string, updater: (material: MaterialItem) => MaterialItem) {
    const next = materials.map((material) => (material.id === id ? updater(material) : material));
    setMaterials(next);
    await studyMaterialsRepository.set(next);
  }

  async function removeMaterial(id: string) {
    const next = materials.filter((material) => material.id !== id);
    setMaterials(next);
    await studyMaterialsRepository.set(next);
  }

  async function addStudyTask(task: StudyTask) {
    const next = [...studyTasks, task];
    setStudyTasks(next);
    await studyTasksRepository.set(next);
  }

  async function updateStudyTask(id: string, updater: (task: StudyTask) => StudyTask) {
    const next = studyTasks.map((task) => (task.id === id ? updater(task) : task));
    setStudyTasks(next);
    await studyTasksRepository.set(next);
  }

  async function removeStudyTask(id: string) {
    const next = studyTasks.filter((task) => task.id !== id);
    setStudyTasks(next);
    await studyTasksRepository.set(next);
  }

  async function addAvailabilityBlock(block: AvailabilityBlock) {
    const next = [...availabilityBlocks, block];
    setAvailabilityBlocks(next);
    await studyAvailabilityBlocksRepository.set(next);
  }

  async function updateAvailabilityBlock(
    id: string,
    updater: (block: AvailabilityBlock) => AvailabilityBlock,
  ) {
    const next = availabilityBlocks.map((block) => (block.id === id ? updater(block) : block));
    setAvailabilityBlocks(next);
    await studyAvailabilityBlocksRepository.set(next);
  }

  async function removeAvailabilityBlock(id: string) {
    const next = availabilityBlocks.filter((block) => block.id !== id);
    setAvailabilityBlocks(next);
    await studyAvailabilityBlocksRepository.set(next);
  }

  async function runDiscoveryTaskGeneration(): Promise<StudyTask[]> {
    const flags = auditAllCourses({ courses, examInfos, materials });
    const created = generateDiscoveryTasks({ flags, courses, existingTasks: studyTasks });
    if (created.length > 0) {
      const next = [...studyTasks, ...created];
      setStudyTasks(next);
      await studyTasksRepository.set(next);
    }
    return created;
  }

  const value: StudyDataContextValue = {
    loading,
    courses,
    examInfos,
    materials,
    studyTasks,
    availabilityBlocks,
    reload,
    addCourse,
    updateCourse,
    removeCourse,
    removeCourseCascade,
    upsertExamInfo,
    removeExamInfo,
    addMaterial,
    updateMaterial,
    removeMaterial,
    addStudyTask,
    updateStudyTask,
    removeStudyTask,
    addAvailabilityBlock,
    updateAvailabilityBlock,
    removeAvailabilityBlock,
    runDiscoveryTaskGeneration,
  };

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>;
}

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudyDataProvider } from './context/StudyDataContext';
import { CoursesPage } from './CoursesPage';
import {
  studyCoursesRepository,
  studyExamInfosRepository,
  studyMaterialsRepository,
  studyTasksRepository,
} from '../../storage/studyRepositories';
import type { Course, ExamInfo, MaterialItem, StudyTask } from '../../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderCoursesPage() {
  return render(
    <StudyDataProvider>
      <CoursesPage />
    </StudyDataProvider>,
  );
}

async function waitForLoaded() {
  await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument());
}

describe('CoursesPage', () => {
  it('adds a new course via the form', async () => {
    const user = userEvent.setup();
    renderCoursesPage();
    await waitForLoaded();

    await user.type(screen.getByLabelText('科目名'), '材料力学');
    await user.click(screen.getByRole('button', { name: '追加する' }));

    await waitFor(() => expect(screen.getByText('材料力学')).toBeInTheDocument());
    expect(await studyCoursesRepository.get()).toHaveLength(1);
  });

  it('does not add a course when the name is blank', async () => {
    const user = userEvent.setup();
    renderCoursesPage();
    await waitForLoaded();

    await user.click(screen.getByRole('button', { name: '追加する' }));

    expect(await studyCoursesRepository.get()).toEqual([]);
  });

  it('edits an existing course', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderCoursesPage();
    await waitForLoaded();

    await user.click(screen.getByRole('button', { name: '編集' }));
    // Two "科目名" fields now exist: the always-visible "add course" form
    // and this course's expanded edit form (rendered second in the DOM).
    const nameInput = screen.getAllByLabelText('科目名')[1];
    await user.clear(nameInput);
    await user.type(nameInput, '材料力学(改)');
    await user.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => expect(screen.getByText('材料力学(改)')).toBeInTheDocument());
    expect(await studyCoursesRepository.get()).toEqual([{ ...course, name: '材料力学(改)' }]);
  });

  it('shows related data counts before a cascade delete and removes everything on confirm', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    const otherCourse: Course = { id: 'c2', name: '線形代数' };
    const examInfo: ExamInfo = { courseId: 'c1', examDateConfidence: 'unknown', scopeConfidence: 'unknown' };
    const materials: MaterialItem[] = [
      { id: 'm1', courseId: 'c1', kind: 'past_exams', status: 'missing' },
      { id: 'm2', courseId: 'c1', kind: 'syllabus', status: 'complete' },
      { id: 'm3', courseId: 'c2', kind: 'syllabus', status: 'complete' },
    ];
    const tasks: StudyTask[] = [
      {
        id: 't1',
        courseId: 'c1',
        title: '材料力学の試験日を確認する',
        taskType: 'discovery',
        estimatedMinutes: 15,
        remainingMinutes: 15,
        prerequisiteTaskIds: [],
        importance: 5,
        uncertainty: 5,
        status: 'ready',
      },
    ];
    await studyCoursesRepository.set([course, otherCourse]);
    await studyExamInfosRepository.set([examInfo]);
    await studyMaterialsRepository.set(materials);
    await studyTasksRepository.set(tasks);

    const user = userEvent.setup();
    renderCoursesPage();
    await waitForLoaded();

    const deleteButtons = screen.getAllByRole('button', { name: '削除する' });
    await user.click(deleteButtons[0]);

    expect(screen.getByText('この科目に関連する試験情報・教材情報・Discovery Taskも削除されます。')).toBeInTheDocument();
    expect(screen.getByText('試験情報：1/1件・教材：2件・タスク：1件')).toBeInTheDocument();

    // Two "削除する" buttons now exist: c1's confirm button and c2's
    // still-untouched initial delete button. c1 renders first in the list.
    await user.click(screen.getAllByRole('button', { name: '削除する' })[0]);

    await waitFor(() => expect(screen.queryByText('材料力学')).not.toBeInTheDocument());
    expect(screen.getByText('線形代数')).toBeInTheDocument();
    expect(await studyExamInfosRepository.get()).toEqual([]);
    expect(await studyMaterialsRepository.get()).toEqual([materials[2]]);
    expect(await studyTasksRepository.get()).toEqual([]);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { StudyDataProvider } from './context/StudyDataContext';
import { MaterialsPage } from './MaterialsPage';
import { studyCoursesRepository, studyMaterialsRepository } from '../../storage/studyRepositories';
import type { Course, MaterialItem } from '../../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderMaterialsPage() {
  return render(
    <MemoryRouter>
      <StudyDataProvider>
        <MaterialsPage />
      </StudyDataProvider>
    </MemoryRouter>,
  );
}

async function waitForLoaded() {
  await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument());
}

describe('MaterialsPage', () => {
  it('shows an empty state with a link to Courses when no course exists', async () => {
    renderMaterialsPage();
    await waitForLoaded();

    expect(screen.getByText('まだ科目が登録されていません。先に科目を登録してください。')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/study/courses');
  });

  it('shows the 5 required material kinds defaulting to 未確認 (missing)', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    renderMaterialsPage();
    await waitForLoaded();

    for (const label of ['シラバス', '講義スライド', '教科書の範囲', '課題', '過去問']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const missingButtons = screen.getAllByRole('button', { name: '未確認' });
    expect(missingButtons).toHaveLength(5);
    for (const button of missingButtons) {
      expect(button).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('creates a new MaterialItem when a status is chosen for the first time', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderMaterialsPage();
    await waitForLoaded();

    await user.click(screen.getAllByRole('button', { name: '確認済み' })[0]);

    await waitFor(async () => {
      const stored = await studyMaterialsRepository.get();
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ courseId: 'c1', kind: 'syllabus', status: 'complete' });
    });
  });

  it('updates an existing MaterialItem in place rather than duplicating it', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    const existing: MaterialItem = { id: 'm1', courseId: 'c1', kind: 'syllabus', status: 'missing' };
    await studyCoursesRepository.set([course]);
    await studyMaterialsRepository.set([existing]);
    const user = userEvent.setup();
    renderMaterialsPage();
    await waitForLoaded();

    await user.click(screen.getAllByRole('button', { name: '確認済み' })[0]);

    await waitFor(async () => {
      const stored = await studyMaterialsRepository.get();
      expect(stored).toEqual([{ ...existing, status: 'complete' }]);
    });
  });

  it('shows the not_applicable helper text and persists the choice', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderMaterialsPage();
    await waitForLoaded();

    // past_exams is the 5th required kind, so its "対象外(存在しない)" button
    // is the 5th match.
    await user.click(screen.getAllByRole('button', { name: '対象外(存在しない)' })[4]);

    expect(screen.getByText('この科目には存在しない、または不要と確認済みとして扱います。')).toBeInTheDocument();
    await waitFor(async () => {
      const stored = await studyMaterialsRepository.get();
      expect(stored[0]).toMatchObject({ courseId: 'c1', kind: 'past_exams', status: 'not_applicable' });
    });
  });
});

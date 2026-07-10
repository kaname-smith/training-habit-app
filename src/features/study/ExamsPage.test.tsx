import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { StudyDataProvider } from './context/StudyDataContext';
import { ExamsPage } from './ExamsPage';
import { studyCoursesRepository, studyExamInfosRepository } from '../../storage/studyRepositories';
import type { Course } from '../../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderExamsPage() {
  return render(
    <MemoryRouter>
      <StudyDataProvider>
        <ExamsPage />
      </StudyDataProvider>
    </MemoryRouter>,
  );
}

async function waitForLoaded() {
  await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument());
}

describe('ExamsPage', () => {
  it('shows an empty state with a link to Courses when no course exists', async () => {
    renderExamsPage();
    await waitForLoaded();

    expect(screen.getByText('まだ科目が登録されていません。先に科目を登録してください。')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/study/courses');
  });

  it('shows a card per course, defaulting confidence to unknown', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    renderExamsPage();
    await waitForLoaded();

    expect(screen.getByText('材料力学')).toBeInTheDocument();
    const unknownButtons = screen.getAllByRole('button', { name: '不明' });
    expect(unknownButtons.length).toBeGreaterThanOrEqual(2); // date + scope confidence
    for (const button of unknownButtons.slice(0, 2)) {
      expect(button).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('persists a confidence change immediately', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderExamsPage();
    await waitForLoaded();

    // Two "確定" buttons exist (date confidence + scope confidence); date
    // confidence's picker renders first.
    await user.click(screen.getAllByRole('button', { name: '確定' })[0]);

    await waitFor(async () => {
      const stored = await studyExamInfosRepository.get();
      expect(stored[0]?.examDateConfidence).toBe('confirmed');
    });
  });

  it('saves the exam date field on blur', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderExamsPage();
    await waitForLoaded();

    const dateInput = screen.getByLabelText('試験日(分かる範囲で)');
    await user.type(dateInput, '2026-07-20');
    await user.tab();

    await waitFor(async () => {
      const stored = await studyExamInfosRepository.get();
      expect(stored[0]?.examDate).toBe('2026-07-20');
    });
  });

  it('clears exam info after a 2-step confirmation', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyExamInfosRepository.set([
      { courseId: 'c1', examDateConfidence: 'confirmed', scopeConfidence: 'confirmed', examDate: '2026-07-20' },
    ]);
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderExamsPage();
    await waitForLoaded();

    await user.click(screen.getByRole('button', { name: '試験情報をクリアする' }));
    expect(screen.getByText('試験情報をクリアします。よろしいですか？')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'クリアする' }));

    await waitFor(async () => {
      expect(await studyExamInfosRepository.get()).toEqual([]);
    });
  });
});

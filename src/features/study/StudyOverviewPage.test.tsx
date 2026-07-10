import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudyDataProvider } from './context/StudyDataContext';
import { StudyOverviewPage } from './StudyOverviewPage';
import { studyCoursesRepository } from '../../storage/studyRepositories';
import type { Course } from '../../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderStudyOverview() {
  return render(
    <MemoryRouter>
      <StudyDataProvider>
        <StudyOverviewPage />
      </StudyDataProvider>
    </MemoryRouter>,
  );
}

describe('StudyOverviewPage', () => {
  it('mounts under StudyDataProvider and shows a zero course count when nothing is stored', async () => {
    renderStudyOverview();

    await waitFor(() => expect(screen.getByText('登録済みの科目: 0件')).toBeInTheDocument());
  });

  it('reflects courses already saved in storage', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);

    renderStudyOverview();

    await waitFor(() => expect(screen.getByText('登録済みの科目: 1件')).toBeInTheDocument());
  });

  it('links to Courses, Exams, and Materials', async () => {
    renderStudyOverview();
    await waitFor(() => expect(screen.getByText('登録済みの科目: 0件')).toBeInTheDocument());

    expect(screen.getByRole('link', { name: /科目/ })).toHaveAttribute('href', '/study/courses');
    expect(screen.getByRole('link', { name: /試験情報/ })).toHaveAttribute('href', '/study/exams');
    expect(screen.getByRole('link', { name: /教材/ })).toHaveAttribute('href', '/study/materials');
  });

  it('shows Discovery Tasks and Availability as not-yet-available (no link)', async () => {
    renderStudyOverview();
    await waitFor(() => expect(screen.getByText('登録済みの科目: 0件')).toBeInTheDocument());

    expect(screen.getByText('Discovery Tasks')).toBeInTheDocument();
    expect(screen.getByText('固定予定')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});

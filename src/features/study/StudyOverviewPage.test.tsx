import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StudyDataProvider } from './context/StudyDataContext';
import { StudyOverviewPage } from './StudyOverviewPage';
import { studyCoursesRepository } from '../../storage/studyRepositories';
import type { Course } from '../../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

describe('StudyOverviewPage', () => {
  it('mounts under StudyDataProvider and shows a zero course count when nothing is stored', async () => {
    render(
      <StudyDataProvider>
        <StudyOverviewPage />
      </StudyDataProvider>,
    );

    await waitFor(() => expect(screen.getByText('登録済みの科目: 0件')).toBeInTheDocument());
  });

  it('reflects courses already saved in storage', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);

    render(
      <StudyDataProvider>
        <StudyOverviewPage />
      </StudyDataProvider>,
    );

    await waitFor(() => expect(screen.getByText('登録済みの科目: 1件')).toBeInTheDocument());
  });
});

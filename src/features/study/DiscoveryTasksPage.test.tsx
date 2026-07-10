import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudyDataProvider } from './context/StudyDataContext';
import { DiscoveryTasksPage } from './DiscoveryTasksPage';
import { studyCoursesRepository, studyTasksRepository } from '../../storage/studyRepositories';
import { userProfileRepository, workoutLogsRepository } from '../../storage/repositories';
import type { Course, StudyTask } from '../../domain/study/studyTypes';
import type { UserProfile } from '../../domain/habitTypes';
import type { WorkoutLog } from '../../domain/workoutTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderDiscoveryTasksPage() {
  return render(
    <StudyDataProvider>
      <DiscoveryTasksPage />
    </StudyDataProvider>,
  );
}

describe('DiscoveryTasksPage', () => {
  it('runs generation on mount and lists the newly created discovery tasks as incomplete', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);

    renderDiscoveryTasksPage();

    // A brand-new course with no ExamInfo/Materials/mastery yields 7 flags:
    // exam_info_not_registered + 5 material_missing + mastery_unknown.
    await waitFor(() => expect(screen.getByText('新しく7件の不明点が見つかりました。')).toBeInTheDocument());
    expect(await studyTasksRepository.get()).toHaveLength(7);
    expect(screen.getByText('材料力学の試験情報を登録する')).toBeInTheDocument();
  });

  it('does not duplicate tasks on a second mount, and shows "no new items"', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);

    const { unmount } = renderDiscoveryTasksPage();
    await waitFor(async () => expect(await studyTasksRepository.get()).toHaveLength(7));
    unmount();

    renderDiscoveryTasksPage();
    await waitFor(() => expect(screen.getByText('新しい不明点はありません。')).toBeInTheDocument());
    expect(await studyTasksRepository.get()).toHaveLength(7);
  });

  it('does not resurrect a completed discovery task on the next mount', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();

    const { unmount } = renderDiscoveryTasksPage();
    await waitFor(() => expect(screen.getByText('材料力学の試験情報を登録する')).toBeInTheDocument());

    const row = screen.getByText('材料力学の試験情報を登録する').closest('div');
    await user.click(within(row!).getByRole('button', { name: '完了にする' }));
    await waitFor(async () => {
      const tasks = await studyTasksRepository.get();
      expect(tasks.find((t) => t.title === '材料力学の試験情報を登録する')?.status).toBe('done');
    });
    unmount();

    renderDiscoveryTasksPage();
    await waitFor(() => expect(screen.getByText('新しい不明点はありません。')).toBeInTheDocument());
    // The completed task appears in the Complete section, not Incomplete.
    const completedText = screen.getByText('材料力学の試験情報を登録する');
    expect(completedText).toHaveClass('line-through');
  });

  it('completes an incomplete task and can reopen a completed one', async () => {
    const course: Course = { id: 'c1', name: '材料力学' };
    await studyCoursesRepository.set([course]);
    const user = userEvent.setup();
    renderDiscoveryTasksPage();
    await waitFor(() => expect(screen.getByText('材料力学の試験情報を登録する')).toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: '完了にする' })[0]);
    await waitFor(() => {
      const title = screen.getByText('材料力学の試験情報を登録する');
      expect(title).toHaveClass('line-through');
    });

    await user.click(screen.getByRole('button', { name: '未完了に戻す' }));
    await waitFor(() => {
      const title = screen.getByText('材料力学の試験情報を登録する');
      expect(title).not.toHaveClass('line-through');
    });
  });

  it('separates Discovery Tasks from other StudyTask types', async () => {
    const nonDiscoveryTask: StudyTask = {
      id: 't-learning',
      courseId: 'c1',
      title: '演習問題を解く',
      taskType: 'learning',
      estimatedMinutes: 30,
      remainingMinutes: 30,
      prerequisiteTaskIds: [],
      importance: 3,
      uncertainty: 2,
      status: 'backlog',
    };
    await studyTasksRepository.set([nonDiscoveryTask]);

    renderDiscoveryTasksPage();

    await waitFor(() => expect(screen.getByText('新しい不明点はありません。')).toBeInTheDocument());
    expect(screen.queryByText('演習問題を解く')).not.toBeInTheDocument();
    expect(screen.getByText('未完了の不明点はありません。')).toBeInTheDocument();
  });

  it('does not affect existing Body-side storage', async () => {
    const profile: UserProfile = {
      id: 'u1',
      bodyWeightKg: 60,
      experienceLevel: 'beginner',
      examMode: true,
      examEndDate: '2026-07-31',
      proteinPerShakeG: 20,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    };
    const logs: WorkoutLog[] = [{ id: 'w1', date: '2026-07-07', workoutType: 'intro', exerciseLogs: [] }];
    await userProfileRepository.set(profile);
    await workoutLogsRepository.set(logs);
    await studyCoursesRepository.set([{ id: 'c1', name: '材料力学' }]);

    renderDiscoveryTasksPage();
    await waitFor(async () => expect(await studyTasksRepository.get()).toHaveLength(7));

    expect(await userProfileRepository.get()).toEqual(profile);
    expect(await workoutLogsRepository.get()).toEqual(logs);
  });
});

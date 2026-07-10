import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudyDataProvider } from './context/StudyDataContext';
import { AvailabilityPage } from './AvailabilityPage';
import { studyAvailabilityBlocksRepository } from '../../storage/studyRepositories';
import type { AvailabilityBlock } from '../../domain/study/studyTypes';

beforeEach(() => {
  window.localStorage.clear();
});

function renderAvailabilityPage() {
  return render(
    <StudyDataProvider>
      <AvailabilityPage />
    </StudyDataProvider>,
  );
}

async function fillNewBlockForm(
  user: ReturnType<typeof userEvent.setup>,
  { label, start, end }: { label?: string; start?: string; end?: string },
) {
  if (label !== undefined) await user.type(screen.getByLabelText('ラベル'), label);
  if (start !== undefined) await user.type(screen.getByLabelText('開始日時'), start);
  if (end !== undefined) await user.type(screen.getByLabelText('終了日時'), end);
}

describe('AvailabilityPage', () => {
  it('works with zero courses (AvailabilityBlock does not depend on courseId)', async () => {
    renderAvailabilityPage();
    await waitFor(() => expect(screen.getByText('固定予定を追加')).toBeInTheDocument());
    expect(screen.queryByText('まだ科目が登録されていません。先に科目を登録してください。')).not.toBeInTheDocument();
  });

  it('adds a new availability block with source fixed to manual', async () => {
    const user = userEvent.setup();
    renderAvailabilityPage();
    await waitFor(() => expect(screen.getByText('固定予定を追加')).toBeInTheDocument());

    await fillNewBlockForm(user, { label: '材料力学の講義', start: '2026-07-13T10:00', end: '2026-07-13T11:30' });
    await user.click(screen.getByRole('button', { name: '追加する' }));

    await waitFor(() => expect(screen.getByText('材料力学の講義')).toBeInTheDocument());
    const stored = await studyAvailabilityBlocksRepository.get();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      label: '材料力学の講義',
      start: '2026-07-13T10:00',
      end: '2026-07-13T11:30',
      source: 'manual',
    });
  });

  it('does not save when required fields are missing', async () => {
    const user = userEvent.setup();
    renderAvailabilityPage();
    await waitFor(() => expect(screen.getByText('固定予定を追加')).toBeInTheDocument());

    await fillNewBlockForm(user, { label: '材料力学の講義' }); // no start/end
    await user.click(screen.getByRole('button', { name: '追加する' }));

    expect(
      screen.getByText('ラベル・開始日時・終了日時を入力し、終了日時が開始日時より後になるようにしてください。'),
    ).toBeInTheDocument();
    expect(await studyAvailabilityBlocksRepository.get()).toEqual([]);
  });

  it('does not save when end is not after start', async () => {
    const user = userEvent.setup();
    renderAvailabilityPage();
    await waitFor(() => expect(screen.getByText('固定予定を追加')).toBeInTheDocument());

    await fillNewBlockForm(user, { label: '材料力学の講義', start: '2026-07-13T11:30', end: '2026-07-13T10:00' });
    await user.click(screen.getByRole('button', { name: '追加する' }));

    expect(
      screen.getByText('ラベル・開始日時・終了日時を入力し、終了日時が開始日時より後になるようにしてください。'),
    ).toBeInTheDocument();
    expect(await studyAvailabilityBlocksRepository.get()).toEqual([]);
  });

  it('edits an existing block', async () => {
    const block: AvailabilityBlock = {
      id: 'b1',
      label: '材料力学の講義',
      start: '2026-07-13T10:00',
      end: '2026-07-13T11:30',
      source: 'manual',
    };
    await studyAvailabilityBlocksRepository.set([block]);
    const user = userEvent.setup();
    renderAvailabilityPage();
    await waitFor(() => expect(screen.getByText('材料力学の講義')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '編集' }));
    const labelInputs = screen.getAllByLabelText('ラベル');
    await user.clear(labelInputs[1]);
    await user.type(labelInputs[1], '材料力学の演習');
    await user.click(screen.getByRole('button', { name: '保存する' }));

    await waitFor(() => expect(screen.getByText('材料力学の演習')).toBeInTheDocument());
    expect(await studyAvailabilityBlocksRepository.get()).toEqual([{ ...block, label: '材料力学の演習' }]);
  });

  it('deletes a block after a 2-step confirmation showing its label and time range', async () => {
    const block: AvailabilityBlock = {
      id: 'b1',
      label: '材料力学の講義',
      start: '2026-07-13T10:00',
      end: '2026-07-13T11:30',
      source: 'manual',
    };
    await studyAvailabilityBlocksRepository.set([block]);
    const user = userEvent.setup();
    renderAvailabilityPage();
    await waitFor(() => expect(screen.getByText('材料力学の講義')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '削除する' }));
    expect(screen.getByText(/材料力学の講義」/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '削除する' }));

    await waitFor(async () => expect(await studyAvailabilityBlocksRepository.get()).toEqual([]));
    expect(screen.queryByText('材料力学の講義')).not.toBeInTheDocument();
  });
});

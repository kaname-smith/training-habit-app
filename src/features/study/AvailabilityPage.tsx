import { useState, type FormEvent } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedPicker } from '../../components/study/SegmentedPicker';
import { useStudyData } from './context/useStudyData';
import {
  STUDY_AVAILABILITY_RECURRENCE_EXPLAINER,
  STUDY_AVAILABILITY_VALIDATION_ERROR,
  studyAvailabilityDeleteConfirmText,
  ENERGY_LEVEL_OPTIONS,
} from '../../content/messages';
import type { AvailabilityBlock, EnergyLevel } from '../../domain/study/studyTypes';

interface AvailabilityDraft {
  label: string;
  start: string;
  end: string;
  energyLevel: EnergyLevel | undefined;
}

function draftFromBlock(block?: AvailabilityBlock): AvailabilityDraft {
  return {
    label: block?.label ?? '',
    start: block?.start ?? '',
    end: block?.end ?? '',
    energyLevel: block?.energyLevel,
  };
}

function isValidDraft(draft: AvailabilityDraft): boolean {
  if (!draft.label.trim() || !draft.start || !draft.end) return false;
  return new Date(draft.start).getTime() < new Date(draft.end).getTime();
}

function formatRange(start: string, end: string): string {
  const format = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  return `${format(start)} 〜 ${format(end)}`;
}

const inputClassName =
  'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)]';

function AvailabilityFields({
  draft,
  onChange,
}: {
  draft: AvailabilityDraft;
  onChange: (next: AvailabilityDraft) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        ラベル
        <input
          type="text"
          value={draft.label}
          onChange={(e) => onChange({ ...draft, label: e.target.value })}
          className={inputClassName}
          placeholder="例：材料力学の講義"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        開始日時
        <input
          type="datetime-local"
          value={draft.start}
          onChange={(e) => onChange({ ...draft, start: e.target.value })}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        終了日時
        <input
          type="datetime-local"
          value={draft.end}
          onChange={(e) => onChange({ ...draft, end: e.target.value })}
          className={inputClassName}
        />
      </label>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">エネルギーレベル(任意)</p>
        <SegmentedPicker
          options={ENERGY_LEVEL_OPTIONS}
          value={draft.energyLevel}
          onChange={(v) => onChange({ ...draft, energyLevel: v })}
          aria-label="エネルギーレベル"
        />
      </div>
    </div>
  );
}

export function AvailabilityPage() {
  const { loading, availabilityBlocks, addAvailabilityBlock, updateAvailabilityBlock, removeAvailabilityBlock } =
    useStudyData();
  const [newDraft, setNewDraft] = useState<AvailabilityDraft>(() => draftFromBlock());
  const [newError, setNewError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AvailabilityDraft | null>(null);
  const [editError, setEditError] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  if (loading) {
    return <PageContainer title="固定予定">読み込み中...</PageContainer>;
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!isValidDraft(newDraft)) {
      setNewError(true);
      return;
    }
    setNewError(false);
    await addAvailabilityBlock({
      id: crypto.randomUUID(),
      label: newDraft.label.trim(),
      start: newDraft.start,
      end: newDraft.end,
      source: 'manual',
      energyLevel: newDraft.energyLevel,
    });
    setNewDraft(draftFromBlock());
  }

  function startEditing(block: AvailabilityBlock) {
    setEditingId(block.id);
    setEditDraft(draftFromBlock(block));
    setEditError(false);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDraft(null);
    setEditError(false);
  }

  async function handleSaveEdit(id: string) {
    if (!editDraft || !isValidDraft(editDraft)) {
      setEditError(true);
      return;
    }
    setEditError(false);
    await updateAvailabilityBlock(id, (block) => ({
      ...block,
      label: editDraft.label.trim(),
      start: editDraft.start,
      end: editDraft.end,
      energyLevel: editDraft.energyLevel,
    }));
    setEditingId(null);
    setEditDraft(null);
  }

  async function handleDeleteConfirmed(id: string) {
    await removeAvailabilityBlock(id);
    setConfirmingDeleteId(null);
  }

  const sortedBlocks = [...availabilityBlocks].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <PageContainer title="固定予定">
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">{STUDY_AVAILABILITY_RECURRENCE_EXPLAINER}</p>
      </Card>

      <Card>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">固定予定を追加</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <AvailabilityFields draft={newDraft} onChange={setNewDraft} />
          {newError && <p className="text-sm text-red-600 dark:text-red-400">{STUDY_AVAILABILITY_VALIDATION_ERROR}</p>}
          <Button type="submit" fullWidth>
            追加する
          </Button>
        </form>
      </Card>

      {sortedBlocks.map((block) => {
        const isEditing = editingId === block.id;
        const isConfirmingDelete = confirmingDeleteId === block.id;

        return (
          <Card key={block.id} className="flex flex-col gap-3">
            {isEditing && editDraft ? (
              <>
                <AvailabilityFields draft={editDraft} onChange={setEditDraft} />
                {editError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{STUDY_AVAILABILITY_VALIDATION_ERROR}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth onClick={cancelEditing}>
                    キャンセル
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => handleSaveEdit(block.id)}>
                    保存する
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{block.label}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{formatRange(block.start, block.end)}</p>
                </div>
                <Button variant="ghost" onClick={() => startEditing(block)}>
                  編集
                </Button>
              </div>
            )}

            {!isConfirmingDelete ? (
              <Button variant="ghost" fullWidth onClick={() => setConfirmingDeleteId(block.id)}>
                削除する
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {studyAvailabilityDeleteConfirmText(block.label, formatRange(block.start, block.end))}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth onClick={() => setConfirmingDeleteId(null)}>
                    キャンセル
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => handleDeleteConfirmed(block.id)}>
                    削除する
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </PageContainer>
  );
}

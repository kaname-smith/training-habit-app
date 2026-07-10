import { useState, type FormEvent } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedPicker } from '../../components/study/SegmentedPicker';
import { useStudyData } from './context/useStudyData';
import { FIVE_LEVEL_OPTIONS, COURSE_DELETE_WARNING_TEXT } from '../../content/messages';
import type { Course, FiveLevelScale } from '../../domain/study/studyTypes';

interface CourseDraft {
  name: string;
  dayOfWeek: string;
  period: string;
  credits: string;
  instructor: string;
  lmsUrl: string;
  attendanceStatus: string;
  importance: FiveLevelScale | undefined;
  currentMastery: FiveLevelScale | undefined;
}

function draftFromCourse(course?: Course): CourseDraft {
  return {
    name: course?.name ?? '',
    dayOfWeek: course?.dayOfWeek ?? '',
    period: course?.period ?? '',
    credits: course?.credits !== undefined ? String(course.credits) : '',
    instructor: course?.instructor ?? '',
    lmsUrl: course?.lmsUrl ?? '',
    attendanceStatus: course?.attendanceStatus ?? '',
    importance: course?.importance,
    currentMastery: course?.currentMastery,
  };
}

function courseFromDraft(id: string, draft: CourseDraft): Course {
  return {
    id,
    name: draft.name.trim(),
    dayOfWeek: draft.dayOfWeek.trim() || undefined,
    period: draft.period.trim() || undefined,
    credits: draft.credits.trim() ? Number(draft.credits) : undefined,
    instructor: draft.instructor.trim() || undefined,
    lmsUrl: draft.lmsUrl.trim() || undefined,
    attendanceStatus: draft.attendanceStatus.trim() || undefined,
    importance: draft.importance,
    currentMastery: draft.currentMastery,
  };
}

const inputClassName =
  'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)]';

function CourseFields({
  draft,
  onChange,
}: {
  draft: CourseDraft;
  onChange: (next: CourseDraft) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        科目名
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          className={inputClassName}
          required
        />
      </label>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
          曜日
          <input
            type="text"
            value={draft.dayOfWeek}
            onChange={(e) => onChange({ ...draft, dayOfWeek: e.target.value })}
            className={inputClassName}
            placeholder="例：月"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
          時限
          <input
            type="text"
            value={draft.period}
            onChange={(e) => onChange({ ...draft, period: e.target.value })}
            className={inputClassName}
            placeholder="例：3限"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        単位数
        <input
          type="number"
          inputMode="numeric"
          value={draft.credits}
          onChange={(e) => onChange({ ...draft, credits: e.target.value })}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        担当教員
        <input
          type="text"
          value={draft.instructor}
          onChange={(e) => onChange({ ...draft, instructor: e.target.value })}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        LMS/授業ページURL
        <input
          type="text"
          value={draft.lmsUrl}
          onChange={(e) => onChange({ ...draft, lmsUrl: e.target.value })}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        出席状況
        <input
          type="text"
          value={draft.attendanceStatus}
          onChange={(e) => onChange({ ...draft, attendanceStatus: e.target.value })}
          className={inputClassName}
          placeholder="例：全回出席"
        />
      </label>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">重要度</p>
        <SegmentedPicker
          options={FIVE_LEVEL_OPTIONS}
          value={draft.importance}
          onChange={(v) => onChange({ ...draft, importance: v })}
          aria-label="重要度"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">現在の理解度</p>
        <SegmentedPicker
          options={FIVE_LEVEL_OPTIONS}
          value={draft.currentMastery}
          onChange={(v) => onChange({ ...draft, currentMastery: v })}
          aria-label="現在の理解度"
        />
      </div>
    </div>
  );
}

export function CoursesPage() {
  const { loading, courses, examInfos, materials, studyTasks, addCourse, updateCourse, removeCourseCascade } =
    useStudyData();
  const [newDraft, setNewDraft] = useState<CourseDraft>(() => draftFromCourse());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CourseDraft | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  if (loading) {
    return <PageContainer title="科目">読み込み中...</PageContainer>;
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!newDraft.name.trim()) return;
    await addCourse(courseFromDraft(crypto.randomUUID(), newDraft));
    setNewDraft(draftFromCourse());
  }

  function startEditing(course: Course) {
    setEditingId(course.id);
    setEditDraft(draftFromCourse(course));
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function handleSaveEdit(courseId: string) {
    if (!editDraft || !editDraft.name.trim()) return;
    await updateCourse(courseId, () => courseFromDraft(courseId, editDraft));
    setEditingId(null);
    setEditDraft(null);
  }

  function relatedCounts(courseId: string) {
    return {
      examInfo: examInfos.some((info) => info.courseId === courseId) ? 1 : 0,
      materials: materials.filter((material) => material.courseId === courseId).length,
      tasks: studyTasks.filter((task) => task.courseId === courseId).length,
    };
  }

  async function handleDeleteConfirmed(courseId: string) {
    await removeCourseCascade(courseId);
    setConfirmingDeleteId(null);
  }

  return (
    <PageContainer title="科目">
      <Card>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">科目を追加</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <CourseFields draft={newDraft} onChange={setNewDraft} />
          <Button type="submit" fullWidth>
            追加する
          </Button>
        </form>
      </Card>

      {courses.map((course) => {
        const counts = relatedCounts(course.id);
        const isEditing = editingId === course.id;
        const isConfirmingDelete = confirmingDeleteId === course.id;

        return (
          <Card key={course.id} className="flex flex-col gap-3">
            {isEditing && editDraft ? (
              <>
                <CourseFields draft={editDraft} onChange={setEditDraft} />
                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth onClick={cancelEditing}>
                    キャンセル
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => handleSaveEdit(course.id)}>
                    保存する
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{course.name}</p>
                  {(course.dayOfWeek || course.period) && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      {[course.dayOfWeek, course.period].filter(Boolean).join(' ')}
                    </p>
                  )}
                </div>
                <Button variant="ghost" onClick={() => startEditing(course)}>
                  編集
                </Button>
              </div>
            )}

            {!isConfirmingDelete ? (
              <Button variant="ghost" fullWidth onClick={() => setConfirmingDeleteId(course.id)}>
                削除する
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-red-600 dark:text-red-400">{COURSE_DELETE_WARNING_TEXT}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  試験情報：{counts.examInfo}/1件・教材：{counts.materials}件・タスク：{counts.tasks}件
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth onClick={() => setConfirmingDeleteId(null)}>
                    キャンセル
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => handleDeleteConfirmed(course.id)}>
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

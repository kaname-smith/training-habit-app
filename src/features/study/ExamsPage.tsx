import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedPicker } from '../../components/study/SegmentedPicker';
import { useStudyData } from './context/useStudyData';
import {
  CONFIDENCE_LEVEL_OPTIONS,
  EXAM_FORMAT_OPTIONS,
  EXAM_INFO_CLEAR_CONFIRM_TEXT,
  STUDY_NO_COURSES_TEXT,
  STUDY_GO_TO_COURSES_BUTTON,
} from '../../content/messages';
import type { Course, ExamInfo, ExamFormat, ConfidenceLevel } from '../../domain/study/studyTypes';

const inputClassName =
  'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)]';

function defaultExamInfo(courseId: string): ExamInfo {
  return { courseId, examDateConfidence: 'unknown', scopeConfidence: 'unknown' };
}

function ExamInfoCard({
  course,
  examInfo,
  onSave,
  onClear,
}: {
  course: Course;
  examInfo: ExamInfo;
  onSave: (next: ExamInfo) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState(examInfo);
  const [examDateText, setExamDateText] = useState(examInfo.examDate ?? '');
  const [scopeText, setScopeText] = useState(examInfo.scopeText ?? '');
  const [allowedMaterials, setAllowedMaterials] = useState(examInfo.allowedMaterials ?? '');
  const [weightPercentText, setWeightPercentText] = useState(
    examInfo.weightPercent !== undefined ? String(examInfo.weightPercent) : '',
  );
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Resync local drafts when the underlying data changes from elsewhere
  // (e.g. a JSON import), mirroring SettingsPage's pattern.
  useEffect(() => {
    setDraft(examInfo);
    setExamDateText(examInfo.examDate ?? '');
    setScopeText(examInfo.scopeText ?? '');
    setAllowedMaterials(examInfo.allowedMaterials ?? '');
    setWeightPercentText(examInfo.weightPercent !== undefined ? String(examInfo.weightPercent) : '');
  }, [examInfo]);

  function saveWith(partial: Partial<ExamInfo>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    onSave(next);
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-medium text-[var(--text-primary)]">{course.name}</p>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">試験日の確信度</p>
        <SegmentedPicker
          options={CONFIDENCE_LEVEL_OPTIONS}
          value={draft.examDateConfidence}
          onChange={(v: ConfidenceLevel) => saveWith({ examDateConfidence: v })}
          aria-label="試験日の確信度"
        />
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        試験日(分かる範囲で)
        <input
          type="date"
          value={examDateText}
          onChange={(e) => setExamDateText(e.target.value)}
          onBlur={() => saveWith({ examDate: examDateText || undefined })}
          className={inputClassName}
        />
      </label>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">試験範囲の確信度</p>
        <SegmentedPicker
          options={CONFIDENCE_LEVEL_OPTIONS}
          value={draft.scopeConfidence}
          onChange={(v: ConfidenceLevel) => saveWith({ scopeConfidence: v })}
          aria-label="試験範囲の確信度"
        />
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        試験範囲(分かる範囲で)
        <textarea
          value={scopeText}
          onChange={(e) => setScopeText(e.target.value)}
          onBlur={() => saveWith({ scopeText: scopeText || undefined })}
          className={inputClassName}
          rows={2}
        />
      </label>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">試験形式</p>
        <SegmentedPicker
          options={EXAM_FORMAT_OPTIONS}
          value={draft.format}
          onChange={(v: ExamFormat) => saveWith({ format: v })}
          aria-label="試験形式"
        />
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        持ち込み可否
        <input
          type="text"
          value={allowedMaterials}
          onChange={(e) => setAllowedMaterials(e.target.value)}
          onBlur={() => saveWith({ allowedMaterials: allowedMaterials || undefined })}
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--text-primary)]">
        配点(%)
        <input
          type="number"
          inputMode="numeric"
          value={weightPercentText}
          onChange={(e) => setWeightPercentText(e.target.value)}
          onBlur={() =>
            saveWith({ weightPercent: weightPercentText.trim() ? Number(weightPercentText) : undefined })
          }
          className={inputClassName}
        />
      </label>

      {!confirmingClear ? (
        <Button variant="ghost" fullWidth onClick={() => setConfirmingClear(true)}>
          試験情報をクリアする
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-600 dark:text-red-400">{EXAM_INFO_CLEAR_CONFIRM_TEXT}</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirmingClear(false)}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                onClear();
                setConfirmingClear(false);
              }}
            >
              クリアする
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ExamsPage() {
  const { loading, courses, examInfos, upsertExamInfo, removeExamInfo } = useStudyData();

  if (loading) {
    return <PageContainer title="試験情報">読み込み中...</PageContainer>;
  }

  if (courses.length === 0) {
    return (
      <PageContainer title="試験情報">
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-[var(--text-secondary)]">{STUDY_NO_COURSES_TEXT}</p>
          <Link to="/study/courses">
            <Button fullWidth>{STUDY_GO_TO_COURSES_BUTTON}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="試験情報">
      {courses.map((course) => {
        const examInfo = examInfos.find((info) => info.courseId === course.id) ?? defaultExamInfo(course.id);
        return (
          <ExamInfoCard
            key={course.id}
            course={course}
            examInfo={examInfo}
            onSave={upsertExamInfo}
            onClear={() => removeExamInfo(course.id)}
          />
        );
      })}
    </PageContainer>
  );
}

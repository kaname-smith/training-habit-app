import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedPicker } from '../../components/study/SegmentedPicker';
import { useStudyData } from './context/useStudyData';
import { REQUIRED_MATERIAL_KINDS } from '../../domain/study/confidenceAudit';
import { MATERIAL_KIND_LABELS } from '../../domain/study/discoveryTasks';
import {
  MATERIAL_STATUS_OPTIONS,
  MATERIAL_NOT_APPLICABLE_HELPER_TEXT,
  STUDY_NO_COURSES_TEXT,
  STUDY_GO_TO_COURSES_BUTTON,
} from '../../content/messages';
import type { Course, MaterialItem, MaterialKind, MaterialStatus } from '../../domain/study/studyTypes';

export function MaterialsPage() {
  const { loading, courses, materials, addMaterial, updateMaterial } = useStudyData();

  if (loading) {
    return <PageContainer title="教材">読み込み中...</PageContainer>;
  }

  if (courses.length === 0) {
    return (
      <PageContainer title="教材">
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-[var(--text-secondary)]">{STUDY_NO_COURSES_TEXT}</p>
          <Link to="/study/courses">
            <Button fullWidth>{STUDY_GO_TO_COURSES_BUTTON}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  async function handleStatusChange(course: Course, kind: MaterialKind, status: MaterialStatus) {
    const existing = materials.find((item) => item.courseId === course.id && item.kind === kind);
    if (existing) {
      await updateMaterial(existing.id, (item) => ({ ...item, status }));
    } else {
      const newItem: MaterialItem = { id: crypto.randomUUID(), courseId: course.id, kind, status };
      await addMaterial(newItem);
    }
  }

  return (
    <PageContainer title="教材">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col gap-4">
          <p className="font-medium text-[var(--text-primary)]">{course.name}</p>
          {REQUIRED_MATERIAL_KINDS.map((kind) => {
            const item = materials.find((m) => m.courseId === course.id && m.kind === kind);
            const status: MaterialStatus = item?.status ?? 'missing';
            return (
              <div key={kind} className="flex flex-col gap-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{MATERIAL_KIND_LABELS[kind]}</p>
                <SegmentedPicker
                  options={MATERIAL_STATUS_OPTIONS}
                  value={status}
                  onChange={(next) => handleStatusChange(course, kind, next)}
                  aria-label={MATERIAL_KIND_LABELS[kind]}
                />
                {status === 'not_applicable' && (
                  <p className="text-xs text-[var(--text-muted)]">{MATERIAL_NOT_APPLICABLE_HELPER_TEXT}</p>
                )}
              </div>
            );
          })}
        </Card>
      ))}
    </PageContainer>
  );
}

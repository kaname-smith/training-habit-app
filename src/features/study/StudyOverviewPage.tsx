import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { useStudyData } from './context/useStudyData';
import { STUDY_OVERVIEW_INTRO, STUDY_OVERVIEW_STATUS_PREPARING } from '../../content/messages';

// Minimal S1 foundation screen: verifies StudyDataProvider mounts correctly
// on this route and can be read from, but has no CRUD forms or Discovery
// Task actions yet — those land in a later phase.
export function StudyOverviewPage() {
  const { loading, courses } = useStudyData();

  return (
    <PageContainer title="Study">
      <Card className="flex flex-col gap-2">
        <p className="text-sm text-[var(--text-primary)]">{STUDY_OVERVIEW_INTRO}</p>
        <p className="text-sm text-[var(--text-secondary)]">{STUDY_OVERVIEW_STATUS_PREPARING}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">
          {loading ? '読み込み中...' : `登録済みの科目: ${courses.length}件`}
        </p>
      </Card>
    </PageContainer>
  );
}

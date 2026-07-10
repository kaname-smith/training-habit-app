import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useStudyData } from './context/useStudyData';
import {
  STUDY_OVERVIEW_INTRO,
  STUDY_COURSES_TITLE,
  STUDY_COURSES_SUBTITLE,
  STUDY_EXAMS_TITLE,
  STUDY_EXAMS_SUBTITLE,
  STUDY_MATERIALS_TITLE,
  STUDY_MATERIALS_SUBTITLE,
  STUDY_DISCOVERY_TITLE,
  STUDY_DISCOVERY_SUBTITLE,
  STUDY_AVAILABILITY_TITLE,
  STUDY_AVAILABILITY_SUBTITLE,
} from '../../content/messages';

function NavCard({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
  return (
    <Link to={to}>
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--text-primary)]">{title}</p>
          <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
        </div>
        <Icon name="chevronRight" className="w-5 h-5 text-[var(--text-muted)]" />
      </Card>
    </Link>
  );
}

function ComingSoonCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card className="opacity-60">
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
    </Card>
  );
}

// Study Overview hub: verifies StudyDataProvider mounts correctly on this
// route, and links into the S1 modules implemented so far. Discovery Tasks
// and Availability are shown as not-yet-available (Phase 4-B/4-C).
export function StudyOverviewPage() {
  const { loading, courses } = useStudyData();

  return (
    <PageContainer title="Study">
      <Card>
        <p className="text-sm text-[var(--text-primary)]">{STUDY_OVERVIEW_INTRO}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">
          {loading ? '読み込み中...' : `登録済みの科目: ${courses.length}件`}
        </p>
      </Card>

      <NavCard to="/study/courses" title={STUDY_COURSES_TITLE} subtitle={STUDY_COURSES_SUBTITLE} />
      <NavCard to="/study/exams" title={STUDY_EXAMS_TITLE} subtitle={STUDY_EXAMS_SUBTITLE} />
      <NavCard to="/study/materials" title={STUDY_MATERIALS_TITLE} subtitle={STUDY_MATERIALS_SUBTITLE} />
      <ComingSoonCard title={STUDY_DISCOVERY_TITLE} subtitle={STUDY_DISCOVERY_SUBTITLE} />
      <ComingSoonCard title={STUDY_AVAILABILITY_TITLE} subtitle={STUDY_AVAILABILITY_SUBTITLE} />
    </PageContainer>
  );
}

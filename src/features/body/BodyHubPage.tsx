import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import {
  BODY_HUB_WORKOUT_TITLE,
  BODY_HUB_WORKOUT_SUBTITLE,
  BODY_HUB_NUTRITION_TITLE,
  BODY_HUB_NUTRITION_SUBTITLE,
} from '../../content/messages';

export function BodyHubPage() {
  return (
    <PageContainer title="Body">
      <Link to="/workout">
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[var(--text-primary)]">{BODY_HUB_WORKOUT_TITLE}</p>
            <p className="text-sm text-[var(--text-secondary)]">{BODY_HUB_WORKOUT_SUBTITLE}</p>
          </div>
          <Icon name="chevronRight" className="w-5 h-5 text-[var(--text-muted)]" />
        </Card>
      </Link>
      <Link to="/nutrition">
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[var(--text-primary)]">{BODY_HUB_NUTRITION_TITLE}</p>
            <p className="text-sm text-[var(--text-secondary)]">{BODY_HUB_NUTRITION_SUBTITLE}</p>
          </div>
          <Icon name="chevronRight" className="w-5 h-5 text-[var(--text-muted)]" />
        </Card>
      </Link>
    </PageContainer>
  );
}

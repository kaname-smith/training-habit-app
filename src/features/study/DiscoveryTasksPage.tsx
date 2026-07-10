import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStudyData } from './context/useStudyData';
import {
  STUDY_DISCOVERY_AUTO_RUN_EXPLAINER,
  STUDY_DISCOVERY_NO_NEW_ITEMS_TEXT,
  studyDiscoveryNewItemsCountText,
  STUDY_DISCOVERY_INCOMPLETE_TITLE,
  STUDY_DISCOVERY_ALL_RESOLVED_TEXT,
  STUDY_DISCOVERY_COMPLETE_TITLE,
  STUDY_DISCOVERY_COMPLETE_HELPER_TEXT,
  STUDY_DISCOVERY_MARK_DONE_BUTTON,
  STUDY_DISCOVERY_REOPEN_BUTTON,
} from '../../content/messages';

export function DiscoveryTasksPage() {
  const { loading, studyTasks, runDiscoveryTaskGeneration, updateStudyTask } = useStudyData();
  const [generationRun, setGenerationRun] = useState(false);
  const [newlyCreatedCount, setNewlyCreatedCount] = useState<number | null>(null);

  useEffect(() => {
    if (loading || generationRun) return;
    setGenerationRun(true);
    void runDiscoveryTaskGeneration().then((created) => {
      setNewlyCreatedCount(created.length);
    });
  }, [loading, generationRun, runDiscoveryTaskGeneration]);

  if (loading) {
    return <PageContainer title="Discovery Tasks">読み込み中...</PageContainer>;
  }

  const discoveryTasks = studyTasks.filter((task) => task.taskType === 'discovery');
  const incomplete = discoveryTasks.filter((task) => task.status !== 'done');
  const complete = discoveryTasks.filter((task) => task.status === 'done');

  async function handleComplete(id: string) {
    await updateStudyTask(id, (task) => ({ ...task, status: 'done' }));
  }

  async function handleReopen(id: string) {
    await updateStudyTask(id, (task) => ({ ...task, status: 'ready' }));
  }

  return (
    <PageContainer title="Discovery Tasks">
      <Card className="flex flex-col gap-2">
        <p className="text-sm text-[var(--text-secondary)]">{STUDY_DISCOVERY_AUTO_RUN_EXPLAINER}</p>
        {newlyCreatedCount !== null && (
          <p className="text-xs text-[var(--text-muted)]">
            {newlyCreatedCount > 0
              ? studyDiscoveryNewItemsCountText(newlyCreatedCount)
              : STUDY_DISCOVERY_NO_NEW_ITEMS_TEXT}
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {STUDY_DISCOVERY_INCOMPLETE_TITLE}
        </p>
        {incomplete.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{STUDY_DISCOVERY_ALL_RESOLVED_TEXT}</p>
        ) : (
          incomplete.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-2">
              <p className="text-sm text-[var(--text-primary)]">{task.title}</p>
              <Button variant="secondary" onClick={() => handleComplete(task.id)}>
                {STUDY_DISCOVERY_MARK_DONE_BUTTON}
              </Button>
            </div>
          ))
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {STUDY_DISCOVERY_COMPLETE_TITLE}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{STUDY_DISCOVERY_COMPLETE_HELPER_TEXT}</p>
        {complete.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-2">
            <p className="text-sm text-[var(--text-primary)] line-through opacity-70">{task.title}</p>
            <Button variant="ghost" onClick={() => handleReopen(task.id)}>
              {STUDY_DISCOVERY_REOPEN_BUTTON}
            </Button>
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}

import { Icon } from './Icon';
import { SAFETY_NOTICE_FULL, SAFETY_NOTICE_COMPACT } from '../../content/messages';

interface SafetyNoticeProps {
  compact?: boolean;
}

export function SafetyNotice({ compact = false }: SafetyNoticeProps) {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-amber-900 dark:text-amber-200"
    >
      <Icon name="warning" className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm leading-snug">{compact ? SAFETY_NOTICE_COMPACT : SAFETY_NOTICE_FULL}</p>
    </div>
  );
}

import { Icon } from './Icon';

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
      <p className="text-sm leading-snug">
        痛み、めまい、吐き気、胸痛、強い違和感がある場合は、すぐに運動を中止してください。
        {!compact && 'このアプリは医療アドバイスではありません。'}
      </p>
    </div>
  );
}

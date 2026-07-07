import { Icon } from '../ui/Icon';
import { REMINDER_BANNER_TITLE, REMINDER_BANNER_BODY } from '../../content/messages';
import type { NotificationTime } from '../../storage/repositories';

// Local wall-clock hour past which each notification-time slot is considered
// "due". Uses Date#getHours() (local time), not toISOString()/UTC — see
// src/app/hooks.ts's todayIsoDate() comment for the JST bug this pattern avoids.
const DUE_HOUR: Record<NotificationTime, number> = {
  morning: 9,
  evening: 17,
  night: 21,
};

export interface ReminderBannerProps {
  notificationsEnabled: boolean;
  notificationTime: NotificationTime;
  hasTodayLog: boolean;
  now?: Date;
}

export function ReminderBanner({
  notificationsEnabled,
  notificationTime,
  hasTodayLog,
  now = new Date(),
}: ReminderBannerProps) {
  if (!notificationsEnabled || hasTodayLog) return null;
  if (now.getHours() < DUE_HOUR[notificationTime]) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl bg-[var(--accent-surface)] border border-[var(--border-color)] p-3 text-[var(--text-primary)]"
    >
      <Icon name="bell" className="w-5 h-5 shrink-0 mt-0.5 text-[var(--accent)]" />
      <div>
        <p className="text-sm font-medium">{REMINDER_BANNER_TITLE}</p>
        <p className="text-sm text-[var(--text-secondary)]">{REMINDER_BANNER_BODY}</p>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

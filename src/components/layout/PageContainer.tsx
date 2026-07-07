import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  children: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div className="mx-auto max-w-md min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">{title}</h1>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

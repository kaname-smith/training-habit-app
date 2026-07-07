import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--border-color)] hover:opacity-90 active:opacity-80',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]',
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-xl px-5 py-3 text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        variantClasses[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

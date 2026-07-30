import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary:
    'thermal-glow bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container hover:opacity-90',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary-fixed',
  outline: 'border border-primary text-primary hover:bg-primary/10',
  ghost: 'text-on-surface-variant hover:text-on-surface',
};

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-label-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Glass-panel surface (Supernova). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('glass-panel rounded-xl p-8', className)} {...props} />
  );
}

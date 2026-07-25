import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Glass surface card (Event Horizon). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass rounded-card p-6', className)} {...props} />;
}

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** React Bits DisplayCards — a fanned, stacked deck that spreads on hover. */
export interface DisplayCardProps {
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon,
  title = 'Featured',
  description = 'Discover amazing content',
  date = 'Just now',
  iconClassName = 'text-primary',
  titleClassName = 'text-primary',
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        'glass-panel relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border border-white/10 px-4 py-3 transition-all duration-700 [&>*]:flex [&>*]:items-center [&>*]:gap-2',
        className,
      )}
    >
      <div>
        <span
          className={cn(
            'relative inline-block rounded-full bg-surface-dim p-1.5',
            iconClassName,
          )}
        >
          {icon}
        </span>
        <p className={cn('text-label-lg font-medium', titleClassName)}>
          {title}
        </p>
      </div>
      <p className="whitespace-nowrap text-body-lg text-on-surface">
        {description}
      </p>
      <p className="text-body-sm text-on-surface-variant">{date}</p>
    </div>
  );
}

export function DisplayCards({ cards }: { cards: DisplayCardProps[] }) {
  return (
    <div className="grid place-items-center [grid-template-areas:'stack']">
      {cards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

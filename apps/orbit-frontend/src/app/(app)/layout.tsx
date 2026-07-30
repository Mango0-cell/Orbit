import type { ReactNode } from 'react';

/** Authenticated app shell. Nav / sidebar are built from the Stitch design.
 *  Sibling routes live here: feed/, profile/[tag]/, chat/, notifications/. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}

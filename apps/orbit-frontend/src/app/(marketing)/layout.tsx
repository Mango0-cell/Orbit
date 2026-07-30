import type { ReactNode } from 'react';

/** Public marketing shell (landing). A marketing header/footer can live here later. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}

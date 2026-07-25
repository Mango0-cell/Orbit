import type { ReactNode } from 'react';

/** Centered card shell for auth flows (login / signup). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

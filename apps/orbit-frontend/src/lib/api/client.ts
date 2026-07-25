/**
 * Base URLs for the backend services, from PUBLIC env only (never a secret client-side).
 * The frontend talks to services by URL; in production these route through Nginx.
 */
export const API = {
  users: process.env.NEXT_PUBLIC_USERS_API ?? 'http://localhost:3001/api',
  content: process.env.NEXT_PUBLIC_CONTENT_API ?? 'http://localhost:3002/api',
  notifications:
    process.env.NEXT_PUBLIC_NOTIFICATIONS_API ?? 'http://localhost:3004/api',
  chatWs: process.env.NEXT_PUBLIC_CHAT_WS ?? 'ws://localhost:3003',
} as const;

/** Minimal JSON fetch helper. Pass the caller's JWT via an `Authorization` header when needed. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  return res.json() as Promise<T>;
}

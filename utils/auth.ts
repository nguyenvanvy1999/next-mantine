import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PATH_AUTH } from '@/routes';

// Better Auth server-side utilities
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect(PATH_AUTH.signin);
  }

  return session.user;
}

// Export session type for convenience
export type { Session } from '@/lib/auth';

// Note: Client-side auth operations (register, login, profile updates, etc.)
// are handled by the Better Auth client in lib/auth-client.ts

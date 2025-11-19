import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { ac, roles } from '@/lib/auth-access';
import { env } from '@/lib/env';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  plugins: [
    adminClient({
      ac,
      roles,
    }),
  ],
});

// Export commonly used hooks and methods for convenience
export const { useSession, signIn, signOut, signUp } = authClient;

// Export admin methods for convenience
export const admin = authClient.admin;

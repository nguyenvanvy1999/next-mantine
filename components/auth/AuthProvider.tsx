'use client';

import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

// Better Auth handles session management internally via React hooks
// This component is kept for backward compatibility but is now just a wrapper
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}

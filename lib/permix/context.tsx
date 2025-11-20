'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authClient } from '@/lib/auth-client';
import type { User } from './instance';
import { permix } from './instance';
import { getTemplateByRole } from './templates';
import { createEmptyPermissions } from './utils';

interface PermixContextValue {
  isReady: boolean;
  check: typeof permix.check;
}

const PermixContext = createContext<PermixContextValue | null>(null);

interface PermixProviderProps {
  children: ReactNode;
}

/**
 * Permix Provider - Sets up permissions based on current user's role
 */
export function PermixProvider({ children }: PermixProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function setupPermissions() {
      if (!session?.user) {
        // No user session, set empty permissions
        permix.setup(createEmptyPermissions());
        setIsReady(true);
        return;
      }

      try {
        const user: User = {
          id: session.user.id,
          role: session.user.role || 'user',
        };

        const role = user.role || 'user';
        const permissions = getTemplateByRole(role, user);

        permix.setup(permissions);
        setIsReady(true);
      } catch (error) {
        console.error('Error setting up permissions:', error);
        permix.setup(createEmptyPermissions());
        setIsReady(true);
      }
    }

    setupPermissions();
  }, [session]);

  const value: PermixContextValue = {
    isReady,
    check: permix.check.bind(permix),
  };

  return (
    <PermixContext.Provider value={value}>{children}</PermixContext.Provider>
  );
}

/**
 * Hook to use Permix context
 */
export function usePermix(): PermixContextValue {
  const context = useContext(PermixContext);

  if (!context) {
    throw new Error('usePermix must be used within PermixProvider');
  }

  return context;
}

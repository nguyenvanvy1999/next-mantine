'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { ClerkProvider } from '@clerk/nextjs';
import { Alert, Container } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { MainLayout } from '@/layouts/Main';
import { Providers } from '@/providers/session';

import './layout.css';

type AuthProps = {
  children: ReactNode;
};

function AuthLayout({ children }: AuthProps) {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKey) {
    return (
      <MainLayout>
        <Providers>
          <Container>
            <Alert
              icon={<IconInfoCircle size={18} />}
              title="Clerk Configuration Required"
              color="blue"
              mt="xl"
            >
              To use Clerk authentication, please add
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to your environment variables.
              You can get your key at the Clerk Dashboard.
            </Alert>
          </Container>
        </Providers>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Providers>
        <ClerkProvider
          appearance={{
            cssLayerName: 'clerk',
          }}
        >
          {children}
        </ClerkProvider>
      </Providers>
    </MainLayout>
  );
}

export default AuthLayout;

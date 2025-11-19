'use client';

import { Container, Stack } from '@mantine/core';
import type { PropsWithChildren } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <Container fluid>
      <Stack gap="lg">{children}</Stack>
    </Container>
  );
}

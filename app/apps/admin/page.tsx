import { Container, Stack, Text, Title } from '@mantine/core';
import { requirePermission } from '@/lib/permissions';
import { UserManagement } from './components/UserManagement';

export default async function AdminPage() {
  // Require admin permissions to access this page
  await requirePermission({
    user: ['list', 'set-role'],
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Admin Dashboard</Title>
          <Text c="dimmed" mt="xs">
            Manage users, roles, and permissions
          </Text>
        </div>

        <UserManagement />
      </Stack>
    </Container>
  );
}

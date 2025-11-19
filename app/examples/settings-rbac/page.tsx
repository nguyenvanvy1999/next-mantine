import {
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { PermissionGate } from '@/components/PermissionGate';
import { requirePermission } from '@/lib/permissions';

export default async function SettingsExamplePage() {
  // Require 'view' permission for settings to access this page
  await requirePermission({
    settings: ['view'],
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Settings</Title>
          <Text c="dimmed" mt="xs">
            This page requires 'settings: view' permission to access
          </Text>
        </div>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Application Settings
            </Text>
            <Text c="dimmed">
              This content is visible to anyone with 'settings: view'
              permission.
            </Text>

            <Divider />

            <div>
              <Text fw={500} mb="xs">
                General Settings
              </Text>
              <Text size="sm" c="dimmed">
                Application name, logo, and other general settings
              </Text>
            </div>

            {/* Only show update controls if user has update permission */}
            <PermissionGate
              permissions={{ settings: ['update'] }}
              fallback={
                <Text size="sm" c="orange">
                  You can view settings but don't have permission to update
                  them.
                </Text>
              }
            >
              <Group>
                <Button leftSection={<IconSettings size={16} />}>
                  Update Settings
                </Button>
                <Button variant="light">Reset to Default</Button>
              </Group>
            </PermissionGate>

            <Divider />

            <div>
              <Text fw={500} mb="xs">
                Advanced Settings
              </Text>
              <PermissionGate
                permissions={{ settings: ['update'] }}
                showDefaultDenied={true}
              >
                <Text size="sm" c="dimmed">
                  Advanced configuration options for administrators
                </Text>
                <Button variant="outline" mt="xs">
                  Configure Advanced Options
                </Button>
              </PermissionGate>
            </div>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

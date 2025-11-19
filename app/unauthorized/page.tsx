import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

export default function UnauthorizedPage() {
  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="lg" mt={100}>
        <IconLock size={80} stroke={1.5} color="var(--mantine-color-red-6)" />
        <Title order={1} ta="center">
          Access Denied
        </Title>
        <Text size="lg" c="dimmed" ta="center">
          You don't have permission to access this page.
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          If you believe this is an error, please contact your administrator.
        </Text>
        <Group mt="md">
          <Button component="a" href="/dashboard/default" variant="light">
            Go to Dashboard
          </Button>
          <Button component="a" href="/" variant="outline">
            Go to Home
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

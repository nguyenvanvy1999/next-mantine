'use client';

import {
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArrowRight,
  IconChartBar,
  IconRocket,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { Surface } from '@/components';

export default function DashboardPage() {
  const theme = useMantineTheme();

  const stats = [
    { label: 'Total Users', value: '1,234', icon: IconUsers, color: 'blue' },
    {
      label: 'Active Sessions',
      value: '456',
      icon: IconRocket,
      color: 'green',
    },
    { label: 'Revenue', value: '$12,345', icon: IconChartBar, color: 'violet' },
  ];

  return (
    <Container fluid>
      <Stack gap="lg">
        <Surface
          component={Paper}
          p="xl"
          radius="md"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.colors[theme.primaryColor][6]} 0%, ${theme.colors[theme.primaryColor][9]} 100%)`,
            color: 'white',
          }}
        >
          <Stack gap="xs">
            <Title order={2} c="white">
              Welcome to your new App
            </Title>
            <Text c="white" opacity={0.9} maw={600}>
              This is the starting point for your new application. You have a
              clean slate to build something amazing. Start by exploring the
              documentation or configuring your settings.
            </Text>
            <Group mt="md">
              <Button
                variant="white"
                c={theme.primaryColor}
                rightSection={<IconArrowRight size={16} />}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                c="white"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                leftSection={<IconSettings size={16} />}
              >
                Settings
              </Button>
            </Group>
          </Stack>
        </Surface>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {stats.map((stat) => (
            <Surface key={stat.label} component={Paper} p="md" radius="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    {stat.label}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <ThemeIcon
                  color={stat.color}
                  variant="light"
                  size={38}
                  radius="md"
                >
                  <stat.icon size={20} stroke={1.5} />
                </ThemeIcon>
              </Group>
            </Surface>
          ))}
        </SimpleGrid>

        <Surface
          component={Paper}
          p="md"
          radius="md"
          style={{ minHeight: 400 }}
        >
          <Title order={4} mb="md">
            Recent Activity
          </Title>
          <Text c="dimmed" ta="center" py="xl">
            No activity yet. Start using the app to see data here.
          </Text>
        </Surface>
      </Stack>
    </Container>
  );
}

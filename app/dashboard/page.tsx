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
import { useTranslation } from 'react-i18next';
import { Surface } from '@/components';

export default function DashboardPage() {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  const stats = [
    {
      label: t('dashboard.totalRevenue'),
      value: '$12,345',
      icon: IconChartBar,
      color: 'violet',
    },
    {
      label: t('dashboard.activeUsers'),
      value: '1,234',
      icon: IconUsers,
      color: 'blue',
    },
    {
      label: t('dashboard.activeSessions'),
      value: '456',
      icon: IconRocket,
      color: 'green',
    },
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
              {t('home.heroTitle')}
            </Title>
            <Text c="white" opacity={0.9} maw={600}>
              {t('home.heroDescription')}
            </Text>
            <Group mt="md">
              <Button
                variant="white"
                c={theme.primaryColor}
                rightSection={<IconArrowRight size={16} />}
              >
                {t('buttons.getStarted')}
              </Button>
              <Button
                variant="outline"
                c="white"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                leftSection={<IconSettings size={16} />}
              >
                {t('buttons.settings')}
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
            {t('dashboard.recentActivity')}
          </Title>
          <Text c="dimmed" ta="center" py="xl">
            {t('dashboard.activityEmpty')}
          </Text>
        </Surface>
      </Stack>
    </Container>
  );
}

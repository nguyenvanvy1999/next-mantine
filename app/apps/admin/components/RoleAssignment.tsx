'use client';

import {
  Badge,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface RoleAssignmentProps {
  opened: boolean;
  onClose: () => void;
  user: User;
  onRoleUpdated: () => void;
}

const AVAILABLE_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'user,manager', label: 'User + Manager' },
  { value: 'manager,admin', label: 'Manager + Admin' },
];

export function RoleAssignment({
  opened,
  onClose,
  user,
  onRoleUpdated,
}: RoleAssignmentProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await authClient.admin.setRole({
        userId: user.id,
        role: selectedRole as any, // Better Auth accepts string but has strict type definitions
      });

      notifications.show({
        title: 'Success',
        message: 'User role updated successfully',
        color: 'green',
      });

      onRoleUpdated();
    } catch (error) {
      console.error('Error updating role:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update user role',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Assign Role" size="md">
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb={4}>
            User
          </Text>
          <Text size="sm" c="dimmed">
            {user.name || user.email}
          </Text>
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>
            Current Role
          </Text>
          <Group gap="xs">
            {user.role.split(',').map((role) => (
              <Badge
                key={role}
                color={
                  role.trim() === 'admin'
                    ? 'red'
                    : role.trim() === 'manager'
                      ? 'blue'
                      : 'gray'
                }
                variant="light"
              >
                {role.trim()}
              </Badge>
            ))}
          </Group>
        </div>

        <Select
          label="New Role"
          placeholder="Select role"
          data={AVAILABLE_ROLES}
          value={selectedRole}
          onChange={(value) => setSelectedRole(value || 'user')}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={selectedRole === user.role}
          >
            Update Role
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

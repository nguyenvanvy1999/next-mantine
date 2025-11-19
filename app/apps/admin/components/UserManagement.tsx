'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconDots,
  IconTrash,
  IconUserCheck,
  IconUserEdit,
  IconUserX,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { RoleAssignment } from './RoleAssignment';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpened, setRoleModalOpened] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await authClient.admin.listUsers({
        query: {},
      });

      if (result.data) {
        setUsers(result.data.users as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch users',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanUser = async (userId: string) => {
    try {
      await authClient.admin.banUser({
        userId,
        banReason: 'Banned by administrator',
      });

      notifications.show({
        title: 'Success',
        message: 'User banned successfully',
        color: 'green',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to ban user',
        color: 'red',
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({
        userId,
      });

      notifications.show({
        title: 'Success',
        message: 'User unbanned successfully',
        color: 'green',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to unban user',
        color: 'red',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await authClient.admin.removeUser({
        userId,
      });

      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleSetRole = (user: User) => {
    setSelectedUser(user);
    setRoleModalOpened(true);
  };

  const handleRoleUpdated = () => {
    setRoleModalOpened(false);
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>User Management</Title>
            <Text size="sm" c="dimmed">
              Manage user roles and permissions
            </Text>
          </div>
          <Button onClick={fetchUsers} loading={loading}>
            Refresh
          </Button>
        </Group>

        {users.length === 0 && !loading ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="No users found"
            color="blue"
          >
            There are no users in the system yet.
          </Alert>
        ) : (
          <DataTable
            columns={[
              {
                accessor: 'name',
                title: 'Name',
                render: (user) => user.name || <Text c="dimmed">N/A</Text>,
              },
              {
                accessor: 'email',
                title: 'Email',
              },
              {
                accessor: 'role',
                title: 'Role',
                render: (user) => {
                  const roles = user.role.split(',').map((r) => r.trim());
                  return (
                    <Group gap="xs">
                      {roles.map((role) => (
                        <Badge
                          key={role}
                          color={
                            role === 'admin'
                              ? 'red'
                              : role === 'manager'
                                ? 'blue'
                                : 'gray'
                          }
                          variant="light"
                        >
                          {role}
                        </Badge>
                      ))}
                    </Group>
                  );
                },
              },
              {
                accessor: 'banned',
                title: 'Status',
                render: (user) =>
                  user.banned ? (
                    <Badge color="red" variant="filled">
                      Banned
                    </Badge>
                  ) : (
                    <Badge color="green" variant="light">
                      Active
                    </Badge>
                  ),
              },
              {
                accessor: 'createdAt',
                title: 'Created',
                render: (user) => new Date(user.createdAt).toLocaleDateString(),
              },
              {
                accessor: 'actions',
                title: 'Actions',
                textAlign: 'right',
                render: (user) => (
                  <Group gap={4} justify="flex-end">
                    <Menu position="bottom-end" shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconUserEdit size={14} />}
                          onClick={() => handleSetRole(user)}
                        >
                          Set Role
                        </Menu.Item>

                        {user.banned ? (
                          <Menu.Item
                            leftSection={<IconUserCheck size={14} />}
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            Unban User
                          </Menu.Item>
                        ) : (
                          <Menu.Item
                            leftSection={<IconUserX size={14} />}
                            color="orange"
                            onClick={() => handleBanUser(user.id)}
                          >
                            Ban User
                          </Menu.Item>
                        )}

                        <Menu.Divider />

                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete User
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                ),
              },
            ]}
            records={users}
            fetching={loading}
            minHeight={200}
          />
        )}
      </Paper>

      {selectedUser && (
        <RoleAssignment
          opened={roleModalOpened}
          onClose={() => setRoleModalOpened(false)}
          user={selectedUser}
          onRoleUpdated={handleRoleUpdated}
        />
      )}
    </Stack>
  );
}

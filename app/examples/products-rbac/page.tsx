import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { PermissionGate } from '@/components/PermissionGate';
import { requirePermission } from '@/lib/permissions';

export default async function ProductsExamplePage() {
  // Require 'view' permission for products to access this page
  await requirePermission({
    products: ['view'],
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Products</Title>
          <Text c="dimmed" mt="xs">
            This page requires 'products: view' permission to access
          </Text>
        </div>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Product List
            </Text>
            <Text c="dimmed">
              This content is visible to anyone with 'products: view'
              permission.
            </Text>

            {/* Only show create button if user has create permission */}
            <PermissionGate
              permissions={{ products: ['create'] }}
              showDefaultDenied={false}
            >
              <Group>
                <Button leftSection={<IconShoppingCart size={16} />}>
                  Create New Product
                </Button>
              </Group>
            </PermissionGate>

            {/* Show update/delete actions only if user has those permissions */}
            <PermissionGate
              permissions={{ products: ['update', 'delete'] }}
              fallback={
                <Text size="sm" c="dimmed">
                  You don't have permission to modify products.
                </Text>
              }
            >
              <Group>
                <Button variant="light">Edit Product</Button>
                <Button variant="light" color="red">
                  Delete Product
                </Button>
              </Group>
            </PermissionGate>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

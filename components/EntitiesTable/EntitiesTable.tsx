'use client';

import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  DataTable,
  type DataTableProps,
  type DataTableSortStatus,
} from 'mantine-datatable';
import { useMemo, useState } from 'react';

import type { EntityResponse, EntityType } from '@/types/entity';

const ICON_SIZE = 18;

type EntitiesTableProps = {
  entities: EntityResponse[];
  onEdit: (entity: EntityResponse) => void;
  onDelete: (entity: EntityResponse) => void;
  isLoading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalRecords?: number;
  sortStatus?: DataTableSortStatus<EntityResponse>;
  onSortStatusChange?: (status: DataTableSortStatus<EntityResponse>) => void;
};

const EntityTypeBadge = ({ type }: { type: EntityType }) => {
  const typeConfig: Record<EntityType, { label: string; color: string }> = {
    individual: { label: 'Individual', color: 'blue' },
    organization: { label: 'Organization', color: 'green' },
  };

  const config = typeConfig[type] || { label: type, color: 'gray' };

  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
};

const EntitiesTable = ({
  entities,
  onEdit,
  onDelete,
  isLoading = false,
  page = 1,
  onPageChange,
  pageSize = 20,
  onPageSizeChange,
  totalRecords,
  sortStatus,
  onSortStatusChange,
}: EntitiesTableProps) => {
  const [selectedRecords, setSelectedRecords] = useState<EntityResponse[]>([]);

  const columns: DataTableProps<EntityResponse>['columns'] = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Name',
        sortable: true,
        render: ({ name }) => <Text fw={500}>{name}</Text>,
      },
      {
        accessor: 'type',
        title: 'Type',
        render: ({ type }) => <EntityTypeBadge type={type as EntityType} />,
      },
      {
        accessor: 'phone',
        title: 'Phone',
        render: ({ phone }) => <Text>{phone || '-'}</Text>,
      },
      {
        accessor: 'email',
        title: 'Email',
        render: ({ email }) => <Text>{email || '-'}</Text>,
      },
      {
        accessor: 'address',
        title: 'Address',
        render: ({ address }) => (
          <Text style={{ maxWidth: 200 }} truncate="end">
            {address || '-'}
          </Text>
        ),
      },
      {
        accessor: 'created',
        title: 'Created',
        sortable: true,
        render: ({ created }) => {
          const date = new Date(created);
          return (
            <Text size="sm">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </Text>
          );
        },
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        render: (entity) => (
          <Group gap="xs" justify="flex-end">
            <Tooltip label="Edit entity">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => onEdit(entity)}
              >
                <IconEdit size={ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete entity">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(entity)}
              >
                <IconTrash size={ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      minHeight={200}
      verticalSpacing="xs"
      striped
      highlightOnHover
      withTableBorder
      columns={columns}
      records={entities}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      totalRecords={totalRecords}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={onPageChange || (() => {})}
      recordsPerPageOptions={[10, 20, 50, 100]}
      onRecordsPerPageChange={onPageSizeChange || (() => {})}
      sortStatus={
        sortStatus ?? { columnAccessor: 'created', direction: 'desc' }
      }
      onSortStatusChange={onSortStatusChange}
      fetching={isLoading}
    />
  );
};

export default EntitiesTable;

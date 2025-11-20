'use client';

import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  DataTable,
  type DataTableProps,
  type DataTableSortStatus,
} from 'mantine-datatable';
import { useMemo, useState } from 'react';

import type { TagResponse } from '@/types/tag';

const ICON_SIZE = 18;

type TagsTableProps = {
  tags: TagResponse[];
  onEdit: (tag: TagResponse) => void;
  onDelete: (tag: TagResponse) => void;
  isLoading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalRecords?: number;
  sortStatus?: DataTableSortStatus<TagResponse>;
  onSortStatusChange?: (status: DataTableSortStatus<TagResponse>) => void;
};

const TagsTable = ({
  tags,
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
}: TagsTableProps) => {
  const [selectedRecords, setSelectedRecords] = useState<TagResponse[]>([]);

  const columns: DataTableProps<TagResponse>['columns'] = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Name',
        sortable: true,
        render: ({ name }) => <Text fw={500}>{name}</Text>,
      },
      {
        accessor: 'description',
        title: 'Description',
        render: ({ description }) => (
          <Text
            style={{ maxWidth: 300 }}
            truncate="end"
            c={description ? undefined : 'dimmed'}
          >
            {description || '-'}
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
        render: (tag) => (
          <Group gap="xs" justify="flex-end">
            <Tooltip label="Edit tag">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => onEdit(tag)}
              >
                <IconEdit size={ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete tag">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(tag)}
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
      records={tags}
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

export default TagsTable;

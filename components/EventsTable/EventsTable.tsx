'use client';

import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  DataTable,
  type DataTableProps,
  type DataTableSortStatus,
} from 'mantine-datatable';
import { useMemo, useState } from 'react';

import type { EventResponse } from '@/types/event';

const ICON_SIZE = 18;

type EventsTableProps = {
  events: EventResponse[];
  onEdit: (event: EventResponse) => void;
  onDelete: (event: EventResponse) => void;
  isLoading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalRecords?: number;
  sortStatus?: DataTableSortStatus<EventResponse>;
  onSortStatusChange?: (status: DataTableSortStatus<EventResponse>) => void;
};

const EventsTable = ({
  events,
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
}: EventsTableProps) => {
  const [selectedRecords, setSelectedRecords] = useState<EventResponse[]>([]);

  const columns: DataTableProps<EventResponse>['columns'] = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Name',
        sortable: true,
        render: ({ name }) => <Text fw={500}>{name}</Text>,
      },
      {
        accessor: 'startAt',
        title: 'Start Date',
        sortable: true,
        render: ({ startAt }) => {
          const date = new Date(startAt);
          return (
            <Text size="sm">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </Text>
          );
        },
      },
      {
        accessor: 'endAt',
        title: 'End Date',
        sortable: true,
        render: ({ endAt }) => {
          if (!endAt) return <Text c="dimmed">-</Text>;
          const date = new Date(endAt);
          return (
            <Text size="sm">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </Text>
          );
        },
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
        render: (event) => (
          <Group gap="xs" justify="flex-end">
            <Tooltip label="Edit event">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => onEdit(event)}
              >
                <IconEdit size={ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete event">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(event)}
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
      records={events}
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

export default EventsTable;

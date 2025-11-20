'use client';

import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import type { DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';

import EventDialog from '@/components/EventDialog/EventDialog';
import EventsTable from '@/components/EventsTable/EventsTable';
import {
  createEvent,
  deleteManyEvents,
  updateEvent,
  useEvents,
} from '@/lib/endpoints/event';
import type { EventResponse, UpsertEventDto } from '@/types/event';

export default function EventsPage() {
  const [dialogOpened, { open: openDialog, close: closeDialog }] =
    useDisclosure(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null,
  );

  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [eventToDelete, setEventToDelete] = useState<EventResponse | null>(
    null,
  );

  const [search, setSearch] = useState('');
  const [startAtFrom, setStartAtFrom] = useState<Date | null>(null);
  const [startAtTo, setStartAtTo] = useState<Date | null>(null);
  const [endAtFrom, setEndAtFrom] = useState<Date | null>(null);
  const [endAtTo, setEndAtTo] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<EventResponse>
  >({
    columnAccessor: 'created',
    direction: 'desc',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = useMemo(() => {
    const params: {
      page?: number;
      limit?: number;
      search?: string;
      startAtFrom?: string;
      startAtTo?: string;
      endAtFrom?: string;
      endAtTo?: string;
      sortBy?: 'name' | 'startAt' | 'endAt' | 'created';
      sortOrder?: 'asc' | 'desc';
    } = {
      page,
      limit: pageSize,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (startAtFrom) {
      params.startAtFrom = startAtFrom.toISOString();
    }

    if (startAtTo) {
      params.startAtTo = startAtTo.toISOString();
    }

    if (endAtFrom) {
      params.endAtFrom = endAtFrom.toISOString();
    }

    if (endAtTo) {
      params.endAtTo = endAtTo.toISOString();
    }

    if (sortStatus.columnAccessor) {
      const sortByMap: Record<
        string,
        'name' | 'startAt' | 'endAt' | 'created'
      > = {
        name: 'name',
        startAt: 'startAt',
        endAt: 'endAt',
        created: 'created',
      };
      const mappedSortBy = sortByMap[sortStatus.columnAccessor];
      if (mappedSortBy) {
        params.sortBy = mappedSortBy;
        params.sortOrder = sortStatus.direction || 'desc';
      }
    }

    return params;
  }, [
    page,
    pageSize,
    search,
    startAtFrom,
    startAtTo,
    endAtFrom,
    endAtTo,
    sortStatus,
  ]);

  const {
    data: eventsData,
    loading: isLoading,
    refetch,
  } = useEvents(queryParams);

  const handleAdd = () => {
    setSelectedEvent(null);
    openDialog();
  };

  const handleEdit = (event: EventResponse) => {
    setSelectedEvent(event);
    openDialog();
  };

  const handleDelete = (event: EventResponse) => {
    setEventToDelete(event);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteManyEvents([eventToDelete.id]);
      await refetch();
      closeDelete();
      setEventToDelete(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: UpsertEventDto) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        await updateEvent(data);
      } else {
        await createEvent(data);
      }
      await refetch();
      closeDialog();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStartAtFrom(null);
    setStartAtTo(null);
    setEndAtFrom(null);
    setEndAtTo(null);
    setPage(1);
  };

  return (
    <Stack gap="md">
      <Group gap="md" align="flex-end">
        <TextInput
          placeholder="Search events..."
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          style={{ flex: 1 }}
        />
        <DateTimePicker
          placeholder="Start from"
          value={startAtFrom}
          onChange={(value) => setStartAtFrom(value as Date | null)}
          clearable
        />
        <DateTimePicker
          placeholder="Start to"
          value={startAtTo}
          onChange={(value) => setStartAtTo(value as Date | null)}
          clearable
        />
        <DateTimePicker
          placeholder="End from"
          value={endAtFrom}
          onChange={(value) => setEndAtFrom(value as Date | null)}
          clearable
        />
        <DateTimePicker
          placeholder="End to"
          value={endAtTo}
          onChange={(value) => setEndAtTo(value as Date | null)}
          clearable
        />
        <Button onClick={handleReset} variant="subtle">
          Reset
        </Button>
        <Button onClick={handleAdd}>Add Event</Button>
      </Group>

      <EventsTable
        events={
          (eventsData && 'events' in eventsData ? eventsData.events : []) || []
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalRecords={
          eventsData && 'pagination' in eventsData
            ? eventsData.pagination?.total
            : undefined
        }
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />

      <EventDialog
        opened={dialogOpened}
        onClose={closeDialog}
        event={selectedEvent}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {deleteOpened && eventToDelete && (
        <DeleteConfirmationModal
          opened={deleteOpened}
          onClose={closeDelete}
          onConfirm={handleConfirmDelete}
          eventName={eventToDelete.name}
          isLoading={isSubmitting}
        />
      )}
    </Stack>
  );
}

function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  eventName,
  isLoading,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
  isLoading: boolean;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Event" centered>
      <Text mb="md">
        Are you sure you want to delete the event &quot;{eventName}&quot;? This
        action cannot be undone.
      </Text>
      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} loading={isLoading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}

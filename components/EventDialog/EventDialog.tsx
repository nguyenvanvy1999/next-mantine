'use client';

import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import type { EventResponse, UpsertEventDto } from '@/types/event';

const eventSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  startAt: z.date({ message: 'Start date is required' }),
  endAt: z.date().optional().nullable(),
});

type EventFormValues = z.infer<typeof eventSchema>;

type EventDialogProps = {
  opened: boolean;
  onClose: () => void;
  event: EventResponse | null;
  onSubmit: (data: UpsertEventDto) => Promise<void>;
  isLoading?: boolean;
};

const EventDialog = ({
  opened,
  onClose,
  event,
  onSubmit,
  isLoading = false,
}: EventDialogProps) => {
  const isEditMode = !!event;

  const form = useForm<EventFormValues>({
    initialValues: {
      name: event?.name || '',
      startAt: event?.startAt ? new Date(event.startAt) : new Date(),
      endAt: event?.endAt ? new Date(event.endAt) : null,
    },
    validate: zod4Resolver(eventSchema),
  });

  const handleSubmit = async (values: EventFormValues) => {
    const submitData: UpsertEventDto = {
      name: values.name.trim(),
      startAt: values.startAt.toISOString(),
    };

    if (isEditMode && event) {
      submitData.id = event.id;
    }

    if (values.endAt) {
      submitData.endAt = values.endAt.toISOString();
    }

    await onSubmit(submitData);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditMode ? 'Edit Event' : 'Add Event'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter event name"
            required
            {...form.getInputProps('name')}
          />

          <DateTimePicker
            label="Start Date"
            placeholder="Select start date and time"
            required
            {...form.getInputProps('startAt')}
          />

          <DateTimePicker
            label="End Date"
            placeholder="Select end date and time (optional)"
            {...form.getInputProps('endAt')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EventDialog;

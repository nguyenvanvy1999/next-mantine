'use client';

import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import type {
  EntityResponse,
  EntityType,
  UpsertEntityDto,
} from '@/types/entity';

const entitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['individual', 'organization']),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
});

type EntityFormValues = z.infer<typeof entitySchema>;

type EntityDialogProps = {
  opened: boolean;
  onClose: () => void;
  entity: EntityResponse | null;
  onSubmit: (data: UpsertEntityDto) => Promise<void>;
  isLoading?: boolean;
};

const EntityDialog = ({
  opened,
  onClose,
  entity,
  onSubmit,
  isLoading = false,
}: EntityDialogProps) => {
  const isEditMode = !!entity;

  const form = useForm<EntityFormValues>({
    initialValues: {
      name: entity?.name || '',
      type: (entity?.type as EntityType) || ('individual' as const),
      phone: entity?.phone || '',
      email: entity?.email || '',
      address: entity?.address || '',
      note: entity?.note || '',
    },
    validate: zod4Resolver(entitySchema),
  });

  const handleSubmit = async (values: EntityFormValues) => {
    const submitData: UpsertEntityDto = {
      name: values.name.trim(),
      type: values.type as EntityType,
    };

    if (isEditMode && entity) {
      submitData.id = entity.id;
    }

    if (values.phone?.trim()) {
      submitData.phone = values.phone.trim();
    }

    if (values.email?.trim()) {
      submitData.email = values.email.trim();
    }

    if (values.address?.trim()) {
      submitData.address = values.address.trim();
    }

    if (values.note?.trim()) {
      submitData.note = values.note.trim();
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
      title={isEditMode ? 'Edit Entity' : 'Add Entity'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter entity name"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="Type"
            placeholder="Select entity type"
            required
            data={[
              { value: 'individual', label: 'Individual' },
              { value: 'organization', label: 'Organization' },
            ]}
            {...form.getInputProps('type')}
          />

          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            {...form.getInputProps('phone')}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Address"
            placeholder="Enter address"
            {...form.getInputProps('address')}
          />

          <Textarea
            label="Note"
            placeholder="Enter notes"
            rows={3}
            {...form.getInputProps('note')}
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

export default EntityDialog;

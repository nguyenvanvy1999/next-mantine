'use client';

import {
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import type { TagResponse, UpsertTagDto } from '@/types/tag';

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type TagFormValues = z.infer<typeof tagSchema>;

type TagDialogProps = {
  opened: boolean;
  onClose: () => void;
  tag: TagResponse | null;
  onSubmit: (data: UpsertTagDto) => Promise<void>;
  isLoading?: boolean;
};

const TagDialog = ({
  opened,
  onClose,
  tag,
  onSubmit,
  isLoading = false,
}: TagDialogProps) => {
  const isEditMode = !!tag;

  const form = useForm<TagFormValues>({
    initialValues: {
      name: tag?.name || '',
      description: tag?.description || '',
    },
    validate: zod4Resolver(tagSchema),
  });

  const handleSubmit = async (values: TagFormValues) => {
    const submitData: UpsertTagDto = {
      name: values.name.trim(),
    };

    if (isEditMode && tag) {
      submitData.id = tag.id;
    }

    if (values.description?.trim()) {
      submitData.description = values.description.trim();
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
      title={isEditMode ? 'Edit Tag' : 'Add Tag'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter tag name"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="Enter tag description"
            rows={3}
            {...form.getInputProps('description')}
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

export default TagDialog;

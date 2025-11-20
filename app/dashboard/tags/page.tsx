'use client';

import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';

import TagDialog from '@/components/TagDialog/TagDialog';
import TagsTable from '@/components/TagsTable/TagsTable';
import {
  createTag,
  deleteManyTags,
  updateTag,
  useTags,
} from '@/lib/endpoints/tag';
import type { TagResponse, UpsertTagDto } from '@/types/tag';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

const showErrorNotification = (title: string, message: string) =>
  notifications.show({
    title,
    message,
    color: 'red',
    withCloseButton: true,
  });

export default function TagsPage() {
  const [dialogOpened, { open: openDialog, close: closeDialog }] =
    useDisclosure(false);
  const [selectedTag, setSelectedTag] = useState<TagResponse | null>(null);

  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [tagToDelete, setTagToDelete] = useState<TagResponse | null>(null);

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<TagResponse>
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
      sortBy?: 'name' | 'created';
      sortOrder?: 'asc' | 'desc';
    } = {
      page,
      limit: pageSize,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (sortStatus.columnAccessor) {
      const sortByMap: Record<string, 'name' | 'created'> = {
        name: 'name',
        created: 'created',
      };
      const mappedSortBy = sortByMap[sortStatus.columnAccessor];
      if (mappedSortBy) {
        params.sortBy = mappedSortBy;
        params.sortOrder = sortStatus.direction || 'desc';
      }
    }

    return params;
  }, [page, pageSize, search, sortStatus]);

  const { data: tagsData, loading: isLoading, refetch } = useTags(queryParams);

  const handleAdd = () => {
    setSelectedTag(null);
    openDialog();
  };

  const handleEdit = (tag: TagResponse) => {
    setSelectedTag(tag);
    openDialog();
  };

  const handleDelete = (tag: TagResponse) => {
    setTagToDelete(tag);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteManyTags([tagToDelete.id]);
      await refetch();
      closeDelete();
      setTagToDelete(null);
    } catch (error) {
      console.error('Failed to delete tag:', error);
      const message = getErrorMessage(
        error,
        'Không thể xóa tag. Vui lòng thử lại.',
      );
      showErrorNotification('Xóa tag thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: UpsertTagDto) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        await updateTag(data);
      } else {
        await createTag(data);
      }
      await refetch();
      closeDialog();
      setSelectedTag(null);
    } catch (error) {
      console.error('Failed to save tag:', error);
      const message = getErrorMessage(
        error,
        'Không thể lưu tag. Vui lòng thử lại.',
      );
      showErrorNotification('Lưu tag thất bại', message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <Stack gap="md">
      <Group gap="md" align="flex-end">
        <TextInput
          placeholder="Search tags..."
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          style={{ flex: 1 }}
        />
        <Button onClick={handleReset} variant="subtle">
          Reset
        </Button>
        <Button onClick={handleAdd}>Add Tag</Button>
      </Group>

      <TagsTable
        tags={tagsData?.data ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalRecords={tagsData?.pagination?.total}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />

      <TagDialog
        opened={dialogOpened}
        onClose={closeDialog}
        tag={selectedTag}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {deleteOpened && tagToDelete && (
        <DeleteConfirmationModal
          opened={deleteOpened}
          onClose={closeDelete}
          onConfirm={handleConfirmDelete}
          tagName={tagToDelete.name}
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
  tagName,
  isLoading,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tagName: string;
  isLoading: boolean;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Tag" centered>
      <Text mb="md">
        Are you sure you want to delete the tag &quot;{tagName}&quot;? This
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

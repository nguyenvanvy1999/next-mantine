'use client';

import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import EntitiesTable from '@/components/EntitiesTable/EntitiesTable';
import EntityDialog from '@/components/EntityDialog/EntityDialog';
import {
  createEntity,
  deleteManyEntities,
  updateEntity,
  useEntities,
} from '@/lib/endpoints/entity';
import type {
  EntityResponse,
  EntityType,
  UpsertEntityDto,
} from '@/types/entity';

export default function EntitiesPage() {
  const [dialogOpened, { open: openDialog, close: closeDialog }] =
    useDisclosure(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityResponse | null>(
    null,
  );

  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [entityToDelete, setEntityToDelete] = useState<EntityResponse | null>(
    null,
  );

  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<EntityResponse>
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
      type?: EntityType[];
      sortBy?: 'name' | 'type' | 'created';
      sortOrder?: 'asc' | 'desc';
    } = {
      page,
      limit: pageSize,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (selectedTypes.length > 0) {
      params.type = selectedTypes as EntityType[];
    }

    if (sortStatus.columnAccessor) {
      const sortByMap: Record<string, 'name' | 'type' | 'created'> = {
        name: 'name',
        type: 'type',
        created: 'created',
      };
      const mappedSortBy = sortByMap[sortStatus.columnAccessor];
      if (mappedSortBy) {
        params.sortBy = mappedSortBy;
        params.sortOrder = sortStatus.direction || 'desc';
      }
    }

    return params;
  }, [page, pageSize, search, selectedTypes, sortStatus]);

  const {
    data: entitiesData,
    loading: isLoading,
    refetch,
  } = useEntities(queryParams);

  const handleAdd = () => {
    setSelectedEntity(null);
    openDialog();
  };

  const handleEdit = (entity: EntityResponse) => {
    setSelectedEntity(entity);
    openDialog();
  };

  const handleDelete = (entity: EntityResponse) => {
    setEntityToDelete(entity);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!entityToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteManyEntities([entityToDelete.id]);
      await refetch();
      closeDelete();
      setEntityToDelete(null);
    } catch (error) {
      console.error('Failed to delete entity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: UpsertEntityDto) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        await updateEntity(data);
      } else {
        await createEntity(data);
      }
      await refetch();
      closeDialog();
      setSelectedEntity(null);
    } catch (error) {
      console.error('Failed to save entity:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setSelectedTypes([]);
    setPage(1);
  };

  return (
    <Stack gap="md">
      <Group gap="md" align="flex-end">
        <TextInput
          placeholder="Search entities..."
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          style={{ flex: 1 }}
        />
        <MultiSelect
          placeholder="Filter by type"
          data={[
            { value: 'individual', label: 'Individual' },
            { value: 'organization', label: 'Organization' },
          ]}
          value={selectedTypes}
          onChange={(value) => {
            setSelectedTypes(value);
            setPage(1);
          }}
          clearable
        />
        <Button onClick={handleReset} variant="subtle">
          Reset
        </Button>
        <Button onClick={handleAdd}>Add Entity</Button>
      </Group>

      <EntitiesTable
        entities={
          (entitiesData && 'entities' in entitiesData
            ? entitiesData.entities
            : []) || []
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalRecords={
          entitiesData && 'pagination' in entitiesData
            ? entitiesData.pagination?.total
            : undefined
        }
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />

      <EntityDialog
        opened={dialogOpened}
        onClose={closeDialog}
        entity={selectedEntity}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {deleteOpened && entityToDelete && (
        <DeleteConfirmationModal
          opened={deleteOpened}
          onClose={closeDelete}
          onConfirm={handleConfirmDelete}
          entityName={entityToDelete.name}
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
  entityName,
  isLoading,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  isLoading: boolean;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Entity" centered>
      <Text mb="md">
        Are you sure you want to delete the entity &quot;{entityName}&quot;?
        This action cannot be undone.
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

'use client';

import {
  Button,
  Group,
  Modal,
  MultiSelect,
  NumberFormatter,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';

import AccountDialog from '@/components/AccountDialog/AccountDialog';
import AccountsTable from '@/components/AccountsTable/AccountsTable';
import { StatsCard } from '@/components/StatsCard';
import {
  createAccount,
  deleteManyAccounts,
  updateAccount,
  useAccounts,
} from '@/lib/endpoints/account';
import { useCurrencies } from '@/lib/endpoints/currency';
import type {
  AccountResponse,
  AccountSummary,
  AccountType,
  UpsertAccountDto,
} from '@/types/account';

export default function AccountsPage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Dialog state
  const [dialogOpened, { open: openDialog, close: closeDialog }] =
    useDisclosure(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountResponse | null>(null);

  // Delete confirmation state
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [accountToDelete, setAccountToDelete] =
    useState<AccountResponse | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCurrencyIds, setSelectedCurrencyIds] = useState<string[]>([]);

  // Pagination and sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'created',
    direction: 'desc',
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch currencies
  const { data: currencies = [] } = useCurrencies();

  // Build query params
  const queryParams = useMemo(() => {
    const params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string[];
      currencyId?: string[];
      sortBy?: 'name' | 'created' | 'balance';
      sortOrder?: 'asc' | 'desc';
    } = {
      page,
      limit: pageSize,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (selectedTypes.length > 0) {
      params.type = selectedTypes as AccountType[];
    }

    if (selectedCurrencyIds.length > 0) {
      params.currencyId = selectedCurrencyIds;
    }

    if (sortStatus.columnAccessor) {
      const sortByMap: Record<string, 'name' | 'created' | 'balance'> = {
        name: 'name',
        created: 'created',
        balance: 'balance',
      };
      const mappedSortBy = sortByMap[sortStatus.columnAccessor];
      if (mappedSortBy) {
        params.sortBy = mappedSortBy;
        params.sortOrder = sortStatus.direction || 'desc';
      }
    }

    return params;
  }, [page, pageSize, search, selectedTypes, selectedCurrencyIds, sortStatus]);

  // Fetch accounts
  const { data: accountsData, isLoading, refetch } = useAccounts(queryParams);

  // Statistics
  const stats = useMemo(() => {
    if (!accountsData?.summary || accountsData.summary.length === 0) return [];
    return accountsData.summary.map((item: AccountSummary) => {
      const isNegative = item.totalBalance < 0;
      const color = isNegative
        ? isDark
          ? 'rgb(248 113 113)'
          : 'rgb(185 28 28)'
        : isDark
          ? 'rgb(34 197 94)'
          : 'rgb(21 128 61)';
      return {
        title: 'Total Assets',
        value: (
          <NumberFormatter
            value={item.totalBalance}
            prefix={item.currency.symbol ? `${item.currency.symbol} ` : ''}
            thousandSeparator=","
            decimalScale={2}
            allowNegative
          />
        ),
        color,
      };
    });
  }, [accountsData?.summary, isDark]);

  // Handlers
  const handleAdd = () => {
    setSelectedAccount(null);
    openDialog();
  };

  const handleEdit = (account: AccountResponse) => {
    setSelectedAccount(account);
    openDialog();
  };

  const handleDelete = (account: AccountResponse) => {
    setAccountToDelete(account);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteManyAccounts([accountToDelete.id]);
      await refetch();
      closeDelete();
      setAccountToDelete(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: UpsertAccountDto) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        await updateAccount(data);
      } else {
        await createAccount(data);
      }
      await refetch();
      closeDialog();
      setSelectedAccount(null);
    } catch (error) {
      console.error('Failed to save account:', error);
      throw error; // Re-throw to let dialog handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setSelectedTypes([]);
    setSelectedCurrencyIds([]);
    setPage(1);
  };

  return (
    <Stack gap="md">
      {/* Statistics Cards */}
      {stats.length > 0 && (
        <Group grow>
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              diff={0}
              period=""
            />
          ))}
        </Group>
      )}

      {/* Filters */}
      <Group gap="md" align="flex-end">
        <TextInput
          placeholder="Search accounts..."
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
            { value: 'cash', label: 'Cash' },
            { value: 'bank', label: 'Bank' },
            { value: 'credit_card', label: 'Credit Card' },
            { value: 'investment', label: 'Investment' },
          ]}
          value={selectedTypes}
          onChange={(value) => {
            setSelectedTypes(value);
            setPage(1);
          }}
          clearable
        />
        <MultiSelect
          placeholder="Filter by currency"
          data={currencies.map((currency) => ({
            value: currency.id,
            label: `${currency.code} - ${currency.name}`,
          }))}
          value={selectedCurrencyIds}
          onChange={(value) => {
            setSelectedCurrencyIds(value);
            setPage(1);
          }}
          clearable
          searchable
        />
        <Button onClick={handleReset} variant="subtle">
          Reset
        </Button>
        <Button onClick={handleAdd}>Add Account</Button>
      </Group>

      {/* Table */}
      <AccountsTable
        accounts={accountsData?.accounts || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalRecords={accountsData?.pagination?.total}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />

      {/* Dialogs */}
      <AccountDialog
        opened={dialogOpened}
        onClose={closeDialog}
        account={selectedAccount}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        currencies={currencies}
      />

      {/* Delete Confirmation Modal */}
      {deleteOpened && accountToDelete && (
        <DeleteConfirmationModal
          opened={deleteOpened}
          onClose={closeDelete}
          onConfirm={handleConfirmDelete}
          accountName={accountToDelete.name}
          isLoading={isSubmitting}
        />
      )}
    </Stack>
  );
}

// Simple delete confirmation modal
function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  accountName,
  isLoading,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountName: string;
  isLoading: boolean;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Account" centered>
      <Text mb="md">
        Are you sure you want to delete the account &quot;{accountName}&quot;?
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

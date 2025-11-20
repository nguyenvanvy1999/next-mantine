'use client';

import {
  ActionIcon,
  Badge,
  Group,
  NumberFormatter,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  DataTable,
  type DataTableProps,
  type DataTableSortStatus,
} from 'mantine-datatable';
import { useMemo, useState } from 'react';

import type { AccountResponse, AccountType } from '@/types/account';

const ICON_SIZE = 18;

type AccountsTableProps = {
  accounts: AccountResponse[];
  onEdit: (account: AccountResponse) => void;
  onDelete: (account: AccountResponse) => void;
  isLoading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalRecords?: number;
  sortStatus?: DataTableSortStatus<AccountResponse>;
  onSortStatusChange?: (status: DataTableSortStatus<AccountResponse>) => void;
};

const AccountTypeBadge = ({ type }: { type: AccountType }) => {
  const typeConfig: Record<AccountType, { label: string; color: string }> = {
    cash: { label: 'Cash', color: 'blue' },
    bank: { label: 'Bank', color: 'green' },
    credit_card: { label: 'Credit Card', color: 'orange' },
    investment: { label: 'Investment', color: 'purple' },
  };

  const config = typeConfig[type] || { label: type, color: 'gray' };

  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
};

const AccountsTable = ({
  accounts,
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
}: AccountsTableProps) => {
  const [selectedRecords, setSelectedRecords] = useState<AccountResponse[]>([]);

  const columns: DataTableProps<AccountResponse>['columns'] = useMemo(
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
        render: ({ type }) => <AccountTypeBadge type={type} />,
      },
      {
        accessor: 'currency.code',
        title: 'Currency',
        render: ({ currency }) => <Text>{currency.code}</Text>,
      },
      {
        accessor: 'balance',
        title: 'Balance',
        sortable: true,
        render: ({ balance, currency }) => {
          const numBalance = parseFloat(String(balance));
          const isNegative = numBalance < 0;
          return (
            <NumberFormatter
              value={numBalance}
              prefix={currency.symbol ? `${currency.symbol} ` : ''}
              thousandSeparator=","
              decimalScale={2}
              allowNegative
              style={{
                color: isNegative
                  ? 'var(--mantine-color-red-6)'
                  : 'var(--mantine-color-green-6)',
              }}
            />
          );
        },
      },
      {
        accessor: 'creditLimit',
        title: 'Credit Limit',
        render: ({ creditLimit, currency }) => {
          if (!creditLimit) return <Text c="dimmed">-</Text>;
          return (
            <NumberFormatter
              value={parseFloat(String(creditLimit))}
              prefix={currency.symbol ? `${currency.symbol} ` : ''}
              thousandSeparator=","
              decimalScale={2}
            />
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
        render: (account) => (
          <Group gap="xs" justify="flex-end">
            <Tooltip label="Edit account">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => onEdit(account)}
              >
                <IconEdit size={ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete account">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(account)}
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
      records={accounts}
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

export default AccountsTable;

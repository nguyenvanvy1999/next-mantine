'use client';

import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

import type {
  AccountResponse,
  AccountType,
  UpsertAccountDto,
} from '@/types/account';

// Zod schema matching investment UpsertAccountDto
const accountSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['cash', 'bank', 'credit_card', 'investment']),
  name: z.string().min(1, 'Name is required'),
  currencyId: z.string().min(1, 'Currency is required'),
  initialBalance: z.number().optional(),
  creditLimit: z.number().min(0).optional(),
  notifyOnDueDate: z.boolean().optional(),
  paymentDay: z.number().int().min(1).max(31).optional(),
  notifyDaysBefore: z.number().int().min(0).optional(),
  meta: z.unknown().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

type AccountDialogProps = {
  opened: boolean;
  onClose: () => void;
  account: AccountResponse | null;
  onSubmit: (data: UpsertAccountDto) => Promise<void>;
  isLoading?: boolean;
  currencies?: Array<{
    id: string;
    code: string;
    name: string;
    symbol?: string | null;
  }>;
};

const AccountDialog = ({
  opened,
  onClose,
  account,
  onSubmit,
  isLoading = false,
  currencies = [],
}: AccountDialogProps) => {
  const isEditMode = !!account;

  const form = useForm<AccountFormValues>({
    initialValues: {
      name: account?.name || '',
      type: account?.type || 'cash',
      currencyId: account?.currencyId || '',
      initialBalance: 0,
      creditLimit: account?.creditLimit
        ? parseFloat(String(account.creditLimit))
        : 0,
      notifyOnDueDate: account?.notifyOnDueDate ?? false,
      paymentDay: account?.paymentDay ?? undefined,
      notifyDaysBefore: account?.notifyDaysBefore ?? undefined,
    },
    validate: zodResolver(accountSchema),
  });

  const accountType = form.values.type;
  const isCreditCard = accountType === 'credit_card';

  const handleSubmit = async (values: AccountFormValues) => {
    const submitData: UpsertAccountDto = {
      name: values.name.trim(),
      type: values.type as AccountType,
      currencyId: values.currencyId,
    };

    if (isEditMode && account) {
      submitData.id = account.id;
    } else {
      if (
        values.initialBalance !== undefined &&
        values.initialBalance !== null
      ) {
        submitData.initialBalance = values.initialBalance;
      }
    }

    if (isCreditCard) {
      if (values.creditLimit !== undefined && values.creditLimit !== null) {
        submitData.creditLimit = values.creditLimit;
      }
      if (values.notifyOnDueDate !== undefined) {
        submitData.notifyOnDueDate = values.notifyOnDueDate;
      }
      if (values.paymentDay !== undefined && values.paymentDay !== null) {
        submitData.paymentDay = values.paymentDay;
      }
      if (
        values.notifyDaysBefore !== undefined &&
        values.notifyDaysBefore !== null
      ) {
        submitData.notifyDaysBefore = values.notifyDaysBefore;
      }
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
      title={isEditMode ? 'Edit Account' : 'Add Account'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter account name"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="Type"
            placeholder="Select account type"
            required
            data={[
              { value: 'cash', label: 'Cash' },
              { value: 'bank', label: 'Bank' },
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'investment', label: 'Investment' },
            ]}
            {...form.getInputProps('type')}
          />

          <Select
            label="Currency"
            placeholder="Select currency"
            required
            data={currencies.map((currency) => ({
              value: currency.id,
              label: `${currency.code} - ${currency.name}`,
            }))}
            searchable
            {...form.getInputProps('currencyId')}
          />

          {!isEditMode && (
            <NumberInput
              label="Initial Balance"
              placeholder="Enter initial balance"
              thousandSeparator=","
              decimalScale={2}
              min={0}
              {...form.getInputProps('initialBalance')}
            />
          )}

          {isCreditCard && (
            <>
              <NumberInput
                label="Credit Limit"
                placeholder="Enter credit limit"
                thousandSeparator=","
                decimalScale={2}
                min={0}
                {...form.getInputProps('creditLimit')}
              />

              <Checkbox
                label="Notify on Due Date"
                {...form.getInputProps('notifyOnDueDate', { type: 'checkbox' })}
              />

              <NumberInput
                label="Payment Day"
                placeholder="Day of month (1-31)"
                min={1}
                max={31}
                {...form.getInputProps('paymentDay')}
              />

              <NumberInput
                label="Notify Days Before"
                placeholder="Days before due date to notify"
                min={0}
                {...form.getInputProps('notifyDaysBefore')}
              />
            </>
          )}

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

export default AccountDialog;

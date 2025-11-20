import type { Prisma } from '@/lib/generated/prisma/client';
import {
  dateToIsoString,
  decimalToNullableString,
  decimalToString,
} from '@/lib/utils/formatters';
import type { AccountResponse } from '@/types/account';
import type { ACCOUNT_SELECT_FULL } from '../selects';

type AccountRecord = Prisma.AccountGetPayload<{
  select: typeof ACCOUNT_SELECT_FULL;
}>;

export const mapAccount = (account: AccountRecord): AccountResponse => ({
  ...account,
  type: account.type as AccountResponse['type'],
  balance: decimalToString(account.balance),
  creditLimit: decimalToNullableString(account.creditLimit),
  notifyOnDueDate: account.notifyOnDueDate ?? null,
  paymentDay: account.paymentDay ?? null,
  notifyDaysBefore: account.notifyDaysBefore ?? null,
  meta: account.meta ?? null,
  created: dateToIsoString(account.created),
  modified: dateToIsoString(account.modified),
});

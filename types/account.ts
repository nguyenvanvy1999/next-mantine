import type { AccountType } from '@/lib/generated/prisma/enums';
import type { AccountModel } from '@/lib/generated/prisma/models/Account';
import type { CurrencyModel } from '@/lib/generated/prisma/models/Currency';
import type {
  ActionRes,
  DateToString,
  DecimalToString,
  DeleteManyDto,
  PaginationMeta,
} from './common';

export { AccountType } from '@/lib/generated/prisma/enums';

export type CurrencyDto = Pick<
  CurrencyModel,
  'id' | 'code' | 'name' | 'symbol'
>;

export type AccountResponse = DateToString<
  DecimalToString<
    Pick<
      AccountModel,
      | 'id'
      | 'type'
      | 'name'
      | 'currencyId'
      | 'balance'
      | 'creditLimit'
      | 'notifyOnDueDate'
      | 'paymentDay'
      | 'notifyDaysBefore'
      | 'meta'
      | 'created'
      | 'modified'
    >
  >
> & {
  currency: CurrencyDto;
};

export interface AccountSummary {
  currency: CurrencyDto;
  totalBalance: number;
}

export interface AccountListResponse {
  accounts: AccountResponse[];
  pagination: PaginationMeta;
  summary: AccountSummary[];
}

export interface UpsertAccountDto {
  id?: string;
  type: AccountType;
  name: string;
  currencyId: string;
  initialBalance?: number;
  creditLimit?: number;
  notifyOnDueDate?: boolean;
  paymentDay?: number;
  notifyDaysBefore?: number;
  meta?: unknown;
}

export type { PaginationMeta, ActionRes, DeleteManyDto };

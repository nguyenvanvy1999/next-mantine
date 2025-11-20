import type { AccountType } from '@/lib/generated/prisma/enums';
import type { CurrencyModel } from '@/lib/generated/prisma/models/Currency';
import type { FinancialAccountModel } from '@/lib/generated/prisma/models/FinancialAccount';
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
      FinancialAccountModel,
      | 'id'
      | 'type'
      | 'name'
      | 'currencyId'
      | 'balance'
      | 'creditLimit'
      | 'created'
      | 'modified'
    >
  >
> & {
  currency: CurrencyDto;
  notifyOnDueDate: boolean | null;
  paymentDay: number | null;
  notifyDaysBefore: number | null;
  meta: unknown;
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

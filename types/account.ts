// Account types matching investment DTOs

export enum AccountType {
  cash = 'cash',
  bank = 'bank',
  credit_card = 'credit_card',
  investment = 'investment',
}

export interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol?: string | null;
}

export interface AccountResponse {
  id: string;
  type: AccountType;
  name: string;
  currencyId: string;
  balance: string; // Decimal as string
  creditLimit: string | null; // Decimal as string
  notifyOnDueDate: boolean | null;
  paymentDay: number | null;
  notifyDaysBefore: number | null;
  meta: unknown | null;
  created: string; // ISO date string
  modified: string; // ISO date string
  currency: CurrencyDto;
}

export interface AccountSummary {
  currency: CurrencyDto;
  totalBalance: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export interface ActionRes {
  success: boolean;
  message: string;
}

export interface DeleteManyDto {
  ids: string[];
}

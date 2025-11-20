export const CURRENCY_SELECT_BASIC = {
  id: true,
  code: true,
  name: true,
  symbol: true,
} as const;

export const ACCOUNT_SELECT_FULL = {
  id: true,
  type: true,
  name: true,
  currencyId: true,
  balance: true,
  creditLimit: true,
  notifyOnDueDate: true,
  paymentDay: true,
  notifyDaysBefore: true,
  meta: true,
  created: true,
  modified: true,
  currency: {
    select: CURRENCY_SELECT_BASIC,
  },
} as const;

export const ACCOUNT_SELECT_MINIMAL = {
  id: true,
} as const;

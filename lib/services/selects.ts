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

export const ENTITY_SELECT_FULL = {
  id: true,
  name: true,
  type: true,
  phone: true,
  email: true,
  address: true,
  note: true,
  created: true,
  modified: true,
} as const;

export const ENTITY_SELECT_MINIMAL = {
  id: true,
} as const;

export const TAG_SELECT_FULL = {
  id: true,
  name: true,
  description: true,
  created: true,
  modified: true,
} as const;

export const TAG_SELECT_MINIMAL = {
  id: true,
} as const;

export const EVENT_SELECT_FULL = {
  id: true,
  name: true,
  startAt: true,
  endAt: true,
  created: true,
  modified: true,
} as const;

export const EVENT_SELECT_MINIMAL = {
  id: true,
} as const;

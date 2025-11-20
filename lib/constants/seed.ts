import { env } from '@/lib/env';

// Seed constants
export const CURRENCY_IDS = {
  VND: 'currency_vnd',
  USD: 'currency_usd',
} as const;

export const DEFAULT_CURRENCIES = [
  {
    id: CURRENCY_IDS.VND,
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    isActive: true,
  },
  {
    id: CURRENCY_IDS.USD,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    isActive: true,
  },
] as const;

export const SUPER_ADMIN_CONFIG = {
  email: env.SUPER_ADMIN_EMAIL || 'admin@example.com',
  password: env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
  name: env.SUPER_ADMIN_NAME || 'Super Admin',
  baseCurrencyId: CURRENCY_IDS.VND,
} as const;

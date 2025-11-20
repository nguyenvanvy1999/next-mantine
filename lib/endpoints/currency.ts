import { useFetch } from '@mantine/hooks';
import type { CurrencyDto } from '@/types/account';
import { useApiGet } from './api-utils';

interface CurrencyListResponse {
  data: CurrencyDto[];
}

const ENDPOINTS = {
  list: '/api/currencies',
} as const;

// Public version - doesn't require authentication (for registration)
export function useCurrenciesPublic(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const url =
    typeof window !== 'undefined'
      ? new URL(ENDPOINTS.list, window.location.origin)
      : new URL(ENDPOINTS.list, 'http://localhost:3000');

  const result = useFetch<CurrencyListResponse>(enabled ? url.toString() : '', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    ...result,
    data: Array.isArray(result.data?.data) ? result.data?.data : undefined,
  };
}

// Authenticated version - requires authentication
export function useCurrencies(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const result = useApiGet<CurrencyListResponse>(ENDPOINTS.list, {
    enabled,
  });

  return {
    ...result,
    data: Array.isArray(result.data?.data) ? result.data?.data : undefined,
  };
}

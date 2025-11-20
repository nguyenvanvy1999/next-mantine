import { useFetch } from '@mantine/hooks';
import type { CurrencyDto } from '@/types/account';
import { useApiGet } from './api-utils';

// Next.js API response wrapper
interface NextApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CurrencyListResponse {
  currencies: CurrencyDto[];
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

  const result = useFetch<NextApiResponse<CurrencyListResponse>>(
    enabled ? url.toString() : '',
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    const response = result.data as NextApiResponse<CurrencyListResponse>;
    if (response.data?.currencies) {
      return {
        ...result,
        data: response.data.currencies,
      };
    }
  }

  return {
    ...result,
    data: undefined,
  };
}

// Authenticated version - requires authentication
export function useCurrencies(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const result = useApiGet<NextApiResponse<CurrencyListResponse>>(
    ENDPOINTS.list,
    {
      enabled,
    },
  );

  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    const response =
      result.data as unknown as NextApiResponse<CurrencyListResponse>;
    if (response.data?.currencies) {
      return {
        ...result,
        data: response.data.currencies,
      };
    }
  }

  return {
    ...result,
    data: undefined,
  };
}

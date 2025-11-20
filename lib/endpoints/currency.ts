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

// Endpoints - Next.js API routes
const ENDPOINTS = {
  list: '/api/currencies',
} as const;

// Hook to get all currencies
export function useCurrencies(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  // useApiGet expects ApiResponse<T> format from server
  // But Next.js API returns { success, message, data }
  // So we need to unwrap it
  const result = useApiGet<NextApiResponse<CurrencyListResponse>>(
    ENDPOINTS.list,
    {
      enabled,
    },
  );

  // useApiGet returns ApiResponse<NextApiResponse<CurrencyListResponse>>
  // result.data is NextApiResponse<CurrencyListResponse> (the T in ApiResponse<T>)
  // result.data.data is CurrencyListResponse which has currencies property
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

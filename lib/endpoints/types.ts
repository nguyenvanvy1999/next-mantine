import type { ApiResponse } from './api-utils';

export interface NextApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export function adaptNextResponse<T>(
  response: NextApiResponse<T>,
): ApiResponse<T> {
  return {
    succeeded: response.success,
    data: response.data,
    errors: response.success ? response.errors || [] : [response.message],
    message: response.message,
  };
}

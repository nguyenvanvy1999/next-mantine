import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './error.util';

type ErrorResponseBody = {
  success: false;
  message: string;
  data: null;
  errors?: string[];
};

type SuccessResponseBody<T> = {
  success: true;
  message: string;
  data: T;
};

type StatusOverrides = Partial<{
  validation: number;
  app: number;
  unauthorized: number;
  default: number;
}>;

export type ApiErrorOptions = {
  fallbackMessage?: string;
  validationMessage?: string;
  logMessage?: string;
  logError?: boolean;
  statusOverrides?: StatusOverrides;
};

const DEFAULT_MESSAGES = {
  fallback: 'Internal server error',
  validation: 'Validation error',
  unauthorized: 'Unauthorized',
};

const DEFAULT_STATUS: Required<StatusOverrides> = {
  validation: 400,
  app: 400,
  unauthorized: 401,
  default: 500,
};

function getStatus(
  overrides: StatusOverrides | undefined,
  key: keyof StatusOverrides,
) {
  return overrides?.[key] ?? DEFAULT_STATUS[key];
}

export function handleApiError(
  error: unknown,
  options?: ApiErrorOptions,
): NextResponse<ErrorResponseBody> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: options?.validationMessage ?? DEFAULT_MESSAGES.validation,
        data: null,
        errors: error.issues.map((issue) => issue.message),
      },
      { status: getStatus(options?.statusOverrides, 'validation') },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        data: null,
      },
      { status: getStatus(options?.statusOverrides, 'app') },
    );
  }

  if (
    error instanceof Error &&
    error.message === DEFAULT_MESSAGES.unauthorized
  ) {
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_MESSAGES.unauthorized,
        data: null,
      },
      { status: getStatus(options?.statusOverrides, 'unauthorized') },
    );
  }

  if (options?.logError !== false) {
    console.error(options?.logMessage ?? 'Unhandled API error', error);
  }

  return NextResponse.json(
    {
      success: false,
      message: options?.fallbackMessage ?? DEFAULT_MESSAGES.fallback,
      data: null,
    },
    { status: getStatus(options?.statusOverrides, 'default') },
  );
}

export function successResponse<T>(
  data: T,
  options?: { message?: string; status?: number },
): NextResponse<SuccessResponseBody<T>> {
  return NextResponse.json(
    {
      success: true,
      message: options?.message ?? 'Success',
      data,
    },
    { status: options?.status ?? 200 },
  );
}

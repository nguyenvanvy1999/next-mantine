import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { accountService } from '@/lib/services/account.service';
import { requireAuth } from '@/lib/utils/auth.util';
import { AppError } from '@/lib/utils/error.util';
import type { AccountType, UpsertAccountDto } from '@/types/account';

// Validation schemas
const UpsertAccountSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['cash', 'bank', 'credit_card', 'investment']),
  name: z.string().min(1),
  currencyId: z.string().min(1),
  initialBalance: z.number().optional(),
  creditLimit: z.number().min(0).optional(),
  notifyOnDueDate: z.boolean().optional(),
  paymentDay: z.number().int().min(1).max(31).optional(),
  notifyDaysBefore: z.number().int().min(0).optional(),
  meta: z.unknown().optional(),
});

const ListAccountsQuerySchema = z.object({
  type: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  currencyId: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  sortBy: z.enum(['name', 'created', 'balance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/accounts - List accounts
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const query = ListAccountsQuerySchema.parse({
      type: searchParams.get('type'),
      currencyId: searchParams.get('currencyId'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    const result = await accountService.listAccounts(user.id, query);

    return NextResponse.json({
      success: true,
      message: 'Accounts retrieved successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: null,
        },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 },
      );
    }
    console.error('Error listing accounts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 },
    );
  }
}

// POST /api/accounts - Create or update account
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = UpsertAccountSchema.parse(body);
    const data: UpsertAccountDto = {
      ...parsed,
      type: parsed.type as AccountType,
    };
    const result = await accountService.upsertAccount(user.id, data);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          data: null,
          errors: error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: null,
        },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 },
      );
    }
    console.error('Error upserting account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 },
    );
  }
}

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { entityService } from '@/lib/services/entity.service';
import {
  commaSeparatedParam,
  createSortByParam,
  paginationParams,
  parseQueryParams,
  sortOrderParam,
} from '@/lib/utils';
import { requireAuth } from '@/lib/utils/auth.util';
import { AppError } from '@/lib/utils/error.util';
import type { EntityType, UpsertEntityDto } from '@/types/entity';

const UpsertEntitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(['individual', 'organization']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
});

const entitySortFields = ['name', 'type', 'created'] as const;

const ListEntitiesQuerySchema = z.object({
  search: z.string().optional(),
  type: commaSeparatedParam(z.enum(['individual', 'organization'])),
  ...paginationParams,
  ...createSortByParam(entitySortFields),
  ...sortOrderParam,
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const query = parseQueryParams(ListEntitiesQuerySchema, request);

    const result = await entityService.listEntities(user.id, query);

    return NextResponse.json(result);
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
    console.error('Error listing entities:', error);
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = UpsertEntitySchema.parse(body);
    const data: UpsertEntityDto = {
      ...parsed,
      type: parsed.type as EntityType,
      email: parsed.email === '' ? undefined : parsed.email,
    };
    const result = await entityService.upsertEntity(user.id, data);

    return NextResponse.json({
      success: true,
      message: data.id
        ? 'Entity updated successfully'
        : 'Entity created successfully',
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
    console.error('Error upserting entity:', error);
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

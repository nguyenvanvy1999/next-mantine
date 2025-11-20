import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tagService } from '@/lib/services/tag.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';
import type { UpsertTagDto } from '@/types/tag';

const UpsertTagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
});

const ListTagsQuerySchema = z.object({
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  sortBy: z.enum(['name', 'created']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const query = ListTagsQuerySchema.parse({
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
    });

    const result = await tagService.listTags(user.id, query);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error listing tags:',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = UpsertTagSchema.parse(body);
    const data: UpsertTagDto = {
      ...parsed,
    };
    const result = await tagService.upsertTag(user.id, data);

    return NextResponse.json({
      success: true,
      message: data.id
        ? 'Tag updated successfully'
        : 'Tag created successfully',
      data: result,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error upserting tag:',
    });
  }
}

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { entityService } from '@/lib/services/entity.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';

const DeleteManySchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { ids } = DeleteManySchema.parse(body);
    const result = await entityService.deleteManyEntities(user.id, ids);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error deleting entities:',
    });
  }
}

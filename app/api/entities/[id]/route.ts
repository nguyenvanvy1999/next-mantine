import { type NextRequest, NextResponse } from 'next/server';
import { entityService } from '@/lib/services/entity.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const result = await entityService.getEntity(user.id, id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error getting entity:',
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await entityService.deleteManyEntities(user.id, [id]);

    return NextResponse.json({
      success: true,
      message: 'Entity deleted successfully',
      data: null,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error deleting entity:',
    });
  }
}

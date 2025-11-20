import { type NextRequest, NextResponse } from 'next/server';
import { tagService } from '@/lib/services/tag.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const result = await tagService.getTag(user.id, id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error getting tag:',
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

    await tagService.deleteManyTags(user.id, [id]);

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
      data: null,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error deleting tag:',
    });
  }
}

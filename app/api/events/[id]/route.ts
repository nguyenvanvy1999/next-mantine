import { type NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/event.service';
import { handleApiError } from '@/lib/utils/api-response.util';
import { requireAuth } from '@/lib/utils/auth.util';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const result = await eventService.getEvent(user.id, id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error getting event:',
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

    await eventService.deleteManyEvents(user.id, [id]);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      data: null,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error deleting event:',
    });
  }
}

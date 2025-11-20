import { type NextRequest, NextResponse } from 'next/server';
import { entityService } from '@/lib/services/entity.service';
import { requireAuth } from '@/lib/utils/auth.util';
import { AppError } from '@/lib/utils/error.util';

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
    console.error('Error getting entity:', error);
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
    console.error('Error deleting entity:', error);
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

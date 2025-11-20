import { NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';
import { CURRENCY_SELECT_BASIC } from '@/lib/services/selects';
import { requireAuth } from '@/lib/utils/auth.util';

// GET /api/currencies - Get all currencies
export async function GET() {
  try {
    await requireAuth(); // Require authentication

    const currencies = await prisma.currency.findMany({
      where: {
        isActive: true,
      },
      select: CURRENCY_SELECT_BASIC,
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Currencies retrieved successfully',
      data: { currencies },
    });
  } catch (error) {
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
    console.error('Error getting currencies:', error);
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

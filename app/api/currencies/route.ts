import { NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';
import { CURRENCY_SELECT_BASIC } from '@/lib/services/selects';

// GET /api/currencies - Get all currencies
export async function GET() {
  try {
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
      data: currencies,
    });
  } catch (error) {
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

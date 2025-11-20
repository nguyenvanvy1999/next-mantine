import { APIError } from 'better-auth/api';
import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import type { RegisterRequestDto } from '@/types/user';

// POST /api/auth/register - Custom registration endpoint with baseCurrencyId
export async function POST(request: Request) {
  try {
    const body: RegisterRequestDto = await request.json();
    const { email, password, firstName, lastName, baseCurrencyId } = body;

    // Validate baseCurrencyId
    if (!baseCurrencyId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Base currency is required',
          data: null,
        },
        { status: 400 },
      );
    }

    // Check if currency exists
    const currency = await prisma.currency.findFirst({
      where: {
        id: baseCurrencyId,
        isActive: true,
      },
    });

    if (!currency) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid base currency',
          data: null,
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already registered',
          data: null,
        },
        { status: 400 },
      );
    }

    // Create user using Better Auth API
    const name = `${firstName} ${lastName}`.trim();

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: request.headers,
      });
    } catch (error) {
      // Handle Better Auth API errors
      if (error instanceof APIError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message || 'Registration failed',
            data: null,
          },
          { status: 500 },
        );
      }

      // Re-throw unexpected errors
      throw error;
    }

    // Get the created user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User created but could not be found',
          data: null,
        },
        { status: 500 },
      );
    }

    // Update user with baseCurrencyId
    await prisma.user.update({
      where: { id: user.id },
      data: { baseCurrencyId },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          baseCurrencyId,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate email error
    if (
      error instanceof Error &&
      (error.message.includes('Unique constraint') ||
        error.message.includes('already exists'))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already registered',
          data: null,
        },
        { status: 400 },
      );
    }

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

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';
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

    // Create user using Better Auth by calling its signup endpoint internally
    const name = `${firstName} ${lastName}`.trim();
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const signUpUrl = new URL('/api/auth/sign-up/email', baseUrl);

    const signUpResponse = await fetch(signUpUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    if (!signUpResponse.ok) {
      const errorData = await signUpResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Registration failed',
          data: null,
        },
        { status: signUpResponse.status },
      );
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

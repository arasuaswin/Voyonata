import { NextResponse } from 'next/server';
import * as argon2 from 'argon2';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
    .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
    .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Password must contain at least one special character' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { fullName, email, password } = result.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email is already registered' }, { status: 409 });
    }

    // Hash password with Argon2 (enterprise-grade memory-hard hash)
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        full_name: fullName,
        email,
        password_hash: passwordHash,
      },
    });

    // Generate JWT (15-min access token)
    const accessToken = await signToken({ userId: user.id, email: user.email });

    // Generate Refresh Token (Cryptographically secure random string)
    const refreshTokenString = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token valid for 7 days

    // Store Refresh Token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    // Set Secure Cookies
    const cookieStore = await cookies();
    // Access Token Cookie (15 min)
    cookieStore.set('jwt-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });
    // Refresh Token Cookie (7 days)
    cookieStore.set('refresh-token', refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'Registration successful', user: { id: user.id, email: user.email, fullName: user.full_name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

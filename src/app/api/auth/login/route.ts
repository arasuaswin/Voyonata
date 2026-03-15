import { NextResponse } from 'next/server';
import * as argon2 from 'argon2';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

import redis from '@/lib/redis';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 min
const MAX_ATTEMPTS = 5;

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:login:${ip}`;
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  
  if (current > MAX_ATTEMPTS) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ message: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify Argon2 hash
    const isValidPassword = await argon2.verify(user.password_hash, password);
    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Remove successful logins from rate limit cache
    await redis.del(`ratelimit:login:${ip}`);

    // Generate Device Fingerprint (Zero-Knowledge JWT Binding)
    const userAgent = request.headers.get('user-agent') || 'unknown-device';
    const fingerprintRaw = `${ip}|${userAgent}`;
    const deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');

    // Generate JWT (15-min access token bound to the device fingerprint)
    const accessToken = await signToken({ userId: user.id, email: user.email }, deviceFingerprint);

    // Generate Refresh Token
    const refreshTokenString = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Revoke old refresh tokens for this user (Optional: limits to 1 active session)
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });

    // Store new Refresh Token
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('jwt-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 min
      path: '/',
    });
    
    cookieStore.set('refresh-token', refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'Login successful', user: { id: user.id, email: user.email, fullName: user.full_name } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

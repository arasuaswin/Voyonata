import { NextResponse } from 'next/server';
import * as argon2 from 'argon2';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';
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

    // Create session using shared utility (JWT + refresh token + cookies)
    const userAgent = request.headers.get('user-agent') || 'unknown-device';
    await createSession({
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
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

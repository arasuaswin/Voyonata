import { NextResponse } from 'next/server';
import * as argon2 from 'argon2';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';

// Password arrives as a SHA-256 hex hash from client-side pre-hashing
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .regex(/^[a-f0-9]{64}$/, 'Invalid password hash format'),
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

    // Create session (JWT + refresh token + cookies) using shared utility
    await createSession({
      userId: user.id,
      email: user.email,
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

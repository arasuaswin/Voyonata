import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import * as argon2 from 'argon2';
import { z } from 'zod';

// Helper: get current user from JWT cookie
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt-token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, full_name: true, email: true, email_verified: true, createdAt: true },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

const updateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.issues },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (result.data.fullName) updateData.full_name = result.data.fullName;
    if (result.data.email && result.data.email !== user.email) {
      // Check if new email is already taken
      const existing = await prisma.user.findUnique({ where: { email: result.data.email } });
      if (existing) {
        return NextResponse.json({ message: 'Email is already in use' }, { status: 409 });
      }
      updateData.email = result.data.email;
      updateData.email_verified = false; // Reset verification on email change
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes provided' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, full_name: true, email: true, email_verified: true },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        emailVerified: updatedUser.email_verified,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

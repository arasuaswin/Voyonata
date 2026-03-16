import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import * as argon2 from 'argon2';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid password hash format'),
  newPassword: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid password hash format'),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await argon2.verify(user.password_hash, currentPassword);
    if (!isValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password with Argon2
    const newHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newHash },
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

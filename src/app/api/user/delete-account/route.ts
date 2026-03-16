import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE() {
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

    const userId = payload.userId as string;

    // Cascade delete: passkeys → refresh tokens → user
    // Prisma's onDelete: Cascade handles this, but let's be explicit
    await prisma.passkey.deleteMany({ where: { userId } });
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    // Clear cookies
    cookieStore.set('jwt-token', '', { maxAge: 0, path: '/' });
    cookieStore.set('refresh-token', '', { maxAge: 0, path: '/' });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

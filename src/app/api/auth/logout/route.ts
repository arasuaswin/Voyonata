import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh-token')?.value;

  // Revoke the refresh token in the database if it exists
  if (refreshToken) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    } catch (error) {
      console.error('Failed to revoke refresh token during logout', error);
      // We still proceed to clear cookies even if DB revocation fails
    }
  }

  // Clear cookies
  cookieStore.set('jwt-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  cookieStore.set('refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );
}

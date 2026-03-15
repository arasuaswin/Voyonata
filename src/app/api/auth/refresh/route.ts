import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('refresh-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
    }

    // Find the token in the database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      // If token is compromised, invalid, or expired, delete the cookie
      cookieStore.set('refresh-token', '', { maxAge: 0 });
      cookieStore.set('jwt-token', '', { maxAge: 0 });
      return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
    }

    // Revoke the old refresh token to prevent reuse (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate NEW Access Token
    const accessToken = await signToken({ userId: storedToken.user.id, email: storedToken.user.email });

    // Generate NEW Refresh Token
    const newRefreshTokenString = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store NEW Refresh Token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenString,
        userId: storedToken.user.id,
        expiresAt,
      },
    });

    // Set new cookies
    cookieStore.set('jwt-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 min
      path: '/',
    });
    
    cookieStore.set('refresh-token', newRefreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ message: 'Token refreshed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

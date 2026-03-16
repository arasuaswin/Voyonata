import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

interface CreateSessionOptions {
  userId: string;
  email: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Shared session creation utility.
 * Creates a JWT access token (15 min) + refresh token (7 days),
 * stores the refresh token in the DB, and sets secure httpOnly cookies.
 */
export async function createSession({ userId, email, ip, userAgent }: CreateSessionOptions) {
  // Generate device fingerprint if IP + UA are provided
  let deviceFingerprint: string | undefined;
  if (ip && userAgent) {
    const fingerprintRaw = `${ip}|${userAgent}`;
    deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');
  }

  // Generate JWT access token (15 min, bound to device fingerprint)
  const accessToken = await signToken({ userId, email }, deviceFingerprint);

  // Generate cryptographically secure refresh token
  const refreshTokenString = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Revoke old refresh tokens for this user (single active session)
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });

  // Store new refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenString,
      userId,
      expiresAt,
    },
  });

  // Set secure httpOnly cookies
  const cookieStore = await cookies();

  cookieStore.set('jwt-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  cookieStore.set('refresh-token', refreshTokenString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return { accessToken, refreshToken: refreshTokenString };
}

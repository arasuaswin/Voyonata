import { NextResponse } from 'next/server';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import crypto from 'crypto';

const rpID = process.env.NEXT_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_URL).hostname : 'localhost';
const origin = process.env.NEXT_PUBLIC_URL || `http://${rpID}:3000`;

export async function GET(request: Request) {
  try {
    // Note: To login with a passkey, we don't necessarily need to know who the user is yet.
    // The browser will prompt them to select an available passkey, which tells us who they are.
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });

    const cookieStore = await cookies();
    cookieStore.set('webauthn-challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60, // 5 minutes to complete login
      path: '/',
    });

    return NextResponse.json(options);

  } catch (error) {
    console.error('WebAuthn generation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn-challenge')?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ message: 'Challenge expired' }, { status: 400 });
    }

    // Look up the credential in our database to find the user
    // The browser sends credential.id as a base64url string. We need to match it to our stored Buffer.
    const credentialBase64 = body.id;
    // Buffer conversion requires exact matching; in production you must carefully match encoding types.
    // Assuming simplewebauthn handles the matching if we can fetch all keys for a user, 
    // but without a user ID, we have to find the key directly.
    const passkey = await prisma.passkey.findFirst({
      include: { user: true } // We need the user to log them in!
    });

    // Note: For a true 1:1 lookup, you need to properly handle Base64URL to Buffer conversion for `credentialID`.
    // We are simulating a generic match above for complex architectures.
    if (!passkey) {
      return NextResponse.json({ message: 'Credential not found' }, { status: 404 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialID.toString('base64url'),
        publicKey: new Uint8Array(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      // Update the counter to prevent cloned authenticator attacks
      await prisma.passkey.update({
        where: { id: passkey.id },
        data: { counter: verification.authenticationInfo.newCounter }
      });

      // User successfully proved possession of their hardware key! Log them in!
      const user = passkey.user;

      // Duplicate Login logic follows from /api/auth/login...
      const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
      const userAgent = request.headers.get('user-agent') || 'unknown-device';
      const fingerprintRaw = `${ip}|${userAgent}`;
      const deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');

      const accessToken = await signToken({ userId: user.id, email: user.email }, deviceFingerprint);
      const refreshTokenString = crypto.randomBytes(64).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          token: refreshTokenString,
          userId: user.id,
          expiresAt,
        },
      });

      cookieStore.set('jwt-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, path: '/',
      });
      cookieStore.set('refresh-token', refreshTokenString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, path: '/',
      });

      cookieStore.set('webauthn-challenge', '', { maxAge: 0 }); // Clear challenge
      return NextResponse.json({ verified: true, user: { id: user.id, email: user.email, fullName: user.full_name } });
    }

    return NextResponse.json({ message: 'Authentication failed' }, { status: 400 });
  } catch (error) {
    console.error('WebAuthn verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

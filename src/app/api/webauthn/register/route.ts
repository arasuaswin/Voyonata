import { NextResponse } from 'next/server';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const rpName = 'Voyonata Max Security';
const rpID = process.env.NEXT_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_URL).hostname : 'localhost';
const origin = process.env.NEXT_PUBLIC_URL || `http://${rpID}:3000`;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { passkeys: true }
    });

    if (!user) {
       return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate WebAuthn Registration Options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Uint8Array.from(user.id, (c: string) => c.charCodeAt(0)),
      userName: user.email,
      attestationType: 'none',
      // Block trying to register the same device twice
      excludeCredentials: user.passkeys.map((key: any) => ({
        id: key.credentialID,
        type: 'public-key',
        transports: key.transports ? JSON.parse(key.transports) : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    // Store the challenge temporarily in a cookie so we can verify it in the POST phase
    cookieStore.set('webauthn-challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60, // 5 minutes to complete registration
      path: '/',
    });

    return NextResponse.json(options);

  } catch (error) {
    console.error('WebAuthn Generation Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;
    const expectedChallenge = cookieStore.get('webauthn-challenge')?.value;

    if (!token || !expectedChallenge) {
      return NextResponse.json({ message: 'Unauthorized or Challenge expired' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      // Save the Passkey to the Database
      await prisma.passkey.create({
        data: {
          credentialID: Buffer.from(credential.id), // v10 uses credential.id
          credentialPublicKey: Buffer.from(credential.publicKey), // v10 uses credential.publicKey
          counter: credential.counter, // v10 uses credential.counter
          credentialDeviceType,
          credentialBackedUp,
          userId: payload.userId as string,
        }
      });

      // Clear the challenge to prevent replay attacks
      cookieStore.set('webauthn-challenge', '', { maxAge: 0 });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ message: 'Verification failed' }, { status: 400 });

  } catch (error) {
    console.error('WebAuthn Verification Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

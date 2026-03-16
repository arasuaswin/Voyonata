import { NextResponse } from 'next/server';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';

const rpID = process.env.NEXT_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_URL).hostname : 'localhost';
const origin = process.env.NEXT_PUBLIC_URL || `http://${rpID}:3000`;

export async function GET(request: Request) {
  try {
    // To login with a passkey, we don't need to know who the user is yet.
    // The browser will prompt them to select an available passkey.
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

    // Convert the base64url credential ID from the browser into a Buffer for DB lookup
    const credentialIDBuffer = Buffer.from(body.id, 'base64url');

    // Look up the specific credential in our database
    const passkey = await prisma.passkey.findFirst({
      where: { credentialID: credentialIDBuffer },
      include: { user: true },
    });

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
      const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
      const userAgent = request.headers.get('user-agent') || 'unknown-device';

      await createSession({
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
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


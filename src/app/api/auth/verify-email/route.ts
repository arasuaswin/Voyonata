import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.issues },
        { status: 400 }
      );
    }

    // TODO: In production, look up the token in a VerificationToken table
    // and verify it hasn't expired, then mark the user's email as verified.
    
    // For now, this is a stub that demonstrates the flow.
    // In a real implementation:
    // 1. Find the verification token in the DB
    // 2. Check if it's expired
    // 3. Update User.email_verified = true
    // 4. Delete the used token
    
    console.log(`[DEV] Email verification attempted with token: ${result.data.token}`);

    return NextResponse.json({
      message: 'Email verification is not yet connected to a token store. This is a development stub.',
    }, { status: 400 });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

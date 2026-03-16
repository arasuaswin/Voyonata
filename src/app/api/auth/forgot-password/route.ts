import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email('Invalid email address'),
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

    const { email } = result.data;

    // Check if user exists (but always return success to prevent email enumeration)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate a reset token (in production, send this via email)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // TODO: Store reset token in database with expiry
      // TODO: Send email with reset link containing the token
      
      // For now, log the token to console (development only)
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
      console.log(`[DEV] Reset link: ${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`);
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

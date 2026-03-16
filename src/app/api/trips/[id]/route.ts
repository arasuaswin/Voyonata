import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

// Local cast to avoid TS errors
const db = prisma as any as {
  trip: {
    findFirst: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  }
};
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId as string | null;
}

// GET — Get a single trip by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const trip = await db.trip.findFirst({
      where: { id, userId },
    });

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Trip fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Delete a trip by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const trip = await db.trip.findFirst({
      where: { id, userId },
    });

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    await db.trip.delete({ where: { id } });

    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Trip delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

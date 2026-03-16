import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

// Local cast to avoid TS errors
const db = prisma as any as {
  trip: {
    create: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any>;
  }
};
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateTemplateItinerary } from '@/lib/itinerary-generator';

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId as string | null;
}

const createTripSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  travelers: z.number().int().min(1).max(20).default(1),
  budget: z.enum(['budget', 'moderate', 'luxury']).default('moderate'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  notes: z.string().optional(),
});

// POST — Create a new trip with generated itinerary
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createTripSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { destination, startDate, endDate, travelers, budget, interests, notes } = result.data;

    // Generate template itinerary (replace with AI later)
    const itinerary = generateTemplateItinerary({
      destination,
      startDate,
      endDate,
      travelers,
      budget,
      interests,
      notes,
    });

    const trip = await db.trip.create({
      data: {
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelers,
        budget,
        interests,
        notes: notes || null,
        itinerary: itinerary as any,
        status: 'planned',
        userId,
      },
    });

    return NextResponse.json({
      message: 'Trip planned successfully!',
      trip: {
        id: trip.id,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
        budget: trip.budget,
        interests: trip.interests,
        itinerary: trip.itinerary,
        status: trip.status,
        createdAt: trip.createdAt,
      },
    });
  } catch (error) {
    console.error('Trip creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// GET — List all trips for the current user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const trips = await db.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        destination: true,
        startDate: true,
        endDate: true,
        travelers: true,
        budget: true,
        interests: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Trips fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

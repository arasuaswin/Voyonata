'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Calendar, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TripSummary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  interests: string[];
  status: string;
  createdAt: string;
}

const budgetEmoji: Record<string, string> = { budget: '💰', moderate: '💎', luxury: '👑' };

export default function TripsListPage() {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrips(trips.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getDuration(start: string, end: string) {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
        </div>
        <Link href="/dashboard/trips/plan">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Plan New Trip
          </Button>
        </Link>
      </motion.div>

      {trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-12 shadow-xl text-center"
        >
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Start planning your first adventure!</p>
          <Link href="/dashboard/trips/plan">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Plan Your First Trip
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/trips/${trip.id}`}
                className="group block bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-xl hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {trip.destination}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(trip.startDate)} — {formatDate(trip.endDate)} · {getDuration(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                  <span className="text-lg">{budgetEmoji[trip.budget] || '💎'}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                    {trip.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {trip.interests.slice(0, 4).map(interest => (
                    <span key={interest} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground capitalize">
                      {interest}
                    </span>
                  ))}
                </div>
              </Link>

              <div className="mt-1 flex justify-end px-1">
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete(trip.id); }}
                  disabled={deleting === trip.id}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 py-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {deleting === trip.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

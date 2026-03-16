'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, ArrowLeft, Clock, Trash2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Activity {
  time: string;
  activity: string;
  description: string;
  category: string;
}

interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface TripData {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  interests: string[];
  notes: string | null;
  itinerary: DayPlan[];
  status: string;
  createdAt: string;
}

const budgetLabel: Record<string, string> = { budget: '💰 Budget', moderate: '💎 Moderate', luxury: '👑 Luxury' };
const categoryColors: Record<string, string> = {
  culture: 'bg-indigo-500/20 text-indigo-400',
  food: 'bg-orange-500/20 text-orange-400',
  adventure: 'bg-emerald-500/20 text-emerald-400',
  relaxation: 'bg-cyan-500/20 text-cyan-400',
  nightlife: 'bg-purple-500/20 text-purple-400',
  shopping: 'bg-pink-500/20 text-pink-400',
  photography: 'bg-amber-500/20 text-amber-400',
  exploration: 'bg-blue-500/20 text-blue-400',
};

export default function TripViewPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
        } else {
          router.push('/dashboard/trips');
        }
      } catch {
        router.push('/dashboard/trips');
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [params.id, router]);

  async function handleDelete() {
    if (!trip) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard/trips');
    } catch {
      setDeleting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  }

  function getDays() {
    if (!trip) return 0;
    return Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
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

  if (!trip) return null;

  const itinerary = trip.itinerary as DayPlan[];
  const currentDay = itinerary[activeDay];

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/trips" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Trips
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? 'Deleting...' : 'Delete Trip'}
        </button>
      </div>

      {/* Trip Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {trip.destination}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {getDays()} days
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}
              </span>
              <span>{budgetLabel[trip.budget] || trip.budget}</span>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-2 mt-4">
          {trip.interests.map(interest => (
            <span key={interest} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
              {interest}
            </span>
          ))}
        </div>

        {trip.notes && (
          <p className="mt-4 text-sm text-muted-foreground bg-white/5 rounded-lg p-3 border border-white/10">
            {trip.notes}
          </p>
        )}
      </motion.div>

      {/* Day Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {itinerary.map((day, index) => (
          <button
            key={index}
            onClick={() => setActiveDay(index)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDay === index
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            Day {day.day}
          </button>
        ))}
      </motion.div>

      {/* Day Content */}
      <motion.div
        key={activeDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">{currentDay.title}</h2>
          <span className="text-xs text-muted-foreground">{formatDate(currentDay.date)}</span>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {currentDay.activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 group"
            >
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-primary/70 border-2 border-primary shadow-sm shadow-primary/30" />
                {i < currentDay.activities.length - 1 && (
                  <div className="w-px flex-1 bg-white/10 mt-1" />
                )}
              </div>

              {/* Activity Card */}
              <div className="flex-1 bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg group-hover:bg-white/10 transition-all mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-mono">{activity.time}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    categoryColors[activity.category] || 'bg-white/10 text-muted-foreground'
                  }`}>
                    {activity.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm">{activity.activity}</h3>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

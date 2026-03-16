'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Shield, Key, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  fullName: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [tripsCount, setTripsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, tripsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/trips')
        ]);
        
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user);
        }
        if (tripsRes.ok) {
          const data = await tripsRes.json();
          setTripsCount(data.trips.length);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const quickActions = [
    {
      icon: Map,
      title: 'Plan a Trip',
      description: 'Generate your perfect itinerary',
      href: '/dashboard/trips/plan',
      color: 'from-indigo-500/20 to-purple-500/20',
    },
    {
      icon: User,
      title: 'Edit Profile',
      description: 'Update your name and email',
      href: '/dashboard/profile',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: Key,
      title: 'Manage Passkeys',
      description: 'Register hardware security keys',
      href: '/dashboard/settings',
      color: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      icon: Shield,
      title: 'Security Status',
      description: 'Your account is protected by Argon2 + FIDO2',
      href: '/dashboard/settings',
      color: 'from-amber-500/20 to-orange-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">{user?.fullName || 'Traveler'}</span>
        </h1>
        <p className="text-muted-foreground">
          Your secure travel command center. Plan your next adventure below.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-xl">
          <Link href="/dashboard/trips" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tripsCount}</p>
              <p className="text-xs text-muted-foreground">Trips Planned</p>
            </div>
          </Link>
        </div>
        <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-xl">
          <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">Active</p>
              <p className="text-xs text-muted-foreground">Security Status</p>
            </div>
          </Link>
        </div>
        <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-xl">
          <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Key className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Passkeys Registered</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map(({ icon: Icon, title, description, href, color }) => (
            <Link
              key={title}
              href={href}
              className={`group relative bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-xl transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-2xl`}
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, Heart, StickyNote, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const interestOptions = [
  { id: 'culture', label: '🏛️ Culture & History', color: 'from-indigo-500/20 to-blue-500/20' },
  { id: 'food', label: '🍽️ Food & Dining', color: 'from-orange-500/20 to-red-500/20' },
  { id: 'adventure', label: '🏔️ Adventure', color: 'from-emerald-500/20 to-green-500/20' },
  { id: 'relaxation', label: '🧘 Relaxation', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'nightlife', label: '🌃 Nightlife', color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'shopping', label: '🛍️ Shopping', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'photography', label: '📸 Photography', color: 'from-amber-500/20 to-yellow-500/20' },
];

const budgetOptions = [
  { value: 'budget', label: 'Budget', emoji: '💰', description: 'Affordable & smart' },
  { value: 'moderate', label: 'Moderate', emoji: '💎', description: 'Balanced comfort' },
  { value: 'luxury', label: 'Luxury', emoji: '👑', description: 'Premium experiences' },
];

export default function PlanTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 'moderate',
    interests: [] as string[],
    notes: '',
  });

  const totalSteps = 4;

  const toggleInterest = (id: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.destination.length >= 2;
      case 1: return form.startDate && form.endDate && form.endDate >= form.startDate;
      case 2: return form.interests.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push(`/dashboard/trips/${data.trip.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-primary" />
          Plan Your Trip
        </h1>
        <p className="text-muted-foreground mt-1">Tell us about your dream trip and we&apos;ll craft the perfect itinerary.</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: i <= step ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl space-y-5"
          >
            <h2 className="text-lg font-semibold">Where do you want to go?</h2>
            <Input
              id="destination"
              placeholder="e.g. Tokyo, Paris, Bali..."
              icon={<MapPin className="h-4 w-4" />}
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Start Date</label>
                <Input
                  id="startDate"
                  type="date"
                  icon={<Calendar className="h-4 w-4" />}
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  min={today}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">End Date</label>
                <Input
                  id="endDate"
                  type="date"
                  icon={<Calendar className="h-4 w-4" />}
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  min={form.startDate || today}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Number of Travelers</label>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="1" max="10"
                  value={form.travelers}
                  onChange={e => setForm({ ...form, travelers: parseInt(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-bold w-8 text-center">{form.travelers}</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl space-y-5"
          >
            <h2 className="text-lg font-semibold">What&apos;s your budget style?</h2>
            <div className="grid grid-cols-3 gap-3">
              {budgetOptions.map(({ value, label, emoji, description }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, budget: value })}
                  className={`relative rounded-xl border p-4 text-center transition-all ${
                    form.budget === value
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{description}</div>
                  {form.budget === value && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl space-y-5"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              What are you interested in?
            </h2>
            <p className="text-xs text-muted-foreground">Select all that apply — your itinerary will be tailored to these.</p>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(({ id, label, color }) => {
                const selected = form.interests.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleInterest(id)}
                    className={`relative rounded-xl border p-3 text-left text-sm font-medium transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-0 ${selected ? 'opacity-100' : ''} transition-opacity`} />
                    <span className="relative">{label}</span>
                    {selected && (
                      <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl space-y-5"
          >
            <h2 className="text-lg font-semibold">Anything else?</h2>
            <textarea
              placeholder="Special considerations, must-visit places, dietary needs, accessibility requirements..."
              className="w-full h-28 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold">Trip Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="text-foreground font-medium">Destination:</span> {form.destination}</div>
                <div><span className="text-foreground font-medium">Travelers:</span> {form.travelers}</div>
                <div><span className="text-foreground font-medium">Dates:</span> {form.startDate} → {form.endDate}</div>
                <div><span className="text-foreground font-medium">Budget:</span> {form.budget}</div>
                <div className="col-span-2">
                  <span className="text-foreground font-medium">Interests:</span>{' '}
                  {form.interests.map(id => interestOptions.find(o => o.id === id)?.label).join(', ')}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          className={step === 0 ? 'invisible' : ''}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < totalSteps - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!canProceed()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Itinerary
          </Button>
        )}
      </div>
    </div>
  );
}

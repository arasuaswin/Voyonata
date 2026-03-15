import Link from 'next/link';
import { Map, Compass, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function Home() {
  return (
    <main className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden selection:bg-primary/20 bg-background text-foreground">
      <AnimatedBackground />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-12 py-24 md:py-32">
        
        {/* Hero Section */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium backdrop-blur-md mb-4 shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Next-Generation AI Travel Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            Plan your next journey with <span className="bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">Voyonata</span>.
          </h1>
          
          <p className="mx-auto max-w-[600px] text-lg md:text-xl text-muted-foreground/80 font-medium">
            The world's smartest AI travel planner. Curate personalized itineraries, discover hidden gems, and book seamlessly—all secured by military-grade, zero-knowledge encryption.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link 
            href="/register" 
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto"
          >
            Start Planning Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="/login" 
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-8 font-medium text-foreground transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto shadow-2xl"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl w-full text-left">
          
          <div className="flex flex-col space-y-3 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-2xl hover:bg-white/10 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">AI-Generated Itineraries</h3>
            <p className="text-sm text-muted-foreground">
              Simply tell Voyonata where you want to go, and our AI will build a complete, minute-by-minute travel plan tailored to your preferences.
            </p>
          </div>

          <div className="flex flex-col space-y-3 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-2xl hover:bg-white/10 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Smart Discoveries</h3>
            <p className="text-sm text-muted-foreground">
              Go beyond the tourist traps. Our algorithms analyze thousands of data points to recommend authentic, off-the-beaten-path experiences.
            </p>
          </div>

          <div className="flex flex-col space-y-3 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-2xl hover:bg-white/10 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Ultimate Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Your travel plans are guarded by zero-knowledge encryption and Passkey authentication. Only you can access your data.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

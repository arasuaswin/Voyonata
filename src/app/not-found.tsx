import Link from 'next/link';
import { Map, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background text-foreground">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-4 max-w-md">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Map className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            404
          </h1>
          <h2 className="text-xl font-semibold">Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            Looks like this route doesn&apos;t exist yet. Even the best explorers get lost sometimes.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}

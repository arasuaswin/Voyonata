'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    }

    verify();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 text-center space-y-4 sm:w-[450px]"
    >
      {status === 'loading' && (
        <>
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-muted-foreground">Verifying your email...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="h-7 w-7 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-sm text-muted-foreground">
            Your email has been successfully verified. You can now access all features.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto h-14 w-14 rounded-full bg-destructive/20 flex items-center justify-center">
            <X className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Verification Failed</h1>
          <p className="text-sm text-muted-foreground">
            The verification link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">
              Go to Dashboard
            </Button>
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden selection:bg-primary/20">
      <AnimatedBackground />

      <div className="container relative z-10 flex h-screen w-screen flex-col items-center justify-center">
        <Link 
          href="/" 
          className="absolute z-20 left-4 top-4 md:left-8 md:top-8 text-2xl font-bold tracking-tighter text-foreground hover:opacity-80 transition-opacity"
        >
          Voyonata<span className="text-primary">.</span>
        </Link>

        <Suspense fallback={
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-2 text-center"
          >
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card/70 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl p-6 sm:p-8"
          >
            {sent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  If an account exists with <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 text-center">
                      {error}
                    </div>
                  )}

                  <Input
                    id="email"
                    placeholder="Email address"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button className="w-full" type="submit" isLoading={isLoading}>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

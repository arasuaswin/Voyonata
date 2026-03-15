'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientSideHash } from '@/lib/clientCrypto';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Zero-Knowledge pre-hashing: Server never sees the plaintext password
      const hashedPassword = await clientSideHash(formData.password);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: hashedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      router.push('/dashboard'); // or wherever after login
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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card/70 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  id="email"
                  placeholder="Email address"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  icon={<Mail className="h-4 w-4" />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                
                <div className="space-y-2">
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    icon={<Shield className="h-4 w-4" />}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-transparent"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      />
                      <label htmlFor="remember" className="text-sm font-medium leading-none text-muted-foreground">
                        Remember me
                      </label>
                    </div>
                    
                    <Link href="/forgot-password" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6" type="submit" isLoading={isLoading}>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
                Create one
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

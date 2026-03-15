'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientSideHash } from '@/lib/clientCrypto';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms and privacy policy');
      return;
    }

    setIsLoading(true);

    try {
      // Zero-Knowledge pre-hashing: Server never sees the plaintext password
      const hashedPassword = await clientSideHash(formData.password);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: hashedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Registration failed');
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
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start planning your next adventure today
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
                  id="fullName"
                  placeholder="Full Name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  icon={<User className="h-4 w-4" />}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                
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
                
                <div className="space-y-1">
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    icon={<Shield className="h-4 w-4" />}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  {formData.password && (
                    <PasswordStrengthMeter password={formData.password} />
                  )}
                </div>

                <Input
                  id="confirmPassword"
                  placeholder="Confirm password"
                  type="password"
                  icon={<Shield className="h-4 w-4" />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-transparent"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="hover:text-primary hover:underline underline-offset-4">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="hover:text-primary hover:underline underline-offset-4">Privacy Policy</Link>.
                </label>
              </div>

              <Button className="w-full mt-6" type="submit" isLoading={isLoading}>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

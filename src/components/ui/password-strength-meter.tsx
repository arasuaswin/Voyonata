'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  
  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return 'Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getColor = (index: number, score: number) => {
    if (index >= score) return 'bg-gray-200 dark:bg-slate-800'; // Unfilled
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-primary';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full space-y-1.5 mt-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground font-medium">Password strength</span>
        <span className="font-semibold">{password ? getStrengthLabel(strength) : ''}</span>
      </div>
      <div className="flex gap-1.5 h-1.5">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`flex-1 rounded-full ${getColor(index, strength)} transition-colors duration-300`}
            initial={{ opacity: 0.5, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 text-center">
        Use 8+ chars with uppercase, letters, numbers & symbols.
      </p>
    </div>
  );
}

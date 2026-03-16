'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Trash2, Plus, AlertTriangle, Fingerprint, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useRouter } from 'next/navigation';
import { startRegistration } from '@simplewebauthn/browser';

interface PasskeyInfo {
  id: string;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPasskeys();
  }, []);

  async function fetchPasskeys() {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        // We'll use a lightweight approach — the settings page doesn't need full passkey data
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  const handleRegisterPasskey = async () => {
    setError('');
    setSuccess('');
    setRegistering(true);

    try {
      // Step 1: Get registration options from server
      const optionsRes = await fetch('/api/webauthn/register');
      if (!optionsRes.ok) {
        throw new Error('Failed to get registration options');
      }
      const options = await optionsRes.json();

      // Step 2: Create credential via browser/device
      const credential = await startRegistration({ optionsJSON: options });

      // Step 3: Send credential to server for verification
      const verifyRes = await fetch('/api/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.message || 'Passkey registration failed');
      }

      setSuccess('Passkey registered successfully! You can now use it to sign in.');
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey registration was cancelled.');
      } else {
        setError(err.message || 'Failed to register passkey');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your security and preferences</p>
      </motion.div>

      {/* Status Messages */}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-500/10 text-emerald-500 text-sm rounded-lg border border-emerald-500/20">
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
          {error}
        </motion.div>
      )}

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred color scheme</p>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Passkey Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              Passkeys (FIDO2)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Register hardware security keys or biometric authenticators for passwordless login
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How Passkeys Work</p>
              <p>Your device generates a cryptographic key pair. The private key stays locked in your device&apos;s secure hardware (TPM/Secure Enclave). Only the public key is stored on our server. Even if our database is breached, attackers cannot sign in as you.</p>
            </div>
          </div>
        </div>

        <Button onClick={handleRegisterPasskey} isLoading={registering} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Register New Passkey
        </Button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-destructive/5 backdrop-blur-xl border border-destructive/20 rounded-xl p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive font-medium">
              Are you absolutely sure? All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                isLoading={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

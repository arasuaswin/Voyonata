'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, User, Settings, LogOut, Menu, X, Map } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background text-foreground">
      <AnimatedBackground />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card/80 backdrop-blur-xl border border-white/10 text-foreground"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-card/80 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl transition-transform md:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
              <Link href="/" className="text-xl font-bold tracking-tighter">
                <Map className="inline h-5 w-5 mr-2 text-primary" />
                Voyonata<span className="text-primary">.</span>
              </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-white/10 space-y-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 md:ml-[280px] min-h-screen">
        <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

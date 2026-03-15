import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function TermsPage() {
  return (
    <main className="min-h-screen w-full relative flex flex-col items-center overflow-hidden selection:bg-primary/20 bg-background text-foreground pb-20">
      <AnimatedBackground />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-start space-y-8 pt-12 max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium backdrop-blur-md mb-2">
            <Shield className="h-4 w-4 text-primary mr-2" />
            Legal Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground w-full max-w-none bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Voyonata. These Terms of Service govern your use of our revolutionary AI Travel Planner platform. By accessing or using our service, you agree to be bound by these terms.
          </p>

          <h2>2. Zero-Knowledge Guarantees & Liability</h2>
          <p>
            Voyonata employs a strict Zero-Knowledge cryptographic architecture. We do not store, possess, or have the technical ability to view your plaintext passwords. 
            Because your authentication keys are derived locally on your device or via hardware passkeys, <b>we cannot recover your account if you lose your hardware authenticators</b>.
            By using this platform, you assume full responsibility for maintaining access to your primary and backup authentication methods.
          </p>

          <h2>3. AI-Generated Itineraries</h2>
          <p>
            Our intelligent travel recommendations are generated autonomously via advanced algorithms. While we strive for accuracy, Voyonata does not guarantee the availability, 
            safety, or exact pricing of any recommended destinations, flights, or accommodations. Travel conditions change rapidly; users should manually verify itineraries before booking.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            You agree not to misuse the platform. This includes attempting to bypass our Web Application Firewall (WAF), flooding our APIs, or utilizing our services to orchestrate illegal international travel. 
            Any suspicious activity detected by our eBPF Kernel Monitors or GuardDuty instances will result in immediate API termination.
          </p>
          
          <h2>5. Updates to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. As a mathematics-first security company, our infrastructure may evolve, and these legal parameters will adapt accordingly.
          </p>
        </div>

      </div>
    </main>
  );
}

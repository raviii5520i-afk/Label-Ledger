'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Completely remove from DOM after 2.5 seconds (allowing 500ms for fade out)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C0E18] transition-opacity duration-500 ease-in-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700 ease-out">
        {/* Logo Container with Scanning Effect */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-[var(--lg-navy)]/5 border border-[var(--lg-navy)]/10 shadow-sm overflow-hidden">
          <ShieldCheck className="w-10 h-10 text-[var(--lg-navy)]" strokeWidth={2} />
          
          {/* Scanning Line */}
          <div className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        {/* Text */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--lg-navy)] tracking-tight mb-2 uppercase">
          LabelGuard
        </h1>
        <p className="text-xs md:text-sm font-mono text-[var(--lg-green-accent)] tracking-widest font-semibold uppercase mb-8">
          AI-Powered Label Compliance
        </p>

        {/* Minimal Loading Indicator */}
        <div className="w-32 h-1 bg-[var(--lg-border)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--lg-green-accent)] rounded-full animate-[progress_2s_ease-in-out_forwards]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

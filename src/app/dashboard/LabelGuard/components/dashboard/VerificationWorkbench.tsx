'use client';

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, ShieldCheck, Box, PackageOpen, ScanLine } from 'lucide-react';

interface WorkbenchItem {
  id: string;
  label: string;
  value: string;
  delay: number;
}

const EXTRACTED_ITEMS: WorkbenchItem[] = [
  { id: 'mrp', label: 'MRP Statement', value: '₹149.00 (Incl. of all taxes)', delay: 1200 },
  { id: 'net_qty', label: 'Net Quantity', value: '250g', delay: 1600 },
  { id: 'pack_date', label: 'Package Date', value: '10/2023', delay: 2000 },
  { id: 'customer_care', label: 'Customer Care', value: 'support@example.com', delay: 2400 },
];

export function VerificationWorkbench() {
  const [phase, setPhase] = useState<'uploading' | 'scanning' | 'extracting' | 'verified'>('uploading');
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Sequence
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => setPhase('scanning'), 500));
    timers.push(setTimeout(() => setPhase('extracting'), 1000));
    
    EXTRACTED_ITEMS.forEach(item => {
      timers.push(
        setTimeout(() => {
          setVisibleItems(prev => new Set(prev).add(item.id));
        }, item.delay)
      );
    });

    timers.push(setTimeout(() => setPhase('verified'), 3000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-[var(--lg-surface)] border border-[var(--lg-border)] rounded-2xl shadow-xl overflow-hidden font-sans w-full max-w-xl mx-auto lg:mx-0">
      {/* Workbench Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--lg-border)] bg-[var(--lg-background)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--lg-navy)]" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--lg-navy)]">
            Verification Workbench
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-[var(--lg-muted)]">Status:</span>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
            phase === 'verified' 
              ? "bg-[var(--lg-green-light)] text-[var(--lg-green-accent)]" 
              : "bg-black/5 text-[var(--lg-orange)]"
          )}>
            {phase.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[420px] md:h-[340px]">
        {/* Left Side: Image / Scanner */}
        <div className="w-full md:w-5/12 bg-[var(--lg-background)] border-b md:border-b-0 md:border-r border-[var(--lg-border)] relative p-4 flex items-center justify-center min-h-[160px]">
          {/* Mock Product Image */}
          <div className="w-4/5 h-4/5 bg-white rounded-lg shadow-sm border border-[var(--lg-border)] relative overflow-hidden flex flex-col items-center justify-center text-[var(--lg-muted)]">
            <PackageOpen className="w-12 h-12 mb-2 opacity-50 text-[var(--lg-navy)]" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Product Label</span>
            
            {/* Scanning Line overlay */}
            {(phase === 'scanning' || phase === 'extracting') && (
              <div className="absolute inset-0 z-10 pointer-events-none lg-scan-line">
                <div className="w-full h-1 bg-[var(--lg-green-accent)] shadow-[0_0_8px_rgba(99,153,34,0.8)]" />
                <div className="w-full h-24 bg-gradient-to-b from-[var(--lg-green-accent)]/20 to-transparent" />
              </div>
            )}
            
            {/* Bounding boxes appear when extracting/verified */}
            {visibleItems.has('mrp') && (
              <div className="absolute top-[20%] left-[15%] w-[40%] h-[15%] border-2 border-[var(--lg-green-accent)] bg-[var(--lg-green-accent)]/10 rounded lg-animate-word" />
            )}
            {visibleItems.has('net_qty') && (
              <div className="absolute top-[45%] left-[15%] w-[35%] h-[12%] border-2 border-[var(--lg-green-accent)] bg-[var(--lg-green-accent)]/10 rounded lg-animate-word" />
            )}
            {visibleItems.has('pack_date') && (
              <div className="absolute top-[65%] left-[55%] w-[30%] h-[12%] border-2 border-[var(--lg-green-accent)] bg-[var(--lg-green-accent)]/10 rounded lg-animate-word" />
            )}
          </div>
        </div>

        {/* Right Side: Extraction Results */}
        <div className="w-full md:w-7/12 p-4 flex flex-col bg-[var(--lg-surface)] overflow-y-auto">
          <p className="text-[10px] font-bold text-[var(--lg-muted)] tracking-widest uppercase mb-3">
            Extracted Declarations
          </p>
          
          <div className="space-y-2 flex-1">
            {EXTRACTED_ITEMS.map((item) => (
              <div 
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg border border-[var(--lg-border)] bg-[var(--lg-background)] transition-all duration-300",
                  visibleItems.has(item.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--lg-muted)] font-semibold uppercase">{item.label}</span>
                  <span className="text-xs font-bold text-[var(--lg-navy)] mt-0.5">{item.value}</span>
                </div>
                {phase === 'verified' ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--lg-green-accent)]" />
                ) : (
                  <ScanLine className="w-4 h-4 text-[var(--lg-orange)] animate-pulse" />
                )}
              </div>
            ))}
          </div>
          
          {phase === 'verified' && (
            <div className="mt-4 pt-3 border-t border-[var(--lg-border)] lg-fade-in-up">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--lg-muted)] tracking-widest uppercase">
                  Rule 6 Evaluation
                </span>
                <span className="text-[10px] font-bold bg-[var(--lg-green-light)] text-[var(--lg-green-accent)] px-2 py-0.5 rounded">
                  4/4 COMPLIANT
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Label Ledger UI Primitives — StatusPill & Badge
'use client';

import { cn, STATUS_CONFIG } from '../../lib/utils';
import type { InspectionStatus } from '../../lib/types';

// ── StatusPill ───────────────────────────────────────────────

interface StatusPillProps {
  status: InspectionStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusPill({ status, size = 'md', className }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        config.color,
        config.textColor,
        config.borderColor,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      {config.label}
    </span>
  );
}

// ── Badge ────────────────────────────────────────────────────

type BadgeColor = 'default' | 'indigo' | 'emerald' | 'red' | 'amber' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const badgeColors: Record<BadgeColor, string> = {
  default: 'bg-slate-800 text-slate-300 border-slate-600',
  indigo: 'bg-blue-100 text-blue-800 border-blue-200',
  emerald: 'bg-[var(--lg-green-light)] text-[var(--lg-green-accent)] border-[var(--lg-green-accent)]/20',
  red: 'bg-red-100 text-red-700 border-red-200',
  amber: 'bg-orange-100 text-[var(--lg-orange)] border-orange-200',
  slate: 'bg-slate-800/60 text-slate-400 border-slate-700',
};

export function Badge({ children, color = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        badgeColors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full',
        'bg-amber-500 text-[10px] font-bold text-black px-1',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Monospace clause codes tag (e.g. Rule 6(1)(a))
export function ClauseTag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium',
        'bg-indigo-950/40 text-indigo-300 border border-indigo-800/30',
        className,
      )}
    >
      {children}
    </span>
  );
}

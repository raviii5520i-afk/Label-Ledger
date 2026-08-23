// Label Ledger UI Primitives — Card, Spinner, Skeleton, EmptyState, ConfidenceBar
'use client';

import { cn, getConfidenceConfig, formatConfidence } from '../../lib/utils';
import type { ReactNode } from 'react';

// ── Card ─────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[#1A1D27] border border-[#2E3147] rounded-xl',
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-200', className)}>
      {children}
    </h3>
  );
}

// ── Spinner ───────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'border-2 border-[#2E3147] border-t-indigo-500 rounded-full animate-spin',
        spinnerSizes[size],
        className,
      )}
    />
  );
}

// ── Skeleton ──────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#232635] rounded',
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </Card>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-14 h-14 rounded-full bg-[#232635] border border-[#2E3147] flex items-center justify-center text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-xs mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 text-sm font-medium text-indigo-400 border border-indigo-600/40 rounded-lg hover:bg-indigo-900/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── ConfidenceBar ─────────────────────────────────────────────

interface ConfidenceBarProps {
  value: number; // 0–1
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBar({ value, showLabel = true, className }: ConfidenceBarProps) {
  const config = getConfidenceConfig(value);
  const pct = Math.round(value * 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-[#232635] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', config.color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-mono tabular-nums shrink-0', config.textColor)}>
          {formatConfidence(value)}
        </span>
      )}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[#2E3147]', className)} />;
}

// ── Section Label ────────────────────────────────────────────

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[10px] font-semibold uppercase tracking-widest text-slate-500', className)}>
      {children}
    </p>
  );
}

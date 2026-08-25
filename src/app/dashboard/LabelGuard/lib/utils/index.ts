// ============================================================
// Label Ledger — Utility Helpers
// ============================================================

import type { InspectionStatus, AuditAction } from '../types';

// ── cn() — Tailwind class merging ────────────────────────────

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Status → display config ──────────────────────────────────

export interface StatusConfig {
  label: string;
  color: string;         // Tailwind bg class
  textColor: string;     // Tailwind text class
  dotColor: string;      // Tailwind bg class for dot
  borderColor: string;
}

export const STATUS_CONFIG: Record<InspectionStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-slate-800',
    textColor: 'text-slate-300',
    dotColor: 'bg-slate-400',
    borderColor: 'border-slate-600',
  },
  pending_review: {
    label: 'Pending Review',
    color: 'bg-amber-900/40',
    textColor: 'text-amber-300',
    dotColor: 'bg-amber-400',
    borderColor: 'border-amber-600/50',
  },
  verified_compliant: {
    label: 'Compliant',
    color: 'bg-emerald-900/40',
    textColor: 'text-emerald-300',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-600/50',
  },
  verified_non_compliant: {
    label: 'Non-Compliant',
    color: 'bg-red-900/40',
    textColor: 'text-red-300',
    dotColor: 'bg-red-400',
    borderColor: 'border-red-600/50',
  },
};

// ── Confidence → display config ──────────────────────────────

export function getConfidenceConfig(value: number) {
  if (value >= 0.85) {
    return { label: 'High', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  } else if (value >= 0.60) {
    return { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' };
  } else {
    return { label: 'Low', color: 'bg-red-500', textColor: 'text-red-400' };
  }
}

// ── Audit action → human label ───────────────────────────────

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  created: 'Inspection created',
  submitted_for_review: 'Submitted for review',
  verified_compliant: 'Verified — Compliant',
  verified_non_compliant: 'Verified — Non-Compliant',
  field_corrected: 'Field manually corrected',
  overridden: 'Field overridden by officer',
  rejected: 'Rejected — returned to inspector',
};

// ── Date / Time formatters ───────────────────────────────────

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso);
}

// ── Confidence percentage format ─────────────────────────────

export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// ── Violation summary text ───────────────────────────────────

export function getViolationText(count: number): string {
  if (count === 0) return 'No violations';
  if (count === 1) return '1 violation';
  return `${count} violations`;
}

// ── Route permission helper ───────────────────────────────────

export function isRouteAllowed(role: string, href: string): boolean {
  if (role === 'admin') return true;
  if (role === 'inspector') {
    return href.includes('/scan') || href.includes('/repository') || href.includes('/dashboard');
  }
  if (role === 'manufacturer' || role === 'viewer') {
    return href.includes('/repository') || href.includes('/dashboard');
  }
  return true;
}

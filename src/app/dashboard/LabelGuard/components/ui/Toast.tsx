// Label Ledger — Toast Notification System
'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ── Types ──────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms — default 4000
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

// ── Context ────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Config ─────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconColor: string;
  titleColor: string;
}> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: 'bg-[#0F1117]',
    border: 'border-[var(--lg-green-accent)]/40',
    iconColor: 'text-[var(--lg-green-accent)]',
    titleColor: 'text-green-800',
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    bg: 'bg-[#0F1117]',
    border: 'border-red-300',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: 'bg-[#0F1117]',
    border: 'border-orange-300',
    iconColor: 'text-[var(--lg-orange)]',
    titleColor: 'text-orange-800',
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bg: 'bg-[#0F1117]',
    border: 'border-blue-300',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
  },
};

// ── Toast Item Component ────────────────────────────────────────

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = VARIANT_CONFIG[item.variant];
  const duration = item.duration ?? 4000;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Trigger entrance animation on next tick
    const enter = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(item.id), 300);
    }, duration);

    return () => {
      clearTimeout(enter);
      clearTimeout(timerRef.current);
    };
  }, [item.id, duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 w-80 px-4 py-3.5 rounded-xl border shadow-2xl shadow-black/50 transition-all duration-300',
        cfg.bg, cfg.border,
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-8',
      )}
    >
      <span className={cn('mt-0.5 shrink-0', cfg.iconColor)}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold leading-snug', cfg.titleColor)}>{item.title}</p>
        {item.description && (
          <p className="text-xs text-[var(--lg-muted)] mt-0.5 leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(item.id), 300);
        }}
        className="shrink-0 mt-0.5 text-slate-600 hover:text-slate-300 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...item, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard item={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

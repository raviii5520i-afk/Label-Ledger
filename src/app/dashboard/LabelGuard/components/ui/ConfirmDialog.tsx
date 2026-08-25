// Label Ledger — Confirm Dialog Component
'use client';

import { useEffect, useRef } from 'react';
import { Button, ButtonVariant } from './Button';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger' | 'success';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Trap focus
  useEffect(() => {
    if (!isOpen) return;

    const modal = overlayRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleTabTrap);

    // Initial focus on Cancel button for safety
    if (cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }

    return () => {
      modal.removeEventListener('keydown', handleTabTrap);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const btnVariant: ButtonVariant = {
    default: 'primary' as ButtonVariant,
    danger: 'danger' as ButtonVariant,
    success: 'success' as ButtonVariant,
  }[variant];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="w-full max-w-md bg-[#13172A] border border-[#2A3057] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2E3147]">
          <div className="flex items-center gap-2 text-slate-100">
            {variant === 'danger' && <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span id="confirm-dialog-title" className="text-sm font-bold uppercase tracking-wider">
              {title}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close dialog"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <p id="confirm-dialog-desc" className="text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#2E3147] bg-[#0C0E18]/40">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 h-9 rounded-lg text-sm font-medium border border-[#2E3147] bg-transparent hover:bg-[#1A1D27] text-slate-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {cancelLabel}
          </button>
          <Button
            variant={btnVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            size="md"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

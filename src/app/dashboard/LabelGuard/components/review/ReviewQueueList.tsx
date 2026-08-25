// Label Ledger — Review Queue List Component
'use client';

import { ChevronRight } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { StatusPill } from '../ui/Badge';
import { DbInspection } from '@/lib/supabase/inspections';

interface ReviewQueueListProps {
  queue: DbInspection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReviewQueueList({ queue, selectedId, onSelect }: ReviewQueueListProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest px-1">
        Pending Reviews ({queue.length})
      </p>
      <div className="space-y-2">
        {queue.map(item => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'p-4 rounded-xl border transition-all cursor-pointer',
                isSelected
                  ? 'bg-white border-[var(--lg-navy)] shadow-md ring-1 ring-[var(--lg-navy)]/30'
                  : 'bg-[#1A1D27] border-[#2E3147] hover:border-slate-600',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-[var(--lg-navy)] truncate">
                  {item.product_name || 'Untitled Inspection'}
                </p>
                <ChevronRight
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform',
                    isSelected ? 'text-[var(--lg-navy)] translate-x-0.5' : 'text-[var(--lg-muted)]',
                  )}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--lg-muted)]">
                <StatusPill status={item.status} size="sm" />
                <span>{formatDate(item.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

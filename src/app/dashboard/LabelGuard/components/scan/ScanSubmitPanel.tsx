'use client';

import Link from 'next/link';
import { CheckCircle2, XCircle, ScanLine, FolderOpen, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { Declaration } from '../../lib/types';

interface ScanSubmitPanelProps {
  productName: string;
  declarations: Declaration[];
  onScanAnother: () => void;
}

export function ScanSubmitPanel({ productName, declarations, onScanAnother }: ScanSubmitPanelProps) {
  const violations = declarations.filter(d => d.rule.mandatory && !d.found);
  const passed = declarations.filter(d => d.found);
  const isCompliant = violations.length === 0;

  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      {/* Stamp */}
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center border-4 ll-stamp-enter',
            isCompliant
              ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
              : 'bg-red-900/30 border-red-500 text-red-400',
          )}
        >
          {isCompliant ? (
            <CheckCircle2 className="w-12 h-12" strokeWidth={1.5} />
          ) : (
            <XCircle className="w-12 h-12" strokeWidth={1.5} />
          )}
        </div>

        <div>
          <h2 className={cn(
            'text-xl font-bold',
            isCompliant ? 'text-emerald-300' : 'text-red-300',
          )}>
            {isCompliant ? 'Submitted for Review' : 'Submitted — Violations Flagged'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {productName && <span className="font-medium text-slate-300">{productName}</span>}
            {' '}has been submitted. An enforcement officer will verify this inspection.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-[#1A1D27] border border-[#2E3147] rounded-2xl p-5 text-left space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Declarations passed</span>
          <span className="text-emerald-400 font-semibold">{passed.length}/{declarations.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Violations found</span>
          <span className={cn('font-semibold', violations.length > 0 ? 'text-red-400' : 'text-slate-400')}>
            {violations.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Status</span>
          <span className="text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        </div>

        {violations.length > 0 && (
          <div className="pt-3 border-t border-[#2E3147]">
            <p className="text-xs text-slate-500 mb-2">Flagged clauses:</p>
            <div className="flex flex-wrap gap-1.5">
              {violations.map(v => (
                <span key={v.id} className="px-2 py-0.5 bg-red-900/30 text-red-300 border border-red-600/30 rounded text-xs font-mono">
                  {v.rule.clause}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="secondary"
          onClick={onScanAnother}
          leftIcon={<ScanLine className="w-4 h-4" />}
        >
          Scan Another Label
        </Button>
        <Link href="/dashboard/LabelGuard/repository">
          <Button leftIcon={<FolderOpen className="w-4 h-4" />}>
            View Repository
          </Button>
        </Link>
      </div>
    </div>
  );
}

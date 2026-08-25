'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ScanLine, FolderOpen, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { Declaration } from '../../lib/types';

interface ScanSubmitPanelProps {
  productName: string;
  inspectionId: string;
  declarations: Declaration[];
  onScanAnother: () => void;
}

export function ScanSubmitPanel({ productName, inspectionId, declarations, onScanAnother }: ScanSubmitPanelProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const violations = declarations.filter(d => d.rule.mandatory && !d.found);
  const passed = declarations.filter(d => d.found);
  const isCompliant = violations.length === 0;
  const hasValidId = Boolean(inspectionId && inspectionId.trim().length > 0);

  const handleViewReport = () => {
    if (!hasValidId) {
      console.error('[Report Navigation] Error: inspectionId is missing or empty.');
      return;
    }
    console.log('[Report Navigation] inspectionId:', inspectionId);
    router.push(`/dashboard/LabelGuard/report/${inspectionId}`);
  };

  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      {/* Stamp */}
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center border-4 ll-stamp-enter',
            isCompliant
              ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
              : 'bg-red-900/30 border-red-500 text-red-700',
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
            isCompliant ? 'text-emerald-300' : 'text-red-700',
          )}>
            {isCompliant ? t('scan.submitPanel.submittedReview') : t('scan.submitPanel.submittedViolations')}
          </h2>
          <p className="text-sm text-[var(--lg-muted)] mt-1">
            {productName && <span className="font-medium text-[var(--lg-navy)]">{productName}</span>}
            {' '}{t('scan.submitPanel.subtext')}
          </p>
          {hasValidId ? (
            <p className="text-[11px] text-[var(--lg-muted)] mt-2 font-mono">ID: {inspectionId.slice(0, 12)}…</p>
          ) : (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-700 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('scan.submitPanel.idUnavailable')}
            </div>
          )}
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white border border-[var(--lg-border)] rounded-2xl p-5 text-left space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--lg-muted)]">{t('scan.submitPanel.declarationsPassed')}</span>
          <span className="text-emerald-400 font-semibold">{passed.length}/{declarations.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--lg-muted)]">{t('scan.submitPanel.violationsFound')}</span>
          <span className={cn('font-semibold', violations.length > 0 ? 'text-red-700' : 'text-[var(--lg-muted)]')}>
            {violations.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--lg-muted)]">{t('scan.submitPanel.status')}</span>
          <span className="text-amber-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {t('scan.submitPanel.pendingReview')}
          </span>
        </div>

        {violations.length > 0 && (
          <div className="pt-3 border-t border-[var(--lg-border)]">
            <p className="text-xs text-[var(--lg-muted)] mb-2">{t('scan.submitPanel.flaggedClauses')}:</p>
            <div className="flex flex-wrap gap-1.5">
              {violations.map(v => (
                <span key={v.id} className="px-2 py-0.5 bg-red-900/30 text-red-700 border border-red-300 rounded text-xs font-mono">
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
          {t('scan.submitPanel.scanAnother')}
        </Button>

        <Button
          onClick={handleViewReport}
          disabled={!hasValidId}
          leftIcon={<FolderOpen className="w-4 h-4" />}
        >
          {t('scan.submitPanel.viewReport')}
        </Button>
      </div>

      {/* What happens next */}
      <div className="bg-white border border-[var(--lg-border)] rounded-xl p-4 text-left">
        <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest mb-2">What happens next?</p>
        <ol className="space-y-1.5 text-[12px] text-[var(--lg-muted)] list-decimal list-inside">
          <li>Your inspection is queued for officer review</li>
          <li>An authorized enforcement officer will verify declarations</li>
          <li>You will be able to view the final verdict in the Repository</li>
        </ol>
      </div>
    </div>
  );
}

// Label Ledger — Report View Component (Live Supabase Integrated)
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, ArrowLeft, Download,
  Globe2, Calendar, User2, Shield, AlertTriangle, ShieldAlert,
  Clock, Loader2, Package, Tag, Building2, Layers, RotateCcw, FileText
} from 'lucide-react';
import { cn, formatDate, formatDateTime } from '../../lib/utils';
import { StatusPill } from '../ui/Badge';
import { Card, ConfidenceBar } from '../ui/Card';
import { SignedImage } from '../ui/SignedImage';
import { Button } from '../ui/Button';
import { getInspectionWithDetails, FullInspectionDetails } from '@/lib/supabase/inspections';

interface ReportViewProps {
  inspectionId: string;
}

export function ReportView({ inspectionId }: ReportViewProps) {
  const [details, setDetails] = useState<FullInspectionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(() => {
    if (!inspectionId || inspectionId.trim().length === 0) {
      console.error('[Report] Error: inspectionId is missing or empty.');
      setError('Inspection ID unavailable.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('[Report] Route ID:', inspectionId);

    getInspectionWithDetails(inspectionId).then((res) => {
      if (res.error) {
        console.error('[Report] Supabase query error:', res.error);
        setError(res.error);
        setDetails(null);
      } else if (res.data) {
        console.log('[Report] Supabase query result:', res.data);
        console.log('[Report] Inspection found:', res.data.inspection);
        console.log('[Report] Evidence count:', (res.data.label_evidence || []).length);
        console.log('[Report] Items count:', (res.data.inspection_items || []).length);
        console.log('[Report] Rule checks count:', (res.data.rule_checks || []).length);
        console.log('[Report] Verification logs count:', (res.data.verification_logs || []).length);
        setDetails(res.data);
      } else {
        setDetails(null);
      }
      setLoading(false);
    });
  }, [inspectionId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const insp = details?.inspection;
  const evidence = details?.label_evidence || [];
  const items = details?.inspection_items || [];
  const checks = details?.rule_checks || [];
  const logs = details?.verification_logs || [];

  const isVerified = insp?.status === 'verified_compliant' || insp?.status === 'verified_non_compliant';
  const isCompliant = insp?.status === 'verified_compliant';
  const violations = useMemo(() => items.filter(item => !item.found), [items]);
  const passed = useMemo(() => items.filter(item => item.found), [items]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--lg-muted)] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--lg-blue)]" />
        <p className="text-sm font-medium text-[var(--lg-navy)]">Loading inspection report...</p>
      </div>
    );
  }

  // Error / RLS / Not Found State
  if (error || !insp) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[var(--lg-border)] rounded-2xl p-8 max-w-md mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-900/30 border border-amber-600/40 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--lg-navy)]">Inspection Not Found or Access Restricted</h3>
          <p className="text-xs text-[var(--lg-muted)] mt-2 leading-relaxed">
            {error || 'You do not have permission to view this inspection report under active security policies, or the inspection ID is invalid.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <Button variant="secondary" onClick={fetchDetails} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
          <Link
            href="/dashboard/LabelGuard/repository"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--lg-blue)] bg-indigo-900/30 hover:bg-[var(--lg-blue)]/20 border border-indigo-500/40 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Repository
          </Link>
        </div>
      </div>
    );
  }

  // Success State — Render Full Report
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Navigation & Export header */}
      <div className="flex items-center justify-between gap-4 no-print">
        <Link
          href="/dashboard/LabelGuard/repository"
          className="flex items-center gap-1.5 text-sm text-[var(--lg-muted)] hover:text-[var(--lg-navy)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--lg-navy)] border border-[var(--lg-border)] rounded-lg hover:bg-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[var(--lg-muted)]" />
            Export PDF / Print
          </button>
        </div>
      </div>

      {/* Status Banner Stamp for ALL inspection statuses */}
      <div className={cn(
        'border rounded-2xl p-5 flex items-center gap-5',
        insp.status === 'verified_compliant'
          ? 'bg-emerald-900/15 border-emerald-600/30'
          : insp.status === 'verified_non_compliant'
          ? 'bg-red-900/15 border-red-300'
          : insp.status === 'pending_review'
          ? 'bg-amber-900/15 border-amber-300'
          : 'bg-white border-[var(--lg-border)]',
      )}>
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 ll-stamp-enter',
          insp.status === 'verified_compliant'
            ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
            : insp.status === 'verified_non_compliant'
            ? 'bg-red-900/30 border-red-500 text-red-700'
            : 'bg-amber-900/30 border-amber-500 text-amber-700',
        )}>
          {insp.status === 'verified_compliant' ? (
            <CheckCircle2 className="w-7 h-7" strokeWidth={1.5} />
          ) : insp.status === 'verified_non_compliant' ? (
            <XCircle className="w-7 h-7" strokeWidth={1.5} />
          ) : (
            <Clock className="w-7 h-7" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-base font-bold uppercase tracking-wide',
            insp.status === 'verified_compliant' ? 'text-emerald-300' :
            insp.status === 'verified_non_compliant' ? 'text-red-700' : 'text-amber-700'
          )}>
            {insp.status === 'verified_compliant' ? 'Verified Compliant' :
             insp.status === 'verified_non_compliant' ? 'Verified Non-Compliant' :
             insp.status === 'pending_review' ? 'Submitted for Review · Pending Officer Verification' : 'Draft Inspection'}
          </p>
          <p className="text-xs text-[var(--lg-muted)] mt-0.5">
            {passed.length}/{items.length} declarations recorded
            {violations.length > 0 && ` · ${violations.length} violation${violations.length > 1 ? 's' : ''} flagged`}
          </p>
          <p className="text-[11px] text-[var(--lg-muted)] mt-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--lg-muted)]" />
            Inspection ID: <span className="font-mono text-[var(--lg-navy)]">{insp.id}</span>
          </p>
        </div>
        <StatusPill status={insp.status} />
      </div>

      {/* Product Information Card */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--lg-border)]">
          <h3 className="text-sm font-semibold text-[var(--lg-navy)]">Product Information</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
          <InfoField icon={<Package className="w-3.5 h-3.5" />} label="Product Name" value={insp.product_name || '—'} />
          <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="Brand" value={insp.brand_name || '—'} />
          <InfoField icon={<Layers className="w-3.5 h-3.5" />} label="Declared Quantity" value={insp.declared_quantity ? `${insp.declared_quantity} ${insp.unit || ''}` : '—'} />
          <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="MRP" value={insp.mrp ? `${insp.currency || '₹'} ${insp.mrp}` : '—'} />
          <InfoField icon={<Building2 className="w-3.5 h-3.5" />} label="Manufacturer" value={insp.manufacturer_name || '—'} />
          <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="Batch Number" value={insp.batch_number || '—'} />
          <InfoField icon={<Calendar className="w-3.5 h-3.5" />} label="Created Date" value={formatDate(insp.created_at)} />
          <InfoField icon={<User2 className="w-3.5 h-3.5" />} label="Status" value={insp.status.replace('_', ' ').toUpperCase()} />
        </div>
      </Card>

      {/* Evidence Image & Flagged Violations Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Label Evidence Image (Private Storage Architecture) */}
        <Card padding="none">
          <div className="px-5 py-3 border-b border-[var(--lg-border)]">
            <h3 className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest">Label Evidence Image</h3>
          </div>
          <div className="p-4 flex items-center justify-center">
            {evidence.length > 0 && evidence[0].storage_path ? (
              <SignedImage
                storagePath={evidence[0].storage_path}
                alt={`Evidence: ${insp.product_name || 'label'}`}
                className="w-full max-h-72 object-contain rounded-lg border border-[var(--lg-border)]"
              />
            ) : (
              <div className="p-8 text-center text-xs text-[var(--lg-muted)]">
                Evidence preview unavailable
              </div>
            )}
          </div>
        </Card>

        {/* Flagged Violations Panel */}
        <Card padding="none">
          <div className="px-5 py-3 border-b border-[var(--lg-border)]">
            <h3 className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest">Flagged Violations</h3>
          </div>
          {violations.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-80" />
              No Rule 6 violations detected. All mandatory declarations found.
            </div>
          ) : (
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto divide-y divide-[var(--lg-border)]">
              {violations.map(v => (
                <div key={v.id} className="pt-2 first:pt-0">
                  <p className="text-xs font-mono text-[var(--lg-blue)]">{v.clause}</p>
                  <p className="text-sm font-medium text-[var(--lg-navy)] mt-0.5">{v.label}</p>
                  <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Declaration not detected on label
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Declaration Checklist */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--lg-border)]">
          <h3 className="text-sm font-semibold text-[var(--lg-navy)]">Declaration Checklist</h3>
          <p className="text-xs text-[var(--lg-muted)] mt-0.5">Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6</p>
        </div>
        <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-3 px-5 py-2.5 bg-[var(--lg-background)]/60 border-b border-[var(--lg-border)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lg-muted)]">Declaration</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lg-muted)]">Extracted Value</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lg-muted)]">Confidence</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lg-muted)] w-8 text-center">✓</span>
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-center text-[var(--lg-muted)] text-xs">No declaration items recorded for this inspection.</div>
        ) : (
          <div className="divide-y divide-[var(--lg-border)]">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-3 items-start px-5 py-3 ll-table-row">
                <div>
                  <span className="text-[10px] font-mono text-[var(--lg-blue)]">{item.clause}</span>
                  <p className="text-xs font-medium text-[var(--lg-navy)] mt-0.5">{item.label}</p>
                  {item.manually_corrected && (
                    <span className="text-[9px] text-amber-700 border border-amber-300 rounded px-1 mt-0.5 inline-block">
                      manually corrected
                    </span>
                  )}
                </div>
                <div>
                  {item.extracted_value ? (
                    <span className="text-xs text-[var(--lg-navy)] font-mono">{item.extracted_value}</span>
                  ) : (
                    <span className="text-xs text-[var(--lg-muted)] italic">Not detected</span>
                  )}
                </div>
                <div>
                  {item.found && item.confidence ? (
                    <ConfidenceBar value={item.confidence} />
                  ) : (
                    <span className="text-[11px] text-[var(--lg-muted)]">—</span>
                  )}
                </div>
                <div className="w-8 flex justify-center pt-0.5 shrink-0">
                  {item.found ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-700" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rule Checks (Evaluation Results) */}
      {checks.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[var(--lg-border)]">
            <h3 className="text-sm font-semibold text-[var(--lg-navy)]">Rule Evaluation Details</h3>
            <p className="text-xs text-[var(--lg-muted)] mt-0.5">Rule 6 compliance evaluation checks</p>
          </div>
          <div className="divide-y divide-[var(--lg-border)]">
            {checks.map(check => (
              <div key={check.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--lg-blue)]">{check.clause}</span>
                    <span className="text-xs font-medium text-[var(--lg-navy)]">{check.label}</span>
                  </div>
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded font-mono font-semibold',
                    check.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'bg-red-950 text-red-700 border border-red-800/50'
                  )}>
                    {check.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {check.notes && (
                  <p className="text-xs text-[var(--lg-muted)]">{check.notes}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Verification Audit Trail */}
      {logs.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[var(--lg-border)]">
            <h3 className="text-sm font-semibold text-[var(--lg-navy)]">Verification Audit Trail</h3>
            <p className="text-xs text-[var(--lg-muted)] mt-0.5">Immutable historical record of verification log actions</p>
          </div>
          <div className="px-5 py-4">
            <div className="relative space-y-0">
              {logs.map((entry, i) => (
                <div key={entry.id} className="flex gap-4 pb-6 relative">
                  {i < logs.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[var(--lg-border)]" />
                  )}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border',
                    getAuditDotStyle(entry.action),
                  )}>
                    {getAuditIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--lg-navy)] capitalize">
                        {entry.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-[var(--lg-muted)] shrink-0">{formatDateTime(entry.created_at)}</p>
                    </div>
                    {entry.officer_id && (
                      <p className="text-xs text-[var(--lg-muted)] mt-0.5">
                        Officer ID: <span className="font-mono text-[var(--lg-muted)]">{entry.officer_id.slice(0, 8)}…</span>
                      </p>
                    )}
                    {entry.previous_status && entry.new_status && (
                      <p className="text-[11px] text-[var(--lg-muted)] mt-0.5">
                        Status: <span className="font-mono text-[var(--lg-muted)]">{entry.previous_status}</span> → <span className="font-mono text-[var(--lg-blue)]">{entry.new_status}</span>
                      </p>
                    )}
                    {entry.comment && (
                      <p className="text-xs text-[var(--lg-muted)] mt-1.5 bg-[var(--lg-background)] rounded-lg px-3 py-2 border border-[var(--lg-border)] italic">
                        &quot;{entry.comment}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-[var(--lg-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-[var(--lg-navy)] flex items-center gap-1.5">
        <span className="text-[var(--lg-muted)] shrink-0">{icon}</span>
        {value}
      </p>
    </div>
  );
}

function getAuditDotStyle(action: string): string {
  if (action === 'verified_compliant') return 'bg-emerald-900/40 border-emerald-600/50 text-emerald-400';
  if (action === 'verified_non_compliant') return 'bg-red-900/40 border-red-600/50 text-red-700';
  if (action === 'rejected') return 'bg-red-900/40 border-red-600/50 text-red-700';
  return 'bg-[var(--lg-background)] border-[var(--lg-border)] text-[var(--lg-muted)]';
}

function getAuditIcon(action: string) {
  const cls = 'w-3 h-3';
  if (action === 'verified_compliant') return <CheckCircle2 className={cls} />;
  if (action === 'verified_non_compliant') return <XCircle className={cls} />;
  if (action === 'rejected') return <XCircle className={cls} />;
  return <Clock className={cls} />;
}

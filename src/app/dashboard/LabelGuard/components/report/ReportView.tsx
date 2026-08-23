// Label Ledger — Report View Component (Live Supabase Integrated)
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, ArrowLeft, Download, FileSpreadsheet,
  Globe2, Calendar, User2, Shield, AlertTriangle, ShieldAlert,
  Clock, ChevronRight, Loader2, Package, Tag, Building2, Layers,
} from 'lucide-react';
import { cn, formatDate, formatDateTime, getConfidenceConfig } from '../../lib/utils';
import { StatusPill } from '../ui/Badge';
import { Card, ConfidenceBar } from '../ui/Card';
import { BoundingBoxOverlay } from '../scan/BoundingBoxOverlay';
import { getInspectionWithDetails, FullInspectionDetails } from '@/lib/supabase/inspections';

interface ReportViewProps {
  inspectionId: string;
}

export function ReportView({ inspectionId }: ReportViewProps) {
  const [details, setDetails] = useState<FullInspectionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getInspectionWithDetails(inspectionId).then((res) => {
      if (!isMounted) return;
      if (res.error) {
        console.warn('[ReportView] getInspectionWithDetails error:', res.error);
        setError(res.error);
        setDetails(null);
      } else if (res.data) {
        setDetails(res.data);
      } else {
        setDetails(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [inspectionId]);

  const insp = details?.inspection;
  const evidence = details?.label_evidence || [];
  const items = details?.inspection_items || [];
  const logs = details?.verification_logs || [];

  const isCompliant = insp?.status === 'verified_compliant';
  const isVerified = insp?.status === 'verified_compliant' || insp?.status === 'verified_non_compliant';
  const violations = useMemo(() => items.filter(item => !item.found), [items]);
  const passed = useMemo(() => items.filter(item => item.found), [items]);

  // Bounding boxes for evidence image annotations
  const bboxes = useMemo(() => {
    return items
      .filter(item => item.bbox && item.found)
      .map(item => ({
        id: item.id,
        bbox: item.bbox,
        label: item.label,
        confidence: item.confidence ?? 0.85,
      }));
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-slate-300">Loading inspection report from database…</p>
      </div>
    );
  }

  if (error || !insp) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-[#1A1D27] border border-[#2E3147] rounded-2xl p-8 max-w-md mx-auto my-12 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-amber-900/30 border border-amber-600/40 flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-base font-bold text-slate-100">Inspection Not Found or Access Restricted</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {error || 'You do not have permission to view this inspection report under active security policies, or the inspection ID is invalid.'}
        </p>
        <Link
          href="/dashboard/LabelGuard/repository"
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/40 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Repository
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back + export header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/LabelGuard/repository"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 border border-[#2E3147] rounded-lg hover:bg-[#1A1D27] transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 border border-[#2E3147] rounded-lg hover:bg-[#1A1D27] transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Compliance Stamp */}
      {isVerified && (
        <div className={cn(
          'border rounded-2xl p-5 flex items-center gap-5',
          isCompliant
            ? 'bg-emerald-900/15 border-emerald-600/30'
            : 'bg-red-900/15 border-red-600/30',
        )}>
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center border-3 shrink-0 ll-stamp-enter',
            isCompliant
              ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
              : 'bg-red-900/30 border-red-500 text-red-400',
          )}>
            {isCompliant
              ? <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
              : <XCircle className="w-8 h-8" strokeWidth={1.5} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-lg font-bold', isCompliant ? 'text-emerald-300' : 'text-red-300')}>
              {isCompliant ? 'VERIFIED COMPLIANT' : 'VERIFIED NON-COMPLIANT'}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              {passed.length}/{items.length} declarations verified
              {violations.length > 0 && ` · ${violations.length} violation${violations.length > 1 ? 's' : ''}`}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Inspection ID: <span className="font-mono text-slate-300">{insp.id}</span>
            </p>
          </div>
          <StatusPill status={insp.status} />
        </div>
      )}

      {/* Product Information */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[#2E3147]">
          <h3 className="text-sm font-semibold text-slate-200">Product Information</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
          <InfoField icon={<Package className="w-3.5 h-3.5" />} label="Product Name" value={insp.product_name || '—'} />
          <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="Brand" value={insp.brand_name || '—'} />
          <InfoField icon={<Layers className="w-3.5 h-3.5" />} label="Quantity" value={insp.declared_quantity ? `${insp.declared_quantity} ${insp.unit || ''}` : '—'} />
          <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="MRP" value={insp.mrp ? `${insp.currency || '₹'} ${insp.mrp}` : '—'} />
          <InfoField icon={<Building2 className="w-3.5 h-3.5" />} label="Manufacturer" value={insp.manufacturer_name || '—'} />
          <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="Batch Number" value={insp.batch_number || '—'} />
          <InfoField icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={formatDate(insp.created_at)} />
          <InfoField icon={<User2 className="w-3.5 h-3.5" />} label="Status" value={insp.status.replace('_', ' ').toUpperCase()} />
        </div>
      </Card>

      {/* Evidence Image & Violations split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Label Evidence Image */}
        {evidence.length > 0 && (
          <Card padding="none">
            <div className="px-5 py-3 border-b border-[#2E3147]">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Label Evidence Image</h3>
            </div>
            <div className="p-4 flex items-center justify-center">
              <BoundingBoxOverlay
                imageUrl={evidence[0].storage_path}
                imageNaturalSize={{ width: 1, height: 1 }}
                boxes={bboxes}
              />
            </div>
          </Card>
        )}

        {/* Violations Panel */}
        {violations.length > 0 && (
          <Card padding="none">
            <div className="px-5 py-3 border-b border-[#2E3147]">
              <h3 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                {violations.length} Violation{violations.length > 1 ? 's' : ''} Detected
              </h3>
            </div>
            <div className="divide-y divide-[#2E3147]">
              {violations.map(v => (
                <div key={v.id} className="px-5 py-3">
                  <p className="text-xs font-mono text-indigo-400">{v.clause}</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{v.label}</p>
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Declaration not detected on label
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Declaration Checklist */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[#2E3147]">
          <h3 className="text-sm font-semibold text-slate-200">Declaration Checklist</h3>
          <p className="text-xs text-slate-500 mt-0.5">Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6</p>
        </div>
        {/* Header */}
        <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-3 px-5 py-2.5 bg-[#232635]/60 border-b border-[#2E3147]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Declaration</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Extracted Value</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Confidence</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 w-8 text-center">✓</span>
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">No declaration items recorded for this inspection.</div>
        ) : (
          <div className="divide-y divide-[#2E3147]">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-3 items-start px-5 py-3 ll-table-row">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400">{item.clause}</span>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">{item.label}</p>
                  {item.manually_corrected && (
                    <span className="text-[9px] text-amber-400 border border-amber-600/30 rounded px-1 mt-0.5 inline-block">
                      manually corrected
                    </span>
                  )}
                </div>
                <div>
                  {item.extracted_value ? (
                    <span className="text-xs text-slate-300 font-mono">{item.extracted_value}</span>
                  ) : (
                    <span className="text-xs text-slate-600 italic">Not detected</span>
                  )}
                </div>
                <div>
                  {item.found && item.confidence ? (
                    <ConfidenceBar value={item.confidence} />
                  ) : (
                    <span className="text-[11px] text-slate-600">—</span>
                  )}
                </div>
                <div className="w-8 flex justify-center pt-0.5 shrink-0">
                  {item.found ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Verification Audit Trail */}
      {logs.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[#2E3147]">
            <h3 className="text-sm font-semibold text-slate-200">Verification Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">Immutable historical record of verification log actions</p>
          </div>
          <div className="px-5 py-4">
            <div className="relative space-y-0">
              {logs.map((entry, i) => (
                <div key={entry.id} className="flex gap-4 pb-6 relative">
                  {/* Timeline line */}
                  {i < logs.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[#2E3147]" />
                  )}
                  {/* Dot */}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border',
                    getAuditDotStyle(entry.action),
                  )}>
                    {getAuditIcon(entry.action)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200 capitalize">
                        {entry.action.replace('_', ' ')}
                      </p>
                      <p className="text-[11px] text-slate-500 shrink-0">{formatDateTime(entry.created_at)}</p>
                    </div>
                    {entry.officer_id && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Officer ID: <span className="font-mono text-slate-400">{entry.officer_id.slice(0, 8)}…</span>
                      </p>
                    )}
                    {entry.previous_status && entry.new_status && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Status: <span className="font-mono text-slate-400">{entry.previous_status}</span> → <span className="font-mono text-indigo-400">{entry.new_status}</span>
                      </p>
                    )}
                    {entry.comment && (
                      <p className="text-xs text-slate-400 mt-1.5 bg-[#232635] rounded-lg px-3 py-2 border border-[#2E3147] italic">
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
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
        <span className="text-slate-500 shrink-0">{icon}</span>
        {value}
      </p>
    </div>
  );
}

function getAuditDotStyle(action: string): string {
  if (action === 'verified_compliant') return 'bg-emerald-900/40 border-emerald-600/50 text-emerald-400';
  if (action === 'verified_non_compliant') return 'bg-red-900/40 border-red-600/50 text-red-400';
  if (action === 'rejected') return 'bg-red-900/40 border-red-600/50 text-red-400';
  return 'bg-[#232635] border-[#2E3147] text-slate-500';
}

function getAuditIcon(action: string) {
  const cls = 'w-3 h-3';
  if (action === 'verified_compliant') return <CheckCircle2 className={cls} />;
  if (action === 'verified_non_compliant') return <XCircle className={cls} />;
  if (action === 'rejected') return <XCircle className={cls} />;
  return <Clock className={cls} />;
}

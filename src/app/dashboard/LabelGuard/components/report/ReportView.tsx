'use client';

import Link from 'next/link';
import {
  CheckCircle2, XCircle, ArrowLeft, Download, FileSpreadsheet,
  Globe2, Calendar, User2, Shield, AlertTriangle,
  Clock, ChevronRight,
} from 'lucide-react';
import { cn, formatDate, formatDateTime, AUDIT_ACTION_LABELS, getConfidenceConfig, formatConfidence } from '../../lib/utils';
import { StatusPill } from '../ui/Badge';
import { Card, ConfidenceBar } from '../ui/Card';
import { BoundingBoxOverlay } from '../scan/BoundingBoxOverlay';
import type { InspectionFull } from '../../lib/types';

interface ReportViewProps {
  inspection: InspectionFull;
}

export function ReportView({ inspection: insp }: ReportViewProps) {
  const isCompliant = insp.status === 'verified_compliant';
  const isVerified = insp.status === 'verified_compliant' || insp.status === 'verified_non_compliant';
  const violations = insp.declarations.filter(d => d.rule.mandatory && !d.found);
  const passed = insp.declarations.filter(d => d.found);

  // Bounding boxes for image overlay
  const bboxes = insp.declarations
    .filter(d => d.bbox && d.found)
    .map(d => ({
      id: d.id,
      bbox: d.bbox!,
      label: d.rule.label,
      confidence: d.confidence,
    }));

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back + export header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/LabelGuard/repository"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
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
              {passed.length}/{insp.declarations.length} declarations found
              {violations.length > 0 && ` · ${violations.length} violation${violations.length > 1 ? 's' : ''}`}
            </p>
            {insp.verified_by && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Verified by {insp.verified_by.full_name}
                {insp.verified_at && ` on ${formatDateTime(insp.verified_at)}`}
              </p>
            )}
          </div>
          <StatusPill status={insp.status} />
        </div>
      )}

      {/* Product Info */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[#2E3147]">
          <h3 className="text-sm font-semibold text-slate-200">Product Information</h3>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoField icon={<Package />} label="Product" value={insp.product_name} />
          <InfoField
            icon={<Globe2 />}
            label="Origin"
            value={insp.is_imported ? 'Imported' : 'Domestic'}
          />
          <InfoField icon={<User2 />} label="Inspector" value={insp.inspector.full_name} />
          <InfoField icon={<Calendar />} label="Inspected" value={formatDate(insp.created_at)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evidence image */}
        {insp.evidence_images.length > 0 && (
          <Card padding="none">
            <div className="px-5 py-3 border-b border-[#2E3147]">
              <h3 className="text-sm font-semibold text-slate-200">Label Evidence</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hover to see extracted field regions</p>
            </div>
            <div className="overflow-hidden rounded-b-xl">
              <BoundingBoxOverlay
                imageUrl={insp.evidence_images[0].storage_path}
                imageNaturalSize={{ width: 1, height: 1 }}
                boxes={bboxes}
              />
            </div>
          </Card>
        )}

        {/* Violations panel */}
        {violations.length > 0 && (
          <Card padding="none">
            <div className="px-5 py-3 border-b border-[#2E3147]">
              <h3 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {violations.length} Violation{violations.length > 1 ? 's' : ''} Detected
              </h3>
            </div>
            <div className="divide-y divide-[#2E3147]">
              {violations.map(v => (
                <div key={v.id} className="px-5 py-3">
                  <p className="text-xs font-mono text-indigo-400">{v.rule.clause}</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{v.rule.label}</p>
                  {v.rule.is_conditional && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{v.rule.condition_note}</p>
                  )}
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Declaration not found on label
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Full Declaration Checklist */}
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
        <div className="divide-y divide-[#2E3147]">
          {insp.declarations.map(decl => {
            const conf = getConfidenceConfig(decl.confidence);
            return (
              <div key={decl.id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-3 items-start px-5 py-3 ll-table-row">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400">{decl.rule.clause}</span>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">{decl.rule.label}</p>
                  {decl.manually_corrected && (
                    <span className="text-[9px] text-amber-400 border border-amber-600/30 rounded px-1 mt-0.5 inline-block">
                      manually corrected
                    </span>
                  )}
                </div>
                <div>
                  {decl.extracted_value ? (
                    <span className="text-xs text-slate-300 font-mono">{decl.extracted_value}</span>
                  ) : (
                    <span className="text-xs text-slate-600 italic">Not detected</span>
                  )}
                </div>
                <div>
                  {decl.found ? (
                    <ConfidenceBar value={decl.confidence} />
                  ) : (
                    <span className="text-[11px] text-slate-600">—</span>
                  )}
                </div>
                <div className="w-8 flex justify-center pt-0.5 shrink-0">
                  {decl.found ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : decl.rule.mandatory ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Audit Trail */}
      {insp.audit_log.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[#2E3147]">
            <h3 className="text-sm font-semibold text-slate-200">Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">Complete history of actions taken on this inspection</p>
          </div>
          <div className="px-5 py-4">
            <div className="relative space-y-0">
              {insp.audit_log.map((entry, i) => (
                <div key={entry.id} className="flex gap-4 pb-6 relative">
                  {/* Timeline line */}
                  {i < insp.audit_log.length - 1 && (
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
                      <p className="text-sm font-medium text-slate-200">
                        {AUDIT_ACTION_LABELS[entry.action]}
                      </p>
                      <p className="text-[11px] text-slate-500 shrink-0">{formatDateTime(entry.created_at)}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      by <span className="text-slate-400">{entry.actor.full_name}</span>
                      {' '}({entry.actor.role})
                    </p>
                    {entry.note && (
                      <p className="text-xs text-slate-400 mt-1.5 bg-[#232635] rounded-lg px-3 py-2 border border-[#2E3147] italic">
                        &quot;{entry.note}&quot;
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

function Package({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3.5 h-3.5', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function getAuditDotStyle(action: string): string {
  if (action === 'verified_compliant') return 'bg-emerald-900/40 border-emerald-600/50 text-emerald-400';
  if (action === 'verified_non_compliant') return 'bg-red-900/40 border-red-600/50 text-red-400';
  if (action === 'submitted_for_review') return 'bg-amber-900/40 border-amber-600/50 text-amber-400';
  if (action === 'field_corrected' || action === 'overridden') return 'bg-indigo-900/40 border-indigo-600/50 text-indigo-400';
  return 'bg-[#232635] border-[#2E3147] text-slate-500';
}

function getAuditIcon(action: string) {
  const cls = 'w-3 h-3';
  if (action === 'verified_compliant') return <CheckCircle2 className={cls} />;
  if (action === 'verified_non_compliant') return <XCircle className={cls} />;
  if (action === 'submitted_for_review') return <ChevronRight className={cls} />;
  return <Clock className={cls} />;
}

'use client';

import { useState } from 'react';
import {
  Clock, CheckCircle2, XCircle, Edit3, AlertTriangle,
  ChevronRight, X, Check, Loader2, AlertCircle, Shield,
} from 'lucide-react';
import { cn, formatDate, formatDateTime, getConfidenceConfig } from '../../lib/utils';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/Badge';
import { ConfidenceBar, Card } from '../ui/Card';
import { BoundingBoxOverlay } from '../scan/BoundingBoxOverlay';
import { MOCK_INSPECTIONS, MOCK_INSPECTION_FULL } from '../../lib/mock/data';
import type { InspectionFull, Declaration } from '../../lib/types';

export function ReviewQueueView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());

  const queue = MOCK_INSPECTIONS.filter(
    i => i.status === 'pending_review' && !verifiedIds.has(i.id),
  );

  const selected = selectedId ? MOCK_INSPECTION_FULL[selectedId] : null;

  function handleVerified(id: string) {
    setVerifiedIds(prev => new Set([...prev, id]));
    setSelectedId(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100">Review Queue</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {queue.length} inspection{queue.length !== 1 ? 's' : ''} awaiting officer verification
        </p>
      </div>

      {queue.length === 0 && !selectedId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-600/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-base font-semibold text-slate-200">All caught up!</p>
          <p className="text-sm text-slate-500 mt-1">No inspections pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Queue list */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-1">
              Pending ({queue.length})
            </p>
            <div className="space-y-2">
              {queue.map(insp => (
                <QueueItem
                  key={insp.id}
                  inspection={insp}
                  isSelected={selectedId === insp.id}
                  onSelect={() => setSelectedId(insp.id)}
                />
              ))}
            </div>
            {verifiedIds.size > 0 && (
              <p className="text-[11px] text-slate-500 text-center py-2">
                {verifiedIds.size} verified in this session
              </p>
            )}
          </div>

          {/* Review panel */}
          <div>
            {selected ? (
              <SideBySideReview
                inspection={selected}
                onVerified={() => handleVerified(selected.id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center bg-[#1A1D27] border border-[#2E3147] rounded-xl">
                <Shield className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">Select an inspection to review</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Queue Item ────────────────────────────────────────────────

function QueueItem({
  inspection: insp,
  isSelected,
  onSelect,
}: {
  inspection: (typeof MOCK_INSPECTIONS)[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const lowConfCount = MOCK_INSPECTION_FULL[insp.id]?.declarations
    .filter(d => d.found && d.confidence < 0.60).length ?? 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3.5 rounded-xl border transition-all duration-150',
        isSelected
          ? 'bg-indigo-900/20 border-indigo-600/40 ring-1 ring-indigo-500/30'
          : 'bg-[#1A1D27] border-[#2E3147] hover:border-slate-600',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{insp.product_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{insp.inspector.full_name}</p>
        </div>
        <ChevronRight className={cn(
          'w-4 h-4 shrink-0 mt-0.5 transition-transform',
          isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600',
        )} />
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className="text-[10px] text-slate-500">{formatDate(insp.created_at)}</span>
        {insp.violation_count > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-red-400">
            <AlertTriangle className="w-2.5 h-2.5" />
            {insp.violation_count} violation{insp.violation_count > 1 ? 's' : ''}
          </span>
        )}
        {lowConfCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400">
            <AlertCircle className="w-2.5 h-2.5" />
            {lowConfCount} low confidence
          </span>
        )}
      </div>
    </button>
  );
}

// ── Side-By-Side Review ──────────────────────────────────────

function SideBySideReview({
  inspection: insp,
  onVerified,
}: {
  inspection: InspectionFull;
  onVerified: () => void;
}) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const declarations = insp.declarations.map(d => ({
    ...d,
    extracted_value: overrides[d.id] ?? d.extracted_value,
  }));

  const violations = declarations.filter(d => d.rule.mandatory && !d.found);
  const lowConf = declarations.filter(d => d.found && d.confidence < 0.60);

  const bboxes = declarations
    .filter(d => d.bbox && d.found)
    .map(d => ({
      id: d.id,
      bbox: d.bbox!,
      label: d.rule.label,
      confidence: d.confidence,
      isHighlighted: highlightedId === d.id,
    }));

  async function handleVerify() {
    if (verifyAction === 'reject' && !note.trim()) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsProcessing(false);
    onVerified();
  }

  function startEdit(decl: Declaration) {
    setEditingId(decl.id);
    setEditVal(overrides[decl.id] ?? decl.extracted_value ?? '');
  }

  function saveEdit(id: string) {
    if (editVal.trim()) setOverrides(p => ({ ...p, [id]: editVal.trim() }));
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Product header */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">{insp.product_name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspector: {insp.inspector.full_name} · Submitted {formatDate(insp.created_at)}
            </p>
          </div>
          <StatusPill status={insp.status} />
        </div>
        {/* Alerts */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {violations.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-900/20 border border-red-600/30 rounded-lg text-xs text-red-300">
              <XCircle className="w-3.5 h-3.5" />
              {violations.length} violation{violations.length > 1 ? 's' : ''} flagged
            </div>
          )}
          {lowConf.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/20 border border-amber-600/30 rounded-lg text-xs text-amber-300">
              <AlertCircle className="w-3.5 h-3.5" />
              {lowConf.length} field{lowConf.length > 1 ? 's' : ''} with low confidence
            </div>
          )}
          {Object.keys(overrides).length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-900/20 border border-indigo-600/30 rounded-lg text-xs text-indigo-300">
              <Edit3 className="w-3.5 h-3.5" />
              {Object.keys(overrides).length} field{Object.keys(overrides).length > 1 ? 's' : ''} overridden
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: Image */}
        {insp.evidence_images.length > 0 && (
          <Card padding="none">
            <div className="px-4 py-3 border-b border-[#2E3147]">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Label Image</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Click a declaration to highlight</p>
            </div>
            <BoundingBoxOverlay
              imageUrl={insp.evidence_images[0].storage_path}
              imageNaturalSize={{ width: 1, height: 1 }}
              boxes={bboxes}
              onBoxClick={id => setHighlightedId(prev => prev === id ? null : id)}
            />
          </Card>
        )}

        {/* Right: Declarations */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-[#2E3147]">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Extracted Declarations</p>
          </div>
          <div className="divide-y divide-[#2E3147] max-h-[400px] overflow-y-auto">
            {declarations.map(decl => {
              const isEditing = editingId === decl.id;
              const isHighlighted = highlightedId === decl.id;
              const isLowConf = decl.found && decl.confidence < 0.60;
              const isOverridden = !!overrides[decl.id];

              return (
                <div
                  key={decl.id}
                  onClick={() => !isEditing && setHighlightedId(prev => prev === decl.id ? null : decl.id)}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    isHighlighted ? 'bg-indigo-900/15' : isLowConf ? 'bg-amber-900/5' : 'hover:bg-[#232635]/40',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {/* Status icon */}
                    <div className="mt-0.5 shrink-0">
                      {decl.found ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : decl.rule.mandatory ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-indigo-400">{decl.rule.clause}</span>
                        {isOverridden && (
                          <span className="text-[9px] text-indigo-400 border border-indigo-600/30 rounded px-1">overridden</span>
                        )}
                        {isLowConf && (
                          <span className="text-[9px] text-amber-400 border border-amber-600/30 rounded px-1">⚠ low confidence</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-300">{decl.rule.label}</p>

                      {/* Value / edit */}
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mt-1.5" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-[#0F1117] border border-indigo-500/60 rounded text-slate-200 focus:outline-none"
                          />
                          <button onClick={() => saveEdit(decl.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {decl.extracted_value ? (
                            <span className="text-[11px] text-slate-400 font-mono truncate">{decl.extracted_value}</span>
                          ) : (
                            <span className="text-[11px] text-slate-600 italic">Not detected</span>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); startEdit(decl); }}
                            className="p-0.5 text-slate-600 hover:text-indigo-400 shrink-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {decl.found && <ConfidenceBar value={decl.confidence} className="mt-1.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Verification Controls */}
      <Card>
        <p className="text-sm font-semibold text-slate-200 mb-3">Officer Verification</p>

        {/* Action selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setVerifyAction('approve')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all',
              verifyAction === 'approve'
                ? 'bg-emerald-900/30 border-emerald-600/50 text-emerald-300'
                : 'bg-[#0F1117] border-[#2E3147] text-slate-400 hover:border-emerald-600/30 hover:text-emerald-400',
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {violations.length === 0 ? 'Approve — Compliant' : 'Approve — Non-Compliant'}
          </button>
          <button
            onClick={() => setVerifyAction('reject')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all',
              verifyAction === 'reject'
                ? 'bg-red-900/30 border-red-600/50 text-red-300'
                : 'bg-[#0F1117] border-[#2E3147] text-slate-400 hover:border-red-600/30 hover:text-red-400',
            )}
          >
            <XCircle className="w-4 h-4" />
            Reject — Return to Inspector
          </button>
        </div>

        {/* Note */}
        {verifyAction && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Note {verifyAction === 'reject' && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder={
                verifyAction === 'reject'
                  ? 'Explain why this is being rejected…'
                  : 'Optional verification note…'
              }
              className="w-full px-3 py-2 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
        )}

        {/* Submit */}
        {verifyAction && (
          <Button
            onClick={handleVerify}
            isLoading={isProcessing}
            variant={verifyAction === 'approve' ? 'success' : 'danger'}
            className="w-full"
            disabled={verifyAction === 'reject' && !note.trim()}
          >
            {isProcessing ? 'Processing…' : verifyAction === 'approve' ? 'Confirm Verification' : 'Confirm Rejection'}
          </Button>
        )}
      </Card>
    </div>
  );
}

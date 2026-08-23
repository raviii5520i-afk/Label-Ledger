// Label Ledger — Review Queue View Component (Live Supabase Integration & RBAC Protected)
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight,
  User, Calendar, FileText, Check, X, Edit3, Loader2, AlertCircle, RefreshCw, Package, ShieldAlert,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { Card, CardTitle, EmptyState } from '../ui/Card';
import { StatusPill } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BoundingBoxOverlay } from '../scan/BoundingBoxOverlay';
import { ConfidenceBar } from '../ui/Card';
import type { InspectionStatus } from '../../lib/types';
import {
  getMyInspections, getInspectionWithDetails, updateInspectionStatus,
  createVerificationLog, FullInspectionDetails, DbInspection,
} from '@/lib/supabase/inspections';
import { getCurrentProfile, UserProfile } from '@/lib/supabase/profiles';
import { MOCK_RULES } from '../../lib/mock/data';

export function ReviewQueueView() {
  const [queue, setQueue] = useState<DbInspection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullDetails, setFullDetails] = useState<FullInspectionDetails | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  const [loadingQueue, setLoadingQueue] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verification form state
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Interactive highlight / override state
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  // 1. Fetch current user profile & pending_review inspections on mount
  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    setError(null);

    // Fetch authenticated user profile directly from database
    const profile = await getCurrentProfile();
    setCurrentUserProfile(profile);

    const res = await getMyInspections();
    if (res.error) {
      console.warn('[ReviewQueueView] getMyInspections error:', res.error);
      setError('Failed to fetch review queue from database: ' + res.error);
      setQueue([]);
    } else if (res.data) {
      // Filter for inspections requiring verification review (status === 'pending_review')
      const pending = res.data.filter(i => i.status === 'pending_review');
      setQueue(pending);
      if (pending.length > 0 && !selectedId) {
        setSelectedId(pending[0].id);
      } else if (pending.length === 0) {
        setSelectedId(null);
        setFullDetails(null);
      }
    }
    setLoadingQueue(false);
  }, [selectedId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // 2. Fetch full relational details when selected inspection changes
  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;
    setLoadingDetails(true);

    getInspectionWithDetails(selectedId).then((res) => {
      if (!isMounted) return;
      if (res.data) {
        setFullDetails(res.data);
      } else {
        console.warn('[ReviewQueueView] getInspectionWithDetails error:', res.error);
      }
      setLoadingDetails(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const selectedInsp = fullDetails;

  // Compute declarations & bounding boxes from DB inspection_items / mock rules
  const declarations = useMemo(() => {
    if (!selectedInsp) return [];
    return MOCK_RULES.map((rule, idx) => {
      const dbItem = selectedInsp.inspection_items.find(item => item.clause === rule.clause);
      const isOverridden = !!overrides[`decl_${rule.id}`];
      const val = isOverridden ? overrides[`decl_${rule.id}`] : (dbItem?.extracted_value ?? null);
      return {
        id: `decl_${rule.id}`,
        db_id: dbItem?.id || `item_${idx}`,
        rule,
        found: dbItem ? dbItem.found : true,
        extracted_value: val,
        confidence: dbItem?.confidence ?? 0.85,
        bbox: dbItem?.bbox ?? { x: 0.1, y: 0.1 + idx * 0.08, w: 0.8, h: 0.06 },
      };
    });
  }, [selectedInsp, overrides]);

  const bboxes = useMemo(() => {
    return declarations.map(d => ({
      id: d.id,
      bbox: d.bbox,
      label: d.rule.label,
      confidence: d.confidence,
      isHighlighted: d.id === highlightedId,
    }));
  }, [declarations, highlightedId]);

  const violations = useMemo(() => {
    return declarations.filter(d => !d.found || !d.extracted_value);
  }, [declarations]);

  const startEdit = (decl: typeof declarations[0]) => {
    setEditingId(decl.id);
    setEditVal(decl.extracted_value || '');
  };

  const saveEdit = (id: string) => {
    setOverrides(prev => ({ ...prev, [id]: editVal }));
    setEditingId(null);
  };

  // 3. Handle Officer Verification / Rejection Submit
  const handleVerify = async () => {
    if (!selectedId || !selectedInsp || !verifyAction) return;

    // Verify authenticated user profile directly from DB
    const profile = await getCurrentProfile();
    if (!profile) {
      alert('Authentication session expired. Please log in again.');
      return;
    }

    // Role Check: Normal inspectors CANNOT verify inspections as compliant / non-compliant
    if (verifyAction === 'approve' && profile.role !== 'admin') {
      alert('Security Enforcement: Only authorized verifiers (Admin) can approve inspections as compliant/non-compliant. Inspectors cannot self-verify.');
      return;
    }

    // Determine status transition & exact allowed verification action value
    let newStatus: InspectionStatus;
    let actionValue: 'verified_compliant' | 'verified_non_compliant' | 'rejected';

    if (verifyAction === 'approve') {
      if (violations.length === 0) {
        newStatus = 'verified_compliant';
        actionValue = 'verified_compliant';
      } else {
        newStatus = 'verified_non_compliant';
        actionValue = 'verified_non_compliant';
      }
    } else {
      newStatus = 'draft';
      actionValue = 'rejected';
    }

    setIsProcessing(true);

    // 1. Update status in public.inspections table
    const statusRes = await updateInspectionStatus(selectedId, newStatus);
    if (statusRes.error) {
      console.error('[ReviewQueueView] updateInspectionStatus error:', statusRes.error);
      alert(`Verification status update failed: ${statusRes.error}`);
      setIsProcessing(false);
      return;
    }

    // 2. Append audit log entry to public.verification_logs (officer_id derived strictly from auth.uid())
    const logRes = await createVerificationLog({
      inspection_id: selectedId,
      previous_status: selectedInsp.inspection.status,
      new_status: newStatus,
      action: actionValue,
      comment: note.trim() || null,
    });

    if (logRes.error) {
      console.warn('[ReviewQueueView] createVerificationLog warning:', logRes.error);
    }

    setIsProcessing(false);
    setNote('');
    setVerifyAction(null);
    setSelectedId(null);
    setFullDetails(null);

    // Re-fetch queue to reflect updated state
    fetchQueue();
  };

  const isUserAdmin = currentUserProfile?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Review Queue</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Legal metrology compliance verification & audit log recording.
          </p>
        </div>
        {currentUserProfile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1D27] border border-[#2E3147] rounded-lg">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">{currentUserProfile.full_name || 'User'}</span>
            <span className={cn(
              'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border',
              isUserAdmin ? 'bg-purple-900/30 border-purple-500/40 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            )}>
              {currentUserProfile.role}
            </span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-red-900/20 border border-red-600/30 rounded-xl text-red-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchQueue}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Main Layout */}
      {loadingQueue ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs font-medium">Loading review queue from Supabase…</p>
        </div>
      ) : queue.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title="Review Queue Empty"
          description="There are currently no pending inspections awaiting verification."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue Selector List */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
              Pending Reviews ({queue.length})
            </p>
            <div className="space-y-2">
              {queue.map(item => {
                const isSelected = item.id === selectedId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#1e2135] border-indigo-500 shadow-lg ring-1 ring-indigo-500/30'
                        : 'bg-[#1A1D27] border-[#2E3147] hover:border-slate-600',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-200 truncate">{item.product_name || 'Untitled Inspection'}</p>
                      <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform', isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600')} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <StatusPill status={item.status} size="sm" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspection Inspection Detail & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {loadingDetails || !selectedInsp ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D27] border border-[#2E3147] rounded-xl text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <p className="text-xs font-medium">Loading inspection details…</p>
              </div>
            ) : (
              <>
                {/* Header Summary Card */}
                <Card>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3147] pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-100">{selectedInsp.inspection.product_name}</h3>
                        <StatusPill status={selectedInsp.inspection.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Inspection ID: {selectedInsp.inspection.id}</p>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 sm:text-right">
                      <p>Created: {formatDate(selectedInsp.inspection.created_at)}</p>
                    </div>
                  </div>

                  {/* Summary Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#0F1117] border border-[#2E3147] rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Evidence Images</p>
                      <p className="text-sm font-bold text-slate-200 mt-0.5">{selectedInsp.label_evidence.length}</p>
                    </div>
                    <div className="p-3 bg-[#0F1117] border border-[#2E3147] rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Declarations</p>
                      <p className="text-sm font-bold text-slate-200 mt-0.5">{declarations.length}</p>
                    </div>
                    <div className="p-3 bg-[#0F1117] border border-[#2E3147] rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Violations</p>
                      <p className={cn('text-sm font-bold mt-0.5', violations.length > 0 ? 'text-red-400' : 'text-emerald-400')}>
                        {violations.length}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Evidence & Declarations split */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Evidence Image */}
                  {selectedInsp.label_evidence.length > 0 && (
                    <Card padding="none">
                      <div className="px-4 py-3 border-b border-[#2E3147]">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Label Evidence</p>
                      </div>
                      <BoundingBoxOverlay
                        imageUrl={selectedInsp.label_evidence[0].storage_path}
                        imageNaturalSize={{ width: 1, height: 1 }}
                        boxes={bboxes}
                        onBoxClick={id => setHighlightedId(prev => prev === id ? null : id)}
                      />
                    </Card>
                  )}

                  {/* Declarations */}
                  <Card padding="none">
                    <div className="px-4 py-3 border-b border-[#2E3147]">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Extracted Declarations</p>
                    </div>
                    <div className="divide-y divide-[#2E3147] max-h-[380px] overflow-y-auto">
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
                              <div className="mt-0.5 shrink-0">
                                {decl.found ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-indigo-400">{decl.rule.clause}</span>
                                  {isOverridden && (
                                    <span className="text-[9px] text-indigo-400 border border-indigo-600/30 rounded px-1">overridden</span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-slate-300">{decl.rule.label}</p>
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
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* Officer Verification Panel */}
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-200">Officer Verification Decision</p>
                    {!isUserAdmin && (
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Inspector Mode (Rejection only)</span>
                      </div>
                    )}
                  </div>

                  {/* Action selector */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setVerifyAction('approve')}
                      disabled={!isUserAdmin}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all',
                        !isUserAdmin
                          ? 'opacity-40 cursor-not-allowed bg-[#0F1117] border-[#2E3147] text-slate-600'
                          : verifyAction === 'approve'
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

                  {!isUserAdmin && (
                    <p className="text-[11px] text-amber-400/80 mb-3 italic">
                      Note: Verification approval requires an Admin role. As an Inspector, you may return pending items to draft state via Reject.
                    </p>
                  )}

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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

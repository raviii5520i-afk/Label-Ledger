// Label Ledger — Review Queue View Component (Decomposed Modular Coordinator)
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Loader2, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from '../ui/Card';
import { useToast } from '../ui/Toast';
import {
  getMyInspections, getInspectionWithDetails, updateInspectionStatus,
  createVerificationLog, FullInspectionDetails, DbInspection,
} from '@/lib/supabase/inspections';
import { getCurrentProfile, UserProfile } from '@/lib/supabase/profiles';
import { MOCK_RULES } from '../../lib/mock/data';
import { useLanguage } from '../../i18n/LanguageProvider';

import { ReviewQueueList } from './ReviewQueueList';
import { ReviewDetailPanel } from './ReviewDetailPanel';
import { VerificationPanel } from './VerificationPanel';

export function ReviewQueueView() {
  const { t } = useLanguage();
  const { toast } = useToast();
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
      toast({
        variant: 'error',
        title: 'Session Expired',
        description: 'Authentication session expired. Please log in again.',
      });
      return;
    }

    // Role Check: Normal inspectors CANNOT verify inspections as compliant / non-compliant
    if (verifyAction === 'approve' && profile.role !== 'admin') {
      toast({
        variant: 'error',
        title: 'Authorization Required',
        description: 'Only Admin officers can verify compliance status.',
      });
      return;
    }

    // Determine status transition & exact allowed verification action value
    let newStatus: typeof selectedInsp.inspection.status;
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
      toast({
        variant: 'error',
        title: 'Update Failed',
        description: `Verification status update failed: ${statusRes.error}`,
      });
      setIsProcessing(false);
      return;
    }

    // 2. Append audit log entry to public.verification_logs
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

    toast({
      variant: 'success',
      title: verifyAction === 'approve' ? 'Inspection Verified' : 'Inspection Rejected',
      description: verifyAction === 'approve'
        ? `Marked successfully as ${newStatus === 'verified_compliant' ? 'compliant' : 'non-compliant'}.`
        : 'Inspection returned to draft state.',
    });

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
          <h1 className="text-xl md:text-2xl font-bold text-[var(--lg-navy)]">{t('reviewQueue.title')}</h1>
          <p className="text-sm text-[var(--lg-muted)] mt-0.5">
            {t('reviewQueue.noPending')}
          </p>
        </div>
        {currentUserProfile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[var(--lg-border)] rounded-lg">
            <User className="w-3.5 h-3.5 text-[var(--lg-blue)]" />
            <span className="text-xs font-semibold text-[var(--lg-navy)]">{currentUserProfile.full_name || 'User'}</span>
            <span className={cn(
              'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border',
              isUserAdmin ? 'bg-purple-900/30 border-purple-500/40 text-purple-300' : 'bg-slate-800 border-slate-700 text-[var(--lg-muted)]'
            )}>
              {currentUserProfile.role}
            </span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchQueue}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 rounded text-xs font-semibold text-[var(--lg-navy)] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Main Layout */}
      {loadingQueue ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--lg-muted)] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--lg-blue)]" />
          <p className="text-xs font-medium">Loading review queue from Supabase…</p>
        </div>
      ) : queue.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-[var(--lg-muted)]" />}
          title={t('reviewQueue.noPending')}
          description="All submitted inspections have been processed."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue Selector List */}
          <ReviewQueueList
            queue={queue}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Inspection Detail & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {loadingDetails || !selectedInsp ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-[var(--lg-border)] rounded-xl text-[var(--lg-muted)] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--lg-blue)]" />
                <p className="text-xs font-medium">Loading inspection details…</p>
              </div>
            ) : (
              <>
                <ReviewDetailPanel
                  selectedInsp={selectedInsp}
                  declarations={declarations}
                  bboxes={bboxes}
                  highlightedId={highlightedId}
                  onHighlight={setHighlightedId}
                  editingId={editingId}
                  editVal={editVal}
                  onStartEdit={startEdit}
                  onEditValChange={setEditVal}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  violationsCount={violations.length}
                />

                <VerificationPanel
                  violationsCount={violations.length}
                  isUserAdmin={isUserAdmin}
                  verifyAction={verifyAction}
                  onSetVerifyAction={setVerifyAction}
                  note={note}
                  onNoteChange={setNote}
                  isProcessing={isProcessing}
                  onSubmit={handleVerify}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

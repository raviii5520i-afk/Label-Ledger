// Label Ledger — Officer Verification Panel Component (With ConfirmDialog Modal)
'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface VerificationPanelProps {
  violationsCount: number;
  isUserAdmin: boolean;
  verifyAction: 'approve' | 'reject' | null;
  onSetVerifyAction: (action: 'approve' | 'reject' | null) => void;
  note: string;
  onNoteChange: (note: string) => void;
  isProcessing: boolean;
  onSubmit: () => void;
}

export function VerificationPanel({
  violationsCount,
  isUserAdmin,
  verifyAction,
  onSetVerifyAction,
  note,
  onNoteChange,
  isProcessing,
  onSubmit,
}: VerificationPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmVerification = () => {
    setShowConfirm(false);
    onSubmit();
  };

  const isApproved = verifyAction === 'approve';
  const isCompliant = violationsCount === 0;

  // Determine dialog title and message details
  const dialogTitle = isApproved ? 'Confirm Verification Approval' : 'Confirm Rejection Review';
  const dialogDesc = isApproved
    ? isCompliant
      ? 'You are about to verify this label as COMPLIANT. It will be marked as verified and archived. This action is recorded in the audit logs.'
      : `You are about to verify this label as NON-COMPLIANT due to ${violationsCount} failed mandatory declaration(s). This action is recorded in the audit logs.`
    : 'You are about to REJECT this inspection and return it to the inspector. The inspector will need to correct and re-submit it for review.';

  return (
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
          onClick={() => onSetVerifyAction('approve')}
          disabled={!isUserAdmin}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all',
            !isUserAdmin
              ? 'opacity-40 cursor-not-allowed bg-[#0F1117] border-[#2E3147] text-slate-600'
              : verifyAction === 'approve'
              ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
              : 'bg-[#0F1117] border-[#2E3147] text-slate-400 hover:border-emerald-600/30 hover:text-emerald-400',
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          {violationsCount === 0 ? 'Approve — Compliant' : 'Approve — Non-Compliant'}
        </button>

        <button
          onClick={() => onSetVerifyAction('reject')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all',
            verifyAction === 'reject'
              ? 'bg-red-950/30 border-red-600/50 text-red-300'
              : 'bg-[#0F1117] border-[#2E3147] text-slate-400 hover:border-red-600/30 hover:text-red-400',
          )}
        >
          <XCircle className="w-4 h-4" />
          Reject — Return to Inspector
        </button>
      </div>

      {/* Inline Warning for Non-Admins */}
      {!isUserAdmin && (
        <div className="flex items-start gap-2 p-2.5 mb-3 bg-amber-950/20 border border-amber-900/30 rounded-lg text-[11px] text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Only Admin officers can verify compliance status. Inspectors may return pending items to draft state via Reject.
          </span>
        </div>
      )}

      {/* Note area */}
      {verifyAction && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
            Audit Comment {verifyAction === 'reject' && <span className="text-red-400">*</span>}
          </label>
          <textarea
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            rows={2}
            placeholder={
              verifyAction === 'reject'
                ? 'Provide mandatory rejection comment for the inspector…'
                : 'Provide optional verification details…'
            }
            className="w-full px-3 py-2 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>
      )}

      {/* Submit Action */}
      {verifyAction && (
        <Button
          onClick={handleConfirmClick}
          isLoading={isProcessing}
          variant={isApproved ? (isCompliant ? 'success' : 'primary') : 'danger'}
          className="w-full shadow-lg"
          disabled={verifyAction === 'reject' && !note.trim()}
        >
          {isApproved ? 'Submit Verification' : 'Submit Rejection'}
        </Button>
      )}

      {/* Interactive Modal ConfirmDialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title={dialogTitle}
        description={dialogDesc}
        confirmLabel={isApproved ? 'Yes, Verify Status' : 'Yes, Reject Inspection'}
        onConfirm={handleConfirmVerification}
        onCancel={() => setShowConfirm(false)}
        variant={isApproved ? (isCompliant ? 'success' : 'default') : 'danger'}
        isLoading={isProcessing}
      />
    </Card>
  );
}

// Label Ledger — Review Detail Panel Component
'use client';

import { useState, useRef, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Edit3, Check, X,
  Loader2, AlertTriangle
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { Card, CardTitle } from '../ui/Card';
import { StatusPill } from '../ui/Badge';
import { BoundingBoxOverlay } from '../scan/BoundingBoxOverlay';
import { ConfidenceBar } from '../ui/Card';
import { ClauseTag } from '../ui/Badge';
import { FullInspectionDetails } from '@/lib/supabase/inspections';

interface ReviewDetailPanelProps {
  selectedInsp: FullInspectionDetails;
  declarations: any[];
  bboxes: any[];
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  editingId: string | null;
  editVal: string;
  onStartEdit: (decl: any) => void;
  onEditValChange: (val: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  violationsCount: number;
}

export function ReviewDetailPanel({
  selectedInsp,
  declarations,
  bboxes,
  highlightedId,
  onHighlight,
  editingId,
  editVal,
  onStartEdit,
  onEditValChange,
  onSaveEdit,
  onCancelEdit,
  violationsCount,
}: ReviewDetailPanelProps) {
  // Track natural image size to fix bounding box layout
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImgLoad = useCallback(() => {
    if (imgRef.current) {
      setImgSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lg-border)] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">
                {selectedInsp.inspection.product_name || 'Untitled Product'}
              </h3>
              <StatusPill status={selectedInsp.inspection.status} size="sm" />
            </div>
            <p className="text-xs text-[var(--lg-muted)] mt-1">Inspection ID: {selectedInsp.inspection.id}</p>
          </div>
          <div className="text-xs text-[var(--lg-muted)] space-y-1 sm:text-right">
            <p>Created: {formatDate(selectedInsp.inspection.created_at)}</p>
          </div>
        </div>

        {/* Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-[var(--lg-border)] rounded-lg">
            <p className="text-[10px] text-[var(--lg-muted)] uppercase font-semibold">Evidence Images</p>
            <p className="text-sm font-bold text-[var(--lg-navy)] mt-0.5">{selectedInsp.label_evidence.length}</p>
          </div>
          <div className="p-3 bg-white border border-[var(--lg-border)] rounded-lg">
            <p className="text-[10px] text-[var(--lg-muted)] uppercase font-semibold">Declarations</p>
            <p className="text-sm font-bold text-[var(--lg-navy)] mt-0.5">{declarations.length}</p>
          </div>
          <div className="p-3 bg-white border border-[var(--lg-border)] rounded-lg">
            <p className="text-[10px] text-[var(--lg-muted)] uppercase font-semibold">Violations</p>
            <p className={cn('text-sm font-bold mt-0.5', violationsCount > 0 ? 'text-red-400' : 'text-emerald-400')}>
              {violationsCount}
            </p>
          </div>
        </div>
      </Card>

      {/* Evidence & Declarations split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Evidence Image */}
        {selectedInsp.label_evidence.length > 0 && (
          <Card padding="none">
            <div className="px-4 py-3 border-b border-[var(--lg-border)]">
              <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest">Label Evidence</p>
            </div>
            <BoundingBoxOverlay
              imageUrl={selectedInsp.label_evidence[0].storage_path}
              imageNaturalSize={imgSize}
              boxes={bboxes}
              onBoxClick={id => onHighlight(id === highlightedId ? null : id)}
              onImgLoad={handleImgLoad}
              imgRef={imgRef}
            />
          </Card>
        )}

        {/* Declarations */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-[var(--lg-border)]">
            <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest">Extracted Declarations</p>
          </div>
          <div className="divide-y divide-[#2E3147] max-h-[380px] overflow-y-auto">
            {declarations.map(decl => {
              const isEditing = editingId === decl.id;
              const isHighlighted = highlightedId === decl.id;
              const isLowConf = decl.found && decl.confidence < 0.60;
              const isOverridden = !!decl.extracted_value && decl.extracted_value !== selectedInsp.inspection_items.find(item => item.clause === decl.rule.clause)?.extracted_value;

              return (
                <div
                  key={decl.id}
                  onClick={() => !isEditing && onHighlight(highlightedId === decl.id ? null : decl.id)}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    isHighlighted ? 'bg-[var(--lg-blue)]/10' : isLowConf ? 'bg-orange-50' : 'hover:bg-[var(--lg-background)]',
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
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <ClauseTag>{decl.rule.clause}</ClauseTag>
                        {isOverridden && (
                          <span className="text-[9px] text-[var(--lg-blue)] border border-[var(--lg-blue)]/30 rounded px-1">overridden</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[var(--lg-navy)]">{decl.rule.label}</p>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mt-1.5" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={editVal}
                            onChange={e => onEditValChange(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[var(--lg-border)] focus:border-[var(--lg-blue)] rounded text-[var(--lg-navy)] focus:outline-none"
                          />
                          <button onClick={() => onSaveEdit(decl.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={onCancelEdit} className="p-1 text-[var(--lg-muted)] hover:text-[var(--lg-navy)]">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {decl.extracted_value ? (
                            <span className="text-[11px] text-[var(--lg-muted)] font-mono truncate">{decl.extracted_value}</span>
                          ) : (
                            <span className="text-[11px] text-[var(--lg-muted)] italic">Not detected</span>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); onStartEdit(decl); }}
                            className="p-0.5 text-[var(--lg-muted)] hover:text-[var(--lg-blue)] shrink-0"
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
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  CheckCircle2, XCircle, AlertCircle, Edit3, Check, X, Save, Send,
  ChevronDown, ChevronUp, AlertTriangle, HelpCircle
} from 'lucide-react';
import { cn, formatConfidence, getConfidenceConfig } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ConfidenceBar } from '../ui/Card';
import { ClauseTag } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import { saveInspectionItems } from '@/lib/supabase/inspections';
import { useLanguage } from '../../i18n/LanguageProvider';
import type { Declaration } from '../../lib/types';

interface ComplianceChecklistProps {
  declarations: Declaration[];
  imageUrl: string;
  highlightedRuleId: string | null;
  onHighlightRule: (id: string | null) => void;
  onSaveDraft: () => Promise<void>;
  onSubmitForReview: () => Promise<void>;
}

export function ComplianceChecklist({
  declarations,
  imageUrl,
  highlightedRuleId,
  onHighlightRule,
  onSaveDraft,
  onSubmitForReview,
}: ComplianceChecklistProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [localDeclarations, setLocalDeclarations] = useState(declarations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImage, setShowImage] = useState(true);

  // Track expanded explanation cards for failures
  const [expandedExpl, setExpandedExpl] = useState<Record<string, boolean>>({});

  // Image size elements to render bboxes correctly
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

  const totalMandatory = localDeclarations.filter(d => d.rule.mandatory).length;
  const foundMandatory = localDeclarations.filter(d => d.rule.mandatory && d.found).length;
  const violations = localDeclarations.filter(d => d.rule.mandatory && !d.found);
  const complianceRate = totalMandatory > 0 ? Math.round((foundMandatory / totalMandatory) * 100) : 0;

  const bboxes = localDeclarations
    .filter(d => d.bbox && d.found)
    .map(d => ({
      id: d.rule.id,
      bbox: d.bbox!,
      label: d.rule.label,
      confidence: d.confidence,
      isHighlighted: highlightedRuleId === d.rule.id,
    }));

  function startEdit(decl: Declaration) {
    setEditingId(decl.id);
    setEditValue(decl.extracted_value ?? '');
  }

  async function saveEdit(id: string) {
    const updated = localDeclarations.map(d =>
      d.id === id
        ? { ...d, extracted_value: editValue, found: editValue.trim().length > 0, manually_corrected: true }
        : d,
    );
    setLocalDeclarations(updated);
    setEditingId(null);

    // Call saveInspectionItems to persist manual correction to Supabase immediately
    try {
      const itemsToSave = updated.map(d => ({
        inspection_id: d.inspection_id,
        rule_id: d.rule.id,
        clause: d.rule.clause,
        label: d.rule.label,
        found: d.found,
        extracted_value: d.extracted_value,
        bbox: d.bbox,
        confidence: d.confidence,
        manually_corrected: d.manually_corrected,
      }));
      await saveInspectionItems(itemsToSave);
      toast({
        variant: 'success',
        title: 'Correction Persisted',
        description: 'Correction successfully saved to database.',
      });
    } catch (err: any) {
      console.error('[ComplianceChecklist] failed to save corrected item:', err);
      toast({
        variant: 'error',
        title: 'Save Failed',
        description: 'Failed to write correction back to database.',
      });
    }
  }

  async function handleSave() {
    setIsSaving(true);
    await onSaveDraft();
    setIsSaving(false);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    await onSubmitForReview();
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label={t('compliance.mandatory')} value={`${foundMandatory}/${totalMandatory}`} color="indigo" />
        <SummaryCard label={t('compliance.violations')} value={violations.length} color={violations.length > 0 ? 'red' : 'emerald'} />
        <SummaryCard label={t('compliance.rate')} value={`${complianceRate}%`} color={complianceRate === 100 ? 'emerald' : complianceRate >= 70 ? 'amber' : 'red'} />
        <SummaryCard
          label={t('compliance.status')}
          value={violations.length === 0 ? t('compliance.compliant') : t('compliance.reviewRequired')}
          color={violations.length === 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Violations alert */}
      {violations.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 bg-red-100 border border-red-300 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {violations.length} {t('compliance.mandatoryNotReached')}
            </p>
            <p className="text-xs text-red-700/70 mt-0.5">
              {violations.map(v => v.rule.clause).join(', ')} — {t('compliance.correctOrSubmit')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Image panel (collapsible on mobile) */}
        <div className="lg:col-span-2 space-y-2">
          <button
            onClick={() => setShowImage(p => !p)}
            className="flex items-center gap-2 text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest hover:text-[var(--lg-navy)] transition-colors lg:cursor-default"
          >
            {t('compliance.evidenceImage')}
            <span className="lg:hidden">
              {showImage ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>
          {(showImage) && (
            <div className="bg-white border border-[var(--lg-border)] rounded-xl overflow-hidden">
              <BoundingBoxOverlay
                imageUrl={imageUrl}
                imageNaturalSize={imgSize}
                boxes={bboxes}
                onBoxClick={id => onHighlightRule(id === highlightedRuleId ? null : id)}
                onImgLoad={handleImgLoad}
                imgRef={imgRef}
              />
            </div>
          )}
          <p className="text-[11px] text-[var(--lg-muted)]">{t('compliance.clickToHighlight')}</p>
        </div>

        {/* Checklist table */}
        <div className="lg:col-span-3">
          <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest mb-2">
            {t('compliance.declarationChecklist')}
          </p>
          <div className="bg-white border border-[var(--lg-border)] rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2.5 border-b border-[var(--lg-border)] bg-[var(--lg-background)]/60">
              <span className="text-[10px] font-semibold text-[var(--lg-muted)] uppercase tracking-wider">{t('compliance.table.declaration')}</span>
              <span className="text-[10px] font-semibold text-[var(--lg-muted)] uppercase tracking-wider text-right">{t('compliance.table.confidence')}</span>
              <span className="text-[10px] font-semibold text-[var(--lg-muted)] uppercase tracking-wider text-center w-8">✓</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[var(--lg-border)]">
              {localDeclarations.map(decl => {
                const isEditing = editingId === decl.id;
                const isHovered = highlightedRuleId === decl.rule.id;
                const isExpanded = !!expandedExpl[decl.id];

                const explanation = {
                  'LM-01': 'Rule 6(1)(a) requires the name/generic name of the commodity to be clearly declared on the principal display panel.',
                  'LM-02': 'Rule 6(1)(b) requires complete manufacturer, packer, or importer details including street address, city, state, and pin code.',
                  'LM-03': 'Rule 6(1)(c) requires the net quantity in terms of standard unit of weight, measure, or number to be declared.',
                  'LM-04': 'Rule 6(1)(d) requires the Maximum Retail Price (MRP) to be clearly declared as "MRP Rs. ... incl. of all taxes".',
                  'LM-05': 'Rule 6(1)(e) requires the month and year of manufacture, pre-packing, or import to be declared.',
                  'LM-06': 'Rule 6(1)(f) requires consumer care details including contact name, address, phone number, and email to be declared.',
                  'LM-07': 'Rule 6(1)(g) requires the country of origin to be clearly declared for all imported pre-packaged commodities.',
                  'LM-08': 'Rule 18(1) requires net quantity declarations to be verified for compliance with standard quantity groups.',
                }[decl.rule.id] || 'This declaration is mandatory for compliance under Rule 6 of Legal Metrology (Packaged Commodities) Rules, 2011.';

                return (
                  <div
                    key={decl.id}
                    className={cn(
                      'px-4 py-3 cursor-pointer transition-colors duration-100',
                      isHovered ? 'bg-[var(--lg-blue)]/10' : 'hover:bg-[var(--lg-background)]/40',
                    )}
                    onClick={() => !isEditing && onHighlightRule(decl.rule.id === highlightedRuleId ? null : decl.rule.id)}
                  >
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-start">
                      {/* Clause + value */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <ClauseTag>{decl.rule.clause}</ClauseTag>
                          {decl.rule.is_conditional && (
                            <span className="text-[9px] text-[var(--lg-muted)] border border-slate-700 rounded px-1 font-medium bg-slate-900/40">{t('compliance.conditional')}</span>
                          )}
                          {decl.manually_corrected && (
                            <span className="text-[9px] text-amber-700 border border-amber-300 rounded px-1 font-medium bg-amber-900/10">{t('compliance.edited')}</span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--lg-navy)] font-bold leading-snug">{decl.rule.label}</p>

                        {/* Extracted value / edit field */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 mt-1.5" onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-[var(--lg-background)] border border-[var(--lg-blue)]/60 rounded text-[var(--lg-navy)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button onClick={() => saveEdit(decl.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-[var(--lg-muted)] hover:text-[var(--lg-navy)]">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {decl.extracted_value ? (
                              <span className="text-[11px] text-[var(--lg-navy)] font-mono bg-slate-900/50 px-1.5 py-0.5 rounded border border-[var(--lg-border)] truncate max-w-[200px]">
                                {decl.extracted_value}
                              </span>
                            ) : (
                              <span className="text-[var(--lg-muted)] italic text-xs">{t('compliance.status.notDetected')}</span>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); startEdit(decl); }}
                              className="p-0.5 text-[var(--lg-muted)] hover:text-[var(--lg-blue)] transition-colors shrink-0"
                              title={t('compliance.editValue')}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {!decl.found && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setExpandedExpl(prev => ({ ...prev, [decl.id]: !prev[decl.id] }));
                                }}
                                className="text-[10px] text-[var(--lg-blue)] hover:text-[var(--lg-blue)] ml-1.5 font-medium flex items-center gap-0.5"
                              >
                                <HelpCircle className="w-3 h-3" /> {t('compliance.whyFailed')}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Expandable Explanation card */}
                        {!decl.found && isExpanded && (
                          <div className="mt-2 p-2.5 rounded bg-red-950/20 border border-red-900/40 text-[11px] text-red-700 leading-normal flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0 mt-0.5" />
                            <span>{explanation}</span>
                          </div>
                        )}
                      </div>

                      {/* Confidence */}
                      <div className="w-16 pt-1">
                        {decl.found ? (
                          <ConfidenceBar value={decl.confidence} />
                        ) : (
                          <span className="text-[10px] text-[var(--lg-muted)]">—</span>
                        )}
                      </div>

                      {/* Found indicator */}
                      <div className="w-8 flex justify-center pt-1 shrink-0">
                        {decl.found ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : decl.rule.mandatory ? (
                          <XCircle className="w-4 h-4 text-red-700" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[var(--lg-muted)]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={isSaving || isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? t('compliance.saving') : t('compliance.saveDraft')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? t('compliance.submitting') : t('compliance.submitForReview')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: 'indigo' | 'emerald' | 'red' | 'amber';
}) {
  const colorMap = {
    indigo: 'text-[var(--lg-blue)] bg-[var(--lg-blue)]/10 border-[var(--lg-blue)]/30',
    emerald: 'text-emerald-300 bg-emerald-900/20 border-emerald-600/30',
    red: 'text-red-700 bg-red-100 border-red-300',
    amber: 'text-amber-700 bg-amber-100 border-amber-300',
  };

  return (
    <div className={cn('border rounded-xl px-3 py-3', colorMap[color])}>
      <p className="text-[10px] font-medium text-[var(--lg-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

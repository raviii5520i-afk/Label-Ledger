'use client';

import { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertCircle, Edit3, Check, X, Save, Send,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn, formatConfidence, getConfidenceConfig } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ConfidenceBar } from '../ui/Card';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
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
  const [localDeclarations, setLocalDeclarations] = useState(declarations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImage, setShowImage] = useState(true);

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

  function saveEdit(id: string) {
    setLocalDeclarations(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, extracted_value: editValue, found: editValue.trim().length > 0, manually_corrected: true }
          : d,
      ),
    );
    setEditingId(null);
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
        <SummaryCard label="Mandatory" value={`${foundMandatory}/${totalMandatory}`} color="indigo" />
        <SummaryCard label="Violations" value={violations.length} color={violations.length > 0 ? 'red' : 'emerald'} />
        <SummaryCard label="Compliance" value={`${complianceRate}%`} color={complianceRate === 100 ? 'emerald' : complianceRate >= 70 ? 'amber' : 'red'} />
        <SummaryCard
          label="Status"
          value={violations.length === 0 ? 'Likely Compliant' : 'Violations Found'}
          color={violations.length === 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Violations alert */}
      {violations.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 bg-red-900/20 border border-red-600/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              {violations.length} mandatory declaration{violations.length > 1 ? 's' : ''} not found
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              {violations.map(v => v.rule.clause).join(', ')} — Correct manually or submit for review.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Image panel (collapsible on mobile) */}
        <div className="lg:col-span-2 space-y-2">
          <button
            onClick={() => setShowImage(p => !p)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-200 transition-colors lg:cursor-default"
          >
            Evidence Image
            <span className="lg:hidden">
              {showImage ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>
          {(showImage) && (
            <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl overflow-hidden">
              <BoundingBoxOverlay
                imageUrl={imageUrl}
                imageNaturalSize={{ width: 1, height: 1 }}
                boxes={bboxes}
                onBoxClick={id => onHighlightRule(id === highlightedRuleId ? null : id)}
              />
            </div>
          )}
          <p className="text-[11px] text-slate-600">Click a row to highlight on image</p>
        </div>

        {/* Checklist table */}
        <div className="lg:col-span-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Declaration Checklist
          </p>
          <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2.5 border-b border-[#2E3147] bg-[#232635]/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Declaration</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Confidence</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center w-8">✓</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#2E3147]">
              {localDeclarations.map(decl => {
                const isEditing = editingId === decl.id;
                const isHovered = highlightedRuleId === decl.rule.id;

                return (
                  <div
                    key={decl.id}
                    className={cn(
                      'px-4 py-3 cursor-pointer transition-colors duration-100',
                      isHovered ? 'bg-indigo-900/15' : 'hover:bg-[#232635]/40',
                    )}
                    onClick={() => !isEditing && onHighlightRule(decl.rule.id === highlightedRuleId ? null : decl.rule.id)}
                  >
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-start">
                      {/* Clause + value */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono text-indigo-400 shrink-0">{decl.rule.clause}</span>
                          {decl.rule.is_conditional && (
                            <span className="text-[9px] text-slate-600 border border-slate-700 rounded px-1">conditional</span>
                          )}
                          {decl.manually_corrected && (
                            <span className="text-[9px] text-amber-400 border border-amber-600/30 rounded px-1">edited</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-snug">{decl.rule.label}</p>

                        {/* Extracted value / edit field */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 mt-1.5" onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-[#0F1117] border border-indigo-500/60 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button onClick={() => saveEdit(decl.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:text-slate-300">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-1">
                            {decl.extracted_value ? (
                              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                                {decl.extracted_value}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-600 italic">Not detected</span>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); startEdit(decl); }}
                              className="p-0.5 text-slate-600 hover:text-indigo-400 transition-colors shrink-0"
                              title="Edit value"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Confidence */}
                      <div className="w-16 pt-1">
                        {decl.found ? (
                          <ConfidenceBar value={decl.confidence} />
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </div>

                      {/* Found indicator */}
                      <div className="w-8 flex justify-center pt-1 shrink-0">
                        {decl.found ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : decl.rule.mandatory ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600" />
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
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit for Review
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
    indigo: 'text-indigo-300 bg-indigo-900/20 border-indigo-600/30',
    emerald: 'text-emerald-300 bg-emerald-900/20 border-emerald-600/30',
    red: 'text-red-300 bg-red-900/20 border-red-600/30',
    amber: 'text-amber-300 bg-amber-900/20 border-amber-600/30',
  };

  return (
    <div className={cn('border rounded-xl px-3 py-3', colorMap[color])}>
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

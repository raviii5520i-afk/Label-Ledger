'use client';

import { useState, useCallback } from 'react';
import { Upload, FileImage, Cpu, ClipboardList, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ImageUploader } from './ImageUploader';
import { AnalysisLoader } from './AnalysisLoader';
import { OcrReviewPanel } from './OcrReviewPanel';
import { ComplianceChecklist } from './ComplianceChecklist';
import { ScanSubmitPanel } from './ScanSubmitPanel';
import type { ScanStep, OcrResult, ExtractionResult } from '../../lib/types';
import { MOCK_OCR_RESULT, MOCK_EXTRACTION_RESULT, MOCK_RULES } from '../../lib/mock/data';

// ── Step definitions ─────────────────────────────────────────

const STEPS: { id: ScanStep; label: string; icon: React.ReactNode }[] = [
  { id: 'upload', label: 'Upload', icon: <Upload className="w-3.5 h-3.5" /> },
  { id: 'analyzing', label: 'Analyze', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'ocr_review', label: 'OCR Review', icon: <FileImage className="w-3.5 h-3.5" /> },
  { id: 'checklist', label: 'Checklist', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { id: 'submit', label: 'Submit', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

const STEP_ORDER: ScanStep[] = ['upload', 'analyzing', 'ocr_review', 'checklist', 'submit'];

export function ScanWorkflow() {
  const [step, setStep] = useState<ScanStep>('upload');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [isImported, setIsImported] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);

  const currentStepIndex = STEP_ORDER.indexOf(step);

  // Mock: simulate OCR + AI extraction
  const handleImageSelected = useCallback(async (file: File, previewUrl: string) => {
    setImagePreviewUrl(previewUrl);
    setStep('analyzing');
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 3000));
    setOcrResult(MOCK_OCR_RESULT);
    setExtractionResult(MOCK_EXTRACTION_RESULT);
    setStep('ocr_review');
  }, []);

  const handleOcrConfirmed = useCallback(() => {
    setStep('checklist');
  }, []);

  const handleSaveDraft = useCallback(async () => {
    // TODO: wire to Supabase server action
    await new Promise(r => setTimeout(r, 800));
    alert('Draft saved! (Supabase integration pending)');
  }, []);

  const handleSubmitForReview = useCallback(async () => {
    // TODO: wire to Supabase server action
    await new Promise(r => setTimeout(r, 1000));
    setStep('submit');
  }, []);

  const handleReset = useCallback(() => {
    setStep('upload');
    setImagePreviewUrl(null);
    setProductName('');
    setIsImported(false);
    setOcrResult(null);
    setExtractionResult(null);
    setHighlightedRuleId(null);
  }, []);

  // Build declarations from extracted fields + rules
  const declarations = MOCK_RULES.map((rule, i) => {
    const fieldKey = ruleToFieldKey(rule.id);
    const field = fieldKey ? extractionResult?.fields[fieldKey] : undefined;
    return {
      id: `decl_${rule.id}`,
      inspection_id: 'draft',
      rule,
      found: !!field,
      extracted_value: field?.value ?? null,
      bbox: field?.bbox ?? null,
      confidence: field?.confidence ?? 0,
      manually_corrected: false,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100">Scan Product Label</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload a label photo to auto-extract declarations and check compliance.
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={step} stepOrder={STEP_ORDER} />

      {/* Step Content */}
      <div className="mt-2">
        {step === 'upload' && (
          <ImageUploader onImageSelected={handleImageSelected} />
        )}

        {step === 'analyzing' && (
          <AnalysisLoader imageUrl={imagePreviewUrl} />
        )}

        {step === 'ocr_review' && ocrResult && imagePreviewUrl && (
          <OcrReviewPanel
            imageUrl={imagePreviewUrl}
            ocrResult={ocrResult}
            extractionResult={extractionResult}
            productName={productName}
            isImported={isImported}
            onProductNameChange={setProductName}
            onIsImportedChange={setIsImported}
            onConfirm={handleOcrConfirmed}
            highlightedRuleId={highlightedRuleId}
          />
        )}

        {step === 'checklist' && imagePreviewUrl && (
          <ComplianceChecklist
            declarations={declarations}
            imageUrl={imagePreviewUrl}
            highlightedRuleId={highlightedRuleId}
            onHighlightRule={setHighlightedRuleId}
            onSaveDraft={handleSaveDraft}
            onSubmitForReview={handleSubmitForReview}
          />
        )}

        {step === 'submit' && (
          <ScanSubmitPanel
            productName={productName}
            declarations={declarations}
            onScanAnother={handleReset}
          />
        )}
      </div>
    </div>
  );
}

// ── Step Indicator ───────────────────────────────────────────

function StepIndicator({
  steps,
  currentStep,
  stepOrder,
}: {
  steps: typeof STEPS;
  currentStep: ScanStep;
  stepOrder: ScanStep[];
}) {
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const idx = stepOrder.indexOf(s.id);
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isLast = i === steps.length - 1;

        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-300',
                  isDone
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : isActive
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 ring-2 ring-indigo-500/30 ring-offset-1 ring-offset-[#0F1117]'
                    : 'bg-[#1A1D27] border-[#2E3147] text-slate-600',
                )}
              >
                {isDone ? '✓' : s.icon}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive ? 'text-indigo-300' : isDone ? 'text-slate-400' : 'text-slate-600',
                )}
              >
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-px w-6 sm:w-8 mx-1 transition-colors duration-300',
                  idx < currentIdx ? 'bg-indigo-600' : 'bg-[#2E3147]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Helper: map rule ID to extraction field key ──────────────

function ruleToFieldKey(ruleId: string): keyof import('../../lib/types').ExtractionResult['fields'] | null {
  const map: Record<string, keyof import('../../lib/types').ExtractionResult['fields']> = {
    rule_001: 'product_name',
    rule_002: 'net_quantity',
    rule_003: 'mfg_date',
    rule_004: 'mrp',
    rule_005: 'manufacturer_address',
    rule_006: 'consumer_care',
    rule_007: 'country_of_origin',
    rule_008: 'expiry_date',
    rule_009: 'batch_number',
    rule_010: 'fssai_license',
  };
  return map[ruleId] ?? null;
}

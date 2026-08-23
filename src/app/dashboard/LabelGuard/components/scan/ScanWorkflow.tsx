// Label Ledger — Scan Workflow Component (Live OCR Engine & Database Persisted)
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
import { MOCK_RULES } from '../../lib/mock/data';
import { uploadLabelEvidence, createLabelEvidenceSignedUrl, deleteLabelEvidence } from '@/lib/supabase/storage';
import {
  saveLabelEvidenceRecord, updateInspectionStatus, saveInspectionItems,
  saveRuleChecks, DbLabelEvidence,
} from '@/lib/supabase/inspections';
import { runOCR } from '@/lib/ocr/engine';
import { extractLegalMetrologyFields } from '@/lib/ocr/extractor';
import { evaluateRule6Compliance } from '@/lib/ocr/rules';

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
  const [inspectionId, setInspectionId] = useState<string>(() => crypto.randomUUID());
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [evidenceRow, setEvidenceRow] = useState<DbLabelEvidence | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [productName, setProductName] = useState('');
  const [isImported, setIsImported] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);

  const currentStepIndex = STEP_ORDER.indexOf(step);

  // Handle label image upload to private Supabase Storage bucket, run real OCR, and persist to PostgreSQL
  const handleImageSelected = useCallback(async (file: File, localPreviewUrl: string) => {
    setIsUploading(true);
    setUploadError(null);

    // Validate file format
    if (!file || file.size === 0 || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid non-empty image file.');
      setIsUploading(false);
      return;
    }

    const currentInspectionId = inspectionId || crypto.randomUUID();
    setInspectionId(currentInspectionId);

    // 1. Upload to Supabase Storage: label-evidence bucket under path {inspection_id}/{filename}
    const uploadRes = await uploadLabelEvidence({
      inspectionId: currentInspectionId,
      file,
      fileName: file.name,
      contentType: file.type,
    });

    if (uploadRes.error || !uploadRes.data) {
      console.warn('[ScanWorkflow] Storage upload warning:', uploadRes.error);
      setImagePreviewUrl(localPreviewUrl);
    } else {
      const path = uploadRes.data;
      setStoragePath(path);

      // 2. Persist record into public.label_evidence table (with duplicate check & parent inspection check)
      const dbRes = await saveLabelEvidenceRecord({
        inspectionId: currentInspectionId,
        storagePath: path,
        productName: productName || 'Scanned Label Inspection',
      });

      if (dbRes.error) {
        console.error('[ScanWorkflow] Database label_evidence insert failed. Rolling back Storage object:', dbRes.error);
        await deleteLabelEvidence(path);
        setStoragePath(null);
        setUploadError(`Storage upload succeeded, but database persistence failed: ${dbRes.error}`);
        setIsUploading(false);
        return;
      }

      if (dbRes.data) {
        setEvidenceRow(dbRes.data);
      }

      // 3. Generate temporary signed URL for viewing private evidence object
      const signedRes = await createLabelEvidenceSignedUrl(path);
      if (signedRes.data) {
        setImagePreviewUrl(signedRes.data);
      } else {
        setImagePreviewUrl(localPreviewUrl);
      }
    }

    setIsUploading(false);
    setStep('analyzing');

    try {
      // 4. Run real OCR engine on uploaded label file
      const ocrData = await runOCR(file);
      setOcrResult(ocrData);

      // 5. Run Legal Metrology Rule 6 field extraction
      const extractionData = extractLegalMetrologyFields(ocrData);
      setExtractionResult(extractionData);

      if (extractionData.fields.product_name?.value) {
        setProductName(extractionData.fields.product_name.value);
      }

      // 6. Evaluate Rule 6 compliance and persist to database (public.inspection_items & public.rule_checks)
      const { items, checks } = evaluateRule6Compliance(currentInspectionId, extractionData);

      // Persist inspection_items & rule_checks to Supabase PostgreSQL under active RLS
      await saveInspectionItems(items);
      await saveRuleChecks(checks);

      setStep('ocr_review');
    } catch (err: any) {
      console.error('[ScanWorkflow] OCR analysis error:', err);
      setUploadError(`OCR processing warning: ${err.message || 'Image analysis encountered an issue'}`);
      setStep('ocr_review');
    }
  }, [inspectionId, productName]);

  const handleClearImage = useCallback(async () => {
    if (storagePath) {
      await deleteLabelEvidence(storagePath);
      setStoragePath(null);
      setEvidenceRow(null);
    }
    setImagePreviewUrl(null);
  }, [storagePath]);

  const handleOcrConfirmed = useCallback(() => {
    setStep('checklist');
  }, []);

  const handleSaveDraft = useCallback(async () => {
    const res = await updateInspectionStatus(inspectionId, 'draft', productName, isImported);
    if (res.error) {
      alert(`Draft update warning: ${res.error}`);
    } else {
      alert(`Draft saved! (Persisted evidence: ${storagePath || 'local'})`);
    }
  }, [inspectionId, productName, isImported, storagePath]);

  const handleSubmitForReview = useCallback(async () => {
    const res = await updateInspectionStatus(inspectionId, 'pending_review', productName, isImported);
    if (res.error) {
      alert(`Submission warning: ${res.error}`);
    }
    setStep('submit');
  }, [inspectionId, productName, isImported]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setInspectionId(crypto.randomUUID());
    setStoragePath(null);
    setEvidenceRow(null);
    setImagePreviewUrl(null);
    setProductName('');
    setIsImported(false);
    setOcrResult(null);
    setExtractionResult(null);
    setHighlightedRuleId(null);
    setIsUploading(false);
    setUploadError(null);
  }, []);

  // Build declarations from extracted fields + rules
  const declarations = MOCK_RULES.map((rule) => {
    const fieldKey = ruleToFieldKey(rule.id);
    const field = fieldKey ? extractionResult?.fields[fieldKey] : undefined;
    return {
      id: `decl_${rule.id}`,
      inspection_id: inspectionId,
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
          <ImageUploader
            onImageSelected={handleImageSelected}
            onClear={handleClearImage}
            isUploading={isUploading}
            uploadError={uploadError}
          />
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

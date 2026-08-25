// Label Ledger — Main Scan & Verification Workflow Component
'use client';

import { useState, useCallback } from 'react';
import { Upload, Cpu, Search, CheckCircle2 } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { AnalysisLoader } from './AnalysisLoader';
import { OcrReviewPanel } from './OcrReviewPanel';
import { ComplianceChecklist } from './ComplianceChecklist';
import { ScanSubmitPanel } from './ScanSubmitPanel';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../i18n/LanguageProvider';
import { runOCR } from '@/lib/ocr/engine';
import { extractLegalMetrologyFields } from '@/lib/ocr/extractor';
import { fuseTesseractAndGemini } from '@/lib/ocr/fusion';
import type { GeminiVisionFields } from '@/app/api/ocr/ai-vision/route';
import { evaluateRule6Compliance } from '@/lib/ocr/rules';
import {
  ensureInspectionRecord,
  saveInspectionItems,
  saveRuleChecks,
  saveLabelEvidenceRecord,
  updateInspectionStatus,
} from '@/lib/supabase/inspections';
import { uploadLabelEvidence, createLabelEvidenceSignedUrl, deleteLabelEvidence } from '@/lib/supabase/storage';
import { MOCK_RULES } from '../../lib/mock/data';
import { cn } from '../../lib/utils';
import type { OcrResult, ExtractionResult } from '../../lib/types';
import type { DbLabelEvidence } from '@/lib/supabase/inspections';

export type ScanStep = 'upload' | 'analyzing' | 'ocr_review' | 'checklist' | 'submit';

const STEPS: { id: ScanStep; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'upload', labelKey: 'scan.steps.upload', icon: <Upload className="w-3.5 h-3.5" /> },
  { id: 'analyzing', labelKey: 'scan.steps.analyzing', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'ocr_review', labelKey: 'scan.steps.review', icon: <Search className="w-3.5 h-3.5" /> },
  { id: 'checklist', labelKey: 'scan.steps.checklist', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: 'submit', labelKey: 'scan.steps.submit', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

const STEP_ORDER: ScanStep[] = ['upload', 'analyzing', 'ocr_review', 'checklist', 'submit'];

export function ScanWorkflow() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<ScanStep>('upload');
  const [inspectionId, setInspectionId] = useState<string>(() => crypto.randomUUID());
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [evidenceRow, setEvidenceRow] = useState<DbLabelEvidence | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Real OCR pipeline stage for AnalysisLoader progress
  const [ocrStage, setOcrStage] = useState<number>(0);

  const [productName, setProductName] = useState('');
  const [isImported, setIsImported] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);

  // Handle label image upload, run real dynamic OCR, and persist to PostgreSQL
  const handleImageSelected = useCallback(async (file: File, localPreviewUrl: string) => {
    setIsUploading(true);
    setUploadError(null);

    // Reset previous scan state cleanly
    setOcrResult(null);
    setExtractionResult(null);
    setHighlightedRuleId(null);
    setStoragePath(null);
    setEvidenceRow(null);

    // Generate fresh candidate UUID for scan session
    const candidateId = crypto.randomUUID();

    // Validate file format
    if (!file || file.size === 0 || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid non-empty image file.');
      setIsUploading(false);
      return;
    }

    // Ensure parent inspection record exists in public.inspections first and capture returned DB record ID
    const ensureRes = await ensureInspectionRecord(candidateId, file.name.split('.')[0] || 'Packaged Commodity');
    if (ensureRes.error || !ensureRes.data) {
      console.error('[ScanWorkflow] Database inspection record creation failed:', ensureRes.error);
      setUploadError(ensureRes.error || 'Failed to create database inspection record. Please ensure you are signed in.');
      toast({
        variant: 'error',
        title: 'Inspection Creation Failed',
        description: ensureRes.error || 'Failed to create database inspection record.',
      });
      setIsUploading(false);
      return;
    }

    const activeInspectionId = ensureRes.data.id;
    setInspectionId(activeInspectionId);

    console.log('[ScanWorkflow] Selected file for OCR:', file.name, 'Size:', file.size, 'ActiveInspectionId:', activeInspectionId);

    // 1. Upload to Supabase Storage: label-evidence bucket under path {inspection_id}/{filename}
    const uploadRes = await uploadLabelEvidence({
      inspectionId: activeInspectionId,
      file,
      fileName: file.name,
      contentType: file.type,
    });

    if (uploadRes.error || !uploadRes.data) {
      console.warn('[ScanWorkflow] Storage upload notice:', uploadRes.error);
      setImagePreviewUrl(localPreviewUrl);
    } else {
      const path = uploadRes.data;
      setStoragePath(path);

      // Persist evidence record into public.label_evidence
      const dbRes = await saveLabelEvidenceRecord({
        inspectionId: activeInspectionId,
        storagePath: path,
        productName: file.name.split('.')[0] || 'Packaged Commodity',
      });

      if (dbRes.error) {
        console.warn('[ScanWorkflow] Database evidence persistence notice:', dbRes.error);
      } else if (dbRes.data) {
        setEvidenceRow(dbRes.data);
      }

      // Generate temporary signed URL for viewing private evidence object
      const signedRes = await createLabelEvidenceSignedUrl(path);
      if (signedRes.data) {
        setImagePreviewUrl(signedRes.data);
      } else {
        setImagePreviewUrl(localPreviewUrl);
      }
    }

    setIsUploading(false);
    setStep('analyzing');
    setOcrStage(0);

    try {
      // Stage 0: Running Tesseract OCR
      setOcrStage(0);
      const ocrData = await runOCR(file);
      setOcrResult(ocrData);

      // Stage 1: Running Gemini 2.5 Flash Vision API extraction
      setOcrStage(1);
      let geminiFields: GeminiVisionFields | null = null;
      try {
        const base64 = await fileToBase64(file);
        const aiRes = await fetch('/api/ocr/ai-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          if (aiJson.fields) {
            geminiFields = aiJson.fields;
            console.log('[ScanWorkflow] Gemini 2.5 Flash extraction:', geminiFields);
          }
        } else {
          console.warn('[ScanWorkflow] /api/ocr/ai-vision API notice:', aiRes.status);
        }
      } catch (aiErr) {
        console.warn('[ScanWorkflow] Gemini Vision call notice (falling back to Tesseract):', aiErr);
      }

      // Stage 2: Fuse Tesseract & Gemini outputs
      setOcrStage(2);
      const extractionData = fuseTesseractAndGemini(ocrData, geminiFields);
      setExtractionResult(extractionData);

      // Sanitize product_name: if product name contains garbled regulatory preamble (e.g. Marketed By, Address, Lic No, =), clear it
      const rawProdName = extractionData.fields.product_name?.value || '';
      const isGarbledPreamble = /MARKETED BY|MANUFACTURED BY|ADDRESS|LIC NO|SUCROSE|LACTOSE|=|OE RE/i.test(rawProdName);
      if (rawProdName && !isGarbledPreamble) {
        setProductName(rawProdName);
      } else {
        delete extractionData.fields.product_name;
        setProductName('');
      }

      // Stage 3: Rule 6 compliance evaluation
      setOcrStage(3);
      const { items, checks } = evaluateRule6Compliance(activeInspectionId, extractionData);

      // Persist inspection_items & rule_checks to Supabase PostgreSQL under active RLS
      await saveInspectionItems(items);
      await saveRuleChecks(checks);

      setStep('ocr_review');
    } catch (err: any) {
      console.error('[ScanWorkflow] OCR analysis error:', err);
      setUploadError(`OCR processing warning: ${err.message || 'Image analysis encountered an issue'}`);
      toast({
        variant: 'warning',
        title: 'OCR Warning',
        description: err.message || 'Image analysis encountered an issue. Review extracted fields carefully.',
      });
      setStep('ocr_review');
    }
  }, []);

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
      toast({
        variant: 'error',
        title: 'Draft Not Saved',
        description: res.error,
      });
    } else {
      toast({
        variant: 'success',
        title: 'Draft Saved',
        description: `Inspection ${inspectionId.slice(0, 8)}… saved as draft.`,
      });
    }
  }, [inspectionId, productName, isImported, toast]);

  const handleSubmitForReview = useCallback(async () => {
    const res = await updateInspectionStatus(inspectionId, 'pending_review', productName, isImported);
    if (res.error) {
      toast({
        variant: 'error',
        title: 'Submission Failed',
        description: res.error,
      });
      return;
    }
    toast({
      variant: 'success',
      title: 'Submitted for Review',
      description: 'An enforcement officer will verify this inspection.',
    });
    setStep('submit');
  }, [inspectionId, productName, isImported, toast]);

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
    setOcrStage(0);
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
        {step === 'upload' && <h1 className="text-xl md:text-2xl font-bold text-[var(--lg-navy)]">{t('scan.title')}</h1>}
        {step === 'analyzing' && <h1 className="text-xl md:text-2xl font-bold text-[var(--lg-navy)]">{t('scan.title')}</h1>}
        {step === 'ocr_review' && <h1 className="text-xl md:text-2xl font-bold text-[var(--lg-navy)]">{t('scan.review.title')}</h1>}
        {step === 'checklist' && <h1 className="text-xl md:text-2xl font-bold text-[var(--lg-navy)]">{t('compliance.rule6Evaluation')}</h1>}
        {step === 'submit' && <h1 className="text-xl md:text-2xl font-bold text-[var(--lg-navy)]">{t('scan.submitPanel.success')}</h1>}
        
        {(step === 'upload' || step === 'analyzing') && (
          <p className="text-sm text-[var(--lg-muted)] mt-1">{t('scan.subtitle')}</p>
        )}
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
          <AnalysisLoader imageUrl={imagePreviewUrl} currentStage={ocrStage} />
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
            inspectionId={inspectionId}
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
  const { t } = useLanguage();
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
                    ? 'bg-[var(--lg-blue)] border-[var(--lg-blue)] text-white'
                    : isActive
                    ? 'bg-[var(--lg-blue)]/20 border-[var(--lg-blue)]/60 text-[var(--lg-blue)] ring-2 ring-[var(--lg-blue)]/30 ring-offset-1 ring-offset-[#0F1117]'
                    : 'bg-white border-[var(--lg-border)] text-[var(--lg-muted)]',
                )}
              >
                {isDone ? '✓' : s.icon}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive ? 'text-[var(--lg-blue)]' : isDone ? 'text-[var(--lg-muted)]' : 'text-[var(--lg-muted)]',
                )}
              >
                {t(s.labelKey)}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-px w-6 sm:w-8 mx-1 transition-colors duration-300',
                  idx < currentIdx ? 'bg-[var(--lg-blue)]' : 'bg-[var(--lg-border)]',
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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

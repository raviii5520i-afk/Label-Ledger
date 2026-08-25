'use client';

import { useState, useRef, useCallback } from 'react';
import { Info, Edit2, CheckCircle2, XCircle, Globe2, AlertTriangle, Search, Check, ChevronRight, Package, MinusCircle, HelpCircle, Cpu, Clock, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import type { OcrResult, ExtractionResult } from '../../lib/types';
import { useLanguage } from '../../i18n/LanguageProvider';

// All Legal Metrology Rule 6 & extended declaration fields
const RULE6_FIELD_DISPLAY: Array<{
  key: keyof ExtractionResult['fields'];
  label: string;
  ruleClause: string;
  mandatory: boolean;
}> = [
  { key: 'product_name',         label: 'Product Name',           ruleClause: '6(1)(a)', mandatory: true },
  { key: 'net_quantity',         label: 'Net Quantity',           ruleClause: '6(1)(b)', mandatory: true },
  { key: 'mfg_date',             label: 'Mfg. Date',             ruleClause: '6(1)(c)', mandatory: true },
  { key: 'mrp',                  label: 'MRP',                   ruleClause: '6(1)(d)', mandatory: true },
  { key: 'manufacturer_address', label: 'Manufacturer/Packer',   ruleClause: '6(1)(e)', mandatory: true },
  { key: 'consumer_care',        label: 'Consumer Care',         ruleClause: '6(1)(f)', mandatory: true },
  { key: 'country_of_origin',    label: 'Country of Origin',     ruleClause: '6(1)(g)', mandatory: false },
  { key: 'expiry_date',          label: 'Best Before / Expiry',  ruleClause: '6(1)(h)', mandatory: false },
  { key: 'batch_number',         label: 'Batch / Lot No.',       ruleClause: '6(1)(i)', mandatory: true },
  { key: 'fssai_license',        label: 'FSSAI Lic. No.',        ruleClause: '6(1)(j)', mandatory: false },
];

interface OcrReviewPanelProps {
  imageUrl: string;
  ocrResult: OcrResult;
  extractionResult: ExtractionResult | null;
  productName: string;
  isImported: boolean;
  onProductNameChange: (v: string) => void;
  onIsImportedChange: (v: boolean) => void;
  onConfirm: () => void;
  highlightedRuleId: string | null;
}

export function OcrReviewPanel({
  imageUrl,
  ocrResult,
  extractionResult,
  productName,
  isImported,
  onProductNameChange,
  onIsImportedChange,
  onConfirm,
}: OcrReviewPanelProps) {
  const { t } = useLanguage();
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });
  const imgRef = useRef<HTMLImageElement>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleImgLoad = useCallback(() => {
    if (imgRef.current) {
      setImgSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, []);

  const bboxes = extractionResult
    ? Object.entries(extractionResult.fields)
        .filter(([, f]) => f?.bbox)
        .map(([key, f]) => ({
          id: key,
          bbox: f!.bbox!,
          label: RULE6_FIELD_DISPLAY.find(d => d.key === key)?.label ?? key,
          confidence: f!.confidence,
          isHighlighted: false,
        }))
    : [];

  const detectedCount = extractionResult
    ? Object.values(extractionResult.fields).filter(f => f?.value).length
    : 0;

  const totalWords = ocrResult.words.length;
  const avgConfidence = totalWords > 0
    ? ocrResult.words.reduce((s, w) => s + w.confidence, 0) / totalWords
    : 0;

  const noTextDetected = !ocrResult.raw_text?.trim() || totalWords === 0;
  const isValid = productName.trim().length > 0;
  const diagnostics = ocrResult.diagnostics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Left Column: Image & Bounding Boxes ───────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest">Label Image</p>
          <span className="text-[10px] text-[var(--lg-muted)]">Coloured boxes = detected fields</span>
        </div>

        <div className="bg-white border border-[var(--lg-border)] rounded-xl overflow-hidden">
          <BoundingBoxOverlay
            imageUrl={imageUrl}
            imageNaturalSize={imgSize}
            boxes={bboxes}
            onImgLoad={handleImgLoad}
            imgRef={imgRef}
          />
        </div>

        {/* OCR Summary & Developer Diagnostics toggle */}
        <div className="bg-white border border-[var(--lg-border)] rounded-xl p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--lg-muted)]">
            <span>
              Words:{' '}
              <span className={cn('font-mono font-semibold', totalWords > 0 ? 'text-[var(--lg-navy)]' : 'text-red-700')}>
                {totalWords}
              </span>
            </span>
            {totalWords > 0 && (
              <span>
                Avg Confidence:{' '}
                <span className={cn(
                  'font-mono font-semibold',
                  avgConfidence >= 0.85 ? 'text-emerald-400' : avgConfidence >= 0.60 ? 'text-amber-700' : 'text-red-700'
                )}>
                  {Math.round(avgConfidence * 100)}%
                </span>
              </span>
            )}
            <span>
              Detected:{' '}
              <span className="font-mono text-[var(--lg-navy)]">{detectedCount} / {RULE6_FIELD_DISPLAY.length}</span>
            </span>

            {diagnostics && (
              <button
                onClick={() => setShowDiagnostics(p => !p)}
                className="text-[11px] font-mono text-[var(--lg-blue)] hover:text-[var(--lg-blue)] flex items-center gap-1 ml-auto"
              >
                <Cpu className="w-3.5 h-3.5" />
                {showDiagnostics ? 'Hide Dev Diagnostics' : 'Dev Diagnostics'}
              </button>
            )}
          </div>

          {/* Developer Diagnostics Drawer */}
          {diagnostics && showDiagnostics && (
            <div className="pt-2 border-t border-[var(--lg-border)] text-[11px] font-mono space-y-1 text-[var(--lg-muted)] bg-[var(--lg-background)]/80 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-[var(--lg-blue)] font-semibold mb-1">
                <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Multi-Pass OCR Pipeline</span>
                <span className="text-[var(--lg-muted)]">{diagnostics.durationMs}ms</span>
              </div>
              <div>Passes Executed: <span className="text-[var(--lg-navy)]">{diagnostics.passCount}</span></div>
              <div>Best Variant Selected: <span className="text-emerald-400 font-bold">{diagnostics.bestVariant}</span></div>
              <div>Variants Processed: <span className="text-[var(--lg-navy)]">{diagnostics.preprocessingVariants.join(', ')}</span></div>
            </div>
          )}
        </div>

        {noTextDetected && (
          <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed">
              <span className="font-semibold">No text detected.</span> The image may be blurry or low-resolution.
              Please enter field values manually below.
            </div>
          </div>
        )}
      </div>

      {/* ── Right Column: Raw Text & Extracted Fields ───────────── */}
      <div className="space-y-4">
        {/* Raw OCR Text */}
        <div>
          <p className="text-xs font-semibold text-[var(--lg-muted)] uppercase tracking-widest mb-2">
            Raw OCR Output
          </p>
          {noTextDetected ? (
            <div className="bg-[var(--lg-background)] border border-red-800/40 rounded-xl p-4 text-xs text-red-700 italic">
              No text extracted from this image.
            </div>
          ) : (
            <div className="bg-[var(--lg-background)] border border-[var(--lg-border)] rounded-xl p-3 font-mono text-xs text-[var(--lg-navy)] leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {ocrResult.raw_text}
            </div>
          )}
        </div>

        {/* Product Metadata Input */}
        <div className="bg-white border border-[var(--lg-border)] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--lg-navy)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--lg-blue)]" />
              {t('scan.review.title')}
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-800/40">
              {t('compliance.reviewRequired')}
            </span>
          </div>

          <div>
            <label htmlFor="ll-product-name" className="block text-xs font-medium text-[var(--lg-muted)] mb-1.5">
              Product name <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--lg-muted)]" />
              <input
                id="ll-product-name"
                type="text"
                value={productName}
                onChange={e => onProductNameChange(e.target.value)}
                placeholder={extractionResult?.fields.product_name?.value ?? 'Enter product name'}
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--lg-background)] border border-[var(--lg-border)] rounded-lg text-sm text-[var(--lg-navy)] placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-[var(--lg-blue)]"
              />
            </div>
            {extractionResult?.fields.product_name && (
              <button
                type="button"
                onClick={() => onProductNameChange(extractionResult.fields.product_name!.value)}
                className="mt-1.5 text-[11px] text-[var(--lg-blue)] hover:text-[var(--lg-blue)] flex items-center gap-1"
              >
                Use extracted: &quot;{extractionResult.fields.product_name.value}&quot;
                {' '}({Math.round(extractionResult.fields.product_name.confidence * 100)}% conf)
              </button>
            )}
          </div>

          <div className="flex items-start gap-3 pt-1">
            <button
              id="ll-imported-toggle"
              role="switch"
              type="button"
              aria-checked={isImported}
              onClick={() => onIsImportedChange(!isImported)}
              className={cn(
                'relative mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                isImported ? 'bg-[var(--lg-blue)]' : 'bg-[var(--lg-border)]',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                  isImported ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
            <div>
              <label htmlFor="ll-imported-toggle" className="text-xs font-medium text-[var(--lg-navy)] cursor-pointer flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[var(--lg-muted)]" />
                {t('scan.review.imported')}
              </label>
              <p className="text-[11px] text-[var(--lg-muted)] mt-0.5">
                Enables &quot;Country of origin&quot; as mandatory
              </p>
            </div>
          </div>
        </div>

        {/* Rule 6 Extracted Fields List */}
        <div className="bg-white border border-[var(--lg-border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[var(--lg-navy)]">
              Rule 6 Fields ({detectedCount}/{RULE6_FIELD_DISPLAY.length} detected)
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[var(--lg-muted)]">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> High</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Med</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Low</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {RULE6_FIELD_DISPLAY.map(({ key, label, ruleClause, mandatory }) => {
              const field = extractionResult?.fields[key];
              const isDetected = !!(field?.value);
              const confidence = field?.confidence ?? 0;
              const isLowConfidence = isDetected && confidence < 0.60;
              const isExpanded = expandedField === key;

              return (
                <div key={key}>
                  <button
                    type="button"
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors border',
                      isExpanded
                        ? 'bg-[var(--lg-background)] border-[var(--lg-blue)]/50'
                        : isLowConfidence
                        ? 'bg-amber-950/20 border-amber-800/40 hover:bg-amber-950/40'
                        : 'bg-[#141722] border-transparent hover:bg-[var(--lg-background)]',
                    )}
                    onClick={() => setExpandedField(isExpanded ? null : key)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-[var(--lg-muted)] shrink-0">{ruleClause}</span>
                      <span className="text-xs text-[var(--lg-navy)] truncate font-medium">{label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDetected ? (
                        <>
                          <span className="text-xs font-mono text-[var(--lg-blue)] max-w-[130px] truncate">
                            {field!.value}
                          </span>
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold',
                            confidence >= 0.85
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                              : confidence >= 0.60
                              ? 'bg-amber-950 text-amber-700 border border-amber-800/50'
                              : 'bg-red-950 text-red-700 border border-red-800/50'
                          )}>
                            {Math.round(confidence * 100)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[var(--lg-muted)] italic">Not detected</span>
                      )}
                    </div>
                  </button>

                  {/* Expanded Field Details Panel */}
                  {isExpanded && (
                    <div className="mx-1 my-1 p-3 bg-[var(--lg-background)] rounded-lg border border-[var(--lg-border)] text-xs text-[var(--lg-muted)] space-y-1.5 font-mono">
                      {isDetected ? (
                        <>
                          <div>
                            <span className="text-[var(--lg-muted)]">Value: </span>
                            <span className="text-[var(--lg-navy)] font-bold">{field!.value}</span>
                          </div>
                          <div>
                            <span className="text-[var(--lg-muted)]">Confidence: </span>
                            <span className={cn(
                              'font-bold',
                              confidence >= 0.85 ? 'text-emerald-400' : confidence >= 0.60 ? 'text-amber-700' : 'text-red-700'
                            )}>
                              {Math.round(confidence * 100)}% ({confidence >= 0.85 ? 'HIGH' : confidence >= 0.60 ? 'MEDIUM' : 'LOW'})
                            </span>
                          </div>
                          {isLowConfidence && (
                            <div className="flex items-center gap-1 text-amber-700 font-sans text-[11px] pt-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              ⚠ Needs verification — Low confidence extraction
                            </div>
                          )}
                          {field!.sourceText && (
                            <div className="text-[11px] text-[var(--lg-muted)]">
                              <span className="text-[var(--lg-muted)]">Source: </span>
                              <span className="italic">&quot;{field!.sourceText}&quot;</span>
                            </div>
                          )}
                          {field!.bbox && (
                            <div className="text-[10px] text-[var(--lg-muted)]">
                              BBox: x={field!.bbox.x.toFixed(3)} y={field!.bbox.y.toFixed(3)} w={field!.bbox.w.toFixed(3)} h={field!.bbox.h.toFixed(3)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={cn('text-xs font-sans', mandatory ? 'text-red-700' : 'text-[var(--lg-muted)]')}>
                          {mandatory
                            ? '⚠ Mandatory declaration missing from OCR text. Review image carefully.'
                            : 'Conditional declaration not detected.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={!isValid}
          className="w-full py-3 text-sm font-semibold"
          rightIcon={<Check className="w-4 h-4" />}
        >
          {t('scan.review.confirm')}
        </Button>
        {!isValid && (
          <p className="text-xs text-amber-700 text-center">Enter product name to continue</p>
        )}
      </div>
    </div>
  );
}

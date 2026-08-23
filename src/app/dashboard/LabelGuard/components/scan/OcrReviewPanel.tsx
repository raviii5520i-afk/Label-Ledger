'use client';

import { useState, useRef, useCallback } from 'react';
import { ChevronRight, Package, Globe2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import type { OcrResult, ExtractionResult } from '../../lib/types';

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
  highlightedRuleId,
}: OcrReviewPanelProps) {
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

  // Build bbox list from extraction fields
  const bboxes = extractionResult
    ? Object.entries(extractionResult.fields)
        .filter(([, f]) => f?.bbox)
        .map(([key, f]) => ({
          id: key,
          bbox: f!.bbox!,
          label: fieldKeyToLabel(key),
          confidence: f!.confidence,
          isHighlighted: false,
        }))
    : [];

  const isValid = productName.trim().length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Image + bounding boxes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Label Image</p>
          <span className="text-[10px] text-slate-600">Hover fields to highlight</span>
        </div>
        <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl overflow-hidden">
          <BoundingBoxOverlay
            imageUrl={imageUrl}
            imageNaturalSize={imgSize}
            boxes={bboxes}
            onImgLoad={handleImgLoad}
            imgRef={imgRef}
          />
        </div>

        {/* OCR confidence summary */}
        <div className="flex items-center gap-4 text-xs text-slate-500 px-1">
          <span>OCR words: <span className="text-slate-300 font-mono">{ocrResult.words.length}</span></span>
          <span>Avg confidence: <span className="text-emerald-400 font-mono">
            {Math.round(ocrResult.words.reduce((s, w) => s + w.confidence, 0) / ocrResult.words.length * 100)}%
          </span></span>
        </div>
      </div>

      {/* Right: Raw OCR text + product metadata form */}
      <div className="space-y-4">
        {/* Raw OCR Text */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Raw OCR Output
          </p>
          <div className="bg-[#0F1117] border border-[#2E3147] rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
            {ocrResult.raw_text}
          </div>
        </div>

        {/* Product Metadata */}
        <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl p-4 space-y-4">
          <p className="text-xs font-semibold text-slate-300">Product Information</p>

          {/* Product name */}
          <div>
            <label htmlFor="ll-product-name" className="block text-xs font-medium text-slate-500 mb-1.5">
              Product name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                id="ll-product-name"
                type="text"
                value={productName}
                onChange={e => onProductNameChange(e.target.value)}
                placeholder={extractionResult?.fields.product_name?.value ?? 'Enter product name'}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {extractionResult?.fields.product_name && (
              <button
                onClick={() => onProductNameChange(extractionResult.fields.product_name!.value)}
                className="mt-1.5 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                Use extracted: &quot;{extractionResult.fields.product_name.value}&quot;
              </button>
            )}
          </div>

          {/* Imported toggle */}
          <div className="flex items-start gap-3">
            <button
              id="ll-imported-toggle"
              role="switch"
              aria-checked={isImported}
              onClick={() => onIsImportedChange(!isImported)}
              className={cn(
                'relative mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1A1D27]',
                isImported ? 'bg-indigo-600' : 'bg-[#2E3147]',
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
              <label htmlFor="ll-imported-toggle" className="text-xs font-medium text-slate-300 cursor-pointer flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                Imported commodity
              </label>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Enables &quot;Country of origin&quot; as a mandatory declaration
              </p>
            </div>
          </div>
        </div>

        {/* Extracted field summary */}
        {extractionResult && (
          <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-300 mb-3">
              AI Extracted Fields ({Object.keys(extractionResult.fields).length} found)
            </p>
            <div className="space-y-2">
              {Object.entries(extractionResult.fields).map(([key, field]) => (
                <div key={key} className="flex items-start justify-between gap-2">
                  <span className="text-[11px] text-slate-500 shrink-0">{fieldKeyToLabel(key)}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-slate-300 truncate font-mono">
                      {field?.value}
                    </span>
                    <span className={cn(
                      'text-[10px] font-mono shrink-0',
                      (field?.confidence ?? 0) >= 0.85 ? 'text-emerald-400' :
                      (field?.confidence ?? 0) >= 0.60 ? 'text-amber-400' : 'text-red-400',
                    )}>
                      {Math.round((field?.confidence ?? 0) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm button */}
        <Button
          onClick={onConfirm}
          disabled={!isValid}
          className="w-full"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Proceed to Compliance Checklist
        </Button>
        {!isValid && (
          <p className="text-[11px] text-amber-400 text-center">Enter product name to continue</p>
        )}
      </div>
    </div>
  );
}

function fieldKeyToLabel(key: string): string {
  const map: Record<string, string> = {
    product_name: 'Product Name',
    net_quantity: 'Net Quantity',
    mrp: 'MRP',
    mfg_date: 'Mfg. Date',
    expiry_date: 'Best Before',
    batch_number: 'Batch No.',
    manufacturer_address: 'Manufacturer',
    consumer_care: 'Consumer Care',
    country_of_origin: 'Country of Origin',
    fssai_license: 'FSSAI Lic. No.',
    bar_code: 'Barcode',
  };
  return map[key] ?? key;
}

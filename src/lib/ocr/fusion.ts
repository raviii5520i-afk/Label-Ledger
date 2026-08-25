// Label Ledger — Hybrid Tesseract + Gemini Vision Fusion Engine
// Combines Tesseract 2D spatial word tokens & bounding boxes with Gemini Vision semantic text extraction.
// STRICT GUARANTEE: Never lets Tesseract OCR garbled noise override Gemini's high-precision extraction.

import type { OcrResult, OcrWord, ExtractionResult, ExtractedField, BBox } from '@/app/dashboard/LabelGuard/lib/types';
import type { GeminiVisionFields } from '@/app/api/ocr/ai-vision/route';
import { extractLegalMetrologyFields } from './extractor';

export type EvidenceState = 'GEMINI_CONFIRMED' | 'TESSERACT_CONFIRMED' | 'CONFLICT' | 'UNREADABLE' | 'MISSING';

export interface FusionResult extends ExtractionResult {
  evidenceStates?: Record<keyof ExtractionResult['fields'], EvidenceState>;
}

/**
 * Fuses Tesseract.js spatial OCR output with Gemini AI Vision semantic extraction.
 */
export function fuseTesseractAndGemini(
  ocr: OcrResult,
  geminiFields: GeminiVisionFields | null
): FusionResult {
  const tesseractResult = extractLegalMetrologyFields(ocr);
  const words = ocr.words || [];

  if (!geminiFields) {
    const states: Record<string, EvidenceState> = {};
    for (const key of Object.keys(tesseractResult.fields)) {
      states[key] = 'TESSERACT_CONFIRMED';
    }
    return {
      ...tesseractResult,
      evidenceStates: states as Record<keyof ExtractionResult['fields'], EvidenceState>,
    };
  }

  const fusedFields: ExtractionResult['fields'] = {};
  const evidenceStates: Record<string, EvidenceState> = {};

  const keys: (keyof GeminiVisionFields)[] = [
    'product_name',
    'net_quantity',
    'mrp',
    'usp',
    'mfg_date',
    'expiry_date',
    'batch_number',
    'manufacturer_address',
    'marketed_by',
    'consumer_care',
    'country_of_origin',
    'fssai_license',
  ] as (keyof GeminiVisionFields)[];

  for (const key of keys) {
    const geminiVal = geminiFields[key]?.trim() || null;
    const tessField = tesseractResult.fields[key as keyof ExtractionResult['fields']];
    const tessVal = tessField?.value?.trim() || null;
    const tessBbox = tessField ? tessField.bbox : undefined;

    if (geminiVal && tessVal) {
      const relation = evaluateRelation(key, geminiVal, tessVal, tessField?.confidence ?? 0);

      if (relation === 'AGREE' || relation === 'TESSERACT_GARBLED') {
        // CASE A: Gemini value is primary & clean
        const matchedBbox = findBboxForValue(words, geminiVal) || tessBbox;
        fusedFields[key as keyof ExtractionResult['fields']] = {
          value: geminiVal,
          confidence: 0.95,
          bbox: matchedBbox,
          sourceText: `Extracted by Gemini AI Vision: "${geminiVal}"`,
          confidenceCategory: 'HIGH',
          validationStatus: 'VALID',
        };
        evidenceStates[key] = 'GEMINI_CONFIRMED';
      } else {
        // CASE B: True Conflict — Both systems extracted different valid values
        const matchedBbox = findBboxForValue(words, geminiVal) || tessBbox;
        fusedFields[key as keyof ExtractionResult['fields']] = {
          value: geminiVal,
          confidence: 0.50,
          bbox: matchedBbox,
          sourceText: `⚠ Conflict — Gemini: "${geminiVal}" vs Tesseract: "${tessVal}". Verification required.`,
          confidenceCategory: 'LOW',
          validationStatus: 'UNCERTAIN',
        };
        evidenceStates[key] = 'CONFLICT';
      }
    } else if (geminiVal) {
      // CASE C: Gemini extracted value, Tesseract did not detect
      const matchedBbox = findBboxForValue(words, geminiVal);
      fusedFields[key as keyof ExtractionResult['fields']] = {
        value: geminiVal,
        confidence: 0.92,
        bbox: matchedBbox,
        sourceText: `Extracted by Gemini AI Vision: "${geminiVal}"`,
        confidenceCategory: 'HIGH',
        validationStatus: 'VALID',
      };
      evidenceStates[key] = 'GEMINI_CONFIRMED';
    } else if (tessVal && tessField) {
      // CASE D: Tesseract extracted value, Gemini returned null
      fusedFields[key as keyof ExtractionResult['fields']] = {
        ...tessField,
        sourceText: `Tesseract fallback: "${tessVal}"`,
        confidenceCategory: tessField.confidence >= 0.85 ? 'HIGH' : tessField.confidence >= 0.60 ? 'MEDIUM' : 'LOW',
      };
      evidenceStates[key] = 'TESSERACT_CONFIRMED';
    } else {
      // CASE E: MISSING / UNREADABLE in both
      evidenceStates[key] = 'MISSING';
    }
  }

  return {
    fields: fusedFields,
    evidenceStates: evidenceStates as Record<keyof ExtractionResult['fields'], EvidenceState>,
  };
}

function evaluateRelation(
  fieldKey: string,
  gVal: string,
  tVal: string,
  tessConf: number
): 'AGREE' | 'TESSERACT_GARBLED' | 'CONFLICT' {
  const normG = normalizeFieldValue(gVal);
  const normT = normalizeFieldValue(tVal);

  if (normG === normT) return 'AGREE';

  // Check if Tesseract string contains garbled noise characters
  const isGarbled = /[=_{}[\]\\\/]/;
  if (isGarbled.test(tVal) || tessConf < 0.60) {
    return 'TESSERACT_GARBLED';
  }

  // Containment check
  if (normG.includes(normT) || normT.includes(normG)) {
    return 'AGREE';
  }

  // Numeric check (MRP, FSSAI, Batch)
  if (fieldKey === 'mrp' || fieldKey === 'fssai_license' || fieldKey === 'batch_number') {
    const numG = normG.replace(/[^0-9A-Z]/g, '');
    const numT = normT.replace(/[^0-9A-Z]/g, '');
    if (numG === numT) return 'AGREE';
  }

  return 'CONFLICT';
}

function normalizeFieldValue(v: string): string {
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

function findBboxForValue(words: OcrWord[], targetValue: string): BBox | undefined {
  if (!words.length || !targetValue) return undefined;

  const targetTokens = targetValue
    .toUpperCase()
    .split(/\s+/)
    .filter(t => t.length >= 2);

  if (!targetTokens.length) return undefined;

  const matchingWords = words.filter(w =>
    targetTokens.some(t => w.text.toUpperCase().includes(t) || t.includes(w.text.toUpperCase()))
  );

  if (!matchingWords.length) return undefined;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of matchingWords) {
    minX = Math.min(minX, w.bbox.x);
    minY = Math.min(minY, w.bbox.y);
    maxX = Math.max(maxX, w.bbox.x + (w.bbox.w || 0.01));
    maxY = Math.max(maxY, w.bbox.y + (w.bbox.h || 0.01));
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

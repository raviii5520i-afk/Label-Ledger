// Label Ledger — Dynamic Legal Metrology Field Extractor
// Extracts Rule 6 & Healthcare/Pharma declarations dynamically from actual OCR output.
// Uses 2D spatial label-value association, pattern validation, and multi-factor confidence scoring.
// STRICT GUARANTEE: Never uses hardcoded demo product data or fabricated fallbacks.

import type { OcrResult, OcrWord, ExtractionResult, ExtractedField, BBox } from '@/app/dashboard/LabelGuard/lib/types';

/**
 * Extracts Legal Metrology Rule 6 declarations and healthcare product fields from OCR output.
 */
export function extractLegalMetrologyFields(ocr: OcrResult): ExtractionResult {
  const words = ocr.words || [];
  const text = ocr.raw_text || words.map(w => w.text).join(' ');

  if (!text || text.trim().length < 3) {
    return { fields: {} };
  }

  const fields: ExtractionResult['fields'] = {};

  const productName = extractProductName(text, words);
  if (productName) fields.product_name = productName;

  const netQuantity = extractNetQuantity(text, words);
  if (netQuantity) fields.net_quantity = netQuantity;

  const mfgDate = extractMfgDate(text, words);
  if (mfgDate) fields.mfg_date = mfgDate;

  const mrp = extractMRP(text, words);
  if (mrp) fields.mrp = mrp;

  const usp = extractUSP(text, words);
  if (usp) fields.usp = usp;

  const manufacturerAddress = extractManufacturerAddress(text, words);
  if (manufacturerAddress) fields.manufacturer_address = manufacturerAddress;

  const marketedBy = extractMarketedBy(text, words);
  if (marketedBy) fields.marketed_by = marketedBy;

  const consumerCare = extractConsumerCare(text, words);
  if (consumerCare) fields.consumer_care = consumerCare;

  const countryOfOrigin = extractCountryOfOrigin(text, words);
  if (countryOfOrigin) fields.country_of_origin = countryOfOrigin;

  const expiryDate = extractExpiryDate(text, words);
  if (expiryDate) fields.expiry_date = expiryDate;

  const batchNumber = extractBatchNumber(text, words);
  if (batchNumber) fields.batch_number = batchNumber;

  const fssaiLicense = extractFssaiLicense(text, words);
  if (fssaiLicense) fields.fssai_license = fssaiLicense;

  return { fields };
}

// ---------------------------------------------------------------------------
// 2D Spatial & Helper Utilities
// ---------------------------------------------------------------------------

function findKeywordIndex(words: OcrWord[], keywords: string[]): number {
  const upperKeywords = keywords.map(k => k.toUpperCase());
  for (let i = 0; i < words.length; i++) {
    const wUpper = words[i].text.toUpperCase();
    if (upperKeywords.some(k => wUpper.includes(k))) {
      return i;
    }
  }
  return -1;
}

/**
 * Finds words adjacent to a keyword label using 2D bounding box spatial proximity.
 * Looks for words on the same horizontal line (y-delta <= 0.05) or directly below (y-delta <= 0.08).
 */
function collectWordsByProximity(
  words: OcrWord[],
  keywordIndex: number,
  maxWords: number = 8,
  yToleranceSameLine: number = 0.04,
  yToleranceBelow: number = 0.09
): OcrWord[] {
  if (keywordIndex < 0 || keywordIndex >= words.length) return [];
  const keyWord = words[keywordIndex];
  const keyX = keyWord.bbox.x;
  const keyY = keyWord.bbox.y;

  const candidates: { word: OcrWord; score: number }[] = [];

  for (let i = 0; i < words.length; i++) {
    if (i === keywordIndex) continue;
    const w = words[i];

    const dx = w.bbox.x - (keyX + keyWord.bbox.w);
    const dy = Math.abs(w.bbox.y - keyY);

    // 1. Same line to the right
    if (w.bbox.x >= keyX && dy <= yToleranceSameLine && dx <= 0.40) {
      candidates.push({ word: w, score: 1.0 - (dx * 1.5 + dy) });
    }
    // 2. Line immediately below
    else if (w.bbox.y > keyY && (w.bbox.y - keyY) <= yToleranceBelow && Math.abs(w.bbox.x - keyX) <= 0.25) {
      candidates.push({ word: w, score: 0.8 - ((w.bbox.y - keyY) * 2.0 + Math.abs(w.bbox.x - keyX)) });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, maxWords).map(c => c.word);
}

function avgWordConfidence(ws: OcrWord[]): number {
  if (!ws.length) return 0.60;
  return ws.reduce((s, w) => s + w.confidence, 0) / ws.length;
}

function mergeBboxes(ws: OcrWord[]): BBox | undefined {
  if (!ws.length) return undefined;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of ws) {
    minX = Math.min(minX, w.bbox.x);
    minY = Math.min(minY, w.bbox.y);
    maxX = Math.max(maxX, w.bbox.x + (w.bbox.w || 0.01));
    maxY = Math.max(maxY, w.bbox.y + (w.bbox.h || 0.01));
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function categorizeConfidence(conf: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (conf >= 0.85) return 'HIGH';
  if (conf >= 0.60) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// Field Extractor Functions
// ---------------------------------------------------------------------------

/**
 * PRODUCT NAME
 * Extracts product name dynamically from OCR text.
 * NEVER returns hardcoded product values.
 */
function extractProductName(text: string, words: OcrWord[]): ExtractedField | undefined {
  const kwMatch = text.match(
    /(?:COMMODITY|PRODUCT\s+NAME|PRODUCT|NAME\s+OF\s+COMMODITY|BRAND)[:\s]+([^\n,]{3,70})/i
  );
  if (kwMatch) {
    const val = kwMatch[1].trim();
    if (val.length >= 3) {
      const idx = findKeywordIndex(words, ['COMMODITY', 'PRODUCT', 'BRAND']);
      const proxWords = collectWordsByProximity(words, idx, 6);
      const conf = Math.min(0.95, Math.max(0.75, avgWordConfidence(proxWords)));
      return {
        value: val,
        confidence: conf,
        bbox: mergeBboxes(proxWords),
        sourceText: kwMatch[0],
        confidenceCategory: categorizeConfidence(conf),
        validationStatus: 'VALID',
      };
    }
  }

  const REGULATORY_KEYWORDS = /(?:MRP|M\.R\.P|NET|NETT|BATCH|LOT|MFG|MFD|PKD|PACKED|CONSUMER|CUSTOMER|FSSAI|BEST|EXPIRY|EXP|COUNTRY|ORIGIN|MANUFACTURED|MARKETED|HELPLINE|FEEDBACK|USE|BY|LIC|NO|LIC\.NO|ADDRESS|SUCROSE|LACTOSE|GLUCONATE|COLOUR|INS|INGREDIENTS|CONTACT)/i;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const candidates: string[] = [];

  for (const line of lines.slice(0, 8)) {
    const upperLine = line.toUpperCase();
    if (
      line.length >= 3 &&
      line.length <= 80 &&
      !REGULATORY_KEYWORDS.test(upperLine) &&
      !/^[\d\s.,:/\-=]+$/.test(line) &&
      !line.includes('=') &&
      !upperLine.includes('MARKETED BY') &&
      !upperLine.includes('MANUFACTURED BY') &&
      !upperLine.includes('LIC NO') &&
      !upperLine.includes('NET WT')
    ) {
      candidates.push(line);
      if (candidates.length >= 2) break;
    }
  }

  if (candidates.length > 0) {
    const val = candidates.join(' ').trim();
    const matchWords = words.filter(w => val.toUpperCase().includes(w.text.toUpperCase()) && w.text.length >= 3);
    const conf = 0.52;
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(matchWords),
      sourceText: val,
      confidenceCategory: 'LOW',
      validationStatus: 'UNCERTAIN',
    };
  }

  return undefined;
}

/**
 * NET QUANTITY
 * Supports standard weights/volumes (g, kg, ml, L) + healthcare pack specs (e.g. "3 x 10 Tablets = 30 Tablets", "10 Tablets", "30 Capsules", "10 N")
 */
function extractNetQuantity(text: string, words: OcrWord[]): ExtractedField | undefined {
  const patPharma = text.match(
    /(?:NET\s*(?:QUANTITY|QTY|WT\.?|WEIGHT|CONTENT)|CONTENTS?|QTY)[:\s]*([0-9]+\s*(?:x|X)\s*[0-9]+\s*(?:TABLETS?|CAPSULES?|STRIPS?|N|PCS|UNITS?)(?:\s*=\s*[0-9]+\s*(?:TABLETS?|CAPSULES?|N))?|[0-9]+\s*(?:TABLETS?|CAPSULES?|STRIPS?|N|PCS|PIECES?|UNITS?))\b/i
  );
  if (patPharma) {
    const val = patPharma[1].trim();
    const idx = findKeywordIndex(words, ['NET', 'QTY', 'QUANTITY', 'CONTENTS']);
    const proxWords = collectWordsByProximity(words, idx, 6);
    const conf = Math.min(0.96, Math.max(0.85, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: patPharma[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  const patStd = text.match(
    /(?:NET\s*(?:QUANTITY|QTY|WT\.?|WEIGHT|CONTENT)|NETT?\s*WT\.?)[:\s]*([0-9]+(?:\.[0-9]+)?\s*(?:KG|G|GRAMS?|ML|L|LITRES?|LITERS?))\b/i
  );
  if (patStd) {
    const val = patStd[1].trim();
    const idx = findKeywordIndex(words, ['NET', 'NETT', 'QTY', 'WT']);
    const proxWords = collectWordsByProximity(words, idx, 4);
    const conf = Math.min(0.96, Math.max(0.85, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: patStd[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  const patStandalone = text.match(/\b([0-9]+\s*(?:x|X)\s*[0-9]+\s*(?:TABLETS?|CAPSULES?)|[0-9]+(?:\.[0-9]+)?\s*(?:KG|G|ML|L))\b/i);
  if (patStandalone) {
    const val = patStandalone[1].trim();
    const matchWords = words.filter(w => val.toUpperCase().includes(w.text.toUpperCase()));
    const conf = 0.58;
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(matchWords),
      sourceText: patStandalone[0],
      confidenceCategory: 'LOW',
      validationStatus: 'UNCERTAIN',
    };
  }

  return undefined;
}

/**
 * MRP (Maximum Retail Price)
 */
function extractMRP(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:M\.?R\.?P\.?|MAXIMUM\s+RETAIL\s+PRICE)[:\s]*(?:(?:Rs\.?|₹|INR)\s*)?([0-9,]+(?:\.[0-9]{1,2})?)/i
  );
  if (pat) {
    const numStr = pat[1].replace(/,/g, '').trim();
    const num = parseFloat(numStr);

    if (!isNaN(num) && num > 0) {
      const val = `Rs. ${numStr}`;
      const idx = findKeywordIndex(words, ['MRP', 'M.R.P.', 'M.R.P', 'RETAIL']);
      const proxWords = collectWordsByProximity(words, idx, 4);
      const conf = Math.min(0.97, Math.max(0.85, avgWordConfidence(proxWords)));
      return {
        value: val,
        confidence: conf,
        bbox: mergeBboxes(proxWords),
        sourceText: pat[0],
        confidenceCategory: categorizeConfidence(conf),
        validationStatus: 'VALID',
      };
    }
  }

  return undefined;
}

/**
 * USP (Unit Sale Price)
 */
function extractUSP(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:U\.?S\.?P\.?|UNIT\s+SALE\s+PRICE)[:\s]*(?:(?:Rs\.?|₹|INR)\s*)?([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:\/|PER)\s*([A-Za-z0-9]+)/i
  );
  if (pat) {
    const val = `Rs. ${pat[1]} per ${pat[2]}`;
    const idx = findKeywordIndex(words, ['USP', 'UNIT']);
    const proxWords = collectWordsByProximity(words, idx, 5);
    const conf = Math.min(0.95, Math.max(0.80, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: pat[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  return undefined;
}

/**
 * MFG DATE
 */
function extractMfgDate(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:MFD|MFG\.?\s*(?:DATE)?|PKD\.?|PACKED\.?\s*(?:DATE)?|DATE\s+OF\s+(?:MFG|MANUFACTURE|MANUFACTURING|PACKING))[:\s]*([0-9]{1,2}[/.\-][0-9]{1,2}[/.\-][0-9]{2,4}|[0-9]{1,2}[/.\-][0-9]{2,4}|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[./\s\-]*[0-9]{4})/i
  );
  if (pat) {
    const val = pat[1].trim();
    const idx = findKeywordIndex(words, ['MFD', 'MFG', 'PKD', 'PACKED']);
    const proxWords = collectWordsByProximity(words, idx, 3);
    const conf = Math.min(0.96, Math.max(0.85, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: pat[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  return undefined;
}

/**
 * EXPIRY DATE
 */
function extractExpiryDate(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:BEST\s+BEFORE|EXP(?:IRY)?(?:\s+DATE)?|USE\s+BY|USE\s+BEFORE|EXP[:\s])[:\s]*([0-9]{1,2}[/.\-][0-9]{1,2}[/.\-][0-9]{2,4}|[0-9]{1,2}[/.\-][0-9]{2,4}|[0-9]+\s*(?:MONTHS?|DAYS?|YEARS?)|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[./\s\-]*[0-9]{4})/i
  );
  if (pat) {
    const val = pat[1].trim();
    const idx = findKeywordIndex(words, ['BEST', 'EXPIRY', 'EXP', 'USE']);
    const proxWords = collectWordsByProximity(words, idx, 4);
    const conf = Math.min(0.96, Math.max(0.85, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: pat[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  return undefined;
}

/**
 * BATCH / LOT NUMBER
 */
function extractBatchNumber(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:BATCH\s*(?:NO\.?|NUMBER|#)?|LOT\s*(?:NO\.?|NUMBER|#)?|B\.?\s*NO\.?|B\/N)[:\s]+([A-Z0-9][A-Z0-9\-/]{1,20})/i
  );
  if (pat) {
    const val = pat[1].trim();
    if (val.length >= 2) {
      const idx = findKeywordIndex(words, ['BATCH', 'LOT', 'B.NO', 'BNO', 'B/N']);
      const proxWords = collectWordsByProximity(words, idx, 2);
      const conf = Math.min(0.97, Math.max(0.85, avgWordConfidence(proxWords)));
      return {
        value: val,
        confidence: conf,
        bbox: mergeBboxes(proxWords),
        sourceText: pat[0],
        confidenceCategory: categorizeConfidence(conf),
        validationStatus: 'VALID',
      };
    }
  }

  return undefined;
}

/**
 * MANUFACTURED BY & ADDRESS
 */
function extractManufacturerAddress(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:MFG\.?\s*BY|MANUFACTURED\s+(?:AND\s+PACKED\s+)?BY|PACKED\s+BY|PRODUCED\s+BY|MFGD\.?\s+BY)[:\s]+([^\n]{4,120}(?:\n[^\n]{3,100})?)/i
  );
  if (pat) {
    const val = pat[1].replace(/\n/g, ', ').trim();
    if (val.length >= 4) {
      const idx = findKeywordIndex(words, ['MANUFACTURED', 'MFG', 'PACKED', 'MFGD']);
      const proxWords = collectWordsByProximity(words, idx, 10);
      const conf = Math.min(0.95, Math.max(0.78, avgWordConfidence(proxWords)));
      return {
        value: val,
        confidence: conf,
        bbox: mergeBboxes(proxWords),
        sourceText: pat[0].slice(0, 100),
        confidenceCategory: categorizeConfidence(conf),
        validationStatus: 'VALID',
      };
    }
  }

  return undefined;
}

/**
 * MARKETED BY
 */
function extractMarketedBy(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:MARKETED\s+BY|MKT\.?\s*BY|MKTD\.?\s+BY|DISTRIBUTED\s+BY)[:\s]+([^\n]{4,120}(?:\n[^\n]{3,100})?)/i
  );
  if (pat) {
    const val = pat[1].replace(/\n/g, ', ').trim();
    if (val.length >= 4) {
      const idx = findKeywordIndex(words, ['MARKETED', 'MKT', 'DISTRIBUTED']);
      const proxWords = collectWordsByProximity(words, idx, 10);
      const conf = Math.min(0.95, Math.max(0.80, avgWordConfidence(proxWords)));
      return {
        value: val,
        confidence: conf,
        bbox: mergeBboxes(proxWords),
        sourceText: pat[0].slice(0, 100),
        confidenceCategory: categorizeConfidence(conf),
        validationStatus: 'VALID',
      };
    }
  }

  return undefined;
}

/**
 * CONSUMER CARE DETAILS
 */
function extractConsumerCare(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:CONSUMER\s+CARE|CUSTOMER\s+CARE|CONSUMER\s+HELPLINE|HELPLINE|FEEDBACK|COMPLAINTS?|CARE@)[:\s]+([^\n]{3,100})/i
  );
  if (pat) {
    const val = pat[1].trim();
    const idx = findKeywordIndex(words, ['CONSUMER', 'CUSTOMER', 'HELPLINE', 'FEEDBACK', 'COMPLAINTS']);
    const proxWords = collectWordsByProximity(words, idx, 6);
    const conf = Math.min(0.96, Math.max(0.82, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: pat[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  return undefined;
}

/**
 * COUNTRY OF ORIGIN
 */
function extractCountryOfOrigin(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:COUNTRY\s+OF\s+ORIGIN|MADE\s+IN|ORIGIN|MANUFACTURED\s+IN)[:\s]+([A-Za-z ]{2,40})/i
  );
  if (pat) {
    const val = pat[1].trim();
    const idx = findKeywordIndex(words, ['COUNTRY', 'ORIGIN', 'MADE']);
    const proxWords = collectWordsByProximity(words, idx, 3);
    const conf = Math.min(0.98, Math.max(0.88, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: pat[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  return undefined;
}

/**
 * FSSAI LICENSE NUMBER
 */
function extractFssaiLicense(text: string, words: OcrWord[]): ExtractedField | undefined {
  const pat = text.match(
    /(?:FSSAI\s*(?:LIC(?:ENSE|ENCE)?\s*)?(?:NO\.?|NUMBER)?|LIC\.?\s*NO\.?)[:\s]+([0-9]{10,14})/i
  );
  if (pat) {
    const val = pat[1].trim();
    const idx = findKeywordIndex(words, ['FSSAI', 'LIC']);
    const proxWords = collectWordsByProximity(words, idx, 3);
    const conf = Math.min(0.98, Math.max(0.88, avgWordConfidence(proxWords)));
    return {
      value: val,
      confidence: conf,
      bbox: mergeBboxes(proxWords),
      sourceText: pat[0],
      confidenceCategory: categorizeConfidence(conf),
      validationStatus: 'VALID',
    };
  }

  const standalone = text.match(/\b([0-9]{14})\b/);
  if (standalone) {
    const val = standalone[1];
    const matchWords = words.filter(w => w.text.includes(val));
    return {
      value: val,
      confidence: 0.55,
      bbox: mergeBboxes(matchWords),
      sourceText: val,
      confidenceCategory: 'LOW',
      validationStatus: 'UNCERTAIN',
    };
  }

  return undefined;
}

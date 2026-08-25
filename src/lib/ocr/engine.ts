// Label Ledger — Advanced Multi-Pass OCR Engine
// Uses Tesseract.js (v5) with browser Canvas API preprocessing pipelines.
// NO hardcoded product data. NO filename-based detection. NO fabricated values.
// If OCR cannot read the image, returns empty OcrResult — never fabricates data.

import type { OcrResult, OcrWord, BBox, OcrDiagnostics } from '@/app/dashboard/LabelGuard/lib/types';

// ---------------------------------------------------------------------------
// Image Preprocessing (Canvas API — Zero External Dependencies)
// ---------------------------------------------------------------------------

interface PreprocessedVariant {
  dataUrl: string;
  width: number;
  height: number;
  label: string;
}

/**
 * Generates multiple contrast, upscale, grayscale, sharpened, and binarized
 * image variants for OCR. All processing done via native HTML5 Canvas API.
 */
async function preprocessImageForOCR(file: File | Blob): Promise<PreprocessedVariant[]> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return [];

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX_DIM = 3000;
      const MIN_SHORT = 800;
      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (w > MAX_DIM || h > MAX_DIM) {
        const s = MAX_DIM / Math.max(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      if (Math.min(w, h) < MIN_SHORT) {
        const s = MIN_SHORT / Math.min(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }

      const results: PreprocessedVariant[] = [];

      // Pass 1: Original (Resized only)
      try {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        results.push({ dataUrl: c.toDataURL('image/png'), width: w, height: h, label: 'original' });
      } catch { /* skip */ }

      // Pass 2: 2.0x Bilinear Upscale (for tiny FSSAI numbers, batch numbers, MRP)
      try {
        const uw = Math.min(3600, Math.round(w * 1.6));
        const uh = Math.min(3600, Math.round(h * 1.6));
        const c = document.createElement('canvas');
        c.width = uw; c.height = uh;
        const ctx = c.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, uw, uh);
        results.push({ dataUrl: c.toDataURL('image/png'), width: uw, height: uh, label: 'upscaled' });
      } catch { /* skip */ }

      // Pass 3: Grayscale + 1.8x Contrast Enhancement
      try {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h);
        adjustGrayscaleContrast(id, 1.8);
        ctx.putImageData(id, 0, 0);
        results.push({ dataUrl: c.toDataURL('image/png'), width: w, height: h, label: 'gray-1.8x' });
      } catch { /* skip */ }

      // Pass 4: Sharpened / Edge-Enhanced (Unsharp Mask Kernel)
      try {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h);
        applySharpenFilter(id);
        ctx.putImageData(id, 0, 0);
        results.push({ dataUrl: c.toDataURL('image/png'), width: w, height: h, label: 'sharpened' });
      } catch { /* skip */ }

      // Pass 5: Adaptive Binarization / Thresholding (for embossed or dark packaging)
      try {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h);
        applyAdaptiveThreshold(id);
        ctx.putImageData(id, 0, 0);
        results.push({ dataUrl: c.toDataURL('image/png'), width: w, height: h, label: 'binarized' });
      } catch { /* skip */ }

      resolve(results);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve([]);
    };

    img.src = objectUrl;
  });
}

/** Grayscale + contrast enhancement */
function adjustGrayscaleContrast(imageData: ImageData, contrast: number): void {
  const d = imageData.data;
  const c = contrast * 255 - 255;
  const f = (259 * c) / (255 * (259 - c));
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = Math.max(0, Math.min(255, f * (gray - 128) + 128));
    d[i] = v; d[i + 1] = v; d[i + 2] = v;
  }
}

/** Unsharp mask sharpening kernel */
function applySharpenFilter(imageData: ImageData): void {
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const copy = new Uint8ClampedArray(d);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const val =
          5 * copy[idx + c] -
          copy[((y - 1) * w + x) * 4 + c] -
          copy[((y + 1) * w + x) * 4 + c] -
          copy[(y * w + (x - 1)) * 4 + c] -
          copy[(y * w + (x + 1)) * 4 + c];
        d[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
}

/** High-contrast adaptive binarization */
function applyAdaptiveThreshold(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const bw = gray > 135 ? 255 : 0;
    d[i] = bw; d[i + 1] = bw; d[i + 2] = bw;
  }
}

// ---------------------------------------------------------------------------
// Tesseract.js Loader
// ---------------------------------------------------------------------------

async function loadTesseractFromCDN(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).Tesseract) return (window as any).Tesseract;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => resolve((window as any).Tesseract);
    script.onerror = () => {
      console.warn('[OCR] CDN Tesseract script failed to load.');
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// OCR Pass Runner & Deduplication
// ---------------------------------------------------------------------------

interface PassResult {
  variantLabel: string;
  raw_text: string;
  words: OcrWord[];
  avgConfidence: number;
}

async function runTesseractPass(
  Tesseract: any,
  imageSource: string,
  imgWidth: number,
  imgHeight: number,
  label: string
): Promise<PassResult | null> {
  try {
    const worker = await Tesseract.createWorker('eng');
    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    const rawText = (ret?.data?.text ?? '').trim();
    if (!rawText || rawText.length < 3) {
      console.log(`[OCR ${label}] No usable text returned.`);
      return null;
    }

    const iw = ret.data?.imageWidth ?? imgWidth ?? 800;
    const ih = ret.data?.imageHeight ?? imgHeight ?? 600;

    const rawWords: any[] = ret.data?.words ?? [];
    const words: OcrWord[] = rawWords
      .filter((w: any) => w.text && w.text.trim().length > 0)
      .map((w: any) => {
        const bbox: BBox = {
          x: Math.max(0, Math.min(1, (w.bbox?.x0 ?? 0) / iw)),
          y: Math.max(0, Math.min(1, (w.bbox?.y0 ?? 0) / ih)),
          w: Math.max(0.005, Math.min(1, ((w.bbox?.x1 ?? 10) - (w.bbox?.x0 ?? 0)) / iw)),
          h: Math.max(0.005, Math.min(1, ((w.bbox?.y1 ?? 10) - (w.bbox?.y0 ?? 0)) / ih)),
        };
        return {
          text: w.text.trim(),
          confidence: Math.max(0.05, Math.min(1.0, (w.confidence ?? 50) / 100)),
          bbox,
        };
      });

    const avgConfidence = words.length > 0
      ? words.reduce((s, w) => s + w.confidence, 0) / words.length
      : 0;

    console.log(`[OCR ${label}] ✓ Words: ${words.length}, Avg conf: ${(avgConfidence * 100).toFixed(1)}%`);
    return { variantLabel: label, raw_text: rawText, words, avgConfidence };
  } catch (err) {
    console.error(`[OCR ${label}] Tesseract error:`, err);
    return null;
  }
}

/**
 * Deduplicates and sorts OCR words by spatial line position (top-to-bottom, left-to-right).
 */
function mergeAndDeduplicateWords(primary: OcrWord[], secondary: OcrWord[]): OcrWord[] {
  const merged = [...primary];

  for (const sw of secondary) {
    const existing = merged.find(mw => {
      const dx = Math.abs((mw.bbox.x + mw.bbox.w / 2) - (sw.bbox.x + sw.bbox.w / 2));
      const dy = Math.abs((mw.bbox.y + mw.bbox.h / 2) - (sw.bbox.y + sw.bbox.h / 2));
      return dx < 0.04 && dy < 0.03;
    });

    if (!existing) {
      merged.push(sw);
    } else if (sw.confidence > existing.confidence && sw.text.length >= existing.text.length) {
      existing.text = sw.text;
      existing.confidence = sw.confidence;
      existing.bbox = sw.bbox;
    }
  }

  merged.sort((a, b) => {
    const yDiff = a.bbox.y - b.bbox.y;
    if (Math.abs(yDiff) > 0.02) return yDiff;
    return a.bbox.x - b.bbox.x;
  });

  return merged;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runOCR(file: File | Blob): Promise<OcrResult> {
  if (!file || file.size === 0) {
    throw new Error('Invalid or empty image file supplied for OCR.');
  }

  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const fileName = (file as File).name ?? 'uploaded_label';
  console.log('[runOCR] Processing:', fileName, '| Size:', file.size, 'bytes | Type:', file.type);

  const Tesseract = await loadTesseractFromCDN();
  if (!Tesseract) {
    console.error('[runOCR] Tesseract.js failed to load. Returning empty result.');
    return { raw_text: '', words: [] };
  }

  let variants: PreprocessedVariant[] = [];
  try {
    console.time('OCR Preprocessing');
    variants = await preprocessImageForOCR(file);
    console.timeEnd('OCR Preprocessing');
    console.log(`[runOCR] ${variants.length} image variants prepared for multi-pass OCR.`);
  } catch (prepErr) {
    console.warn('[runOCR] Image preprocessing error:', prepErr);
  }

  const passResults: PassResult[] = [];

  if (variants.length > 0) {
    for (const v of variants) {
      console.time(`Tesseract Pass - ${v.label}`);
      const res = await runTesseractPass(Tesseract, v.dataUrl, v.width, v.height, v.label);
      console.timeEnd(`Tesseract Pass - ${v.label}`);
      if (res) passResults.push(res);

      if (v.label === 'original' && res && res.words.length > 30 && res.avgConfidence > 0.88) {
        console.log('[runOCR] High-quality original pass — skipping further variants.');
        break;
      }
    }
  } else {
    const objectUrl = URL.createObjectURL(file);
    try {
      const res = await runTesseractPass(Tesseract, objectUrl, 800, 600, 'direct');
      if (res) passResults.push(res);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  if (passResults.length === 0) {
    console.warn('[runOCR] No text detected in any pass. Returning empty result — no fabricated data substituted.');
    return {
      raw_text: '',
      words: [],
      diagnostics: {
        passCount: 0,
        durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime),
        wordCount: 0,
        avgConfidence: 0,
        bestVariant: 'none',
        preprocessingVariants: variants.map(v => v.label),
      },
    };
  }

  let bestPass = passResults[0];
  for (const pass of passResults) {
    if (
      pass.words.length > bestPass.words.length ||
      (pass.words.length === bestPass.words.length && pass.avgConfidence > bestPass.avgConfidence)
    ) {
      bestPass = pass;
    }
  }

  let finalWords = bestPass.words;
  for (const pass of passResults) {
    if (pass.variantLabel !== bestPass.variantLabel) {
      finalWords = mergeAndDeduplicateWords(finalWords, pass.words);
    }
  }

  const durationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime);
  const avgConf = finalWords.length > 0
    ? finalWords.reduce((s, w) => s + w.confidence, 0) / finalWords.length
    : 0;

  const rawText = bestPass.raw_text || finalWords.map(w => w.text).join(' ');

  const diagnostics: OcrDiagnostics = {
    passCount: passResults.length,
    durationMs,
    wordCount: finalWords.length,
    avgConfidence: avgConf,
    bestVariant: bestPass.variantLabel,
    preprocessingVariants: variants.map(v => v.label),
  };

  console.log(
    `[runOCR] Multi-pass complete in ${durationMs}ms | Best variant: "${bestPass.variantLabel}" ` +
    `| Total merged words: ${finalWords.length} | Avg confidence: ${(avgConf * 100).toFixed(1)}%`
  );

  return {
    raw_text: rawText,
    words: finalWords,
    diagnostics,
  };
}

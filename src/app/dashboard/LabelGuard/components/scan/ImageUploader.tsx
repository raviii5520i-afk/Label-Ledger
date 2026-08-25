// Label Ledger — Image Uploader Component (Private Supabase Storage Evidence Upload)
'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon, X, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onClear?: () => void;
  accept?: string;
  maxSizeMB?: number;
  isUploading?: boolean;
  uploadError?: string | null;
}

const MAX_SIZE_MB = 10;

export function ImageUploader({
  onImageSelected,
  onClear,
  accept = 'image/*',
  maxSizeMB = MAX_SIZE_MB,
  isUploading = false,
  uploadError = null,
}: ImageUploaderProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setLocalError(null);

    if (!file || file.size === 0) {
      setLocalError(t('scan.upload.errorEmpty'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setLocalError(t('scan.upload.errorInvalid'));
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(t('scan.upload.errorTooLarge'));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelected(file, url);
  }, [maxSizeMB, onImageSelected, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleClear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onClear) onClear();
  }, [preview, onClear]);

  const displayError = uploadError || localError;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && !isUploading && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden',
          'flex flex-col items-center justify-center min-h-[320px]',
          preview || isUploading
            ? 'cursor-default border-[var(--lg-border)]'
            : 'cursor-pointer',
          isDragging
            ? 'border-[var(--lg-blue)] bg-indigo-900/10'
            : preview
            ? 'bg-white'
            : 'border-[var(--lg-border)] bg-white hover:border-indigo-600/60 hover:bg-[#1e2135]',
        )}
      >
        {isUploading ? (
          /* Loading State */
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-12 h-12 rounded-xl bg-indigo-900/30 border border-[var(--lg-blue)]/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[var(--lg-blue)] animate-spin" />
            </div>
            <p className="text-sm font-semibold text-[var(--lg-navy)]">{t('scan.upload.uploading')}</p>
            <p className="text-xs text-[var(--lg-muted)]">{t('scan.upload.encrypting')}</p>
          </div>
        ) : preview ? (
          /* Preview */
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={t('scan.upload.previewAlt')}
              className="max-h-72 w-auto object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--lg-background)]/80 border border-[var(--lg-border)] flex items-center justify-center text-[var(--lg-muted)] hover:text-red-700 hover:border-red-600/50 transition-colors"
              aria-label={t('scan.upload.removeImage')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Upload prompt */
          <div className="flex flex-col items-center gap-4 px-6 py-12">
            <div
              className={cn(
                'w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-colors',
                isDragging
                  ? 'border-[var(--lg-blue)] bg-[var(--lg-blue)]/10 text-[var(--lg-blue)]'
                  : 'border-[var(--lg-border)] bg-[var(--lg-background)] text-[var(--lg-muted)]',
              )}
            >
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--lg-navy)]">
                {isDragging ? t('scan.upload.dropHere') : t('scan.upload.dragAndDrop')} <span className="text-[var(--lg-blue)]">{t('scan.upload.clickToBrowse')}</span>
              </p>
              <p className="text-xs text-[var(--lg-muted)] mt-1.5 font-medium">
                {t('scan.upload.supportTypes')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[var(--lg-muted)] uppercase tracking-wider">{t('scan.upload.supports')}</span>
              {['JPG', 'PNG', 'WEBP', 'HEIC'].map(fmt => (
                <span key={fmt} className="text-[10px] font-mono text-[var(--lg-muted)] border border-[var(--lg-border)] rounded px-1.5 py-0.5">
                  {fmt}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[var(--lg-muted)]">Max {maxSizeMB} MB</p>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 pointer-events-none border-2 border-[var(--lg-blue)] rounded-2xl" />
        )}
      </div>

      {/* Error */}
      {displayError && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-100 border border-red-300 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <p className="text-xs text-red-700">{displayError}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload label image"
      />

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <ImageIcon className="w-3.5 h-3.5" />, text: 'Ensure the label is fully visible and in focus' },
          { icon: <Upload className="w-3.5 h-3.5" />, text: 'Good lighting improves OCR extraction accuracy' },
          { icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Evidence stored in private bucket with signed URLs' },
        ].map((tip, i) => (
          <div key={i} className="flex gap-2 p-3 bg-white border border-[var(--lg-border)] rounded-xl">
            <span className="text-[var(--lg-muted)] shrink-0 mt-0.5">{tip.icon}</span>
            <p className="text-[11px] text-[var(--lg-muted)] leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

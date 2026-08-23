// Label Ledger — Signed Evidence Image Component
// Renders private Supabase Storage objects using temporary signed URLs. Never uses public URLs.
'use client';

import { useState, useEffect } from 'react';
import { createLabelEvidenceSignedUrl } from '@/lib/supabase/storage';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storagePath: string | null | undefined;
  fallbackUrl?: string;
  className?: string;
}

export function SignedImage({
  storagePath,
  fallbackUrl,
  alt = 'Evidence image',
  className,
  ...props
}: SignedImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (!storagePath) {
      setSrc(fallbackUrl || null);
      setLoading(false);
      return;
    }

    // If storagePath is already an absolute HTTP/HTTPS URL (e.g. mock data), render directly
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('blob:')) {
      setSrc(storagePath);
      setLoading(false);
      return;
    }

    // Generate temporary signed URL for private bucket object
    setLoading(true);
    setError(false);

    createLabelEvidenceSignedUrl(storagePath)
      .then((result) => {
        if (!isMounted) return;
        if (result.data) {
          setSrc(result.data);
        } else {
          console.warn('[SignedImage] Could not generate signed URL:', result.error);
          setSrc(fallbackUrl || null);
          setError(true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[SignedImage] Signed URL error:', err);
        setSrc(fallbackUrl || null);
        setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [storagePath, fallbackUrl]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center bg-[#1A1D27] border border-[#2E3147] rounded-lg p-4 text-slate-500', className)}>
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !src) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-[#1A1D27] border border-[#2E3147] rounded-lg p-4 text-slate-500', className)}>
        <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
        <span className="text-[11px]">Image unavailable</span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt={alt} className={className} {...props} />
  );
}

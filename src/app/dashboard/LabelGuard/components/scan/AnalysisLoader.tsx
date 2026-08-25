'use client';

import { useEffect, useState } from 'react';
import { ScanLine, Brain, FileSearch, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnalysisLoaderProps {
  imageUrl: string | null;
  /** Real pipeline stage index (0–3). When provided, overrides timer-based animation. */
  currentStage?: number;
}

const STAGES = [
  { icon: <ScanLine className="w-5 h-5" />, label: 'Running OCR on label image…', duration: 900 },
  { icon: <FileSearch className="w-5 h-5" />, label: 'Extracting text blocks and bounding boxes…', duration: 700 },
  { icon: <Brain className="w-5 h-5" />, label: 'AI field extraction in progress…', duration: 800 },
  { icon: <Cpu className="w-5 h-5" />, label: 'Matching declarations to Rule 6 clauses…', duration: 600 },
];

export function AnalysisLoader({ imageUrl, currentStage }: AnalysisLoaderProps) {
  const [internalStage, setInternalStage] = useState(0);
  const [dots, setDots] = useState('');

  // Prefer real pipeline stage; fall back to timer animation
  const stageIndex = currentStage !== undefined ? Math.min(currentStage, STAGES.length - 1) : internalStage;

  useEffect(() => {
    // Animate dots regardless
    const dotsInterval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    // Only run timer fallback when no real stage is provided
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    if (currentStage === undefined) {
      let total = 0;
      STAGES.forEach((s, i) => {
        total += s.duration;
        timeouts.push(setTimeout(() => setInternalStage(i), total - s.duration));
      });
    }

    return () => {
      clearInterval(dotsInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [currentStage]);

  const currentStageData = STAGES[stageIndex];
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-[var(--lg-border)] rounded-2xl overflow-hidden">
        {/* Image strip with scan line */}
        {imageUrl && (
          <div className="relative h-48 bg-[var(--lg-background)] overflow-hidden border-b border-[var(--lg-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Analyzing label"
              className="w-full h-full object-contain opacity-40"
            />
            {/* Scan line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80 ll-scan-line" />
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(79,110,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.3) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[var(--lg-blue)]/70 rounded-tl" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[var(--lg-blue)]/70 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[var(--lg-blue)]/70 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[var(--lg-blue)]/70 rounded-br" />
          </div>
        )}

        {/* Status content */}
        <div className="p-6">
          {/* Pulsing icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--lg-blue)]/20 border border-[var(--lg-blue)]/30 flex items-center justify-center text-[var(--lg-blue)] ll-pulse shrink-0">
              {currentStageData.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--lg-navy)]">
                Analyzing label{dots}
              </p>
              <p className="text-xs text-[var(--lg-muted)] mt-0.5 transition-all duration-300">
                {currentStageData.label}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1 rounded-full bg-[var(--lg-background)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--lg-muted)]">
              <span>Processing</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Stage indicators */}
          <div className="flex gap-2 mt-4">
            {STAGES.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-1 rounded-full transition-colors duration-500',
                  i <= stageIndex ? 'bg-[var(--lg-blue)]' : 'bg-[var(--lg-background)]',
                )}
              />
            ))}
          </div>

          <p className="text-[11px] text-[var(--lg-muted)] text-center mt-4">
            Do not close or refresh this page
          </p>
        </div>
      </div>
    </div>
  );
}

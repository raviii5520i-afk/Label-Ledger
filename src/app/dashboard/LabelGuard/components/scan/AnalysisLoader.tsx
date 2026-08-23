'use client';

import { useEffect, useState } from 'react';
import { ScanLine, Brain, FileSearch, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnalysisLoaderProps {
  imageUrl: string | null;
}

const STAGES = [
  { icon: <ScanLine className="w-5 h-5" />, label: 'Running OCR on label image…', duration: 900 },
  { icon: <FileSearch className="w-5 h-5" />, label: 'Extracting text blocks and bounding boxes…', duration: 700 },
  { icon: <Brain className="w-5 h-5" />, label: 'AI field extraction in progress…', duration: 800 },
  { icon: <Cpu className="w-5 h-5" />, label: 'Matching declarations to Rule 6 clauses…', duration: 600 },
];

export function AnalysisLoader({ imageUrl }: AnalysisLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    // Progress through stages
    let total = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    STAGES.forEach((s, i) => {
      total += s.duration;
      timeouts.push(setTimeout(() => setStageIndex(i), total - s.duration));
    });

    return () => {
      clearInterval(dotsInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const currentStage = STAGES[stageIndex];
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1A1D27] border border-[#2E3147] rounded-2xl overflow-hidden">
        {/* Image strip with scan line */}
        {imageUrl && (
          <div className="relative h-48 bg-[#0F1117] overflow-hidden border-b border-[#2E3147]">
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
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-indigo-500/70 rounded-tl" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-indigo-500/70 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-indigo-500/70 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-indigo-500/70 rounded-br" />
          </div>
        )}

        {/* Status content */}
        <div className="p-6">
          {/* Pulsing icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 ll-pulse shrink-0">
              {currentStage.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">
                Analyzing label{dots}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 transition-all duration-300">
                {currentStage.label}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1 rounded-full bg-[#232635] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
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
                  i <= stageIndex ? 'bg-indigo-500' : 'bg-[#232635]',
                )}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-600 text-center mt-4">
            Do not close or refresh this page
          </p>
        </div>
      </div>
    </div>
  );
}

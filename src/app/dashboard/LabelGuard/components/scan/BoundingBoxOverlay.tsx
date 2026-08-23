// Label Ledger — Bounding Box Overlay Component (With Private Storage Signed URL Resolution)
'use client';

import { useState, useRef, useEffect, type RefObject } from 'react';
import { cn, getConfidenceConfig } from '../../lib/utils';
import type { BBox } from '../../lib/types';
import { createLabelEvidenceSignedUrl } from '@/lib/supabase/storage';

interface BoxDef {
  id: string;
  bbox: BBox;
  label: string;
  confidence: number;
  isHighlighted?: boolean;
}

interface BoundingBoxOverlayProps {
  imageUrl: string;
  imageNaturalSize: { width: number; height: number };
  boxes: BoxDef[];
  onBoxClick?: (id: string) => void;
  onImgLoad?: () => void;
  imgRef?: RefObject<HTMLImageElement>;
}

export function BoundingBoxOverlay({
  imageUrl,
  imageNaturalSize,
  boxes,
  onBoxClick,
  onImgLoad,
  imgRef,
}: BoundingBoxOverlayProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>(imageUrl);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (!imageUrl) return;

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('blob:')) {
      setResolvedSrc(imageUrl);
      return;
    }

    createLabelEvidenceSignedUrl(imageUrl).then((res) => {
      if (isMounted && res.data) {
        setResolvedSrc(res.data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={resolvedSrc}
        alt="Label with bounding box annotations"
        onLoad={onImgLoad}
        className="w-full h-auto object-contain block"
        draggable={false}
      />

      {/* SVG overlay — absolute, same dimensions as the image */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none' }}
      >
        {boxes.map(box => {
          const isHovered = hoveredId === box.id || box.isHighlighted;
          const conf = getConfidenceConfig(box.confidence);
          const strokeColor = conf.color.includes('emerald')
            ? '#22C55E'
            : conf.color.includes('amber')
            ? '#F59E0B'
            : '#EF4444';

          return (
            <g key={box.id}>
              <rect
                x={box.bbox.x}
                y={box.bbox.y}
                width={box.bbox.w}
                height={box.bbox.h}
                fill={strokeColor + '22'}
                stroke={strokeColor}
                strokeWidth={isHovered ? 0.004 : 0.002}
                rx={0.005}
                style={{ pointerEvents: 'all', cursor: onBoxClick ? 'pointer' : 'default', transition: 'all 150ms ease' }}
                onMouseEnter={() => setHoveredId(box.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onBoxClick?.(box.id)}
                opacity={isHovered ? 1 : 0.65}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip for hovered box */}
      {hoveredId && (() => {
        const box = boxes.find(b => b.id === hoveredId);
        if (!box) return null;
        const conf = getConfidenceConfig(box.confidence);
        return (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${(box.bbox.x + box.bbox.w / 2) * 100}%`,
              top: `${box.bbox.y * 100}%`,
              transform: 'translate(-50%, -110%)',
            }}
          >
            <div className="bg-[#0F1117] border border-[#2E3147] rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
              <p className="text-[11px] font-semibold text-slate-200">{box.label}</p>
              <p className={cn('text-[10px] font-mono', conf.textColor)}>
                {Math.round(box.confidence * 100)}% confidence
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

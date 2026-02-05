'use client';

import { Car } from 'lucide-react';
import { Coordinates } from '@/types';
import { getDistanceInfo } from '@/lib/distance';

interface DistanceBadgeProps {
  from: Coordinates;
  to: Coordinates;
  className?: string;
}

export default function DistanceBadge({ from, to, className = '' }: DistanceBadgeProps) {
  const { distance, driveTime } = getDistanceInfo(from, to);

  return (
    <div className={`flex items-center justify-center gap-1.5 py-1.5 ${className}`}>
      <div className="flex items-center gap-1 text-xs text-muted bg-background/80 px-2 py-0.5 rounded-full border border-border/30">
        <Car size={12} strokeWidth={1.5} />
        <span>{distance}</span>
        <span className="text-muted/60">·</span>
        <span>{driveTime}</span>
      </div>
    </div>
  );
}

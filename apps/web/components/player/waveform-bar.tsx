"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface WaveformBarProps {
  /** Playback progress as a percentage (0–100) */
  progress: number;
  /** Total track duration in seconds — used to calculate seek position on click */
  duration: number;
  /** Called with the target second when user clicks the waveform */
  onSeek?: (seconds: number) => void;
  disabled?: boolean;
  /** Number of bars to render — more bars = finer resolution */
  barCount?: number;
  className?: string;
  /** Seed string (e.g. track slug) for deterministic peak heights per track */
  seed?: string;
}

/** Deterministic pseudo-random peak heights keyed to a seed string. */
function generatePeaks(count: number, seed: string): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  return Array.from({ length: count }, (_, i) => {
    const r = Math.sin(hash * 9301 + i * 49297 + 233280) * 233280;
    const rand = r - Math.floor(r);
    // Envelope: quieter at start/end, louder in the middle
    const envelope = Math.sin((i / count) * Math.PI);
    return Math.max(0.08, 0.1 + envelope * 0.65 * rand + 0.25 * rand);
  });
}

export function WaveformBar({
  progress,
  duration,
  onSeek,
  disabled = false,
  barCount = 90,
  className,
  seed = "track",
}: WaveformBarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const peaks = React.useMemo(() => generatePeaks(barCount, seed), [barCount, seed]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !onSeek || !containerRef.current || !duration) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [disabled, onSeek, duration],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || !onSeek || !duration) return;
      if (e.key === "ArrowRight") {
        onSeek(Math.min(duration, (progress / 100) * duration + 5));
      } else if (e.key === "ArrowLeft") {
        onSeek(Math.max(0, (progress / 100) * duration - 5));
      }
    },
    [disabled, onSeek, duration, progress],
  );

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Track waveform — click to seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-end gap-px select-none",
        disabled ? "cursor-default opacity-40" : "cursor-pointer",
        className,
      )}
    >
      {peaks.map((height, i) => {
        const barProgress = (i / barCount) * 100;
        const played = barProgress < progress;
        const active = Math.abs(barProgress - progress) < 100 / barCount;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-75"
            style={{
              height: `${Math.round(Math.max(12, height * 100))}%`,
              backgroundColor: played
                ? "hsl(var(--primary))"
                : active
                  ? "hsl(var(--primary) / 0.7)"
                  : "hsl(var(--border))",
            }}
          />
        );
      })}
    </div>
  );
}

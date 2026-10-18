import React, { useRef } from 'react';
import { Layers, Volume2, Clapperboard } from 'lucide-react';
import { formatSMPTETimecode } from '../engine/timecode.ts';

interface TimelineBarProps {
  currentTime: number;
  duration: number;
  fps: number;
  onSeek: (time: number) => void;
  projectName: string;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  currentTime,
  duration,
  fps,
  onSeek,
  projectName,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const updateTime = (clientX: number) => {
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = offsetX / rect.width;
      onSeek(ratio * duration);
    };

    updateTime(e.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      updateTime(moveEvent.clientX);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  // Generate ruler markers
  const secondMarkers = [];
  const totalSeconds = Math.ceil(duration);
  for (let s = 0; s <= totalSeconds; s++) {
    const pct = (s / duration) * 100;
    if (pct <= 100) {
      secondMarkers.push({ second: s, pct });
    }
  }

  return (
    <div className="h-28 bg-[#0f1218] border-t border-[#222733] flex flex-col select-none shrink-0 text-xs">
      {/* Time ruler bar */}
      <div
        ref={rulerRef}
        onPointerDown={handlePointerDown}
        className="h-6 bg-[#161a24] border-b border-[#222733] relative cursor-pointer overflow-hidden"
      >
        {/* Hash markers */}
        {secondMarkers.map(({ second, pct }) => (
          <div
            key={second}
            style={{ left: `${pct}%` }}
            className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
          >
            <span className="text-[9px] font-mono text-slate-400 pl-1">
              00:0{second}:00
            </span>
            <div className="h-2 w-px bg-[#3b4559]" />
          </div>
        ))}

        {/* Playhead Scrubber Pin */}
        <div
          style={{ left: `${progressPercent}%` }}
          className="absolute top-0 bottom-0 z-30 pointer-events-none -translate-x-1/2 flex flex-col items-center"
        >
          <div className="w-3 h-3 bg-red-500 rotate-45 -translate-y-1 shadow-sm" />
          <div className="w-0.5 h-full bg-red-500 shadow-sm" />
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-32 bg-[#12151c] border-r border-[#222733] flex flex-col justify-around py-1 px-2 text-[11px] text-slate-400 font-medium shrink-0">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>V1 Video</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Volume2 className="w-3.5 h-3.5" />
            <span>A1 Audio</span>
          </div>
        </div>

        {/* Track Timelines */}
        <div
          onPointerDown={handlePointerDown}
          className="flex-1 relative bg-[#0b0e14] cursor-pointer overflow-hidden flex flex-col justify-around py-1 px-1"
        >
          {/* Video Clip Block */}
          <div className="h-7 w-full bg-blue-950/40 border border-blue-500/40 rounded-sm relative overflow-hidden flex items-center px-3 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 pointer-events-none" />
            <span className="relative z-10 text-[11px] font-mono text-blue-200 font-semibold truncate">
              {projectName} [Render Track]
            </span>
            {/* Visual clip duration stripe */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-500 cursor-ew-resize" />
          </div>

          {/* Audio Clip Block */}
          <div className="h-6 w-full bg-emerald-950/30 border border-emerald-500/30 rounded-sm relative overflow-hidden flex items-center px-3">
            <div className="absolute inset-0 flex items-center gap-1 opacity-25 px-2">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${20 + (i % 5) * 15}%` }}
                  className="w-1 bg-emerald-400 rounded-full"
                />
              ))}
            </div>
            <span className="relative z-10 text-[10px] font-mono text-emerald-300">
              Audio Waveform Sync
            </span>
          </div>

          {/* Vertical Playhead Cursor line extending down */}
          <div
            style={{ left: `${progressPercent}%` }}
            className="absolute top-0 bottom-0 z-20 pointer-events-none -translate-x-1/2 w-0.5 bg-red-500"
          />
        </div>
      </div>
    </div>
  );
};

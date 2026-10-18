import React from 'react';
import { Film, XCircle, Loader2 } from 'lucide-react';
import { RenderJobProgress, RenderSettings } from '../types/project.ts';
import { formatDurationHuman } from '../engine/timecode.ts';

interface RenderProgressModalProps {
  progress: RenderJobProgress;
  settings: RenderSettings;
  onCancel: () => void;
}

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({
  progress,
  settings,
  onCancel,
}) => {
  if (progress.status === 'idle' || progress.status === 'completed') return null;

  const elapsedSec = progress.elapsedMs / 1000;
  const remainingSec = progress.estimatedRemainingMs / 1000;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-[#2b3344] rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col items-center select-none">
        {/* Animated Icon */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Film className="w-8 h-8 text-blue-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#181c25] border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-1">
          Rendering Video Project
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6">
          Converting DOM animation frames directly into high-fidelity video stream
        </p>

        {/* Progress Bar & Percentage */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-semibold text-slate-300">
              {progress.currentStage}
            </span>
            <span className="font-mono text-base font-bold text-blue-400">
              {progress.percentage}%
            </span>
          </div>

          <div className="w-full h-3 bg-[#1a1f29] rounded-full overflow-hidden border border-[#262c3a] p-0.5">
            <div
              style={{ width: `${progress.percentage}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-150"
            />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-xs">
          <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5">FRAME COUNT</span>
            <span className="font-mono font-semibold text-slate-200">
              {progress.currentFrame} / {progress.totalFrames}
            </span>
          </div>

          <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5">ENCODING SPEED</span>
            <span className="font-mono font-semibold text-blue-400">
              {progress.fpsSpeed} FPS
            </span>
          </div>

          <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5">ELAPSED TIME</span>
            <span className="font-mono font-semibold text-slate-200">
              {formatDurationHuman(elapsedSec)}
            </span>
          </div>

          <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5">EST. TIME REMAINING</span>
            <span className="font-mono font-semibold text-emerald-400">
              {progress.percentage >= 100 ? '00:00.00' : formatDurationHuman(remainingSec)}
            </span>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#181c25] hover:bg-[#202532] text-slate-300 hover:text-red-400 border border-[#262c3a] text-xs font-medium transition-colors"
        >
          <XCircle className="w-4 h-4" />
          <span>Cancel Render</span>
        </button>
      </div>
    </div>
  );
};

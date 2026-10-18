import React from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  X,
  Film,
  HardDrive,
  Maximize2,
  Share2,
} from 'lucide-react';
import { RenderJobProgress, RenderSettings } from '../types/project.ts';

interface RenderCompleteModalProps {
  progress: RenderJobProgress;
  settings: RenderSettings;
  onClose: () => void;
  onRenderAgain: () => void;
}

export const RenderCompleteModal: React.FC<RenderCompleteModalProps> = ({
  progress,
  settings,
  onClose,
  onRenderAgain,
}) => {
  if (progress.status !== 'completed' || !progress.outputUrl) return null;

  const isVideo = settings.format !== 'png-sequence';

  const handleDownload = () => {
    if (!progress.outputUrl || !progress.outputFilename) return;
    const a = document.createElement('a');
    a.href = progress.outputUrl;
    a.download = progress.outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-[#2b3344] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col select-none">
        {/* Modal Header */}
        <div className="h-12 bg-[#181c25] border-b border-[#222733] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-white">Rendering Complete</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#222733]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Preview Area */}
        <div className="p-5 flex-1 flex flex-col items-center">
          {isVideo ? (
            <div className="w-full bg-[#080a0e] rounded-xl overflow-hidden border border-[#262c3a] shadow-inner mb-4 flex items-center justify-center max-h-[360px]">
              <video
                src={progress.outputUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[340px] max-w-full rounded"
              />
            </div>
          ) : (
            <div className="w-full bg-[#181c25] border border-[#262c3a] rounded-xl p-8 text-center mb-4">
              <Film className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-200 text-sm">PNG Image Sequence Archive Ready</h4>
              <p className="text-xs text-slate-400 mt-1">
                Contains {progress.totalFrames} numbered frame images ready for post-production
              </p>
            </div>
          )}

          {/* Video Metadata Cards */}
          <div className="w-full grid grid-cols-4 gap-2 mb-5 text-xs">
            <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block mb-0.5">FILE SIZE</span>
              <span className="font-mono font-bold text-emerald-400">
                {progress.outputSizeFormatted || 'N/A'}
              </span>
            </div>

            <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block mb-0.5">DIMENSIONS</span>
              <span className="font-mono font-semibold text-slate-200">
                {settings.width} × {settings.height}
              </span>
            </div>

            <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block mb-0.5">DURATION</span>
              <span className="font-mono font-semibold text-slate-200">
                {settings.duration}s ({progress.totalFrames}f)
              </span>
            </div>

            <div className="bg-[#181c25] border border-[#262c3a] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block mb-0.5">FPS & CODEC</span>
              <span className="font-mono font-semibold text-blue-400">
                {settings.fps} FPS ({settings.format.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onRenderAgain}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181c25] hover:bg-[#202532] text-slate-300 hover:text-white border border-[#262c3a] text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Render with Different Settings</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File ({progress.outputFilename})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

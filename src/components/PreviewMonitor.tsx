import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Maximize2,
  RefreshCw,
  Grid,
  ZoomIn,
  Monitor,
} from 'lucide-react';
import { formatSMPTETimecode, formatDurationHuman } from '../engine/timecode.ts';
import { RenderSettings } from '../types/project.ts';

interface PreviewMonitorProps {
  bundledHtml: string;
  settings: RenderSettings;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (newTime: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onStepFrame: (deltaFrames: number) => void;
  onReloadIframe: () => void;
}

export const PreviewMonitor: React.FC<PreviewMonitorProps> = ({
  bundledHtml,
  settings,
  iframeRef,
  currentTime,
  isPlaying,
  onTimeChange,
  onTogglePlay,
  onRestart,
  onStepFrame,
  onReloadIframe,
}) => {
  const [scaleMode, setScaleMode] = useState<'fit' | '50' | '75' | '100'>('fit');
  const [showCheckerboard, setShowCheckerboard] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedScale, setCalculatedScale] = useState(1);

  // Calculate fit scale dynamically based on container dimensions
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 32;
      const availW = Math.max(100, rect.width - padding);
      const availH = Math.max(100, rect.height - padding);

      if (scaleMode === 'fit') {
        const scaleW = availW / settings.width;
        const scaleH = availH / settings.height;
        setCalculatedScale(Math.min(scaleW, scaleH, 1.2));
      } else {
        setCalculatedScale(parseInt(scaleMode, 10) / 100);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [scaleMode, settings.width, settings.height]);

  // Fullscreen support
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0e13] overflow-hidden select-none">
      {/* Top Monitor Info Bar */}
      <div className="h-9 bg-[#12151b] border-b border-[#222733] px-3 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-200 font-semibold">VIEWPORT</span>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1a1e28] text-slate-300 border border-[#262c3a]">
            {settings.width} × {settings.height} ({settings.aspectRatio}) • {settings.fps} FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Transparency preview toggle */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            className={`p-1.5 rounded transition-colors ${
              showCheckerboard
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e28]'
            }`}
            title="Toggle Checkerboard Transparency Background"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Scale Selector */}
          <div className="flex items-center gap-1 bg-[#181c25] border border-[#262c3a] rounded px-1.5 py-0.5 text-[11px]">
            <ZoomIn className="w-3 h-3 text-slate-400" />
            <select
              value={scaleMode}
              onChange={(e) => setScaleMode(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="fit" className="bg-[#181c25]">Fit View</option>
              <option value="50" className="bg-[#181c25]">50%</option>
              <option value="75" className="bg-[#181c25]">75%</option>
              <option value="100" className="bg-[#181c25]">100%</option>
            </select>
            <span className="text-slate-400 font-mono text-[10px]">
              ({Math.round(calculatedScale * 100)}%)
            </span>
          </div>

          {/* Reload Iframe */}
          <button
            onClick={onReloadIframe}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a1e28]"
            title="Reload Sandbox Engine"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a1e28]"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage Area */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 ${
          showCheckerboard
            ? 'bg-[repeating-conic-gradient(#161a23_0%_25%,#0f1218_0%_50%)] bg-[length:24px_24px]'
            : 'bg-[#090b0f]'
        }`}
      >
        <div
          style={{
            width: `${settings.width}px`,
            height: `${settings.height}px`,
            transform: `scale(${calculatedScale})`,
            transformOrigin: 'center center',
            backgroundColor: showCheckerboard ? 'transparent' : settings.backgroundColor,
          }}
          className="relative shadow-2xl rounded-xs overflow-hidden border border-[#222733] transition-transform duration-100 shrink-0"
        >
          <iframe
            ref={iframeRef}
            srcDoc={bundledHtml}
            title="OpenRender Sandboxed Preview"
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full h-full border-none block"
          />
        </div>
      </div>

      {/* Transport Controls Bar (DaVinci Resolve Inspired) */}
      <div className="h-12 bg-[#12151b] border-t border-[#222733] px-4 flex items-center justify-between shrink-0">
        {/* Timecodes */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm font-semibold tracking-wider text-blue-400 bg-[#161a24] px-2.5 py-1 rounded border border-[#242b3b]">
            {formatSMPTETimecode(currentTime, settings.fps)}
          </div>
          <div className="font-mono text-xs text-slate-400">
            {formatDurationHuman(currentTime)} / {formatDurationHuman(settings.duration)}
          </div>
        </div>

        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onStepFrame(-1)}
            className="p-1.5 rounded-md hover:bg-[#1c222c] text-slate-300 hover:text-white transition-colors"
            title="Step Backward 1 Frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onRestart}
            className="p-1.5 rounded-md hover:bg-[#1c222c] text-slate-300 hover:text-white transition-colors"
            title="Restart Animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={() => onStepFrame(1)}
            className="p-1.5 rounded-md hover:bg-[#1c222c] text-slate-300 hover:text-white transition-colors"
            title="Step Forward 1 Frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-md transition-colors ${
              isLooping
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c222c]'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Duration badge */}
        <div className="text-xs text-slate-400 font-mono">
          Total Duration: <span className="text-slate-200 font-semibold">{settings.duration}s</span>
        </div>
      </div>
    </div>
  );
};

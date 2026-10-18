import React from 'react';
import {
  Sliders,
  Video,
  Film,
  Sparkles,
  Layers,
  Settings2,
  HardDrive,
  FileCheck,
  Zap,
} from 'lucide-react';
import {
  RenderSettings,
  AspectRatioPreset,
  ResolutionPreset,
  OutputFormat,
  QualityPreset,
} from '../types/project.ts';
import {
  getPresetDimensions,
  calculateTotalFrames,
} from '../engine/timecode.ts';
import {
  getBitrateForPreset,
  estimateFileSizeMB,
  ensureEvenDimensions,
  formatSupportsAlpha,
} from '../engine/renderConfig.ts';

interface RenderSettingsPanelProps {
  settings: RenderSettings;
  onChangeSettings: (newSettings: RenderSettings) => void;
  onStartRender: () => void;
  isRendering: boolean;
}

export const RenderSettingsPanel: React.FC<RenderSettingsPanelProps> = ({
  settings,
  onChangeSettings,
  onStartRender,
  isRendering,
}) => {
  const handleResolutionChange = (preset: ResolutionPreset) => {
    if (preset === 'custom') {
      onChangeSettings({ ...settings, resolutionPreset: preset });
    } else {
      const [w, h] = getPresetDimensions(preset, settings.aspectRatio);
      const bitrate = getBitrateForPreset(settings.quality, w, h);
      onChangeSettings({
        ...settings,
        resolutionPreset: preset,
        width: w,
        height: h,
        bitrateMbps: bitrate,
      });
    }
  };

  const handleAspectRatioChange = (aspect: AspectRatioPreset) => {
    const [w, h] = getPresetDimensions(settings.resolutionPreset, aspect);
    const bitrate = getBitrateForPreset(settings.quality, w, h);
    onChangeSettings({
      ...settings,
      aspectRatio: aspect,
      width: w,
      height: h,
      bitrateMbps: bitrate,
    });
  };

  const handleQualityChange = (quality: QualityPreset) => {
    const bitrate = getBitrateForPreset(quality, settings.width, settings.height);
    onChangeSettings({
      ...settings,
      quality,
      bitrateMbps: bitrate,
    });
  };

  const handleCustomDimensions = (w: number, h: number) => {
    const [evenW, evenH] = ensureEvenDimensions(w, h);
    onChangeSettings({
      ...settings,
      resolutionPreset: 'custom',
      aspectRatio: 'custom',
      width: evenW,
      height: evenH,
    });
  };

  const handleFormatChange = (format: OutputFormat) => {
    let transparent = settings.transparentBackground;
    if (format !== 'webm-alpha' && format !== 'png-sequence') {
      transparent = false;
    }
    onChangeSettings({
      ...settings,
      format,
      transparentBackground: transparent,
    });
  };

  const totalFrames = calculateTotalFrames(settings.duration, settings.fps);
  const estimatedMB = estimateFileSizeMB(settings.duration, settings.bitrateMbps);

  return (
    <div className="w-80 h-full bg-[#12151b] border-l border-[#222733] flex flex-col select-none text-xs shrink-0 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-3 border-b border-[#222733] flex items-center justify-between bg-[#141720]">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <Settings2 className="w-4 h-4 text-blue-400" />
          <span>RENDER SETTINGS</span>
        </div>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          PRO EXPORT
        </span>
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* Preset Cards (DaVinci inspired) */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Export Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                handleAspectRatioChange('16:9');
                handleResolutionChange('1080p');
                handleFormatChange('mp4');
              }}
              className={`p-2 rounded border text-left transition-colors ${
                settings.format === 'mp4' && settings.aspectRatio === '16:9'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-[#181c25] border-[#262c3a] text-slate-300 hover:bg-[#1f2533]'
              }`}
            >
              <div className="font-semibold text-[11px]">H.264 Master</div>
              <div className="text-[10px] text-slate-400 mt-0.5">1080p MP4 • 30fps</div>
            </button>

            <button
              onClick={() => {
                handleAspectRatioChange('9:16');
                handleResolutionChange('1080p');
                handleFormatChange('mp4');
              }}
              className={`p-2 rounded border text-left transition-colors ${
                settings.aspectRatio === '9:16'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-[#181c25] border-[#262c3a] text-slate-300 hover:bg-[#1f2533]'
              }`}
            >
              <div className="font-semibold text-[11px]">Shorts / Reels</div>
              <div className="text-[10px] text-slate-400 mt-0.5">9:16 Vertical • 60fps</div>
            </button>

            <button
              onClick={() => {
                handleAspectRatioChange('16:9');
                handleResolutionChange('4K');
                handleFormatChange('mp4');
              }}
              className={`p-2 rounded border text-left transition-colors ${
                settings.resolutionPreset === '4K'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-[#181c25] border-[#262c3a] text-slate-300 hover:bg-[#1f2533]'
              }`}
            >
              <div className="font-semibold text-[11px]">YouTube 4K</div>
              <div className="text-[10px] text-slate-400 mt-0.5">3840 × 2160 • High</div>
            </button>

            <button
              onClick={() => {
                handleFormatChange('webm-alpha');
              }}
              className={`p-2 rounded border text-left transition-colors ${
                settings.format === 'webm-alpha'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-[#181c25] border-[#262c3a] text-slate-300 hover:bg-[#1f2533]'
              }`}
            >
              <div className="font-semibold text-[11px]">WebM Alpha</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Transparent Video</div>
            </button>
          </div>
        </div>

        {/* Output Format */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Container & Codec
          </label>
          <select
            value={settings.format}
            onChange={(e) => handleFormatChange(e.target.value as OutputFormat)}
            className="w-full bg-[#181c25] text-slate-200 text-xs px-2.5 py-1.5 rounded border border-[#262c3a] focus:outline-none focus:border-blue-500"
          >
            <option value="mp4" className="bg-[#181c25]">MP4 (H.264 / AVC Video)</option>
            <option value="webm" className="bg-[#181c25]">WebM (VP9 Modern Codec)</option>
            <option value="webm-alpha" className="bg-[#181c25]">WebM (VP9 with Alpha Transparency)</option>
            <option value="png-sequence" className="bg-[#181c25]">PNG Image Sequence (.zip)</option>
          </select>
        </div>

        {/* Aspect Ratio Presets */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['16:9', '9:16', '1:1', '4:5', '4:3', 'custom'] as AspectRatioPreset[]).map((ar) => (
              <button
                key={ar}
                onClick={() => handleAspectRatioChange(ar)}
                className={`py-1 px-1.5 rounded text-[11px] font-mono transition-colors border ${
                  settings.aspectRatio === ar
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-[#181c25] text-slate-300 border-[#262c3a] hover:bg-[#1f2533]'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selection */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Resolution
            </label>
            <span className="font-mono text-[10px] text-slate-400">
              {settings.width} × {settings.height}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 mb-2">
            {(['720p', '1080p', '1440p', '4K'] as ResolutionPreset[]).map((res) => (
              <button
                key={res}
                onClick={() => handleResolutionChange(res)}
                className={`py-1 rounded text-[11px] font-medium transition-colors border ${
                  settings.resolutionPreset === res
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#181c25] text-slate-300 border-[#262c3a] hover:bg-[#1f2533]'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          {/* Custom dimensions inputs */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 block mb-0.5">Width</span>
              <input
                type="number"
                min="128"
                max="4096"
                step="2"
                value={settings.width}
                onChange={(e) => handleCustomDimensions(parseInt(e.target.value) || 1280, settings.height)}
                className="w-full bg-[#181c25] text-slate-200 text-xs px-2 py-1 rounded border border-[#262c3a] font-mono"
              />
            </div>
            <span className="text-slate-400 mt-3">×</span>
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
              <input
                type="number"
                min="128"
                max="4096"
                step="2"
                value={settings.height}
                onChange={(e) => handleCustomDimensions(settings.width, parseInt(e.target.value) || 720)}
                className="w-full bg-[#181c25] text-slate-200 text-xs px-2 py-1 rounded border border-[#262c3a] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Frame Rate (FPS) */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Frame Rate (FPS)
          </label>
          <div className="grid grid-cols-5 gap-1">
            {([24, 25, 30, 50, 60] as const).map((rate) => (
              <button
                key={rate}
                onClick={() => onChangeSettings({ ...settings, fps: rate })}
                className={`py-1 rounded text-[11px] font-mono transition-colors border ${
                  settings.fps === rate
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-[#181c25] text-slate-300 border-[#262c3a] hover:bg-[#1f2533]'
                }`}
              >
                {rate}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Duration
            </label>
            <span className="font-mono text-[11px] text-blue-400 font-semibold">
              {settings.duration}s ({totalFrames} frames)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={settings.duration}
            onChange={(e) => onChangeSettings({ ...settings, duration: parseFloat(e.target.value) })}
            className="w-full cursor-pointer h-1.5 bg-[#262c3a] rounded-lg"
          />
        </div>

        {/* Quality Presets */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Encoding Quality
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['studio', 'social', 'web', 'draft'] as QualityPreset[]).map((q) => (
              <button
                key={q}
                onClick={() => handleQualityChange(q)}
                className={`py-1.5 px-2 rounded text-[11px] capitalize text-left border transition-colors ${
                  settings.quality === q
                    ? 'bg-blue-600/20 border-blue-500/50 text-white font-medium'
                    : 'bg-[#181c25] border-[#262c3a] text-slate-300 hover:bg-[#1f2533]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Bitrate & Estimated File Size */}
        <div className="p-2.5 rounded bg-[#161a24] border border-[#262c3a]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-400">Target Bitrate:</span>
            <span className="font-mono text-xs text-slate-200">{settings.bitrateMbps} Mbps</span>
          </div>
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={settings.bitrateMbps}
            onChange={(e) => onChangeSettings({ ...settings, bitrateMbps: parseInt(e.target.value) })}
            className="w-full cursor-pointer h-1.5 bg-[#262c3a] rounded-lg mb-2"
          />
          <div className="flex justify-between items-center pt-1 border-t border-[#222733] text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-400" /> Est. Size:
            </span>
            <span className="font-mono font-semibold text-emerald-400">~{estimatedMB} MB</span>
          </div>
        </div>

        {/* Alpha & Background color */}
        <div>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.transparentBackground}
              disabled={!formatSupportsAlpha(settings.format)}
              onChange={(e) => {
                if (e.target.checked && !formatSupportsAlpha(settings.format)) {
                  onChangeSettings({ ...settings, format: 'webm-alpha', transparentBackground: true });
                } else {
                  onChangeSettings({ ...settings, transparentBackground: e.target.checked });
                }
              }}
              className="rounded bg-[#181c25] border-[#262c3a] text-blue-600 focus:ring-0"
            />
            <span>Transparent Background (Alpha)</span>
          </label>
        </div>

        {/* Output Filename */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Output File Name
          </label>
          <input
            type="text"
            value={settings.outputFilename}
            onChange={(e) => onChangeSettings({ ...settings, outputFilename: e.target.value })}
            className="w-full bg-[#181c25] text-slate-200 text-xs px-2.5 py-1.5 rounded border border-[#262c3a] font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bottom Render CTA Button */}
      <div className="p-3 border-t border-[#222733] bg-[#141720]">
        <button
          onClick={onStartRender}
          disabled={isRendering}
          className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
            isRendering
              ? 'bg-blue-600/30 text-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{isRendering ? 'Rendering in Progress...' : 'Render Video (Export)'}</span>
        </button>
      </div>
    </div>
  );
};

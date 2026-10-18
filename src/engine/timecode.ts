import type { AspectRatioPreset } from '../types/project.ts';

/**
 * Converts seconds and fps to SMPTE timecode HH:MM:SS:FF
 */
export function formatSMPTETimecode(seconds: number, fps: number = 30): string {
  const safeSeconds = Math.max(0, isFinite(seconds) ? seconds : 0);
  const totalFrames = Math.round(safeSeconds * fps);
  const ff = totalFrames % fps;
  const totalSec = Math.floor(safeSeconds);
  const ss = totalSec % 60;
  const mm = Math.floor(totalSec / 60) % 60;
  const hh = Math.floor(totalSec / 3600);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/**
 * Formats time in seconds to mm:ss.xx format
 */
export function formatDurationHuman(seconds: number): string {
  const safeSeconds = Math.max(0, isFinite(seconds) ? seconds : 0);
  const totalSec = Math.floor(safeSeconds);
  const ms = Math.floor((safeSeconds - totalSec) * 100);
  const ss = totalSec % 60;
  const mm = Math.floor(totalSec / 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(mm)}:${pad(ss)}.${pad(ms)}`;
}

/**
 * Calculates total frames for given duration and fps
 */
export function calculateTotalFrames(durationSec: number, fps: number): number {
  const safeDuration = Math.max(0.1, durationSec);
  const safeFps = Math.max(1, fps);
  return Math.round(safeDuration * safeFps);
}

/**
 * Returns pixel dimensions [width, height] for standard presets
 */
export function getPresetDimensions(
  preset: string,
  aspectRatio: AspectRatioPreset = '16:9'
): [number, number] {
  if (aspectRatio === '9:16') {
    switch (preset) {
      case '720p': return [720, 1280];
      case '1080p': return [1080, 1920];
      case '1440p': return [1440, 2560];
      case '4K': return [2160, 3840];
      default: return [1080, 1920];
    }
  }

  if (aspectRatio === '1:1') {
    switch (preset) {
      case '720p': return [720, 720];
      case '1080p': return [1080, 1080];
      case '1440p': return [1440, 1440];
      case '4K': return [2160, 2160];
      default: return [1080, 1080];
    }
  }

  if (aspectRatio === '4:5') {
    switch (preset) {
      case '720p': return [720, 900];
      case '1080p': return [1080, 1350];
      case '1440p': return [1440, 1800];
      case '4K': return [2160, 2700];
      default: return [1080, 1350];
    }
  }

  if (aspectRatio === '4:3') {
    switch (preset) {
      case '720p': return [960, 720];
      case '1080p': return [1440, 1080];
      case '1440p': return [1920, 1440];
      case '4K': return [2880, 2160];
      default: return [1440, 1080];
    }
  }

  // Default 16:9
  switch (preset) {
    case '720p': return [1280, 720];
    case '1080p': return [1920, 1080];
    case '1440p': return [2560, 1440];
    case '4K': return [3840, 2160];
    default: return [1920, 1080];
  }
}

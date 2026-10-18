import type { RenderSettings, OutputFormat, QualityPreset } from '../types/project.ts';

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  resolutionPreset: '1080p',
  width: 1920,
  height: 1080,
  aspectRatio: '16:9',
  fps: 30,
  duration: 5,
  startTime: 0,
  format: 'mp4',
  quality: 'studio',
  bitrateMbps: 16,
  backgroundColor: '#000000',
  transparentBackground: false,
  includeAudio: false,
  outputFilename: 'openrender_export',
};

/**
 * Returns default bitrate (Mbps) for quality preset and resolution
 */
export function getBitrateForPreset(quality: QualityPreset, width: number, height: number): number {
  const pixelCount = width * height;
  const is4K = pixelCount >= 3840 * 2160 * 0.8;
  const is1440p = pixelCount >= 2560 * 1440 * 0.8;
  const is1080p = pixelCount >= 1920 * 1080 * 0.8;

  switch (quality) {
    case 'studio':
      if (is4K) return 40;
      if (is1440p) return 24;
      if (is1080p) return 16;
      return 10;
    case 'social':
      if (is4K) return 25;
      if (is1440p) return 16;
      if (is1080p) return 10;
      return 6;
    case 'web':
      if (is4K) return 15;
      if (is1440p) return 10;
      if (is1080p) return 6;
      return 4;
    case 'draft':
      return 3;
    default:
      return 10;
  }
}

/**
 * Estimates final file size in megabytes
 */
export function estimateFileSizeMB(durationSec: number, bitrateMbps: number): number {
  const safeDuration = Math.max(0.1, durationSec);
  const safeBitrate = Math.max(0.5, bitrateMbps);
  // (bitrate in Mbps * seconds) / 8 = Megabytes, + 5% container overhead
  const rawMB = (safeBitrate * safeDuration) / 8;
  return Math.round((rawMB * 1.05) * 10) / 10;
}

/**
 * Normalizes video dimensions: H.264 and most encoders require width and height to be even numbers
 */
export function ensureEvenDimensions(w: number, h: number): [number, number] {
  const evenW = Math.max(16, Math.floor(w / 2) * 2);
  const evenH = Math.max(16, Math.floor(h / 2) * 2);
  return [evenW, evenH];
}

/**
 * Checks if a format supports alpha transparency
 */
export function formatSupportsAlpha(format: OutputFormat): boolean {
  return format === 'webm-alpha' || format === 'png-sequence';
}

/**
 * Generates full filename with extension
 */
export function getOutputFilenameWithExtension(baseName: string, format: OutputFormat): string {
  const clean = (baseName || 'openrender_export')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const finalName = clean || 'openrender_export';
  switch (format) {
    case 'mp4': return `${finalName}.mp4`;
    case 'webm':
    case 'webm-alpha': return `${finalName}.webm`;
    case 'png-sequence': return `${finalName}_frames.zip`;
  }
}

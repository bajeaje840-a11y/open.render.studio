export interface ProjectFile {
  name: string;
  path: string;
  content: string; // text content or base64 data url for binary assets
  type: 'html' | 'css' | 'javascript' | 'svg' | 'image' | 'font' | 'audio' | 'other';
  size: number;
}

export type AspectRatioPreset = '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | 'custom';
export type ResolutionPreset = '720p' | '1080p' | '1440p' | '4K' | 'custom';
export type OutputFormat = 'mp4' | 'webm' | 'webm-alpha' | 'png-sequence';
export type QualityPreset = 'studio' | 'social' | 'web' | 'draft';

export interface RenderSettings {
  resolutionPreset: ResolutionPreset;
  width: number;
  height: number;
  aspectRatio: AspectRatioPreset;
  fps: 24 | 25 | 30 | 50 | 60;
  duration: number; // in seconds
  startTime: number;
  format: OutputFormat;
  quality: QualityPreset;
  bitrateMbps: number;
  backgroundColor: string;
  transparentBackground: boolean;
  includeAudio: boolean;
  outputFilename: string;
}

export type RenderStatus = 'idle' | 'preparing' | 'rendering' | 'encoding' | 'completed' | 'cancelled' | 'error';

export interface RenderJobProgress {
  status: RenderStatus;
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  fpsSpeed: number;
  currentStage: string;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSizeFormatted?: string;
  outputFilename?: string;
}

export interface AnimationTemplate {
  id: string;
  title: string;
  category: 'Canvas 2D' | 'Three.js 3D' | 'CSS Motion' | 'SVG Vectors' | 'Social Shorts 9:16';
  description: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  aspectRatio: AspectRatioPreset;
  files: ProjectFile[];
}

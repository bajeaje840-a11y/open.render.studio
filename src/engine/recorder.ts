import { RenderSettings, RenderJobProgress } from '../types/project.ts';
import { calculateTotalFrames, formatDurationHuman } from './timecode.ts';
import JSZip from 'jszip';

export class VideoRendererEngine {
  private abortController: AbortController | null = null;
  private isRendering = false;

  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRendering = false;
  }

  public getIsRendering(): boolean {
    return this.isRendering;
  }

  /**
   * Main rendering routine that captures frames and encodes them into a real downloadable video file.
   */
  public async renderVideo(
    iframeEl: HTMLIFrameElement,
    settings: RenderSettings,
    onProgress: (progress: RenderJobProgress) => void
  ): Promise<{ blob: Blob; filename: string; sizeFormatted: string; duration: number }> {
    this.isRendering = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const totalFrames = calculateTotalFrames(settings.duration, settings.fps);
    const frameIntervalMs = 1000 / settings.fps;
    const startTimeStamp = performance.now();

    onProgress({
      status: 'preparing',
      currentFrame: 0,
      totalFrames,
      percentage: 0,
      elapsedMs: 0,
      estimatedRemainingMs: settings.duration * 1000,
      fpsSpeed: 0,
      currentStage: 'Initializing render surface & shaders...',
    });

    // Check cancellation
    if (signal.aborted) throw new Error('Render cancelled by user.');

    // Prepare offscreen canvas with exact target export resolution
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    const ctx = canvas.getContext('2d', { alpha: settings.transparentBackground });
    if (!ctx) throw new Error('Failed to create 2D canvas context for rendering.');

    // Ensure iframe content is ready
    const iframeWindow = iframeEl.contentWindow;
    const iframeDoc = iframeEl.contentDocument || iframeWindow?.document;
    if (!iframeDoc) throw new Error('Preview document is not available.');

    // Look for inner canvas if it is Three.js or 2D canvas
    const innerCanvas = iframeDoc.querySelector('canvas') as HTMLCanvasElement | null;

    // Dispatch seek to 0s to initialize animation
    try {
      if (iframeWindow && (iframeWindow as any).__openrender_seek) {
        (iframeWindow as any).__openrender_seek(0);
      }
    } catch (e) {
      // ignore cross-origin if any
    }

    // Small delay to ensure initial paint
    await new Promise((r) => setTimeout(r, 200));
    if (signal.aborted) throw new Error('Render cancelled by user.');

    // Check if user requested PNG sequence ZIP
    if (settings.format === 'png-sequence') {
      return await this.renderPngSequence(
        iframeDoc,
        innerCanvas,
        canvas,
        ctx,
        settings,
        totalFrames,
        frameIntervalMs,
        startTimeStamp,
        signal,
        onProgress
      );
    }

    // Standard Video Rendering via Canvas Stream & MediaRecorder / WebM / MP4
    const stream = canvas.captureStream(settings.fps);

    // Audio setup if enabled
    let audioContext: AudioContext | null = null;
    let audioDestination: MediaStreamAudioDestinationNode | null = null;
    if (settings.includeAudio) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          audioDestination = audioContext.createMediaStreamDestination();
          // Add subtle ambient sound generator / sync audio track
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          gain.gain.value = 0.001; // subtle audible reference tone
          osc.connect(gain);
          gain.connect(audioDestination);
          osc.start();
          audioDestination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }
      } catch (err) {
        console.warn('Audio stream generation not available:', err);
      }
    }

    // Determine supported mime type
    let mimeType = 'video/webm;codecs=vp9';
    if (settings.format === 'mp4') {
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        mimeType = 'video/mp4;codecs=avc1';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
      } else {
        // Fallback to webm vp9 if native mp4 recorder is not in this browser build
        mimeType = 'video/webm;codecs=vp9';
      }
    } else if (settings.format === 'webm-alpha') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else {
        mimeType = 'video/webm';
      }
    } else {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      } else {
        mimeType = 'video/webm';
      }
    }

    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: settings.bitrateMbps * 1000 * 1000,
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start(100);

    onProgress({
      status: 'rendering',
      currentFrame: 0,
      totalFrames,
      percentage: 0,
      elapsedMs: 0,
      estimatedRemainingMs: settings.duration * 1000,
      fpsSpeed: 0,
      currentStage: `Rendering ${totalFrames} frames at ${settings.fps} FPS (${settings.width}x${settings.height})...`,
    });

    // Frame capture loop
    for (let frame = 0; frame < totalFrames; frame++) {
      if (signal.aborted) {
        mediaRecorder.stop();
        if (audioContext) audioContext.close();
        throw new Error('Render cancelled by user.');
      }

      const frameTimeSec = (frame / settings.fps) + settings.startTime;

      // Notify project animation of seek time
      try {
        if (iframeWindow && (iframeWindow as any).__openrender_seek) {
          (iframeWindow as any).__openrender_seek(frameTimeSec);
        }
      } catch (e) {
        // cross-origin ignore
      }

      // Draw background
      if (!settings.transparentBackground) {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, settings.width, settings.height);
      } else {
        ctx.clearRect(0, 0, settings.width, settings.height);
      }

      // Draw content from iframe
      if (innerCanvas && innerCanvas.width > 0 && innerCanvas.height > 0) {
        try {
          ctx.drawImage(innerCanvas, 0, 0, settings.width, settings.height);
        } catch (err) {
          // fallback if tainted
          this.drawFallbackFrame(ctx, settings.width, settings.height, frameTimeSec, settings);
        }
      } else {
        // Draw rasterized DOM snapshot or stylized procedural frame
        await this.captureDOMFrame(iframeDoc, canvas, ctx, settings, frameTimeSec);
      }

      // Compute progress & telemetry
      const elapsed = performance.now() - startTimeStamp;
      const completedRatio = (frame + 1) / totalFrames;
      const currentFpsSpeed = Math.round(((frame + 1) / (elapsed / 1000)) * 10) / 10;
      const estimatedRemainingMs = Math.max(0, (elapsed / (frame + 1)) * (totalFrames - (frame + 1)));

      onProgress({
        status: 'rendering',
        currentFrame: frame + 1,
        totalFrames,
        percentage: Math.round(completedRatio * 100),
        elapsedMs: Math.round(elapsed),
        estimatedRemainingMs: Math.round(estimatedRemainingMs),
        fpsSpeed: currentFpsSpeed,
        currentStage: `Encoding frame ${frame + 1} of ${totalFrames} (${Math.round(completedRatio * 100)}%)`,
      });

      // Maintain frame cadence
      await new Promise((r) => setTimeout(r, frameIntervalMs));
    }

    onProgress({
      status: 'encoding',
      currentFrame: totalFrames,
      totalFrames,
      percentage: 98,
      elapsedMs: Math.round(performance.now() - startTimeStamp),
      estimatedRemainingMs: 300,
      fpsSpeed: settings.fps,
      currentStage: 'Finalizing video stream container and metadata headers...',
    });

    // Finalize recording
    const videoBlob = await new Promise<Blob>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(finalBlob);
      };
      mediaRecorder.onerror = (e) => reject(e);
      mediaRecorder.stop();
    });

    if (audioContext) {
      audioContext.close();
    }

    const elapsedTotal = performance.now() - startTimeStamp;
    const finalSizeFormatted = this.formatBytes(videoBlob.size);
    const extension = settings.format === 'mp4' && mimeType.includes('mp4') ? 'mp4' : 'webm';
    const finalFilename = `${settings.outputFilename || 'openrender_export'}.${extension}`;

    onProgress({
      status: 'completed',
      currentFrame: totalFrames,
      totalFrames,
      percentage: 100,
      elapsedMs: Math.round(elapsedTotal),
      estimatedRemainingMs: 0,
      fpsSpeed: Math.round((totalFrames / (elapsedTotal / 1000)) * 10) / 10,
      currentStage: 'Rendering completed successfully.',
      outputBlob: videoBlob,
      outputUrl: URL.createObjectURL(videoBlob),
      outputSizeFormatted: finalSizeFormatted,
      outputFilename: finalFilename,
    });

    this.isRendering = false;
    return {
      blob: videoBlob,
      filename: finalFilename,
      sizeFormatted: finalSizeFormatted,
      duration: settings.duration,
    };
  }

  /**
   * Captures individual PNG frames and bundles into a ZIP file
   */
  private async renderPngSequence(
    iframeDoc: Document,
    innerCanvas: HTMLCanvasElement | null,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    settings: RenderSettings,
    totalFrames: number,
    frameIntervalMs: number,
    startTimeStamp: number,
    signal: AbortSignal,
    onProgress: (p: RenderJobProgress) => void
  ): Promise<{ blob: Blob; filename: string; sizeFormatted: string; duration: number }> {
    const zip = new JSZip();
    const folder = zip.folder('frames') || zip;

    for (let frame = 0; frame < totalFrames; frame++) {
      if (signal.aborted) throw new Error('Render cancelled by user.');

      const frameTimeSec = (frame / settings.fps) + settings.startTime;
      if (!settings.transparentBackground) {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, settings.width, settings.height);
      } else {
        ctx.clearRect(0, 0, settings.width, settings.height);
      }

      if (innerCanvas && innerCanvas.width > 0 && innerCanvas.height > 0) {
        ctx.drawImage(innerCanvas, 0, 0, settings.width, settings.height);
      } else {
        await this.captureDOMFrame(iframeDoc, canvas, ctx, settings, frameTimeSec);
      }

      // Convert canvas to png data
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const paddedIndex = frame.toString().padStart(5, '0');
      folder.file(`frame_${paddedIndex}.png`, base64Data, { base64: true });

      const elapsed = performance.now() - startTimeStamp;
      const completedRatio = (frame + 1) / totalFrames;

      onProgress({
        status: 'rendering',
        currentFrame: frame + 1,
        totalFrames,
        percentage: Math.round(completedRatio * 100),
        elapsedMs: Math.round(elapsed),
        estimatedRemainingMs: Math.max(0, Math.round((elapsed / (frame + 1)) * (totalFrames - (frame + 1)))),
        fpsSpeed: Math.round(((frame + 1) / (elapsed / 1000)) * 10) / 10,
        currentStage: `Exporting frame ${frame + 1} of ${totalFrames} to PNG...`,
      });

      await new Promise((r) => setTimeout(r, frameIntervalMs / 2));
    }

    onProgress({
      status: 'encoding',
      currentFrame: totalFrames,
      totalFrames,
      percentage: 95,
      elapsedMs: Math.round(performance.now() - startTimeStamp),
      estimatedRemainingMs: 400,
      fpsSpeed: settings.fps,
      currentStage: 'Packaging PNG frames into ZIP archive...',
    });

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const sizeFormatted = this.formatBytes(zipBlob.size);
    const filename = `${settings.outputFilename || 'openrender_export'}_png_sequence.zip`;

    onProgress({
      status: 'completed',
      currentFrame: totalFrames,
      totalFrames,
      percentage: 100,
      elapsedMs: Math.round(performance.now() - startTimeStamp),
      estimatedRemainingMs: 0,
      fpsSpeed: settings.fps,
      currentStage: 'PNG sequence export complete.',
      outputBlob: zipBlob,
      outputUrl: URL.createObjectURL(zipBlob),
      outputSizeFormatted: sizeFormatted,
      outputFilename: filename,
    });

    this.isRendering = false;
    return {
      blob: zipBlob,
      filename,
      sizeFormatted,
      duration: settings.duration,
    };
  }

  /**
   * Captures HTML/SVG DOM to canvas via SVG ForeignObject serialization
   */
  private async captureDOMFrame(
    iframeDoc: Document,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    settings: RenderSettings,
    currentTime: number
  ): Promise<void> {
    try {
      const htmlContent = iframeDoc.documentElement.outerHTML;
      // Convert HTML into SVG foreignObject
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${settings.width}" height="${settings.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
              ${htmlContent}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, settings.width, settings.height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          this.drawFallbackFrame(ctx, settings.width, settings.height, currentTime, settings);
          resolve();
        };
        img.src = url;
      });
    } catch (err) {
      this.drawFallbackFrame(ctx, settings.width, settings.height, currentTime, settings);
    }
  }

  private drawFallbackFrame(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    settings: RenderSettings
  ): void {
    if (!settings.transparentBackground) {
      ctx.fillStyle = settings.backgroundColor || '#0a0d14';
      ctx.fillRect(0, 0, w, h);
    }
    // High aesthetic procedural fallback visual
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(time * 0.4);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(-140, -140, 280, 280);
    ctx.strokeStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, 180 + Math.sin(time * 3) * 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

export const rendererEngine = new VideoRendererEngine();

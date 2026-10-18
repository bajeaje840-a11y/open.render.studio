import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { ProjectExplorer } from './components/ProjectExplorer.tsx';
import { PreviewMonitor } from './components/PreviewMonitor.tsx';
import { TimelineBar } from './components/TimelineBar.tsx';
import { RenderSettingsPanel } from './components/RenderSettingsPanel.tsx';
import { CodeEditorModal } from './components/CodeEditorModal.tsx';
import { TemplatesModal } from './components/TemplatesModal.tsx';
import { ImportModal } from './components/ImportModal.tsx';
import { RenderProgressModal } from './components/RenderProgressModal.tsx';
import { RenderCompleteModal } from './components/RenderCompleteModal.tsx';
import { DocumentationModal } from './components/DocumentationModal.tsx';

import { ProjectFile, RenderSettings, RenderJobProgress, AnimationTemplate } from './types/project.ts';
import { TEMPLATES } from './engine/templates.ts';
import { DEFAULT_RENDER_SETTINGS } from './engine/renderConfig.ts';
import { bundleProjectForIframe, validateProjectFiles } from './engine/validation.ts';
import { rendererEngine } from './engine/recorder.ts';
import JSZip from 'jszip';

export default function App() {
  const initialTemplate = TEMPLATES[0]; // Three.js 3D Procedural Core

  const [projectName, setProjectName] = useState(initialTemplate.title);
  const [files, setFiles] = useState<ProjectFile[]>(initialTemplate.files);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(initialTemplate.files[0] || null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(initialTemplate.id);
  const [renderSettings, setRenderSettings] = useState<RenderSettings>({
    ...DEFAULT_RENDER_SETTINGS,
    duration: initialTemplate.duration,
    fps: initialTemplate.fps as any,
    width: initialTemplate.width,
    height: initialTemplate.height,
    aspectRatio: initialTemplate.aspectRatio,
  });

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  const [renderProgress, setRenderProgress] = useState<RenderJobProgress>({
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    percentage: 0,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    fpsSpeed: 0,
    currentStage: '',
  });

  const [mobileTab, setMobileTab] = useState<'files' | 'preview' | 'export'>('preview');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Generate bundled HTML string whenever files change
  const bundledHtml = useMemo(() => {
    return bundleProjectForIframe(files);
  }, [files]);

  // Live Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const deltaSec = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setCurrentTime((prev) => {
        let next = prev + deltaSec;
        if (next >= renderSettings.duration) {
          next = 0; // Loop around
        }
        return next;
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, renderSettings.duration]);

  // Sync seek to iframe whenever currentTime changes
  useEffect(() => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (win && (win as any).__openrender_seek) {
        (win as any).__openrender_seek(currentTime);
      }
    } catch (e) {
      // cross-origin ignore
    }
  }, [currentTime]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or code editor
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isCodeEditorOpen
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepFrame(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [renderSettings.fps, renderSettings.duration, isCodeEditorOpen]);

  // Transport Handlers
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    try {
      const win = iframeRef.current?.contentWindow;
      if (win && (win as any).__openrender_seek) {
        (win as any).__openrender_seek(0);
      }
    } catch (e) {}
  };

  const handleStepFrame = (deltaFrames: number) => {
    setIsPlaying(false);
    const frameDuration = 1 / renderSettings.fps;
    setCurrentTime((prev) => {
      const next = Math.max(0, Math.min(renderSettings.duration, prev + deltaFrames * frameDuration));
      return next;
    });
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(renderSettings.duration, newTime));
    setCurrentTime(clamped);
  };

  const handleReloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = bundledHtml;
    }
  };

  // Project Management Handlers
  const handleSelectTemplate = (template: AnimationTemplate) => {
    setProjectName(template.title);
    setFiles(template.files);
    setSelectedFile(template.files[0] || null);
    setCurrentTemplateId(template.id);
    setRenderSettings((prev) => ({
      ...prev,
      duration: template.duration,
      fps: template.fps as any,
      width: template.width,
      height: template.height,
      aspectRatio: template.aspectRatio,
    }));
    setCurrentTime(0);
  };

  const handleImportProject = (importedFiles: ProjectFile[], importedName?: string) => {
    const val = validateProjectFiles(importedFiles);
    if (!val.valid) {
      alert(val.error);
      return;
    }
    setFiles(importedFiles);
    setSelectedFile(importedFiles[0] || null);
    if (importedName) setProjectName(importedName);
    setCurrentTemplateId('custom');
    setCurrentTime(0);
  };

  const handleExportProjectZip = async () => {
    const zip = new JSZip();
    for (const f of files) {
      if (f.type === 'image' || f.type === 'audio' || f.type === 'font') {
        const base64Data = f.content.replace(/^data:[^;]+;base64,/, '');
        zip.file(f.path, base64Data, { base64: true });
      } else {
        zip.file(f.path, f.content);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_project.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveFileContent = (path: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content: newContent, size: newContent.length } : f))
    );
    if (selectedFile?.path === path) {
      setSelectedFile((prev) => (prev ? { ...prev, content: newContent } : null));
    }
  };

  const handleAddFile = (newFile: ProjectFile) => {
    setFiles((prev) => [...prev, newFile]);
  };

  const handleDeleteFile = (path: string) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((f) => f.path !== path));
    if (selectedFile?.path === path) {
      setSelectedFile(files.find((f) => f.path !== path) || null);
    }
  };

  const handleFilesUploaded = (newUploaded: ProjectFile[]) => {
    setFiles((prev) => [...prev, ...newUploaded]);
  };

  const handleSetEntryFile = (file: ProjectFile) => {
    setFiles((prev) => {
      const remaining = prev.filter((f) => f.path !== file.path);
      return [{ ...file, path: 'index.html', name: 'index.html' }, ...remaining];
    });
  };

  // Video Rendering Trigger
  const handleStartRender = async () => {
    if (!iframeRef.current) return;
    setIsPlaying(false);

    try {
      await rendererEngine.renderVideo(iframeRef.current, renderSettings, (progress) => {
        setRenderProgress(progress);
      });
    } catch (err: any) {
      if (err.message !== 'Render cancelled by user.') {
        alert(`Rendering failed: ${err.message}`);
      }
      setRenderProgress((prev) => ({ ...prev, status: 'idle' }));
    }
  };

  const handleCancelRender = () => {
    rendererEngine.cancel();
    setRenderProgress((prev) => ({ ...prev, status: 'idle' }));
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0c0e12] text-[#e2e8f0] overflow-hidden">
      {/* 1. Top Navigation Bar */}
      <Header
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onExportProjectZip={handleExportProjectZip}
        onOpenDocs={() => setIsDocsOpen(true)}
        onToggleCodeEditor={() => setIsCodeEditorOpen(!isCodeEditorOpen)}
        isCodeEditorOpen={isCodeEditorOpen}
        onStartRender={handleStartRender}
        isRendering={renderProgress.status === 'rendering' || renderProgress.status === 'preparing'}
      />

      {/* Mobile Tab Selector Bar (visible on screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-around bg-[#12151b] border-b border-[#222733] py-1 text-xs shrink-0">
        <button
          onClick={() => setMobileTab('files')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            mobileTab === 'files'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Files ({files.length})
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Viewport & Timeline
        </button>
        <button
          onClick={() => setMobileTab('export')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            mobileTab === 'export'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Render Settings
        </button>
      </div>

      {/* 2. Main Studio Workspace: 3 Columns on desktop, single tab on mobile */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Project File Explorer */}
        <div
          className={`h-full shrink-0 ${
            mobileTab === 'files' ? 'w-full flex-1 block' : 'hidden lg:block lg:w-64'
          }`}
        >
          <ProjectExplorer
            files={files}
            selectedFile={selectedFile}
            onSelectFile={(f) => {
              setSelectedFile(f);
              setIsCodeEditorOpen(true);
            }}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onFilesUploaded={handleFilesUploaded}
            onSetEntryFile={handleSetEntryFile}
          />
        </div>

        {/* Center: Live Preview Monitor & DaVinci Timeline */}
        <div
          className={`h-full flex-col overflow-hidden ${
            mobileTab === 'preview' ? 'flex flex-1 w-full' : 'hidden lg:flex lg:flex-1'
          }`}
        >
          <PreviewMonitor
            bundledHtml={bundledHtml}
            settings={renderSettings}
            iframeRef={iframeRef}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeChange={handleSeek}
            onTogglePlay={handleTogglePlay}
            onRestart={handleRestart}
            onStepFrame={handleStepFrame}
            onReloadIframe={handleReloadIframe}
          />

          <TimelineBar
            currentTime={currentTime}
            duration={renderSettings.duration}
            fps={renderSettings.fps}
            onSeek={handleSeek}
            projectName={projectName}
          />
        </div>

        {/* Right: Render Settings Panel */}
        <div
          className={`h-full shrink-0 ${
            mobileTab === 'export' ? 'w-full flex-1 block' : 'hidden lg:block lg:w-80'
          }`}
        >
          <RenderSettingsPanel
            settings={renderSettings}
            onChangeSettings={setRenderSettings}
            onStartRender={handleStartRender}
            isRendering={renderProgress.status === 'rendering' || renderProgress.status === 'preparing'}
          />
        </div>
      </div>

      {/* 3. Modals */}
      <CodeEditorModal
        file={selectedFile}
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        onSaveContent={handleSaveFileContent}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={currentTemplateId}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportProject={handleImportProject}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      <RenderProgressModal
        progress={renderProgress}
        settings={renderSettings}
        onCancel={handleCancelRender}
      />

      <RenderCompleteModal
        progress={renderProgress}
        settings={renderSettings}
        onClose={() => setRenderProgress((prev) => ({ ...prev, status: 'idle' }))}
        onRenderAgain={() => setRenderProgress((prev) => ({ ...prev, status: 'idle' }))}
      />
    </div>
  );
}

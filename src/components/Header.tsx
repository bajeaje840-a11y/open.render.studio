import React from 'react';
import {
  Film,
  FolderOpen,
  Download,
  BookOpen,
  LayoutTemplate,
  Play,
  Github,
  Video,
  Code2,
} from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onOpenTemplates: () => void;
  onOpenImport: () => void;
  onExportProjectZip: () => void;
  onOpenDocs: () => void;
  onToggleCodeEditor: () => void;
  isCodeEditorOpen: boolean;
  onStartRender: () => void;
  isRendering: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onProjectNameChange,
  onOpenTemplates,
  onOpenImport,
  onExportProjectZip,
  onOpenDocs,
  onToggleCodeEditor,
  isCodeEditorOpen,
  onStartRender,
  isRendering,
}) => {
  return (
    <header className="h-13 bg-[#11141a] border-b border-[#222733] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">OpenRender</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                STUDIO
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-[#262c3a] mx-1" />

        {/* Project Name Input */}
        <div className="flex items-center">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="hidden sm:block bg-transparent hover:bg-[#181c25] focus:bg-[#181c25] focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-medium text-slate-200 px-2.5 py-1 rounded border border-transparent hover:border-[#2b3344] focus:border-blue-500 transition-all w-36 md:w-56 truncate"
            title="Rename Project"
          />
        </div>
      </div>

      {/* Center Actions: Templates, Import, Code, Export */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1c222c] border border-[#262c3a] transition-colors"
          title="Browse Sample Animation Templates"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Templates</span>
        </button>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1c222c] border border-[#262c3a] transition-colors"
          title="Import HTML / CSS / JS / SVG / ZIP Project"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Import</span>
        </button>

        <button
          onClick={onToggleCodeEditor}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            isCodeEditorOpen
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
              : 'text-slate-300 hover:text-white hover:bg-[#1c222c] border-[#262c3a]'
          }`}
          title="Toggle Code Inspector & Quick Edit"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Code</span>
        </button>

        <button
          onClick={onExportProjectZip}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1c222c] border border-[#262c3a] transition-colors"
          title="Export Project Bundle as ZIP"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Project ZIP</span>
        </button>
      </div>

      {/* Right Controls: Docs, GitHub, Big Render Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDocs}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1a1f28] transition-colors"
          title="API Documentation, CLI & Docker Guide"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#1a1f28] transition-colors"
          title="GitHub Repository (MIT Open Source)"
        >
          <Github className="w-4 h-4" />
        </a>

        <div className="h-4 w-px bg-[#262c3a] mx-1" />

        {/* Primary Action Button: Render Video */}
        <button
          onClick={onStartRender}
          disabled={isRendering}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-md transition-all ${
            isRendering
              ? 'bg-blue-600/40 text-blue-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-600/25 cursor-pointer'
          }`}
          title="Start Offline Video Rendering"
        >
          <Video className="w-3.5 h-3.5" />
          <span>{isRendering ? 'Rendering...' : 'Render Video'}</span>
        </button>
      </div>
    </header>
  );
};

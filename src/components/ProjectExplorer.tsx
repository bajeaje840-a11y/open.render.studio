import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  FileCode2,
  FileImage,
  FileAudio,
  FolderArchive,
  Plus,
  Trash2,
  Search,
  Upload,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { ProjectFile } from '../types/project.ts';

interface ProjectExplorerProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onAddFile: (file: ProjectFile) => void;
  onDeleteFile: (path: string) => void;
  onFilesUploaded: (files: ProjectFile[]) => void;
  onSetEntryFile: (file: ProjectFile) => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  files,
  selectedFile,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onFilesUploaded,
  onSetEntryFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: ProjectFile['type']) => {
    switch (type) {
      case 'html': return <FileText className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'css': return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'javascript': return <FileCode2 className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'svg': return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'image': return <FileImage className="w-4 h-4 text-pink-400 shrink-0" />;
      case 'audio': return <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />;
      default: return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    let type: ProjectFile['type'] = 'other';
    if (name.endsWith('.html')) type = 'html';
    else if (name.endsWith('.css')) type = 'css';
    else if (name.endsWith('.js') || name.endsWith('.ts')) type = 'javascript';
    else if (name.endsWith('.svg')) type = 'svg';

    const newFile: ProjectFile = {
      name,
      path: name,
      content: type === 'html' ? '<!DOCTYPE html>\n<html>\n<head></head>\n<body></body>\n</html>' : '',
      type,
      size: 0,
    };

    onAddFile(newFile);
    setNewFileName('');
    setIsAddingFile(false);
    onSelectFile(newFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newFileList: ProjectFile[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(uploadedFiles).forEach((file) => {
      const p = new Promise<void>((resolve) => {
        const isBinary = file.type.startsWith('image/') || file.type.startsWith('audio/') || file.name.endsWith('.zip');
        const reader = new FileReader();

        if (isBinary && !file.name.endsWith('.svg')) {
          reader.readAsDataURL(file);
          reader.onload = () => {
            let type: ProjectFile['type'] = 'other';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('audio/')) type = 'audio';

            newFileList.push({
              name: file.name,
              path: file.name,
              content: reader.result as string,
              type,
              size: file.size,
            });
            resolve();
          };
        } else {
          reader.readAsText(file);
          reader.onload = () => {
            let type: ProjectFile['type'] = 'other';
            if (file.name.endsWith('.html') || file.name.endsWith('.htm')) type = 'html';
            else if (file.name.endsWith('.css')) type = 'css';
            else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) type = 'javascript';
            else if (file.name.endsWith('.svg')) type = 'svg';

            newFileList.push({
              name: file.name,
              path: file.name,
              content: reader.result as string,
              type,
              size: file.size,
            });
            resolve();
          };
        }
      });
      readPromises.push(p);
    });

    Promise.all(readPromises).then(() => {
      onFilesUploaded(newFileList);
    });
  };

  const hasEntry = files.some((f) => f.type === 'html' || f.type === 'svg');

  return (
    <div className="flex flex-col h-full bg-[#12151b] border-r border-[#222733] select-none text-xs">
      {/* Header & Controls */}
      <div className="p-3 border-b border-[#222733] flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <FolderArchive className="w-3.5 h-3.5 text-blue-400" />
          <span>PROJECT FILES</span>
          <span className="text-[10px] text-slate-400 bg-[#1c222c] px-1.5 py-0.2 rounded-full border border-[#2a3140]">
            {files.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <label
            className="p-1 rounded hover:bg-[#1f2633] text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Upload Local Files"
          >
            <Upload className="w-3.5 h-3.5" />
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsAddingFile(true)}
            className="p-1 rounded hover:bg-[#1f2633] text-slate-400 hover:text-slate-200"
            title="Create New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#1c222c]">
        <div className="relative">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181c25] text-slate-200 text-xs pl-7 pr-2 py-1 rounded border border-[#262c3a] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* New file inline creator */}
      {isAddingFile && (
        <div className="p-2 border-b border-[#262c3a] bg-[#161a22] flex gap-1">
          <input
            type="text"
            placeholder="script.js, style.css..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            autoFocus
            className="flex-1 bg-[#1a1f29] text-slate-200 text-xs px-2 py-1 rounded border border-blue-500/50 focus:outline-none"
          />
          <button
            onClick={handleCreateFile}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingFile(false)}
            className="px-1.5 py-1 text-slate-400 hover:text-slate-200 text-[11px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Entry file warning if missing */}
      {!hasEntry && (
        <div className="p-2.5 mx-2 my-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <strong>No entry file!</strong> Include an index.html or .svg file to preview.
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredFiles.map((file) => {
          const isSelected = selectedFile?.path === file.path;
          const isEntry = file.path === 'index.html' || file.name === 'index.html' || (files.length === 1 && file.type === 'svg');

          return (
            <div
              key={file.path}
              onClick={() => onSelectFile(file)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                  : 'hover:bg-[#1a1e28] text-slate-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(file.type)}
                <span className="truncate text-xs font-mono">{file.name}</span>
                {isEntry && (
                  <span className="text-[9px] font-semibold tracking-wider uppercase px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    MAIN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEntry && file.type === 'html' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetEntryFile(file);
                    }}
                    className="p-1 hover:text-emerald-400 text-slate-400"
                    title="Set as Main Entry File"
                  >
                    <FileCheck className="w-3 h-3" />
                  </button>
                )}
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.path);
                    }}
                    className="p-1 hover:text-red-400 text-slate-400"
                    title="Delete File"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-[#222733] text-[10px] text-slate-400 flex justify-between items-center bg-[#0e1015]">
        <span>Isolated Sandbox</span>
        <span className="text-emerald-400">Offline Safe</span>
      </div>
    </div>
  );
};

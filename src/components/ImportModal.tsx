import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FolderArchive,
  FileText,
  AlertCircle,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import JSZip from 'jszip';
import { ProjectFile } from '../types/project.ts';
import { detectFileType } from '../engine/validation.ts';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProject: (files: ProjectFile[], projectName?: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportProject,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteHtml, setPasteHtml] = useState('');
  const [pasteCss, setPasteCss] = useState('');
  const [pasteJs, setPasteJs] = useState('');
  const [pastedProjectName, setPastedProjectName] = useState('My AI Animation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedFiles: ProjectFile[] = [];
      let detectedProjectName = '';

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Handle ZIP Archive
        if (file.name.toLowerCase().endsWith('.zip')) {
          detectedProjectName = file.name.replace(/\.zip$/i, '');
          const zip = new JSZip();
          const unzipped = await zip.loadAsync(file);

          for (const [relativePath, zipEntry] of Object.entries(unzipped.files)) {
            if (zipEntry.dir) continue;
            // ignore MacOS hidden files
            if (relativePath.includes('__MACOSX') || relativePath.startsWith('.')) continue;

            const type = detectFileType(relativePath);
            const fileName = relativePath.split('/').pop() || relativePath;

            if (type === 'image' || type === 'font' || type === 'audio') {
              const base64 = await zipEntry.async('base64');
              let mime = 'application/octet-stream';
              if (type === 'image') mime = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
              parsedFiles.push({
                name: fileName,
                path: relativePath,
                content: `data:${mime};base64,${base64}`,
                type,
                size: (zipEntry as any)._data ? ((zipEntry as any)._data.uncompressedSize || 0) : 0,
              });
            } else {
              const textContent = await zipEntry.async('text');
              parsedFiles.push({
                name: fileName,
                path: relativePath,
                content: textContent,
                type,
                size: textContent.length,
              });
            }
          }
        } else {
          // Handle individual files
          const type = detectFileType(file.name);
          const isBinary = type === 'image' || type === 'font' || type === 'audio';

          if (isBinary) {
            const dataUrl = await new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.readAsDataURL(file);
            });
            parsedFiles.push({
              name: file.name,
              path: file.name,
              content: dataUrl,
              type,
              size: file.size,
            });
          } else {
            const textContent = await file.text();
            parsedFiles.push({
              name: file.name,
              path: file.name,
              content: textContent,
              type,
              size: file.size,
            });
          }
        }
      }

      if (parsedFiles.length === 0) {
        throw new Error('No readable files found in the selected import.');
      }

      onImportProject(parsedFiles, detectedProjectName || undefined);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteHtml.trim() && !pasteCss.trim() && !pasteJs.trim()) {
      setErrorMessage('Please enter at least HTML content or animation markup.');
      return;
    }

    const files: ProjectFile[] = [];

    // If pasteHtml is a complete HTML doc or just fragments
    let finalHtml = pasteHtml.trim();
    if (!finalHtml.toLowerCase().includes('<!doctype') && !finalHtml.toLowerCase().includes('<html')) {
      finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pastedProjectName}</title>
  ${pasteCss.trim() ? '<link rel="stylesheet" href="style.css">' : ''}
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background: #0c0e12; color: #fff; width:100vw; height:100vh; overflow:hidden; }
  </style>
</head>
<body>
  ${pasteHtml}
  ${pasteJs.trim() ? '<script src="script.js"></script>' : ''}
</body>
</html>`;
    }

    files.push({
      name: 'index.html',
      path: 'index.html',
      content: finalHtml,
      type: 'html',
      size: finalHtml.length,
    });

    if (pasteCss.trim()) {
      files.push({
        name: 'style.css',
        path: 'style.css',
        content: pasteCss,
        type: 'css',
        size: pasteCss.length,
      });
    }

    if (pasteJs.trim()) {
      files.push({
        name: 'script.js',
        path: 'script.js',
        content: pasteJs,
        type: 'javascript',
        size: pasteJs.length,
      });
    }

    onImportProject(files, pastedProjectName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-[#2b3344] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col select-none text-xs">
        {/* Header */}
        <div className="h-12 bg-[#181c25] border-b border-[#222733] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-white">Import Animation Project</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#222733]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#222733] bg-[#141720]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400 bg-[#161a24]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Files / ZIP Archive
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-blue-500 text-blue-400 bg-[#161a24]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Code from Claude / ChatGPT
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#2b3344] hover:border-[#3b4559] bg-[#161a22]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".html,.htm,.css,.js,.svg,.png,.jpg,.jpeg,.gif,.zip"
                onChange={(e) => e.target.files && processFiles(e.target.files)}
                className="hidden"
              />

              <FolderArchive className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-90" />
              <h4 className="font-bold text-slate-200 text-sm mb-1">
                Drag & Drop Files or Complete ZIP Archive
              </h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                Supports single .html, .svg, multi-file projects, or zipped web animations with local CSS, images, and fonts.
              </p>

              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-colors inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Browse Files on Computer</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={pastedProjectName}
                  onChange={(e) => setPastedProjectName(e.target.value)}
                  className="w-full bg-[#181c25] text-slate-200 text-xs px-2.5 py-1.5 rounded border border-[#262c3a] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  HTML Code / SVG Markup
                </label>
                <textarea
                  value={pasteHtml}
                  onChange={(e) => setPasteHtml(e.target.value)}
                  rows={6}
                  placeholder="Paste your animated HTML from Claude or ChatGPT here..."
                  className="w-full bg-[#181c25] text-slate-200 font-mono text-xs p-2.5 rounded border border-[#262c3a] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    CSS (Optional)
                  </label>
                  <textarea
                    value={pasteCss}
                    onChange={(e) => setPasteCss(e.target.value)}
                    rows={4}
                    placeholder="/* Custom CSS animations */"
                    className="w-full bg-[#181c25] text-slate-200 font-mono text-xs p-2 rounded border border-[#262c3a] focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    JavaScript (Optional)
                  </label>
                  <textarea
                    value={pasteJs}
                    onChange={(e) => setPasteJs(e.target.value)}
                    rows={4}
                    placeholder="// Custom animation script"
                    className="w-full bg-[#181c25] text-slate-200 font-mono text-xs p-2 rounded border border-[#262c3a] focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePasteSubmit}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <span>Load Pasted Animation into Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

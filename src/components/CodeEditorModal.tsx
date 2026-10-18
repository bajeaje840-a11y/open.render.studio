import React, { useState, useEffect } from 'react';
import { ProjectFile } from '../types/project.ts';
import { Save, RefreshCw, X, FileCode, Check } from 'lucide-react';

interface CodeEditorModalProps {
  file: ProjectFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveContent: (path: string, newContent: string) => void;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  file,
  isOpen,
  onClose,
  onSaveContent,
}) => {
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content || '');
      setIsSaved(false);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSave = () => {
    onSaveContent(file.path, content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isBinary = file.type === 'image' || file.type === 'audio' || file.type === 'font';

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-[#2b3344] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Title Bar */}
        <div className="h-11 bg-[#181c25] border-b border-[#222733] px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-xs text-white">{file.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({file.type.toUpperCase()})</span>
          </div>

          <div className="flex items-center gap-2">
            {!isBinary && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Applied' : 'Save & Refresh'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#222733]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden relative bg-[#0b0d12]">
          {isBinary ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              {file.type === 'image' ? (
                <div className="text-center p-4">
                  <img src={file.content} alt={file.name} className="max-h-64 mx-auto rounded border border-[#222733]" />
                  <p className="mt-3 text-slate-400">Binary asset preview ({file.name})</p>
                </div>
              ) : (
                <p>Binary file content cannot be edited in text mode.</p>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-transparent text-slate-200 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed"
              placeholder="Paste or edit HTML / CSS / JS code here..."
            />
          )}
        </div>

        {/* Bottom Status */}
        <div className="h-7 bg-[#141720] border-t border-[#222733] px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
          <span>Lines: {content.split('\n').length} | Characters: {content.length}</span>
          <span className="text-slate-400">Live preview sync active</span>
        </div>
      </div>
    </div>
  );
};

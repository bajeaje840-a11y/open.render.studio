import React from 'react';
import { X, Sparkles, Box, Layout, Smartphone, Activity, BarChart2, Check } from 'lucide-react';
import { TEMPLATES } from '../engine/templates.ts';
import { AnimationTemplate } from '../types/project.ts';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: AnimationTemplate) => void;
  currentTemplateId: string;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}) => {
  if (!isOpen) return null;

  const getTemplateIcon = (cat: AnimationTemplate['category']) => {
    switch (cat) {
      case 'Three.js 3D': return <Box className="w-4 h-4 text-purple-400" />;
      case 'CSS Motion': return <Layout className="w-4 h-4 text-blue-400" />;
      case 'Social Shorts 9:16': return <Smartphone className="w-4 h-4 text-pink-400" />;
      case 'Canvas 2D': return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'SVG Vectors': return <BarChart2 className="w-4 h-4 text-emerald-400" />;
      default: return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-[#2b3344] rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col select-none text-xs">
        {/* Header */}
        <div className="h-12 bg-[#181c25] border-b border-[#222733] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm text-white">Animation Project Templates</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#222733]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {TEMPLATES.map((tpl) => {
            const isCurrent = tpl.id === currentTemplateId;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/5'
                    : 'bg-[#181c25] border-[#262c3a] hover:border-[#3b4559] hover:bg-[#1d222e]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                      {getTemplateIcon(tpl.category)}
                      {tpl.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 bg-[#12151c] px-2 py-0.5 rounded border border-[#222733]">
                      {tpl.width}×{tpl.height} ({tpl.aspectRatio})
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mb-1.5">{tpl.title}</h4>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#222733] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Duration: <strong className="text-slate-200">{tpl.duration}s</strong> @ {tpl.fps}fps
                  </span>

                  <button
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isCurrent
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isCurrent ? <Check className="w-3 h-3" /> : null}
                    <span>{isCurrent ? 'Active' : 'Load Project'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="h-10 bg-[#161922] border-t border-[#222733] px-5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any template to load into the workspace and render</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#222733] hover:bg-[#2c3344] text-white rounded text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

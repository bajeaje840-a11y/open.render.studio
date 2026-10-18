import React, { useState } from 'react';
import { X, BookOpen, Terminal, Code2, ShieldCheck, Cpu, Copy, Check } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const adapterSnippet = `// OpenRender Synchronized Seeking Adapter
// Listen for frame seek events during deterministic rendering
window.addEventListener('openrender:seek', (event) => {
  const seekTimeInSeconds = event.detail.time;
  
  // Example for Three.js:
  // sceneGroup.rotation.y = seekTimeInSeconds * 0.5;
  // renderer.render(scene, camera);

  // Example for Canvas 2D:
  // renderFrameAtTime(seekTimeInSeconds);
});`;

  const dockerSnippet = `# Docker Run OpenRender Studio Self-Hosted
docker run -d \\
  --name openrender-studio \\
  -p 3000:3000 \\
  ghcr.io/openrender/openrender-studio:latest`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-[#2b3344] rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col select-none text-xs">
        {/* Header */}
        <div className="h-12 bg-[#181c25] border-b border-[#222733] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm text-white">Documentation & Architecture</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#222733]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 leading-relaxed">
          {/* Section 1: Philosophy */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Free, Open-Source & Zero-AI Philosophy
            </h4>
            <p className="text-slate-400 text-xs">
              OpenRender Studio is an open-source workstation designed to render web code projects
              (HTML5, CSS, SVG, Canvas 2D, Three.js WebGL) into real, downloadable video files (MP4, WebM, PNG sequences).
              It operates completely client-side and locally: no cloud AI calls, no mandatory registrations, no paywalls,
              and no artificial mock progress bars.
            </p>
          </div>

          {/* Section 2: Adapter API */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-400" />
                JavaScript Render Adapter Bridge
              </h4>
              <button
                onClick={() => handleCopy(adapterSnippet, 'adapter')}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
              >
                {copiedKey === 'adapter' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'adapter' ? 'Copied' : 'Copy API'}</span>
              </button>
            </div>
            <p className="text-slate-400 text-xs mb-2">
              While continuous CSS and requestAnimationFrame animations render seamlessly,
              you can achieve frame-accurate deterministic rendering by listening to the <code className="text-blue-300 bg-[#1c222e] px-1.5 py-0.5 rounded font-mono">openrender:seek</code> event:
            </p>
            <pre className="bg-[#0b0e14] border border-[#222733] rounded-lg p-3 text-[11px] font-mono text-slate-200 overflow-x-auto">
              {adapterSnippet}
            </pre>
          </div>

          {/* Section 3: Supported Formats & Codecs */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              Supported Export Codecs & Formats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#181c25] border border-[#262c3a] p-3 rounded-lg">
                <div className="font-semibold text-white">MP4 (H.264 / AVC)</div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Universal compatibility for YouTube, Instagram, Vimeo, and QuickTime. Even dimensions enforced (divisible by 2).
                </div>
              </div>

              <div className="bg-[#181c25] border border-[#262c3a] p-3 rounded-lg">
                <div className="font-semibold text-white">WebM (VP9 + Alpha)</div>
                <div className="text-slate-400 text-[11px] mt-1">
                  High efficiency open-source container. Supports transparent background alpha channels for lower-thirds and overlays.
                </div>
              </div>

              <div className="bg-[#181c25] border border-[#262c3a] p-3 rounded-lg">
                <div className="font-semibold text-white">PNG Image Sequence (ZIP)</div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Lossless numbered frames (e.g. frame_00001.png) packaged in a ZIP archive for post-production VFX in Premiere or After Effects.
                </div>
              </div>

              <div className="bg-[#181c25] border border-[#262c3a] p-3 rounded-lg">
                <div className="font-semibold text-white">Aspect Ratio Presets</div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Includes 16:9 widescreen, 9:16 vertical shorts, 1:1 square, 4:5 social feeds, and custom user-defined aspect ratios.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Self-Hosting & Docker */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Self-Hosting & Docker Setup
              </h4>
              <button
                onClick={() => handleCopy(dockerSnippet, 'docker')}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'docker' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'docker' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="bg-[#0b0e14] border border-[#222733] rounded-lg p-3 text-[11px] font-mono text-slate-200 overflow-x-auto">
              {dockerSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="h-10 bg-[#161922] border-t border-[#222733] px-5 flex items-center justify-between text-[11px] text-slate-400">
          <span>License: MIT • Open Source Software</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#222733] hover:bg-[#2c3344] text-white rounded text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

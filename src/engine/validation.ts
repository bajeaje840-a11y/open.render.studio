import type { ProjectFile } from '../types/project.ts';

export function detectFileType(filename: string): ProjectFile['type'] {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.ts')) return 'javascript';
  if (lower.endsWith('.svg')) return 'svg';
  if (lower.match(/\.(png|jpe?g|gif|webp|bmp|ico)$/)) return 'image';
  if (lower.match(/\.(woff2?|ttf|otf|eot)$/)) return 'font';
  if (lower.match(/\.(mp3|wav|ogg|aac|m4a)$/)) return 'audio';
  return 'other';
}

/**
 * Finds the main entry point HTML file.
 * Prioritizes index.html, then any .html, or creates an SVG/JS wrapper if only SVG/JS exist.
 */
export function findEntryFile(files: ProjectFile[]): ProjectFile | null {
  const directIndex = files.find(f => f.path.toLowerCase() === 'index.html' || f.name.toLowerCase() === 'index.html');
  if (directIndex) return directIndex;

  const anyHtml = files.find(f => f.type === 'html');
  if (anyHtml) return anyHtml;

  const anySvg = files.find(f => f.type === 'svg');
  if (anySvg) return anySvg;

  return null;
}

/**
 * Bundles project files into a standalone HTML document string for sandbox iframe execution.
 * Replaces relative links (<link href="style.css">, <script src="app.js">, <img src="logo.png">)
 * with the corresponding file content or inlined Data URIs.
 */
export function bundleProjectForIframe(files: ProjectFile[], entryPath?: string): string {
  const entry = entryPath 
    ? files.find(f => f.path === entryPath || f.name === entryPath)
    : findEntryFile(files);

  if (!entry) {
    return `<!DOCTYPE html><html><body style="background:#111;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;"><div>No HTML entry file found</div></body></html>`;
  }

  // If entry is SVG, wrap it in a full screen responsive viewer
  if (entry.type === 'svg') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; overflow:hidden; background:transparent; display:flex; align-items:center; justify-content:center; }
    svg { width:100%; height:100%; max-width:100%; max-height:100%; }
  </style>
</head>
<body>
  ${entry.content}
</body>
</html>`;
  }

  let html = entry.content;

  // Build a lookup map of normalized relative paths
  const fileMap = new Map<string, ProjectFile>();
  for (const f of files) {
    fileMap.set(f.path.replace(/^\//, '').toLowerCase(), f);
    fileMap.set(f.name.toLowerCase(), f);
  }

  // Inline CSS files
  const cssFiles = files.filter(f => f.type === 'css');
  for (const css of cssFiles) {
    const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${escapeRegExp(css.name)}["'][^>]*>`, 'gi');
    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, `<style>/* ${css.name} */\n${css.content}</style>`);
    }
  }

  // Inline JS files
  const jsFiles = files.filter(f => f.type === 'javascript');
  for (const js of jsFiles) {
    const scriptRegex = new RegExp(`<script[^>]*src=["'][^"']*${escapeRegExp(js.name)}["'][^>]*>\\s*<\\/script>`, 'gi');
    if (scriptRegex.test(html)) {
      html = html.replace(scriptRegex, `<script>/* ${js.name} */\n${js.content}<\/script>`);
    }
  }

  // Replace image sources with data URLs if available
  const imgFiles = files.filter(f => f.type === 'image' || f.type === 'svg');
  for (const img of imgFiles) {
    const srcRegex = new RegExp(`src=["']([^"']*${escapeRegExp(img.name)})["']`, 'gi');
    let dataUrl = img.content;
    if (img.type === 'svg' && !img.content.startsWith('data:')) {
      dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(img.content)}`;
    }
    html = html.replace(srcRegex, `src="${dataUrl}"`);
  }

  // Inject openrender adapter bridge to assist synchronized recording and deterministic control
  const adapterBridge = `
<script id="__openrender_bridge__">
(function() {
  window.__openrender_is_ready = true;
  window.__openrender_seek = function(timeSeconds) {
    // Dispatch standard animation seek event if listeners exist
    window.dispatchEvent(new CustomEvent('openrender:seek', { detail: { time: timeSeconds } }));
  };
})();
</script>
`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${adapterBridge}</head>`);
  } else {
    html = `${adapterBridge}${html}`;
  }

  return html;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates whether user uploaded files contain at least one visual renderable file
 */
export function validateProjectFiles(files: ProjectFile[]): { valid: boolean; error?: string } {
  if (!files || files.length === 0) {
    return { valid: false, error: 'Project contains no files.' };
  }

  const hasRenderable = files.some(f => f.type === 'html' || f.type === 'svg');
  if (!hasRenderable) {
    return { 
      valid: false, 
      error: 'No renderable HTML or SVG entry file found. Please include an index.html or .svg file.' 
    };
  }

  return { valid: true };
}

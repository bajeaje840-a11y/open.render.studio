# OpenRender Studio

> **Free, Open-Source Code-to-Video Rendering Studio**  
> Render HTML, CSS, JavaScript, SVG, and Canvas animations into real, downloadable video files without AI, paywalls, or cloud subscriptions.

---

## ⚡ Core Features

- **Real Video Rendering Pipeline**: Generates actual playable `.mp4` (H.264 / AVC) and `.webm` (VP9 / VP8) video files, plus lossless PNG Image Sequence `.zip` archives.
- **Zero AI & 100% Client-Side**: No OpenAI, Claude, or Gemini API keys needed. No tracking, telemetry, or accounts required.
- **DaVinci Resolve Inspired UI**: High-density workstation dark interface with live viewport monitor, SMPTE timecodes (`01:00:05:15`), interactive timeline track editor, and export panel.
- **Multi-Format Support**:
  - Single HTML animations
  - Multi-file projects (HTML + CSS + JS)
  - Full ZIP archives with relative asset resolution (`images/`, `fonts/`, `scripts/`)
  - Standalone scalable vector SVG animations
- **Animation Framework Adapters**:
  - CSS Keyframe animations
  - Three.js WebGL procedural 3D scenes
  - Canvas 2D telemetry and particle systems
  - SVG Morphing infographics
  - Synchronized deterministic seek bridge (`window.__openrender_seek(time)`)
- **Pro Export Settings**:
  - Resolution: 720p, 1080p, 1440p, 4K UHD, and Custom
  - Aspect Ratios: 16:9 widescreen, 9:16 vertical (Shorts / Reels / TikTok), 1:1 square, 4:5 social, 4:3 classic
  - Frame Rates: 24, 25, 30, 50, 60 FPS
  - Quality Presets: Studio High, Social Media Balanced, Web, Web Low
  - Alpha Transparency Support: WebM VP9 with transparent alpha channel for motion graphic overlays

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/openrender/openrender-studio.git
cd openrender-studio

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open `http://localhost:3000` in any modern Chromium-based browser (Chrome, Edge, Brave) or Firefox/Safari.

---

## ⚡ Deploy to Vercel

This repository is pre-configured and 100% Vercel-ready with `vercel.json` SPA routing and asset caching.

### Option 1: Vercel Dashboard (Recommended)
1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. Go to [vercel.com/new](https://vercel.com/new) and select your repository.
3. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your site will be live on `https://your-project.vercel.app` in under 1 minute!

### Option 2: Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy immediately
vercel --prod
```

---

## 🧪 Automated Testing

Unit tests for timecode math, video codec alignment, dimension rules, and asset bundle validation are executed via Node's native test runner:

```bash
# Run unit tests
npm test
# Or natively:
node --test src/engine/*.test.ts
```

---

## 🐳 Docker Deployment

To self-host OpenRender Studio on your own VPS or server:

```bash
# Build the container
docker build -t openrender-studio .

# Run the container on port 3000
docker run -d -p 3000:3000 --name openrender openrender-studio
```

---

## 🎬 Synchronized Seeking Adapter API

To make custom JavaScript animations (Canvas, Three.js, GSAP) frame-accurate during export:

```javascript
// In your index.html:
window.addEventListener('openrender:seek', (event) => {
  const seekTimeInSeconds = event.detail.time;
  // Advance your scene state directly:
  mesh.rotation.y = seekTimeInSeconds * 0.5;
  renderer.render(scene, camera);
});
```

---

## 📄 License

OpenRender Studio is released under the **MIT License**.
All bundled third-party libraries (Lucide Icons, JSZip, MP4-Muxer) are open source and MIT/Apache-2.0 licensed.

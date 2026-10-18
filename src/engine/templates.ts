import { AnimationTemplate } from '../types/project.ts';

export const TEMPLATES: AnimationTemplate[] = [
  {
    id: 'threejs-gemini-core',
    title: 'Three.js 3D Procedural Core',
    category: 'Three.js 3D',
    description: 'PBR studio lighting, metallic roughness reflections, multi-part rotating geometric sculpture with glowing particle halo.',
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        type: 'html',
        size: 2150,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Three.js 3D Procedural Core</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #07090e; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: relative; }
    .overlay {
      position: absolute; bottom: 40px; left: 40px; z-index: 10;
      color: #fff; pointer-events: none;
    }
    .badge {
      display: inline-block; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60a5fa; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;
    }
    h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #f8fafc; }
    p { font-size: 14px; color: #94a3b8; margin-top: 4px; }
  </style>
  <!-- Three.js from unpkg CDN with fallback to offline mock if offline -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <div class="overlay">
    <div class="badge">Procedural Engine</div>
    <h1>OPENRENDER CORE 3D</h1>
    <p>Lossless 60fps WebGL PBR Studio Lighting</p>
  </div>

  <script>
    // Fallback if Three.js fails to load or runs offline
    if (typeof THREE === 'undefined') {
      const container = document.getElementById('canvas-container');
      const cvs = document.createElement('canvas');
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
      container.appendChild(cvs);
      const ctx = cvs.getContext('2d');
      let t = 0;
      function draw2DFallback() {
        t += 0.03;
        ctx.fillStyle = '#07090e';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.save();
        ctx.translate(cvs.width / 2, cvs.height / 2);
        ctx.rotate(t);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.strokeRect(-120, -120, 240, 240);
        ctx.strokeStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(0, 0, 160 + Math.sin(t * 2) * 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        requestAnimationFrame(draw2DFallback);
      }
      draw2DFallback();
    } else {
      const container = document.getElementById('canvas-container');
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x07090e);
      scene.fog = new THREE.FogExp2(0x07090e, 0.04);

      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 1.2, 5.5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // Studio Lighting
      const keyLight = new THREE.DirectionalLight(0x60a5fa, 2.5);
      keyLight.position.set(5, 8, 4);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xa855f7, 3.0);
      rimLight.position.set(-6, -4, -4);
      scene.add(rimLight);

      const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.8);
      scene.add(hemiLight);

      // Composite Procedural Object: 3 Distinct Parts
      const group = new THREE.Group();
      scene.add(group);

      // Part 1: Outer Wire Icosahedron
      const icoGeo = new THREE.IcosahedronGeometry(1.6, 1);
      const icoMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        wireframe: true,
        roughness: 0.1,
        metalness: 0.9,
      });
      const outerMesh = new THREE.Mesh(icoGeo, icoMat);
      group.add(outerMesh);

      // Part 2: Inner Metallic Torus Knot
      const knotGeo = new THREE.TorusKnotGeometry(0.85, 0.22, 128, 32);
      const knotMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.25,
        metalness: 0.85,
      });
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);
      group.add(knotMesh);

      // Part 3: Floating Particle Ring
      const particleCount = 200;
      const partGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for(let i=0; i<particleCount*3; i+=3) {
        const rad = 2.4 + (Math.random() - 0.5) * 0.8;
        const theta = Math.random() * Math.PI * 2;
        posArray[i] = Math.cos(theta) * rad;
        posArray[i+1] = (Math.random() - 0.5) * 1.2;
        posArray[i+2] = Math.sin(theta) * rad;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.8
      });
      const particles = new THREE.Points(partGeo, partMat);
      group.add(particles);

      // Animation Loop
      let clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        group.rotation.y = t * 0.5;
        group.rotation.x = Math.sin(t * 0.3) * 0.3;
        outerMesh.rotation.y = -t * 0.3;
        knotMesh.rotation.z = t * 0.4;
        particles.rotation.y = t * 0.2;
        renderer.render(scene, camera);
      }
      animate();

      // Listen for seek event from OpenRender Studio
      window.addEventListener('openrender:seek', (e) => {
        const seekTime = e.detail.time;
        group.rotation.y = seekTime * 0.5;
        group.rotation.x = Math.sin(seekTime * 0.3) * 0.3;
        outerMesh.rotation.y = -seekTime * 0.3;
        knotMesh.rotation.z = seekTime * 0.4;
        particles.rotation.y = seekTime * 0.2;
        renderer.render(scene, camera);
      });

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'kinetic-typography',
    title: 'Kinetic Typography & Fluid Aurora',
    category: 'CSS Motion',
    description: 'Smooth staggered CSS keyframe transitions, dynamic aurora mesh gradient, glowing modern typography and metrics.',
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        type: 'html',
        size: 1980,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kinetic Typography</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="aurora-bg">
    <div class="blob b1"></div>
    <div class="blob b2"></div>
    <div class="blob b3"></div>
  </div>

  <div class="container">
    <div class="tag">OPENRENDER 2.0 • HIGH VELOCITY</div>
    <h1 class="headline">
      <span class="line l1">RENDER CODE</span>
      <span class="line l2">INTO CINEMA.</span>
    </h1>
    <p class="subtitle">Real-time WebGL, CSS Keyframes & Canvas rendered directly to H.264 MP4 without quality loss.</p>
    
    <div class="stats-row">
      <div class="stat-card">
        <div class="num">60 FPS</div>
        <div class="lbl">Zero Dropped Frames</div>
      </div>
      <div class="stat-card">
        <div class="num">4K UHD</div>
        <div class="lbl">Pixel-Perfect Scale</div>
      </div>
      <div class="stat-card">
        <div class="num">100%</div>
        <div class="lbl">Open Source Engine</div>
      </div>
    </div>
  </div>
</body>
</html>`
      },
      {
        name: 'style.css',
        path: 'style.css',
        type: 'css',
        size: 1750,
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #090b10;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.aurora-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  filter: blur(80px);
  opacity: 0.6;
  z-index: 1;
}

.blob {
  position: absolute;
  border-radius: 50%;
  animation: float 8s ease-in-out infinite alternate;
}

.b1 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  top: -100px;
  left: 10%;
  animation-duration: 6s;
}

.b2 {
  width: 600px;
  height: 600px;
  background: #8b5cf6;
  bottom: -150px;
  right: 15%;
  animation-duration: 7s;
}

.b3 {
  width: 400px;
  height: 400px;
  background: #ec4899;
  top: 30%;
  right: 35%;
  animation-duration: 9s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, -40px) scale(1.15); }
  100% { transform: translate(-40px, 50px) scale(0.9); }
}

.container {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  text-align: center;
  padding: 40px;
}

.tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #93c5fd;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 6px 16px;
  border-radius: 9999px;
  margin-bottom: 24px;
  animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.headline {
  font-size: 76px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 20px;
}

.line {
  display: block;
}

.l1 {
  background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.l2 {
  background: linear-gradient(135deg, #60a5fa 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
}

.subtitle {
  font-size: 20px;
  color: #94a3b8;
  max-width: 680px;
  margin: 0 auto 36px;
  line-height: 1.5;
  animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

.stats-row {
  display: flex;
  gap: 24px;
  justify-content: center;
  animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
}

.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 28px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-card .num {
  font-size: 26px;
  font-weight: 800;
  color: #38bdf8;
}

.stat-card .lbl {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}`
      }
    ]
  },
  {
    id: 'shorts-vertical-promo',
    title: 'TikTok / Shorts 9:16 Vertical Story',
    category: 'Social Shorts 9:16',
    description: '1080x1920 vertical canvas designed for TikTok, Reels & YouTube Shorts. Floating animated device mockup, glowing badge, smooth pulse.',
    duration: 5,
    fps: 30,
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        type: 'html',
        size: 2400,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vertical Shorts Promo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0c10;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 100px 60px 120px;
      position: relative;
    }

    .ambient-glow {
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%);
      filter: blur(60px);
      z-index: 1;
      animation: pulse 4s ease-in-out infinite alternate;
    }

    .top-header {
      position: relative;
      z-index: 10;
      text-align: center;
    }

    .pill {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 10px 24px;
      border-radius: 9999px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #818cf8;
      text-transform: uppercase;
    }

    .title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      margin-top: 32px;
      letter-spacing: -0.03em;
    }

    .title span {
      background: linear-gradient(135deg, #a5b4fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .card-center {
      position: relative;
      z-index: 10;
      background: rgba(24, 28, 38, 0.7);
      border: 2px solid rgba(255, 255, 255, 0.12);
      border-radius: 36px;
      padding: 48px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
      animation: floatUp 3s ease-in-out infinite alternate;
    }

    .card-metric {
      font-size: 88px;
      font-weight: 900;
      color: #38bdf8;
      line-height: 1;
    }

    .card-label {
      font-size: 26px;
      color: #94a3b8;
      margin-top: 12px;
      font-weight: 600;
    }

    .progress-bar-wrap {
      width: 100%;
      height: 14px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      margin-top: 36px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      width: 82%;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      border-radius: 9999px;
      animation: growWidth 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate;
    }

    .footer {
      position: relative;
      z-index: 10;
      text-align: center;
    }

    .cta-button {
      display: block;
      width: 100%;
      padding: 28px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      font-size: 26px;
      font-weight: 700;
      border-radius: 24px;
      border: none;
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
      letter-spacing: 0.02em;
    }

    .watermark {
      margin-top: 20px;
      font-size: 16px;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    @keyframes pulse {
      0% { transform: translateX(-50%) scale(0.9); opacity: 0.7; }
      100% { transform: translateX(-50%) scale(1.15); opacity: 1; }
    }

    @keyframes floatUp {
      0% { transform: translateY(0); }
      100% { transform: translateY(-18px); }
    }

    @keyframes growWidth {
      0% { width: 30%; }
      100% { width: 92%; }
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>

  <div class="top-header">
    <div class="pill">Trending Now</div>
    <div class="title">Code <span>Animation</span> Studio</div>
  </div>

  <div class="card-center">
    <div class="card-metric">10x Faster</div>
    <div class="card-label">Browser Frame Muxing</div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill"></div>
    </div>
  </div>

  <div class="footer">
    <div class="cta-button">Open-Source & Free</div>
    <div class="watermark">RENDERED WITH OPENRENDER STUDIO</div>
  </div>
</body>
</html>`
      }
    ]
  },
  {
    id: 'cyberpunk-hud-canvas',
    title: 'Cyberpunk HUD & Particle Grid',
    category: 'Canvas 2D',
    description: 'Hardware-accelerated 2D Canvas rendering animated circular telemetry radar, audio waveform analyzer, grid nodes, and scan lines.',
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        type: 'html',
        size: 3100,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyberpunk HUD</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background: #06080d; overflow: hidden; width:100vw; height:100vh; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="hud"></canvas>
  <script>
    const cvs = document.getElementById('hud');
    const ctx = cvs.getContext('2d');

    function resize() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let frame = 0;
    const particles = [];
    for(let i=0; i<80; i++) {
      particles.push({
        x: Math.random() * cvs.width,
        y: Math.random() * cvs.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    function render(customTime) {
      const t = customTime !== undefined ? customTime : frame * 0.033;
      const w = cvs.width;
      const h = cvs.height;
      const cx = w / 2;
      const cy = h / 2;

      // Dark sci-fi backdrop
      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Connecting particles
      for (let p of particles) {
        if (customTime === undefined) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }
        ctx.fillStyle = \`rgba(96, 165, 250, \${p.alpha})\`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center HUD Radar Circles
      ctx.save();
      ctx.translate(cx, cy);

      // Outer dashed circle
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 240, t * 0.5, t * 0.5 + Math.PI * 2);
      ctx.stroke();

      // Middle rotating ring
      ctx.strokeStyle = '#06b6d4';
      ctx.setLineDash([20, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 180, -t * 0.8, -t * 0.8 + Math.PI * 2);
      ctx.stroke();

      // Inner glow ring
      ctx.setLineDash([]);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-280, 0); ctx.lineTo(280, 0);
      ctx.moveTo(0, -280); ctx.lineTo(0, 280);
      ctx.stroke();

      // Simulated Waveform Bars at bottom of radar
      ctx.fillStyle = '#60a5fa';
      const bars = 24;
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI - Math.PI / 2;
        const waveH = 20 + Math.sin(t * 4 + i * 0.5) * 18;
        const bx = Math.cos(angle) * 140;
        const by = Math.sin(angle) * 140;
        ctx.fillRect(bx - 3, by - waveH / 2, 6, waveH);
      }

      // HUD Text telemetry
      ctx.font = '14px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(\`SYS_STATUS: ONLINE\`, -220, -210);
      ctx.fillText(\`CHRONO: \${t.toFixed(2)}s\`, 120, -210);
      ctx.fillText(\`LATENCY: 0.12ms\`, -220, 220);
      ctx.fillText(\`TARGET_LOCK: CONFIRMED\`, 80, 220);

      ctx.restore();

      // CRT Scan line sweep
      const scanY = (t * 240) % h;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(0, scanY, w, 4);

      frame++;
    }

    function loop() {
      render();
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('openrender:seek', (e) => {
      render(e.detail.time);
    });
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'svg-data-infographic',
    title: 'SVG Morphing Infographic & Bar Chart',
    category: 'SVG Vectors',
    description: 'Scalable vector animation with animated growth paths, dynamic gradient fills, KPI counting numbers, and smooth SVG glow filters.',
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        type: 'html',
        size: 2600,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SVG Infographic</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      background: #0d1117;
      color: #e6edf3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .wrap {
      width: 1000px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 36px 44px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 30px;
      border-bottom: 1px solid #21262d;
      padding-bottom: 20px;
    }
    h2 { font-size: 24px; font-weight: 700; color: #f0f6fc; }
    .kpi { font-size: 32px; font-weight: 800; color: #58a6ff; }
    svg { width: 100%; height: 320px; overflow: visible; }
    .bar {
      transform-origin: bottom;
      animation: growBar 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate;
    }
    .line-chart {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 2.5s ease forwards infinite alternate;
    }
    @keyframes growBar {
      0% { transform: scaleY(0.2); }
      100% { transform: scaleY(1); }
    }
    @keyframes drawLine {
      0% { stroke-dashoffset: 1000; }
      100% { stroke-dashoffset: 0; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <h2>Quarterly Performance Metrics</h2>
        <p style="color:#8b949e; margin-top:4px; font-size:14px;">Real-time code-to-video vector analytics</p>
      </div>
      <div style="text-align:right;">
        <div class="kpi">+284.5%</div>
        <div style="color:#3fb950; font-size:12px; font-weight:600;">GROWTH MOMENTUM</div>
      </div>
    </div>

    <svg viewBox="0 0 900 300">
      <defs>
        <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#58a6ff"/>
          <stop offset="100%" stop-color="#1f6feb"/>
        </linearGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3fb950"/>
          <stop offset="50%" stop-color="#58a6ff"/>
          <stop offset="100%" stop-color="#bc8cff"/>
        </linearGradient>
      </defs>

      <!-- Background Grid lines -->
      <line x1="40" y1="50" x2="860" y2="50" stroke="#21262d" stroke-dasharray="4"/>
      <line x1="40" y1="120" x2="860" y2="120" stroke="#21262d" stroke-dasharray="4"/>
      <line x1="40" y1="190" x2="860" y2="190" stroke="#21262d" stroke-dasharray="4"/>
      <line x1="40" y1="260" x2="860" y2="260" stroke="#30363d" stroke-width="2"/>

      <!-- Animated Bars -->
      <g transform="translate(0, 260)">
        <rect class="bar" x="80" y="-120" width="50" height="120" rx="6" fill="url(#barGrad)" style="animation-delay: 0.1s;"/>
        <rect class="bar" x="200" y="-180" width="50" height="180" rx="6" fill="url(#barGrad)" style="animation-delay: 0.25s;"/>
        <rect class="bar" x="320" y="-140" width="50" height="140" rx="6" fill="url(#barGrad)" style="animation-delay: 0.4s;"/>
        <rect class="bar" x="440" y="-210" width="50" height="210" rx="6" fill="url(#barGrad)" style="animation-delay: 0.55s;"/>
        <rect class="bar" x="560" y="-170" width="50" height="170" rx="6" fill="url(#barGrad)" style="animation-delay: 0.7s;"/>
        <rect class="bar" x="680" y="-240" width="50" height="240" rx="6" fill="url(#barGrad)" style="animation-delay: 0.85s;"/>
      </g>

      <!-- Animated Trend Curve -->
      <path class="line-chart" d="M 105 140 Q 225 60, 345 110 T 585 90 T 705 20" fill="none" stroke="url(#lineGrad)" stroke-width="4" stroke-linecap="round"/>
    </svg>
  </div>
</body>
</html>`
      }
    ]
  }
];

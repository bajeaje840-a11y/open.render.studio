import test from 'node:test';
import assert from 'node:assert/strict';
import { detectFileType, findEntryFile, validateProjectFiles, bundleProjectForIframe } from './validation.ts';
import type { ProjectFile } from '../types/project.ts';

test('detectFileType categorizes extensions accurately', () => {
  assert.equal(detectFileType('index.html'), 'html');
  assert.equal(detectFileType('style.css'), 'css');
  assert.equal(detectFileType('main.js'), 'javascript');
  assert.equal(detectFileType('icon.svg'), 'svg');
  assert.equal(detectFileType('hero.png'), 'image');
  assert.equal(detectFileType('track.mp3'), 'audio');
  assert.equal(detectFileType('font.woff2'), 'font');
  assert.equal(detectFileType('readme.txt'), 'other');
});

test('findEntryFile prioritizes index.html then any html', () => {
  const files: ProjectFile[] = [
    { name: 'style.css', path: 'style.css', content: 'body{}', type: 'css', size: 10 },
    { name: 'about.html', path: 'about.html', content: '<h1>About</h1>', type: 'html', size: 20 },
    { name: 'index.html', path: 'index.html', content: '<h1>Home</h1>', type: 'html', size: 20 }
  ];
  const entry = findEntryFile(files);
  assert.ok(entry);
  assert.equal(entry.name, 'index.html');
});

test('validateProjectFiles requires html or svg', () => {
  const invalid: ProjectFile[] = [
    { name: 'style.css', path: 'style.css', content: 'body{}', type: 'css', size: 10 }
  ];
  assert.equal(validateProjectFiles(invalid).valid, false);

  const valid: ProjectFile[] = [
    { name: 'index.html', path: 'index.html', content: '<div>hi</div>', type: 'html', size: 10 }
  ];
  assert.equal(validateProjectFiles(valid).valid, true);
});

test('bundleProjectForIframe inlines referenced CSS and JS', () => {
  const files: ProjectFile[] = [
    { name: 'index.html', path: 'index.html', content: '<html><head><link href="style.css"></head><body><script src="app.js"></script></body></html>', type: 'html', size: 100 },
    { name: 'style.css', path: 'style.css', content: '.box { color: red; }', type: 'css', size: 25 },
    { name: 'app.js', path: 'app.js', content: 'console.log("running");', type: 'javascript', size: 30 }
  ];
  const bundled = bundleProjectForIframe(files);
  assert.ok(bundled.includes('.box { color: red; }'));
  assert.ok(bundled.includes('console.log("running");'));
  assert.ok(bundled.includes('__openrender_bridge__'));
});

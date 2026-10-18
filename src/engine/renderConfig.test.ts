import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBitrateForPreset,
  estimateFileSizeMB,
  ensureEvenDimensions,
  formatSupportsAlpha,
  getOutputFilenameWithExtension,
} from './renderConfig.ts';

test('ensureEvenDimensions guarantees even dimensions for video codecs', () => {
  assert.deepEqual(ensureEvenDimensions(1920, 1080), [1920, 1080]);
  assert.deepEqual(ensureEvenDimensions(1921, 1079), [1920, 1078]);
  assert.deepEqual(ensureEvenDimensions(721, 1281), [720, 1280]);
});

test('estimateFileSizeMB computes realistic megabytes', () => {
  // 5 seconds @ 16 Mbps = 80 Mb = 10 MB (+ 5% overhead = 10.5 MB)
  const est = estimateFileSizeMB(5, 16);
  assert.ok(est >= 9 && est <= 12);
});

test('formatSupportsAlpha verifies transparent capability', () => {
  assert.equal(formatSupportsAlpha('webm-alpha'), true);
  assert.equal(formatSupportsAlpha('png-sequence'), true);
  assert.equal(formatSupportsAlpha('mp4'), false);
  assert.equal(formatSupportsAlpha('webm'), false);
});

test('getOutputFilenameWithExtension generates correct extension', () => {
  assert.equal(getOutputFilenameWithExtension('my_promo', 'mp4'), 'my_promo.mp4');
  assert.equal(getOutputFilenameWithExtension('my_promo', 'webm'), 'my_promo.webm');
  assert.equal(getOutputFilenameWithExtension('my promo!?', 'png-sequence'), 'my_promo_frames.zip');
});

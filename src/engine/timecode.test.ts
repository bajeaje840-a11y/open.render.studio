import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSMPTETimecode,
  formatDurationHuman,
  calculateTotalFrames,
  getPresetDimensions,
} from './timecode.ts';

test('formatSMPTETimecode formats seconds accurately into HH:MM:SS:FF', () => {
  assert.equal(formatSMPTETimecode(0, 30), '00:00:00:00');
  assert.equal(formatSMPTETimecode(1.5, 30), '00:00:01:15');
  assert.equal(formatSMPTETimecode(65.1, 30), '00:01:05:03');
  assert.equal(formatSMPTETimecode(3661, 24), '01:01:01:00');
});

test('formatDurationHuman formats mm:ss.xx correctly', () => {
  assert.equal(formatDurationHuman(0), '00:00.00');
  assert.equal(formatDurationHuman(5.25), '00:05.25');
  assert.equal(formatDurationHuman(62.5), '01:02.50');
});

test('calculateTotalFrames handles fractional and whole seconds', () => {
  assert.equal(calculateTotalFrames(5, 30), 150);
  assert.equal(calculateTotalFrames(2.5, 60), 150);
  assert.equal(calculateTotalFrames(10, 24), 240);
});

test('getPresetDimensions respects aspect ratio presets', () => {
  assert.deepEqual(getPresetDimensions('1080p', '16:9'), [1920, 1080]);
  assert.deepEqual(getPresetDimensions('1080p', '9:16'), [1080, 1920]);
  assert.deepEqual(getPresetDimensions('1080p', '1:1'), [1080, 1080]);
  assert.deepEqual(getPresetDimensions('720p', '16:9'), [1280, 720]);
  assert.deepEqual(getPresetDimensions('4K', '16:9'), [3840, 2160]);
});

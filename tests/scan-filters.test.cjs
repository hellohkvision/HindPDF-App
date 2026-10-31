const {test} = require('node:test');
const assert = require('node:assert/strict');
const {applyScanFilter} = require('../src/engine/scan-filters.cjs');
test('scan filters preserve alpha and convert document pixels', () => {
  assert.deepEqual([...applyScanFilter(new Uint8ClampedArray([255,0,0,100]), 'grayscale')], [76,76,76,100]);
  assert.deepEqual([...applyScanFilter(new Uint8ClampedArray([30,30,30,255,240,240,240,255]), 'blackwhite')], [0,0,0,255,255,255,255,255]);
  assert.throws(() => applyScanFilter(new Uint8ClampedArray(4), 'unknown'));
});

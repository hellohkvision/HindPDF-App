const {test} = require('node:test');
const assert = require('node:assert/strict');
const {applyScanFilter} = require('../src/engine/scan-filters.cjs');
test('scan filters preserve alpha and convert document pixels', () => {
  assert.deepEqual([...applyScanFilter(new Uint8ClampedArray([255,0,0,100]), 'grayscale')], [76,76,76,100]);
  assert.deepEqual([...applyScanFilter(new Uint8ClampedArray([30,30,30,255,240,240,240,255]), 'blackwhite')], [0,0,0,255,255,255,255,255]);
  assert.throws(() => applyScanFilter(new Uint8ClampedArray(4), 'unknown'));
});
test('creative scan filters keep transparent channel and produce distinct results', () => {
  const pixel = [160, 90, 40, 123];
  const vibrant = [...applyScanFilter(new Uint8ClampedArray(pixel), 'vibrant')];
  const soft = [...applyScanFilter(new Uint8ClampedArray(pixel), 'softtone')];
  const sharp = [...applyScanFilter(new Uint8ClampedArray(pixel), 'sharpblack')];
  assert.equal(vibrant[3],123); assert.equal(soft[3],123); assert.equal(sharp[3],123);
  assert.ok(vibrant[0]-vibrant[2] > pixel[0]-pixel[2]);
  assert.notDeepEqual(soft.slice(0,3),vibrant.slice(0,3));
  assert.deepEqual(sharp.slice(0,3),[0,0,0]);
});

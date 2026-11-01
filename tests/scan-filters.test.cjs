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

test('filters retain colour and brighten shaded paper without changing transparency', () => {
 const input=new Uint8ClampedArray([220,225,230,255, 220,225,230,255, 170,45,25,128, 0,0,0,0]);
 const color=applyScanFilter(input.slice(),'enhance',2,2);
 assert.ok(color[0]>input[0]);
 assert.ok(color[8]>color[9]*2 && color[9]>color[10]);
 assert.equal(color[11],128); assert.equal(color[15],0);
 const white=applyScanFilter(new Uint8ClampedArray([255,255,255,255]),'enhance',1,1);
 assert.deepEqual([...white],[255,255,255,255]);
});

test('black and white keeps dark text on both bright and shadowed paper', () => {
 const width=256,height=128,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4, ink=y>=48&&y<64&&x%32<8;
  const v=ink?(x<128?65:25):(x<128?225:120);
  data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
 }
 const result=applyScanFilter(data,'blackwhite',width,height);
 const at=(x,y)=>result[(y*width+x)*4];
 assert.equal(at(10,10),255);assert.equal(at(4,50),0);
 assert.equal(at(200,10),255);assert.equal(at(196,50),0);
});

test('async scan filtering matches synchronous results across chunks', async () => {
 const {applyScanFilterAsync}=require('../src/engine/scan-filters.cjs');
 // Odd widths ensure chunk boundaries split image rows as well as tiles.
 const width=1001,height=524,source=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<source.length;i+=4){source[i]=(i/4)%230;source[i+1]=180;source[i+2]=120;source[i+3]=255;}
 for(const mode of ['enhance','blackwhite','vibrant']){
  const expected=applyScanFilter(source.slice(),mode,width,height);
  const actual=await applyScanFilterAsync(source.slice(),mode,width,height);
  assert.deepEqual(actual,expected,mode);
 }
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const {transformSync}=require('esbuild');
require('jspdf');

test('scan filter renders, limits oversized images and releases the canvas',async()=>{
 const file=path.resolve('src/engine/browser.js');
 const js=transformSync(fs.readFileSync(file,'utf8'),{loader:'js',format:'cjs'}).code;
 const mod={exports:{}},previous={window:global.window,document:global.document,Image:global.Image};
 global.window={ReactNativeWebView:{postMessage(){}}};
 new Function('require','module','exports',js)(createRequire(file),mod,mod.exports);
 let width=2,height=2,canvas,drawn,applied;
 global.Image=class{constructor(){this.width=width;this.height=height;}set src(_){queueMicrotask(()=>this.onload());}};
 global.document={createElement(){
  const ctx={fillRect(){},drawImage(...args){drawn=args.slice(1);},getImageData(){return {data:new Uint8ClampedArray([220,200,180,255])};},putImageData(p){applied=[...p.data];}};
  canvas={width:0,height:0,getContext(){return ctx;},toDataURL(){return 'data:image/jpeg;base64,AA==';}};return canvas;
 }};
 try{
  const file={base64:'AA==',mimeType:'image/jpeg'};
  const result=await mod.exports.processDocument({id:'scan-enhance'},[file],{preset:'grayscale'});
  assert.equal(result.mime,'image/jpeg');assert.deepEqual(drawn,[0,0,2,2]);assert.equal(applied[0],applied[1]);assert.equal(applied[1],applied[2]);
  assert.deepEqual([canvas.width,canvas.height],[1,1]);
  width=8000;height=4000;
  await mod.exports.processDocument({id:'scan-enhance'},[file],{preset:'enhance'});
  assert.ok(drawn[2]*drawn[3]<=16000000);assert.ok(drawn[2]<width && drawn[3]<height);
  assert.ok(Math.abs(drawn[2]/drawn[3]-2)<.002);
  assert.deepEqual([canvas.width,canvas.height],[1,1]);
  await assert.rejects(mod.exports.processDocument({id:'scan-enhance'},[file],{preset:'invalid'}),/Choose a scan filter/);
  assert.deepEqual([canvas.width,canvas.height],[1,1]);
 }finally{global.window=previous.window;global.document=previous.document;global.Image=previous.Image;}
});

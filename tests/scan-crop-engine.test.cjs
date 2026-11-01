const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const {transformSync}=require('esbuild');
require('jspdf');

function setup(width,height,{failOutput=false}={}){
 const entry=path.resolve('src/engine/browser.js'),js=transformSync(fs.readFileSync(entry,'utf8'),{loader:'js',format:'cjs'}).code,mod={exports:{}},old={window:global.window,document:global.document,Image:global.Image};
 global.window={ReactNativeWebView:{postMessage(){}}};
 new Function('require','module','exports',js)(createRequire(entry),mod,mod.exports);
 let canvases=[],bands=[],draw=[],allocations=[];
 global.Image=class {constructor(){this.width=width;this.height=height;}set src(_){queueMicrotask(()=>this.onload());}};
 global.document={createElement(){
  const canvas={width:0,height:0,getContext(){return {
   drawImage(...args){draw.push(args.slice(1));},
   getImageData(_x,_y,w,h){
    if(w*h>1000000)return {data:new Proxy({}, {get:()=>0})};
    const pixels=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;pixels[i]=x*40;pixels[i+1]=y*40;pixels[i+3]=255;}return {data:pixels};
   },
   createImageData(w,h){allocations.push({canvasWidth:canvas.width,canvasHeight:canvas.height});if(failOutput)throw Error('output allocation failed');return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};},
   putImageData(p,_x,y){bands.push({y,width:p.width,height:p.height,data:[...p.data]});}
  };},toDataURL(){return 'data:image/jpeg;base64,AA==';}};canvases.push(canvas);return canvas;
 }};
 return {run:points=>mod.exports.processDocument({id:'scan-crop'},[{base64:'AA==',mimeType:'image/jpeg'}],{cropPoints:points}),canvases,bands,draw,allocations,restore(){global.window=old.window;global.document=old.document;global.Image=old.Image;}};
}
const full=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}];
test('scan crop preserves the original and perspective-corrected image corners',async()=>{
 const fixture=setup(4,4);
 try{
  const result=await fixture.run(full);assert.equal(result.mime,'image/jpeg');
  let band=fixture.bands[0];assert.equal(band.width,4);assert.equal(band.height,4);
  const pixel=(x,y)=>band.data.slice((y*band.width+x)*4,(y*band.width+x)*4+4);
  assert.deepEqual(pixel(0,0),[0,0,0,255]);assert.deepEqual(pixel(3,3),[120,120,0,255]);
  fixture.bands.length=0;
  await fixture.run([{x:0,y:0},{x:1,y:0},{x:.75,y:1},{x:.25,y:1}]);
  band=fixture.bands[0];assert.deepEqual(pixel(0,0),[0,0,0,255]);assert.deepEqual(pixel(3,0),[120,0,0,255]);
  assert.deepEqual(pixel(0,3),[30,120,0,255]);assert.deepEqual(pixel(3,3),[90,120,0,255]);
  assert.ok(fixture.canvases.every(c=>c.width===1&&c.height===1));
 }finally{fixture.restore();}
});
test('scan crop yields between bands and frees canvases',async()=>{
 const fixture=setup(8,130);let yielded=false;
 try{const timer=setTimeout(()=>{yielded=true;},0);await fixture.run(full);clearTimeout(timer);assert.equal(yielded,true);assert.ok(fixture.bands.length>=3);assert.ok(fixture.canvases.every(c=>c.width===1&&c.height===1));}finally{fixture.restore();}
});
test('oversized camera input is bounded and canvases are released on failure',async()=>{
 const fixture=setup(8000,4000,{failOutput:true});
 try{await assert.rejects(fixture.run(full),/output allocation failed/);assert.ok(fixture.draw[0][2]*fixture.draw[0][3]<=16000000);assert.ok(fixture.draw[0][2]<8000);assert.ok(fixture.allocations[0].canvasWidth*fixture.allocations[0].canvasHeight<=16000000);assert.ok(fixture.canvases.every(c=>c.width===1&&c.height===1));}finally{fixture.restore();}
});

test('ordinary 14 MP camera images retain their dimensions',async()=>{
 const fixture=setup(4000,3500,{failOutput:true});
 try{await assert.rejects(fixture.run(full),/output allocation failed/);assert.deepEqual(fixture.draw[0],[0,0,4000,3500]);assert.deepEqual(fixture.allocations[0],{canvasWidth:4000,canvasHeight:3500});assert.ok(fixture.canvases.every(c=>c.width===1&&c.height===1));}finally{fixture.restore();}
});

const MODES = new Set(['enhance','grayscale','blackwhite','vibrant','sharpblack','softtone']);
const CHUNK_PIXELS = 262144;
const TILE = 128;
const clamp = value => Math.max(0, Math.min(255, value));
const luminance = (r,g,b) => Math.round(.299*r+.587*g+.114*b);

// Threshold against the paper near each pixel, so shadows do not turn a whole
// section of a document black. Histograms sample one pixel in four and the
// threshold grid is interpolated to avoid visible square tile boundaries.
function createContext(data, mode, width, height) {
  if (!MODES.has(mode)) throw Error('Choose a scan filter.');
  const validSize = Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 && width * height * 4 === data.length;
  const adaptive = validSize && width >= 32 && height >= 32 && (mode === 'blackwhite' || mode === 'sharpblack');
  const cols = adaptive ? Math.ceil(width/TILE) : 0, rows = adaptive ? Math.ceil(height/TILE) : 0;
  return {data, mode, width, height, adaptive, cols, rows, hist:adaptive?new Uint16Array(cols*rows*256):null,
    samples:adaptive?new Uint16Array(cols*rows):null, global:mode==='enhance'?new Uint32Array(256):null,
    counts:0, thresholds:null, gain:1};
}
function collect(ctx,start,end) {
  const {data,adaptive,width,cols,hist,samples,global}=ctx;
  if(!adaptive&&!global)return;
  for(let pixel=start;pixel<end;pixel+=4) {
    const i=pixel*4;if(!data[i+3])continue;
    const gray=luminance(data[i],data[i+1],data[i+2]);
    if(global){global[gray]++;ctx.counts++;}
    if(adaptive){const x=pixel%width,y=Math.floor(pixel/width),tile=Math.floor(y/TILE)*cols+Math.floor(x/TILE);hist[tile*256+gray]++;samples[tile]++;}
  }
}
function finishContext(ctx) {
  if(ctx.global&&ctx.counts){
    let n=0,white=255;const goal=Math.ceil(ctx.counts*.90);
    for(let i=0;i<256;i++){n+=ctx.global[i];if(n>=goal){white=i;break;}}
    // Lighten shaded paper gently while retaining colour and dark strokes.
    ctx.gain=Math.max(1,Math.min(1.35,255/Math.max(180,white-8)));
  }
  if(ctx.adaptive){
    const {cols,rows,hist,samples,mode}=ctx, grid=new Float32Array(cols*rows);
    for(let tile=0;tile<grid.length;tile++){
      const total=samples[tile];if(!total){grid[tile]=mode==='sharpblack'?150:170;continue;}
      let n=0,paper=255,goal=Math.ceil(total*.90);
      for(let value=0;value<256;value++){n+=hist[tile*256+value];if(n>=goal){paper=value;break;}}
      grid[tile]=Math.max(24,Math.min(225,paper-Math.max(14,paper*.14)-(mode==='sharpblack'?8:0)));
    }
    ctx.thresholds=grid;ctx.hist=null;ctx.samples=null;
    // The horizontal interpolation coordinates do not change between rows.
    // Compute them once instead of doing floors and clamps for every pixel.
    const left=new Uint32Array(ctx.width),right=new Uint32Array(ctx.width),fraction=new Float64Array(ctx.width);
    for(let x=0;x<ctx.width;x++){
      const gx=Math.max(0,Math.min(cols-1,(x+.5)/TILE-.5)),x0=Math.floor(gx);
      left[x]=x0;right[x]=Math.min(cols-1,x0+1);fraction[x]=gx-x0;
    }
    ctx.interpolation={left,right,fraction};
  }
}
function threshold(ctx,x,y){
  if(!ctx.adaptive)return ctx.mode==='sharpblack'?150:170;
  const gx=Math.max(0,Math.min(ctx.cols-1,(x+.5)/TILE-.5)),gy=Math.max(0,Math.min(ctx.rows-1,(y+.5)/TILE-.5));
  const x0=Math.floor(gx),y0=Math.floor(gy),x1=Math.min(ctx.cols-1,x0+1),y1=Math.min(ctx.rows-1,y0+1),fx=gx-x0,fy=gy-y0,g=ctx.thresholds,c=ctx.cols;
  return (g[y0*c+x0]*(1-fx)+g[y0*c+x1]*fx)*(1-fy)+(g[y1*c+x0]*(1-fx)+g[y1*c+x1]*fx)*fy;
}
function applyRange(ctx,start,end){
  const {data,mode,width,gain}=ctx;
  if(ctx.adaptive){
    const {cols,rows,thresholds,interpolation:{left,right,fraction}}=ctx;
    let pixel=start;
    while(pixel<end){
      const y=Math.floor(pixel/width),endOfRow=Math.min(end,(y+1)*width);
      const gy=Math.max(0,Math.min(rows-1,(y+.5)/TILE-.5)),y0=Math.floor(gy),y1=Math.min(rows-1,y0+1),fy=gy-y0;
      const top=y0*cols,bottom=y1*cols;
      for(let x=pixel-y*width;pixel<endOfRow;pixel++,x++){
        const i=pixel*4,fx=fraction[x],l=left[x],r=right[x];
        const level=(thresholds[top+l]*(1-fx)+thresholds[top+r]*fx)*(1-fy)+(thresholds[bottom+l]*(1-fx)+thresholds[bottom+r]*fx)*fy;
        data[i]=data[i+1]=data[i+2]=luminance(data[i],data[i+1],data[i+2])>=level?255:0;
      }
    }
    return;
  }
  for(let pixel=start;pixel<end;pixel++){
    const i=pixel*4,r=data[i],g=data[i+1],b=data[i+2],gray=luminance(r,g,b);
    if(mode==='grayscale')data[i]=data[i+1]=data[i+2]=gray;
    else if(mode==='blackwhite'||mode==='sharpblack')data[i]=data[i+1]=data[i+2]=gray>=threshold(ctx,pixel%width,Math.floor(pixel/width))?255:0;
    else if(mode==='vibrant'){data[i]=clamp(gray+(r-gray)*1.4);data[i+1]=clamp(gray+(g-gray)*1.4);data[i+2]=clamp(gray+(b-gray)*1.4);}
    else if(mode==='softtone'){data[i]=clamp(255-(255-r)*.88);data[i+1]=clamp(255-(255-g)*.90);data[i+2]=clamp(255-(255-b)*.92);}
    else {data[i]=clamp((r-8)*gain);data[i+1]=clamp((g-8)*gain);data[i+2]=clamp((b-8)*gain);}
  }
}
function applyScanFilter(data,mode,width,height){
  const ctx=createContext(data,mode,width,height),count=data.length/4;
  collect(ctx,0,count);finishContext(ctx);applyRange(ctx,0,count);return data;
}
async function applyScanFilterAsync(data,mode,width,height){
  const ctx=createContext(data,mode,width,height),count=data.length/4,yieldToUi=()=>new Promise(resolve=>setTimeout(resolve,0));
  if(ctx.adaptive||ctx.global)for(let start=0;start<count;start+=CHUNK_PIXELS){collect(ctx,start,Math.min(count,start+CHUNK_PIXELS));if(start+CHUNK_PIXELS<count)await yieldToUi();}
  finishContext(ctx);
  for(let start=0;start<count;start+=CHUNK_PIXELS){applyRange(ctx,start,Math.min(count,start+CHUNK_PIXELS));if(start+CHUNK_PIXELS<count)await yieldToUi();}
  return data;
}
module.exports={applyScanFilter,applyScanFilterAsync};

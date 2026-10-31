// Bundled local computation worker. It renders no app UI and loads no remote website.
import {PDFDocument, StandardFonts, rgb, degrees} from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import * as pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.js';
import {jsPDF} from 'jspdf';
import JSZip from 'jszip';
import {pageIndices,positive} from './ranges.cjs';
import {pixels} from '../utils/dimensions.cjs';
import {applyScanFilter} from './scan-filters.cjs';
import {scanLayout} from './scan-layout.cjs';
window.pdfjsWorker=pdfWorker;
const send=data=>window.ReactNativeWebView.postMessage(JSON.stringify(data));
const bytes=b64=>Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
function base64(data) {let result='';for(let i=0;i<data.length;i+=16384)result+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(result);}
function canvas(w,h) {if(w*h>20000000)throw Error('Image dimensions are too large.');const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function image(file) {return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Could not read this image. Choose JPG or PNG.'));img.src='data:'+file.mimeType+';base64,'+file.base64;});}
function cleanCanvas(c){c.width=1;c.height=1;}
async function raster(file, o, progress, kind) {
 const source=await pdfjs.getDocument({data:bytes(file.base64),password:o.password||undefined,isEvalSupported:false,useSystemFonts:true}).promise;
 try {
  const selected=pageIndices(o.pages,source.numPages); const zip=new JSZip(); let pdf;
  for(let j=0;j<selected.length;j++) {
   const page=await source.getPage(selected[j]+1),vp=page.getViewport({scale:1.5});
   const c=canvas(Math.ceil(vp.width),Math.ceil(vp.height));
   await page.render({canvasContext:c.getContext('2d'),viewport:vp,background:'white'}).promise;
   if(kind==='images') zip.file('page-'+(selected[j]+1)+'.'+(o.format==='png'?'png':'jpg'),c.toDataURL(o.format==='png'?'image/png':'image/jpeg',.92).split(',')[1],{base64:true});
   else {
    const format=[vp.width/1.5,vp.height/1.5],orientation=format[0]>format[1]?'landscape':'portrait';
    if(!pdf) pdf=new jsPDF({unit:'pt',format,orientation,...(kind==='protect'?{encryption:{userPassword:o.password,ownerPassword:o.ownerPassword,userPermissions:['print']}}:{})});
    else pdf.addPage(format,orientation);
    pdf.addImage(c.toDataURL('image/jpeg',.94),'JPEG',0,0,format[0],format[1]);
   }
   cleanCanvas(c);page.cleanup();progress((j+1)/selected.length);
  }
  return kind==='images'?{data:await zip.generateAsync({type:'uint8array'}),ext:'.zip',mime:'application/zip'}:{data:new Uint8Array(pdf.output('arraybuffer')),ext:'.pdf',mime:'application/pdf'};
 } finally {await source.destroy();}
}
async function resized(file,o) {
 const img=await image(file);let w=pixels(o.width,o.unit||'px',o.dpi===undefined?'300':o.dpi)||img.width,h=pixels(o.height,o.unit||'px',o.dpi===undefined?'300':o.dpi)||img.height;
 if(o.width&&!o.height)h=Math.max(1,Math.round(img.height*w/img.width));
 if(o.height&&!o.width)w=Math.max(1,Math.round(img.width*h/img.height));
 const c=canvas(w,h),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
 const target=o.targetKB?positive(o.targetKB,undefined,100000)*1024:Infinity;
 const min=o.minKB?positive(o.minKB,0,100000)*1024:0;
 if(min>target)throw Error('Minimum size cannot exceed maximum size.');
 let best=c.toDataURL('image/jpeg',.95).split(',')[1];
 if(bytes(best).length>target){let lo=.02,hi=.95;best='';for(let i=0;i<12;i++){const q=(lo+hi)/2,b=c.toDataURL('image/jpeg',q).split(',')[1];if(bytes(b).length<=target){best=b;lo=q;}else hi=q;}}
 cleanCanvas(c);
 if(!best)throw Error('Target size is too small for these dimensions. Reduce width and height.');
 const result=bytes(best);if(result.length<min)throw Error('Output is smaller than the required minimum. Increase dimensions or choose a higher resolution original.');
 return result;
}
export async function processDocument(tool,files,o,progress=()=>{}) {
 const id=tool.id;
 if(id==='scan-enhance') {
  const img=await image(files[0]),c=canvas(img.width,img.height),ctx=c.getContext('2d');
  ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;
  applyScanFilter(d,o.preset);
  ctx.putImageData(pixels,0,0);const result=bytes(c.toDataURL('image/jpeg',.93).split(',')[1]);cleanCanvas(c);return {data:result,ext:'.jpg',mime:'image/jpeg'};
 }
 if(id==='pdf-to-ppt'||id==='redact')throw Error('This tool is unavailable on HindPDF.');
 if(['pdf-to-jpg','pdf-to-png','pdf-to-image','unlock','protect-password','repair-pdf'].includes(id)) {
  if(id==='protect-password'&&(!o.password||o.password.length<8||o.password!==o.confirmPassword))throw Error('Use a password of at least 8 characters and confirm it.');
  return raster(files[0],{...o,format:id==='pdf-to-png'?'png':id==='pdf-to-jpg'?'jpg':o.format},progress,id.startsWith('pdf-to-')?'images':id==='protect-password'?'protect':'pdf');
 }
 if(['photo-resizer','photo-compressor','signature-resizer','thumb-impression-resizer','declaration-optimizer'].includes(id))return {data:await resized(files[0],o),ext:'.jpg',mime:'image/jpeg'};
 if(id==='photo-signature-prep') {
  if(files.length!==2)throw Error('Choose the photo first and signature second.');
  const z=new JSZip();z.file('photo.jpg',await resized(files[0],{...o,width:o.photoWidth,height:o.photoHeight,targetKB:o.photoKB,minKB:''}));z.file('signature.jpg',await resized(files[1],o));
  return {data:await z.generateAsync({type:'uint8array'}),ext:'.zip',mime:'application/zip'};
 }
 const output=await PDFDocument.create();
 if(id==='merge') {
  if(files.length<2)throw Error('Choose at least two PDF files.');
  for(let i=0;i<files.length;i++){const src=await PDFDocument.load(bytes(files[i].base64));const pages=await output.copyPages(src,src.getPageIndices());pages.forEach(p=>output.addPage(p));progress((i+1)/files.length);}
 } else if(['jpg-to-pdf','png-to-pdf','image-to-pdf','scan-to-pdf'].includes(id)) {
  for(let i=0;i<files.length;i++) {
   if(files[i].mimeType==='application/pdf'){const src=await PDFDocument.load(bytes(files[i].base64));for(const p of await output.copyPages(src,src.getPageIndices()))output.addPage(p);}
   else {const f=files[i];let img;if(id==='scan-to-pdf'&&o.scanQuality!=='high'){const source=await image(f),max=o.scanQuality==='small'?1600:2400,scale=Math.min(1,max/Math.max(source.width,source.height));const c=canvas(Math.max(1,Math.round(source.width*scale)),Math.max(1,Math.round(source.height*scale))),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(source,0,0,c.width,c.height);img=await output.embedJpg(bytes(c.toDataURL('image/jpeg',o.scanQuality==='small'?.68:.84).split(',')[1]));cleanCanvas(c);}else img=f.mimeType==='image/png'?await output.embedPng(bytes(f.base64)):await output.embedJpg(bytes(f.base64));const layout=id==='scan-to-pdf'?scanLayout(o.scanPaper,img.width,img.height):{width:595.28,height:841.89,margin:24};const page=output.addPage([layout.width,layout.height]);const dim=img.scaleToFit(layout.width-2*layout.margin,layout.height-2*layout.margin);page.drawImage(img,{x:(page.getWidth()-dim.width)/2,y:(page.getHeight()-dim.height)/2,...dim});}
   progress((i+1)/files.length);
  }
 } else {
  const source=await PDFDocument.load(bytes(files[0].base64)),count=source.getPageCount();
  const selected=pageIndices(o.pages,count,id==='reorder-pages');
  if(id==='split') {
   const z=new JSZip();for(let j=0;j<selected.length;j++){const d=await PDFDocument.create();const [p]=await d.copyPages(source,[selected[j]]);d.addPage(p);z.file(`page-${selected[j]+1}.pdf`,await d.save());progress((j+1)/selected.length);}return {data:await z.generateAsync({type:'uint8array'}),ext:'.zip',mime:'application/zip'};
  }
  if(id==='delete-pages'&&!o.pages.trim())throw Error('Enter the page numbers to delete.');
  const keep=id==='delete-pages'?source.getPageIndices().filter(i=>!selected.includes(i)):['extract-pages','reorder-pages'].includes(id)?selected:source.getPageIndices();
  if(!keep.length)throw Error('Keep at least one page in the document.');
  const pages=await output.copyPages(source,keep);pages.forEach(p=>output.addPage(p));
  let font;
  if(['add-text','edit-pdf','add-watermark','page-numbers','sign'].includes(id))font=await output.embedFont(StandardFonts.Helvetica);
  for(let j=0;j<pages.length;j++) {
   const page=pages[j];if(!['extract-pages','reorder-pages','delete-pages'].includes(id)&&!selected.includes(j))continue;
   const {width,height}=page.getSize();
   if(id==='rotate'){const angle=Number(o.angle);if(![90,180,270].includes(angle))throw Error('Choose 90, 180 or 270 degrees.');page.setRotation(degrees((page.getRotation().angle+angle)%360));}
   if(id==='crop-pdf'){const margin=positive(o.margin,24);if(2*margin>=Math.min(width,height))throw Error('Crop margin is too large.');page.setCropBox(margin,margin,width-2*margin,height-2*margin);}
   if(['add-text','edit-pdf','add-watermark','page-numbers'].includes(id)||(id==='sign'&&!o.signature&&!o.signaturePaths?.length)) {
    const text=id==='page-numbers'?String(j+1):o.text;
    if(!text.trim())throw Error('Enter the text to add.');
    const fontSize=positive(o.fontSize,18,200),x=Number(o.x),top=Number(o.y);
    if(!Number.isFinite(x)||!Number.isFinite(top)||x<0||top<0||x>=width||top>=height)throw Error('Text position must be inside the page.');
    try {font.encodeText(text);}catch{throw Error('This text font supports Latin characters. Use a signature image for other scripts.');}
    page.drawText(text,{x:id==='add-watermark'?width*.15:x,y:id==='add-watermark'?height*.45:height-top-fontSize,size:fontSize,font,color:rgb(.12,.16,.22),...(id==='add-watermark'?{opacity:.24,rotate:degrees(35)}:{})});
   }
   if(id==='sign'&&(o.signature||o.signaturePaths?.length)) {
    const x=Number(o.x),top=Number(o.y),w=positive(o.width,160),h=positive(o.height,60);
    if(!Number.isFinite(x)||!Number.isFinite(top)||x<0||top<0||x+w>width||top+h>height)throw Error('Signature must fit inside the page.');
    if(o.signature){const img=o.signature.mimeType==='image/png'?await output.embedPng(bytes(o.signature.base64)):await output.embedJpg(bytes(o.signature.base64));page.drawImage(img,{x,y:height-top-h,width:w,height:h});}
    else for(const path of o.signaturePaths)page.drawSvgPath(path,{x,y:height-top,scale:w/300,borderWidth:1.5,borderColor:rgb(.05,.1,.2)});
   }
   progress((j+1)/pages.length);
  }
 }
 return {data:await output.save(),ext:'.pdf',mime:'application/pdf'};
}
let running=false;
window.hindRun=async request=>{
 if(running)return;running=true;
 try {const result=await processDocument(request.tool,request.files,request.options,p=>send({type:'progress',id:request.id,value:Math.round(p*100)}));send({type:'result',id:request.id,base64:base64(result.data),ext:result.ext,mime:result.mime});}
 catch(error){send({type:'error',id:request.id,message:error.message||'Unable to process document.'});}
 finally {running=false;}
};
send({type:'ready'});

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import * as pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.js';
window.pdfjsWorker=pdfWorker;
let doc=null,renderTask=null,textTask=null,pageRef=null;
const send=(type,extra={})=>window.ReactNativeWebView?.postMessage(JSON.stringify({type,...extra}));
window.showPdfSelectionPage=async number=>{
 try{
  if(!doc||number<1||number>doc.numPages)throw Error('Page is unavailable.');
  if(renderTask)renderTask.cancel();if(textTask)textTask.cancel();if(pageRef)pageRef.cleanup();
  const page=await doc.getPage(number);pageRef=page;const base=page.getViewport({scale:1}),scale=Math.max(.1,Math.min(2,(window.innerWidth-16)/base.width)),viewport=page.getViewport({scale}),density=Math.min(2,window.devicePixelRatio||1,Math.sqrt(16000000/(viewport.width*viewport.height)));
  const container=document.getElementById('page');container.replaceChildren();container.style.width=viewport.width+'px';container.style.height=viewport.height+'px';container.style.setProperty('--scale-factor',String(scale));
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width*density);canvas.height=Math.ceil(viewport.height*density);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';container.appendChild(canvas);
  renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[density,0,0,density,0,0],background:'white'});await renderTask.promise;renderTask=null;
  const content=await page.getTextContent(),layer=document.createElement('div');layer.className='textLayer';container.appendChild(layer);textTask=pdfjs.renderTextLayer({textContentSource:content,container:layer,viewport,textDivs:[]});await textTask.promise;textTask=null;
  const hasText=content.items.some(item=>item.str&&item.str.trim());send('rendered',{page:number,hasText});window.scrollTo(0,0);
 }catch(error){if(error?.name!=='RenderingCancelledException')send('error',{message:'Could not render selectable text on this page.'});}
};
window.loadPdfForSelection=async(data,number)=>{
 try{const raw=atob(data),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);doc=await pdfjs.getDocument({data:bytes,isEvalSupported:false,useSystemFonts:true}).promise;const permissions=await doc.getPermissions();if(permissions&&!permissions.includes(pdfjs.PermissionFlag.COPY)){send('restricted');return;}await window.showPdfSelectionPage(number);}catch(error){send('error',{message:'Could not open this PDF for text selection.'});}
};
send('ready');

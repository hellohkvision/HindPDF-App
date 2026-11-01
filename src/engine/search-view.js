import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import * as pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.js';
import {searchMatches} from './pdf-search.cjs';
window.pdfjsWorker=pdfWorker;
let doc=null,cache=[],hits=[],total=0,current=-1,visiblePage=1,textDivs=[],visibleItems=[],pageRef=null,renderTask=null,textTask=null,revision=0,renderRevision=0,renderBusy=false;const MAX_HITS=5000;
const send=(type,extra={})=>window.ReactNativeWebView?.postMessage(JSON.stringify({type,...extra}));
function clearMarks(){for(const div of textDivs)div.textContent=div.textContent;}
function markPage(){
 clearMarks();const segments=new Map();
 for(let i=0;i<hits.length;i++){const hit=hits[i];if(hit.page!==visiblePage)continue;for(const seg of hit.segments){if(!segments.has(seg.itemIndex))segments.set(seg.itemIndex,[]);segments.get(seg.itemIndex).push({...seg,active:i===current});}}
 for(const [index,parts] of segments){const div=textDivs[index],text=visibleItems[index]?.str;if(!div||typeof text!=='string')continue;parts.sort((a,b)=>a.start-b.start);const frag=document.createDocumentFragment();let pos=0;for(const part of parts){if(part.start<pos)continue;if(part.start>pos)frag.appendChild(document.createTextNode(text.slice(pos,part.start)));const mark=document.createElement('mark');mark.className=part.active?'current':'match';mark.textContent=text.slice(part.start,part.end);if(part.active)mark.dataset.current='true';frag.appendChild(mark);pos=part.end;}if(pos<text.length)frag.appendChild(document.createTextNode(text.slice(pos)));div.replaceChildren(frag);}
 const selected=document.querySelector('mark.current');if(selected)selected.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});
}
async function contentFor(number){if(!cache[number])cache[number]=(async()=>{const page=await doc.getPage(number),content=await page.getTextContent();page.cleanup();return {...content,items:content.items.filter(item=>typeof item.str==='string')};})();return cache[number];}
async function renderPage(number){
 const request=++renderRevision;renderBusy=true;if(renderTask)renderTask.cancel();if(textTask)textTask.cancel();
 if(pageRef)pageRef.cleanup();const page=await doc.getPage(number);if(request!==renderRevision)return;pageRef=page;
 const base=page.getViewport({scale:1}),scale=Math.max(.1,Math.min(2,(window.innerWidth-16)/base.width)),viewport=page.getViewport({scale}),density=Math.min(2,window.devicePixelRatio||1,Math.sqrt(16000000/(viewport.width*viewport.height)));
 const container=document.getElementById('page');const previousCanvas=container.querySelector('canvas');if(previousCanvas){previousCanvas.width=1;previousCanvas.height=1;}container.replaceChildren();container.style.width=viewport.width+'px';container.style.height=viewport.height+'px';container.style.setProperty('--scale-factor',String(scale));
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width*density);canvas.height=Math.ceil(viewport.height*density);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';container.appendChild(canvas);
 try{renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[density,0,0,density,0,0],background:'white'});await renderTask.promise;renderTask=null;const content=await contentFor(number);if(request!==renderRevision)return;const layer=document.createElement('div');layer.className='textLayer';container.appendChild(layer);const divs=[];textTask=pdfjs.renderTextLayer({textContentSource:content,container:layer,viewport,textDivs:divs});await textTask.promise;textTask=null;if(request!==renderRevision)return;visiblePage=number;visibleItems=content.items;textDivs=divs;renderBusy=false;markPage();send('pageRendered',{page:number});}catch(error){if(request===renderRevision){renderBusy=false;if(error?.name!=='RenderingCancelledException')send('error',{message:'Could not render this PDF page.'});}}
}
window.loadPdfForSearch=async(data,startPage)=>{try{const raw=atob(data),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);doc=await pdfjs.getDocument({data:bytes,isEvalSupported:false,useSystemFonts:true}).promise;visiblePage=Math.max(1,Math.min(doc.numPages,startPage));await renderPage(visiblePage);send('loaded',{page:visiblePage,pages:doc.numPages});}catch{send('error',{message:'Could not open this PDF for search.'});}};
window.cancelPdfSearch=()=>{revision++;hits=[];total=0;current=-1;clearMarks();};
window.searchPdf=async(token,query)=>{
 const id=++revision;hits=[];total=0;current=-1;clearMarks();if(!doc)return;
 const needle=String(query||'').trim();if(!needle){send('results',{token,total:0,navigable:0,index:-1,page:visiblePage,empty:true});return;}
 try{for(let n=1;n<=doc.numPages;n++){const content=await contentFor(n);if(id!==revision)return;const found=searchMatches(content.items,needle,MAX_HITS-hits.length);total+=found.total;for(const segments of found.matches)hits.push({page:n,segments});if(n<doc.numPages&&(n%3===0||n===1))send('progress',{token,count:total,page:n,pages:doc.numPages});}
  if(id!==revision)return;current=hits.length?0:-1;const page=current>=0?hits[current].page:visiblePage;send('results',{token,total,navigable:hits.length,index:current,page,empty:false});if(current>=0){if(page===visiblePage&&!renderBusy)markPage();else await renderPage(page);}else if(renderBusy)await renderPage(visiblePage);
 }catch{if(id===revision)send('error',{token,message:'Could not search this PDF.'});}
};
window.navigatePdfSearch=async(direction)=>{if(!hits.length)return;current=(current+direction+hits.length)%hits.length;const page=hits[current].page;send('navigation',{index:current,page,total,navigable:hits.length});if(page===visiblePage&&!renderBusy)markPage();else await renderPage(page);};
send('ready');

const {findMatches,segmentRect}=require('./pdf-search.cjs');
async function searchAndHighlight(original,query,libraries,progress=()=>{}){
 const {pdfjs,PDFDocument,rgb,degrees}=libraries;if(!query.trim())throw Error('Enter text to search.');
 const doc=await pdfjs.getDocument({data:new Uint8Array(original),isEvalSupported:false,useSystemFonts:true}).promise,matches=[],highlights=[];let total=0;
 try{for(let i=1;i<=doc.numPages;i++){
  const page=await doc.getPage(i),content=await page.getTextContent(),viewport=page.getViewport({scale:1}),hits=findMatches(content.items,query);
  for(const segments of hits){total++;if(matches.length>=2000)continue;const boxes=segments.map(segment=>segmentRect(content.items[segment.itemIndex],segment)).filter(Boolean);if(!boxes.length)continue;
   const first=boxes[0],cos=Math.cos(first.angle),sin=Math.sin(first.angle),pdfX=first.x+cos*first.width/2-sin*first.height/2,pdfY=first.y+sin*first.width/2+cos*first.height/2,point=viewport.convertToViewportPoint(pdfX,pdfY);
   matches.push({page:i,x:Math.max(0,Math.min(1,point[0]/viewport.width)),y:Math.max(0,Math.min(1,point[1]/viewport.height)),pdfX,pdfY});highlights.push({page:i,boxes});
  }
  page.cleanup();progress(i/doc.numPages*.7);
 }}finally{await doc.destroy();}
 if(!matches.length)return {data:new Uint8Array(0),ext:'.pdf',mime:'application/pdf',searchMatches:[],searchTotal:total};
 const output=await PDFDocument.load(original);
 for(const group of highlights){const page=output.getPage(group.page-1);for(const rect of group.boxes)page.drawRectangle({x:rect.x,y:rect.y,width:rect.width,height:rect.height,rotate:degrees(rect.angle*180/Math.PI),color:rgb(1,.88,0),opacity:.38,borderWidth:0});}
 progress(1);return {data:await output.save(),ext:'.pdf',mime:'application/pdf',searchMatches:matches,searchTotal:total};
}
module.exports={searchAndHighlight};

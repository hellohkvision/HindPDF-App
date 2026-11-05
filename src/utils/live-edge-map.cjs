function mapLiveEdges(e,w,h){
 if(!e?.found||!(w>0&&h>0&&e.frameWidth>0&&e.frameHeight>0))return null;
 if(![e.left,e.top,e.right,e.bottom].every(Number.isFinite)||e.left<0||e.top<0||e.right>1||e.bottom>1||e.left>=e.right||e.top>=e.bottom)return null;
 const scale=Math.max(w/e.frameWidth,h/e.frameHeight),dw=e.frameWidth*scale,dh=e.frameHeight*scale,ox=(w-dw)/2,oy=(h-dh)/2;
 const left=e.mirrored?1-e.right:e.left,right=e.mirrored?1-e.left:e.right;
 const rect=[ox+left*dw,oy+e.top*dh,ox+right*dw,oy+e.bottom*dh];
 if(rect[2]<=0||rect[3]<=0||rect[0]>=w||rect[1]>=h)return null;
 return rect.map((v,i)=>Math.max(0,Math.min(i%2===0?w:h,v)));
}
module.exports={mapLiveEdges};

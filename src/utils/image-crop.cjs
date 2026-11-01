function imageCrop(iw,ih,ow,oh,settings={}){
 for(const n of [iw,ih,ow,oh])if(!Number.isFinite(n)||n<=0)throw Error('Choose valid image dimensions.');
 const zoom=Math.min(3,Math.max(1,Number(settings.zoom)||1)),x=Math.min(1,Math.max(0,Number.isFinite(Number(settings.x))?Number(settings.x):.5)),y=Math.min(1,Math.max(0,Number.isFinite(Number(settings.y))?Number(settings.y):.5)),ratio=ow/oh;
 let width,height;if(iw/ih>ratio){height=ih;width=ih*ratio;}else{width=iw;height=iw/ratio;}width/=zoom;height/=zoom;
 return {x:(iw-width)*x,y:(ih-height)*y,width,height};
}
function outputSize(iw,ih,width,height){let w=width||iw,h=height||ih;if(width&&!height)h=Math.max(1,Math.round(ih*w/iw));if(height&&!width)w=Math.max(1,Math.round(iw*h/ih));return {width:w,height:h};}
module.exports={imageCrop,outputSize};

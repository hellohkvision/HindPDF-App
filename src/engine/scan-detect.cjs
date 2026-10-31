// Find strong horizontal and vertical transitions around the center of a page.
// This detects an axis-aligned rectangle; uncertain results must not crop automatically.
function detectPage(data, width, height) {
  if (width < 20 || height < 20) return null;
  const lum = (x,y) => {const i=(y*width+x)*4;return .299*data[i]+.587*data[i+1]+.114*data[i+2];};
  const peak = (vertical, from, to) => {
    const length=vertical?width:height, cross=vertical?height:width;
    let best=-1,pos=0;
    for(let p=Math.max(2,Math.floor(length*from));p<Math.min(length-2,Math.ceil(length*to));p++){
      let sum=0,n=0;
      for(let q=Math.floor(cross*.2);q<cross*.8;q+=Math.max(1,Math.floor(cross/180))){
        sum+=vertical?Math.abs(lum(p+1,q)-lum(p-1,q)):Math.abs(lum(q,p+1)-lum(q,p-1));n++;
      }
      const score=sum/n;if(score>best){best=score;pos=p;}
    }
    return {pos,score:best};
  };
  const l=peak(true,.02,.42),r=peak(true,.58,.98),t=peak(false,.02,.42),b=peak(false,.58,.98);
  if(Math.min(l.score,r.score,t.score,b.score)<18 || r.pos-l.pos<width*.3 || b.pos-t.pos<height*.3)return null;
  return {left:100*l.pos/width,right:100*(width-r.pos)/width,top:100*t.pos/height,bottom:100*(height-b.pos)/height};
}
module.exports={detectPage};

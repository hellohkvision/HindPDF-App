function applyScanFilter(data, mode) {
  if (!['enhance','grayscale','blackwhite','vibrant','sharpblack','softtone'].includes(mode)) throw Error('Choose a scan filter.');
  for (let i=0;i<data.length;i+=4) {
    const gray=Math.round(.299*data[i]+.587*data[i+1]+.114*data[i+2]);
    if(mode==='grayscale')data[i]=data[i+1]=data[i+2]=gray;
    else if(mode==='blackwhite'||mode==='sharpblack')data[i]=data[i+1]=data[i+2]=gray>=(mode==='sharpblack'?150:170)?255:0;
    else if(mode==='vibrant')for(let j=0;j<3;j++)data[i+j]=Math.max(0,Math.min(255,gray+(data[i+j]-gray)*1.4));
    else if(mode==='softtone')for(let j=0;j<3;j++)data[i+j]=Math.max(0,Math.min(255,(data[i+j]-128)*.85+140+(j===0?5:0)));
    else for(let j=0;j<3;j++)data[i+j]=Math.max(0,Math.min(255,(data[i+j]-128)*1.2+136));
  }
  return data;
}
module.exports={applyScanFilter};

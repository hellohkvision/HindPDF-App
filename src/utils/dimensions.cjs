function pixels(value, unit, dpi) {
 if(value===''||value==null)return '';
 const n=Number(value);if(!Number.isFinite(n)||n<=0)throw Error('Enter a size greater than zero.');
 if(!['px','cm','in'].includes(unit))throw Error('Choose a valid size unit.');
 if(unit==='px'){if(!Number.isInteger(n)||n>10000)throw Error('Enter a whole pixel size up to 10000.');return n;}
 const resolution=Number(dpi);if(!Number.isFinite(resolution)||resolution<36||resolution>1200)throw Error('Enter a DPI between 36 and 1200.');
 const out=Math.round(n*resolution/(unit==='cm'?2.54:1));
 if(out<1||out>10000)throw Error('Choose dimensions between 1 and 10000 pixels.');return out;
}
function convert(value,from,to,dpi){
 if(value===''||value==null)return '';
 const px=pixels(value,from,dpi);if(to==='px')return String(px);
 const resolution=Number(dpi);if(!Number.isFinite(resolution)||resolution<36||resolution>1200)throw Error('Enter a DPI between 36 and 1200.');
 if(!['cm','in'].includes(to))throw Error('Choose a valid size unit.');
 return String(Number((px*(to==='cm'?2.54:1)/resolution).toFixed(3)));
}
module.exports={pixels,convert};

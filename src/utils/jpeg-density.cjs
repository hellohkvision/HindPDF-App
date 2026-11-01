function jpegWithDensity(data,dpi){
 const value=Math.round(Number(dpi));if(!Number.isFinite(value)||value<1||value>65535||data.length<2||data[0]!==255||data[1]!==216)throw Error('Could not set image resolution.');
 const bytes=new Uint8Array(data);let offset=2;
 while(offset+4<=bytes.length&&bytes[offset]===255){const marker=bytes[offset+1];if(marker===0xda||marker===0xd9)break;const len=(bytes[offset+2]<<8)|bytes[offset+3];if(len<2||offset+2+len>bytes.length)break;if(marker===0xe0&&len>=16&&bytes[offset+4]===74&&bytes[offset+5]===70&&bytes[offset+6]===73&&bytes[offset+7]===70&&bytes[offset+8]===0){bytes[offset+11]=1;bytes[offset+12]=value>>8;bytes[offset+13]=value&255;bytes[offset+14]=value>>8;bytes[offset+15]=value&255;return bytes;}offset+=2+len;}
 const header=new Uint8Array([255,224,0,16,74,70,73,70,0,1,1,1,value>>8,value&255,value>>8,value&255,0,0]);const out=new Uint8Array(bytes.length+header.length);out.set(bytes.subarray(0,2));out.set(header,2);out.set(bytes.subarray(2),2+header.length);return out;
}
module.exports={jpegWithDensity};

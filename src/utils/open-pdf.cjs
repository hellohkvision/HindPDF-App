function parsePdfLink(url){
 if(typeof url!=='string')return null;
 if(/^(content|file):\/\//i.test(url))return {uri:url,mode:'viewer'};
 const external=url.match(/^hindpdf:\/\/external-pdf\?([^#]*)$/i);
 if(external){try{const params={};for(const part of external[1].split('&')){const i=part.indexOf('=');if(i<0)continue;const key=decodeURIComponent(part.slice(0,i)),value=decodeURIComponent(part.slice(i+1));if(Object.prototype.hasOwnProperty.call(params,key))return null;params[key]=value;}if(!/^(content|file):\/\//i.test(params.uri||'')||!['viewer','editor'].includes(params.mode))return null;const raw=String(params.name||'').replace(/[\x00-\x1f\\/]/g,'_').trim(),name=/\.pdf$/i.test(raw)?raw.slice(0,200):'Document.pdf';return {uri:params.uri,mode:params.mode,name};}catch{return null;}}
 const match=url.match(/^hindpdf:\/\/edit-pdf\?uri=([^&#]+)$/i);
 if(!match)return null;
 try{const uri=decodeURIComponent(match[1]);return /^(content|file):\/\//i.test(uri)?{uri,mode:'editor'}:null;}catch{return null;}
}
module.exports={parsePdfLink};

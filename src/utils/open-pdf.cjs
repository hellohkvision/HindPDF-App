function parsePdfLink(url){
 if(typeof url!=='string')return null;
 if(/^(content|file):\/\//i.test(url))return {uri:url,mode:'viewer'};
 const match=url.match(/^hindpdf:\/\/edit-pdf\?uri=([^&#]+)$/i);
 if(!match)return null;
 try{const uri=decodeURIComponent(match[1]);return /^(content|file):\/\//i.test(uri)?{uri,mode:'editor'}:null;}catch{return null;}
}
module.exports={parsePdfLink};

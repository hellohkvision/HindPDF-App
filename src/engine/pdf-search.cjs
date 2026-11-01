function needsSpace(previous,current){
 if(!previous)return false;if(previous.hasEOL)return true;
 const a=String(previous.str||''),b=String(current.str||'');if(!a||!b||/\s$/.test(a)||/^\s/.test(b))return false;
 const p=previous.transform,q=current.transform;
 if(!Array.isArray(p)||!Array.isArray(q)||!Number.isFinite(previous.width))return true;
 const angle=Math.atan2(p[1],p[0]),cos=Math.cos(angle),sin=Math.sin(angle),dx=q[4]-p[4],dy=q[5]-p[5],along=dx*cos+dy*sin-previous.width,across=Math.abs(-dx*sin+dy*cos),height=Math.max(1,Number(previous.height)||Math.hypot(p[2],p[3])||1);
 return across>height*.55||along>height*.2;
}
// Visit normalized text twice: build a searchable string, then map only the
// actual matches back to PDF text items. This avoids allocating an object for
// every character of every page in a large document.
function visitText(items,emit){
 let previous=null,hasText=false,lastSpace=false;
 const space=()=>{if(hasText&&!lastSpace){emit(' ',-1,0,0);lastSpace=true;}};
 for(let itemIndex=0;itemIndex<items.length;itemIndex++){
  const item=items[itemIndex],value=typeof item.str==='string'?item.str:'';if(!value)continue;if(needsSpace(previous,item))space();
  for(let offset=0;offset<value.length;){const cp=value.codePointAt(offset),character=String.fromCodePoint(cp),end=offset+character.length;if(/\s/u.test(character))space();else {emit(character.toLowerCase(),itemIndex,offset,end);hasText=true;lastSpace=false;}offset=end;}
  previous=item;
 }
}
function searchMatches(items,query,limit=Infinity){
 const needle=query.trim().replace(/\s+/g,' ').toLowerCase();if(!needle||!(/[^\s\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u.test(needle)))return {matches:[],total:0};
 let text='';visitText(items,value=>{text+=value;});
 const ranges=[];let from=0,index,total=0;
 while((index=text.indexOf(needle,from))!==-1){
  total++;if(ranges.length<limit)ranges.push({start:index,end:index+needle.length,segments:[]});
  from=index+Math.max(needle.length,1);
 }
 if(!ranges.length)return {matches:[],total};
 let position=0,rangeIndex=0;
 visitText(items,(value,itemIndex,start,end)=>{
  const next=position+value.length;
  while(rangeIndex<ranges.length&&ranges[rangeIndex].end<=position)rangeIndex++;
  if(itemIndex>=0)for(let i=rangeIndex;i<ranges.length&&ranges[i].start<next;i++){
   const range=ranges[i];if(range.end<=position)continue;const segments=range.segments,last=segments[segments.length-1];
   if(last&&last.itemIndex===itemIndex&&last.end>=start)last.end=Math.max(last.end,end);else segments.push({itemIndex,start,end});
  }
  position=next;
 });
 return {matches:ranges.map(range=>range.segments).filter(segments=>segments.length),total};
}
function findMatches(items,query){return searchMatches(items,query).matches;}
function matchesPage(items,query){return findMatches(items,query).length>0;}
function segmentRect(item,segment){
 const t=item.transform;if(!Array.isArray(t)||t.length<6||!item.str||!Number.isFinite(item.width)||item.width<=0)return null;
 const height=Number(item.height)||Math.hypot(t[2],t[3]);if(!Number.isFinite(height)||height<=0)return null;
 const angle=Math.atan2(t[1],t[0]),cos=Math.cos(angle),sin=Math.sin(angle),advance=item.width*segment.start/item.str.length,width=item.width*(segment.end-segment.start)/item.str.length,baselineOffset=height*.18;
 return {x:t[4]+cos*advance+sin*baselineOffset,y:t[5]+sin*advance-cos*baselineOffset,width,height,angle};
}
module.exports={findMatches,searchMatches,matchesPage,segmentRect};

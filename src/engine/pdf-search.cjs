function needsSpace(previous,current){
 if(!previous)return false;if(previous.hasEOL)return true;
 const a=String(previous.str||''),b=String(current.str||'');if(!a||!b||/\s$/.test(a)||/^\s/.test(b))return false;
 const p=previous.transform,q=current.transform;
 if(!Array.isArray(p)||!Array.isArray(q)||!Number.isFinite(previous.width))return true;
 const angle=Math.atan2(p[1],p[0]),cos=Math.cos(angle),sin=Math.sin(angle),dx=q[4]-p[4],dy=q[5]-p[5],along=dx*cos+dy*sin-previous.width,across=Math.abs(-dx*sin+dy*cos),height=Math.max(1,Number(previous.height)||Math.hypot(p[2],p[3])||1);
 return across>height*.55||along>height*.2;
}
function normalizeText(items){
 let text='',previous=null;const locations=[];
 const space=()=>{if(text&&!text.endsWith(' ')){text+=' ';locations.push(null);}};
 for(let itemIndex=0;itemIndex<items.length;itemIndex++){
  const item=items[itemIndex],value=typeof item.str==='string'?item.str:'';if(!value)continue;if(needsSpace(previous,item))space();
  for(let offset=0;offset<value.length;){const cp=value.codePointAt(offset),character=String.fromCodePoint(cp),end=offset+character.length;if(/\s/u.test(character))space();else for(const folded of character.toLowerCase()){text+=folded;for(let j=0;j<folded.length;j++)locations.push({itemIndex,start:offset,end});}offset=end;}
  previous=item;
 }
 return {text,locations};
}
function searchMatches(items,query,limit=Infinity){
 const needle=query.trim().replace(/\s+/g,' ').toLowerCase();if(!needle)return {matches:[],total:0};
 const {text,locations}=normalizeText(items),matches=[];let from=0,index,total=0;
 while((index=text.indexOf(needle,from))!==-1){
  total++;
  if(matches.length<limit){const segments=[];for(let i=index;i<index+needle.length;i++){const pos=locations[i];if(!pos)continue;const last=segments[segments.length-1];if(last&&last.itemIndex===pos.itemIndex&&last.end>=pos.start)last.end=Math.max(last.end,pos.end);else segments.push({itemIndex:pos.itemIndex,start:pos.start,end:pos.end});}if(segments.length)matches.push(segments);}
  from=index+Math.max(needle.length,1);
 }
 return {matches,total};
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

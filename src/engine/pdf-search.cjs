function normalizeText(items){
 let text='';const locations=[];
 for(let itemIndex=0;itemIndex<items.length;itemIndex++){
  const value=typeof items[itemIndex].str==='string'?items[itemIndex].str:'';
  if(itemIndex&&text&&!text.endsWith(' ')){text+=' ';locations.push(null);}
  for(let offset=0;offset<value.length;offset++){
   const c=value[offset];if(/\s/.test(c)){if(text.endsWith(' ')||!text)continue;text+=' ';locations.push(null);}
   else{text+=c.toLowerCase();locations.push({itemIndex,offset});}
  }
 }
 return {text,locations};
}
function findMatches(items,query){
 const needle=query.trim().replace(/\s+/g,' ').toLowerCase();if(!needle)return [];
 const {text,locations}=normalizeText(items),matches=[];let from=0,index;
 while((index=text.indexOf(needle,from))!==-1){
  const segments=[];
  for(let i=index;i<index+needle.length;i++){const pos=locations[i];if(!pos)continue;const last=segments[segments.length-1];if(last&&last.itemIndex===pos.itemIndex&&last.end===pos.offset)last.end++;else segments.push({itemIndex:pos.itemIndex,start:pos.offset,end:pos.offset+1});}
  if(segments.length)matches.push(segments);from=index+Math.max(needle.length,1);
 }
 return matches;
}
function matchesPage(items,query){return findMatches(items,query).length>0;}
function segmentRect(item,segment){
 const t=item.transform;if(!Array.isArray(t)||t.length<6||!item.str||!Number.isFinite(item.width)||item.width<=0)return null;
 const height=Number(item.height)||Math.hypot(t[2],t[3]);if(!Number.isFinite(height)||height<=0)return null;
 const angle=Math.atan2(t[1],t[0]),cos=Math.cos(angle),sin=Math.sin(angle),advance=item.width*segment.start/item.str.length,width=item.width*(segment.end-segment.start)/item.str.length,baselineOffset=height*.18;
 return {x:t[4]+cos*advance+sin*baselineOffset,y:t[5]+sin*advance-cos*baselineOffset,width,height,angle};
}
module.exports={findMatches,matchesPage,segmentRect};

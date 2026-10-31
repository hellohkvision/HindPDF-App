function matchesPage(items, query){
 const needle=query.trim().replace(/\s+/g,' ').toLocaleLowerCase();
 if(!needle)return false;
 return items.map(item=>typeof item.str==='string'?item.str:'').join(' ').replace(/\s+/g,' ').toLocaleLowerCase().includes(needle);
}
module.exports={matchesPage};

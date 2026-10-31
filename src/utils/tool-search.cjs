function normalize(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}
function matchesTool(tool,query){const wanted=normalize(query);if(!wanted)return true;return [tool.name,tool.desc,tool.id,...(tool.keywords||[])].some(value=>normalize(value).includes(wanted));}
module.exports={matchesTool};

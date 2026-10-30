function pageIndices(value, count, preserveOrder = false) {
  if (!Number.isInteger(count) || count < 1) throw Error('Document has no pages.');
  if (!String(value).trim()) return Array.from({length:count},(_,i)=>i);
  const out=[];
  for(const part of String(value).split(',')) {
    const m=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if(!m) throw Error('Use page numbers such as 1,3-5.');
    const from=Number(m[1]),to=Number(m[2]||m[1]);
    if(from<1||to>count||from>to) throw Error(`Page numbers must be between 1 and ${count}.`);
    for(let p=from;p<=to;p++) {if(out.includes(p-1)){if(preserveOrder)throw Error('Each page may appear only once.');}else out.push(p-1);}
  }
  return preserveOrder ? out : out.sort((a,b)=>a-b);
}
function positive(value, fallback, max=10000) {
  if(value===''||value===undefined)return fallback;
  const n=Number(value); if(!Number.isFinite(n)||n<=0||n>max)throw Error(`Enter a number greater than 0 and no more than ${max}.`);return n;
}
module.exports={pageIndices,positive};

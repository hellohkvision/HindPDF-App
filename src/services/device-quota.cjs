const LIMIT=5, KEY='hindpdf.mobile.dailyToolUsage.v1', TTL=15*60*1000;
function indiaDay(now){return new Date(now+330*60000).toISOString().slice(0,10);}
function quotaError(code,message){return Object.assign(new Error(message),{code});}
function createDeviceQuota(storage,clock=Date.now){
 let chain=Promise.resolve();
 const locked=fn=>{const result=chain.then(fn,fn);chain=result.catch(()=>{});return result;};
 async function read(){const raw=await storage.getItem(KEY);if(!raw)return {day:indiaDay(clock()),used:0,pending:{}};let s;try{s=JSON.parse(raw);}catch{throw quotaError('QUOTA_STORAGE_ERROR','Unable to read the daily usage limit.');}if(!s||typeof s.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.day)||!Number.isInteger(s.used)||s.used<0||s.used>LIMIT||!s.pending||typeof s.pending!=='object'||Array.isArray(s.pending))throw quotaError('QUOTA_STORAGE_ERROR','Unable to read the daily usage limit.');return s;}
 return {
  reserve:id=>locked(async()=>{if(!id)throw quotaError('QUOTA_STORAGE_ERROR','Unable to reserve a use.');const now=clock(),s=await read(),today=indiaDay(now);if(today>s.day){s.day=today;s.used=0;s.pending={};}for(const [key,value] of Object.entries(s.pending))if(typeof value!=='number'||now-value>TTL)delete s.pending[key];if(s.used+Object.keys(s.pending).length>=LIMIT)throw quotaError('FREE_QUOTA_EXCEEDED','Daily free usage limit reached.');s.pending[id]=now;await storage.setItem(KEY,JSON.stringify(s));return id;}),
  complete:id=>locked(async()=>{const s=await read();if(!Object.prototype.hasOwnProperty.call(s.pending,id))throw quotaError('QUOTA_STORAGE_ERROR','Unable to confirm this tool use.');delete s.pending[id];s.used++;await storage.setItem(KEY,JSON.stringify(s));}),
  release:id=>locked(async()=>{const s=await read();if(Object.prototype.hasOwnProperty.call(s.pending,id)){delete s.pending[id];await storage.setItem(KEY,JSON.stringify(s));}})
 };
}
module.exports={createDeviceQuota,indiaDay,LIMIT};

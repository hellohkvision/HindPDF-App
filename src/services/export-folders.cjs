const KEY='hindpdf.mobile.exportRoot.v1';
function folderName(output){return output.mime.startsWith('image/')||(output.mime==='application/zip'&&/photo|image/i.test(output.tool))?'Photos':'Documents';}
async function hasSavedFolder(storage){return !!(await storage.getItem(KEY));}
function createFolderSaver(storage,chooseRoot,exportFile){
 let pending=Promise.resolve();
 return (output,chooseNew=false)=>{
  const save=pending.then(async()=>{let root=chooseNew?null:await storage.getItem(KEY);if(!root){root=await chooseRoot();if(!root)return {saved:false};}const relativePath=await exportFile(root,output,folderName(output));try{await storage.setItem(KEY,root);return {saved:true,relativePath};}catch{return {saved:true,relativePath,folderRemembered:false};}});
  // Serialize saves so simultaneous first-time requests do not open duplicate
  // pickers or race while creating the HindPDF folders. A failed operation
  // must not prevent a later retry.
  pending=save.then(()=>undefined,()=>undefined);
  return save;
 };
}
module.exports={folderName,hasSavedFolder,createFolderSaver};

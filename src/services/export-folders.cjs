const KEY='hindpdf.mobile.exportRoot.v1';
function folderName(output){return output.mime.startsWith('image/')||(output.mime==='application/zip'&&/photo|image/i.test(output.tool))?'Photos':'Documents';}
function createFolderSaver(storage,chooseRoot,exportFile){return async(output,chooseNew=false)=>{let root=chooseNew?null:await storage.getItem(KEY);if(!root){root=await chooseRoot();if(!root)return {saved:false};}const relativePath=await exportFile(root,output,folderName(output));await storage.setItem(KEY,root).catch(()=>{});return {saved:true,relativePath};};}
module.exports={folderName,createFolderSaver};

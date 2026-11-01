const {withDangerousMod,withMainApplication}=require('@expo/config-plugins');
const fs=require('node:fs');const path=require('node:path');
module.exports=function withHindPdfStorage(config){
 config=withDangerousMod(config,['android',async mod=>{const target=path.join(mod.modRequest.platformProjectRoot,'app/src/main/java/com/hindpdf/app');fs.mkdirSync(target,{recursive:true});for(const file of ['HindPdfStorageModule.kt','HindPdfStoragePackage.kt'])fs.copyFileSync(path.join(__dirname,'native',file),path.join(target,file));return mod;}]);
 return withMainApplication(config,mod=>{if(mod.modResults.language!=='kt')throw new Error('HindPDF storage requires Kotlin MainApplication.');let source=mod.modResults.contents;if(!source.includes('add(HindPdfStoragePackage())')){const marker='PackageList(this).packages.apply {';if(!source.includes(marker))throw new Error('Cannot register HindPDF storage.');source=source.replace(marker,marker+'\n              add(HindPdfStoragePackage())');}mod.modResults.contents=source;return mod;});
};

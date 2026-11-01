const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const {transformSync}=require('esbuild');

test('result saves, Files exports and viewer downloads reuse the same Android folder',async()=>{
 const entry=path.resolve('src/services/storage.ts');
 const code=transformSync(fs.readFileSync(entry,'utf8'),{loader:'ts',format:'cjs'}).code;
 const module={exports:{}},fallback=createRequire(entry),values=new Map(),exports=[];
 let picks=0;
 const asyncStorage={getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{values.set(key,value);},removeItem:async key=>{values.delete(key);}};
 const fsMock={StorageAccessFramework:{getUriForDirectoryInRoot:()=>null,requestDirectoryPermissionsAsync:async()=>{picks++;return {granted:true,directoryUri:'root-'+picks};}}};
 const native={NativeModules:{HindPdfStorage:{exportFile:async(root,uri,name,mime,kind)=>{exports.push({root,name,kind});return `HindPDF/${kind}`;}}},Platform:{OS:'android'}};
 const requireMock=id=>id==='@react-native-async-storage/async-storage'?asyncStorage:id==='expo-file-system/legacy'?fsMock:id==='expo-sharing'?{}:id==='react-native'?native:id==='./scanDrafts'?{clearScanDrafts:async()=>{}}:fallback(id);
 new Function('require','module','exports',code)(requireMock,module,module.exports);
 const f={uri:'file:///a.pdf',name:'a.pdf',mime:'application/pdf',tool:'Test',size:10,createdAt:''};
 assert.equal(await module.exports.hasSavedExportFolder(),false);
 assert.deepEqual(await module.exports.saveResult(f),{saved:true,relativePath:'HindPDF/Documents'});
 assert.equal(await module.exports.hasSavedExportFolder(),true);
 assert.equal(await module.exports.save({...f,name:'b.pdf'}),true);
 assert.equal(picks,1);
 assert.deepEqual(exports.map(x=>[x.root,x.name]),[['root-1','a.pdf'],['root-1','b.pdf']]);
 await module.exports.saveResult(f,true);
 assert.equal(picks,2);
});

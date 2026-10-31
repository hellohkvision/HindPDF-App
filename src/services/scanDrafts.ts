import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import type {InputFile, ScanDraft} from '../types';
const key='hindpdf.mobile.scanDrafts';
const root=FileSystem.documentDirectory+'scan-drafts/';
export async function listScanDrafts():Promise<ScanDraft[]>{const data=await AsyncStorage.getItem(key);if(!data)return [];const parsed=JSON.parse(data);if(!Array.isArray(parsed))throw Error('Could not load saved scans.');return parsed;}
export async function saveScanDraft(files:InputFile[],name:string,previousId?:string|null):Promise<ScanDraft>{
 if(!files.length)throw Error('Add a page before saving.');
 const existing=await listScanDrafts(),old=existing.find(d=>d.id===previousId),id=Crypto.randomUUID(),directory=root+id+'/';
 await FileSystem.makeDirectoryAsync(directory,{intermediates:true});
 let saved=false;
 try{
  const pages:InputFile[]=[];
  for(let i=0;i<files.length;i++){const f=files[i],uri=directory+'page-'+(i+1)+'.jpg';await FileSystem.copyAsync({from:f.uri,to:uri});const info=await FileSystem.getInfoAsync(uri);pages.push({uri,name:'page-'+(i+1)+'.jpg',mimeType:'image/jpeg',size:info.exists?info.size:0});}
  const draft:ScanDraft={id,name:name.trim()||'Scanned document',pages,updatedAt:new Date().toISOString()};
  await AsyncStorage.setItem(key,JSON.stringify([draft,...existing.filter(d=>d.id!==previousId)]));saved=true;
  if(old)await FileSystem.deleteAsync(root+old.id+'/',{idempotent:true}).catch(()=>{});
  return draft;
 }finally{if(!saved)await FileSystem.deleteAsync(directory,{idempotent:true}).catch(()=>{});}
}
export async function deleteScanDraft(draft:ScanDraft){const existing=await listScanDrafts();await AsyncStorage.setItem(key,JSON.stringify(existing.filter(d=>d.id!==draft.id)));await FileSystem.deleteAsync(root+draft.id+'/',{idempotent:true});}
export async function clearScanDrafts(){await FileSystem.deleteAsync(root,{idempotent:true});await AsyncStorage.removeItem(key);}

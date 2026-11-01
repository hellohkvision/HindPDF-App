import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {NativeModules,Platform} from 'react-native';
import {clearScanDrafts} from './scanDrafts';
import {createFolderSaver} from './export-folders.cjs';
import type {OutputFile} from '../types';
const key='hindpdf.mobile.history';
export async function history():Promise<OutputFile[]>{try{return JSON.parse(await AsyncStorage.getItem(key)||'[]');}catch{return [];}}
export async function record(output:OutputFile){const previous=await history();await AsyncStorage.setItem(key,JSON.stringify([output,...previous].slice(0,200)));}
export async function recordExternal(output:OutputFile,sourceUri:string){const previous=await history(),replaced=previous.filter(f=>f.sourceUri===sourceUri);await AsyncStorage.setItem(key,JSON.stringify([{...output,sourceUri},...previous.filter(f=>f.sourceUri!==sourceUri)].slice(0,200)));const owned=FileSystem.documentDirectory+'outputs/';for(const f of replaced)if(f.uri!==output.uri&&f.uri.startsWith(owned))await FileSystem.deleteAsync(f.uri,{idempotent:true}).catch(()=>{});}
export async function remove(output:OutputFile){await FileSystem.deleteAsync(output.uri,{idempotent:true});await AsyncStorage.setItem(key,JSON.stringify((await history()).filter(f=>f.uri!==output.uri)));}
export async function clearDocuments(){for(const f of await history())await FileSystem.deleteAsync(f.uri,{idempotent:true});await AsyncStorage.removeItem(key);await clearScanDrafts();}
export async function share(output:OutputFile){if(!await Sharing.isAvailableAsync())throw Error('Sharing is unavailable on this device.');await Sharing.shareAsync(output.uri,{mimeType:output.mime,dialogTitle:output.name,UTI:output.mime==='application/pdf'?'com.adobe.pdf':undefined});}
export async function openPdfWith(output:OutputFile){if(Platform.OS==='android'){const native=NativeModules.HindPdfStorage;if(!native?.openPdfWith)throw Error('Open with is unavailable in this build.');await native.openPdfWith(output.uri);}else await share(output);}
export async function save(output:OutputFile){
 if(Platform.OS==='android'){
  const p=await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();if(!p.granted)return false;
  const uri=await FileSystem.StorageAccessFramework.createFileAsync(p.directoryUri,output.name,output.mime);
  const content=await FileSystem.readAsStringAsync(output.uri,{encoding:FileSystem.EncodingType.Base64});await FileSystem.writeAsStringAsync(uri,content,{encoding:FileSystem.EncodingType.Base64});return true;
 }
 await share(output);return true;
}

const androidExport=createFolderSaver(AsyncStorage,async()=>{
 let initial:string|null=null;try{initial=FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Documents');}catch{}
 const chosen=await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initial);return chosen.granted?chosen.directoryUri:null;
},async(root,output,kind)=>{const native=NativeModules.HindPdfStorage;if(!native?.exportFile)throw Error('Save to folders is unavailable in this build.');return native.exportFile(root,output.uri,output.name,output.mime,kind);});
export async function saveResult(output:OutputFile,chooseNew=false){if(Platform.OS==='android')return androidExport(output,chooseNew);await share(output);return {saved:true};}

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {Platform} from 'react-native';
import {clearScanDrafts} from './scanDrafts';
import type {OutputFile} from '../types';
const key='hindpdf.mobile.history';
export async function history():Promise<OutputFile[]>{try{return JSON.parse(await AsyncStorage.getItem(key)||'[]');}catch{return [];}}
export async function record(output:OutputFile){const previous=await history();await AsyncStorage.setItem(key,JSON.stringify([output,...previous].slice(0,200)));}
export async function remove(output:OutputFile){await FileSystem.deleteAsync(output.uri,{idempotent:true});await AsyncStorage.setItem(key,JSON.stringify((await history()).filter(f=>f.uri!==output.uri)));}
export async function clearDocuments(){for(const f of await history())await FileSystem.deleteAsync(f.uri,{idempotent:true});await AsyncStorage.removeItem(key);await clearScanDrafts();}
export async function share(output:OutputFile){if(!await Sharing.isAvailableAsync())throw Error('Sharing is unavailable on this device.');await Sharing.shareAsync(output.uri,{mimeType:output.mime,dialogTitle:output.name,UTI:output.mime==='application/pdf'?'com.adobe.pdf':undefined});}
export async function save(output:OutputFile){
 if(Platform.OS==='android'){
  const p=await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();if(!p.granted)return false;
  const uri=await FileSystem.StorageAccessFramework.createFileAsync(p.directoryUri,output.name,output.mime);
  const content=await FileSystem.readAsStringAsync(output.uri,{encoding:FileSystem.EncodingType.Base64});await FileSystem.writeAsStringAsync(uri,content,{encoding:FileSystem.EncodingType.Base64});return true;
 }
 await share(output);return true;
}

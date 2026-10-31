import * as FileSystem from 'expo-file-system/legacy';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { auth } from './auth';
import {signInAnonymously} from 'firebase/auth';
import * as Application from 'expo-application';
import {Platform} from 'react-native';
import type { InputFile, OutputFile, Tool, ToolOptions } from '../types';
export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE || 'https://api.hindpdf.com').replace(/\/$/, '');
if (!API_BASE.startsWith('https://')) throw new Error('HindPDF API must use HTTPS.');
export class ApiError extends Error { constructor(message: string, public code = '', public status = 0) { super(message); } }
let guestSignIn:Promise<void>|null=null;
export async function authenticatedHeaders():Promise<Record<string,string>> {
  await auth.authStateReady();
  if(!auth.currentUser){
    if(Platform.OS!=='android')throw new ApiError('Guest access is currently available on Android.','GUEST_UNAVAILABLE');
    if(!guestSignIn)guestSignIn=signInAnonymously(auth).then(()=>{}).finally(()=>{guestSignIn=null;});
    await guestSignIn;
  }
  const user=auth.currentUser;if(!user)throw new ApiError('Could not start guest access.','GUEST_UNAVAILABLE');
  const headers:Record<string,string>={Authorization:`Bearer ${await user.getIdToken()}`};
  if(user.isAnonymous){if(Platform.OS!=='android')throw new ApiError('Guest access is currently available on Android.','GUEST_UNAVAILABLE');const id=Application.getAndroidId();if(!id)throw new ApiError('Could not start guest access.','GUEST_UNAVAILABLE');headers['X-HindPDF-Platform']='android';headers['X-HindPDF-Device']=id;}
  return headers;
}
export async function api(path: string, body?: unknown, authenticated = true): Promise<any> {
  const authHeaders = authenticated ? await authenticatedHeaders() : {};
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(API_BASE + path, {method:body === undefined?'GET':'POST',headers:{'Content-Type':'application/json',...authHeaders},...(body===undefined?{}:{body:JSON.stringify(body)}), signal:controller.signal});
    if(authenticated&&auth.currentUser?.isAnonymous&&response.headers.get('X-HindPDF-Guest-Quota')!=='v1')throw new ApiError('Guest access is temporarily unavailable.','GUEST_UNAVAILABLE',503);
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new ApiError(data.error || 'The request failed. Please try again.', data.code, response.status);
    return data;
  } finally { clearTimeout(timeout); }
}
export function outputUri(name: string) { return FileSystem.documentDirectory + 'outputs/' + Date.now() + '-' + name.replace(/[^a-zA-Z0-9_.-]/g,'_'); }
export async function prepareOutputDirectory() { await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory+'outputs/',{intermediates:true}); }
export async function convertOnServer(tool: Tool, file: InputFile, options: ToolOptions): Promise<OutputFile> {
  const authHeaders = await authenticatedHeaders();
  if(auth.currentUser?.isAnonymous)await api('/api/usage/guest-check');
  const name = 'HindPDF_'+tool.id+tool.ext;
  await prepareOutputDirectory(); const destination = outputUri(name);
  const parameters: Record<string,string> = {};
  if(tool.id==='compress') {parameters.preset=options.preset;if(options.targetKB)parameters.targetBytes=String(Number(options.targetKB)*1024);}
  if(tool.id==='ocr') parameters.language=options.language;
  if(tool.id==='excel-to-pdf') parameters.layout=options.layout;
  if(tool.id==='pdf-to-excel') parameters.borderless=options.borderless;
  const fields = [{name:'file',filename:file.name,type:file.mimeType,data:ReactNativeBlobUtil.wrap(file.uri.replace(/^file:\/\//,''))}, ...Object.entries(parameters).map(([name,data])=>({name,data}))];
  const nativePath=destination.replace(/^file:\/\//,'');
  const response=await ReactNativeBlobUtil.config({path:nativePath,timeout:300000}).fetch('POST',API_BASE+'/api/pdf/'+tool.id,{...authHeaders,'Content-Type':'multipart/form-data'},fields);
  if(response.info().status<200 || response.info().status>=300) {
    let data:any={};try{data=JSON.parse(await FileSystem.readAsStringAsync(destination));}catch{}
    await FileSystem.deleteAsync(destination,{idempotent:true});
    throw new ApiError(data.error || 'Conversion failed. Please try another document.',data.code,response.info().status);
  }
  const info=await FileSystem.getInfoAsync(destination);
  return {uri:destination,name,mime:tool.mime,size:info.exists?info.size:0,tool:tool.name,createdAt:new Date().toISOString()};
}
